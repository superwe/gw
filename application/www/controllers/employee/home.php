<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Home extends CI_Controller {

    private $spaceId; //空间id
    private $appList;
    private $groupList;
    private $employeeId;
    private $employeeInfo;
    /**
     * 登录页控制器构造函数
     */
    public function __construct()
    {
        parent::__construct();
        $this->load->helper('cache');
        $this->load->model('app_model', 'app');
        $this->load->model('group_model', 'group');
        $this->spaceId = QiaterCache::spaceid();
        $this->employeeId =QiaterCache::employeeid();
        $this->employeeInfo = QiaterCache::employeeInfo();
    }

    public function getPersonalInfo()
    {
        echo json_encode($this->employeeInfo);
    }

	public function index()
    {
        $data['appList'] = $this->app->getAppList($this->spaceId);//应用列表
        $data['groupList'] = $this->group->getGroupMenu($this->spaceId, $this->employeeId);//群组列表
        $data['personalInfo'] = $this->employeeInfo;
        $data['spaceId'] = $this->spaceId;
        $this->load->database('default');
        $strSql = 'SELECT a.id,a.title,e.`name` AS creator '
                        .'FROM tb_announce AS a LEFT JOIN tb_employee AS e ON a.creatorid=e.id '
                        .'WHERE a.spaceid=? AND a.`status`=1 '
                        .'ORDER BY a.sortvalue DESC,a.updatetime DESC '
                        .'LIMIT 3 OFFSET 0 ';
        $query=$this->db->query($strSql,array($this->spaceId));

        $data['announceList']=$query->result();

        $this->load->library('smarty');
        $this->smarty->view('employee/index.tpl',$data);
    }
}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */