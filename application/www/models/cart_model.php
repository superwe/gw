<?php
class Cart_model extends  CI_Model{
    public function __construct(){
        $this->load->database('default');
    }
	public function add($spaceid,$employeeid,$goodsid,$buycount,$discountprice,$freeitems){
		$buycount = intval($buycount);
		$sql = 'SELECT id,buycount,COUNT(id) AS c FROM tb_goods_shopping_cart WHERE freeitems = ? AND spaceid = ? AND goodsid = ?';
		$rs = $this->db->query($sql,array($freeitems,$spaceid,$goodsid));
		$row = $rs->row_array(); 
		if($row['c'] == 0){
			$sql = 'INSERT INTO tb_goods_shopping_cart(spaceid,employeeid,goodsid,buycount,discountprice,freeitems,createtime) VALUES (?,?,?,?,?,?,?)';
			$createtime = date('Y-m-d H:i:s',time());
			return $this->db->query($sql,array($spaceid,$employeeid,$goodsid,$buycount,$discountprice,$freeitems,$createtime));
		}else{
			$_id = $row['id'];
			$_buycount = $row['buycount'];
			$buycount = $_buycount + 1;
			$sql = 'UPDATE tb_goods_shopping_cart SET buycount = ? WHERE id = ?';
			return $this->db->query($sql,array($buycount,$_id));
		}
	}
	public function move($employeeid,$id){
		 $sql = 'DELETE FROM tb_goods_shopping_cart WHERE employeeid = ? AND id = ?';
		 return $this->db->query($sql,array($employeeid,$id));
	}
	public function shopcartlist($spaceid,$employeeid){
		$sql = 'SELECT a.id,a.goodsid,a.buycount,a.discountprice,a.freeitems,b.name,b.typeguid,b.imageurl,b.openprice FROM tb_goods_shopping_cart AS a LEFT JOIN tb_goods b ON a.goodsid = b.id WHERE a.spaceid = ? AND a.employeeid = ?';
		$rs = $this->db->query($sql,array($spaceid,$employeeid));
		return $rs->result_array();
	}
	public function clear($spaceid,$employeeid){
		$sql = 'DELETE FROM tb_goods_shopping_cart WHERE spaceid = ? AND employeeid = ?';
		return $this->db->query($sql,array($spaceid,$employeeid));
	}
}