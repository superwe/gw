<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: Hejinlong
 * Date: 13-4-13
 * Time: 上午10:03
 * To change this template use File | Settings | File Templates.
 */

class Group extends CI_Controller {
   private $spaceId; //空间id
   private $employeeId; //员工id
   private $group_object_type;
   private $ft_group_create;
   private $ft_group_join;
   private $nt_group_join;
   private $nt_group_quit;
   private $nt_group_add_employee;
   private $nt_group_del_employee;
   private $nt_group_set_admin;
   private $nt_group_cancel_admin;
   private $nt_group_audits_employee;
   /*
    * 群组控制器构造函数
    */
   public function __construct(){
        parent::__construct();
        $this->load->helper('cache');
        $sessionId = $this->input->cookie('session_id');
        $this->spaceId = QiaterCache::spaceid();//当前空间ID
        $this->employeeId = QiaterCache::employeeid();//当前用户ID
        $this->load->model('group_model', 'group');
        $this->group_object_type = $this->config->item('object_type_group','base_config');
    	$this->ft_group_create  = $this->config->item('ft_group_create','feed_config');
        $this->ft_group_join  = $this->config->item('ft_group_join','feed_config');
        $this->nt_group_join  = $this->config->item('nt_group_join','notice_config');
        $this->nt_group_quit  = $this->config->item('nt_group_quit','notice_config');
        $this->nt_group_add_employee  = $this->config->item('nt_group_add_employee','notice_config');
        $this->nt_group_del_employee  = $this->config->item('nt_group_del_employee','notice_config');
        $this->nt_group_set_admin  = $this->config->item('nt_group_set_admin','notice_config');
        $this->nt_group_cancel_admin  = $this->config->item('nt_group_cancel_admin','notice_config');
        $this->nt_group_audits_employee  = $this->config->item('nt_group_audits_employee','notice_handel_config');
   }
	/*
    * 群组首页
    */
    public function index(){
    	$this->load->model('common_model', 'common');
    	$groupId = isset($_GET['id']) ? $_GET['id'] : 0;
    	if(empty($groupId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], 'id参数不存在', 1);
    	}
    	$data['groupId'] = $groupId;
    	$data['action'] = 'index';
    	$this->load->model('app_model', 'app');
        $data['appList'] = $this->app->getAppList($this->spaceId);
        $data['groupList'] = $this->group->getGroupMenu($this->spaceId, $this->employeeId);
        $data['group'] = $this->group->getGroupInfo($groupId, array('id, name, description, announce, creatorid, logourl, bgurl, status'));
		if(empty($data['group']['status'])){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '该群组已被删除', 1);
		}
        $data['personalInfo'] = QiaterCache::employeeInfo();
        if($data['group']['creatorid'] == $this->employeeId){
			$data['status'] = 0;
		}else{
			if($this->group->isGroupEmployee($groupId, $this->employeeId)){
				$rs = $this->group->getGroupEmployeeInfo($groupId, $this->employeeId, array('status'));
				if(empty($rs['status'])){
					$data['status'] = 3;
				}else{
					$data['status'] = 1;
				}
			}else{
				$data['status'] = 2;
			}
		}
        $data['group']['logourl'] = empty($data['group']['logourl']) ? '/images/defaultGroup.gif' : $this->config->item("resource_url").$data['group']['logourl']; 
        $data['group']['bgurl'] = empty($data['group']['bgurl']) ? '/images/group_bj.png' : $this->config->item("resource_url").$data['group']['bgurl']; 
        $this->load->model('file_model', 'file');
        $where = array("F.spaceid='".$this->spaceId."'","F.isvisible = 1","F.fromid = '".$groupId."'", "F.fromtype = '".$this->group_object_type."'");
        $data['resource_url'] = $this->config->item("resource_url");
        $data['hotFiles'] = $this->file->getFiles($where,$orderby = "F.createtime", $orwhere = array(), 5, 0);
        $data['employeeList']  = $this->group->getGroupEmployeeList($groupId, false, '', 0, 5);
        $data['employeeTotal']  =  $this->group->getGroupEmployeeTotal($groupId);
        $data['rscallback'] = isset($_GET['_rscallback']) ? $_GET['_rscallback'] : '';
		$data['rscallbackflag'] = isset($_GET['_rscallbackflag']) ? $_GET['_rscallbackflag'] : '';
        $this->load->library('smarty');
        $this->smarty->view('employee/group/index.tpl', $data);
    }
   /*
    * 所有群组列表
    */
    public function lists(){
        $this->load->model('app_model', 'app');
        $data['personalInfo'] = QiaterCache::employeeInfo();
        $data['appList'] = $this->app->getAppList($this->spaceId);
        $data['groupList'] = $this->group->getGroupMenu($this->spaceId, $this->employeeId);
        $data['letter'] = (isset($_GET['letter']) && $_GET['letter']) ? $_GET['letter'] : '';
        $data['rscallback'] = isset($_GET['_rscallback']) ? $_GET['_rscallback'] : '';
		$data['rscallbackflag'] = isset($_GET['_rscallbackflag']) ? $_GET['_rscallbackflag'] : '';
        $this->load->library('smarty');
        $this->smarty->view('employee/group/lists.tpl', $data);
    }
 	/**
     * 异步获取群组列表;
     */
    public function ajaxGetGroupList() {
    	$limit = (isset($_GET['per']) && intval($_GET['per']) > 0 ) ? intval($_GET['per']) : 5;
        //偏移量
        $page = (isset($_GET['p']) && intval($_GET['p']) > 0) ? $_GET['p'] : 0;
        $start = $page ? ($page-1) * $limit : 0;
       	$letter = (isset($_GET['letter']) && $_GET['letter']) ? $_GET['letter'] : '';
        $table = $this->group->getGroupList($this->spaceId, $letter, $start, $limit);
        $total = $this->group->getGroupTotal($this->spaceId, $letter);
        $list_data['total'] = $total[0]['num'];
   		if(is_array($table)) {
            $i = 0;
            $resource_url = $this->config->item("resource_url");
            foreach($table as $item) {
                $item = (array)$item;
                $groupLogo =  empty($item['logourl']) ? '<img src="/images/defaultGroup.gif"/>' : '<img class="groupImg" src="'.$resource_url.$item['logourl'].'"/>';
                $list_data['table'][$i][] = '<a href="/employee/group/index?id='.$item['id'].'" title="'.$item['name'].'">'.$groupLogo.'</a>';
                $list_data['table'][$i][] = '<a href="/employee/group/index?id='.$item['id'].'" class="title">'.$item['name'].'</a><br/>'.$item['description'];// 群组名
                $list_data['table'][$i][] = $item['messagenum'];// 会话数
                $list_data['table'][$i][] = $item['employeenum'];// 成员数
                $r = $this->group->isGroupEmployee($item['id'], $this->employeeId);
                $list_data['table'][$i][] = $r ? '<a href="/employee/group/quit?id='.$item["id"].'" class="button_gray group_button">退出群组</a>' : '<a href="/employee/group/join?id='.$item["id"].'" class="button_blue group_button">加入群组</a>';// 操作
                $i++;
            }
        }
        // 获取表格头部数据;
        if(!empty($_GET['head'])) {
            $head = array(
                array(
                    'name'=>'name',
                    'title'=>'群组名',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>'w50'
                ),
                 array(
                    'name'=>'name',
                    'title'=>'',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>'w400'
                ),
                array(
                    'name'=>'messagenum',
                    'title'=>'会话数',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>'w100'
                ),
                array(
                    'name'=>'employeenum',
                    'title'=>'成员数',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>'w100'
                ),
                array(
                    'name'=>'operation',
                    'title'=>'操作',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>'w100'
                )
            );
            $list_data['head'] = $head;
        }
        $ret = json_encode(array('rs'=>true, 'error'=>'', 'data'=>$list_data, 'type'=>'table'));
        echo $ret; exit;
    }
	/*
    * 我的群组列表
    */
    public function mylist(){
        $this->load->model('app_model', 'app');
        $data['personalInfo'] = QiaterCache::employeeInfo();
        $data['appList'] = $this->app->getAppList($this->spaceId);
        $data['groupList'] = $this->group->getGroupMenu($this->spaceId, $this->employeeId);
        $data['letter'] = (isset($_GET['letter']) && $_GET['letter']) ? $_GET['letter'] : '';
        $data['rscallback'] = isset($_GET['_rscallback']) ? $_GET['_rscallback'] : '';
		$data['rscallbackflag'] = isset($_GET['_rscallbackflag']) ? $_GET['_rscallbackflag'] : '';
        $data['eid'] = isset($_GET['eid']) ? intval($_GET['eid']) : 0;
		$this->load->library('smarty');
        $this->smarty->view('employee/group/mylist.tpl',$data);
    }
	/**
     * 异步获取我的群组列表;
     */
    public function ajaxGetMyGroupList() {
    	$eid = isset($_GET['eid']) ? intval($_GET['eid']) : 0;
    	$limit = (isset($_GET['per']) && intval($_GET['per']) > 0 ) ? intval($_GET['per']) : 5;
        //偏移量
        $page = (isset($_GET['p']) && intval($_GET['p']) > 0) ? $_GET['p'] : 0;
        $start = $page ? ($page-1) * $limit : 0;
        $letter = (isset($_GET['letter']) && $_GET['letter']) ? $_GET['letter'] : '';
        if(empty($eid)){
        	$table = $this->group->getEmployeeGroupList($this->spaceId, $this->employeeId, $letter, $start, $limit);
        	$total =  $this->group->getEmployeeGroupTotal($this->spaceId, $this->employeeId, $letter);
        }else{
        	$table = $this->group->getEmployeeGroupList($this->spaceId, $eid, $letter, $start, $limit);
        	$total =  $this->group->getEmployeeGroupTotal($this->spaceId, $eid, $letter);
        }
        $list_data['total'] = $total[0]['num'];
   		if(is_array($table)) {
            $i = 0;
            $resource_url = $this->config->item("resource_url");
            foreach($table as $item) {
                $item = (array)$item;
                $groupLogo =  empty($item['logourl']) ? '<img src="/images/defaultGroup.gif"/>' : '<img class="groupImg" src="'.$resource_url.$item['logourl'].'"/>';
                $list_data['table'][$i][] = '<a href="/employee/group/index?id='.$item['id'].'" title="'.$item['name'].'">'.$groupLogo.'</a>';
                $list_data['table'][$i][] = '<a href="/employee/group/index?id='.$item['id'].'" class="title">'.$item['name'].'</a><br/>'.$item['description'];// 群组名
                $list_data['table'][$i][] = $item['messagenum'];// 会话数
                $list_data['table'][$i][] = $item['employeenum'];// 成员数
                $i++;
            }
        }
        // 获取表格头部数据;
        if(!empty($_GET['head'])) {
            $head = array(
                array(
                    'name'=>'name',
                    'title'=>'群组名',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>'w50'
                ),
                 array(
                    'name'=>'name',
                    'title'=>'',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>'w500'
                ),
                array(
                    'name'=>'messagenum',
                    'title'=>'会话数',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>'w100'
                ),
                array(
                    'name'=>'employeenum',
                    'title'=>'成员数',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>'w100'
                )
            );
            $list_data['head'] = $head;
        }
        $ret = json_encode(array('rs'=>true, 'error'=>'', 'data'=>$list_data, 'type'=>'table'));
        echo $ret; exit;
    }
	/*
    * 创建群组
    */
    public function create(){
    	if(isset($_POST['do']) && $_POST['do'] == '1'){
    		$this->load->model('common_model', 'common');
    		if(empty($_POST['group_name'])){
    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组名称 不能为空', 1);
    		}
    		if($this->group->isExistSpaceGroupName($this->spaceId, trim($_POST['group_name']))){
		    	$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组名称不能重复', 1);
		    }
    		$this->load->model('resource_model', 'resource');
    		if($file = $this->resource->addFiles('group_logo')){
    			$logoId = $file['resourceid'];
    			$logoUrl = $file['filepath'];
    		}else{
    			$logoId = 0;
    			$logoUrl = "";
    		}
    		$groupId = $this->group->createGroup(trim($_POST['group_name']), $this->spaceId, $this->employeeId, strip_tags($_POST['description']), $logoId, $logoUrl);
    		if($groupId){
    			//创建群组动态
    			$this->load->model("feed_model","feed");
    			$this->feed->addFeed($this->spaceId, $this->employeeId, $groupId, $this->group_object_type, $this->ft_group_create, $groupId);
    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '创建群组成功');
    		}else{
    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '创建群组失败', 1);
    		}
    	}else{
    		$this->load->library('smarty');
        	$this->smarty->view('employee/group/create.tpl');	
    	}
    }
    
	/*
    * 加入群组
    */
    public function join(){
    	$this->load->model('common_model', 'common');
    	$groupId = isset($_GET['id']) ? intval($_GET['id']) : 0;
    	if(empty($groupId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], 'id参数不存在', 1);
    	}
    	if($this->group->isGroupEmployee($groupId, $this->employeeId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '您已加入该群组', 1);
    	}
    	$r = $this->group->getGroupInfo($groupId, array('employeenum', 'creatorid'));
    	if($employeeNum = $r['employeenum']){
    		$employeeNum ++;
    		if($this->group->createGroupEmployee($groupId, $this->employeeId, 0)){
    			$res = $this->group->updateGroup($groupId, array('employeenum' => $employeeNum));
    			if($res){
    				//加入群组动态
    				$this->load->model("feed_model","feed");
    				$this->feed->addFeed($this->spaceId, $this->employeeId, $groupId, $this->group_object_type, $this->ft_group_join, $groupId);
    				//加入群组通知
    				$this->load->model("notice_model","notice");
    				$this->notice->addNotice($this->spaceId, $this->employeeId, $groupId, $this->group_object_type, $this->nt_group_join, $r['creatorid'], 1);
    				$this->common->_redirect($_SERVER['HTTP_REFERER'], '加入群组成功，请等待审核');
    			}else{
    				$this->common->_redirect($_SERVER['HTTP_REFERER'], '加入群组失败', 1);
    			}
    		}else{
    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '加入群组失败', 1);
    		}
    	}else{
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组信息错误', 1);
    	}
    }
    
	/*
    * 退出群组
    */
    public function quit(){
    	$this->load->model('common_model', 'common');
    	$groupId = isset($_GET['id']) ? $_GET['id'] : 0;
    	if(empty($groupId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], 'id参数不存在', 1);
    	}
    	$r = $this->group->getGroupInfo($groupId, array('employeenum', 'creatorid'));
    	if($this->employeeId == $r['creatorid']){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组管理员不能退出群组', 1);
    	}
    	if($employeeNum = $r['employeenum']){
    		$employeeNum --;
    		if($this->group->removeGroupEmployee($groupId, $this->employeeId)){
    			$res = $this->group->updateGroup($groupId, array('employeenum' => $employeeNum));
    			if($res){
	    			//退出群组通知
	    			$this->load->model("notice_model","notice");
	    			$this->notice->addNotice($this->spaceId, $this->employeeId, $groupId, $this->group_object_type, $this->nt_group_quit, $r['creatorid'], 1);
    				//更新缓存
	        		$groupList = $this->group->getEmployeeGroupList($this->spaceId, $this->employeeId, '', 0, 5);
	            	QiaterCache::groupList($groupList);
	    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '退出群组成功');
    			}else{
    				$this->common->_redirect($_SERVER['HTTP_REFERER'], '退出群组失败', 1);
    			}
    		}else{
    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '退出群组失败', 1);
    		}
    	}else{
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组信息不存在', 1);
    	}
    }
	/*
    * 群组首页成员
    */
    public function employee(){
    	$this->load->model('common_model', 'common');
    	$groupId = isset($_GET['id']) ? $_GET['id'] : 0;
    	if(empty($groupId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], 'id参数不存在', 1);
    	}
    	$data['personalInfo'] = QiaterCache::employeeInfo();
    	$data['letter'] = isset($_GET['letter']) ? $_GET['letter'] : '';
    	$data['action'] = 'employee';
        $this->load->model('app_model', 'app');
        $data['appList'] = $this->app->getAppList($this->spaceId);
        $data['groupList'] = $this->group->getGroupMenu($this->spaceId, $this->employeeId);
    	$data['group'] = $this->group->getGroupInfo($groupId, array('id, name, description, announce, creatorid, logourl, bgurl, status'));
		if(empty($data['group']['status'])){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '该群组已被删除', 1);
		}
        $data['group']['logourl'] = empty($data['group']['logourl']) ? '/images/defaultGroup.gif' : $this->config->item("resource_url").$data['group']['logourl']; 
        $data['group']['bgurl'] = empty($data['group']['bgurl']) ? '/images/group_bj.png' : $this->config->item("resource_url").$data['group']['bgurl']; 
    	if($data['group']['creatorid'] == $this->employeeId){
			$data['status'] = 0;
		}else{
			if($this->group->isGroupEmployee($groupId, $this->employeeId)){
				$rs = $this->group->getGroupEmployeeInfo($groupId, $this->employeeId, array('status'));
				if(empty($rs['status'])){
					$data['status'] = 3;
				}else{
					$data['status'] = 1;
				}
			}else{
				$data['status'] = 2;
			}
		}
		 $data['rscallback'] = isset($_GET['_rscallback']) ? $_GET['_rscallback'] : '';
		$data['rscallbackflag'] = isset($_GET['_rscallbackflag']) ? $_GET['_rscallbackflag'] : '';
        $this->load->library('smarty');
        $this->smarty->view('employee/group/employee.tpl', $data);
    }
	/*
    * 群组首页文库
    */
    public function file(){
    	$this->load->model('common_model', 'common');
    	$groupId = isset($_GET['id']) ? $_GET['id'] : 0;
    	if(empty($groupId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], 'id参数不存在', 1);
    	}
    	$data['action'] = 'file';
    	$data['personalInfo'] = QiaterCache::employeeInfo();
        $this->load->model('app_model', 'app');
        $data['appList'] = $this->app->getAppList($this->spaceId);
        $data['groupList'] = $this->group->getGroupMenu($this->spaceId, $this->employeeId);
    	$data['group'] = $this->group->getGroupInfo($groupId, array('id, name, description, announce, creatorid, logourl, bgurl, status'));
		if(empty($data['group']['status'])){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '该群组已被删除', 1);
		}
        $data['group']['logourl'] = empty($data['group']['logourl']) ? '/images/defaultGroup.gif' : $this->config->item("resource_url").$data['group']['logourl']; 
        $data['group']['bgurl'] = empty($data['group']['bgurl']) ? '/images/group_bj.png' : $this->config->item("resource_url").$data['group']['bgurl']; 
    	if($data['group']['creatorid'] == $this->employeeId){
			$data['status'] = 0;
		}else{
			if($this->group->isGroupEmployee($groupId, $this->employeeId)){
				$rs = $this->group->getGroupEmployeeInfo($groupId, $this->employeeId, array('status'));
				if(empty($rs['status'])){
					$data['status'] = 3;
				}else{
					$data['status'] = 1;
				}
			}else{
				$data['status'] = 2;
			}
		}
		$data['rscallback'] = isset($_GET['_rscallback']) ? $_GET['_rscallback'] : '';
		$data['rscallbackflag'] = isset($_GET['_rscallbackflag']) ? $_GET['_rscallbackflag'] : '';
        $this->load->library('smarty');
        $this->smarty->view('employee/group/file.tpl', $data);
    }
	/*
    * 设置群组
    */
    public function setting(){
    	$this->load->model('common_model', 'common');
    	$groupId = isset($_GET['id']) ? $_GET['id'] : 0;
    	if(empty($groupId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], 'id参数不存在', 1);
    	}
    	$data['personalInfo'] = QiaterCache::employeeInfo();
    	$data['action'] = 'setting';
    	$this->load->model('app_model', 'app');
        $data['appList'] = $this->app->getAppList($this->spaceId);
        $data['groupList'] = $this->group->getGroupMenu($this->spaceId, $this->employeeId);
        $data['group'] = $this->group->getGroupInfo($groupId, array('id, name, description, announce, logourl, bgurl, creatorid'));
    	$info = $this->group->getGroupEmployeeInfo($groupId, $this->employeeId, array('status'));
    	if(empty($info) || !isset($info['status'])){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '您 不是该群组成员', 1);
    	}elseif ($info['status'] != 2 && $info['status'] != 3){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '您没有权限进行该操作', 1);
    	}
        $data['group']['logourl'] = empty($data['group']['logourl']) ? '/images/defaultGroup.gif' : $this->config->item("resource_url").$data['group']['logourl']; 
        $data['group']['bgurl'] = empty($data['group']['bgurl']) ? '/images/group_bj.png' : $this->config->item("resource_url").$data['group']['bgurl']; 
        $data['rscallback'] = isset($_GET['_rscallback']) ? $_GET['_rscallback'] : '';
		$data['rscallbackflag'] = isset($_GET['_rscallbackflag']) ? $_GET['_rscallbackflag'] : '';
        $this->load->library('smarty');
        $this->smarty->view('employee/group/setting.tpl', $data);
    }
	/*
    * 更新群组
    */
    public function update(){
    	$this->load->model('common_model', 'common');
    	if(isset($_POST['do']) && $_POST['do'] == '1'){
    		if(empty($_POST['group_name'])){
    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组名称不能为空', 1);
    		}
    		$i = $this->group->isExistSpaceGroupName($this->spaceId, trim($_POST['group_name']));
    		if($i > 1){
		    	$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组名称不能重复', 1);
		    }
    		$data = array(
    						'name' => trim($_POST['group_name']),
    						'description' => strip_tags($_POST['description']),
    						'announce' => strip_tags($_POST['announce'])
    					);
    		$this->load->model('common_model', 'common');
    		$this->load->model('resource_model', 'resource');
    		if($_FILES['group_logo']['error'] == 0){
    			if(!in_array($_FILES['group_logo']['type'], array('image/jpeg', 'image/gif', 'image/png'))){
    				$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组logo文件格式错误', 1);
    			}
    			if($logo = $this->resource->addFiles('group_logo')){
    				$data['logoid'] = $logo['resourceid'];
    				$data['logourl'] = $logo['filepath'];
    			}
    		}
    		if($_FILES['group_bg']['error'] == 0){
	    		if($bg = $this->resource->addFiles('group_bg')){
	    			$data['bgid'] = $bg['resourceid'];
    				$data['bgurl'] = $bg['filepath'];
	    		}
    		}
    		if($this->group->updateGroup($_POST['id'], $data)){
    			//更新缓存
	        	$groupList = $this->group->getEmployeeGroupList($this->spaceId, $this->employeeId, '', 0, 5);
	            QiaterCache::groupList($groupList);
    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '更新群组成功');
    		}else{
    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '更新群组失败', 1);
    		}
    	}else{
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '提交表单错误', 1);
    	}
    }
	/*
     * 审核群组成员
     */
    public function auditsEmployee(){
    	$this->load->model('common_model', 'common');
    	$groupId = isset($_GET['id']) ? $_GET['id'] : 0;
    	if(empty($groupId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], 'id参数不存在', 1);
    	}
    	$info = $this->group->getGroupEmployeeInfo($groupId, $this->employeeId, array('status'));
    	if(empty($info) || !isset($info['status'])){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '您不是该群组成员', 1);
    	}elseif ($info['status'] != 2 && $info['status'] != 3){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '您没有权限进行该操作', 1);
    	}
    	$data['personalInfo'] = QiaterCache::employeeInfo();
    	$data['action'] = 'auditsEmployee';
        $this->load->model('app_model', 'app');
        $data['appList'] = $this->app->getAppList($this->spaceId);
        $data['groupList'] = $this->group->getGroupMenu($this->spaceId, $this->employeeId);
        $data['group'] = $this->group->getGroupInfo($groupId, array('id, name, description, logourl, bgurl'));
        $data['group']['logourl'] = empty($data['group']['logourl']) ? '/images/defaultGroup.gif' : $this->config->item("resource_url").$data['group']['logourl']; 
        $data['group']['bgurl'] = empty($data['group']['bgurl']) ? '/images/group_bj.png' : $this->config->item("resource_url").$data['group']['bgurl']; 
        $data['rscallback'] = isset($_GET['_rscallback']) ? $_GET['_rscallback'] : '';
		$data['rscallbackflag'] = isset($_GET['_rscallbackflag']) ? $_GET['_rscallbackflag'] : '';
        $this->load->library('smarty');
        $this->smarty->view('employee/group/audits.tpl', $data);
    }
    /*
     * 设置群组成员
     */
    public function listEmployee(){
    	$this->load->model('common_model', 'common');
    	$groupId = isset($_GET['id']) ? $_GET['id'] : 0;
    	if(empty($groupId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], 'id参数不存在', 1);
    	}
    	$info = $this->group->getGroupEmployeeInfo($groupId, $this->employeeId, array('status'));
    	if(empty($info) || !isset($info['status'])){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '您 不是该群组成员', 1);
    	}elseif ($info['status'] != 2 && $info['status'] != 3){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '您没有权限进行该操作', 1);
    	}
    	$data['personalInfo'] = QiaterCache::employeeInfo();
    	$data['action'] = 'listEmployee';
        $this->load->model('app_model', 'app');
        $data['appList'] = $this->app->getAppList($this->spaceId);
        $data['groupList'] = $this->group->getGroupMenu($this->spaceId, $this->employeeId);
        $data['group'] = $this->group->getGroupInfo($groupId, array('id, name, description, logourl, bgurl'));
        $data['group']['logourl'] = empty($data['group']['logourl']) ? '/images/defaultGroup.gif' : $this->config->item("resource_url").$data['group']['logourl']; 
        $data['group']['bgurl'] = empty($data['group']['bgurl']) ? '/images/group_bj.png' : $this->config->item("resource_url").$data['group']['bgurl']; 
        $data['rscallback'] = isset($_GET['_rscallback']) ? $_GET['_rscallback'] : '';
		$data['rscallbackflag'] = isset($_GET['_rscallbackflag']) ? $_GET['_rscallbackflag'] : '';
        $this->load->library('smarty');
        $this->smarty->view('employee/group/listEmployee.tpl', $data);
    }
 	/*
     * 设置添加群组
     */
    public function addEmployee(){
    	$this->load->model('common_model', 'common');
    	$data['personalInfo'] = QiaterCache::employeeInfo();
    	if(isset($_POST['do']) && $_POST['do'] == '1'){
    		$groupId = $_POST['gid'] ? intval($_POST['gid']) : 0;
    		if(empty($groupId)){
    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组不存在', 1);
    		}
    		$value = trim($_POST['employeename']);
    		if(empty($value)){
    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '用户或邮箱不能为空', 1);
    		}
    		if(strstr($value, '@')){
    			$field = 'email';
    		}else{
    			$field = 'name';
    		}
    		$this->load->model('employee_model', 'employee');
    		$info = $this->employee->getEmployeeDetail($value, $field, $cols = 'id');
    		if(empty($info)){
    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '用户不存在', 1);
    		}else{
    			if($this->group->isGroupEmployee($groupId, $info['id'])){
    				$this->common->_redirect($_SERVER['HTTP_REFERER'], '该用户已存在', 1);
    			}
	    		$r = $this->group->getGroupInfo($groupId, array('employeenum'));
		    	if($employeeNum = $r['employeenum']){
		    		$employeeNum ++;
		    		if($this->group->createGroupEmployee($groupId, $info['id'], 1)){
		    			$res = $this->group->updateGroup($groupId, array('employeenum' => $employeeNum));
		    			if($res){
			    			//添加群组成员通知
	    					$this->load->model("notice_model","notice");
	    					$this->notice->addNotice($this->spaceId, $this->employeeId, $groupId, $this->group_object_type, $this->nt_group_add_employee, $info['id'], 1);
		    				$this->common->_redirect($_SERVER['HTTP_REFERER'], '添加群组成员成功');
		    			}else{
		    				$this->common->_redirect($_SERVER['HTTP_REFERER'], '添加群组成员失败', 1);
		    			}
		    		}else{
		    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '添加群组成员失败', 1);
		    		}
		    	}else{
		    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组不存在', 1);
		    	}
    		}
    	}else{
	    	$groupId = isset($_GET['id']) ? $_GET['id'] : 0;
	    	if(empty($groupId)){
	    		$this->common->_redirect($_SERVER['HTTP_REFERER'], 'id参数不存在', 1);
	    	}
	    	$info = $this->group->getGroupEmployeeInfo($groupId, $this->employeeId, array('status'));
	    	if(empty($info) || !isset($info['status'])){
	    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '您 不是该群组成员', 1);
	    	}elseif ($info['status'] != 2 && $info['status'] != 3){
	    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '您没有权限进行该操作', 1);
	    	}
	    	
	    	$data['action'] = 'addEmployee';
	        $this->load->model('app_model', 'app');
        	$data['appList'] = $this->app->getAppList($this->spaceId);
	        $data['groupList'] = $this->group->getGroupMenu($this->spaceId, $this->employeeId);
	        $data['group'] = $this->group->getGroupInfo($groupId, array('id, name, description, logourl, bgurl'));
	        $data['group']['logourl'] = empty($data['group']['logourl']) ? '/images/defaultGroup.gif' : $this->config->item("resource_url").$data['group']['logourl']; 
	        $data['group']['bgurl'] = empty($data['group']['bgurl']) ? '/images/group_bj.png' : $this->config->item("resource_url").$data['group']['bgurl'];
	        $data['rscallback'] = isset($_GET['_rscallback']) ? $_GET['_rscallback'] : '';
			$data['rscallbackflag'] = isset($_GET['_rscallbackflag']) ? $_GET['_rscallbackflag'] : '';
	        $this->load->library('smarty');
	        $this->smarty->view('employee/group/addEmployee.tpl', $data);
    	}
    }
	/**
     * 异步获取群组成员列表;
     */
    public function ajaxGetEemployeeList() {
   		$groupId = isset($_GET['id']) ? $_GET['id'] : 0;
    	if(empty($groupId)){
    		$this->load->model('common_model', 'common');
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], 'id参数不存在', 1);
    	}
    	$limit = (isset($_GET['per']) && intval($_GET['per']) > 0 ) ? intval($_GET['per']) : 5;
        //偏移量
        $page = (isset($_GET['p']) && intval($_GET['p']) > 0) ? $_GET['p'] : 0;
        $start = $page ? ($page-1) * $limit : 0;
        $letter = isset($_GET['letter']) ? $_GET['letter'] : '';
        $table = $this->group->getGroupEmployeeList($groupId, true, $letter, $start, $limit);
        $total =  $this->group->getGroupEmployeeTotal($groupId, $letter);
        $list_data['total'] = $total[0]['num'];
        //关注成员列表
        $this->load->model('Follow_model', 'follow');
        $followIds = $this->follow->getFollowEmployeeIds($this->employeeId);
   		if(is_array($table)) {
   			$resource_url = $this->config->item("resource_url");
   			$employee_type = $this->config->item('object_type_member','base_config');
            $i = 0;
            foreach($table as $item) {
                $item = (array)$item;
                $item['imageurl'] = empty($item['imageurl']) ? 'default_avatar.thumb.jpg' : $item['imageurl']; 
                $list_data['table'][$i][] = '<a href="/employee/homepage/index?employeeid='.$item['employeeid'].'"><img class="headPhoto" src="'.$resource_url.$item['imageurl'].'"  tips="1" rel ="/employee/employee/cardInfo/'.$item['employeeid'].'"></a>';
                $list_data['table'][$i][] = $item['name'];
                $list_data['table'][$i][] = $item['duty'];
                $list_data['table'][$i][] = $item['deptname'];
                $list_data['table'][$i][] = $this->follow->getMyFansMemberNums($item['employeeid'], 1);
                $list_data['table'][$i][] = $item['jointime'];
                if($this->employeeId == $item['employeeid']){
                	$list_data['table'][$i][] = '<a href="javascript:;" class="button_gray group_button">我自己</a>';
                }else{
                	if(in_array($item['employeeid'], $followIds)){
                		$list_data['table'][$i][] = '<a href="javascript:;" class="yy-follow button_gray group_button" type = "0" for = "'.$item['employeeid'].'" role = "'.$employee_type.'">取消关注</a>';
                	}else{
                		$list_data['table'][$i][] = '<a href="javascript:;" class="yy-follow button_blue group_button" type = "1" for = "'.$item['employeeid'].'" role = "'.$employee_type.'">加关注</a>';
                	}
                }
                $i++;
            }
        }
        // 获取表格头部数据;
        if(!empty($_GET['head'])) {
            $head = array(
                array(
                    'name'=>'imageurl',
                    'title'=>'成员',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                 array(
                    'name'=>'name',
                    'title'=>'名称',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'duty',
                    'title'=>'职务',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'deptname',
                    'title'=>'部门',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'fans_num',
                    'title'=>'粉丝',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'jointime',
                    'title'=>'加入时间',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'follow',
                    'title'=>'关注',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
            );
            $list_data['head'] = $head;
        }
        $ret = json_encode(array('rs'=>true, 'error'=>'', 'data'=>$list_data, 'type'=>'table'));
        echo $ret; exit;
    }
	/**
     * 异步获取审核成员;
     */
    public function ajaxAuditsEemployee() {
   		$groupId = isset($_GET['id']) ? $_GET['id'] : 0;
    	if(empty($groupId)){
    		$this->load->model('common_model', 'common');
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], 'id参数不存在', 1);
    	}
    	$limit = (isset($_GET['per']) && intval($_GET['per']) > 0 ) ? intval($_GET['per']) : 5;
        //偏移量
        $page = (isset($_GET['p']) && intval($_GET['p']) > 0) ? $_GET['p'] : 0;
        $start = $page ? ($page-1) * $limit : 0;
        $table = $this->group->getGroupEmployeeList($groupId, true, '', $start, $limit, 0);
        $total =  $this->group->getGroupEmployeeTotal($groupId);
        $list_data['total'] = $total[0]['num'];
   		if(is_array($table)) {
   			$resource_url = $this->config->item("resource_url");
            $i = 0;
            foreach($table as $item) {
                $item = (array)$item;
                $item['imageurl'] = empty($item['imageurl']) ? 'default_avatar.thumb.jpg' : $item['imageurl']; 
                $list_data['table'][$i][] = '<a href="/employee/homepage/index?employeeid='.$item['employeeid'].'"><img class="headPhoto" src="'.$resource_url.$item['imageurl'].'"></a>';
                $list_data['table'][$i][] = $item['name'];
                $list_data['table'][$i][] = '<a class="button_blue group_button" href="/employee/group/audits?gid='.$groupId.'&eid='.$item['employeeid'].'">通过</a> <a class="button_gray group_button" href="/employee/group/deleteGroupEmployee?gid='.$groupId.'&eid='.$item['employeeid'].'">不通过</a>';
                $i++;
            }
        }
        // 获取表格头部数据;
        if(!empty($_GET['head'])) {
            $head = array(
                array(
                    'name'=>'imageurl',
                    'title'=>'成员',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                 array(
                    'name'=>'name',
                    'title'=>'名称',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'',
                    'title'=>'操作',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
            );
            $list_data['head'] = $head;
        }
        $ret = json_encode(array('rs'=>true, 'error'=>'', 'data'=>$list_data, 'type'=>'table'));
        echo $ret; exit;
    }
	/**
     * 异步获取群组成员列表;
     */
    public function ajaxGetListEemployee() {
   		$groupId = isset($_GET['id']) ? $_GET['id'] : 0;
    	if(empty($groupId)){
    		$this->load->model('common_model', 'common');
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], 'id参数不存在', 1);
    	}
    	$limit = (isset($_GET['per']) && intval($_GET['per']) > 0 ) ? intval($_GET['per']) : 5;
        //偏移量
        $page = (isset($_GET['p']) && intval($_GET['p']) > 0) ? $_GET['p'] : 0;
        $start = $page ? ($page-1) * $limit : 0;
        $table = $this->group->getGroupEmployeeList($groupId, true, '', $start, $limit);
        $total =  $this->group->getGroupEmployeeTotal($groupId);
        $list_data['total'] = $total[0]['num'];
   		if(is_array($table)) {
   			$resource_url = $this->config->item("resource_url");
            $i = 0;
            foreach($table as $item) {
                $item = (array)$item;
                $item['imageurl'] = empty($item['imageurl']) ? 'default_avatar.thumb.jpg' : $item['imageurl']; 
                $list_data['table'][$i][] = '<a href="/employee/homepage/index?employeeid='.$item['employeeid'].'"><img class="headPhoto" src="'.$resource_url.$item['imageurl'].'"></a>';
                $list_data['table'][$i][] = $item['name'];
            	if($this->employeeId == $item['employeeid']){
                	$list_data['table'][$i][] = '<a href="javascript:;" class="button_gray group_button">我自己</a>';
                }else{
                	$g = $this->group->getGroupEmployeeInfo($groupId, $item['employeeid'], array('status'));
                	$del = '<a class="button_gray group_button" href="/employee/group/deleteGroupEmployee?gid='.$groupId.'&eid='.$item['employeeid'].'">删除</a>';
                	if($g['status'] != 3){
                		$list_data['table'][$i][] = '<a class="button_blue group_button" href="/employee/group/setAdmin?gid='.$groupId.'&eid='.$item['employeeid'].'">设置管理员</a>'.$del;
                	}else{
                		$list_data['table'][$i][] = '<a class="button_blue group_button" href="/employee/group/cancelAdmin?gid='.$groupId.'&eid='.$item['employeeid'].'">撤销管理员</a>'.$del;
                	}
                }
                $i++;
            }
        }
        // 获取表格头部数据;
        if(!empty($_GET['head'])) {
            $head = array(
                array(
                    'name'=>'imageurl',
                    'title'=>'成员',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                 array(
                    'name'=>'name',
                    'title'=>'名称',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'',
                    'title'=>'操作',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
            );
            $list_data['head'] = $head;
        }
        $ret = json_encode(array('rs'=>true, 'error'=>'', 'data'=>$list_data, 'type'=>'table'));
        echo $ret; exit;
    }
	/*
     * 审核
     */
    public function audits(){
    	$this->load->model('common_model', 'common');
    	$groupId = isset($_GET['gid']) ? $_GET['gid'] : 0;
    	if(empty($groupId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组id参数不存在', 1);
    	}
    	$employeeId = isset($_GET['eid']) ? $_GET['eid'] : 0;
    	if(empty($employeeId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '成员id参数不存在', 1);
    	}
    	$info = $this->group->getGroupEmployeeInfo($groupId, $employeeId, array('id'));
    	if(!$info){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组成员不存在', 1);	
    	}
    	$res = $this->group->updateGroupEmployeeStatus($info['id'], 1);
    	if($res){
    		//设置审核群组成员通知
    		$this->load->model("notice_model","notice");
    		$this->notice->addNotice($this->spaceId, $employeeId, $groupId, $this->group_object_type, $this->nt_group_audits_employee, $employeeId, 1);
    		//更新缓存
		    $groupList = $this->group->getEmployeeGroupList($this->spaceId, $this->employeeId, '', 0, 5);
		    QiaterCache::groupList($groupList);
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '审核成员成功');
    	}else{
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '审核成员失败', 1);	
    	}
    }
    /*
     * 设置群组管理员
     */
    public function setAdmin(){
    	$this->load->model('common_model', 'common');
    	$groupId = isset($_GET['gid']) ? $_GET['gid'] : 0;
    	if(empty($groupId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组id参数不存在', 1);
    	}
    	$employeeId = isset($_GET['eid']) ? $_GET['eid'] : 0;
    	if(empty($employeeId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '成员id参数不存在', 1);
    	}
    	$info = $this->group->getGroupEmployeeInfo($groupId, $employeeId, array('id'));
    	if(!$info){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组成员不存在', 1);	
    	}
    	$res = $this->group->updateGroupEmployeeStatus($info['id'], 3);
    	if($res){
    		//设置群组管理员通知
    		$this->load->model("notice_model","notice");
    		$this->notice->addNotice($this->spaceId, $this->employeeId, $groupId, $this->group_object_type, $this->nt_group_set_admin, $employeeId, 1);
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '设置管理员成功');
    	}else{
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '设置管理员失败', 1);	
    	}
    }
	/*
     * 设置撤销管理员
     */
    public function cancelAdmin(){
    	$this->load->model('common_model', 'common');
    	$groupId = isset($_GET['gid']) ? $_GET['gid'] : 0;
    	if(empty($groupId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组id参数不存在', 1);
    	}
    	$employeeId = isset($_GET['eid']) ? $_GET['eid'] : 0;
    	if(empty($employeeId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '成员id参数不存在', 1);
    	}
    	$info = $this->group->getGroupEmployeeInfo($groupId, $employeeId, array('id'));
    	if(!$info){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组成员不存在', 1);	
    	}
    	$res = $this->group->updateGroupEmployeeStatus($info['id'], 1);
    	if($res){
    		//取消群组管理员通知
    		$this->load->model("notice_model","notice");
    		$this->notice->addNotice($this->spaceId, $this->employeeId, $groupId, $this->group_object_type, $this->nt_group_cancel_admin, $employeeId, 1);
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '取消管理员成功');
    	}else{
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '取消管理员失败', 1);
    	}
    }
	/*
     * 删除群组成员
     */
    public function deleteGroupEmployee(){
    	$this->load->model('common_model', 'common');
    	$groupId = isset($_GET['gid']) ? $_GET['gid'] : 0;
    	if(empty($groupId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组id参数不存在', 1);
    	}
    	$employeeId = isset($_GET['eid']) ? $_GET['eid'] : 0;
    	if(empty($employeeId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '成员id参数不存在', 1);
    	}
    	$info_1 = $this->group->getGroupEmployeeInfo($groupId, $this->employeeId, array('status'));
    	if($info_1['status'] < 2){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '您没有权限进行此操作', 1);
    	}
    	$info_2 = $this->group->getGroupEmployeeInfo($groupId, $employeeId, array('status'));
    	if($info_2['status'] == 2 || $info_2['status'] == 3){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '不能删除群组管理员', 1);
    	}
    	$r = $this->group->getGroupInfo($groupId, array('employeenum'));
    	if($employeeNum = $r['employeenum']){
    		$employeeNum --;
    		if($this->group->removeGroupEmployee($groupId, $employeeId)){
    			$res = $this->group->updateGroup($groupId, array('employeenum' => $employeeNum));
    			if($res){
    				//删除群组成员通知
	    			$this->load->model("notice_model","notice");
	    			$this->notice->addNotice($this->spaceId, $this->employeeId, $groupId, $this->group_object_type, $this->nt_group_del_employee, $employeeId, 1);
		    		//更新缓存
	        		$groupList = $this->group->getEmployeeGroupList($this->spaceId, $employeeId, '', 0, 5);
	            	QiaterCache::groupList($groupList);
	    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '删除群组成员成功');
    			}else{
    				$this->common->_redirect($_SERVER['HTTP_REFERER'], '删除群组成员失败', 1);
    			}
    		}else{
    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '删除群组成员失败', 1);
    		}
    	}else{
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组不存在', 1);
    	}
    }
	/**
     * 异步获取群组文件列表;
     */
    public function ajaxGetGroupFileList() {
   		$groupId = isset($_GET['id']) ? $_GET['id'] : 0;
    	if(empty($groupId)){
    		$this->load->model('common_model', 'common');
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], 'id参数不存在', 1);
    	}
    	$group = $this->group->getGroupInfo($groupId, array('name'));
    	$limit = (isset($_GET['per']) && intval($_GET['per']) > 0 ) ? intval($_GET['per']) : 5;
        //偏移量
        $page = (isset($_GET['p']) && intval($_GET['p']) > 0) ? $_GET['p'] : 0;
        $start = $page ? ($page-1) * $limit : 0;
        $this->load->model('file_model', 'file');
        $where = array("F.spaceid='".$this->spaceId."'","F.isvisible = 1","F.fromid = '".$groupId."'", "F.fromtype = '".$this->group_object_type."'");
        $table = $this->file->getFiles($where,$orderby = "F.createtime",$orwhere = array(),$limit,$start);
        $res  = $this->file->getGroupFileTotal($groupId);
       	$list_data['total'] = $res[0]['num'];
   		if(is_array($table)) {
   			$resource_url = $this->config->item("resource_url");
   			$this->load->model('employee_model', 'employee');
            $i = 0;
            foreach($table as $item) {
                $item = (array)$item;
                $e = $this->employee->getEmployeeInfo($item['creatorid'], $cols = 'name');
                $op = '<div class="yy-file-operate-list"><div id="act_'.$i.'" class="yy-file-op">
		  					<a href="javascript:;" class="zListOper"></a>
							<div id="doc_'.$i.'" class="tkBox c3a hidden">
							<a href="/employee/file/down?fileid='.$item['id'].'">下载</a>
							<a href="/employee/file/view?fileid='.$item['id'].'" target="_blank">预览</a>
							</div>
						</div></div>';
                $list_data['table'][$i][] =$item['title'];
                $list_data['table'][$i][] = $item['filetype'];
                $list_data['table'][$i][] = $group['name'];
                $list_data['table'][$i][] = $e['name'];
                $list_data['table'][$i][] = $item['createtime'];
                $list_data['table'][$i][] = $item['viewnum'];
                $list_data['table'][$i][] = $item['downnum'];
                $list_data['table'][$i][] = $op;
               // $list_data['table'][$i][] = '<a href="javascript:;" class="zListOper"></a><a href="/employee/file/down?fileid='.$item['id'].'">下载</a>&nbsp;&nbsp;&nbsp;<a href="/employee/file/view?fileid='.$item['id'].'">预览</a>';
                $i++;
            }
        }
        // 获取表格头部数据;
        if(!empty($_GET['head'])) {
            $head = array(
                array(
                    'name'=>'title',
                    'title'=>'文档名称',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'filetype',
                    'title'=>'全部',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
               	array(
                    'name'=>'groupname',
                    'title'=>'群组',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'creatorid',
                    'title'=>'更新人',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'createtime',
                    'title'=>'更新时间',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'viewnum',
                    'title'=>'浏览',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'downnum',
                    'title'=>'下载',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>''
                ),
                array(
                    'name'=>'',
                    'title'=>'操作',
                    'isSort'=>false,
                    'sort'=>'asc',
                    'css'=>'w50'
                ),
            );
            $list_data['head'] = $head;
        }
        $ret = json_encode(array('rs'=>true, 'error'=>'', 'data'=>$list_data, 'type'=>'table'));
        echo $ret; exit;
    }
	/*
    * 上传群组文档
    */
    public function upload(){
    	if(isset($_POST['do']) && $_POST['do'] == '1'){
    		$this->load->model('common_model', 'common');
    		$this->load->model('resource_model', 'resource');
    		if(!$file = $this->resource->addFiles('group_file')){
    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '上传群组文件失败', 1);
    		}	
    		$d = date('Y-m-d H:i:s', time());
    		$keys = array('title','creatorid','createtime','spaceid','ancestorids', 'isleaf','fromid','fromtype');
	    	$values = array("'".$file['title']."'", "'".$this->employeeId."'", "'".$d."'", "'".$this->spaceId."'", "'|'", 1,"'".$_POST['gid']."'", $this->group_object_type);
	    	$this->load->model('file_model', 'filemodel');
	    	$fileId = $this->filemodel->insertTable('tb_file',$keys,$values);
    		if($fileId){
				$this->resource->addResource($this->group_object_type, $fileId, $file['resourceid']);
	   		}
	   		
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '上传文件成功');
    	}else{
    		$data['id'] = $_GET['id'];
    		$data['name'] = $_GET['name'];
    		$this->load->library('smarty');
        	$this->smarty->view('employee/group/upload.tpl', $data);	
    	}
    }
	/*
     * 添加群组成员
     */
    public function addGroupEmployee(){
    	if(isset($_POST['do']) && $_POST['do'] == '1'){
    		$this->load->model('common_model', 'common');
    		$groupId = $_POST['gid'] ? intval($_POST['gid']) : 0;
    		if(empty($groupId)){
    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组不存在', 1);
    		}
    		$value = trim($_POST['employeename']);
    		if(strstr($value, '@')){
    			$field = 'email';
    		}else{
    			$field = 'name';
    		}
    		$this->load->model('employee_model', 'employee');
    		$info = $this->employee->getEmployeeDetail($value, $field, $cols = 'id');
    		if(empty($info)){
    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '成员不存在', 1);
    		}else{
    			if($this->group->isGroupEmployee($groupId, $info['id'])){
    				$this->common->_redirect($_SERVER['HTTP_REFERER'], '该用户已存在', 1);
    			}
	    		$r = $this->group->getGroupInfo($groupId, array('employeenum'));
		    	if($employeeNum = $r['employeenum']){
		    		$employeeNum ++;
		    		if($this->group->createGroupEmployee($groupId, $info['id'], 1)){
		    			$res = $this->group->updateGroup($groupId, array('employeenum' => $employeeNum));
		    			if($res){
			    			//添加群组成员通知
		    				$this->load->model("notice_model","notice");
		    				$this->notice->addNotice($this->spaceId, $this->employeeId, $groupId, $this->group_object_type, $this->nt_group_add_employee, $info['id'], 1);
			    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '添加群组成员成功');
		    			}else{
		    				$this->common->_redirect($_SERVER['HTTP_REFERER'], '添加群组成员失败', 1);
		    			}
		    		}else{
		    			$this->common->_redirect($_SERVER['HTTP_REFERER'], '添加群组成员失败', 1);
		    		}
		    	}else{
		    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '群组不存在', 1);
		    	}
    		}
    	}else{
	        $data['id'] = isset($_GET['id']) ? $_GET['id'] : 0;
	        $this->load->library('smarty');
	        $this->smarty->view('employee/group/addGroupEmployee.tpl', $data);
    	}
    }
	/*
     * 删除群组
     */
    public function delGroup(){
    	$this->load->model('common_model', 'common');
    	$groupId = isset($_GET['id']) ? $_GET['id'] : 0;
    	if(empty($groupId)){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], 'id参数不存在', 1);
    	}
    	$info = $this->group->getGroupInfo($groupId, array('id', 'creatorid', 'status'));
    	if($info['creatorid'] != $this->employeeId){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '没有权限执行', 1);
    	}
    	if($info['status'] == 0){
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '已经删除', 1);
    	}
    	$r = $this->group->updateGroup($groupId,array('status' => 0), true);
    	if($r){
    		//更新缓存
        	$groupList = $this->group->getEmployeeGroupList($this->spaceId, $this->employeeId, '', 0, 5);
            QiaterCache::groupList($groupList);
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '删除群组成功');
    	}else{
    		$this->common->_redirect($_SERVER['HTTP_REFERER'], '删除群组失败', 1);
    	}
    }
    /*
     * 加入群组，退出群组
     * 用于加入/退出群组ajax操作
     * @return	{"op":"1","rs":true}  op为1是加入群组，0是退出群组； rs为true是操作成功，flase是操作失败
     */
    public function ajaxOpGrupal(){
    	$this->load->model('common_model', 'common');
    	$op = isset($_GET['op']) ? $_GET['op'] : 0;
    	$groupId = isset($_GET['id']) ? $_GET['id'] : 0;
    	$arr = array();
    	$arr['op'] = $op;
    	if(empty($groupId)){
    		$arr['rs'] = false;
    	}
    	$r = $this->group->getGroupInfo($groupId, array('employeenum', 'creatorid'));
    	if(!$employeeNum = $r['employeenum']){
    		$arr['rs'] = false;
    	}
    	if($op == 1){ //加入群组
    		$employeeNum ++;
    		if($this->group->isGroupEmployee($groupId, $this->employeeId)){
    			$arr['rs'] = false;
    		}else{
	    		if($this->group->createGroupEmployee($groupId, $this->employeeId, 1)){
		    		$res = $this->group->updateGroup($groupId, array('employeenum' => $employeeNum));
		    		if($res){
		    			//加入群组动态
		    			$this->load->model("feed_model","feed");
		    			$this->feed->addFeed($this->spaceId, $this->employeeId, $groupId, $this->group_object_type, $this->ft_group_join, $groupId);
		    			//加入群组通知
		    			$this->load->model("notice_model","notice");
		    			$this->notice->addNotice($this->spaceId, $this->employeeId, $groupId, $this->group_object_type, $this->nt_group_join, $r['creatorid'], 1);
		    			$arr['rs'] = true;
		    		}else{
						$arr['rs'] = false;
		    		}
	    		}else{
	    			$arr['rs'] = false;
	    		}	
    		}
    	}else{ //退出群组
    		$employeeNum --;
    		if(!$this->group->isGroupEmployee($groupId, $this->employeeId)){
    			$arr['rs'] = false;
    		}else{
	    		if($this->group->removeGroupEmployee($groupId, $this->employeeId)){
	    			$res = $this->group->updateGroup($groupId, array('employeenum' => $employeeNum));
	    			if($res){
		    			//退出群组通知
		    			$this->load->model("notice_model","notice");
		    			$this->notice->addNotice($this->spaceId, $this->employeeId, $groupId, $this->group_object_type, $this->nt_group_quit, $r['creatorid'], 1);
	    				$arr['rs'] = true;
	    			}else{
	    				$arr['rs'] = false;
	    			}
	    		}else{
	    			$arr['rs'] = false;
	    		}
    		}	    		
    	}
    	echo json_encode($arr); exit();
    }
    /*
     * 群组发言动态
     */
    public function	feed(){
    	$groupId = isset($_GET['id']) ? intval($_GET['id']) : 0;
    	$feedId = isset($_GET['feedid']) ? intval($_GET['feedid']) : 0;
    	$speech = $this->config->item('object_type_speech','base_config');
    	$this->load->model('feed_model', 'feed');
        $data = $this->feed->getFeedListByModelAndGroup($this->spaceId, $this->employeeId, $speech, $groupId, 0, $feedId);
        echo json_encode($data); exit();
    }
}