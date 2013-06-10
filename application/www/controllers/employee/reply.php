<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: shiying
 * Date: 2013/4/18
 * To change this template use File | Settings | File Templates.
 */

class Reply extends CI_Controller {
    private $spaceid;
    private $employeeid;

    public function __construct(){
        parent::__construct();
        $this->load->helper('cache');
        $this->spaceid = QiaterCache::spaceid();//获取空间ID
        $this->employeeid = QiaterCache::employeeid();//获取当前用户ID
    }

    /**
     * 添加回复
     */
    public function add(){
        $targetid = isset($_POST['targetid'])?intval($_POST['targetid']):0;
        $module = isset($_POST['module'])?intval($_POST['module']):0;
        $fromurl = isset($_POST['fromurl'])?trim($_POST['fromurl']):$_SERVER['HTTP_REFERER'];
        $replyid = isset($_POST['replyid'])?intval($_POST['replyid']):0;
        $content = trim($_POST['replycontent']);
        $parentreplyid = $parentemployeeid = 0;
        $this->load->model("common_model","commonmodel");
        if(empty($content)){
            $this->commonmodel->_ajaxRs(false,'','','reply');
        }
        $this->load->model("reply_model","replymodel");
        if($replyid){
            $replyinfo = $this->replymodel->getReplyById($replyid);
            if(empty($replyinfo)){
                $this->commonmodel->_ajaxRs(false,'','参数错误！','replyto');
            }
            $parentreplyid = $replyinfo['id'];
            $parentemployeeid = $replyinfo['employeeid'];
        }
        $replytime = date("Y-m-d H:i:s");
        $keys = array("spaceid","targetid","module","replyemployeeid","replytime","content","parentreplyid","parentemployeeid");
        $values = array("'$this->spaceid'","'$targetid'","'$module'","'$this->employeeid'","'$replytime'","'$content'","'$parentreplyid'","'$parentemployeeid'");

        $insetid = $this->replymodel->insertTable("tb_reply",$keys,$values);
        if($insetid){
            //文档表评论数自增
            if($module == $this->config->item('object_type_files','base_config')){
                $this->load->model('file_model', 'filemodel');
                $file = $this->filemodel->getFileById($targetid);
                if($file['ancestorids']){
                    $ancestorids = substr($file['ancestorids'],1);
                    if($ancestorids){
                    $ancestoridsArr = explode("|",$ancestorids);
                    $parentid = $ancestoridsArr['0'];
                    }else{
                    $parentid = $targetid;
                    }
                }else{
                    $parentid = $targetid;
                }
                if($parentid){
                    $uvalue['commentnum'] ="commentnum  +1";
                    $uwhere = array("ancestorids Like '|".$parentid."|%'"," OR id = '".$parentid."'");
                    $this->filemodel->updateTable("tb_file",$uvalue,$uwhere);
                }
                //发通知
                $this->load->model("notice_model","noticemodel");
                $content = "评论了文档";
                $file_object_type = $this->config->item('object_type_files','base_config');
                $nt_file_reply = $this->config->item('nt_files_reply','notice_config');
                //$spaceId, $authorId, $targetId, $module, $template, $objectId, $objectType, $content = ''
                $this->noticemodel->addNotice($this->spaceid,$this->employeeid,$targetid,$file_object_type,$nt_file_reply,$file['creatorid'],1,$content);
                if($parentreplyid && $parentemployeeid){
                    $content = "回复了您对文档的回复";
                    $nt_files_replymember = $this->config->item('nt_files_replymember','notice_config');
                    $this->noticemodel->addNotice($this->spaceid,$this->employeeid,$targetid,$file_object_type,$nt_files_replymember,$parentemployeeid,1,$content);
                }
            }
            $this->commonmodel->_ajaxRs(true, array('replyid'=>$insetid), '', 'reply');
        }
        $this->commonmodel->_ajaxRs(false,'','','reply');
    }

    /**
     * 点击回复按钮的时候回调刚插入的评论
     */
    public function getone(){
        $id = isset($_GET['id'])?$_GET['id']:0;
        $this->load->model("reply_model","replymodel");
        $replyinfo = $this->replymodel->getReplyById($id);
        if($replyinfo){
            $fromarr = array('0'=>'网页','1'=>'IOS','2'=>'安卓','3'=>'WP','4'=>'桌面端');
            $replyinfo['from_org'] = $fromarr[$replyinfo['clienttype']];
            $replyinfo['parentname'] = "";
            if($replyinfo['parentemployeeid']){
                $this->load->model("employee_model","employeemodel");
                $parentInfo = $this->employeemodel->getEmployeeInfo($replyinfo['parentemployeeid'],"name");
                $replyinfo['parentname'] = $parentInfo['name'];
            }
        }
        $data['reply'] = $replyinfo;
        $this->load->library('smarty');
        $this->smarty->view('employee/file/getone.tpl', $data);
    }

    /**
     * 点击更多按钮操作
     */
    public function getmore(){
        $module = isset($_POST['module'])?intval($_POST['module']):0;
        $allversionStr = isset($_POST['allversionStr'])?$_POST['allversionStr']:'';
        $perpage = 6;
        $showpage = isset($_POST['showpage'])?intval($_POST['showpage']):1;
        $showpage<1 && $showpage = 1;
        $start = ($showpage-1)*$perpage;

        $this->load->model("reply_model","replymodel");
        $replyList = $this->replymodel->getReply($this->spaceid,$allversionStr,$module,0,$start,$perpage);
        if($replyList){
            $fromarr = array('0'=>'网页','1'=>'IOS','2'=>'安卓','3'=>'WP','4'=>'桌面端');
            foreach($replyList as $key=>$value){
            $replyList[$key]['imageurl'] = $this->config->item('resource_url').$value['imageurl'];
            $replyList[$key]['from_org'] = $fromarr[$value['clienttype']];
            }
        }
        $data['replyList'] = $replyList;
        $this->load->library('smarty');
        $this->smarty->view('employee/file/getmorereply.tpl', $data);
    }

    /**
     * 删除回复
     */
    public function delreply(){
        $fileid  = isset($_GET['fileid'])?intval($_GET['fileid']):0;
        $replyid = isset($_GET['replyid'])?intval($_GET['replyid']):0;
        $module  = isset($_GET['module'])?intval($_GET['module']):'';
        $this->load->model("common_model","commonmodel");
        $url = "/employee/file/view?fileid=".$fileid;
        if(!$fileid && !$replyid){
            $this->commonmodel->_ajaxRs(false,'','参数错误！','delreply');
        }
        //删除回复
        $this->load->model("reply_model","replymodel");
        $replyInfo = $this->replymodel->getInfoByReplyId($replyid, 'targetid,module');
        $affected = $this->replymodel->delreply($replyid);
        if($affected){
            //如果是文档评论
            if($module == $this->config->item('object_type_files','base_config')){
                //文档表回复数自减
                $this->load->model("file_model","filemodel");
                $udata['commentnum'] = "commentnum-1";
                $uwhere = array("id = '".$fileid."'");
                $this->filemodel->updateTable("tb_file",$udata,$uwhere);
            }
            //如果是发言，则回复数-1
            $speechModule = $this->config->item('object_type_speech','base_config');
            if($replyInfo['module'] == $speechModule){
                $this->load->model("speech_model","speechM");
                $this->speechM->minusReplyNum($replyInfo['targetid']);
            }
            $this->commonmodel->_ajaxRs(true,'','删除成功！','delreply');
        }else{
            $this->commonmodel->_ajaxRs(false,'','删除失败！','delreply');
        }
    }
    
    /**
     * 获取回复列表@ZhaiYanBin
     */
    public function ajaxGetReplyList(){
        $this->input->get_post(NULL, TRUE);
        $targetId = isset($_REQUEST['targetId']) ? intval($_REQUEST['targetId']) : 0;//对象ID
        $module = isset($_REQUEST['module']) ? intval($_REQUEST['module']) : 0;//对象类型
        $speechModule = $this->config->item('object_type_speech','base_config');//发言对象(特殊判断)
        $showReplyOnly = isset($_REQUEST['showReplyOnly']) ? intval($_REQUEST['showReplyOnly']) : 0;//1则只显示回复列表，喜欢、收藏的信息不显示
        if($module == $speechModule){
            $this->load->model("speech_model","speechM");
            $speechInfo = $this->speechM->getSpeechInfo($targetId, 'employeeid, privacytype');
        }
        //分页
        $perpage = 10;
        $page = empty($_REQUEST['page']) ? 0 : intval($_REQUEST['page']);
        $page<1 && $page = 1;
        $offset = ($page - 1) * $perpage;

        //回复列表
        $replyList = $parentEmployee = $files = $employeeIds = array();
        $this->load->model("reply_model","replyM");
        if( isset($speechInfo) && $speechInfo['privacytype'] == 2 && $speechInfo['employeeid'] != $this->employeeid ){
            $employeeIds = array($speechInfo['employeeid'], $this->employeeid);
        }
        $replyTotal = $this->replyM->getReplyTotalByTargetIdAndModule($this->spaceid, $targetId, $module, $employeeIds);
        $replyList = $this->replyM->getReplyListByTargetIdAndModule($this->spaceid, $targetId, $module, $employeeIds, $perpage, $offset);
        foreach($replyList as $k => $v){
            $replyList[$k]['image'] = $replyList[$k]['files'] = array();
            $v['parentreplyid'] > 0 ? array_push($parentEmployee, $v['parentemployeeid']) : '';//父回复人
            $v['ishasfile'] > 0 ? array_push($files, $v['id']) : '';//引用了资源(附件)
        }
        //获取被回复人信息
        if($parentEmployee){
            $this->load->model("employee_model","employeeM");
            $temp = $this->employeeM->getEmployeeNameByIds( implode(',', $parentEmployee) );
            $parentEmployee = array();
            foreach($temp as $k => $v){
                $parentEmployee[$v['id']] = $v['name'];
            }
        }
        //获取资源列表
        if($files){
            $this->load->model("resource_model","resourceM");
            $refIds = implode(',', $files);//引用资源的对象ID(回复ID)
            $reftype = $this->config->item('object_type_reply','base_config');//引用资源类型(回复的标识ID)
            $files = $this->resourceM->getResourceListByRefIdANDRefType($refIds, $reftype);
            foreach($files as $k => $v){
                if(in_array($v['filetype'], array('jpg','jpeg','gif','png','bmp')) ){
                    $replyList[$v['refid']]['image'][] = array(
                        'view' => '',
                        'id' => $v['id'],
                        'filepath' => $this->config->item('resource_url') . $v->url
                    );
                } else{
                    $replyList[$v['refid']]['files'][] = array(
                        'id' => $v['id'],
                        'title' => $v['name']. '.' . $v['filetype'],
                        'ext' => $v['filetype']
                    );
                }
            }
        }
        foreach($replyList as $k => $v){
            $replyList[$k]['parentEmployeeName'] = isset($parentEmployee[$v['parentemployeeid']]) ? $parentEmployee[$v['parentemployeeid']] : '';
        }
        //喜欢、收藏相关数据
        $like = $collect = array();
        if($showReplyOnly == 0){
            $this->load->model('feed_model', 'feedM');
            //喜欢的人
            $temp = $this->feedM->getLikeList($targetId, $module);
            foreach($temp as $v){
                $like[$v['id']] = $v['name'];
            }
            //收藏的人
            $temp = $this->feedM->getCollectList($targetId, $module);
            foreach($temp as $v){
                $collect[$v['id']] = $v['name'];
            }
        }
        //整理返回数据
        $returnData = array(
            'like' => $like,
            'collect' => $collect,
            'page' => $page + 1,
            'module' => $module,
            'targetid' => $targetId,
            'more' => ($offset + count($replyList)) < $replyTotal ? 1 : 0,//是否显示更多
            'reply' => array_values($replyList)
        );
        //print_r($returnData);
        echo json_encode($returnData);
        exit();
    }

    /**
     * 添加回复@ZhaiYanBin
     */
    public function ajaxAddReply(){
        $data['spaceid'] = $this->spaceid;
        $data['replyemployeeid'] = $this->employeeid;
        $data['content'] = isset($_POST['content']) ? trim($_POST['content']) : '';//回复内容
        $data['ishasfile'] = isset($_POST['fids']) && trim($_POST['fids']) ? 1 : 0;//有无附件
        $data['parentreplyid'] = isset($_POST['parentreplyId']) ? intval($_POST['parentreplyId']) : 0;//父级回复的ID
        $data['parentemployeeid'] = isset($_POST['parentemployeeId']) ? intval($_POST['parentemployeeId']) : 0;//父级回复的人员ID
        $data['targetid'] = isset($_POST['targetId']) ? intval($_POST['targetId']) : 0;//产生动态的对象id
        $data['module'] = isset($_POST['module']) ? intval($_POST['module']) : 0;//产生动态的对象类型
        $data['replytime'] = date('Y-m-d H:i:s');

        if(!$data['module'] || !$data['targetid'] || !$data['content']){
            echo json_encode( array('rs' => false, 'data' => array(), 'msg' => '必要参数错误！') );
            exit();
        }
        //查找父级回复的信息
        $this->load->model("reply_model", "replyM");
        if($data['parentreplyid']){
            $replyinfo = $this->replyM->getInfoByReplyId($data['parentreplyid'], 'spaceid,targetid,module');
            if( !$replyinfo || ($replyinfo['spaceid'] != $data['spaceid']) || ($replyinfo['targetid'] != $data['targetid']) || ($replyinfo['module'] != $data['module']) || ($replyinfo['replyemployeeid'] != $data['parentemployeeid']) ){
                echo json_encode( array('rs' => false, 'data' => array(), 'msg' => '回复参数错误！') );
                exit();
            }
        }
        //插入回复
        foreach($data as $k => $v){
            $keys[] = $k;
            $values[] = "'{$v}'";
        }
        $replyId = $this->replyM->insertTable("tb_reply", $keys, $values);
        if($replyId){
            //如果是发言，则回复数+1
            $speechModule = $this->config->item('object_type_speech','base_config');//发言对象(特殊判断)
            if($data['module'] == $speechModule){
                $this->load->model("speech_model","speechM");
                $this->speechM->addReplyNum($data['targetid']);
            }
            //发送通知
            if($this->employeeid != $data['parentemployeeid']){ //不给自己发通知
                $this->load->model("notice_model", "noticeM");
                $module = $this->config->item('object_type_reply', 'base_config');
                $template = $this->config->item('nt_reply_add', 'notice_config');;
                $this->noticeM->addNotice($this->spaceid, $this->employeeid, $replyId, $module, $template, $data['parentemployeeid'], 1, '回复了评论');
            }
            //返回相关数据
            $imgHost = $this->config->item('resource_url');
            $employeeInfo = QiaterCache::employeeInfo();//当前登录用户信息
            $this->load->model("employee_model", "employeeM");
            $parentEmployeeInfo = $this->employeeM->getEmployeeInfo($data['parentemployeeid'], 'name');//被回复人姓名
            $returnData = array(
                'replyId' => $replyId,
                'employeeId' => $this->employeeid,
                'avatar' => $imgHost . ($employeeInfo['imageurl'] ? $employeeInfo['imageurl'] : 'qz/default_avatar.thumb.jpg'),
                'employeeName' => $employeeInfo['name'],
                'parentEmployeeId' => $data['parentemployeeid'],
                'parentEmployeeName' => isset($parentEmployeeInfo['name']) && $parentEmployeeInfo['name']  ? $parentEmployeeInfo['name'] : '',
                'content' => $data['content'],
                'replyTime' => $data['replytime'],
                'clientType' => '网页'
            );
            echo json_encode( array('rs' => true, 'data' => $returnData, 'msg' => '操作成功！') );
            exit();
        }
        echo json_encode( array('rs' => false, 'data' => array(), 'msg' => '回复失败！') );
        exit();
    }
}
