<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/vote.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <title>投票-企业空间</title>
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
    {include file="employee/leftbar.tpl"}
    <div class="grid" style="width:630px;background: white;">
        <div class="vote_header tpNew_top">
            <span class="fl fontB" id="vote_add_detail_page">投票</span>
            <a class="button blueGz fr" href="create.html" style="float: right;"><span class="tpNew_butIco"></span>发起投票</a>
        </div>
        <ul class="tab yyVoteMenu" style="float:left;margin-left: 10px;margin-top: 10px;background: #ffffff;width: 97%;border-top:2px solid #0178B3;">
            <li><a class="selected" href="##" data="all">全部投票</a></li>
            <li><a href="##" data="new">最新的</a></li>
            <li><a href="##" data="hot">最热的</a></li>
            <li><a href="##" data="join">参与的</a></li>
            <li><a href="##" data="create">创建的</a></li>
        </ul>
        <div class="content user_card" style="margin-left: 10px;" id="voteList">
            {foreach from=$voteList item=list}
            <div class="gird" style="width: 40px;"><img src="{$list.url}" rel="http://esn.uu.com.cn/api/ajax/partnerinfo/pid/{$list.creatorid}" tips=1 style="height: 40px;width: 40px;"></div>
            <div class="grid" style="width: 598px;">
                <div class="content">
                    <h3>标题：{$list.title} 创建人：{$list.name} 群组：<a href="">{$list.gname|default:$spaceName}</a> </h3>
                    {if $list.selecttype > 1}最多可选{$list.selecttype}项{/if}
                    投票说明{$list.votememo|default:''}
                    {if $list.timeleft|default:0 neq "-2"}距离结束还有{$list.timeleftStr|default:''}{else}进行中{/if}
                </div>
                <div>
                    <!-- 图片投票 -->
                    {if $list.type|default:0 gt 0}
                    <div id="voteBox{$list.id|default:0}">
                        {if $list.joiner|default:0 eq "0" || $list.isover|default:0 eq "0"}
                            <!-- 已投票或者已结束的开始 -->
                            <div class="pic_tp_img2">
                                <ul>
                                    {$loopNum = 1}
                                    {foreach from=$list.option|default:array() item=item}
                                        <li class="mr4 cur">
                                            <div class="img_wk relative">
                                                {if in_array($list.id, $feed.select_options)}
                                                    <img class="cur" src="{$item.imageurl}" width="50" height="50">
                                                    <div class="xuanze"></div>
                                                {else}
                                                    <img src="{$item.imageurl}" width="50" height="50">
                                                {/if}
                                            </div>
                                            <div class="img_word">
                                                {if empty($item.optionlinkurl)}
                                                    <p>{$item.optionvalue}</p>
                                                {else}
                                                    <a href="{$item.optionlinkurl}" target="_blank"><p>{$item.optionvalue}</p></a>
                                                {/if}
                                                <p class="pic_tp_num">
                                                    {$loopNum=$loopNum+1}
                                                    <span class="pic_tp_cor tp_cor_{if $loopNum%26 lt 10}0{/if}{($loopNum)%26}" style="width:{($item.optionnum/$feed.totalvotenum*100)|round:1}px"></span>
                                                    <span class="fl ml5">{$item.optionnum}（{($item.optionnum/$list.totalvotenum*100)|round:1}%）</span>
                                                </p>
                                            </div>
                                        </li>
                                    {/foreach}
                                </ul>
                            </div>
                            <div class="new_tpbut">
                                <input type="button" class="button grayGz" value="{if $list.isvoer|default:0 eq 1}已结束{else}已投票{/if}" disabled="disabled">
                            </div>
                            <!-- 已投票或者已结束的结束 -->
                        {else}
                            <!-- 未投票开始 -->
                            <div class="pic_tp_img">
                                <ul id="voteBox{$list.id|default:0}">
                                    {foreach from=$list.option|default:array() item=item}
                                        <li class="mr4">
                                            <div class="pic_tp_img_wk">
                                                <div class="cont_img relative" style="cursor: pointer;">
                                                    <img src="{$list.imageurl}" width="120" height="89">
                                                    {if $list.selecttype|default:0 > 1}
                                                        <div class="cont_btu"><input name="optionsub{$list.id}[]" type="checkbox" value="{$item.id}" feed_id="{$list.id}" for="{$list.selecttype|default:0}"></div>
                                                    {else}
                                                        <div class="cont_btu"><input name="optionsub{$list.id}" type="radio" value="{$item.id}" feed_id="{$list.id}" for="{$list.selecttype|default:0}"></div>
                                                    {/if}
                                                </div>
                                            </div>
                                            {if empty($item.optionlinkurl)}
                                                <div class="pic_tp_img_name" title="{$item.optionvalue}">{$item.optionvalue}</div>
                                            {else}
                                                <a href="{$item.optionlinkurl}" target="_blank"><div class="pic_tp_img_name" title="{$item.optionvalue}">{$item.optionvalue}</div></a>
                                            {/if}
                                        </li>
                                    {/foreach}
                                </ul>
                            </div>
                            <div class="new_tpbut">
                                <input type="hidden" name="end_time" value="{$list.endtime|default:0}">
                                <input id="vote_btn_{$list.id}" vote_id="{$list.id|default:0}" is_checkbox="{$list.selecttype|default:0}" type="button" value="{if $list.isover eq 1}已结束{else}投票{/if}" {if $list.isover eq 1}isover="1"{/if} class="button grayButton voteSubmit" disabled="disabled">
                            </div>
                            <!-- 未投票结束 -->
                        {/if}
                    </div>
                    {else}
                    <!-- 文字投票 -->
                    <ul>
                        {if $list.joiner|default:0 eq "0" || $list.isover|default:0 eq "1"}
                        <!--未投票开始-->
                        <li id="voteBox{$list.id|default:0}" class="tpButton tpButtonbg">
                            {foreach from=$list.option|default:array() item=item}
                                <p>
                                    {if $list.selecttype|default:0 gt "1"}
                                        <input type="checkbox" for="{$list.selecttype|default:0}" name="optionsub{$list.id|default:0}[]" feed_id="{$list.id}" value="{$item.id|default:''}" list_id="{$list.id}">{$item.optionvalue|default:''}
                                    {else}
                                        <input type="radio" value="{$item.id|default:''}" name="optionsub{$list.id|default:0}" feed_id="{$list.id}">{$item.optionvalue|default:''}
                                    {/if}
                                </p>
                            {/foreach}
                            <div class="new_tpbut">
                                <input type="hidden" name="end_time" value="{$list.endtime|default:0}">
                                <input vote_id="{$list.id|default:0}" id="vote_btn_{$list.id}" is_checkbox="{$list.selecttype|default:0}" type="button" value="{if $list.isover|default:0 eq 0}投票{else}已结束{/if}" {if $list.isover|default:0 neq 0}isover="1"{/if} class="button grayButton voteSubmit" disabled="disabled">
                            </div>
                        </li>
                        <!--未投票结束-->
                        {else}
                        <!--已投票开始-->
                        <li class="tpButton">
                            {$i = 0}
                            {foreach from=$list.option|default:array() item=item}
                            <p>{$item.optionvalue}</p>
                            <p></p>
                            <div class="tp_ico_wid fl">
                                {if $list.totalvotenum|default:0 eq "0"}
                                <div class="tp_cor {$list.opt_color[$i%26]}" style="width:0px;"></div>
                            </div><div class="tp_ico_sz">{$item.optionnum}（0%）</div>
                            {else}
                            <div class="tp_cor {$list.opt_color[$i%26]}" style="width:{($item.optionnum/$list.totalvotenum*100*1.7)|round:1}px;"></div>
                </div><div class="tp_ico_sz">{$item.optionnum}（{($item.optionnum/$list.totalvotenum*100)|round:1}%）</div>
                {/if}
                <p></p>
                {$i = $i+1}
                {/foreach}
                <p>&nbsp;</p>
                {if $list.isjoined|default:0 eq "1"}
                    <p><input type="button" value="已投票" class="button grayButton" name="" disabled="disabled"></p>
                {/if}
                {*<p>投票总数：{$list.totalvotenum|default:0}</p>*}
                </li>
                <!--已投票结束-->
                {/if}
                </ul>
                {/if}
                </div>
            </div>
            {/foreach}
        </div>
    </div>
    <div class="grid" style="width:200px;background: #F8F8F8;border-radius: 0 5px 5px 0;">
        {include file="employee/vote/right.tpl"}
    </div>
</div>
<script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script src="/js/yonyou/lib/yonyou.js"></script>
<script src="/js/yonyou/vote/vote.index.js"></script>
<script type="text/javascript">
    (function($, YY){
        $(function(){
            YY.util.ajaxApi("getVoteList",function (d, s){
                if (d && s==='success'){
                    alert(1);
                }
            },'POST','json');
        });
    }(jQuery, YonYou));

</script>
{include file="footer.tpl"}
</body>
</html>