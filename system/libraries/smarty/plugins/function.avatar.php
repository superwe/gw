<?php
/**
 * Smarty plugin
 * @package Smarty
 * @subpackage PluginsFunction
 */
function smarty_function_avatar($params, $template)
{
	static $ci, $resourceUrl;
	if (!$ci) {
		$ci =& get_instance();
		$resourceUrl = $ci->config->item('resource_url');
	}
	if(!isset($params['pic']) || empty($params['pic'])){
		$params['pic'] = 'default_avatar';
	}
	
	$alt = isset($params['title']) ? $params['title'] : '';
    $tips = isset($params['tips']) ? $params['tips'] : '';//add by lisheng 2013-04-27
    $pic = $params['pic'];
	$style = '';
	if(!isset($params['size']))
		$params['size'] = 'small';
	if (isset($params['style'])) {
		$style = ' style="'.$params['style'].'"';
	}
	
	$src = $resourceUrl.$pic.'.'.($params['size'] == 'small' ? 'thumb' : $params['size']).'.jpg';
	$defalut = $resourceUrl.'default_avatar.'.($params['size'] == 'small' ? 'thumb' : $params['size']).'.jpg';
    $rel = isset($params['rel']) ? $params['rel'] : $defalut;//add by lisheng 2013-04-27
	return '<img rel="' . $rel . '" onerror="imgError(this);"  src="' . $src . '" alt="' . $alt . '" tips="'.$tips.'"' . $style . ' title="' . $alt . '" />';
}
