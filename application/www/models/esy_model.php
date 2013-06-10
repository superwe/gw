<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * 翼商云空间处理
 * @author hejinlong
 * @date 2013/05/10
 */
class Esy_model extends CI_Model{
 	public function __construct(){
        $this->load->database('default');
    }
	/**
	 * 判断当前客户是否创建空间
	 * @param 	string 	$custId 	客户ID
	 * @param 	int	 	$spaceId	  圈子ID
	 * @return 	boolen	true为存在，false为不存在
	**/
	public function isHaveSpaceEsy($custId, $spaceId = 0){
		$sql = 'SELECT id FROM tb_space_esy WHERE cust_id = "'.$custId.'"';
		if(!empty($spaceId)){
			$sql .= ' space_id = '.$spaceId;
		}
		
		$res = $this->db->query($sql);
    	return $res->num_rows > 0 ? true : false;
	}
	/**
	 * 查询客户和空间的映射关系
	 * @param 	array	$where	查询条件 如array('id'=>1)
	 * @return 	false|array
	**/
	public function getSpaceEsy($where = array()){
		if(empty($where) || !is_array($where)){
			return false;
		}
		foreach($where as $k=>$v){
			$arr[] = $k.' = "'.$v.'"';
		}
		$sql = 'SELECT * FROM tb_space_esy WHERE '.implode(',', $arr);
        $rs = $this->db->query($sql);
        return $rs->row_array();
	}
	/**
	 * 写入客户和空间的映射关系
	 * @param int	  	$spaceId	  	圈子ID
	 * @param string 	$custId 	 	客户ID
	 * @param string 	$custAccount 	客户账号
	 * @param int	  	$licenseNum	  	客户规模
	 * @return boolen	
	**/
	public function addSpaceEsy($spaceId, $custId, $custAccount = '', $licenseNum = 0){
		$this->db->trans_begin();
    	$res = $this->db->query( 'INSERT INTO tb_space_esy (space_id, cust_id, cust_account, license_num) VALUES (?, ?, ?, ?)', array($spaceId, $custId, $custAccount, $licenseNum));
    	if ($this->db->trans_status() == FALSE){
		    $this->db->trans_rollback();
		}else{
			$this->db->trans_commit();
			return $res;
		}
	}
	/**
     * 更新客户和空间的映射关系
     * @param string 	$custId 	 	客户ID
     * @param int	  	$licenseNum	  	客户规模
     * @return	boolen	true|false
     */
    public function updateSpaceEsy($custId, $licenseNum){
    	$this->db->trans_begin();
    	$res = $this->db->query(' UPDATE tb_space_esy SET license_num = ? WHERE cust_id =? ', array($licenseNum, $custId));
    	if ($this->db->trans_status() == FALSE){
		    $this->db->trans_rollback();
		}else{
			$this->db->trans_commit();
			return $res;
		}
    }
    /**
     * 删除客户和空间的映射关系
     * @param int	  	$spaceId	  	空间ID
     * @param string 	$custId 	 	客户ID
     * @return	boolen	true|false
     */
	public function	delSpaceEsy($spaceID, $custId){
    	$this->db->trans_begin();
    	$res = $this->db->query( 'DELETE FROM tb_space_esy WHERE space_id = ? AND cust_id =? ', array($spaceID, $custId));
    	if ($this->db->trans_status() == FALSE){
		    $this->db->trans_rollback();
		}else{
			$this->db->trans_commit();
    		return $res;
		}
    }
	/**
     * 更新空间状态
     * @param int	  	$spaceId	  	空间ID
     * @param int	  	$status	  		空间状态  0待审核 1 正常 审核通过,2 审核不太敢 3停用,4解散
     * @return	boolen	true|false
     */
    public function updateSpaceStatus($spaceId, $status){
    	$this->db->trans_begin();
    	$res = $this->db->query(' UPDATE tb_space SET status = ? WHERE id =? ', array($status, $spaceId));
    	if ($this->db->trans_status() == FALSE){
		    $this->db->trans_rollback();
		}else{
			$this->db->trans_commit();
			return $res;
		}
    }
	/**
     * 更新用户空间状态
     * @param int	  	$employeeId	  	用户ID
     * @param int	  	$status	  		用户空间状态  未激活0   正常1   停用2
     * @return	boolen	true|false
     */
    public function updateEmployeeSpaceStatus($employeeId, $status){
    	$this->db->trans_begin();
    	$res = $this->db->query(' UPDATE tb_employee SET status = ? WHERE id =? ', array($status, $employeeId));
    	if ($this->db->trans_status() == FALSE){
		    $this->db->trans_rollback();
		}else{
			$this->db->trans_commit();
			return $res;
		}
    }
}
	