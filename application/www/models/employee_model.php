<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: ZhaiYanBin
 * Date: 13-4-1
 * Time: 下午12:51
 * To change this template use File | Settings | File Templates.
 */
class Employee_model extends  CI_Model{
    public function __construct(){
        parent::__construct();
        $this->load->database('default');
    }

    /**
     * 根据用户ID获取用户信息
     * @param int $employeeId 用户ID
     * @param string $cols  列名字符串
     */
    public function getEmployeeInfo($employeeId = 0, $cols = '*'){
        $result = $this->db->query('SELECT ' . $cols . ' FROM tb_employee WHERE id=? LIMIT 1', array($employeeId));
        return $result->row_array();
    }
    
    /**
     * added by bishenghua 2013/05/10
     * @param unknown $email
     * @param string $cols
     */
    public function getPersonByEmail($email, $cols = '*'){
    	$result = $this->db->query('SELECT ' . $cols . ' FROM tb_person WHERE email=? LIMIT 1', array($email));
    	return $result->row_array();
    }
    
    /**
     * added by bishenghua 2013/05/10
     * @param unknown $personId
     * @param unknown $spaceId
     * @param string $cols
     */
    public function getEmployeeByPidAndSid($personId, $spaceId, $cols = '*') {
    	$result = $this->db->query('SELECT ' . $cols . ' FROM tb_employee WHERE personid=? AND spaceid=? LIMIT 1', array($personId, $spaceId));
    	return $result->row_array();
    }

    /**
     * 根据用户名、邮箱搜索用户
     * @param string $cols  查询字段
     * @param string $name  用户名
     * @param string $email 用户邮箱
     */
    public function getEmployeeInfoByNameAndEmail($cols = '*', $name = '', $email = ''){
        $sql = "SELECT {$cols} FROM tb_employee WHERE 1";
        if($name){
            $sql .= " AND name LIKE '%{$name}%'";
        }
        if($email){
            $sql .= " AND email LIKE '%{$email}%'";
        }
        $result = $this->db->query($sql);
        return $result->result_array();
    }

    /**
     * 获取用户数量
     * @param int $spaceid  空间ID
     * @param int $status   成员状态：未激活0，正常1，停用2
     */
    public function getAllEmployeeNums($spaceid = 0, $status = 1){
        $rs = $this->db->query('SELECT COUNT(id) AS num FROM tb_employee WHERE `spaceid`=? AND `status`=?', array($spaceid, $status));
        return $rs->row()->num;
    }

    /**
     * 根据查询条件获取成员总数
     * @param string $cols          选择的列字段
     * @param int $spaceid          空间ID
     * @param int $deptId           部门ID
     * @param string $firstLetter   首字母
     * @param int $status           成员状态：未激活0，正常1，停用2
     */
    public function getAllEmployeeNumBySearch($spaceid = 0, $deptId = 0, $firstLetter = '', $status = 1){
        $sql = "SELECT COUNT(1) AS num FROM tb_employee AS E INNER JOIN tb_dept D ON E.deptid=D.id WHERE E.spaceid={$spaceid}";
        if($deptId){
            $sql .= "  AND E.deptid={$deptId}";
        }
        if($firstLetter){
            $firstLetter = strtolower($firstLetter);
            $sql .= " AND E.firstletter='{$firstLetter}'";
        }
        if($status >= 0){
            $sql .= " AND E.status={$status}";
        }
        $result = $this->db->query($sql);
        return $result->row()->num;
    }

    /**
     * 根据查询条件获取成员列表
     * @param string $cols          选择的列字段
     * @param int $spaceid          空间ID
     * @param int $deptId           部门ID
     * @param string $firstLetter   首字母
     * @param int $status           成员状态：未激活0，正常1，停用2
     * @param int $limit            查询条数
     * @param int $offset           记录偏移量
     */
    public function getAllEmployeeListBySearch($spaceid = 0, $deptId = 0, $firstLetter = '', $status = 1, $limit = 0, $offset = 0){
        $sql = "SELECT E.id,E.name,E.imageurl,E.email,E.duty,E.mobile,E.phone,E.deptid,D.name AS deptName FROM tb_employee AS E INNER JOIN tb_dept D ON E.deptid=D.id WHERE E.spaceid={$spaceid}";
        if($deptId){
            $sql .= "  AND E.deptid={$deptId}";
        }
        if($firstLetter){
            $firstLetter = strtolower($firstLetter);
            $sql .= " AND E.firstletter='{$firstLetter}'";
        }
        if($status >= 0){
            $sql .= " AND E.status={$status}";
        }
        if($limit || $offset){
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }
        $result = $this->db->query($sql);
        return $result->result_array();
    }

