<?php
/**
 * Created by JetBrains PhpStorm.
 * User: shiying
 * Date: 13-4-1
 * To change this template use File | Settings | File Templates.
 */
class File_model extends  CI_Model{

    public function __construct(){
	    $this->load->database('default');
    }
    /**
     * 查询文件夹
     * @param $spaceid 空间id
     * @param int $type 文档类型 1 个人文档 2 企业文档
     * @param int $parentid 父类id
     * @param int $creatorid 用户id
     * @param null $limit
     * @param null $start
     * @return array
     */
    public function getFolder($spaceid,$type=1,$parentid = 0,$creatorid=0,$limit = null,$start = null){
        if(empty($spaceid)){
            return array();
        }
        if($type == 1){
            //个人文档区分用户
            $sql = "SELECT B.* FROM `tb_file_folder` AS B WHERE (type = ?) AND (isvisible =0) AND (spaceid =  ?) AND (creatorid = ?) ORDER BY `sortvalue` ASC";
            $parr = array($type,$spaceid,$creatorid);
        }else{
            $sql = "SELECT B.* FROM `tb_file_folder` AS B WHERE (type =?) AND (isvisible =0) AND (spaceid = ?)  AND (parentid = ?) ORDER BY `sortvalue` ASC";
            $parr = array($type,$spaceid,$parentid);
        }
        if($limit){
            $sql .= " LIMIT $start , $limit";
        }
        $rs = $this->db->query($sql,$parr);
        return $rs->result_array();
    }

    /**
     * 查询（设置管理员的）文件夹中，用户是否有权限上传文档到文件夹
     * @param $spaceid
     * @param int $creatorid
     * @param int $boxId
     * @param int $type
     * @return string
     */
    public function FileBoxsetByUid($spaceid,$creatorid= 0,$boxId = 0,$type=1){
        if(!$creatorid || !$boxId) return '';
        $boxInfo = $this->getFileBoxById($boxId);//文件夹信息
        if($type == 1){
            //upset 0 只有站点管理员 1 只有设置的成员 2 两者都有
            $isadmin = 0;
            if(empty($boxInfo['upset']) || $boxInfo['upset'] == 2){//站点管理员设置都可以
            $isadmin = 1;
            }
            //检查是否是管理员
            $res = 1;//管理员直接能上传文档
            if($res && $isadmin){
            return true;
            }
        }
        if($type == 2){
            if(empty($boxInfo['viewset'])){ //全体成员都可浏览
            return true;
            }
        }
        if($type == 1){
            $sql = "SELECT * FROM tb_file_boxset WHERE creatorid =? AND bid = ? AND type = ?";
            //上传者也可以浏览文档
            $parr = array($creatorid,$boxId,$type);
        }else{
            $sql = "SELECT * FROM tb_file_boxset WHERE creatorid =? AND bid = ?";
            $parr = array($creatorid,$boxId);
        }
        $where['creatorid = ?'] = $creatorid;
        $where['bid = ?'] = $boxId;
        $rs   = $this->db->query($sql,$parr);
        $affected = $this->db->affected_rows();
        return $affected > 0 ? true : false;
    }

    /**
     * 根据文件夹id获取文件夹信息
     * @param $folderId
     * @return string
     */
    public function getFolderById($folderId){
        if(!$folderId) return '';
        $rs = $this->db->query("SELECT * FROM tb_file_folder WHERE id = ? AND isvisible = 0",array($folderId));
        return $rs->row_array();
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
     * 更新表内容
     * @param $table
     * @param $values
     * @param $where
     * @param array $orderby
     * @param bool $limit
     * @return mixed
     */

    public function updateTable($table,$values,$where,$orderby = array(), $limit = FALSE){
        $this->db->trans_begin();
        $sql = $this->db->_update($table,$values,$where,$orderby,$limit);
        $this->db->query($sql);
        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
        }else{
            $affected = $this->db->affected_rows();
            $this->db->trans_commit();
            return $affected;
        }
    }

    /**
     * 查询某文件夹下是否有子类
     * @param $folderid
     * @return bool
     */
    public function isHaveChild($folderid){
	$rs = $this->db->query("SELECT * FROM tb_file_folder WHERE isvisible = 0 AND parentid = ?",array($folderid));
	$affected = $this->db->affected_rows();
	return $affected > 0 ? true : false;
    }

    /**
     * 根据id删除文件夹
     * @param $folderid
     * @return mixed
     */
    public function delFolderById($folderid){
        $this->db->trans_begin();
        $rs = $this->db->query("UPDATE  tb_file_folder SET isvisible = 1 WHERE id = ?",array($folderid));
        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
        }else{
            $affected = $this->db->affected_rows();
            $this->db->trans_commit();
            return $affected;
        }
    }

    /**
     * 查询某文档是否共享给某人
     * @param $fileid
     * @param $toid
     * @return bool
     */
    public function isHaveShare($fileid,$toid){
        $rs = $this->db->query("SELECT id FROM tb_file_share WHERE fileid = ? AND toid = ?",array($fileid,$toid));
        $affected = $this->db->affected_rows();
        return $affected > 0 ? true : false;
    }

    /**
     * 获取文档列表
     * @param $andwhere
     * @param string $orderby
     * @param array $orwhere
     * @param null $limit
     * @param null $start
     * @return mixed
     */
        public function getFiles($andwhere,$orderby = "F.createtime",$orwhere = array(),$limit = null,$start = null){
        $sql = "SELECT F.*,S.url,S.filetype,E.name,E.imageurl,E.id AS employeeid FROM tb_file AS F LEFT JOIN tb_resource_ref AS SF ON F.id = SF.refid LEFT JOIN tb_resource AS S ON S.id = SF.resourceid LEFT JOIN tb_employee AS E ON F.creatorid = E.id  WHERE ";
        if($andwhere){
           $sql .= ($andwhere != '' AND count($andwhere) >=1) ? implode(" AND ", $andwhere) : '';
        }
        if($orwhere){
            $sql .= ($orwhere != '' AND count($orwhere) >=1) ? " AND ((".implode(" )OR( ", $orwhere)."))" : '';
        }
        $sql .=" AND E.id IS NOT NULL";

        if($orderby){
            $sql .= " ORDER BY ".$orderby." DESC";
        }else{
            $sql .= " ORDER BY F.createtime DESC";
        }
        if($limit){
            $sql .= " LIMIT $start , $limit";
        }
        $rs = $this->db->query($sql);
        return $rs->result_array();
    }

    /**
     * 根据文件id删除文件
     * @param $fileid
     * @return mixed
     */
    public function delFileById($fileid){
        $this->db->trans_begin();
        $rs = $this->db->query("UPDATE  tb_file SET isvisible = 0 WHERE id = ?",array($fileid));
        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
        }else{
            $affected = $this->db->affected_rows();
            $this->db->trans_commit();
            return $affected;
        }
    }

    /**
     * 根据文件id查询文档
     * @param $fileid
     * @param int $isvisible
     * @return array
     */
    public function getFileById($fileid,$isvisible = 1){
        if(!$fileid) return array();
        //避免删除父类后，子类找不到原始创建者问题
        if($isvisible){
            $sql = "SELECT * FROM tb_file WHERE id = ? AND isvisible = 1";
        }else{
            $sql = "SELECT * FROM tb_file WHERE id = ?";
        }
        $rs = $this->db->query($sql,array($fileid));
        return $rs->row_array();
    }

    /**
     * 获取共享文件
     * @param $andwhere
     * @param array $orwhere
     * @param string $orderby
     * @param null $limit
     * @param null $start
     * @return mixed
     */
    public function getShareFiles($andwhere,$orwhere = array(),$orderby = "F.createtime",$limit = null,$start = null){
	$sql = "SELECT F.*,S.url,S.filetype,E.name,E.imageurl,E.id AS employeeid FROM tb_file AS F LEFT JOIN tb_resource_ref AS SF ON F.id = SF.refid LEFT JOIN tb_resource AS S  ON S.id = SF.resourceid LEFT JOIN tb_file_share AS FS ON F.id = FS.fileid LEFT JOIN tb_employee AS E ON F.creatorid = E.id    WHERE  ";

	if($andwhere){
	    $sql .= ($andwhere != '' AND count($andwhere) >=1) ? implode(" AND ", $andwhere) : '';
	}
    $sql .=" AND E.id IS NOT NULL";
	if($orwhere){
	    $sql .= (!empty($orwhere) AND count($orwhere) >=1) ? " AND ((".implode(" )OR( ", $orwhere)."))" : '';
	}
	if($orderby){
	    $sql .= " ORDER BY ".$orderby." DESC";
	}else{
	    $sql .= " ORDER BY F.createtime DESC";
	}
	if($limit){
	    $sql .= " LIMIT $start , $limit";
	}
	$rs = $this->db->query($sql);
	return $rs->result_array();
    }

    /**
     * 根据文档id获取资源信息
     * @param $fileid
     * @return mixed
     */
    public function getResourceByRef($fileid){
        $rs = $this->db->query("SELECT * FROM tb_resource AS S LEFT JOIN tb_resource_ref AS SF ON S.id = SF.resourceid WHERE SF.refid =?",array($fileid));
        return $rs->row_array();
    }

    /**
     * 文档记录表数据是否存在
     * @param $fileid
     * @param $employeeid
     * @param $operatetype
     * @return bool
     */
    public function isHaveLog($fileid,$employeeid,$operatetype){
        $rs = $this->db->query("SELECT * FROM tb_file_userlog WHERE fileid = ? AND employeeid = ? AND operatetype = ?",array($fileid,$employeeid,$operatetype));
        $affected = $this->db->affected_rows();
        return $affected > 0 ? true : false;
    }

    /**
     * 获取文档浏览者或下载者
     * @param $fileid
     * @param $operatetype
     * @param int $start
     * @param int $limit
     * @return array
     */
    public function getUserLog($fileid,$operatetype,$start = 0,$limit = 6){
        if(empty($fileid)){
            return array();
        }
        $rs = $this->db->query("SELECT E.name,E.imageurl,E.id FROM tb_file_userlog AS U LEFT JOIN tb_employee AS E ON U.employeeid = E.id WHERE U.fileid IN ($fileid)  AND U.operatetype = ? AND E.name IS NOT NULL GROUP BY E.id LIMIT ?,?",array($operatetype,$start,$limit));
        return $rs->result_array();
    }

    public function getUserLogCount($fileid,$operatetype){
        if(empty($fileid)){
            return array();
        }
        $rs = $this->db->query("SELECT COUNT(DISTINCT(E.id)) AS count FROM tb_file_userlog AS U LEFT JOIN tb_employee AS E ON U.employeeid = E.id WHERE U.fileid IN ($fileid)  AND U.operatetype = ? AND E.name IS NOT NULL",array($operatetype));
        return $rs->row_array();
    }

    /**
     * 根据文件id获取共享人信息
     * @param $fileid
     * @return array
     */
    public function getFileShareMember($fileid,$start = 0,$limit = 6){
        if(empty($fileid)){
            return array();
        }
        $rs = $this->db->query("SELECT  E.name,E.id,E.imageurl,S.fileid FROM tb_file_share AS S LEFT JOIN tb_employee AS  E ON S.toid = E.id WHERE S.fileid IN(".$fileid.") AND E.name IS NOT NULL GROUP BY E.id LIMIT ?,?",array($start,$limit));
        return $rs->result_array();
    }

    public function getFileShareMemberCount($fileid){
        if(empty($fileid)){
            return false;
        }
        $rs = $this->db->query("SELECT  COUNT(DISTINCT(S.id)) AS count FROM tb_file_share AS S LEFT JOIN tb_employee AS E ON S.toid = E.id WHERE S.fileid IN(".$fileid.") AND E.name IS NOT NULL");
        return $rs->row_array();
    }

    public function delFileShare($fileid,$member_id){
        if(empty($fileid) || empty($member_id)){
            return false;
        }
        $this->db->trans_begin();
        $rs = $this->db->query("DELETE FROM tb_file_share WHERE fileid = ? AND toid = ?",array($fileid,$member_id));
        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
        }else{
            $affected = $this->db->affected_rows();
            $this->db->trans_commit();
            return $affected > 0 ? true : false;
        }
    }
    /**
    * 统计文档总数
    * @author	hejinlong
    * @param	int		$groupId	群组id
    * @return	array
    */
    public function getGroupFileTotal($groupId){
        $rs = $this->db->query( 'SELECT count(id) as num FROM tb_file WHERE fromid =? AND isvisible = 1 AND fromtype = 108', array($groupId));
        return $rs->result_array();
    }

    /**
     * 获取一个文档的所有版本id
     * @param $spaceid
     * @param $parentid
     * @param int $isnew
     * @return mixed
     */
    public function getFileIdsByWhere($spaceid,$parentid,$isnew = 0){
        $sql = "SELECT id FROM tb_file WHERE spaceid = ? AND (ancestorids Like '|".$parentid."|%' OR id = '".$parentid."') ";
        if($isnew){
            $sql .=" AND isvisible = 1 AND isleaf = 1  LIMIT 1";
        }
        $rs = $this->db->query($sql,array($spaceid));
        if($isnew){
            return $rs->row_array();
        }
        return $rs->result_array();
    }

    /**
     * 根据一组id获取文件信息
     * @param $fileids
     * @return mixed
     */
    public function getFeedFilesByIds($fileids){
        $sql = "SELECT F.id,F.title,F.content,F.createtime,S.url,S.filetype FROM tb_file AS F LEFT JOIN tb_resource_ref AS SF ON F.id = SF.refid LEFT JOIN tb_resource AS S ON S.id = SF.resourceid  WHERE F.id IN($fileids) AND F.isvisible = 1";
        $rs = $this->db->query($sql);
        $tmpList = $rs->result_array();
        $data = array();
        foreach($tmpList as $row){
            $tmp = array_values(array_slice($row, 0, 1));
            $data[$tmp[0]] = $row;
        }
        return $data;
    }

    /**
     * 获取我关注的文件列表
     * @param $spaceid
     * @param $employeeid
     * @return array
     */
    public function getFollowedFiles($spaceid,$employeeid){
        if(!$spaceid && !$employeeid){
            return array();
        }
        $sql = "SELECT F.id,F.title,E.id AS employeeid,E.name,E.imageurl,F.createtime FROM tb_file AS F LEFT JOIN tb_followed AS Fed ON F.id = Fed.followid LEFT JOIN tb_employee AS E ON Fed.employeeid = E.id WHERE Fed.followtype = 109 AND E.name IS NOT NULL AND F.isvisible = 1 AND F.isleaf = 1 AND
         F.spaceid = ? AND Fed.employeeid = ?";
        $rs = $this->db->query($sql,array($spaceid,$employeeid));
        return $rs->result_array();

    }

}