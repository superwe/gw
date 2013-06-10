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
                title:"应用信息",
                url:"/space/app/findSome.html",
                toolbar:"#tb",
                sortName:"sortvalue",
                sortOrder:"asc",
                idField:"id",
                nowrap:true,
                striped:true,
                singleSelect:true,
                pagination:false,
                frozenColumns:[[
                    { field:"ck",checkbox:true},
                    { field:"id",title:"ID",sortable:true,hidden:true}
                ]],
                columns:[[
                    { field:"name",title:"应用名称"},
                    { field:"introduce",title:"简介"},
                    { field:"type",title:"应用类型",
                        formatter:function(value){
                        if(value == 0)
                            return "基础应用";
                        else
                            return "新增应用";
                    }},
                    { field:"createtime",title:"创建时间"},
                    { field:"isshow",title:"状态" ,
                        formatter:function(value){
                            if(value == 1)
                                return "隐藏";
                            else
                                return "显示";
                        },styler:function(value,row,index){
                        if(value=="1"){
                            return 'background-color:red;color:white;';
                        }
                    }},
                    { field:"sort",title:"排序码"}
                ]]
            });

            $("#mainGrid").datagrid({
                onClickRow:function(rowIndex, rowData){
                    if(rowData.isshow == 0){ //显示
                        $("#hideApp").css("display","inline-block");
                        $("#showApp").css("display","none");
                    }
                    else{ //隐藏
                        $("#hideApp").css("display","none");
                        $("#showApp").css("display","inline-block");
                    }
                }
            });

            //新增和编辑界面 form 验证
            $("#name").validatebox({
                required:true,
                missingMessage:"应用名不能为空！"
            });




            //新增
            $("a[iconCls='icon-add']").click(function(){

                $("#mainEditor").dialog({
                    title: "新增应用",
                    height:400,
                    width:400,
                    closed: false,
                    cache: false,
                    modal: true
                });
                $("#dataform").css("display","block");

                $("#dataform").form("load",{
                    id : "",
                    name:"",
                    introduce:"",
                    url:""
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
                        msg:"只能选择一条记录进行编辑!您已经选择了【"+names.join(",")+"】"+rows.length+"条记录。",
                        title:"提示"
                    })
                }else if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要编辑的记录。",
                        title:"提示"
                    })
                }else if(rows.length == 1){
                    //从数据库中重新获得这个应用的信息
                    $.post("/space/app/findOne.html",{ id:rows[0].id},function(jsonData){

                        if(jsonData==null){
                            $.messager.show({
                                msg:"此记录已不存在！",
                                title:"提示"
                            });
                        }else{
                            $("#mainEditor").dialog({
                                title: "修改",
                                height:400,
                                width:400,
                                closed: false,
                                cache: false,
                                modal: true
                            });

                            $("#dataform").css("display","block");
                            $("#dataform").form("load",{
                                id : jsonData.id,
                                name:jsonData.name,
                                introduce:jsonData.introduce,
                                url:jsonData.url
                            });
                        }
                    },"json");

                }

            });

            //删除选中的岗位
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
                            $.post("/space/app/delete.html",{ ids:ids.join(",")},function(data){
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

            //隐藏应用
            $("#hideApp").click(function(){
                setAppShowtype(1);
            });
            //显示应用
            $("#showApp").click(function(){
                setAppShowtype(0);
            });

            $("#form_ok").click(function(){
                $("#dataform").form("submit",{
                    url: "/space/app/saveOrUpdate.html",
                    onSubmit:function(){
                        if(!$(this).form("validate")){
                            return false;//form 表单验证失败
                        }
                        //对用户名是否存在进行验证
                        var strId = $("#id").val();//获取ID值
                        var strName = $("#name").val();//获取用户名
                        var blnResult=false;//返回结果

                        var options = { type:"post",url:"/space/app/isExistByName.html", data:{ id:strId,name:strName},
                            async:false,success:function(data){
                                if(parseInt(data) == 1){
                                    $.messager.show({
                                        msg:"此应用名称已存在,请修改!",
                                        title:"提示"
                                    });
                                    blnResult=false;//应用名已存在
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
                prompt : "请输入应用名称",
                searcher:function(value,name){
                    refreshGrid("name like '%"+value+"%'");
                }
            });

            //向上排序
            $("#upApp").click(function(){
                var rows = $("#mainGrid").datagrid("getRows");
                var selectRows = $("#mainGrid").datagrid("getSelections");
                var currid = selectRows[0].id;//当前选中行的应用ID
                var currsort = selectRows[0].sort;//当前选中行的排序码
                var rowIndex =  $("#mainGrid").datagrid("getRowIndex",selectRows[0].id);
                if(rowIndex == 0){
                    $.messager.show({
                        msg:"已经是第一条记录了!",
                        title:"提示"
                    })
                }
                else{
                    var preid = rows[rowIndex-1].id; //上一行应用ID
                    var presort = rows[rowIndex-1].sort;//上一行的排序码

                    $.post("/space/app/upApp.html",{ currid:currid,preid:preid,currsort:currsort,presort:presort},
                        function(data){
                            if (parseInt(data) == 0) {
                                //$("#mainGrid").datagrid("unselectAll");
                                $("#mainGrid").datagrid("reload");
                            }
                            else {
                                $.messager.show({
                                    msg:"向上排序失败!",
                                    title:"提示"
                                });
                            }
                        },"text");
                }
            });

            //向下排序
            $("#downApp").click(function(){
                var rows = $("#mainGrid").datagrid("getRows");
                var selectRows = $("#mainGrid").datagrid("getSelections");
                var currid = selectRows[0].id;//当前选中行的应用ID
                var currsort = selectRows[0].sort;//当前选中行的排序码
                var rowIndex =  $("#mainGrid").datagrid("getRowIndex",selectRows[0].id);
                if(rowIndex == rows.length-1){
                    $.messager.show({
                        msg:"已经是最后一条记录了!",
                        title:"提示"
                    })
                }
                else{
                    var nextid = rows[rowIndex+1].id; //下一行的应用ID
                    var nextsort = rows[rowIndex+1].sort;//下一行的排序码

                    $.post("/space/app/downApp.html",{ currid:currid,nextid:nextid,currsort:currsort,nextsort:nextsort},
                            function(data){
                                if (parseInt(data) == 0) {
                                    $("#mainGrid").datagrid("reload");
                                }
                                else {
                                    $.messager.show({
                                        msg:"向下排序失败!",
                                        title:"提示"
                                    });
                                }
                            },"text");
                }
            });
        });

        //根据条件 刷新列表数据
        function refreshGrid(strWhere){
            $("#mainGrid").datagrid("load",{
                where : strWhere
            })
        }

        function setAppShowtype(showtype){

            var operation = showtype == 0 ? "显示":"隐藏";

            var rows = $("#mainGrid").datagrid("getSelections");
            if(rows.length == 0){
                $.messager.show({
                    msg:"请选择要"+operation+"的应用。",
                    title:"提示"
                })
            }else{
                $.messager.confirm("请确认", "您确定要"+operation+"选中的应用吗？", function(result) {
                    if (result) {
                        $.post("/space/app/setAppShowtype.html",{ id:rows[0].id, showtype:showtype},function(data){
                            if (parseInt(data) ==1) {
                                $("#mainGrid").datagrid("unselectAll");
                                $("#mainGrid").datagrid("reload");
                                $.messager.show({
                                    title:"提示",
                                    msg:operation+"成功！"
                                });
                            } else {
                                $.messager.show({
                                    msg:operation+"失败!",
                                    title:"提示"
                                });
                            }
                        },"text");
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
            <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-add" plain="true">增加</a>
            <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-edit" plain="true">修改</a>
            <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-remove" plain="true">删除</a>
            <a  id="hideApp"   class="easyui-linkbutton" iconCls="icon-undo" plain="true">隐藏应用</a>
            <a  id="showApp" style="display: none;"  class="easyui-linkbutton" iconCls="icon-redo" plain="true">显示应用</a>

            <a  id="upApp"   class="easyui-linkbutton"  plain="true">↑向上</a>
            <a  id="downApp"  class="easyui-linkbutton"  plain="true">↓向下</a>
        </div>
    </div>

    <!--弹出的新增或修改界面 -->
    <div id="mainEditor">

            <form id="dataform" class="easyui-form"  method ="post" enctype="multipart/form-data" style="display:none; padding-left: 10px; padding-top: 10px; ">
                <input type="hidden" id="id" name="id">
                <table>
                    <tr>
                        <td >应用名称:</td>
                        <td><input id="name" name="name" type="text"/></td>
                    </tr>
                    <tr>
                        <td>应用简介:</td>
                        <td><textarea id="introduce" name="introduce" style="width: 150px;"></textarea></td>
                    </tr>
                    <tr>
                        <td>链接地址:</td>
                        <td><input id="url" name="url" type="text"/></td>
                    </tr>
                    <tr>
                        <td>上传图标:</td>
                        <td ><input type="file" name="userfile"/></td>
                    </tr>

                    <tr align="center" >
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
