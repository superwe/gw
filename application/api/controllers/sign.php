<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: ZhaiYanBin
 * Date: 2013-05-07
 * Time: 下午20:07
 * To change this template use File | Settings | File Templates.
 */

class Sign extends CI_Controller {
    const SIGN_TYPE_LBS = 1;//定时定位类型签到
    const SIGN_TYPE_TASK = 2;//定时任务类型签到
    const SIGN_TYPE_COMMON = 3;//手动类型签到
    const BAIDU_MAP_URL = 'http://api.map.baidu.com/geocoder';

    public function __construct(){
        parent::__construct();
        $this->input->get_post(NULL, TRUE);
        $this->load->model('sign_model', 'signM');
    }

    /**
     * 返回提示信息
     */
    public function output($return){
        switch($return['error_code']){
            case '0':
                $return['error_description'] = '';break;
            case '-1':
                $return['error_description'] = '必要参数错误.';break;
            case '-2':
                $return['error_description'] = '客户端类型错误.';break;
            case '-3':
                $return['error_description'] = '签到用户不属于本空间或用户已停用.';break;
            case '-4':
                $return['error_description'] = '此空间不存在此签到任务.';break;
            case '-5':
                $return['error_description'] = '此用户无权进行此签到.';break;
            case '-6':
                $return['error_description'] = '用户签到失败.';break;
            case '-7':
                $return['error_description'] = '获取用户签到任务失败.';break;
        }
        echo json_encode($return);
        return json_encode($return);
    }

    /**
     * 手机端签到
     */
    public function create($data = ''){
        $data = @json_decode($data, true);
        if(empty($data)){
            $return['error_code'] = -1;return $this->output($return);
        }
        $employeeId = isset($data['member_id']) ? intval($data['member_id']) : 0;//签到用户ID
        $spaceId = isset($data['space_id']) ? intval($data['space_id']) : 0;//空间ID
        $precision = isset($data['precision']) ? trim($data['precision']) : '';//经度
        $latitude = isset($data['latitude']) ? trim($data['latitude']) : '';//纬度
        $province = isset($data['province']) ? trim($data['province']) : '';//省份
        $city = isset($data['city']) ? trim($data['city']) : '';//市
        $district = isset($data['district']) ? trim($data['district']) : '';//区
        $address = isset($data['address']) ? trim($data['address']) : '';//地址
        $clientType = isset($data['client_type']) ? intval($data['client_type']) : 0;//客户端类型(0网页，1IOS，2安卓，3WP,4桌面端)
        $signtime = isset($data['addtime']) ? $data['addtime'] : time() ; //签到时间
        $remark = isset($data['remark']) ? trim($data['remark']) : ''; //备注
        $typeId = isset($data['type_id']) ? intval($data['type_id']) : 0;//签到类型ID
        $signType = isset($data['sign_type']) ? intval($data['sign_type']) : 3;//签到类型（0-发言签到，1-定时定位签到，2-定时任务签到, 3-手动签到）
        //必要参数检测
        if($employeeId <= 0 || $spaceId <= 0 || empty($precision) || empty($latitude) ){
            $return['error_code'] = -1;return $this->output($return);
        }
        //用户是否在本圈子里
        $info = $this->signM->isSpaceEmployee($employeeId, $spaceId);
        if(!$info){
            $return['error_code'] = -3;return $this->output($return);
        }
        //检测客户端类型
        if( !in_array($clientType, array(1,2,3)) ){
            $return['error_code'] = -2;return $this->output($return);
        }
        //定时任务类型签到
        if($signType == self::SIGN_TYPE_TASK){
            if($typeId <= 0){
                $return['error_code'] = -1;return $this->output($return);
            }
            //此签到任务状态
            $info = $this->signM->getTaskInfo($typeId, $spaceId);
            if( empty($info) || $info['status'] != 1 || $info['endtime'] < time() ){//不存在 OR 非正常状态 OR 此定时任务过期
                $return['error_code'] = -4;return $this->output($return);
            }
            //用户是否有权限签到
            if(!$this->signM->isSignEnable($spaceId, $typeId, $employeeId)){
                $return['error_code'] = -5;return $this->output($return);
            }
        }  else{//手动签到
            $typeId = 0;
            $signType = self::SIGN_TYPE_COMMON;
        }
        //获取省、市、区
        if(empty($province) || empty($city) || empty($district) || empty($address) ){
            $url = self::BAIDU_MAP_URL . "?location=" . $latitude . "," . $precision . "&output=json" ;
            $obj = json_decode( @file_get_contents($url) );
            if(is_object($obj) && $obj->status == 'OK' ){
                $province = ($obj->result->addressComponent->province);
                $city = ($obj->result->addressComponent->city);
                $district = $obj->result->addressComponent->district;
                $address = ($obj->result->formatted_address);
            }
            //插入数据
            $row = $this->signM->addSign($employeeId, $spaceId, $precision, $latitude, $province, $city, $district, $address, $clientType, $signtime, $remark, $typeId, $signType);
            $return['error_code'] = $row ? 0 : -6;
            return $this->output($return);
        }
    }

    /**
     * 获取某个用户参与的定时任务设置信息
     */
    public function getTaskList($data = ''){
        $data = json_decode($data, true);
        if(empty($data)){
            $return['error_code'] = -1;return $this->output($return);
        }
        $employeeId = isset($data['member_id']) ? intval($data['member_id']) : 0;//签到用户ID
        $limit = isset($data['limit']) ? intval($data['limit']) : 0;//查询条数
        $offset = isset($data['offset']) ? intval($data['offset']) : 0;//记录偏移量
        if($employeeId <= 0){
            $return['error_code'] = -1;return $this->output($return);
        }
        $list = $this->signM->getTaskListByEmployeeId($employeeId, $limit, $offset);
        foreach($list as $key => $row){
            $list[$key]['interval'] = 0;
            if($row['signtime'] != ''){//非固定频率
                $temp = @json_decode($row['signtime'], true);
                if(is_array($temp)){
                    foreach($temp as $k => $v){
                        $list[$key]['signTimeList'][] = array('signTimeId' => time() . rand(), 'signInTime' => $v, 'taskItemId' => $row['id']);
                    }
                }
                unset($list[$key]['timingsetting'], $list[$key]['signtime']);
            } else{
                $list[$key]['interval'] = 1;//固定频率
                $temp = @json_decode($row['timingsetting'], true);
                if(is_array($temp)){
                    if(isset($row['timingsetting']['startTime']) && $row['timingsetting']['startTime'] != '' ){
                        $list[$key]['timingsetting']['startTime'] = strtotime($row['timingsetting']['startTime']);
                    }
                    if(isset($row['timingsetting']['endTime']) && $row['timingsetting']['endTime'] != '' ){
                        $list[$key]['timingsetting']['endTime'] = strtotime($row['timingsetting']['endTime']);
                    }
                }
                unset($list[$key]['signtime']);
            }
            //重复类型
            if($row['cycletype'] > 0){
                $list[$key]['cycletype'] = implode( ',', str_split($row['cycletype']) );
            }
        }
        $return = $list ? array('error_code' => 0, 'taskList' => $list) : array('error_code' => -7);
        return $this->output($return);
    }
}