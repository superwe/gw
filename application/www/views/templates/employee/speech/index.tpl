<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <title>首页-畅捷通-企业空间</title>
</head>

<body>
{include file="employee/header.tpl"}

<div class="container clearfix" style="width:980px;margin-top:25px;">
    <div class="grid leftbar">
        <div  style="padding: 5px;"><img src="/images/test/logo140.jpg"/></div>
        <div class="clear" style="height: 20px"></div>
        <div class="app">
            <h3>应用</h3>
            <ul>
                {foreach from=$appList item=app}
                    <li><img src="{$app->imageurl}"/><a href="{$app->url}">{$app->name}</a></li>
                {/foreach}
            </ul>
        </div>
        <div class="clear" style="height: 20px"></div>
        <div class="group">
            <h3>群组+</h3>
            <ul>
                <li class="selected"><img src="/images/app_speak_small.png"/><a>畅捷通企业空间</a></li>
                <li><img src="/images/app_calendar_small.png"/><a>全体成员</a></li>
                <li><img src="/images/app_speak_small.png"/><a>产品群组</a></li>
                <li><img src="/images/app_library_small.png"/><a>产品二部</a></li>
                <li><img src="/images/app_blog_small.png"/><a>所有群组</a></li>
            </ul>
        </div>

    </div>
    <div class="grid task">
        <h1>任务<a href="#" class="creator"><strong style="font-size: 14px;">+</strong>&nbsp;&nbsp;创建任务</a> </h1>
        <h2><a href="#" class="selected">全部</a><a href="#">创建的</a><a href="#">负责的</a><a href="#">参与的</a><a href="#">被知会的</a><a href="#">关注的</a><a href="#">草稿箱</a><input type="checkbox" />待办<span class="status">查看状态</span></h2>
        <div class="all container">
            <div class="grid center" style="width: 60px;"><img class="photo" src="/images/test/37.jpg"/></div>
            <div class="grid" style="width: 550px;">
                <h3><a href="#" class="title">关于“意见反馈”活动3月底评选活动奖励的落</a> <br><a href="#" class="name">朱娜></a><a href="#" class="space">畅捷通</a></h3>
            </div>
        </div>
    </div>
</div>

{include file="employee/footer.tpl"}
</body>
</html>

