<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: shiying
 * Date: 2013/4/1
 * To change this template use File | Settings | File Templates.
 */

class File extends CI_Controller {
    private $spaceid;
    private $employeeid;
    private $isadmin;
    private $showfolder;
    private $file_object_type;
    private $member_object_type;
    private $group_object_type;
    private $ft_files_add;
    private $ft_files_edit;
    private $ft_files_down;
    private $ft_files_follow;
    private $ft_files_share;
    private $nt_files_share;
    private $nt_files_sharedel;
    private $resource_url;

    public function __construct(){
        parent::__construct();
        $sessionId = (isset($_POST['session_id']) && !empty($_POST['session_id']))? $_POST['session_id'] : $this->input->cookie('session_id');

        //从缓存获得空间ID
        $this->spaceid = QiaterCache::spaceid('', $sessionId);
        $this->employeeid = QiaterCache::employeeid('', $sessionId);

        $this->isadmin    = 1;//是否是管理员
        $this->showfolder = 1;//是否显示文件夹

        $this->file_object_type   = $this->config->item('object_type_files','base_config');
        $this->member_object_type = $this->config->item('object_type_member','base_config');
        $this->group_object_type  = $this->config->item('object_type_group','base_config');

        $this->ft_files_add       = $this->config->item('ft_files_add','feed_config');//上传文档动态
        $this->ft_files_edit       = $this->config->item('ft_files_edit','feed_config');//更新文档动态
        $this->ft_files_down      = $this->config->item('ft_files_down','feed_config');//下载文档动态
        $this->ft_files_follow    = $this->config->item('ft_files_follow','feed_config');//关注文档动态
        $this->ft_files_share     = $this->config->item('ft_files_share','feed_config');//共享文档动态

        $this->nt_files_share     = $this->config->item('nt_files_share','notice_config');//文件共享通知
        $this->nt_files_sharedel  = $this->config->item('nt_files_sharedel','notice_config');//取消文件共享通知
        $this->nt_files_edit      = $this->config->item('nt_files_edit','notice_config');//取消文件共享通知

        $this->resource_url       = $this->config->item('resource_url');
    }
    /**
     * 文库首页展示
     */
    public function index(){
        $data = $this->leftshow();
        $data['employeeid']  = $this->employeeid;
        $this->load->library('smarty');
        $this->smarty->view('employee/file/index.tpl',$data);
    }

    /**
     * 展示左侧菜单
     * @return mixed
     */
    public function leftshow(){
        //传递参数 flash上传使用
        $sessionId=$this->input->cookie('session_id');
        $qiater_user=$this->input->cookie('qiater_user');
        $data['sessionid']   = $sessionId;
        $data['qiater_user'] = $qiater_user;

        $data['isadmin'] = $this->isadmin;//是否是管理员
        $data['showfolder'] = $this->showfolder;//是否有权限查看企业文件夹
        $spaceid = $this->spaceid;//test
        $employeeid = $this->employeeid;

        $this->load->model('file_model', 'filemodel');
        //个人文档
        $personbox = $this->filemodel->getFolder($spaceid, 1,0,$employeeid);
        $groupbox   = $this->filemodel->getFolder($spaceid, 2,0);
        if($groupbox){
            foreach($groupbox as $key=>$value){
            $pgroupbox = $this->filemodel->getFolder($spaceid,2,$value['id']);//左侧企业文档二级
            $groupbox[$key]['pbox'] = $pgroupbox;
            }
        }
        //企业文件夹权限暂时取消
        //我的群组列表
        $this->load->model("group_model","groupmodel");
        $grouplist = $this->groupmodel->getEmployeeGroupList($this->spaceid,$this->employeeid);
        $data['grouplist'] = $grouplist;
        $p1 = isset($_GET['p1'])?trim($_GET['p1']):'';
        $p2 = isset($_GET['p2'])?trim($_GET['p2']):'';

        $data['p1'] = $p1;
        $data['p2'] = $p2;
        $data['filesearch'] = '';
        $data['personbox'] = $personbox;
        $data['groupbox'] = $groupbox;
        $data['rscallback'] = isset($_GET['_rscallback'])?$_GET['_rscallback']:'';
        $data['rscallbackflag'] = isset($_GET['_rscallbackflag'])?$_GET['_rscallbackflag']:'';
        return $data;
    }

    /**
     * ajax返回值
     * @param boolean $rs 调用是否成功
     * @param array $data 返回数据
     * @param string $error 错误信息
     * @param string $type	类型
     */
    protected function _ajaxRs($rs, $data = array(), $error = '', $type = '') {
        $this->load->model("common_model","commonmodel");
        $this->commonmodel->_ajaxRs($rs,$data,$error,$type);
    }

    /**
     * 跳转
     * @param $url 地址
     * @param $msg 信息
     * @param int $wrongFlag 是否是错误提示 1 是
     */
    public function redirect($url,$msg,$wrongFlag = 0){
        $this->load->model("common_model","commonmodel");
        $this->commonmodel->_redirect($url,$msg,$wrongFlag);
        exit;
    }

    /**
     * 他人共享
     */
    public function getAjaxShare(){
        $tableInfo = array();
        $this->load->model('file_model', 'filemodel');
        $this->load->model('employee_model', 'employeemodel');
        //排序
        $paixu = isset($_GET['paixu'])?$_GET['paixu']:'createtime';
        if(in_array($paixu,array('downnum','createtime','follownum','commentnum','sharetime'))){
            if($paixu == 'sharetime'){
            $paixu = "FS.".$paixu;
            }else{
            $paixu = "F.".$paixu;
            }
        }else{
            $paixu = "F.createtime";
        }
        if($paixu){
            $oderby = $paixu;
        }else{
            //查询用户是否已经设置了默认排序
        }
        $orwhere = array();
        $andwhere = array("F.spaceid='".$this->spaceid."'","F.isvisible = 1","FS.toid = '".$this->employeeid."'","F.isleaf = 1","SF.reftype = '$this->file_object_type' ");

        //直接搜索
        $filesearch = isset($_GET['filesearch'])?trim($_GET['filesearch']):'';
        $searchtype = isset($_GET['searchtype']) ? trim($_GET['searchtype']) : 'title';
        if($filesearch){
            if($searchtype == 'title'){
            //按标题搜索
            array_push($andwhere,"F.title LIKE '".$filesearch."'");
            }elseif($searchtype == 'keyword'){
            //话题搜索 TODO
            }elseif($searchtype == 'name'){
            //按用户名搜索
            $memberInfo = $this->employeemodel->getEmployeeInfoByNameAndEmail("id",$filesearch);
            $getuids = array();
            if($memberInfo){
                foreach($memberInfo as $value){
                $getuids[] = $value['id'];
                }
            }
            $uid_strs = 0;
            if($getuids){
                $uid_strs = implode(',',$getuids);
            }
            array_push($andwhere,"F.creatorid IN($uid_strs)");
            }
        }
        //类型搜索
        $fileextArr  = isset($_GET['fileext'])?strtolower($_GET['fileext']):'';
        $extStr = $this->searchFiletype($fileextArr);
        if($extStr){
            array_push($andwhere,$extStr);
        }
        //分页
        $perpage = empty($_GET['per'])?10:intval($_GET['per']);
        $page = empty($_GET['p'])?0:intval($_GET['p']);

        $gettotal =isset($_GET['total'])?$_GET['total']:0;
        $page<1 && $page = 1;
        $start = ($page-1)*$perpage;

        $getfiles = $this->filemodel->getShareFiles($andwhere,$orwhere,$oderby,$perpage,$start);//获取他人共享列表
        $allFiles  = $this->filemodel->getShareFiles($andwhere,$orwhere,$oderby);//获取他人共享总数
        foreach($getfiles as $key=>$value){
            $new_imageurl = $this->resource_url.$value['imageurl'];
            $allowType = array('doc','docx','ppt','pptx','xls','xlsx','pot','potx','pps','ppsx','wps','wpsx','dps','wpt','dpt','txt','pdf', 'rar', 'zip', 'mp3', 'flv', 'wma', 'csv', 'csvx', 'mdb', 'tar','wmv','jpg', 'jpeg', 'gif', 'png','bmp','mp4','rmvb');
            if(in_array($value['filetype'],$allowType)){
            $extcss = 'ico_'.$value['filetype'].'_s';
            }else{
            $extcss = 'ico_mr_s';
            }
            $td1 = '<h4><a href="/employee/file/view?fileid='.$value['id'].'" title="'.$value['title'].'" target="_blank"  class="'.$extcss.' zlistFtitle">'.$value['title'].'</a></h4>';
            $td1 .= '<p>'.$value['content'].'</p>';
            $td1 .= '<div class="listFooter"><div class="fl"><time class="fl">'.$value['createtime'].'</time><span class="fl ml10	">贡献者：</span><a href="/employee/homepage/index/'.$value['creatorid'].'" target="_blank"><img style="width:26px;height:26px;" src="'. $new_imageurl.'" class="fl"><span class="fl ml5">'. $value['name'].'</span></a></div>';
            $td1 .= '<div class="fr wListOper">';
            if($value['creatorid'] == $this->spaceid){
            $td1 .= $this->docDeleteLink('文档', '/employee/file/delfile?fileid=' . $value['id'], $value['id']);
            }
            if(!empty($value['isdownloadable'])){
            $td1 .= '<a href="/employee/file/down?fileid='.$value['id'].'">下载（'.$value['downnum'].'）</a>';
            }
            $td1 .= '</div>';
            $td1 .= '</div>';

            $tableInfo[$key][] = $td1;
        }
        $total = count($allFiles);
        $returnArr['table'] = array_values($tableInfo);
        if($gettotal){
            $returnArr['total'] = $total;
        }
        $this->_ajaxRs(true, $returnArr, '', 'table');
    }

    /**
     * 文件夹列表
     */
    public function getAjaxFolder(){
        $type = isset($_GET['type'])?$_GET['type']:1;
        $pid  = isset($_GET['pid'])?intval($_GET['pid']):0;
        $head = isset($_GET['head'])?$_GET['head']:0;

        $ispriv = 1;
        if(!$this->isadmin && $type == 2){
            $ispriv = 0;
        }
        //分页
        $perpage = empty($_GET['per'])?10:intval($_GET['per']);
        $page = empty($_GET['p'])?0:intval($_GET['p']);

        $gettotal =isset($_GET['total'])?$_GET['total']:0;
        $page<1 && $page = 1;
        $start = ($page-1)*$perpage;

        $this->load->model('file_model', 'filemodel');

        if($pid){
            $boxParent = array();
            $where['pid = ?'] = $pid;
            //查询父文件夹信息
            $boxParent = $this->filemodel->getFolderById($pid);
        }

        $headinfo = $tableinfo = array();
        $headinfo[0]['name'] = "title";
        $headinfo[0]['title'] = "文件夹名称";
        $headinfo[0]['isSort'] = false;
        $headinfo[0]['sort'] = "asc";
        $headinfo[0]['css'] = "wName pl5";

        $headinfo[1]['name'] = "paixu";
        $headinfo[1]['title'] = "排序";
        $headinfo[1]['isSort'] = false;
        $headinfo[1]['sort'] = "asc";
        $headinfo[1]['css'] = "wSort";

        $headinfo[2]['name'] = "caozuo";
        $headinfo[2]['title'] = "操作";
        $headinfo[2]['isSort'] = false;
        $headinfo[2]['sort'] = "asc";
        $headinfo[2]['css'] = "wOper";

        $boxlist = $this->filemodel->getFolder($this->spaceid,$type,$pid,$this->employeeid,$perpage,$start);
        $allbox  = $this->filemodel->getFolder($this->spaceid,$type,$pid,$this->employeeid);
        $total = count($allbox); //总数

        if($boxlist && $ispriv){
            $mapping = array('self', 'self', 'corp');
            $flag = $mapping[$type];
            foreach($boxlist as $key=>$value){
            $k = $key + 1;
            $upsider = "grayTop orderUp";
            $downsider = "grayBto orderDown";
            if($k == 1){
                $upsider = "";
            }
            if($total == $k){
                $downsider = "";
            }
            $tableinfo[$key][] = '<span class="zsIcon1 fl"></span>' . ((! $pid && $type == '2') ? ('<a class="doc-enter-subfolder" href="javascript:;" boxid="' . $value['id'] . '">' . $value['name'] . '</a>') : $value['name'] );
            $tableinfo[$key][] = '<div align="center"><a href="javascript:;" type="'.$type.'" boxid="'.$value['id'].'" pid="'.$value['parentid'].'" class="uFSort '.$upsider.'"></a><a href="javascript:;" type="'.$type.'" boxid="'.$value['id'].'" pid="'.$value['parentid'].'" class="uFSort  '.$downsider.'"></a></div>';
            $tableinfo[$key][] = '<div align="center" class="yy-file-operate-list"><div id="act_'.$value['id'].'" class="relative">
                <a class="doc-edit-folder" href="javascript:;" boxid="' . $value['id'] . '">编辑</a>&nbsp;&nbsp;&nbsp;'.$this->docDeleteLink("文件夹", '/employee/file/delfolder?folderid=' . $value['id'], $value['id'], $flag,$value['parentid']).'</div></div>';
            }
        }
        if($head && $headinfo){
            $returnArr['head'] = array_values($headinfo);
        }
        $returnArr['table'] = array_values($tableinfo);
        if($gettotal){
            $returnArr['total'] = $total;
        }
        $this->_ajaxRs(true, $returnArr, '', 'table');
    }

    /**
     * 获取文件列表
     */
    public function getAjaxFile(){
        $from = isset($_GET['from'])?$_GET['from']:'';
        $folderid = isset($_GET['folderid'])?$_GET['folderid']:'';
        $tableInfo = array();

        $this->load->model('file_model', 'filemodel');
        $this->load->model("employee_model","employeemodel");

        //排序
        $paixu = isset($_GET['paixu'])?$_GET['paixu']:'createtime';
        if(in_array($paixu,array('downnum','createtime','follownum','commentnum'))){
            $paixu = "F.".$paixu;
        }else{
            $paixu = "F.createtime";
        }
        if($paixu){
            $oderby = $paixu;
        }
        $orwhere = array();
        if($from == 'all'){
            $folders = $this->filemodel->getFolder($this->spaceid,1,0,$this->employeeid);
            $folderArr = array(-1);
                if($folders){
            foreach($folders as $value){
               array_push($folderArr,$value['id']);
            }
            }
            $folderid_str = implode(',',$folderArr);
            $andwhere = array("F.spaceid='".$this->spaceid."'","F.isvisible = 1","F.isleaf = 1","SF.reftype IN('$this->file_object_type','$this->group_object_type') ");
            $orwhere = array("F.folderid IN (".$folderid_str.") AND F.fromid = 0","F.folderid = 0 AND F.fromtype = '".$this->group_object_type."'","F.folderid = 0 AND F.fromtype = 0");
        }elseif(isset($_GET['groupid']) && !empty($_GET['groupid'])){
            //群组文档
            $groupid = $_GET['groupid'];
            $andwhere = array("F.folderid = 0","F.spaceid='".$this->spaceid."'","F.fromid = '".$groupid."'","F.fromtype = '".$this->group_object_type."'","F.isvisible = 1","F.isleaf = 1","SF.reftype = '$this->group_object_type'");
        }elseif(!empty($folderid)){
            $andwhere = array("F.folderid = '".$folderid."'","F.spaceid='".$this->spaceid."'","F.fromid = 0","F.fromtype = 0","F.isvisible = 1","F.isleaf = 1","SF.reftype = '$this->file_object_type'");
        }else{
            $andwhere = array("F.folderid = 0","F.spaceid='".$this->spaceid."'","F.fromid = 0","F.fromtype = 0","F.isvisible = 1","F.isleaf = 1","SF.reftype = '$this->group_object_type'");
        }
        //类型搜索
        $fileextArr  = isset($_GET['fileext'])?strtolower($_GET['fileext']):'';
        $extStr = $this->searchFiletype($fileextArr);
        if($extStr){
            array_push($andwhere,$extStr);
        }

        //直接搜索
        $filesearch = isset($_GET['filesearch'])?trim($_GET['filesearch']):'';
        $searchtype = isset($_GET['searchtype']) ? trim($_GET['searchtype']) : 'title';
        if($filesearch){
            if($searchtype == 'title'){
            //按标题搜索
            array_push($andwhere,"F.title LIKE '".$filesearch."'");
            }elseif($searchtype == 'keyword'){
            //话题搜索 TODO
            }elseif($searchtype == 'name'){
            //按用户名搜索
            $memberInfo = $this->employeemodel->getEmployeeInfoByNameAndEmail("id",$filesearch);
            $getuids = array();
            if($memberInfo){
                foreach($memberInfo as $value){
                $getuids[] = $value['id'];
                }
            }
            $uid_strs = 0;
            if($getuids){
                $uid_strs = implode(',',$getuids);
            }
            array_push($andwhere,"F.creatorid IN($uid_strs)");
            }
        }

        //分页
        $perpage = empty($_GET['per'])?10:intval($_GET['per']);
        $page = empty($_GET['p'])?0:intval($_GET['p']);

        $gettotal =isset($_GET['total'])?$_GET['total']:0;
        $page<1 && $page = 1;
        $start = ($page-1)*$perpage;

        $getfiles = $this->filemodel->getFiles($andwhere,$oderby,$orwhere,$perpage,$start);
        $allFiles  = $this->filemodel->getFiles($andwhere,$oderby,$orwhere);

        foreach($getfiles as $key=>$value){
            //成员信息
            $value['avater'] = $this->resource_url.$value['imageurl'];
            $allowType = array('doc','docx','ppt','pptx','xls','xlsx','pot','potx','pps','ppsx','wps','wpsx','dps','wpt','dpt','txt','pdf', 'rar', 'zip', 'mp3', 'flv', 'wma', 'csv', 'csvx', 'mdb', 'tar','wmv','jpg', 'jpeg', 'gif', 'png','bmp','mp4','rmvb');
            if(in_array($value['filetype'],$allowType)){
            $extcss = 'ico_'.$value['filetype'].'_s';
            }else{
            $extcss = 'ico_mr_s';
            }
            $td1 = '<h4><a href="/employee/file/view?fileid='.$value['id'].'" title="'.$value['title'].'" target="_blank"  class="'.$extcss.' zlistFtitle">'.$value['title'].'</a></h4>';
            $td1 .= '<p>'.$value['content'].'</p>';
            $td1 .= '<div class="listFooter"><div class="fl"><time class="fl">'.$value['createtime'].'</time><span class="fl ml10	">贡献者：</span><a href="/employee/homepage/index/'.$value['creatorid'].'" target="_blank"><img style="width:26px;height:26px;" src="'.$value['avater'].'" class="fl"><span class="fl ml5">'.$value['name'].'</span></a></div>';
            $td1 .= '<div class="fr wListOper">';

            if($value['creatorid'] == $this->employeeid){
                $td1 .= $this->docDeleteLink('文档', '/employee/file/delfile?fileid=' . $value['id'], $value['id']);
            }
            if(!empty($value['isdownloadable'])){
                $td1 .= '<a href="/employee/file/down?fileid='.$value['id'].'">下载（'.$value['downnum'].'）</a>';
            }
            $td1 .= '</div>';
            $td1 .= '</div>';

            $tableInfo[$key][] = $td1;
        }
        $total = count($allFiles);
        $returnArr['table'] = array_values($tableInfo);
        if($gettotal){
            $returnArr['total'] = $total;
        }
        $this->_ajaxRs(true, $returnArr, '', 'table');
    }

    /**
     * 文档上传
     */
    public function swfUpload(){
        $folderid = isset($_POST['boxid'])?intval($_POST['boxid']):0;
        $gid = isset($_POST['gid'])?intval($_POST['gid']):0;
        $fromid = isset($_GET['fromid'])?intval($_GET['fromid']):0;
        $fromtype = isset($_GET['fromtype'])?intval($_GET['fromtype']):0;

        $this->load->model("resource_model","resource");
        $returnArr = $this->resource->addFiles("filedata"); //向resource表插入数据
        $attachurl = $title = "";
        $fileid = 0;
        if($returnArr){
            $this->load->model("file_model","filemodel");
            if($folderid){
                $reftype = $this->file_object_type;
            }else{
                $fromid  = $gid;
                if($fromid){
                    $fromtype = $this->group_object_type;
                }else{
                    $fromtype = 0;
                }
                $reftype = $this->group_object_type;
            }
            $get_date = date('Y-m-d H:i:s');
            $title = $returnArr['title'];
            $resourceid = $returnArr['resourceid'];
            $keys = array('title','creatorid','createtime','spaceid','ancestorids','folderid','isleaf','fromid','fromtype');
            $employeeid = $this->employeeid;
            $spaceid = $this->spaceid;
            $values = array("'$title'","'$employeeid'","'$get_date'","'$spaceid'","'|'","'$folderid'",1,"'$fromid'","'$fromtype'");
            $fileid = $this->filemodel->insertTable('tb_file',$keys,$values);
            if($fileid){
                //资源关联表
                $this->load->model("resource_model","resourcemodel");
                $refid = $this->resourcemodel->addResource($reftype,$fileid,$resourceid);

                //上传文档创建索引
                $this->load->model('indexes_model', 'indexes');
                $indexdata = array('id' => $fileid, 'spaceid' => $this->spaceid, 'employeeid' => $this->employeeid, 'url' => 'employee/file/view?fileid='.$fileid, 'date' => date('Y-m-d H:i:s'), 'title' => $title, 'content' => '');
                $this->indexes->create('files', $indexdata);

                //创建者默认关注
                $this->load->model("follow_model","followmodel");
                $ishavefollow = $this->followmodel->isHaveFollow($this->employeeid,$fileid,$this->file_object_type);
                if(empty($ishavefollow)){
                    $skeys = array('employeeid','followid','followtype');
                    $svalues =array("'$this->employeeid'","'$fileid'","'$this->file_object_type'");
                    $followid = $this->filemodel->insertTable("tb_followed",$skeys,$svalues);
                    if($followid){
                        $udata['follownum'] = "follownum+1";
                        $uwhere = array("id = '".$fileid."'");
                        $this->filemodel->updateTable("tb_file",$udata,$uwhere);
                    }
                }
            }
            $attachurl = $returnArr['filepath'];
        }
        $return = array($fileid,$title, 0, $attachurl, $attachurl);
        echo json_encode($return);
        exit(0);
    }

    /**
     * 文件上传描述填写
     */
    public function edit(){
        $fids = $_POST['fids'];
        $orig_location = isset($_POST['orig_location'])?$_POST['orig_location']:'employee/file/index';
        $fromurl = $_SERVER['HTTP_REFERER'];
        if($orig_location){
            $isxian = strpos($orig_location,"_");
            if($isxian){
                $orgArr = explode("_",$orig_location);
                $fromurl = "employee/file/index?p1=".$orgArr['0']."&p2=".$orgArr['1'];
            }else{
                $fromurl = $orig_location;
            }
        }
        $this->load->model('file_model', 'filemodel');
        if($fids){
            foreach($fids as $fid){
            $title_tag = "title_".$fid;
            $desc_tag  = "desc_".$fid;
            $location_tag = "location_".$fid;
            $topic_tag  = "topic_".$fid;
            $allowdown  = "allowdown_".$fid;
            $gettitle = $_POST[$title_tag];
            $get_desc = $_POST[$desc_tag];
            $get_location = $_POST[$location_tag];
            $get_allowdown = isset($_POST[$allowdown]) ? 0 : 1; //1 允许下载
            $locArr = explode("_",$get_location);//分割
            if(empty($gettitle)){
                $this->redirect($_SERVER['HTTP_REFERER'], '文件名称不能为空！',1);
            }
            $addfeed = 0;
            $data  = array();
            $groupid = $data['fromid'] = 0 ;
            $data['folderid'] = 0;
            if(is_array($locArr)){
                if($locArr['0'] == 'group'){
                    $data['fromid'] = $locArr['1'];
                    if($data['fromid']){
                        $data['fromtype'] = $this->group_object_type;//代表群组
                    }else{
                        $data['fromtype'] = 0;
                    }
                    $groupid = $data['fromid'];
                }elseif($locArr['0'] == 'self' || $locArr['0'] == 'corp'){
                    $data['folderid'] = $locArr['1'];
                }
                if(empty($data['folderid']) && empty($data['fromid'])){
                    $addfeed = 1;
                }
            }
            $this->load->model("feed_model","feedmodel");
            //共享人
            $shareuser = isset($_POST['shareuser_value']) ? $_POST['shareuser_value'] : array();
            $shareArr  = array_unique($shareuser);
            if($shareArr){
                foreach($shareArr as $getid){
                    $sharehave = $this->filemodel->isHaveShare($fid,$getid);//查询此共享人是否存在
                    if($sharehave){
                        continue;
                    }
                    //添加共享人数据
                    $sharetime = date('Y-m-d H:i:s');
                    $keys = array('fileid','toid','sharetime','fromid');
                    $spaceid = $this->spaceid;
                    $values = array("'$fid'","'$getid'","'$sharetime'","'$this->employeeid'");
                    $this->filemodel->insertTable('tb_file_share',$keys,$values);

                    //共享人默认关注该文档
                    $this->load->model("follow_model","followmodel");
                    $ishavefollow = $this->followmodel->isHaveFollow($this->employeeid,$fid,$this->file_object_type);
                    if(empty($ishavefollow)){
                        $skeys = array('employeeid','followid','followtype');
                        $svalues =array("'$this->employeeid'","'$fid'","'$this->file_object_type'");
                        $this->filemodel->insertTable("tb_followed",$skeys,$svalues);
                    }

                    //共享通知
                    $this->load->model("notice_model","noticemodel");
                    $content = "共享文档";
                    //tb_action_template 表 files_share  59
                    $this->noticemodel->addNotice($this->spaceid,$this->employeeid,$fid,$this->file_object_type,$this->nt_files_share,$getid,1,$content);
                }
                //共享增加动态
                $privacy = array(
                       array('objectid' => $this->employeeid, 'objecttype' => 1, 'targetrole' => ''));
                $this->feedmodel->addFeed($this->spaceid,$this->employeeid,$fid,$this->file_object_type,$this->ft_files_share,$groupid,1,$privacy);
            }
            $data['title']   = "'$gettitle'";
            $data['content'] = "'$get_desc'";
            $data['isdownloadable'] = $get_allowdown;
            $data['spaceid'] = $this->spaceid;
            $where = array("id = '".$fid."'");

            $this->filemodel->updateTable('tb_file',$data,$where,array(),1);

            //文件上传 增加动态
            if($addfeed){
                $this->feedmodel->addFeed($this->spaceid,$this->employeeid,$fid,$this->file_object_type,$this->ft_files_add,$groupid);
            }

            //更新文档索引
            $indexdata = array('id' => $fid, 'title' => $gettitle,'content'=>$get_desc);
            $this->load->model('indexes_model', 'indexes');
            $this->indexes->update('files', $indexdata);
            }
            $this->redirect($fromurl,"上传成功");
        }else{
            $this->redirect($fromurl,"上传失败");
        }
    }

    /**
     * 添加个人文件夹
     */
    public function addBox(){
        $folderid = isset($_GET['folderid'])? intval($_GET['folderid']):0;

        $boxInfo = array();
        if($folderid){
            $this->load->model('file_model', 'filemodel');
            $boxInfo = $this->filemodel->getFolderById($folderid);
             }
        $data['boxinfo'] = $boxInfo;
        $this->load->library('smarty');
        $this->smarty->view('employee/file/addbox.tpl',$data);
    }

    /**
     * 个人文件夹添加操作
     */
    public function addBoxOk(){
        $folderId = isset($_POST['folderid'])?intval($_POST['folderid']):0;
        $folderName = isset($_POST['foldername'])?trim($_POST['foldername']):'';

        if(empty($folderName)){
            $this->_ajaxRs(false, array(), '文件夹名称必填！', 'addBox');
        }

        $this->load->model('file_model', 'filemodel');
        if($folderId){
            $data = $where = array();
            $data['name'] = "'$folderName'";
            $where = array("id = '".$folderId."'");
            $this->filemodel->updateTable('tb_file_folder',$data,$where,array(),1);
            $info = "编辑成功";
            $insertId = $folderId;
        }else{
            $getDate = date('Y-m-d H:i:s');
            $keys = array('name','spaceid','creatorid','createtime','type');
            $values = array("'$folderName'","'$this->spaceid'","'$this->employeeid'","'$getDate'",1);
            $insertId = $this->filemodel->insertTable('tb_file_folder',$keys,$values);

            $info = "创建成功";
            if($insertId){
            $data = $where = array();
            $data['sortvalue'] = "'$insertId'";
            $where = array('id = "'.$insertId.'"');
            $this->filemodel->updateTable('tb_file_folder',$data,$where,array(),1);
            }
        }
        $this->_ajaxRs(true, array('boxid'=>$insertId,
            'boxname'=>$folderName, 'fullboxname'=>$folderName, 'msg'=>$info,
            'url'=>'/file/box/ajaxfile/type/1/boxid/' . $insertId), '', 'addBox');
    }
    /**
     * 添加企业文件夹
     */
    public function groupaddBox(){
        $folderid = isset($_GET['folderid'])? intval($_GET['folderid']):0;
        $pid = isset($_GET['pid'])? intval($_GET['pid']):0;

        $boxInfo = array();
        if($folderid){
            $this->load->model('file_model', 'filemodel');
            $boxInfo = $this->filemodel->getFolderById($folderid);
        }
        $data['pid'] = $pid;
        $data['boxinfo'] = $boxInfo;
        $this->load->library('smarty');
        $this->smarty->view('employee/file/groupaddbox.tpl',$data);
    }

    /**
     * 企业文件夹添加操作
     */
    public function groupaddok(){
        if(!$this->isadmin){
            $this->_ajaxRs(false, array(), '您没有权限进行企业文档管理！', 'groupadd');
            exit;
        }
        $pid = isset($_POST['pid']) ? intval($_POST['pid']):0;
        $folderId = isset($_POST['folderid']) ? intval($_POST['folderid']):0;
        $folderName = isset($_POST['foldername']) ? trim($_POST['foldername']):'';

        if(empty($folderName)){
            $this->_ajaxRs(false, array(), '文件夹名称必填！', 'groupadd');
            exit;
        }
        $this->load->model('file_model', 'filemodel');
        if($pid){
            $boxinfo = $this->filemodel->getFolderById($pid); //查询父类是否存在
            if(empty($boxinfo)){
            $pid = 0;
            }
        }
        if($folderId){
            //编辑文件夹
            $data = $where = array();
            $data['name'] = "'$folderName'";
            $where = array("id = '".$folderId."'");
            $this->filemodel->updateTable('tb_file_folder',$data,$where,array(),1);
            $info = "编辑成功";
            $insertId = $folderId;
        }else{
           //新建企业文件夹
            $get_date = date('Y-m-d H:i:s');
            $keys = array('name','spaceid','creatorid','createtime','type','parentid');
            $values = array("'$folderName'","'$this->spaceid'","'$this->employeeid'","'$get_date'",2,"'$pid'");
            $insertId = $this->filemodel->insertTable('tb_file_folder',$keys,$values);

            $info = "创建成功";
            if($insertId){
            $data = $where = array();
            $data['sortvalue'] = $insertId;
            $where = array('id = "'.$insertId.'"');
            $this->filemodel->updateTable('tb_file_folder',$data,$where,array(),1);
            }
        }
        $this->_ajaxRs(true, array('pid'=>$pid, 'boxid'=>$insertId,'boxname'=>$folderName, 'fullboxname'=>$folderName,'url'=>'/employee/file/ajaxfile?type=2&boxid=' . $insertId, 'flag'=>'corp', 'msg'=>$info), '', 'groupadd');
    }

    /**
     * 展示删除按钮
     * @param $name
     * @param $url
     * @param $id
     * @param string $flag
     * @param int $parentid
     * @return string
     */
    public function docDeleteLink($name, $url, $id, $flag = '',$parentid = 0){
	    $flag ? $flag = "flag='{$flag}' callback='0'" : '';
	    return '<a href="javascript:;" pid="'.$parentid.'" name="' . $name . '" for="' . $url . '" fid="' . $id . '" ' . $flag . ' class="doc-del">删除</a>';
    }

    /**
     * 删除文件夹
     */
    public function delfolder(){
        $folderId = isset($_GET['folderid']) ? intval($_GET['folderid']):0;
        if($folderId){
            $this->load->model('file_model', 'filemodel');
            $isHaveChild = $this->filemodel->isHaveChild($folderId);
            if($isHaveChild){
                $this->_ajaxRs(false, array(), '此文件夹下包含子类，不能删除！', 'delBox');
                //echo 0;exit;
            }else{
                $this->filemodel->delFolderById($folderId);
                $this->_ajaxRs(true, array(), '', 'delBox');
                //echo 1;exit;
            }
        }else{
            $this->_ajaxRs(false, array(), '删除失败！', 'delBox');
           //$this->_ajaxRs(false, array(), '请选择文件夹！', 'delBox');
        }
    }

    /**
     * 文件夹升序
     */
    public function orderup(){
        $folderId = isset($_GET['boxid']) ? intval($_GET['boxid']):0;
        $pid = isset($_GET['pid']) ? intval($_GET['pid']):0;
        $type = isset($_GET['type']) ? intval($_GET['type']):0;

        $uporder = array();
        $this->load->model('file_model', 'filemodel');
        $boxInfo  = $this->filemodel->getFolderById($folderId); //点击的文件夹信息
        $boxlist = $this->filemodel->getFolder($this->spaceid,$type,$pid,$this->employeeid);
        if($boxlist){
            foreach($boxlist as $value){
            $uporder[] = $value['id'];
            }
        }
        $getkey = array_search($folderId,$uporder);
        if($getkey > 0){
            $upperkey = $getkey - 1;
            $upboxid = $uporder[$upperkey];
            $upboxInfo  = $this->filemodel->getFolderById($upboxid);
            if($boxInfo['sortvalue'] == $upboxInfo['sortvalue']){
            $newdata = $where = array();
            $newdata['sortvalue'] = $upboxInfo['sortvalue'] + 1;
            $where = array("id = '".$folderId."'");
            $this->filemodel->updateTable('tb_file_folder',$newdata,$where);
            }else{
            $upwhere = array("id = '".$upboxid."'");
            $updata['sortvalue'] = $boxInfo['sortvalue'];
            $this->filemodel->updateTable('tb_file_folder',$updata,$upwhere);//上面的

            $thisdata['sortvalue'] = $upboxInfo['sortvalue'];
            $thiswhere = array("id = '".$folderId."'");
            $this->filemodel->updateTable('tb_file_folder',$thisdata,$thiswhere);//点击的
            }
        }
        $this->_ajaxRs(true, null, null, 'upper');
    }

    /**
     * 文件夹降序
     */
    public function orderdown(){
        $folderId = isset($_GET['boxid']) ? intval($_GET['boxid']):0;
        $pid = isset($_GET['pid']) ? intval($_GET['pid']):0;
        $type = isset($_GET['type']) ? intval($_GET['type']):0;


        $uporder = array();
        $this->load->model('file_model', 'filemodel');
        $boxInfo  = $this->filemodel->getFolderById($folderId); //点击的文件夹信息
        $boxlist = $this->filemodel->getFolder($this->spaceid,$type,$pid,$this->employeeid);
        if($boxlist){
            foreach($boxlist as $value){
            $uporder[] = $value['id'];
            }
        }

        $count = count($uporder);
        $getkey = array_search($folderId,$uporder);
        if($getkey < $count-1){
            $upperkey = $getkey + 1;
            $upboxid = $uporder[$upperkey];
            $upboxInfo  = $this->filemodel->getFolderById($upboxid);
            if($boxInfo['sortvalue'] == $upboxInfo['sortvalue']){
            $newdata['sortvalue'] = $upboxInfo['sortvalue'] - 1;
            $where = array("id = '".$folderId."'");
            $this->filemodel->updateTable('tb_file_folder',$newdata,$where);//更新点击的
            }else{
            $updata['sortvalue'] = $boxInfo['sortvalue'];
            $upwhere = array("id = '".$upboxid."'");
            $this->filemodel->updateTable('tb_file_folder',$updata,$upwhere);//上面的

            $thisdata['sortvalue'] = $upboxInfo['sortvalue'];
            $thiswhere = array("id = '".$folderId."'");
            $this->filemodel->updateTable('tb_file_folder',$thisdata,$thiswhere);//点击的
            }
        }
        $this->_ajaxRs(true, null, null, 'downer');
    }

