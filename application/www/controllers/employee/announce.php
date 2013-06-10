<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: lixiao1
 * Date: 13-3-21
 * Time: 上午9:49
 * To change this template use File | Settings | File Templates.
 */

class Announce extends CI_Controller {

    private $spaceId; //空间id
    private $appList;
    private $groupList;
    /*private $innerSpaceList;
    private $outerSpaceList;*/
    private $employeeId;
    private $employeeInfo;

    /**
    * 公告控制器构造函数
    */
    public function __construct()
    {
        parent::__construct();
        $this->load->model('announce_model', 'announce');
        $this->load->model('app_model', 'app');
        $this->load->model('group_model', 'group');
        $this->load->helper('cache');
        $this->spaceId = QiaterCache::spaceid();
        $this->employeeInfo = QiaterCache::employeeInfo();
        $this->employeeId = QiaterCache::employeeid();
    }

    // summary：打开公告主页面
    // param ：
    // returns：
    public function index()
    {
        $this->appList = $this->app->getAppList($this->spaceId);//应用列表
        $this->groupList = $this->group->getGroupMenu($this->spaceId, $this->employeeId);//群组列表
        $this->load->library('smarty');
        $data['typeid'] = isset($_POST['typeid']) ? $_POST['typeid'] : 0;
        $data['appList'] = $this->appList;
        $data['groupList'] = $this->groupList;
        $data['personalInfo'] = $this->employeeInfo;
        $data['spaceId'] = $this->spaceId;
        $this->smarty->view('employee/announce/index.tpl',$data);
    }

    // summary：打开公告内容页面
    // param ：
    // returns：
    public function detail($type,$announceId)
    {
        $this->appList = $this->app->getAppList($this->spaceId);//应用列表
        $this->groupList = $this->group->getGroupMenu($this->spaceId, $this->employeeId);//群组列表
        /*$this->innerSpaceList = $this->space->getInnerSpaceList($this->employeeId);//内部空间列表
        $this->outerSpaceList = $this->space->getOuterSpaceList($this->employeeId);//外部部空间列表
        $data['innerSpaceList'] = $this->innerSpaceList;
        $data['outerSpaceList'] = $this->outerSpaceList;*/
        $this->load->library('smarty');
        $data['type']=$type;
        $data['announceId']=$announceId;
        $data['appList'] = $this->appList;
        $data['groupList'] = $this->groupList;
        $data['personalInfo'] = $this->employeeInfo;
        $data['spaceId'] = $this->spaceId;
        $this->smarty->view('employee/announce/detail.tpl',$data);
    }

    public function setSessionStorage()
    {
        $type = isset($_POST['type']) ? intval($_POST['type']) : 0;
        echo json_encode($this->announce->getAnnounceOrder($this->spaceId,$type));
    }

    // summary：获取公告分类
    // param ：
    // returns：
    public function getAnnounceType()
    {
        echo json_encode($this->announce->getAnnounceType($this->spaceId));
    }

    public function setHead()
    {
        $head = isset($_POST['head']) ? $_POST['head'] : true;
        if($head)
        {
            $data['head'][0]['name']='title';
            $data['head'][0]['title']='标题';
            $data['head'][0]['isSort']=false;
            $data['head'][0]['sort']='asc';
            $data['head'][0]['css']='w4';

            $data['head'][1]['name']='rccount';
            $data['head'][1]['title']='阅读/评论';
            $data['head'][1]['isSort']=false;
            $data['head'][1]['sort']='asc';
            $data['head'][1]['css']='w2';

            $data['head'][2]['name']='creator,';
            $data['head'][2]['title']='发布人';
            $data['head'][2]['isSort']=false;
            $data['head'][2]['sort']='asc';
            $data['head'][2]['css']='w2';

            $data['head'][3]['name']='updatetime';
            $data['head'][3]['title']='发布时间';
            $data['head'][3]['isSort']=false;
            $data['head'][3]['sort']='asc';
            $data['head'][3]['css']='w2';
        }
        echo json_encode($data);
    }

    // summary：按公告分类获取记录
    // param ：
    // returns：json:总记录数，当前页记录
    public function getAnnounceListByType()
    {
        //每页显示记录数
        $pageSize = isset($_GET['per']) ? intval($_GET['per']) : 10;
        //是否获取总数
        $total = isset($_GET['total']) ? $_GET['total'] : false;
        //当前页数
        $currentPage =  isset($_GET['p']) ? intval($_GET['p']) : 1;
        //当前公告类型
        $type = isset($_GET['announceType']) ? intval($_GET['announceType']) : 0;

        echo json_encode($this->announce->getAnnounceList($this->spaceId,$type,$pageSize,$currentPage,$total));
    }

    // summary：获取公告内容
    // param ：
    // returns：json:总记录数，记录明细
    public function getAnnounceContent()
    {
        $id=isset($_POST['announceId']) ? $_POST['announceId'] : 37;
        echo $this->announce->getAnnounceContent($this->spaceId,$id);
    }

    /*public  function getPrevAndNext($type,$curId)
    {
        $data = [];
        //加载缓存
        $this->load->library('session');
        //从缓存获得空间ID
        $spaceId = $this->session->get('spaceid');
        //加载数据连接
        $this->load->database('default');
        //获取分类按空间
        if($type=='all')
        {
            $strSql='SET @row:=0';
            $this->db->query($strSql);
            $strSql='CREATE TEMPORARY TABLE tmp_anctable SELECT @row:=@row+1 as rownum,id,typeid from tb_announce WHERE spaceid=? ORDER BY sortvalue DESC,updatetime DESC';
            $this->db->query($strSql,array($spaceId));
            $strSql='SET @row:=0';
            $this->db->query($strSql);
            $strSql='CREATE TEMPORARY TABLE tmp_anctable2 SELECT @row:=@row+1 as row,id,typeid from tb_announce WHERE spaceid=? ORDER BY sortvalue DESC,updatetime DESC';
            $this->db->query($strSql,array($spaceId));
        }
        else
        {
            $strSql='SET @row:=0';
            $this->db->query($strSql);
            $strSql='CREATE TEMPORARY TABLE tmp_anctable SELECT @row:=@row+1 as rownum,id,typeid from tb_announce WHERE spaceid=? and typeid=? ORDER BY sortvalue DESC,updatetime DESC';
            $this->db->query($strSql,array($spaceId,$type));
            $strSql='SET @row:=0';
            $this->db->query($strSql);
            $strSql='CREATE TEMPORARY TABLE tmp_anctable2 SELECT @row:=@row+1 as row,id,typeid from tb_announce WHERE spaceid=? and typeid=? ORDER BY sortvalue DESC,updatetime DESC';
            $this->db->query($strSql,array($spaceId,$type));
        }
        $strSql='SELECT id FROM tmp_anctable2 WHERE row=(SELECT a.rownum-1 FROM tmp_anctable as a WHERE a.id=?)';
        $query = $this->db->query($strSql,array($curId));
        if ($query->num_rows() > 0)
        {
            $row = $query->row();
            $data['prev']=$row->id;
        }
        else
        {
            $data['prev']=0;
        }
        $strSql='SELECT id FROM tmp_anctable2 WHERE row=(SELECT a.rownum+1 FROM tmp_anctable as a WHERE a.id=?)';
        $query = $this->db->query($strSql,array($curId));
        if ($query->num_rows() > 0)
        {
            $row = $query->row();
            $data['next']=$row->id;
        }
        else
        {
            $data['next']=0;
        }
        $strSql='DROP TABLE tmp_anctable';
        $this->db->query($strSql);
        $strSql='DROP TABLE tmp_anctable2';
        $this->db->query($strSql);
        return $data;
    }*/

    /*// summary：按获取所有记录
    // param ：
    // returns：json:总记录数，当前页记录
    public function getAnnounceList()
    {
        $data = [];
        $data['rs']=true;
        $data['error']='';
        //每页显示记录数
        $pageSize = empty($_GET['per']) ? 20 : (int)$_GET['per'];
        $total = isset($_GET['total']) ? $_GET['total'] : false;
        $head = isset($_GET['head']) ? $_GET['head'] : false;
        //当前页数
        $currentPage = empty($_GET['p']) ? 1 : (int)$_GET['p'];
        //加载缓存
        $this->load->library('session');
        //从缓存获得空间ID
        $spaceId = $this->session->get('spaceid');
        //加载数据连接
        $this->load->database('default');

        //获取当前页的记录
        $strSql = 'SELECT a.id,a.title,t.`name` AS type,CONCAT(a.readnum,"/",a.commentnum) AS rccount,e.`name` AS creator,a.updatetime '
                       .'FROM tb_announce AS a LEFT JOIN tb_announce_type AS t on a.typeid=t.id '
                       .'LEFT JOIN tb_employee AS e ON a.creatorid=e.id '
                       .'WHERE a.spaceid=? AND a.`status`=1 '
                       .'ORDER BY a.sortvalue DESC,a.updatetime DESC '
                       .'LIMIT ? OFFSET ? ';
        $query = $this->db->query($strSql,array($spaceId,$pageSize,($currentPage-1)*$pageSize));

        $table = $query->result();
        $i=0;
        foreach($table as $row)
        {
            $str=$row->title;
            if(strlen($row->title)>60)
            {
                $str=$this->utf_substr($row->title,60).'...';
            }
            $data['data']['table'][$i][0]='<a title="'.$row->title.'" accid="'.$row->id.'" style="color: #0178b3;">'.$str.'</a>';
            $data['data']['table'][$i][1]='<a title="'.$row->type.'" style="color: #767676;">'.$row->type.'</a>';
            $data['data']['table'][$i][2]=$row->rccount;
            $data['data']['table'][$i][3]='<a title="'.$row->creator.'" accid="'.$row->id.'" style="color: #0178b3;">'.$row->creator.'</a>';
            $data['data']['table'][$i][4]=$row->updatetime;
            $i++;
        }
        $query->free_result();

        if($head)
        {
            $data['data']['head'][0]['name']='title';
            $data['data']['head'][0]['title']='标题';
            $data['data']['head'][0]['isSort']=false;
            $data['data']['head'][0]['sort']='asc';
            $data['data']['head'][0]['css']='w4';

            $data['data']['head'][1]['name']='type';
            $data['data']['head'][1]['title']='分类';
            $data['data']['head'][1]['isSort']=false;
            $data['data']['head'][1]['sort']='asc';
            $data['data']['head'][1]['css']='w1';

            $data['data']['head'][2]['name']='rccount';
            $data['data']['head'][2]['title']='阅读/评论';
            $data['data']['head'][2]['isSort']=false;
            $data['data']['head'][2]['sort']='asc';
            $data['data']['head'][2]['css']='w15';

            $data['data']['head'][3]['name']='creator,';
            $data['data']['head'][3]['title']='发布人';
            $data['data']['head'][3]['isSort']=false;
            $data['data']['head'][3]['sort']='asc';
            $data['data']['head'][3]['css']='w15';

            $data['data']['head'][4]['name']='updatetime';
            $data['data']['head'][4]['title']='发布时间';
            $data['data']['head'][4]['isSort']=false;
            $data['data']['head'][4]['sort']='asc';
            $data['data']['head'][4]['css']='w2';
        }

        if($total)
        {
            //获取某空间所有正常的发布记录
            $strSql = 'SELECT  COUNT(id) as pageCount FROM tb_announce WHERE spaceid=? AND `status`=1';
            $query = $this->db->query($strSql,array($spaceId));
            $data['data']['total'] = $query->row()->pageCount;
            $query->free_result();
        }
        $data['type']='table';

        echo json_encode($data);
    }*/
}