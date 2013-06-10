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
        ini_set('display_errors', 'on');error_reporting(E_ALL^E_NOTICE^E_STRICT);

        /*
        $this->load->library('file');
        //文件存储
        $option = array(
        	'type' => 'file', //用File实例还是用Image实例
        	'name' => 'test_big.php', //$_FILES['name']
        	'allowType' => array('php'), //允许的类型
        	'tmpName' => '/data/www/test_big.php', //$_FILES['tmp_name']
        );
        $obj = $this->file->instance($option); //获取操作实例
        $filePath = $obj->save(false); //false不删源文件，默认为true删除源文件，正常是应该删的
        var_dump($filePath);
        if ($filePath !== false) {
        	//上传成功，再做其他业务
        	echo $filePath; //返回filepath，需要存到数据库
        }


        */
        //图片存储
        $this->load->library('file');
        $option = array(
            'type' => 'image',
            'name' => 'android_app1.png',
            'tmpName' => '/data/www/gw/images/bg_input.png',
        	'ssize' => '20*20', //保存小图尺寸（不设置将不保存该类型）
        	'msize' => '100*100', //保存中图尺寸（不设置将不保存该类型）
        	'bsize' => '300*300', //保存大图尺寸（不设置将不保存该类型）
            'maxsize' => '500*500', //保存原始图片最大尺寸（不设置将不保存该类型）
            'userid' => '17159', //如果是头像的话，设置这个参数，返回的filepath和用户id有关
            'allowType' => array('jpg', 'png', 'jpeg') //允许的类型
        );
        $obj = $this->file->instance($option); //获取操作实例
        $filePath = $obj->save(); //返回filepath，需要存到数据库
        if ($filePath !== false) {
        	//上传成功，再做其他业务
        	echo $filePath; //返回filepath，需要存到数据库
        }
        echo $obj->getthumb($filePath); //获取小图
        
        /*
        
        
        
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
         
        $this->load->driver('cache', array('adapter' => 'redis'));
        if (!$foo = $this->cache->get('foo')) {
        	echo '开始缓存!<br />';
        	$foo = 'ok吧？^_^';
        	// Save into the cache for 5 minutes
        	$this->cache->save('foo', $foo, 300);
        }
        echo $foo;
        //$this->cache->delete('foo');*/
        
        
        
        /**
         * 搜索(类库操作)
         */
        /*$this->load->library('indexengine');
        //搜索功能
        
        $type = array('member', 'speech');
        //$this->indexengine->setType($type); //设置搜索类型
        
        //$field = array('title-must' => '我们', 'content-should' => '我们');
        //$field = array('title-should' => '我们', 'content-should' => '我们');
        $field = array('employeeid-must' => 14);
        //$this->indexengine->setField($field);//设置查询字段内容
        
        $from = 0; $to = 10; //设置偏移搜索
        
        $sort = array('date' => 'asc', 'spaceid' => 'asc');
        $this->indexengine->setSort($sort);//设置排序
        
        $highlight = array('title' => '<mark>|</mark>', 'content' => '<mark>|</mark>'); //语法高亮
        $this->indexengine->setHighlight($highlight);
        
        
        //$filterTerm1 = $this->indexengine->setFilterTerm(array('employeeid' => 13));
        //$filterTerm2 = $this->indexengine->setFilterTerm(array('spaceid' => 2));
        //$filter = $this->indexengine->setFilterAnd($filterTerm1, $filterTerm2);
        $filter1 = $this->indexengine->setFilterTerm(array('spaceid' => 2));
        $filter2 = $this->indexengine->setFilterRange('date', array('from' => '2013-04-16 16:34:00', 'to' => '2013-04-16 16:35:00'));
        $filter = $this->indexengine->setFilterAnd($filter1, $filter2);
        //$this->indexengine->setFilter($filter);
        
        //$result = $this->indexengine->search($from, $to); //执行搜索
        print_r($result);
        
        //创建、更新索引(类型要传字符串，只能更新一个type下的文档)
        $this->indexengine->setType('speech');
        //注意：id字段是必须的
        $data = array('id' => 3, 'spaceid' => 2, 'employeeid' => 12, 'url' => 'speech/3.html', 'date' => '2013-04-16 16:34:00', 'title' => '好的我们ok啦我们221', 'content' => '说地方的说法我们嘿嘿');
        //$flag = $this->indexengine->create($data);var_dump($flag);
        
        
        //删除索引
        $this->indexengine->setType('speech'); //设置搜索类型
        //$flag = $this->indexengine->deleteById(3);var_dump($flag);
        //$flag = $this->indexengine->deleteByIds(array(3, 4));var_dump($flag);
        //$flag = $this->indexengine->delete();var_dump($flag); //注意这个会删掉整个type类型包括mapping*/
        
        
        /**
         * 搜索(模块操作，大家调用时用这个，具体业务要在这里加，上面的lib供)
         
        //创建索引
        $this->load->model('indexes_model', 'indexes');
        $type = 'speech';
        $data = array('id' => 3, 'spaceid' => 2, 'employeeid' => 12, 'url' => 'speech/3.html', 'date' => '2013-04-16 16:34:00', 'title' => '好的我们ok啦我们221', 'content' => '说地方的说法我们嘿嘿');
        //$flag = $this->indexes->create($type, $data);var_dump($flag);
        
        //更新索引
        $type = 'group';
        $data = array('id' => 40, 'title' => '群组测试29');
        //$flag = $this->indexes->update($type, $data);var_dump($flag);
        
        //删除索引
        $type = 'group';
        $id = 1221;
        //$flag = $this->indexes->deleteById($type, $id);var_dump($flag);
        echo 'try it!';*/
        
        /*放点数据试试搜索
        set_time_limit(0);
        $link = mysql_connect('127.0.0.1:3306', 'root', '');
        mysql_select_db('yy', $link);
        mysql_query('SET NAMES UTF8', $link);
        $sql = 'SELECT * FROM qz_member';
        $query = mysql_query($sql, $link);
        while ($row = mysql_fetch_assoc($query)) {
        	//print_r($row);exit;
        	$type = 'employee';
        	$data = array('id' => $row['id'], 'spaceid' => 2, 'employeeid' => $row['id'], 'url' => 'http://esn.uu.com.cn/space/cons/index/id/' . $row['id'], 'date' => date('Y-m-d H:i:s', $row['created']), 'title' => $row['name'], 'content' => $row['email']);
        	$flag = $this->indexes->create($type, $data);
        	echo $row['name'], '-';var_dump($flag);echo "\n";
        }*/
        
        /*
        $this->load->driver('cache', array('adapter' => 'redis'));
        print_r($this->cache->keys('*')); //获取所有key
        //$this->cache->flushDB();exit; //清空redis数据库
        echo $this->cache->ttl('salt_bishh@chanjet.com'),"\n"; //获取生存期
        $z1 = $this->cache->zAdd('key', 1, 'val1'); //添加有序集
        $z2 = $this->cache->zAdd('key', 0, 'val0');
        $z3 = $this->cache->zAdd('key', 5, 'val5');
        var_dump($this->cache->get('key')); //不能通过get获取有序集
        //echo $z1, $z2, $z3;
        print_r($this->cache->zRange('key', 0, 1)); //这样获取有序集
        echo $this->cache->zCard('key'); //获取有序集个数
        echo $sessionId = $this->input->cookie('session_id');
        $keys = $this->cache->sMembers('sess_keys'); //获取set集合成员
        print_r($keys);
        $this->cache->sAdd('set_test', '123', 1, 'ok'); //添加set集合成员
        $keys = $this->cache->sMembers('set_test');
        print_r($keys);
        $this->cache->save('test', 'ok');
        $this->cache->save('test1', 'ok1', '', null); //null参数是不加生存期，即永久保存
        print_r($this->cache->get('test1'));
        echo $this->cache->ttl('test1'),"\n";
        //echo $this->cache->sRem('sess_keys', 'qiater_employeeid', 'qiater_spaceid'); //移除集合中的成员
        
        echo $this->cache->ttl('sess_keys'),"\n";
        //$this->cache->expire('sess_keys', '', 10);
        
        $this->load->helper('cache');
        $value = array (
        		'id' => '52',
        		'name' => '毕胜华',
        		'imageurl' => '',
        );
        $time = microtime(true);
        $this->cache->hMSet('test2', $value);
        $this->cache->hGetAll('test2');
        echo microtime(true) - $time;
        
        //上传默认图
    	$this->load->model('upload_model', 'upload');
        $obj = $this->upload->instance(array('type' => 'file')); //获取操作实例
        var_dump($obj->setFile('default_avatar.thumb.jpg', '/data/www/Downloads/default_avatar.thumb.jpg'));
        var_dump($obj->setFile('default_avatar.middle.jpg', '/data/www/Downloads/default_avatar.middle.jpg'));
        */
        
    }
}