<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: ZhaiYanBin
 * Date: 13-3-4
 * Time: 上午11:14
 * To change this template use File | Settings | File Templates.
 */

class Employee extends CI_Controller {

    public function __construct(){
        parent::__construct();
        $this->employeeType = $this->config->item('object_type_member','base_config');
    }

    /**  获取卡片信息 add by lisheng
     * @param $employeeid
     * @param $visiterid
     */
    public function cardInfo($employeeid)
    {
        $visiterid = QiaterCache::employeeid();//当前用户ID
        $this->load->model('employee_model','employeeM');
        $data = $this->employeeM->getCardInfo($employeeid,$visiterid);
        $this->load->library('smarty');
        $this->smarty->view('employee/card.tpl',$data);
    }

    /**
     * 前台全体成员首页【全体成员页面】add by ZhaiYanBin
     */
    public function index(){
        $category = array();
        $this->_action = $this->uri->segment(3);
        $menu[$this->_action] = 'selected';

        $this->load->helper('cache');
        $spaceId = QiaterCache::spaceid();//当前空间ID
        $employeeId = QiaterCache::employeeid();//当前用户ID

        $this->load->model('Follow_model', 'followM');
        $this->load->model('Employee_model', 'employeeM');

        //关注成员列表
        $category['all'] = $this->employeeM->getAllEmployeeNums($spaceId, 1);//全体成员数
        $category['online'] = $this->employeeM->getAllEmployeeNums($spaceId, 1);//在线成员数
        $category['myFollow'] = $this->followM->getMyFollowMemberNums($employeeId, 1); //我关注的成员数
        $category['myFans'] = $this->followM->getMyFansMemberNums($employeeId, 1);//关注我的

        $this->load->library('smarty');
        $this->smarty->assign('menu', $menu);
        $this->smarty->assign('category', $category);
        $this->smarty->assign('employeeType', $this->employeeType);
        $this->smarty->view('employee/employee/index.tpl');
    }

    /**
     * 异步获取全体成员的人员列表【全体成员页面】
     */
    public function ajaxGetList(){
        $data = array();
        $myself = $joinStr = '';
        $this->input->get(NULL, TRUE);
        $this->load->helper('cache');
        $currentEmployeeId = QiaterCache::employeeid();//当前用户ID
        $imgHost = $this->config->item('resource_url');
        $objectType = $this->config->item('object_type_member','base_config');
        $employeeId = isset($_GET['employeeid']) ? intval($_GET['employeeid']) : 0;//当前用户ID
        if(!$employeeId){
            $employeeId = $currentEmployeeId;//当前用户ID
            $myself = true; //查看的用户为当前登录用户
        }
        //表格头部信息
        if( !empty($_GET['head']) ){
            $data['head'] = array(
                array(
                    'name'=>'name',
                    'title'=>'姓名',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'duty',
                    'title'=>'职位',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'dept',
                    'title'=>'部门',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'fans_num',
                    'title'=>'粉丝',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'join_time',
                    'title'=>'加入时间',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'operation',
                    'title'=>'操作',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                )
            );
        }

        //关注成员列表
        $this->load->model('Follow_model', 'followM');
        $followIds = $this->followM->getFollowEmployeeIds($employeeId);
        //分页
        $per = (isset($_GET['per']) && intval($_GET['per']) > 0 ) ? intval($_GET['per']) : 15;
        //偏移量
        $page = (isset($_GET['p']) && intval($_GET['p']) > 0) ? $_GET['p'] : 0;
        $offset = $page ? ($page-1) * $per : 0;
        //成员分类
        $type = isset($_GET['type']) ? $_GET['type'] : 'all';
        if(!in_array($type, array('all', 'online', 'myFollow', 'myFans') ) ){
            $type = 'all';
        }
        $where = array("1", 'EM.status=1');
        //分类筛选
        if($type == 'myFollow'){ //我关注的
            //array_splice($data['head'], 3, 0 , array(array('name' => 'group', 'title' => '分组', 'isSort' => false, 'sort' => 'asc', 'css' => '')));
            $joinStr .= 'INNER JOIN `tb_followed` AS FOLLOW ON EM.id=FOLLOW.followid ';
            $where[] = "FOLLOW.employeeid='{$employeeId}' AND FOLLOW.followtype={$objectType}";
        }
        if($type == "myFans"){ //关注我的
            $joinStr .= 'INNER JOIN `tb_followed` AS FOLLOW ON EM.id=FOLLOW.employeeid ';
            $where[] = "FOLLOW.followid='{$employeeId}' AND `followtype`={$objectType}";
        }
        //用户姓名筛选
        $employeeName = isset($_GET['name'])  ? trim($_GET['name']) : '';
        if($employeeName){
            $where[] = "EM.`name` LIKE '{$employeeName}%'";
        }
        //首字母筛选;
        $letter = isset($_GET['letter']) ? trim($_GET['letter']) : '';
        if($letter){
            $where[] = "firstletter='{$letter}'";
        }
        //客户端类型
        if( isset($_GET['client']) ){
            $where[] = "";
        }
        //分组(只能查看自己的分组)
        $group = isset($_GET['group']) ? intval($_GET['group']) : 0;
        if( $myself && $group > 0 ){
            $joinStr .= 'INNER JOIN `tb_followed_group_member` AS GR ON FOLLOW.followid = GR.followedid ';
            $where[] = "GR.id='{$group}'";
        }
        $whereStr = ' WHERE ' . implode(' AND ', $where);
        //查询数据库
        $this->load->database('default');
        // 获取总数;
        if(!empty($_GET['total'])) {
            $sql = "SELECT COUNT(1) nums FROM `tb_employee` AS EM LEFT JOIN `tb_dept` AS DEPT ON EM.deptid = DEPT.id ". $joinStr . $whereStr;
            //echo $sql,"<br/>";die;
            $query = $this->db->query($sql);
            $total = $query->row_array();
            $data['total'] = $total['nums'];
        }
        //获取数据列表
        $sql = "SELECT EM.`id`,EM.`name`,EM.`nickname`,EM.`duty`,EM.`imageurl`,DEPT.`name` AS deptName, EM.`createtime` FROM `tb_employee` AS EM LEFT JOIN `tb_dept` AS DEPT ON EM.deptid = DEPT.id ". $joinStr . $whereStr;
        if($page){
            $sql .= " LIMIT {$per} OFFSET {$offset}";
        }
        //echo $sql,"<br/>";die;
        $query = $this->db->query($sql);
        $lists = $query->result_array($query);
        //print_r($lists);
        foreach($lists as $key => $item){
            $item['avatar'] = $imgHost . $item['imageurl'];
            $name_str = '<div uid="'.$item['id'].'"><input type="checkbox" name="user_id" uid="'.$item['id'].'">'.
                '<a href="/employee/homepage/index?employeeid='.$item['id'].'"><img src="'.$item['avatar'].'" title="'.$item['name'].'" alt="'.$item['name'].'" onerror="imgError(this);" rel="' . $imgHost . 'default_avatar.thumb.jpg" /></a><span>'.$item['name'];
            $item['nickname'] ?  $name_str .= '('.$item['nickname'].')' : '';
            if($item['id'] == $currentEmployeeId){ //当前用户
                $isFollow = '<span>当前用户</span>';
            } else{
                if( in_array($item['id'], $followIds) ){
                    $isFollow = '<a class="yy-follow button cancelFollowButton" role="' . $this->employeeType . '" for="' . $item['id'] . '" type="0" href="javascript:;">取消关注</a>';
                } else{
                    $isFollow = '<a class="yy-follow button addFollowButton" role="' . $this->employeeType . '" for="' . $item['id'] . '" href="javascript:;" type="1">加关注</a>';
                }
            }
            $data['table'][$key][] = $name_str; //头像、姓名
            $data['table'][$key][] = $item['duty'];//职位
            $data['table'][$key][] = $item['deptName'] ? $item['deptName'] : '';//部门
            $data['table'][$key][] = $this->followM->getMyFansMemberNums($item['id'], 1);//粉丝数量
            $data['table'][$key][] = date('Y-m-d', strtotime($item['createtime']));//加入时间
            $data['table'][$key][] = $isFollow;
        }
        //print_r($data);die;
        $result = json_encode(array('rs'=>true, 'error'=>'', 'data'=>$data, 'type'=>'table'));
        echo $result; exit;
    }

    /**
     * AJAX获取当前用户的成员关注分组信息【全体成员页面】add by ZhaiYanBin
     */
    public function ajaxGetEmployeeGroup(){
        $this->load->helper('cache');
        $employeeId = QiaterCache::employeeid();//当前用户ID
        $this->load->model('Employee_model', 'employeeM');
        $lists = $this->employeeM->getEmployeeGroup($employeeId);
        echo $lists ? json_encode($lists) : '';
        exit();
    }
    
    /**
     * AJAX创建分组【全体成员页面】add by ZhaiYanBin
     */
    public function ajaxCreateGroup(){
        $this->load->library('smarty');
        $this->smarty->view('employee/employee/ajaxCreateGroup.tpl');
    }

    /**
     * AJAX保存分组信息【全体成员页面】add by ZhaiYanBin
     */
    public function ajaxSaveGroup(){
        $this->load->helper('cache');
        $employeeId = QiaterCache::employeeid();//当前用户ID

        $groupName = $this->input->get('groupName', true);
        if(trim($groupName) == ''){
            $this->commonM->_ajaxRs(false, array(), '分组名称不能为空！');
        }
        $this->load->model('common_model', 'commonM');
        $this->load->model('Employee_model', 'employeeM');
        $id = $this->employeeM->addEmployeeGroup($groupName, $employeeId);
        $this->commonM->_ajaxRs(true, array('id' => $id));
    }

    /**
     * 通讯录视图 add by ZhaiYanBin
     */
    public function addressbook(){
        $lists = array();
        $this->_action = $this->uri->segment(3);
        $menu[$this->_action] = 'selected';
        $imgHost = $this->config->item('resource_url');

        $this->load->helper('cache');
        $spaceId = QiaterCache::spaceid();//当前空间ID
        $this->spaceInfo = QiaterCache::spaceInfo();
        $groupId = $this->spaceInfo['groupid'];//获得此空间是否聚集到集团型空间
        //分页
        $limit = (isset($_GET['per']) && intval($_GET['per']) > 0 ) ? intval($_GET['per']) : 15;
        //偏移量
        $page = (isset($_GET['p']) && intval($_GET['p']) > 0) ? $_GET['p'] : 0;
        $offset = $page ? ($page-1) * $limit : 0;

        $this->load->model('Dept_model', 'deptM');
        $this->load->model('Employee_model', 'employeeM');

        if(!$groupId){//未聚集，则读取本空间组织架构树
            $topDept = $this->deptM->findChildren($spaceId, 0, 1);
            $total = $this->employeeM->getAllEmployeeNumBySearch($spaceId);
            $lists = $this->employeeM->getAllEmployeeListBySearch($spaceId);
        } else{
            $topDept = $this->deptM->getSpaceGroupInfo($groupId);
            $total = $this->employeeM->getSpaceGroupEmployeeNum($groupId);
            $lists = $this->employeeM->getSpaceGroupEmployeeList($groupId);
        }
        //print_r($lists);
        $this->load->library('smarty');
        $this->smarty->assign('total', $total);
        $this->smarty->assign('lists', $lists);
        $this->smarty->assign('menu', $menu);
        $this->smarty->assign('imgHost', $imgHost);
        $this->smarty->assign('topDept', isset($topDept['0']) ? $topDept['0'] : array() );
        $this->smarty->view('employee/employee/addressbook.tpl');
    }

    /**
     * AJAX获取部门结构树【通讯录视图】add by ZhaiYanBin
     */
    public function ajaxGetDept(){
        $lists = $returnData = array();
        $this->load->helper('cache');
        $spaceId = QiaterCache::spaceid();//当前空间ID
        $this->spaceInfo = QiaterCache::spaceInfo();
        $groupId = $this->spaceInfo['groupid'];//获得此空间是否聚集到集团型空间
        $this->input->get(NULL, TRUE);
        $deptId = isset($_GET['id']) ? intval($_GET['id']) : 0;//部门ID

        $this->load->model('Dept_model', 'deptM');

        if(!$deptId && $groupId > 0){//读取集团型空间列表
            $lists = $this->deptM->getSpaceGroupDeptList($groupId, 1, array('id', 'name', 'isleaf'));
        } else{//直接读取本部门下的下级部门列表
            $lists = $this->deptM->findChildren($spaceId, $deptId);
        }
        //print_r($lists);
        foreach($lists as $k => $v){
            $returnData[$k]['id'] = $v['id'];
            $returnData[$k]['name'] = $v['name'];
            $returnData[$k]['isParent'] = $v['isleaf'] > 0 ? false : true;
        }
        echo $returnData ? json_encode($returnData) : '';
        exit();
    }

    /**
     * AJAX根据部门ID获取此部门下的成员列表 add by ZhaiYanBin
     */
    public function ajaxGetEmployeeListByDeptId(){
        $info = array('url' => '/employee/employee/ajaxGetEmployeeListByDeptId');
        $this->input->get(NULL, TRUE);

        $this->load->helper('cache');
        $spaceId = QiaterCache::spaceid();//当前空间ID
        $this->spaceInfo = QiaterCache::spaceInfo();
        $groupId = $this->spaceInfo['groupid'];//获得此空间是否聚集到集团型空间
        $deptId = isset($_GET['id']) ? intval($_GET['id']) : 0;//部门ID
        $lever = isset($_GET['lever']) ? intval($_GET['lever']) : '';//深度
        $lever = '';//目前先置空，可以通过zTree计算出父级节点传递过来
        $firstLetter = isset($_GET['firstLetter']) ? trim($_GET['firstLetter']) : '';//首字母
        $employeeName = isset($_GET['name'])  ? trim($_GET['name']) : '';//用户姓名筛选

        //分页
        $limit = (isset($_GET['per']) && intval($_GET['per']) > 0 ) ? intval($_GET['per']) : 15;
        //偏移量
        $page = (isset($_GET['p']) && intval($_GET['p']) > 0) ? $_GET['p'] : 0;
        $offset = $page ? ($page-1) * $limit : 0;

        $info['url'] .= $deptId ? "/id/{$deptId}" : "";
        $info['url'] .= $lever ? "/lever/{$lever}" : "";
        $info['url'] .= $firstLetter ? "/firstLetter/{$firstLetter}" : "";
        $info['url'] .= $employeeName ? "/name/{$employeeName}" : "";

        if($deptId){
            $this->load->model('Dept_model', 'deptM');
            $info['total'] = $this->deptM->findSomeEmployeeNumByDeptidAndFirstletter($deptId, $spaceId, $lever, $firstLetter, $employeeName, 1);
            $info['lists'] = $this->deptM->findSomeEmployeeByDeptidAndFirstletter($deptId, $spaceId, $lever, $firstLetter, $employeeName, 1, $limit, $offset);
        } elseif($groupId > 0){
            $this->load->model('Employee_model', 'employeeM');
            $info['total'] = $this->employeeM->getSpaceGroupEmployeeNum($groupId, $firstLetter, $employeeName, 1);
            $info['lists'] = $this->employeeM->getSpaceGroupEmployeeList($groupId, $firstLetter, $employeeName, 1, $limit, $offset);
        }
        echo $info ? json_encode($info) : '';
        exit();
    }

    /**
     * 获取我关注的人,同部门，所有人的数量 用于选人弹出框
     * add  by lisheng
     * 2013-04-18
     */
    public function ajaxGetEmployeeNumForSelectEmployee()
    {
        $searchKey = isset($_POST['searchKey']) ? $_POST['searchKey'] : '';
        $where='';
        if($searchKey != '')
        {
            $where = " and name like '".$searchKey."%' ";
        }
        $employeeid = 40;// todo $this->session->userdata('employeeid');//用户ID
        $deptid = 41;// todo 当前用户的部门ID

        $this->load->database('default');
        $query1 = $this->db->query(
            'select count(id) num from tb_employee
            where status=1 and  id in (select followid from tb_followed where employeeid=?)'.$where,array($employeeid));
        $data['fansNum'] =  $query1->row()->num;//获取关注人数

        $query2 = $this->db->query(
            'select count(id) num from tb_employee
            where status=1 and deptid =? and id <> ?'.$where,array($deptid,$employeeid));
        $data['sameDeptEmployeesNum'] =  $query2->row()->num;//获取同部门的人数

        $query3 = $this->db->query(
            'select count(id) num from tb_employee
            where status=1 and id <> ?'.$where,array($employeeid));
        $data['allEmployeesNum'] =  $query3->row()->num;//获取所有的人数

        echo json_encode($data);
    }

    /**
     * 选人界面 add by lisheng  2013-04-20
     */
    public function selectEmployee()
    {
        $this->load->library('smarty');
        $this->smarty->view('employee/selectemployee.tpl');
    }
    /**
     * 获取我关注的人的信息 用于选人弹出框
     * add  by lisheng
     * 2013-04-18
     */
    public function ajaxGetFansForSelectEmployee()
    {
        $searchKey = isset($_POST['searchKey']) ? $_POST['searchKey'] : '';
        $where='';
        if($searchKey != '')
        {
            $where = " and name like '".$searchKey."%' ";
        }
        $employeeid = 40;// todo $this->session->userdata('employeeid');//用户ID

        $this->load->database('default');
        $query = $this->db->query(
            'select id,name,email,imageurl from tb_employee
            where status=1 and  id in (select followid from tb_followed where employeeid=?)'.$where,array($employeeid));

        echo json_encode($query->result());
    }

    /**
     * 获取同部门的人的信息 用于选人弹出框
     * add  by lisheng
     * 2013-04-18
     */
    public function ajaxGetSameDeptEmployeeForSelectEmployee()
    {
        $searchKey = isset($_POST['searchKey']) ? $_POST['searchKey'] : '';
        $where='';
        if($searchKey != '')
        {
            $where = " and name like '".$searchKey."%' ";
        }
        $employeeid = 40;// todo $this->session->userdata('employeeid');//用户ID
        $deptid = 41;// todo 当前用户的部门ID

        $this->load->database('default');
        $query = $this->db->query(
            'select id,name,email,imageurl from tb_employee
            where status=1 and deptid=? and id <> ?'.$where,array($deptid,$employeeid));

        echo json_encode($query->result());
    }

    /**
     * 获取所有的人的信息 用于选人弹出框
     * add  by lisheng
     * 2013-04-18
     */
    public function ajaxGetAllEmployeeForSelectEmployee()
    {
        $searchKey = isset($_POST['searchKey']) ? $_POST['searchKey'] : '';
        $where='';
        if($searchKey != '')
        {
            $where = " and name like '".$searchKey."%' ";
        }
        $employeeid = 40;// todo $this->session->userdata('employeeid');//用户ID
        $deptid = 3;// todo 当前用户的部门ID

        $this->load->database('default');
        $query = $this->db->query(
            'select id,name,email,imageurl from tb_employee
            where status=1 and id <> ?'.$where,array($employeeid));

        echo json_encode($query->result());
    }


}