<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="stylesheet" type="text/css" href="/css/reset.css" />
<link rel="stylesheet" type="text/css" href="/css/grid.css" />
<link rel="stylesheet" type="text/css" href="/css/home.css" />
<link rel="stylesheet" type="text/css" href="/css/common.css" />
<link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/default/easyui.css">
<link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/icon.css">
<link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/datepicker/1.6.1/zebra_datepicker.css">
<style type="text/css">
.hidden{
    display: none;
}
.red{
    color: red;
}
#addTaskContainer{
    display: none;
}
#addTaskContainer table td{
    padding: 10px 10px 10px 4px;
}
#addTaskContainer span.icon-add{
    background-position: left 0;
    cursor: pointer;
    padding-left:20px;
}
div.taskPersonDiv{
    background: #FFFFFF;
    border:1px solid #b7b7b7;
    width: 360px;
    height: 80px;
}
</style>
</head>
  
<body style="padding:10px;">
    <!--列表开始-->
    <div id="listContainer">
        <table id="mainGrid"></table>
        <div id="tb" style="padding:5px;height:auto">
            <div style="margin-bottom:5px">
                <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-add" plain="true">创建</a>
                <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-edit" plain="true">修改</a>
                <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-remove" plain="true">删除</a>
                <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-redo" plain="true">启用</a>
                <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-undo" plain="true">停用</a>
            </div>
        </div>
    </div>
    <!--列表结束-->
    <!--弹出的新增或修改界面开始-->
    <div id="addTaskContainer">
        <form id="addTaskForm" class="easyui-form"  method ="post" style="margin-top: 10px;">
            <table class="grouptbl">
                <tr>
                    <td>任务标题</td>
                    <td><input type="text" id="title" name="title" value="" /></td>
                </tr>
                <tr>
                    <td>开始日期</td>
                    <td>
                        <input type="text" id="startDate" name="startDate" class="datepicker" />&nbsp;&nbsp;
                        <input type="checkbox" name="taskType" value="1" class="taskType" />按固定频率设置
                    </td>
                </tr>
                <tr class="signTimeTr">
                    <td>签到时间</td>
                    <td>
                        <input type="text" name="signTime[]" class="signTime" size="5" />&nbsp;
                        <span class="icon-add addSignTime" />增加时间</span>
                    </td>
                </tr>
                <tr class="hidden timingSettingTr">
                    <td></td>
                    <td>
                        起始时间&nbsp;<input type="text" id="startTime" name="startTime" size="5" />&nbsp;&nbsp;
                        结束时间&nbsp;<input type="text" id="endTime" name="endTime" size="5" />&nbsp;&nbsp;
                        间隔时间&nbsp;<input type="text" id="interval" name="interval" size="5" value="15" />
                        <span class="red">*</span>&nbsp;时间间隔至少为15分钟
                    </td>
                </tr>
                <tr>
                    <td>重复类型</td>
                    <td>
                        <input id="rdo1" type="radio" name="isRepeat" checked="checked" value="0">不重复
                        <input id="rdo0" type="radio" name="isRepeat" value="1">允许重复
                    </td>
                </tr>
                <tr class="hidden repeatTr">
                    <td></td>
                    <td>
                        <input id="repeat1" type="checkbox" name="repeat[]" value="1">星期一
                        <input id="repeat2" type="checkbox" name="repeat[]" value="2">星期二
                        <input id="repeat3" type="checkbox" name="repeat[]" value="3">星期三
                        <input id="repeat4" type="checkbox" name="repeat[]" value="4">星期四
                        <input id="repeat5" type="checkbox" name="repeat[]" value="5">星期五
                        <input id="repeat6" type="checkbox" name="repeat[]" value="6">星期六
                        <input id="repeat7" type="checkbox" name="repeat[]" value="7">星期日
                    </td>
                </tr>
                <tr class="hidden repeatTr">
                    <td>结束日期</td>
                    <td><input type="text" id="endDate" name="endDate" class="datepicker" /></td>
                </tr>
                <tr>
                    <td>参与人</td>
                    <td><span class="icon-add joinPersonSpan" for="joinPersonUl">选择相关人员</span></td>
                </tr>
                <tr>
                    <td></td>
                    <td>
                        <div class="taskPersonDiv">
                            <ul id="joinPersonUl" class="rcAddmenListUl"></ul>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>查看人</td>
                    <td><span class="icon-add viewPersonSpan" for="viewPersonUl">选择相关人员</span></td>
                </tr>
                <tr>
                    <td></td>
                    <td>
                        <div class="taskPersonDiv">
                            <ul id="viewPersonUl" class="rcAddmenListUl"></ul>
                        </div>
                    </td>
                </tr>
                <tr align="center">
                    <td colspan="2">
                        <input type="hidden" id="tid" name="tid" />
                        <a id="taskSave" class="easyui-linkbutton" iconCls="icon-ok">保存</a>
                        <a id="taskCancel" class="easyui-linkbutton" iconCls="icon-cancel">取消</a>
                    </td>
                </tr>
            </table>
        </form>
    </div>
    <!--弹出的新增或修改界面结束-->
<script type="text/javascript" src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script type="text/javascript" src="/js/yonyou/lib/yonyou.js"></script>
<script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/jquery.easyui.min.js"></script>
<script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/locale/easyui-lang-zh_CN.js"></script>
<script type="text/javascript">

(function($, YY, util){
    //定时任务列表
    $("#mainGrid").datagrid({
        title:"定时任务列表",
        url:"/space/sign/taskList.html",
        toolbar:"#tb",
        sortName:"id",
        sortOrder:"desc",
        idField:"id",
        nowrap:true,
        striped:true,
        pagination:true,
        pageNumber:1,
        pageSize: 10,//每页显示的记录条数，默认为10
        pageList: [5,10,15],//可以设置每页记录条数的列表
        frozenColumns:[[
            { field:"ck",checkbox:true},
            { field:"id",title:"ID",sortable:true}
        ]],
        columns:[[
            { field:"status",title:"状态"},
            { field:"title",title:"名称"},
            { field:"starttime",title:"开始时间"},
            { field:"cycle",title:"重复类型"},
            { field:"signtime",title:"签到时间"},
            { field:"joinPerson",title:"签到成员"},
            { field:"viewPerson",title:"查看权限"}
        ]]
    });
    //新建定时任务
    $("a[iconCls='icon-add']").click(function(){
        $('#listContainer').hide();
        $('#addTaskContainer').show();
    });
    //编辑定时任务
    $("a[iconCls='icon-edit']").on({
        'click' : function(){
            var rows = $("#mainGrid").datagrid("getSelections");
            if(rows.length == 0){
                $.messager.show({
                    msg:"请选择要修改的记录。",
                    title:"提示"
                })
            } else if(rows.length > 1){
                $.messager.show({
                    msg:"请不要选择多条记录。",
                    title:"提示"
                })
            } else if(rows.length == 1){
                $.post("/space/sign/getTaskInfo.html", { id:rows[0].id}, function(jsonData){
                    //console.log(jsonData);
                    if(jsonData==null){
                        $.messager.show({
                            msg:"此记录已不存在！",
                            title:"提示"
                        });
                    } else{
                        $('#listContainer').hide();
                        $('#tid').val(jsonData.id);
                        $('#title').val(jsonData.title);
                        $('#startDate').val(jsonData.starttime);
                        if(jsonData.signtime == ''){
                            $('input.taskType').attr('checked', 'checked');
                            $('tr.signTimeTr').addClass('hidden');
                            $('tr.timingSettingTr').removeClass('hidden');
                            var setting = $.parseJSON(jsonData.timingsetting);
                            $('input#startTime').val(setting.startTime);
                            $('input#endTime').val(setting.endTime);
                            $('input#interval').val(setting.interval);
                        } else{
                            var temp = [];
                            $('input.signTime').remove();
                            $.each($.parseJSON(jsonData.signtime), function(i, o){
                                temp.push('<input type="text" name="signTime[]" class="signTime" size="5" value="' + o + '" /> ');
                            });
                            $('.addSignTime').before(temp.join(''));
                        }
                        if(jsonData.cycletype != 0){ //重复
                            $("input#rdo0").attr('checked', 'checked');
                            $.each($.parseJSON(jsonData.cycletype), function(i, o){
                                $('#repeat' + o).attr('checked', 'checked');
                            });
                            $('tr.repeatTr').removeClass('hidden');
                        }
                        $('#endDate').val(jsonData.endtime);
                        //参与人
                        var temp = [];
                        $.each(jsonData.joinPerson, function(i, o){
                            temp.push('<li class="rcAddmenListli" id="yyauto_li_' + o.id + '"><span>' + o.name + '</span><input type="hidden" value="' + o.id + '" name="joinPersonUl_value[]" class="signEmployeeids"><a class="close" href="javascript:;"></a></li>');
                        });
                        $('ul#joinPersonUl').html(temp.join(''));
                        //查看人
                        var temp = [];
                        $.each(jsonData.viewPerson, function(i, o){
                            temp.push('<li class="rcAddmenListli" id="yyauto_li_' + o.id + '"><span>' + o.name + '</span><input type="hidden" value="' + o.id + '" name="viewPersonUl_value[]" class="signEmployeeids"><a class="close" href="javascript:;"></a></li>');
                        });
                        $('ul#viewPersonUl').html(temp.join(''));
                        $("#taskSave").linkbutton({ text:"更新"});
                        $('#addTaskContainer').show();
                    }
                },"json");
            }
        }
    });
    //删除定时任务
    $("a[iconCls='icon-remove']").click(function(){
        var ids = [],
            rows = $("#mainGrid").datagrid("getSelections");
        if(rows.length == 0){
                $.messager.show({
                    msg:"请选择要删除的记录。",
                    title:"提示"
                })
        }else{
            $.messager.confirm("请确认", "您要删除选中的所有记录吗？", function(result) {
                if (result) {
                    for ( var i = 0; i < rows.length; i++) {
                        ids.push(rows[i].id);
                    }
                    $.post("/space/sign/delete.html",{ ids:ids.join(",")},function(data){
                        if (parseInt(data) == 0) {
                            $("#mainGrid").datagrid("unselectAll");
                            $("#mainGrid").datagrid("reload");
                            $.messager.show({
                                title:"提示",
                                msg:"删除成功！"
                            });
                        } else {
                            $.messager.show({
                                msg:"删除失败!",
                                title:"提示"
                            });
                        }
                    },"text");
                }
            });
        }
    });
    //停用定时任务
    $("a[iconCls='icon-undo']").on({
        'click' : function(){
            var ids = [],
                    rows = $("#mainGrid").datagrid("getSelections");
            if(rows.length == 0){
                $.messager.show({
                    msg:"请选择要操作的记录。",
                    title:"提示"
                })
            }else{
                for ( var i = 0; i < rows.length; i++) {
                    ids.push(rows[i].id);
                }
                $.post("/space/sign/stop.html",{ ids:ids.join(",")},function(data){
                    if (parseInt(data) == 0) {
                        $("#mainGrid").datagrid("unselectAll");
                        $("#mainGrid").datagrid("reload");
                        $.messager.show({
                            title:"提示",
                            msg:"操作成功！"
                        });
                    } else {
                        $.messager.show({
                            msg:"操作失败!",
                            title:"提示"
                        });
                    }
                },"text");
            }
        }
    });
    //启用定时任务
    $("a[iconCls='icon-redo']").on({
        'click' : function(){
            var ids = [],
                rows = $("#mainGrid").datagrid("getSelections");
            if(rows.length == 0){
                $.messager.show({
                    msg:"请选择要启用的记录。",
                    title:"提示"
                })
            }else{
                for ( var i = 0; i < rows.length; i++) {
                    ids.push(rows[i].id);
                }
                $.post("/space/sign/open.html",{ ids:ids.join(",")},function(data){
                    if (parseInt(data) == 0) {
                        $("#mainGrid").datagrid("unselectAll");
                        $("#mainGrid").datagrid("reload");
                        $.messager.show({
                            title:"提示",
                            msg:"启用成功！"
                        });
                    } else {
                        $.messager.show({
                            msg:"启用失败!",
                            title:"提示"
                        });
                    }
                },"text");
            }
        }
    });

    /********任务详情页********/
    YY.loadScript(['jquery/datepicker/1.6.1/zebra_datepicker.js'], {
        fn: function(){
            $(".datepicker").Zebra_DatePicker();
        }
    });
    //添加签到时间
    $('.addSignTime').on({
        'click' : function(){
            $(this).before('<input type="text" name="signTime[]" class="signTime" size="5" /> ');
        }
    });
    //选择定时任务类型
    $('input.taskType').on({
        'click' : function(){
            $('tr.signTimeTr, tr.timingSettingTr').toggleClass('hidden');
        }
    });
    //点击选择重复类型
    $("input[name='isRepeat']").on({
        'click' : function(){
            $(this).val() > 0 ? $('tr.repeatTr').removeClass('hidden') : $('tr.repeatTr').addClass('hidden');
        }
    });
    //添加参与人、查看人
    YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js','yonyou/modules/employee/admin_employee_select.js'], {
        fn: function(){
            YY.userSelector({
                'selector': '.joinPersonSpan',
                'callback': function(fordiv,data){
                    //对所选择的人员信息进行整理
                    var ret = [];
                    for(var i=0;i<data.length;i++){
                        var liId = "yyauto_li_"+data[i].id;
                        if($("#"+fordiv+" li[id="+liId+"]").length == 0){ //不包含的时候增加
                            ret.push('<li id="'+liId+'" class="rcAddmenListli"><span>');
                            ret.push(data[i].name);
                            ret.push('</span><input type="hidden" class="signEmployeeids" name="'+fordiv+'_value[]" value=');
                            ret.push(data[i].id);
                            ret.push('><a href="javascript:;" class="close"></a></li>');
                        }
                    }
                    $("#"+fordiv).append(ret.join(''));//将选择的人 添加到input框中
                }
            });
            //查看人
            YY.userSelector({
                'selector': '.viewPersonSpan',
                'callback': function(fordiv,data){
                    //对所选择的人员信息进行整理
                    var ret = [];
                    for(var i=0;i<data.length;i++){
                        var liId = "yyauto_li_"+data[i].id;
                        if($("#"+fordiv+" li[id="+liId+"]").length == 0){ //不包含的时候增加
                            ret.push('<li id="'+liId+'" class="rcAddmenListli"><span>');
                            ret.push(data[i].name);
                            ret.push('</span><input type="hidden" class="signEmployeeids" name="'+fordiv+'_value[]" value=');
                            ret.push(data[i].id);
                            ret.push('><a href="javascript:;" class="close"></a></li>');
                        }
                    }
                    $("#"+fordiv).append(ret.join(''));//将选择的人 添加到input框中
                }
            });
        }
    });
    //删除参与人、查看人
    $('a.close').live({
        'click' : function(){
            $(this).closest('li').remove();
        }
    });
    //保存定时任务
    $('a#taskSave').on({
        'click' : function(){
            $("#addTaskForm").form("submit",{
                url: "/space/sign/saveTaskInfo.html",
                onSubmit : function(){
                    var taskType = $("input[name='taskType']"),
                            isRepeat = $("input[name='isRepeat']:checked").val();
                    $("#title").validatebox({
                        required:true,
                        missingMessage:"定时任务标题不能为空！"
                    });
                    $("#startDate").validatebox({
                        required:true,
                        missingMessage:"开始日期不能为空！"
                    });
                    //判断签到时间、固定频率时间
                    if(taskType.is(':checked')){
                        $("#startTime").validatebox({
                            required:true,
                            missingMessage:"开始时间不能为空！"
                        });
                        $("#endTime").validatebox({
                            required:true,
                            missingMessage:"结束时间不能为空！"
                        });
                    } else{
                        $(".signTime").validatebox({
                            required:true,
                            missingMessage:"签到时间不能为空！"
                        });
                    }
                    //判断结束日期
                    if(isRepeat == 1){
                        $("#endDate").validatebox({
                            required:true,
                            missingMessage:"结束日期不能为空！"
                        });
                    }
                    if(!$(this).form("validate")){
                        return false;//表单验证失败
                    }
                },
                success : function(data){
                    $('#addTaskContainer').hide();
                    $("#mainGrid").datagrid("reload");
                    $('#listContainer').show();
                    if(data){
                        $.messager.show({
                            msg     : data > 0 ? "保存成功" : '保存失败',
                            title   : "提示"
                        })
                    }
                }
            });
        }
    });
    //取消定时任务
    $('#taskCancel').on({
        'click' : function(){
            $('#addTaskContainer').hide();
            $('#listContainer').show();
        }
    });
}(jQuery, YonYou, YonYou.util));

</script>
</body>
</html>
