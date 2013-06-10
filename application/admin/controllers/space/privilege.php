<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Privilege extends CI_Controller {

    public function index(){
        $this->load->library('smarty');
        $this->smarty->view('space/privilege.tpl');
    }

    //插入或修改记录
    public function saveOrUpdate(){
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $parentid = isset($_POST['parentid']) ? intval($_POST['parentid']):0;
        $ancestorids = isset($_POST['ancestorids']) ? $_POST['ancestorids']:'';
        $ancestornames = isset($_POST['ancestornames']) ? $_POST['ancestornames']:'';
        $name =  isset($_POST['name']) ? $_POST['name'] : '';
        $level = isset($_POST['level'])?intval($_POST['level']):0;
        $sortvalue = isset($_POST['sortvalue'])?intval($_POST['sortvalue']):0;
        $isleaf = isset($_POST['isleaf'])?intval($_POST['isleaf']):0;
        $url = isset($_POST['url']) ? $_POST['url']:'';
        $this->load->database('default');
        $this->db->trans_begin();
        if($id == 0){//新增
            $this->db->query('INSERT INTO tb_privilege(parentid,ancestorids,name,level,sortvalue,isleaf,url) VALUES(?,?,?,?,?,?,?)',array($parentid,$ancestorids,$ancestornames.'/'.$name,$level,$sortvalue,$isleaf,$url));
            $this->db->query('UPDATE tb_privilege SET isleaf=? WHERE id=?',array(0,$parentid));
        }else{//修改
            $this->db->query('UPDATE tb_privilege SET parentid=?,ancestorids=?,name=?,level=?,sortvalue=?,isleaf=?,url=? WHERE id=? ',array($parentid,$ancestorids,$ancestornames.'/'.$name,$level,$sortvalue,$isleaf,$url,$id));
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
        //parse_str($_SERVER['QUERY_STRING'],$_GET);
        $id =  isset($_POST['id']) ? $_POST['id'] : '';
        $parentid =  isset($_POST['parentid']) ? $_POST['parentid'] : '';
        if($id!=''){
            $this->load->database('default');
            $this->db->trans_begin();
            $query = $this->db->query('SELECT COUNT(id) AS totalchildren FROM tb_privilege WHERE parentid=?',array($parentid));
            $totalchildren = $query->row()->totalchildren;
            $this->db->query('DELETE FROM tb_privilege WHERE id =?',array($id));
            if($totalchildren==1){
                $this->db->query('UPDATE tb_privilege SET isleaf=1 WHERE id =?',array($parentid));
            }
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
        $this->load->database('default');
        $query = $this->db->query('SELECT id,parentid,ancestorids,name,level,sortvalue,isleaf FROM tb_privilege ORDER BY id ASC,sortvalue ASC');
        echo json_encode($query->result());
    }

    //获取一个权限的信息
    public function findOne(){
        $id =  isset($_POST['id']) ? $_POST['id'] : '';
        if($id!=''){
            $this->load->database('default');
            $query = $this->db->query('SELECT id,parentid,ancestorids,name,level,sortvalue,isleaf,url FROM tb_privilege WHERE id=? LIMIT 1',array($id));
            if($query->num_rows()>0)
                echo json_encode($query->row());
            else
                echo '';
        }else
            echo '';
    }
}
/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */