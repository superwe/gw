<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Home extends CI_Controller {

	/**
	 * Index Page for this controller.
	 *
	 * Maps to the following URL
	 * 		http://example.com/index.php/welcome
	 *	- or -  
	 * 		http://example.com/index.php/welcome/index
	 *	- or -
	 * Since this controller is set as the default controller in 
	 * config/routes.php, it's displayed at http://example.com/
	 *
	 * So any other public methods not prefixed with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see http://codeigniter.com/user_guide/general/urls.html
	 */
	public function index()
	{

        $this->load->library('session');
        $adminId = $this->session->userdata('adminid');
        $data['adminid']=$adminId;
        $this->load->library('smarty');
		$this->smarty->view("boss/index.tpl",$data);
	}

    public function logout()
    {
        $this->load->helper('url');
        $this->load->library('session');
        $this->session->unset_userdata('adminId');
        $this->session->unset_userdata('username');
        redirect($this->config->base_url().'admin/home/index.html');
    }

    public function findMyPrivilege(){
        $adminId = isset($_POST['adminid']) ? intval($_POST['adminid']) : 0;
        if($adminId!=0){
            $this->load->database('default');
            $query = $this->db->query("SELECT c.id,c.name,c.parentid,c.isleaf AS open,c.url FROM tb_admin AS a LEFT JOIN tb_role_privilege AS b ON a.roleid=b.roleid LEFT JOIN tb_privilege AS c ON b.privilegeid=c.id WHERE a.id=? ",array($adminId));
            if($query->num_rows()>0)
                echo json_encode($query->result());
            else
                echo '';
        }else
            echo '';
    }
}
/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */