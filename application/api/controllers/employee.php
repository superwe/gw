<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: LiSheng
 * Date: 13-5-3
 * Time: 上午11:14
 * To change this template use File | Settings | File Templates.
 */

class Employee extends CI_Controller {

    public function __construct(){
        parent::__construct();
    }


    /**
     * 获取某部门的人的信息
     *  deptid 部门ID
     *  ancestorids 部门祖先IDs
     * add  by lisheng
     * 2013-05-03
     */
    public function getDeptEmployee()
    {
        $deptid = isset($_POST['deptid']) ? intval($_POST['deptid']) : -1;
        $ancestorids = isset($_POST['ancestorids']) ? $_POST['ancestorids'] : '';

        $ancestorids = $ancestorids.$deptid.'|';

        $this->load->database('default');
        $query = $this->db->query(
            "select a.name,a.email,a.imageurl,b.name as deptname,a.duty from tb_employee as a
            left join tb_dept as b on a.deptid=b.id
            where a.status=1 and (a.deptid=? or a.deptid in (select id from tb_dept where ancestorids like '".$ancestorids."%' )) "
             ,array($deptid));

        echo json_encode($query->result());
    }

    /**
     * 根据关键字获取所有的人的信息
     * pid 人员的personid
     * searchKey 查询关键字
     * searchType 查询类型  2 按姓名  3 按部门名称  6 按姓名或部门名称
     * add by lisheng 2013-05-03
     */
    public function getEmployee()
    {
        $personid = 1;//isset($_POST['pid']) ? intval($_POST['pid']) : 0;
        $searchKey = isset($_POST['searchKey']) ? $_POST['searchKey'] : '';
        $searchType =  isset($_POST['searchType']) ? intval($_POST['searchType']) : 0;

        $where='';
        if($searchKey != '')
        {
            if( $searchType == 2){ //按姓名
                $where = " and a.name like '%".$searchKey."%' ";
            }
            else if( $searchType == 3){ //按部门名称
                $where = " and b.name like '%".$searchKey."%' ";
            }
            else if($searchType == 6){  //按姓名或部门名称
                $where = " and (a.name like '%".$searchKey."%' or b.name like '%".$searchKey."%')";
            }
        }

        $this->load->database('default');
        $query = $this->db->query(
            'select a.name,a.email,a.imageurl,b.name as deptname,a.duty from tb_employee as a
            left join tb_dept as b on a.deptid=b.id
            where a.status=1 and a.spaceid in (select distinct spaceid from tb_employee where personid=?)
            '.$where,array($personid));

        echo json_encode($query->result());
    }


}