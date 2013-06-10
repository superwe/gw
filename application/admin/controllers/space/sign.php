<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Sign extends CI_Controller {
    private $spaceId; //空间id
    private $employeeId;//人员ID

    public function __construct(){
        parent::__construct();

        $this->load->helper('cache');
        $this->spaceId = QiaterCache::spaceid();
        $this->employeeId = QiaterCache::employeeid();
    }

    public function index(){
        $this->load->library('smarty');
        $this->smarty->view('space/sign.tpl');
    }

    /**
     * 定时任务列表
     */
    public function taskList(){
        $data = array();
        $this->load->database('default');
        $sort = isset($_POST['sort']) ? $_POST['sort'] :'id';
        $order = isset($_POST['order']) ? $_POST['order'] : 'desc';
        if(isset($_POST['page'])&&isset($_POST['rows'])){//grid组件分页查询
            $page = $_POST['page'];
            $rows = $_POST['rows'];
            $query = $this->db->query('SELECT COUNT(id) AS total FROM tb_sign_task where spaceid=? AND status<2', array($this->spaceId));
            $data['total'] = $query->row()->total;
            $query->free_result();

            $query = $this->db->query('SELECT id,title,creatorid,starttime,signtime,timingsetting,cycletype,endtime,status FROM tb_sign_task WHERE spaceid=? AND status<2 ORDER BY '.$sort.' '. $order .' LIMIT ? OFFSET ?', array($this->spaceId, intval($rows), ($page-1)*$rows));
            $data['rows'] = $query->result_array();
        } else{
            //
        }
        foreach($data['rows'] as $k => $v){
            if($v['status'] == 0){
                $data['rows'][$k]['status'] = '停用';
            } else if( strtotime($v['endtime']) - time() < 0 ){
                $data['rows'][$k]['status'] = '过期';
            } else{
                $data['rows'][$k]['status'] = '正常';
            }
            if($data['rows'][$k]['signtime']){
                $data['rows'][$k]['signtime'] = @json_decode($data['rows'][$k]['signtime'], true);
                $data['rows'][$k]['signtime'] = is_array($data['rows'][$k]['signtime']) ? implode('、', $data['rows'][$k]['signtime']) : '';
            } else{
                $temp = @json_decode($data['rows'][$k]['timingsetting'], true);
                $data['rows'][$k]['signtime'] = "从{$temp['startTime']}到{$temp['endTime']}，每隔{$temp['interval']}分钟进行签到";
            }
            $data['rows'][$k]['cycle'] = '不重复';
            if($data['rows'][$k]['cycletype'] > 0){
                $temp = array();
                $week = array('1'=>'星期一','2'=>'星期二','3'=>'星期三','4'=>'星期四','5'=>'星期五','6'=>'星期六','7'=>'星期日');
                $tempArr = str_split($data['rows'][$k]['cycletype']);
                foreach($tempArr as $val){
                    $temp[] = $week[$val];
                }
                $data['rows'][$k]['cycle'] = implode('、', $temp);
            }
            //参与人、查看人
            $person = $this->getEmployeeName($v['id']);
            $data['rows'][$k]['joinPerson'] = implode('、', $person['joinPerson']);
            $data['rows'][$k]['viewPerson'] = implode('、', $person['viewPerson']);
        }
        //print_r($data);
        echo json_encode($data);
        exit();
    }

    /**
     * 获取定时任务信息
     */
    public function getTaskInfo(){
        $info = array();
        $this->input->post(NULL, TRUE);
        $id = isset($_POST['id']) ? $_POST['id'] : 0;

        $this->load->database('default');
        $query = $this->db->query('SELECT * FROM tb_sign_task WHERE id=?', array($id));
        $info = $query->row_array();
        if($info){
            $info['starttime'] = date('Y-m-d', strtotime($info['starttime']));
            $info['endtime'] = date('Y-m-d', strtotime($info['endtime']));
            if($info['cycletype'] > 0){
                $info['cycletype'] = json_encode( str_split($info['cycletype']) );
            }
            $person = $this->getEmployeeList($id);
            $info['joinPerson'] = $person['joinPerson'];
            $info['viewPerson'] = $person['viewPerson'];
            //print_r($info);
            echo json_encode($info);
        }
        exit();
    }

    /**
     * 删除定时任务
     */
    public function delete(){
        $result = '';
        $this->input->post(NULL, TRUE);
        $ids = isset($_POST['ids']) ? $_POST['ids'] : '';
        if($ids){
            $this->load->database('default');
            $result = $this->db->query('UPDATE tb_sign_task SET status=2 WHERE spaceid=' . $this->spaceId . ' AND id IN ('.$ids.')');
        }
        echo $result ? 0 : -1;
    }

    /**
     * 启用定时任务
     */
    public function open(){
        $result = '';
        $this->input->post(NULL, TRUE);
        $ids = isset($_POST['ids']) ? $_POST['ids'] : '';
        if($ids){
            $this->load->database('default');
            $result = $this->db->query('UPDATE tb_sign_task SET status=1 WHERE spaceid=' . $this->spaceId . ' AND id IN ('.$ids.')');
        }
        echo $result ? 0 : -1;
    }

    /**
     * 停用定时任务
     */
    public function stop(){
        $result = '';
        $this->input->post(NULL, TRUE);
        $ids = isset($_POST['ids']) ? $_POST['ids'] : '';
        if($ids){
            $this->load->database('default');
            $result = $this->db->query('UPDATE tb_sign_task SET status=0 WHERE spaceid=' . $this->spaceId . ' AND id IN ('.$ids.')');
        }
        echo $result ? 0 : -1;
    }

    /**
     * 保存定时任务信息
     */
    public function saveTaskInfo(){
        $this->input->post(NULL, TRUE);
        $this->load->database('default');
        //print_r($_POST);
        $tid = isset($_POST['tid']) ? intval($_POST['tid']) : 0;//定时任务ID
        if($tid){
            $this->load->database('default');
            $query = $this->db->query('SELECT id FROM tb_sign_task WHERE id=?', array($tid));
            $info = $query->row_array();
            if(! $info){
                $returnData = array('rs' => false, 'msg' => '不存在此定时任务');
                echo 0;
                exit();
            }
        }
        $data = array(
            'spaceid' => $this->spaceId,
            'creatorid' => $this->employeeId,
            'title' => isset($_POST['title']) ? trim($_POST['title']) : '',
            'status' => 1,
            'starttime' => isset($_POST['startDate']) ? trim($_POST['startDate']) : '',
            'isleaderenabled' => isset($_POST['isleaderenabled']) ? intval($_POST['isleaderenabled']) : 0,//上级领导可见
            'isautolocation' => isset($_POST['isautolocation']) ? intval($_POST['isautolocation']) : 0,//自动定位
            'createtime' => date('Y-m-d H:i:s', time())
        );
        if(!$data['title'] || !$data['starttime']){
            $returnData = array('rs' => false, 'msg' => '必填项不能为空');
            echo 0;
            exit();
        }
        $data['starttime'] = date('Y-m-d H:i:s', strtotime($data['starttime']));
        $_POST['taskType'] = isset($_POST['taskType']) ? intval($_POST['taskType']) : 0;//固定频率设置,0-否，1-是
        list($year, $month, $day) = explode('-', date('Y-m-d', strtotime($data['starttime'])) );
        if($_POST['taskType'] == 1){//固定频率类型
            $setting['startTime'] = isset($_POST['startTime']) ? trim($_POST['startTime']) : '';
            $setting['endTime'] = isset($_POST['endTime']) ? trim($_POST['endTime']) : '';
            $setting['interval'] = 15;
            list($hour, $minute) = explode(':', $setting['startTime']);
            $startTime = mktime($hour, $minute, 0);
            if(!$startTime){
                $returnData = array('rs' => false, 'msg' => '起始时间格式不正确');
                echo 0;
                exit();
            }
            list($hour, $minute) = explode(':', $setting['endTime']);
            $endTime = mktime($hour, $minute, 0);
            if(!$endTime){
                $returnData = array('rs' => false, 'msg' => '结束时间格式不正确');
                echo 0;
                exit();
            }
            if($endTime - $startTime < 0){
                $returnData = array('rs' => false, 'msg' => '结束时间不能晚于开始时间');
                echo 0;
                exit();
            }
            if( isset($_POST['interval']) && intval($_POST['interval']) > 15 ){ //间隔周期
                $setting['interval'] = intval($_POST['interval']);
            }

            $maxTime = mktime($hour, $minute, 0);
            $data['signtime'] = '';
            $data['timingsetting'] = json_encode($setting);
        } else{//时间点类型签到
            $maxTime = 0;
            $signTime = isset($_POST['signTime']) ? $_POST['signTime'] : array();
            empty($signTime) ? $returnData = array('rs' => false, 'msg' => '请填写签到时间') : '';
            foreach($signTime as $key => $value){
                list($hour, $minute) = explode(':', $value);
                $returnTime = mktime($hour, $minute, 0, $month, $day, $year);
                if( !$returnTime ){ //去掉不正确格式的时间
                    unset($signTime[$key]);
                } else{ //找到最大的时间
                    $signTime[$key] = date('G:i', $returnTime);
                    $returnTime > $maxTime ? $maxTime = $returnTime : '';
                }
            }
            $data['timingsetting'] = '';
            $data['signtime'] = json_encode(array_unique($signTime));
        }
        $_POST['isRepeat'] = isset($_POST['isRepeat']) ? intval($_POST['isRepeat']) : 0;
        if($_POST['isRepeat'] == 1){
            $data['endtime'] = isset($_POST['endDate']) ? trim($_POST['endDate']) : '';
            list($year, $month, $day) = explode('-', $data['endtime']);
        }
        $data['endtime'] = date('Y-m-d H:i:s', mktime(date('G', $maxTime), date('i', $maxTime), 0, $month, $day, $year) );
        $data['cycletype'] = isset($_POST['repeat']) ? array_map('intval', $_POST['repeat']) : array();
        $data['cycletype'] = $data['cycletype'] ? implode('', $data['cycletype']) : 0;
        if($tid <= 0){ //新增
            $query = $this->db->query('INSERT INTO tb_sign_task (spaceid,title,creatorid,starttime,signtime,timingsetting,cycletype,endtime,status,isleaderenabled,isautolocation,createtime) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',array($data['spaceid'], $data['title'], $data['creatorid'], $data['starttime'], $data['signtime'], $data['timingsetting'], $data['cycletype'], $data['endtime'], $data['status'], $data['isleaderenabled'], $data['isautolocation'], $data['createtime']));
            $tid = $this->db->insert_id();
        } else{ //更新
            $this->db->query('UPDATE tb_sign_task SET spaceid=?,title=?,creatorid=?,starttime=?,signtime=?,timingsetting=?,cycletype=?,endtime=?,status=?,isleaderenabled=?,isautolocation=? WHERE id=?', array($data['spaceid'], $data['title'], $data['creatorid'], $data['starttime'], $data['signtime'], $data['timingsetting'], $data['cycletype'], $data['endtime'], $data['status'], $data['isleaderenabled'], $data['isautolocation'], $tid));
        }
        //$tid = 3;
        //参与人、查看人
        if($tid){
            $noticeData = array(
                'spaceId' => $this->spaceId,
                'authorId' => $this->employeeId,
                'targetId' => $tid,
                'module' => $this->config->item('object_type_sign','base_config'),
                'template' => 0,
                'objectId' => 0,//对象id（人员 部门或群组ID）
                'objectType' => 1,//对象类型(0 全员 1 成员  2部门 3群组 )
                'content' => ''
            );
            $userList = $this->getEmployeeIds($tid);
            //参与人
            $joinPerson = isset($_POST['joinPersonUl_value']) ? array_map('intval', $_POST['joinPersonUl_value']) : array();
            $result = array_diff($userList['joinPerson'], $joinPerson);//取出要删除的有参与权限的用户
            foreach($result as $k => $v){
                $this->delTaskUser($tid, $v, 1);
                $noticeData['objectId'] = $v;
                $noticeData['content'] = '取消签到';
                $noticeData['template'] = $this->config->item('nt_sign_cancel_join','notice_config');
                $this->addNotice($noticeData['spaceId'], $noticeData['authorId'], $noticeData['targetId'], $noticeData['module'], $noticeData['template'], $noticeData['objectId'], $noticeData['objectType'], $noticeData['content']);
            }
            $result = array_diff($joinPerson, $userList['joinPerson']);//取出要新增的有参与权限的用户
            foreach($result as $k => $v){
                $this->addTaskSignUser($tid, $v, 1);
                $noticeData['objectId'] = $v;
                $noticeData['content'] = '进行签到';
                $noticeData['template'] = $this->config->item('nt_sign_join','notice_config');
                $this->addNotice($noticeData['spaceId'], $noticeData['authorId'], $noticeData['targetId'], $noticeData['module'], $noticeData['template'], $noticeData['objectId'], $noticeData['objectType'], $noticeData['content']);
            }
            //查看人
            $viewPerson = isset($_POST['viewPersonUl_value']) ? array_map('intval', $_POST['viewPersonUl_value']) : array();
            $result = array_diff($userList['viewPerson'], $viewPerson);//取出要删除的有查看权限的用户
            foreach($result as $k => $v){
                $this->delTaskUser($tid, $v, 2);
                $noticeData['objectId'] = $v;
                $noticeData['content'] = '取消查看签到';
                $noticeData['template'] = $this->config->item('nt_sign_cancel_view','notice_config');
                $this->addNotice($noticeData['spaceId'], $noticeData['authorId'], $noticeData['targetId'], $noticeData['module'], $noticeData['template'], $noticeData['objectId'], $noticeData['objectType'], $noticeData['content']);
            }
            $result = array_diff($viewPerson, $userList['viewPerson']);//取出要新增的有参与权限的用户
            foreach($result as $k => $v){
                $this->addTaskSignUser($tid, $v, 2);
                $noticeData['objectId'] = $v;
                $noticeData['content'] = '查看签到';
                $noticeData['template'] = $this->config->item('nt_sign_view','notice_config');
                $this->addNotice($noticeData['spaceId'], $noticeData['authorId'], $noticeData['targetId'], $noticeData['module'], $noticeData['template'], $noticeData['objectId'], $noticeData['objectType'], $noticeData['content']);
            }
        }
        $returnData = array('rs' => true, 'msg' => '操作已完成');
        echo 1;
        exit();
    }

    /**
     * 获取某个定时任务的参与人ID
     * @param int $tid  定时任务ID
     */
    public function getEmployeeIds($tid = 0){
        $temp = array();
        $list = array('joinPerson' => array(), 'viewPerson' => array());
        $this->load->database('default');
        $query = $this->db->query('SELECT employeeid,usertype FROM tb_sign_user WHERE signtaskid=?', array($tid));
        $temp = $query->result_array();
        foreach($temp as $k => $v){
            if($v['usertype'] == 1){
                $list['joinPerson'][] = $v['employeeid'];
            } else{
                $list['viewPerson'][] = $v['employeeid'];
            }
        }
        return $list;
    }

    /**
     * 获取某个定时任务的参与人姓名
     * @param int $tid  定时任务ID
     */
    public function getEmployeeName($tid = 0){
        $temp = array();
        $list = array('joinPerson' => array(), 'viewPerson' => array());
        $this->load->database('default');
        $query = $this->db->query('SELECT EM.`name`,SU.usertype FROM tb_sign_user AS SU INNER JOIN tb_employee AS EM ON SU.employeeid=EM.id WHERE SU.signtaskid=?', array($tid));
        $temp = $query->result_array();
        foreach($temp as $k => $v){
            if($v['usertype'] == 1){
                $list['joinPerson'][] = $v['name'];
            } else{
                $list['viewPerson'][] = $v['name'];
            }
        }
        return $list;
    }

    /**
     * 获取某个定时任务的参与人列表
     * @param int $tid  定时任务ID
     */
    public function getEmployeeList($tid = 0){
        $temp = array();
        $list = array('joinPerson' => array(), 'viewPerson' => array());
        $this->load->database('default');
        $query = $this->db->query('SELECT EM.id,EM.`name`,SU.usertype FROM tb_sign_user AS SU INNER JOIN tb_employee AS EM ON SU.employeeid=EM.id WHERE SU.signtaskid=?', array($tid));
        $temp = $query->result_array();
        foreach($temp as $k => $v){
            if($v['usertype'] == 1){
                $list['joinPerson'][] = array('id'=>$v['id'], 'name'=>$v['name']);
            } else{
                $list['viewPerson'][] = array('id'=>$v['id'], 'name'=>$v['name']);
            }
        }
        return $list;
    }

    /**
     * 删除定时任务用户
     * @param int $tid          定时任务ID
     * @param int $employeeId   用户ID
     * @param int $userType     1-参与人，2-查看人
     */
    public function delTaskUser($tid = 0, $employeeId = 0, $userType = 0){
        $this->load->database('default');
        $this->db->query('DELETE FROM tb_sign_user WHERE signtaskid=? AND employeeid=? AND usertype=?', array($tid, $employeeId, $userType));
    }

    /**
     * 新增定时任务用户
     * @param int $tid          定时任务ID
     * @param int $employeeId   用户ID
     * @param int $userType     1-参与人，2-查看人
     */
    public function addTaskSignUser($tid = 0, $employeeId = 0, $userType = 0){
        $this->load->database('default');
        $this->db->query('INSERT INTO tb_sign_user (spaceid,signtaskid,employeeid,usertype) VALUES (?,?,?,?)', array($this->spaceId,$tid, $employeeId, $userType));
    }

    /**
     * 添加通知
     */
    public function addNotice($spaceId, $authorId, $targetId, $module, $template, $objectId, $objectType, $content = ''){
        $this->load->database('default');
        $data = array(
            'spaceid' => $spaceId,
            'authorid' => $authorId,
            'targetid' => $targetId,
            'module' => $module,
            'template' => $template,
            'objectid' => $objectId,
            'objecttype' => $objectType,
            'createtime' => date('Y-m-d H:i:s'),
            'content' => $content
        );
        $sql = $this->db->insert_string('tb_notice', $data);
        return $this->db->query($sql) ? $this->db->insert_id() : 0;
    }

}
