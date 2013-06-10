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
                title:"岗位基本信息",
                url:"/space/job/findSome.html",
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
                    { field:"name",title:"岗位名称"},
                    { field:"jobserial",title:"岗位序列"},
                    { field:"isenabled",title:"是否有效",
                        formatter:function(value){
                            if(value == "1")
                            {
                                return "是";
                            }
                            else
                            {
                                return "否";
                            }
                        }
                    },
                    { field:"remark",title:"备注"}
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
                    title: "新增岗位",
                    height:260,
                    width:260,
                    closed: false,
                    cache: false,
                    modal: true
                });
                $("#dataform").css("display","block");

                $("#dataform").form("load",{
                    id : "",
                    name:"",
                    jobserialid:0,
                    isenabled:1,
                    remark:""
                })
            });

            //修改
            $("a[iconCls='icon-edit']").click(function(){
                var rows = $("#mainGrid").datagrid("getSelections");
                if(rows.length > 1){
                    var names = [];
                    for(var i=0;i<rows.length;i++){
                        names.push(rows[i].name);
                    }
                    $.messager.show({
                        msg:"只能选择一个岗位进行编辑!您已经选择了【"+names.join(",")+"】"+rows.length+"个岗位。",
                        title:"提示"
                    })
                }else if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要编辑的岗位。",
                        title:"提示"
                    })
                }else if(rows.length == 1){
                    //从数据库中重新获得这个岗位的信息
                    {literal}
                    $.post("/space/job/findOne.html",{id:rows[0].id},function(jsonData){
                        if(jsonData==null){
                            $.messager.show({
                                msg:"此岗位已不存在！",
                                title:"提示"
                            });
                        }else{
                            $("#mainEditor").dialog({
                                title: "修改岗位信息",
                                height:260,
                                width:260,
                                closed: false,
                                cache: false,
                                modal: true
                            });

                            $("#dataform").css("display","block");
                            $("#dataform").form("load",{
                                id : jsonData.id,
                                name:jsonData.name,
                                jobserialid:jsonData.jobserialid,
                                isenabled:jsonData.isenabled,
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
                        msg:"请选择要删除的岗位。",
                        title:"提示"
                     })
                }else{
                    $.messager.confirm("请确认", "您要删除当前所选岗位吗？", function(result) {
                        if (result) {
                            for ( var i = 0; i < rows.length; i++) {
                                ids.push(rows[i].id);
                            }
                            {literal}
                            $.post("/space/job/delete.html",{ids:ids.join(",")},function(data){
                                if (parseInt(data) == 0) {
                                    $("#mainGrid").datagrid("unselectAll");
                                    $("#mainGrid").datagrid("reload");
                                    $.messager.show({
                                        title:"提示",
                                        msg:"删除岗位成功！"
                                    });
                                } else {
                                    $.messager.show({
                                        msg:"删除岗位失败!",
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
                    url: "/space/job/saveOrUpdate.html",
                    onSubmit:function(){
                        if(!$(this).form("validate")){
                            return false;//form 表单验证失败
                        }
                        //对岗位编码是否存在进行验证
                        var strId = $("#id").val();//获取ID值
                        var strName = $("#name").val();//获取岗位名
                        var blnResult=false;//返回结果

                        var options = { type:"post",url:"/space/job/isExistByName.html", data:{ id:strId,name:strName},
                            async:false,success:function(data){
                                if(parseInt(data) == 1){
                                    $.messager.show({
                                        msg:"岗位名称已存在,请修改!",
                                        title:"提示"
                                    });
                                    blnResult=false;//岗位名已存在
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
                                msg:"保存岗位成功!",
                                title:"提示"
                            })
                        }else{
                            $.messager.show({
                                msg:"保存岗位失败!",
                                title:"提示"
                            })
                        }

                    }
                })
            })

            $("#form_cancel").click(function(){
                $("#mainEditor").dialog("close");//关闭弹出框
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

        </div>
    </div>

    <!--弹出的新增或修改界面 -->
    <div id="mainEditor">
            <form id="dataform" class="easyui-form"  method ="post" enctype="multipart/form-data" style="display:none; padding-left: 10px; padding-top: 10px; ">
                <input type="hidden" id="id" name="id">
                <table>
                    <tr><td>岗位名称：</td><td><input id="name" name="name" type="text"/></td></tr>
                    <tr><td>岗位序列：</td><td>
                        <select id="jobserialid" name="jobserialid" style="width:155px;" >
                            <option value="0"></option>
                            {foreach from=$jobSerialList item=jobSerial}
                                   <option value="{$jobSerial->id}">{$jobSerial->name}</option>
                            {/foreach}
                        </select>
                    </td></tr>
                    <tr><td>是否可用：</td><td>
                        <select id="isenabled" name="isenabled" style="width:155px;" >
                            <option value="1" selected="selected">是</option>
                            <option value="0">否</option>
                        </select>
                    </td></tr>
                    <tr><td>备注：</td><td><textarea id="remark" name="remark" style="width: 150px;height: 40px;"></textarea></td></tr>

                    <tr align="right">
                        <td colspan="2" style="padding-top: 5px;">
                            <a id="form_ok" class="easyui-linkbutton" iconCls="icon-save">保存</a>
                            <a id="form_cancel" class="easyui-linkbutton" iconCls="icon-cancel">取消</a>
                        </td>
                    </tr>
                </table>
            </form>


    </div>
</body>
</html>
