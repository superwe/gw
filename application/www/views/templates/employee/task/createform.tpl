<form action="/employee/task/save'}" method="post" id="taskaddForm" name="taskaddForm" enctype="multipart/form-data"  class="yy-upload-block">
    <input type="hidden" name="type" id="type" value="{$task.type|default:1}" />
    <input type="hidden" name="type_id" id="type_id" value="{$task.type_id|default:0}" />
    <input type="hidden" name="groupid" value="{$task.group_id|default:0}" class="groupid" id="groupid"/>
    <input type="hidden" name="tid" id="tid" value="{$tid|default:0}" />
    <input type="hidden" name="parent_task_id" id="parent_task_id" value="{$parent_task_id|default:0}" />
    <input type="hidden" name="relation_floor" id="relation_floor" value="{$relation_floor|default:0}" />
    <input type="hidden" id="task_add_type_text" name="important" value="{$task.important|default:0}"/>
    <!--任务标题-->
    <p>
        <input name="title" type="text" value="{$task.title|default:''}" id='tasktitle' class="input01" placeholder="任务名称">
    </p>
    <!--任务负责人-->
    <div class="rcAddmen mt10 clearfix relative z9">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" class="rcAddmenTab">
            <tr>
                <td valign="top">
                    <div class="clearfix rcAddmenList">
                        <ul class="clearfx fl rcAddmenListUl" id="manageuser_list">
                            <!-- 负责人人员联想弹出层-->
                            <li class="fl">
                                <div class="relative rcLianxiang" id="manageuser_div">
                                    <input type="text" class="addInput" name="manageuser" id="manageuser" placeholder="负责人">
                                </div>
                            </li>
                        </ul>
                    </div>
                </td>
                <td valign="middle" class="rbg" align="center">
                    <a href="/space/ajax/selectmember/for/manageuser_div" class="rcAddmenr" for="manageuser_div"></a>
                </td>
            </tr>
        </table>
    </div>
    <!--任务参与人-->
    <div class="rcAddmen mt10 clearfix relative z8">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" class="rcAddmenTab">
            <tr>
                <td valign="top">
                    <div class="clearfix rcAddmenList">
                        <ul class="clearfx fl rcAddmenListUl" id="joinuser_list">
                            <!-- 参与人人员联想弹出层-->
                            <li class="fl">
                                <div class="relative rcLianxiang" id="joinuser_div">
                                    <input type="text" class="addInput" name="joinuser" id="joinuser" placeholder="参与者">
                                </div>
                            </li>
                        </ul>
                    </div>
                </td>
                <td valign="middle" class="rbg" align="center">
                    <a href="/space/ajax/selectmember/for/joinuser_div" class="rcAddmenr" for="joinuser_div"></a>
                </td>
            </tr>
        </table>
    </div>
    <!--任务知会人-->
    <div class="rcAddmen mt10 clearfix relative z7">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" class="rcAddmenTab">
            <tr>
                <td valign="top">
                    <div class="clearfix rcAddmenList">
                        <ul class="clearfx fl rcAddmenListUl" id="noticeuser_list">
                            <!-- 知会人员联想弹出层-->
                            <li class="fl">
                                <div class="relative rcLianxiang" id="noticeuser_div">
                                    <input type="text" class="addInput" name="noticeuser" id="noticeuser" placeholder="知会人">
                                </div>
                            </li>
                        </ul>
                    </div>
                </td>
                <td valign="middle" class="rbg" align="center">
                    <a href="/space/ajax/selectmember/for/noticeuser_div" class="rcAddmenr" for="noticeuser_div"></a>
                </td>
            </tr>
        </table>
    </div>
    <!--任务说明--上传附件 -->
    <div>
        <div  id="task_detail" class="z5">
            <!--任务说明-->
            <p class="mt10 rcTextarea relative">
                <textarea name="tcontent" id='tcontent' cols="" rows="" placeholder="任务说明">{$task.content|default:''}</textarea>
            </p>
            <!--完成时间-->
            <div class="rcSelect mt10 clearfix z3  yy-time-block">
                <p class="fl mt5">完成时间&nbsp;&nbsp;</p>
                <p class="fl mt5">
                    <input type="radio"  value="1"  name='fastcomplete' id="fastcomplete" {if (isset($task.fastcomplete) && ($task.fastcomplete eq '1'))}checked="checked"{/if}/>尽快完成
                </p>
                <p class="fl mt5 ml5">
                    <input type="radio" name="fastcomplete" value="0" {if ! $task.fastcomplete|default:0}checked="checked"{/if} />
                    在此时间段完成
                </p>
                <p class="fl ml10 yy-time-select">
                    <div class="fl block start">
                        <input type="text" name="start_date" class="date" readonly="readonly" value="2013-02-27">
                        <input type="text" name="start_week" class="week" readonly="readonly" value="星期五">
                        <input type="text" name="start_time" class="time" value="09:20">
                    </div>
                    <span class="fl scUntil">至</span>
                    <div class="fl block end">
                        <input type="text" name="end_date" class="date" readonly="readonly" value="2013-02-27">
                        <input type="text" name="end_week" class="week" readonly="readonly" value="星期六">
                        <input type="text" name="end_time" class="time" value="10:20">
                    </div>
                </p>
            </div>
            <!--重要程度-->
            <p class="mt10 rcCd"><span>重要程度</span>
                <mark id="task_add_type_normal" href="#" name="imp" {if $task.important|default:0 eq "0"} class="cur"{/if} data="0">普通</mark>
                <mark id="task_add_type_important" href="#" name="imp" {if $task.important|default:0 eq "1"} class="cur"{/if} data="1">重要</mark>
            </p>
            <!--提醒方式-->
            <div class="mt10 rcTongzhi line24" id="task_remind_type"> 提醒方式
                <select name="remind" class="select02 sel_w120 IE_sel">
                    <option value="3" {if $task.remindtype|default:'0' eq 3}selected{/if}>任务开始和结束前</option>
                    <option value="1" {if $task.remindtype|default:'0' eq 1}selected{/if}>任务开始前</option>
                    <option value="2" {if $task.remindtype|default:'0' eq 2}selected{/if}>任务结束前</option>
                    <option value="0" {if $task.remindtype|default:'' eq '0'}selected{/if}>不提醒</option>
                </select>
                <select name="uppertime" class="select02 sel_w80 IE_sel">
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
                <select name="send" class="select02 sel_w85 IE_sel">
                    <option value="3" {if ($task.noticetype|default:'0' eq 3)}selected{/if}>邮件和消息</option>
                    <option value="1" {if ($task.noticetype|default:'0' eq 1)}selected{/if}>仅邮件</option>
                    <option value="2" {if ($task.noticetype|default:'0' eq 2)}selected{/if}>仅消息</option>
                </select>
                <!-- 重复提醒 begin-->
                <input type="checkbox" value="1" name="repeatnotice" />
                重复提醒
                <input name="rt_uppertime" type="text" class="input02" value="{$task.rt_uppertime|default:15}" maxlength="3" style="*height:20px; *line-height:20px;">
                <select name="rt_unit" class="select02 IE_sel sel_w80">
                    <option value='minute' {if $task.rt_unit|default:'0' eq 'minute'}selected{/if}>分钟</option>
                    <option value='hour' {if $task.rt_unit|default:'0' eq 'hour'}selected{/if}>小时</option>
                </select>
                <!-- 重复提醒end -->
            </div>
        </div>
        <!--上传附件-->
        {include file="employee/upload.tpl"}
        <input type="hidden" id="community_fids" name="community_fids" value="" />   <!-- 标识从社区选择的文件的id，供日程和任务使用 -->
        <div id="upload-div" class="clearfix gzContHfht mt10 rcAddFj z3">
            <span class="fl">上传附件</span>
            <div class="fl relative ya_talkConIcon fymy_sz z5">
                <a id="doc"  class="icoWd fl" title="添加文档"></a>
                <aside style="visibility: hidden;" class="tkBox c3a" id="docTk">
                    <a class="icoSc" href="javascript:;"><span id="spanButtonPlaceHolder">上传文件</span></a>
                    <a class="selectedfileBtn icoSel" href="/api/file/selected" id="selectedfileBtn">选择空间文档</a>
                </aside>
                <div class="selectTkBox" id="selectedfileDiv" style="display:none;"></div>
            </div>
            {if $issubtask|default: 0}
                <div class="fl relative ya_talkConIcon fymy_sz">
                    <input type="checkbox" name="takefile" id="takefile" style="vertical-align: bottom" /> 带入主任务附件
                </div>
            {/if}

        </div>

    </div>
        <div class="rcChuangjian">
            <!-- 草稿按钮及隐藏域-->
            <input id="draftflag" name="draftflag" value="{$task.is_draft|default:0}" type="hidden" />
            <input class="button" id="savesubmit"  type="submit" name="savesubmit" value="{if $tid|default:0 gt "0"}保存{else}创建{/if}">
            <input class="button" id="savesubmit"  type="submit" name="savesubmit" value="{if $tid|default:0 gt "0"}保存{else}创建{/if}">
            <input id="taskdraft" type="button" value="存草稿" class="button gzChengButton darkGrayButton"/>
        </div>
</form>