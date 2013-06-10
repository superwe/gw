<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/allEmployee.css"/>
    <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/ztree/3.5/zTreeStyle.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<style type="text/css">

</style>
<title>企业空间--通讯录视图</title>
</head>

<body>
{include file="employee/header.tpl"}
<!--主内容区开始-->
<div id="Employee_AddressBook" class="clearfix">
    <!--顶部菜单开始-->
    {include file="./employeeHeader.tpl"}
    <!--顶部菜单结束-->
    <!--内容区开始-->
    <div class="container clearfix addressbookContainer" style="width: 980px;">
        <!--左侧结构树开始-->
        <div class="grid deptTreeContainer" style="width:214px;overflow-y:auto;">
            <h2 class="cylTit">组织结构</h2>
            <p><input type="text" name="searchDeptName" value="" class="searchDeptName" /></p>
            <!--组织架构树开始-->
            <div class="deptTreeContainer">
                <h3 class="deptTreeTitle">{$topDept.name|default:''}</h3>
                <ul id="addressbookTree" class="ztree deptTreeUl"></ul>
            </div>
            <!--组织架构树结束-->
        </div>
        <!--左侧结构树结束-->
        <!--右侧成员列表开始-->
        <div class="grid employeeContainer" style="width:750px;">
            <div class="firstletter">
                <a href="#">所有</a>
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
            <!--成员列表开始-->
            <table id="addressbookTable" class="addressbookTab" cellpadding="0" cellspacing="0" style="width:740px;">
                <thead>
                    <tr>
                        <!--
                        <th width="3%">
                            <input type="checkbox" name="checkAll" class="checkAll" style="vertical-align:middle;" />
                        </th>
                        -->
                        <th width="15%">姓名</th>
                        <th width="17%">部门</th>
                        <th width="20%">职位</th>
                        <th width="25%">电子邮箱</th>
                        <th width="20%">手机</th>
                    </tr>
                </thead>
                <tbody>
                    {foreach item=item from=$lists name=sec}
                        <tr>
                            <!--
                            <td>
                                <input type="checkbox" name="employeeId[]" value="{$item.id}" class="employeeId" />
                            </td>-->
                            <td style="padding:1px 0px 3px 6px;">
                                <a href="/employee/homepage/index?employeeid={$item.id}">
                                    <img src="{$imgHost}{$item.imageurl}" alt="{$item.name}" rel="{$imgHost}default_avatar.thumb.jpg" />&nbsp;
                                    {$item.name}
                                </a>
                            </td>
                            <td>{$item.deptName}</td>
                            <td>{$item.duty}</td>
                            <td>{$item.email}</td>
                            <td>{$item.mobile}</td>
                        </tr>
                        {foreachelse}
                        <tr><td colspan="6" style="text-align:center;">暂时没有符合条件的成员相关数据...</td></tr>
                    {/foreach}
                </tbody>
            </table>
            <!--成员列表结束-->
            <div class="qitaterPage" data="{$total}"></div>
        </div>
        <!--右侧成员列表结束-->
    </div>
    <!--内容区结束-->
</div>
<!--主内容区结束-->
<script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script src="/js/yonyou/lib/yonyou.js"></script>
<script src="/js/yonyou/modules/employee/employee_addressbook.js"></script>
{include file="employee/footer.tpl"}
</body>
</html>