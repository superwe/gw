<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * CodeIgniter
 *
 * An open source application development framework for PHP 4.3.2 or newer
 *
 * @package		CodeIgniter
 * @author		ExpressionEngine Dev Team
 * @copyright	Copyright (c) 2006 - 2012 EllisLab, Inc.
 * @license		http://codeigniter.com/user_guide/license.html
 * @link		http://codeigniter.com
 * @since		Version 2.0
 * @filesource	
 */

// ------------------------------------------------------------------------

/**
 * CodeIgniter Caching Class 
 *
 * @package		CodeIgniter
 * @subpackage	Libraries
 * @category	Core
 * @author		ExpressionEngine Dev Team
 * @link		
 */
class CI_Cache extends CI_Driver_Library {
	
	protected $valid_drivers 	= array(
		'cache_apc', 'cache_file', 'cache_memcached', 'cache_dummy', 'cache_redis'
	);

	protected $_cache_path		= NULL;		// Path of cache files (if file-based cache)
	protected $_adapter			= 'dummy';
	protected $_backup_driver;
    protected $_session_prefix = 'sess_';
    protected $_cache_session_ttl = 0;

	// ------------------------------------------------------------------------

	/**
	 * Constructor
	 *
	 * @param array
	 */
	public function __construct($config = array())
	{
		if ( ! empty($config))
		{
			if (!$this->_cache_session_ttl) {
				$ci =& get_instance();
				$this->_cache_session_ttl = $ci->config->item('cache_session_ttl');
			}
			$this->_initialize($config);
		}
	}

	// ------------------------------------------------------------------------

	/**
	 * Get 
	 *
	 * Look for a value in the cache.  If it exists, return the data 
	 * if not, return FALSE
	 *@param 	string
     * @param 	string
	 * @return 	mixed		value that is stored/FALSE on failure
	 */
    public function get($key, $sessid = '')
    {
    	$key = $sessid == '' ? $key : $this->_session_prefix . $sessid . '_' . $key;
        return $this->{$this->_adapter}->get($key);
    }

	// ------------------------------------------------------------------------

	/**
	 * Cache Save
	 *
	 * @param 	string		Unique Key
	 * @param 	mixed		Data to store
	 * @param 	int			Length of time (in seconds) to cache the data
	 * @param string
	 * @return 	boolean		true on success/false on failure
	 */
    public function save($key, $value, $sessid = '', $ttl = 0)
    {
    	if ($sessid != '') {
    		//保存一个session key集合
    		$this->sAdd('sess_keys', $key);
    		$key = $this->_session_prefix . $sessid . '_' . $key;
    	}
    	$ttl = ($ttl === 0) ? $this->_cache_session_ttl : $ttl;
        return $this->{$this->_adapter}->save($key, $value, $ttl);
    }

	// ------------------------------------------------------------------------

	/**
	 * Delete from Cache
	 * @param mixed	unique identifier of the item in the cache
	 * @param 	string
	 * @return 	boolean		true on success/false on failure
	 */
    public function delete($key, $sessid = '')
    {
        $key = $sessid == '' ? $key : $this->_session_prefix . $sessid . '_' . $key;
        return $this->{$this->_adapter}->delete($key);
    }
    

	// ------------------------------------------------------------------------

	/**
	 * Clean the cache
	 *
	 * @return 	boolean		false on failure/true on success
	 */
	public function clean()
	{
		return $this->{$this->_adapter}->clean();
	}
	
	/**
	 * 将值value关联到key，并将key的生存时间设为seconds(以秒为单位)。
	 * 如果key 已经存在，SETEX命令将覆写旧值。
	 * @param key ttl value
	 * @return 设置成功时返回OK;当seconds参数不合法时，返回一个错误。
	 */
	public function setex($key, $value, $sessid = '', $ttl = 0)
	{
		if ($sessid != '') {
			$key = $this->_session_prefix . $sessid . '_' . $key;
			$ttl = $this->_cache_session_ttl;
		}
		$ttl = ($ttl === 0) ? $this->_cache_session_ttl : $ttl;
		return $this->{$this->_adapter}->setex($key, $ttl, $value);
	}
	
	/**
	 * 返回给定key的剩余生存时间(time to live)(以秒为单位)。
	 * @param key
	 * @return key的剩余生存时间(以秒为单位)。当key不存在或没有设置生存时间时，返回-1 。
	 */
	public function ttl($key, $sessid = '')
	{
		$key = $sessid == '' ? $key : $this->_session_prefix . $sessid . '_' . $key;
		return $this->{$this->_adapter}->ttl($key);
	}
	
	/**
	 * 将key的值设为value，当且仅当key不存在。
	 * 若给定的key已经存在，则SETNX不做任何动作。
	 * SETNX是”SET if Not eXists”(如果不存在，则SET)的简写。
	 * 设计模式(Design pattern): 将SETNX用于加锁(locking)
	 * @param key value
	 * @return 设置成功，返回1。设置失败，返回0。
	 */
	public function setnx($key, $value, $sessid = '')
	{
		$key = $sessid == '' ? $key : $this->_session_prefix . $sessid . '_' . $key;
		return $this->{$this->_adapter}->setnx($key, $value);
	}
	
	/**
	 * 查找符合给定模式的key。
	 * KEYS *命中数据库中所有key。
	 * KEYS h?llo命中hello， hallo and hxllo等。
	 * KEYS h*llo命中hllo和heeeeello等。
	 * KEYS h[ae]llo命中hello和hallo，但不命中hillo。
	 * 特殊符号用"\"隔开
	 * @param pattern
	 * @return 符合给定模式的key列表。
	 */
	public function keys($pattern, $sessid = '')
	{
		$pattern = $sessid == '' ? $pattern : $this->_session_prefix . $sessid . '_' . $pattern;
		return $this->{$this->_adapter}->keys($pattern);
	}
	
	/**
	 * 为给定key设置生存时间。
	 * 当key过期时，它会被自动删除。
	 * 在Redis中，带有生存时间的key被称作“易失的”(volatile)。
	 * 在低于2.1.3版本的Redis中，已存在的生存时间不可覆盖。
	 * 从2.1.3版本开始，key的生存时间可以被更新，也可以被PERSIST命令移除。(详情参见 http://redis.io/topics/expire)。
	 * @param key ttl
	 * @return 设置成功返回1。当key不存在或者不能为key设置生存时间时(比如在低于2.1.3中你尝试更新key的生存时间)，返回0。
	 */
	public function expire($key, $sessid = '', $ttl = 0)
	{
		if ($sessid != '') {
			$key = $this->_session_prefix . $sessid . '_' . $key;
			$ttl = $this->_cache_session_ttl;
		}
		$ttl = ($ttl === 0) ? $this->_cache_session_ttl : $ttl;
		return $this->{$this->_adapter}->expire($key, $ttl);
	}
	
	/**
	 * 检查给定key是否存在。
	 * @param key
	 * @return 若key存在，返回1，否则返回0。
	 */
	public function exists($key, $sessid = '')
	{
		$key = $sessid == '' ? $key : $this->_session_prefix . $sessid . '_' . $key;
		return $this->{$this->_adapter}->exists($key);
	}
	
	/**
	 * 清空当前数据库中的所有 key 。此命令从不失败。
	 * @return 总是返回 OK 。
	 */
	public function flushDB()
	{
		return $this->{$this->_adapter}->flushDB();
	}
	
	/**
	 * 清空整个 Redis 服务器的数据(删除所有数据库的所有 key)。
	 * 此命令从不失败。
	 * @return 总是返回 OK 。
	 */
	public function flushAll()
	{
		return $this->{$this->_adapter}->flushAll();
	}
	
	//[start]------------下面几个是事物函数
	/**
	 * 监视一个(或多个) key ，如果在事务执行之前这个(或这些) key 被其他命令所改动，那么事务将被打断。
	 * @param ATCH key [key ...]
	 * @return 总是返回 OK 。
	 */
	public function watch($key, $sessid = '')
	{
		$key = $sessid == '' ? $key : $this->_session_prefix . $sessid . '_' . $key;
		return $this->{$this->_adapter}->watch($key);
	}
	
	/**
	* 取消 WATCH 命令对所有 key 的监视。
	* 如果在执行 WATCH 命令之后， EXEC 命令或 DISCARD 命令先被执行了的话，那么就不需要再执行 UNWATCH 了。
	* 因为 EXEC 命令会执行事务，因此 WATCH 命令的效果已经产生了；而 DISCARD 命令在取消事务的同时也会取消
	* 所有对 key 的监视，因此这两个命令执行之后，就没有必要执行 UNWATCH 了。
	* @return 总是返回 OK 。
	*/
	public function unwatch()
	{
		return $this->{$this->_adapter}->unwatch();
	}
	
	/**
	* 标记一个事务块的开始。
	* 事务块内的多条命令会按照先后顺序被放进一个队列当中，最后由 EXEC 命令在一个原子时间内执行。
	* @return 总是返回 OK 。
	*/
	public function multi()
	{
		return $this->{$this->_adapter}->multi();
	}
	
	/**
	* 执行所有事务块内的命令。
	* 假如某个(或某些) key 正处于 WATCH 命令的监视之下，且事务块中有和这个(或这些) key 相关的命令，那么 EXEC
	* 命令只在这个(或这些) key 没有被其他命令所改动的情况下执行并生效，否则该事务被打断(abort)。
	* @return 事务块内所有命令的返回值，按命令执行的先后顺序排列。当操作被打断时，返回空值 nil 。
	*/
	public function exec()
	{
		return $this->{$this->_adapter}->exec();
	}
	
	/**
	* 取消事务，放弃执行事务块内的所有命令。
	* 如果正在使用 WATCH 命令监视某个(或某些) key ，那么取消所有监视，等同于执行命令 UNWATCH 。
	* @return 总是返回 OK 。
	*/
	public function discard()
	{
		return $this->{$this->_adapter}->discard();
	}
	//[end]------------上面几个是事物函数
	
	//[start]------------下面几个函数是对有序集(Sorted Set)的操作
	/**
	 * ZADD key score member [[score member] [score member] ...]
	 * 将一个或多个member元素及其score值加入到有序集key当中。
	 * 如果某个member已经是有序集的成员，那么更新这个member的score值，并通过重新插入这个member元素，来保证该member在正确的位置上。
	 * score值可以是整数值或双精度浮点数。
	 * 如果key不存在，则创建一个空的有序集并执行ZADD操作。
	 * 当key存在但不是有序集类型时，返回一个错误。
	 * @return 被成功添加的新成员的数量，不包括那些被更新的、已经存在的成员。
	 */
	public function zAdd($key, $score, $value)
	{
		return $this->{$this->_adapter}->zAdd($key, $score, $value);
	}
	
	/**
	 * ZRANGE key start stop [WITHSCORES]
	 * 返回有序集key中，指定区间内的成员。
	 * 其中成员的位置按score值递增(从小到大)来排序。
	 * 具有相同score值的成员按字典序(lexicographical order)来排列。
	 * 如果你需要成员按score值递减(从大到小)来排列，请使用ZREVRANGE命令。
	 * 下标参数start和stop都以0为底，也就是说，以0表示有序集第一个成员，以1表示有序集第二个成员，以此类推。
	 * 你也可以使用负数下标，以-1表示最后一个成员，-2表示倒数第二个成员，以此类推。
	 * 超出范围的下标并不会引起错误。
	 * 比如说，当start的值比有序集的最大下标还要大，或是start > stop时，ZRANGE命令只是简单地返回一个空列表。
	 * 另一方面，假如stop参数的值比有序集的最大下标还要大，那么Redis将stop当作最大下标来处理。
	 * 可以通过使用WITHSCORES选项，来让成员和它的score值一并返回，返回列表以value1,score1, ..., valueN,scoreN的格式表示。
	 * 客户端库可能会返回一些更复杂的数据类型，比如数组、元组等。
	 * @return 指定区间内，带有score值(可选)的有序集成员的列表。
	 */
	public function zRange($key, $start, $end, $withscores = false)
	{
		return $this->{$this->_adapter}->zRange($key, $start, $end, $withscores);
	}
	
	/**
	 * ZCARD key
	 * 返回有序集key的基数。
	 * @return 当key存在且是有序集类型时，返回有序集的基数。当key不存在时，返回0。
	 */
	public function zCard($key)
	{
		return $this->{$this->_adapter}->zCard($key);
	}
	
	/**
	 * ZCOUNT key min max
	 * 返回有序集key中，score值在min和max之间(默认包括score值等于min或max)的成员。
	 * 关于参数min和max的详细使用方法，请参考ZRANGEBYSCORE命令。
	 * @return score值在min和max之间的成员的数量。
	 */
	public function zCount($key, $start, $end)
	{
		return $this->{$this->_adapter}->zCount($key, $start, $end);
	}
	
	/**
	 * ZREM key member [member ...]
	 * 移除有序集key中的一个或多个成员，不存在的成员将被忽略。
	 * 当key存在但不是有序集类型时，返回一个错误。
	 * @return 被成功移除的成员的数量，不包括被忽略的成员。
	 */
	public function zRem($key, $value)
	{
		return $this->{$this->_adapter}->zRem($key, $value);
	}
	
	/**
	 * 计算给定的一个或多个有序集的交集，其中给定key的数量必须以numkeys参数指定，并将该交集(结果集)储存到destination。
	 * 默认情况下，结果集中某个成员的score值是所有给定集下该成员score值之和。
	 * @param $aggregateFunction Either "SUM", "MIN", or "MAX": defines the behaviour to use on duplicate entries during the zInter. 
	 * @return 保存到destination的结果集的基数。
	 */
	public function zInter($keyOutput, $arrayZSetKeys, $arrayWeights, $aggregateFunction = 'sum')
	{
		return $this->{$this->_adapter}->zInter($keyOutput, $arrayZSetKeys, $arrayWeights, $aggregateFunction);
	}
	
	/**
	 * 计算给定的一个或多个有序集的并集，其中给定key的数量必须以numkeys参数指定，并将该并集(结果集)储存到destination。
	 * 默认情况下，结果集中某个成员的score值是所有给定集下该成员score值之和。
	 * @param $aggregateFunction Either "SUM", "MIN", or "MAX": defines the behaviour to use on duplicate entries during the zUnion.
	 * @return 保存到destination的结果集的基数。 
	 */
	public function zUnion($keyOutput, $arrayZSetKeys, $arrayWeights, $aggregateFunction = 'sum')
	{
		return $this->{$this->_adapter}->zUnion($keyOutput, $arrayZSetKeys, $arrayWeights, $aggregateFunction);
	}
	//[end]------------上面几个函数是对有序集(Sorted Set)的操作
	
	//[start]------------下面几个函数是对集合(Set)的操作
	/**
	 * SADD key member [member ...]
	 * 将一个或多个member元素加入到集合key当中，已经存在于集合的member元素将被忽略。
	 * 假如key不存在，则创建一个只包含member元素作成员的集合。
	 * 当key不是集合类型时，返回一个错误。
	 * @return 被添加到集合中的新元素的数量，不包括被忽略的元素。
	 * 用法：sAdd('key', 'member1', 'member2', ...)
	 */
	public function sAdd()
	{
		return call_user_func_array(array($this->{$this->_adapter}, 'sAdd'), func_get_args());
	}
	
	/**
	 * SMEMBERS key
	 * @return 集合中的所有成员。
	 */
	public function sMembers($key)
	{
		return $this->{$this->_adapter}->sMembers($key);
	}
	
	/**
	 * SREM key member [member ...]
	 * 移除集合key中的一个或多个member元素，不存在的member元素会被忽略。
	 * 当key不是集合类型，返回一个错误。
	 * @return 被成功移除的元素的数量，不包括被忽略的元素。
	 * 用法：sRem('key', 'member1', 'member2', ...)
	 */
	public function sRem()
	{
		return call_user_func_array(array($this->{$this->_adapter}, 'sRem'), func_get_args());
	}
	
	/**
	 * SCARD key
	 * 返回集合key的基数(集合中元素的数量)。
	 * @return 集合的基数。当key不存在时，返回0。
	 */
	public function sCard($key)
	{
		return $this->{$this->_adapter}->sCard($key);
	}
	
	/**
	 * SMOVE source destination member
	 * 将member元素从source集合移动到destination集合。
	 * SMOVE是原子性操作。
	 * 如果source集合不存在或不包含指定的member元素，则SMOVE命令不执行任何操作，仅返回0。否则，
	 * member元素从source集合中被移除，并添加到destination集合中去。
	 * 当destination集合已经包含member元素时，SMOVE命令只是简单地将source集合中的member元素删除。
	 * 当source或destination不是集合类型时，返回一个错误。
	 * @return 如果member元素被成功移除，返回1。如果member元素不是source集合的成员，并且没有任何操作对destination集合执行，那么返回0。
	 */
	public function sMove($srcKey, $dstKey, $value)
	{
		return $this->{$this->_adapter}->sMove($srcKey, $dstKey, $value);
	}
	
	/**
	 * SISMEMBER key member
	 * 判断member元素是否是集合key的成员。
	 * @return 如果member元素是集合的成员，返回1。如果member元素不是集合的成员，或key不存在，返回0。
	 */
	public function sIsMember($key, $value)
	{
		return $this->{$this->_adapter}->sIsMember($key, $value);
	}
	
	/**
	 * SINTER key [key ...]
	 * 返回一个集合的全部成员，该集合是所有给定集合的交集。
	 * 不存在的key被视为空集。
	 * 当给定集合当中有一个空集时，结果也为空集(根据集合运算定律)。
	 * @return 交集成员的列表。
	 * 用法：sInter('key1', 'key2', 'key3', ...)
	 */
	public function sInter()
	{
		return call_user_func_array(array($this->{$this->_adapter}, 'sInter'), func_get_args());
	}
	
	/**
	 * SINTERSTORE destination key [key ...]
	 * 此命令等同于SINTER，但它将结果保存到destination集合，而不是简单地返回结果集。
	 * 如果destination集合已经存在，则将其覆盖。
	 * destination可以是key本身。
	 * @return 结果集中的成员数量。
	 * 用法：sInterStore('output', 'key1', 'key2', 'key3', ...)
	 */
	public function sInterStore()
	{
		return call_user_func_array(array($this->{$this->_adapter}, 'sInterStore'), func_get_args());
	}
	
	/**
	 * SUNION key [key ...]
	 * 返回一个集合的全部成员，该集合是所有给定集合的并集。
	 * 不存在的key被视为空集。
	 * @return 并集成员的列表。
	 * 用法：sUnion('key1', 'key2', 'key3', ...)
	 */
	public function sUnion()
	{
		return call_user_func_array(array($this->{$this->_adapter}, 'sUnion'), func_get_args());
	}
	
	/**
	 * SUNIONSTORE destination key [key ...]
	 * 此命令等同于SUNION，但它将结果保存到destination集合，而不是简单地返回结果集。
	 * 如果destination已经存在，则将其覆盖。
	 * destination可以是key本身。
	 * @return 结果集中的元素数量。
	 * 用法：sUnionStore('dst', 'key1', 'key2', 'key3', ...)
	 */
	public function sUnionStore()
	{
		return call_user_func_array(array($this->{$this->_adapter}, 'sUnionStore'), func_get_args());
	}
	
	/**
	 * SDIFF key [key ...]
	 * 返回一个集合的全部成员，该集合是所有给定集合的差集 。
	 * 不存在的key被视为空集。
	 * @return 交集成员的列表。
	 * 用法：sDiff('key1', 'key2', 'key3', ...)
	 */
	public function sDiff()
	{
		return call_user_func_array(array($this->{$this->_adapter}, 'sDiff'), func_get_args());
	}
	
	/**
	 * SDIFFSTORE destination key [key ...]
	 * 此命令等同于SDIFF，但它将结果保存到destination集合，而不是简单地返回结果集。
	 * 如果destination集合已经存在，则将其覆盖。
	 * destination可以是key本身。
	 * @return 结果集中的元素数量。
	 * 用法：sDiffStore('dst', 'key1', 'key2', 'key3', ...)
	 */
	public function sDiffStore()
	{
		return call_user_func_array(array($this->{$this->_adapter}, 'sDiffStore'), func_get_args());
	}
	//[end]------------上面几个函数是对集合(Set)的操作
	
	//[start]------------下面几个函数是哈希表(Hash)的操作
	/**
	 * HSET key field value
	 * 将哈希表key中的域field的值设为value。
	 * 如果key不存在，一个新的哈希表被创建并进行HSET操作。
	 * 如果域field已经存在于哈希表中，旧值将被覆盖。
	 * @return 如果field是哈希表中的一个新建域，并且值设置成功，返回1。如果哈希表中域field已经存在且旧值已被新值覆盖，返回0。
	 */
	public function hSet($key, $hashKey, $value, $sessid = '')
	{
		if ($sessid != '') {
			//保存一个session key集合
			$this->sAdd('sess_keys', $key);
			$key = $this->_session_prefix . $sessid . '_' . $key;
		}
		return $this->{$this->_adapter}->hSet($key, $hashKey, $value);
	}
	
	/**
	 * HSETNX key field value
	 * 将哈希表key中的域field的值设置为value，当且仅当域field不存在。
	 * 若域field已经存在，该操作无效。
	 * 如果key不存在，一个新哈希表被创建并执行HSETNX命令。
	 * @return 设置成功，返回1。如果给定域已经存在且没有操作被执行，返回0。
	 */
	public function hSetNx($key, $hashKey, $value, $sessid = '')
	{
		if ($sessid != '') {
			//保存一个session key集合
			$this->sAdd('sess_keys', $key);
			$key = $this->_session_prefix . $sessid . '_' . $key;
		}
		return $this->{$this->_adapter}->hSetNx($key, $hashKey, $value);
	}
	
	/**
	 * HGET key field
	 * 返回哈希表key中给定域field的值。
	 * @return 给定域的值。当给定域不存在或是给定key不存在时，返回nil。
	 */
	public function hGet($key, $hashKey, $sessid = '')
	{
		$key = $sessid == '' ? $key : $this->_session_prefix . $sessid . '_' . $key;
		return $this->{$this->_adapter}->hGet($key, $hashKey);
	}
	
	/**
	 * HLEN key
	 * 返回哈希表key中域的数量。
	 * @return 哈希表中域的数量。当key不存在时，返回0。
	 */
	public function hLen($key, $sessid = '')
	{
		$key = $sessid == '' ? $key : $this->_session_prefix . $sessid . '_' . $key;
		return $this->{$this->_adapter}->hLen($key);
	}
	
	/**
	 * HDEL key field
	 * Removes a value from the hash stored at key. If the hash table doesn't exist, or the key doesn't exist, FALSE is returned. 
	 * @return BOOL TRUE in case of success, FALSE in case of failure
	 */
	public function hDel($key, $hashKey, $sessid = '')
	{
		$key = $sessid == '' ? $key : $this->_session_prefix . $sessid . '_' . $key;
		return $this->{$this->_adapter}->hDel($key, $hashKey);
	}
	
	/**
	 * HKEYS key
	 * 返回哈希表key中的所有域。
	 * @return 一个包含哈希表中所有域的表。当key不存在时，返回一个空表。
	 */
	public function hKeys($key, $sessid = '')
	{
		$key = $sessid == '' ? $key : $this->_session_prefix . $sessid . '_' . $key;
		return $this->{$this->_adapter}->hKeys($key);
	}
	
	/**
	 * HGETALL key
	 * 返回哈希表key中，所有的域和值。
	 * 在返回值里，紧跟每个域名(field name)之后是域的值(value)，所以返回值的长度是哈希表大小的两倍。
	 * @return 以列表形式返回哈希表的域和域的值。 若key不存在，返回空列表。
	 */
	public function hGetAll($key, $sessid = '')
	{
		$key = $sessid == '' ? $key : $this->_session_prefix . $sessid . '_' . $key;
		return $this->{$this->_adapter}->hGetAll($key);
	}
	
	/**
	 * HMSET key field value [field value ...]
	 * 同时将多个field - value(域-值)对设置到哈希表key中。
	 * 此命令会覆盖哈希表中已存在的域。
	 * 如果key不存在，一个空哈希表被创建并执行HMSET操作。
	 * @return 如果命令执行成功，返回OK。当key不是哈希表(hash)类型时，返回一个错误。
	 */
	public function hMSet($key, $members, $sessid = '')
	{
		if ($sessid != '') {
			//保存一个session key集合
			$this->sAdd('sess_keys', $key);
			$key = $this->_session_prefix . $sessid . '_' . $key;
		}
		return $this->{$this->_adapter}->hMSet($key, $members);
	}
	
	/**
	 * HMGET key field [field ...]
	 * 返回哈希表key中，一个或多个给定域的值。
	 * 如果给定的域不存在于哈希表，那么返回一个nil值。
	 * 因为不存在的key被当作一个空哈希表来处理，所以对一个不存在的key进行HMGET操作将返回一个只带有nil值的表。
	 * @return 一个包含多个给定域的关联值的表，表值的排列顺序和给定域参数的请求顺序一样。
	 */
	public function hMGet($key, $memberKeys, $sessid = '')
	{
		$key = $sessid == '' ? $key : $this->_session_prefix . $sessid . '_' . $key;
		return $this->{$this->_adapter}->hMGet($key, $memberKeys);
	}
	//[end]------------上面几个函数是对哈希表(Hash)的操作

	// ------------------------------------------------------------------------

	/**
	 * Cache Info
	 *
	 * @param 	string		user/filehits
	 * @return 	mixed		array on success, false on failure	
	 */
	public function cache_info($type = 'user')
	{
		return $this->{$this->_adapter}->cache_info($type);
	}

	// ------------------------------------------------------------------------
	
	/**
	 * Get Cache Metadata
	 *
	 * @param 	mixed		key to get cache metadata on
	 * @return 	mixed		return value from child method
	 */
	public function get_metadata($id)
	{
		return $this->{$this->_adapter}->get_metadata($id);
	}
	
	// ------------------------------------------------------------------------

	/**
	 * Initialize
	 *
	 * Initialize class properties based on the configuration array.
	 *
	 * @param	array 	
	 * @return 	void
	 */
	private function _initialize($config)
	{
		$default_config = array(
				'adapter',
				'memcached'
			);

		foreach ($default_config as $key)
		{
			if (isset($config[$key]))
			{
				$param = '_'.$key;

				$this->{$param} = $config[$key];
			}
		}

		if (isset($config['backup']))
		{
			if (in_array('cache_'.$config['backup'], $this->valid_drivers))
			{
				$this->_backup_driver = $config['backup'];
			}
		}
	}

	// ------------------------------------------------------------------------

	/**
	 * Is the requested driver supported in this environment?
	 *
	 * @param 	string	The driver to test.
	 * @return 	array
	 */
	public function is_supported($driver)
	{
		static $support = array();

		if ( ! isset($support[$driver]))
		{
			$support[$driver] = $this->{$driver}->is_supported();
		}

		return $support[$driver];
	}

	// ------------------------------------------------------------------------

	/**
	 * __get()
	 *
	 * @param 	child
	 * @return 	object
	 */
	public function __get($child)
	{
		$obj = parent::__get($child);
		if ( ! $this->is_supported($child))
		{
			$this->_adapter = $this->_backup_driver;
		}
		return $obj;
	}
	
	// ------------------------------------------------------------------------
}
// End Class

/* End of file Cache.php */
/* Location: ./system/libraries/Cache/Cache.php */