<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Test extends CI_Controller {
	/**
	 * __construct function.
	 * 
	 * @access public
	 */
	function __construct() {
		parent::__construct();
		$this->load->library('oauth_resource_server');
	}
	/**
     * 接口控制器调用oauth验证demo
     */
    public function index() {
        $userId =  $this->oauth_resource_server->is_user();
        if($userId){
        	echo 'Oauth验证成功，开始具体接口的业务逻辑......';
        }else {
       	 	echo 'Oauth验证失败，检查access_token参数是否正确'; 	
        }
    }
}
