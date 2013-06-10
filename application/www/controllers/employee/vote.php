<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: Yuanjinga
 * Date: 13-4-7
 * Time: 上午10:26
 * To change this template use File | Settings | File Templates.
 */

class Vote extends CI_Controller {
    private $spaceId;
    private $employeeId;
    public static $optionColor = array(
        'tp_cor_01',
        'tp_cor_02',
        'tp_cor_03',
        'tp_cor_04',
        'tp_cor_05',
        'tp_cor_06',
        'tp_cor_07',
        'tp_cor_08',
        'tp_cor_09',
        'tp_cor_10',
        'tp_cor_11',
        'tp_cor_12',
        'tp_cor_13',
        'tp_cor_14',
        'tp_cor_15',
        'tp_cor_16',
        'tp_cor_17',
        'tp_cor_18',
        'tp_cor_19',
        'tp_cor_20',
        'tp_cor_21',
        'tp_cor_22',
        'tp_cor_23',
        'tp_cor_24',
        'tp_cor_25',
        'tp_cor_26',
    );

    public function __construct(){
        parent::__construct();
        $this->load->library('session');
        //从缓存获得空间ID
        $this->spaceId = 2;// $this->session->userdata('spaceid');
        //$this->spaceName = '畅捷通'; // $this->session->userdata('spacename');
        $this->employeeId = 2; // $this->session->userdata('employeeid');
    }
    // summary：打开公告主页面
    // param ：
    // returns：
    public function index()
    {
        //加载缓存
        $spaceName = '畅捷通'; // $this->session->userdata('spacename');
        $this->load->database('default');
        // 获取投票列表
        $strSql = 'SELECT v.*,e.name,r.url,g.name gname from tb_vote v LEFT JOIN tb_employee e ON v.creatorid=e.id '
                 .' LEFT JOIN tb_resource r ON e.imageid=r.id '
                 .' LEFT JOIN tb_group g ON v.groupid=g.id WHERE v.spaceid=? ORDER BY v.createtime DESC,v.totalvotenum DESC';
        $query = $this->db->query($strSql,array($this->spaceId));
        $count = $query->num_rows();
        $votes = $query->result('array');
        $ids = $voteList = array();
        if($count > 0){
            foreach($votes as $key => $row){
                $row['opt_color'] = self::$optionColor;
                $row['isover'] = ($row['endtime'] < time() && $row['endtime'] > 0)? 1 : 0 ;
                $row['timeleft'] = $row['endtime'] == 0 ? -2 : ceil(($row['endtime'] - time())/3600) - 1;
                if ($row['timeleft'] >= 0) {
                    $leftTime = $row['endtime'] - time();
                    if ($leftTime > 3600) {
                        $row['timeleftStr'] = (ceil(($row['endtime'] - time())/3600) - 1) . '小时';
                    } else {
                        $row['timeleftStr'] = ceil(($row['endtime'] - time())/60) . '分钟';
                    }
                }
                $ids[] = $row['id'];
                $voteList[$row['id']] = $row;
            }
            // 获取投票选项列表
            $voteIds = implode(',', $ids);
            $strSql = 'SELECT * FROM tb_vote_options WHERE voteid IN('.$voteIds.') ORDER BY id';
            $query = $this->db->query($strSql, array());
            $table = $query->result('array');
            foreach($table as $row){
                $voteList[$row['voteid']]['option'][] = $row;
            }
            // 获取用户投票角色
            $strSql = 'SELECT * FROM tb_vote_user WHERE voteid IN(?) AND employeeid=?';
            $query = $this->db->query($strSql, array(implode(',', $ids), $this->employeeId));
            $table = $query->result('array');
            foreach($table as $row){
                $role = $row['role'] == 1 ? 'iscreator' : 'isjoiner';
                $voteList[$row['voteid']][$role] = 1;
            }
            // TODO:获取回复数量

        }
        $data = array('spaceName' => $spaceName);
        $data['voteList'] = $voteList;
        $this->load->model('vote_model', 'vote');
        //发起榜单
        $data['creatList'] = $this->vote->getCreaterList($this->spaceId);
        //参与榜单
        $data['actorList'] = $this->vote->getJoinList($this->spaceId);
        //猜你喜欢
        $data['thinkList'] = $this->vote->getLikeList($this->spaceId, $this->employeeId);
        // 左侧菜单
        $data['appList'] = array();
        $this->load->library('smarty');
        $this->smarty->view('employee/vote/index.tpl',$data);
    }

    public function create(){
        $this->load->model('vote_model', 'vote');
        //发起榜单
        $data['creatList'] = $this->vote->getCreaterList($this->spaceId);
        //参与榜单
        $data['actorList'] = $this->vote->getJoinList($this->spaceId);
        //猜你喜欢
        $data['thinkList'] = $this->vote->getLikeList($this->spaceId, $this->employeeId);
        $this->load->model('common_model', 'common');
        $data['hours'] = $this->common->buildHours();
        $data['appList'] = array();
        $this->load->library('smarty');
        $this->smarty->view('employee/vote/create.tpl',$data);
    }

    public function save(){
        $is_refer = empty($_POST['is_refer']) ? 0 : $_POST['is_refer'];
        $isajax = isset($_REQUEST['ajaxsubmit']) ? 1 : 0;

        //获取传入的参数
        if (isset($_POST['pic_vote_title'])) {
            $type = 1;
            $setarr = $this->_getPicVoteParam();
            $noticeArr = isset($_POST['pic_notice_div_n_value']) ? $_POST['pic_notice_div_n_value'] : array();
        } else {
            $type = 0;
            $setarr = $this->_getWordVoteParam();
            $noticeArr = isset($_POST['notice_div_n_value']) ? $_POST['notice_div_n_value'] : array();
        }
        $setarr ['group_id'] = empty($_POST['groupid']) ? 0 : intval($_POST['groupid']);
        $setarr ['qz_id'] = $this->spaceId;
        $setarr ['member_id'] = $this->employeeId;
        //投票的选项
        $options = $setarr['option'];
        unset($setarr['option']);
        //附件id
        if (!empty($_POST['fids'])) {
            $isHasFile = 1;
            $fids = explode(',', $_POST['fids']);
            $fileIds = array_map('intval', $fids);
        } else {
            $isHasFile = 0;
            $fileIds = array();
        }
        //添加投票
        $this->load->model('vote_model', 'vote');
        $voteId = $this->vote->addVote($options, $this->spaceId, $setarr['group_id'], $this->employeeId,
                                    $setarr['title'], $setarr['vote_des'], $type,$isHasFile, $setarr['is_checkbox'],
                                    $setarr['end_time'], $fileIds);
        if ($voteId) {
            // 要通知的人
            if ($noticeArr) {
                foreach ($noticeArr as $employeeId) {
                    // todo 发送通知

                    // 添加通知人
                    $this->db->query('INSERT INTO tb_vote_user (voteid,employeeid,role,votetime,optionids,status) VALUES (?,?,1,0,0,0)',
                        array($voteId, $employeeId, 3, 0, 0, 0));
                }
            }
            //todo 添加话题

        }
        $this->load->model('common_model', 'common');
        $this->common->redirect('employee/vote/index.html');
    }

    public function voteOption(){

    }
    /*
     * 获取投票列表
     */
    public function getVoteList(){

    }

    //获取图片投票的参数
    private function _getPicVoteParam()
    {
        $data = array('type' => 1);
        if (!empty($_POST['pic_vote_title'])) {
            $data['title'] = addslashes(trim($_POST['pic_vote_title']));
        } else {
            //返回ajax错误提示
            $this->_ajaxRs (false, '', '投票的标题不能为空');
            exit;
        }
        $data['vote_des'] = empty($_POST['pic_vote_des']) ? '' : addslashes(mb_substr(trim($_POST['pic_vote_des']),0,60,'utf-8'));
        $data['is_checkbox'] = empty($_POST['pic_is_checkbox']) ? 0 : intval($_POST['pic_is_checkbox']);
        //获取投票的选项
        $pic_vote_images = is_array($_POST['pic_vote_image']) ? $_POST['pic_vote_image'] : array();
        $pic_vote_fids = is_array($_POST['pic_vote_fid']) ? $_POST['pic_vote_fid'] : array();
        $data['option'] = array();
        foreach ($pic_vote_images as $key => $value) {
            if (!empty($value)) {
                $data['option'][$key]['image'] = addslashes(trim($value));
                $data['option'][$key]['image_id'] = $pic_vote_fids[$key];
            }
        }
        if (count($data['option']) < 2) {
            //输出错误
            $this->_ajaxRs (false, '', '投票的选项不能少于2个');
        }
        if ($data['is_checkbox'] > 0 && $data['is_checkbox'] > count($data['option'])) {
            $data['is_checkbox'] = count($data['option']);
        }
        //获取投票选项的说明和调整地址
        $pic_vote_image_deses = is_array($_POST['pic_vote_image_des']) ? $_POST['pic_vote_image_des'] : array();
        $pic_vote_image_links = is_array($_POST['pic_vote_image_link']) ? $_POST['pic_vote_image_link'] : array();
        $optionKeys = array_keys($data['option']);
        foreach ($optionKeys as $value) {
            if (!empty($pic_vote_image_deses[$value])) {
                $data['option'][$value]['option_value'] = addslashes(trim($pic_vote_image_deses[$value]));
            }
            if (!empty($pic_vote_image_links[$value])) {
                $pic_vote_image_links[$value] = trim($pic_vote_image_links[$value]);
                if (substr_compare($pic_vote_image_links[$value], 'http://', 0, 7, true) !== 0) {
                    $pic_vote_image_links[$value] = 'http://' . $pic_vote_image_links[$value];
                }
                $data['option'][$value]['image_link'] = addslashes($pic_vote_image_links[$value]);
            }
        }

        $data['created'] = time();

        //获取投票的截止时间
        if (empty($_POST['pic_limit_time'])) {
            if (empty($_POST['pic_end_date'])) {
                $data['end_time'] = 0;
            } else {
                $end_hour = empty($_POST['pic_end_hour']) ? '' : intval($_POST['pic_end_hour']);
                if ($end_hour >= 24) {
                    $end_hour = '23:59:59';
                } elseif ($end_hour < 0) {
                    $end_hour = '00:00:00';
                } else {
                    $end_hour .= ':00:00';
                }
                //$data['end_time'] = strtotime($_POST['pic_end_date'] . ' ' . $end_hour);
                $data['end_time'] = $_POST['end_date'] . ' ' . $end_hour;
                if (!$data['end_time']) {
                    $this->_ajaxRs (false, '', '输入的日期格式有误');
                } elseif ($data['end_time'] < $data['created']) {
                    $this->_ajaxRs (false, '', '截止时间不能小于当前时间');
                }
            }
        } else {
            $data['end_time'] = 0;
        }

        return $data;
    }

    //获取文字投票的参数
    private function _getWordVoteParam()
    {
        $data = array('type' => 0);
        if (!empty($_POST['title'])) {
            $data['title'] = addslashes(trim($_POST['title']));
        } else {
            //$this->_ajaxRs (false, '', '投票的标题不能为空');
        }
        $data['vote_des'] = empty($_POST['word_vote_des']) ? '' : addslashes(mb_substr(trim($_POST['word_vote_des']),0,60,'utf-8'));
        $option = is_array($_POST['option']) ? $_POST['option'] : array();
        $option = array_map('trim', $option);
        foreach ($option as $key => $value) {
            if ($value !== '') {
                $option[$key] = array('option_value' => addslashes($value), 'image_link' => '', 'image_id' => 0, 'image' => '');
            } else {
                unset($option[$key]);
            }
        }
        if (count($option) < 2) {
            $this->_ajaxRs (false, '', '投票的选项不能少于2个');
        }
        $data['option'] = $option;
        $data['is_checkbox'] = intval($_POST['is_checkbox']);
        if ($data['is_checkbox'] > 1) {
            if ($data['is_checkbox'] > count($option)) {
                $data['is_checkbox'] = count($option);
            }
        } else {
            $data['is_checkbox'] = 1;
        }
        $data['created'] = time();
        if (empty($_POST['limit_time'])) {
            if (empty($_POST['end_date'])) {
                $data['end_time'] = 0;
            } else {
                $end_hour = empty($_POST['end_hour']) ? '' : intval($_POST['end_hour']);
                if ($end_hour >= 24) {
                    $end_hour = '23:59:59';
                } elseif ($end_hour < 0) {
                    $end_hour = '00:00:00';
                } else {
                    $end_hour .= ':00:00';
                }
                //$data['end_time'] = strtotime($_POST['end_date'] . ' ' . $end_hour);
                $data['end_time'] = $_POST['end_date'] . ' ' . $end_hour;
                if (!$data['end_time']) {
                    //输入的日期错误提示
                    $this->_ajaxRs (false, '', '输入的日期格式有误');
                } elseif ($data['end_time'] < $data['created']) {
                    $this->_ajaxRs (false, '', '截止时间不能小于当前时间');
                }
            }
        } else {
            $data['end_time'] = 0;
        }

        return $data;
    }
}