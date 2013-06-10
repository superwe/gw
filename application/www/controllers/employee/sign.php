<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: ZhaiYanBin
 * Date: 13-4-18
 * Time: 下午7:48
 * To change this template use File | Settings | File Templates.
 */
class Sign extends CI_Controller {

    public function __construct(){
        parent::__construct();
        $this->load->helper('cache');
        $this->spaceId = QiaterCache::spaceid();//空间ID
        $this->employeeId = QiaterCache::employeeid();//用户ID
        $this->employeeInfo = QiaterCache::employeeInfo();
        $this->employeeName = $this->employeeInfo['name'];//用户名
        $this->load->library('smarty');
        $this->input->get_post(NULL, TRUE);
    }

    /**
     * 签到首页
     */
    public function index(){
        $this->load->model('Sign_model', 'signM');
        $hasTask = $this->signM->getTaskNumByEmployeeId($this->employeeId, 0, 1);
        $this->smarty->assign('hasTask', $hasTask);
        $this->smarty->view('employee/sign/index.tpl');
    }

    /**
     * 我的签到
     */
    public function mySign(){
        $this->load->model('Sign_model', 'signM');
        $hasTask = $this->signM->getTaskNumByEmployeeId($this->employeeId, 0, 1);
        $this->smarty->assign('hasTask', $hasTask);
        $this->smarty->view('employee/sign/mySign.tpl');
    }

    /**
     * 定时任务列表
     */
    public function taskList(){
        $this->load->model('Sign_model', 'signM');
        $hasTask = $this->signM->getTaskNumByEmployeeId($this->employeeId, 0, 1);
        $this->smarty->assign('hasTask', $hasTask);
        $this->smarty->view('employee/sign/taskList.tpl');
    }

    /**
     * 定时任务详情页
     */
    public function taskInfo(){
        $tid = isset($_GET['tid']) ? intval($_GET['tid']) : 0;//定时任务ID
        $this->load->model('Sign_model', 'signM');
        $info = $this->signM->getTaskInfo($tid, $this->spaceId);
        if(!$info){
            header('Location: /employee/sign/index');
        }
        $status = $this->signM->getEmployeeStatus($tid, $this->employeeId);
        if(!$status){
            header('Location: /employee/sign/index');
        }
        $this->smarty->assign('taskInfo', $info);
        $this->smarty->view('employee/sign/taskInfo.tpl');
    }

    /**
     * 查看分享人的签到
     */
    public function shareSignList(){
        $this->load->model('Sign_model', 'signM');
        $hasTask = $this->signM->getTaskNumByEmployeeId($this->employeeId, 0, 1);
        $this->smarty->assign('hasTask', $hasTask);
        $this->smarty->view('employee/sign/shareSignList.tpl');
    }

    /**
     * 添加分享人
     */
    public function ajaxAddShare(){
        $ids = isset($_GET['ids']) ? trim($_GET['ids']) : '';
        $ids = $ids ? array_map('intval', explode(',', $ids)) : array();
        if($ids){
            $lists = array();
            $this->load->model('Sign_model', 'signM');
            $temp = $this->signM->shareList($this->employeeId, 1, 'toid');//获取我共享的人员IDs
            foreach($temp as $v){
                 array_push($lists, $v['toid']);
            }
            $result = array_diff($ids, $lists);//取出差集
            foreach($result as $v){
                $this->signM->addShare($this->employeeId, $v, 0);
            }
        }
        echo json_encode('ok');
        exit();
    }

    /**
     * 搜索结果页面
     */
    public function searchResult(){
        $info = array();
        $keys = array('tid', 'start_date', 'start_time', 'end_date', 'end_time', 'province', 'city', 'allSign', 'allHandSign', 'allTask', 'tids', 'type');
        foreach($_POST as $k => $v){
            if(in_array($k, $keys)){
                $info[$k] = $v;
            }
        }
        $this->smarty->assign('param', json_encode($info));
        $this->smarty->view('employee/sign/searchResult.tpl');
    }

    /**
     * 导出EXCEL
     */
    public function exportExcel(){
        $lists = array();
        $outputFileName = "签到记录表.xls";
        $tid = isset($_GET['tid']) ? intval($_GET['tid']) : 0;//定时任务ID
        $share = isset($_GET['share']) ? intval($_GET['share']) : 0;//分享人的签到
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';//搜索条件

        $this->load->model('Sign_model', 'signM');
        if($search){//根据高级搜索导出
            $search = @json_decode($search, true);
            $returnData = $this->cleanUpDataForSearchResult($search, 1);
            $lists = $returnData['list'];
        } elseif($tid){//定时任务
            $where = $this->makeData($_REQUEST);
            if(!$where){
                header('Location: /employee/sign/index');
            }
            $whereStr = implode(' AND ', $where);
            $sql = "SELECT EM.`name`,S.province,S.city,S.address,S.signtime,S.clienttype,S.remark FROM tb_sign AS S INNER JOIN tb_employee AS EM ON EM.id=S.creatorid WHERE " . $whereStr . ' ORDER BY S.id DESC';
            $query = $this->db->query($sql);
            $lists = $query->result_array();
        } elseif($share == 1){//分享人的签到
            $sql = "SELECT EM.`name`,S.province,S.city,S.address,S.signtime,S.clienttype,S.remark FROM tb_sign AS S INNER JOIN tb_sign_share AS SS ON SS.fromid=S.creatorid INNER JOIN tb_employee AS EM ON EM.id=SS.fromid WHERE S.signtype=1 AND SS.toid={$this->employeeId} ORDER BY S.id DESC";
            $query = $this->db->query($sql);
            $lists = $query->result_array();
        } else{//全部定时任务签到
            $sql = "SELECT EM.`name`,S.province,S.city,S.address,S.signtime,S.clienttype,S.remark FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON SU.signtaskid=S.signtypeid INNER JOIN tb_employee AS EM ON EM.id=S.creatorid WHERE S.signtype=2 AND SU.usertype=1 AND S.creatorid={$this->employeeId} AND SU.employeeid={$this->employeeId}";//我参与的定时任务的签到【只能看到我自己的】
            $sql .= " UNION ";
            $sql .= "SELECT EM.`name`,S.province,S.city,S.address,S.signtime,S.clienttype,S.remark FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON SU.signtaskid=S.signtypeid INNER JOIN tb_employee AS EM ON EM.id=S.creatorid WHERE S.signtype=2 AND SU.usertype=2 AND SU.employeeid={$this->employeeId}";//查看权限的定时任务签到【所有此任务的签到记录】
            $query = $this->db->query($sql);
            $lists = $query->result_array();
        }

        $this->load->library('phpexcel');
        $objWriter = PHPExcel_IOFactory::createWriter($this->phpexcel, 'Excel5');
        $this->phpexcel->setActiveSheetIndex(0);
        $objActSheet = $this->phpexcel->getActiveSheet();
        $objActSheet->setCellValue('A1', '成员姓名');
        $objActSheet->setCellValue('B1', '签到时间');
        $objActSheet->setCellValue('C1', '签到省份');
        $objActSheet->setCellValue('D1', '签到城市');
        $objActSheet->setCellValue('E1', '签到地址');
        $objActSheet->setCellValue('F1', '备注信息');
        $objActSheet->setCellValue('G1', '签到来源');
        foreach($lists as $k => $v){
            $k += 2;
            $objActSheet->setCellValue('A'.$k, $v['name']);
            $objActSheet->setCellValue('B'.$k, $v['signtime']);
            $objActSheet->setCellValue('C'.$k, $v['province']);
            $objActSheet->setCellValue('D'.$k, $v['city']);
            $objActSheet->setCellValue('E'.$k, $v['address']);
            $objActSheet->setCellValue('F'.$k, $v['remark']);
            switch($v['clienttype']){
                case 1:
                    $objActSheet->setCellValue('G'.$k, 'IPhone客户端');
                    break;
                case 2:
                    $objActSheet->setCellValue('G'.$k, 'Android客户端');
                    break;
                case 3:
                    $objActSheet->setCellValue('G'.$k, 'WP客户端');
                    break;
                case 4:
                    $objActSheet->setCellValue('G'.$k, '桌面端');
                    break;
                default:
                    $objActSheet->setCellValue('G'.$k, 'Web客户端');
                    break;
            }
        }
        header("Content-Type: application/force-download");
        header("Content-Type: application/octet-stream");
        header("Content-Type: application/download");
        header('Content-Disposition:inline;filename="'.$outputFileName.'"');
        header("Content-Transfer-Encoding: binary");
        header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
        header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
        header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
        header("Pragma: no-cache");
        $objWriter->save('php://output');
        exit();
    }

    /**
     * 分享人弹出框
     */
    public function ajaxShare(){
        $this->load->model('Sign_model', 'signM');
        $lists['fromMe'] = $this->signM->shareList($this->employeeId, 1);//我的共享
        $lists['toMe'] = $this->signM->shareList($this->employeeId, 2);//共享给我
        //print_r($lists);
        $this->load->library('smarty');
        $this->smarty->assign('lists', $lists);
        $this->smarty->view('employee/sign/ajaxShare.tpl');
    }

    /**
     * 添加分享人
     */
    public function ajaxAddShareEmployee(){
        //
    }

    /**
     * 高级搜索弹出框
     */
    public function ajaxSearchSignBox(){
        $weekArray = array("日","一","二","三","四","五","六");
        $info = array(
            'start' => $weekArray[date("w")],
            'end' => $weekArray[date("w", time() + 86400)],
            'type' => isset($_GET['type']) ? $_GET['type'] : 'index'
        );
        //判断此用户是否有定时任务
        $this->load->model('Sign_model', 'signM');
        $info['status'] = $this->signM->getTaskNumByEmployeeId($this->employeeId, 0, 1);
        $this->smarty->assign('info', $info);
        $this->smarty->view('employee/sign/ajaxSearchSignBox.tpl');
    }

    /**
     * 定时任务弹出框
     */
    public function ajaxSearchTaskBox(){
        $weekArray = array("日","一","二","三","四","五","六");
        $info = array(
            'start' => $weekArray[date("w")],
            'end' => $weekArray[date("w", time() + 86400)],
            'tid' => isset($_GET['tid']) ? intval($_GET['tid']) : 0
        );
        $this->smarty->assign('info', $info);
        $this->smarty->view('employee/sign/ajaxSearchTaskBox.tpl');
    }

    /**
     * 获取定时任务列表
     */
    public function ajaxGetTaskList(){
        $this->load->database('default');
        $query = $this->db->query("SELECT ST.id,ST.title FROM tb_sign_task AS ST INNER JOIN tb_sign_user AS SU ON ST.id=SU.signtaskid WHERE SU.employeeid=?", array($this->employeeId));
        $list = $query->result_array();
        if($list){
            echo json_encode($list);
        }
        exit();
    }

    /**
     * 搜索结果左侧列表
     */
    public function ajaxGetSearchResultLeftList(){
        $returnData = $this->cleanUpDataForSearchResult($_REQUEST, 0);
        if($returnData){
            echo json_encode($returnData);
        }
        exit();
    }

    /**
     * 搜索结果右侧列表
     */
    public function ajaxGetSearchResultRightList(){
        $returnData = $this->cleanUpDataForSearchResult($_REQUEST, 1);
        if($returnData){
            echo json_encode($returnData);
        }
        exit();
    }

    /**
     * 搜索结果页整理数据
     */
    public function cleanUpDataForSearchResult($request, $flag){
        $whereStr = '';
        $where = array();
        $limit = (isset($_GET['num']) && intval($_GET['num']) > 0 ) ? intval($_GET['num']) : 15;//分页
        $page = (isset($_GET['p']) && intval($_GET['p']) > 0) ? $_GET['p'] : 0;//偏移量
        $offset = $page ? ($page-1) * $limit : 0;

        $startDate = isset($request['start_date']) ? trim($request['start_date']) : '';//开始日期
        $startTime = isset($request['start_time']) ? trim($request['start_time']) : '';//开始时间
        $endDate = isset($request['end_date']) ? trim($request['end_date']) : '';//结束时间
        $endTime = isset($request['end_time']) ? trim($request['end_time']) : '';//结束时间
        $province = isset($request['province']) ? trim($request['province']) : '';//省份
        $city = isset($request['city']) ? trim($request['city']) : '';//城市

        $startDate ? $where['signtime>='] = $startDate." ".$startTime : '';
        $endDate ? $where['signtime<='] = $endDate." ".$endTime : '';
        $province && $province != -1 ? $where['province='] = $province : '';
        $city && $city != -1 ? $where['city='] = $city : '';

        if(isset($request['type'])){
            $allSign = isset($request['allSign']) ? intval($request['allSign']) : 0;//全部签到
            $allHandSign = isset($request['allHandSign']) ? intval($request['allHandSign']) : 0;//手动签到
            $allTask = isset($request['allTask']) ? intval($request['allTask']) : 0;//全部定时任务
            $tids = isset($request['tids']) ? array_map('intval', $request['tids']) : array();//指定的定时任务
            $tids = $tids ? implode(',', $tids) : '';
            if($request['type'] == 'mySign'){
                $where['creatorid='] = $this->employeeId;
            }
            if(!$allHandSign && !$allTask && !$tids){
                $allSign = 1;
            }
            foreach($where as $k => $v){
                $whereStr .= ' AND S.' . $k . "'{$v}'";
            }

            $this->load->model('Sign_model', 'signM');

            if($allSign == 1){
                $tids = null;
                $allHandSign = $allTask = 1;
                if($flag){//右侧单条
                    $sql['total'][] = "SELECT * FROM (SELECT COUNT(1) AS num FROM tb_sign AS S WHERE S.signtype=0" . $whereStr . ") AS TEMP";
                    $sql['list'][] = "SELECT * FROM (SELECT S.creatorid,S.province,S.city,S.address,S.clienttype,S.signtime,S.remark FROM tb_sign AS S WHERE S.signtype=0" . $whereStr . (($limit || $offset) ? " LIMIT {$limit} OFFSET {$offset}" : '') . ") AS TEMP";
                } else{
                    $sql['total'][] = "SELECT * FROM (SELECT COUNT(1) AS num, S.creatorid FROM tb_sign AS S WHERE S.signtype=0 " . $whereStr . " GROUP BY S.creatorid) AS TEMP0";
                    $sql['list'][] = "SELECT * FROM (SELECT COUNT(1) AS num, S.creatorid FROM tb_sign AS S WHERE S.signtype=0 " . $whereStr . " GROUP BY S.creatorid" . (($limit || $offset) ? " LIMIT {$limit} OFFSET {$offset}" : '') . ") AS TEMP0";
                }
            }
            if($allTask == 1){//有权限看到的定时任务，如果当前用户为参与人则只能看到自己的，为查看人看到全部此定时任务的签到
                $tids = null;
                if($flag){//右侧单条
                    $sql['total'][] = "(SELECT * FROM (SELECT COUNT(1) AS num FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid=SU.signtaskid WHERE S.creatorid={$this->employeeId} AND S.signtype=2 AND SU.usertype=1 " . $whereStr . " AND SU.employeeid={$this->employeeId}) AS TEMP) UNION (SELECT * FROM (SELECT COUNT(1) AS num FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid=SU.signtaskid WHERE S.signtype=2 AND SU.usertype=2 " . $whereStr . " AND SU.employeeid={$this->employeeId}) AS TEMP)";//自己参与的定时任务签到和自己有查看权限的定时任务签到
                    $sql['list'][] = "(SELECT * FROM (SELECT S.creatorid,S.province,S.city,S.address,S.clienttype,S.signtime,S.remark FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid=SU.signtaskid WHERE S.creatorid={$this->employeeId} AND S.signtype=2 AND SU.usertype=1 " . $whereStr . " AND SU.employeeid={$this->employeeId} " . (($limit || $offset) ? " LIMIT {$limit} OFFSET {$offset}" : '') . ") AS TEMP) UNION (SELECT * FROM (SELECT S.creatorid,S.province,S.city,S.address,S.clienttype,S.signtime,S.remark FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid=SU.signtaskid WHERE S.signtype=2 AND SU.usertype=2 " . $whereStr . " AND SU.employeeid={$this->employeeId} " . (($limit || $offset) ? " LIMIT {$limit} OFFSET {$offset}" : '') . ") AS TEMP)";
                } else{
                    $sql['total'][] = "(SELECT * FROM (SELECT COUNT(1) AS num, S.creatorid FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid = SU.signtaskid WHERE S.creatorid ={$this->employeeId} AND S.signtype = 2 " . $whereStr . " AND SU.usertype = 1 AND SU.employeeid = {$this->employeeId} ) AS TEMP4 ) UNION ( SELECT * FROM ( SELECT COUNT(1) AS num, S.creatorid FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid = SU.signtaskid WHERE S.signtype = 2 AND SU.usertype = 2 " . $whereStr . " AND SU.employeeid = {$this->employeeId} GROUP BY S.creatorid ) AS TEMP5 )";
                    $sql['list'][] = "(SELECT * FROM (SELECT COUNT(1) AS num, S.creatorid FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid = SU.signtaskid WHERE S.creatorid ={$this->employeeId} AND S.signtype = 2 " . $whereStr . " AND SU.usertype = 1 AND SU.employeeid = {$this->employeeId} GROUP BY creatorid " . (($limit || $offset) ? " LIMIT {$limit} OFFSET {$offset}" : '') ." ) AS TEMP4 ) UNION ( SELECT * FROM ( SELECT COUNT(1) AS num, S.creatorid FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid = SU.signtaskid WHERE S.signtype = 2 AND SU.usertype = 2 " . $whereStr . " AND SU.employeeid = {$this->employeeId} GROUP BY S.creatorid " . (($limit || $offset) ? " LIMIT {$limit} OFFSET {$offset}" : '') ." ) AS TEMP5 )";
                }
            }
            if($tids){//选定的定时任务，获取有权限看的定时任务IDs
                if($flag){//右侧单条
                    $sql['total'][] = "(SELECT * FROM (SELECT COUNT(1) AS num FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid=SU.signtaskid WHERE S.creatorid={$this->employeeId} AND S.signtype=2 " . $whereStr . " AND SU.usertype=1 AND SU.employeeid={$this->employeeId} AND SU.signtaskid IN ({$tids})) AS TEMP) UNION (SELECT * FROM (SELECT COUNT(1) AS num FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid=SU.signtaskid WHERE S.signtype=2 " . $whereStr . " AND SU.usertype=2 AND SU.employeeid={$this->employeeId} AND SU.signtaskid IN ({$tids})) AS TEMP)";//自己参与的定时任务签到和自己有查看权限的定时任务签到
                    $sql['list'][] = "(SELECT * FROM (SELECT S.creatorid,S.province,S.city,S.address,S.clienttype,S.signtime,S.remark FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid=SU.signtaskid WHERE S.creatorid={$this->employeeId} AND S.signtype=2 " . $whereStr . " AND SU.usertype=1 AND SU.employeeid={$this->employeeId} AND SU.signtaskid IN ({$tids}) " . (($limit || $offset) ? " LIMIT {$limit} OFFSET {$offset}" : '') . ") AS TEMP) UNION (SELECT * FROM (SELECT S.creatorid,S.province,S.city,S.address,S.clienttype,S.signtime,S.remark FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid=SU.signtaskid WHERE S.signtype=2 " . $whereStr . " AND SU.usertype=2 AND SU.employeeid={$this->employeeId} AND SU.signtaskid IN ({$tids})"  . (($limit || $offset) ? " LIMIT {$limit} OFFSET {$offset}" : '') ." ) AS TEMP)";
                } else{
                    $sql['total'][] = "(SELECT * FROM ( SELECT COUNT(1) AS num, S.creatorid FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid = SU.signtaskid WHERE S.creatorid ={$this->employeeId} AND S.signtype = 2 " . $whereStr . " AND SU.usertype = 1 AND SU.employeeid = {$this->employeeId} AND SU.signtaskid IN ({$tids}) GROUP BY creatorid ) AS TEMP6 ) UNION ( SELECT * FROM ( SELECT COUNT(1) AS num, S.creatorid FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid = SU.signtaskid WHERE S.signtype = 2 " . $whereStr . " AND SU.usertype = 2 AND SU.employeeid = {$this->employeeId} AND SU.signtaskid IN ({$tids}) GROUP BY S.creatorid ) AS TEMP1 )";
                    $sql['list'][] = "(SELECT * FROM ( SELECT COUNT(1) AS num, S.creatorid FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid = SU.signtaskid WHERE S.creatorid ={$this->employeeId} AND S.signtype = 2 " . $whereStr . " AND SU.usertype = 1 AND SU.employeeid = {$this->employeeId} AND SU.signtaskid IN ({$tids}) GROUP BY creatorid " . (($limit || $offset) ? " LIMIT {$limit} OFFSET {$offset}" : '') . ") AS TEMP6 ) UNION ( SELECT * FROM ( SELECT COUNT(1) AS num, S.creatorid FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON S.signtypeid = SU.signtaskid WHERE S.signtype = 2 " . $whereStr . " AND SU.usertype = 2 AND SU.employeeid = {$this->employeeId} AND SU.signtaskid IN ({$tids}) GROUP BY S.creatorid " . (($limit || $offset) ? " LIMIT {$limit} OFFSET {$offset}" : '') . " ) AS TEMP)";
                }
            }
            if($allHandSign == 1){ //手动签到
                if($flag){//右侧单条
                    $sql['total'][] = "(SELECT * FROM (SELECT COUNT(1) AS num FROM tb_sign AS S WHERE S.signtype=1" . $whereStr . ") AS TEMP)";
                    $sql['list'][] = "(SELECT * FROM (SELECT S.creatorid,S.province,S.city,S.address,S.clienttype,S.signtime,S.remark FROM tb_sign AS S WHERE S.signtype=1" . $whereStr . (($limit || $offset) ? " LIMIT {$limit} OFFSET {$offset}" : '') . ") AS TEMP)";
                } else{
                    $sql['total'][] = "SELECT * FROM (SELECT COUNT(1) AS num, S.creatorid FROM tb_sign AS S WHERE S.signtype=1 " . $whereStr . " GROUP BY S.creatorid) AS TEMP8";
                    $sql['list'][] = "SELECT * FROM (SELECT COUNT(1) AS num, S.creatorid FROM tb_sign AS S WHERE S.signtype=1 " . $whereStr . " GROUP BY S.creatorid " . (($limit || $offset) ? " LIMIT {$limit} OFFSET {$offset}" : '')  .") AS TEMP8";
                }
            }
            if($flag == 1){//右侧单条签到
                $sqlTotal = "SELECT SUM(num) AS num FROM ( " . implode(' UNION ', $sql['total']) . " ) AS TEMP3 WHERE num >0";
                $query = $this->db->query($sqlTotal);
                $info['total'] = $query->row()->num;
                $sql = "SELECT TEMP.*,EM.id,EM.name,EM.imageurl FROM ( " . implode(' UNION ', $sql['list']) . " ) AS TEMP INNER JOIN tb_employee AS EM ON TEMP.creatorid=EM.id WHERE EM.id > 0" . (($limit || $offset) ? " LIMIT {$limit} OFFSET {$offset}" : '');
                $query = $this->db->query($sql);
                $info['list'] = $query->result_array();
            } else{
                $sqlTotal = "SELECT SUM(num) AS num,creatorid FROM ( " . implode(' UNION ', $sql['total']) . " ) AS TEMP3 WHERE creatorid > 0 GROUP BY creatorid";
                $query = $this->db->query($sqlTotal);
                $info['total'] = $query->num_rows();//获取总数
                $sql = "SELECT SUM(num) AS num,creatorid,EM.name,EM.imageurl FROM ( " . implode(' UNION ', $sql['list']) . " ) AS TEMP3 INNER JOIN tb_employee AS EM ON creatorid=EM.id WHERE creatorid > 0 GROUP BY creatorid". (($limit || $offset) ? " LIMIT {$limit} OFFSET {$offset}" : '');//获取列表
                $query = $this->db->query($sql);
                $info['list'] = $query->result_array();
            }
        } elseif(isset($request['tid']) && intval($request['tid']) > 0 ){//定时任务页面
            $tid = intval($request['tid']);
            $status = $this->signM->getEmployeeStatus($tid, $this->employeeId);
            if($status){//1-参与人，2-查看人
                $where = array_merge($where, array('signtype=' => 2, 'signtypeid=' => $tid));
                $status == 1 ? $where = array_merge($where, array('creatorid=' => $this->employeeId)) : '';//参与人只能看到自己的
                foreach($where as $k => $v){
                    $whereStr .= ' AND S.' . $k . "'{$v}'";
                }
                if($flag == 1){//右侧单条签到
                    $sql = "SELECT COUNT(1) AS num FROM tb_sign AS S INNER JOIN tb_employee AS EM ON S.creatorid=EM.id WHERE 1" . $whereStr;
                    $query = $this->db->query($sql);
                    $info['total'] = $query->row()->num;
                    $sql = "SELECT S.id,S.creatorid,S.precision,S.latitude,S.province,S.city,S.district,S.address,S.clienttype,S.signtime,S.remark FROM tb_sign AS S INNER JOIN tb_employee AS EM ON S.creatorid=EM.id WHERE 1" . $whereStr;
                    $query = $this->db->query($sql);
                    $info['list'] = $query->result_array();
                } else{//左侧聚合
                    $sql = "SELECT COUNT(1) AS num FROM tb_sign AS S WHERE 1" . $whereStr . " GROUP BY S.creatorid";
                    $query = $this->db->query($sql);
                    $info['total'] = $query->num_rows();
                    //$sqlList = "SELECT EM.id,EM.name,EM.imageurl,S.address,S.signtime,S.clienttype FROM tb_sign AS S INNER JOIN tb_employee AS EM ON S.creatorid=EM.id WHERE 1" . $whereStr;
                    $sql = "SELECT COUNT(1) AS num, S.creatorid FROM tb_sign AS S WHERE 1" . $whereStr . ' GROUP BY S.creatorid';
                    $query = $this->db->query($sql);
                    $info['list'] = $query->result_array();
                }
            }
        }
        if(!$flag && $info['list']){
            foreach($info['list'] as $k => $v){
                $query = $this->db->query("SELECT address,signtime,clienttype FROM tb_sign WHERE creatorid={$v['creatorid']} ORDER BY signtime DESC LIMIT 1");
                $temp = $query->row();
                foreach($temp as $key => $value){
                    $info['list'][$k][$key] = $value;
                }
            }
        }
        //print_r($info);die;
        if($info['total']){
            return $info;
        }
    }

