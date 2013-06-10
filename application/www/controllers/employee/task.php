<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Task extends CI_Controller {
    private $spaceId;
    private $employeeId;
    public function __construct(){
        parent::__construct();
        $this->load->helper('cache');
        //从缓存获得空间ID
        $this->spaceId = QiaterCache::spaceid();
        $spaceInfo = QiaterCache::spaceInfo();
        $this->spaceName = $spaceInfo['name'];
        $this->employeeId = QiaterCache::employeeid();
    }

    /**
     * 任务首页
     */
    public function index(){
        //应用列表
        $this->load->model('app_model', 'app');
        $data['appList'] = $this->app->getAppList($this->spaceId);
        // 群组列表
        $this->load->model('group_model', 'group');
        $data['groupList'] = $this->group->getGroupMenu($this->spaceId, $this->employeeId);//群组列表
        $this->load->model('task_model', 'task');
        $list = $this->task->getTaskList($this->employeeId, 1, 1, 0);
        $data['model'] = $this->config->item('object_type_task', 'base_config');
        $data['spaceName'] = $this->spaceName;
        $data['list'] = $list;
        $data['personalInfo'] = QiaterCache::employeeInfo();
        $data['spaceId'] = $this->spaceId;
        $this->load->library('smarty');
        $this->smarty->view('employee/task/index.tpl', $data);
    }

    /**
     * 任务列表
     */
    public function taskList(){
        $showtype = isset($_POST['showtype']) ? intval($_POST['showtype']) : 0;
        $role = isset($_POST['myrole']) ? intval($_POST['myrole']) : 0;
        $handleType = isset($_POST['handleType']) ? intval($_POST['handleType']) : 0;
        $statusWhere = isset($_POST['status']) ? intval($_POST['status']) : -1;
        $tid = isset($_POST['tid']) ? intval($_POST['tid']) : 0;
        $isCreator = $isEmployee = $status = 0;
        if ($showtype == 1) {  //创建的
            $isCreator = 1;
            $role = -1;
        } elseif ($showtype == 2) {   //负责的
            $isEmployee = 1;
            $role = 1;
        } elseif ($showtype == 3) {   //参与的
            $role = 2;
        } elseif ($showtype == 4) {   //被只会的
            $role = 3;
        } elseif ($showtype == 5) {   //草稿箱
            $isCreator = 1;
            $status = 2;
        } else{ // 全部
            $isCreator = 1;
            $isEmployee = 1;
        }
        $curStatus = 0;
        if(in_array($statusWhere, array(1,5,6))){
            $status = $statusWhere;
        }else{
            $curStatus = $statusWhere;
        }

        $this->load->model('task_model', 'task');
        $list = $this->task->getTaskList($this->employeeId, $isCreator, $isEmployee, $role, $status, $handleType, $curStatus, $tid);
        $data['model'] = $this->config->item('object_type_task', 'base_config');
        $data['spaceName'] = $this->spaceName;
        $data['list'] = $list;
        $data['personalInfo'] = QiaterCache::employeeInfo();
        $data['spaceId'] = $this->spaceId;
        $this->load->library('smarty');
        $this->smarty->view('employee/task/list.tpl', $data);
    }

    /**
     * 任务详情页
     */
    public function info(){
        parse_str($_SERVER['QUERY_STRING'], $_GET);
        $id = isset($_GET['tid']) ? intval($_GET['tid']) : 0;
        if(empty($id)){
            $this->throws('参数错误', 0);
        }
        // 应用列表
        $this->load->model('app_model', 'app');
        $data['appList'] = $this->app->getAppList($this->spaceId);
        // 群组列表
        $this->load->model('group_model', 'group');
        $data['groupList'] = $this->group->getGroupMenu($this->spaceId, $this->employeeId);
        $this->load->model('task_model', 'task');
        $taskInfo = $this->task->getTaskOneInfo($this->employeeId, $id);
        $userArr = array($taskInfo[$id]['creatorid']);
        $userArr = array_merge($userArr, $taskInfo[$id]['userId']['manage']);
        $userArr = isset($taskInfo[$id]['userId']['join']) ? array_merge($userArr, $taskInfo[$id]['userId']['join']) : $userArr;
        $userArr = isset($taskInfo[$id]['userId']['notice']) ? array_merge($userArr, $taskInfo[$id]['userId']['notice']) : $userArr;
        if(!in_array($this->employeeId, $userArr)){
            redirect($this->config->item('base_url').'employee/task/index.html');
        }
        $data['model'] = $this->config->item('object_type_task', 'base_config');
        $data['spaceName'] = $this->spaceName;
        $data['list'] = $taskInfo;
        $data['personalInfo'] = QiaterCache::employeeInfo();
        $data['spaceId'] = $this->spaceId;
        $this->load->library('smarty');
        $this->smarty->view('employee/task/info.tpl', $data);
    }

    /**
     * 创建任务页面
     */
    public function create(){
        $this->load->model('app_model', 'app');
        $data['appList'] = $this->app->getAppList($this->spaceId);
        $data['personalInfo'] = QiaterCache::employeeInfo();
        $data['spaceId'] = $this->spaceId;
        $this->load->library('smarty');
        $this->smarty->view('employee/task/create.tpl', $data);
    }

    /**
     * 分配任务结点
     */
    public function assign(){
        parse_str($_SERVER['QUERY_STRING'],$_GET);
        $this->load->model('app_model', 'app');
        $data['appList'] = $this->app->getAppList($this->spaceId);
        $id = isset($_GET['tid']) ? intval($_GET['tid']) : 0;
        if(empty($id)){
            $this->throws('参数错误');
        }
        $this->load->model('task_model', 'task');
        $taskInfo = $this->task->getTaskNodeInfo(array('a.id AS parentid', 'a.taskid', 'a.title', 'a.status'), $id, 0);
        if($taskInfo['status'] <> 0){
            $this->throws('此任务不可再进行分配');
        }
        $data['task'] = $taskInfo;
        $this->load->library('smarty');
        $this->smarty->view('employee/task/create.tpl', $data);
    }

    /**
     * 修改任务结点
     */
    public function edit(){
        parse_str($_SERVER['QUERY_STRING'],$_GET);
        $this->load->model('app_model', 'app');
        $data['appList'] = $this->app->getAppList($this->spaceId);
        $id = isset($_GET['tid']) ? intval($_GET['tid']) : 0;
        if(empty($id)){
            $this->throws('参数错误', 0);
        }
        $this->load->model('task_model', 'task');
        $taskInfo = $this->task->getTaskOneInfo($this->employeeId, $id);
        if(empty($taskInfo)) $this->throws('任务不存在', 0);
        if($taskInfo[$id]['creatorid'] != $this->employeeId){
            redirect($this->config->item('base_url').'employee/task/index.html');
        }
        $data['tid'] = $id;
        $taskInfo[$id]['starttime'] = $taskInfo[$id]['starttime'] == '0000-00-00 00:00:00'? 0 : $taskInfo[$id]['starttime'];
        $taskInfo[$id]['expectendtime'] = $taskInfo[$id]['expectendtime'] == '0000-00-00 00:00:00'? 0 : $taskInfo[$id]['expectendtime'];
        $data['task'] = $taskInfo[$id];
        $this->load->library('smarty');
        $this->smarty->view('employee/task/create.tpl', $data);
    }

    /**
     * 保存任务
     */
    public function save(){
        $tid = isset ($_POST['tid']) ? intval(trim($_POST['tid'])) : 0;
        $title = isset ($_POST['tasktitle'] ) ? trim ($_POST['tasktitle']) : '';
        $content = isset ($_POST['tcontent']) ? trim ($_POST['tcontent']) : '';
        $isDraft = isset($_POST['draftflag']) ? intval($_POST['draftflag']) : 0; // 是否为草稿
        $isajax = 1;
        //父级任务id
        $parent_task_id = isset($_POST['parent_task_id']) ? $_POST['parent_task_id'] : 0;
        //是否带入主任务附件
        $takefile = isset($_POST['takefile']) ? $_POST['takefile'] : 0;
        $this->load->model('task_model', 'task');
        //任务开始时间
        if (empty($_POST['start_date'])) {
            $starttime = $this->task->getDefaultTaskBeginTime();
        } else {
            $starttime = $this->task->formatTaskDateTime($_POST['start_date'], $_POST['start_time']);
        }
        //任务结束时间
        $expectendtime = $this->task->formatTaskDateTime($_POST['end_date'], $_POST['end_time']);
        //尽快完成
        $fastcomplete = isset($_POST['fastcomplete']) ? $_POST['fastcomplete'] : 0;
        //重要程度
        $isimportant = empty($_POST['important']) ? false : true;
        //提醒方式
        $remindway = isset($_POST['remindway']) ? $_POST['remindway'] : 0;
        if ($remindway > 0) {//
            $remindtimetype = isset($_POST['remind']) ? $_POST['remind'] : ''; // 提醒类型
            list($leadtime, $unit_type) = explode('_', $_POST['uppertime']); // 提前提醒的时间；提前提醒时间单位
            $leadtime = $this->task->timeToMinute($unit_type, $leadtime); // 分钟数
        } else {//不提醒
            $remindtimetype =  0;
            $leadtime = 15;   //默认值为15分钟
            $leadtime = 0;
        }

        // 处理附件
        $fids = isset ($_POST['fids']) ? trim ($_POST['fids']) : "";
        $fidArr = $fids ? explode ( ',', $fids ) : array ();
        //重复提醒
        $repeat = isset($_POST['repeatnotice']) ? $_POST['repeatnotice'] : '';
        $repetition = 0;
        if($repeat){
            //重复时间间隔
            $repeatInterval = $_POST['rt_uppertime'];
            //重复时间单位
            $repeatUnit = $_POST['rt_unit'];
            $repetition = $this->task->timeToMinute($repeatUnit, $repeatInterval);
        }
        /*********验证部分开始*/
        //标题验证
        if (empty ($title)) $this->throws('任务标题不能为空', $isajax);
        //如果不是尽快完成，那么验证开始必须小于结束时间
        $ancestorIds = '';
        $level = 1; //第几级任务，默认为1
        $taskId = 0;
        // 父级信息
        if($parent_task_id){
            $parentTask = $this->task->getTaskNodeInfo(array('a.ancestorids', 'a.level', 'a.taskid', 'a.starttime', 'a.expectendtime'),$parent_task_id, $takefile);
            // 层级
            $ancestorIds = empty($parentTask['ancestorids']) ? '|'. $parent_task_id .'|' : $parentTask['ancestorids']. $parent_task_id .'|';
            // 级别
            $level = $parentTask['level'] + 1;
            // 父级fids
            if($takefile && $parentTask['fileids']){
                $fidArr = array_merge($fidArr, $parentTask['fileids']);
            }
            // 父级所属任务目录
            $taskId = $parentTask['taskid'];
        }
        if (0 == $fastcomplete) { //如果不是尽快完成
            if ((strtotime($expectendtime) <= strtotime($starttime))) $this->throws("结束时间必须大于开始时间", $isajax);
            //如果有父级任务，那么判断开始结束时间在父任务的时间范围内
            if($parent_task_id){
                if(strtotime($starttime) < strtotime($parentTask['starttime']))$this->throws("开始时间必须大于上级任务开始时间", $isajax);
                if(strtotime($parentTask['expectendtime']) && strtotime($expectendtime) > strtotime($parentTask['expectendtime']))$this->throws("结束时间必须小于上级任务结束时间", $isajax);
            }
        }
        //验证重复提醒的时间设置是否正确
        if($repeat && (strtotime("+ $repetition minute", strtotime($starttime)) >= strtotime($expectendtime))) $this->throws("重复提醒时间输入错误", $isajax);
        $ishasfile = empty($fidArr) ? 0 : 1;
        /*********************/
        // 处理知会人，参与人，负责人
        $userArr = array();
        $employeeid = isset($_POST['manageuser_value']) ? $_POST['manageuser_value'] : array(); // 负责人ID
        if(count($employeeid) > 1) $this->throws("负责人只可为一人", $isajax);
        $employeeid = !empty($employeeid) && is_array($employeeid) ? $employeeid[0] : $this->employeeId;
        $employeeid = empty($employeeid) ? $this->employeeId : $employeeid;
        $userArr['1'] = array($employeeid);
        $userArr['2'] = isset($_POST['joinuser_value']) ? array_unique($_POST['joinuser_value']) : array (); // 参与人IDArr
        $userArr['3'] = isset($_POST['noticeuser_value']) ? array_unique($_POST['noticeuser_value']) : array (); // 知会人IDArr
        $userArr['2'] = array_diff($userArr['2'], array($this->employeeId, $employeeid)); //排除创建人，负责人
        $userArr['3'] = array_diff($userArr['3'], $userArr['2'], array($this->employeeId, $employeeid)); //排除创建人，负责人，参与人
        // 入库 任务表
        $data = array('spaceid' => $this->spaceId, 'creatorid' => $this->employeeId, 'title' => $title, 'content' => $content, 'details' => $content,
            'isimportant' => $isimportant, 'starttime' => $starttime, 'expectendtime' => $expectendtime,'status' => $isDraft, 'isleaf' => 0,
            'remindtimetype' => $remindtimetype, 'remindway' => $remindway, 'leadtime' => $leadtime, 'repetition' => $repetition, 'clienttype' => 0,
            'ishasfile' => $ishasfile, 'parentid' => $parent_task_id, 'ancestorids' => $ancestorIds, 'level' => $level, 'employeeid' => $employeeid);
        if($tid){
            $taskNodeId = $this->task->updateTask($data, $userArr, $fidArr, $tid, $isDraft);
        }else{
            $taskNodeId = $this->task->addTask($data, $userArr, $fidArr, $taskId, $isDraft);
        }
        $this->load->model('common_model', 'common');
        $this->common->_ajaxRs(true, array('taskNodeId' => $taskNodeId));
        exit;
    }

    /**
     * 接受或拒绝任务
     */
    public function response(){
        parse_str($_SERVER['QUERY_STRING'], $_GET);
        $tid = isset($_GET['tid']) ? intval($_GET['tid']) : 0 ;//任务ID
        $accept = isset($_GET['accept']) ? intval($_GET['accept']) : 1 ;//接受或拒绝
        $reason = empty($_GET['content']) ? '' : addslashes($_GET['content']);
        $this->load->model('common_model', 'common');
        if ($accept != 1 && $accept != 2) {
            $accept = 0;
        }
        if(!$tid || !$accept){
            $this->common->_ajaxRs(false, array(), '操作参数异常', 'error');
        }else {
            // 更新通知状态
            $this->load->model('notice_model', 'notice');
            $this->notice->readNoticeByTemplate($this->config->item('nt_task_invite', 'notice_handel_config'), $tid, $this->employeeId);
            //判断任务是否存在
            $this->load->model('task_model', 'task');
            $taskInfo = $this->task->getTaskNodeInfo(array('a.id', 'a.creatorid'), $tid, 0);
            if (empty($taskInfo) || !is_array($taskInfo)) {
                $this->common->_ajaxRs('false', array(), '任务信息不存在', 'error');
            }
            if ($accept == 1) {
                $template = $this->config->item('nt_task_accept', 'notice_config');
                $op = '接收了任务';
                $content = '';
            } else {
                $template = $this->config->item('nt_task_refuse', 'notice_config');
                $op = '拒绝了任务，拒绝理由：';
                $content = empty($reason) ? '无' : $reason;
            }
            // 写日志
            $result = $this->task->updateTaskParticipation($this->employeeId, $tid, $accept, array('employeeId' => $this->employeeId, 'createTime' => date('Y-m-d H:i:s'), 'op' => $op, 'content' => $content));
            if ($result) {
                //给创建人发送通知
                $this->notice->addNotice($this->spaceId, $this->employeeId, $tid, $this->config->item('object_type_task', 'base_config'),
                    $template, $taskInfo['creatorid'], 1);
                $this->common->_ajaxRs(1, array(), '', 'success');
            } else {
                $this->common->_ajaxRs(0, array(), '操作失败，请稍后再试', 'success');
            }
            exit;
        }
    }

    /**
     * 提交任务
     */
    public function submit(){
        parse_str($_SERVER['QUERY_STRING'], $_GET);
        $tid = isset($_GET['tid']) ? intval($_GET['tid']) : 0;
        $content = isset($_GET['content']) ? $_GET['content'] : '';
        $this->load->model('common_model', 'common');
        if ($tid == 0) {
            $this->common->_ajaxRs(false, array (), '参数错误');
            exit;
        }

        $this->load->model('task_model', 'task');
        $taskInfo = $this->task->getTaskNodeInfo(array('a.id', 'a.employeeid', 'a.creatorid', 'a.log'), $tid, 0);
        if (empty($taskInfo) || !is_array($taskInfo)) {
            $this->common->_ajaxRs('false', array(), '任务信息不存在', 'error');
        }
        // 只负责人可以提交任务
        if($this->employeeId == $taskInfo['employeeid']){
            $status = 5;
        }else{
            $this->common->_ajaxRs('false', array(), '您无提交权限', 'error');
        }
        if($this->employeeId == $taskInfo['creatorid']){
            $status = 1;
        }
        $createTime = date('Y-m-d H:i:s');
        $log = empty($taskInfo['log']) ? '' : unserialize($taskInfo['log']);
        $newLog = array('employeeId' => $this->employeeId, 'createTime' => $createTime, 'op' => '提交了任务', 'content' => $content);
        $log = is_array($taskInfo['log']) ? array_merge($log, $newLog) : $newLog;
        $this->task->submitTaskNode($tid, array('status' => $status, 'create' => $createTime, 'log' => serialize($log)));
        // 发通知（创建人与负责人不是同一个人时）
        if($this->employeeId <> $taskInfo['creatorid']){
            $this->load->model('notice_model', 'notice');
            $this->notice->addNotice($this->spaceId, $this->employeeId, $tid, $this->config->item('object_type_task', 'base_config'),
                $this->config->item('nt_task_post', 'notice_handel_config'), $taskInfo['creatorid'], 1);
        }
        $this->common->_ajaxRs(1, array(), '', 'success');
        exit;
    }

    /**
     * 删除任务
     */
    public function del(){
        parse_str($_SERVER['QUERY_STRING'], $_GET);
        $tid = isset($_GET['tid']) ? intval($_GET['tid']) : 0;
        $this->load->model('common_model', 'common');
        if ($tid == 0) {
            $this->common->_ajaxRs(false, array (), '参数错误');
            exit;
        }
        $this->load->model('task_model', 'task');
        $taskInfo = $this->task->getTaskNodeInfo(array('a.id', 'a.employeeid', 'a.creatorid', 'a.log'), $tid, 0);
        if (empty($taskInfo) || !is_array($taskInfo)) {
            $this->common->_ajaxRs('false', array(), '任务信息不存在', 'error');
        }
        // 只创建人可以删除任务
        if($this->employeeId == $taskInfo['creatorid']){
            $status = 3;
        }else{
            $this->common->_ajaxRs('false', array(), '您无提交权限', 'error');
        }
        $this->task->closeOrOpenTaskNode($tid, $status, $taskInfo['creatorid'], $this->spaceId, $taskInfo['log']);
        $this->common->_ajaxRs(1, array(), '', 'success');
        exit;
    }

    /**
     * 关闭任务
     */
    public function close(){
        parse_str($_SERVER['QUERY_STRING'], $_GET);
        $tid = isset($_GET['tid']) ? intval($_GET['tid']) : 0;
        $status = isset($_GET['status']) ? intval($_GET['status']) : 0;
        $this->load->model('common_model', 'common');
        if ($tid == 0) {
            $this->common->_ajaxRs(false, array (), '参数错误');
            exit;
        }
        $this->load->model('task_model', 'task');
        $taskInfo = $this->task->getTaskNodeInfo(array('a.id', 'a.employeeid', 'a.creatorid', 'a.log'), $tid, 0);
        if (empty($taskInfo) || !is_array($taskInfo)) {
            $this->common->_ajaxRs('false', array(), '任务信息不存在', 'error');
        }
        // 只创建人可以关闭任务
        if($this->employeeId != $taskInfo['creatorid']){
            $this->common->_ajaxRs('false', array(), '您无权限', 'error');
        }
        // 更新状态并发送通知
        $createTime = date('Y-m-d H:i:s');
        $op = $status == 6 ? '关闭了任务' : '开启了任务';
        $log = empty($taskInfo['log']) ? '' : unserialize($taskInfo['log']);
        $newLog = array('employeeId' => $this->employeeId, 'createTime' => $createTime, 'op' => $op);
        $log = is_array($taskInfo['log']) ? array_merge($log, $newLog) : $newLog;
        $this->task->closeOrOpenTaskNode($tid, $status, $taskInfo['creatorid'], $this->spaceId, serialize($log));
        $this->common->_ajaxRs(1, array(), '', 'success');
        exit;
    }

    /**
     * 审核任务结点
     */
    public function approval(){
        parse_str($_SERVER['QUERY_STRING'], $_GET);
        $tid = isset($_GET['tid']) ? intval($_GET['tid']) : 0;
        $status = isset($_GET['status']) ? intval($_GET['status']) : 1;
        $content = isset($_GET['content']) ? $_GET['content'] : '';
        $this->load->model('common_model', 'common');
        if ($tid == 0 || $status == 0) {
            $this->common->_ajaxRs(false, array (), '参数错误');
            exit;
        }
        $this->load->model('task_model', 'task');
        $taskInfo = $this->task->getTaskNodeInfo(array('a.id', 'a.employeeid', 'a.creatorid', 'a.log'), $tid, 0);
        if (empty($taskInfo) || !is_array($taskInfo)) {
            $this->common->_ajaxRs('false', array(), '任务信息不存在', 'error');
        }
        // 只创建人可以审批任务
        if($this->employeeId != $taskInfo['creatorid']){
            $this->common->_ajaxRs('false', array(), '您无审核权限', 'error');
        }
        if($status == 1){
            $op = '审核通过了任务';
            $statusP = 5;
            $template = $this->config->item('nt_task_pass', 'notice_config');
        }else{
            $status = 0;
            $op = '审核没有通过，改进建议：';
            $content = empty($content) ? '无' : $content;
            $statusP = 4;
            $template = $this->config->item('nt_task_reject', 'notice_config');
        }
        $createTime = date('Y-m-d H:i:s');
        $log = empty($taskInfo['log']) ? '' : unserialize($taskInfo['log']);
        $newLog = array('employeeId' => $this->employeeId, 'createTime' => $createTime, 'op' => $op, 'content' => $content);
        $log = is_array($taskInfo['log']) ? array_merge($log, $newLog) : $newLog;
        // 更新任务状态与日志
        $data = array('status' => $status, 'log' => serialize($log));
        if($status == 0) $data['realendtime'] = 0;
        $this->task->updateTaskTable(array('id' => $tid), $data , 'tb_task_nodes');
        // 更新负责人状态与日志
        $dataP = array('status' => $statusP, 'log' => serialize($log));
        $this->task->updateTaskTable(array('tasknodeid' => $tid, 'employeeid' => $taskInfo['employeeid']), $dataP , 'tb_task_participation');

        $this->load->model('notice_model', 'notice');
        // 更新通知为已读
        $this->notice->readNoticeByTemplate($this->config->item('nt_task_post', 'notice_handel_config'), $tid, $this->employeeId);
        // 发通知（创建人与负责人不是同一个人时）
        if($this->employeeId != $taskInfo['employeeid']){
            $this->notice->addNotice($this->spaceId, $this->employeeId, $tid, $this->config->item('object_type_task', 'base_config'),
                $template, $taskInfo['employeeid'], 1);
        }
        $this->common->_ajaxRs(1, array(), '', 'success');
        exit;
    }

    public function throws($msg, $type = 1) {
        $this->load->model('common_model', 'common');
        if (0 == $type) {
            $this->common->_redirect($_SERVER['HTTP_REFERER'], $msg);
        } else {
            $this->common->_ajaxRs(false, array (), $msg);
        }
    }

}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */