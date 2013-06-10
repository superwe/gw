<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * 对接翼商云接口模块
 * @author bishenghua
 * @date 2013/05/10
 * @email net.bsh@gmail.com
 */
class Esyapi_model extends CI_Model{
	
	private $_esyClass = null;
	private $_config = null;
	private $_ip = null;
	private static $_opFlag = array(
			'0101' => 'customerOpen', 		//客户开通
			'0102' => 'customerChange', 	//客户变更
			'0103' => 'customerCancel', 	//客户退订
			'0191' => 'customerPause', 		//客户暂停
			'0192' => 'customerRecover', 	//客户恢复
			'0193' => 'customerClose', 		//客户停机
				
			'0201' => 'userBind', 			//用户绑定
			'0202' => 'userChange', 		//用户变更
			'0203' => 'userUnBind', 		//用户解绑
			'0205' => 'userLogin', 			//用户登录
			'0291' => 'userPause', 			//用户暂停
			'0292' => 'userRecover', 		//用户恢复
			'0293' => 'userStop', 			//用户停机'
	);
	private static $_statusCode = array(
			'00000' =>  '交易成功',
			'00001' =>  '交易失败',
			'00002' =>  '参数要素不全',
			'00003' =>  '非业务时间',
			'00004' =>  '业务未授权',
			'00005' =>  '查询结果为空',
			'00006' =>  '系统无此业务',
	
			'00201' =>  '查询数据库异常',
			'00202' =>  '插入数据异常',
			'00203' =>  '修改数据异常',
			'00204' =>  '删除数据异常',
			'00205' =>  '过程执行异常',
	
			'00401' => '关键数据项不能为空',
			'00402' => '业务数据内容不存在',
			'00403' => '数据格式不正确',
			'00404' => '业务逻辑执行错误',
			'00601' => '连接服务异常',
			'00602' => '断开服务异常',
			'00603' => '发送数据失败',
			'00604' => '接收数据失败',
	);
	
	public function __construct() {
		$this->load->helper('esy');
		try {
			$this->config->load('esy');
			$this->_config = $this->config->config['esy'];
			$this->_ip = $this->input->ip_address();
			$this->_esyClass = new EsyClass($this->_config);
		} catch (Exception $e) {
			$this->_esyClass = null;
			//接获soap错误信息
			//echo $e;
		}
	}
	
	/**
	 * 凡是用$this->_esyClass对象的方法都要调用此方法检测
	 */
	public function isOk() {
		return $this->_esyClass != null;
	}
	
	/**
	 * 所有操作入口
	 * @param string $streamingno
	 * @param string $rand
	 * @param string $encode
	 */
	public function enter($streamingno, $rand, $encode) {
		if (!$this->isOk()) return false;
	
		$flag = false;
		EsyClass::$debug = true;
		if (isset($_GET['S8dPlj_Aq4-W']))
			EsyClass::$test = true;
	
		$this->log('START---------------START--------------START--------------START--------------START');
		$this->log("Streamingno:$streamingno, Rand:$rand, Encode:$encode");
		//接收参数并从领航平台获取操作信息
		$response = $this->_esyClass->getPortalRequest($streamingno, $rand);
		$this->log('FirstResponse:' . print_r($response, true));
	
		/**
		 * 产品信息:
		 * 产品名称:		企业空间
		 * 产品商编号:	14000068
		 * 产品编号:		140000680000000000000013
		 *
		 * AP 编号:		14000068
		 * AP 名称:		用友软件
		 * AP 密钥:		8EED63EAB85FB4B92175EFDCC7C1FA48EF57D749B8AD0842
		 *
		 * 对应字段:(产品平台查询信息时需要)
		 * SIID:		14000068
		 * PRODUCTID:	140000680000000000000013
		 * PASSWORD:	8EED63EAB85FB4B92175EFDCC7C1FA48EF57D749B8AD0842
		*/
	
	
		//上线联调时只需要注释掉这里并打开[++++]行注释（大概在129行）
		if (isset($_GET['S8dPlj_Aq4-W'])) {
			$xml = '<?xml version="1.0" encoding="utf-8"?>
			<Package>
			<StreamingNo>Y29ycDYymde$</StreamingNo>
			<OPFlag>' . ($_GET['o'] ? $_GET['o'] : '0101') . '</OPFlag>
			<TimeStamp>1340006561</TimeStamp>
			<ProductID>900000120000000000000010</ProductID>
			<BizID>admin@sddx0918</BizID>
			<Password>34ffff45t5t5f56y67ygg67hhh7893fr</Password>
			<AreaCode>530</AreaCode>
			<CustID>' . (isset($_GET['cid']) ? $_GET['cid'] : 'SD5310000473') . '</CustID>
			<UserID>' . (isset($_GET['uid']) ? $_GET['uid'] : 'sddx0919') . '</UserID>
			<AccType>' . (isset($_GET['at']) ? $_GET['at'] : 1) . '</AccType>
			<CustAccount>' . (isset($_GET['cacc']) ? $_GET['cacc'] : 'sddx0919') . '</CustAccount>
			<CustName>' . (isset($_GET['qz']) ? $_GET['qz'] : '中国电信重庆分公司') . '</CustName>
			<AccName>' . (isset($_GET['uname']) ? $_GET['uname'] : 'test') . '</AccName>
			<AccountInfo>
				<AccName>' . (isset($_GET['uname']) ? $_GET['uname'] : 'test') . '</AccName>
			</AccountInfo>
			<AccessNo></AccessNo>
			<ProductInfo>
			<Product>
			  <ProductInstID>1</ProductInstID>
			  <ProductType>LicenseNum</ProductType>
			  <ProductValue>' . (isset($_GET['num']) ? intval($_GET['num']) : 300) . '</ProductValue>
			  <ParentType/>
			  <ProductParentInstID/>
			</Product>
			<Product>
			  <ProductInstID>2</ProductInstID>
			  <ProductType>fee</ProductType>
			  <ProductValue>90</ProductValue>
			  <ParentType/>
			  <ProductParentInstID/>
			</Product>
		    </ProductInfo>
		    <ReturnStatus>00000</ReturnStatus>
			<Summary>客户信息查询成功</Summary>
			</Package>';
			$response = EsyClass::xml2array($xml);
		}
	
		if (isset($response['OPFlag']) && in_array($opFlag = $response['OPFlag'], array_keys(self::$_opFlag))) {
			//校验参数是否正确
			$decode = $response['StreamingNo'] . $rand . $response['CustID'] . $response['ProductID'];
			$encodeReturn = $this->_esyClass->getEncodeString($decode);
			$this->log("EncodeReturn:$encodeReturn");
			if (!isset($_GET['S8dPlj_Aq4-W'])) {
				if ($encode != $encodeReturn) return false; //[++++]
	
				if ($opFlag != '0205') {
					if (in_array($opFlag, array('0101', '0102', '0103', '0191', '0192', '0193'))) $response['OPFlag'] = '0104'; //需要查询一次客户信息
					else {
						$response['OPFlag'] = '0204'; //需要查询一次用户信息
						$response['UserID'] = $response['AccountInfo']['UserID'];
						//查询CustAccount
						$res = $this->getInfo($response['CustID']);
						$response['CustAccount'] = $res['cust_account'];
					}
						
					$response['SIID'] 	= '14000068';
					$response['Password'] 	= '8EED63EAB85FB4B92175EFDCC7C1FA48EF57D749B8AD0842';
					$response = $this->_esyClass->getPortalResult($response);
					$this->log('SecondResponse:' . print_r($response, true));
					if (!isset($response['ReturnStatus']) || $response['ReturnStatus'] != '00000') return false;
				}
			}
				
			//动作分支
			$doOpFlag = self::$_opFlag[$opFlag];
			$this->log("ExecFunction:$doOpFlag");
			$result = $this->$doOpFlag($response);
			$this->log('DoOpFlagReturn:' . print_r($result, true));
				
			//将处理结果返回给领航平台
			$result['OPFlag'] = $opFlag;
			$response = $this->_esyClass->getPortalResult($result);
			$this->log('ThirdResponse:' . print_r($response, true));
			$flag = isset($response['ReturnStatus']) && $response['ReturnStatus'] == '00000';
		}
		$this->log('Flag:' . ($flag ? 'true' : 'false'));
		$this->log('ENDIT---------------ENDIT--------------ENDIT--------------ENDIT--------------ENDIT');
		return $flag;
	}
	
	/**
	 * 客户开通
	 * @param array $response
	 * @return array
	 */
	private function customerOpen($response) {
		
		$this->load->model('esy_model', 'esy');
		if($this->esy->isHaveSpaceEsy($response['CustID'])){
			$code = array('00404',self::$_statusCode['00404']);
		}else{
			$this->load->model('login_model', 'login');
			$rs = $this->login->creatSpace($response['CustName'], $response['CustName'], 'master@'.$response['CustAccount'], '', 'master');
			if($rs){
				$id = $response['ProductInfo']['Product'][0]['ProductType'] == 'LicenseNum' ? intval($response['ProductInfo']['Product'][0]['ProductValue']) : 0;
				$r = $this->esy->addSpaceEsy($rs['spaceId'], $response['CustID'], $response['CustAccount'], $id);
				if($r){
					$code = array('00000',self::$_statusCode['00000']);
				}else{
					$code = array('00202',self::$_statusCode['00202']);
				}
			}else{
				$code = array('00001',self::$_statusCode['00001']);
			}
		}
		$result = array('StreamingNo'=>$response['StreamingNo'],'OPFlag'=>$response['OPFlag'],'ReturnStatus'=>$code[0],'Summary'=>$code[1]);
		return $result;
	}
	
	/**
	 * 客户变更
	 * @param array $response
	 * @return array
	 */
	private function customerChange($response) {
		$id = $response['ProductInfo']['Product'][0]['ProductType'] == 'LicenseNum' ? intval($response['ProductInfo']['Product'][0]['ProductValue']) : 0;
		if(empty($id)){
			$code = array('00401',self::$_statusCode['00401']);
		}else{
			$this->load->model('esy_model', 'esy');
			$res = $this->esy->updateSpaceEsy($response['CustID'], $id);
			if($res){
				$code = array('00000',self::$_statusCode['00000']);
			}else {
				$code = array('00203',self::$_statusCode['00203']);
			}
		}
		$result = array('StreamingNo'=>$response['StreamingNo'],'OPFlag'=>$response['OPFlag'],'ReturnStatus'=>$code[0],'Summary'=>$code[1]);
		return $result;
	}
	
	/**
	 * 客户退订
	 * @param array $response
	 * @return array
	 */
	private function customerCancel($response) {
		$this->load->model('esy_model', 'esy');
		$info = $this->esy->getSpaceEsy(array('cust_id' => $response['CustID']));
		if(empty($info)){
			$code = array('00402',self::$_statusCode['00402']);
		}else{
			$res = $this->esy->updateSpaceStatus($info['space_id'], 3);
			if($res){
				$this->esy->updateEmployeeSpaceStatus($info['space_id'], 2);
				//$this->esy->delSpaceEsy($info['space_id'], $info['cust_id']);
				$code = array('00000',self::$_statusCode['00000']);
			}else {
				$code = array('00203',self::$_statusCode['00203']);
			}
		}
		$result = array('StreamingNo'=>$response['StreamingNo'],'OPFlag'=>$response['OPFlag'],'ReturnStatus'=>$code[0],'Summary'=>$code[1]);
		return $result;
	}
	
	/**
	 * 客户暂停
	 * @param array $response
	 * @return array
	 */
	private function customerPause($response) {
		return $this->customerClose($response);
	}
	
	/**
	 * 客户恢复
	 * @param array $response
	 * @return array
	 */
	private function customerRecover($response) {
		$this->load->model('esy_model', 'esy');
		$info = $this->esy->getSpaceEsy(array('cust_id' => $response['CustID']));
		if(empty($info)){
			$code = array('00402',self::$_statusCode['00402']);
		}else{
			$res = $this->esy->updateSpaceStatus($info['space_id'], 1);
			if($res){
				$code = array('00000',self::$_statusCode['00000']);
			}else {
				$code = array('00203',self::$_statusCode['00203']);
			}
		}
		$result = array('StreamingNo'=>$response['StreamingNo'],'OPFlag'=>$response['OPFlag'],'ReturnStatus'=>$code[0],'Summary'=>$code[1]);
		return $result;
	}
	
	/**
	 * 客户停机
	 * @param array $response
	 * @return array
	 */
	private function customerClose($response) {
		$this->load->model('esy_model', 'esy');
		$info = $this->esy->getSpaceEsy(array('cust_id' => $response['CustID']));
		if(empty($info)){
			$code = array('00402',self::$_statusCode['00402']);
		}else{
			$res = $this->esy->updateSpaceStatus($info['space_id'], 3);
			if($res){
				$code = array('00000',self::$_statusCode['00000']);
			}else {
				$code = array('00203',self::$_statusCode['00203']);
			}
		}
		$result = array('StreamingNo'=>$response['StreamingNo'],'OPFlag'=>$response['OPFlag'],'ReturnStatus'=>$code[0],'Summary'=>$code[1]);
		return $result;
	}
	
	/**
	 * 用户绑定
	 * @param $response
	 * @return bool
	 */
	private function userBind($response){
		$result = array(    'StreamingNo' => $response['StreamingNo'],
				'OPFlag' => $response['OPFlag'],
				'ReturnStatus' => '00000',
				'Summary' => self::$_statusCode['00000']
		);
		$custID = $response['CustID'];
		$this->load->model('esy_model', 'esy');
		$spaceEsy = $this->esy->getSpaceEsy(array('cust_id' => $custID));
		
		$userIdTel = $response['UserID'].'@'.$spaceEsy['cust_account'];
		$userName = $response['AccName'];
		if (empty($custID) || empty($userIdTel)){
			$result['ReturnStatus'] = '00002';
			$result['Summary'] = self::$_statusCode['00002'];
			return $result;
		}
	
		// 判断CustID是否存在
		$spaceId = $spaceEsy['space_id'];
		if(empty($spaceId)){
			$result['ReturnStatus'] = '00404';
			$result['Summary'] = self::$_statusCode['00404'];
			return $result;
		}
		// 根据username 获取userid
		$this->load->model('employee_model', 'employee');
		$person = $this->employee->getPersonByEmail($userIdTel, 'id');
		if(!empty($person)){
			$userId = $person['id'];
			$employee = $this->employee->getEmployeeByPidAndSid($userId, $spaceId, 'id,status');
			$status = $employee['status'];
			if ($status == 1) { //此用户是正常状态，则绑定失败
				$result['ReturnStatus'] = '00205';
				$result['Summary'] = self::$_statusCode['00205'];
				return $result;
			} elseif ($status == 2) { //此用户是停用状态，则开启即可
				$this->employee->updateEmployee(array('status' => 1), array('id="'.$employee['id'].'"'));
				return $result;
			}
		}
		
		$this->load->model('login_model', 'login');
		$data = $this->login->addInSpace($userIdTel, '', array($spaceId), $userName);
		if (empty($data) || !$data['personId']) {
			$result['ReturnStatus'] = '00001';
			$result['Summary'] = self::$_statusCode['00001'];
			return $result;
		}
		return $result;
	}
	
	/**
	 * 用户变更
	 * @param $response
	 * @return bool
	 */
	private function userChange($response){
		return $response;
	}
	
	/**
	 * 用户解绑
	 * @param $response
	 * @return bool
	 */
	private function userUnBind($response){
		$result = array( 'StreamingNo' => $response['StreamingNo'],
				'OPFlag' => $response['OPFlag'],
				'ReturnStatus' => '00000',
				'Summary' => self::$_statusCode['00000']
		);
		
		$custID = $response['CustID'];
		$this->load->model('esy_model', 'esy');
		$spaceEsy = $this->esy->getSpaceEsy(array('cust_id' => $custID));
		$userIdTel = $response['UserID'].'@'.$spaceEsy['cust_account'];
		if (empty($custID) || empty($userIdTel)){
			$result['ReturnStatus'] = '00002';
			$result['Summary'] = self::$_statusCode['00002'];
			return $result;
		}
		
		// 判断CustID是否存在
		$spaceId = $spaceEsy['space_id'];
		if(empty($spaceId)){
			$result['ReturnStatus'] = '00404';
			$result['Summary'] = self::$_statusCode['00404'];
			return $result;
		}
		
		$this->load->model('employee_model', 'employee');
		$person = $this->employee->getPersonByEmail($userIdTel, 'id');
		if(empty($person)){
			$result['ReturnStatus'] = '00000';
			$result['Summary'] = self::$_statusCode['00000'];
			return $result;
		}
		//停用
		$this->employee->updateEmployee(array('status' => 2), array('personid="'.$person['id'].'" AND spaceid="'.$spaceId.'"'));
		return $result;
	}
	
	/**
	 * 用户暂停
	 * @param $response
	 * @return bool
	 */
	private function userPause($response){
		$result = array( 'StreamingNo' => $response['StreamingNo'],
				'OPFlag' => $response['OPFlag'],
				'ReturnStatus' => '00000',
				'Summary' => self::$_statusCode['00000']
		);
		$custID = $response['CustID'];
		$this->load->model('esy_model', 'esy');
		$spaceEsy = $this->esy->getSpaceEsy(array('cust_id' => $custID));
		$userIdTel = $response['UserID'].'@'.$spaceEsy['cust_account'];
		if (empty($custID) || empty($userIdTel)){
			$result['ReturnStatus'] = '00002';
			$result['Summary'] = self::$_statusCode['00002'];
			return $result;
		}
		
		// 判断CustID是否存在
		$spaceId = $spaceEsy['space_id'];
		if(empty($spaceId)){
			$result['ReturnStatus'] = '00404';
			$result['Summary'] = self::$_statusCode['00404'];
			return $result;
		}
		
		$this->load->model('employee_model', 'employee');
		$person = $this->employee->getPersonByEmail($userIdTel, 'id');
		if(empty($person)){
			$result['ReturnStatus'] = '00005';
			$result['Summary'] = self::$_statusCode['00005'];
			return $result;
		}
		//停用
		$this->employee->updateEmployee(array('status' => 2), array('personid="'.$person['id'].'" AND spaceid="'.$spaceId.'"'));
		return $result;
	}
	
	/**
	 * 用户恢复
	 * @param $response
	 * @return bool
	 */
	private function userRecover($response){
		$result = array( 'StreamingNo' => $response['StreamingNo'],
				'OPFlag' => $response['OPFlag'],
				'ReturnStatus' => '00000',
				'Summary' => self::$_statusCode['00000']
		);
		$custID = $response['CustID'];
		$this->load->model('esy_model', 'esy');
		$spaceEsy = $this->esy->getSpaceEsy(array('cust_id' => $custID));
		$userIdTel = $response['UserID'].'@'.$spaceEsy['cust_account'];
		if (empty($custID) || empty($userIdTel)){
			$result['ReturnStatus'] = '00002';
			$result['Summary'] = self::$_statusCode['00002'];
			return $result;
		}
		
		// 判断CustID是否存在
		$spaceId = $spaceEsy['space_id'];
		if(empty($spaceId)){
			$result['ReturnStatus'] = '00404';
			$result['Summary'] = self::$_statusCode['00404'];
			return $result;
		}
		
		$this->load->model('employee_model', 'employee');
		$person = $this->employee->getPersonByEmail($userIdTel, 'id');
		if(empty($person)){
			$result['ReturnStatus'] = '00005';
			$result['Summary'] = self::$_statusCode['00005'];
			return $result;
		}
		//恢复
		$this->employee->updateEmployee(array('status' => 1), array('personid="'.$person['id'].'" AND spaceid="'.$spaceId.'"'));
		return $result;
	}
	
	/**
	 * 用户停机
	 * @param $response
	 * @return bool
	 */
	private function userStop($response){
		return $this->userPause($response);
	}
	
	/**
	 * 用户登录
	 * @param $response
	 * @return bool
	 */
	private function userLogin($response){
		//获取用户名
		$spaceid = 0;
		if ($response['AccType'] == 1) {
			$username = 'master@' . $response['CustAccount'];
		} else {
			$username = $response['UserID'] . '@' . $response['CustAccount'];
			$this->load->model('esy_model', 'esy');
			$spaceEsy = $this->esy->getSpaceEsy(array('cust_id' => $response['CustID']));
			$spaceid = $spaceEsy['space_id'];
		}
		
		if ($username == '') return false;
		
		//登录操作
		$this->load->model('login_model', 'login');
		return $this->login->esyLogin($username, $spaceid);
	}
	
	/**
	 * 翼商云登录
	 * @param unknown $param
	 * @return boolean
	 */
	public function esylogin($param) {
		EsyClass::$debug = true;
		$response = EsyClass::xml2array($param);
		$this->log('ESYLOGIN-response:' . print_r($response, true));
		if (!isset($response['Head'])) return false;
		$transactionID = $response['Head']['TransactionID'];
		$token = $response['Head']['Token'];
		$flag = intval($this->_esyClass->esyAuth($transactionID, $token));
		$this->log('ESYLOGIN-flag:' . $flag);
		if ($flag === 0) { //成功
			$data = array();
			$data['AccType'] = $response['Body']['Type'];
			$user = explode('@', $response['Body']['UserID']);
			$data['UserID'] = $user[0];
			$data['CustAccount'] = $user[1];
			$this->load->model('esy_model', 'esy');
			$spaceEsy = $this->esy->getSpaceEsy(array('cust_account' => $data['CustAccount']));
			$data['CustID'] = $spaceEsy['cust_id'];
			return $this->userLogin($data);
		}
		return false;
	}
	
	public function log($data) {
		EsyClass::log($data, $this->_ip, $this->_config['logdir']);
	}
}
	