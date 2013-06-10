<script type="text/template" id="ScheduleEditTemplate">
    <form action="/employee/calendar/add" method="post" name="CalendarEditForm" id="CalendarEditForm" enctype="multipart/form-data" class="yy-upload-block schedule-edit-form form-horizontal">
        <div class="controls">{*<!-- 标题 -->*}
            <input type="text" name="title" value="" placeholder="日程主题" maxlength="100" class="span9 schedule-title"/>
        </div>
        <div class="controls controls-row">{*<!-- 起止时间 -->*}
            <div class="yy-time-select">
                <label class="fl" style="height: 28px; line-height: 28px;margin-right:3px">
                    <input class="fl" type="checkbox" name="allday" value="1" style="margin-top:7px;margin-right:10px;">全天日程</label>
                <span class="fl block start" style="margin-right:10px">
                    <input type="text" name="start_date" class="date" readonly="readonly" value="">
                    <input type="text" name="start_week" class="week" readonly="readonly" value="">
                    <input type="text" name="start_time" class="time" readonly="readonly" value="">
                </span>
                    <span class="fl" style="height: 28px; line-height: 28px;">至</span>
                <span class="fl block end" style="margin-left:10px">
                    <input type="text" name="end_date" class="date" readonly="readonly" value="">
                    <input type="text" name="end_week" class="week" readonly="readonly" value="">
                    <input type="text" name="end_time" class="time" readonly="readonly" value="">
                </span>
            </div>
        </div>
        <div class="controls controls-row">{*<!-- 添加参与人 -->*}
            <div class="schedule-partner-block">
                <table class="add-member-table">
                    <tr>
                        <td valign="top" class="add-input">
                            <div class="clearfix">
                                <ul class="clearfx fl selected-list-container">
                                    {*<!-- 添加参与人员联想弹出层-->*}
                                    <li class="fl">
                                        <div class="relative select-list-container">
                                            <input type="text" class="span2" name="notice_partner" placeholder="添加参与人">
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </td>
                        <td valign="middle" class="add-button" for="notice_partner" align="center">
                            <a href="javascript:;" title="添加参与人" class="icon35"></a>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="controls marked hidden">{*<!-- 地址 -->*}
            <input type="text" name="address" value="" placeholder="地点" class="span9">
        </div>
        <div class="controls marked hidden">{*<!-- 日程内容 -->*}
            <textarea cols="20" rows="3" name="content" placeholder="日程内容" class="span9"></textarea>
        </div>
        <div class="controls controls-row">{*<!-- 知会人 -->*}
            <div class="schedule-notifier-block">
                <table class="add-member-table">
                    <tr>
                        <td valign="top" class="add-input">
                            <div class="clearfix">
                                <ul class="clearfx fl selected-list-container">
                                    {*<!-- 添加通知人员联想弹出层-->*}
                                    <li class="fl">
                                        <div class="relative select-list-container">
                                            <input type="text" class="span2" name="notice_notifier" placeholder="添加知会人">
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </td>
                        <td valign="middle" class="add-button" for="notice_notifier" align="center">
                            <a href="javascript:;" title="添加知会人" class="icon35"></a>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="controls marked hidden">{*<!-- 重要程度 -->*}
            <input type="hidden" name="important" value="0"/>
            <span>重要程度</span>
            <mark href="javascript:;" class="select-button selected schedule-normal">普通</mark>
            <mark href="javascript:;" class="select-button schedule-important">重要</mark>
        </div>
        <div class="controls controls-row marked hidden">{*<!-- 提醒方式 -->*}
            <div class="schedule-noticetype">
                <span class="fl">提醒方式</span>
                <label class="fl"><input type="checkbox" name="noticetype[]" value="1">邮件</label>
                <label class="fl"><input type="checkbox" name="noticetype[]" value="2">内部消息</label>
            </div>
            <div class="schedule-leadtime">
                <span class="fl">日程开始前</span>
                <input type="text" name="leadtime" value="15" maxlength="3" class="span1">
                <select name="leadtimetype" class="span1">
                    <option value="1" selected="selected">分钟</option>
                    <option value="2">小时</option>
                </select>
            </div>
        </div>
        <div class="controls button-line">{*<!-- 按钮行 -->*}
            <a href="javascript:;" class="select-button edit-detail">编辑详情</a>
            <input class="confirm disabled" type="submit" name="savesubmit" value="创 建">
            <input class="cancel" type="button" value="取 消">
        </div>
    </form>
</script>