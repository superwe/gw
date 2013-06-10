<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: Zhuna
 * Date: 13-3-4
 * Time: 上午11:14
 * To change this template use File | Settings | File Templates.
 */

class Homepage extends CI_Controller {
    private $spaceid; //空间id
    private $employeeid;
    private $sec_spaceid;
    private $sec_employeeid;
    private $employeeInfo;
    private $appList;
    private $groupList;
    /**
     * 个人主页控制器构造函数
     */
    public function __construct()
    {
        parent::__construct();
        $this->load->model('app_model', 'app');
        $this->load->model('group_model', 'group');
        $sec_spaceid = QiaterCache::spaceid();
        $sec_employeeid = QiaterCache::employeeid();
        $this->employeeInfo = QiaterCache::employeeInfo();
        //获取用户id及圈子id
        /*$getemployeeid = $this->input->get('employeeid', true);
        $getspaceid    = $this->input->get('spaceid',true);
        $this->employeeid = empty($getemployeeid)?$sec_employeeid:$getemployeeid;
        $this->spaceid    = empty($getspaceid)?$sec_spaceid:$getspaceid;*/
        $this->sec_spaceid    = $sec_spaceid;
        $this->sec_employeeid = $sec_employeeid;
    }

    /**
     * 个人主页展示
     * @author shiying 2013/05/10
     */
    public function index($employeeid){
        $this->employeeid=$employeeid;
        //$data['personalInfo'] = $this->employeeInfo;
        $data['spaceId'] = $this->sec_spaceid;
        $data['isauthor'] = 1;
        $data['author_tag'] = "我";
        if($this->employeeid != $this->sec_employeeid){
            $data['isauthor']  = 0;
            $data['author_tag'] = "TA";
        }
        //用户信息
        $this->load->model("employee_model","employeemodel");
        $employeeInfo = $this->employeemodel->getEmployeeInfo($this->employeeid,"id,name,nickname,introduce,duty,sex,email,mobile,phone,birthday,deptid,imageurl");
        if(empty($employeeInfo)){
            $this->redirect("/employee/home/index","此用户不存在！",1);
        }
        $sexArr = array(0=>'未知',1=>'男',2=>'女');
        $employeeInfo['sex_type'] = $sexArr[$employeeInfo['sex']];
        $employeeInfo['show_phone'] = $employeeInfo['mobile']?$employeeInfo['mobile']:$employeeInfo['phone'];
        $employeeInfo['deptname'] = "";
        if($employeeInfo['deptid']){
            $this->load->model("dept_model","deptmodel");
            $deptInfo = $this->deptmodel->getDeptInfoById($employeeInfo['deptid'],"name");
            $employeeInfo['deptname'] = $deptInfo['name'];
        }
        $spaceInfo = QiaterCache::spaceInfo();
        $employeeInfo['companyname'] = $spaceInfo['name'];
        //关注数  粉丝数
        $this->load->model("follow_model","followmodel");
        $follownum = $this->followmodel->getMyFollowMemberNums($this->employeeid,1);//关注数
        $fansnum   = $this->followmodel->getMyFansMemberNums($this->employeeid,1);//粉丝数

        $employeeInfo['follownum'] = $follownum;
        $employeeInfo['fansnum']   = $fansnum;
        //数量统计
        $this->load->model("file_model","filemodel");
        $andwhere = array("F.spaceid='".$this->spaceid."'","F.creatorid='".$this->employeeid."'","F.isvisible = 1","F.isleaf = 1");
        $allfiles = $this->filemodel->getFiles($andwhere);
        $employeeInfo['filesnum'] = count($allfiles);
        $data['employeeInfo']  = $employeeInfo;

        //右侧关注人 显示10条
        $myfollows = $this->followmodel->getMyFollowMember($this->employeeid,0,10);
        //右侧粉丝 显示10条
        $myfans    = $this->followmodel->getMyFansMember($this->employeeid,0,10);
        $data['myfollows'] = $myfollows;
        $data['myfans'] = $myfans;
        //右侧群组列表
        $this->load->model("group_model","groupmodel");
        $grouplist = $this->groupmodel->getEmployeeGroupList($this->sec_spaceid,$this->employeeid,'',0,5);
        if($grouplist){
            foreach($grouplist as $key=>$value){
                if($value['logourl']){
                    $grouplist[$key]['logourl'] = $this->config->item('resource_url').$value['logourl'];
                }else{
                    $grouplist[$key]['logourl'] = $this->config->item('base_url')."/images/img48-48-gr.gif";
                }
            }
        }
        $data['grouplist'] = $grouplist;

        $this->load->library('smarty');
        $this->smarty->view('employee/myhomepage/index.tpl',$data);
    }

    /**
     * 更新个人介绍
     * @author shiying 2013/05/10
     */
    public function updateintro(){
        $introduce = $this->input->post('introduce',true);
        $this->load->model("employee_model","employeemodel");
        $udata['introduce'] = "'$introduce'";
        $uwhere = array("id = '".$this->employeeid."'");
        $affected = $this->employeemodel->updateTable("tb_employee",$udata,$uwhere);
        if($affected){
            $this->_ajaxRs(true, '', '', 'intro');
        }
        $this->_ajaxRs(true, '', '', 'intro');
    }

