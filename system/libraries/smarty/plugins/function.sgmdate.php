<?php
/**
 * 时间格式化
 * @param $params['dateformat']	时间格式
 * @param $params['timestamp']	时间戳
 * @param $params['format']		是否要格式化（n小时前|n分钟前|n秒钟前|现在），1：打开(默认) 0：关闭
**/
function smarty_function_sgmdate($params, $template){
	$result = '';
	$params['format'] = isset($params['format']) ? $params['format'] : 1;							//默认打开
	$params['dateformat'] = isset($params['dateformat']) ? $params['dateformat'] : 'Y-m-d H:i:s';	//默认值
	$params['timeoffset'] = isset($params['timeoffset']) ? intval($params['timeoffset']) : 8;		//默认东八区
	
    $params['date'] = empty($params['date']) ? time() : strtotime($params['date']);
	if($params['format']){
		$time = time() - $params['date'];
		if($time > 24*3600){    //相差1天以上
			$result = gmdate($params['dateformat'], $params['date'] + $params['timeoffset'] * 3600);
		} elseif ($time > 3600){	//相差1小时以上：n小时前
			$result = intval($time/3600).'小时前';
		} elseif ($time > 60){	//相差1分钟以上：n分钟前
			$result = intval($time/60).'分钟前';
		} elseif ($time > 0){	//相差0秒钟以上：n秒钟前
			$result = $time.'秒前';
		} else{	//现在
			$result = '现在';
		}
	} else{
		$result = gmdate($params['dateformat'], $params['date'] + $params['timeoffset'] * 3600);
	}
	return $result;
}
