<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * 全文检索引擎索引类
 * User:	bishenghua
 * Date:	13-4-17
 * Time:	上午9:07
 * Email:	net.bsh@gmail.com
 */

require_once(BASEPATH.'libraries/Elastica/autoload.php');
class CI_Indexengine{
	private $index = 'qiater';
	private $type = false;
	private $field = false;
	private $filter = false;
	private $sort = false;
	private $highlight = false;
	private $elasticsearch = null;
	private static $_type = array(); //允许类型
	private static $_field = array(); //允许字段

	/**
	 * 设置允许类型
	 * @param unknown_type $allowType
	 */
	public static function setAllowType($allowType) {
		self::$_type = $allowType;
	}
	
	/**
	 * 获取允许类型
	 * @return multitype:
	 */
	public static function getAllowType() {
		return self::$_type;
	}
	
	/**
	 * 设置允许字段
	 * @param unknown_type $allowField
	 */
	public static function setAllowField($allowField) {
		self::$_field = $allowField;
	}
	
	/**
	 * 获取允许字段
	 * @return multitype:
	 */
	public static function getAllowField() {
		return self::$_field;
	}
	
	/**
	 * 构造函数加载配置及实例化客户端
	 */
	public function __construct() {
		$ci =& get_instance();
		$ci->config->load('indexes');
		$servers = array('servers' => $ci->config->config['es_server']);
		$this->elasticsearch = new Elastica\Client($servers);
	}
	
	/**
	 * 搜索函数
	 * @param unknown_type $offet
	 * @param unknown_type $limit
	 */
	public function search($offet = 0, $limit = 10) {
		//设置Field
		$elasticaBool = null;
		if ($this->field) {
			$elasticaBool = new Elastica\Query\Bool();
			$i = 1;
			foreach ($this->field as $key => $value) {
				$arr = explode('-', $key);
				if (!in_array($arr[0], self::$_field)) continue;
				$elasticaText = 'elasticaText' . $i;
				$$elasticaText = new Elastica\Query\Text();
				$$elasticaText->setField($arr[0], $value);
				$bool = 'add' . ucfirst($arr[1]);
				$elasticaBool->$bool($$elasticaText);
				$i++;
			}
		}
		
		$elasticaQuery = new Elastica\Query($elasticaBool);
		//过滤器
		if ($this->filter) {
			$elasticaQuery->setFilter($this->filter);
		}
		//处理排序
		if ($this->sort) {
			$sortinfo = array();
			foreach ($this->sort as $key => $value) {
				$sortinfo[] = array($key => array('order' => $value));
			}
			$sortinfo[] = '_score';
			$elasticaQuery->setSort($sortinfo);
		}
		//高亮处理
		if ($this->highlight) {
			$hlfield = array();
			foreach ($this->highlight as $key => $value) {
				$arr = explode('|', $value);
				$hlfield[$key] = array('pre_tags' => array($arr[0]), 'post_tags' => array($arr[1]));
			}
			if ($hlfield != array()) {
				$elasticaQuery->setHighlight(array('fields' => $hlfield));
			}
		}
		$elasticaQuery->setFrom($offet);
		$elasticaQuery->setLimit($limit);
		$elasticaIndex = new Elastica\Search($this->elasticsearch);
		$elasticaIndex->addIndex($this->index); //设置索引名称
		//设置类型
		if ($this->type) {
			foreach ($this->type as $value) {
				$elasticaIndex->addType($value);
			}
		}
		$elasticaResultSet = $elasticaIndex->search($elasticaQuery); //搜索
		
		//组织结果数据
		$result = array();
		$elasticaResults = $elasticaResultSet->getResults();
		$result['hits'] = $elasticaResultSet->getTotalHits();
		$result['time'] = $elasticaResultSet->getTotalTime() * 0.001;
		$result['data'] = array();
		foreach ($elasticaResults as $elasticaResult) {
			$data = $elasticaResult->getData();
			$data['id'] = $elasticaResult->getId();
			$data['type'] = $elasticaResult->getType();
			$hls = $elasticaResult->getHighlights();
			foreach ($hls as $key => $value) {
				$data[$key] = $value[0];
			}
			$result['data'][] = $data;
		}
		//print_r($this->elasticsearch);
		return $result;
	}
	
	/**
	 * 创建、更新索引 (注意：id字段是必须的)
	 * @param unknown_type $data
	 */
	public function create($data) {
		$id = false;
		if (isset($data['id'])) {
			$id = $data['id'];
			unset($data['id']);
		}
		if (!$id || !$this->type || !is_string($this->type)) return false;
		foreach ($data as $key => $value) {
			if (!in_array($key, self::$_field)) unset($data[$key]);
		}
		if (empty($data)) return false;
		try {
			if (isset($data['title'])) $data['title'] = strip_tags($data['title']);
			if (isset($data['content'])) $data['content'] = strip_tags($data['content']);
			$document = new Elastica\Document($id, $data);
			$elasticaIndex = new Elastica\Index($this->elasticsearch, $this->index);
			$elasticaType = new Elastica\Type($elasticaIndex, $this->type);
			$elasticaType->addDocument($document);
			$elasticaType->getIndex()->refresh();
			return true;
		} catch (Exception $e) {
			return false;
		}
	}
	
	/**
	 * 同时创建、更新更多索引 (注意：id字段是必须的)
	 * @param unknown_type $datas
	 */
	public function createMore($datas) {
		if (!$this->type || !is_string($this->type)) return false;
		$documents = array();
		foreach ($datas as $data) {
			$id = false;
			if (isset($data['id'])) {
				$id = $data['id'];
				unset($data['id']);
			}
			foreach ($data as $k => $v) {
				if (!in_array($k, self::$_field)) unset($data[$k]);
			}
			if (!$id) continue;
			if (isset($data['title'])) $data['title'] = strip_tags($data['title']);
			if (isset($data['content'])) $data['content'] = strip_tags($data['content']);
			$documents[] = new Elastica\Document($id, $data);
		}
		if ($documents == array()) return false;
		try {
			$elasticaIndex = new Elastica\Index($this->elasticsearch, $this->index);
			$elasticaType = new Elastica\Type($elasticaIndex, $this->type);
			$elasticaType->addDocuments($documents);
			$elasticaType->getIndex()->refresh();
			return true;
		} catch (Exception $e) {
			return false;
		}
	}
	
	/**
	 * 删除索引，将删除type下的所有document，注意这里的type是单个字符串
	 */
	public function delete() {
		if (!$this->type || !is_string($this->type)) return false;
		try {
			$elasticaIndex = new Elastica\Index($this->elasticsearch, $this->index);
			$elasticaType = new Elastica\Type($elasticaIndex, $this->type);
			$elasticaType->delete();
			return true;
		} catch (Exception $e) {
			return false;
		}
	}
	
	/**
	 * 根据id删除索引
	 * @param unknown_type $id
	 * @param array $options
	 */
	public function deleteById($id, array $options = array()) {
		if (!$this->type || !is_string($this->type)) return false;
		try {
			$elasticaIndex = new Elastica\Index($this->elasticsearch, $this->index);
			$elasticaType = new Elastica\Type($elasticaIndex, $this->type);
			$elasticaType->deleteById($id, $options);
			return true;
		} catch (Exception $e) {
			return false;
		}
	}
	
	/**
	 * 根据多个id删除索引
	 * @param array $ids
	 */
	public function deleteIds(array $ids) {
		if (!$this->type || !is_string($this->type)) return false;
		try {
			$elasticaIndex = new Elastica\Index($this->elasticsearch, $this->index);
			$elasticaType = new Elastica\Type($elasticaIndex, $this->type);
			$elasticaType->deleteIds($ids);
			return true;
		} catch (Exception $e) {
			return false;
		}
	}
	
	public function getDocumentById($id, $options = array()) {
		if (!$id || !$this->type || !is_string($this->type)) return false;
		$elasticaIndex = new Elastica\Index($this->elasticsearch, $this->index);
		$elasticaType = new Elastica\Type($elasticaIndex, $this->type);
		try {
			$ducument = $elasticaType->getDocument($id, $options);
		} catch (Exception $e) {
			$ducument = null;
		}
		return $ducument;
	}
	
	/**
	 * 设置索引
	 * @param unknown_type $index
	 */
	public function setIndex($index) {
		$this->index = $index;
	}
	
	/**
	 * 设置类型
	 * @param unknown_type $type
	 */
	public function setType($type) {
		if ($type && (is_array($type) || (is_string($type) && in_array($type, self::$_type)))) {
			if (is_array($type)) {
				foreach ($type as $key => $value) {
					if (!in_array($value, self::$_type)) unset($type[$key]);
				}
			}
			if (!empty($type)) $this->type = $type;
		}
	}
	
	/**
	 * 设置搜索字段
	 * @param unknown_type $field
	 */
	public function setField($field) {
		if ($field && is_array($field)) {
			$this->field = $field;
		}
	}
	
	/**
	 * 设置过滤器
	 * @param unknown_type $filter
	 */
	public function setFilter($filter) {
		$this->filter = $filter;
	}
	
	/**
	 * 设置排序
	 * @param unknown_type $sort
	 */
	public function setSort($sort) {
		if ($sort && is_array($sort)) {
			$this->sort = $sort;
		}
	}
	
	/**
	 * 设置高亮
	 * @param unknown_type $highlight
	 */
	public function setHighlight($highlight) {
		if ($highlight && is_array($highlight)) {
			$this->highlight = $highlight;
		}
	}
	
	/**
	 * 设置过滤单元
	 * @param unknown_type $filterTerm
	 */
	public function setFilterTerm($filterTerm) {
		$elasticaFilterTerm = new Elastica\Filter\Term();
		foreach ($filterTerm as $field => $value) {}
		$elasticaFilterTerm->setTerm($field, $value);
		return $elasticaFilterTerm;
	}
	
	/**
	 * 设置范围
	 * @param unknown_type $filterRangeName
	 * @param unknown_type $filterRangeArgs
	 */
	public function setFilterRange($filterRangeName, $filterRangeArgs) {
		$elasticaFilterRange = new Elastica\Filter\Range();
		$elasticaFilterRange->addField($filterRangeName, $filterRangeArgs);
		return $elasticaFilterRange;
	}
	
	/**
	 * 设置过滤与
	 * @param unknown_type $elasticaFilterTerm1
	 * @param unknown_type $elasticaFilterTerm2
	 */
	public function setFilterAnd($elasticaFilterTerm1, $elasticaFilterTerm2 = false) {
		$elasticaFilterAnd 	= new Elastica\Filter\BoolAnd();
		$elasticaFilterAnd->addFilter($elasticaFilterTerm1);
		if ($elasticaFilterTerm2) $elasticaFilterAnd->addFilter($elasticaFilterTerm2);
		return $elasticaFilterAnd;
	}
	
	/**
	 * 设置过滤或
	 * @param unknown_type $elasticaFilterTerm1
	 * @param unknown_type $elasticaFilterTerm2
	 */
	public function setFilterOr($elasticaFilterTerm1, $elasticaFilterTerm2 = false) {
		$elasticaFilterOr = new Elastica\Filter\BoolOr();
		$elasticaFilterOr->addFilter($elasticaFilterTerm1);
		if ($elasticaFilterTerm2) $elasticaFilterOr->addFilter($elasticaFilterTerm2);
		return $elasticaFilterOr;
	}
}