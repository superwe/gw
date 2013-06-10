<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Employee extends CI_Controller {

    private $spaceId; //空间id
    public function __construct()
    {
        parent::__construct();

       $this->load->helper('cache');
        $this->spaceId = QiaterCache::spaceid();
    }

	public function index(){
        $data = [];
        $this->load->library('smarty');
        $this->smarty->view('space/employee.tpl',$data);
	}

    public function inactiveIndex(){
        $this->load->library('smarty');
        $this->smarty->view('space/employeeinactive.tpl');
    }

    //插入或修改记录
    public function saveOrUpdate(){
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $no =  isset($_POST['no']) ? $_POST['no'] : '';
        $name =  isset($_POST['name']) ? $_POST['name'] : '';
        $firstletter = '';
        $nickname =  isset($_POST['nickname']) ? $_POST['nickname'] : '';
        $sex =  isset($_POST['sex']) ? intval($_POST['sex']) : 0;
        $deptid =  isset($_POST['deptid']) ? intval($_POST['deptid']) : 0;
        $jobid =  isset($_POST['jobid']) ? intval($_POST['jobid']) : 0;
        $duty =  isset($_POST['duty']) ? $_POST['duty'] : '';
        $leaderid =  isset($_POST['leaderid']) ? intval($_POST['leaderid']) : 0;
        //$politicalbackground =  isset($_POST['politicalbackground']) ? intval($_POST['politicalbackground']) : 0;
        $identity =  isset($_POST['identity']) ? intval($_POST['identity']) : 0;
        $identityno =  isset($_POST['identityno']) ? $_POST['identityno'] : '';
        $birthday =  isset($_POST['birthday']) ? $_POST['birthday']==''?'0000-00-00':$_POST['birthday'] : '0000-00-00';
        $employdate =  isset($_POST['employdate']) ? $_POST['employdate']==''?'0000-00-00':$_POST['employdate'] : '0000-00-00';
        $quitdate =  isset($_POST['quitdate']) ?  $_POST['quitdate']==''?'0000-00-00':$_POST['quitdate']: '0000-00-00';
        //$jobdate =  isset($_POST['jobdate']) ?   $_POST['jobdate']==''?'0000-00-00':$_POST['jobdate']: '0000-00-00';
        $email =  isset($_POST['email']) ? $_POST['email'] : '';
        $mobile =  isset($_POST['mobile']) ? $_POST['mobile'] : '';
        $phone =  isset($_POST['phone']) ? $_POST['phone'] : '';
        $homeplaceid =  isset($_POST['homeplaceid']) ? intval($_POST['homeplaceid']) : 0;
        $workplaceid =  isset($_POST['workplaceid']) ? intval($_POST['workplaceid']) : 0;
        $qq =  isset($_POST['qq']) ? $_POST['qq'] : '';
        $msn =  isset($_POST['msn']) ? $_POST['msn'] : '';
        $introduce =  isset($_POST['introduce']) ? $_POST['introduce'] : '';
        //imageurl  照片只能用户自己上传
        $remark =  isset($_POST['remark']) ? $_POST['remark'] : '';

        $this->load->database('default');
        $this->db->trans_begin();
        if($id == 0){//新增
            //$this->db->query('INSERT INTO tb_employee (spaceid,email,name) VALUES (?,?,?)',array($spaceid,$email,$name));
        }else{//修改
            $this->db->query('UPDATE tb_employee SET no=?,name=?, nickname=?,sex=?,deptid=?,jobid=?,duty=?,leaderid=?,identity=?,identityno=?,birthday=?,employdate=?,quitdate=?,email=?,mobile=?,phone=?,homeplaceid=?,workplaceid=?,qq=?,msn=?,introduce=?,remark=?,firstletter=? WHERE id =?',array($no,$name,$nickname,$sex,$deptid,$jobid,$duty,$leaderid,$identity,$identityno,$birthday,$employdate,$quitdate,$email,$mobile,$phone,$homeplaceid,$workplaceid,$qq,$msn,$introduce,$remark,$firstletter,$id));
        }

        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
            echo -1;
        }else{
            $this->db->trans_commit();
            echo 0;
        }
    }

    //删除选中记录
    public function delete(){
        $ids =  isset($_POST['ids']) ? $_POST['ids'] : '';
        if($ids!=''){
            $this->load->database('default');
            $this->db->trans_begin();
            $this->db->query('DELETE FROM tb_employee WHERE id IN ('.$ids.')');
            if ($this->db->trans_status() == FALSE){
                $this->db->trans_rollback();
                echo -1;
            }else{
                $this->db->trans_commit();
                echo 0;
            }
        }else
            echo -1;
    }

    public function findSome(){
        $data=[];
        $this->load->database('default');
        $sort='id';
        $order='desc';
        if(isset($_POST['sort'])&&isset($_POST['order'])){//自定义排序字段
            $sort = $_POST['sort'];
            $order = $_POST['order'];
        }
        if(isset($_POST['page'])&&isset($_POST['rows']))
        {//grid组件分页查询

            $page = $_POST['page'];
            $rows = $_POST['rows'];
            $query = $this->db->query('SELECT COUNT(id) AS total FROM tb_employee where spaceid=?',array($this->spaceId));
            $data['total'] = $query->row()->total;
            $query->free_result();

            if($order=='asc')
            {
                $query = $this->db->query('SELECT a.id,a.no,a.name,a.nickname,a.sex,b.name as dept,c.name as job,a.duty,d.name as leaderid,a.identity,a.identityno,a.birthday,a.employdate,a.quitdate,a.email,a.mobile,a.phone,a.homeplaceid,a.workplaceid,a.qq,a.msn,a.introduce,a.remark,a.firstletter,a.status FROM tb_employee AS a left join tb_dept as b on a.deptid=b.id left join tb_job as c on a.jobid=c.id left join tb_employee as d  on a.leaderid=d.id WHERE a.spaceid=? and a.status=1  and a.id>=(SELECT id FROM tb_employee ORDER BY '.$sort.' ASC LIMIT 1 OFFSET ?) ORDER BY a.'.$sort.' ASC LIMIT ?',array($this->spaceId,($page-1)*$rows,intval($rows)));
            }
            else
            {
                $query = $this->db->query('SELECT a.id,a.no,a.name,a.nickname,a.sex,b.name as dept,c.name as job,a.duty,d.name as leaderid,a.identity,a.identityno,a.birthday,a.employdate,a.quitdate,a.email,a.mobile,a.phone,a.homeplaceid,a.workplaceid,a.qq,a.msn,a.introduce,a.remark,a.firstletter,a.status FROM tb_employee AS a left join tb_dept as b on a.deptid=b.id left join tb_job as c on a.jobid=c.id left join tb_employee as d  on a.leaderid=d.id  WHERE a.spaceid=?  and a.status=1 and a.id<=(SELECT id FROM tb_employee ORDER BY '.$sort.' DESC LIMIT 1 OFFSET ?) ORDER BY a.'.$sort.' DESC LIMIT ?',array($this->spaceId,($page-1)*$rows,intval($rows)));
            }
            $data['rows'] = $query->result();
        }else{//自定义查询

        }
        echo json_encode($data);
    }

    public function findSomeInactive(){
        $data=[];
        $this->load->database('default');
        $sort='id';
        $order='desc';
        if(isset($_POST['sort'])&&isset($_POST['order'])){//自定义排序字段
            $sort = $_POST['sort'];
            $order = $_POST['order'];
        }
        if(isset($_POST['page'])&&isset($_POST['rows']))
        {//grid组件分页查询

            $page = $_POST['page'];
            $rows = $_POST['rows'];
            $query = $this->db->query('SELECT COUNT(id) AS total FROM tb_employee where spaceid=?',array($this->spaceId));
            $data['total'] = $query->row()->total;
            $query->free_result();

            if($order=='asc')
            {
                $query = $this->db->query('SELECT a.id,a.no,a.name,a.nickname,a.sex,b.name as dept,c.name as job,a.duty,d.name as leaderid,a.identity,a.identityno,a.birthday,a.employdate,a.quitdate,a.email,a.mobile,a.phone,a.homeplaceid,a.workplaceid,a.qq,a.msn,a.introduce,a.remark,a.firstletter,a.status FROM tb_employee AS a left join tb_dept as b on a.deptid=b.id left join tb_job as c on a.jobid=c.id left join tb_employee as d  on a.leaderid=d.id WHERE a.spaceid=? and a.status=2 and a.id>=(SELECT id FROM tb_employee ORDER BY '.$sort.' ASC LIMIT 1 OFFSET ?) ORDER BY a.'.$sort.' ASC LIMIT ?',array($this->spaceId,($page-1)*$rows,intval($rows)));
            }
            else
            {
                $query = $this->db->query('SELECT a.id,a.no,a.name,a.nickname,a.sex,b.name as dept,c.name as job,a.duty,d.name as leaderid,a.identity,a.identityno,a.birthday,a.employdate,a.quitdate,a.email,a.mobile,a.phone,a.homeplaceid,a.workplaceid,a.qq,a.msn,a.introduce,a.remark,a.firstletter,a.status FROM tb_employee AS a left join tb_dept as b on a.deptid=b.id left join tb_job as c on a.jobid=c.id left join tb_employee as d  on a.leaderid=d.id  WHERE a.spaceid=? and a.status=2 and a.id<=(SELECT id FROM tb_employee ORDER BY '.$sort.' DESC LIMIT 1 OFFSET ?) ORDER BY a.'.$sort.' DESC LIMIT ?',array($this->spaceId,($page-1)*$rows,intval($rows)));
            }
            $data['rows'] = $query->result();
        }else{//自定义查询

        }
        echo json_encode($data);
    }

    //选出简单的几列 供人员编辑的时候 选择列表使用、
    public function findAllForPersonEdit(){

        $this->load->database('default');
        $query = $this->db->query('SELECT a.id,a.no,a.name,b.name as dept,c.name as job FROM tb_employee AS a left join tb_dept as b on a.deptid=b.id left join tb_job as c on a.jobid=c.id  WHERE a.spaceid=?  ORDER BY id ASC',array($this->spaceId));

        $data['rows'] = $query->result();
        echo json_encode($data);
    }

    //获取一个用户的信息
    public function findOne(){
        $id =  isset($_POST['id']) ? $_POST['id'] : '';
        $data = [];
        if($id!=''){
            $this->load->database('default');
            $query = $this->db->query('SELECT a.id,a.no,a.name,a.nickname,a.sex,a.deptid,a.jobid,a.duty,a.leaderid,a.identity,a.identityno,a.birthday,a.employdate,a.quitdate,a.email,a.mobile,a.phone,a.homeplaceid,a.workplaceid,a.qq,a.msn,a.introduce,a.imageurl,a.remark FROM tb_employee AS a  WHERE a.id=? LIMIT 1',array($id));
            if($query->num_rows()>0)
                echo json_encode($query->row());
            else
                echo '';
        }else
            echo '';
    }

    //判断工号是否重复
    public  function isExistByNo()
    {
        $id =  isset($_POST['id']) ? $_POST['id']==''?0:$_POST['id'] : 0;
        $no =  isset($_POST['no']) ? $_POST['no'] : '';

        $this->load->database('default');
        $query = $this->db->query('SELECT id FROM tb_employee  WHERE spaceid=? and  id<>? and no=? LIMIT 1',array($this->spaceId,$id,$no));
        if($query->num_rows()>0)
        {
            echo 1;
        }
        else
        {
            echo 0;
        }
    }

    //停用用户
    public function inactiveEmployee()
    {
        $ids =  isset($_POST['ids']) ? $_POST['ids'] : '';
        if($ids != ''){
            $this->load->database('default');
            $this->db->trans_begin();
            $this->db->query('update tb_employee set status=2 WHERE id in('.$ids.')');
            if ($this->db->trans_status() == FALSE){
                $this->db->trans_rollback();
                echo -1;
            }else{
                $this->db->trans_commit();
                echo 0;
            }
        }else
            echo -1;
    }

    //启用用户
    public function activeEmployee()
    {
        $ids =  isset($_POST['ids']) ? $_POST['ids'] : '';
        if($ids != ''){
            $this->load->database('default');
            $this->db->trans_begin();
            $this->db->query('update tb_employee set status=1 WHERE id in('.$ids.')');
            if ($this->db->trans_status() == FALSE){
                $this->db->trans_rollback();
                echo -1;
            }else{
                $this->db->trans_commit();
                echo 0;
            }
        }else
            echo -1;
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
        $this->smarty->view('space/selectemployee.tpl');
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

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */