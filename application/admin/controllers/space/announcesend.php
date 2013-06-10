<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Announcesend extends CI_Controller {

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
        $query=$this->db->query('SELECT id,name FROM tb_announce_type where spaceid=? order by sortvalue asc',array($this->spaceId ));
        $data['typeList']=$query->result();

        $this->load->library('smarty');
        $this->smarty->view('space/announcesend.tpl',$data);
    }

    //插入或修改记录
    public function saveOrUpdate(){
        $id = isset($_POST['announceid']) ? $_POST['announceid']  : 0;
        $id = $id==''? 0 : intval($id) ;
        $typeid =  isset($_POST['announcetype']) ? $_POST['announcetype'] : '';
        $title =  isset($_POST['title']) ? $_POST['title'] : '';
        $content =  isset($_POST['content']) ? $_POST['content'] : '';
        $isallowcomment =  isset($_POST['isallowcomment']) ? $_POST['isallowcomment'] : '';
        $signname =  isset($_POST['signname']) ? $_POST['signname'] : '';
        $status= isset($_POST['status']) ? intval($_POST['status']) : 0;  //公告状态(0草稿、1已发布、2撤销)

        //目前附件还没有考虑 后续需要加上。

        $this->load->database('default');
        $this->db->trans_begin();

        if($id == 0){//新增
            $this->db->query('INSERT INTO tb_announce (creatorid,spaceid,signname,typeid,title,content,createtime,updatetime,status,isallowcomment) VALUES (?,?,?,?,?,?,NOW(),NOW(),?,?)', array($this->employeeId,$this->spaceId,$signname,$typeid,$title,$content,$status,$isallowcomment));
            $id = $this->db->insert_id();
            if($status == 1){
                //操作日志记录
                $this->db->query('insert into tb_announce_log (announceid,operatorid,operatetime,operatetype) values (?,?,NOW(),1)',array($id,$this->employeeId));

                //创建全文搜索 begin add by lixiao
                $rs=$this->db->query('select updatetime from tb_announce where id=?', array($id));
                $datetime=$rs->row()->updatetime;
                $this->load->model('indexes_model', 'indexes');
                $type = 'announce';
                $data = array('id' => $id, 'spaceid' => $this->spaceId, 'employeeid' => $this->employeeId, 'url' => 'employee/announce/detail/0/'.$id.'.html', 'date' => $datetime, 'title' => $title, 'content' => $content);
                $this->indexes->create($type, $data);
                //创建全文搜索 end 1
            }
        }else{//修改
            $this->db->query('UPDATE tb_announce SET signname =?,typeid=?,title=?,content=?, updatetime=NOW(), isallowcomment=? WHERE id =?',array($signname,$typeid,$title,$content,$isallowcomment,$id));
            //操作日志记录
            $this->db->query('insert into tb_announce_log (announceid,operatorid,operatetime,operatetype) values (?,?,NOW(),2)',array($id,$this->employeeId));

            if($status == 1){
                //更新全文搜索 begin add by lixiao
                $rs=$this->db->query('select updatetime from tb_announce where id=?', array($id));
                $datetime=$rs->row()->updatetime;
                $this->load->model('indexes_model', 'indexes');
                $type = 'announce';
                $data = array('id' => $id, 'employeeid' => $this->employeeId, 'date' => $datetime, 'title' => $title, 'content' => $content);
                $this->indexes->update($type, $data);
                //更新全文搜索 end
            }
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
            $this->db->query('DELETE FROM tb_announce WHERE id ='.$id);

            //操作日志记录
            $this->db->query('insert into tb_announce_log (announceid,operatorid,operatetime,operatetype) values (?,?,NOW(),5)',array($id,$this->employeeId));

            if ($this->db->trans_status() == FALSE){
                $this->db->trans_rollback();
                echo -1;
            }else{
                $this->db->trans_commit();
                //删除全文检索 add by lixiao
                $this->load->model('indexes_model', 'indexes');
                $type = 'announce';
                $this->indexes->deleteById($type, $id);
                //删除全文检索
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
            $query = $this->db->query('SELECT COUNT(id) AS total FROM tb_announce where spaceid=?',array($this->spaceId));
            $data['total'] = $query->row()->total;
            $query->free_result();

            if($order=='asc')
            {
                $query = $this->db->query('SELECT a.id,a.title,a.createtime,a.status,b.name as employeename FROM tb_announce as a left join tb_employee as b on a.creatorid = b.id  WHERE a.spaceid=? and a.id>=(SELECT id FROM tb_announce ORDER BY '.$sort.' ASC LIMIT 1 OFFSET ?) ORDER BY '.$sort.' ASC LIMIT ?',array($this->spaceId,($page-1)*$rows,intval($rows)));
            }
            else
            {
                $query = $this->db->query('SELECT a.id,a.title,a.createtime,a.status,b.name as employeename FROM tb_announce as a   left join tb_employee as b on a.creatorid = b.id WHERE a.spaceid=? and a.id<=(SELECT id FROM tb_announce ORDER BY '.$sort.' DESC LIMIT 1 OFFSET ?) ORDER BY '.$sort.' DESC LIMIT ?',array($this->spaceId,($page-1)*$rows,intval($rows)));
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
            $query = $this->db->query('SELECT signname,typeid,title,content,status,isallowcomment FROM tb_announce WHERE id=?',array($id));
            if($query->num_rows()>0)
                echo json_encode($query->row());
            else
                echo '';
        }else
            echo '';
    }

    //撤销公告
    public function undoAnnounce()
    {
        $id =  isset($_POST['announceid']) ? $_POST['announceid']==''?0:$_POST['announceid'] : 0;

        $this->load->database('default');
        $this->db->trans_begin();

        $this->db->query('update tb_announce set status =2 where id=? ',array($id));
        //操作日志记录
        $this->db->query('insert into tb_announce_log (announceid,operatorid,operatetime,operatetype) values (?,?,NOW(),3)',array($id,$this->employeeId));
        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
            echo -1;
        }else{
            $this->db->trans_commit();

            //删除全文检索 add by lixiao
            $this->load->model('indexes_model', 'indexes');
            $type = 'announce';
            $this->indexes->deleteById($type, $id);
            //删除全文检索

            echo 0;
        }
    }

    //发布公告
    public function sendAnnounce()
    {
        $id =  isset($_POST['announceid']) ? $_POST['announceid']==''?0:$_POST['announceid'] : 0;

        $this->load->database('default');
        $this->db->trans_begin();

        $this->db->query('update tb_announce set status =1 where id=? ',array($id));
        //操作日志记录
        $this->db->query('insert into tb_announce_log (announceid,operatorid,operatetime,operatetype) values (?,?,NOW(),1)',array($id,$this->employeeId));
        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
            echo -1;
        }else{
            $this->db->trans_commit();

            //创建全文搜索 begin add by lixiao
            $rs=$this->db->query('select spaceid,title,content,updatetime from tb_announce where id=?', array($id));
            if($rs->num_rows() > 0)
            {
                $this->load->model('indexes_model', 'indexes');
                $type = 'announce';
                $data = array('id' => $id, 'spaceid' => $rs->row()->spaceid, 'employeeid' => $this->employeeId, 'url' => 'employee/announce/detail/0/'.$id.'.html', 'date' => $rs->row()->updatetime, 'title' => $rs->row()->title, 'content' => $rs->row()->content);
                $this->indexes->create($type, $data);
            }
            //创建全文搜索 end

            echo 0;
        }
    }
}
/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */