<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/cookie/jquery.cookie.js"></script>
    <script type="text/javascript">
        $(document).ready(function()
        {
            $.post("/employee/announce/getAnnounceContent",{ announceId: {$announceId} },function(data){
                if(data.length>0)
                {
                    var ancdetail=$("#ancDiv");
                    $(ancdetail).append(data);
                }
            },"text");

            var keys="{$type}_{$announceId}";
            var list=sessionStorage.getItem(keys);
            var prev=list.substr(0,list.indexOf("_"));
            var next=list.substr(list.indexOf("_")+1);
            if(list!=""&&list!=null )
            {
                var prevstr = "'/employee/announce/detail/{$type}/"+prev+".html'>";
                var nextstr = "'/employee/announce/detail/{$type}/"+next+".html' style='margin-left: -1px'>";
                var griddiv=$("#prntdiv");
                if(prev != 0 && next != 0 )
                {
                    var obja = "<a href="+prevstr+"<img src='/images/test/prev.png'></a><a  href="+nextstr+"<img src='/images/test/next.png'></a>";
                    $(griddiv).append($(obja));
                }
                else
                {
                    if(prev == 0 && next != 0 )
                    {
                        var obja = "<a  style='margin-left: 33px;' href="+nextstr+"<img src='/images/test/next.png'></a>";
                        $(griddiv).append($(obja));
                    }
                    if(next == 0 && prev != 0)
                    {
                        var obja = "<a href="+prevstr+"<img src='/images/test/prev.png'></a>";
                        $(griddiv).append($(obja));
                    }
                }
            }
        });
    </script>

    <title>公告-企业空间</title>
</head>

<body>
{include file="employee/header.tpl"}

<!--内容-->
<div class="container clearfix workDiv">
    {include file="employee/leftbar.tpl"}
    <div class="grid announce_box" style="width: 830px;">
        <div id="ancDiv" class="announce_detail_panel">
            <div style="width: 100%; height: 70px">
                <div class="grid" style="width: 80%"><p style="font-size: 18px;font-family: '微软雅黑';color: #767676">公告</p></div>
                <div id="prntdiv" class="grid" style="width: 68px;">
                </div>
                <div class="grid">
                    <p  style="margin-left: 10px;margin-top: 7px;"><a href="/employee/announce/index.html"><img src="/images/test/return.png"></a></p>
                </div>
                <div class="grid">
                    <p  style="margin-left: 5px;margin-top: 6px;"><a href="/employee/announce/index.html" style="color: #b5b5b5;">返回</a></p>
                </div>
            </div>
        </div>
    </div>
</div>
{include file="employee/footer.tpl"}
</body>
</html>