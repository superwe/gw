<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * 对接翼商云接口工具
 * @author bishenghua
 * @date 2013/05/10
 * @email net.bsh@gmail.com
 */
class EsyClass {

	private $_client = null;
	private $_config = null;
	public static $debug = false;
	public static $test = false;

	public function __construct($config) {
		$this->_config = $config;
		$uri = $this->_config['soapuri'];
		$this->_client = new SoapClient("$uri?WSDL");
	}

	/**
	 * 从服务端获取数据
	 * @param unknown_type $streamingno
	 * @param unknown_type $rand
	 */
	public function getPortalRequest($streamingno, $rand) {
		$param = array(
				'streamingno' => $streamingno,
				'rand' => $rand
		);
		$result = $this->_client->getPortalRequest($param);
		return self::xml2array($result->getPortalRequestResult);
	}

	/**
	 * 向服务端发送数据
	 * @param unknown_type $array
	 */
	public function getPortalResult($array) {
		$param = array(
				'reqXML' => self::toXml($array)
		);
		$result = $this->_client->getPortalResult($param);
		return self::xml2array($result->getPortalResultResult);
	}

	/**
	 * 编码参数
	 * @param unknown_type $decode
	 * @return Ambigous <multitype:, string>
	 */
	public function getEncodeString($decode) {
		$param = array(
				'decode' => $decode
		);
		$result = $this->_client->getEncodeString($param);
		return $result->getEncodeStringResult;
	}

	/**
	 * 获取服务端函数列表
	 */
	public function getFunctions() {
		return $this->_client->__getFunctions();
	}

	/**
	 * 翼商云认证
	 * @param unknown $transactionID
	 * @param unknown $token
	 * @return mixed
	 */
	public function esyAuth($transactionID, $token) {
		$url = $this->_config['auth'];
		$data = "transactionID=$transactionID&token=$token";
		return self::send($url, $data);
	}

	public static function log($data, $ip, $logDir) {
		if (!self::$debug) return;
		$file = $logDir . '/' . (self::$test ? 'test_' : '') .date('Y-m-d') . '.txt';
		$dateStr = '[' . date('Y-m-d H:i:s') . ']';
		$ipStr = '[' . $ip . ']';
		$data = "{$dateStr}->->->->->->->->->->->->->->->->->->->->{$ipStr}<br>\n{$data}<br>\n{$dateStr}<-<-<-<-<-<-<-<-<-<-<-<-<-<-<-<-<-<-<-<-{$ipStr}<br><br>\n\n";
		$fp = fopen($file, 'ab');
		fwrite($fp, $data);
		fclose($fp);
	}

	/**
	 * xml数据转换成数组
	 */
	public static function xml2array($xmlStr) {
		$xmlObj = new SimpleXMLElement($xmlStr);
		return self::_xml2array($xmlObj);
	}

	/**
	 * SimpleXMLElement对象转成数组
	 * @param SimpleXMLElement $xml
	 * @return array
	 */
	private static function _xml2array($xmlObj) {
		if (is_object($xmlObj) && get_class($xmlObj) == 'SimpleXMLElement') {
			$attributes = $xmlObj->attributes();
			foreach($attributes as $k=>$v) {
				if ($v) $a[$k] = (string) $v;
			}
			$x = $xmlObj;
			$xmlObj = get_object_vars($xmlObj);
		}

		if (is_array($xmlObj)) {
			if (count($xmlObj) == 0) return (string) $x; // for CDATA
			foreach($xmlObj as $key=>$value) {
				$r[$key] = self::_xml2array($value);
			}
			if (isset($a)) $r['@'] = $a;    // Attributes
			return $r;
		}
		return (string) $xmlObj;
	}

	/**
	 * array生成xml字符串
	 * @param unknown_type $data
	 * @param unknown_type $rootNodeName
	 * @param unknown_type $xml
	 * @param unknown_type $idx
	 */
	public static function toXml($data, $rootNodeName = 'Package', $xml=null, $idx=0) {
		if (ini_get('zend.ze1_compatibility_mode') == 1) {
			ini_set ('zend.ze1_compatibility_mode', 0);
		}

		if ($xml == null) {
			$tmp = explode(":",$rootNodeName);
			$xml = simplexml_load_string("<?xml version='1.0' encoding='utf-8'?><$tmp[0] />");
		}

		foreach($data as $key => $value) {
			if (is_numeric($key)) {
				$tmp = explode(":",$rootNodeName);
				if (isset($tmp[$idx+1]))
					$key = $tmp[$idx+1];
				else
					$key = "node_". (string) $key;
			}

			$key = preg_replace('/[^a-z_]/i', '', $key);
			if (is_array($value)) {
				$node = $xml->addChild($key);
				self::toXml($value, $rootNodeName, $node,$idx+1);
			} else {
				$value = htmlspecialchars($value,ENT_QUOTES);
				$xml->addChild($key,$value);
			}

		}
		return $xml->asXML();
	}

	/**
	 * 提交数据
	 * @param unknown $url
	 * @param unknown $data
	 * @return mixed
	 */
	public static function send($url, $data) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 300);
		curl_setopt($ch, CURLOPT_TIMEOUT, 300);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		$r = curl_exec($ch);
		curl_close($ch);
		return $r;
	}
}