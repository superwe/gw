<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Created by JetBrains PhpStorm.
 * User: shenghua
 * Date: 13-4-11
 * Time: 上午10:11
 * To change this template use File | Settings | File Templates.
 */
class CI_File {
	const TYPE_IMAGE = 'ImageUpload';
	const TYPE_FILE = 'FileUpload';
	
	public function instance($option){
		$className = ucfirst($option['type']) . 'Upload';
        if (!in_array($className, array(self::TYPE_IMAGE, self::TYPE_FILE))) return null;
        require_once(BASEPATH.'libraries/File/AbstractUpload.php');
        require_once(BASEPATH.'libraries/File/'.$className.'.php');
		return new $className($option);
	}
	
}