<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: shenghua
 * Date: 13-4-9
 * Time: 下午2:25
 * To change this template use File | Settings | File Templates.
 */

class Auth_model extends  CI_Model{
    public function token() {
        $this->load->library('MCache');
        if (!$token = $this->mcache->get('token')) {
            $token = md5(time());
            $this->mcache->set('token', $token, 2);
        }
        return $token;
    }
}