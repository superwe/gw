<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: shenghua
 * Date: 13-4-11
 * Time: 上午10:11
 * To change this template use File | Settings | File Templates.
 */

class Test extends CI_Controller {

    public function index() {
        ini_set('display_errors', 'on');error_reporting(E_ALL^E_NOTICE^E_WARNING^E_STRICT);

        /**
        $this->load->model('upload_model', 'upload');
        //文件存储
        $option = array(
        	'type' => 'file', //用File实例还是用Image实例
        	'name' => 'index1.php', //$_FILES['name']
        	'allowType' => array('php'), //允许的类型
        	'tmpName' => '/data/www/website/www/index1.php', //$_FILES['tmp_name']
        );
        $obj = $this->upload->instance($option); //获取操作实例
        $filePath = $obj->save();
        if ($filePath !== false) {
        	//上传成功，再做其他业务
        	echo $filePath; //返回filepath，需要存到数据库
        }

        //图片存储
        $option = array(
            'type' => 'image',
            'name' => 'android_app1.png',
            'tmpName' => '/data/www/website/www/images/android_app1.png',
        	'ssize' => '20*20', //保存小图尺寸（不设置将不保存该类型）
        	'msize' => '100*100', //保存中图尺寸（不设置将不保存该类型）
        	'bsize' => '300*300', //保存大图尺寸（不设置将不保存该类型）
            'maxsize' => '500*500', //保存原始图片最大尺寸（不设置将不保存该类型）
            'userid' => '17159', //如果是头像的话，设置这个参数，返回的filepath和用户id有关
            'allowType' => array('jpg', 'png', 'jpeg') //允许的类型
        );
        $obj = $this->upload->instance($option); //获取操作实例
        $filePath = $obj->save(); //返回filepath，需要存到数据库
        if ($filePath !== false) {
        	//上传成功，再做其他业务
        	echo $filePath; //返回filepath，需要存到数据库
        }
        echo $obj->getthumb($filePath); //获取小图
        */
        
        /**
         * RSA加密
         
        $this->load->library('rsa');
        //$this->secret->generate(); //生成方法已屏蔽
        $e = $this->rsa->encode('hello');
        echo $e,'<br>';
        $d = $this->rsa->decode($e);
        echo $d,'<br>';*/
        
        /**
         * redis测试
         */
        $this->load->driver('cache', array('adapter' => 'redis'));
        if (!$foo = $this->cache->get('foo')) {
        	echo '开始缓存!<br />';
        	$foo = 'ok吧？^_^';
        	// Save into the cache for 5 minutes
        	$this->cache->save('foo', $foo, 300);
        }
        echo $foo;
        //$this->cache->delete('foo');
        
        /**
         * 搜索
         */
        $this->load->model('indexes_model', 'indexes');
        $type = array('member', 'speech');
        $this->indexes->setType($type);
        //$field = array('title-must' => 'ok', 'content-should' => '我们');
        $field = array('title-should' => 'ok', 'content-should' => '我们');
        $this->indexes->setField($field);
        $result = $this->indexes->search();
        print_r($result);
    }
}