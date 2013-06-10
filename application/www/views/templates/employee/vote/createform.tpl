<div class="voteWrap">
    <!-- 在主页显示 -->
    <div class="pic_tp_title">
        <ul id="vote_type_nav">
            <li class="cur" link="voteForm_word"><a href="javascript:;" value='ts'>发起文字投票</a></li>
            <li link="voteForm_pic"><a href="javascript:;">发起图片投票</a></li>
        </ul>
    </div>
    <form id="voteForm" action="save.html" method="post" class="yy-upload-block">
        <input id="groupid" name="groupid" type="hidden" value="{$vote.groupid|default:0}" />
        <input name="is_refer" type="hidden" value="{$is_refer|default:1}" />
        <!-- 文字投票 -->
        <div id="div_vote_need_change" style="padding: 10px 14px 0 0;">
            <div id="voteForm_word">
                <div class="clearfix relative z3">
                    <input type="text" id="title" name="title" maxlength="40" placeholder="投票主题" value="{$vote.title|default:''}" class="input01 qz_tp_wz1">
                </div>
                <p><a id="word_vote_add_instruction" href="javascript:;" class="pic_tp_sm">添加说明</a></p>
                <div id="word_vote_instruction" class="clearfix relative z3 mt4 hidden">
                    <textarea name="word_vote_des" cols="" rows="" class="pic_tpsm" placeholder="最多可输入60个字符"  maxlength="60"></textarea>
                </div>
                <div id="div_vote_word_option">
                    {foreach item=item key=key from=$vote.option|default:array()}
                        <div class="clearfix relative z3">
                            <input id="opt{$key+1}" placeholder="候选项{$key+1}" type="text" name="option[]" maxlength="20" value="{$item|default:''}" class="input01 tp_add_hxx1">
                        </div>
                    {foreachelse}
                        <div class="clearfix relative z3" style="margin-top: 10px;">
                            <input id="opt1" type="text" placeholder="候选项1" name="option[]" maxlength="20" class="input01 tp_add_hxx1">
                        </div>
                    {/foreach}
                    <div class="clearfix relative z3" style="margin-top: 10px;">
                        <input id="opt{$key+2}" type="text" placeholder="候选项{$key+2}" name="option[]" maxlength="20" class="input01 tp_add_hxx1">
                    </div>
                </div>
                <p class="qz_tp_wz2">至少设置两项，每项最多20个字</p>
                <p><a id="vote_word_option_add" href="javascript:;" class="pic_tp_add">再加一项</a></p>
                <p class="rcSelect mt10">
                    单选/多选
                    <select class="select01" name="is_checkbox" id="vote_word_optnum_select">
                        <option value="1">单选</option>
                        <option value="2"{if $vote.is_checkbox|default:0 eq 2} selected="selected"{/if}>最多选2项</option>
                        {foreach item=item1 from=$vote.select|default:array()}
                            <option value="{$item1}"{if $vote.is_checkbox|default:0 eq $item1} selected="selected"{/if}>最多选{$item1}项</option>
                        {/foreach}
                    </select>
                </p>
                <p class="pic_tp_zk"><a href="javascript:;" id="vote_word_show_super_set">展开高级设置<span class="arrowDown"></span></a></p>
                <div id="div_vote_word_super_set" class="hidden">
                    <div class="rcSelect mt10 clearfix  relative z7">
                        <div class="fl line24">截止时间&nbsp;&nbsp;</div>
                        <p class="fl line24">
                            <input style="display: none;" type="text" id="end_date" name="end_date" value="{$vote.end_date|default:''}" readonly class="inputa w130" />
                            <select id="end_hour" name="end_hour" class="select02" style="display: none;" >
                                <option value="00"></option>
                                {foreach item=item key=key from=$hours}
                                    <option value="{$key}">{$item}</option>
                                {/foreach}
                            </select>
                            <input id="endTimeBtn" type="checkbox" name="limit_time" checked value="1"> 不限截止时间
                        </p>
                    </div>
                    <div class="rcAddmen mt10 clearfix relative z7">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" class="rcAddmenTab">
                            <tr>
                                <td valign="top">
                                    <div class="clearfix">
                                        <ul class="clearfx fl rcAddmenListUl" id="notice_list_n">
                                            <!-- 添加通知人员联想弹出层-->
                                            <li class="fl">
                                                <div class="relative rcLianxiang" id="notice_div_n">
                                                    <input type="text" class="input01" name="notice_n" id="notice_n">
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                                <td valign="middle" class="rbg" align="center">
                                    <a id="otherCalendar" href="#" class="rcAddmenr" for="notice_div_n"></a>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                <!-- </div> -->
            </div>
        </div>
        <!-- 文字投票部分结束 -->

        <div id="upload-div" class="clearfix gzContHfht mt10 rcAddFj z5" >
            <!--添加话题开始-->
            <div class="add_ht yy-feedTopicDiv">
                <div class="clearfix">
                    <!--<a style="visibility:visible;" class="save fr" href="#">完成</a>-->
                    <div class="fl clearfix">
                        <ol class="ht_tag_list fl">
                            {foreach item=topicRow from=$feed.topic|default:array()}
                                <li class="ht_tag yy_list_topic">
                                    <span class="icoHt fl"></span>
                                    <a class="fl" href="/topic/topic/convs/topic_id/`$topicRow.id`">
                                        <span class="yj-tag-name">{$topicRow.title|default:''}</span>
                                    </a>
                                    {if $feed.addTopic|default:'' == 1}<a class=" fl hidden yy_delete_topic" href="javascript:;">x</a>{/if}
                                </li>
                            {/foreach}
                        </ol>
                        <div style="display:inline;" class="fl ht_add_input hidden yy-feedAddTopicDiv">
                            <input type="text" class="yy_input_topic">
                        </div>
                        <div class="lineh fl">
                            <a class="yy_add_topic " href="javascript:;" {if $feed.topic|default:''}style="display:none;"{/if}>添加话题</a>
                            <span class="icoRighttkza hidden" id="yy_loading_styple"></span>
                        </div>
                    </div>
                </div>
            </div>
            <!--添加话题结束-->
            {include file="employee/upload.tpl"}
            <div class="fl relative mt8 ya_talkConIcon fymy_sz z5">
                <a id="doc"  class="icoWd fl" title="添加文档"></a>
                <aside style="visibility: hidden;" class="tkBox c3a" id="docTk">
                    <a class="icoSc" href="javascript:;"><span id="spanButtonPlaceHolder">上传文件</span></a>
                    <a class="selectedfileBtn icoSel" href="/api/file/selected" id="selectedfileBtn">选择空间文档</a>
                </aside>
                <div class="selectTkBox" id="selectedfileDiv" style="display:none;"></div>
                <a id="" class="fl icoHt topic_for_not" href="javascript:;" title="添加话题"></a>
            </div>

            <div class="fr rcChuang" id="sub-div">
                {if $info.gid|default:0}
                    <div class="relative fl mt5">
                        <a href="javascript:;" class="blueLink" id="label_fyd"></a>
                        <ul class="fl clearfix z11">
                            <li id="fyd" class="relative gzFy02" data="{$info.gid|default:'-1'}">
                                {if $info.group_name|default:''}{if $info.gid == "0"}{$smarty.session.user.baseinfo.short_name|default:'全体成员'}{else}{$info.group_name|default:''}{/if}{/if}
                            </li>
                        </ul>
                    </div>
                {else}
                    <div id="fyd" class="relative fl mt10"></div>
                {/if}
                <input class="button grayButton" id="savesubmit" type="submit" disabled="disabled" name="savesubmit" preUrl="/vote/vote/index" value="创建" />
            </div>
        </div>

    </form>

    <div id="hidden_vote_type">
        <!-- 加载图片投票的部分 -->
        {include file="employee/vote/createformpic.tpl"}
    </div>
</div>