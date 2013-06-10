<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/admin.css" />
    <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/default/easyui.css">
    <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/icon.css">
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/jquery.easyui.min.js"></script>
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/locale/easyui-lang-zh_CN.js"></script>

    <style type="text/css">
    table.list{

    }
    table.list td{
        padding-left: 5px;
        padding-top: 4px;
    }
    </style>

    <script type="text/javascript">

        $(document).ready(function(){
            $("#mainGrid").datagrid({
                title:"用户基本信息",
                url:"/space/employee/findSomeInactive.html",
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
                    { field:"id",title:"ID",sortable:true},
                    { field:"no",title:"工号"},
                    { field:"name",title:"姓名"}
                ]],
                columns:[[
                    { field:"nickname",title:"昵称"},
                    { field:"sex",title:"性别",
                        formatter:function(value){
                            switch (parseInt(value)){
                                case 1:
                                    return "男";
                                case 2:
                                    return "女";
                                case 3:
                                    return "未知";
                                default:
                                    return "";
                            }
                        }
                    },
                    { field:"dept",title:"部门"},
                    { field:"job",title:"岗位"},
                    { field:"duty",title:"职务"},
                    { field:"status",title:"状态",
                        formatter:function(value){
                            switch (parseInt(value)){
                                case 0:
                                    return "未激活";
                                case 1:
                                    return "正常";
                                case 2:
                                    return "停用";
                                default:
                                    return "";
                            }
                        },styler:function(value,row,index){
                            if(value=="2"){
                                return 'background-color:red;color:white;';
                            }
                        }
                    },
                    { field:"leaderid",title:"直接上级"},
                    { field:"identity",title:"证件类型",
                        formatter:function(value){
                            switch (parseInt(value)){
                                case 1:
                                    return "身份证";
                                case 2:
                                    return "军官证";
                                case 3:
                                    return "护照";
                                case 4:
                                    return "其他";
                                default:
                                    return "";
                            }
                        }
                    },
                    { field:"identityno",title:"证件号码"},
                    { field:"birthday",title:"生日",
                        formatter:function(value){
                            if(value == "0000-00-00"){
                                return "";
                            }
                            else{
                                return value;
                            }
                        }
                    },
                    { field:"employdate",title:"入职日期",
                        formatter:function(value){
                            if(value == "0000-00-00"){
                                return "";
                            }
                            else{
                                return value;
                            }
                        }
                    },
                    { field:"quitdate",title:"离职日期",
                        formatter:function(value){
                            if(value == "0000-00-00"){
                                return "";
                            }
                            else{
                                return value;
                            }
                        }
                    },
                    { field:"email",title:"邮箱"},
                    { field:"mobile",title:"手机号码"},
                    { field:"phone",title:"办公电话"},
                    { field:"homeplaceid",title:"家乡",
                        formatter:function(value){
                            if(value == "0"){
                                return "";
                            }
                            else{
                                return value;
                            }
                        }
                    },
                    { field:"workplaceid",title:"工作地",
                        formatter:function(value){
                            if(value == "0"){
                                return "";
                            }
                            else{
                                return value;
                            }
                        }
                    },
                    { field:"qq",title:"qq"},
                    { field:"msn",title:"msn"},
                    { field:"firstletter",title:"姓名首字母"},
                    { field:"introduce",title:"个人介绍"},
                    { field:"imageurl",title:"照片"},
                    { field:"remark",title:"备注"}
                ]]
            });


            //新增和编辑界面 form 验证
            $("#no").validatebox({
                required:true,
                missingMessage:"工号不能为空！"
            });

            $("#name").validatebox({
                required:true,
                missingMessage:"姓名不能为空！"
            });

             $("#email").validatebox({
                required:true,
                validType:email,
                missingMessage:"邮箱不能为空！"
            });


            $(".combo").css("width","150px");
            $(".combo-text").css("width","130px");

            //修改
            $("a[iconCls='icon-edit']").click(function(){
                var rows = $("#mainGrid").datagrid("getSelections");
                if(rows.length > 1){
                    var names = [];
                    for(var i=0;i<rows.length;i++){
                        names.push(rows[i].name);
                    }
                    $.messager.show({
                        msg:"只能选择一个用户进行编辑!您已经选择了【"+names.join(",")+"】"+rows.length+"个用户。",
                        title:"提示"
                    })
                }else if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要编辑的用户。",
                        title:"提示"
                    })
                }else if(rows.length == 1){
                    //从数据库中重新获得这个用户的信息
                    {literal}
                    $.post("/space/employee/findOne.html",{id:rows[0].id},function(jsonData){
                        if(jsonData==null){
                            $.messager.show({
                                msg:"此用户已不存在！",
                                title:"提示"
                            });
                        }else{
                            $("#mainEditor").dialog({
                                title: "修改用户信息",
                                height:500,
                                width:580,
                                closed: false,
                                cache: false,
                                modal: true
                            });

                            $("#dataform").css("display","block");
                            $("#dataform").form("load",{
                                id : jsonData.id,
                                no:jsonData.no,
                                name:jsonData.name,
                                nickname:jsonData.nickname,
                                sex:jsonData.sex,
                                 deptid:jsonData.deptid,
                                 jobid:jsonData.jobid,
                                 duty:jsonData.duty,
                                 leaderid:jsonData.leaderid,
                                 identity:jsonData.identity,
                                 identityno:jsonData.identityno,
                                 birthday:jsonData.birthday =="0000-00-00"?'':jsonData.birthday,
                                 employdate:jsonData.employdate =="0000-00-00"?'':jsonData.employdate,
                                 quitdate:jsonData.quitdate =="0000-00-00"?'':jsonData.quitdate,
                                 email:jsonData.email,
                                mobile:jsonData.mobile,
                                phone:jsonData.phone,
                                homeplaceid:jsonData.homeplaceid,
                                workplaceid:jsonData.workplaceid,
                                qq:jsonData.qq,
                                msn:jsonData.msn,
                                introduce:jsonData.introduce,
                                remark:jsonData.remark
                            });
                        }
                    },"json");
                    {/literal}
                }
            });

            //删除
            $("a[iconCls='icon-remove']").click(function(){
                var ids = [];
                var rows = $("#mainGrid").datagrid("getSelections");
                if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要删除的用户。",
                        title:"提示"
                     })
                }else{
                    $.messager.confirm("请确认", "您要删除当前所选用户吗？", function(result) {
                        if (result) {
                            for ( var i = 0; i < rows.length; i++) {
                                ids.push(rows[i].id);
                            }
                            {literal}
                            $.post("/space/employee/delete.html",{ids:ids.join(",")},function(data){
                                if (parseInt(data) == 0) {
                                    $("#mainGrid").datagrid("unselectAll");
                                    $("#mainGrid").datagrid("reload");
                                    $.messager.show({
                                        title:"提示",
                                        msg:"删除用户成功！"
                                    });
                                } else {
                                    $.messager.show({
                                        msg:"删除用户失败!",
                                        title:"提示"
                                    });
                                }
                            },"text");
                            {/literal}
                        }
                    });

                }
            });

            $("#form_ok").click(function(){
                $("#dataform").form("submit",{
                    url: "/space/employee/saveOrUpdate.html",
                    onSubmit:function(){
                        if(!$(this).form("validate")){
                            return false;//form 表单验证失败
                        }
                        //对工号是否存在进行验证
                        var strId = $("#id").val();//获取ID值
                        var strNo = $("#no").val();//获取工号
                        var blnResult=false;//返回结果

                        var options = { type:"post",url:"/space/employee/isExistByNo.html", data:{ id:strId,no:strNo},
                            async:false,success:function(data){
                                if(parseInt(data) == 1){
                                    $.messager.show({
                                        msg:"此工号已存在,请修改!",
                                        title:"提示"
                                    });
                                    blnResult=false;//工号已存在
                                }else{
                                    blnResult=true;
                                }
                            }
                        };
                        $.ajax(options);//发送验证请求
                        return blnResult;
                    },
                    success:function(data){
                        if(parseInt(data) == 0){
                            $("#mainEditor").dialog("close");//关闭弹出框
                            $("#mainGrid").datagrid("reload");
                            $.messager.show({
                                msg:"保存用户成功!",
                                title:"提示"
                            })
                        }else{
                            $.messager.show({
                                msg:"保存用户失败!",
                                title:"提示"
                            })
                        }

                    }
                })
            })

            $("#form_cancel").click(function(){
                $("#mainEditor").dialog("close");//关闭弹出框
            });

            $("#inactive").click(function(){
                operateUser("2");
            });

            $("#active").click(function(){
                operateUser("1");
            });
        });

        function operateUser(type){
            var ids = [];
            var url = "";
            var text = "";
            if(type == "2"){ //停用
                url = "/space/employee/inactiveEmployee.html";
                text = "停用";
            }
            else{ //启用
                url = "/space/employee/activeEmployee.html";
                text = "启用";
            }

            var rows = $("#mainGrid").datagrid("getSelections");
            if(rows.length == 0){
                $.messager.show({
                    msg:"请选择要"+text+"的用户。",
                    title:"提示"
                })
            }else{
                $.messager.confirm("请确认", "您要"+text+"当前所选用户吗？", function(result) {
                    if (result) {
                        for ( var i = 0; i < rows.length; i++) {
                            if(rows[i].status != type ){
                                ids.push(rows[i].id);
                            }
                        }
                        if(ids.length == 0){
                            $.messager.show({
                                msg:"所选用户已经都为"+text+"状态。",
                                title:"提示"
                            })
                        }
                        else{
                            $.post(url,{ ids:ids.join(",") },function(data){
                                if (parseInt(data) == 0) {
                                    $("#mainGrid").datagrid("unselectAll");
                                    $("#mainGrid").datagrid("reload");
                                    $.messager.show({
                                        title:"提示",
                                        msg:text + "用户成功！"
                                    });
                                } else {
                                    $.messager.show({
                                        msg:text +"用户失败!",
                                        title:"提示"
                                    });
                                }
                            },"text");
                        }
                    }
                });

            }
        }

    </script>
