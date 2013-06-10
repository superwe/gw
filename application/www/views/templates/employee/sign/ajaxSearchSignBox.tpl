<form name="searchForm" method="post" action="/employee/sign/searchResult">
    <!--标题开始-->
    <div class="clearfix boxContainer" style="width: 500px;">
        <div class="boxContainerTitle">
            <h2 class="floatL">高级搜索</h2>
            <a title="关闭" class="close floatR"></a>
        </div>
        <!--标题结束-->
        <!--内容区域开始-->
        <div class="searchContainer">
            <div class="scInput clearfix yy-time-select">
                <div class="floatL block start">
                    <input type="text" name="start_date" value="{$smarty.now|date_format:"%Y-%m-%d"}" readonly="readonly" class="date yy-startDate" />
                    <input type="text" value="星期{$info.start}" readonly="readonly" class="week" name="start_week">
                    <input type="text" value="{$smarty.now|date_format:"%H:%M"}" class="time yy-startTime" name="start_time">
                </div>
                <span class="floatL scUntil">至</span>
                <div class="floatL block end">
                    <input type="text" value="{($smarty.now+86400)|date_format:"%Y-%m-%d"}" readonly="readonly" class="date yy-endDate" name="end_date">
                    <input type="text" value="星期{$info.end}" readonly="readonly" class="week" name="end_week">
                    <input type="text" value="{$smarty.now|date_format:"%H:%M"}" class="time yy-endTime" name="end_time">
                </div>
            </div>
            <div class="clearfix searchCol">
                <span class="floatL" style="width: 40px;">地点</span>
                <select name="province" id="yy-signProvince" prov=""></select>
                <select name="city" id="yy-signCity" city=""></select>
            </div>
            <div class="clearfix searchCol">
                <span class="floatL" style="width: 40px;">范围</span>
                <div class="floatL">
                    <input type="checkbox" name="allSign" value="1" />全部&nbsp;&nbsp;
                    <input type="checkbox" name="allHandSign" value="1" {if $info.status eq 0}checked="checked" {/if} />手动签到&nbsp;&nbsp;
                    {if $info.status > 0}
                    <input type="checkbox" name="allTask" value="1" />定时任务
                    <a style="color: #47A6E8;font-weight: bold;" class="opTaskList" title="展开定时任务列表">&darr;</a>
                    {/if}
                </div>
            </div>
            {if $info.status > 0}
            <!--定时任务列表开始-->
            <div class="clearfix taskList hidden">
                <ul class="taskListUl"></ul>
            </div>
            <!--定时任务列表结束-->
            {/if}
        </div>
        <!--内容区域结束-->
        <div style="text-align: center;padding:10px 0;">
            <input type="hidden" name="type" value="{$info.type|default:'index'}" />
            <input type="submit" name="sub" value="搜索" class="button blueButton searchFormBtn" />
            <input type="reset" name="reset" value="重置" class="button grayButton" />
        </div>
    </div>
</form>