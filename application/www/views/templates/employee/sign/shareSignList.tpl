<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/html">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="stylesheet" type="text/css" href="/css/reset.css" />
<link rel="stylesheet" type="text/css" href="/css/grid.css" />
<link rel="stylesheet" type="text/css" href="/css/employee.css" />
<link rel="stylesheet" type="text/css" href="/css/common.css" />
<link rel="stylesheet" type="text/css" href="/css/sign.css"/>
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<title>企业空间--查看分享人签到</title>
</head>

<body>
{include file="employee/header.tpl"}
<!--主内容区开始-->
<div id="Sign_ShareSignList" class="clearfix SignContainer">
    <!--左侧开始-->
    <div class="grid signLeftContainer">
        <!--左侧菜单开始-->
        <div class="signMenuContainer">
            <div class="floatL signMenu">
                <h2>分享人签到列表<span></span></h2>
                <ul class="signMenuUl hidden">
                    <li><a href="/employee/sign/index">全部签到</a></li>
                    <li><a href="/employee/sign/mySign">我的签到</a></li>
                    {if $hasTask > 0}<li><a href="/employee/sign/taskList">定时任务</a></li>{/if}
                </ul>
            </div>
            <a href="javascript:;" class="floatR signShare"></a>
        </div>
        <!--左侧菜单结束-->

        <!--左侧签到列表开始-->
        <div id="signListContainer">
            <ul class="clearfix signListUl"></ul>
        </div>
        <!--左侧签到列表结束-->
        <!--分页开始-->
        <div class="signPageContainer"></div>
        <!--分页结束-->
    </div>
    <!--左侧结束-->
    <!--右侧开始-->
    <div class="grid signRightContainer">
        <div class="signRightContent">
            <!--签到记录开始-->
            <table class="signRightTab">
                <caption>签到记录<a href="/employee/sign/exportExcel?share=1" title="导出EXCEL" class="excel"></a></caption>
                <thead>
                <tr>
                    <th>成员</th>
                    <th>时间</th>
                    <th>省份</th>
                    <th>城市</th>
                    <th>地点</th>
                    <th>备注</th>
                    <th>来源</th>
                </tr>
                </thead>
                <tbody></tbody>
            </table>
            <div class="taskRightPage"></div>
            <!--签到记录结束-->
        </div>
    </div>
    <!--右侧结束-->
</div>
<!--主内容区结束-->
<script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script src="/js/yonyou/lib/yonyou.js"></script>
<script src="/js/yonyou/modules/sign/sign.js"></script>
{include file="employee/footer.tpl"}
</body>
</html>

