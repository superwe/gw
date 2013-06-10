<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: ZhaiYanBin
 * Date: 13-4-2
 * Time: 上午11:13
 * To change this template use File | Settings | File Templates.
 */
class Follow_model extends  CI_Model{
    public function __construct(){
        parent::__construct();
        $this->table = 'tb_followed';
        $this->load->database('default');
    }

    /**
     * 加关注
     * @param int $employeeid 发起人
     * @param int $followid 关注对象
     * @param int $followtype 关注类型
     * @return bool
     */
    public function addFollow($employeeid = 0, $followid = 0, $followtype = 0){
        $data = array(
            'employeeid' => $employeeid,
            'followid' => $followid,
            'followtype' => $followtype,
            'createtime' => date('Y-m-d H:i:s', time())
        );
        $sql = $this->db->insert_string($this->table, $data);
        $this->db->query($sql);
        if($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
            return false;
        }
        return $this->db->insert_id();
    }

    /**
     * 取消关注
     * @param int $employeeid   发起人ID
     * @param int $followid     关注对象ID
     * @param int $followtype   关注类型
     */
    public function cancelFollow($employeeid = 0, $followid = 0, $followtype = 0){
        $query = $this->db->query('DELETE FROM tb_followed WHERE employeeid=? AND followid=? AND followtype=?', array($employeeid, $followid, $followtype));
        return $query;
    }

    /**
     * 获取某个用户的关注成员数
     * @param int $employeeid   用户ID
     * @param int $status   成员状态：0未激活，1正常，2停用
     */
    public function getMyFollowMemberNums($employeeid = 0, $status = null){
        $where = array('followtype=' . $this->config->item('object_type_member','base_config'));
        $sql = "SELECT COUNT(FOLLOW.id) AS num FROM tb_followed AS FOLLOW ";
        if(!is_null($status)){
            $sql .= " INNER JOIN tb_employee AS EM ON EM.id = FOLLOW.followid ";
            $where[] = 'EM.status=' . $status;
        }
        if($employeeid){
            $where[] = 'FOLLOW.employeeid=' . $employeeid;
        }
        if($where){
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        //echo $sql;die;
        $query = $this->db->query($sql);
        return $query->row()->num;
    }

    /**
     * 获取某个用户的粉丝数
     * @param int $employeeid   用户ID
     * @param int $status   成员状态：0未激活，1正常，2停用
     */
    public function getMyFansMemberNums($employeeid = 0, $status = null){
        $where = array('followtype=' . $this->config->item('object_type_member','base_config'));
        $sql = "SELECT COUNT(FOLLOW.id) AS num FROM tb_followed AS FOLLOW ";
        if(!is_null($status)){
            $sql .= " INNER JOIN tb_employee AS EM ON EM.id = FOLLOW.followid ";
            $where[] = 'EM.status=' . $status;
        }
        if($employeeid){
            $where[] = 'FOLLOW.followid=' . $employeeid;
        }
        if($where){
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $query = $this->db->query($sql);
        return $query->row()->num;
    }

    /**
     * 获取某个用户的关注人员列表
     * @param int $employeeid   用户ID
     */
    public function getFollowEmployeeIds($employeeid = 0){
        $temp = $lists = array();
        $rs = $this->db->query('SELECT `followid` FROM tb_followed WHERE `employeeid`=? AND `followtype`=?', array($employeeid, $this->config->item('object_type_member','base_config')));
        $temp = $rs->result_array();
        foreach($temp as $k => $v){
            $lists[] = $v['followid'];
        }
        return $lists;
    }

    /**
     * 查询某用户是否关注了某对象
     * @param int $employeeid   发起人ID
     * @param int $followid     关注对象ID
     * @param int $followtype   关注类型
     * @return bool
     */

    public function isHaveFollow($employeeid = 0,$followid = 0,$followtype = 0){
        $query = $this->db->query("SELECT id FROM tb_followed WHERE  employeeid=? AND followid=? AND followtype=? LIMIT 1", array($employeeid, $followid, $followtype));
        $affected = $query->num_rows();
        return $affected > 0 ? true : false;
    }

    /**
     * 查询某对象的关注成员列表
     * @param $followid
     * @param $followtype
     * @param int $start
     * @param int $perpage
     * @return bool
     */
    public function getMemberByFollowed($followid,$followtype,$start = 0,$perpage = 6){
        if(empty($followid) || empty($followtype)){
            return false;
        }
        $rs  = $this->db->query("SELECT E.id,E.name,E.imageurl FROM tb_followed AS F LEFT JOIN tb_employee AS E ON F.employeeid = E.id WHERE E.name IS NOT NULL AND F.followid IN (".$followid.") AND F.followtype = ? GROUP BY E.id LIMIT ?,?", array($followtype,$start,$perpage));
        return $rs->result_array();
    }

    /**
     * 查询某对象的关注成员列表总数
     * @param $followid
     * @param $followtype
     * @param int $start
     * @param int $perpage
     * @return bool
     */
    public function getMemberByFollowedCount($followid,$followtype,$start = 0,$perpage = 6){
        if(empty($followid) || empty($followtype)){
            return false;
        }
        $rs  = $this->db->query("SELECT COUNT(DISTINCT(E.id)) AS count FROM tb_followed AS F LEFT JOIN tb_employee AS E ON F.employeeid = E.id WHERE E.name IS NOT NULL AND F.followid IN (".$followid.")  AND F.followtype = ?",array($followtype));
        return $rs->row_array();
    }

    /**
     * 查询用户的关注人列表
     * @author shiying
     * @param $employeeid
     * @param int $start
     * @param int $perpage
     * @return array
     */
    public function getMyFollowMember($employeeid,$start = 0,$perpage = 6){
        if(empty($employeeid)){
            return array();
        }
        $followtype = $this->config->item('object_type_member','base_config');
        $sql = "SELECT E.id AS employeeid,E.name,E.imageurl FROM tb_followed AS F LEFT JOIN tb_employee AS E ON F.followid = E.id WHERE F.employeeid = ? AND F.followtype = ? LIMIT ?,?";
        $rs = $this->db->query($sql,array($employeeid,$followtype,$start,$perpage));
        return $rs->result_array();
    }

    /**
     * 查询用户的粉丝列表
     * @author shiying
     * @param $employeeid
     * @param int $start
     * @param int $perpage
     * @return array
     */
    public function getMyFansMember($employeeid,$start = 0,$perpage = 6){
        if(empty($employeeid)){
            return array();
        }
        $followtype = $this->config->item('object_type_member','base_config');
        $sql = "SELECT E.id AS employeeid,E.name,E.imageurl FROM tb_followed AS F LEFT JOIN tb_employee AS E ON F.employeeid = E.id WHERE F.followid = ? AND F.followtype = ? LIMIT ?,?";
        $rs = $this->db->query($sql,array($employeeid,$followtype,$start,$perpage));
        return $rs->result_array();
    }
}