    /**
     * 获取全部签到列表
     */
    public function ajaxGetSignList(){
        $info = array('total' => 0, 'list' => '');
        $limit = (isset($_GET['num']) && intval($_GET['num']) > 0 ) ? intval($_GET['num']) : 15;//分页
        $page = (isset($_GET['p']) && intval($_GET['p']) > 0) ? $_GET['p'] : 0;//偏移量
        $offset = $page ? ($page-1) * $limit : 0;
        $mids = isset($_GET['mids']) ? array_map('intval', $_GET['mids']) : array();
        $midStr = $mids ? " AND creatorid IN (" . implode(',', $mids) . ")" : '';

        $this->load->database('default');
        $sql = " SELECT COUNT(1) AS num FROM tb_sign AS S WHERE S.signtype=0" . $midStr;//发言签到
        $sql .= " UNION ";
        $sql .= " SELECT COUNT(1) AS num FROM tb_sign AS S WHERE S.signtype=1 AND creatorid={$this->employeeId}" . $midStr;//我的手动签到
        $sql .= " UNION ";
        $sql .= " SELECT COUNT(1) AS num FROM tb_sign AS S INNER JOIN tb_sign_share AS SS ON SS.fromid=S.creatorid WHERE S.signtype=1 AND SS.toid={$this->employeeId}" . $midStr;//共享给我的手动签到
        $sql .= " UNION ";
        $sql .= " SELECT COUNT(1) AS num FROM tb_sign AS S WHERE S.signtype=2 AND S.creatorid={$this->employeeId}" . $midStr;//我参与的定时任务的签到【只能看到我自己的】
        $sql .= " UNION ";
        $sql .= " SELECT COUNT(1) AS num FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON SU.signtaskid=S.signtypeid WHERE S.signtype=2 AND SU.usertype=2 AND SU.employeeid={$this->employeeId}" . $midStr;//查看权限的定时任务签到【所有此任务的签到记录】
        $query = $this->db->query($sql);
        $temp = $query->result_array();
        foreach($temp as $k => $v){
            $info['total'] += $v['num'];
        }
        /*******/
        $sql = "SELECT EM.id AS uid,EM.`name`,EM.imageurl,TEMP.* FROM (";
        $sql .= " SELECT * FROM (SELECT S.id,S.creatorid,S.`precision`,S.latitude,S.address,S.signtime,S.clienttype FROM tb_sign AS S WHERE S.signtype=0" . $midStr ." ORDER BY id DESC LIMIT {$limit} OFFSET {$offset}) AS TEMP0";//发言签到
        $sql .= " UNION ";
        $sql .= " SELECT * FROM (SELECT S.id,S.creatorid,S.`precision`,S.latitude,S.address,S.signtime,S.clienttype FROM tb_sign AS S WHERE S.signtype=1 AND S.creatorid={$this->employeeId} " . $midStr . " ORDER BY id DESC LIMIT {$limit} OFFSET {$offset}) AS TEMP0";//我的手动签到
        $sql .= " UNION ";
        $sql .= " SELECT * FROM (SELECT S.id,S.creatorid,S.`precision`,S.latitude,S.address,S.signtime,S.clienttype FROM tb_sign AS S INNER JOIN tb_sign_share AS SS ON SS.fromid=S.creatorid WHERE S.signtype=1 AND SS.toid={$this->employeeId} " . $midStr . " ORDER BY id DESC LIMIT {$limit} OFFSET {$offset}) AS TEMP1";//共享给我的手动签到
        $sql .= " UNION ";
        $sql .= " SELECT * FROM (SELECT S.id,S.creatorid,S.`precision`,S.latitude,S.address,S.signtime,S.clienttype FROM tb_sign AS S WHERE S.signtype=2 AND S.creatorid={$this->employeeId} " . $midStr . " ORDER BY id DESC LIMIT {$limit} OFFSET {$offset}) AS TEMP2";//我参与的定时任务的签到【只能看到我自己的】
        $sql .= " UNION ";
        $sql .= " SELECT * FROM (SELECT S.id,S.creatorid,S.`precision`,S.latitude,S.address,S.signtime,S.clienttype FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON SU.signtaskid=S.signtypeid WHERE S.signtype=2 AND SU.usertype=2 AND SU.employeeid={$this->employeeId} " . $midStr . " ORDER BY id DESC LIMIT {$limit} OFFSET {$offset}) AS TEMP3";//查看权限的定时任务签到【所有此任务的签到记录】
        $sql .= ") AS TEMP INNER JOIN tb_employee AS EM ON TEMP.creatorid=EM.id ORDER BY TEMP.id DESC LIMIT {$limit} OFFSET {$offset}";
        //echo $sql,"<br/><br/><br/>";
        $query = $this->db->query($sql);
        $info['list'] = $query->result_array();
        if($info['total']){
            echo json_encode($info);
        }
        exit();
    }

    /**
     * 获取我的签到列表
     */
    public function ajaxGetMySign(){
        $info = array('total' => 0, 'userInfo' => array('employeeId' => $this->employeeId, 'name' => $this->employeeName));
        $limit = (isset($_GET['num']) && intval($_GET['num']) > 0 ) ? intval($_GET['num']) : 15;//分页
        $page = (isset($_GET['p']) && intval($_GET['p']) > 0) ? $_GET['p'] : 0;//偏移量
        $offset = $page ? ($page-1) * $limit : 0;

        $this->load->model('Sign_model', 'signM');
        $info['total'] = $this->signM->getSignNumByEmployeeId($this->employeeId);
        $info['list'] = $this->signM->getSignListByEmployeeId($this->employeeId, $limit, $offset);
        if($info['total']){
            echo json_encode($info);
        }
        exit();
    }

    /**
     * 获取定时任务列表【当前用户参与的定时任务列表】
     */
    public function ajaxGetAllTaskLeftList(){
        $info = array('total' => 0, 'list' => '');
        $limit = (isset($_GET['num']) && intval($_GET['num']) > 0 ) ? intval($_GET['num']) : 15;//分页
        $page = (isset($_GET['p']) && intval($_GET['p']) > 0) ? $_GET['p'] : 0;//偏移量
        $offset = $page ? ($page-1) * $limit : 0;
        $showOverdue = isset($_GET['showOverdue']) ? intval($_GET['showOverdue']) : 0;//是否显示过期任务

        $this->load->model('Sign_model', 'signM');
        $info['total'] = $this->signM->getTaskNumByEmployeeId($this->employeeId, 0, $showOverdue);
        $info['list'] = $this->signM->getTaskListByEmployeeId($this->employeeId, 0, $showOverdue, $limit, $offset);
        foreach($info['list'] as $k => $v){
            if($v['status'] == 0){
                $info['list'][$k]['status'] = '停用';
            } else if( strtotime($v['endtime']) < time()){
                $info['list'][$k]['status'] = '过期';
            } elseif($v['status'] == 1){
                $info['list'][$k]['status'] = '正常';
            }
            $info['list'][$k]['startTime'] = date('Y-m-d', strtotime($v['starttime']));
            $info['list'][$k]['endTime'] = date('Y-m-d', strtotime($v['endtime']));
        }
        if($info['total']){
            echo json_encode($info);
        }
        exit();
    }

    /**
     * 获取定时任务的签到列表【一条一条的签到记录，如果为参与人只能看到自己的签到，为查看人则看到全部人员的定时任务签到】
     */
    public function ajaxGetAllTaskRightList(){
        $info = array('total' => 0, 'list' => '');
        $limit = (isset($_GET['num']) && intval($_GET['num']) > 0 ) ? intval($_GET['num']) : 15;//分页
        $page = (isset($_GET['p']) && intval($_GET['p']) > 0) ? $_GET['p'] : 0;//偏移量
        $offset = $page ? ($page-1) * $limit : 0;
        $showOverdue = isset($_GET['showOverdue']) ? intval($_GET['showOverdue']) : 0;//是否显示过期任务

        $this->load->model('Sign_model', 'signM');
        $sql = " SELECT COUNT(1) AS num FROM tb_sign AS S WHERE S.signtype=2 AND S.creatorid={$this->employeeId}";//我参与的定时任务的签到【只能看到我自己的】
        $sql .= " UNION ";
        $sql .= " SELECT COUNT(1) AS num FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON SU.signtaskid=S.signtypeid WHERE S.signtype=2 AND SU.usertype=2 AND SU.employeeid={$this->employeeId} AND S.creatorid<>SU.employeeid";//查看权限的定时任务签到【所有此任务的签到记录】
        $query = $this->db->query($sql);
        $temp = $query->result_array();
        foreach($temp as $k => $v){
            $info['total'] += $v['num'];
        }
        $sql = "SELECT EM.id AS uid,EM.`name`,EM.imageurl,TEMP.* FROM (";
        $sql .= " SELECT * FROM (SELECT S.id,S.creatorid,S.province,S.city,S.address,S.signtime,S.clienttype,S.remark FROM tb_sign AS S WHERE S.signtype=2 AND S.creatorid={$this->employeeId} ORDER BY id DESC LIMIT {$limit} OFFSET {$offset}) AS TEMP0";//我参与的定时任务的签到【只能看到我自己的】
        $sql .= " UNION ";
        $sql .= " SELECT * FROM (SELECT S.id,S.creatorid,S.province,S.city,S.address,S.signtime,S.clienttype,S.remark FROM tb_sign AS S INNER JOIN tb_sign_user AS SU ON SU.signtaskid=S.signtypeid WHERE S.signtype=2 AND SU.usertype=2 AND SU.employeeid={$this->employeeId} AND S.creatorid<>SU.employeeid ORDER BY id DESC LIMIT {$limit} OFFSET {$offset}) AS TEMP1";//查看权限的定时任务签到【所有此任务的签到记录】
        $sql .= ") AS TEMP INNER JOIN tb_employee AS EM ON TEMP.creatorid=EM.id ORDER BY TEMP.id DESC LIMIT {$limit} OFFSET {$offset}";
        $query = $this->db->query($sql);
        $info['list'] = $query->result_array();
        if($info['total']){
            echo json_encode($info);
        }
        exit();
    }

    /**
     * 获取分享人的手动签到列表【按用户统计签到数量且获取用户最后一次签到信息】
     */
    public function ajaxGetShareEmployeeSignLeftList(){
        $info = array('total' => 0, 'list' => '');
        $page = (isset($request['p']) && intval($request['p']) > 0) ? $request['p'] : 0;//偏移量
        $limit = (isset($request['num']) && intval($request['num']) > 0 ) ? intval($request['num']) : 15;//分页
        $offset = $page ? ($page-1) * $limit : 0;

        $this->load->database('default');
        $query = $this->db->query("SELECT COUNT(S.id) AS num FROM tb_sign AS S INNER JOIN tb_sign_share AS SS ON SS.fromid=S.creatorid INNER JOIN tb_employee AS EM ON EM.id=SS.fromid WHERE S.signtype=1 AND SS.toid={$this->employeeId} GROUP BY S.creatorid");
        $info['total'] = $query->num_rows();//获取总数

        $query = $this->db->query("SELECT COUNT(1) AS num,EM.id AS uid,EM.`name`,EM.imageurl FROM tb_sign AS S INNER JOIN tb_sign_share AS SS ON SS.fromid=S.creatorid INNER JOIN tb_employee AS EM ON EM.id=SS.fromid WHERE S.signtype=1 AND SS.toid={$this->employeeId} GROUP BY S.creatorid ORDER BY S.signtime DESC LIMIT {$limit} OFFSET {$offset}");
        $info['list'] = $query->result_array();
        foreach($info['list'] as $k => $v){
            $query = $this->db->query("SELECT `precision`,latitude,address,signtime,clienttype FROM tb_sign WHERE creatorid={$v['uid']} ORDER BY signtime DESC LIMIT 1");
            $temp = $query->row();
            foreach($temp as $key => $value){
                $info['list'][$k][$key] = $value;
            }
        }
        if($info['total']){
            echo json_encode($info);
        }
        exit();
    }

    /**
     * 获取分享人的手动签到列表【一条一条的签到信息】
     */
    public function ajaxGetShareEmployeeSignRightList(){
        $info = array('total' => 0, 'list' => '');
        $page = (isset($request['p']) && intval($request['p']) > 0) ? $request['p'] : 0;//偏移量
        $limit = (isset($request['num']) && intval($request['num']) > 0 ) ? intval($request['num']) : 15;//分页
        $offset = $page ? ($page-1) * $limit : 0;

        $this->load->model('Sign_model', 'signM');
        $info['total'] = $this->signM->getShareEmployeeSignNum($this->employeeId);
        $info['list'] = $this->signM->getShareEmployeeSignList($this->employeeId, $limit, $offset);
        //print_r($info);die;
        if($info['total']){
            echo json_encode($info);
        }
        exit();
    }

    /**
     * 获取某个定时任务签到记录【按用户统计签到数量且获取用户最后一次签到信息】
     */
    public function ajaxGetLeftSignListByTaskId(){
        $info = array('total' => 0, 'list' => '');
        $where = $this->makeData($_REQUEST);
        if($where){
            $whereStr = implode(' AND ', $where);
            $page = (isset($request['p']) && intval($request['p']) > 0) ? $request['p'] : 0;//偏移量
            $limit = (isset($request['num']) && intval($request['num']) > 0 ) ? intval($request['num']) : 15;//分页
            $offset = $page ? ($page-1) * $limit : 0;

            $query = $this->db->query("SELECT COUNT(S.id) AS num FROM tb_sign AS S INNER JOIN tb_employee AS EM ON EM.id=S.creatorid WHERE " . $whereStr . " GROUP BY S.creatorid");
            $info['total'] = $query->num_rows();//获取总数
            $query = $this->db->query("SELECT COUNT(1) AS num,EM.id AS uid,EM.`name`,EM.imageurl FROM tb_sign AS S INNER JOIN tb_employee AS EM ON EM.id=S.creatorid WHERE " . $whereStr . " GROUP BY S.creatorid ORDER BY S.signtime DESC LIMIT {$limit} OFFSET {$offset}");
            $info['list'] = $query->result_array();
            foreach($info['list'] as $k => $v){
                $query = $this->db->query("SELECT `precision`,latitude,address,signtime,clienttype FROM tb_sign WHERE creatorid={$v['uid']} ORDER BY signtime DESC LIMIT 1");
                $temp = $query->row();
                foreach($temp as $key => $value){
                    $info['list'][$k][$key] = $value;
                }
            }
            if($info['total']){
                echo json_encode($info);
            }
        }
        exit();
    }

    /**
     * 获取某个定时任务的签到记录【一条一条的签到记录】
     */
    public function ajaxGetRightSignListByTaskId(){
        $info = array('total' => 0, 'list' => '');
        $where = $this->makeData($_REQUEST);
        if($where){
            $whereStr = implode(' AND ', $where);
            $page = (isset($request['p']) && intval($request['p']) > 0) ? $request['p'] : 0;//偏移量
            $limit = (isset($request['num']) && intval($request['num']) > 0 ) ? intval($request['num']) : 15;//分页
            $offset = $page ? ($page-1) * $limit : 0;

            $query = $this->db->query("SELECT COUNT(S.id) AS num FROM tb_sign AS S INNER JOIN tb_employee AS EM ON EM.id=S.creatorid WHERE " . $whereStr);
            $info['total'] = $query->row()->num;//获取总数
            $query = $this->db->query("SELECT EM.id,EM.`name`,EM.imageurl,S.province,S.city,S.district,S.address,S.signtime,S.clienttype,S.remark FROM tb_sign AS S INNER JOIN tb_employee AS EM ON EM.id=S.creatorid WHERE " . $whereStr . " LIMIT {$limit} OFFSET {$offset}");
            $info['list'] = $query->result_array();
            if($info['total']){
                echo json_encode($info);
            }
        }
        exit();
    }

    /**
     * 整理数据
     * @param array $request    请求参数数据
     */
    public function makeData($request){
        $tid = isset($request['tid']) ? intval($request['tid']) : 0;//定时任务ID
        $this->load->model('Sign_model', 'signM');
        $status = $this->signM->getEmployeeStatus($tid, $this->employeeId);//用户是否参与了此任务
        $mids = isset($request['mids']) ? array_map('intval', $request['mids']) : array();//
        $mids = $mids ? implode(',', $mids) : '';
        if($status){
            $startTime = isset($request['startTime']) ? trim($request['startTime']) : '';//开始时间
            $endTime = isset($request['endTime']) ? trim($request['endTime']) : '';//结束时间
            $province = isset($request['province']) ? trim($request['province']) : '';//省份
            $city = isset($request['city']) ? trim($request['city']) : '';//市
            $district = isset($request['district']) ? trim($request['district']) : '';//区

            $where = array('S.signtypeid=' => $tid, 'S.signtype=' => 2, 'S.spaceid=' => $this->spaceId);
            $startTime ? $where['S.signtime >='] = $startTime : '';
            $endTime ? $where['S.signtime <='] = $endTime : '';
            $province ? $where['S.province='] = $province : '';
            $city ? $where['S.city='] = $city : '';
            $district ? $where['S.district='] = $district : '';
            if($status['usertype'] == 1){//如果为参与人，则只能查看自己的签到信息
                $where['S.creatorid='] = $this->employeeId;
            }
            foreach($where as $k => $v){
                $where[$k] = $k . "'{$v}'";
            }
            if($status['usertype'] == 2 && $mids){
                array_push($where, "S.creatorid IN ({$mids})");
            }
            return $where;
        }
        return false;
    }
}