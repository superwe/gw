<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />

    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script type="text/javascript">
        $(document).ready(function()
        {
            $.post("/employee/announce/getAnnounceType",{},function(data){
                if(data.type.length>0)
                {

                    var ancType=$("#anctype");
                    for(var i=0;i<data.type.length;i++)
                    {
                        var cli="<li><a ancid='"+ data.type[i]["id"]+"'>"+data.type[i]["name"]+"</a></li>";
                        $(ancType).append($(cli));
                    }
                }
            },"json");


        });
    </script>
    <title>公告-企业空间</title>
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
    <div class="grid" style="width:150px;background: #FFF6BF;border-radius: 5px 0 0 5px;">
        <div  style="padding: 5px;"><img src="/images/test/logo140.jpg"/></div>
        <div class="clear" style="height: 20px"></div>
        <div class="app">
            <h3>应用</h3>
            <ul>
                <li class="selected"><img src="/images/app_speak_small.png"/><a>发言</a></li>
                <li><img src="/images/app_calendar_small.png"/><a>日历</a></li>
                <li><img src="/images/app_speak_small.png"/><a>任务</a></li>
                <li><img src="/images/app_library_small.png"/><a>文库</a></li>
                <li><img src="/images/app_blog_small.png"/><a>博客</a></li>
                <li><img src="/images/app_activity_small.png"/><a>活动</a></li>
                <li><img src="/images/app_blog_small.png"/><a>话题</a></li>
                <li><img src="/images/app_blog_small.png"/><a>签到</a></li>
                <li><img src="/images/app_blog_small.png"/><a>投票</a></li>
                <li><img src="/images/app_blog_small.png"/><a>OA</a></li>
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
    <div class="container clearfix" style="height: 907px;">
        <div class="grid announce_header" style="width: 823px;margin-left: 5px;">
            <ul id='anctype' class="tab" style="float:left;margin-left: 10px;margin-top: 18px;">
                <li><a class="selected">全部</a></li>
            </ul>
            <div class="grid ancpl">
                <table id="yyMemberList" class="grid anctb" cellpadding="0" cellspacing="0">
                    <thead><tr></tr></thead>
                    <tfoot style="display:none;"><tr><th></th></tr></tfoot>
                    <tbody></tbody>
                </table>
                <div id="yyActLine" class="grid container" style="margin-top: 10px;">
                    <div class="grid yy-page-line" style="margin-left: 230px;">

                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script src="/js/yonyou/lib/yonyou.js"></script>

<script type="text/javascript">
    (function($, YY, util){
        $(function(){
            YY.loadScript('yonyou/widgets/dataTable/dataTable.js', {
                fn: function() {
                    var member_list = '#yyMemberList', // 数据表格的id
                            remoteUrl = util.url('employee/announce/getAnnounceList'); // 请求远程数据的uri地址

                    var dtObj = new YY.DataTable({
                        // 表格选择器;
                        selector: member_list,
                        // 操作按钮所在的块(包括上下翻页、各种批量操作等);
                        actLine: '#yyActLine',
                        // 页码行;
                        pageLine: '.yy-page-line',
                        // 每页显示的数量;
                        perPage: 20,
                        // 分页中显示的数量，最好使用基数，易于对称性;
                        pageCount: 5,
                        // 远程获取数据的URL;
                        remoteUrl: remoteUrl,
                        // 表示是否一次性获取所有数据;
                        isOnce: false,
                        success: function() {
                            // do nothing
                        }
                    });
                    //util.trace(dtObj)
                }
            });
        });
    }(jQuery, YonYou, YonYou.util))
</script>

<div id="footer" class="container clearfix" style="width:100%;margin-top: 40px;margin-bottom: 20px;">
    <div class="grid" style="width: 600px;padding-left: 420px">
        <div class="container">
            <div class="grid" style="width: 40px;">
                <img src="/images/xt_footer_ico.png"/>
            </div>
            <div class="grid" style="width: 500px;text-align: center;padding: 0;margin-left: 20px;line-height: 20px;">
                <a href="http://clouds.yonyou.com">用友公有云</a><a href="http://open.yonyou.com">开发者中心</a><a href="http://www.uu.com.cn/apps.php">应用中心</a><a href="http://store.yonyou.com">用友商城</a><a href="http://niwen.yonyou.com">用友云服务</a><br/>
                京ICP备05007539号-7 Powered by 用友云平台 1.5 © 2009-2012 yonyou Software CO.LTD
            </div>
        </div>
    </div>
</div>

</body>
</html>