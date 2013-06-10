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
     */
    public function findChildren($spaceid, $deptid = 0){
        $rs = $this->db->query(
                            'SELECT d.id AS id, d.name AS name, d.remark AS remark, d.managerid AS managerid, d.ancestorids AS depth
                            FROM tb_dept d WHERE d.spaceid=? AND d.parentid=?', array($spaceid, $deptid));
        return $rs->result_array();
    }

    /**
     * 根据部门id获得该部门下的员工
     * @param int $spaceid 空间id
     * @param int $deptid 部门id
     * @param string $depth 部门深度（祖先序列）
     * @param string $firstletter 员工姓名首字母
     */
    public function findSomeEmployeeByDeptidAndFirstletter($spaceid, $deptid = 0, $depth = '', $firstletter = ''){
        $params = array($spaceid);
        $firstletterSql = $deptidSql = '';
        if($deptid){
            $deptidSql = ' AND d.ancestorids like ?' ;
            array_push($params, $depth . $deptid . "%");
        }
        if($firstletter){
            $firstletterSql = ' AND e.firstletter=?';
            $firstletter = strtolower($firstletter);
            array_push($params, $firstletter);
        }

        $rs = $this->db->query(
                    'SELECT e.id AS id, e.name AS name, e.duty AS duty, d.name AS dept, e.createtime AS created  FROM tb_employee e
                     LEFT JOIN tb_dept d ON d.id=e.deptid
                    WHERE e.spaceid=? ' . $deptidSql . $firstletterSql, $params);
        return $rs->result_array();
    }
}