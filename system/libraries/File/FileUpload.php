<?php
class FileUpload extends AbstractUpload{
    /**
     * 上传文件
     * @return
     */
    public function save($delSrc = true) {
		if (!$filePath = $this->check()) {
			return false;
		}
		$fileSrc = $this->_tmpName;
		$flag = $this->_mogilefs->setFile($filePath, $fileSrc);
		if ($delSrc) {
			@unlink($fileSrc);
		}
		return $flag ? $filePath : false;
    }
	
	/**
	 * 删除文件
	 */
	public function delete($filePath) {
		$this->_mogilefs->delete($filePath);
	}
	
	/**
     * 文档转换生成预览
     * @param string $filePath 保存文件key
     * @param string $fileExt 文件类型
     * @param int $width 生成图片宽度
     * @param int $height 生成图片高度
     * @param int $page 将pdf第几页生成封面图，默认第一页（为0）
     * @return flag 0:转换成功; 1:类型错误; 2:文件不存在; 3:文件下载失败; 4:pdf转换错误; 5:swf转换错误;
     */
    public function convert($filePath, $fileExt, $width, $height, $page = 0) {
		// 支持转换的格式
        $allowType = array('doc','docx','ppt','pptx','xls','xlsx','pot','potx','pps','ppsx','wps','dps','wpt','dpt','txt','pdf');
		$allowPicType = array('jpg', 'jpeg', 'gif', 'png');
		$flag = 0;
        if (!in_array($fileExt, array_merge($allowType, $allowPicType))) {
            $flag = 1; //类型错误
        } else {		
			if ($this->fileExists($filePath)) {
				$tmpdir = $this->_config['mf_tempdir'] . md5($filePath);
				$fileTmp = $tmpdir . ".$fileExt";
				$this->getFile($filePath, $fileTmp); //下载文件
				if ($fileExt == 'txt') {
					$content = file_get_contents($fileTmp);
					$content = mb_convert_encoding($content, 'UTF-8', 'GBK');
					file_put_contents($fileTmp, $content);
				}
				if (file_exists($fileTmp)) {
					if (in_array($fileExt, $allowType)) {
						//生成pdf文件
						$pdfTmp = $tmpdir . '.pdf';
						if ($fileExt != 'pdf') {
							exec("/usr/server/doc2pdf $fileTmp $pdfTmp");
						} else {
							$pdfTmp = $fileTmp;
						}
						
						if (file_exists($pdfTmp)) { //生成pdf成功
							//生成swf（用于文件预览）
							$swfTmp = $tmpdir . '.swf';
							exec("/usr/server/pdf2swf $pdfTmp $swfTmp");
							if (file_exists($swfTmp)) { //生成swf成功
								//保存swf文件
								$swfPath = $filePath . '.swf';
								$this->_mogilefs->setFile($swfPath, $swfTmp); //保存swf
								@unlink($swfTmp); //删除缓存文件
								
								//生成封面预览图
								$jpgTmp = $tmpdir . '.jpg';
								$jpgPath = $filePath . '.' . self::IMAGE_SIZE_SMALL . '.jpg';
								exec("convert -resize {$width}x{$height} -depth 32 -channel RGB -colorspace RGB {$pdfTmp}[{$page}] $jpgTmp");
								$this->_mogilefs->setFile($jpgPath, $jpgTmp); //保存jpg
								@unlink($jpgTmp); //删除缓存文件
								$flag = 0; //转换成功
							} else {
								$flag = 5; //swf转换错误
							}
							@unlink($pdfTmp); //删除pdf
						} else {
							$flag = 4; //pdf转换错误
						}
					} else {
						//图片
						//生成封面预览图
						$jpgTmp = $tmpdir . '.jpg';
						$jpgPath = $filePath . '.jpg';
						exec("convert -resize {$width}x{$height} -depth 32 -channel RGB -colorspace RGB $fileTmp $jpgTmp");
						$this->_mogilefs->setFile($jpgPath, $jpgTmp); //保存jpg
						@unlink($jpgTmp); //删除缓存文件
						$flag = 0; //转换成功
					}
					@unlink($fileTmp);
				} else {
					$flag = 3; //文件下载失败
				}
			} else {
				$flag = 2; //文件不存在
			}
		}
		return $flag;
    }
}