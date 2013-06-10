<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: Zhuna
 * Date: 13-3-4
 * Time: 上午11:14
 * To change this template use File | Settings | File Templates.
 */

class Dept extends CI_Controller {
    private $spaceid = 123;//因为没有登录功能，自定义登录后的spaceid，测试用演示过后删除掉。
    /**
     * 前台通讯录首页
     * @param int $spaceid 空间id
     */
    public function index($spaceid = 0){
        if( empty($spaceid)){//如果空间id为空，那么取当前登陆的空间id
            $this->load->library('session');
            $spaceid =$this->session->userdata('spaceid');
        }
        $spaceid = $this->spaceid;//test
        $data = array('firstletter'=>range('A', 'Z'), 'spaceid'=>$spaceid);
        $this->load->library('smarty');
        $this->smarty->view('employee/dept/index.tpl', $data);
    }

    /**
     * 通讯录左侧树的数据来源
     * @param int $deptid 部门id
     * @param int $spaceid 空间id
     */
    public function tree($deptid = 0, $spaceid = 0){
        if( empty($spaceid)){//如果空间id为空，那么取当前登陆的空间id
            $this->load->library('session');
            $spaceid =$this->session->userdata('spaceid');
        }
        $spaceid = $this->spaceid;//test
        $this->load->model('dept_model', 'dept');
        $rs = $this->dept->findChildren($spaceid, $deptid);
        echo json_encode($rs);
    }

    /**
     * 通讯录右侧成员列表的数据来源
     * @param int $spaceid i空间id
     * @param int $deptid 部门id
     * @param string $firstletter 员工姓名首字母
     */
    public function member($spaceid = 0, $deptid = 0, $firstletter = ''){
        if( empty($spaceid)){//如果空间id为空，那么取当前登陆的空间id
            $this->load->library('session');
            $spaceid =$this->session->userdata('spaceid');
        }
        $spaceid = $this->spaceid;//test
        //@param string $depth 部门深度（祖先序列）
        $depth =$_POST['depth'];
        $this->load->model('dept_model', 'dept');
        $rs = $this->dept->findSomeEmployeeByDeptidAndFirstletter($spaceid, $deptid, $depth, $firstletter);
        echo json_encode($rs);
    }
}