    /**
     * ajax返回值
     * @author shiying 2013/05/10
     * @param boolean $rs 调用是否成功
     * @param array $data 返回数据
     * @param string $error 错误信息
     * @param string $type	类型
     */
    protected function _ajaxRs($rs, $data = array(), $error = '', $type = '') {
        $this->load->model("common_model","commonmodel");
        $this->commonmodel->_ajaxRs($rs,$data,$error,$type);
    }

    /**
     * 跳转
     * @author shiying 2013/05/10
     * @param $url 地址
     * @param $msg 信息
     * @param int $wrongFlag 是否是错误提示 1 是
     */
    public function redirect($url,$msg,$wrongFlag = 0){
        $this->load->model("common_model","commonmodel");
        $this->commonmodel->_redirect($url,$msg,$wrongFlag);
        exit;
    }

    //完善用户头像信息
    public function avatar()
    {
        $this->appList = $this->app->getAppList($this->sec_spaceid);//应用列表
        $this->groupList = $this->group->getGroupMenu($this->sec_spaceid, $this->sec_employeeid);//群组列表
        $this->employeeInfo = QiaterCache::employeeInfo();
        $data['appList'] = $this->appList;
        $data['personalInfo'] = $this->employeeInfo;
        $data['groupList'] = $this->groupList;
        $this->load->library('smarty');
        $this->smarty->view('employee/myhomepage/employeeHead.tpl',$data);
    }

    public function subHeadImg()
    {
        $this->load->library('file');
        if ($_REQUEST['sub'])
        {
            $filePath = trim($_REQUEST['filepath']);
            $x = intval($_REQUEST['x']);
            $y = intval($_REQUEST['y']);
            $w = intval($_REQUEST['w']);
            $h = intval($_REQUEST['h']);

            //对图片进行裁剪
            $tmpFilePath = $this->cutPic($filePath, $w, $h, $x, $y, $w, $h);

            //指定缩略图后缀及图片大小
            $arrThumbInfo = array(
                "[.thumb.jpg,0,48,48]",
                "[.middle.jpg,0,150,150]"//0921图片从180改为150
            );

            //生成缩略图
            $result = $this->makeThumb($tmpFilePath, '/'.$filePath, $arrThumbInfo);
            if($result)
            {
                $this->saveAvatar($filePath);
            }
        }
        echo json_encode(array('rs'=>true, 'data'=>$this->get($filePath) ));
    }

    public function get($filePath) {
        if (preg_match('/^http:\/\//i', $filePath)) {
            return $filePath;
        }
        return $this->config->item('resource_url').$filePath;
    }

    public function makeThumb($srcFile, $dstFile, $thumbInfo){
        $option = array(
            'type' => 'image'
        );
        $obj = $this->file->instance($option);
        return $obj->makeThumb($srcFile, $dstFile, $thumbInfo);
    }

    public function saveAvatar($path){
        $employeeId = QiaterCache::employeeid();
        $this->load->library('file');
        if($employeeId) {
            $this->load->model('login_model', 'login');
            $this->login->updateImgurl($path,$employeeId);
            $sessionId = $this->input->cookie('session_id');
            $employeeInfo = QiaterCache::employeeInfo();
            $employeeInfo['imageurl'] = $path;
            QiaterCache::employeeInfo($employeeInfo,$sessionId);
            return true;
        }else{
            return false;
        }
    }

    public function cutPic($filePath, $targ_w, $targ_h, $x, $y, $w, $h, $postfix = 'thumb') {
        $option = array(
            'type' => 'image'
        );
        $obj = $this->file->instance($option);
        return $obj->cutPic($filePath, $targ_w, $targ_h, $x, $y, $w, $h, $postfix);
    }

    public function avatarUpload($uploadinfo)
    {
        $employeeId = QiaterCache::employeeid();
        $option = array(
            'type' => 'image',
            'name' => $uploadinfo['name'],
            'tmpName' => $uploadinfo['tmp_name'],
            'userid' => $employeeId,
            'allowType' => array('jpg', 'png', 'jpeg')
        );
        $obj = $this->file->instance($option);
        $path = $obj->save(false);
        return $path;
    }

    public function uploadHeadImg()
    {
        $this->load->library('file');
        $path = '';
        if (isset($_FILES['filedata']))
        {
            $info = pathinfo($_FILES['filedata']['name']);
            if(!in_array( strtolower($info['extension']), array('jpg','jpeg','png'))){
                echo json_encode(array('rs'=>false, 'data'=>'只能上传jpg、jpeg、png格式图片' ));exit();
            }
            $path = $this->avatarUpload($_FILES['filedata']);
            if(empty($path)){ // 第一次上传失败
                $path = $this->avatarUpload($_FILES['filedata']);
                if(empty($path)) { //第二次上传失败
                    echo json_encode(array('rs'=>false, 'data'=>'图片上传出错' ));exit();
                }
            }
        }
        echo json_encode(array('rs'=>true, 'data'=>$this->config->item('resource_url').$path ));exit();
    }
}