    /**
     * 获取某用户的成员分组列表
     * @param int $memberId    成员ID
     */
    public function getEmployeeGroup($employeeId = 0){
        $lists = array();
        $result = $this->db->query('SELECT id,name FROM tb_followed_group WHERE employeeid=?', array($employeeId));
        $temp = $result->result_array();
        foreach($temp as $k => $v){
            $lists[$k]['id'] = $v['id'];
            $lists[$k]['name'] = $v['name'];
        }
        return $lists;
    }
    
    /**
     * 添加成员分组
     *  @param int $employeeId    成员ID
     */
    public function addEmployeeGroup($groupName = '', $employeeId = 0){
        $result = $this->db->query("INSERT INTO tb_followed_group (name, employeeid, createtime) VALUES (?, ?, ?)", array($groupName, $employeeId, time()));
        if($result){
            return $this->db->insert_id();
        }
        return 0;
    }

    /**
     * 获取集团型空间的成员数量
     * @param int $id               集团空间ID
     * @param string $firstLetter   首字母
     * @param string $name          用户姓名
     * @param int $status           成员状态：未激活0，正常1，停用2
     */
    public function getSpaceGroupEmployeeNum($id = 0, $firstLetter = '', $name = '', $status = 1){
        $sql = "SELECT COUNT(1) AS num FROM tb_employee AS E INNER JOIN tb_space AS S ON E.spaceid=S.id WHERE S.groupid={$id}";
        if($firstLetter){
            $firstLetter = strtolower($firstLetter);
            $sql .= " AND E.firstletter='{$firstLetter}'";
        }
        if($name){
            $sql .= " AND E.name LIKE '{$name}%'";
        }
        if($status >= 0){
            $sql .= " AND E.status={$status}";
        }
        $sql .= " ORDER BY E.id DESC";
        $result = $this->db->query($sql);
        return $result->row()->num;
    }

    /**
     * 获取集团型空间的成员列表
     * @param int $id               集团空间ID
     * @param string $firstLetter   首字母
     * @param string $name          用户姓名
     * @param int $status           成员状态：未激活0，正常1，停用2
     * @param int $limit            查询条数
     * @param int $offset           记录偏移量
     */
    public function getSpaceGroupEmployeeList($id = 0, $firstLetter = '', $name = '', $status = 1, $limit = 0, $offset = 0){
        $sql = "SELECT E.id,E.name,E.imageurl,E.duty,E.email,E.mobile,E.phone,E.deptid,D.name AS deptName FROM tb_employee AS E INNER JOIN tb_space AS S ON E.spaceid=S.id LEFT JOIN tb_dept AS D ON E.deptid=D.id WHERE S.groupid={$id}";
        if($firstLetter){
            $firstLetter = strtolower($firstLetter);
            $sql .= " AND E.firstletter='{$firstLetter}'";
        }
        if($name){
            $sql .= " AND E.name LIKE '{$name}%'";
        }
        if($status >= 0){
            $sql .= " AND E.status={$status}";
        }
        $sql .= " ORDER BY E.id DESC";
        if($limit || $offset){
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }
        //echo $sql;
        $result = $this->db->query($sql);
        return $result->result_array();
    }

    /**  获取人员的卡片信息
     * @param $employeeid 人员ID
     * @param $visiterid  浏览人 ID
     */
    public function getCardInfo($employeeid,$visiterid)
    {
        $query = $this->db->query(
            'select id, name,nickname,duty,phone,mobile,imageurl from tb_employee where id = ?',
            array($employeeid));
        if($query->num_rows()>0)
        {
            $row = $query->row();
            $data['name'] =$row->name;
            $data['nickname'] =$row->nickname;
            $data['duty'] =$row->duty;
            $data['phone'] =$row->phone;
            $data['mobile'] =$row->mobile;
            $data['imageurl'] =$row->imageurl;
        }

        $this->load->model('follow_model','followM');
        $data['fansnum'] = $this->followM->getMyFansMemberNums(0, $employeeid, 1);//关注我的
        $data['follownum'] = $this->followM->getMyFollowMemberNums(0, $employeeid, 1); //我关注的成员数
        $data['isfollowed'] = $this->followM->isHaveFollow($visiterid,$employeeid,0);//关注状态
        $data['isonline']=1;// todo 获取在线状态
        $data['employeeid'] = $employeeid;
        $data['visiterid'] = $visiterid;


        return $data;
    }
    /**
     * 获取用户详情
     * @author	Hejinlong	2013-4-18
     * @param	string|int	$value	字段值
     * @param 	string		$field	字段名
     * @param	string		$cols	待查询的字段，多个用,隔开
     * @param	array
     */
    public function getEmployeeDetail($value, $field = 'id', $cols = '*'){
        $result = $this->db->query('SELECT ' . $cols . ' FROM tb_employee WHERE '.$field.' =? LIMIT 1', array($value));
        $info = $result->result_array();
        if(isset($info['0'])){
            return $info['0'];
        }
        return array();
    }
    
