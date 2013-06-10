<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <link rel="stylesheet" type="text/css" href="/css/task.css" />
    <script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script src="/js/yonyou/lib/yonyou.js"></script>
    <script src="/js/yonyou/lib/yy.core.js"></script>
    <script src="/js/yonyou/modules/task/task.js"></script>
    <title>任务-畅捷通-企业空间</title>
</head>

<body>
{include file="employee/header.tpl"}

<div class="container clearfix" style="width:980px;margin-top:25px;">
{include file="employee/leftbar.tpl"}
<div class="grid task_wrap">
        <h1>任务<a href="/employee/task/index.html" class="creator"><<返回任务列表</a> </h1>
        <div id="getcontent">
        {include file="employee/task/list.tpl"}
        </div>
    </div>
</div>

{include file="employee/footer.tpl"}
</body>
</html>

