<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: 李胜
 * Date: 13-4-24
 * Time: 下午1:55
 * To change this template use File | Settings | File Templates.
 */

class Speech extends CI_Controller {

    private $spaceid;
    private $employeeid;
    public function __construct(){
        parent::__construct();

        $this->load->helper('cache');
        $this->spaceid = QiaterCache::spaceid();
        $this->employeeid =QiaterCache::employeeid();

        $this->load->model("speech_model","speech");
    }

	public function index()	{
        $this->load->library('smarty');
        $this->smarty->view('employee/speech/index.tpl');
    }

    public function create()
    {
        $this->load->model('app_model', 'app');
        $data['appList'] = $this->app->getAppList($this->spaceid);
        // 群组列表
        $this->load->model('group_model', 'group');
        $data['groupList'] = $this->group->getGroupMenu($this->spaceid, $this->employeeid);//群组列表

        $data['personalInfo'] = QiaterCache::employeeInfo();

        $this->load->library('smarty');
        $this->smarty->view('employee/speech/create.tpl',$data);
    }

    /**
     * 增加发言
     */
    public function addSpeech()
    {
        $createtime = date('Y-m-d H:i:s');
        $groupid = isset ($_POST['groupid']) ? intval(trim($_POST['groupid'])) : 0;
        $content = isset ($_POST['content']) ? trim ($_POST['content']) : '';
        $fileids = isset ($_POST['fileids']) ? trim ($_POST['fileids']) : '';//附件的resourceid集合
        $ishasfile = $fileids == '' ? 0 : 1; //是否有附件
        $originalid = isset ($_POST['originalid']) ? intval(trim($_POST['originalid'])) : 0;
        //turnnum and replynum 因为是新建发言 默认都为0 由数据库直接默认。
        $privacytype = isset ($_POST['privacytype']) ? intval(trim($_POST['privacytype'])) : 0;
        $clienttype = isset ($_POST['clienttype']) ? intval(trim($_POST['clienttype'])) : 0;

        $data = array( 'groupid' => $groupid , 'employeeid' => $this->employeeid , 'content' => $content ,
            'ishasfile' => $ishasfile ,'createtime' => $createtime , 'originalid' => $originalid ,
            'privacytype' => $privacytype , 'clienttype' => $clienttype );
        //获取@对象的集合 todo
        $atArr=array();
        //整理附件集合
        $fileArr = explode(',',$fileids);
        $speechid = $this->speech->addSpeech($data,$this->spaceid,$atArr,$fileArr);

        //漫游空间的  employeeid 集合
        $roamEmployeeIds = isset ($_POST['roamEmployeeIds']) ? trim ($_POST['roamEmployeeIds']) : '';
        $roamEmployeeIdArr = explode(',',$roamEmployeeIds);
        foreach($roamEmployeeIdArr as $eid)
        {
            if($eid){
                $data = array( 'groupid' => 0 , 'employeeid' => $eid , 'content' => $content ,
                    'ishasfile' => $ishasfile ,'createtime' => $createtime , 'originalid' => $originalid ,
                    'privacytype' => $privacytype , 'clienttype' => $clienttype );

                $this->speech->addSpeech($data,$this->spaceid,$atArr,$fileArr);//$this->spaceid todo 需替换
            }
        }

        //新浪微博 同步 todo

        $this->load->model('common_model', 'common');
        $this->common->_ajaxRs(true, array('speechid' => $speechid));
    }

    /**
     * 获取多条发言的信息
     *  speechids 多个发言的ID数组
     */
    public function getSpeechList()
    {
        $speechids = isset ($_POST['speechids']) ? $_POST['speechids'] : array();
        $rt =$this->speech->getSpeechList($speechids);
        echo json_encode($rt) ;
        exit;
    }

    /**
     * 获取某条发言的信息
     *  speechid 发言ID
     */
    public function getSpeech()
    {
        $speechid = isset ($_POST['speechid']) ? intval(trim($_POST['speechid'])) : 0;
        $data = $this->speech->getSpeech($speechid);
        echo json_encode($data) ;
        exit;
    }

    /**
     * 删除发言
     */
    public function delete()
    {
        $feedid = isset ($_POST['feedid']) ? intval(trim($_POST['feedid'])) : 0;
        $speechid = isset ($_POST['speechid']) ? intval(trim($_POST['speechid'])) : 0;
        $query = $this->speech->delete($feedid,$speechid);

        $this->load->model('common_model', 'common');
        if($query == '0'){
            $this->common->_ajaxRs(true, array());
        }
        else{
            $this->common->_ajaxRs(false, array());
        }
    }

    /** 评论数++
     * @param $speechid  发言ID
     */
    public function addReplyNum()
    {
        $speechid = isset($_POST['speechid']) ? trim($_POST['speechid']) : 0;
        $this->speech->addReplyNum($speechid);
    }

    /** 转发数++
     * @param $speechid  发言ID
     */
    public function addTurnNum($speechid)
    {
        $speechid = isset($_POST['speechid']) ? trim($_POST['speechid']) : 0;
        $this->speech->addTurnNum($speechid);
    }

    /**
     * 喜欢发言
     * @param $groupid 群组ID
     * @param $speechid  喜欢发言的ID
     */
    public function like()
    {
        $speechid = isset ($_POST['speechid']) ? intval(trim($_POST['speechid'])) : 0;
        $feedid = isset ($_POST['feedid']) ? intval(trim($_POST['feedid'])) : 0;
        $groupid = isset ($_POST['groupid']) ? intval(trim($_POST['groupid'])) : 0;

        $feedid = $this->speech->operation($this->spaceid,$this->employeeid,$groupid,$speechid,1,$feedid);
        $this->load->model('common_model', 'common');
        $this->common->_ajaxRs(true, array('feedid'=>$feedid));
    }

    /**
     * 取消喜欢
     * @return mixed
     */
    public function cancelLike()
    {
        $speechid = isset ($_POST['speechid']) ? intval(trim($_POST['speechid'])) : 0;

        $this->speech->cancelOperation($speechid,$this->employeeid,1);
        $this->load->model('common_model', 'common');
        $this->common->_ajaxRs(true, array());
    }

    /**
     * 收藏发言
     * @param $groupid 群组ID
     * @param $speechid  喜欢发言的ID
     */
    public function favor()
    {
        $speechid = isset ($_POST['speechid']) ? intval(trim($_POST['speechid'])) : 0;
        $feedid = isset ($_POST['feedid']) ? intval(trim($_POST['feedid'])) : 0;
        $groupid = isset ($_POST['groupid']) ? intval(trim($_POST['groupid'])) : 0;

        $this->speech->operation($this->spaceid,$this->employeeid,$groupid,$speechid,2,$feedid);
        $this->load->model('common_model', 'common');
        $this->common->_ajaxRs(true, array());
        exit;
    }
    /**
     * 取消收藏
     * @return mixed
     */
    public function cancelFavor()
    {
        $speechid = isset ($_POST['speechid']) ? intval(trim($_POST['speechid'])) : 0;

        $this->speech->cancelOperation($speechid,$this->employeeid,2);
        $this->load->model('common_model', 'common');
        $this->common->_ajaxRs(true, array());
    }

    /**
     * 屏蔽发言
     * @param $groupid 群组ID
     * @param $speechid  喜欢发言的ID
     */
    public function forbidden()
    {
        $speechid = isset ($_POST['speechid']) ? intval(trim($_POST['speechid'])) : 0;
        $feedid = isset ($_POST['feedid']) ? intval(trim($_POST['feedid'])) : 0;
        $groupid = isset ($_POST['groupid']) ? intval(trim($_POST['groupid'])) : 0;

        $this->speech->operation($this->spaceid,$this->employeeid,$groupid,$speechid,3,$feedid);
        $this->load->model('common_model', 'common');
        $this->common->_ajaxRs(true, array());
        exit;
    }
    /**
     * 取消屏蔽
     * @return mixed
     */
    public function cancelforbidden()
    {
        $speechid = isset ($_POST['speechid']) ? intval(trim($_POST['speechid'])) : 0;

        $this->speech->cancelOperation($speechid,$this->employeeid,3);
        $this->load->model('common_model', 'common');
        $this->common->_ajaxRs(true, array());
    }

}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */