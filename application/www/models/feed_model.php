<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Yuanjinga
 * Date: 13-4-15
 * Time: 下午13:03
 * To change this template use File | Settings | File Templates.
 */

class Feed_model extends  CI_Model{

    private $_objectMapping = array();
    private $_feedData = array();
    private $_feedFold = array();

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
        );
        // 需要折叠的动态
        $this->_feedFold = array(
            $this->config->item('ft_files_add', 'feed_config'),
            $this->config->item('ft_files_edit', 'feed_config'),
            $this->config->item('ft_files_down', 'feed_config'),
            $this->config->item('ft_files_follow', 'feed_config'),
            $this->config->item('ft_files_share', 'feed_config'),
            $this->config->item('ft_group_create', 'feed_config'),
            $this->config->item('ft_group_join', 'feed_config'),
            $this->config->item('ft_space_join', 'feed_config'),
            $this->config->item('ft_speech_like', 'feed_config'),
            $this->config->item('ft_speech_favor', 'feed_config'),
        );
    }

    /**
     * 添加动态
     * @author yuanjinga
     * @param $spaceId
     * @param $creatorId
     * @param $targetId
     * @param $module
     * @param $template
     * @param $groupId
     * @param array $privacy array(
     *                  array('objectid' => '必须，整型 对象id  （人员 部门或群组ID）', 'objecttype' => '非必须，整型 对象类型  (1 成员  2部门 3群组 )'),
     *                  array('objectid' => '必须，整型 对象id  （人员 部门或群组ID）', 'objecttype' => '非必须，整型 对象类型  (1 成员  2部门 3群组 )')
     *              )
     * @return int
     */
    public function addFeed($spaceId, $creatorId, $targetId, $module, $template, $groupId, $isprivate = 0, $privacy = array()){
        $createTime = date('Y-m-d H:i:s');
        $data = array('spaceid' => $spaceId, 'creatorid' => $creatorId, 'targetid' => $targetId, 'module' => $module,
                'template' => $template, 'groupid' => $groupId, 'isprivate' => $isprivate,
                'createtime' => $createTime, 'updatetime' => $createTime);
        $sql = $this->db->insert_string('tb_feed', $data);
        $feedId = 0;
        if($this->db->query($sql)){
            $feedId = $this->db->insert_id();
            if($privacy){
                foreach($privacy as $k => $v){
                    if(intval($v['objectid']) <= 0) continue;
                    $objecttype = isset($v['objecttype']) ? intval($v['objecttype']) : 1;
                    $data = array('feedid' => $feedId, 'targetid' => $targetId, 'module' => $module,
                        'objectid' => intval($v['objectid']), 'objecttype' => $objecttype);
                    $tmpSql = $this->db->insert_string('tb_feed_privacy', $data);
                    $this->db->query($tmpSql);
                }
            }
        }
        return $feedId;
    }

    /** 删除 动态
     * @param $feedid 动态的ID
     * add by lisheng 2013-04-25
     */
    public function deleteFeed($feedid)
    {
        $this->db->query('delete from tb_feed where id=?',array($feedid));
        return $this->db->affected_rows();
    }

    public function deleteFeedByTemplate($template, $targetId){
        $this->db->query('delete from tb_feed where template=? AND targetid=?',array($template, $targetId));
        return $this->db->affected_rows();
    }

    /** 置顶
     * @param $feedid 动态ID
     * add by lisheng 2013-04-25
     */
    public function setTop($feedid)
    {
        $this->db->query('update tb_feed set toptime = NOW() where id =?',array($feedid));
        return $this->db->affected_rows();
    }

    /** 取消置顶
     * @param $feedid 动态ID
     * add by lisheng 2013-04-25
     */
    public function cancelTop($feedid)
    {
        $this->db->query('update tb_feed set toptime = "0000-00-00 00:00:00" where id =?',array($feedid));
        return $this->db->affected_rows();
    }


    /**
     * 获取用户私有动态ID集合
     * @author yuanjinga
     * @param $viewerId
     * @param $myGroupIds
     * @param $deptId
     * @param $feedId
     * @return array
     */
    public function getPrivateFeedId($viewerId, $myGroupIds, $deptId, $feedId){
        $privateSql = 'SELECT feedid FROM tb_feed_privacy WHERE ((objecttype=1 AND objectid='.$viewerId.')';
        if($deptId){
            $privateSql .= ' OR (objecttype=2 AND objectid='.$deptId.') ';
        }
        if($myGroupIds){
            $groupIdStr = implode(',', $myGroupIds);
            $privateSql .= 'OR (objecttype=3 AND objectid IN('.$groupIdStr.')) ';
        }
        $privateSql .= ')';
        if($feedId){
            $privateSql .= ' AND feedid < '.$feedId;
        }
        $rs = $this->db->query($privateSql);
        $privateFeed = $rs->result_array();
        $privateFeedId = array();
        foreach($privateFeed as $value){
            $privateFeedId[] = $value['feedid'];
        }
        return $privateFeedId;
    }

    /**
     * 获取用户动态
     * @author yuanjinga
     * @param $spaceId
     * @param $employeeId
     * @param $viewerId
     * @param int $feedId
     * @param int $limit
     */
    public function getFeedListByEmployee($spaceId, $employeeId, $viewerId, $employeeGroupIds = array(),
                                                $myGroupIds = array(), $deptId = 0, $feedId = 0, $limit = 10){
        $sql = 'SELECT * FROM tb_feed WHERE spaceid='.$spaceId.' AND creatorid='.$employeeId.' ';
        if($feedId){
            $sql .= ' AND id<'.$feedId;
        }
        // 查看他人动态时
        if($viewerId != $employeeId){
            $viewGroup = array_intersect($employeeGroupIds, $myGroupIds);
            if(empty($viewGroup)){ // 没有公共群组
                $sql .= ' AND groupid=0 AND isprivate=0 ';
            }else{
                $viewGroupStr = '0,'.implode(',', $viewGroup);
                $sql .= ' AND groupid IN('.$viewGroupStr.') AND isprivate=0 ';
            }
            // 获取我可以查看的私密动态集合
            $privateFeedId = $this->getPrivateFeedId($viewerId, $myGroupIds, $deptId, $feedId);
            // 组装SQL
            if($privateFeedId){
                $privateFeedIds = implode(',', $privateFeedId);
                $myPrivateSql = 'SELECT * FROM tb_feed WHERE spaceid='.$spaceId.' AND creatorid='.$employeeId.' AND isprivate=1 AND id IN ('.$privateFeedIds.') ORDER BY id DESC LIMIT '.$limit;
                $sql = 'SELECT * FROM (('.$sql.' ORDER BY id DESC LIMIT '.$limit.') UNION('.$myPrivateSql.')) a ';
            }
        }
        $sql .= ' ORDER BY id DESC LIMIT '.$limit;
//        echo $sql;
        $query = $this->db->query($sql, array($spaceId, $employeeId));
        $feeds = $query->result_array();
        return $this->trimFeed($feeds, $viewerId, $spaceId);
    }

    /**
     * 获取全部动态：所有公开动态(查看者的动态 + 查看者所在群组的动态) + 可见的私有动态()
     * @author yuanjinga
     * @param $spaceId
     * @param $viewerId
     * @param int $feedId
     * @param int $limit
     * @return array
     */
    public function getFeedListByAll($spaceId, $viewerId, $myGroupIds = array(), $deptId = 0, $attEmployeeId = array(), $feedId = 0, $limit = 10){
        $publicSql = 'SELECT * FROM tb_feed WHERE spaceid='.$spaceId;
        if(empty($myGroupIds)){
            $publicSql .= empty($attEmployeeId) ? ' AND (groupid=0 OR creatorid='.$viewerId.') AND isprivate=0 ' : ' AND groupid=0 AND isprivate=0 ';
        }else{
            $groupIdStr = '0,' . implode(',', $myGroupIds);
            $publicSql .= empty($attEmployeeId) ? ' AND (groupid IN('.$groupIdStr.') OR creatorid='.$viewerId.') AND isprivate=0 ' : ' AND groupid IN('.$groupIdStr.') AND isprivate=0';
        }
        $creatorIdStr = '';
        if($attEmployeeId){
            $creatorIdStr = implode(',', $attEmployeeId);
            $publicSql .= ' AND creatorid IN('.$creatorIdStr.') ';
        }
        if($feedId){
            $publicSql .= ' AND id<'.$feedId;
        }
        $publicSql .= ' ORDER BY id DESC LIMIT '.$limit;

        // 获取我可以查看的私密动态集合
        $privateFeedId = $this->getPrivateFeedId($viewerId, $myGroupIds, $deptId, $feedId);
        // 组装SQL
        if($privateFeedId){
            $privateFeedIds = implode(',', $privateFeedId);
            $myPrivateSql = 'SELECT * FROM tb_feed WHERE spaceid='.$spaceId.' AND isprivate=1 AND id IN ('.$privateFeedIds.')';
            if($creatorIdStr){
                $myPrivateSql .= ' AND creatorid IN('.$creatorIdStr.')';
            }
            $myPrivateSql .= ' ORDER BY id DESC LIMIT '.$limit;
            $sql = 'SELECT * FROM (('.$publicSql.') UNION('.$myPrivateSql.')) a ORDER BY id DESC LIMIT '.$limit;
        }else{
            $sql = $publicSql;
        }
//        echo $sql;
        $query = $this->db->query($sql, array($spaceId));
        $feeds = $query->result_array();
        return $this->trimFeed($feeds, $viewerId, $spaceId);
    }

    /**
     * 获取喜欢或收藏的动态列表
     * @param $spaceId
     * @param $employeeId
     * @param int $Operation 1：喜欢；2：收藏
     * @param array $myGroupIds
     * @param int $viewerId
     * @param int $feedId
     * @param int $limit
     * @return array|string
     */
    public function getFeedListByOperation($spaceId, $employeeId, $viewerId, $Operation = 1, $myGroupIds = array(), $feedId = 0, $limit = 10){
        $publicSql = 'SELECT f.* FROM tb_feed f inner join tb_feed_user_operation o on f.id=o.feedid ';
        $publicSql .= ' WHERE f.spaceid='.$spaceId.' AND f.creatorid='.$employeeId.' AND o.operationtype='.$Operation;
        if($employeeId != $viewerId){
            if($myGroupIds){
                $groupIdStr = '0,' . implode(',', $myGroupIds);
                $publicSql .= ' AND f.groupid IN('.$groupIdStr.') ';
            }else{
                $publicSql .= ' AND f.isprivate=0 ';
            }
        }

        if($feedId){
            $publicSql .= ' AND f.id<'.$feedId;
        }
        $publicSql .= ' ORDER BY f.id DESC LIMIT '.$limit;
//        echo $publicSql;
        $query = $this->db->query($publicSql, array($spaceId));
        $feeds = $query->result_array();
        return $this->trimFeed($feeds, $viewerId, $spaceId);
    }


    /**
     * 根据模块获取动态：所有公开动态(查看者的动态 + 查看者所在群组的动态) + 可见的私有动态()
     * @author yuanjinga
     * @param $spaceId
     * @param $viewerId
     * @param int $feedId
     * @param int $limit
     * @return array
     */
    public function getFeedListByModel($spaceId, $viewerId, $model, $myGroupIds = array(),$deptId = 0, $feedId = 0, $limit = 10){
        $publicSql = 'SELECT * FROM tb_feed WHERE spaceid='.$spaceId .' AND module='.$model;
        if(empty($myGroupIds)){
            $publicSql .= ' AND (groupid=0 OR creatorid='.$viewerId.') AND isprivate=0 ';
        }else{
            $groupIdStr = '0,' . implode(',', $myGroupIds);
            $publicSql .= ' AND (groupid IN('.$groupIdStr.') OR creatorid='.$viewerId.') AND isprivate=0 ';
        }
        if($feedId){
            $publicSql .= ' AND id<'.$feedId;
        }
        $publicSql .= ' ORDER BY id DESC LIMIT '.$limit;

        // 获取我可以查看的私密动态集合
        $privateFeedId = $this->getPrivateFeedId($viewerId, $myGroupIds, $deptId, $feedId);
        // 组装SQL
        if($privateFeedId){
            $privateFeedIds = implode(',', $privateFeedId);
            $myPrivateSql = 'SELECT * FROM tb_feed WHERE spaceid='.$spaceId.' AND module='.$model.' AND isprivate=1 AND id IN ('.$privateFeedIds.')';
            $myPrivateSql .= ' ORDER BY id DESC LIMIT '.$limit;
            $sql = 'SELECT * FROM (('.$publicSql.') UNION('.$myPrivateSql.')) a ORDER BY id DESC LIMIT '.$limit;
        }else{
            $sql = $publicSql;
        }
//        echo $sql;
        $query = $this->db->query($sql, array($spaceId));
        $feeds = $query->result_array();
        return $this->trimFeed($feeds, $viewerId, $spaceId);
    }

    /**
     * 根据模块获取动态：所有公开动态(查看者的动态 + 查看者所在群组的动态) + 可见的私有动态()
     * @author yuanjinga
     * @param $spaceId
     * @param $viewerId
     * @param int $feedId
     * @param int $limit
     * @return array
     */
    public function getFeedListByModelAndGroup($spaceId, $viewerId, $model, $groupId, $deptId = 0, $feedId = 0, $limit = 10){
        $publicSql = 'SELECT * FROM tb_feed WHERE spaceid='.$spaceId .' AND module='.$model;
        $publicSql .= ' AND (groupid='.$groupId.') AND isprivate=0 ';
        if($feedId){
            $publicSql .= ' AND id<'.$feedId;
        }
        $publicSql .= ' ORDER BY id DESC LIMIT '.$limit;

        // 获取我可以查看的私密动态集合
        $privateFeedId = $this->getPrivateFeedId($viewerId, array($groupId), $deptId, $feedId);
        // 组装SQL
        if($privateFeedId){
            $privateFeedIds = implode(',', $privateFeedId);
            $myPrivateSql = 'SELECT * FROM tb_feed WHERE spaceid='.$spaceId.' AND module='.$model.' AND groupid='.$groupId.' AND isprivate=1 AND id IN ('.$privateFeedIds.')';
            $myPrivateSql .= ' ORDER BY id DESC LIMIT '.$limit;
            $sql = 'SELECT * FROM (('.$publicSql.') UNION('.$myPrivateSql.')) a ORDER BY id DESC LIMIT '.$limit;
        }else{
            $sql = $publicSql;
        }
//        echo $sql;
        $query = $this->db->query($sql, array($spaceId));
        $feeds = $query->result_array();
        return $this->trimFeed($feeds, $viewerId, $spaceId);
    }
    /**
     * 动态整理
     * @author yuanjinga
     * @date 2013-04-27
     * @param $feeds
     * @param $viewerId
     */
    public function trimFeed($feeds, $viewerId, $spaceId){
        $spaceInfo = QiaterCache::spaceInfo();
        $spaceName = $spaceInfo['name'];
        $objectIds = $creatorIds = $groupIds = array();
        foreach($feeds as $value){
            array_push($creatorIds, $value['creatorid']);
            array_push($groupIds, $value['groupid']);
            if(!isset($objectIds[$value['module']])){
                if($value['module'] == $this->config->item('object_type_speech', 'base_config')){
                    //if($value['template'] == $this->config->item('ft_speech_add', 'feed_config')){
                        $objectIds[$value['module']]['add'] = array();
                    //}else{
                        $objectIds[$value['module']]['other'] = array();
                    //}
                }else{
                    $objectIds[$value['module']] = array();
                }
            }
            if($value['module'] == $this->config->item('object_type_speech', 'base_config')){
                if($value['template'] == $this->config->item('ft_speech_add', 'feed_config')){
                    array_push($objectIds[$value['module']]['add'], $value['targetid']);
                }else{
                    array_push($objectIds[$value['module']]['other'], $value['targetid']);
                }
            }else{
                array_push($objectIds[$value['module']], $value['targetid']);
            }
        }
        // 获取用户姓名
        $this->load->model('employee_model', 'employee');
        $userInfo = $this->employee->getEmployeeMapping($creatorIds);
        // 获取群组信息
        $groupConfig = $this->config->item('object_type_group', 'base_config');
        $this->_feedData[$groupConfig][0] = array('id'=> 0, 'name' => $spaceName, 'ispub' => true);
        // 空间信息
        $this->_feedData[$this->config->item('object_type_qz', 'base_config')][$spaceInfo['id']] = array('id'=> $spaceInfo['id'], 'name' =>  $spaceName, 'ispub' => true);
        if($groupIds){
            $this->load->model('group_model', 'group');
            $groupInfos = $this->group->getGroupInfoByIds($groupIds);
            foreach($groupInfos as $v){
                $v['ispub'] = false;
                $this->_feedData[$groupConfig][$v['id']] = $v;
            }
        }
        //获取对应组件信息
        foreach($objectIds as $k => $v){
            if(!isset($this->_objectMapping[$k]))continue;
            $method = '_init_' . $this->_objectMapping[$k];
            call_user_func(array($this, $method), $v, $viewerId);
        }
        $feedList = array();
        foreach($feeds as $value){
            if($value['module'] == $this->config->item('object_type_speech', 'base_config')){
                if($value['template'] == $this->config->item('ft_speech_add', 'feed_config')){
                    if(!isset($this->_feedData[$value['module'].'_add'][$value['targetid']])) continue;
                    $feedData = $this->_feedData[$value['module'].'_add'][$value['targetid']];
                }else{
                    if(!isset($this->_feedData[$value['module'].'_other'][$value['targetid']])) continue;
                    $feedData = $this->_feedData[$value['module'].'_other'][$value['targetid']];
                }
            }else{
                if(!isset($this->_feedData[$value['module']][$value['targetid']])) continue;
                $feedData = $this->_feedData[$value['module']][$value['targetid']];
            }
            if(in_array($value['template'], $this->_feedFold)){ // 折叠动态
                if($value['template'] == $this->config->item('ft_space_join', 'feed_config')){
                    // 加入空间特殊处理
                    $key = $value['template'] . '_' . $value['targetid'];
                }else{
                    $key = $value['template'] . '_' . $value['creatorid'];
                }
                if(!isset($feedList[$key])){
                    $feed['spaceid'] = $value['spaceid'];
                    $feed['spacename'] = $spaceName;
                    $feed['module'] = $value['module'];
                    $feed['feedid'] = $value['id'];
                    $feed['template'] = $value['template'];
                    $feed['creatorid'] = $value['creatorid'];
                    $feed['creatorname'] = @$userInfo['name'][$value['creatorid']];
                    $feed['creatorimg'] = @$userInfo['imageurl'][$value['creatorid']];
                    $feedList[$key] = $feed;
                }
                if($value['template'] == $this->config->item('ft_space_join', 'feed_config')){
                    // 加入空间特殊处理
                    $listArr = array('id' => $value['creatorid'], 'name' => @$userInfo['name'][$value['creatorid']], 'imageurl' => @$userInfo['imageurl'][$value['creatorid']]);
                }else{
                    $feedData['feedid'] = $value['id'];
                    $feedData['createtime'] = $value['createtime'];
                    $feedData['groupid'] = $value['groupid'];
                    $feedData['groupname'] = $this->_feedData[$groupConfig][$value['groupid']]['name'];
                    $listArr = $feedData;//array_merge($feedData, array('feedid'=> $value['id'], 'createtime' => $value['createtime']));
                }
                $feedList[$key]['list'][] = $listArr;
            }else{
                $key = $value['template'] . '_' . $value['creatorid'] . '_' . $value['targetid'];
                $feed = $feedData;
                $feed['module'] = $value['module'];
                $feed['feedid'] = $value['id'];
                $feed['template'] = $value['template'];
                $feed['creatorname'] = @$userInfo['name'][$value['creatorid']];
                $feed['creatorimg'] = @$userInfo['imageurl'][$value['creatorid']];
                $feed['creatorid'] = $value['creatorid'];
                $feed['spacename'] = $spaceName;
                $feed['spaceid'] = $value['spaceid'];
                $feed['createtime'] = $value['createtime'];
                $feedList[$key] = $feed;
            }
        }
        return empty($feedList) ? 'nodata' : $feedList;
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
        if($ids['add'])
            $this->_feedData[$this->config->item('object_type_speech', 'base_config') . '_add'] = $this->speech->getSpeechList($ids['add']);
        if($ids['other'])
            $this->_feedData[$this->config->item('object_type_speech', 'base_config') . '_other'] = $this->speech->getLikeOrFavorList($ids['other']);
    }

    /**
     * 获取任务列表
     * @author yuanjinga
     * @param $ids
     * @param $employeeId
     */
    protected function _init_task($ids, $employeeId){
        if(empty($ids)) return;
        $this->load->model('task_model', 'task');
        $this->_feedData[$this->config->item('object_type_task', 'base_config')] = $this->task->getTaskNodeListByIds($ids, $employeeId);
    }

    /**
     * 获取文档列表
     * @author yuanjinga
     * @param $ids
     * @param $employeeId
     */
    protected function _init_files($ids, $employeeId){
        if(empty($ids)) return;
        $this->load->model('file_model', 'file');
        $ids = implode(',', $ids);
        $this->_feedData[$this->config->item('object_type_files', 'base_config')] = $this->file->getFeedFilesByIds($ids);
    }

    /**
     * 获取群组列表
     * @author yuanjinga
     * @param $ids
     * @param $employeeId
     */
    protected function _init_group($ids){
        if(empty($ids)) return;
        $this->load->model('group_model', 'group');
        $ids = implode(',', $ids);
        $this->_feedData[$this->config->item('object_type_group', 'base_config')] = $this->group->getGroupInfoByIds($ids, array('id', 'name', 'logourl'));
    }

    /**
     * 获取日程列表
     * @author yuanjinga
     * @param $ids
     * @param $employeeId
     */
    protected function _init_calendar($ids, $employeeId){
        if(empty($ids)) return;
        $object_type_calendar = $this->config->item('object_type_calendar', 'base_config');
        $this->load->model('calendar_model', 'calendar');
        $calendar = $this->calendar->getScheduleDetails($ids);
        // 获取回复数据
        $this->load->model('reply_model', 'reply');
        $replyNums = $this->reply->getReplyCountByIds($ids, $object_type_calendar);
        foreach($calendar as $k => $v){
            $v['reply']['num'] = isset($replyNums[$k]) ? intval($replyNums[$k]) : 0;
            $v['group'] = $this->_feedData[$this->config->item('object_type_group', 'base_config')][0];
            $calendar[$k] = $v;
        }
        $this->_feedData[$object_type_calendar] = $calendar;
    }

    /**
     * 根据对象ID和对象类型获取喜欢的人员列表
     * author ZhaiYanBin 2013-05-03
     * @param int $targetId 对象ID
     * @param int $module   对象类型
     */
    public function getLikeList($targetId = 0, $module = 0){
        $query = $this->db->query('SELECT EM.id,EM.name FROM tb_feed_user_operation AS FO INNER JOIN tb_employee AS EM ON FO.employeeid=EM.id WHERE FO.targetid=? AND FO.module=? AND FO.operationtype=1', array($targetId, $module));
        return $query->result_array();
    }

    /**
     * 根据对象ID和对象类型获取收藏的人员列表
     * author ZhaiYanBin 2013-05-03
     * @param int $targetId 对象ID
     * @param int $module   对象类型
     */
    public function getCollectList($targetId = 0, $module = 0){
        $query = $this->db->query('SELECT EM.id,EM.name FROM tb_feed_user_operation AS FO INNER JOIN tb_employee AS EM ON FO.employeeid=EM.id WHERE FO.targetid=? AND FO.module=? AND FO.operationtype=2', array($targetId, $module));
        return $query->result_array();
    }

}