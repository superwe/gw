<?php  if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Created by JetBrains PhpStorm.
 * User: ZhaiYanBin
 * Date: 13-4-21
 * Time: 下午4:05
 * To change this template use File | Settings | File Templates.
 */
require_once( BASEPATH.'libraries/PHPExcel/PHPExcel.php' );
require_once( BASEPATH.'libraries/PHPExcel/PHPExcel/IOFactory.php' );

class CI_Phpexcel extends PHPExcel {
    public function __construct(){
        parent::__construct();
    }
}
