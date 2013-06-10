<?php
/**
 * Created by JetBrains PhpStorm.
 * User: shiying
 * Date: 13-4-12
 * To change this template use File | Settings | File Templates.
 */
class Resource_model extends  CI_Model{

    public function __construct(){
	$this->load->database('default');
    }

    /**
     * 向云存储存入数据
     * @param $uploadName   type=file 的name值
     * @return array
     */
    public function uploadFile($uploadName){
	if($_FILES[$uploadName]['error'] == 0 && $_FILES[$uploadName]['size'] > 0){
	    $option  = array();
	    $option['name']    = $_FILES[$uploadName]['name'];
	    $option['tmpName'] = $_FILES[$uploadName]['tmp_name'];

	    $data = $verinfo     = array();
	    $this->load->library('file');
	    $picType = array('jpg', 'jpeg', 'gif', 'png','bmp');
	    $filetype = strtolower(trim(substr(strrchr($option['name'], '.'), 1)));
	    if(in_array($filetype, $picType)){
		$type = "image";
		$allowType = $picType;
		$option['ssize'] = '20*20';
		$option['msize'] = '100*100';
		$option['bsize']    = "300*300";
		$option['maxsize'] = '500*500';
	    }else{
		$type = "file";
		$allowType = array('doc','docx','ppt','pptx','xls','xlsx','pot','potx','pps','ppsx','wps','wpsx','dps','wpt','dpt','txt','pdf', 'rar', 'zip', 'mp3', 'flv', 'wma', 'csv', 'csvx', 'mdb', 'tar','rp','wmv','mp4','rmvb');
	    }
	    $option['type'] = $type;
	    $option['allowType'] = $allowType;
	    $obj = $this->file->instance($option); //获取操作实例

	    $data['title']       = $obj->fileTitle($option['name']);
	    $verinfo['fileext']  = $obj->fileExt($option['name']);
	    $verinfo['filesize'] = $obj->fileSize();
	    $verinfo['filepath'] = $obj->save(); //进行分布式上传存储操作
	    $returnArr = array(
		'data'    => $data, //文件信息
		'verinfo' => $verinfo, //版本信息
		'filename' => $option['name'] //文件名
	    );
	    if($returnArr) return $returnArr;
	    return array();
	}
    }

    /**
     * 资源表插入数据
     * @param $uploadName  type=file 的name值
     * @return bool
     */
    public function addFiles($uploadName){
	if($_FILES[$uploadName]['error'] == 0){
	    $returnArr = $this->uploadFile($uploadName);
	    if (empty($returnArr['verinfo']['filepath'])) {
		return false;
		exit;
	    }
	    $name = $returnArr['data']['title'];
	    $url = $returnArr['verinfo']['filepath'];
	    $localpath = $returnArr['verinfo']['filepath'];
	    $size = $returnArr['verinfo']['filesize'];
	    $filetype = $returnArr['verinfo']['fileext'];
	    $createtime = date('Y-m-d H:i:s');
	    $keys = array('name','url','localpath','size','createtime','filetype');
	    $values = array("'$name'","'$url'","'$localpath'","'$size'","'$createtime'","'$filetype'");
	    $resourceid = $this->insertTable("tb_resource",$keys,$values); //资源的id
	    $data['resourceid'] = $resourceid;
	    $data['title'] = $name;
	    $data['filepath'] = $returnArr['verinfo']['filepath'];
	    return $data;
	}else{
	    return false;
	}
    }

    /**
     * 添加表内容
     * @param $table
     * @param $keys
     * @param $values
     * @return mixed
     */
    public function insertTable($table,$keys,$values){
	$this->db->trans_begin();
	$sql = $this->db->_insert($table,$keys,$values);
	$this->db->query($sql);
	if ($this->db->trans_status() == FALSE){
	    $this->db->trans_rollback();
	}else{
	    return $this->db->insert_id();
	    $this->db->trans_commit();
	}
    }

    public function getResourceListByRef($type, $id){
        if(empty($type) || empty($id))
            return array();
        $sqlStr = "SELECT r.* FROM `tb_resource_ref` ref LEFT JOIN  tb_resource r ON ref.resourceid=r.id WHERE ref.reftype=? AND ref.refid=?";
        $rs = $this->db->query($sqlStr, array($type, $id));
        return $rs->result_array();
    }

    public function convert($fileid) {
	$this->load->model("file_model","filemodel");
	$rs = $this->filemodel->getFileById($fileid);
	if($rs) {
	    $resourceInfo = $this->filemodel->getResource($fileid);
	    $filePath = $resourceInfo['localpath'];
	    $fileExt = strtolower(trim(substr(strrchr($resourceInfo['localpath'], '.'), 1)));

	    if ($filePath) {
		$this->load->library('file');
		$option['type'] = "file";
		$obj = $this->file->instance($option);
		$flag = $obj->convert($filePath, $fileExt, 90, 100, 0);
		if ($flag == 0) {
		    return 1; //转换成功
		} elseif($flag == 1){
		    return 2;	//不支持的格式
		}
		return 0; //转换失败
	    }
	}
	return 0; //转换失败
    }
}