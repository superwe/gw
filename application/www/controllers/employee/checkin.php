<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Checkin extends CI_Controller {

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
	public function index()	{
        //parse_str($_SERVER['QUERY_STRING'],$_GET);
        //$err = isset($_GET['err']) ? intval($_GET['err']) : 0;

        $this->load->library('smarty');
        $this->smarty->view('employee/task/index.tpl');
    }

}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */