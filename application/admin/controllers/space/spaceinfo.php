<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: lisheng
 * Date: 13-4-12
 * Time: 下午09:11
 * To invite users.
 */

class Spaceinfo extends CI_Controller {

    private $spaceId; //空间id
    public function __construct()
    {
        parent::__construct();

       $this->load->helper('cache');
        $this->spaceId = QiaterCache::spaceid();
    }

    public function index(){

        $this->load->database('default');
        $query=$this->db->query('SELECT id,name,introduce,emaildomain,createtime,logoid,logourl,toplogoid,toplogourl,contactperson FROM tb_space where id=?',array($this->spaceId));
        $rt = $query->row();
        $rt->logourl= $this->config->item('resource_url').$rt->logourl;
        $rt->toplogourl= $this->config->item('resource_url').$rt->toplogourl;
        $data['space'] = $rt;
        $this->load->library('smarty');
        $this->smarty->view('space/spaceinfo.tpl',$data);
    }

    /**
     * 保存空间信息
     */
    public function saveSpaceInfo(){
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $name =  isset($_POST['name']) ? $_POST['name'] : '';
        $introduce =  isset($_POST['introduce']) ? $_POST['introduce'] : '';
        $contactperson =  isset($_POST['contactperson']) ? $_POST['contactperson'] : '';
        $islogoupdate =  isset($_POST['islogoupdate']) ? $_POST['islogoupdate'] : '';//企业logo是否更新
        $istoplogoupdate =  isset($_POST['istoplogoupdate']) ? $_POST['istoplogoupdate'] : '';//顶部logo是否更新

        $this->load->model("resource_model","resource");
        if($islogoupdate == "1")
        {
            $logodata = $this->resource->addFiles("logo");
            $logoid =  $logodata["resourceid"];
            $logourl =   $logodata["filepath"];
        }
        if($istoplogoupdate == "1")
        {
            $toplogodata = $this->resource->addFiles("toplogo");
            $toplogoid =  $toplogodata["resourceid"];
            $toplogourl = $toplogodata["filepath"];
        }
        $this->load->database('default');
        $this->db->query(
            'UPDATE tb_space SET name=?,introduce=?,logoid=?,logourl=?,toplogoid=?,toplogourl=?,contactperson=? WHERE id =?',
            array($name,$introduce,$logoid,$logourl,$toplogoid,$toplogourl,$contactperson,$id));

        echo 0;
    }
}

/* End of file Inviteuser.php */
/* Location: ./application/controllers/welcome.php */