    /**
     * 根据employeeids返回id对应数组
     * @author bishenghua
     * @date 2013/04/25
     * @param array $employeeids
     * @param string $cols
     * @return multitype:|Ambigous <multitype:, unknown>
     */
    public function getEmployeeMapping(array $employeeids, $cols = 'name,imageurl') {
    	if (empty($employeeids)) return array();
    	$employeeids = implode(',', $employeeids);
    	$sql = 'SELECT id,' . $cols . ' FROM tb_employee WHERE id IN('.$employeeids.')';
    	$query = $this->db->query($sql);
    	$result = $query->result_array();
    	$return = array();
    	foreach ($result as $value) {
    		foreach ($value as $k => $v) {
    			if ($k == 'id') continue;
    			$return[$k][$value['id']] = $v;
    		}
    	}
    	return $return;
    }

    /**
     * 根据用户ID获取用户姓名
     */
    public function getEmployeeNameByIds($employeeIds = 0){
        $query = $this->db->query('SELECT id,name FROM tb_employee WHERE id IN (' . $employeeIds . ')');
        return $query->result_array();
    }
    
    /**
     * added by bishenghua 2013/05/10
     * @param unknown $values
     * @param unknown $where
     * @param unknown $orderby
     * @param string $limit
     * @return unknown
     */
    public function updateEmployee($values, $where, $orderby = array(), $limit = FALSE) {
    	$this->db->trans_begin();
    	$sql = $this->db->_update('tb_employee', $values, $where, $orderby, $limit);
    	$this->db->query($sql);
    	if ($this->db->trans_status() == FALSE) {
    		$this->db->trans_rollback();
    	} else {
    		$affected = $this->db->affected_rows();
    		$this->db->trans_commit();
    		return $affected;
    	}
    }

    /**
     * 更新表内容
     * @author shiying 2013/05/10
     * @param $table
     * @param $values
     * @param $where
     * @param array $orderby
     * @param bool $limit
     * @return mixed
     */

    public function updateTable($table,$values,$where,$orderby = array(), $limit = FALSE){
        $this->db->trans_begin();
        $sql = $this->db->_update($table,$values,$where,$orderby,$limit);
        $this->db->query($sql);
        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
        }else{
            $affected = $this->db->affected_rows();
            $this->db->trans_commit();
            return $affected;
        }
    }
	/**
     * 获得商品收货人地址列表
     * add  by junxing
     * 2013-05-13
     */
	public function getAddressList($spaceid,$employeeid){
		$rs = $this->db->query('SELECT * FROM tb_goods_user_address WHERE spaceid = ? AND employeeid = ?',array($spaceid,$employeeid));
		return $rs->result_array();
	}
	/**
     * 获得商品收货人地址条数
     * add  by junxing
     * 2013-05-13
     */
	public function getAddressCount($spaceid,$employeeid){
		$rs = $this->db->query('SELECT COUNT(id) AS c FROM tb_goods_user_address WHERE spaceid = ? AND employeeid = ?',array($spaceid,$employeeid));
		$count = $rs->row_array();
		if($count['c'] > 4){
			return false;
		}
		return true;
	}
	/**
     * 添加商品收货人地址
     * add  by junxing
     * 2013-05-13
     */
	public function addAddress($spaceid,$employeeid,$province,$city,$address,$postcode,$receiver,$phone = '',$mobile = '',$isdefault = 1){
		$sql = 'INSERT INTO tb_goods_user_address(spaceid,employeeid,province,city,address,postcode,receiver,phone,mobile,isdefault) VALUES (?,?,?,?,?,?,?,?,?,?)';
		if($isdefault){
			$this->db->query('UPDATE tb_goods_user_address SET isdefault = 0 WHERE spaceid = ? AND employeeid = ?',array($spaceid,$employeeid));
		}
		return $this->db->query($sql,array($spaceid,$employeeid,$province,$city,$address,$postcode,$receiver,$phone,$mobile,$isdefault));
	}
	/**
     * 删除商品收货人地址列表
     * add  by junxing
     * 2013-05-13
     */
	public function moveaddr($id,$employeeid){
		$sql = 'DELETE FROM tb_goods_user_address WHERE id = ? AND employeeid = ?';
		return $this->db->query($sql,array($id,$employeeid));
	}
}