<?php
/**
 *
 * 拦截器类
 * @author		于景晨
 * @changeby  lixiao1
 */
class Interceptor {

    private $CI;
    
    public function __construct() {
    	$this->CI =& get_instance();
    	$this->CI->load->helper('cookie');
    	$this->CI->load->helper('url');
    	$this->CI->load->helper('cache');
    	$this->CI->load->driver('cache', array('adapter' => 'redis'));
    }

    /*
    //系统执行的早期调用.仅仅在benchmark 和 hooks 类 加载完毕的时候. 没有执行路由或者其它的过程.
    //此函数对应hook.php中的$hook['pre_system']，使用时请反注释相关代码
    public function pre_system(){

    }
    */

    /*
    //在调用你的任何控制器之前调用.此时所用的基础类,路由选择和安全性检查都已完成.
    //此函数对应hook.php中的$hook['pre_controller']，使用时请反注释相关代码
    public function pre_controller(){

    }
    
    /**
     * 在你的控制器实例化之后(父类构造函数执行后),任何方法调用之前调用,即执行完控制器构造函数后调用此方法 //added by bishenghua 2013/05/09
     */
    public function pre_controller_constructor()
    {
    	$urlString = uri_string();
    	if (strstr($urlString, '/', true) == 'employee') { // 需要进行权限检查的URL
            $sessionId = empty($_POST['session_id']) ? $this->CI->input->cookie('session_id') : $_POST['session_id'];
            $username = empty($_POST['qiater_user']) ? $this->CI->input->cookie('qiater_user') : $_POST['qiater_user'];
            $autoLogin = $this->CI->input->cookie('qiater_autologin');
            if(!empty($username)) $username = $this->decrypt($username);
            $salt = QiaterCache::salt($username);
            $ip = $this->CI->input->ip_address();
            $sid = md5($username . $ip . $salt);     //用相关值计算hash和cookie中的比较，如果不等则拒绝登陆

            /*if ($sessionId != $sid) {
                if ($autoLogin==0) redirect($this->CI->config->base_url() . 'home/quit.html?ref=' . $urlString);
                else redirect($this->CI->config->base_url() . 'home/index.html?ref=' . $urlString);
            }*/

            //延长session生命期 modified by bishenghua 2013/04/27
            $ttl = $this->CI->config->item('cache_session_ttl');
            QiaterCache::expireSaltAdmin($username, $ttl);
            QiaterCache::expireAllSess($ttl, $sessionId);
        }
    }


    /**
     * 在你的控制器实例化之后,任何方法调用之前调用,即执行完控制器构造函数后调用此方法
     */
    public function post_controller_constructor()
    {
        
    }

    /**
     * 字符串还原
     * @param $str 需要解密的字符串
     * @return string
     */
    private function decrypt($str)
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

    /*
   //在你的控制器完全运行之后调用.
   //此函数对应hook.php中的$hook['post_controller']，使用时请反注释相关代码
   public function post_controller(){

   }
   */

    /*
  //覆盖_display()函数, 用来在系统执行末尾向web浏览器发送最终页面.这允许你用自己的方法来显示.注意，
  //你需要通过 $this->CI=& get_instance() 引用 CI 超级对象，
  //然后这样的最终数据可以通过调用 $this->CI->output->get_output() 来获得。
  //此函数对应hook.php中的$hook['display_override']，使用时请反注释相关代码
  public function display_override(){

  }
  */

    /*
   //可以让你调用自己的函数来取代output类中的_display_cache() 函数.这可以让你使用自己的缓存显示方法
   //此函数对应hook.php中的$hook['cache_override']，使用时请反注释相关代码
   public function cache_override(){

   }
   */

    /*
    //在最终着色页面发送到浏览器之后,浏览器接收完最终数据的系统执行末尾调用
    //此函数对应hook.php中的$hook['post_system']，使用时请反注释相关代码
    public function post_system(){

    }
    */
}