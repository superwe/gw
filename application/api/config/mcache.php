<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: shenghua
 * Date: 13-4-9
 * Time: 下午3:38
 * To change this template use File | Settings | File Templates.
 */

$config['mc_use'] = 1; //是否开启memcached缓存
$config['mc_prefix'] = 'QT_MC_'; //存储前缀
$config['mc_exptime'] = 300; //默认缓存5分钟

//支持mc集群
$config['mc_server'][0]['host'] = '192.168.52.55'; //地址
$config['mc_server'][0]['port'] = 11211; //端口
$config['mc_server'][0]['weight'] = 100; //权重