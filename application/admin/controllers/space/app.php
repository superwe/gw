<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class App extends CI_Controller {

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
        $this->smarty->view('space/app.tpl');
    }

    //插入或修改记录
    public function saveOrUpdate(){
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $name =  isset($_POST['name']) ? $_POST['name'] : '';
        $introduce =  isset($_POST['introduce']) ? $_POST['introduce'] : '';
        $url =  isset($_POST['url']) ? $_POST['url'] : '';

        $this->load->database('default');
        $this->db->trans_begin();
        if($id == 0){//新增

            //上传图标 并获得图标的存放路径
            $this->load->library('upload');
            $this->upload->do_upload();
            $data = $this->upload->data();
            $imageurl = '/uploads/'.$data['file_name'];

            $this->db->query('INSERT INTO tb_app (name,introduce,type,url,imageurl,createtime,creatorid,status) VALUES (?,?,1,?,?,NOW(),?,1)',array($name,$introduce,$url,$imageurl,$this->employeeId));
            $appid = $this->db->insert_id();
            $this->db->query('INSERT INTO tb_space_app (spaceid,appid,sortvalue) VALUES (?,?)',array($this->spaceId,$appid,$appid));
        }else{//修改
            $this->db->query('UPDATE tb_app SET name =?,introduce=?,url=? ,imageurl="" WHERE id =?',array($name,$introduce,$url,$id));
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
            $this->db->query('DELETE FROM tb_app WHERE id IN ('.$ids.')');
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

        $this->db->query('insert into tb_space_app (spaceid,appid,sortvalue) (select '.$this->spaceId.',id,id from tb_app
                                        where id not in (select appid from tb_space_app where spaceid = '.$this->spaceId.' ) and status=1 )');

        $query = $this->db->query('SELECT COUNT(id) AS total FROM tb_app where  id in ( select appid from tb_space_app where spaceid=?  ) ',array($this->spaceId));
        $data['total'] = $query->row()->total;
        $query->free_result();

        $query = $this->db->query('select a.*,ifnull(b.status,0) as isshow,b.sortvalue as sort from tb_app as a left join tb_space_app as b on a.id = b.appid where  a.status=1
                                                        and a.id in ( select appid from tb_space_app where spaceid=? )  ORDER BY b.'.$sort.'  '.$order,array($this->spaceId));

        $data['rows'] = $query->result();

        echo json_encode($data);
    }


    //获取一个用户的信息
    public function findOne(){
        $id =  isset($_POST['id']) ? $_POST['id'] : '';
        if($id!=''){
            $this->load->database('default');
            $query = $this->db->query('SELECT * FROM tb_app WHERE id=?',array($id));
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
        $query = $this->db->query('SELECT id FROM tb_app  WHERE  id<>? and name=? LIMIT 1',array($id,$name));
        if($query->num_rows()>0)
        {
            echo 1;
        }
        else
        {
            echo 0;
        }
    }

    public function setAppShowtype()
    {
        $id =  isset($_POST['id']) ? $_POST['id']==''?0:$_POST['id'] : 0;
        $showtype =  isset($_POST['showtype']) ? $_POST['showtype'] : '';

        $this->load->database('default');
         $this->db->query('update tb_space_app  set status=? WHERE  appid=? and spaceid=? ',array($showtype,$id,$this->spaceId));
         echo 1;
    }

    public function upApp()
    {
        $currid =  isset($_POST['currid']) ? $_POST['currid']==''?0:$_POST['currid'] : 0;
        $preid =  isset($_POST['preid']) ? $_POST['preid']==''?0:$_POST['preid'] : 0;
        $currsort =  isset($_POST['currsort']) ? $_POST['currsort'] : 0;
        $presort =  isset($_POST['presort']) ? $_POST['presort'] : 0;

        $this->load->database('default');
        $this->db->trans_begin();
        $this->db->query('update tb_space_app set sortvalue=? WHERE appid =? and spaceid=?',array($presort,$currid,$this->spaceId));
        $this->db->query('update tb_space_app set sortvalue=? WHERE appid =? and spaceid=?',array($currsort,$preid,$this->spaceId));
        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
            echo -1;
        }else{
            $this->db->trans_commit();
            echo 0;
        }
    }

    public function downApp()
    {
        $currid =  isset($_POST['currid']) ? $_POST['currid']==''?0:$_POST['currid'] : 0;
        $nextid =  isset($_POST['nextid']) ? $_POST['nextid']==''?0:$_POST['nextid'] : 0;
        $currsort =  isset($_POST['currsort']) ? $_POST['currsort'] : 0;
        $nextsort =  isset($_POST['nextsort']) ? $_POST['nextsort'] : 0;

        $this->load->database('default');
        $this->db->trans_begin();
        $this->db->query('update tb_space_app set sortvalue=? WHERE appid =? and spaceid=?',array($nextsort,$currid,$this->spaceId));
        $this->db->query('update tb_space_app set sortvalue=? WHERE appid =? and spaceid=?',array($currsort,$nextid,$this->spaceId));
        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
            echo -1;
        }else{
            $this->db->trans_commit();
            echo 0;
        }
    }

}
/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */