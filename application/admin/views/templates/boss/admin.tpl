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


    <script type="text/javascript">

        $(document).ready(function(){

            $("#mainGrid").datagrid({
                title:"用户管理",
                url:"/boss/admin/findSome.html",
                toolbar:"#tb",
                sortName:"id",
                sortOrder:"desc",
                idField:"id",
                nowrap:true,
                striped:true,
                pagination:true,
                pageNumber:1,
                singleSelect:true,
                pageSize: 10,//每页显示的记录条数，默认为10
                pageList: [5,10,15],//可以设置每页记录条数的列表
                frozenColumns:[[
                    { field:"ck",checkbox:true},
                    { field:"id",title:"ID",sortable:true}
                ]],
                columns:[[
                    { field:"username",title:"用户名"},
                    { field:"status",title:"状态",
                        formatter:function(value){
                            switch (parseInt(value)){
                                case 1:
                                    return "正常";
                                case 2:
                                    return "冻结";
                                default:
                                    return "";
                            }
                        }
                    },
                    { field:"rolename",title:"角色"},
                    { field:"createtime",title:"创建时间"}
                ]]
            });

            //新增和编辑界面 form 验证
            $("#username").validatebox({
                required:true,
                missingMessage:"用户名不能为空！"
            });
            $("#roleid").validatebox({
                required:true,
                missingMessage:"角色不能为空！"
            });

            //新增
            $("a[iconCls='icon-add']").click(function(){

                $("#mainEditor").dialog({
                    title: "新增",
                    height:200,
                    width:300,
                    closed: false,
                    cache: false,
                    modal: true
                });
                $("#dataform").css("display","block");

                $("#dataform").form("load",{
                    id : "",
                    username:"",
                    newpassword:"",
                    roleid:"",
                    status:1
                })
            });

            //修改
            $("a[iconCls='icon-edit']").click(function(){
                var rows = $("#mainGrid").datagrid("getSelections");

                if(rows.length > 1){
                    var names = [];
                    for(var i=0;i<rows.length;i++){
                        names.push(rows[i].username);
                    }

                    $.messager.show({
                        msg:"只能选择一条记录进行编辑!您已经选择了【"+names.join(",")+"】"+rows.length+"条记录。",
                        title:"提示"
                    })
                }else if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要编辑的记录。",
                        title:"提示"
                    })
                }else if(rows.length == 1){
                    //从数据库中重新获得这个用户的信息
                    $.post("/boss/admin/findOne.html",{ id:rows[0].id},function(jsonData){

                        if(jsonData==null){
                            $.messager.show({
                                msg:"此记录已不存在！",
                                title:"提示"
                            });
                        }else{
                            $("#mainEditor").dialog({
                                title: "修改",
                                height:200,
                                width:300,
                                closed: false,
                                cache: false,
                                modal: true
                            });

                            $("#dataform").css("display","block");
                            $("#dataform").form("load",{
                                id : jsonData.id,
                                username:jsonData.username,
                                newpassword:"",
                                roleid:jsonData.roleid,
                                status:jsonData.status
                            });
                        }
                    },"json");

                }

            });

            //删除系统管理员
            $("a[iconCls='icon-remove']").click(function(){
                var ids = [];
                var rows = $("#mainGrid").datagrid("getSelections");
                if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要删除的记录。",
                        title:"提示"
                     })
                }else{
                    $.messager.confirm("请确认", "您要删除选中的所有记录吗？", function(result) {
                        if (result) {
                            if(rows[0].id == {$adminid}){
                                $.messager.show({
                                    msg:"不能自己删除自己。",
                                    title:"提示"
                                });
                                return;
                            }

                            $.post("/boss/admin/delete.html",{ id:rows[0].id},function(data){
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

            $("#form_ok").click(function(){
                $("#dataform").form("submit",{
                    url: "/boss/admin/saveOrUpdate.html",
                    onSubmit:function(){
                        if(!$(this).form("validate")){
                            return false;//form 表单验证失败
                        }

                        //对用户名是否存在进行验证
                        var strId = $("#id").val();//获取ID值
                        var strUsername = $("#username").val();//获取用户名
                        var blnResult=false;//返回结果

                        var options = { type:"post",url:"/boss/admin/isExistByName.html", data:{ id:strId,username:strUsername},
                            async:false,success:function(data){
                                if(parseInt(data) == 1){
                                    $.messager.show({
                                        msg:"此用户名已存在,请修改!",
                                        title:"提示"
                                    });
                                    blnResult=false;//用户名已存在
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
                                msg:"保存成功!",
                                title:"提示"
                            });
                        }else{
                            $.messager.show({
                                msg:"保存失败!",
                                title:"提示"
                            })
                        }

                    }
                })
            })

            $("#form_cancel").click(function(){
                $("#mainEditor").dialog("close");//关闭弹出框
            });

            //简单查询
            $("#searchKey").searchbox({
                width  : 200,
                prompt : "请输入用户名",
                searcher:function(value,name){
                    refreshGrid("username like '%"+value+"%'");
                }

            });
        });

        //根据条件 刷新列表数据
        function refreshGrid(strWhere){
            $("#mainGrid").datagrid("load",{
                where : strWhere
            })
        }


    </script>
</head>
  
<body style="padding:10px;">

    <table id="mainGrid"></table>

    <div id="tb" style="padding:5px;height:auto">
        <div style="margin-bottom:5px">
            <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-add" plain="true">增加</a>
            <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-edit" plain="true">修改</a>
            <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-remove" plain="true">删除</a>

            <input id="searchKey"  style="margin-left:100px;" >
        </div>
    </div>

    <!--弹出的新增或修改界面 -->
    <div id="mainEditor">

            <form id="dataform" class="easyui-form"  method ="post" style="display:none; padding-left: 10px; padding-top: 10px; ">
                <input id="id" type="hidden" name="id">
                <table>
                    <tr>
                        <td width="50">用户名：</td>
                        <td><input id="username" name="username" type="text"/></td>
                    </tr>
                    <tr>
                        <td>新密码：</td>
                        <td><input name="newpassword" type="password"/></td>
                    </tr>
                    <tr>
                        <td>角色：</td>
                        <td>
                            <select id="roleid" name="roleid"  >
                                <option value=""></option>
                                {foreach from=$roleList item=role}
                                    <option value="{$role->id}">{$role->name}</option>
                                {/foreach}
                            </select>

                        </td></tr>
                    <tr>
                        <td>状态：</td>
                        <td>
                            <select name="status"  >
                                <option value="1">正常</option>
                                <option value="2">冻结</option>
                            </select>

                        </td></tr>

                    <tr align="right" >
                        <td colspan="2">
                            <a id="form_ok" class="easyui-linkbutton" iconCls="icon-save">保存</a>
                            <a id="form_cancel" class="easyui-linkbutton" iconCls="icon-cancel">取消</a>
                        </td>
                    </tr>
                </table>
            </form>


    </div>
</body>
</html>
