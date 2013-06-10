<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Role extends CI_Controller {

    public function index(){
        $this->load->library('smarty');
        $this->smarty->view('space/role.tpl');
    }

    //插入或修改记录
    public function saveOrUpdate(){
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $name =  isset($_POST['name']) ? $_POST['name'] : '';
        
        $this->load->database('default');
        $this->db->trans_begin();
        if($id == 0){//新增
            $this->db->query('INSERT INTO tb_admin_role (name) VALUES (?,?)',array($name));
        }else{//修改
            $this->db->query('UPDATE tb_admin_role SET name =? WHERE id =?',array($name,$id));
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
        if($id != ''){
            $this->load->database('default');
            $this->db->trans_begin();
            $this->db->query('DELETE FROM tb_admin_role WHERE id ='.$id);
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
            $query = $this->db->query('SELECT COUNT(id) AS total FROM tb_admin_role');
            $data['total'] = $query->row()->total;
            $query->free_result();

            if($order=='asc')
            {
                $query = $this->db->query(
                    'SELECT id,name FROM tb_admin_role
                  WHERE id>=(SELECT id FROM tb_admin_role ORDER BY '.$sort.' ASC LIMIT 1 OFFSET ?)
                  ORDER BY '.$sort.' ASC LIMIT ?',array(($page-1)*$rows,intval($rows)));
            }
            else
            {
                $query = $this->db->query(
                    'SELECT id,name FROM tb_admin_role
                  WHERE id<=(SELECT id FROM tb_admin_role ORDER BY '.$sort.' ASC LIMIT 1 OFFSET ?)
                  ORDER BY '.$sort.' ASC LIMIT ?',array(($page-1)*$rows,intval($rows)));
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
            $query = $this->db->query('SELECT id,name FROM tb_admin_role WHERE id=?',array($id));
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
        $query = $this->db->query(
            'SELECT id FROM tb_admin_role  WHERE  id<>? and name=? LIMIT 1',array($id,$name));
        if($query->num_rows()>0)
        {
            echo 1;
        }
        else
        {
            echo 0;
        }
    }

    public function findMyPrivilege(){
        $roleId = isset($_POST['roleId']) ? $_POST['roleId'] : 0;

        $this->load->database('default');
        $query = $this->db->query(
            'SELECT a.id,a.parentid,a.name,a.url,a.isleaf AS open,EXISTS(SELECT id FROM tb_admin_role_privilege AS b
            WHERE a.id=b.privilegeid AND b.roleid=?) AS checked FROM tb_admin_privilege AS a
            ORDER BY a.id ASC,a.sortvalue ASC',array($roleId));

        echo json_encode($query->result());
    }

    public function managePrivilege(){
        $roleId = isset($_POST['roleId']) ? $_POST['roleId'] : 0;
        $privilegeIds =isset($_POST['ids']) ? $_POST['ids'] : '';
        $privilegeArray=explode(',',$privilegeIds);
        if($roleId!=0){
            $this->load->database('default');
            $this->db->trans_begin();
            $this->db->query("DELETE FROM tb_admin_role_privilege WHERE roleid=?",array($roleId));
            for($i=0,$l=count($privilegeArray);$i<$l;$i=$i+1){
                $this->db->query(
                    'INSERT IGNORE INTO tb_admin_role_privilege(roleid,privilegeid) VALUES(?,?)',
                    array(intval($roleId),intval($privilegeArray[$i])));
            }
            if ($this->db->trans_status() == FALSE){
                $this->db->trans_rollback();
                echo -1;
            }else{
                $this->db->trans_commit();
                echo 0;
            }
        }else{
            echo 0;
        }
    }
}
/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */