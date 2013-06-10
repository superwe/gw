<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="stylesheet" type="text/css" href="/css/admin.css" />

<link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/default/easyui.css">
<link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/icon.css">
<link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/ztree/3.5/zTreeStyle.css"/>
<script type="text/javascript" src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/jquery.easyui.min.js"></script>
<script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/locale/easyui-lang-zh_CN.js"></script>
<script type="text/javascript" src="http://cdn.qiater.com/js/jquery/ztree/3.5/jquery.ztree.all.min.js"></script>
<script type="text/javascript" src="http://cdn.qiater.com/js/jquery/json/2.3/jquery.json.min.js"></script>


<script type="text/javascript">
$(document).ready(function(){
    $("#mainGrid").datagrid({
        title:"角色管理",
        url:"/space/role/findSome.html",
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
            { field:"name",title:"名称"}
        ]]
    });

    //新增和编辑界面 form 验证
    $("#name").validatebox({
        required:true,
        missingMessage:"名称不能为空！"
    });
    //增加
    $("a[iconCls='icon-add']").click(function(){
        $("#mainEditor").dialog({
            title: "新增",
            height:150,
            width:300,
            closed: false,
            cache: false,
            modal: true
        });
        $("#dataform").css("display","block");

        $("#dataform").form("load",{
            id : "",
            name:""
        })
    });

    //修改
    $("a[iconCls='icon-edit']").click(function(){
        var rows = $("#mainGrid").datagrid("getSelections");
        if(rows.length != 0 && rows.length != 1){
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
            //从数据库中重新获得这个角色的信息
            $.post("/space/role/findOne.html",{ id:rows[0].id},function(jsonData){
                if(jsonData==null){
                    $.messager.show({
                        msg:"此记录已不存在！",
                        title:"提示"
                    });
                }else{
                    $("#mainEditor").dialog({
                        title: "修改",
                        height:150,
                        width:300,
                        closed: false,
                        cache: false,
                        modal: true
                    });

                    $("#dataform").css("display","block");
                    $("#dataform").form("load",{
                        id : jsonData.id,
                        name:jsonData.name
                    });
                }
            },"json");
        }
    });

    //删除
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
                    for ( var i = 0; i < rows.length; i++) {
                        ids.push(rows[i].id);
                    }
                    $.post("/space/role/delete.html",{ ids:ids.join(",")},function(data){
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
    //分配权限
    $("a[name='managePrivilege']").click(function(){
        var rows = $("#mainGrid").datagrid("getSelections");
        if(rows.length != 0 && rows.length != 1){
            var names = [];
            for(var i=0;i<rows.length;i++){
                names.push(rows[i].name);
            }
            $.messager.show({
                msg:"同时只能选择一个角色进行赋予权限操作!您已经选择了【"+names.join(",")+"】"+rows.length+"个角色。",
                title:"提示"
            })
        }else if(rows.length == 0){
            $.messager.show({
                msg:"请选择要赋予权限的角色。",
                title:"提示"
            })
        }else if(rows.length == 1){
            $("#roleId").val(rows[0].id);
            var setting = {
                data:{
                    key:{
                        name:"name"
                    },
                    simpleData :{
                        enable:true,
                        idKey:"id",
                        pIdKey:"parentid"
                    }
                },
                check:{
                    enable: true,
                    autoCheckTrigger: true,
                    chkStyle: "checkbox",
                    chkboxType: { "Y": "ps", "N": "ps" }
                }
            };
            $.post("/space/role/findMyPrivilege.html",{ roleId:rows[0].id},function(jsonData){
                for(var i=0;i<jsonData.length;i=i+1){
                    var name=jsonData[i].name;
                    var index=name.lastIndexOf('/');
                    if(index!=-1)
                        jsonData[i].name=name.substr(index+1);
                    if(jsonData[i].open==1)
                        jsonData[i].open=false;
                    else
                        jsonData[i].open=true;
                    if(jsonData[i].checked==1)
                        jsonData[i].checked=true;
                    else
                        jsonData[i].checked=false;

                    jsonData[i].url ="";
                }
                var funcTop = { "id":0,"name":"功能菜单"};
                jsonData.push(funcTop);//增加功能树根节点

                var privilegeTree = $.fn.zTree.init($("#privilegeTree"),setting,jsonData);
                privilegeTree.expandAll(true);//展开所有节点

            },"json");
            $("#privilegeDialog").css("display","block");
            $("#privilegeDialog").dialog({
                title: "分配权限",
                height:500,
                width:300,
                closed: false,
                cache: false,
                modal: true
            });
        }
    });
    $("#form_ok").click(function(){
        $("#dataform").form("submit",{
            url: "/space/role/saveOrUpdate.html",
            onSubmit:function(){
                if(!$(this).form("validate")){
                    return false;//form 表单验证失败
                }

                //对用户名是否存在进行验证
                var strId = $("#id").val();//获取ID值
                var strName = $("#name").val();//获取用户名
                var blnResult=false;//返回结果

                var options = { type:"post",url:"/boss/role/isExistByName.html", data:{ id:strId,name:strName},
                    async:false,success:function(data){
                        if(parseInt(data) == 1){
                            $.messager.show({
                                msg:"此角色名已存在,请修改!",
                                title:"提示"
                            });
                            blnResult=false;//角色名已存在
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
                    })
                }else{
                    $.messager.show({
                        msg:"保存角色失败!",
                        title:"提示"
                    })
                }

            }
        })
    })
    $("#form_cancel").click(function(){
        $("#mainEditor").dialog("close");//关闭弹出框
    });
    $("#submit_btn").click(function(){
        var treeObj = $.fn.zTree.getZTreeObj("privilegeTree");
        var nodes = treeObj.getCheckedNodes(true);
        if(nodes.length>0){
            var ids = [];
            for ( var i = 0; i < nodes.length; i++) {
                if(nodes[i].id != "0")
                {
                    ids.push(nodes[i].id);
                }

            }

            $.post("/space/role/managePrivilege.html",{ roleId:$("#roleId").val(),ids:ids.join(",")},function(data){
                if (parseInt(data) == 0) {
                    for ( var i = 0; i < nodes.length; i++) {
                        treeObj.cancelSelectedNode(nodes[i]);
                    }
                    $("#privilegeDialog").dialog("close");//关闭弹出框
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
        }else{
            $.messager.show({
                msg:"请选择权限!",
                title:"提示"
            });
        }
    });

    $("#cancel_btn").click(function(){
        $("#privilegeDialog").dialog("close");//关闭弹出框
    });
});



</script>
</head>
<body style="padding:10px;">
<table id="mainGrid"></table>
<div id="tb" style="padding:5px;height:auto">
    <div style="margin-bottom:5px">
        <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-add" plain="true">增加</a>
        <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-edit" plain="true">修改</a>
        <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-remove" plain="true">删除</a>
        <a href="javascript:void(0)" class="easyui-linkbutton" name="managePrivilege" plain="true">分配权限</a>
    </div>
</div>
<!--弹出的新增或修改界面 -->
<div id="mainEditor">
    <form id="dataform" class="easyui-form"  method ="post" style="display:none; padding-left: 10px; padding-top: 10px; ">
        <input type="hidden" name="id" id="id">
        <table>
            <tr>
                <td width="50">名称：</td>
                <td><input id="name" name="name" type="text"/></td>
            </tr>
            <tr align="right" >
                <td colspan="2">
                    <a id="form_ok" class="easyui-linkbutton" iconCls="icon-save">保存</a>
                    <a id="form_cancel" class="easyui-linkbutton" iconCls="icon-cancel">取消</a>
                </td>
            </tr>
        </table>
    </form>
</div>
<div id="privilegeDialog" style="display:none;">
    <input type="hidden" id="roleId">
    <ul id="privilegeTree" class="ztree"></ul>
    <span style="position: absolute; bottom: 20px; right: 60px;">
        <a id="submit_btn" class="easyui-linkbutton" iconCls="icon-save"  >保存</a>
        <a id="cancel_btn" class="easyui-linkbutton" iconCls="icon-cancel" >取消</a>
    </span>
</div>
</body>
</html>
