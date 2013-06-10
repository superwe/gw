<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<link rel="stylesheet" type="text/css" href="/css/reset.css" />
<link rel="stylesheet" type="text/css" href="/css/grid.css" />
<link rel="stylesheet" type="text/css" href="/css/employee.css" />
<link rel="stylesheet" type="text/css" href="/css/common.css" />
<link rel="stylesheet" type="text/css" href="/css/speech.css" />
<link rel="stylesheet" type="text/css" href="/css/homepage.css" />
<script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script type="text/javascript" src="/js/yonyou/lib/yonyou.js"></script>
<script type="text/javascript" src="/js/yonyou/modules/homepage/homepage.js"></script>
<script type="text/javascript" src="/js/yonyou/modules/home/index.js"></script>

<title>首页-畅捷通-企业空间</title>
</head>
<body>
{include file="employee/header.tpl"}

<div class="container clearfix content" style="width:980px;margin-top:25px;">
    <div class="grid myhome_left" style="width:778px;background: white;">
        <div class="myavar ">
            <div class="fl">
                <a href="javascript:;"  class="figure ">
                    {avatar pic=$employeeInfo.imageurl size="middle"}
                </a>
            </div>
            <div class="my_xinx fl">
                <p class="line24">
                    <span class="fl name">{$employeeInfo.name}</span>
                    {if $employeeInfo.nickname}
                    <span class="fl nameClue">
                        （
                        <a title="{$employeeInfo.nickname}" href="#">{$employeeInfo.nickname}</a>
                        ）
                    </span>
                    {/if}
                    <span class="groupOnline fl"></span>
                    <a title="个人设置" class="my_SetIco fr" href="/employee/homepage/avatar.html"></a>
                </p>
                <p class="f14 line30">
                    <span  class="placeholder fl" style="font-size:12px;">编辑我的状态栏</span>
                </p>
                <p class="line22">
                    {$employeeInfo.duty}
                </p>
                <p class="line22">
                    <a id="showdetails">更多详细资料...</a>
                </p>
                <input name="employeeid" value="{$employeeInfo.id}" id="employeeid" type="hidden">
                {if !empty($isauthor)}
                <p  class="line22"  id="fileTitle">
                    <input type="text" class="addInput yy-file-title hidden" name="title" value="{if $employeeInfo.introduce}{$employeeInfo.introduce}{/if}" readonly="" style="width: 267px;">
                    <span  class="placeholder fl" style="font-size:12px;">{if $employeeInfo.introduce}{$employeeInfo.introduce}{else}编辑我的简介{/if}</span>
                    <a title="编辑简介"  class="icoBj" href="#"> &nbsp;</a>
                </p>
                {/if}
            </div>
            <div  class="my_xinx_r fl">
                <p class="new_icoqz mt20">
                    <a href="#">关注</a>
                    {$employeeInfo.follownum}
                </p>
                <p class="fensi_ico">
                    <a href="#">粉丝</a>
                    {$employeeInfo.fansnum}
                </p>
            </div>
            <div style="clear: both"></div>
        </div>
        <div class="new_dtnum">
            <div class="new_dtnum_bj">
                <div class="num_line">

                    <div class="num_div relative">
                        <div class="dt_numk relative yy-feed-icon">
                            <span>18</span>
                        </div>
                        <div class="numico_cur yy-feed-icon">
                            <span class="xsj"></span>
                            <span class="xsj2"></span>
                        </div>
                        <div class="num_word yy-feed-icon" >
                            <span>发言</span>
                        </div>
                    </div>
                    <div class="num_div relative">
                        <div class="dt_numk relative yy-feed-icon">
                            <span>18</span>
                        </div>
                        <div class="numico yy-feed-icon">
                            <span class="xsj"></span>
                            <span class="xsj2"></span>
                        </div>
                        <div class="num_word yy-feed-icon" >
                            <span>任务</span>
                        </div>
                    </div>
                    <div class="num_div relative">
                        <div class="dt_numk relative yy-feed-icon">
                            <span>18</span>
                        </div>
                        <div class="numico yy-feed-icon">
                            <span class="xsj"></span>
                            <span class="xsj2"></span>
                        </div>
                        <div class="num_word yy-feed-icon" >
                            <span>投票</span>
                        </div>
                    </div>
                    <div class="num_div relative">
                        <div class="dt_numk relative yy-feed-icon">
                            <span>18</span>
                        </div>
                        <div class="numico yy-feed-icon">
                            <span class="xsj"></span>
                            <span class="xsj2"></span>
                        </div>
                        <div class="num_word yy-feed-icon" >
                            <span>话题</span>
                        </div>
                    </div>
                    <div class="num_div relative">
                        <div class="dt_numk relative yy-feed-icon">
                            <span>18</span>
                        </div>
                        <div class="numico yy-feed-icon">
                            <span class="xsj"></span>
                            <span class="xsj2"></span>
                        </div>
                        <div class="num_word yy-feed-icon" >
                            <span>日程</span>
                        </div>
                    </div>
                    <div class="num_div relative">
                        <div class="dt_numk relative yy-feed-icon">
                            <span>{$employeeInfo.filesnum}</span>
                        </div>
                        <div class="numico yy-feed-icon">
                            <span class="xsj"></span>
                            <span class="xsj2"></span>
                        </div>
                        <div class="num_word yy-feed-icon" >
                            <span>文档</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <div id="myhome" class="my_home">
            <div class="middleBox" style="padding: 10px 15px;">
                <div class="tab_menu_bj  clearfix">
                    <ul class="yy-feed-menu">
                        <li class="cur">
                            <a href="javascript:;" id="member-feed" ele-role="feed_title" data="/employee/feed/myfeed?eid={$employeeInfo.id}.html">{$author_tag}的动态</a>
                        </li>
                        <li >
                            <a href="javascript:;" ele-role="feed_title" data="/employee/feed/attfeed.html?eid={$employeeInfo.id}">{$author_tag}关注的</a>
                        </li>
                        <li  >
                            <a href="javascript:;" ele-role="feed_title" data="/employee/feed/operationfeed.html
" >{$author_tag}喜欢的</a>
                        </li>
                        <li >
                            <a href="javascript:;" ele-role="feed_title" data="/employee/feed/operationfeed.html?operation=2
" >{$author_tag}收藏的</a>
                        </li>
                    </ul>
                </div>
                <div class="feed_div">

                </div>
                <div style="margin: 10px 15px;" class="bottomMore clearfix" id="footer_morefeed">
                    <a href="javascript:;" id="index_moreFeed" data="/employee/feed/myfeed.html" resource-id="feed_div">查看更多&gt;&gt;</a>
                </div>

            </div>
        </div>
        <div id="details" class="detailDiv hidden">
            <h2 class="detailHead mt20"><strong>基本资料</strong></h2>
            <div class="detailContent">
                <ul class="clearfix">
                    <li class="fl w01">姓名：</li>
                    <li class="fl w02">{$employeeInfo.name}</li>
                </ul>
                <ul class="clearfix">
                    <li class="fl w01">花名：</li>
                    <li class="fl w02">{$employeeInfo.nickname}</li>
                </ul>
                <ul class="clearfix">
                    <li class="fl w01">性别：</li>
                    <li class="fl w02">{$employeeInfo.sex_type}</li>
                </ul>
                <ul class="clearfix">
                    <li class="fl w01">邮箱：</li>
                    <li class="fl w02">{$employeeInfo.email}</li>
                </ul>
                <ul class="clearfix">
                    <li class="fl w01">公司：</li>
                    <li class="fl w02">{$employeeInfo.companyname}</li>
                </ul>
                <ul class="clearfix">
                    <li class="fl w01">部门：</li>
                    <li class="fl w02">{$employeeInfo.deptname}</li>
                </ul>
                <ul class="clearfix">
                    <li class="fl w01">职务：</li>
                    <li class="fl w02">{$employeeInfo.duty}</li>
                </ul>
                <ul class="clearfix">
                    <li class="fl w01">办公电话：</li>
                    <li class="fl w02">{$employeeInfo.show_phone}</li>
                </ul>
            </div>
            <h2 class="detailHead mt20"><strong>个人信息</strong></h2>
            <div class="detailContent">
                <ul class="clearfix">
                    <li class="fl w01">生日：</li>
                    <li class="fl w02">{$employeeInfo.birthday}</li>
                </ul>
                <ul class="clearfix">
                    <li class="fl w01">简介：</li>
                    <li class="fl w02">{$employeeInfo.introduce}</li>
                </ul>
            </div>
        </div>
    </div>

    <div class="grid rightbar user_card" style="width:200px;background: #F8F8F8;border-radius: 0 5px 5px 0;">
        <div class="newmember_panel" style="padding: 4px;">
            <h3 class="thin_gray"><span class="jqgz_ico fl"></span>近期工作</h3>
            <div class="container" style="width: 100%;margin: 5px 0;">
            </div>
        </div>
        <div class="newmember_panel" style="padding: 4px;">
            <h3 class="thin_gray">
                <span class="ico_avater  fl"></span>{$author_tag}的关注
                <span class="fr c9 more"><a href="/employee/group/mylist">&gt;&gt;</a></span>
            </h3>
            <div class="container memberDiv" style="width: 100%;">
                <ul class="memberUl">
                    {foreach item=follows from=$myfollows}
                    <li rel="/employee/homepage/index/{$follows.employeeid}.html" tips="1">
                        <a href="/employee/homepage/index/{$follows.employeeid}.html" title="{$follows.name}" class="vipHref">{avatar pic=$follows.imageurl title=$follows.name style="width:33px;" tips=1}</a>
                    </li>
                    {/foreach}
                </ul>
            </div>
        </div>
        <div class="newmember_panel" style="padding: 4px;">
            <h3 class="thin_gray">
                <span class="ico_avater  fl"></span>{$author_tag}的粉丝
                <span class="fr c9 more"><a href="/employee/group/mylist">&gt;&gt;</a></span>
            </h3>
            <div class="container memberDiv" style="width: 100%;">
                <ul class="memberUl">
                    {foreach item=fans from=$myfans}
                        <li rel="/employee/homepage/index/{$fans.employeeid}.html" tips="1">
                            <a href="/employee/homepage/index/{$fans.employeeid}.html" title="{$fans.name}" class="vipHref">{avatar pic=$fans.imageurl title=$fans.name style="width:33px;" tips=1}</a>
                        </li>
                    {/foreach}
                </ul>
            </div>
        </div>
        <div class="newmember_panel" style="padding: 4px;">
            <h3 class="thin_gray"><span class="ico_avater  fl"></span>{$author_tag}的群组
                <span class="fr c9 more"><a href="/employee/group/mylist?eid={$employeeInfo.id}">&gt;&gt;</a></span>
            </h3>

            <div class="container grouplistDiv" style="width: 100%;margin: 5px 0;">
                <ul>
                    {foreach item=group from=$grouplist}
                    <li>
                        <a class="fl" href="/employee/group/index?id={$group.id}"><img width="48" height="48" onerror="imgError(this);" rel="{$group.logourl}" src="{$group.logourl}"></a>
                        <div class="groupinfodiv fl">
                            <p><a title="{$group.name}" href="/employee/group/index?id={$group.id}">{$group.name}</a></p>
                            <p class="c9">{$group.employeenum}人</p>
                        </div>
                    </li>
                    {/foreach}
                </ul>
            </div>
        </div>


    </div>
</div>
{include file="employee/footer.tpl"}
</body>
</html>

