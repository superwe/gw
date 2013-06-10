<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/task.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script src="/js/yonyou/lib/yonyou.js"></script>
    <script src="/js/yonyou/lib/yy.core.js"></script>
    <script src="/js/yonyou/lib/yy.uploadready.js"></script>
    <script src="/js/swfupload/swfupload.js"></script>
    <script src="/js/swfupload/swfupload.queue.js"></script>
    <script src="/js/swfupload/yy.upload.handlers.js"></script>
    <script src="/js/yonyou/modules/task/task.js"></script>
    <script src="/js/yonyou/modules/task/taskform.js"></script>
    <script type="text/javascript">
        $(function(){
            YY.loadScript(['yonyou/widgets/dateSelector/dateSelector.js'], {
                fn: function(){
                    new YY.DateSelector({
                        wrap : '.yy-time-select'
                    });
                }
            });
            new InitUpload({
                debug: false,
                button_placeholder_id: 'spanButtonPlaceHolder',
                upload_url: '/employee/upload/index.html'
            });

            YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js',
                'yonyou/modules/employee/employee_select.js'], {
                fn: function(){
                    YY.userSelector({
                        'selector': '.userSelector',
                        'callback': function(fordiv,data){
                            //对所选择的人员信息进行整理
                            var ret = [] ;
                            var addLiId="";
                            for(var i=0;i<data.length;i++){
                                addLiId = "yyauto_li_"+data[i].id;

                                if($("#"+fordiv+"_list li[id="+addLiId+"]").length == 0){
                                    //不包含的时候 增加
                                    ret.push('<li id="'+addLiId+'" class="rcAddmenListli"><span>');
                                    ret.push(data[i].name);
                                    ret.push('</span><input type="hidden" name="'+fordiv+'_value[]" value=');
                                    ret.push(data[i].id);
                                    ret.push('><a href="javascript:;" class="close"></a></li>');
                                }
                            }
                            $("#"+fordiv+"_list").append(ret.join(''));//将选择的人 添加到input框中
                        }
                    });

                    $(".scInput").on({ //删除人
                        'click':function(e){
                            $target = $(e.target);
                            $target.closest("li").remove();
                        }
                    });
                }
            })
        });
    </script>
    <title>任务-畅捷通-企业空间</title>
</head>

<body>
{include file="employee/header.tpl"}

<div class="container clearfix" style="width:980px;margin-top:25px;">
    {include file="employee/leftbar.tpl"}
    <div class="grid task_wrap">
        <h1>任务<a href="/employee/task/index.html" class="creator"><<返回任务列表</a> </h1>
        <form action="/employee/task/save" method="post" id="taskaddForm" name="taskaddForm" enctype="multipart/form-data"  class="editor yy-upload-block">
            <input type="hidden" name="tid" id="tid" value="{$tid|default:0}" />
            <input type="hidden" name="parent_task_id" id="parent_task_id" value="{$task.parentid|default:0}" />
            <input type="hidden" value="0" name="important" id="task_add_type_text">
            <input type="text" placeholder="任务名称" value="{$task.title|default:''}" id='tasktitle' name="tasktitle" class="name"/>
            <div class="scInput">
                <div class="rcAddMen" style="width: 100%">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="rcAddmenTab">
                        <tbody><tr>
                            <td valign="top">
                                <div class="rcAddmenList">
                                    <span class="inputSpan">负责人</span>
                                    <ul class="rcAddmenListUl" id="manageuser_list">
                                        {foreach from=$task.userList.manage|default:array() item=manage key=k}
                                            <li class="rcAddmenListli" id="yyauto_li_{$k|default:0}"><span>{$manage|default:''}</span><input type="hidden" value="{$k|default:0}" name="manageuser_value[]"><a class="close" href="javascript:;"></a></li>
                                        {/foreach}
                                    </ul>
                                </div>
                            </td>
                            <td valign="middle" class="rbg" align="center">
                                <a href="javascript:;" class="rcAddmenr userSelector" for="manageuser" ></a>
                            </td>
                        </tr>
                        </tbody></table>
                </div>
            </div>
            <div class="scInput">
                <div class="rcAddMen" style="width: 100%">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="rcAddmenTab">
                        <tbody><tr>
                            <td valign="top">
                                <div class="rcAddmenList">
                                    <span class="inputSpan">参与人</span>
                                    <ul class="rcAddmenListUl" id="joinuser_list">
                                        {foreach from=$task.userList.join|default:array() item=join key=k}
                                            <li class="rcAddmenListli" id="yyauto_li_{$k|default:0}"><span>{$join|default:''}</span><input type="hidden" value="{$k|default:0}" name="joinuser_value[]"><a class="close" href="javascript:;"></a></li>
                                        {/foreach}
                                    </ul>
                                </div>
                            </td>
                            <td valign="middle" class="rbg" align="center">
                                <a href="javascript:;" class="rcAddmenr userSelector" for="joinuser" ></a>
                            </td>
                        </tr>
                        </tbody></table>
                </div>
            </div>
            <div class="scInput">
                <div class="rcAddMen" style="width: 100%">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="rcAddmenTab">
                        <tbody><tr>
                            <td valign="top">
                                <div class="rcAddmenList">
                                    <span class="inputSpan">知会人</span>
                                    <ul class="rcAddmenListUl" id="noticeuser_list">
                                        {foreach from=$task.userList.notice|default:array() item=notice key=k}
                                            <li class="rcAddmenListli" id="yyauto_li_{$k|default:0}"><span>{$notice|default:''}</span><input type="hidden" value="{$k|default:0}" name="noticeuser_value[]"><a class="close" href="javascript:;"></a></li>
                                        {/foreach}
                                    </ul>
                                </div>
                            </td>
                            <td valign="middle" class="rbg" align="center">
                                <a href="javascript:;" class="rcAddmenr userSelector" for="noticeuser" ></a>
                            </td>
                        </tr>
                        </tbody></table>
                </div>
            </div>
            <textarea name="tcontent" id='tcontent' class="summary" placeholder="任务说明">{$task.content|default:''}</textarea>
            <div style="height: 40px;line-height: 40px;">
                完成时间<input type="radio" value="1"  name='fastcomplete' id="fastcomplete" {if (isset($task.fastcomplete) && ($task.fastcomplete eq '1'))}checked="checked"{/if} />
                尽快完成<input type="radio" name="fastcomplete" value="0" {if ! $task.fastcomplete|default:0}checked="checked"{/if} />
                在此时间段完成
                <div  style="float: right; width: 66%; margin-top: -4px;" class="yy-time-select">
                <span class="block start" style="border: 0px none;">
                    <input type="text" name="start_date" style="width:70px;" readonly="readonly" class="date" value="{$task.starttime|default:$smarty.now|date_format:'%Y-%m-%d'}">
                    <input type="text" name="start_time" style="width:40px;" class="time" value="{$task.starttime|default:$smarty.now|date_format:'%H:%M'}">
                </span>
                <span style="float: left; padding: 5px;">至</span>
                <span class="block end" style="border: 0px none;">
                    <input type="text" name="end_date" style="width:70px;" class="date" readonly="readonly" value="{$task.expectendtime|default:($smarty.now+1800)|date_format:'%Y-%m-%d'}">
                    <input type="text" name="end_time" style="width:40px;" class="time" value="{if ( !isset($task.fastcomplete) )}{$task.expectendtime|default:($smarty.now+1800)|date_format:'%H:%M'}{else}{$task.endhours|default:''}{/if}">
                </span>
                </div>
            </div>
            <div style="height: 40px;line-height: 40px;" class="task">
                重要程度
                <mark id="task_add_type_normal_index" href="#" name="imp" class="{if (isset($task.isimportant) && ($task.isimportant eq '0') || !isset($task.isimportant))}cur{/if}" data="0">普通</mark>
                <mark id="task_add_type_important_index" href="#" name="imp" class="{if (isset($task.isimportant) && ($task.isimportant eq '1'))}cur{/if}" data="1">重要</mark>
            </div>
            <div style="height: 40px;line-height: 40px;">提醒方式
                <select name="remind">
                    <option value="3" {if $task.remindtimetype|default:'0' eq 1}selected{/if}>任务开始和结束前</option>
                    <option value="1" {if $task.remindtimetype|default:'0' eq 2}selected{/if}>任务开始前</option>
                    <option value="2" {if $task.remindtimetype|default:'0' eq 3}selected{/if}>任务结束前</option>
                    <option value="0" {if $task.remindtimetype|default:'' eq '0'}selected{/if}>不提醒</option>
                </select>
                <select name="uppertime">
                    <option value='5_minute' {if $task.uppertime_new|default:'0' eq '5_minute'}selected{/if}>5分钟</option>
                    <option value='10_minute' {if $task.uppertime_new|default:'0' eq '10_minute'}selected{/if}>10分钟</option>
                    <option value='15_minute' {if $task.uppertime_new|default:'0' eq '15_minute'}selected{/if}>15分钟</option>
                    <option value='1_hour' {if $task.uppertime_new|default:'0' eq '1_hour'}selected{/if}>1小时</option>
                    <option value='2_hour' {if $task.uppertime_new|default:'0' eq '2_hour'}selected{/if}>2小时</option>
                    <option value='3_hour' {if $task.uppertime_new|default:'0' eq '3_hour'}selected{/if}>3小时</option>
                    <option value='4_hour' {if $task.uppertime_new|default:'0' eq '4_hour'}selected{/if}>4小时</option>
                    <option value='5_hour' {if $task.uppertime_new|default:'0' eq '5_hour'}selected{/if}>5小时</option>
                    <option value='6_hour' {if $task.uppertime_new|default:'0' eq '6_hour'}selected{/if}>6小时</option>
                    <option value="0.5_day" {if $task.uppertime_new|default:'0' eq "0.5_day"}selected{/if}>0.5天</option>
                    <option value="1_day" {if $task.uppertime_new|default:'0' eq "1_day"}selected{/if}>1天</option>
                    <option value="2_day" {if $task.uppertime_new|default:'0' eq "2_day"}selected{/if}>2天</option>
                    <option value="3_day" {if $task.uppertime_new|default:'0' eq "3_day"}selected{/if}>3天</option>
                    <option value="1_week" {if $task.uppertime_new|default:'0' eq "1_week"}selected{/if}>1周</option>
                </select>
                <select name="remindway">
                    <option value="3" {if ($task.remindway|default:'0' eq 3)}selected{/if}>邮件和消息</option>
                    <option value="2" {if ($task.remindway|default:'0' eq 1)}selected{/if}>仅邮件</option>
                    <option value="1" {if ($task.remindway|default:'0' eq 2)}selected{/if}>仅消息</option>
                </select>
                <!-- 重复提醒 begin-->
                <input type="checkbox" value="1" {if $task.repetition|default:0}checked="checked"{/if} name="repeatnotice" style="margin-left: 5px; margin-right: 5px;"/>重复提醒
                <input type="text" class="time" name="rt_uppertime" value="{$task.repetition|default:15}" maxlength="3" style="width:30px;" value="15">
                <select name="rt_unit">
                    <option value='minute' {if $task.rt_unit|default:'0' eq 'minute'}selected{/if}>分钟</option>
                    <option value='hour' {if $task.rt_unit|default:'0' eq 'hour'}selected{/if}>小时</option>
                </select>
            </div>

            <!--上传附件-->
            {include file="employee/upload.tpl"}
            <input type="hidden" id="community_fids" name="community_fids" value="" />   <!-- 标识从社区选择的文件的id，供日程和任务使用 -->
            <div id="upload-div" class="clearfix gzContHfht rcAddFj z3" style="padding: 20px 0px;">
                <span class="fl">上传附件</span>
                <div class="fl relative ya_talkConIcon fymy_sz z5">
                    <a id="doc"  class="icoWd fl" title="添加文档" style="width:20px;"></a>
                    <aside style="visibility: hidden;" class="tkBox c3a" id="docTk">
                        <a class="icoSc" href="javascript:;"><span id="spanButtonPlaceHolder">上传文件</span></a>
                        <a class="selectedfileBtn icoSel" href="javascript:;" id="selectedfileBtn">选择空间文档</a>
                    </aside>
                    <div class="selectTkBox" id="selectedfileDiv" style="display:none;"></div>
                </div>
                {if $issubtask|default: 0}
                    <div class="fl relative ya_talkConIcon fymy_sz">
                        <input type="checkbox" name="takefile" id="takefile" style="vertical-align: bottom" /> 带入主任务附件
                    </div>
                {/if}
            </div>
    <div class="rcChuangjian" style="text-align: center;">
        <!-- 草稿按钮及隐藏域-->
        <input id="draftflag" name="draftflag" value="{if $task.status|default:0 == 2}2{else}0{/if}" type="hidden" />
        <input class="button darkGrayButton" id="savesubmit"  type="submit" name="savesubmit" value="{if $tid|default:0 gt "0"}保存{else}创建{/if}" disabled="disabled">
        <input id="redirect" name="redirect" value="/employee/task/index.html" type="hidden" />
        {if $tid|default:0 == 0 || $task.status|default:0 == 2}<input id="taskdraft" type="button" value="存草稿" class="button gzChengButton darkGrayButton"/>{/if}
    </div>
        </form>
    </div>
</div>
<aside id="rscallback" class="tsBox absolute z6" style="display:none;z-index:99999;">
    <span class="icoRighttk">上传成功</span>
</aside>
{include file="employee/footer.tpl"}
</body>
</html>

