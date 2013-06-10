<?php
class ImageUpload extends AbstractUpload{
	protected $_ssize = null;
	protected $_msize = null;
	protected $_bsize = null;
	protected $_maxsize = null;
	protected $_userid;
	
	protected function setSsize($ssize) {
		$this->_ssize = $ssize;
	}
	
	protected function setMsize($msize) {
		$this->_msize = $msize;
	}
		
	protected function setBsize($bsize) {
		$this->_bsize = $bsize;
	}
	
	protected function setMaxsize($maxsize) {
		$this->_maxsize = $maxsize;
	}
	
	protected function setUserid($userid) {
		$this->_userid = $userid;
	}
	
	public function getthumb($filePath){
		if(! $filePath){
			$filePath = 'default_avatar';
		}
		$filePath .= '.' . self::IMAGE_SIZE_SMALL . '.jpg';
		return $this->get($filePath);
	}
	
	public function getmiddle($filePath){
		if(! $filePath){
			$filePath = 'default_avatar';
		}
		$filePath .= '.' . self::IMAGE_SIZE_MIDDLE . '.jpg';
		return $this->get($filePath);
	}
	
	public function getbig($filePath){
		if(! $filePath){
			$filePath = 'default_avatar';
		}
		$filePath .= '.'.self::IMAGE_SIZE_BIG.'.jpg';
		return $this->get($filePath);
	}
	
	public function getpic($filePath){
		if(! $filePath){
			$filePath = 'default_avatar.'.self::IMAGE_SIZE_BIG.'.jpg';;
		}
		return $this->get($filePath);
	}
	
    /**
     * 保存文件
     * @return filePath or false
     */
	public function save($delSrc = true) {
		if (!$filePath = $this->check()) {
			return false;
		}
		$fileSrc = $this->_tmpName;
		if (!file_exists($fileSrc)) {
			return false;
		}
		
		$flag = false;
		list($sWidth,$sHeight,$sType,$aAttr) = @getimagesize($fileSrc);
		if ($this->_ssize != null) {
			$ssize = explode('*', $this->_ssize);
			$dstFile = $this->_makeThumb($fileSrc, $ssize[0], $ssize[1]);
			if ($dstFile) {
				$sfileSrc = "$filePath." . self::IMAGE_SIZE_SMALL . '.jpg';
				$this->_mogilefs->setFile($sfileSrc, $dstFile);
				@unlink($dstFile);
			}
		}
				
		if ($this->_msize != null) {
			$msize = explode('*', $this->_msize);
			$dstFile = $this->_makeThumb($fileSrc, $msize[0], $msize[1]);
			if ($dstFile) {
				$sfileSrc = "$filePath." . self::IMAGE_SIZE_MIDDLE . '.jpg';
				$this->_mogilefs->setFile($sfileSrc, $dstFile);
				@unlink($dstFile);
			}
		}
		
		if ($this->_bsize != null) {
			$bsize = explode('*', $this->_bsize);
			$dstFile = $this->_makeThumb($fileSrc, $bsize[0], $bsize[1]);
			if ($dstFile) {
				$sfileSrc = "$filePath." . self::IMAGE_SIZE_BIG . '.jpg';
				$this->_mogilefs->setFile($sfileSrc, $dstFile);
				@unlink($dstFile);
			}
		}
		
		if ($this->_maxsize != null) { //修改源文件尺寸 大于300*300才会被修改
			$maxsize = explode('*', $this->_maxsize);
			$dstFile = $this->_makeThumb($fileSrc, $maxsize[0], $maxsize[1]);
			if ($dstFile) {
				$flag = $this->_mogilefs->setFile($filePath, $dstFile);
				@unlink($dstFile);
			} else {
				$flag = $this->_mogilefs->setFile($filePath, $fileSrc);
			}
		} else {
			$flag = $this->_mogilefs->setFile($filePath, $fileSrc);
		}
		if ($delSrc) {
			@unlink($fileSrc);
		}
		return $flag ? $filePath : false;
    }
	
	/**
	 * 删除图片文件
	 */
	public function delete($filePath) {
		$sfileSrc = "$filePath." . self::IMAGE_SIZE_SMALL . '.jpg';
		$mfileSrc = "$filePath." . self::IMAGE_SIZE_MIDDLE . '.jpg';
		$bfileSrc = "$filePath." . self::IMAGE_SIZE_BIG . '.jpg';
		$this->_mogilefs->delete($filePath);
		$this->_mogilefs->delete($sfileSrc);
		$this->_mogilefs->delete($mfileSrc);
		$this->_mogilefs->delete($bfileSrc);
	}
	
	/**
	 * 裁剪图片
	 */
	public function makePic($filePath, $targ_w, $targ_h, $x, $y, $w, $h, $postfix = self::IMAGE_SIZE_SMALL) {
		$tmpdir = $this->_config['mf_tempdir'];
		$tmpfile = $tmpdir . md5($filePath) . '.jpg';
		$this->getFile($filePath, $tmpfile); //下载源文件
		$sfilePath = '';
		if (file_exists($tmpfile)) {
			$sfilePath = $filePath . '.' . $postfix . '.jpg';
			$tmpfile_r = $tmpdir . md5($sfilePath) . '.jpg';
			//获取图片信息
			$img_r = '';
			$data = getimagesize($tmpfile);
			if($data) {
				if($data[2] == 1) {
					if(function_exists("imagecreatefromgif")) {
						$img_r = imagecreatefromgif($tmpfile);
					}
				} elseif($data[2] == 2) {
					if(function_exists("imagecreatefromjpeg")) {
						$img_r = imagecreatefromjpeg($tmpfile);
					}
				} elseif($data[2] == 3) {
					if(function_exists("imagecreatefrompng")) {
						$img_r = imagecreatefrompng($tmpfile);
					}
				}
			}
			$dst_r = ImageCreateTrueColor($targ_w, $targ_h);
		
			imagecopyresampled($dst_r, $img_r, 0, 0, $x, $y, $targ_w, $targ_h, $w, $h);
		
			if(function_exists('imagejpeg')) {
				@imagejpeg($dst_r, $tmpfile_r);
			} elseif (function_exists('imagepng')) {
				@imagepng($dst_r, $tmpfile_r);
			}
			@imagedestroy($dst_r);
			
			if (file_exists($tmpfile_r)) {
				$this->_mogilefs->setFile($sfilePath, $tmpfile_r);
				@unlink($tmpfile_r);
			}
			@unlink($tmpfile);
		}
		return $sfilePath;
	}
	
	/**
	 * 生成缩略图
	 * @return filePath or false
	 */
	protected function _makeThumb($srcFile, $thumbWidth = 0, $thumbHeight = 0) {
		$tmpdir = $this->_config['mf_tempdir'];
		$ext = $this->fileExt($srcFile);
		$ext = $ext ? $ext : 'jpg';
		$dstFile = $tmpdir . md5($srcFile) . '.' . $ext;
		//echo $dstFile;exit;

		//缩略图大小
		$tow = intval($thumbWidth);
		$toh = intval($thumbHeight);
	
		if($tow < 60) $tow = 60;
		if($toh < 60) $toh = 60;
		
		//获取图片信息
		$im = '';
		$data = @getimagesize($srcFile);
		if($data) {
			if($data[2] == 1) {
				if(function_exists("imagecreatefromgif")) {
					$im = imagecreatefromgif($srcFile);
				}
			} elseif($data[2] == 2) {
				if(function_exists("imagecreatefromjpeg")) {
					$im = imagecreatefromjpeg($srcFile);
				}
			} elseif($data[2] == 3) {
				if(function_exists("imagecreatefrompng")) {
					$im = imagecreatefrompng($srcFile);
				}
			}
		}
		if(!$im) return '';
		
		$srcw = imagesx($im);
		$srch = imagesy($im);
		
		$towh = $tow/$toh;
		$srcwh = $srcw/$srch;
		if($towh <= $srcwh){
			$ftow = $tow;
			$ftoh = $ftow*($srch/$srcw);
		} else {
			$ftoh = $toh;
			$ftow = $ftoh*($srcw/$srch);
		}
		if($srcw > $tow || $srch > $toh) {
			if(function_exists("imagecreatetruecolor") && function_exists("imagecopyresampled") && @$ni = imagecreatetruecolor($ftow, $ftoh)) {
				imagecopyresampled($ni, $im, 0, 0, 0, 0, $ftow, $ftoh, $srcw, $srch);
			} elseif(function_exists("imagecreate") && function_exists("imagecopyresized") && @$ni = imagecreate($ftow, $ftoh)) {
				imagecopyresized($ni, $im, 0, 0, 0, 0, $ftow, $ftoh, $srcw, $srch);
			} else {
				return '';
			}
			if(function_exists('imagejpeg')) {
				@imagejpeg($ni, $dstFile);
			} elseif(function_exists('imagepng')) {
				@imagepng($ni, $dstFile);
			}
			imagedestroy($ni);
		}
		@imagedestroy($im);

		if(file_exists($dstFile)) {
			return $dstFile;
		} else {
			return '';
		}
	}
}