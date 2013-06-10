<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: ZhaiYanBin
 * Date: 13-4-18
 * Time: 下午7:51
 * To change this template use File | Settings | File Templates.
 */
class Sign_model extends  CI_Model{
    public function __construct(){
        parent::__construct();
        $this->load->database('default');
    }

    /**
     * 获取某个用户的签到列表
     * @param int $employeeId   用户ID
     * @param int $limit        查询条数
     * @param int $offset       偏移量
     */
    public function getSignListByEmployeeId($employeeId = 0, $limit = 0, $offset = 0){
        if($limit || $offset){
            $limitStr = "LIMIT {$limit} OFFSET {$offset}";
        }
        $rs = $this->db->query("SELECT id,`precision`,latitude,address,clienttype,signtime FROM tb_sign WHERE creatorid=? ORDER BY signtime DESC " . $limitStr, array($employeeId));
        return $rs->result_array();
    }

    /**
     * 获取某个用户的签到总数
     * @param int $employeeId   用户ID
     */
    public function getSignNumByEmployeeId($employeeId = 0){
        $rs = $this->db->query("SELECT COUNT(id) AS num FROM tb_sign WHERE creatorid=?", array($employeeId));
        return $rs->row()->num;
    }

    /**
     * 获取某条定时任务信息
     * @param int $tid      定时任务ID
     * @param int $spaceid  空间ID
     */
    public function  getTaskInfo($tid = 0, $spaceid = 0){
        $sql = 'SELECT * FROM tb_sign_task WHERE id=' . $tid;
        if($spaceid){
            $sql = $sql . ' AND spaceid=' . $spaceid;
        }
        $rs = $this->db->query($sql);
        return $rs->row_array();
    }

    /**
     * 用户的定时任务状态
     * @param int $tid          定时任务ID
     * @param int $employeeId   用户ID
     */
    public function getEmployeeStatus($tid = 0, $employeeId = 0){
        $rs = $this->db->query("SELECT usertype FROM tb_sign_user WHERE signtaskid=? AND employeeid=?", array($tid, $employeeId));
        return $rs->row_array();
    }

    /**
     * 获取某个用户的定时任务列表
     * @param int $employeeId   用户ID
     * @param int $userType     用户类型：1-参与人，2-查看人
     * @param int $showOverdue  是否显示过期任务：0-否，1-是
     * @param int $limit        查询记录数
     * @param int $offset       偏移量
     */
    public  function getTaskListByEmployeeId($employeeId = 0, $userType = 0, $showOverdue = 0, $limit = 0, $offset = 0){
        $sql = "SELECT ST.id,ST.title,ST.starttime,ST.endtime,ST.`status`,SU.usertype AS userType FROM tb_sign_task AS ST INNER JOIN tb_sign_user AS SU ON ST.id=SU.signtaskid WHERE SU.employeeid={$employeeId} AND ST.status IN (0,1)";
        if($userType){
            $sql .= " AND SU.usertype={$userType}";
        }
        if(!$showOverdue){
            $sql .= " AND ST.endtime >= NOW()";
        }
        if($limit || $offset){
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }
        //echo $sql;die;
        $rs = $this->db->query($sql);
        return $rs->result_array();
    }

    /**
     * 获取某个用户的定时任务数量
     * @param int $employeeId   用户ID
     * @param int $userType     用户类型：1-参与人，2-查看人
     * @param int $showOverdue  是否显示过期任务：0-否，1-是
     */
    public function getTaskNumByEmployeeId($employeeId = 0, $userType = 0, $showOverdue = 0){
        $sql = "SELECT COUNT(ST.id) AS num FROM tb_sign_task AS ST INNER JOIN tb_sign_user AS SU ON ST.id=SU.signtaskid WHERE SU.employeeid={$employeeId} AND ST.status IN (0,1)";
        if($userType){
            $sql .= " AND SU.usertype={$userType}";
        }
        if(!$showOverdue){
            $sql .= " AND ST.endtime >= NOW()";
        }
        //echo $sql;die;
        $rs = $this->db->query($sql);
        return $rs->row()->num;
    }

    /**
     * 获取某个定时任务的签到数量
     * @param int $tid      任务ID
     * @param int $spaceid  空间ID
     */
    public function getTaskSignNumByTaskId($tid = 0, $spaceid = 0){
        $sql = "SELECT COUNT(S.id) AS num FROM tb_sign AS S INNER JOIN tb_employee AS EM ON EM.id=S.creatorid WHERE S.signtypeid={$tid} AND S.signtype=2";
        if($spaceid){
            $sql = " AND S.spaceid={$spaceid}";
        }
        $rs = $this->db->query($sql);
        return $rs->row()->num;
    }

    /**
     * 获取某个定时任务的签到列表
     * @param int $tid      任务ID
     * @param int $spaceid  空间ID
     * @param int $limit    查询记录数
     * @param int $offset   偏移量
     */
    public function getTaskSignListByTaskId($tid = 0, $spaceid = 0, $limit = 0, $offset = 0){
        $sql = "SELECT EM.id,EM.`name`,S.province,S.city,S.district,S.address,S.signtime,S.clienttype,S.remark FROM tb_sign AS S INNER JOIN tb_employee AS EM ON EM.id=S.creatorid WHERE S.signtypeid={$tid} AND S.signtype=2";
        if($spaceid){
            $sql .= " AND S.spaceid={$spaceid}";
        }
        if($limit || $offset){
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }
        $rs = $this->db->query($sql);
        return $rs->result_array();
    }

    /**
     * 获取某个用户的成员分享列表
     * @param int $employeeId   用户ID
     * @param int $type	        类型,1-我的共享，2-共享给我的
     */
    public function shareList($employeeId = 0, $type = 1, $cols = '*'){
        $sql = "SELECT {$cols} FROM tb_sign_share AS SH INNER JOIN tb_employee AS EM";
        if($type == 1){
            $sql = $sql . ' ON EM.id = SH.toid WHERE SH.fromid =' . $employeeId;
        } else{
            $sql = $sql . ' ON EM.id = SH.fromid WHERE SH.toid =' . $employeeId;
        }
        $sql .= ' ORDER BY sortvalue ASC';
        //echo $sql;die;
        $rs = $this->db->query($sql);
        return $rs->result_array();
    }

    /**
     * 获取某用户共享人的签到列表总数(只是手动签到)
     * @param int $employeeId   用户ID
     */
    public function getShareEmployeeSignNum($employeeId = 0){
        $sql = "SELECT COUNT(1) AS num FROM tb_sign AS S INNER JOIN tb_sign_share AS SS ON SS.fromid=S.creatorid WHERE S.signtype=1 AND SS.toid={$employeeId}";
        $rs = $this->db->query($sql);
        return $rs->row()->num;
    }


    /**
     * 获取某用户共享人的签到列表(只是手动签到)
     * @param int $employeeId   用户ID
     */
    public function getShareEmployeeSignList($employeeId = 0, $limit = 0, $offset = 0){
        $sql = "SELECT EM.`name`,S.province,S.city,S.address,S.signtime,S.clienttype,S.remark FROM tb_sign AS S INNER JOIN tb_sign_share AS SS ON SS.fromid=S.creatorid INNER JOIN tb_employee AS EM ON EM.id=SS.fromid WHERE S.signtype=1 AND SS.toid={$employeeId} ORDER BY S.id DESC";
        if($limit || $offset){
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }
        //echo $sql;die;
        $rs = $this->db->query($sql);
        return $rs->result_array();
    }

    /**
     * 添加分享人
     * @param int $fromId       发起者ID
     * @param int $toId         添加人ID
     * @param int $sortValue    排序ID
     */
    public function addShare($fromId = 0, $toId = 0, $sortValue = 0){
        $result = $this->db->query('INSERT INTO tb_sign_share (fromid,toid,sortvalue) VALUES (?,?,?)', array($fromId, $toId, $sortValue));
        return $result ? $this->db->insert_id() : 0;
    }
}