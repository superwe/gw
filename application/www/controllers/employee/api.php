<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: shiying
 * Date: 2013/4/25
 * To change this template use File | Settings | File Templates.
 */
class Api extends CI_Controller {
    private $spaceid;
    private $employeeid;

    public function __construct(){
        parent::__construct();
        $this->load->helper('cache');
        //从缓存获得空间ID
        $this->spaceid = QiaterCache::spaceid();
        $this->employeeid = QiaterCache::employeeid();

        $this->file_object_type      = $this->config->item('object_type_files','base_config');
        $this->member_object_type    = $this->config->item('object_type_member','base_config');
        $this->group_object_type     = $this->config->item('object_type_group','base_config');

        $this->resource_url = $this->config->item('resource_url');
    }

    /**
     * 点击选择文件触发操作
     */
    public function selected(){
        //我的群组列表
        $this->load->model("group_model","groupmodel");
        $grouplist = $this->groupmodel->getEmployeeGroupList($this->spaceid,$this->employeeid);
        $data['grouplist'] = $grouplist;
        $this->load->library('smarty');
        $this->smarty->view('employee/api/selected.tpl',$data);
    }

    /**
     * 获取文件列表
     */
    public function filelist(){
        $this->load->model("file_model","filemodel");
        $filterArr = array("all","recent","followed","upload","group");
        $filter = (isset($_GET['filter']) && in_array($_GET['filter'],$filterArr))?$_GET['filter']:'all';
        $orderby = "F.createtime";
        switch($filter){
            case 'all':
                //全部文档
                $folders = $this->filemodel->getFolder($this->spaceid,1,0,$this->employeeid);
                $folderArr = array(-1);
                if($folders){
                    foreach($folders as $value){
                        array_push($folderArr,$value['id']);
                    }
                }
                $folderid_str = implode(',',$folderArr);
                $andwhere = array("F.spaceid='".$this->spaceid."'","F.isvisible = 1","F.isleaf = 1","SF.reftype IN('$this->file_object_type','$this->group_object_type') ");
                $orwhere = array("F.folderid IN (".$folderid_str.") AND F.fromid = 0","F.folderid = 0 AND F.fromtype = '".$this->group_object_type."'","F.folderid = 0 AND F.fromtype = 0");
                break;
            case 'recent':
                //最近一周 最新文档
                $folders = $this->filemodel->getFolder($this->spaceid,1,0,$this->employeeid);
                $folderArr = array(-1);
                if($folders){
                    foreach($folders as $value){
                        array_push($folderArr,$value['id']);
                    }
                }
                $recentweek = date('Y-m-d',time()-86400*7);
                $folderid_str = implode(',',$folderArr);
                $andwhere = array("F.spaceid='".$this->spaceid."'","F.isvisible = 1","F.isleaf = 1","SF.reftype IN('$this->file_object_type','$this->group_object_type') ","F.createtime >= '".$recentweek."'");
                $orwhere = array("F.folderid IN (".$folderid_str.") AND F.fromid = 0","F.folderid = 0 AND F.fromtype = '".$this->group_object_type."'","F.folderid = 0 AND F.fromtype = 0");
                break;
            case 'followed':
                //关注的文档
                $getfiles = $this->filemodel->getFollowedFiles($this->spaceid,$this->employeeid);

                break;
            case 'upload':
                //我上传的文档
                $andwhere = array("F.spaceid='".$this->spaceid."'","F.creatorid='".$this->employeeid."'","F.isvisible = 1","F.isleaf = 1","SF.reftype IN('$this->file_object_type','$this->group_object_type') ");
                $orwhere  = array();
                break;
            case 'group':
                $groupid = isset($_GET['groupid'])?intval($_GET['groupid']):0;
                $andwhere = array("F.folderid = 0","F.spaceid='".$this->spaceid."'","F.fromid = '".$groupid."'","F.fromtype = '".$this->group_object_type."'","F.isvisible = 1","F.isleaf = 1","SF.reftype = '$this->group_object_type'");
                $orwhere  = array();
                break;
        }
        if($filter == 'followed'){
            if($getfiles){
                foreach($getfiles as $key=>$value){
                    $resourceinfo = $this->filemodel->getResource($value['id']);
                    $getfiles[$key]['filetype'] = $resourceinfo['filetype'];
                    $getfiles[$key]['imageurl'] = $this->resource_url.$value['imageurl'];
                }
            }
        }else{
            $getfiles = $this->filemodel->getFiles($andwhere,$orderby,$orwhere);
            if($getfiles){
                foreach($getfiles as $key=>$value){
                    $getfiles[$key]['imageurl'] = $this->resource_url.$value['imageurl'];
                }
            }
        }
        $data['getfiles'] = $getfiles;
        $this->load->library('smarty');
        $this->smarty->view('employee/api/table.tpl',$data);
    }

    /**
     * 除文库组件中的文档下载
     */
    public function down(){
        $resourceid = isset($_GET['resourceid'])?intval($_GET['resourceid']):0;
        $this->load->model("resource_model","resourcemodel");
        $resourceInfo = $this->resourcemodel->getResource($resourceid);

        if($resourceInfo && $resourceInfo['url']){
            //真实路径
            $filepath = $this->resource_url.$resourceInfo['url'];
            //文档类型
            $filetype = strtolower($resourceInfo['filetype']);
            //文件名称
            $fileName = $resourceInfo['name'].'.'.$filetype;

            $picType = array('jpg', 'jpeg', 'gif', 'png','bmp');
            if(in_array($filetype, $picType)){
                $type = "image";
            }else{
                $type = "file";
            }
            header("Content-Type: application/force-download");
            header("Content-Type: application/octet-stream");
            header("Content-Type: application/download");
            header("Content-Transfer-Encoding: binary");
            header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
            header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
            header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
            header("Pragma: no-cache");
            header("Accept-Length: ".$resourceInfo['size']);
            //调整文件名包含空格的类型
            $ua = $_SERVER["HTTP_USER_AGENT"];
            $encoded_filename = urlencode($fileName);
            $encoded_filename = str_replace("+", "%20", $encoded_filename);
            if (preg_match("/MSIE/", $ua)) {
                header('Content-Disposition: attachment; filename="' . $encoded_filename . '"');
            } else if (preg_match("/Firefox/", $ua)) {
                header('Content-Disposition: attachment; filename*="utf8\'\'' . $fileName . '"');
            } else {
                header('Content-Disposition: attachment; filename="' . $fileName . '"');
            }

            $option['type'] = $type;
            $this->load->library('file');
            $obj =$this->file->instance($option);
            echo $obj->getFile($filepath);
            exit;
        }else{
            $this->redirect($_SERVER['HTTP_REFERER'],"出错了，文件不存在了!",1);
        }
    }
}