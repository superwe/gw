<div  class="container clearfix">
    <div class="selectEmployee">
        <div class="grid">
            <div class="leftdiv">
                {*<div style="margin-bottom:10px;"><input id="search" value="查找联系人"/></div>*}

                <div class="searchbox">
                    <input type="text" value="查找联系人" id="keySearch" name="keySearch">
                    <input type="button" class="searchbutton" id="searchBtn">
                </div>

                <div class="fromperson">
                    <div class="employeeGroup"><a class="expand" id="fans">关注的人</a></div>
                    <ul id="fansul"></ul>
                    <div class="employeeGroup"><a class="expand" id="sameDeptEmployees">同部门的人</a></div>
                    <ul id="samedeptul"></ul>
                    <div class="employeeGroup"><a class="expand" id="allEmployees">所有的人</a></div>
                    <ul id="allul"></ul>
                </div>
            </div>
        </div>

        <div class="grid" style="height: 30px;width: 30px;padding: 160px 0px 0px 6px;">
            <img id="selectToRight" src="../../images/select.png" style="cursor: pointer;">
        </div>
        <div class="grid rightdiv">
            <ul id="selectedEmployees"></ul>
        </div>
    </div>

    <a id="btnCancel"  class="button_gray buttonSetForDialog" style="margin: 20px 20px 20px 10px;" href="javascript:;">取消</a>
    <a id="btnOK" class="button_blue buttonSetForDialog" style="margin: 20px 0px;" href="javascript:;">确定</a>
    <label id="prompt" class="prompt" >请选择人员</label>
</div>