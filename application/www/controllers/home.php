<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Home extends CI_Controller {

    /**
    * 登录页控制器构造函数
    */
    public function __construct()
    {
        parent::__construct();
        $this->load->model('login_model', 'login');
        $this->load->helper('cache');
    }

    /**
    * 首页|个人主页
    */
	public function index()
	{
        //上次页面url
        $ref = empty($_GET['ref']) ? 'employee/home/index' : $_GET['ref'];
        $ref = $ref.'.html';
        parse_str($_SERVER['QUERY_STRING'],$_GET);
        $email = trim(isset($_GET['email']) ? $_GET['email'] : '');
        $data['ref'] = $ref;
        $data['email'] = $email;
        $data['errorMessage'] = '';
        $this->load->library('smarty');

        if($email == '')
        {
            $email=empty($_COOKIE['qiater_user'])?'':$_COOKIE['qiater_user'];//获取用户ID
            $autoLogin=empty($_COOKIE['qiater_autologin'])?0:$_COOKIE['qiater_autologin'];//获取用户密码
            if(empty($email))
            {
                $this->smarty->view('index.tpl',$data);
            }
            else
            {
                if($autoLogin==0)
                {
                    redirect($this->config->base_url().$ref);
                }
                else
                {
                    $this->verityAutoLogin($this->login->decrypt($email),$autoLogin,$ref);
                }
            }
        }
        else
        {
            $this->smarty->view('index.tpl',$data);
        }
    }

    /**
    * 验证密码
    */
    public function verityPassword()
    {
        $email= empty($_POST['email'])?'':$_POST['email'];
        $email = trim($email);
        $password=empty($_POST['pwd'])?'':$_POST['pwd'];
        if(trim($password)=='')
        {
            echo '请输入密码!';
        }
        else
        {
            if (!$this->login->verifyPassword($email,$password))
            {
                echo  '您输入的密码和账户名不匹配,请重新输入.';
            }
        }
    }

    /**
    * 退出系统
    */
    public function quit()
    {
        $ref = empty($_GET['ref']) ? '' : $_GET['ref'];
        $email = $this->input->cookie('qiater_user');
        $email = $this->login->decrypt($email);
        QiaterCache::deleteAll($email);
        delete_cookie('session_id');
        delete_cookie('qiater_user');
        delete_cookie('qiater_autologin');
        if(empty($ref))
        {
            redirect($this->config->base_url().'home/index.html');
        }
        else
        {
            redirect($this->config->base_url().'home/index.html?ref='.$ref);
        }
    }

    /**
    * 验证用户名或邮箱
    */
    public function verityUser()
    {
        $email = empty($_POST['email'])?'':$_POST['email'];
        $email = trim($email);
        if($email=='')
        {
            $data = '请输入邮箱或用户名!';
        }
        else
        {
            $data = $this->login->verityUser($email);
        }
        echo $data;
    }

    /**
    * 登录个人主页
    */
    public function login()
    {
        $autoLogin = empty($_POST['autologin'])?0:$_POST['autologin'];
        $email = empty($_POST['txtUser'])?'':$_POST['txtUser'];
        $password= empty($_POST['txtPwd'])?0:$_POST['txtPwd'];
        $ref = empty($_POST['ref'])?'employee/home/index.html':$_POST['ref'];
        $this->verityLogin($email,$password,$autoLogin,$ref);
    }

    /**
    * 自动登录的验证
    */
    private function verityAutoLogin($email,$autoLogin,$ref)//$password
    {
        $data=$this->login->getUserInfo($email);
        if(empty($data))
        {
            delete_cookie('qiater_user');
            delete_cookie('qiater_autologin');
            $data['email'] = $email;
            $this->load->library('smarty');
            $data['errorMessage'] = '您的用户名不存在或已注销!';
            $data['ref'] = '';
            $this->smarty->view('index.tpl',$data);
        }
        else
        {
            $spaceId = $data['spaceId'];
            $personId = $data['personId'];
            $salt = $data['salt'];
            $employeeId = $data['employeeId'];

            $employeeInfo = [];
            $employeeInfo['id'] = $employeeId;
            $employeeInfo['name'] = $data['employeeName'];
            $employeeInfo['imageurl'] = $data['employeeLogo'];

            $spaceInfo = [];
            $spaceInfo['id'] = $spaceId;
            $spaceInfo['name'] = $data['spaceName'];
            $spaceInfo['imageurl'] = $data['spaceLogo'];
            $spaceInfo['groupid'] = $data['groupid'];
            $spaceInfo['type'] = $data['type'];

            $appList = [];
            //$dataList['innerSpaceList'] = [];
            //$dataList['outerSpaceList'] = [];

            $ip = $this->input->ip_address();
            $sessionId=md5($email.$ip.$salt);

            QiaterCache::salt($email, $salt);
            QiaterCache::appList($appList);
            QiaterCache::spaceid($spaceId, $sessionId);
            QiaterCache::personid($personId, $sessionId);
            QiaterCache::employeeid($employeeId, $sessionId);
            QiaterCache::spaceInfo($spaceInfo, $sessionId);
            QiaterCache::employeeInfo($employeeInfo, $sessionId);

            $this->input->set_cookie('session_id',$sessionId,60*60*24*7);
            $this->input->set_cookie('qiater_autologin',$autoLogin,60*60*24*7);
            $this->input->set_cookie('qiater_user',$this->login->encrypt($email),60*60*24*7);

            redirect($this->config->base_url().$ref);
        }
    }

    /**
    * 登录验证
    */
    private  function verityLogin($email,$password,$autoLogin,$ref)
    {
        $email = trim($email);
        $data=$this->login->getUserInfo($email);
        if(empty($data))
        {
            $data['email'] = $email;
            $this->load->library('smarty');
            $data['errorMessage'] = '您的用户名不存在或已注销!';
            $data['ref'] = '';
            $this->smarty->view('index.tpl',$data);
        }
        else
        {
            if($this->login->verityHash($password,$data['password']))
            {
                $spaceId = $data['spaceId'];
                $personId = $data['personId'];
                $employeeId = $data['employeeId'];

                $employeeInfo = [];
                $employeeInfo['id'] = $employeeId;
                $employeeInfo['name'] = $data['employeeName'];
                $employeeInfo['imageurl'] = $data['employeeLogo'];

                $spaceInfo = [];
                $spaceInfo['id'] = $spaceId;
                $spaceInfo['name'] = $data['spaceName'];
                $spaceInfo['imageurl'] = $data['spaceLogo'];
                $spaceInfo['groupid'] = $data['groupid'];
                $spaceInfo['type'] = $data['type'];
                
                $appList = [];
                //$dataList['innerSpaceList'] = [];
                //$dataList['outerSpaceList'] = [];
                $salt = $this->login->getRandom();
                $this->login->updateSalt($personId,$salt);
                $ip = $this->input->ip_address();

                $sessionId=md5($email.$ip.$salt);

                QiaterCache::salt($email, $salt);
                QiaterCache::appList($appList);
                QiaterCache::spaceid($spaceId, $sessionId);
                QiaterCache::personid($personId, $sessionId);
                QiaterCache::employeeid($employeeId, $sessionId);
                QiaterCache::spaceInfo($spaceInfo, $sessionId);
            	QiaterCache::employeeInfo($employeeInfo, $sessionId);

                $this->input->set_cookie('qiater_autologin',$autoLogin,60*60*24*7);
                $this->input->set_cookie('qiater_user',$this->login->encrypt($email),60*60*24*7);
                $this->input->set_cookie('session_id',$sessionId,60*60*24*7);
                redirect($this->config->base_url().$ref);
            }
            else
            {
                $data['email'] = $email;
                $this->load->library('smarty');
                $data['errorMessage'] = '您输入的密码和账户名不匹配,请重新输入.';
                $data['ref'] = '';
                $this->smarty->view('index.tpl',$data);
            }
        }
    }

    /**
    * 用户注册创建企业空间
    */
    public  function createSpace()
    {
        $companyName =  isset($_POST['spaceFullName']) ? $_POST['spaceFullName'] : '';
        $spaceName = isset($_POST['spaceShortName']) ? $_POST['spaceShortName'] : '';
        $email = isset($_POST['email']) ? $_POST['email'] : '';
        $decryptEmail = $this->login->decrypt($email);//解密后的明文邮箱名
        $password = isset($_POST['password']) ? $_POST['password'] : '';

        $list = $this->login->creatSpace($companyName,$spaceName,$decryptEmail,$password);
        $employeeId = $list['employeeId'];
        if ($employeeId == 0)
        {
            redirect($this->config->base_url().'home/registerSpace.html?email='.$email.'&password='.$password);
        }
        else
        {
            $spaceId = $list['spaceId'];
            //更新全文搜索 begin
            $rs=$this->db->query('select name,createtime from tb_employee where id=?', array($employeeId));
            $name = $rs->row()->name;
            $name=empty($name)?'':$name;
            $datetime=$rs->row()->createtime;
            $this->load->model('indexes_model', 'indexes');
            $type = 'employee';
            $data = array('id' => $employeeId, 'spaceid' => $spaceId, 'url' => 'employee/homepage/index/'.$spaceId.'/'.$employeeId.'.html', 'date' => $datetime, 'title' => $name, 'content' => $decryptEmail);
            $this->indexes->create($type, $data);
            //更新全文搜索 end

            $this->employeeHead($data);
            //redirect($this->config->base_url().'home/employeeHead.html?employeeid='.$employeeId);
        }
    }

    /**
    * 判断企业空间名是否存在
    */
    public function hasSameSpace()
    {
        $data='';
        $spaceName = isset($_POST['spaceShortName']) ? $_POST['spaceShortName'] : '';
        if(trim($spaceName)=='')
        {
            $data = '空间名称不能为空,请填写!';
        }
        else
        {
            if(strlen($spaceName)>24)
            {
                $data = '空间名称限制在8个汉字以内!';
            }
            else
            {
                if($this->login->exist('select id from tb_space where name=?',array($spaceName)))
                {
                    $data = '该空间名称已存在,请重写填写!';
                }
            }
        }
        echo $data;
    }

    /**
    * 创建企业空间页
    */
    public function registerSpace()
    {
        parse_str($_SERVER['QUERY_STRING'],$_GET);
        $this->load->library('smarty');
        $data['email'] =  isset($_GET['email']) ? $_GET['email'] : '';
        $data['password'] = isset($_GET['password']) ? $_GET['password'] : '';
        $data['ex'] = isset($_GET['ex']) ? $_GET['ex'] : 0;
        $this->smarty->view('registercompany.tpl',$data);
    }

    /**
    * 判断企业全称是否存在
    */
    public function hasSameCompany()
    {
        $data='';
        $companyName =  isset($_POST['spaceFullName']) ? $_POST['spaceFullName'] : '';
        if(trim($companyName)=='')
        {
            $data = '企业名称不能为空,请填写!';
        }
        else
        {
            if($this->login->exist('select id from tb_company where name=?',array($companyName)))
            {
                $data = '该企业名称已存在,请重写填写!';
            }
        }
        echo $data;
    }

    /**
    * 发送邮件
    */
    public function senderemail()
    {
        $mailTo =  isset($_POST['txtEmail']) ? trim($_POST['txtEmail']) : '';
        $title = '企业空间找回密码';
        $url = 'http://gw.com/home/reset.html?email='.$this->login->encrypt($mailTo) ;
        $content = 'hi,'.$mailTo.'<br/>感谢您使用畅捷通企业空间，您已经提交找回密码的申请， <br>请点击以下链接修改您的登录密码。<br/><a href="'.$url.'" >'.$url.'</a>';

        $from = 'newesn@126.com';

        if( $this->login->sendEmail($mailTo,$from,$title,$content))
        {
            $this->subEmail($mailTo);
        }
    }

    /**
    * 进入重新发送邮件页面
    */
    public function subEmail($email)
    {
        $this->load->library('smarty');
        $data['email'] = $email;
        $this->smarty->view('sendemail.tpl',$data);
    }

    /**
    * 设置密码页面
    */
    public function reset()
    {
        $email =  isset($_GET['email']) ? trim($_GET['email']) : '';
        $email = $this->login->decrypt($email);
        $this->load->library('smarty');
        $data['email'] = $email;
        $this->smarty->view('reset.tpl',$data);
    }

    /**
    * 设置密码成功后跳转页面
    */
    public function resetPwd()
    {
        $email =  isset($_POST['txtEmail']) ? trim($_POST['txtEmail']) : '';
        $pwd =  isset($_POST['txtPwd']) ? trim($_POST['txtPwd']) : '';
        if($this->login->resetPassword($email,$pwd))
        {
            $this->load->library('smarty');
            $this->smarty->view('resetsuccess.tpl');
        }
    }

    //联系我们
    public function contact()
	{
        $this->load->library('smarty');
        $this->smarty->view('contact.tpl');
    }

    //全球组织社会化协同
    public function forglobal()
    {
        $this->load->library('smarty');
        $this->smarty->view('forglobal.tpl');
    }

    //畅捷通企业空间介绍
    public function chanlink()
    {
        $this->load->library('smarty');
        $this->smarty->view('chanlink.tpl');
    }

    //视频介绍
    public function video()
    {
        $this->load->library('smarty');
        $this->smarty->view('video.tpl');
    }

    //组织内部协同介绍
    public function inter()
    {
        $this->load->library('smarty');
        $this->smarty->view('inter.tpl');
    }

    //产品链协同介绍
    public function industry()
    {
        $this->load->library('smarty');
        $this->smarty->view('industry.tpl');
    }

    //社会化商业协同
    public function business()
    {
        $this->load->library('smarty');
        $this->smarty->view('business.tpl');
    }

    //常见问题
    public function problem()
    {
        $this->load->library('smarty');
        $this->smarty->view('problem.tpl');
    }

    //用户指南
    public function guide()
    {
        $this->load->library('smarty');
        $this->smarty->view('guide.tpl');
    }

    //忘记密码
    public function findpassword()
    {
        $this->load->library('smarty');
        $this->smarty->view('lostpassword.tpl');
    }

    //更新记录
    public function update()
    {
        $this->load->library('smarty');
        $this->smarty->view('update.tpl');
    }

    //关于我们
    public function about()
    {
        $this->load->library('smarty');
        $this->smarty->view('about.tpl');
    }

    //客户端下载
    public function download()
    {
        $this->load->library('smarty');
        $this->smarty->view('download.tpl');
    }

    //成为运营商
    public function operator()
    {
        $this->load->library('smarty');
        $this->smarty->view('operator.tpl');
    }

    //为何使用
    public function why()
    {
        $this->load->library('smarty');
        $this->smarty->view('why.tpl');
    }

    //新用户注册页
    public function registeruser()
    {
        $this->load->library('smarty');
        $this->smarty->view('register.tpl');
    }

    //完善企业信息
    public function companyInfo()
    {
        $this->load->library('smarty');
        $this->smarty->view('companyInfo.tpl');
    }

    //完善用户头像信息
    public function employeeHead($data)
    {
        if(empty($data))
        {
            $data = [];
        }
        $this->load->library('smarty');
        $this->smarty->view('employeeHead.tpl',$data);
    }

    //完善用户资料
    public function employeeInfo()
    {
        $this->load->library('smarty');
        $this->smarty->view('employeeInfo.tpl');
    }

    //完善用户标签
    public function employeeTags()
    {
        $this->load->library('smarty');
        $this->smarty->view('employeeTags.tpl');
    }

    //用户注册时根据用户是否激活进行验证
    public function validateUser()
    {
        $mailTo =  isset($_POST['txtRegUser']) ? trim($_POST['txtRegUser']) : '';
        $password =  isset($_POST['txtRegPwd']) ? trim($_POST['txtRegPwd']) : '';
        $password = $this->login->getPasswordHash($password);//密码加密

        if($this->login->exist('select id from tb_person where  email=? and status=1',array($mailTo)))
        {
            //转向登录页面
            redirect($this->config->base_url().'home/index.html?email='.$mailTo);
        }
        else
        {
            $title = '激活您在畅捷通企业空间的账户';
            $url = 'http://gw.com/home/activeUser.html?email='.$this->login->encrypt($mailTo).'&pwd='.$password ;
            $content = 'hi,'.$mailTo.'<br/> 欢迎使用全球组织社会化协同平台畅捷通企业空间。<br>请点击以下链接完成注册激活<br/><a href="'.$url.'" >'.$url.'</a>';

            $from = 'newesn@126.com';
            if( $this->login->sendEmail($mailTo,$from,$title,$content))
            {
               //转向邮件验证页面
               redirect($this->config->base_url().'home/emailValidate.html?email='.$this->login->encrypt($mailTo).'&password='.$password);
            }
            else
            {
               echo '0';//发送失败
            }
        }
    }

    //邮件验证页面
    public function emailValidate()
    {
        parse_str($_SERVER['QUERY_STRING'],$_GET);
        $email = $_GET['email'];
        $data['email'] = $this->login->decrypt($email);
        $data['password'] = $_GET['password'];
        $this->load->library('smarty');
        $this->smarty->view('emailValidate.tpl',$data);
    }

    /**
    * 邮件验证页面 重新发送邮件方法
    */
    public function resendApplyEmail()
    {
        $mailTo =  isset($_POST['email']) ? $_POST['email'] : '';
        $password =  isset($_POST['password']) ? $_POST['password'] : '';

        $title = '激活您在畅捷通企业空间的账户';
        $url = 'http://gw.com/home/activeUser.html?email='.$this->login->encrypt($mailTo).'&pwd='.$password ;
        $content = 'hi,'.$mailTo.'<br/> 欢迎使用全球组织社会化协同平台畅捷通企业空间。<br>请点击以下链接完成注册激活<br/><a href="'.$url.'" >'.$url.'</a>';

        $from = 'newesn@126.com';
        if( $this->login->sendEmail($mailTo,$from,$title,$content))
        {
            echo '1';//发送成功
        }
        else
        {
            echo '0';//发送失败
        }
    }

    //用户点击邮箱中的激活地址  使用此方法进行用户激活
    public function activeUser()
    {
        parse_str($_SERVER['QUERY_STRING'],$_GET);
        $email = $_GET['email'];
        $password = trim($_GET['pwd']);
        $data['email'] = $this->login->decrypt($email);
        $data['encryptEmail'] =  $email;
        $data['pwd'] = $password;
        $data['errorMessage'] = '';
        $data['ref'] = '';
        $this->load->library('smarty');
        if($this->login->exist('select id from tb_person where  email=? and status=1',array($data['email'])))
        {
            $this->smarty->view('index.tpl',$data);
        }
        else
        {
            $data['spaceList'] = $this->login->getSpaceList($data['email']);
            if(empty($data['spaceList']))
            {
                redirect($this->config->base_url().'home/registerSpace.html?email='.$email.'&password='.$password);
            }
            else
            {
                $this->smarty->view('welcome.tpl', $data);
            }
        }
    }

    //将用户加入到已存在的空间内，并激活账号
    public function addInSpace()
    {
        $email =  isset($_POST['email']) ? trim($_POST['email']) : '';
        $password =  isset($_POST['password']) ? trim($_POST['password']) : '';
        $spaceList =  isset($_POST['space']) ? trim($_POST['space']) : '';
        //$data = $this->login->addInSpace($email,$password,$spaceList);
        $data=[];
        $this->employeeHead($data);
        /*if(!empty($data))
        {
            $this->employeeHead($data);
            //$employeeId = $data['employeeId'];
            //redirect($this->config->base_url().'home/employeeHead.html?employeeid='.$employeeId);
        }
        else
        {
            echo "出错啦";
        }*/
    }

    //完善个人信息时在全文搜索里加入记录
    public function completeEmployeeInfo()
    {
        $employeeId='';
        $decryptEmail='';
        $spaceId='';
        //更新全文搜索 begin
        $rs=$this->db->query('select name,createtime from tb_employee where id=?', array($employeeId));
        $name = $rs->row()->name;
        $name=empty($name)?$decryptEmail:$name;
        $datetime=$rs->row()->createtime;
        $this->load->model('indexes_model', 'indexes');
        $type = 'employee';
        $data = array('id' => $employeeId, 'spaceid' => $spaceId, 'url' => 'employee/homepage/index/'.$spaceId.'/'.$employeeId.'.html', 'date' => $datetime, 'title' => $name, 'content' => $decryptEmail);
        $this->indexes->create($type, $data);
        //更新全文搜索 end
    }

    public function subHeadImg()
    {
        $this->load->library('file');
        if ($_REQUEST['sub'])
        {
            $filePath = trim($_REQUEST['filepath']);
            $x = intval($_REQUEST['x']);
            $y = intval($_REQUEST['y']);
            $w = intval($_REQUEST['w']);
            $h = intval($_REQUEST['h']);

            //对图片进行裁剪
            $tmpFilePath = $this->cutPic($filePath, $w, $h, $x, $y, $w, $h);

            //指定缩略图后缀及图片大小
            $arrThumbInfo = array(
                "[.thumb.jpg,0,48,48]",
                "[.middle.jpg,0,150,150]"//0921图片从180改为150
            );

            //生成缩略图
            $result = $this->makeThumb($tmpFilePath, '/'.$filePath, $arrThumbInfo);
            if($result)
            {
                $this->saveAvatar($filePath);
            }
        }
        echo json_encode(array('rs'=>true, 'data'=>$this->get($filePath) ));
    }

    public function get($filePath) {
        if (preg_match('/^http:\/\//i', $filePath)) {
            return $filePath;
        }
        return $this->config->item('resource_url').$filePath;
    }

    public function makeThumb($srcFile, $dstFile, $thumbInfo){
        $option = array(
            'type' => 'image'
        );
        $obj = $this->file->instance($option);
        return $obj->makeThumb($srcFile, $dstFile, $thumbInfo);
    }

    public function saveAvatar($path){
        $employeeId = QiaterCache::employeeid();
        if($employeeId) {
            $this->login->updateImgurl($path,$employeeId);
            $sessionId = $this->input->cookie('session_id');
            $employeeInfo = QiaterCache::employeeInfo();
            $employeeInfo['imageurl'] = $path;
            QiaterCache::employeeInfo($employeeInfo,$sessionId);
            return true;
        }else{
            return false;
        }
    }

    public function cutPic($filePath, $targ_w, $targ_h, $x, $y, $w, $h, $postfix = 'thumb') {
        $option = array(
            'type' => 'image'
        );
        $obj = $this->file->instance($option);
        return $obj->cutPic($filePath, $targ_w, $targ_h, $x, $y, $w, $h, $postfix);
    }

    public function avatarUpload($uploadinfo)
    {
        $employeeId = QiaterCache::employeeid();
        $option = array(
            'type' => 'image',
            'name' => $uploadinfo['name'],
            'tmpName' => $uploadinfo['tmp_name'],
            'userid' => $employeeId,
            'allowType' => array('jpg', 'png', 'jpeg')
        );
        $obj = $this->file->instance($option);
        $path = $obj->save(false);
        return $path;
    }

    public function uploadHeadImg()
    {
        $this->load->library('file');
        $path = '';
        if (isset($_FILES['filedata']))
        {
            $info = pathinfo($_FILES['filedata']['name']);
            if(!in_array( strtolower($info['extension']), array('jpg','jpeg','png'))){
                echo json_encode(array('rs'=>false, 'data'=>'只能上传jpg、jpeg、png格式图片' ));exit();
            }
            $path = $this->avatarUpload($_FILES['filedata']);
            if(empty($path)){ // 第一次上传失败
                $path = $this->avatarUpload($_FILES['filedata']);
                if(empty($path)) { //第二次上传失败
                    echo json_encode(array('rs'=>false, 'data'=>'图片上传出错' ));exit();
                }
            }
        }
        echo json_encode(array('rs'=>true, 'data'=>$this->config->item('resource_url').$path ));exit();
    }

    public function getProvince()
    {
        echo $this->login->getRegion();
    }

    public function getCity()
    {
        $parentId = isset($_POST['province']) ? $_POST['province'] : '';
        echo $this->login->getRegionById($parentId);
    }
}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */