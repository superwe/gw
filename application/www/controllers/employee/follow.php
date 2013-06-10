<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: ZhaiYanBin
 * Date: 13-4-18
 * Time: 上午10:24
 * To change this template use File | Settings | File Templates.
 */
class Follow extends CI_Controller {

    public function __construct(){
        parent::__construct();
        $this->input->get_post(NULL, TRUE);
    }

    /**
     * 加关注、取消关注
     */
    public function ajaxFollow(){
        $this->load->helper('cache');
        $spaceid = QiaterCache::spaceid();//当前空间ID
        $employeeid  = QiaterCache::employeeid();//当前用户ID

        $returnData = array('rs' => false, 'error' => '操作已完成', 'data' => '', 'type' => '');
        $op = isset($_GET['op']) ? intval($_GET['op']) : 0; //动作类型，1-加关注，0-取消关注
        $followid = isset($_GET['followid']) ? $_GET['followid'] : 0; //关注对象ID
        $followtype = isset($_GET['followtype']) ? intval($_GET['followtype']) : 0; //关注对象类型
        if(is_numeric($followid)){
            $followid = array($followid);
        } else if(is_string($followid)){
            $followid = explode(',', $followid);
        }
        $followIds = array_map('intval', $followid);

        $this->load->model('follow_model', 'followM');
        foreach($followIds as $k => $followid){
            if($followid == $employeeid && $followtype == $this->config->item('object_type_member','base_config') ){
                continue;
            }
            if($op == 1){//加关注
                $status = $this->followM->isHaveFollow($employeeid, $followid, $followtype);//判断是否已经关注
                if(!$status){
                    $result = $this->followM->addFollow($employeeid, $followid, $followtype);//添加关注
                    if($result && ($followtype == $this->config->item('object_type_files','base_config'))){
                        //如果关注的是文档，文档表关注数自增 add by shiying 2013/05/09
                        $this->load->model("file_model","filemodel");
                        $udata['follownum'] = "follownum+1";
                        $uwhere = array("id = '".$followid."'");
                        $this->filemodel->updateTable("tb_file",$udata,$uwhere);
                    }
                    if($result){//成功，发送通知
                        $this->load->model('notice_model', 'noticeM');
                        $this->noticeM->makeUpFollowNoticeData($employeeid, $followid, $followtype);
                    }
                }
            } else{//取消关注
                $result = $this->followM->cancelFollow($employeeid, $followid, $followtype);
                if($result && ($followtype == $this->config->item('object_type_files','base_config'))){
                    //如果关注的是文档，文档表关注数自减 add by shiying 2013/05/09
                    $this->load->model("file_model","filemodel");
                    $udata['follownum'] = "follownum-1";
                    $uwhere = array("id = '".$followid."'");
                    $this->filemodel->updateTable("tb_file",$udata,$uwhere);
                }
            }
        }
        exit(json_encode(array('rs' => true, 'error' => '操作已完成', 'data' => '', 'type' => '')));
    }
}