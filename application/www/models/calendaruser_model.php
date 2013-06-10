<?php
/**
 * Class Calendar_model
 */
class Calendaruser_model extends CI_Model{
    public function __construct(){
        $this->load->database('default');
    }

    /**
     * 根据接收者id，获取被关注人（即provider）；
     * @param $recieverid
     */
    public function getFollowedList($recieverid){
    }

    /**
     * 根据接收者id，获取共享人（即provider）；
     * @param $recieverid
     */
    public function getSharedList($recieverid){

    }
    /**
     * 根据接收者id（recieverid），获取提供人（即provider）；
     * @param $recieverid
     */
    public function getProviders($recieverid){
        $sql = 'SELECT cu.id id, cu.providerid providerid, cu.type type, e.name name, e.imageurl avatar '.
               'FROM tb_calendar_users cu '.
                    'LEFT JOIN tb_employee e ON cu.providerid=e.id '.
               'WHERE cu.recieverid=? '.
               'ORDER BY cu.sortvalue';
        $params = [(int)$recieverid];

        $rs = $this->db->query($sql, $params);
        return $rs->result_array();
    }

    /**
     * 更新排序；
     * @param $params
     * @param $type
     * @return int
     */
    public function updateSort($params=array(), $where=array()){
        $ret = 0;

        $sql_update_sort = $this->db->update_string('tb_calendar_users', $params, $where);
        $rs = $this->db->query($sql_update_sort);
        if($rs){
            $ret = $this->db->affected_rows();
        }
        return $ret;
    }
}