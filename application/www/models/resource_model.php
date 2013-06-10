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
		return array();
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
		    }
		    $name = $returnArr['data']['title'];
		    $url = $returnArr['verinfo']['filepath'];
		    $size = $returnArr['verinfo']['filesize'];
		    $filetype = $returnArr['verinfo']['fileext'];
		    $createtime = date('Y-m-d H:i:s');
		    $keys = array('name','url','size','createtime','filetype');
		    $values = array("'$name'","'$url'","'$size'","'$createtime'","'$filetype'");
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
     * 保存 资源的引用关系
     * @author add by lisheng 2013-04-25
     * @param $reftype 引用类型
     * @param $refid  引用此资源的ID
     * @param $resourceArr 资源ID的集合
     * 因调用此方法的方法 都有事务控制，此处不加事务处理。
     */
    public function saveResourceRef($reftype,$refid,$resourceArr)
    {
        //删除原来的关联资源
        $this->db->query('delete from tb_resource_ref where reftype = ? and refid = ? ',array($reftype,$refid));
        foreach($resourceArr as $key => $value){
            $this->db->query(' insert into tb_resource_ref (reftype,refid,resourceid) values (?,?,?) ',array($reftype,$refid,$value));
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
	    $id = $this->db->insert_id();
	    $this->db->trans_commit();
	    return $id;
	}
    }

    /**
     * 根据对象（发言，任务等）获取关联的附件
     * @autor add by lisheng 2013-04-26
     * @param $reftype 对象类型
     * @param $refid   对象ID
     * @return string
     */
    public function getTargetResources($reftype,$refid)
    {
        if(empty($reftype) || empty($refid))
            return '';
        $queryResource = $this->db->query('select id,name,url,filetype from tb_resource
             where id in (select resourceid from tb_resource_ref where reftype=? and refid=?)', array($reftype,$refid));
        return $queryResource->result();
    }

    public function getResourceListByRef($type, $id){
        if(empty($type) || empty($id))
            return array();
        $sqlStr = "SELECT r.* FROM `tb_resource_ref` ref LEFT JOIN  tb_resource r ON ref.resourceid=r.id WHERE ref.reftype=? AND ref.refid=?";
        $rs = $this->db->query($sqlStr, array($type, $id));
        return $rs->result_array();
    }

    /**
     * 文档转换可预览
     * @autor add by shiying 2013-04-26
     * @param $fileid
     * @return int
     */
    public function convert($fileid) {
        $this->load->model("file_model","filemodel");
        $rs = $this->filemodel->getFileById($fileid);
        if($rs) {
            $resourceInfo = $this->filemodel->getResourceByRef($fileid);
            $filePath = $resourceInfo['url'];
            $fileExt = strtolower(trim(substr(strrchr($resourceInfo['url'], '.'), 1)));

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
    
    /**
     * 写入资源映射
     * @author	Hejinlong	2013-4-25
     * @param	int		$refType	应用类型
     * @param 	int		$refId		文件Id
     * @param	int		$resourceId	资源Id
     * @return  int	
     */
    function addResource($refType, $refId, $resourceId){
    	$this->db->trans_begin();
    	$res = $this->db->query( 'INSERT INTO tb_resource_ref (reftype, refid, resourceid) VALUES (?, ?, ?)', array($refType, $refId, $resourceId));
    	if ($this->db->trans_status() == FALSE){
		    $this->db->trans_rollback();
		}else{
			$id = $this->db->insert_id();
            $this->db->trans_commit();
            return $id;
		}
    }

    /**
     * 根据对象ID和对象类型(发言，任务等)获取某一对象类型的附件列表
     * @author ZhaiYanBin 2013-05-03
     * @param int $reftype 对象类型
     * @param string $refid   对象ID
     * @return array
     */
    public function getResourceListByRefIdANDRefType($refId = 0, $refType = 0){
        if(empty($refId) || empty($refType)){
            return false;
        }
        $query = $this->db->query('select RE.id,RE.name,RE.url,RE.filetype,RR.refid,RR.reftype from tb_resource AS RE INNER JOIN tb_resource_ref AS RR ON RE.id = RR.resourceid WHERE RR.refid IN (' . $refId . ') AND RR.reftype=' . $refType);
        return $query->result_array();
    }

    /**
     * 根据资源id获取资源内容
     * @autor add by shiying 2013-05-08
     * @param $resourceid
     */
    public function getResource($resourceid){
        $rs = $this->db->query("SELECT * FROM tb_resource WHERE id =?",array($resourceid));
        return $rs->row_array();
    }
}