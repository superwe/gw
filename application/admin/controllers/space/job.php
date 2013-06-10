<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Job extends CI_Controller {

    private $spaceId; //空间id
    public function __construct()
    {
        parent::__construct();

       $this->load->helper('cache');
        $this->spaceId = QiaterCache::spaceid();
    }

    public function index(){
        $data = [];

        $this->load->database('default');
        $query=$this->db->query('SELECT id,name FROM tb_job_serial where spaceid=?',array($this->spaceId));

        $data['jobSerialList']=$query->result();

        $this->load->library('smarty');
        $this->smarty->view('space/job.tpl',$data);
	}

    //插入或修改记录
    public function saveOrUpdate(){
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $name =  isset($_POST['name']) ? $_POST['name'] : '';
        $jobserialid =  isset($_POST['jobserialid']) ? $_POST['jobserialid'] : '';
        $isenabled =  isset($_POST['isenabled']) ? intval($_POST['isenabled'])  : 1;
        $remark =  isset($_POST['remark']) ? $_POST['remark'] : '';

        $this->load->database('default');
        $this->db->trans_begin();
        if($id == 0){//新增

            $this->db->query('INSERT INTO tb_job (spaceid,name,jobserialid,isenabled,remark) VALUES (?,?,?,?,?)',array($this->spaceId,$name,$jobserialid,$isenabled,$remark));
        }else{//修改
            $this->db->query('UPDATE tb_job SET name=?,jobserialid=?,isenabled=?,remark=? WHERE id =?',array($name,$jobserialid,$isenabled,$remark,$id));
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
            $this->db->query('DELETE FROM tb_job WHERE id IN ('.$ids.')');
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
            $query = $this->db->query('SELECT COUNT(id) AS total FROM tb_job where spaceid=?',array($this->spaceId));
            $data['total'] = $query->row()->total;
            $query->free_result();

            if($order=='asc')
            {
                $query = $this->db->query('SELECT a.id,a.name,a.isenabled,a.remark,b.name as jobserial FROM tb_job as a left join tb_job_serial as b on a.jobserialid=b.id  WHERE a.spaceid=? and a.id>=(SELECT id FROM tb_job ORDER BY '.$sort.' ASC LIMIT 1 OFFSET ?) ORDER BY a.'.$sort.' ASC LIMIT ?',array($this->spaceId,($page-1)*$rows,intval($rows)));
            }
            else
            {
                $query = $this->db->query('SELECT a.id,a.name,a.isenabled,a.remark,b.name as jobserial FROM tb_job as a left join tb_job_serial as b on a.jobserialid=b.id  WHERE a.spaceid=? and a.id<=(SELECT id FROM tb_job ORDER BY '.$sort.' DESC LIMIT 1 OFFSET ?) ORDER BY a.'.$sort.' DESC LIMIT ?',array($this->spaceId,($page-1)*$rows,intval($rows)));
            }
            $data['rows'] = $query->result();
        }else{//自定义查询

        }
        echo json_encode($data);
    }

    //获得所有有效的岗位记录
    public function findAll(){

        $this->load->database('default');
        $query = $this->db->query('SELECT a.id,a.name,b.name as jobserial,a.remark FROM tb_job as a left join tb_job_serial as b on a.jobserialid = b.id WHERE a.isenabled=1 and a.spaceid=?  ORDER BY id ASC',array($this->spaceId));

        $data['rows'] = $query->result();
        echo json_encode($data);
    }

    //获取一个岗位的信息
    public function findOne(){
        $id =  isset($_POST['id']) ? $_POST['id'] : '';
        $data = [];
        if($id!=''){
            $this->load->database('default');
            $query = $this->db->query('SELECT a.id,a.name,a.jobserialid,a.isenabled,a.remark FROM tb_job AS a  WHERE a.id=? LIMIT 1',array($id));
            if($query->num_rows()>0)
                echo json_encode($query->row());
            else
                echo '';
        }else
            echo '';
    }

    //判断岗位名称是否重复
    public  function isExistByName()
    {
        $id =  isset($_POST['id']) ? $_POST['id']==''?0:$_POST['id'] : 0;
        $name =  isset($_POST['name']) ? $_POST['name'] : '';

        $this->load->database('default');
        $query = $this->db->query('SELECT id FROM tb_job  WHERE spaceid=? and  id<>? and name=? LIMIT 1',array($this->spaceId,$id,$name));
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