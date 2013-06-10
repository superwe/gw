<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * 全文搜索
 * User:	bishenghua
 * Date:	13-4-23
 * Time:	上午10:40
 * Email:	net.bsh@gmail.com
 */

class Search extends CI_Controller {
	private $spaceId = 0;
	private $employeeId = 0;
	private $limit = 5; //每页显示多少
	private $page = 1;
	private $key = '';
	private $type = '';
	private $dateStart = '';
	private $timeStart = '';
	private $dateEnd = '';
	private $timeEnd = '';
	
	public function __construct() {
		parent::__construct();
		
		//从缓存获得空间ID
		$this->spaceId = QiaterCache::spaceid();
		$this->employeeId = QiaterCache::employeeid();
		
		$this->key = isset($_GET['key']) ? urldecode(trim($_GET['key'])) : '';
		$this->type = isset($_GET['type']) ? urldecode(trim($_GET['type'])) : '';
		$this->dateStart = isset($_GET['datestart']) ? urldecode(trim($_GET['datestart'])) : '';
		$this->timeStart = isset($_GET['timestart']) ? urldecode(trim($_GET['timestart'])) : '';
		$this->dateEnd = isset($_GET['dateend']) ? urldecode(trim($_GET['dateend'])) : '';
		$this->timeEnd = isset($_GET['timeend']) ? urldecode(trim($_GET['timeend'])) : '';
		$this->limit = (isset($_GET['per']) && intval($_GET['per']) > 0 ) ? intval($_GET['per']) : $this->limit;
		$this->page = (isset($_GET['p']) && intval($_GET['p']) > 0) ? $_GET['p'] : $this->page;
	}
	
	public function index() {
		$data = array();
		$data['limit'] = $this->limit;
		$data['personalInfo'] = QiaterCache::employeeInfo();
    	$this->load->model('app_model', 'app');
        $data['appList'] = $this->app->getAppList($this->spaceId);
        $this->load->model('group_model', 'group');
        $data['groupList'] = $this->group->getGroupMenu($this->spaceId, $this->employeeId);
		$this->load->library('smarty');
		$this->smarty->view('employee/search/index.tpl', $data);
	}
	
	/**
     * 异步获取搜索结果;
     */
    public function ajaxSearch() {
		$listData = array();
		$listData['total'] = 0;
		$listData['time'] = 0;
		$listData['head'] = array();
		if ($this->key) {
			$data = $this->_search($this->key, $this->type, $this->page, $this->limit, $this->dateStart, $this->timeStart, $this->dateEnd, $this->timeEnd);
			$employeeids = array();
			foreach($data['data'] as $value) {
				$employeeids[] = $value['employeeid'];
			}
			$employeeids = array_unique($employeeids);
			$this->load->model('employee_model', 'employee');
			$mapping = $this->employee->getEmployeeMapping($employeeids, 'name,imageurl');
			$listData['total'] = $data['hits'];
			$listData['time'] = $data['time'];
			foreach($data['data'] as $i => $item) {
				$img = isset($mapping['imageurl']) && isset($mapping['imageurl'][$item['employeeid']]) ? $this->config->item('resource_url').$mapping['imageurl'][$item['employeeid']] : '';
				$name = isset($mapping['name']) && isset($mapping['name'][$item['employeeid']]) ? $mapping['name'][$item['employeeid']] : '';
				$url = preg_match("/^http/i", $item['url']) ? $item['url'] : '/'.$item['url'];
				$listData['table'][$i][] =  '<a href="http://esn.uu.com.cn/space/cons/index/id/75072/VISITID/377"><img src="'.$img.'" alt="" title=""></a>';
				$listData['table'][$i][] =  '<a href="#" class="sName">'.$name.'</a><span class="lCorner"></span>畅捷通<br><a href="'.$url.'"><span class="sTitle">'.$item['type'].'-'.$item['title'].'</span></a><br>'.$item['date'];
			}
		}
    	
        if(!empty($_GET['head'])) {
            $head = array(
            	array('title'=>'', 'css'=>'w50'),
            	array('title'=>'', 'css'=>'w710')
            );
            $listData['head'] = $head;
        }
        echo json_encode(array('rs'=>true, 'error'=>'', 'data'=>$listData, 'type'=>'table'));
    }
    
    public function getnumber() {
    	$data = array('employee' => 0, 'speech' => 0, 'group' => 0, 'files' => 0, 'topic' => 0, 'vote' => 0, 'schedule' => 0, 'task' => 0, 'announce' => 0);
    	if ($this->key) {
    		foreach ($data as $key => $value) {
    			$result = $this->_search($this->key, $key, 1, 0, $this->dateStart, $this->timeStart, $this->dateEnd, $this->timeEnd, true);
    			if ($result['hits']) $data[$key] = $result['hits'];
    		}
    	}
    	echo json_encode($data);
    	
    }
    
    protected function _search($key, $type, $curpage, $limit, $dateStart, $timeStart, $dateEnd, $timeEnd, $getnum = false) {
    	$this->load->model('indexes_model', 'indexes');
    	return $this->indexes->search($this->spaceId, $key, $type, $curpage, $limit, $dateStart, $timeStart, $dateEnd, $timeEnd, $getnum);
    }

    /**
     * @人 查询信息
     * @param key 关键字
     * add by lisheng
     * 2013-05-15
     */
    public function searchForAt()
    {
        $key =  isset($_GET['key']) ? urldecode(trim($_GET['key'])) : '';

        $this->load->model('indexes_model', 'indexes');
        $employee = $this->indexes->searchForAt($this->spaceId,$key,'employee',3);

        $employeeids = array();
        foreach($employee['data'] as $value) {
            $employeeids[] = $value['id'];
        }
        $employeeids = array_unique($employeeids);

        $this->load->model('employee_model', 'employee');
        $mapping = $this->employee->getEmployeeMapping($employeeids, 'name,duty,email,imageurl');

        $rsData =array();
        foreach($employee['data'] as $i => $item) {
            $img = isset($mapping['imageurl']) && isset($mapping['imageurl'][$item['id']]) ? $this->config->item('resource_url').$mapping['imageurl'][$item['id']].'.thumb.jpg' : '';
            $name = isset($mapping['name']) && isset($mapping['name'][$item['id']]) ? $mapping['name'][$item['id']] : '';
            $email = isset($mapping['email']) && isset($mapping['email'][$item['id']]) ? $mapping['email'][$item['id']] : '';
            $duty = isset($mapping['duty']) && isset($mapping['duty'][$item['id']]) ? $mapping['duty'][$item['id']] : '';
            $url = preg_match("/^http/i", $item['url']) ? $item['url'] : '/'.$item['url'];
            if($name){
                $data['avatar'] = $img;
                $data['category'] = '10';
                $data['id'] = $item['id'];
                $data['label'] = $name;
                $data['email'] = $email;
                $data['desc'] = $duty;
                $data['tag'] = '@';
                $data['value'] = $url;
                $data['rel'] = '/employee/employee/cardInfo/'.$item['id'];

                array_push($rsData,$data);
            }

        }
        echo json_encode($rsData);
    }
}