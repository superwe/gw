<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Notice extends CI_Controller {
    private $spaceId;
    private $employeeId;
    public function __construct(){
        parent::__construct();
        $this->load->helper('cache');
        //从缓存获得空间ID
        $this->spaceId = QiaterCache::spaceid();
        $this->employeeId = QiaterCache::employeeid();
    }

    public function index(){
        //应用列表
        $this->load->model('app_model', 'app');
        $data['appList'] = $this->app->getAppList($this->spaceId);
        // 群组列表
        $this->load->model('group_model', 'group');
        $data['groupList'] = $this->group->getGroupMenu($this->spaceId, $this->employeeId);//群组列表
        $data['personalInfo'] = QiaterCache::employeeInfo();
        $data['spaceId'] = $this->spaceId;
        // 数量显示
        $this->load->model('notice_model', 'notice');
        $data['moduleNum'] = $this->notice->getNoticeNumByModule($this->spaceId, $this->employeeId, 0, array(), 0, 0);
        $data['moduleNum'] = $data['moduleNum'] + array(0 => array_sum($data['moduleNum']));
        $this->load->library('smarty');
        $this->smarty->view('employee/notice/index.tpl', $data);
    }

    /**
     * 待处理通知
     */
    public function handel(){
        //应用列表
        $this->load->model('app_model', 'app');
        $data['appList'] = $this->app->getAppList($this->spaceId);
        // 群组列表
        $this->load->model('group_model', 'group');
        $data['groupList'] = $this->group->getGroupMenu($this->spaceId, $this->employeeId);//群组列表
        $data['personalInfo'] = QiaterCache::employeeInfo();
        $data['spaceId'] = $this->spaceId;
        // 数量显示
        $this->load->model('notice_model', 'notice');
        $data['moduleNum'] = $this->notice->getNoticeNumByModule($this->spaceId, $this->employeeId, 0, array(), 1, 0);
        $data['moduleNum'] = $data['moduleNum'] + array(0 => array_sum($data['moduleNum']));
        $this->load->library('smarty');
        $this->smarty->view('employee/notice/handel.tpl', $data);
    }

    /**
     * 通知列表
     */
    public function noticelist(){
        $_GET = $this->input->get();
        $module = isset($_GET['module']) ? intval($_GET['module']) : 0;
        $isHandel = isset($_GET['ishandel']) ? intval($_GET['ishandel']) : 0;
        $page = isset($_GET['page']) ? intval($_GET['page']) : 0;
        $num = isset($_GET['num']) ? intval($_GET['num']) : 15;
        $page = $page <= 0 ? 1 : $page;
        $num = $num <= 0 ? 10 : $num;
        $offset = ($page - 1) * $num;
        $this->load->model('notice_model', 'notice');
        // 通知总数
        $data['total'] = $this->notice->getNoticeNum($this->spaceId, $this->employeeId, 0, array(), $module, $isHandel);
        // 通知列表
        $list = $this->notice->getNoticeList($this->spaceId, $this->employeeId, 0, array(), $module, $isHandel, $num, $offset);
        if(empty($isHandel) && $list['noticeIds']){
            $this->notice->readNoticeById($list['noticeIds'], $this->employeeId);
        }
        $data['list'] = $list['noticeList'];
        echo json_encode($data);
        exit;
    }


}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */