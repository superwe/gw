<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Group extends CI_Controller {

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
        $this->load->library('smarty');
        $this->smarty->view('space/group.tpl');
    }

    //插入或修改记录
    public function saveOrUpdate(){
        $id = isset($_POST['groupid']) ? intval($_POST['groupid']) : 0;
        $name =  isset($_POST['name']) ? $_POST['name'] : '';
        $description =  isset($_POST['description']) ? $_POST['description'] : '';
        $ispublic =  isset($_POST['ispublic']) ? $_POST['ispublic'] : '';
        $grade =  isset($_POST['grade']) ? $_POST['grade'] : '';

        $showinlist='0';//私密群组是否显示在群组列表，0-否，1-是
        $messagenum =0;
        $employeenum=1;
        $firstletter='';
        $source=0;

        $this->load->database('default');
        $this->db->trans_begin();

        //保存资源文件到tb_resource
        $logoid =0;
        $logourl='';
        $bgid=0;
        $bgurl='';

        if($id == 0){//新增
            $this->db->query(
                'INSERT INTO tb_group (name,spaceid,creatorid,logoid,logourl,ispublic,grade,showinlist,messagenum,employeenum,description,
                firstletter,bgid,bgurl,createtime,source) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?)',array($name,$this->spaceId,$this->employeeId,
                $logoid,$logourl,$ispublic,$grade,$showinlist,$messagenum,$employeenum,$description,$firstletter,$bgid,$bgurl,$source));
            $groupid = $this->db->insert_id();
            $this->db->query('INSERT INTO tb_group_employee (groupid,employeeid,status,jointime) VALUES (?,?,3,NOW())',array($groupid,$this->employeeId));
        }else{//修改
            $this->db->query(
                'UPDATE tb_group SET name =?,description=?,logoid=?,logourl=?,ispublic=?,grade=?,firstletter=? WHERE id =?',
                array($name,$description,$logoid,$logourl,$ispublic,$grade,$firstletter,$id));
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
            $this->db->query('DELETE FROM tb_group WHERE id ='.$id);
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
            $query = $this->db->query('SELECT COUNT(id) AS total FROM tb_group where spaceid=?',array($this->spaceId));
            $data['total'] = $query->row()->total;
            $query->free_result();

            if($order=='asc')
            {
                $query = $this->db->query(
                    'SELECT a.id,a.name,a.messagenum,a.employeenum,b.name as employeename FROM tb_group as a
                    left join tb_employee as b on a.creatorid = b.id  WHERE a.spaceid=? and
                    a.id>=(SELECT id FROM tb_group ORDER BY '.$sort.' ASC LIMIT 1 OFFSET ?)
                    ORDER BY '.$sort.' ASC LIMIT ?',array($this->spaceId,($page-1)*$rows,intval($rows)));
            }
            else
            {
                $query = $this->db->query('SELECT a.id,a.name,a.messagenum,a.employeenum,b.name as employeename FROM tb_group as a
                 left join tb_employee as b on a.creatorid = b.id WHERE a.spaceid=? and
                 a.id<=(SELECT id FROM tb_group ORDER BY '.$sort.' DESC LIMIT 1 OFFSET ?)
                 ORDER BY '.$sort.' DESC LIMIT ?',array($this->spaceId,($page-1)*$rows,intval($rows)));
            }
            $data['rows'] = $query->result();
        }else{//自定义查询

        }
        echo json_encode($data);
    }


    //获取一个群组的信息
    public function findOne(){
        $id =  isset($_POST['id']) ? $_POST['id'] : '';
        if($id!=''){
            $this->load->database('default');
            $query = $this->db->query('SELECT name,spaceid,creatorid,logoid,logourl,ispublic,grade,showinlist,messagenum,employeenum,description,
                firstletter,bgid,bgurl,createtime,source FROM tb_group WHERE id=?',array($id));
            if($query->num_rows()>0)
                echo json_encode($query->row());
            else
                echo '';
        }else
            echo '';
    }

    //判断名称是否重复
    public  function isExistByName()
    {
        $id =  isset($_POST['id']) ? $_POST['id']==''?0:$_POST['id'] : 0;
        $name =  isset($_POST['name']) ? $_POST['name'] : '';

        $this->load->database('default');
        $query = $this->db->query('SELECT id FROM tb_group  WHERE  id<>? and name=? LIMIT 1',array($id,$name));
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