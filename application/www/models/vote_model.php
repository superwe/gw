<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Yuanjinga
 * Date: 13-4-9
 * Time: 上午9:03
 * To change this template use File | Settings | File Templates.
 */

class Vote_model extends  CI_Model{

    public function __construct(){
        $this->load->database('default');
    }

    /**
     * 获取创建投票榜单
     * @param int $spaceid 空间id
     * @param int $limit 获取数量
     */
    public function getCreaterList($spaceid, $limit = 10){
        $rs = $this->db->query( 'SELECT v.creatorid, e.name,COUNT(v.id) num FROM tb_vote v '
                                .'LEFT JOIN tb_employee e ON v.creatorid=e.id '
                                .'WHERE v.spaceid=? GROUP BY v.creatorid '
                                .'ORDER BY num DESC LIMIT ?;', array($spaceid, $limit));
        return $rs->result_array();
    }

    /**
     * 获取参与投票榜单
     * @param int $spaceid 空间id
     * @param int $limit 获取数量
     */
    public function getJoinList($spaceid, $limit = 10){
        $rs = $this->db->query( 'SELECT vt.employeeid, e.name, COUNT(vt.id) num FROM tb_vote_user vt '
                                .'LEFT JOIN tb_vote v ON vt.voteid=v.id '
                                .'LEFT JOIN tb_employee e ON vt.employeeid=e.id '
                                .'WHERE v.spaceid=? AND vt.role=2 GROUP BY vt.employeeid '
                                .'ORDER BY num DESC LIMIT ?', array($spaceid, $limit));
        return $rs->result_array();
    }

    /**
     * 猜你喜欢【未参加的，参与人数最多的，且正在进行中的,非我创建的投票】
     * @param int $spaceid 空间id
     * @param int $limit 获取数量
     */
    public function getLikeList($spaceid, $employeeid, $limit = 5){
        $rs = $this->db->query( 'SELECT vu.voteid, COUNT(vu.id) num, v.title '
                                .'FROM tb_vote_user vu '
                                .'LEFT JOIN tb_vote v ON vu.voteid=v.id '
                                .'WHERE vu.role=2 AND v.spaceid=? '
                                .'AND v.id NOT IN(SELECT voteid FROM tb_vote_user WHERE employeeid=? AND role=2) '
                                .'AND (v.endtime=0 OR v.endtime>NOW()) '
                                .'AND v.creatorid<>? '
                                .'GROUP BY voteid ORDER BY num DESC LIMIT ?', array($spaceid, $employeeid, $employeeid, $limit));
        return $rs->result_array();
    }

    /**
     * @param $options 选项数组
     * @param $fileIds 附件数组
     * @param $noticeArr 通知人数组
     * @param $spaceId 空间ID
     * @param $groupId 群组ID
     * @param $creatorId 创建者ID
     * @param $title 投票标题
     * @param $voteMemo 投票说明
     * @param $type 投票类型
     * @param $selectType 选项 1:单选,其他数字为最多选几项
     * @param $endTime 结束时间
     * @param int $clientType 信息来源终端
     * @return mixed
     */
    public function addVote($options, $spaceId, $groupId, $creatorId, $title, $voteMemo, $type, $isHasFile,
                            $selectType, $endTime, $fileIds = array(), $clientType = 0){
        $this->db->query('INSERT INTO tb_vote (spaceid,groupid,creatorid,title,votememo,type,ishasfile,
                            selecttype,createtime,endtime,clienttype,totalvotenum,totalusernum)
                          VALUES (?,?,?,?,?,?,?,?,NOW(),?,?,0,0)',array($spaceId, $groupId, $creatorId, $title, $voteMemo,
                            $type, $isHasFile, $selectType, $endTime, $clientType));
        $voteId = $this->db->insert_id();
        if ($voteId) {
            // 创建人保存
            $this->db->query('INSERT INTO tb_vote_user (voteid,employeeid,role,votetime,optionids,status) VALUES (?,?,1,0,0,0)',
                array($voteId, $creatorId));
            //添加投票的选项
            $content = '';
            foreach ($options as $value) {
                $value['vote_id'] = $voteId;
                $value['option_num'] = 0;
                $this->db->query('INSERT INTO tb_vote_options (voteid,optionvalue,optionnum,imageid,imageurl,optionlinkurl)
                                  VALUES (?,?,0,?,?,?)', array($voteId, $value['option_value'], $value['image_id'], $value['image'], $value['image_link']));
                /*if (!empty($value['option_value'])) {
                    $content .= " ".$value['option_value'];
                }*/
            }

            // 附件保存
            if(is_array($fileIds)) {
                foreach($fileIds as $value){
                    $this->db->query('INSERT INTO tb_resource_ref (reftype,refid,resourceid) VALUES (?,?,?)',
                        array(Config_model::OBJECT_TYPE_VOTE, $voteId, $value));
                }
            }
            //群组会话数+1
            if($groupId > 0){
                $this->db->query('UPDATE tb_group SET messagenum=messagenum+1 WHERE id=?', array($groupId));
            }
            $feedId = 0;
           /* //添加动态
            $f = new Feed($this->_qzid);
            $feedid = $f->voteAdd($this->_memberid, $voteid, $groupId, $fileids);

            //创建索引
            if ($feedid) {
                $this->createIndex($this->_qzid, $this->_memberid, $voteid, $data['title'],
                    YyObject::OBJECT_TYPE_VOTE, $data['created'], $content, $this->_baseUrl.'/space/home/detail/feedid/' . $feedid,'','','','','','','','');
            }*/
            return $voteId;//array('voteid' => $voteId, 'feedid' => $feedId);
        }
    }
}