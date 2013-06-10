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
     * 获取空间APP列表
     * @param int $spaceId 空间id
     * @return array
     */
    public function getAppList($spaceId)
    {
        $appList = QiaterCache::appList();
        if(empty($appList))
        {
            $query = $this->db->query('select a.name,a.url,a.imageurl from tb_app as a left join tb_space_app as b on a.id = b.appid
                                                            where  a.status=1 and  b.spaceid=? and b.status=0
                                                            ORDER BY a.sortvalue asc, a.id asc',array($spaceId));
            $appList = $query->result_array();
            QiaterCache::appList($appList);
        }
        return $appList;
    }

}