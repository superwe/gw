<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Yuanjinga
 * Date: 13-4-15
 * Time: 下午13:03
 * To change this template use File | Settings | File Templates.
 */

class App_model extends  CI_Model{

    public function __construct(){
        $this->load->database('default');
        $this->load->helper('cache');
    }

    /**
     * 获取空间列表
     * @param int $personid 人员登录账号id
     * @return array
     */
    public function getSpaceList($personid)
    {
        $query = $this->db->query('select a.spaceid,a.id as employeeid,b.name as spacename,b.type as spacetype from
                                  tb_employee as a left join tb_space as b on a.spaceid = b.id
                                  where  a.status=1 and  b.status=1 and a.personid = ? ',array($personid));
        return $query->result_array();
    }

}