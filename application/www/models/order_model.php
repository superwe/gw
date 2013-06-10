<?php
class Order_model extends  CI_Model{
    public function __construct(){
        $this->load->database('default');
    }
	public function find($id){
		$sql = 'SELECT * FROM tb_goods_order WHERE id = ?';
		$rs = $this->db->query($sql,array($id));
		return $rs->result_array();
	}
	public function count($spaceid,$employeeid){
		$sql = 'SELECT COUNT(id) AS c FROM tb_goods_order WHERE spaceid =? AND employeeid = ? ';
		$query = $this->db->query($sql,array($spaceid,$employeeid));
		if ($query->num_rows() > 0){
			return $query->row()->c;
		}
		return 0;
	}
	public function findAll($spaceid,$employeeid,$page,$pagesize){
		$limit = $pagesize;
		$offset = ($page - 1) * $limit;
		$sql = 'SELECT a.id,a.ordernum,a.ordernumfrom,a.createtime,b.name AS username,b.status,b.imageurl FROM tb_goods_order AS a LEFT JOIN tb_employee b ON a.employeeid = b.id WHERE a.spaceid =? AND a.status = 1 AND a.employeeid = ?  ORDER BY a.id DESC LIMIT ?,?';
		$rs = $this->db->query($sql,array($spaceid,$employeeid,$offset,$limit));
		return $rs->result_array();
	}
	//关注的订单
	public function orderFollow($spaceid,$employeeid,$limit = 6){
		$sql = 'SELECT b.employeeid,b.id,b.ordernumfrom,c.name,c.imageurl FROM  tb_goods_order_follow a LEFT JOIN tb_goods_order b ON a.orderid = b.id LEFT JOIN tb_employee c ON a.employeeid = c.id WHERE a.spaceid = ? AND a.employeeid = ? ORDER BY a.id DESC limit ?';
		$rs = $this->db->query($sql,array($spaceid,$employeeid,$limit));
		return $rs->result_array();
	}
	//对账单
	public function statement($spaceid,$employeeid,$page,$pagesize){
		$sql = 'SELECT b.* FROM tb_goods_order_statement_role a LEFT JOIN tb_goods_order_statement b ON a.orderstatementid = b.id
WHERE a.spaceid = ? AND a.employeeid = ? ORDER BY a.id DESC LIMIT ?,?';
		$limit = $pagesize;
		$offset = ($page - 1) * $limit;
		$rs = $this->db->query($sql,array($spaceid,$employeeid,$offset,$limit));
		return $rs->result_array();
	}
	public function getMaxId(){
		$sql = 'SELECT MAX(id) maxid FROM tb_goods_order';
		$rs = $this->db->query($sql);
		if($rs->num_rows() > 0) {
			$maxid = $rs->row()->maxid + 1;
		}else{
			$maxid = 1;
		}
		$maxid = (string) $maxid;
		$maxid = '00000000000'.$maxid;
		return date('Ymd',time()).substr($maxid,-11);
	}
	public function tplus(){
		return array('ordernumfrom'=>'100');
	}
	public function add($spaceid,$employeeid){
		$orderData = $this->tplus();
		$shopcartData = $this->cartmodel->shopcartlist($spaceid,$employeeid);
		$ordernum = $this->getMaxId();
		$createtime = date('Y-m-d H:i:s',time());
		$orderData = $this->tplus();
		$ordernumfrom = isset($orderData['ordernumfrom']) ? $orderData['ordernumfrom'] : '';
		$voucherguid = isset($orderData['voucherguid']) ? $orderData['voucherguid'] : '';
		 
		$discountprice = 0;
		if($ordernumfrom){
			$status = 1;
		}else{
			$status = 0;
		}
		$orderRow = array(
			'ordernum'=>$ordernum,
			'voucherguid'=>$voucherguid,
			'spaceid'=>$spaceid,
			'ordernumfrom'=>$ordernumfrom,
			'status'=>$status,
			'employeeid'=>$employeeid,
			'createtime'=>$createtime,
			'freeitems'=>''
		);
		//创建订单
		$this->db->trans_begin();
		$sql = 'INSERT INTO tb_goods_order(ordernum,voucherguid,spaceid,ordernumfrom,status,employeeid,createtime,freeitems) VALUES(?,?,?,?,?,?,?,?)';
		$this->db->query($sql,$orderRow);
		if ($this->db->trans_status() == FALSE) {
			$this->db->trans_rollback();
			return '创建订单失败';
		}
		$orderid = $this->db->insert_id();
		foreach($shopcartData as $k=>$v){
			$orderListRow = array(
				'orderid'=>$orderid,
				'goodsid'=>1,
				'buycount'=>$v['buycount'],
				'discountprice'=>$discountprice,
				'freeitems'=>$v['freeitems']
			);
			$sql = 'INSERT INTO tb_goods_order_list(orderid,goodsid,buycount,discountprice) VALUES (?,?,?,?)';
			$this->db->query($sql,$orderListRow);
		}
		$bool = $this->cartmodel->clear($spaceid,$employeeid);
		if ($this->db->trans_status() == FALSE) {
			$this->db->trans_rollback();
			return '创建订单商品信息失败';
		}
		$this->db->trans_commit();
		return array('orderid'=>$orderid,'ordernum'=>$ordernum,'ordernumfrom'=>$ordernumfrom);
	}
}