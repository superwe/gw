<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * 对接翼商云接口
 * @author bishenghua
 * @date 2013/05/10
 * @email net.bsh@gmail.com
 */

class Esyapi extends CI_Controller {
	
	public function __construct() {
		parent::__construct();
		$this->load->model('esyapi_model', 'esyapi');
	}
	
	/**
	 * 控制层只传递参数及结果输出，业务逻辑封装到model层，这样增强model层的公用性
	 * http://gw.com/esyapi
	 */
	public function index() {
		$streamingno = $this->input->get('streamingno', true);
		$rand = $this->input->get('rand', true);
		$encode = $this->input->get('encode', true);
		$encode = explode(',', $encode);
		$encode = $encode[0];
		$flag = $this->esyapi->enter($streamingno, $rand, $encode);
		var_dump($flag);
	}
	
	/**
	 * 翼商云登录接口
	 * http://gw.com/esyapi/login
	 */
	public function login() {
		$param = base64_decode($this->input->get('param', true));
		if(!empty($param)) $flag = $this->esyapi->esylogin($param);
		var_dump($flag);
	}
	
	public function log() {
		header('Content-type: text/html; charset=utf-8');
		$file = $this->input->get('file', true);
		$filePath = APPPATH . "logs/esy/$file";
		!file_exists($filePath) && exit('NO THIS FILE');
		
		ob_start();
		$fp = fopen($filePath, 'r');
		while (!feof($fp)) {
			echo fgets($fp, 2048);
			flush();
			ob_flush();
		}
		fclose($fp);
	}
}