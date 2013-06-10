<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * 这个类里放所有关于cache的操作，大家根据业务自己扩展，便于以后对cache中结构的维护
 * @author bishenghua
 * @date 2013/05/08
 * @email net.bsh@gmail.com
 * @etc. 对session的调用: 存储:QiaterCache::spaceid(123, '82be1ddc3e7285bcd65f509b8ab4e450');获取:QiaterCache::spaceid(123);
 * @etc. 对普通存储的调用: 存储:QiaterCache::test('test');获取:QiaterCache::test()
 */

class QiaterCache {
	/**
	 * 所有关于session的key
	 * @var unknown
	 */
	const SESS_SPACEID 			= 'spaceid';
	const SESS_PERSONID 		= 'personid';
	const SESS_EMPLOYEEID 		= 'employeeid';
	const SESS_SPACEINFO		= 'spaceinfo';
	const SESS_EMPLOYEEINFO		= 'employeeinfo';
	const SESS_GROUPLIST		= 'grouplist';
	
	/**
	 * 所有普通的key
	 * @var unknown
	 */
	const CACHE_SALT 			= 'salt_';
    const CACHE_SALT_ADMIN		= 'salt_admin_';
	const CACHE_APPLIST	    	= 'applist';


	/**
	 * 这的参数不用管
	 * @var unknown
	 */
	public static $_CI = null;
	public static $_CACHE = null;
	public static $_STORE_ARRAY = array();


	//[start]下面的方法放对session存储的方法

	/**
	 * 存储或获取spaceid
	 * @param string $spaceid
	 * @param string $sessid
	 */
	public static function spaceid($spaceid = '', $sessid = '') {
		$sessid = self::getSessid($sessid);
		if ($spaceid !== '') {
			return self::getCache()->save(self::SESS_SPACEID, $spaceid, $sessid);
		}
		return self::get(self::SESS_SPACEID, $sessid);
	}

	public static function personid($personid = '', $sessid = '') {
		$sessid = self::getSessid($sessid);
		if ($personid !== '') {
			return self::getCache()->save(self::SESS_PERSONID, $personid, $sessid);
		}
		return self::get(self::SESS_PERSONID, $sessid);
	}

	public static function employeeid($employeeid = '', $sessid = '') {
		$sessid = self::getSessid($sessid);
		if ($employeeid !== '') {
			return self::getCache()->save(self::SESS_EMPLOYEEID, $employeeid, $sessid);
		}
		return self::get(self::SESS_EMPLOYEEID, $sessid);
	}

	public static function spaceInfo($spaceInfo = '', $sessid = '') {
		$sessid = self::getSessid($sessid);
		if ($spaceInfo !== '') {
			return self::getCache()->hMSet(self::SESS_SPACEINFO, $spaceInfo, $sessid);
		}
		return self::get(self::SESS_SPACEINFO, $sessid, 'hGetAll');
	}

	public static function employeeInfo($employeeInfo = '', $sessid = '') {
		$sessid = self::getSessid($sessid);
		if ($employeeInfo !== '') {
			return self::getCache()->hMSet(self::SESS_EMPLOYEEINFO, $employeeInfo, $sessid);
		}
		return self::get(self::SESS_EMPLOYEEINFO, $sessid, 'hGetAll');
	}

	public static function groupList($groupList = '', $sessid = '') {
		$sessid = self::getSessid($sessid);
		if ($groupList !== '') {
			return self::getCache()->save(self::SESS_GROUPLIST, serialize($groupList), $sessid);
		}
		return self::get(self::SESS_GROUPLIST, $sessid, 'get', true);
	}

	//[end]上面的方法放对session存储的方法



	//[start]下面的方法放对普通存储

	public static function salt($email, $salt = '') {
		$key = self::CACHE_SALT . $email;
		if ($salt !== '') {
			return self::getCache()->save($key, $salt);
		}
		return self::get($key);
	}

    public static function saltAdmin($email, $salt = '') {
        $key = self::CACHE_SALT_ADMIN . $email;
        if ($salt !== '') {
            return self::getCache()->save($key, $salt);
        }
        return self::get($key);
    }
	
	public static function appList($appList = '') {
		if ($appList !== '') {
			return self::getCache()->save(self::CACHE_APPLIST, serialize($appList), null); //全局列表，永不失效
		}
		return self::get(self::CACHE_APPLIST, '', 'get', true);
	}

    public static function expireSalt($email, $ttl) {
        return self::getCache()->expire(self::CACHE_SALT . $email, '', $ttl);
    }
    
    public static function expireSaltAdmin($email, $ttl) {
    	return self::getCache()->expire(self::CACHE_SALT_ADMIN . $email, '', $ttl);
    }

    public static function expireAllSess($ttl, $sessid = '') {
    	$sessid = self::getSessid($sessid);
        $sessionKeys = self::getCache()->sMembers('sess_keys');
        foreach ($sessionKeys as $key) {
        	self::getCache()->expire($key, $sessid, $ttl);
        }
    }

    public static function deleteAll($email) {
        self::getCache()->delete(self::CACHE_SALT . $email);
        self::getCache()->delete(self::CACHE_SALT_ADMIN . $email);
        $sessionKeys = self::getCache()->sMembers('sess_keys');
        $sessid = self::getSessid();
        foreach ($sessionKeys as $key) {
            self::getCache()->delete($key, $sessid);
        }
    }
	
	//[end]上面的方法放对普通存储
	
    
    
    /**
     * 调用次方法获取缓存值，避免一次执行流程中多次获取
     * @param unknown $key
     * @param string $sessid
     * @param string $func
     * @param string $unserialize
     */
    public static function get($key, $sessid = '', $func = 'get', $unserialize = false) {
    	if (!isset(self::$_STORE_ARRAY[$key])) {
    		if ($unserialize) self::$_STORE_ARRAY[$key] = unserialize(self::getCache()->$func($key, $sessid));
    		else self::$_STORE_ARRAY[$key] = self::getCache()->$func($key, $sessid);
    	}
    	return self::$_STORE_ARRAY[$key];
    }
	
	public static function getSessid($sessid = '') {
		return $sessid ? $sessid : self::getCI()->input->cookie('session_id');
	}
	
	public static function getCI() {
		if (self::$_CI == null) {
			self::$_CI =& get_instance();
		}
		return self::$_CI;
	}
	
	public static function getCache() {
		if (self::$_CACHE == null) {
			self::getCI()->load->driver('cache', array('adapter' => 'redis'));
			self::$_CACHE = self::getCI()->cache;
		}
		return self::$_CACHE;
	}
}