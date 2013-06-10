<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Advertisement extends CI_Controller {

    private $spaceId; //空间id
    public function __construct()
    {
        parent::__construct();

       $this->load->helper('cache');
        $this->spaceId = QiaterCache::spaceid();
    }

    public function index(){
        $this->load->library('smarty');
        $this->smarty->view('space/advertisement.tpl');
    }

    //插入或修改记录
    public function saveOrUpdate(){
        $id = isset($_POST['adid']) ? $_POST['adid']  : 0;
        $id = $id==''? 0 : intval($id) ;
        $title =  isset($_POST['title']) ? $_POST['title'] : '';
        $location =  isset($_POST['location']) ? $_POST['location'] : 1;
        //上传的图片
        $imagelink =  isset($_POST['imagelink']) ? $_POST['imagelink'] : '';

        $imagelink =  isset($_POST['imagelink']) ? $_POST['imagelink'] : '';
        $isvalid =  isset($_POST['isvalid']) ? $_POST['isvalid'] : 1;
        $openway =  isset($_POST['openway']) ? $_POST['openway'] : 2;
        $issystem =  isset($_POST['issystem']) ? $_POST['issystem'] : 0;
        $replacetext =  isset($_POST['replacetext']) ? $_POST['replacetext'] : '';

        $this->load->database('default');
        $this->db->trans_begin();

        //增加资源到tb_resource
        $imageid=0;
        $imageurl='';

        if($id == 0){//新增



            $this->db->query(
                'INSERT INTO tb_advertisement (spaceid,title,location,imageid,imageurl,imagelink,isvalid,openway,issystem,replacetext,createtime)
                 VALUES (?,?,?,?,?,?,?,?,?,?,NOW())', array($this->spaceId,$title,$location,$imageid,$imageurl,$imagelink,$isvalid,$openway,$issystem,$replacetext));

        }else{//修改
            $this->db->query(
                'UPDATE tb_advertisement SET title=?,location=?,imageid=?,imageurl=?,imagelink=?,isvalid=?,openway=?,replacetext=? WHERE id =?'
                ,array($title,$location,$imageid,$imageurl,$imagelink,$isvalid,$openway,$replacetext,$id));
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
        if($id !=''){
            $this->load->database('default');
            $this->db->trans_begin();
            $this->db->query('DELETE FROM tb_advertisement WHERE id ='.$id);
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

        $query = $this->db->query('SELECT COUNT(id) AS total FROM tb_advertisement where spaceid=?  ',array($this->spaceId));
        $data['total'] = $query->row()->total;
        $query->free_result();

        $query = $this->db->query('select id,title,location,isvalid,createtime from tb_advertisement  where spaceid=?  ORDER BY '.$sort.'  '.$order,array($this->spaceId));
        $data['rows'] = $query->result();

        echo json_encode($data);
    }

    //获取一个广告的信息
    public function findOne(){
        $id =  isset($_POST['id']) ? $_POST['id'] : '';
        if($id!=''){
            $this->load->database('default');
            $query = $this->db->query('SELECT title,location,imageid,imageurl,imagelink,isvalid,openway,issystem,replacetext,createtime FROM tb_advertisement WHERE id=?',array($id));
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