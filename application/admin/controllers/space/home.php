<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Home extends CI_Controller {

    private $roleId; //角色id
    public function __construct()
    {
        parent::__construct();

        $this->load->model('login_model','login');

        $this->load->helper('cache');
        $employeeInfo = QiaterCache::employeeInfo();
        $this->roleId = $employeeInfo['roleid'];
    }

	public function index()
	{
        $this->load->library('smarty');
		$this->smarty->view("space/index.tpl");
	}

    public function logout()
    {
        $email = $this->input->cookie('admin_user');
        $email = $this->login->decrypt($email);
        QiaterCache::deleteAll($email);

        delete_cookie('session_id');
        delete_cookie('admin_user');

        redirect($this->config->base_url().'home/index.html');
    }

    public function findMyPrivilege()
    {
        $this->load->database('default');
        if($this->roleId == '0')
        { //超级权限管理员
            $where = '';
        }
        else{
            $where = ' where id in (select privilegeid from tb_role_privilege where roleid='.$this->roleId.')';
        }
        $query = $this->db->query('SELECT id,parentid,name, url as funcurl from tb_privilege '.$where.' order by sortvalue ');

        echo  json_encode($query->result());
    }

}
/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */