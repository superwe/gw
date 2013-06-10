<?php
/**
 * Class Calendar_model
 */
class Calendar_model extends CI_Model{
    public function __construct(){
        $this->load->database('default');
    }

    /**
     * 获取处理过的日程信息;
     * @param $id
     * @return array|mixed
     */
    public function getScheduleData($id){
        $schedule = $this->getScheduleById($id);

        if(is_array($schedule) && count($schedule)){
            $starttime = explode(' ', $schedule['starttime']);
            $endtime   = explode(' ', $schedule['endtime']);
            $schedule['allday'] = false;
            if($starttime[1]==='00:00:00'
                && $endtime[1]==='00:00:00'
                && (strtotime($endtime[0])-strtotime($starttime[0])===86400)){
                $schedule['allday'] = true;
            }
            $schedule['starttime'] = strtotime($schedule['starttime']);
            $schedule['endtime']   = strtotime($schedule['endtime']);
        }
        return $schedule;
    }
    /**
     * 根据日程id，获取日程详情；
     * @param $id
     * @return mixed
     */
    public function getScheduleById($scheduleid){
        $sql = 'SELECT s.id id, s.title title, s.address address, s.content content, s.starttime starttime, s.endtime endtime, '.
                      's.creatorid creatorid, s.createtime createtime, s.isimportant isimportant, s.remindway remindway, '.
                      's.leadtime leadtime, s.ishasfile ishasfile, s.fromtype fromtype, s.clienttype clienttype, e.name name '.
               'FROM tb_schedule s '.
                    'LEFT JOIN tb_employee e ON e.id=s.creatorid '.
               'WHERE s.id=?';
        $params = [(int)$scheduleid];

        $rs = $this->db->query($sql, $params);

        return $rs->row_array();
    }
    /**
     * 获取日程信息详情，包括 参与人 与 知会人 信息；
     * @param $id           日程id
     * @param $employeeid   请求用户id
     * @return array
     */
    public function getScheduleDetailById($scheduleid){
        $ret = [];
        $schedule_id = (int)$scheduleid;
        $schedule = $this->getScheduleData($schedule_id);

        if(is_array($schedule) && count($schedule)){
            $ret['schedule'] = $schedule;

            $userArr = $this->getScheduleUsersInfoById($schedule_id);
            $partners  = [];
            $notifiers = [];
            if(is_array($userArr)){
                foreach($userArr as $user){
                    switch((int)$user['role']){
                        case 0://参与人
                            $partners[]  = $user;
                            break;
                        case 2://知会人
                            $notifiers[] = $user;
                            break;
                    }
                }
            }
            $ret['partners']  = $partners;
            $ret['notifiers'] = $notifiers;

        }
        return $ret;
    }
    /**
     * 获取日程详情；（可能多条用于动态页面展示）
     * @param $scheduleid
     * @return array
     */
    public function getScheduleDetails($scheduleid){
        $ret = array();
        if(!is_array($scheduleid)){
            $scheduleid = [$scheduleid];
        }
        foreach($scheduleid as $id){
            $ret[$id] = $this->getScheduleDetailById($id);
        }

        return $ret;
    }
    /**
     * 获取展示的日历数据；
     * @param $start            起始时间
     * @param $end              结束时间
     * @param int $employeeid   请求用户id
     * @param $currentid        当前用户id
     * @param int $type         类型，表示跟当前用户的关系：0或空为本人，1为关注关系，2为共享关系；
     * @return array
     */
    public function getSchedules($start, $end, $employeeid=0, $currentid, $type=0){
        $employeeid = $employeeid ? $employeeid : $currentid; // 2
        $type = $type ? $type : 0;

        $sql = 'SELECT s.id id, s.spaceid spaceid, s.title title, s.starttime starttime, s.endtime endtime, s.creatorid creatorid, s.createtime createtime '.
               'FROM tb_schedule s '.
                    'INNER JOIN tb_schedule_users su ON s.id=su.scheduleid AND su.employeeid=? ';
        $params = [$employeeid];
        // $type = 1;
        if($type===1){
            $sql .= 'INNER JOIN tb_schedule_users su2 ON s.id=su2.scheduleid AND su2.employeeid=? ';
            array_push($params, $currentid);
        }
        $sql .= 'WHERE s.starttime<? AND s.endtime>? ';
        array_push($params, $end, $start);

        $rs = $this->db->query($sql, $params);

        $scheduleArr = $rs->result_array();

        return $scheduleArr;
    }
    /**
     * 添加日程;
     * @param $params
     * @return int
     */
    public function addSchedule($params){
        $scheduleid = 0;
        $sql_add_schedule = $this->db->insert_string('tb_schedule', $params);
        $rs = $this->db->query($sql_add_schedule);

        if($rs){
            $scheduleid = $this->db->insert_id();
        }

        return $scheduleid;
    }
    /**
     * 更新日程；
     * @param $params
     * @param $where
     * @return int
     */
    public function updateSchedule($params, $where){
        $ret = 0;

        $sql_update_sort = $this->db->update_string('tb_schedule', $params, $where);
        $rs = $this->db->query($sql_update_sort);
        if($rs){
            $ret = $this->db->affected_rows();
        }
        return $ret;
    }
    /**
     * 根据日程id，删除日程;
     * @param $schedule_id
     * @return int
     */
    public function deleteScheduleById($schedule_id){
        $sql = 'DELETE FROM tb_schedule WHERE id='.$schedule_id;

        $affected_rows = 0;
        $rs = $this->db->query($sql);
        if($rs){
            $affected_rows = $this->db->affected_rows();
        }

        return $affected_rows;
    }

    // ========== 日程用户相关 =============
    /**
     * 根据日程id获取跟日程相关的所有用户(包含用户信息，如用户名等..);
     * @param $scheduleid
     */
    public function getScheduleUsersInfoById($scheduleid){
        $sql = 'SELECT su.employeeid employeeid, su.role role, su.status status, e.name name '.
            'FROM tb_schedule_users su '.
            'LEFT JOIN tb_employee e ON e.id=su.employeeid '.
            'WHERE su.scheduleid=?';
        $params = [(int)$scheduleid];

        $rs = $this->db->query($sql, $params);

        return $rs->result_array();
    }
    /**
     * 根据日程id获取跟日程相关的所有用户(不包含用户信息);
     * @param $schedule_id
     * @return mixed
     */
    public function getScheduleUsersById($scheduleid){
        $sql = 'SELECT su.employeeid employeeid, su.role role, su.status status '.
            'FROM tb_schedule_users su '.
            'WHERE su.scheduleid=?';
        $params = [(int)$scheduleid];

        $rs = $this->db->query($sql, $params);

        return $rs->result_array();
    }
    /**
     * 添加日程中的人员;
     * @param $params
     * @return int
     */
    public function addScheduleUser($params){
        $schedule_users_id = 0;
        $sql_add_schedule_user = $this->db->insert_string('tb_schedule_users', $params);
        $rs = $this->db->query($sql_add_schedule_user);

        if($rs){
            $schedule_users_id = $this->db->insert_id();
        }

        return $schedule_users_id;
    }
    /**
     * 根据scheduleid和employeeid，限定删除某条日程用户信息;
     * @param $scheduleid 日程id
     * @param $employeeid 日程对应的用户id
     * @return int
     */
    public function deleteScheduleUser($scheduleid, $employeeid){
        $sql = 'DELETE FROM tb_schedule_users WHERE scheduleid='.$scheduleid.' AND employeeid='.$employeeid;

        $affected_rows = 0;
        $rs = $this->db->query($sql);
        if($rs){
            $affected_rows = $this->db->affected_rows();
        }

        return $affected_rows;
    }
    /**
     * 根据日程id，删除日程相关用户；
     * @param $scheduleid 日程id
     * @return int
     */
    public function deleteScheduleUsers($scheduleid){
        $sql = 'DELETE FROM tb_schedule_users WHERE scheduleid='.$scheduleid;

        $affected_rows = 0;
        $rs = $this->db->query($sql);
        if($rs){
            $affected_rows = $this->db->affected_rows();
        }

        return $affected_rows;
    }
}