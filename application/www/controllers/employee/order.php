<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Order extends CI_Controller {
	function __construct() {
		parent::__construct();
		$this->load->helper('cache');
		$this->load->model('cart_model','cartmodel');
		$this->load->model('order_model','ordermodel');
		$this->config->load('config');
		$this->url_suffix = $this->config->item('url_suffix');
        $this->input->get_post(NULL, TRUE);
        $this->spaceId = QiaterCache::spaceid();//当前空间ID
        $this->employeeId = QiaterCache::employeeid();//当前用户ID
		$isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
		if($isAjax != true){ 
			$this->load->library('smarty');
			$this->initLeftData(); 
			$this->smarty->assign('url_suffix',$this->url_suffix);
		}
	}
	/**
     * 左侧APP列表、群组列表
     */
    private function initLeftData(){
        $this->load->model('app_model', 'appM');
        $this->load->model('group_model', 'groupM');
        $this->smarty->assign('appList',$this->appM->getAppList($this->spaceId));
        $this->smarty->assign('groupList',$this->groupM->getGroupMenu($this->spaceId, $this->employeeId));
    }
	//确认订单和未确认订单
	public function index(){
		$do = $this->input->get('do',true);
		$page = intval($this->input->get('page'));
		if($page <=0) $page = 1;
		$pagesize = 40;
		$spaceData = QiaterCache::spaceinfo();
		$this->smarty->assign('spaceData',$spaceData);
		if($do === false){
			$order = 'id DESC';
			$total = $this->ordermodel->count($this->spaceId, $this->employeeId);
			$pages = ceil($total/$pagesize);
			if($page > $pages) $page = $pagesize;
			$orderData = $this->ordermodel->findAll($this->spaceId, $this->employeeId,$page,$pagesize);
			$this->load->model('goods_model','goodsmodel');
			$newGoodsData = $this->goodsmodel->getNew($this->spaceId);
			$orderFollowData = $this->ordermodel->orderFollowList($this->spaceId, $this->employeeId);
			$this->smarty->assign('orderFollowData',$orderFollowData); 
			$this->smarty->assign('newGoodsData',$newGoodsData);
			$this->smarty->assign('orderData',$orderData);
			$this->smarty->view('employee/goods/order_index.tpl');
		}else{
			 $orderData = $this->ordermodel->findAll($this->spaceId, $this->employeeId,$page,$pagesize,0);
			 $this->smarty->assign('orderData',$orderData);
			 $this->smarty->view('employee/goods/order_unaudited.tpl');
		}
	}
	//获得未确认订单下的商品列表
	public function getGoodsInunorder(){
		$orderid = $this->input->get('orderid',true);
		$goodsData = $this->ordermodel->getGoodsInunorder($this->spaceId, $this->employeeId,$orderid);
		$this->smarty->assign('goodsData',$goodsData);
		$this->smarty->view('employee/goods/order_unaudited_html.tpl');
	}
	//订单详细
	public function detail(){
		$id = $this->input->get('id');
		if(!is_numeric($id)){
			exit('Access denny.');
		}
		$orderData = $this->ordermodel->find($id);
		$isFollowd = $isRoleJoinNextPage = $isRoleNoticeNextPage = false;
		$roleJoinData = $roleNoticeData = array();
		$roleJoinCount = $roleNoticeCount = 0;
		if($orderData){
			$page = 1;
			$pagesize = 19;
			$isFollowd = $this->ordermodel->isFollowed($id,$this->spaceId, $this->employeeId);
			$roleJoinData = $this->ordermodel->getRole($this->spaceId,$id,1,$page,$pagesize);
			$roleJoinCount = $this->ordermodel->getRoleCount($this->spaceId,$id,1);
			$isRoleJoinNextPage = $roleJoinCount > $pagesize ? true : false;
			$roleNoticeData = $this->ordermodel->getRole($this->spaceId,$id,2,$page,$pagesize);
			$roleNoticeCount = $this->ordermodel->getRoleCount($this->spaceId,$id,2);
			$isRoleNoticeNextPage = $roleNoticeCount > $pagesize ? true : false;
		}else{
			exit('order not found.');
		} 
		$this->smarty->assign('isFollowd',$isFollowd); 
		$this->smarty->assign('isRoleJoinNextPage',$isRoleJoinNextPage); 
		$this->smarty->assign('isRoleNoticeNextPage',$isRoleNoticeNextPage); 
		$this->smarty->assign('roleJoinData',$roleJoinData);
		$this->smarty->assign('roleJoinCount',$roleJoinCount);
		$this->smarty->assign('roleNoticeCount',$roleNoticeCount);
		$this->smarty->assign('roleNoticeData',$roleNoticeData); 
		$this->smarty->assign('orderData',$orderData);
		$this->smarty->assign('orderid',$id);
        $this->smarty->view('employee/goods/order_detail.tpl');
	}
	//订单关注操作
	public function orderFollowAct(){
		$id = $this->input->get('orderid',true);
		$error['rs'] = false;
		if(!is_numeric($id)){
			$error['msg'] = 'Access denny.';
		}else{
			$act = $this->input->get('act',true);
			if(!in_array($act,array('add','cancel'))){
				$error['msg'] = 'Request method do not exists.';
			}else{
				$bool = $this->ordermodel->orderFollowAct($id,$act,$this->spaceId, $this->employeeId);
				if($bool){
					$error['rs'] = true;
				}else{
					$error['msg'] = 'fail';
				}
			}
		}
		echo json_encode($error);
	}
	//订单执行情况
	public function status(){
		$id = $this->input->get('id');
		if(!is_numeric($id)){
			exit('Access denny.');
		}
		$orderData = $this->ordermodel->find($id);
		if($orderData){
			echo '调用T+订单执行情况';
		}else{
			exit('order not found.');
		}
	}
	//订单生成提示信息
	public function notice(){
		$id = intval($this->input->get('id'));
		$num = $this->input->get('num',true);
		$source = $this->input->get('source',true);
		$this->smarty->assign('source',$source);
		$this->smarty->assign('ordercode',$num);
		$this->smarty->assign('orderid',$id);
        $this->smarty->view('employee/goods/order_notice.tpl');
	}
	//生成订单
	public function add(){
		$data = $this->ordermodel->add($this->spaceId, $this->employeeId);
		if(is_array($data) && !empty($data)){
			$orderid = $data['orderid'];
			$ordernum = $data['ordernum'];
			$ordernumfrom = $data['ordernumfrom'];
			header("Location: /employee/order/notice".$this->url_suffix."?id=$orderid&num=$ordernum&source=$ordernumfrom");
		}else{
			 echo '生产订单失败';
		}
	}
    /**
     * 对账单
     */
    public function statement(){
		$page = intval($this->input->get('page'));
		if($page <=0) $page = 1;
		$pagesize = 40;
		$statementData = $this->ordermodel->statement($this->spaceId, $this->employeeId,$page,$pagesize);
		$this->smarty->assign('statementData',$statementData);
        $this->smarty->view('employee/goods/statement.tpl');
    }
    /**
     * 未确认订单
     */
    public function unaudited(){
        $this->smarty->view('employee/goods/unaudited.tpl');
    }
	//订单评论
	public function orderComment(){
		$data['rs'] = true;
		$data['data'] = 'comment list';
		echo json_encode($data);
	}
	//订单动态
	public function orderFeed(){
		$data['rs'] = true;
		$data['data'] = 'feed list';
		echo json_encode($data);
	}
	//订单文档
	public function orderDocument(){
		$data['rs'] = true;
		$data['data'] = 'document list';
		echo json_encode($data);
	}
	//删除订单权限用户
	public function removeOrderUser(){
		$id = intval($this->input->get('id'));
		$employeeid = intval($this->input->get('employeeid'));
		$bool = $this->ordermodel->removeOrderUser($id,$employeeid);
		if($bool){
			$data['rs'] = true;
		}else{
			$data['rs'] = false;
		}
		echo json_encode($data);
	}
	public function getOrderRoleList(){
		$this->config->load('config');
		$orderid = intval($this->input->get('orderid'));
		$role = intval($this->input->get('role'));
		$page = intval($this->input->get('page'));
		$pagesize = 19;
		$r['rs'] = true;
		$data = array();
		$html = '';
		$total = 0;
		if($role == 1){
			$data = $this->ordermodel->getRole($this->spaceId,$orderid,1,$page,19);
			$total = $this->ordermodel->getRoleCount($this->spaceId,$orderid,1);
		}else if($role == 2){
			$data  = $this->ordermodel->getRole($this->spaceId,$orderid,2,$page,19);
			$total = $this->ordermodel->getRoleCount($this->spaceId,$orderid,2);
		}
		if($page == 1){
			$previous = 0;
		}else{
			$previous = $page - 1;
		}
		$pages = ceil($total/$pagesize);
		if($page>=$pages){
			$next = 0;
		}else{
			$next = $page + 1;
		}
		if($data){
			foreach($data as $v){
				$employeeid = $v['employeeid'];
				$name = $v['name'];
				$id = $v['id'];
				$imageurl = $v['imageurl'];
				$imageurl = $this->config->item('resource_url') . $imageurl;
				$html .= '<li><a href="/employee/homepage/index.html?employeeid='.$employeeid.'" class="personLink" target="_blank">
				<img rel="http://static.yonyou.com/qz/default_avatar.thumb.jpg" onerror="imgError(this);" src="'.$imageurl.'" alt="'.$name.'"  title="'.$name.'">	
				</a><span class="delTag" title="删除参与人['.$name.']" id="'.$id.'" data-user-id="'.$employeeid.'"></span></li>';
			}
		}
		$html .= '<li><a href="javascript:;" class="addPerson"  data-order-id="'.$orderid.'" data-user-role="'.$role.'"></a></li>';
		$r['pages'] = $pages;
		$r['previouspage'] = $previous;
		$r['nextpage'] = $next;
		$r['total'] = $total;
		$r['data'] = $html;
		echo json_encode($r);
	}
}