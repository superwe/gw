<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Feed extends CI_Controller {
    private $spaceId;
    private $employeeId;
    public function __construct(){
        parent::__construct();
        $this->load->helper('cache');
        //从缓存获得空间ID
        $this->spaceId = QiaterCache::spaceid();
        $this->employeeId = QiaterCache::employeeid();
    }

    /**
     * 全部动态
     */
    public function allfeed(){
        parse_str($_SERVER['QUERY_STRING'], $_GET);
        $feedId = isset($_GET['feedid']) ? intval($_GET['feedid']) : 0;
        $this->load->model('feed_model', 'feedM');
        $this->load->model('group_model', 'group');
        // 查看者所在有群组 IDs
        $myGroupIds = $this->group->getEmployeeGroupIds($this->employeeId);
        // 查看者所在部门ID
        $deptId = 0;
        $list = $this->feedM->getFeedListByAll($this->spaceId, $this->employeeId, $myGroupIds, $deptId, array(), $feedId);
        echo json_encode($list);
        exit;
    }

    /**
     * 我的（个人）动态
     */
    public function myfeed(){
        parse_str($_SERVER['QUERY_STRING'], $_GET);
        $eid = isset($_GET['eid']) ? intval($_GET['eid']) : $this->employeeId;
        $feedId = isset($_GET['feedid']) ? intval($_GET['feedid']) : 0;
        $this->load->model('feed_model', 'feedM');
        $this->load->model('group_model', 'group');
        // 被查看者群组IDs
        $employeeGroupIds = $this->group->getEmployeeGroupIds($eid);
        // 查看者所在有群组 IDs
        $myGroupIds = $this->group->getEmployeeGroupIds($this->employeeId);
        // 查看者所在部门ID
        $deptId = 0;
        $list = $this->feedM->getFeedListByEmployee($this->spaceId, $eid, $this->employeeId, $employeeGroupIds, $myGroupIds, $deptId, $feedId);
        //print_r($list);
        echo json_encode($list);
        exit;
    }

    /**
     * 我关注人的动态
     */
    public function attfeed(){
        parse_str($_SERVER['QUERY_STRING'], $_GET);
        $feedId = isset($_GET['feedid']) ? intval($_GET['feedid']) : 0;
        $this->load->model('feed_model', 'feedM');
        $this->load->model('follow_model', 'follow');
        $followId = $this->follow->getFollowEmployeeIds($this->employeeId);
        $followId = empty($followId) ? array($this->employeeId) : array_merge($followId, array($this->employeeId));
        $deptId = 0;
        $list = $this->feedM->getFeedListByAll($this->spaceId, $this->employeeId, array(), $deptId, $followId, $feedId);
        echo json_encode($list);
        exit;
    }

    /**
     * 全部发言 : 公开发言 + 我参与的群组发言 + 秘送我的发言
     */
    public function speech(){
        parse_str($_SERVER['QUERY_STRING'], $_GET);
        $feedId = isset($_GET['feedid']) ? intval($_GET['feedid']) : 0;
        $this->load->model('feed_model', 'feedM');
        $this->load->model('group_model', 'group');
        // 被查看者群组IDs
        $myGroupIds = $this->group->getEmployeeGroupIds($this->employeeId);
        $deptId = 0;
        $list = $this->feedM->getFeedListByModel($this->spaceId, $this->employeeId, $this->config->item('object_type_speech', 'base_config'), $myGroupIds, $deptId, $feedId);
        echo json_encode($list);
        exit;
    }

    public function operationfeed(){
        parse_str($_SERVER['QUERY_STRING'], $_GET);
        $feedId = isset($_GET['feedid']) ? intval($_GET['feedid']) : 0;
        $operation = isset($_GET['operation']) ? intval($_GET['operation']) : 1;
        $isMyself = 0;
        $this->load->model('feed_model', 'feedM');
        $this->load->model('group_model', 'group');
        // 被查看者群组IDs
        $myGroupIds = $this->group->getEmployeeGroupIds($this->employeeId);
        $list = $this->feedM->getFeedListByOperation($this->spaceId, 2, $this->employeeId, $operation, $myGroupIds, $feedId);
        echo json_encode($list);
        exit;
    }
}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */