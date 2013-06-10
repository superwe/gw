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
        <h1>任务<a href="/employee/task/create" class="creator" target="_blank"><strong style="font-size: 14px;"></strong>&nbsp;&nbsp;创建任务</a> </h1>
        <div class="task_sec_title">
            <div id="taskMenuList" style="width: 720px;float: left;">
            <a href="##" class="selected" data="0" role="0">全部</a>
            <a href="##" data="1" role="0">创建的</a>
            <a href="##" data="2" role="0">负责的</a>
            <a href="##" data="3" role="1">参与的</a>
            <a href="##" data="4" role="2">被知会的</a>
            <a href="##" data="5" role="0">草稿箱</a>
            <input type="checkbox" class="yy-handleType" />待办
            </div>
            <div class="status" id="task_li_status" style="position: relative;width: 100px;float: left;">
                <div data="-1" class="data">查看状态</div>
            <aside style="display: none;" class="tkBox">
                <a title="查看状态" data="-1" href="javascript:;">全部</a>
                <a title="未开始" data="2" href="javascript:;">未开始</a>
                <a title="进行中" data="3" href="javascript:;">进行中</a>
                <a title="待审核" data="5" href="javascript:;">待审核</a>
                <a title="超期" data="4" href="javascript:;">超期</a>
                <a title="关闭" data="6" href="javascript:;">关闭</a>
                <a title="完成" data="1" href="javascript:;">完成</a>
                <!-- <input type="hidden" id="sstatus" value="-1" name="sstatus"> -->
            </aside>
            </div>
        </div>
        <div id="getcontent">
        {include file="employee/task/list.tpl"}
        </div>
        <div style="margin: 10px 20px 0px;" class="bottomMore" id="footer_morefeed">
            <a href="javascript:;" id="task_moreFeed" data="/employee/task/taskList.html" resource-id="getcontent">查看更多&gt;&gt;</a>
        </div>
    </div>
</div>

{include file="employee/footer.tpl"}
</body>
</html>