    /**
     * 删除文件
     */
    public function delfile(){
        $fileid = isset($_GET['fileid'])?intval($_GET['fileid']):0;
        $from = isset($_GET['from'])?$_GET['from']:'';
        $url = "employee/file/view?fileid=".$fileid;
        if ($fileid <= 0) {
            if(empty($from)){
            $this->_ajaxRs(false, array(), '参数错误！', 'delfile');
            }else{
            $this->redirect($url,"参数错误！",1);
            }
        } else{
            $this->load->model('file_model', 'filemodel');
            $this->load->model("reply_model","replymodel");
            $this->load->model("follow_model","followmodel");
            $fileInfo = $this->filemodel->getFileById($fileid);
            if(empty($fileInfo)){
                if(empty($from)){
                    $this->_ajaxRs(false, array(), '此版本不存在！', 'delfile');
                }else{
                    $this->redirect($url,"此版本不存在！",1);
                }
            }else{
                if($from){
                    $isleaf = $fileInfo['isleaf'];//查询是否是当前版本
                    if($isleaf == 1){
                    $this->redirect($url,"不能删除当然版本！",1);
                    }
                }
            }
            //删除索引
            $this->load->model('indexes_model', 'indexes');
            if(empty($from)){
                //删除整个文档的时候 各个版本都删除
                if($fileInfo['ancestorids']){
                    $ancestorids = trim($fileInfo['ancestorids'],"|");
                    if($ancestorids){
                    $ancestoridsArr = explode("|",$ancestorids);
                    $parentid = $ancestoridsArr['0'];
                    }else{
                    $parentid = $fileid;
                    }
                }else{
                    $parentid = $fileid;
                }
                $uvalue['isvisible'] = 0;
                $uwhere = array("ancestorids Like '|".$parentid."|%'"," OR id = '".$parentid."'");
                $affected_rows = $this->filemodel->updateTable("tb_file",$uvalue,$uwhere);
                if($affected_rows){
                    //查询所有版本id
                    $allFileIds = $this->filemodel->getFileIdsByWhere($this->spaceid,$parentid);//此文档所有版本
                    if($allFileIds){
                        foreach($allFileIds as $value){
                            //删除索引
                            $this->indexes->deleteById('files', $value['id']);
                            //删除评论
                            $this->replymodel->delTargetReply($value['id'],$this->file_object_type);
                            //取消关注关系
                            $returnData['rs'] = $this->followmodel->cancelFollow($this->employeeid, $value['id'], $this->file_object_type);
                        }
                    }else{
                        //删除索引
                        $this->indexes->deleteById('files', $fileid);
                        //删除评论
                        $this->replymodel->delTargetReply($fileid,$this->file_object_type);
                        //取消关注关系
                        $returnData['rs'] = $this->followmodel->cancelFollow($this->employeeid, $fileid, $this->file_object_type);
                    }
                }
            }else{
                //删除单个版本
                 $affected_rows = $this->filemodel->delFileById($fileid);
                if($affected_rows){
                    //删除索引
                    $this->indexes->deleteById('files', $fileid);
                    //删除评论
                    $this->replymodel->delTargetReply($fileid,$this->file_object_type);
                    //取消关注关系
                    $returnData['rs'] = $this->followmodel->cancelFollow($this->employeeid, $fileid, $this->file_object_type);
                }
            }
            if(empty($from)){
                if($affected_rows){
                    $this->_ajaxRs(true, array(), '删除成功！', 'delfile');
                }else{
                    $this->_ajaxRs(false, array(), '删除失败！', 'delfile');
                }
            }else{
                if($affected_rows){
                    $this->redirect("employee/file/index","删除成功！");
                }else{
                    $this->redirect($url,"删除失败！",1);
                }
            }
        }
    }

    /**
     * 设置为当前版本
     */
    public function toCurrentVersion(){
        $fileid = isset($_GET['fileid'])?intval($_GET['fileid']):0;
        $this->load->model("file_model","filemodel");
        $fileInfo = $this->filemodel->getFileById($fileid);
        if($fileInfo){
            if($fileInfo['ancestorids']){
            $ancestorids = trim($fileInfo['ancestorids'],"|");
            if($ancestorids){
                $ancestoridsArr = explode("|",$ancestorids);
                $parentid = $ancestoridsArr['0'];
            }else{
                $parentid = $fileid;
            }
            $uvalue['isleaf'] = 0;
            $uwhere = array("ancestorids Like '|".$parentid."|%'"," OR id = '".$parentid."'");
            $this->filemodel->updateTable("tb_file",$uvalue,$uwhere);//将上级节点的是否叶子节点置为否

            $nvalue['isleaf'] = 1;
            $nwhere = array("id = '".$fileid."'");
            $this->filemodel->updateTable("tb_file",$nvalue,$nwhere);//将此文件设置为当前版本
            $this->redirect($_SERVER['HTTP_REFERER'],"操作成功！");
            }else{
            $this->redirect($_SERVER['HTTP_REFERER'],"未知错误！",1);
            }
        }else{
            $this->redirect($_SERVER['HTTP_REFERER'],"文件不存在！",1);
        }
    }

