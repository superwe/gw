<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <link rel="stylesheet" type="text/css" href="/css/vote.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <title>投票-企业空间</title>
</head>
<body>
<!--页头-->
<div class="wrapper_globalheader">
    <div class="container clearfix" style="width: 980px;">
        <div class="grid" style="width:210px;margin-top: 10px;">
            <a href="#" class="logo"></a>
        </div>
        <div class="grid" style="width: 630px;">
            <ul class="nav_globalheader">
                <li><a href="/employee/home/index.html">个人主页</a></li>
                <li><a href="/employee/allmember/index.html">全体成员</a></li>
                <li><a href="#">全部应用</a></li>
            </ul>
        </div>
        <div class="grid" style="width:140px;margin-top: 10px;">
            <img src="/images/topRLogo.png"/>
        </div>
    </div>
</div>

<!--内容-->
<div class="container clearfix content" style="width:980px;">
    {include file="employee/leftbar.tpl"}
    <div class="grid" style="width:630px;background: white;">
        <div class="vote_header tpNew_top"><span style="color: #767676;font-size: 16px;">投票</span> <a href="index.html" style="float: right;color: #BEBEBE;font-size: 12px;">返回投票列表</a></div>
        <div class="content" style="margin-left: 10px;" id="voteList">
            <article class="middleBox richeng guanzhuBox">
                {include file="employee/vote/createform.tpl"}
            </article>
        </div>
    </div>
    <div class="grid" style="width:195px;background: #F8F8F8;border-radius: 0 5px 5px 0;margin-left: 5px;">
        {include file="employee/vote/right.tpl"}
    </div>
</div>
<script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script src="/js/yonyou/lib/yonyou.js"></script>
<script src="http://cdn.qiater.com/js/jquery/datepicker/1.6.1/zebra_datepicker.js"></script>
<script src="http://cdn.qiater.com/js/swfupload/swfupload.js"></script>
<script src="http://cdn.qiater.com/js/swfupload/swfupload.queue.js"></script>
<script src="http://cdn.qiater.com/js/swfupload/yy.upload.handlers.js"></script>
<script src="/js/yonyou/lib/yy.uploadready.js"></script>
<script src="/js/yonyou/vote/vote.js"></script>

{include file="footer.tpl"}
</body>
</html>