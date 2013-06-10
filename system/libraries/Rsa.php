<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * User:	bishenghua
 * Date:	13-4-15
 * Time:	上午10:39
 * Email:	net.bsh@gmail.com
 */

class CI_Rsa {
	
	private static $key = 'Ds@!sdf&(&^SWl@';
	/**
	 * 生成公钥私钥对
	 *
	 */
	public function generate(){
		return false;
		$config = array(
				'private_key_bits' => 612
		);
		$r = openssl_pkey_new($config);
		openssl_pkey_export($r, $privkey, self::$key);
		@file_put_contents(APPPATH . 'config/key.pem', $privkey);
	
		$pubkey = openssl_pkey_get_details($r);
		$pubkey = $pubkey['key'];
		@file_put_contents(APPPATH . 'config/pub.pem', $pubkey);
	}
	
	/**
	 * 发送给他人的内容用私钥加密，只要别人能用公钥解开就证明信息是由你发送的，构成了签名机制
	 * @param unknown_type $str
	 */
	public function encode($str = '') {
		$pem = APPPATH . 'config/key.pem';
		$priv_key = @file_get_contents($pem);
		$res = openssl_pkey_get_private(array($priv_key, self::$key));
		$r = openssl_private_encrypt($str, $crypttext, $res);
		if($r){
			return base64_encode($crypttext);
		}
		return '';
	}
	
	/**
	 * 公钥解密
	 * @param unknown_type $crypttext
	 */
	public function decode($crypttext) {
		$crypttext = base64_decode($crypttext);
		$pem = APPPATH . 'config/pub.pem';
		$priv_key = @file_get_contents($pem);
		$res = openssl_pkey_get_public(array($priv_key, self::$key));
		$bool = openssl_public_decrypt($crypttext, $newsource, $res);
		if ($bool) {
			return $newsource;
		}
		return false;
	}
	
	/**
	 * 别人给你发送信息时使用公钥加密，这样只有拥有私钥的你能够对其解密
	 * @param unknown_type $str
	 
	public function encode($str = ''){
		$pem = APPPATH . 'config/pub.pem';
		$priv_key = @file_get_contents($pem);
		$res = openssl_pkey_get_public(array($priv_key, self::$key));
		$r = openssl_public_encrypt($str, $crypttext, $res);
		return base64_encode($crypttext);
	}*/
	
	/**
	 * 私钥解密
	 * @param unknown_type $crypttext
	 
	public function decode($crypttext){
		$crypttext = base64_decode($crypttext);
		$pem = APPPATH . 'config/key.pem';
		$priv_key = @file_get_contents($pem);
		$res = openssl_pkey_get_private(array($priv_key, self::$key));
		$bool = openssl_private_decrypt($crypttext, $newsource, $res);
		if ($bool) {
			return $newsource;
		}
		return false;
	}*/
}