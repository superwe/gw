<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/cookie/jquery.cookie.js"></script>
    <script type="text/javascript" src="/js/yonyou/lib/yonyou.js"></script>
    <script type="text/javascript" src="/js/yonyou/modules/notice/notice.js"></script>
    <title>通知-畅捷通-企业空间</title>
</head>

<body>
{include file="employee/header.tpl"}
<div class="container clearfix" style="width:980px;margin-top:25px;border-radius: 5px;background-color: #FFF6BF;">
    {include file="employee/leftbar.tpl"}
    <div class="grid notice_box">
        <h1>通知</h1>
        <div style="width: 830px;" id="anchead" class="notice_header">
            <ul style="float:left;margin-left: 10px;margin-top: 18px;" class="tab" id="anctype">
                <li><a href="/employee/notice/index.html" class="selected">通知</a></li>
                <li><a href="/employee/notice/handel.html">待处理</a></li>
                {*<li><a href="/employee/notice/shield.html">屏蔽</a></li>*}
            </ul>
        </div>
        <div class="notice_panel">
            <div class="notice_content">
                <div class="title notice_menu">
                    <a href="javascript:;" module="0" class="cur">全部（{$moduleNum['0']|default:0}）</a>
                    <a href="javascript:;" module="103">发言（{$moduleNum['103']|default:0}）</a>
                    <a href="javascript:;" module="108">群组（{$moduleNum['108']|default:0}）</a>
                    <a href="javascript:;" module="107">任务（{$moduleNum['107']|default:0}）</a>
                    <a href="javascript:;" module="105">日历（{$moduleNum['105']|default:0}）</a>
                    {*<a href="javascript:;" module="124">博客（0）</a>
                    <a href="javascript:;" module="110">投票（0）</a>*}
                    <a href="javascript:;" module="109">文库（{$moduleNum['109']|default:0}）</a>
                    <a href="javascript:;" module="112">公告（{$moduleNum['112']|default:0}）</a>
                    <a href="javascript:;" module="102">关注（{$moduleNum['102']|default:0}）</a>
                    <input type="hidden" value="0" id="ishandel" />
                </div>
                <div class="notice_list">

                </div>
                <div class="notice_page_container"></div>
            </div>
        </div>
    </div>

</div>
{include file="employee/footer.tpl"}
</body>
</html>

