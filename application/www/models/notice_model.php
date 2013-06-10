<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Yuanjinga
 * Date: 13-4-15
 * Time: 下午13:03
 * To change this template use File | Settings | File Templates.
 */

class Notice_model extends  CI_Model{
    private $_objectMapping = array();
    private $_noticeFold = array();
    private $_noticeData = array();

    public function __construct(){
        $this->load->database('default');
        // 组件与方法对应关系
        $this->_objectMapping = array(
            $this->config->item('object_type_speech', 'base_config') => 'speech',
            $this->config->item('object_type_calendar', 'base_config') => 'calendar',
            $this->config->item('object_type_files', 'base_config') => 'files',
            $this->config->item('object_type_task', 'base_config') => 'task',
            $this->config->item('object_type_vote', 'base_config') => 'vote',
            $this->config->item('object_type_announce', 'base_config') => 'announce',
            $this->config->item('object_type_order', 'base_config') => 'order',
            $this->config->item('object_type_feed', 'base_config') => 'feed',
            $this->config->item('object_type_group', 'base_config') => 'group',
//            $this->config->item('object_type_reply', 'base_config') => 'reply',
        );
        // 需要折叠的通知
        $this->_noticeFold = array(
            $this->config->item('nt_employee_follow', 'notice_config'),
            $this->config->item('nt_reply_add', 'notice_config'),
            $this->config->item('nt_reply_quan', 'notice_config')
        );
    }

    /**
     * 添加通知
     */
    public function addNotice($spaceId, $authorId, $targetId, $module, $template, $objectId, $objectType, $content = ''){
        $createTime = date('Y-m-d H:i:s');
        $data = array('spaceid' => $spaceId, 'authorid' => $authorId, 'targetid' => $targetId, 'module' => $module,
            'template' => $template, 'objectid' => $objectId, 'objecttype' => $objectType,
            'createtime' => $createTime, 'content' => $content);
        $sql = $this->db->insert_string('tb_notice', $data);
        if($this->db->query($sql)){
            return $this->db->insert_id();
        }
        return 0;
    }

    /**
     * 根据通知ID将通知变为已读状态
     * @param $ids 通知ID
     * @param $employeeId 用户ID
     * @return bool
     */
    public function readNoticeById($ids, $employeeId){
        if(empty($ids) || empty($employeeId))
            return false;
        if(is_array($ids)){
            foreach($ids as $id){
                $data = array('noticeid' => $id, 'employeeid' => $employeeId);
                $sql = $this->db->_replace('tb_notice_reader', array_keys($data), $data);
                $this->db->query($sql);
            }
        }else{
            $data = array('noticeid' => $ids, 'employeeid' => $employeeId);
            $sql = $this->db->insert_string('tb_notice_reader', array_keys($data), $data);
            $this->db->query($sql);
        }
        return true;
    }

    /**
     * 根据模板更新通知已读状态
     * @param $template
     * @param $targetId
     * @param $employeeId
     */
    public function readNoticeByTemplate($template, $targetId, $employeeId, $objectType = 1){
        $sql = 'SELECT id FROM tb_notice WHERE template=? AND targetid=? AND objectid=? AND objecttype=?';
        $query = $this->db->query($sql, array($template, $targetId, $employeeId, $objectType));
        $result = $query->result_array();
        $noticeIds = array();
        if($result){
            foreach($result as $row)
            array_push($noticeIds, $row['id']);
        }
        if($noticeIds){
            $this->readNoticeById($noticeIds, $employeeId);
        }
        return true;
    }

    /**
     * 根据不同的关注对象，整理关注类型的通知所需要的相关数据
     * @author ZhaiYanBin
     * @param int $employeeid   发起关注者ID
     * @param int $targetId     被关注对象ID
     * @param int $module       关注类型
     */
    public function makeUpFollowNoticeData($employeeId = 0, $targetId = 0, $module = 0){
        $this->load->helper('cache');
        $spaceId = QiaterCache::spaceid();//当前空间ID
        $noticeData = array(
            'spaceId' => $spaceId,
            'authorId' => $employeeId,
            'targetId' => $targetId,
            'module' => $module,
            'template' => 0,
            'objectId' => 0,//对象id（人员 部门或群组ID）
            'objectType' => 0,//对象类型(0 全员 1 成员  2部门 3群组 )
            'content' => ''
        );
        switch($module){
            //成员
            case $this->config->item('object_type_member', 'base_config'):
                $noticeData['objectId'] = $targetId;
                $noticeData['objectType'] = 1;//只发给被关注者
                $noticeData['template'] = $this->config->item('nt_employee_follow', 'notice_config');
                break;
            default:
                break;
        }
        return $this->addNotice($noticeData['spaceId'], $noticeData['authorId'], $noticeData['targetId'], $noticeData['module'], $noticeData['template'], $noticeData['objectId'], $noticeData['objectType'], $noticeData['content']);
    }

    /**
     * 获取通知列表
     * @author yuanjinga
     * @param $spaceId
     * @param $employeeId
     * @param $deptIds
     * @param $groupIds
     * @param int $module
     * @param int $isHandel
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function getNoticeList($spaceId, $employeeId, $deptIds, $groupIds, $module = 0, $isHandel=0, $limit = 10, $offset = 0){
        if($isHandel){
            $template = $this->config->item('notice_handel_config');
        }else{
            $template = $this->config->item('notice_config');
        }
        $sql = 'SELECT a.*,IF(b.noticeid, 0, 1) AS isnew FROM tb_notice AS a LEFT JOIN tb_notice_reader as b on a.id = b.noticeid and  b.employeeid ='.$employeeId;
        $sql .= ' WHERE a.spaceid='.$spaceId.' AND (a.objecttype=0 OR (a.objecttype=1 and a.objectid = '.$employeeId.') ';

        if($deptIds){
            $sql .= ' OR (a.objecttype=2 AND a.objectid IN('.implode(',', $deptIds).'))';
        }
        if($groupIds){
            $sql .= ' OR (a.objecttype=3 AND a.objectid IN('.implode(',', $groupIds).'))';
        }
        $sql .= ') ';
        if($module){
            $sql .= ' AND a.module='.$module;
        }
        if($template){
            $sql .= ' AND a.template IN('.implode(',', $template).') ';
        }
        $sql .= ' ORDER BY createtime DESC LIMIT '.$offset.','.$limit;
//        echo $sql;
        $rs = $this->db->query($sql);
        $data = $rs->result_array();
        return $this->trimNotice($data, $employeeId);
    }

    /**
     * 获取通知总数
     * @author yuanjinga
     * @param $spaceId
     * @param $employeeId
     * @param $deptIds
     * @param $groupIds
     * @param int $module
     * @param int $isHandel
     * @return mixed
     */
    public function getNoticeNum($spaceId, $employeeId, $deptIds, $groupIds, $module = 0, $isHandel=0){
        if($isHandel){
            $template = $this->config->item('notice_handel_config');
        }else{
            $template = $this->config->item('notice_config');
        }
        $sql = 'SELECT count(*) AS num FROM tb_notice AS a LEFT JOIN tb_notice_reader as b on a.id = b.noticeid and  b.employeeid ='.$employeeId;
        $sql .= ' WHERE a.spaceid='.$spaceId.' AND (a.objecttype=0 OR (a.objecttype=1 and a.objectid = '.$employeeId.') ';

        if($deptIds){
            $sql .= ' OR (a.objecttype=2 AND a.objectid IN('.implode(',', $deptIds).'))';
        }
        if($groupIds){
            $sql .= ' OR (a.objecttype=3 AND a.objectid IN('.implode(',', $groupIds).'))';
        }
        $sql .= ') ';
        if($module){
            $sql .= ' AND a.module='.$module;
        }
        if($template){
            $sql .= ' AND a.template IN('.implode(',', $template).') ';
        }
//        echo $sql;
        $rs = $this->db->query($sql);
        $data = $rs->row();
        return $data->num;
    }

    /**
     * 获取每个模块的通知数量
     * @author yuanjinga
     * @param $spaceId
     * @param $employeeId
     * @param $deptIds
     * @param $groupIds
     * @param int $isHandel
     * @param int $isNew
     * @return array
     */
    public function getNoticeNumByModule($spaceId, $employeeId, $deptIds, $groupIds, $isHandel = 0, $isNew = 0){
        if($isHandel){
            $template = $this->config->item('notice_handel_config');
            $sql = 'SELECT module,count(*) AS num ';
        }else{
            $template = $this->config->item('notice_config');
            $sql = 'SELECT IF(r.module,r.module,a.module) AS module, COUNT(*) num ';
        }
        $sql .= ' FROM tb_notice AS a LEFT JOIN tb_notice_reader as b on a.id = b.noticeid and  b.employeeid ='.$employeeId;
        if(empty($isHandel)){
            $sql .= ' LEFT JOIN tb_reply r ON a.module='.$this->config->item('object_type_reply', 'base_config').' AND a.targetid=r.id';
        }
        $sql .= ' WHERE a.spaceid='.$spaceId.' AND (a.objecttype=0 OR (a.objecttype=1 and a.objectid = '.$employeeId.') ';
        if($template){
            $sql .= ' AND a.template IN('.implode(',', $template).') ';
        }
        if($deptIds){
            $sql .= ' OR (a.objecttype=2 AND a.objectid IN('.implode(',', $deptIds).'))';
        }
        if($groupIds){
            $sql .= ' OR (a.objecttype=3 AND a.objectid IN('.implode(',', $groupIds).'))';
        }
        $sql .= ') ';
        if($isNew){
            $sql .= ' AND b.noticeid IS NULL ';
        }

        $sql .= ' GROUP BY module';
//        echo $sql;
        $rs = $this->db->query($sql);
        $data = $rs->result_array();
        $return = array();
        foreach($data as $v){
            $return[$v['module']] = $v['num'];
        }
        return $return;
    }

    public function trimNotice($notices, $employeeId){
        $spaceInfo = QiaterCache::spaceInfo();
        $spaceName = $spaceInfo['name'];
        $objectIds = $creatorIds = $noticeIds = array();
        foreach($notices as $value){
            array_push($creatorIds, $value['authorid']);
            if($value['isnew']){
                array_push($noticeIds, $value['id']);
            }
            if(!isset($objectIds[$value['module']])){
                $objectIds[$value['module']] = array();
            }
            array_push($objectIds[$value['module']], $value['targetid']);
        }
        // 获取用户姓名
        $creatorIds = array_unique($creatorIds);
        $userInfo = array();
        if($creatorIds){
            $this->load->model('employee_model', 'employee');
            $userInfo = $this->employee->getEmployeeMapping($creatorIds);
        }
        // 获取回复列表
        if(isset($objectIds[$this->config->item('object_type_reply', 'base_config')])){
            $this->_init_reply($objectIds[$this->config->item('object_type_reply', 'base_config')]);
            foreach($this->_noticeData[$this->config->item('object_type_reply', 'base_config')] as $value){
                if(!isset($objectIds[$value['module']])){
                    $objectIds[$value['module']] = array();
                }
                array_push($objectIds[$value['module']], $value['targetid']);
            }
        }

        // 获取群组信息
        $groupConfig = $this->config->item('object_type_group', 'base_config');
        $this->_noticeData[$groupConfig][0] = array('id'=> 0, 'name' => $spaceName, 'ispub' => true);
        //获取对应组件信息
        foreach($objectIds as $k => $v){
            if(!isset($this->_objectMapping[$k]))continue;
            $method = '_init_' . $this->_objectMapping[$k];
            call_user_func(array($this, $method), $v, $employeeId);
        }
        $noticeList = array();
        foreach($notices as $value){
            if($value['module'] != $this->config->item('object_type_member', 'base_config')){
                // 关注的通知特殊处理
                if(!isset($this->_noticeData[$value['module']][$value['targetid']])) continue;
            }

            if(in_array($value['template'], $this->_noticeFold)){ // 折叠通知
                if($value['module'] == $this->config->item('object_type_member', 'base_config')){ // 关注人通知
                    $key = $value['template'] . '_' . $value['targetid'];
                    $info = array('id' => $value['authorid'], 'name' => @$userInfo['name'][$value['authorid']], 'imageurl' => @$userInfo['imageurl'][$value['authorid']]);
                }else{
                    $info = $this->_noticeData[$value['module']][$value['targetid']];
                    $key = $value['template'] .'_'.$info['module']. '_' . $value['authorid'];
                    $notice['replyModule'] = $info['module'];
                    $notice['replyTargetid'] = $info['targetid'];
                    $notice['moduleTitle'] = $this->_noticeData[$info['module']][$info['targetid']]['title'];
                }
                if(!isset($noticeList[$key])){
                    $notice['spaceid'] = $value['spaceid'];
                    $notice['spacename'] = $spaceName;
                    $notice['module'] = $value['module'];
                    $notice['noticeid'] = $value['id'];
                    $notice['template'] = $value['template'];
                    $notice['authorid'] = $value['authorid'];
                    $notice['authorname'] = @$userInfo['name'][$value['authorid']];
                    $notice['authorimg'] = @$userInfo['imageurl'][$value['authorid']];
                    $notice['isnew'] = $value['isnew'];
                    $notice['createtime'] = $value['createtime'];
                    $noticeList[$key] = $notice;
                }
                $noticeList[$key]['list'][] = $info;
            }else{
                $key = $value['template'] . '_' . $value['objectid'] . '_' . $value['targetid'] .'_' . $value['id'];
                $notice = $this->_noticeData[$value['module']][$value['targetid']];
                $notice['module'] = $value['module'];
                $notice['noticeid'] = $value['id'];
                $notice['template'] = $value['template'];
                $notice['authorname'] = @$userInfo['name'][$value['authorid']];
                $notice['authorimg'] = @$userInfo['imageurl'][$value['authorid']];
                $notice['authorid'] = $value['authorid'];
                $notice['spacename'] = $spaceName;
                $notice['spaceid'] = $value['spaceid'];
                $notice['isnew'] = $value['isnew'];
                $notice['createtime'] = $value['createtime'];
                $noticeList[$key] = $notice;
            }
        }
        $noticeIds = array_unique($noticeIds);
        $data = array('noticeIds' => $noticeIds, 'noticeList' => empty($noticeList) ? 'nodata' : $noticeList);
        return $data;
    }

    protected function _init_task($ids, $employeeId){
        if(empty($ids)) return;
        $this->load->model('task_model', 'task');
        $this->_noticeData[$this->config->item('object_type_task', 'base_config')] = $this->task->getTaskNodeListByIds($ids, $employeeId);
    }

    protected function _init_files($ids, $employeeId){
        if(empty($ids)) return;
        $this->load->model('file_model', 'file');
        $ids = implode(',', $ids);
        $this->_noticeData[$this->config->item('object_type_files', 'base_config')] = $this->file->getFeedFilesByIds($ids);
    }

    protected function _init_group($ids, $employeeId){
        if(empty($ids)) return;
        $this->load->model('group_model', 'group');
        $groupInfos = $this->group->getGroupInfoByIds($ids);
        $groupConfig = $this->config->item('object_type_group', 'base_config');
        foreach($groupInfos as $k => $v){
            $v['ispub'] = false;
            $this->_noticeData[$groupConfig][$v['id']] = $v;
        }
    }

    /**
     * 获取回复列表
     * @author yuanjinga
     * @param $ids
     * @param $employeeId
     */
    protected function _init_reply($ids){
        if(empty($ids)) return;
        $this->load->model('reply_model', 'reply');
        $this->_noticeData[$this->config->item('object_type_reply', 'base_config')] = $this->reply->getReplyByIds($ids);
    }

    /**
     * 获取发言列表
     * @author yuanjinga
     * @param $ids
     * @param $employeeId
     */
    protected function _init_speech($ids, $employeeId){
        if(empty($ids)) return;
        $this->load->model('speech_model', 'speech');
        $this->_noticeData[$this->config->item('object_type_speech', 'base_config')] = $this->speech->getLikeOrFavorList($ids);
    }

    /*protected function _init_employee($ids, $employeeId){
        $this->load->model('employee_model', 'employee');
        $userInfos = $this->employee->getEmployeeMapping($ids);
        $employeeConfig = $this->config->item('object_type_member', 'base_config');
        foreach($userInfos['name'] as $k => $v){
            $info = array('id' => $k, 'name' => $v, 'imageurl' => $userInfos['imageurl'][$k]);
            $this->_noticeData[$employeeConfig][$k] = $info;
        }
    }*/

    protected function _init_announce($ids, $employeeId){
        return "";
    }

}