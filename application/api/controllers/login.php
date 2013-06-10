<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: LiSheng
 * Date: 13-5-3
 * Time: 上午11:14
 * To change this template use File | Settings | File Templates.
 */

class Login extends CI_Controller {

    public function __construct(){
        parent::__construct();
        $this->load->model('common_model', 'common');
        $this->load->model('login_model', 'login');
    }


    /**
     * 客户端登陆验证
     *  username  用户名
     *  pwd 密码
     * add  by lisheng
     * 2013-05-03
     */
    public function validateLogin()
    {
        $email = isset($_POST['username']) ? trim($_POST['username']) : '';
        $password = isset($_POST['pwd']) ? trim($_POST['pwd']) : '';

        $data=$this->login->getUserInfo($email);
        $error = '' ;
        if(empty($data))
        {
            $error = '您的用户名不存在或已注销!';
        }
        else
        {
            if($this->login->verityHash($password,$data['password']))
            {
                $error = '';
            }
            else
            {
                $error = '您输入的密码和账户名不匹配,请重新输入.';
            }
        }

        if($error == '')
        { //登陆成功
            $this->common->_ajaxRs(true, $data);
        }
        else
        {
            $this->common->_ajaxRs(false, array(),$error);
        }
    }


}