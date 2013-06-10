<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: lisheng
 * Date: 13-4-11
 * Time: 下午20:11
 * To invite users.
 */

class Inviteuser extends CI_Controller {

    public function index(){
        $this->load->library('smarty');
        $this->smarty->view('space/inviteuser.tpl');
    }
}

/* End of file Inviteuser.php */
/* Location: ./application/controllers/welcome.php */