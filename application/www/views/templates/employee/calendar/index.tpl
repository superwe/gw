<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/css/ui/smoothness/jquery-ui-1.8.18.custom.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <link rel="stylesheet" type="text/css" href="/css/calendar.css" />
    <title>日历-企业空间</title>
</head>
<body>
{include file="employee/header.tpl"}
<!--内容-->
<div class="container calendar" id="Calendar">
    <div class="header">
        <h2 class="app-title">日历</h2>
        <div class="left-nav">
            <div class="button-line">
                <a id="yyCalendarNavPrev" href="javascript:;" class="button prev"><span class="sj leftsj"></span></a>
                <a id="yyCalendarNavNext" href="javascript:;" class="button next "><span class="sj rightsj"></span></a>
            </div>
            <span class="time" id="yyCalendarDate"></span>
        </div>
        <div class="right-nav">
            <span class="fr button rlButton yy-calendar-view-button">
                <a class="yy-view-button w40" id="dayCalendar" view="day" href="javascript:;">日</a>
                <a class="yy-view-button w40 mid " id="weekCalendar" view="week" href="javascript:;">周</a>
                <a class="yy-view-button w40 cur" id="monthCalendar" view="month" href="javascript:;">月</a>
            </span>
        </div>
    </div>
    <div class="main">
        <div class="left" id="CalendarLeft">
            <!--小日历-->
            <div class="mini-calendar" id="yyMiniCalendar"></div>
            <ul class="myself-list">
                <li id="yySelfItem" class="fl yy-user-item actived" mid="{$user.id}">
                    <div class="fl user_pic"><img src="{$user.avatar}" alt="{$user.name}"/></div>
                    <a class="f1" href="javascript:;">{$user.name}</a>
                    <a href="#" class="fr user_Del hidden">X</a>
                </li>
            </ul>
            <div class="shared-block">
                <div class="shared-block-header">
                    <h2 class="fl"><strong>共享给我</strong></h2>
                    <a class="icoRi fl" id="toShared" href="/space/ajax/selectmember/for/calendar_share" title="共享我的日历"></a>
                    <a href="javascript:;" class="fr blueLink action-expanded" style="margin:0 0 0 5px;">><</a>
                    {*<a href="javascript:;" class="fr blueLink action-sort">拖拽排序</a>*}
                </div>
                <div class="rili_user2" style="height:0px;">
                    <!-- 滚动内容容器 -->
                    <div class="scroll-container" id="scroll2_container" style="height:0px;">
                        <div class="scroll-shower" id="scroll2_shower">
                            <ul class="shared-list">
                                {foreach item=item key=key from=$sharedArr}
                                    <li id="user_{$item.id}" class="fl yy-user-item" mid="{$item.providerid}" type="2">
                                        <div class="fl user_pic"><img src="{$item.avatar}" alt="{$item.name}"/></div>
                                        <a href="javascript:;" class="fl">{$item.name}</a>
                                        <a href="javascript:;"  class="yy-user-item-delete fr user_Del hidden">X</a>
                                    </li>
                                {/foreach}
                            </ul>
                        </div>
                    </div>
                    <!--滚动条-->
                    <div class="scroller" style="display:none;" id="scroll2_scroller">
                        <div class="scroller-up" id="scroll2_scroll_up"></div>
                        <div class="rili_gd fr relative scroller-bar-wrap">
                            <div class="rili_gd_pic scroller-bar" id="scroll2_scroll_bar"></div>
                        </div>
                        <div class="scroller-down" id="scroll2_scroll_down"></div>
                    </div>
                </div>
            </div>
            <div class="followed-block">
                <div class="followed-block-header">
                    <h2 class="fl"><strong>关注人员</strong></h2>
                    <a class="icoRi fl" id="addFollowed" href="/space/ajax/selectmember/for/calendar" title="添加我关注的人"></a>
                    <a href="javascript:;" class="fr action-expanded blueLink" style="margin:0 0 0 5px;">><</a>
                    {*<a href="javascript:;" class="fr action-sort blueLink">拖拽排序</a>*}
                </div>
                <div class="rili_user" style="height:0px;">
                    <!-- 滚动内容容器 -->
                    <div class="scroll-container" id="scroll_container" style="height:0px;">
                        <div class="scroll-shower" id="scroll_shower">
                            <ul class="followed-list">
                                {foreach item=item key=key from=$followedArr}
                                    <li id="user_{$item.id}" class="fl yy-user-item" mid="{$item.providerid}" type="1">
                                        <div class="fl user_pic"><img src="{$item.avatar}" alt="{$item.name}"/></div>
                                        <a href="javascript:;" class="fl">{$item.name}</a>
                                        <a href="javascript:;"  class="yy-user-item-delete fr user_Del hidden">X</a>
                                    </li>
                                {/foreach}
                            </ul>
                        </div>
                    </div>
                    <!--滚动条-->
                    <div class="scroller" style="display:none;" id="scroll_scroller">
                        <div class="scroller-up" id="scroll_scroll_up"></div>
                        <div class="rili_gd fr relative scroller-bar-wrap">
                            <div class="rili_gd_pic scroller-bar" id="scroll_scroll_bar"></div>
                        </div>
                        <div class="scroller-down" id="scroll_scroll_down"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="right" id="CalendarRight">
            <!-- 主日历-->
            <div class="right-main">
                <div id="CalendarMain">
                    <div class="calendar-main" id="CalendarMainGrid"></div>
                </div>
            </div>
        </div>
    </div>
</div>
{include file="employee/calendar/calendar.tpl"}
<script src="http://cdn.qiater.com/js/jquery/core/1.7.1/jquery.min.js"></script>
<script src="/js/yonyou/lib/yonyou.js"></script>
<script src="/js/yonyou/lib/date.js"></script>
<script type="text/javascript">
    (function($, YY){
        var util = YY.util;
        // DOM Ready
        $(function(){
            util.loadScript(['jquery/noSelect/jquery.noSelect.js',
                // 'jquery/fancybox/jquery.mousewheel-3.0.4.pack.js',
                // 'jquery/fancybox/jquery.fancybox-1.3.4.pack.js',
                'jquery/jqueryui/jquery-ui-1.8.18.custom.min.js',
                'yonyou/lib/yy.core.js',
                'jquery/yyautocomplete/jquery.yyautocomplete.js',
                'yonyou/templates/feedTemplate.js',
                'yonyou/widgets/simpleDialog/simpleDialog.js',
                'yonyou/modules/employee/employee_select.js',
                'yonyou/modules/calendar/calendar.biz.js',
                'yonyou/modules/calendar/calendar.js',
                'yonyou/modules/calendar/calendar.bind.js'],{
                fn : function(){

                }
            });
            util.loadScript(['yonyou/widgets/scrollbar/scrollbar.js'],{
                fn : function(){
                    var te  = new YY.Scrollbar("scroll");
                    te.scroll_disable();

                    var te2 = new YY.Scrollbar("scroll2");
                    te2.scroll_disable = function(limit_height) {
                        limit_height = limit_height || 165;
                        var he = $("#scroll2_shower").height();
                        if(he<limit_height){
                            return false ;
                        }else{
                            // $("#scroll2_scroller").removeClass();
                            return true ;
                        }
                    };
                    te2.scroll_disable();
                }
            });
        });
    }(jQuery, YonYou));
</script>
</body>
</html>