<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Jobserial extends CI_Controller {

    private $spaceId; //空间id
    public function __construct()
    {
        parent::__construct();

       $this->load->helper('cache');
        $this->spaceId = QiaterCache::spaceid();
    }

    public function index(){
        $this->load->library('smarty');
        $this->smarty->view('space/jobserial.tpl');
    }

    //插入或修改记录
    public function saveOrUpdate(){
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $name =  isset($_POST['name']) ? $_POST['name'] : '';

        $this->load->database('default');
        $this->db->trans_begin();
        if($id == 0){//新增
            $this->db->query('INSERT INTO tb_job_serial (spaceid,name) VALUES (?,?)',array($this->spaceId,$name));
        }else{//修改
            $this->db->query('UPDATE tb_job_serial SET name =? WHERE id =?',array($name,$id));
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
            $this->db->query('DELETE FROM tb_job_serial WHERE id IN ('.$ids.')');
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
            $query = $this->db->query('SELECT COUNT(id) AS total FROM tb_job_serial where spaceid=?',array($this->spaceId));
            $data['total'] = $query->row()->total;
            $query->free_result();

            if($order=='asc')
            {
                $query = $this->db->query('SELECT id,name FROM tb_job_serial WHERE spaceid=? and id>=(SELECT id FROM tb_job_serial ORDER BY '.$sort.' ASC LIMIT 1 OFFSET ?) ORDER BY '.$sort.' ASC LIMIT ?',array($this->spaceId,($page-1)*$rows,intval($rows)));
            }
            else
            {
                $query = $this->db->query('SELECT id,name FROM tb_job_serial WHERE spaceid=? and id<=(SELECT id FROM tb_job_serial ORDER BY '.$sort.' DESC LIMIT 1 OFFSET ?) ORDER BY '.$sort.' DESC LIMIT ?',array($this->spaceId,($page-1)*$rows,intval($rows)));
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
            $query = $this->db->query('SELECT id,name FROM tb_job_serial WHERE id=?',array($id));
            if($query->num_rows()>0)
                echo json_encode($query->row());
            else
                echo '';
        }else
            echo '';
    }

    //判断岗位序列名称是否重复
    public  function isExistByName()
    {
        $id =  isset($_POST['id']) ? $_POST['id']==''?0:$_POST['id'] : 0;
        $name =  isset($_POST['name']) ? $_POST['name'] : '';

        $this->load->database('default');
        $query = $this->db->query('SELECT id FROM tb_job_serial  WHERE spaceid=? and  id<>? and name=? LIMIT 1',array($this->spaceId,$id,$name));
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