    /**
     * 文档详情页面
     */
    public function view(){
        $data = $this->leftshow(); //展示左侧菜单
        //详情内容
        $data['employeeid'] = $this->employeeid;
        $fileid = isset($_GET['fileid'])?intval($_GET['fileid']):0;
        $from = isset($_GET['from'])?trim($_GET['from']):'';
        if(empty($fileid)){
            $this->redirect($_SERVER['HTTP_REFERER'],"非法操作！",1);
        }
        $this->load->model('file_model', 'filemodel');
        $file = $this->filemodel->getFileById($fileid);
        if(empty($file)){
            echo $_SERVER['HTTP_REFERER'];
            $this->redirect($_SERVER['HTTP_REFERER'],"该文件已被删除或不存在！",1);
            exit;
        }

        //$editshare 是否能编辑共享人  $ispriv 是否有权限浏览 $isversion 是否有权限上传版本或版本指定 $isedit 编辑权限 $ishistory 历史版本查看权限或者【恢复到该版本权限】 $isdel 文件上传权限
        $editshare = $ispriv = $isversion = $isedit = $showsharePer = $isdel = 0;
        $ishistory = 1;
        $daohang = "";//导航
        $daleiName = "";
        //导航
        if($file['fromid'] && $file['fromtype'] == $this->group_object_type ){
            //群组文档
            $this->load->model("group_model","groupmodel");
            $groupinfo = $this->groupmodel->getGroupInfo($file['fromid'],array('id','name'));
            $groupname = $groupinfo['name'];
            $daohang = '<a href="/employee/file/index?p1=group&p2='.$file['fromid'].'" class="blueLink">群组文档<span class="blue_word">\</span>'.$groupname.'</a>';
            $daleiName = "群组文档";
            $mygroup= $this->groupmodel->getGroupEmployeeInfo($file['fromid'],$this->employeeid,array('status'));//查询是否是群组成员
            if($mygroup['status'] > 0){
                //已经参与有权限查看
                $ispriv = $isversion = 1;//增加版本
            }else{
                $ishistory = 0; //非公有群组成员不能查看历史版本
            }
            if($mygroup['status'] == 3){ //创建者
                $isedit = 1;
                $isdel  = 1;
            }
        }elseif($file['folderid']){
            //文件夹文档
            if($file['folderid'] == -1){
                $showsharePer = 1;
                if($file['creatorid'] == $this->employeeid){
                    $editshare = 1;//出现共享人
                }
                $ispriv = $this->filemodel->isHaveShare($file['id'],$this->employeeid);
                if($ispriv){
                    $isversion = 1;//共享人和自己能上传版本
                }
                $daohang = "<a href='/employee/file/index?p1=self&p2=-1'>我的文档<span class='blue_word'>\</span>我的文件夹</a>";
                $daleiName = "我的文档";
            }else{
                $folderInfo = $this->filemodel->getFolderById($file['folderid']);
                if($folderInfo){
                    if($folderInfo['type'] == 1){
                    //个人文件夹
                    $showsharePer = 1;
                    if($file['creatorid'] == $this->employeeid){
                        $editshare = 1;//出现共享人
                    }
                    $ispriv = $this->filemodel->isHaveShare($file['id'],$this->employeeid);
                    if($ispriv){
                        $isversion = 1;//共享人和自己能上传版本
                    }else{
                        $ishistory = 0;
                    }
                    $daleiName = "我的文档";
                    $daohang = "<a href='/employee/file/index?p1=self&p2=".$folderInfo['id']."'>我的文档<span class='blue_word'>\</span>".$folderInfo['name']."</a>";
                    }else{
                    $daleiName = "企业文档";
                    if($folderInfo['parentid']){
                        $upfolderInfo = $this->filemodel->getFolderById($folderInfo['parentid']);
                        $daohang = "<a href='/employee/file/index?p1=corp&p2=".$folderInfo['id']."'>企业文档<span class='blue_word'>\</span>";
                        $daohang .= $upfolderInfo['name']."<span class='blue_word'>\</span>";
                        $daohang .= $folderInfo['name']."</a>";
                    }else{
                        $daohang = "<a href='/employee/file/index?p1=corp&p2=".$folderInfo['id']."'>企业文档<span class='blue_word'>\</span>";
                        $daohang .= $folderInfo['name']."</a>";
                    }
                    }
                }
            }
        }else{
            $ispriv = 1;
            if($file['creatorid'] != $this->employeeid){
                $ishistory = 0;
            }
            $daleiName = "全部文档";
            $daohang = '<a href="/employee/file/index"}" class="blueLink">全部文档</a>';
        }
        if($file['creatorid'] == $this->employeeid){
            $ispriv =  $isedit = $isdel = $isversion = 1;//有共享人
            //个人文档仅创建者删除
        }else{
            if(empty($ispriv)){
            $this->redirect('employee/file/index', '您目前没权限浏览该文件！');
            }
        }
        //浏览数自增
        $viewdata['viewnum'] = "viewnum+1";
        $viewwhere = array("id = '".$fileid."'");
        $this->filemodel->updateTable("tb_file",$viewdata,$viewwhere);

        $data['daleiName'] = $daleiName;
        $data['editshare'] = $editshare;
        $data['ispriv'] = $ispriv;
        $data['isedit'] = $isedit;
        $data['isdel'] = $isdel;
        $data['ishistory'] = $ishistory;
        $data['isversion'] = $isversion;

        $resouce = $this->filemodel->getResourceByRef($fileid); //文档详细信息
        if(empty($resouce)){
            $this->redirect($_SERVER['HTTP_REFERER'],"文档不存在了！",1);
        }
        $resouce['filepath'] = $this->resource_url.$resouce['url'];
        $picType = array('jpg', 'jpeg', 'gif', 'png','bmp');
        $filetype = strtolower($resouce['filetype']);
        $isImg = 0;
        if(in_array($filetype,$picType)){
            $isImg = 1;
        }
        $type = '';
        if(in_array($resouce['filetype'],array('mp3', 'wav', 'wma') ))$type = 'music';
        if(in_array($resouce['filetype'],array('avi', 'rmvb', 'flv', 'ram', 'ra', 'swf') ))$type = 'video';

        $allowType = array('doc','docx','ppt','pptx','xls','xlsx','pot','potx','pps','ppsx','wps','wpsx','dps','wpt','dpt','txt','pdf', 'rar', 'zip', 'mp3', 'flv', 'wma', 'csv', 'csvx', 'mdb', 'tar','wmv','jpg', 'jpeg', 'gif', 'png','bmp','mp4','rmvb');
        if(in_array($resouce['filetype'],$allowType)){
            $extcss = 'ico_'.$resouce['filetype'].'_b';
        }else{
            $extcss = 'ico_mr_b';
        }
        $file['ico_ext'] = $extcss;

        $nowfileid = 0;//当前版本
        //版本信息
        $versionFileidArr = array();
        if($file['ancestorids']){
            $ancestorids = trim($file['ancestorids'],"|");
            if($ancestorids){
            $ancestoridsArr = explode("|",$ancestorids);
            $parentid = $ancestoridsArr['0'];
            }else{
            $parentid = $fileid;
            }
        }else{
            $parentid = $fileid;
        }
        $andwhere = array("F.spaceid='".$this->spaceid."'","F.isvisible = 1","(F.ancestorids Like '|".$parentid."|%' OR F.id = '".$parentid."')");
        $versionList = $this->filemodel->getFiles($andwhere);
        if($versionList){
            $this->load->model("employee_model","employeemodel");
            foreach($versionList as $key=>$value){
                $versionList[$key]['name'] = $value['name'];
                $versionList[$key]['imageurl'] =  $this->resource_url.$value['imageurl'];
                if($value['isleaf'] == 1){
                    $nowfileid = $value['id'];
                }
                $versionFileidArr[] = $value['id'];
                $versionList[$key]['showdate'] = date('Y-m-d',strtotime($value['createtime']));
            }
        }
        $allversionStr = implode(",",$versionFileidArr);
        $data['allversionStr']  = $allversionStr;
        if($from == 'share'){
            $showsharePer = 1;
            //来源于他人共享
            $daohang = "<a href='/employee/file/index?p1=self&p2=-2'>我的文档<span class='blue_word'>\</span>他人共享</a>";
        }

        //创建者信息
        $createrfileinfo = $this->filemodel->getFileById($parentid,0);
        $this->load->model("employee_model","employeemodel");
        $createrInfo = $this->employeemodel->getEmployeeInfo($createrfileinfo['creatorid'],"id,name");
        $updateInfo = $this->employeemodel->getEmployeeInfo($file['creatorid'],"name");
        $file['fname'] = $file['name'] = "";
        if($createrInfo){
            $file['fname'] = $createrInfo['name']; //创建者
        }
        if($updateInfo){
            $file['name']   = $updateInfo['name']; //更新者
        }
        $file['fcreatorid'] = $createrfileinfo['creatorid'];
        $file['update'] = date("Y-m-d H:i:s",strtotime($file['createtime']));

        $data['sharecount']  = 0;
        if($showsharePer){
            //共享人数
            $sharemember = $this->filemodel->getFileShareMemberCount($allversionStr);
            $data['sharecount'] = isset($sharemember['count'])?$sharemember['count']:0;
        }
        //下载总人数
        $downinfo= $this->filemodel->getUserLogCount($allversionStr,2);
        $data['downcount'] = isset($downinfo['count'])?$downinfo['count']:0;

        //关注人数
        $this->load->model("follow_model","followmodel");
        $followinfo= $this->followmodel->getMemberByFollowedCount($fileid,$this->file_object_type); //共享总数
        $data['followcount'] = isset($followinfo['count'])?$followinfo['count']:0;

        $data['showsharePer'] = $showsharePer;

        $data['nowfileid'] = $nowfileid;//当前版本id
        $data['org_fileid']   = $parentid;
        $data['versionList'] = $versionList;
        $file['ico_ext'] = $extcss;
        $file['isImg'] =$isImg;

        $data['player'] = $this->config->item("resource_url").'js/flexpaper/FlexPaperViewer';

        $this->load->library('file');

        $changeSwfUpload =$resouce['url'];

        //暂时注释 文件是否能预览
        $swfPath = $changeSwfUpload . '.swf';
        $option = array(
            'type' => 'image'
        );
        $obj = $this->file->instance($option);
        $isswf = 0;
        if ($obj->fileExists($swfPath)) {
            $isswf = 1;
            $changeSwfUpload = $swfPath;
        }
        $file['image'] =  $this->resource_url.$changeSwfUpload;

        //获取评论
        $this->load->model("reply_model","replymodel");
        $replyList = array();
        if($allversionStr){
            $replyList = $this->replymodel->getReply($this->spaceid,$allversionStr,$this->file_object_type,0,0,6);
            if($replyList){
                $this->load->model("employee_model","employeemodel");
                $fromarr = array('0'=>'网页','1'=>'IOS','2'=>'安卓','3'=>'WP','4'=>'桌面端');
                foreach($replyList as $key=>$value){
                    $replyList[$key]['from_org'] = $fromarr[$value['clienttype']];
                    $replyList[$key]['parentname'] = "";
                    if($value['parentemployeeid']){
                        $parentInfo = $this->employeemodel->getEmployeeInfo($value['parentemployeeid'],"name");
                        $replyList[$key]['parentname'] = $parentInfo['name'];
                    }
                }
            }
        }
        $data['replycount'] = count($replyList);
        $data['replyList'] = $replyList;
        $data['isswf'] = $isswf;
        $data['playerType'] = $type;
        $data['file'] = $file;
        $data['daohang'] = $daohang;
        $data['from'] = $from;
        $data['resource'] = $resouce;
        $data['fileid'] = $fileid;
        $data['file_object_type'] = $this->file_object_type;
        $data['fromurl'] = "employee/file/view?fileid=".$fileid;
        $data['followFlag'] = $this->followmodel->isHaveFollow($this->employeeid,$fileid,$this->file_object_type);
        $this->load->library('smarty');
        $this->smarty->view('employee/file/view.tpl',$data);
    }

    /**
     * 上传新版本
     */
    public function uploadversion(){
        $fileid = isset($_GET['fileid'])?intval($_GET['fileid']):0;
        if(empty($fileid)){
            echo "非法操作！";
        }
        $this->load->model('file_model', 'filemodel');
        $file = $this->filemodel->getFileById($fileid);
        if(empty($file)){
            echo "该文件已被删除或不存在";
        }
        $from = isset($_GET['from']) ? trim($this->_request->from) : '';
        $upinfo = "";
        if($file){
            if($file['fromid'] && $file['fromtype'] == $this->group_object_type){
            $this->load->model("group_model","groupmodel");
            $ginfo = $this->groupmodel->getGroupInfo($file['fromid'],array('id','name'));
            if($ginfo){
                $upinfo  = $ginfo['name'];
            }
            }else{
            //群组文档默认名称  TODO
            $upinfo = "默认名称";
            }
            if($file['folderid']){
            if($file['folderid'] == -1){
                $upinfo  = "我的文件夹";
            }else{
                $folder = $this->filemodel->getFolderById($file['folderid']);
                if($folder['type'] == 1){
                $upinfo  = $folder['name'];
                }else{
                $upinfo  = $folder['name'];
                }
            }
            }
            if($from == 'share'){
            $upinfo  = "他人共享";
            }
            $file['next_ancestorids'] = $file['ancestorids'].$file['id']."|";
            $file['next_level'] = intval($file['level'])+1;
            $data['file'] = $file;
            $data['upinfo']   = $upinfo;
            $this->load->library('smarty');
            $this->smarty->view('employee/file/uploadversion.tpl',$data);
        }
    }

    public function uploadversionok(){
        $parentid =  isset($_GET['parentid']) ? $_GET['parentid'] : 0;
        $ancestorids =  isset($_GET['ancestorids']) ? $_GET['ancestorids'] : '';
        $level =  isset($_GET['level']) ? $_GET['level'] : '';

        $this->load->model("file_model","filemodel");
        $fileInfo = $this->filemodel->getFileById($parentid);
        $return = array(0,"", 0, "", "");
        if($fileInfo){
            $this->load->model("resource_model","resource");
            $returnArr = $this->resource->addFiles("filedata"); //向resource表插入数据W
            if($returnArr){
                $folderid = $fileInfo['folderid'];
                $fromtype = $fileInfo['fromtype'];
                $fromid = $fileInfo['fromid'];
                $uvalue['isleaf'] = 0;

                //查找最大的父类
                $ancestoridsArr = array();
                if($ancestorids){
                    $ancestorids_check = trim($ancestorids,"|");
                    if($ancestorids_check){
                        $ancestoridsArr = explode("|",$ancestorids_check);
                        $org_parentid = $ancestoridsArr['0'];
                    }else{
                    $org_parentid = $parentid;
                    }
                }else{
                    $org_parentid = $parentid;
                }
                $uwhere = array("ancestorids Like '|".$org_parentid."|%'"," OR id = '".$org_parentid."'");
                $this->filemodel->updateTable("tb_file",$uvalue,$uwhere);//将上级节点的是否叶子节点置为否

                $keys = array('title','creatorid','createtime','spaceid','ancestorids','level','isleaf','parentid','folderid','fromtype','fromid');
                $new_name =  $returnArr['title'];
                $get_date = date('Y-m-d H:i:s');
                $org_name = $fileInfo['title'];
                $values = array("'$org_name'","'$this->employeeid'","'$get_date'","'$this->spaceid'","'$ancestorids'","'$level'","1","'$parentid'","'$folderid'","'$fromtype'","'$fromid'");

                $fileid = $this->filemodel->insertTable("tb_file",$keys,$values);
                if($fileid){
                    //创建索引
                    $this->load->model('indexes_model', 'indexes');
                    $indexdata = array('id' => $fileid, 'spaceid' => $this->spaceid, 'employeeid' => $this->employeeid, 'url' => 'employee/file/view?fileid='.$fileid, 'date' => date('Y-m-d H:i:s'), 'title' =>$org_name, 'content' => $fileInfo['content']);
                    $this->indexes->create('files', $indexdata);
                    //向资源关联表插入记录
                    $fromtype = $fileInfo['fromtype'];
                    $resourceid = $returnArr['resourceid'];
                    $this->load->model("resource_model","resourcemodel");
                    $refid = $this->resourcemodel->addResource($fromtype,$fileid,$resourceid);
                    if($refid){
                        //文档更新动态
                        $this->load->model("feed_model","feedmodel");
                        $this->feedmodel->addFeed($this->spaceid,$this->employeeid,$fileid,$this->file_object_type,$this->ft_files_edit,0);

                        //给关注者发通知
                        $this->load->model("follow_model","followmodel");
                        if($ancestoridsArr){
                            $files_str = implode(",",$ancestoridsArr);
                        }else{
                            $files_str = $parentid;
                        }
                        $followmembers = $this->followmodel->getMemberByFollowed($files_str,$this->file_object_type,0,1000);
                        if($followmembers){
                            $this->load->model("notice_model","noticemodel");
                            foreach($followmembers as $value){
                                $content = "文档更新通知";
                                //$spaceId, $authorId, $targetId, $module, $template, $objectId, $objectType, $content = ''
                                $this->noticemodel->addNotice($this->spaceid,$this->employeeid,$fileid,$this->file_object_type,$this->nt_files_edit,$value['id'],1,$content);
                            }
                        }
                        $attachurl = $returnArr['filepath'];
                        $return = array($fileid,$new_name, 0, $attachurl, $attachurl);
                        echo json_encode($return);
                        exit(0);
                    }
                }
            }
	    }
	    echo json_encode($return);
	    exit(0);
    }
    public function subupdate(){
        $fileid = isset($_POST['fid'])?intval($_POST['fid']):0;
        $type = isset($_POST['type'])?intval($_POST['type']):1;//编辑类型 1 标题 2 描述

        $data = array();
        if($type == 1){
            $title   = isset($_POST['title']) ? trim($_POST['title']) : '';
            if(empty($title)){
            $this->redirect("employee/file/view?fileid=".$fileid,"标题必填",1);
            }
            $data['title'] = "'$title'";
        }elseif($type == 2){
            $content = isset($_POST['content']) ? trim($_POST['content']) : '';
            if(empty($content)){
            $this->redirect("employee/file/view?fileid=".$fileid,"描述必填",1);
            }
            $data['content'] = "'$content'";
        }
        $this->load->model("file_model","filemodel");
        $fileInfo = $this->filemodel->getFileById($fileid);
        if($fileInfo){
            if($fileInfo['ancestorids']){
            $ancestorids = trim($fileInfo['ancestorids'],"|");
            if($ancestorids){
                $ancestoridsArr = explode("|",$ancestorids);
                $parentid = $ancestoridsArr['0'];
            }else{
                $parentid = $fileid;
            }
            }else{
            $parentid = $fileid;
            }
            $uwhere = array("ancestorids Like '|".$parentid."|%'"," OR id = '".$parentid."'");
            $upId = $this->filemodel->updateTable("tb_file",$data,$uwhere);
            if($upId){
            $allFileIds = $this->filemodel->getFileIdsByWhere($this->spaceid,$parentid);
            //更新索引
            $this->load->model('indexes_model', 'indexes');
            if($allFileIds){
                foreach($allFileIds as $value){
                if($type == 1){
                    $indexdata = array('id' => $value['id'], 'title' => $title);
                }else{
                    $indexdata = array('id' => $value['id'], 'content' => $content);
                }
                $this->indexes->update('files', $indexdata);
                }
            }
            }
            $this->_ajaxRs($upId > 0 ? true : false);
        }else{
            $this->_ajaxRs(false);
        }
    }

    /**
     * 文档下载
     */
    public function down(){
        $fileid = isset($_GET['fileid'])?intval($_GET['fileid']):0;
        $this->load->model("file_model","filemodel");
        $viewFile = $this->filemodel->getFileById($fileid);

        if($viewFile){
            $fileInfo = $this->filemodel->getResourceByRef($fileid);
            if(empty($viewFile['isdownloadable'])){
                $this->redirect($_SERVER['HTTP_REFERER'],"出错了，此文档设置了不能下载!",1);
            }
            if($fileInfo['url']) {
                $filepath = $this->resource_url.$fileInfo['url'];

                if(empty($viewFile['fromtype']) && empty($fileInfo['fromid'])){
                    //文件下载增加动态
                    $this->load->model("feed_model","feedmodel");
                    $this->feedmodel->addFeed($this->spaceid,$this->employeeid,$fileid,$this->file_object_type,$this->ft_files_down,0);
                }
                //更新下载数
                $udata['downnum'] = "downnum+1";
                $uwhere = array("id = '".$fileid."'");
                $this->filemodel->updateTable("tb_file",$udata,$uwhere);

                //添加下载记录
                $islog = $this->filemodel->isHaveLog($fileid,$this->employeeid,2);
                if(empty($islog)){
                        $date = date('Y-m-d H:i:s');
                    $dkeys = array('fileid','employeeid','operatetype','operatetime');
                        $dvalues = array("'$fileid'","'$this->employeeid'",2,"'$date'");
                        $this->filemodel->insertTable("tb_file_userlog",$dkeys,$dvalues);
                }

                $filetype = strtolower(trim(substr(strrchr($fileInfo['url'], '.'), 1)));
                $fileName = $viewFile['title'].'.'.$filetype;

                $picType = array('jpg', 'jpeg', 'gif', 'png','bmp');
                if(in_array($filetype, $picType)){
                    $type = "image";
                }else{
                    $type = "file";
                }
                header("Content-Type: application/force-download");
                header("Content-Type: application/octet-stream");
                header("Content-Type: application/download");
                header("Content-Transfer-Encoding: binary");
                header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
                header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
                header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
                header("Pragma: no-cache");
                header("Accept-Length: ".$fileInfo['size']);
                //调整文件名包含空格的类型
                $ua = $_SERVER["HTTP_USER_AGENT"];
                $encoded_filename = urlencode($fileName);
                $encoded_filename = str_replace("+", "%20", $encoded_filename);
                if (preg_match("/MSIE/", $ua)) {
                    header('Content-Disposition: attachment; filename="' . $encoded_filename . '"');
                } else if (preg_match("/Firefox/", $ua)) {
                    header('Content-Disposition: attachment; filename*="utf8\'\'' . $fileName . '"');
                } else {
                    header('Content-Disposition: attachment; filename="' . $fileName . '"');
                }

                $option['type'] = $type;
                $this->load->library('file');
                $obj =$this->file->instance($option);
                echo $obj->getFile($filepath);
                exit;
            } else {
                $this->redirect($_SERVER['HTTP_REFERER'],"出错了，文件不存在了!",1);
            }
        }else{
            $this->redirect($_SERVER['HTTP_REFERER'],"出错了，文件不存在了!",1);
        }
    }

    public function allowdown(){
        $status = isset($_GET['status'])?$_GET['status']:0;
        $fileid = isset($_GET['fileid'])?intval($_GET['fileid']):0;
        if(in_array($status,array('0','1'))){
            $status = $status;
        }else{
            $status = 0;
        }
        //获取文件信息
        $this->load->model("file_model","filemodel");
        $file = $this->filemodel->getFileById($fileid);
        //如果文件不存在，提示错误
        if(! $file){
            $this->redirect('employee/file/index', '该文件已被删除或不存在');
        }
        if($file['creatorid'] != $this->employeeid){
            $this->redirect('employee/file/view/?fileid='.$fileid, '您没有权限操作');
        }
        $data['isdownloadable'] = $status;
        $where =array("id = '".$fileid."'");
        $this->filemodel->updateTable("tb_file",$data,$where);
        $this->redirect('employee/file/view?fileid='.$fileid, '操作成功！');
    }

