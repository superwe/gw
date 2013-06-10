<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/html">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/allEmployee.css"/>
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<title>企业空间--全体成员首页</title>
</head>

<body>
{include file="employee/header.tpl"}
<!--主内容区开始-->
<div id="Employee_Index">
    <!--顶部菜单开始-->
    {include file="./employeeHeader.tpl"}
    <!--顶部菜单结束-->
    <!--主内容区开始-->
    <div class="container clearfix employee_content" style="width: 980px;">
        <div style="background: white;padding-top: 10px;"></div>
		<div class="grid category" style="width: 980px;">
			<a href="javascript:;" data="all" class="selected">全体成员({$category.all})</a>
			<a href="javascript:;" data="online">在线成员({$category.online})</a>
			<a href="javascript:;" data="myFollow">我关注的({$category.myFollow})</a>
			<a href="javascript:;" data="myFans">关注我的({$category.myFans})</a>
		</div>
		<div class="grid client" style="display:none;">
			<ul class="catagoryUl clientUl">
				<li><a href="javascript:;" data="0" class="cur">全部</a></li>
				<li><a href="javascript:" data="">手机端</a></li>
				<li><a href="javascript:" data="">WEB端</a></li>
			</ul>
		</div>
		<div class="grid group" style="display:none;">
			<ul class="catagoryUl groupUl">
				<li><a href="javascript:;" data="0">全部</a></li>
				<li><a href="javascript:;" data="-1">相互关注</a></li>
				<li><a href="javascript:;" data="-2">未分组</a></li>
                <li class="moreGroupLi hidden" style="position: relative;">
                    <a href="javascript:;">更多</a>
                    <div class="hidden" id="moreGroupContainer"></div>
                </li>
			</ul>
			<a class="createEmployeeGroup" href="javascript:;">创建分组</a>
		</div>
		<div class="grid firstletter" style="width: 980px">
			<a href="#" class="selected">所有</a>
			<a href="#">A</a>
			<a href="#">B</a>
			<a href="#">C</a>
			<a href="#">D</a>
			<a href="#">E</a>
			<a href="#">F</a>
			<a href="#">G</a>
			<a href="#">H</a>
			<a href="#">I</a>
			<a href="#">J</a>
			<a href="#">K</a>
			<a href="#">L</a>
			<a href="#">M</a>
			<a href="#">N</a>
			<a href="#">O</a>
			<a href="#">P</a>
			<a href="#">Q</a>
			<a href="#">R</a>
			<a href="#">S</a>
			<a href="#">T</a>
			<a href="#">U</a>
			<a href="#">V</a>
			<a href="#">W</a>
			<a href="#">X</a>
			<a href="#">Y</a>
			<a href="#">Z</a>
		</div>
		<table id="EmployeeTab" class="employeeTab" cellpadding="0" cellspacing="0" style="width: 980px;">
			<thead><tr></tr></thead>
            <tfoot>
                <tr>
                    <td colspan="6">
                        <div id="yyActLine" class="grid container" style="width: 970px;">
                            <div class="grid">
                                <input type="checkbox" class="select_all">
                                <a href="javascript:;" class="attentionselected" role="{$employeeType}">关注所选</a>
                            </div>
                            <div class="grid_12 yy-page-line"></div>
                        </div>
                    </td>
                </tr>
            </tfoot>
            <tbody></tbody>
        </table>
    </div>
    <!--主内容区结束-->
</div>
<!--主内容区结束-->
<script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script src="/js/yonyou/lib/yonyou.js"></script>
<script src="/js/yonyou/modules/employee/employee_index.js"></script>
{include file="employee/footer.tpl"}
</body>
</html>

