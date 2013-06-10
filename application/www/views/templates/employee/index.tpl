<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="stylesheet" type="text/css" href="/css/reset.css" />
<link rel="stylesheet" type="text/css" href="/css/grid.css" />
<link rel="stylesheet" type="text/css" href="/css/employee.css" />
<link rel="stylesheet" type="text/css" href="/css/speech.css" />
<link rel="stylesheet" type="text/css" href="/css/common.css" />
<script type="text/javascript" src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script type="text/javascript" src="http://cdn.qiater.com/js/jquery/cookie/jquery.cookie.js"></script>
<script type="text/javascript" src="/js/yonyou/lib/yonyou.js"></script>
<script type="text/javascript" src="/js/yonyou/modules/home/index.js"></script>
<title>首页-畅捷通-企业空间</title>

</head>

<body>
{include file="employee/header.tpl"}

<div class="container clearfix workDiv" >
    {include file="employee/leftbar.tpl"}
    <div class="grid home_wrap">
        <div class="create_panel">
            <h3>创建</h3>
            <ul class="app">
                <li><a id="speechApp" href="javascript:;"><img src="/images/app_speak.png"><br>发言</a></li>
                <li><a href="#" ><img src="/images/app_schedule.png"><br>日程</a></li>
                <li><a href="#" ><img src="/images/app_task.png"><br>任务</a></li>
                <li><a href="#" ><img src="/images/app_library.png"><br>文库</a></li>
                <li><a href="#" ><img src="/images/app_activity.png"><br>活动</a></li>
                <li><a href="#" ><img src="/images/app_blog.png"><br>博客</a></li>
                <li><a href="#" ><img src="/images/app_vote.png"><br>投票</a></li>
            </ul>
            <div id="speechArea" class="hidden">
                {include file="employee/_common/speechEditor.tpl"}
                {include file="employee/_common/speechEditorJsTemplate.tpl"}
            </div>
        </div>

        <div id="bg_div" class="fl gg_cont relative" style="margin-left: 15px;">
            <div class="yy-slider-wrapper" style="width: 600px;">
                <div class="yy-slider-big" style="width: 3600px; left: 0px;">
                    <a href="javascript:;" target="_blank" style="width: 600px;"><img src="http://esnimage.uu.com.cn/qz/201305/8/1367992319fpdp.jpg" alt="" width="600"></a>
                    <a href="javascript:;" target="_blank" style="width: 600px;"><img src="http://esnimage.uu.com.cn/qz/201304/1/1364798724M1pb.jpg" alt="企业空间技术支持电话" width="600"></a>
                    <a href="javascript:;" target="_blank" style="width: 600px;"><img src="http://esnimage.uu.com.cn/qz/201304/27/1367050874Q2Z8.jpg" alt="" width="600"></a>
                    <a href="javascript:;" target="_blank" style="width: 600px;"><img src="http://esnimage.uu.com.cn/qz/201304/26/1366940499rDDQ.jpg" alt="运动会" width="600"></a>
                    <a href="javascript:;" target="_blank" style="width: 600px;"><img src="http://esnimage.uu.com.cn/qz/201304/28/1367113245Hh5x.jpg" alt="" width="600"></a>
                    <a href="javascript:;" target="_blank" style="width: 600px;"><img src="http://esnimage.uu.com.cn/qz/201305/8/1367994340mG4o.jpg" alt="" width="600"></a>
                </div>
            </div>
            <ul class="yy-slider-nav">
                <li class="cur">1</li>
                <li>2</li>
                <li>3</li>
                <li>4</li>
                <li>5</li>
                <li>6</li>
            </ul>
        </div>

        <div class="feedmenu">
            <ul class="yy-feed-menu">
                <li><a href="javascript:;" id="member-feed" ele-role="feed_title" data="/employee/feed/myfeed.html">我的动态</a></li>
                <li><a href="javascript:;" ele-role="feed_title" data="/employee/feed/allfeed.html">全部动态</a></li>
                <li><a href="javascript:;" ele-role="feed_title" data="/employee/feed/attfeed.html">关注动态</a></li>
                <li><a href="javascript:;" ele-role="feed_title" data="/employee/feed/speech.html">全部发言</a></li>
            </ul>
        </div>

        <div class="feed_div">

        </div>
        <div style="margin: 10px 15px;" class="bottomMore clearfix" id="footer_morefeed">
            <a href="javascript:;" id="index_moreFeed" data="/employee/feed/myfeed.html" resource-id="feed_div">查看更多&gt;&gt;</a>
        </div>
    </div>

    <div class="grid rightbar">
        <div class="container" style="padding: 8px;">
            <div class="grid task_panel" style="background: #80C3F6;">
                <h3 style="font-size: 20px;">待办<br>任务>></h3>
                <h2>23</h2>
            </div>
            <div class="grid task_panel" style="background: #75DE81;">
                <h3>我负责的<br>&nbsp;</h3>
                <h2>23</h2>
            </div>
            <div class="grid task_panel" style="background: #F9CE84;">
                <h3>我发给<br>别人的</h3>
                <h2>23</h2>
            </div>
            <div class="grid task_panel" style="background: #9AC2F9;">
                    <h3>我参与的<br>&nbsp;</h3>
                    <h2>23</h2>
            </div>
        </div>
        <div class="annouce_panel" style="padding: 8px;">
            <h3 class="thick">公告<span><a href="/employee/announce/index.html" style="color: #ffffff">>></a></span></h3>
            {foreach from=$announceList item=announce}
                <div class="item">
                    <a href="" class="creator">{$announce->creator}:</a>
                    <a href="/employee/announce/detail/0/{$announce->id}.html" class="title" title="{$announce->title}"> {$announce->title}</a>
                    <img class="new" src="/images/new.png"/>
                </div>
            {/foreach}
        </div>
        <div class="birthday_panel user_card"  style="padding: 8px;">
            <h3 class="thick">生日祝福<span>>></span></h3>
            <div class="item container">
                <div class="grid" style="width: 32px">
                    <img class="photo" src="/images/test/37.jpg" tips="1" rel ="/employee/employee/cardInfo/2"/>
                </div>
                <div class="grid" style="width:118px;margin:0 5px;">
                    <h6><a href="#">朱娜</a></h6>
                    <h6>2013-01-01</h6>
                </div>
                <div class="grid" style="width:20px">
                    <img src="/images/birthday.png"/>
                </div>
            </div>
            <div class="item container">
                <div class="grid" style="width: 32px">
                    <img class="photo" src="/images/test/37.jpg" tips="1" rel ="/employee/employee/cardInfo/3"/>
                </div>
                <div class="grid" style="width:118px;margin:0 5px;">
                    <h6><a href="#">朱娜</a></h6>
                    <h6>2013-01-01</h6>
                </div>
                <div class="grid" style="width:20px">
                    <img src="/images/birthday.png"/>
                </div>
            </div>
        </div>
        <div class="newmember_panel" style="padding: 8px;">
            <h3 class="thin">热烈欢迎新成员</h3>
            <div class="container" style="width: 100%;margin: 5px 0;">
                <div class="grid item">
                    <img class="photo" src="/images/test/37.jpg"/>
                    <a href="#">朱娜</a>
                </div>
                <div class="grid item">
                    <img class="photo" src="/images/test/37.jpg"/>
                    <a href="#">朱娜</a>
                </div>
                <div class="grid item">
                    <img class="photo" src="/images/test/37.jpg"/>
                    <a href="#">朱娜</a>
                </div>
            </div>
        </div>
    </div>
</div>
{include file="employee/footer.tpl"}
<script type="text/javascript" src=" /js/yonyou/modules/speech/speech.js"></script>
</body>
</html>

