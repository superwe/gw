<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Yuanjinga
 * Date: 13-4-15
 * Time: 下午7:16
 * To change this template use File | Settings | File Templates.
 */

class Task_model extends CI_Model{
    private $roleArr;
    public function __construct(){
        $this->load->database('default');
        $this->roleArr = array('1' => 'manage', '2' => 'join', '3' => 'notice');
    }

    /**
     * 添加任务
     * @param $data
     * @param $userArr
     * @param $fileIdArr
     * @param int $taskId
     * @return int
     */
    public function addTask($data, $userArr, $fileIdArr, $taskId = 0, $isDraft = 0){
        $createTime = date('Y-m-d H:i:s');
        $object_type_task = $this->config->item('object_type_task', 'base_config');
        $taskCol = array('spaceid', 'creatorid', 'title', 'content', 'isimportant', 'starttime',
                    'expectendtime','status');
        $taskNodeCol = array('parentid', 'ancestorids', 'level', 'isleaf', 'title', 'employeeid',
                    'content', 'details', 'isimportant', 'remindtimetype', 'remindway', 'leadtime',
                    'repetition', 'ishasfile', 'status', 'starttime', 'expectendtime', 'creatorid',
                    'clienttype');
        $taskData = $taskNodeData = array();
        foreach($data as $k => $v){
            if(in_array($k, $taskCol)){
                $taskData[$k] = $v;
            }
            if(in_array($k, $taskNodeCol)){
                $taskNodeData[$k] = $v;
            }
        }
        $this->db->trans_begin();
        if(empty($taskId)){
            // 保存任务目录
            $taskData['createtime'] = $createTime;
            $sqlTask = $this->db->insert_string('tb_task', $taskData);
            $this->db->query($sqlTask);
            if ($this->db->trans_status() == FALSE){
                $this->db->trans_rollback();
                return -1;
            }
            $taskId = $this->db->insert_id();
        }
        $taskNodeData['taskid'] = $taskId;
        // 保存任务
        $taskNodeData['createtime'] = $createTime;
        $taskNodeData['log'] = '';
        $sqlTaskNode = $this->db->insert_string('tb_task_nodes', $taskNodeData);
        $this->db->query($sqlTaskNode);
        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
            return -1;
        }
        $taskNodeId = $this->db->insert_id();

        // 保存附件
        foreach($fileIdArr as $k => $v){
            $tmpData = array('refid' => $taskNodeId, 'reftype' => $object_type_task, 'resourceid' => $v);
            $tmpSql = $this->db->insert_string('tb_resource_ref', $tmpData);
            $this->db->query($tmpSql);
            $tmpSql = '';
            if ($this->db->trans_status() == FALSE){
                $this->db->trans_rollback();
                return -1;
            }
        }
        /*$userCreate = array_unique(array($data['creatorid'], $data['employeeid']));
        // 保存关注关系:创建人
        foreach($userCreate as $employeeId){
            /* 关注暂时不需要
             $tmpData = array('employeeid' => $employeeId, 'followid' => $taskNodeId, 'followtype' => $object_type_task,
                'createtime' => $createTime);
            $tmpSql = $this->db->insert_string('tb_followed', $tmpData);
            $this->db->query($tmpSql);
            $tmpSql = '';
            if ($this->db->trans_status() == FALSE){
                $this->db->trans_rollback();
                return -1;
            }
        }*/
        // 保存人员：负责人，参与人与知会人
        //$userArr['1'] = array($data['employeeid']);
        $privacy = array();
        foreach($userArr as $k => $v){
            foreach($v as $employeeId){
                if(empty($employeeId)) continue;
                if(($employeeId == $data['creatorid'])){
                    $userStatus = 1;
                }else{
                    $userStatus = 0;
                }
                $privacy[] = array('objectid' => $employeeId);
                $tmpData = array('tasknodeid' => $taskNodeId, 'employeeid' => $employeeId, 'role' => $k, 'status' => $userStatus,
                    'starttime' => $data['starttime'], 'expectendtime' => $data['expectendtime'], 'log' => '');
                $tmpSql = $this->db->insert_string('tb_task_participation', $tmpData);
                $this->db->query($tmpSql);
                $tmpSql = '';
                if ($this->db->trans_status() == FALSE){
                    $this->db->trans_rollback();
                    return -1;
                }
                if($employeeId == $data['creatorid']) continue;
                // 保存关注关系:参与人，知会人【暂时不用】
               /* $tmpData = array('employeeid' => $employeeId, 'followid' => $taskNodeId, 'followtype' => $object_type_task,
                    'createtime' => $createTime);
                $tmpSql = $this->db->insert_string('tb_followed', $tmpData);
                $this->db->query($tmpSql);
                $tmpSql = '';
                if ($this->db->trans_status() == FALSE){
                    $this->db->trans_rollback();
                    return -1;
                }*/
                // 非草稿则发通知
                if($isDraft != 2){
                    $template = $k == 3 ? $this->config->item('nt_task_inform', 'notice_config') : $this->config->item('nt_task_invite', 'notice_handel_config');
                    $tmpData = array('targetid' => $taskNodeId, 'module' => $object_type_task, 'objectid' => $employeeId,
                        'objecttype' => 1, 'template' => $template, 'spaceid' => $data['spaceid'], 'authorid' => $data['creatorid'],
                        'content' => '', 'createtime' => $createTime);
                    $tmpSql = $this->db->insert_string('tb_notice', $tmpData);
                    $this->db->query($tmpSql);
                    $tmpSql = '';
                    if ($this->db->trans_status() == FALSE){
                        $this->db->trans_rollback();
                        return -1;
                    }
                }
            }
        }
        $this->db->trans_commit();
        if($isDraft == 2){
            return $taskNodeId;
        }
        // 添加索引
        $this->load->model('Indexes_model', 'indexes');
        $type = 'task';
        $indexData = array('id' => $taskNodeId, 'spaceid' => $data['spaceid'], 'employeeid' => $data['creatorid'], 'url' => 'employee/task/info?tid='.$taskNodeId, 'date' => $createTime, 'title' => $data['title'], 'content' => $data['content']);
        $this->indexes->create($type, $indexData);