</head>
  
<body style="padding:10px;">

    <table id="mainGrid"></table>

    <div id="tb" style="padding:5px;height:auto">
        <div style="margin-bottom:5px">
            <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-edit" plain="true">修改</a>
            <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-remove" plain="true">删除</a>

            <a  id="active"  href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-redo" plain="true">启用</a>
           <!--
            <a  id="inactive"  href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-undo" plain="true">停用</a>
            -->
        </div>
    </div>

    <!--弹出的新增或修改界面 -->
    <div id="mainEditor">
            <form id="dataform" class="easyui-form"  method ="post" enctype="multipart/form-data" style="display:none; padding-left: 10px; padding-top: 10px; ">
                <input type="hidden" id="id" name="id">
                <table class="list">
                    <tr>
                        <td>工号：</td>
                        <td><input id="no" name="no" type="text"/></td>
                        <td>姓名：</td>
                        <td><input id="name" name="name" type="text"/></td>
                    </tr>
                     <tr>
                        <td>昵称：</td>
                        <td><input id="nickname" name="nickname" type="text"/></td>
                        <td>性别：</td>
                        <td><select id="sex" name="sex" class="easyui-combobox" >
                            <option value="0"></option>
                            <option value="1">男</option>
                            <option value="2">女</option>
                            <option value="3">未知</option>
                        </select></td>
                    </tr>
                     <tr>
                        <td>部门：</td>
                        <td><select id="deptid" name="deptid" class="easyui-combogrid"
                                    data-options="panelWidth:240,url:'/space/dept/findAll.html',idField:'id',textField:'name',
                                    columns:[[
                                        { field:'id',title:'id',hidden:true},
                                        { field:'name',title:'名称',width:150},
                                        { field:'employeename',title:'负责人',width:80}
                                    ]]">
                        </select></td>
                        <td>岗位：</td>
                        <td><select id="jobid" name="jobid" class="easyui-combogrid"
                                    data-options="panelWidth:200,idField:'id',textField:'name',url:'/space/job/findAll.html',
                                    columns:[[
                                        { field:'id',title:'id',hidden:true},
                                        { field:'name',title:'岗位名称',width:60},
                                        { field:'jobserial',title:'岗位序列',width:60}
                                    ]],fitColumns:true"
                            > </select></td>
                    </tr>
                     <tr>
                        <td>职务：</td>
                        <td><input id="duty" name="duty" type="text"/></td>
                        <td>直接上级：</td>
                        <td><select id="leaderid" name="leaderid" class="easyui-combogrid"
                                    data-options="panelWidth:335,idField:'id',textField:'name',url:'/space/employee/findAllForPersonEdit.html',
                                    columns:[[
                                        { field:'id',title:'id',hidden:true},
                                        { field:'no',title:'工号',width:30},
                                        { field:'name',title:'姓名',width:80},
                                        { field:'dept',title:'部门',width:145},
                                         { field:'job',title:'岗位',width:80}
                                    ]],fitColumns:true"
                                > </select></td>
                    </tr>
                     <tr>
                        <td>证件类型：</td>
                        <td><select id="identity" name="identity" class="easyui-combobox">
                            <option value="0"></option>
                            <option value="1">身份证</option>
                            <option value="2">军官证</option>
                            <option value="3">护照</option>
                            <option value="4">其他</option>
                        </select></td>
                         <td>证件号码：</td>
                         <td><input id="identityno" name="identityno" type="text"/></td>
                     </tr>
                     <tr>
                        <td>生日：</td>
                        <td><input id="birthday" name="birthday" type="text" class="easyui-datebox" /></td>
                         <td>邮箱：</td>
                         <td><input id="email" name="email" type="text" /></td>
                     </tr>
                      <tr>
                        <td>入职日期：</td>
                        <td><input id="employdate" name="employdate" type="text" class="easyui-datebox"/></td>
                        <td>离职日期：</td>
                        <td><input id="quitdate" name="quitdate" type="text"  class="easyui-datebox"/></td>
                     </tr>
                    <tr>
                        <td>手机号码：</td>
                        <td><input id="mobile" name="mobile" type="text"/></td>
                        <td>办公电话：</td>
                        <td><input id="phone" name="phone" type="text" /></td>
                     </tr>
                    <tr>
                        <td>家乡：</td>
                        <td><select id="homeplaceid" name="homeplaceid" class="easyui-combobox">
                            <option value="0"></option>
                            <option value="1">北京</option>
                            <option value="2">河北</option>
                            <option value="3">上海</option>
                            <option value="4">广州</option>
                        </select></td>
                        <td>工作地：</td>
                        <td><select id="workplaceid" name="workplaceid" class="easyui-combobox">
                            <option value="0"></option>
                            <option value="1">北京</option>
                            <option value="2">河北</option>
                            <option value="3">上海</option>
                            <option value="4">广州</option>
                        </select></td>
                     </tr>
                     <tr>
                        <td>qq：</td>
                        <td><input id="qq" name="qq" type="text"/></td>
                        <td>msn：</td>
                        <td><input id="msn" name="msn" type="text" /></td>
                     </tr>
                     <tr>
                        <td>个人介绍：</td>
                        <td colspan="3">
                            <textarea id="introduce"  name="introduce"  style="width: 440px;height: 30px;resize:none;" ></textarea>
                        </td>
                     </tr>
                     <tr>
                        <td>备注：</td>
                        <td colspan="3">
                            <textarea id="remark" name="remark" style="width: 440px;height: 30px;resize:none;"></textarea>
                        </td>
                     </tr>

                    <tr align="center">
                        <td colspan="4" style="padding-top: 10px;">
                            <a id="form_ok" class="easyui-linkbutton" iconCls="icon-save">保存</a>
                            <a id="form_cancel" class="easyui-linkbutton" iconCls="icon-cancel">取消</a>
                        </td>
                    </tr>

                </table>
            </form>


    </div>
</body>
</html>
