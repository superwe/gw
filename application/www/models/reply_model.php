<?php
/**
 * Created by JetBrains PhpStorm.
 * User: shiying
 * Date: 13-4-18
 * To change this template use File | Settings | File Templates.
 */
class Reply_model extends  CI_Model{

    public function __construct(){
	$this->load->database('default');
    }

    /**
     * 添加表内容
     * @param $table 表名
     * @param $keys   数据库字段值
     * @param $values
     * @return mixed
     */
    public function insertTable($table,$keys,$values){
        $this->db->trans_begin();
        $sql = $this->db->_insert($table,$keys,$values);
        $this->db->query($sql);
        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
        }else{
            $id = $this->db->insert_id();
            $this->db->trans_commit();
            return $id;
        }
    }

    /**
     * 更新表内容
     * @param $table
     * @param $values   $uvalue['name'] = 姓名;
     * @param $where    $uwhere  = array("id = '".$id."'");
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
     * 获取一级评论或获取一级单个评论
     * @param $spaceid
     * @param $targetid 字符串或者数字 1,2,3
     * @param $module
     * @param int $parentreplyid 父类id
     * @param int $start
     * @param int $limit
     * @return mixed
     */
    public function getReply($spaceid,$targetid,$module,$parentreplyid = 0,$start = 0 ,$limit = 6){
	if($parentreplyid){
        $sql = "SELECT E.id AS employeeid,E.name,E.imageurl,R.content,R.replytime,R.clienttype,R.id,R.targetid,R.parentemployeeid FROM tb_reply AS R LEFT JOIN tb_employee AS E ON R.replyemployeeid = E.id WHERE R.spaceid = ? AND R.targetid IN($targetid) AND R.module = ?  AND E.name IS NOT NULL AND R.parentreplyid = ? ORDER BY R.replytime DESC";
        $parray =  array($spaceid,$module,$parentreplyid);
	}else{
	    $sql = "SELECT E.id AS employeeid,E.name,E.imageurl,R.content,R.replytime,R.clienttype,R.id,R.targetid,R.parentemployeeid FROM tb_reply AS R LEFT JOIN tb_employee AS E ON R.replyemployeeid = E.id WHERE R.spaceid = ? AND R.targetid IN($targetid) AND R.module = ? AND E.name IS NOT NULL ORDER BY R.replytime DESC LIMIT ?,?";
	    $parray =  array($spaceid,$module,$start,$limit);
	}
	$rs = $this->db->query($sql,$parray);
	return $rs->result_array();
    }

    /**
     * 获取某条回复内容
     */
    public function getReplyById($replyid){
        $sql = "SELECT E.id AS employeeid,E.name,E.imageurl,R.content,R.replytime,R.clienttype,R.id,R.targetid,R.parentemployeeid FROM tb_reply AS R LEFT JOIN tb_employee AS E ON R.replyemployeeid = E.id WHERE R.id = ? AND E.name IS NOT NULL";
        $rs = $this->db->query($sql,array($replyid));
        return $rs->row_array();
    }

    /**
     * 获取多条回复内容
     */
    public function getReplyByIds($replyids){
        if(empty($replyids)) return array();
        //         $sql = "SELECT e.id AS employeeid,e.name,e.imageurl,r.id,r.targetid,r.module,r.content,r.replytime,r.clienttype,r.parentemployeeid FROM tb_reply AS r LEFT JOIN tb_employee AS e ON r.replyemployeeid = e.id  WHERE r.id IN(".implode(',', $replyids).")";
        $sql = "SELECT id,targetid,module,content,replytime,clienttype,parentemployeeid FROM tb_reply WHERE id IN(".implode(',', $replyids).")";
        $rs = $this->db->query($sql);
        $return = array();
        foreach($rs->result_array() as $value){
            $return[$value['id']] = $value;
        }
        return $return;
    }

    /**
     * 获取单个target的回复数；
     * @param $spaceid      空间id
     * @param $targetid     模块中的数据id
     * @param $module       模块id
     * @return int
     */
    public function getReplyCount($spaceid, $targetid, $module){
        $ret = 0;
        if(!($spaceid&&$targetid&&$module)) return $ret;
        $sql = 'SELECT count(*) count '.
               'FROM tb_reply r '.
               'WHERE r.spaceid=? AND r.targetid=? AND r.module=?';
        $params = [(int)$spaceid, (int)$targetid, (int)$module];
        $rs = $this->db->query($sql, $params);
        if($rs){
            $ret = $rs->row_array()['count'];
        }
        return $ret;
    }

    /**
     * 获取多个target的回复数；
     * @author yuanjinga
     * @param $targetIds     模块中的数据ids
     * @param $module       模块id
     * @return array
     */
    public function getReplyCountByIds($targetIds, $module){
        $targetIds = implode(',', $targetIds);
        if(!($targetIds && $module)) return array();
        $sql = 'SELECT module,targetid,count(*) count '.
            'FROM tb_reply r '.
            'WHERE r.targetid IN('.$targetIds.') AND r.module=? GROUP BY module,targetid';
        $params = [(int)$module];
        $query = $this->db->query($sql, $params);
        $result = $query->result_array();
        $return = array();
        foreach($result as $value){
            $return[$value['targetid']] = $value['count'];
        }
        return $return;
    }

    /** 删除某对象相关的 回复
     * @param $targetid  对象id
     * @param $module 对象类型
     * add by lisheng 2013-04-25
     */
    public function delTargetReply($targetid,$module)
    {
        $this->db->trans_begin();
        $this->db->query('delete from tb_reply where targetid=? and module=?',array($targetid,$module));
        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
        }else{
            $affected = $this->db->affected_rows();
            $this->db->trans_commit();
            return $affected;
        }
    }

    /**
     * 删除评论（删除本评论及其子评论）
     * @param $replyid
     * @return bool
     */
    public function delreply($replyid){
        $this->db->trans_begin();
        $rs = $this->db->query("DELETE FROM tb_reply WHERE id = ? OR parentreplyid = ?",array($replyid,$replyid));
        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
        }else{
            $affected = $this->db->affected_rows();
            $this->db->trans_commit();
            return $affected > 0 ? true : false;
        }
    }

    /**
     * 根据回复ID获取一条回复信息
     * @author   ZhaiYanBin
     * @param int $id     回复ID
     * @param string $cols  列字段
     */
    public function getInfoByReplyId($id = 0, $cols = '*'){
        $rs = $this->db->query("SELECT {$cols} FROM tb_reply WHERE id=?", array($id));
        return $rs->row_array();
    }

    /**
     * 根据对象和对象类型获取回复列表
     * @author   ZhaiYanBin
     * @param int $targetId     对象ID
     * @param int $module       对象类型
     * @param int $spaceId      空间ID
     * @param int $employeeIds  人员IDs
     */
    public function getReplyTotalByTargetIdAndModule($spaceId = 0, $targetId = 0, $module = 0, $employeeIds = array()){
        $sql = "SELECT COUNT(R.id) AS num FROM tb_reply AS R INNER JOIN tb_employee AS E ON R.replyemployeeid = E.id WHERE R.spaceid = ? AND R.targetid =? AND R.module = ?";
        $paramArr =  array($spaceId, $targetId, $module);
        if($employeeIds){
            $employeeIds = implode(',', $employeeIds);
            $sql .= " AND R.replyemployeeid IN (?)";
            array_push($paramArr, $employeeIds);
        }
        $sql .= " ORDER BY R.replytime DESC";
        $rs = $this->db->query($sql, $paramArr);
        return $rs->row()->num;
    }

    /**
     * 根据对象和对象类型获取回复列表
     * * @author   ZhaiYanBin
     * @param int $targetId     对象ID
     * @param int $module       对象类型
     * @param int $spaceId      空间ID
     * @param int $employeeIds  人员IDs
     * @param int $limit        查询记录条数
     * @param int $offset       记录偏移量
     */
    public function getReplyListByTargetIdAndModule($spaceId = 0, $targetId = 0, $module = 0, $employeeIds = array(), $limit = 0, $offset = 0){
        $sql = "SELECT E.id AS employeeId,E.name,E.imageurl,R.id,R.replyemployeeid,R.replytime,R.content,R.ishasfile,R.parentreplyid,R.parentemployeeid,R.clienttype FROM tb_reply AS R INNER JOIN tb_employee AS E ON R.replyemployeeid = E.id WHERE R.spaceid = ? AND R.targetid =? AND R.module = ?";
        $paramArr =  array($spaceId, $targetId, $module);
        if($employeeIds){
            $employeeIds = implode(',', $employeeIds);
            $sql .= " AND R.replyemployeeid IN (?)";
            array_push($paramArr, $employeeIds);
        }
        $sql .= " ORDER BY R.replytime DESC";
        if($limit || $offset){
            $sql .= " LIMIT ? OFFSET ?";
            array_push($paramArr, $limit, $offset);
        }
        $rs = $this->db->query($sql, $paramArr);
        return $rs->result_array();
    }
}