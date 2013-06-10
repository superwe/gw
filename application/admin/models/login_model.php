<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Sb Catq
 * Date: 13-4-20
 * Time: 下午5:13
 * To change this template use File | Settings | File Templates.
 */

class Login_model extends CI_Model{
    public function __construct(){
        $this->load->database('default');
    }

    /**
     * 验证用户是否存在或是否激活
     * @param $user
     * @return string
     */
    public function verityUser($user)
    {
        $query=$this->db->query('select id from tb_person where email=?',array($user));
        if (!$query->num_rows() > 0)
        {
            return '您输入邮箱或用户名不存在,请重新输入.';
        }
        $query=$this->db->query('select id from tb_person where email=? and status=1',array($user));
        if (!$query->num_rows() > 0)
        {
            return '您输入邮箱或用户名未启用,请激活.';
        }
    }

    /**
     * 获取用户密码
     * @param $user
     * @return string
     */
    public function getPassword($user)
    {
        $query=$this->db->query('select password from tb_person where email=? and status=1',array($user));
        return $query->row()->password;
    }

    /**
     * 验证密码是否正确
     * @param $user
     * @param $password
     * @return bool
     */
    /*public function verifyPassword($user,$password)
    {
         return $this->verityHash($password,$this->getPassword($user));
    }*/

    /**
     * 获取用户表的一些信息
     * @param $user
     * @return array
     */
    public function getUserInfo($user)
    {
        $query = $this->db->query('select id,oldpwd,password,oldsalt,salt,defaultspaceid from tb_person where email=?',array($user));
        $data=[];
        if($query->num_rows() > 0)
        {
            $row = $query->row();
            $data['personId']=$row->id;
            $data['oldPwd']=$row->oldpwd;
            $data['password']=$row->password;
            $data['oldSalt']=$row->oldsalt;
            $data['salt']=$row->salt;
            $data['spaceId']=$row->defaultspaceid;
        }
        return $data;
    }

    /**
     * 验证密码是否正确
     * @param $user
     * @param $password
     * @return bool
     */
    public function verifyPassword($user,$password)
    {
        $data=$this->getUserInfo($user);
        if(empty($data['password']))
        {
            $password=md5(md5($password).$data['oldSalt']);
            if($password==$data['oldPwd'])
            {
                $this->resetPassword($user,$password);
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return $this->verityHash($password,$this->getPassword($user));
        }
    }

    /**
     * 获取8位随机数
     * @return int
     */
    public function getRandom()
    {
        return mt_rand(10000000,99999999);
    }

    /**
     * 登录验证
     * @param $user
     * @param $password
     * @return bool
     */
    public function verifyLogin($user,$password)
    {
        $query = $this->db->query('select id from tb_person where email=? and password=? and status=1',array($user,$password));
        if($query->num_rows() > 0)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    /**
     * 验证用户是否存在或是否激活
     * @param $password
     * @return string
     */
    public function getPasswordHash($password)
    {
        return password_hash($password,PASSWORD_BCRYPT);
    }

    public function verityHash($password,$hash)
    {
        if(password_verify($password,$hash))
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    /**
     * 设置密码
     * @param $user
     * @param $password
     * @return bool
     */
    public function resetPassword($user,$password)
    {
        $password = $this->getPasswordHash($password);
        $this->db->trans_begin();
        $this->db->query('update tb_person set password=? WHERE email=?',array($password,$user));

        if ($this->db->trans_status() == FALSE)
        {
            $this->db->trans_rollback();
            return false;
        }
        else
        {
            $this->db->trans_commit();
            return true;
        }
    }

    /**
     * 根据空间ID和用户ID获取employeeId
     * @param $spaceId
     * @param $userId
     * @return int
     */
    public function getEmployeeId($spaceId,$userId)
    {
        $query=$this->db->query('select id from tb_employee where spaceid=? and personid=? and status=1',array($spaceId,$userId));
        if($query->num_rows() > 0)
        {
            $row = $query->row();
            return $row->id;
        }
        else
        {
            return 0;
        }
    }

    /**
     * 获取刚插入数据库的主键ID
     * @param $companyName string sql语句
     * @param $spaceName string 字段与值的对应数组
     * @param $user string sql语句
     * @param $password string 字段与值的对应数组
     * @return  array
     */
    public function creatSpace($companyName,$spaceName,$user,$password)
    {
        $this->db->trans_begin();
        //创建企业并获取ID
        $sql = 'INSERT INTO tb_company (name,simplename,createtime) VALUES (?,?,NOW())';
        $companyId=$this->getInsertNewId($sql,array($companyName,$spaceName));
        //创建空间并获取ID
        $sql = 'INSERT INTO tb_space (name,companyid,createtime) VALUES (?,?,NOW())';
        $spaceId=$this->getInsertNewId($sql,array($spaceName,$companyId));
        //插入用户账号并获取ID
        $sql = 'INSERT INTO tb_person (email,password,status,createtime,defaultspaceid) VALUES (?,?,1,NOW(),?)';
        $personId=$this->getInsertNewId($sql,array($user,$password,$spaceId));
        //创建空间用户并获取ID
        $sql = 'INSERT INTO tb_employee (spaceid,personid,email,roleid,status,createtime) VALUES (?,?,?,0,1,NOW())';
        $employeeId=$this->getInsertNewId($sql,array($spaceId,$personId,$user));
        $data=[];

        $data['spaceId'] = $spaceId;
        $data['personId'] = $personId;
        $data['employeeId'] = $employeeId;
        $employeeList[0] = $employeeId;
        $spaceList[0] = $spaceId;
        $data['email'] = $user;
        $data['password'] = $password;
        $data['spaceList'] = $spaceList;
        $data['employeeList'] = $employeeList;

        if ($this->db->trans_status() == FALSE)
        {
            $this->db->trans_rollback();
            return 0;
        }
        else
        {
            $this->db->trans_commit();
            return $data;
        }
    }

    public function addInSpace($email,$password,$spaceList)
    {
        $this->db->trans_begin();

        $data = [];
        $data['spaceId'] = $spaceList[0];
        $data['email'] = $email;
        $data['password'] = $password;
        $data['spaceList'] = $spaceList;
        $query = $this->db->query('select id from tb_employee where email=?  and status=0 and spaceid = ?',array($email,$spaceList[0]));
        $employeeId = $query->row()->id;
        $data['employeeId'] = $employeeId;
        $query = $this->db->query('select id from tb_employee where email=?  and status=0 and spaceid in ('.implode(',',$spaceList).')',array($email));
        $table = $query->result();
        $employeeList = [];
        $i = 0;
        foreach($table as $row)
        {
            $employeeList[$i] = $row->id;
            $i++;
        }
        $data['employeeList'] = $employeeList;
        $this->db->query('insert into tb_person (email,password,status,createtime,defaultspaceid) value(?,?,1,NOW(),?)',array($email,$password,$spaceList[0]));
        $personId = $this->db->insert_id();
        $data['personId'] = $personId;
        $this->db->query('update tb_employee set status=1,personid=? where id in ('.implode(',',$employeeList).')',array($personId));

        if ($this->db->trans_status() == FALSE)
        {
            $this->db->trans_rollback();
            return [];
        }
        else
        {
            $this->db->trans_commit();
            return $data;
        }
    }

    /**
     * 返回查询数据是否存在
     * @param $sql string sql语句
     * @param $data array 字段与值的对应数组
     * @return bool
     */
    public function exist($sql,$data)
    {
        if($this->getRowsCount($sql,$data)==0)
        {
            return false;
        }
        else
        {
            return true;
        }
    }

    /**
     * 返回查询记录数
     * @param $sql string sql语句
     * @param $data array 字段与值的对应数组
     * @return int
     */
    public function getRowsCount($sql,$data)
    {
        if(empty($data))
        {
            $query = $this->db->query($sql);
        }
        else
        {
            $query = $this->db->query($sql,$data);
        }
        if($query->num_rows()>0)
        {
            return $query->num_rows();
        }
        else
        {
            return 0;
        }
    }

    /**
     * 获取刚插入数据库的主键ID
     * @param $sql string sql语句
     * @param $data array 字段与值的对应数组
     * @return int
     */
    public function getInsertNewId($sql,$data)
    {
        $this->db->query($sql,$data);
        return $this->db->insert_id();//获取新增ID
    }

    /**
     * 发送邮件
     * @param $mailTo 邮件地址
     * @param $from 发送人地址
     * @param $title 邮件标题
     * @param $content 邮件内容
     * @return bool
     */
    public function sendEmail($mailTo,$from,$title,$content)
    {
        $this->load->library('email');
        $this->email->from($from,'畅捷通-企业空间');
        $this->email->to($mailTo);
        $this->email->subject($title);
        $this->email->message($content);
        if( $this->email->send())
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    /**
     * 获取未激活的空间ID
     * @param $email 注册邮箱
     * @return string
     */
    public function getSpaceList($email)
    {
        $query = $this->db->query('select id,name from tb_space where id in (select spaceid from tb_employee where  email=? and status=0)',array($email));
        if($query->num_rows()>0)
        {
            return $query->result();
        }
        else
        {
            return [];
        }
    }

    /**
     * 更新person表的Salt
     * @param $personId 用户ID
     * @param $salt 8位随机码
     * @return int
     */
    public function updateSalt($personId,$salt)
    {
        $this->db->trans_begin();
        $this->db->query('UPDATE tb_person SET salt =? WHERE id =?',array($salt,$personId));
        if ($this->db->trans_status() == FALSE)
        {
            $this->db->trans_rollback();
            return 0;
        }
        else
        {
            $this->db->trans_commit();
            return 1;
        }

    }

    /**
     * 字符串加密
     * @param $str 需要加密的字符串
     * @return string
     */
    public function encrypt($str)
    {
        $key = md5('L!Ke');
        $td = mcrypt_module_open('des', '','cfb', '');
        $key = substr($key, 0, mcrypt_enc_get_key_size($td));
        $iv_size = mcrypt_enc_get_iv_size($td);
        $iv = mcrypt_create_iv($iv_size, MCRYPT_RAND);
        if (mcrypt_generic_init($td, $key, $iv) != -1)
        {
            $c_t = mcrypt_generic($td, $str);
            mcrypt_generic_deinit($td);
            mcrypt_module_close($td);
            $c_t = $iv.$c_t;
            return str_replace(array('+','/'),array('-','_'),trim(chop(base64_encode($c_t))));
        }
    }

    /**
     * 字符串还原
     * @param $str 需要解密的字符串
     * @return string
     */
    public function decrypt($str)
    {
        $str = trim(chop(base64_decode(str_replace(array('-','_'),array('+','/'),$str))));
        $key = md5('L!Ke');
        $td = mcrypt_module_open('des', '','cfb', '');
        $key = substr($key, 0, mcrypt_enc_get_key_size($td));
        $iv_size = mcrypt_enc_get_iv_size($td);
        $iv = substr($str,0,$iv_size);
        $str = substr($str,$iv_size);
        if (mcrypt_generic_init($td, $key, $iv) != -1)
        {
            $c_t = mdecrypt_generic($td, $str);
            mcrypt_generic_deinit($td);
            mcrypt_module_close($td);
            return $c_t;
        }
    }
}