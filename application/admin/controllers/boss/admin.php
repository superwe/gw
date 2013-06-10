<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Admin extends CI_Controller {

    public function index(){
        //parse_str($_SERVER['QUERY_STRING'],$_GET);
        $this->load->library('session');
        $adminid = $this->session->userdata('adminid');//获得管理员ID
        $data['adminid'] = $adminid;

        $this->load->database('default');
        $query=$this->db->query('SELECT id,name FROM tb_admin_role ');

        $data['roleList']=$query->result();

        $this->load->library('smarty');
        $this->smarty->view('boss/admin.tpl',$data);
    }



    //插入或修改记录
    public function saveOrUpdate(){

        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $username =  isset($_POST['username']) ? $_POST['username'] : '';
        $newpassword =  isset($_POST['newpassword']) ? $_POST['newpassword'] : '';
        $roleid = isset($_POST['roleid']) ? intval($_POST['roleid']) : 0;
        $status =  isset($_POST['status']) ? intval($_POST['status']): 1;

        $this->load->library('session');
        $spaceid = $this->session->userdata('spaceid');//获得空间ID

        $this->load->database('default');
        $this->db->trans_begin();
        if($id == 0){//新增
            $newpassword = sha1($newpassword);  // todo 使用新的加密算法
            $this->db->query(
                'INSERT INTO tb_admin (username,password,roleid,status,createtime) VALUES (?,?,?,?,NOW())',
                array($username,$newpassword,$roleid,$status));
        }else{//修改
            if($newpassword=='')
                $this->db->query('UPDATE tb_admin SET username =?,roleid=?,status=? WHERE id =?',array($username,$roleid,$status,$id));
            else
                $this->db->query('UPDATE tb_admin SET username =?,password=?,roleid=?,status=? WHERE id =?',array($username,sha1($newpassword),$roleid,$status,$id));
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
        $id =  isset($_POST['id']) ? $_POST['id'] : '';
        if($id!=''){
            $this->load->database('default');
            $this->db->trans_begin();
            $this->db->query('DELETE FROM tb_admin WHERE id = '.$id);
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

            $this->load->library('session');
            $spaceid = $this->session->userdata('spaceid');//获得空间ID

            $page = $_POST['page'];
            $rows = $_POST['rows'];
            $query = $this->db->query('SELECT COUNT(id) AS total FROM tb_admin');
            $data['total'] = $query->row()->total;
            $query->free_result();

            if($order=='asc')
            {
                $query = $this->db->query(
                    'SELECT a.id,a.username,b.name AS rolename,a.status,a.createtime FROM tb_admin AS a
                    LEFT JOIN tb_role AS b ON a.roleid=b.id
                    WHERE a.id>=(SELECT id FROM tb_admin ORDER BY '.$sort.' ASC LIMIT 1 OFFSET ?)'.
                    ' ORDER BY a.'.$sort.' ASC LIMIT ?',array(($page-1)*$rows,intval($rows)));
            }
            else
            {
                $query = $this->db->query(
                    'SELECT a.id,a.username,b.name AS rolename,a.status,a.createtime FROM tb_admin AS a
                    LEFT JOIN tb_role AS b ON a.roleid=b.id
                    WHERE a.id<=(SELECT id FROM tb_admin ORDER BY '.$sort.' DESC LIMIT 1 OFFSET ?)'.
                    ' ORDER BY a.'.$sort.' DESC LIMIT ?',array(($page-1)*$rows,intval($rows)));
            }

            $data['rows'] = $query->result();

        }else{//自定义查询

        }

        echo json_encode($data);
    }

    //获取一个用户的信息
    public function findOne(){
        $id =  isset($_POST['id']) ? $_POST['id'] : '';
        if($id!=''){
            $this->load->database('default');

            $query = $this->db->query(
                'SELECT id,username,roleid,status,createtime FROM tb_admin WHERE id=? LIMIT 1',array($id));

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
        $username =  isset($_POST['username']) ? $_POST['username'] : '';

        $this->load->database('default');
        $query = $this->db->query('SELECT id FROM tb_admin  WHERE id<>? and username=? LIMIT 1',array($id,$username));
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