<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Zhuna
 * Date: 13-3-4
 * Time: 下午5:13
 * To change this template use File | Settings | File Templates.
 */

class Dept_model extends  CI_Model{

    public function __construct(){
        $this->load->database('default');
    }

    /**
     * 获得部门的所有子部门信息，如果不传，默认为所有一级部门
     * @param int $spaceid 空间id
     * @param int $deptid 部门id
     * @param int $status 状态(1为正常 2为撤销 3为删除)
     */
    public function findChildren($spaceid, $deptid = 0, $status = -1){
        $statusSql = '';
        $param = array($spaceid, $deptid);
        if($status >= 0){
            $statusSql = ' AND d.status=?';
            array_push($param, $status);
        }
        $rs = $this->db->query('SELECT d.id AS id, d.name AS name, d.remark AS remark, d.managerid AS managerid, d.ancestorids AS depth, d.isleaf AS isleaf FROM tb_dept d WHERE d.spaceid=? AND d.parentid=?' . $statusSql, $param);
        return $rs->result_array();
    }

    /**
     * 根据部门id获得该部门下的子、孙部门的员工数
     * @param int $deptid           部门id
     * @param int $spaceid          空间id
     * @param string $depth         部门深度（祖先序列）
     * @param string $firstLetter   员工姓名首字母
     * @param string $name          员工姓名
     * @param int $status           员工状态：0-未激活，1-正常，2-停用
     */
    public function findSomeEmployeeNumByDeptidAndFirstletter($deptid = 0, $spaceid = 0, $depth = '', $firstLetter = '', $name = '', $status = 1){
        $sql = "SELECT COUNT(1) AS num FROM tb_employee AS E INNER JOIN tb_dept AS D ON E.deptid=D.id WHERE 1";
        if($spaceid){
            $sql .= " AND E.spaceid={$spaceid}";
        }
        if($firstLetter){
            $firstLetter = strtolower($firstLetter);
            $sql .= " AND E.firstletter='{$firstLetter}'";
        }
        if($name){
            $sql .= " AND E.name LIKE '{$name}%'";
        }
        if($status >= 0){
            $sql .= " AND E.status={$status}";
        }
        if( !$depth){
            $sql .= " AND ancestorids LIKE (SELECT CONCAT(ancestorids, id, '%') FROM tb_dept AS D WHERE D.id= {$deptid})";
        } else{
            $depth .= $deptid;
            $sql .= " AND ancestorids LIKE '{$depth}%'";
        }
        $rs = $this->db->query($sql);
        return $rs->row()->num;
    }

    /**
     * 根据部门id获得该部门下的子、孙部门的员工
     * @param int $deptid           部门id
     * @param int $spaceid          空间id
     * @param string $depth         部门深度（祖先序列）
     * @param string $firstLetter   员工姓名首字母
     * @param string $name          员工姓名
     * @param int $status           员工状态：0-未激活，1-正常，2-停用
     */
    public function findSomeEmployeeByDeptidAndFirstletter($deptid = 0, $spaceid = 0, $depth = '', $firstLetter = '', $name='', $status = 1, $limit = 0, $offset = 0){
        $sql = "SELECT E.id,E.name,E.imageurl,E.duty,E.email,E.mobile,E.phone,E.deptid,D.name AS deptName FROM tb_employee AS E INNER JOIN tb_dept AS D ON E.deptid=D.id WHERE 1";
        if($spaceid){
            $sql .= " AND E.spaceid={$spaceid}";
        }
        if($firstLetter){
            $firstLetter = strtolower($firstLetter);
            $sql .= " AND E.firstletter='{$firstLetter}'";
        }
        if($name){
            $sql .= " AND E.name LIKE '{$name}%'";
        }
        if($status >= 0){
            $sql .= " AND E.status={$status}";
        }
        if( !$depth){
            $sql .= " AND ancestorids LIKE (SELECT CONCAT(ancestorids, id, '%') FROM tb_dept AS D WHERE D.id= {$deptid})";
        } else{
            $depth .= $deptid;
            $sql .= " AND ancestorids LIKE '{$depth}%'";
        }
        if($limit || $offset){
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }
        $rs = $this->db->query($sql);
        return $rs->result_array();
    }

    /**
     * 获取集团型空间的信息
     * @param int $id   集团空间ID
     */
    public function getSpaceGroupInfo($id = 0){
        $rs = $this->db->query('SELECT * FROM tb_space_group WHERE id=? LIMIT 1', array($id));
        return $rs->result_array();
    }

    /**
     * 获取集团型空间的部门列表(根据所属它下面的空间所创建的部门的名称)
     * @param int $id       集团空间ID
     * @param int $status   部门状态(1为正常 2为撤销 3为删除)
     * @param array $cols   部门列表字段
     * @param int $limit    查选条数
     * @param int $offset   记录偏移量
     */
    public function getSpaceGroupDeptList($id = 0, $status = -1, $cols = array('*'), $limit = 0, $offset = 0){
        $str = '';
        $temp = array();
        foreach($cols as $k => $v){
            $temp[] = "D.{$v}";
        }
        $str = implode(',', $temp);
        $sql = "SELECT {$str} FROM tb_space AS S INNER JOIN tb_dept AS D ON S.id=D.spaceid WHERE S.groupid={$id} AND D.parentid=0";
        if($status >= 0){
            $sql .= " AND D.status={$status}";
        }
        if($limit || $offset){
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }
        $rs = $this->db->query($sql);
        return $rs->result_array();
    }

    /**
     * 根据部门id获取部门信息
     * @param $deptid
     * @param string $cols
     * @return mixed
     */
    public function getDeptInfoById($deptid,$cols = "*"){
        $rs = $this->db->query("SELECT $cols FROM tb_dept WHERE id = ?",array($deptid));
        return $rs->row_array();
    }
}