    public function searchFiletype($fileextArr){
        //类型搜索
        $getExtStr = "";
        $extArr = array();
        if($fileextArr){
            $fileextArr = explode(',',$fileextArr);
            foreach($fileextArr as $fileext){
            if($fileext == 'jpg'){//图片
                array_push($extArr,'jpg','jpeg','gif','png','bmp');
            }elseif($fileext == 'mv'){//视频
                array_push($extArr,'mv','flv','mp4','rmvb');
            }elseif($fileext == 'mp3'){//音频
                array_push($extArr,'mp3','wma');
            }elseif($fileext == 'doc'){//word
                array_push($extArr,'doc','docx');
            }elseif($fileext == 'ppt'){//ppt
                array_push($extArr,'ppt','pptx');
            }elseif($fileext == 'xls'){//excel
                array_push($extArr,'xls','xlsx');
            }elseif($fileext == 'pdf'){//pdf
                array_push($extArr,'pdf','pdfx');
            }elseif($fileext == 'txt'){//txt
                array_push($extArr,'txt');
            }
            }
        }
        if($extArr){
            $extStr = "'".implode("','", $extArr)."'";
            $getExtStr = "S.filetype IN($extStr)";
        }
        return $getExtStr;
    }

    /**
     * 编辑共享人
     */
    public function editshare(){
        $fileid = isset($_GET['fileid'])?intval($_GET['fileid']):0;
        $this->load->model("file_model","filemodel");
        //查找共享人
        $allversionStr = isset($_GET['allversionStr'])?trim($_GET['allversionStr']):0;//所有版本
        $shareMember = $this->filemodel->getFileShareMember($allversionStr);

        $data['shareMember'] = $shareMember;
        $data['fileid'] = $fileid;
        $this->load->library('smarty');
        $this->smarty->view('employee/file/editshare.tpl',$data);
    }

    /**
     * 编辑共享人操作
     */
    public function editshareok(){
        $fileid = isset($_GET['fileid'])?intval($_GET['fileid']):0;
        //共享人 数组类型
        $shareuser = isset($_GET['shareuser']) ? $_GET['shareuser'] : array();
        $shareArr  = array_unique($shareuser);
        if($shareArr){
            $this->load->model("file_model","filemodel");
            $this->load->model("employee_model","employeemodel");
            foreach($shareArr as $getid){
                $userInfo = $this->employeemodel->getEmployeeInfo($getid,"id,name,imageurl");
                if(!empty($userInfo)){
                    $userInfo['imageurl'] = $this->resource_url.$userInfo['imageurl'];
                    $sharehave = $this->filemodel->isHaveShare($fileid,$getid);//查询此共享人是否存在
                    if(empty($sharehave)){
                        $this->load->model("file_model","filemodel");
                        //添加共享人
                        $sharetime = date('Y-m-d H:i:s');
                        $keys = array('fileid','toid','sharetime','fromid');
                        $values = array("'$fileid'","'$getid'","'$sharetime'","'$this->spaceid'");
                        $this->filemodel->insertTable('tb_file_share',$keys,$values);

                        //共享通知
                        $this->load->model("notice_model","noticemodel");
                        $content = "共享文档";
                        //$spaceId, $authorId, $targetId, $module, $template, $objectId, $objectType, $content = ''
                        $this->noticemodel->addNotice($this->spaceid,$this->employeeid,$fileid,$this->file_object_type,$this->nt_files_share,$getid,1,$content);
                        $data['shareuser'][] = array('name'=>$userInfo['name'],'id'=>$userInfo['id'],'imageurl'=>$userInfo['imageurl']);
                    }
                }
            }
            $this->_ajaxRs(true, $data, '', 'editshareok');
        }
        $this->_ajaxRs(false, '', '参数错误', 'editshareok');
    }

    /**
     * 删除共享人
     */
    public function delshare(){
        $fileid = isset($_GET['fileid'])?intval($_GET['fileid']):0;
        $employeeid = isset($_GET['employeeid'])?intval($_GET['employeeid']):0;

        $this->load->model("file_model","filemodel");
        $istrue = $this->filemodel->delFileShare($fileid,$employeeid);
        if($istrue){
            //删除成功 给删除的共享通知
            $this->load->model("notice_model","noticemodel");
            $content = "删除某人的共享文档";
            $this->noticemodel->addNotice($this->spaceid,$this->employeeid,$fileid,$this->file_object_type,$this->nt_files_sharedel,$employeeid,1,$content);
            $this->_ajaxRs(true, '', '', 'delshare');
        }else{
            $this->_ajaxRs(false, '', '', 'delshare');
        }
    }

    /**
 * 下载人数
 **/
    public function downuser(){
        $fileid = isset($_GET['fileid'])?intval($_GET['fileid']):0;
        $perpage = isset($_POST['pageSize'])?intval($_POST['pageSize']):1;
        $page = isset($_POST['pageNum'])?intval($_POST['pageNum']):0;
        $page<1 && $page = 1;
        $start = ($page-1)*$perpage;
        $allversionStr = isset($_GET['allversionStr'])?trim($_GET['allversionStr']):0;

        $downuser = array();
        $this->load->model("file_model","filemodel");
        //下载者;
        $downuser = $this->filemodel->getUserLog($allversionStr,2,$start,$perpage);
        if($downuser){
            foreach($downuser as $key=>$value){
            //在线状态搜索 TODO
            $downuser[$key]['imageurl'] = $this->resource_url.$value['imageurl'];
            }
        }
        $downinfo= $this->filemodel->getUserLogCount($allversionStr,2); //下载总人数
        $totalPage = ceil($downinfo['count'] / $perpage);
        $this->_ajaxRs(true, array('followers' => array_values($downuser), 'page' => $page,'totalPage' => $totalPage), '', 'follow');
    }

    /**
     * 关注的人
     **/
    public function filefollow(){
        $fileid = isset($_GET['fileid'])?intval($_GET['fileid']):0;
        $perpage = isset($_POST['pageSize'])?intval($_POST['pageSize']):1;
        $page = isset($_POST['pageNum'])?intval($_POST['pageNum']):0;
        $page<1 && $page = 1;
        $start = ($page-1)*$perpage;
        $allversionStr = isset($_GET['allversionStr'])?trim($_GET['allversionStr']):0;

        $filefollow = array();
        $this->load->model("follow_model","followmodel");
        //共享人;
        $filefollow = $this->followmodel->getMemberByFollowed($allversionStr,$this->file_object_type,$start,$perpage);
        if($filefollow){
            foreach($filefollow as $key=>$value){
            //在线状态搜索 TODO
            $filefollow[$key]['imageurl'] = $this->resource_url.$value['imageurl'];
            }
        }
        $shareinfo= $this->followmodel->getMemberByFollowedCount($allversionStr,$this->file_object_type); //共享总数
        $totalPage = ceil($shareinfo['count'] / $perpage);
        $this->_ajaxRs(true, array('followers' => array_values($filefollow), 'page' => $page,'totalPage' => $totalPage), '', 'follow');
    }

    /**
     * 共享人数
     **/
    public function shareuser(){
        $fileid = isset($_GET['fileid'])?intval($_GET['fileid']):0;
        $perpage = isset($_POST['pageSize'])?intval($_POST['pageSize']):1;
        $page = isset($_POST['pageNum'])?intval($_POST['pageNum']):0;
        $page<1 && $page = 1;
        $start = ($page-1)*$perpage;
        $allversionStr = isset($_GET['allversionStr'])?trim($_GET['allversionStr']):0;


        $downuser = array();
        $this->load->model("file_model","filemodel");
        //下载者;
        $shareuser = $this->filemodel->getFileShareMember($allversionStr,$start,6);
        if($shareuser){
            foreach($shareuser as $key=>$value){
                //在线状态搜索 TODO
                //头像
                $shareuser[$key]['imageurl'] = $this->resource_url.$value['imageurl'];
            }
        }
        $shareinfo= $this->filemodel->getFileShareMemberCount($allversionStr); //共享总人数
        $totalPage = ceil($shareinfo['count'] / $perpage);
        $this->_ajaxRs(true, array('followers' => array_values($shareuser), 'page' => $page,'totalPage' => $totalPage), '', 'share');
    }

    /**
     * 文件转换
     */
    public function convert() {
        $fileid = isset($_GET['fileid'])?intval($_GET['fileid']):0;
        $this->load->model("resource_model","resourcemodel");
        echo $this->resourcemodel->convert($fileid);
        exit;
    }

    /**
     * 获取最新版本
     */
    public function getnew(){
        $org_fileid = isset($_GET['org_fileid'])?intval($_GET['org_fileid']):0;
        if($org_fileid){
            $this->load->model("file_model","filemodel");
            $newinfo = $this->filemodel->getFileIdsByWhere($this->spaceid,$org_fileid,1);
            if($newinfo['id']){
                $newfileid = $newinfo['id'];
                $this->_ajaxRs(true, array('newfileid' => $newfileid), '', 'getnew');
            }else{
                $this->_ajaxRs(false, array(), '', 'getnew');
            }
        }
    }


}