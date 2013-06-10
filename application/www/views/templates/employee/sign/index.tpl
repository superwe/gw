<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="stylesheet" type="text/css" href="/css/reset.css" />
<link rel="stylesheet" type="text/css" href="/css/grid.css" />
<link rel="stylesheet" type="text/css" href="/css/employee.css" />
<link rel="stylesheet" type="text/css" href="/css/common.css" />
<link rel="stylesheet" type="text/css" href="/css/sign.css"/>
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<title>企业空间--签到首页</title>
</head>

<body>
{include file="employee/header.tpl"}
<!--主内容区开始-->
<div id="Sign_Index" class="clearfix SignContainer">
    <!--左侧开始-->
    <div class="grid signLeftContainer">
        <!--左侧菜单开始-->
        <div class="signMenuContainer">
            <div class="floatL signMenu">
                <h2><a href="/employee/sign/index">全部签到</a><span></span></h2>
                <ul class="signMenuUl hidden">
                    <li><a href="/employee/sign/mySign">我的签到</a></li>
                    {if $hasTask > 0}<li><a href="/employee/sign/taskList">定时任务</a></li>{/if}
                </ul>
            </div>
            <a href="javascript:;" class="floatR signShare"></a>
        </div>
        <!--左侧菜单结束-->
        <!--左侧搜索框开始-->
        <div class="signSearchContainer">
            <div class="grid rcAddmenList employeeContainer">
                <ul id="joinuser_list" class="rcAddmenListUl grid" style="width: 200px;">
                    <li class="floatL">
                        <input type="text" name="" value="" class="scInput" style="border:none;width: 50px;" />
                    </li>
                </ul>
                <a href="javascript:;" for="joinuser" class="floatR selectEmployee" style="vertical-align: middle;"></a>
            </div>
            <div class="grid signSearchOp">
                <a class="signSearchBtn" href="javascript:;">搜索</a>
                <a class="signSearchBox" href="javascript:;">
                    <span class="searchNav signSearchNav" data="index"></span>
                </a>
            </div>
        </div>
        <!--左侧搜索框结束-->
        <!--左侧签到列表开始-->
        <div class="clearfix signListContainer">
            <ul class="clearfix signListUl"></ul>
            <div class='noSignInfo hidden'>暂时没有符合条件的签到记录...</div>
        </div>
        <!--左侧签到列表结束-->
        <!--分页开始-->
        <div class="signPageContainer"></div>
        <!--分页结束-->
    </div>
    <!--左侧结束-->
    <!--右侧开始-->
    <div class="grid signRightContainer">
        <!--地图区域开始-->
        <div id="signMapContainer" class="signRightContent"></div>
        <!--地图区域结束-->
    </div>
    <!--右侧结束-->
</div>
<!--主内容区结束-->
<script type="text/javascript" src="http://api.map.baidu.com/api?v=1.4"></script>
<script type="text/javascript" src="http://api.map.baidu.com/library/MarkerTool/1.2/src/MarkerTool_min.js"></script>
<script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script src="/js/yonyou/lib/yonyou.js"></script>
<script src="/js/yonyou/modules/sign/sign.js"></script>
{include file="employee/footer.tpl"}
</body>
</html>

