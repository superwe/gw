<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Hejinlong
 * Date: 13-4-12
 * Time: 下午5:03
 * To change this template use File | Settings | File Templates.
 */

class Group_model extends  CI_Model{

    public function __construct(){
        $this->load->database('default');
        $this->load->helper('cache');
    }

    /**
     * 获取群组信息
     * @param 	int	 	$groupId 		群组ID
     * @param	array	$fields 		字段数组 array('id', 'name')
     */
    public function getGroupInfo($groupId, $fields = array()){
    	if(empty($fields)){
    		return array();
    	}
    	$field = implode(',', $fields);
        $rs = $this->db->query( 'SELECT '.$field.' FROM tb_group WHERE id =? ', array($groupId));
        return $rs->row_array();
    }
    /**
     * 获取群组信息
     * @param 	array 	$groupIds		群组IDs
     * @param	array	$fields 		字段数组 array('id', 'name')
     */
    public function getGroupInfoByIds($groupIds, $fields = array('id', 'name', 'logourl')){
        if(empty($fields) || empty($groupIds)){
            return array();
        }
        $field = implode(',', $fields);
        $rs = $this->db->query( 'SELECT '.$field.' FROM tb_group WHERE id IN('.implode(',', $groupIds).') ');
        return $rs->result_array();
    }
    /**
     * 获取群组列表
     * @param int 		$spaceId 	空间ID
     * @param string	$letter		首字母	
     * @param int 		$limit 		获取数量
     * @param int 		$start 		偏移量
     */
    public function getGroupList($spaceId, $letter ='', $start = 0, $limit = 10){
    	$sql = 'SELECT id, logourl, name, description, messagenum, employeenum FROM tb_group WHERE spaceid = '.$spaceId.' AND status = 1';
    	if($letter){
    		$sql .= ' AND firstletter = "'.$letter.'"';
    	}
    	$sql .= ' ORDER BY createtime DESC LIMIT '.$start.' , '.$limit;
        $rs = $this->db->query($sql);
        return $rs->result_array();
    }
	/**
     * 获取群组列表总数
     * @param int 		$spaceId 	空间ID
     * @param string	$letter		首字母	
     */
    public function getGroupTotal($spaceId, $letter = ''){
    	$sql = 'SELECT count(id) as num FROM tb_group WHERE spaceid = '.$spaceId.' AND status = 1';
    	if($letter){
    		$sql .= ' AND firstletter = "'.$letter.'"';
    	}
        $rs = $this->db->query($sql);
        return $rs->result_array();
    }
	/**
     * 获取员工群组列表
     * @param int 		$spaceId 		空间ID
     * @param int 		$employeeId 	员工ID
     * @param string	$letter			首字母
     * @param int 		$start 			偏移量
     * @param int 		$limit 			获取数量
     */
    public function getEmployeeGroupList($spaceId, $employeeId, $letter='', $start = 0, $limit = 10){
    	$sql = 'SELECT g.id, g.logourl, g.name, g.description, g.messagenum, g.employeenum FROM tb_group g ';
    	$sql .= 'LEFT JOIN tb_group_employee e ON g.id = e.groupid ';
    	$sql .= 'WHERE e.employeeid ="'.$employeeId.'" AND g.spaceid = "'.$spaceId.'" AND g.status = 1';
    	if($letter){
    		$sql .= ' AND g.firstletter = "'.$letter.'"';
    	}
        $rs = $this->db->query( $sql.' ORDER BY e.jointime DESC LIMIT ?,?;', array($start, $limit));
		return $rs->result_array();
    }
	/**
     * 获取员工群组列表总数
     * @param int 		$spaceId 		空间ID
     * @param int 		$employeeId 	员工ID
     * @param string	$letter			首字母
     */
    public function getEmployeeGroupTotal($spaceId, $employeeId, $letter = ''){
    	$sql = 'SELECT count(e.id) as num FROM tb_group g LEFT JOIN tb_group_employee e ON g.id = e.groupid ';
    	$sql .= 'WHERE e.employeeid ='.$employeeId.' AND g.spaceid = '.$spaceId.' AND g.status = 1';
    	if($letter){
    		$sql .= ' AND g.firstletter = "'.$letter.'"';
    	}
        $rs = $this->db->query($sql);
        return $rs->result_array();
    }
	/**
     * 添加群组
     * @param	string	$name 			群组名
     * @param 	int		$spaceId		空间ID
     * @param	int		$employeeId 	员工ID
     * @param	string	$description	群组描述
     * @param	int		$logoId			群组logo资源id
     * @param	int		$logoUrl 		群组logo路径
     * @return	int		群组ID 0是创建失败
     */
    public function createGroup($name, $spaceId, $employeeId, $description = '', $logoId =0, $logoUrl = ''){
    	if($this->isExistSpaceGroupName($spaceId, $name)){
    		return 0; exit();
    	}
    	$this->db->trans_begin();
    	$this->load->library('pinyin');
    	$pinyin = $this->pinyin->output($name);
    	$firstletter = isset($pinyin[2]) ? $pinyin[2] : '';
    	$time = date('Y-m-d H:i:s', time());
    	$this->db->query( 'INSERT INTO tb_group (name, spaceid, creatorid, logoid, logourl, showinlist, employeenum, description, firstletter, bgid, bgurl, createtime)
                           VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?, 0, "", ?)', 
    	 				   array($name, $spaceId, $employeeId, $logoId, $logoUrl, $description, $firstletter, $time));
    	if ($this->db->trans_status() == FALSE){
		    $this->db->trans_rollback();
		}else{
			if($groupId = $this->db->insert_id()){
				$this->db->trans_commit();
	        	$res = $this->createGroupEmployee($groupId, $employeeId, 2);
	        	//新建索引
				$this->load->model('indexes_model', 'indexes');
        		$data = array('id' => $groupId, 'spaceid' => $spaceId, 'employeeid' => $employeeId, 'url' => 'employee/group/index?id='.$groupId, 'date' => $time, 'title' => $name, 'content' => $description);
        		$this->indexes->create('group', $data);
        		//更新缓存
        		$groupList = $this->getEmployeeGroupList($spaceId, $employeeId, '', 0, 5);
	            QiaterCache::groupList($groupList);
	        	return $res ? $groupId : 0;
	        }
	        return 0;
		}
    }
    /**
     * 添加群组员工映射
     * @param 	int		$groupId		群组ID
     * @param	int		$employeeId 	员工ID
     * @param	int		$status			参与状态:0-待审核，1-已参与,2-创建者,3-管理员， 默认是0
     * @return	boolen	true|false
     */
    public function	createGroupEmployee($groupId, $employeeId, $status = 0){
    	$this->db->trans_begin();
    	$res = $this->db->query( 'INSERT INTO tb_group_employee (groupid, employeeid, status, jointime) VALUES (?, ?, ?, NOW())', array($groupId, $employeeId, $status));
    	if ($this->db->trans_status() == FALSE){
		    $this->db->trans_rollback();
		}else{
			$this->db->trans_commit();
			return $res;
		}
    }
	/**
     * 移除群组员工映射
     * @param 	int		$groupId		群组ID
     * @param	int		$employeeId 	员工ID
     * @return	boolen	true|false
     */
    public function	removeGroupEmployee($groupId, $employeeId){
    	$this->db->trans_begin();
    	$res = $this->db->query( 'DELETE FROM tb_group_employee WHERE groupid = ? AND employeeid =? ', array($groupId, $employeeId));
    	if ($this->db->trans_status() == FALSE){
		    $this->db->trans_rollback();
		}else{
			$this->db->trans_commit();
    		return $res;
		}
    }
	/**
     * 检验是否是当前群组的员工
     * @param 	int		$groupId		群组ID
     * @param	int		$employeeId 	员工ID
     * @return	boolen	int|false
     */
    public function	isGroupEmployee($groupId, $employeeId){
    	$res = $this->db->query( 'SELECT id FROM tb_group_employee WHERE groupid = ? AND employeeid =? ', array($groupId, $employeeId));
    	return $res->num_rows > 0 ? $res->num_rows : false;
    }
	/**
     * 检验当前空间群组是否重名
     * @param 	string	$name			群组名
     * @return	boolen	int|false
     */
    public function	isExistSpaceGroupName($spaceId, $name){
    	$res = $this->db->query( 'SELECT id FROM tb_group WHERE spaceid = ? AND name = ? ', array($spaceId, $name));
    	return $res->num_rows > 0 ? $res->num_rows : false;
    }
	/**
     * 获取空间成员列表
     * @param 	int 	$groupId 	群组id
     * @param	boolen	$ext		是否查询部门名称扩展信息
     * @param	string	$letter		首字母
     * @param 	int 	$start 		偏移量
     * @param 	int 	$limit 		获取数量
     * @param 	int 	$status 	成员状态 0-待审核，1-已参与,2-创建者,3-管理员
     * @return 	array()
     */
    public function getGroupEmployeeList($groupId, $ext = false, $letter = '',$start = 0, $limit = 10, $status = 1){
    	if($ext){
    		$sql = 'SELECT g.id, g.employeeid, g.jointime, e.name, e.duty, e.imageurl, d.name as deptname '
    			   .'FROM tb_group_employee g '
    			   .'LEFT JOIN tb_employee e ON e.id = g.employeeid '
    			   .'LEFT JOIN tb_dept d ON d.id = e.deptid ';
    	}else{
    		$sql = 'SELECT g.id, g.employeeid, g.jointime, e.name, e.duty, e.deptid, e.imageurl '
    			   .'FROM tb_group_employee g '
    			   .'LEFT JOIN tb_employee e ON e.id = g.employeeid ';
    	}
    	$where = 'Where g.groupid ='.$groupId;
    	if($letter){
    		$where .= ' AND e.firstletter = "'.$letter;
    	}
    	if($status > 0){
    		$where .= ' AND g.status > 0';
    	}else{
    		$where .= ' AND g.status = '.$status;
    	}
    	$sql .= $where.' ORDER BY g.jointime DESC LIMIT '.$start.','.$limit;
    	$rs = $this->db->query($sql);
        return $rs->result_array();
    }
	/**
     * 获取群组员工列表总数
     * @param 	int 	$groupId 	群组id
     * @param	string	$letter		首字母
     */
    public function getGroupEmployeeTotal($groupId, $letter = '', $status = 1){
    	if(empty($letter)){
    		if($status > 0){
	    		$where = ' AND status > 0';
	    	}else{
	    		$where = ' AND status = '.$status;
	    	}
    		$sql = 'SELECT count(id) as num FROM tb_group_employee WHERE groupid ='.$groupId.$where;
    	}else{
    		if($status > 0){
	    		$where = ' AND g.status > 0';
	    	}else{
	    		$where = ' AND g.status = '.$status;
	    	}
    		$sql = 'SELECT count(g.id) as num FROM tb_group_employee g LEFT JOIN tb_employee e ON e.id = g.employeeid WHERE g.groupid ='.$groupId.' AND e.firstletter = "'.$letter.'"'.$where;    		
    	}
        $rs = $this->db->query($sql);
        return $rs->result_array();
    }
	/**
     * 更新群组
     * @param 	int		$groupId		群组ID
     * @param	array	$data 			需要更新的数据,键是字段，值是要更新的数据, array('name'=>'test')
     * @param	boolen	$isdel			是否删除，默认是否
     * @return	boolen	true|false
     */
    public function updateGroup($groupId, $data = array(), $isdel = false){
    	$set = '';
    	$indexArr['id'] = $groupId;
    	foreach ($data as $field => $value){
    		$set .= $field.' = "'.$value.'", ';
    		if($field == 'name'){
    			$this->load->library('pinyin');
		    	$pinyin = $this->pinyin->output($value);
		    	$firstletter = isset($pinyin[2]) ? $pinyin[2] : '';
    			$set .= 'firstletter = "'.$firstletter.'", ';
    			$indexArr['title'] = $value;	
    		}
    		if($field == 'description'){
    			$indexArr['content'] = $value;	
    		}
    	}
    	//$set = implode(',', $arr);
    	$opTime  = date('Y-m-d H:i:s', time());
    	$this->db->trans_begin();
    	$res = $this->db->query(' UPDATE tb_group SET '.$set.'updatetime = ? WHERE id =? ', array($opTime, $groupId));
    	if ($this->db->trans_status() == FALSE){
		    $this->db->trans_rollback();
		}else{
			$this->db->trans_commit();
			$this->load->model('indexes_model', 'indexes');
			if(!$isdel){
				//修改索引
        		$this->indexes->update('group', $indexArr);
			}else{
				//删除索引
        		$this->indexes->deleteById('group', $groupId);
			}			
			return $res;
		}
    }
	/**
     * 更新群组成员状态
     * @param 	int		$id			群组成员关联ID
     * @param	int		$status 	参与状态:0-待审核，1-已参与,2-创建者,3-管理员
     * @return	boolen	true|false
     */
    public function updateGroupEmployeeStatus($id, $status){
    	$this->db->trans_begin();
    	$res = $this->db->query(' UPDATE tb_group_employee SET status = ? WHERE id =? ', array($status, $id));
    	if ($this->db->trans_status() == FALSE){
		    $this->db->trans_rollback();
		}else{
			$this->db->trans_commit();
			return $res;
		}
    }
	/**
     * 获取群组成员信息
     * @param 	int		$groupId		群组ID
     * @param	int		$employeeId 	员工ID
     * @param	array	$fields 		字段数组 array('status', 'jointime')
     * @return	array
     */
    public function getGroupEmployeeInfo($groupId, $employeeId, $fields = array()){
    	if(empty($fields)){
    		return array();
    	}
    	$field = implode(',', $fields);
		$rs = $this->db->query( 'SELECT '.$field.' FROM tb_group_employee WHERE groupid =? AND employeeid  =? ', array($groupId, $employeeId));
		return $rs->row_array();
    }
	/**
     * 获取空间群组列表
     * @param 	int 	$spaceId 		空间id
     * @param 	int 	$employeeId 	员工ID
     */
    public function getGroupMenu($spaceId, $employeeId){
    	if(!$spaceId || !$employeeId){
    		return array();
    	}
        $groupList = QiaterCache::groupList();
        if(empty($groupList)){
            $groupList = $this->getEmployeeGroupList($spaceId, $employeeId, '', 0, 5);
            QiaterCache::groupList($groupList);
        }
        return $groupList;
    }
	/**
     * 获取员工群组ID集合
     * @param 	int 	$employeeId 	员工ID
     * @return	array
     */
    public function getEmployeeGroupIds($employeeId){
        $rs = $this->db->query( 'SELECT groupid FROM tb_group_employee WHERE employeeid = ? ORDER BY jointime DESC', array($employeeId));
		$info = $rs->result_array();
        $arr = array();
		foreach($info as $v){
			$arr[] = $v['groupid'];
		}
        return $arr;
    }
}