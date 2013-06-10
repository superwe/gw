<div id="voteForm_pic" style="display:none;">
    <div class="clearfix relative z3">
        <input type="text" class="input01 qz_tp_wz1" value="" maxlength="40" name="pic_vote_title" id="pic_vote_title" placeholder="投票主题">
    </div>
    <!--<div id="pic_vote_more" class="hidden">-->
    <p><a id="pic_vote_add_instruction" href="javascript:;" class="pic_tp_sm">添加说明</a></p>
    <div id="pic_vote_instruction" class="clearfix relative z3 mt4 hidden">
        <textarea name="pic_vote_des" cols="" rows="" class="pic_tpsm" placeholder="最多可输入60个字符"  maxlength="60"></textarea>
    </div>
    <div class="clearfix relative z3 mt4 pic_tp_list">
        <ul id="ul_vote_pic_option">
            <li>
                <div class="fl num">1.</div>
                <div class="fl tp_pic relative">
                    <img src="/images/vote/pic_tp_up.gif" class="yy-pic-placeholder" width="50" height="50">
                    <a style="display:block;position:absolute;top:8px;height:50px;width:50px;" href="javascript:;">
                        <span class="yy-upload-placeholder"></span>
                    </a>
                    <input type="hidden" value="" name="pic_vote_image[1]">
                    <input type="hidden" value="" name="pic_vote_fid[1]">
                    <div class="pic_r_up" style="display:none;"><a href="javascript:;">重传图片</a></div>
                    <div class="pic_r_up2" style="display:none;"><a class="yy-upload-process-cancel" href="javascript:;">取消</a></div>
                </div>
                <div class="fl pic_cont">
                    <p><input id="pic_vote_image_des1" type="text" class="input01 qz_tp_wz1" value="" name="pic_vote_image_des[1]" placeholder="输入图片描述，至多可输入20个字符" maxlength="20"></p>
                    <p><input id="pic_vote_image_link1" type="text" class="input01 qz_tp_wz1" value="" name="pic_vote_image_link[1]" placeholder="选项链接：http://"></p>
                </div>
            </li>
            <li>
                <div class="fl num">2.</div>
                <div class="fl tp_pic relative">
                    <img src="/images/vote/pic_tp_up.gif" class="yy-pic-placeholder" width="50" height="50">
                    <a style="display:block;position:absolute;top:8px;height:50px;width:50px;" href="javascript:;">
                        <span class="yy-upload-placeholder"></span>
                    </a>
                    <input type="hidden" value="" name="pic_vote_image[2]">
                    <input type="hidden" value="" name="pic_vote_fid[2]">
                    <div class="pic_r_up" style="display:none;"><a href="javascript:;">重传图片</a></div>
                    <div class="pic_r_up2" style="display:none;"><a class="yy-upload-process-cancel" href="javascript:;">取消</a></div>
                </div>
                <div class="fl pic_cont">
                    <p><input id="pic_vote_image_des2" type="text" class="input01 qz_tp_wz1" value="" name="pic_vote_image_des[2]" placeholder="输入图片描述，至多可输入20个字符" maxlength="20"></p>
                    <p><input id="pic_vote_image_link2" type="text" class="input01 qz_tp_wz1" value="" name="pic_vote_image_link[2]" placeholder="选项链接：http://"></p>
                </div>
            </li>
        </ul>
    </div>
    <p><a id="vote_pic_option_add" href="javascript:;" class="pic_tp_add">再加一项</a></p>
    <p class="rcSelect mt10">
        单选/多选
        <select name="pic_is_checkbox" id="pic_word_optnum_select" class="select01">
            <option value="1">单选</option>
            <option value="2">最多选2项</option>
        </select>
    </p>
    <p class="pic_tp_zk"><a href="javascript:;" id="vote_pic_show_super_set">展开高级设置<span class="arrowDown"></span></a></p>
    <div id="div_vote_pic_super_set" class="hidden">
        <div class="rcSelect clearfix relative z7">
            <div class="fl line24">截止时间&nbsp;&nbsp;
                <input type="text" class="inputa w130" value="" readonly="" id="pic_end_date" name="pic_end_date" style="display:none;"> </div>
            <select name="pic_end_hour" class="select01 fl" id="pic_end_hour" style="display:none;">
                <option value="00"></option>
                {foreach item=item key=key from=$hours}
                    <option value="{$key}">{$item}</option>
                {/foreach}
            </select>
            <p class="fl line24"><input type="checkbox" value="1" checked="" name="pic_limit_time" id="pic_endTimeBtn">不限截止时间</p>
        </div>
        <div class="rcAddmen mt10 clearfix relative z7">
            <table width="100%" cellspacing="0" cellpadding="0" border="0" class="rcAddmenTab">
                <tbody><tr>
                    <td valign="top">
                        <div class="clearfix">
                            <ul id="pic_notice_list_n" class="clearfx fl rcAddmenListUl">
                                <!-- 添加通知人员联想弹出层-->
                                <li class="fl">
                                    <div id="pic_notice_div_n" class="relative rcLianxiang">
                                        <!--<span class="inputSpan" id="notice_n_yy_dl">邀请粉丝</span>
                                        <input type="text" id="pic_notice_n" name="notice_pic_n" class="addInput ui-autocomplete-input" autocomplete="off" role="textbox" aria-autocomplete="list" aria-haspopup="true">
                                        -->
                                        <input type="text" class="addInput" name="notice_n" id="pic_notice_n">
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </td>
                    <td valign="middle" align="center" class="rbg"><a for="notice_div" class="rcAddmenr" href="/space/ajax/selectmember/for/notice_div"></a></td>
                </tr>
                </tbody></table>
        </div>
    </div>
    <!--</div> -->
</div>