<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: shenghua
 * Date: 13-4-9
 * Time: 下午2:50
 * To change this template use File | Settings | File Templates.
 */

require_once(BASEPATH.'libraries/memcached/Mucache.php');
class CI_MCache{
    private $_mcache = null;
    private $_exptime = 300;
    private $_prefix = 'QT_MC_';

    /**
     * 构造函数，获取memcached配置信息
     * @return null
     */
    public function __construct(){
       $ci =& get_instance();
       $ci->config->load('mcache');

        if (!$ci->config->config['mc_use']) return false;
        if (isset($ci->config->config['mc_prefix'])) $this->_prefix = $ci->config->config['mc_prefix'];
        if (isset($ci->config->config['mc_exptime'])) $this->_exptime = $ci->config->config['mc_exptime'];

        $server = array();
        foreach ($ci->config->config['mc_server'] as $value) {
            $server[][] = array($value['host'], $value['port'], $value['weight']);
        }
        $this->_mcache = new Mucache($server, false);

        log_message('debug', "MCache Class Initialized");
    }

    /**
     * 设置mem值 默认缓存24小时 $expire: 默认缓存时间
     * @param key 键名,键值,过期时间,是否压缩. 后两个参数对Memcachedb透明
     * @return 成功为true,否则false
     */
    public function set($key, &$value, $expire=false, $zip=true)
    {
        if (!$this->_mcache) {
            return false;
        }
        $key = $this->_prefix . $key;
        if (!$expire) {
            $catheTime = $this->_exptime;
        } else {
            $catheTime = $expire;
        }
        //$catheTime += time();
        $this->_mcache->set($key, $value, $catheTime, $zip=true);
        return true;
    }

    /**
     * 获取单键 $zip 是否解压缩.对应set的压缩
     * @param $inCas 是否进行cas验证 如果是则返回一个数组[结果集,cas字串] 注意不支持分组!!!
     * @return 成功返回结果,否则false
     */
    public function get($key, $zip=true, $inCas=false)
    {
        if (!$this->_mcache) {
            return false;
        }
        $key = $this->_prefix . $key;
        return $this->_mcache->get($key, $zip=true, $inCas=false);
    }

    public function delete($key, $expire=0)
    {
        if (!$this->_mcache) {
            return false;
        }
        $key = $this->_prefix . $key;
        return $this->_mcache->delete($key, $expire);
    }

    /**
     * 替换mem值 默认缓存24小时
     * @param key 键名,键值,过期时间,是否压缩. 后两个参数对Memcachedb透明
     * @return 成功true,否则false
     */
    public function replace($key, &$value, $expire=false, $zip=true)
    {
        if (!$this->_mcache) {
            return false;
        }
        if (!$expire) {
            $catheTime = $this->_exptime;
        } else {
            $catheTime = $expire;
        }
        //$catheTime += time();
        $key = $this->_prefix . $key;
        $this->_mcache->replace($key, $value, $catheTime, $zip=true);
        return true;
    }

    public function getMInstance(){
        return $this->_mcache;
    }
}