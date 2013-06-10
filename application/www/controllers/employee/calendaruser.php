<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * 日历关注、共享的用户信息模块;
 * @author qiutao <qiutao@chanjet.com>
 */
class Calendaruser extends CI_Controller {

    public function ajaxFollowedList(){

        $this->load->model('calendaruser_model', 'calendaruser');
        $followedList = $this->calendaruser->getFollowedList();

        $this->load->library('smarty');
        $this->smarty->view('employee/calendaruser/list.tpl', $followedList);
    }
    public function ajaxSharedList(){

        $this->load->model('calendaruser_model', 'calendaruser');
        $sharedList = $this->calendaruser->getSharedList();

        $this->load->library('smarty');
        $this->smarty->view('employee/calendaruser/list.tpl', $sharedList);
    }

    /**
     * 为共享人和关注人排序;
     */
    public function sort(){
        $current_id = 47;
        // $spaceid = 2;
        $post = $_POST;

        $this->load->model('calendaruser_model', 'calendaruser');
        if(is_array($post['mid'])){
            foreach($post['mid'] as $i=>$mid){
                $params = ['sortvalue'=>(int)$post['sort'][$i]];
                $where = ['providerid'=>(int)$mid,
                          'recieverid'=>(int)$current_id,
                          'type'=>(int)$post['type']];// type 1：关注人， 2：共享人

                $this->calendaruser->updateSort($params, $where);
            }
        }
        $this->load->model('common_model', 'common');
        $this->common->_ajaxRs(true, '排序成功', '', 'calendar');
    }
}