<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * 全文检索引擎索引模块
 * User:	bishenghua
 * Date:	13-04-19
 * Time:	上午13:39
 * Email:	net.bsh@gmail.com
 */
class Indexes_model extends CI_Model{
	
	public function __construct() {
		$this->load->library('indexengine');
		$allowType = array( //允许类型
			'employee', 'speech', 'group', 'files', 'topic', 'vote', 'schedule', 'task', 'announce'
		);
		$allowField = array( //允许字段
			'spaceid', 'employeeid', 'url', 'date', 'title', 'content'
		);
		CI_Indexengine::setAllowType($allowType);
		CI_Indexengine::setAllowField($allowField);
	}
	
	/**
	 * 创建索引
	 * 类型要传字符串，只能更新一个type下的文档，注意：data中id字段是必须的
	 * @param unknown_type $type
	 * @param unknown_type $data
	 */
	public function create($type, $data) {
        $this->indexengine->setType($type);
        return $this->indexengine->create($data);
	}
	
	/**
	 * 更新索引
	 * 类型要传字符串，只能更新一个type下的文档，注意：data中id字段是必须的
	 * @param unknown_type $type
	 * @param unknown_type $data
	 */
	public function update($type, $data) {
		$id = isset($data['id']) ? $data['id'] : false;
		if (!$id) return false;
		//取出数据
		$this->indexengine->setType($type);
		$document = $this->indexengine->getDocumentById($id);
		if ($document == null) return false;
		$oldData = $document->getData();
		$newData['id'] = $id;
		foreach ($oldData as $key => $value) {
			if (isset($data[$key])) $newData[$key] = $data[$key];
			else $newData[$key] = $value;
		}
		return $this->indexengine->create($newData);
	}
	
	/**
	 * 根据id删除索引
	 * @param unknown_type $id
	 * @param array $options
	 */
	public function deleteById($type, $id, array $options = array()) {
		$this->indexengine->setType($type);
		return $this->indexengine->deleteById($id, $options);
	}
	
	/**
	 * 根据多个id删除索引
	 * @param array $ids
	 */
	public function deleteIds($type, array $ids) {
		$this->indexengine->setType($type);
		return $this->indexengine->deleteIds($ids);
	}
	
	/**
	 * 删除索引，将删除type下的所有document，注意这里的type是单个字符串
	 */
	public function delete($type, $isdel = false) { //慎用次方法
		$this->indexengine->setType($type);
		return $isdel ? $this->indexengine->delete() : false;
	}
	
	public function search($spaceId, $key, $type, $curpage, $limit, $dateStart, $timeStart, $dateEnd, $timeEnd, $getnum = false) {
		if ($type) {
			$type = array($type);
			$this->indexengine->setType($type);
		}
		
		$field = array('title-should' => $key, 'content-should' => $key);
		$this->indexengine->setField($field);//设置查询字段内容
		
		if (!$getnum) {
			$sort = array('_score' => 'desc', 'date' => 'desc');
			$this->indexengine->setSort($sort);
			$highlight = array('title' => '<mark>|</mark>', 'content' => '<mark>|</mark>'); //语法高亮
			$this->indexengine->setHighlight($highlight);
		}
		
		$filter = $filterTermSpaceId = $this->indexengine->setFilterTerm(array('spaceid' => $spaceId));
		$dateStart = "$dateStart $timeStart";
		$dateEnd = "$dateEnd $timeEnd";
		if ($dateStart != ' ' && $dateEnd != ' ' && $dateStart <= $dateEnd) {
			if ($dateStart == date('Y-m-d H:i', $time = strtotime($dateStart))) {
				$dateStart = date('Y-m-d H:i:s', $time);
			} else {
				$dateStart = date('Y-m-d ', $time) . '00:00:00';
			}
			if ($dateEnd == date('Y-m-d H:i', $time = strtotime($dateEnd))) {
				$dateEnd = date('Y-m-d H:i:s', $time);
			} else {
				$dateEnd = date('Y-m-d ', $time) . '23:59:59';
			}
			$filterRange = $this->indexengine->setFilterRange('date', array('from' => $dateStart, 'to' => $dateEnd));
			$filter = $this->indexengine->setFilterAnd($filterTermSpaceId, $filterRange);
		}
		$this->indexengine->setFilter($filter);
		
		$offset = ($curpage - 1) * $limit;
		return $this->indexengine->search($offset, $limit); //执行搜索
	}
}