        // 添加动态
        $this->load->model('feed_model', 'feed');
        $this->feed->addFeed($data['spaceid'], $data['creatorid'], $taskNodeId, $object_type_task, $this->config->item('ft_task_add', 'feed_config'), 0, 1, $privacy);
        return $taskNodeId;
    }

    /**
     * 更新任务
     */
    public function updateTask($data, $userArr, $fileIdArr, $taskNodeId, $isDraft = 0){
        $createTime = date('Y-m-d H:i:s');
        $object_type_task = $this->config->item('object_type_task', 'base_config');
        $taskCol = array('spaceid', 'creatorid', 'title', 'content', 'isimportant', 'starttime',
            'expectendtime','status');
        $taskNodeCol = array('parentid', 'ancestorids', 'level', 'isleaf', 'title', 'employeeid',
            'content', 'details', 'isimportant', 'remindtimetype', 'remindway', 'leadtime',
            'repetition', 'ishasfile', 'status', 'starttime', 'expectendtime', 'creatorid',
            'clienttype');
        $taskData = $taskNodeData = array();
        foreach($data as $k => $v){
            if(in_array($k, $taskCol)){
                $taskData[$k] = $v;
            }
            if(in_array($k, $taskNodeCol)){
                $taskNodeData[$k] = $v;
            }
        }
        // 获取任务节点信息
        $taskNodeInfo = $this->getTaskOneInfo($data['creatorid'], $taskNodeId);
        $taskNodeInfo = $taskNodeInfo[$taskNodeId];
        $this->db->trans_begin();
        if($taskNodeInfo['parentid'] == 0 && $taskNodeInfo['taskid']){
            // 更新任务目录
            $sqlTask = $this->db->update_string('tb_task', $taskData, array('id' => $taskNodeInfo['taskid']));
            $this->db->query($sqlTask);
            if ($this->db->trans_status() == FALSE){
                $this->db->trans_rollback();
                return -1;
            }
        }
        // 更新任务
        $sqlTaskNode = $this->db->update_string('tb_task_nodes', $taskNodeData, array('id' => $taskNodeId));
        $this->db->query($sqlTaskNode);
        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
            return -1;
        }
        // 添加新附件:附件的删除在前台页面完成
        $fileIdArr = array_diff($fileIdArr, $taskNodeInfo['fileId']);
        if($fileIdArr){
            foreach($fileIdArr as $k => $v){
                $tmpData = array('refid' => $taskNodeId, 'reftype' => $object_type_task, 'resourceid' => $v);
                $tmpSql = $this->db->insert_string('tb_resource_ref', $tmpData);
                $this->db->query($tmpSql);
                $tmpSql = '';
                if ($this->db->trans_status() == FALSE){
                    $this->db->trans_rollback();
                    return -1;
                }
            }
        }

        // 更新人员：1：负责人，2：参与人，3：知会人
        foreach($userArr as $k => $v){
            // 删除修改后不存在的用户
            $role = $this->roleArr[$k];
            $taskNodeInfo['userId'][$role] = isset($taskNodeInfo['userId'][$role]) ? $taskNodeInfo['userId'][$role] : array();
            if($oldUser = array_diff($taskNodeInfo['userId'][$role], $v)){
                foreach($oldUser as $employeeId){
                    $this->db->query('DELETE FROM tb_task_participation WHERE tasknodeid=? AND employeeid=?', array($taskNodeId, $employeeId));
                }
            }
            // 添加新用户
            //$v = array_diff($v, $taskNodeInfo['userId'][$k]);
            if(empty($v)) continue;
            foreach($v as $employeeId){
                // 对新添加用户入数据库
                if(!in_array($employeeId, $taskNodeInfo['userId'][$role])){
                    if(empty($employeeId)) continue;
                    if(($employeeId == $data['creatorid'])){
                        $userStatus = 1;
                    }else{
                        $userStatus = 0;
                    }
                    $tmpData = array('tasknodeid' => $taskNodeId, 'employeeid' => $employeeId, 'role' => $k, 'status' => $userStatus,
                        'starttime' => $data['starttime'], 'expectendtime' => $data['expectendtime']);
                    $tmpSql = $this->db->insert_string('tb_task_participation', $tmpData);
                    $this->db->query($tmpSql);
                    $tmpSql = '';
                    if ($this->db->trans_status() == FALSE){
                        $this->db->trans_rollback();
                        return -1;
                    }
                }
                if($employeeId == $data['creatorid']) continue;
                // 非草稿则发通知
                if($isDraft != 2){
                    $template = $k == 3 ? $this->config->item('nt_task_inform', 'notice_config') : $this->config->item('nt_task_invite', 'notice_handel_config');
                    $tmpData = array('targetid' => $taskNodeId, 'module' => $object_type_task, 'objectid' => $employeeId,
                        'objecttype' => 1, 'template' => $template, 'spaceid' => $data['spaceid'], 'authorid' => $data['creatorid'],
                        'content' => '', 'createtime' => $createTime);
                    $tmpSql = $this->db->insert_string('tb_notice', $tmpData);
                    $this->db->query($tmpSql);
                    $tmpSql = '';
                    if ($this->db->trans_status() == FALSE){
                        $this->db->trans_rollback();
                        return -1;
                    }
                }
            }
        }
        $this->db->trans_commit();
        // 更新索引
        $this->load->model('indexes_model', 'indexes');
        $type = 'task';
        if($isDraft == 0){ // 如果不是草稿
            // 由草稿变为正常状态
            $indexData = array('id' => $taskNodeId, 'spaceid' => $data['spaceid'], 'employeeid' => $data['creatorid'], 'url' => 'employee/task/info?tid='.$taskNodeId, 'date' => $createTime, 'title' => $data['title'], 'content' => $data['content']);
            if($taskNodeInfo['status'] == 2){
                // 添加索引
                $this->indexes->create($type, $indexData);
                // 添加动态
                $this->load->model('feed_model', 'feed');
                $privacy = array();
                $this->feed->addFeed($data['spaceid'], $data['creatorid'], $taskNodeId, $object_type_task, $this->config->item('ft_task_add', 'feed_config'), 0, 1, $privacy);
            }else{
                // 修改索引
                $this->indexes->update($type, $indexData);
            }
        }
        return $taskNodeId;
    }

    /**
     * 获取任务信息
     * @param $taskId
     * @param int $isGetFile 是否获取附件信息
     * @return mixed
     */
    public function getTaskNodeInfo($col, $taskId, $isGetFile = 0){
        $col = implode(',', $col);
        $sql = 'SELECT '.$col.' FROM `tb_task_nodes` a LEFT JOIN tb_task_nodes b ON a.parentid=b.id WHERE a.id=?';
        $query = $this->db->query($sql, array($taskId));
        $taskInfo = $query->row(0, 'array');
        if($isGetFile){
            $this->load->model('resource_model', 'resource');
            $taskInfo['fileinfo'] = $this->resource->getResourceListByRef($this->config->item('object_type_task', 'base_config'), $taskInfo['id']);
            $fileIds = array();
            foreach($taskInfo['fileinfo'] as $value){
                $fileIds[] = $value['id'];
            }
            $taskInfo['fileids'] = $fileIds;
        }
        return $taskInfo;
    }

    /**
     * 获取任务信息
     * @param $employeeId
     * @param $taskNodeId
     */
    public function getTaskOneInfo($employeeId, $taskNodeId){
        $sql = 'SELECT tn.*,tnf.title parenttitle,e1.`name` creatorname,e1.imageurl,
            IF(tp.status IS NULL, 0, 1) tpstatus, tp.status tt
            FROM tb_task_nodes tn
            LEFT JOIN tb_task_nodes tnf ON tn.parentid=tnf.id
            LEFT JOIN tb_employee e1 ON tn.creatorid=e1.id
            LEFT JOIN tb_task_participation tp ON tn.id=tp.tasknodeid AND tp.status=0 AND tp.employeeid=' . $employeeId;
        $sql .= ' WHERE tn.id='.$taskNodeId;
//        echo $sql;
        $query = $this->db->query($sql);
        $tasks = $query->result_array();
//        print_r($tasks);
        return $this->trimTask($tasks, $employeeId);
    }

    /**
     * 根据任务ID获取任务列表
     * @param $ids
     * @param $employeeId
     */
    public function getTaskNodeListByIds($ids, $employeeId){
        $sql = 'SELECT tn.*,e1.`name` creatorname,e1.imageurl,IF(tp.status IS NULL, 0, 1) tpstatus, tp.status tt
            FROM tb_task_nodes tn
            LEFT JOIN tb_employee e1 ON tn.creatorid=e1.id
            LEFT JOIN tb_task_participation tp ON tn.id=tp.tasknodeid AND tp.status=0 AND tp.employeeid=' . $employeeId;
        $sql .= ' WHERE tn.id IN('.implode(',', $ids).')';
        $query = $this->db->query($sql);
//        echo $sql.'<br>';
        $tasks = $query->result_array();
        return $this->trimTask($tasks, $employeeId);
    }

    /**
     * 获取任务列表
     * @param $creatorId 创建人ID
     * @param $employeeId 负责人ID
     * @param $role 角色
     * @param int $status 状态
     */
    public function getTaskList($employeeId, $isCreator, $isEmployee, $role, $status = 0, $isHandle = 0, $curStatus = 0, $tid = 0, $limit = 10, $offset = 0){
        $sql = 'SELECT tn.*,e1.`name` creatorname,e1.imageurl, IF(tp.status IS NULL, 0, 1) tpstatus, tp.status tt
            FROM tb_task_nodes tn
            LEFT JOIN tb_employee e1 ON tn.creatorid=e1.id
            LEFT JOIN tb_task_participation tp ON tn.id=tp.tasknodeid AND tp.status=0 AND tp.employeeid=' . $employeeId;
        $where = '';
        $values = array();
        if($isCreator){
            $where .= (empty($where) ? ' ( ' : ' OR ') . ' tn.creatorid= ? ';
            $values[] = $employeeId;
        }
        if($isEmployee){
            $where .= (empty($where) ? ' ( ' : ' OR ') . ' tn.employeeid= ? ';
            $values[] = $employeeId;
        }
        if($role > 0){
            $where .= (empty($where) ? ' ( ' : ' OR ') . ' tn.id IN(SELECT tasknodeid FROM tb_task_participation WHERE employeeid=? AND role=?) ';
            $values[] = $employeeId;
            $values[] = $role;
        }elseif($role == 0){
            $where .= (empty($where) ? ' ( ' : ' OR ') . ' tn.id IN(SELECT tasknodeid FROM tb_task_participation WHERE employeeid=?) ';
            $values[] = $employeeId;
        }

        $where .= (empty($where) ? ' ' : ')') . ' AND tn.status NOT IN(3,4) ';
        if($status){ // 状态
            $where .= (empty($where) ? ' ' : ' AND ') . ' tn.status = ? ';
            $values[] = $status;
        }
        if($isHandle){ // 待处理
            $where .= (empty($where) ? ' ' : ' AND ') . ' tn.status IN(0,2)';
        }
        if($curStatus){
            if($curStatus == 2){ // 未开始
                $where .= (empty($where) ? ' ' : ' AND ') . ' tn.starttime>NOW() AND tn.status NOT IN(1,2,6) ';
            }
            if($curStatus == 3){ // 进行中 包括超期未完成的
                $where .= (empty($where) ? ' ' : ' AND ') . " tn.starttime<NOW() AND tn.realendtime='0000-00-00 00:00:00' AND tn.status NOT IN(1,2,6) ";
            }
            if($curStatus == 4){ // 超期
                $where .= (empty($where) ? ' ' : ' AND ') . " tn.expectendtime<NOW() AND tn.realendtime='0000-00-00 00:00:00' AND tn.status NOT IN(1,2,6) ";
            }
        }
        if($tid){
            $where .= (empty($where) ? ' ' : ' AND ') . ' tn.id<'.$tid;
        }
        $sql .= ' WHERE '. $where ." ORDER BY tpstatus DESC, id DESC LIMIT $offset, $limit";
//        echo $sql.'<br>';exit;
        $query = $this->db->query($sql, $values);
        $tasks = $query->result_array();
        return $this->trimTask($tasks, $employeeId);
    }

    /**
     * 整理任务
     * @param $tasks 任务列表数组
     * @param $employeeId 当前用户employeeId
     */
    protected function trimTask($tasks, $employeeId){
        $statusArr = array(1 => '完成', 6 => '关闭', 5 => '提交待审核');
        $taskNodeIds = $taskNodeParentIds = $taskList = array();
        foreach($tasks as $k => $v){
            $taskNodeIds[] = $v['id'];
            if($v['parentid']) array_push($taskNodeParentIds, $v['parentid']);
            $v['fileList'] = $v['imageList'] = array();
            $v['fileId'] = array();
            // 回复数量
            $v['replyNum'] = 0;
            // 操作按钮显示
            // 编辑与删除权限
            if($v['creatorid'] == $employeeId){
                $v['isedit'] = $v['isdel'] = 1;
            }
            if($v['status'] != 2){
                $v['isreply'] = 1;
                if($v['status'] != 1){ // 未完成的
                    if($v['status'] == 5){
                        if($v['creatorid'] == $employeeId)
                            $v['ispass'] = 1;
                    }else{
                        // 关闭任务权限
                        if($v['creatorid'] == $employeeId){
                            $v['isclose'] = 1;
                        }
                        // 分配任务权限
                        if(in_array($employeeId, array($v['creatorid'], $v['employeeid'])) && ($v['tpstatus'] == 0)){
                            $v['isassign'] = 1;
                        }
                        // 提交任务权限 只有负责人可提交任务，
                        if(($employeeId == $v['employeeid']) && ($v['tpstatus'] == 0)){
                            $v['issumit'] = 1;
                        }
                    }
                }
            }
            // 任务当前状态
            if(in_array($v['status'], array_keys($statusArr))){
                $v['tastStatus'] = $statusArr[$v['status']];
            }else{
                if(strtotime($v['starttime']) > time()){
                    $v['tastStatus'] = '未开始';
                }else{
                    if($v['realendtime'] == '0000-00-00 00:00:00'){
                        if(strtotime($v['expectendtime']) < time()){
                            $v['tastStatus'] = '超期';
                        }else{
                            $v['tastStatus'] = '进行中';
                        }
                    }else{
                        $v['tastStatus'] = '完成';
                    }
                }
            }
            $taskList[$v['id']] = $v;
        }
        // 获取任务结点相应信息
        if($taskNodeIds){
            // 参与人与知会人
            $userList = $this->getTaskNodeUser($taskNodeIds);
            foreach($userList as $k => $v){
                foreach($v as $key => $value){
                    $taskList[$k]['userList'][$this->roleArr[$key]] = $value;
                    $taskList[$k]['userId'][$this->roleArr[$key]] = array_keys($value);
                }
            }
            // 附件
            $fileSql = 'SELECT r.id,r.name,r.url,r.filetype,ref.refid FROM tb_resource_ref ref LEFT JOIN tb_resource r ON ref.resourceid = r.id
                        WHERE ref.reftype=? AND ref.refid IN('.implode(',', $taskNodeIds).')';
            $query = $this->db->query($fileSql, array($this->config->item('object_type_task', 'base_config')));
            $fileList = $query->result_array();
            $picType = array('jpg', 'jpeg', 'gif', 'png','bmp');
            foreach($fileList as $values){
                $resource_item = [];
                if(in_array($values['filetype'], $picType)){ //图片
                    $resource_item['view'] ='';
                    $resource_item['id'] =$values['id'];
                    $resource_item['filepath'] = $this->config->item('resource_url') . $values['url'];
                    array_push($taskList[$values['refid']]['imageList'], $resource_item);
                }else{
                    $resource_item['id'] =  $values['id'];
                    $resource_item['title'] = $values['name'] . '.' . $values['filetype'];
                    $resource_item['ext'] = $values['filetype'];
                    array_push($taskList[$values['refid']]['fileList'], $resource_item);
                }
                $taskList[$values['refid']]['fileId'][] = $values['id'];
            }
            // 回复数量
            $this->load->model('reply_model', 'reply');
            $replyNums = $this->reply->getReplyCountByIds($taskNodeIds, $this->config->item('object_type_task', 'base_config'));
            foreach($replyNums as $k => $v){
                $taskList[$k]['replyNum'] = $v;
            }
        }
        // 获取任务结点父结点名称
        if($taskNodeParentIds){
            $parentTitle = $this->getTaskNodeTitle($taskNodeParentIds);
            foreach($taskList as $k => $v){
                $taskList[$k]['parenttitle'] = @$parentTitle[$v['parentid']];
            }
        }
        return $taskList;
    }

    public function getTaskNodeTitle($taskNodeIds){
        if(is_array($taskNodeIds)){
            $taskNodeIds = implode(',', $taskNodeIds);
            $sql = 'SELECT id,title FROM tb_task_nodes WHERE id IN('.$taskNodeIds.')';
        }else{
            $sql = 'SELECT id,title FROM tb_task_nodes WHERE id='.$taskNodeIds;
        }
        $query = $this->db->query($sql);
        $list = $query->result_array();
        $titleList = array();
        foreach($list as $v){
            $titleList[$v['id']] = $v['title'];
        }
        return $titleList;
    }

    /**
     * 获取任务用户
     * @param $taskNodeIds
     * @return array
     */
    public function getTaskNodeUser($taskNodeIds){
        if(is_array($taskNodeIds)){
            $userSql = 'SELECT tp.tasknodeid,tp.role,tp.employeeid, e.name FROM tb_task_participation tp
            LEFT JOIN tb_employee e ON tp.employeeid=e.id
            WHERE tasknodeid IN('.implode(',', $taskNodeIds).')';
        }else{
            $userSql = 'SELECT tp.tasknodeid,tp.role,tp.employeeid, e.name FROM tb_task_participation tp
            LEFT JOIN tb_employee e ON tp.employeeid=e.id
            WHERE tasknodeid='.$taskNodeIds;
        }

        $query = $this->db->query($userSql);
        $list = $query->result_array();
        $userList = array();
        foreach($list as $k => $v){
            $userList[$v['tasknodeid']][$v['role']][$v['employeeid']] = $v['name'];
        }
        return $userList;
    }

    /**
     * 更新任务参与人与知会人的日志信息
     * @param $employeeId
     * @param $taskNodeId
     * @param $data
     * @return bool
     */
    public function updateTaskParticipation($employeeId, $taskNodeId, $status, $data){
        $sql = 'SELECT id,log FROM tb_task_participation WHERE tasknodeid=? AND employeeid=?';
        $query = $this->db->query($sql, array($taskNodeId, $employeeId));
        $logs = $query->row(0, 'array');
        if($logs['id']){
            $log = empty($logs['log']) ? array() : unserialize($logs['log']);
            array_push($log, $data);
            $newLog = serialize($log);
            $this->db->query('UPDATE tb_task_participation SET status=?,log=? WHERE id=?', array($status, $newLog, $logs['id']));
            return true;
        }
        return false;
    }

    /**
     * 提交任务
     * @param $taskNodeId
     * @param $data
     * @return bool
     */
    public function submitTaskNode($taskNodeId, $data){
        if($this->db->query('UPDATE tb_task_nodes SET status=?,realendtime=?,log=? WHERE id='.$taskNodeId, $data))
            return true;
        return false;
    }

    /**
     * 更新表数据
     * @param $whereArr
     * @param $data
     * @param string $table
     * @return bool
     */
    public function updateTaskTable($whereArr, $data, $table = 'tb_task_nodes'){
        $cols = $values = $where = array();
        foreach($whereArr as $k => $v){
            $where[] = $k .'='.$v;
        }
        foreach($data as $k => $v){
            $cols[] = $k .'=?';
            $values[] = $v;
        }
        if(!is_array($cols)) return false;
        $sql = 'UPDATE '.$table.' SET '.implode(',', $cols).' WHERE '. implode(' AND ', $where);
        if($this->db->query($sql, $values))
            return true;
        return false;
    }

    /**
     * 删除，关闭或开启任务结点状态
     * @param $taskNodeId
     * @param $status 状态
     * @param $creatorId 创建人ID
     * @param $employeeId 负责人ID
     * @return bool
     */
    public function closeOrOpenTaskNode($taskNodeId, $status, $creatorId, $spaceId, $log){
        if($this->db->query('UPDATE tb_task_nodes SET status=?,log=? WHERE id='.$taskNodeId, array($status, $log))){
            $users = $this->getTaskNodeUser($taskNodeId);
            $this->load->model('Indexes_model', 'indexes');
            if($status == 3){ // 删除
                $template = $this->config->item('nt_task_delete', 'notice_config');
                // 删除索引
                $this->indexes->deleteById('task', $taskNodeId);
                // 删除动态
                $this->load->model('feed_model', 'feed');
                $this->feed->deleteFeedByTemplate($this->config->item('ft_task_add', 'feed_config'), $taskNodeId);
            }elseif($status == 6){  // 关闭
                $template = $this->config->item('nt_task_close', 'notice_config');
                // 删除索引
                $this->indexes->deleteById('task', $taskNodeId);
            }elseif($status == 0){ // 开启
                $template = $this->config->item('nt_task_open', 'notice_config');
            }
            // 添加通知
            $createTime = date('Y-m-d H:i:s');
            foreach($users[$taskNodeId] as $k => $v){
                foreach($v as $key => $value){
                    if($key == $creatorId) continue;
                    $tmpData = array('targetid' => $taskNodeId, 'module' => $this->config->item('object_type_task', 'base_config'),
                        'objectid' => $key,
                        'objecttype' => 1, 'template' => $template, 'spaceid' => $spaceId, 'authorid' => $creatorId,
                        'content' => '', 'createtime' => $createTime);
                    $tmpSql = $this->db->insert_string('tb_notice', $tmpData);
                    $this->db->query($tmpSql);
                }
            }
            return true;
        }
        return false;
    }

    /**
     * 获得任务（尽快开始）的默认开始时间戳
     * @return int
     */
    public static function getDefaultTaskBeginTime(){
        $time = time();
        $minute = intval(date('i', $time));
        if($minute > 30){
            $time = strtotime('+1 hour', $time);
            $minute = "00";
        }else{
            $minute = "30";
        }
        return date("Y-m-d H:{$minute}:00", $time);
    }

    /**
     * 整理任务的日期时间为时间戳形式
     * @param string $date 日期字符窜
     * @param string $minute 小时分钟字符串
     * @return int|string
     */
    public static function formatTaskDateTime($date, $minute){
        if(empty($date))return '';
        return $date . ' ' . $minute .  ':00';
    }

    /**
     * 转换时间为分钟
     * @param $key 单位
     * @param string $uppertime 值
     * @return mixed
     */
    public static function timeToMinute($key, $uppertime){
        $mapping = array('minute'=>1, 'hour'=>60, 'day'=>24*60, 'week'=>24*60*7);
        return $uppertime * $mapping[$key];
    }


}