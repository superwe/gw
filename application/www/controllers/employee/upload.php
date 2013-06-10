<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: Yuanjing
 * Date: 13-4-11
 * Time: 下午13:58
 * To change this template use File | Settings | File Templates.
 */

class Upload extends CI_Controller {

    public function index() {
        $gid = isset($_POST['gid'])?intval($_POST['gid']):0;
        $this->load->model("Resource_model","resource");
        $returnArr = $this->resource->addFiles("filedata"); //向resource表插入数据 http://esnimage.uu.com.cn/qz/201304/12/1365752970DGG7.jpg.thumb.jpg
        $return = array($returnArr['resourceid'], $returnArr['title'], 0, $returnArr['filepath'], $returnArr['filepath']);
        //$return = array(1, 'tttttttt', 0, 'http://esnimage.uu.com.cn/qz/avatar/000/01/71/99.jpg.thumb.jpg', 'http://esnimage.uu.com.cn/qz/avatar/000/01/71/99.jpg.thumb.jpg');
        echo json_encode($return);
        exit(0);
    }
}