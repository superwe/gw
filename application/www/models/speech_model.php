<?php
/**
 * Created by JetBrains PhpStorm.
 * User: 李胜
 * Date: 13-4-24
 * Time: 下午1:55
 * To change this template use File | Settings | File Templates.
 */

class Speech_model extends CI_Model{

    private $object_type_speech='';
    private $ft_speech_add='';
    private $ft_speech_like = '';
    private $ft_speech_favor = '';
    private $resource_url = '';

    public function __construct(){
        $this->load->database('default');
        $this->object_type_speech = $this->config->item('object_type_speech', 'base_config');
        $this->ft_speech_add = $this->config->item('ft_speech_add', 'feed_config');
        $this->ft_speech_like = $this->config->item('ft_speech_like', 'feed_config');
        $this->ft_speech_favor = $this->config->item('ft_speech_favor', 'feed_config');
        $this->resource_url = $this->config->item('resource_url');
    }

    /**
     * @param $data  发言的基础数据
     * @param $spaceid 空间ID集合
     * @param $atArr @ 的对象集合
     * @param $fileArr 附件的ID集合
     * @return int
     */
    public function addSpeech($data,$spaceid,$atArr,$fileArr)
    {
        $this->db->trans_begin();

        $sql = $this->db->insert_string('tb_speech', $data);
        $this->db->query($sql);
        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
            return -1;
        }
        $speechid = $this->db->insert_id();

        //如果仅@人可见  需要往权限表里加数据
        $privacy = [];
        if($data['privacytype'] != '0'){
            foreach($atArr as $key => $value)
            { //todo

            }
        }

        //如果有附件 增加资源和发言的对应关系
        if(count($fileArr)>0){
            $this->load->model('resource_model', 'resource');
            $this->resource->saveResourceRef($this->object_type_speech,$speechid,$fileArr);
        }

        // 添加动态
        $this->load->model('feed_model', 'feed');
        $isprivate = $data['privacytype'] != '0' ? 1 : 0 ;
        $this->feed->addFeed($spaceid, $data['employeeid'], $speechid, $this->object_type_speech, $this->ft_speech_add, $data['groupid'], $isprivate,$privacy);

        //添加通知 todo

        $this->db->trans_commit();//提交

        // 添加索引
        $this->load->model('indexes_model', 'indexes');
        $type = 'speech';
        $indexData = array('id' => $speechid, 'spaceid' => $spaceid, 'employeeid' => $data['employeeid'],'url' => 'employee/speech/info?sid='.$speechid, 'date' => $data["createtime"], 'title' => $data['content'], 'content' => '');
        $this->indexes->create($type, $indexData);

        return $speechid;
    }



    /** 获取多条发言明细
     * @param  $speechids 发言IDs
     */
    public function getSpeechList($speechids)
    {
        $rt = [] ;
        foreach($speechids as $value){
            $data = $this->getSpeech($value);
            if($data){
                //通过speechid 可以获取对应发言信息的 才被添加到返回结果中
                $rt[$value] = $data;
            }
        }
        return $rt;
    }

    /** 获取某条发言明细
     * @param  $speechid 发言ID
     */
    public function getSpeech($speechid)
    {
        $data = [] ;

        //获取当前登陆用户的ID
        $this->load->helper('cache');
        $currEmployeeId =QiaterCache::employeeid();

        $querySpeech = $this->db->query(
            'select a.id,a.groupid,b.name as groupname,a.employeeid,c.name as employeename,c.imageurl,a.content,a.ishasfile,a.createtime,
            a.originalid,a.turnnum,a.replynum,a.privacytype,a.clienttype from tb_speech as a
            left join tb_group as b on a.groupid=b.id left join tb_employee as c on a.employeeid = c.id
            where a.id = ? ',array($speechid));

        if($querySpeech->num_rows() == 0){
            //此条发言已经被发言人删除  或者被和谐了
            return $data;
        }
        $data['viewerId'] = $currEmployeeId;//当前浏览者ID

        $data['speech'] =$querySpeech->row() ;//发言明细
        if($data['speech']->imageurl){
            $data['speech']->imageurl = $this->resource_url.$data['speech']->imageurl;
        }

        if($data['speech']->groupid == "0"){
            $spaceInfo = QiaterCache::spaceInfo();
            $data['speech']->groupname = $spaceInfo['name'];
        }

        $originalid = $data['speech']->originalid ;
        $data['originalData'] = [];
        if($originalid != "0"){
            $data['originalData'] = $this->getSpeech($originalid);
        }

        //获取发言附件
        $data['imageList'] = [];
        $data['fileList'] = [];
        $picType = array('jpg', 'jpeg', 'gif', 'png','bmp');
        if($querySpeech->row()->ishasfile){
            $this->load->model('resource_model','resource');
            $resource = $this->resource->getTargetResources($this->object_type_speech,$speechid);

            foreach($resource as $row){
                $resource_item = [];
                if(in_array($row->filetype,$picType)){ //图片
                    $resource_item['view'] ='';
                    $resource_item['id'] =$row->id;
                    $resource_item['filepath'] = $this->resource_url.$row->url;

                    array_push($data['imageList'],$resource_item);
                }
                else{
                    $resource_item['id'] =$row->id;
                    $resource_item['title'] =$row->name.'.'.$row->filetype;
                    $resource_item['ext'] = $row->filetype;

                    array_push($data['fileList'],$resource_item);
                }
            }
        }

        //获取此条发言的喜好
        $queryOperate = $this->db->query(
            'select operationtype from tb_feed_user_operation where targetid=? and module=? and employeeid=?
            and operationtype<>3',array($speechid,$this->object_type_speech,$currEmployeeId));

        $data['islike'] = 0;
        $data['isfavor'] =0;
        if($queryOperate->num_rows()>0){
            foreach($queryOperate->result() as $row){

                if($row->operationtype == '1'){
                    $data['islike'] = 1;
                }
                else if ($row->operationtype == '2'){
                    $data['isfavor'] = 1;
                }
            }
        }

        return $data;
    }

    /** 删除发言 及相关
     * @param $feedid 动态ID
     * @param $speechid 发言ID
     * @return int
     */
    public function delete($feedid,$speechid)
    {
        $object_type_speech = $this->config->item('object_type_speech', 'base_config');

        $this->db->trans_begin();
        // 删除动态
        $this->load->model('feed_model', 'feed');
        $this->feed->deleteFeed($feedid);
        // 删除发言
        $this->db->query('delete from tb_speech where id =?',array($speechid));
        //删除回复
        $this->load->model('reply_model', 'reply');
        $this->reply->delTargetReply($speechid,$object_type_speech);

        //删除索引
        $this->load->model('indexes_model', 'indexes');
        $this->indexes->deleteById('speech', $speechid);

        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
            return -1;
        }else{
            $this->db->trans_commit();
            return 0;
        }
    }

    /** 评论数++
     * @param $speechid  发言ID
     */
    public function addReplyNum($speechid)
    {
        $this->db->query('update tb_speech set replynum = replynum+1 where id =?',array($speechid));
        return $this->db->affected_rows();
    }
    /** 评论数--
     * @param $speechid  发言ID
     */
    public function minusReplyNum($speechid)
    {
        $this->db->query('update tb_speech set replynum = replynum-1 where id =?',array($speechid));
        return $this->db->affected_rows();
    }

    /** 转发数++
     * @param $speechid  发言ID
     */
    public function addTurnNum($speechid)
    {
        $this->db->query('update tb_speech set turnnum = turnnum+1 where id =?',array($speechid));
        return $this->db->affected_rows();
    }

    /** 转发数--
     * @param $speechid  发言ID
     */
    public function minusTurnNum($speechid)
    {
        $this->db->query('update tb_speech set turnnum = turnnum+1 where id =?',array($speechid));
        return $this->db->affected_rows();
    }

    /**
     * 根据发言ID获取发言信息
     * author ZhaiYanBin
     * @param int $id       发言ID
     * @param string $cols  获取的字段
     */
    public function getSpeechInfo($id = 0, $cols = '*'){
        $rs = $this->db->query("SELECT {$cols} FROM tb_speech WHERE id =?", array($id));
        return $rs->row_array();
    }

    /**
     * 喜欢 收藏 或 屏蔽发言
     * @param $spaceid 空间ID
     * @param $employeeid 当前人员ID
     * @param $groupid 群组ID
     * @param $speechid  喜欢发言的ID
     * @param $operationtype 操作类型 1喜欢 2收藏 3屏蔽
     * @param $feedid 喜欢 收藏 或屏蔽的动态ID
     * @return 成功返回 0  失败返回-1
     * add by lisheng
     * 2013-05-14
     **/
    public function operation($spaceid,$employeeid,$groupid,$speechid,$operationtype,$feedid)
    {
        $this->db->trans_begin();
        // 添加动态
        $this->load->model('feed_model', 'feed');
        $isprivate =  0 ;
        $privacy = array();

        $operation = '';
        if($operationtype == "1"){ //喜欢
            $operation = $this->ft_speech_like;
        }
        else  if($operationtype == "2"){ //收藏
            $operation = $this->ft_speech_favor;
        }

        if($operationtype != "3"){  //屏蔽不插入动态
            $this->feed->addFeed($spaceid,$employeeid, $speechid, $this->object_type_speech, $operation,$groupid, $isprivate,$privacy);
        }

        //添加通知 todo

        $this->db->query('insert into tb_feed_user_operation (feedid,targetid,module,employeeid,operationtype)
                                values (?,?,?,?,?)',array($feedid,$speechid, $this->object_type_speech,$employeeid,$operationtype));

        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
            return -1;
        }else{
            $this->db->trans_commit();
            return $feedid;
        }

    }

    /**
     * 取消 喜欢 收藏 或 屏蔽发言
     * @param $feedid       动态ID
     * @param $speechid     发言ID
     * @param $employeeid   人员ID
     * @param $operationtype操作类型 1喜欢 2收藏 3屏蔽
     * @return 成功返回 0  失败返回-1
     * add by lisheng
     * 2013-05-14
     */
    public function cancelOperation($speechid,$employeeid,$operationtype)
    {
        $this->db->trans_begin();

        $operation = '';
        if($operationtype == "1"){ //喜欢
            $operation = $this->ft_speech_like;
        }
        else  if($operationtype == "2"){ //收藏
            $operation = $this->ft_speech_favor;
        }
        if($operationtype != "3"){
            $this->db->query('delete from tb_feed where creatorid = ? and targetid=? and template=?',array($employeeid,$speechid,$operation));
        }
        $this->db->query('delete from tb_feed_user_operation where targetid=? and module=? and employeeid=?
                        and operationtype=?', array($speechid,$this->object_type_speech,$employeeid,$operationtype));

        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
            return -1;
        }else{
            $this->db->trans_commit();
            return 0;
        }
    }

    /**
     *  获得喜欢或收藏的数据
     * @param $ids  发言的id集合
     * add by lisheng
     * 2013-05-13
     */
    public function getLikeOrFavorList($ids)
    {
        $data = [];
        $speechids = implode(",", $ids);
        $query = $this->db->query('select a.id,a.employeeid as feedCreator,b.name as feedCreatorName,a.content as feedContent, a.content as title,
                    a.createtime from tb_speech a left join tb_employee b on a.employeeid = b.id
                    where a.id in ('.$speechids.')');

        foreach ($query->result_array() as $row)
        {
            $data[$row['id']] = $row;
        }

        return $data;
    }

}