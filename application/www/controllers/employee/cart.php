<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Cart extends CI_Controller {
	function __construct() {
		parent::__construct();
		$this->load->helper('cache');
		$this->load->model('cart_model','cartmodel');
		$this->config->load('config');
		$this->url_suffix = $this->config->item('url_suffix');
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

	public function add(){
		$id = $this->input->get('id');
		if(!is_numeric($id) || $id <=0) {
			exit('访问的商品信息不存在');
		}
		$employeeid = 38;
		$spaceid = 1;
		$buycount = 1;
		$discountprice = 0;
		$freeitems = 'freeitem2|红色;freeitem1|尺寸'; 
		$bool = $this->cartmodel->add($this->spaceId,$this->employeeId,$id,$buycount,$discountprice,$freeitems);
		if($bool === true){
			header('Location: /employee/cart');
		}else{
			echo '加入购物车失败!';
		}
	}
	public function index(){
		$shopcartData = $this->cartmodel->shopcartlist($this->spaceId,$this->employeeId);
		$totalOpenPrice = $totalDiscountPrice = 0;
		if($shopcartData){
			foreach($shopcartData as $k=>$v){
				$imageurl = str_replace('middle','small',$v['imageurl']);
				$v['imageurl'] = $imageurl;
				$v['buycount'] = intval($v['buycount']);
				$v['openprice'] = format_price($v['openprice']);
				$v['discountprice'] = format_price($v['discountprice']);
				$v['subopenprice'] = format_price($v['openprice'] * $v['buycount']);
				$v['subdiscountprice'] = format_price($v['discountprice'] * $v['buycount']);
				$totalOpenPrice += $v['subopenprice'];
				$totalDiscountPrice += $v['subdiscountprice'];
				$shopcartData[$k] = $v;
			}
		}
		$this->smarty->assign('shopcartData',$shopcartData);
		$this->smarty->assign('totalOpenPrice',format_price($totalOpenPrice));
		$this->smarty->assign('totalDiscountPrice',format_price($totalDiscountPrice));
        $this->smarty->view('employee/goods/cart.tpl');
	}
	public function order(){
		$shopcartData = $this->cartmodel->shopcartlist($this->spaceId,$this->employeeId);
		$totalOpenPrice = $totalDiscountPrice = 0;
		if($shopcartData){
			foreach($shopcartData as $k=>$v){
				$imageurl = str_replace('middle','small',$v['imageurl']);
				$v['imageurl'] = $imageurl;
				$v['buycount'] = intval($v['buycount']);
				$v['openprice'] = format_price($v['openprice']);
				$v['discountprice'] = format_price($v['discountprice']);
				$v['subopenprice'] = format_price($v['openprice'] * $v['buycount']);
				$v['subdiscountprice'] = format_price($v['discountprice'] * $v['buycount']);
				$totalOpenPrice += $v['subopenprice'];
				$totalDiscountPrice += $v['subdiscountprice'];
				$shopcartData[$k] = $v;
			}
			$this->load->model('employee_model','employeemodel');
			$addrListData = $this->employeemodel->getAddressList($this->spaceId,$this->employeeId);
		}else{
			header('Location: /employee/cart');
		}
		$this->smarty->assign('shopcartData',$shopcartData);
		$this->smarty->assign('addrListData',$addrListData);
		$this->smarty->assign('totalOpenPrice',format_price($totalOpenPrice));
		$this->smarty->assign('totalDiscountPrice',format_price($totalDiscountPrice));
        $this->smarty->view('employee/goods/orderInfo.tpl');
	}
	public function move(){
		$id = $this->input->get('id');
		if(!is_numeric($id) || $id <=0) {
			exit('访问的商品信息不存在');
		}
		$employeeid = 38;
		$bool = $this->cartmodel->move($this->employeeId,$id);
		if($bool == true){
			header("Location: /employee/cart");
		}else{
			echo '删除购物车商品失败，请稍候再试!';
		}
	}
	public function clear(){
		$employeeid = 38;
		$spaceid = 1;
		$bool = $this->cartmodel->clear($spaceid,$employeeid);
		if($bool == true){
			echo '亲，您的购物车一件商品也没有啦！&nbsp;&nbsp;&nbsp;&nbsp;<a href="/main/goods">点击继续购物</a>';
		}else{
			echo '清空购物车失败，请稍候再试!';
		}
	}
	public function address(){
		$this->load->model('employee_model','employeemodel');
		 
		$bool = $this->employeemodel->getAddressCount($this->spaceId, $this->employeeId);
		if($bool !== true){
			echo '最多可以添加5个收货人地址。';exit;
		}
		$province = '北京';
		$city = '海淀区';
		$address= '上地';
		$postcode = '100094';
		$receiver = '张';
		$phone = '010';
		$mobile = '15811171124';
		$isdefault = 1;
		$bool = $this->employeemodel->addAddress($this->spaceId, $this->employeeId,$province,$city,$address,$postcode,$receiver,$phone,$mobile,$isdefault);
		if($bool){
			header("Location: /employee/cart/order");
		}else{
			echo '添加失败!';
		}
	}
	public function moveaddr(){
		$this->load->model('employee_model','employeemodel');
		$id = $this->input->get('id');
		if(!is_numeric($id) || $id <=0) {
			exit('收货地址不存在');
		}
		$bool = $this->employeemodel->moveaddr($id,$this->employeeId);
		if($bool){
			header("Location: /employee/cart/order");
		}else{
			echo '删除失败!';
		}
	}
}