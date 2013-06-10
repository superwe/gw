<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * 对接翼商云接口配置文件
 * @author bishenghua
 * @date 2013/05/10
 * @email net.bsh@gmail.com
 */

$config['esy']['soapuri'] = 'http://gw.com/cdn/BnetForSIWS.wsdl';
$config['esy']['auth'] = 'http://www.189esy.cn:8080/FS-AUC/authCenter!safeAuthCS.action';
$config['esy']['logdir'] = APPPATH . 'logs/esy';