<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * 日历模块;
 * @author qiutao <qiutao@chanjet.com>
 */
class Calendar extends CI_Controller {
    private $currentid;
    private $spaceInfo;
    private $object_type_schedule;

    public function __construct(){
        parent::__construct();

        // $this->load->library('session');
        $this->currentid = 47;// $this->session->userdata('employeeid');
        $this->spaceInfo = array('id'=>2, 'name'=>'畅捷通'); // $this->session->userdata('spaceInfo');
        $this->object_type_schedule = $this->config->item('object_type_schedule','base_config');
    }

    /**
     * 日历首页；
     */
    public function index(){
        $data = [];
        $user = ['avatar'=>'/uploads/85.jpg', 'name'=>'邱韬', 'id'=>$this->currentid];

        $data['user'] = $user;

        $this->load->model('calendaruser_model', 'calendaruser');
        $providerArr = $this->calendaruser->getProviders($this->currentid);
        $followedArr = [];
        $sharedArr = [];
        // 分离关注人和共享人列表;
        if(is_array($providerArr)){
            foreach($providerArr as $provider){
                $provider['avatar'] = '/uploads/85.jpg';
                switch((int)$provider['type']){
                    case 1:
                        $followedArr[] = $provider;
                        break;
                    case 2:
                        $sharedArr[] = $provider;
                        break;
                }
            }
        }
        $data['followedArr'] = $followedArr;
        $data['sharedArr'] = $sharedArr;

        $this->load->library('smarty');
        $this->smarty->view('employee/calendar/index.tpl',$data);
    }
    /**
     * 获取日历数据；
     */
    public function ajaxData(){
        $post = $_POST;

        // 外部参数
        $start_time = date('Y-m-d H:i:s', $post['start_time']);
        $end_time   = date('Y-m-d H:i:s', $post['end_time']);
        $employeeid  = empty($post['mid']) ? $this->currentid : (int)$post['mid'];
        // 类型 0或空 为本人日历，1为关注的日历，2为共享给我的日历
        $type = empty($post['type']) ? 0 : (int)$post['type'];

        $this->load->model('calendar_model', 'calendar');

        $scheduleArr = $this->calendar->getSchedules($start_time, $end_time, $employeeid, $this->currentid, $type);
        $calendarArr = $this->_buildUpCalendarData($scheduleArr);

        $this->load->model('common_model', 'common');
        $this->common->_ajaxRs(true, $calendarArr, null, 'calendar');
    }
    /**
     * 获取日历日程详情快照；
     */
    public function ajaxSnapshot(){
        $post = $_POST;
        $schedule_id = (int)$post['from_id'];

        $this->load->model('calendar_model', 'calendar');

        $detail = $this->calendar->getScheduleDetailById($schedule_id);

        if(is_array($detail) && count($detail)){
            $detail['isSelf'] = (int)$this->currentid===(int)$detail['schedule']['creatorid'] ? true : false;
            $detail['object_type'] = $this->object_type_schedule;

            $this->load->library('smarty');
            $this->smarty->view('employee/calendar/snapshot.tpl', $detail);
        } else {
            die('您所访问的日程不存在！');
        }
    }
    /**
     * 添加日程；
     */
    public function add(){
        $post = $_POST;

        $this->load->model('common_model', 'common');
        if(!($post['title'] && trim($post['title']))){
            $this->common->_ajaxRs(false, '', '日程标题不能为空！', 'calendar');
        }
        if(!($post['start_date']&&$post['start_time']&&$post['end_date']&&$post['end_time'])){
            $this->common->_ajaxRs(false, '', '日程日期不能为空！', 'calendar');
        }
        // 添加日程；
        $params = $this->_parseScheduleParams($post);
        $this->load->model('calendar_model', 'calendar');
        $scheduleid = $this->calendar->addSchedule($params);
        if(!$scheduleid){
            $this->common->_ajaxRs(false, '', '添加日程失败，请重新尝试！', 'calendar');
        }
        // 构建输出的日历信息；
        $scheduleArr[0] = $params;
        $scheduleArr[0]['id'] = $scheduleid;
        $calendarArr = $this->_buildUpCalendarData($scheduleArr);
        // 输出添加的日程信息；
        echo json_encode(['rs'=>true, 'data'=>$calendarArr, 'error'=>'', 'type'=>'calendar']);

        $params = [];
        $params['scheduleid'] = $scheduleid;
        $params['employeeid'] = $this->currentid;
        $params['role'] = 1;
        $params['status'] = 1;
        // 添加创建者；
        $schedule_users_id = $this->calendar->addScheduleUser($params);

        // 保存 参与人 与 知会人；
        if($schedule_users_id){
            $post['id'] = $scheduleid;
            $this->_updateScheduleUsers($post);
        }
    }
    /**
     * 修改日程；
     */
    public function modify(){
        $post = $_POST;

        $this->load->model('common_model', 'common');
        if(!($post['id'] && (int)$post['id'])){
            $this->common->_ajaxRs(false, '', '系统错误，无法找到更新日程！', 'calendar');
        }
        if(!($post['title'] && trim($post['title']))){
            $this->common->_ajaxRs(false, '', '日程标题不能为空！', 'calendar');
        }
        if(!($post['start_date']&&$post['start_time']&&$post['end_date']&&$post['end_time'])){
            $this->common->_ajaxRs(false, '', '日程日期不能为空！', 'calendar');
        }

        // 更新日程；
        $params = $this->_parseScheduleParams($post);// 获取可添加数据的参数;
        $scheduleArr[0] = $params; // 做一份拷贝，用于返回前台；
        // 这两个字段在更新时不需要修改；
        unset($params['createid']);
        unset($params['createtime']);

        $this->load->model('calendar_model', 'calendar');
        $where = ['id'=>(int)$post['id']];
        $affects = $this->calendar->updateSchedule($params, $where);
        // if(!$affects){
        //     $this->common->_ajaxRs(false, '', '更新日程失败，请重新尝试！', 'calendar');
        // }

        // 构建输出的日历信息；
        $scheduleArr[0]['id'] = $where['id'];
        $calendarArr = $this->_buildUpCalendarData($scheduleArr);
        // 输出添加的日程信息；
        echo json_encode(['rs'=>true, 'data'=>$calendarArr, 'error'=>'', 'type'=>'calendar']);

        // 保存 参与人 与 知会人；
        $this->_updateScheduleUsers($post, 1);
    }
    /**
     * 获取日程详细信息；
     * 返回json数据;
     */
    public function ajaxDetail(){
        $post = $_POST;

        $scheduleid = (int)$post['scheduleid'];
        $this->load->model('common_model', 'common');
        if(!$scheduleid){
            $this->common->_ajaxRs(false, '', '您所访问的日程不存在！', 'calendar');
        }
        $this->load->model('calendar_model', 'calendar');

        $detail = $this->calendar->getScheduleDetailById($scheduleid);
        if(is_array($detail) && count($detail)){
            $detail['isSelf'] = (int)$this->currentid===(int)$detail['schedule']['creatorid'] ? true :false;
            //$detail['object_type'] = $this->object_type_schedule;
            $detail['space'] = $this->spaceInfo;

            $this->load->model('reply_model', 'reply');
            $detail['reply'] = $this->reply->getReplyCount($this->spaceInfo['id'], $scheduleid, $this->object_type_schedule);

            $this->common->_ajaxRs(true, $detail, null, 'calendar');
        } else {
            $this->common->_ajaxRs(false, '', '您所访问的日程不存在！', 'calendar');
        }
    }
    /**
     * 获取显示到编辑页面的数据；
     */
    public function ajaxEdit(){
        $post = $_POST;
        $schedule_id = (int)$post['scheduleid'];

        $this->load->model('calendar_model', 'calendar');

        $detail = $this->calendar->getScheduleDetailById($schedule_id);

        $this->load->model('common_model', 'common');
        if(is_array($detail) && count($detail)){
            if((int)$this->currentid===(int)$detail['schedule']['creatorid']){
                $this->common->_ajaxRs(true, $detail, null, 'calendar');
            } else {
                $this->common->_ajaxRs(false, '', '此日程您没有编辑权限！', 'calendar');
            }
        } else {
            $this->common->_ajaxRs(false, '', '您所访问的日程不存在！', 'calendar');
        }
    }
    /**
     * 删除日程；
     */
    public function delete(){
        $post = $_POST;

        $delete_flag = 0;
        $schedule_id = $post['fromid'];
        if($schedule_id){
            $this->load->model('calendar_model', 'calendar');
            $delete_flag = $this->calendar->deleteScheduleById($schedule_id);
            if($delete_flag){
                $delete_flag = $this->calendar->deleteScheduleUsers($schedule_id);
            }
        }

        $this->load->model('common_model', 'common');
        if($delete_flag){
            $this->common->_ajaxRs(true, '删除成功！', null, 'calendar');
        } else {
            $this->common->_ajaxRs(false, '', '删除失败！', 'calendar');
        }
    }
    /**
     * 组装calendar使用的数据格式
     * @param $scheduleArr 日程数据
     * @param $currentid   当前用户id
     * @return array
     */
    protected function _buildUpCalendarData($scheduleArr){
        $ret = [];
        foreach($scheduleArr as $cid=>$schedule){
            $starttime = explode(' ', $schedule['starttime']);
            $endtime   = explode(' ', $schedule['endtime']);
            $isHour = $starttime[0]===$endtime[0] ? true : false;
            if($endtime[1]!=='00:00:00'){
                $enddate = strtotime($endtime[0])+86400;
            } else {
                $enddate = strtotime($endtime[0]);
            }
            $temp = [$cid,//编号，貌似无用
                $schedule['title'],//日程标题
                strtotime($starttime[0]),//开始日期
                $enddate,//结束日期
                $schedule['spaceid'],//空间id
                $schedule['creatorid'],//创建者id
                substr($starttime[1], 0, -3),//开始时刻
                substr($endtime[1], 0, -3),//结束时刻
                $schedule['id'],//日程id
                25,//类型
                strtotime($schedule['createtime']),//创建时间
                '',//feedid*
                '',//day*
                '',//持续天数*
                $isHour];//isHour 是否为时刻日程
            $ret[] = $temp;
        }

        return $ret;
    }
    /**
     * 根据传过来的post参数，解析成能直接插入数据库的参数；
     * @param $post
     * @return array
     */
    protected function _parseScheduleParams($post){
        $names_schedule = ['title', 'start_date', 'start_time', 'end_date', 'end_time',
            'address', 'content', 'important', 'noticetype', 'leadtime', 'leadtimetype', 'ishasfile'];
        $params = [];
        if(is_array($post)){
            foreach($names_schedule as $n){
                if(!isset($params[$n])){
                    $params[$n] = isset($post[$n]) ? $post[$n] : '';
                } else {
                    if(is_array($params[$n])){
                        $params[$n][] = isset($post[$n]) ? $post[$n] : '';
                    } else {
                        $params[$n] = [$params[$n], (isset($post[$n]) ? $post[$n] : '')];
                    }
                }
            }
        }
        $params['title'] = trim($params['title']);
        // 起止时间;
        $params['starttime'] = $params['start_date'].' '.$params['start_time'].':00';
        $params['endtime'] = $params['end_date'].' '.$params['end_time'].':00';
        unset($params['start_date']);
        unset($params['start_time']);
        unset($params['end_date']);
        unset($params['end_time']);
        // 重要程度
        $params['isimportant'] = $params['important'] ? 1 : 0;
        unset($params['important']);
        // 通知方式
        $params['remindway'] = $params['noticetype']
            ? (is_array($params['noticetype']) ? implode('',$params['noticetype']) :$params['noticetype'])
            : '';
        unset($params['noticetype']);
        // 提前通知时间
        $params['leadtime'] = (int)$params['leadtime'];
        if($params['remindway']){
            $multiple = $params['leadtimetype']==='2' ? 60 : 1;
            $params['leadtime'] = $params['leadtime']*$multiple;
        } else {
            $params['leadtime'] = 0;
        }
        unset($params['leadtimetype']);
        $params['ishasfile'] = 0;
        $params['creatorid'] = $this->currentid;//创建者id
        $params['createtime'] = date('Y-m-d H:m:s');//创建时间
        $params['fromtype'] = 0; //来源类型
        $params['clienttype'] = 0; // 动态产生来源
        $params['spaceid'] = $this->spaceInfo['id'];

        return $params;
    }
    /**
     * 更新日程用户表；
     * @param $post
     * @param int $act_type 0表示添加模式，1表示编辑修改模式
     */
    protected function _updateScheduleUsers($post, $act_type=0){
        $scheduleid = (int)$post['id'];
        $this->load->model('calendar_model', 'calendar');
        $partners  = [];
        $notifiers = [];
        // 编辑修改模式..
        if($act_type){
            $userArr = $this->calendar->getScheduleUsersById($scheduleid);
            if(is_array($userArr)){
                foreach($userArr as $user){
                    switch((int)$user['role']){
                        case 0://参与人
                            $partners[]  = $user['employeeid'];
                            break;
                        case 2://知会人
                            $notifiers[] = $user['employeeid'];
                            break;
                    }
                }
            }
        }
        $names_schedule_users = ['notice_partner_value', 'notice_notifier_value'];
        $params = ['scheduleid'=>$scheduleid];
        if(!is_array($post)){ return ;}
        foreach($names_schedule_users as $i=>$n){
            // $role 0为参与人 2为知会人
            $role = $i===0 ? 0 : ($i===1 ? 2 : false);
            if($role===false || !isset($post[$n]) || !is_array($post[$n])){ continue;}

            $uids = $role===0 ? $partners : $notifiers;
            foreach($post[$n] as $uid){
                if((int)$uid===$this->currentid){ continue;}
                $key = array_search($uid, $uids);
                if($key===false){
                    $params['employeeid'] = $uid;
                    $params['role'] = $role; // 0为参与人 2为知会人
                    $params['status'] = 0;// 处理状态：0 未处理 1 接收 2 拒绝
                    // 添加
                    $this->calendar->addScheduleUser($params);
                } else {
                    unset($uids[$key]);
                }
            }
            // 删除被剔除的
            if(count($uids)){
                foreach($uids as $uid){
                    $this->calendar->deleteScheduleUser($scheduleid, $uid);
                }
            }
        }
    }

}