<?php
abstract class AbstractUpload{
	const IMAGE_SIZE_SMALL = 'thumb';
	const IMAGE_SIZE_MIDDLE = 'middle';
	const IMAGE_SIZE_BIG = 'big';
	public $_allowType;
	public $_mogilefs;
    public $_config;
	
	public $_name;
	public $_tmpName;
	
	public function setName($name) {
		$this->_name = $name;
	}
	
	public function setTmpName($tmpName) {
		$this->_tmpName = $tmpName;
	}
	
	public function setAllowType($allowType) {
		$this->_allowType = $allowType;
	}
	
	/**
	 * 抽象方法
	 */	
 	abstract function save($delSrc = true);
	
	abstract function delete($filePath);
	
	/**
	 * 输出文件
	 * @param string $filePath 数据库中路径
	 * @param string $outFilePath 保存路径 false时返回文件数据
	 */
	public function getFile($filePath, $outFilePath = false) {
		return $this->_mogilefs->getFile($filePath, $outFilePath);
	}
	
	/**
	 * 保存文件
	 * @param unknown $filePath
	 * @param unknown $fileSrc
	 */
	public function setFile($filePath, $fileSrc) {
		return $this->_mogilefs->setFile($filePath, $fileSrc);
	}
	
	/**
	 * 检查文件是否存在
	 * @param string $filePath 数据库中路径
	 * @return bool true or false
	 */
	public function fileExists($filePath) {
		return $this->_mogilefs->exists($filePath);
	}
	
	public function __construct($option) {
        $ci =& get_instance();
        $ci->config->load('mogilefs');

        $this->_config = $ci->config->config;
		$this->setOptions($option);
		require_once(BASEPATH.'libraries/File/MogileFS.php');
		$this->_mogilefs = new MogileFS($this->_config['mf_domain'], $this->_config['mf_class'], $this->_config['mf_trackers']);
	}
	
	public function setOptions($option) {
		foreach ($option as $key => $value) {
			$method = 'set' . ucfirst($key);
			if (method_exists($this, $method)) {
				$this->$method($value);
			}
		}
	}
	
	/**
	 * 检查文件是否合法
	 * @return filePath or false
	 */
	public function check() {
		$fileExt = $this->fileExt($this->_name);
		if (!in_array($fileExt, $this->_allowType)) {
			return false;
		}
		$avatar = empty($this->_userid)?false:true;
		return $this->getFilePath($fileExt, $avatar);
	}
	
	/**
	 * 获取文件下载路径
	 */
	public function get($filePath) {
		if (preg_match('/^http:\/\//i', $filePath)) {
			return $filePath;
		}
		return $this->_config['resource_url'] . $filePath;
	}
	
	/**
     * 获取文件名后缀
     * @param $fileName 文件名
     * @return 文件扩展名
     */
	public function fileExt($fileName) {
		return strtolower(trim(substr(strrchr($fileName, '.'), 1)));
	}

	/**
     * 获取文件名前缀
     * @param $fileName 文件名
     * @return 文件前缀
	 * modify by shiying strpos 改成 strrpos 避免文件名包含点的情况
     */
	public function fileTitle($fileName) {
		return strtolower(trim(substr($fileName,0,strrpos($fileName, '.'))));
	}

	/**
     * 获取文件大小
     * @return int 文件大小
     */
	public function fileSize(){
		return abs(@filesize($this->_tmpName));
	}
	
	/**
     * 获取上传路径
     * @param $fileExt 文件扩展名
     * @param $avatar 是否是头像路径
     * @return filePath
     */
	public function getFilePath($fileExt, $avatar = false) {
		if ($avatar) {
			$userid = abs(intval($this->_userid));
			$userid = sprintf("%09d", $userid);
			$dir1 = substr($userid, 0, 3);
			$dir2 = substr($userid, 3, 2);
			$dir3 = substr($userid, 5, 2);
			return 'avatar/'.$dir1.'/'.$dir2.'/'.$dir3.'/'.substr($userid, -2).".$fileExt";
		}
		$filePath = time() . self::random(4). ".$fileExt";
		$name1 = gmdate('Ym');
		$name2 = gmdate('j');
		return $name1 . '/' . $name2 . '/'. $filePath;
	}

    /**
     * 生成随机数
     * @param $length
     * @param int $numeric
     * @return string
     */
    public static function random($length, $numeric = 0) {
        mt_srand();
        $seed = base_convert(md5(print_r($_SERVER, 1).microtime()), 16, $numeric ? 10 : 35);
        $seed = $numeric ? (str_replace('0', '', $seed).'012340567890') : ($seed.'zZ'.strtoupper($seed));
        $hash = '';
        $max = strlen($seed) - 1;
        for($i = 0; $i < $length; $i++) {
            $hash .= $seed[mt_rand(0, $max)];
        }
        return $hash;
    }
}