<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Home extends CI_Controller {

    /**
     * 登录页控制器构造函数
     */
    public function __construct()
    {
        parent::__construct();
        $this->load->model('login_model', 'login');
        $this->load->helper('cache');
    }

    public function index()
	{
        parse_str($_SERVER['QUERY_STRING'],$_GET);
        $err = isset($_GET['err']) ? intval($_GET['err']) : 0;
        $this->load->library('smarty');

        switch($err){
            case 0:
                $data['errorMessage'] = '';
                break;
            case 1:
                $data['errorMessage'] = '您输入的用户名或密码错误！';
                break;
            case 2:
                $data['errorMessage'] = '您没有管理员权限！';
                break;
            default:
                $data['errorMessage']='未知错误';
        }
        $this->smarty->view('adminIndex.tpl',$data);
    }

    public function adminLogin()
    {
        $username = isset($_POST['username']) ? $_POST['username']: '';
        $password = isset($_POST['password']) ? $_POST['password']: '';

        $this->load->helper('url');

        if ($this->login->verifyPassword($username,$password))
        {
            $this->load->database('default');
            $query = $this->db->query(
                'select id,name,roleid,spaceid,personid,imageurl from tb_employee where roleid >= 0
                and personid in (select id from tb_person where email=?)',array($username));

            if($query->num_rows()>0){

                $row = $query->row();

                $salt = $this->login->getRandom();

                $ip = $this->input->ip_address();

                $sessionId=md5($username.$ip.$salt);

                QiaterCache::spaceid($row->spaceid, $sessionId);
                QiaterCache::saltAdmin($username, $salt);
                QiaterCache::personid($row->personid, $sessionId);
                QiaterCache::employeeid($row->id, $sessionId);
                $emoloyeeInfo =  array (
                    'id' => $row->id,
                    'name' => $row->name,
                    'imageurl' =>  $row->imageurl,
                    'roleid' => $row->roleid
                );
                QiaterCache::employeeInfo($emoloyeeInfo,$sessionId);

                $this->input->set_cookie('session_id',$sessionId,60*60*24*7);
                $this->input->set_cookie('admin_user',$this->login->encrypt($username),60*60*24*7);

                redirect($this->config->base_url().'space/home/index.html');
            }
            else{

                redirect($this->config->base_url().'home/adminIndex.html?err=2');
            }
        }
        else
        {
            redirect($this->config->base_url().'home/adminIndex.html?err=1');
        }

    }

    /**
     * 退出系统
     */
    public function quit()
    {
        $email = $this->input->cookie('qiater_user');
        $email = $this->login->decrypt($email);
        QiaterCache::deleteAll($email);
        delete_cookie('session_id');
        delete_cookie('admin_user');

        redirect($this->config->base_url().'home/index.html');
    }

    /*//获取当前spaceid的申请记录
    public function findSomeApply()
    {
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
            $spaceid =$this->session->userdata('spaceid');//获得空间ID

            $page = $_POST['page'];
            $rows = $_POST['rows'];
            $query = $this->db->query('SELECT COUNT(id) AS total FROM tb_apply where spaceid=?',array($spaceid));
            $data['total'] = $query->row()->total;
            $query->free_result();

            if($order=='asc')
            {
                $query = $this->db->query('SELECT id,spaceid,email,password,updatetime,status
                                               FROM tb_apply  WHERE spaceid=? and
                                               id>=(SELECT id FROM tb_apply ORDER BY '.$sort.' ASC LIMIT 1 OFFSET ?)'.
                    ' ORDER BY '.$sort.' ASC LIMIT ?',array($spaceid,($page-1)*$rows,intval($rows)));
            }
            else
            {
                $query = $this->db->query('SELECT id,spaceid,email,password,updatetime,status
                                               FROM tb_apply  WHERE spaceid=? and
                                               id >=(SELECT id FROM tb_apply ORDER BY '.$sort.' DESC LIMIT 1 OFFSET ?)'.
                    ' ORDER BY '.$sort.' DESC LIMIT ?',array($spaceid,($page-1)*$rows,intval($rows)));
            }

            $data['rows'] = $query->result();

        }else{//自定义查询

        }

        echo json_encode($data);
    }

    //管理员审核用户申请
    public function checkApply()
    {
        $id=  isset($_POST['id']) ? $_POST['id'] : 0;
        $status = isset($_POST['status']) ? $_POST['status'] : '';

        $spaceid= isset($_POST['spaceid']) ? $_POST['spaceid'] :0;
        $email = isset($_POST['email']) ? $_POST['email'] : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';


        if($id!=''){
            $this->load->database('default');
            $this->db->trans_begin();
            $this->db->query('update tb_apply set status=?, updatetime=NOW() WHERE id=?',array($status,$id));

            if($status == "2"){//审核通过 对用户信息进行插入操作

                //插入用户账号并获取ID
                $personid=$this->getInsertNewId('INSERT INTO tb_person (email,password,status,createtime) VALUES (?,?,1,NOW())',array($email,$password));

                //判断此人是否已存在于要加入的空间
                $query =  $this->db->query('select id from tb_employee where email=?  and spaceid=?',array($email,$spaceid));
                if($query->num_rows()>0){
                    $employeeid= $query->row()->id;
                    $this->db->query('update tb_employee set status=1,personid=? where id=? ',array($personid,$employeeid));
                }
                else{
                    //创建空间用户并获取ID
                    $employeeId=$this->getInsertNewId('INSERT INTO tb_employee (spaceid,personid,email,status,createtime) VALUES (?,?,?,1,NOW())',array($spaceid,$personid,$email));
                }
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

    }*/

}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */