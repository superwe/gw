<?php
/**
 * Created by JetBrains PhpStorm.
 * User: ZhaiYanBin
 * Date: 13-5-7
 * Time: 下午20:08
 * To change this template use File | Settings | File Templates.
 */
class Sign_model extends CI_Model{
    public function __construct(){
        $this->load->database('default');
    }

    /**
     * 添加签到信息
     */
    public function addSign($employeeId = 0, $spaceId = 0, $precision = 0, $latitude = 0, $province = '', $city = '', $district = '', $address = '', $clientType = 0, $signtime = 0, $remark = '', $typeId = 0, $signType = 0){
        $data = array(
            'creatorid' => $employeeId,
            'spaceid' => $spaceId,
            'precision' => $precision,
            'latitude' => $latitude,
            'province' => $province,
            'city' => $city,
            'district' => $district,
            'address' => $address,
            'clienttype' => $clientType,
            'signtime' => $signtime ? $signtime : time(),
            'signtype' => $signType,
            'signtypeid' => $typeId,
            'remark' => $remark
        );
        $sql = $this->db->insert_string('tb_sign', $data);
        if($this->db->query($sql)){
            return $this->db->insert_id();
        }
        return 0;
    }

    /**
     * 用户是否属于本空间
     * @param int $employeeId   用户ID
     * @param int $spaceId      空间ID
     */
    public function isSpaceEmployee($employeeId = 0, $spaceId = 0){
        $query = $this->db->query("SELECT id FROM tb_employee WHERE id=? AND spaceid=? AND status=1", array($employeeId, $spaceId));
        return $query->num_rows() > 0 ? true : false;
    }

    /**
     * 获取签到任务是否正常状态
     * @param int $tid      定时任务ID
     * @param int $spaceId  空间ID
     */
    public function getTaskInfo($tid = 0, $spaceId = 0){
        $query = $this->db->query("SELECT status,endtime FROM tb_sign_task WHERE id=? AND spaceid=?", array($tid, $spaceId));
        return $query->row_array();
    }

    /**
     * 用户是否有权限进行签到
     * @param int $spaceId  空间ID
     * @param int $tid      定时任务ID
     * @param int $employeeId   用户ID
     */
    public function isSignEnable($spaceId = 0, $tid = 0, $employeeId = 0){
        $query = $this->db->query("SELECT id FROM tb_sign_user WHERE spaceid=? AND signtaskid=? AND employeeid=? AND usertype=1", array($spaceId, ));
        return $query->num_rows() > 0 ? true : false;
    }

    /**
     * 获取某个用户的签到列表
     * @param int $employeeId   用户ID
     * @param int $limit        查询条数
     * @param int $offset       记录偏移量
     */
    public function getTaskListByEmployeeId($employeeId = 0, $limit = 0, $offset = 0){
        $endTime = date('Y-m-d H:i:s', time());
        $sql = "SELECT T.id,T.starttime,T.signtime,T.timingsetting,T.cycletype,T.endtime FROM tb_sign_task AS T INNER JOIN tb_sign_user AS U ON T.id=U.signtaskid WHERE T.status=1 AND U.employeeid={$employeeId} AND U.usertype=1 AND T.endtime > '{$endTime}'";
        $sql .= ($limit || $offset) ? " LIMIT {$limit} OFFSET {$offset}" : '';
        $query = $this->db->query($sql);
        $list = $query->result_array();
        return $list;
    }
}