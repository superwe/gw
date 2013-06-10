<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/group.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <title>首页-畅捷通-企业空间</title>
</head>
<body>
{include file="employee/header.tpl"}
<div class="container clearfix" style="width:980px;margin-top:25px;">
   {include file="employee/leftbar.tpl"}
   <div class="grid group_wrap">
        {include file="employee/group/head.tpl"}
        <div class="group_content">
			<form method="post" action="/employee/group/update" id="group"  class="group-setting" enctype="multipart/form-data">
				<table>
					<tr><td>群组名称：</td><td><input type="text" class="input" name="group_name" id="group_name" value="{$group['name']}" maxlength="20"></td></tr>
					<tr><td>群组简介：</td><td><textarea name="description" cols="" rows="" id="description" class="input">{$group['description']}</textarea></td></tr>
					<tr><td>群组公告：</td><td><textarea name="announce" cols="" rows="" id="announce" class="input">{$group['announce']}</textarea></td></tr>
					<tr><td>群组LOGO：</td><td><img width="60px" height="60px" src="{$group['logourl']}"><input type="file" size="10" class="inputFile" name="group_logo" id="group_logo"></td></tr>
					<tr><td>群组封面图：</td><td><input type="file" size="10" class="inputFile" name="group_bg" id="group_bg"></td></tr>
					<tr><td></td><td>仅支持JPG图片文件，且文件小于5M</td></tr>
					<tr><td></td><td><input type="hidden" name="id" value='{$group['id']}'><input type="hidden" name="do" value='1'></td></tr>
					<tr><td></td><td><span class="delGroup"><a class="button_gray group_button" href="/employee/group/delGroup?id={$group['id']}">删除群组</a></span></td></tr>
					<tr><td></td><td><input type="submit" value="保存" class="button_blue group_button"> <input class="button_blue group_button" type="reset" value="重置"></td></tr>
				</table>
			</form>
        </div> 
    </div>
</div>
<script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script src="/js/yonyou/lib/yonyou.js"></script>
<script src="/js/yonyou/lib/yy.core.js"></script>
{include file="employee/footer.tpl"}
<script type="text/javascript">
    window.sessid = "{session_id()}";
    window.rscallback = "{$rscallback}";
    window.rscallbackflag = "{$rscallbackflag}";
    if(rscallback != '') $.yy.rscallback(rscallback, rscallbackflag);
</script>
</body>
</html>
