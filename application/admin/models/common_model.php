<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Yuanjinga
 * Date: 13-4-9
 * Time: 下午4:08
 * To change this template use File | Settings | File Templates.
 */

class Common_model extends  CI_Model{
    /**
     *
     * 构建时间数组
     */
    public static function buildHours(){
        $hours = array();
        for($i=1;$i<25;$i++){
            if($i<=12){
                $n = "上午";
            }elseif($i>12 && $i<18){
                $n = "下午";
            }else{
                $n = "晚上";
            }
            if($i<10){
                $k = "0".$i;
            }else{
                $k = $i;
            }
            $hours[$k] = $n.$k."点";
        }
        return $hours;
    }

    /**
     * ajax返回值
     * @param boolean $rs 调用是否成功
     * @param array $data 返回数据
     * @param string $error 错误信息
     * @param string $type	类型
     */
    public function _ajaxRs($rs, $data = array(), $error = '', $type = '') {
        header("Content-type:text/html;charset=utf-8");
        exit ( json_encode ( array (
            'rs' => $rs,
            'error' => $error,
            'data' => $data,
            'type' => $type
        ) ) );
    }

    /**
     * 跳转浏览器地址
     * @param string $url  地址栏地址
     */
    /*public static function _redirect($url){
        $url = strripos($url, 'http://') === false ? ($this->config->item('base_url') . $url) : $url;
        header('Location: ' . $url);exit;
    }*/

    /**
     * 跳转浏览器地址
     * @param string $url  地址栏地址
     * @param string $msg  (如果需要显示回调信息)回调显示的信息
     */
    protected function _redirect($url, $msg = '', $wrongFlag = 0){
        $url = strripos($url, 'http://') ===false ? ($this->config->item('base_url') . $url) : $url;
        if($msg){
            $url = $this->rscallback($url, $msg, $wrongFlag);
        }
        header('Location:' . $url);exit;
    }

    /**
     * 回调url地址整理
     * @param string $url  地址栏地址
     * @param string $msg  需要显示的信息
     */
    public function rscallback($url, $msg, $wrongFlag = 0){
        $url = preg_replace('/_rscallback(.*)/', '', $url);
        $url = preg_match('/\/$/', $url) ? $url : $url.'/';
        return  $url. '_rscallback/' . urlencode($msg) . '/_rscallbackflag/' . ($wrongFlag ? 1 : 0);
    }

}