<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Admin extends CI_Controller {

    private $spaceId; //空间id
    private $employeeId;//人员ID
    public function __construct()
    {
        parent::__construct();

       $this->load->helper('cache');
        $this->spaceId = QiaterCache::spaceid();
        $this->employeeId = QiaterCache::employeeid();

    }

	public function index(){
        $this->load->database('default');
        $query=$this->db->query('SELECT id,name FROM tb_role where spaceid=?',array($this->spaceId));
        $data['roleList']=$query->result();

        $data['employeeid'] = $this->employeeId;

        $this->load->library('smarty');
        $this->smarty->view('space/admin.tpl',$data);
	}


    //更新空间管理员的角色
    public function update(){

        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $roleid = isset($_POST['roleid']) ? intval($_POST['roleid']) : 0;

        $this->load->database('default');
        $this->db->trans_begin();
        //更新空间管理员的账户的角色
        $this->db->query('UPDATE tb_person SET roleid=? WHERE id =?',array($roleid,$id));

        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
            echo -1;
        }else{
            $this->db->trans_commit();
            echo 0;
        }
    }

    //停用空间管理员的管理账号
    public function inactive(){
        $id =  isset($_POST['id']) ? $_POST['id'] : '';
        if($id!=''){

            $this->load->database('default');
            $this->db->trans_begin();
            $this->db->query('update tb_employee set roleid=-1 WHERE spaceid=? and personid =?',array($this->spaceId,$id));
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

    public function findAll(){
        $data=[];

        $this->load->database('default');
        $sort='id';
        $order='desc';
        if(isset($_POST['sort'])&&isset($_POST['order'])){//自定义排序字段
            $sort = $_POST['sort'];
            $order = $_POST['order'];
        }

        $query = $this->db->query('select DISTINCT personid from tb_employee where spaceid=? and roleid>=0',array($this->spaceId));
        $data['total'] = $query->num_rows();
        $query->free_result();

        $query = $this->db->query('SELECT a.id,a.email as username,c.name AS rolename,a.status,a.createtime FROM tb_person AS a
                                LEFT JOIN tb_employee AS b ON a.id=b.personid
                                LEFT JOIN tb_role AS c ON b.roleid = c.id
                                WHERE b.spaceid=? and b.roleid>=0'.' ORDER BY a.'.$sort.' '.$order,array($this->spaceId));

        $data['rows'] = $query->result();

        echo json_encode($data);
    }

    //获取一个用户的信息
    public function findOne(){
        $id =  isset($_POST['id']) ? $_POST['id'] : '';
        if($id!=''){
            $this->load->database('default');
            $query = $this->db->query('SELECT id,username,roleid,status,createtime FROM tb_admin WHERE id=? LIMIT 1',array($id));
            if($query->num_rows()>0)
                echo json_encode($query->row());
            else
                echo '';
        }else
            echo '';
    }

    //判断是否有重名的
    public  function isExistByName()
    {
        $id =  isset($_POST['id']) ? $_POST['id']==''?0:$_POST['id'] : 0;
        $name =  isset($_POST['name']) ? $_POST['name'] : '';

        $this->load->database('default');
        $query = $this->db->query('SELECT id FROM tb_admin  WHERE id<>? and name=? LIMIT 1',array($id,$name));
        if($query->num_rows()>0)
        {
            echo 1;
        }
        else
        {
            echo 0;
        }
    }
}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */