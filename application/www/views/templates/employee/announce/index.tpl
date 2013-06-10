<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/cookie/jquery.cookie.js"></script>
    <script type="text/javascript">
        $(document).ready(function()
        {
            $.post("/employee/announce/getAnnounceType.html",function(data){
                if(data.length>0)
                {
                    var ancType=$("#anctype");
                    for(var i=0;i<data.length;i++)
                    {
                        if( parseInt(data[i]["id"]) == {$typeid})
                        {
                            $(ancType).append("<li><a class='selected' ancid='"+ data[i]["id"]+"'>"+data[i]["name"]+"</a></li>");
                        }
                        else
                        {
                            $(ancType).append("<li><a ancid='"+ data[i]["id"]+"'>"+data[i]["name"]+"</a></li>");
                        }
                    }
                }
            },"json");

            $.post("/employee/announce/setSessionStorage.html",{ type: 0 },function(data){
                if(data.length>0)
                {
                    for(var i=0;i<data.length;i++)
                    {
                        sessionStorage.setItem(data[i]['key'],data[i]['prev']+"_"+data[i]['next']);
                    }
                }
            },"json");
        });
    </script>
    <title>公告-企业空间</title>
</head>

<body>
{include file="employee/header.tpl"}
<!--内容-->
<div class="container clearfix workDiv">

    {include file="employee/leftbar.tpl"}

    <div class="grid announce_box" id='content'>
        <div class="announce_header" id='anchead' style="width: 830px;">
            <ul id='anctype' class="tab" style="float:left;margin-left: 10px;margin-top: 18px;">
                <li><a class="selected" ancid='0'>全部</a></li>
            </ul>
        </div>
        <div class="announce_panel  user_card" id='ancpl'>
            <table id='headList' class="anctb">
                <tr id='trlist'>
                    <th class="w4 " name="title">标题</th><th class='w1' name='type'>分类</th><th class="w1 " name="rccount">阅读/评论</th>
                    <th class="w15 " name="creator,">发布人</th><th class="w2 " name="updatetime">发布时间</th>
                </tr>
            </table>
            <div id="ancList" class="grid">
                <ul class="data-list">
                </ul>
                <div id="ancLine" class="grid pageWrap">
                    <div class="grid yy-page-line">
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript" src="/js/yonyou/lib/yonyou.js"></script>
<script type="text/javascript" src="/js/yonyou/modules/announce/announceLoad.js"></script>

{include file="employee/footer.tpl"}
</body>
</html>