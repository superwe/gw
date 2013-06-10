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
            $("#mainGrid").treegrid({
                title:"组织机构基本信息",
                url:"/space/dept/findAll.html",
                toolbar:"#tb",
                sortName:"id",
                sortOrder:"desc",
                idField:"id",
                nowrap:true,
                striped:true,
                treeField:'name',
                collapsible: true,
				fitColumns: true,
                frozenColumns:[[
                    { field:"ck",checkbox:true},
                    { field:"id",title:"ID",sortable:true}
                ]],
                columns:[[
                    { field:"name",title:"机构名称"},
                    { field:"parentid",title:"父节点ID",hidden:true},
                    { field:"ancestorids",title:"祖先ID序列",hidden:true},
                    { field:"level",title:"层级",hidden:true},
                    { field:"isleaf",title:"是否叶子节点",
                         formatter:function(value){
                            if(value == 1)
                                return "是";
                            else
                                return "否";
                        },hidden:true
                    },
                    { field:"employeename",title:"负责人"},
                    { field:"createdate",title:"创建日期",
                        formatter:function(value){
                            if(value == "0000-00-00"){
                                return "";
                            }
                            else{
                                return value;
                            }
                        }
                    },
                    { field:"canceldate",title:"撤销日期",
                        formatter:function(value){
                            if(value == "0000-00-00"){
                                return "";
                            }
                            else{
                                return value;
                            }
                        }
                    },
                    { field:"status",title:"状态",
                        formatter:function(value){
                            switch (parseInt(value)){
                                case 1:
                                    return "正常";
                                case 2:
                                    return "撤销";
                                default:
                                    return "";
                            }
                        },styler:function(value,row,index){
                            if(value=="2")
                                return 'background-color:red;color:white;';
                        }
                    },
                    { field:"remark",title:"备注"}
                ]]
            });

            $("#mainGrid").treegrid({
                onClickRow:function(row){
                    if(row.status == 1){ //正常
                        $("#undoDept").css("display","inline-block");
                        $("#redoDept").css("display","none");
                    }
                    else{ //已撤销部门
                        $("#undoDept").css("display","none");
                        $("#redoDept").css("display","inline-block");
                    }
                }
            })

            //新增和编辑界面 form 验证
            $("#name").validatebox({
                required:true,
                missingMessage:"机构名称不能为空!"
            });

            $("#destinationDeptid").validatebox({
                required:true,
                missingMessage:"目标机构不能为空!"
            });



            //增加
            $("#addNew").click(function(){
                var rows = $("#mainGrid").treegrid("getSelections");
                if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要新增机构的上级机构。",
                        title:"提示"
                    })
                }else if(rows.length == 1){
                    $("#mainEditor").dialog({
                        title: "新增机构",
                        height:280,
                        width:300,
                        closed: false,
                        cache: false,
                        modal: true
                    });
                    $("#dataform").css("display","block");
                    $("#saveAndAdd").css("display","block");
                    $("#lblSaveAndAdd").css("display","block");
                    $("#dataform").form("load",{
                        id : "",
                        name:"",
                        parentid:rows[0].id,
                        ancestorids:rows[0].ancestorids+rows[0].id+"|",
                        level:parseInt(rows[0].level)+1,
                        managerid:"",
                        remark:""
                    })
                }
            });

            //修改
            $("#modify").click(function(){
                var rows = $("#mainGrid").treegrid("getSelections");
                if(rows.length > 1){
                    var names = [];
                    for(var i=0;i<rows.length;i++){
                        names.push(rows[i].name);
                    }
                    $.messager.show({
                        msg:"只能选择一个机构进行编辑!您已经选择了【"+names.join(",")+"】"+rows.length+"个机构。",
                        title:"提示"
                    })
                }else if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要编辑的机构。",
                        title:"提示"
                    })
                }else if(rows.length == 1){
                    //从数据库中重新获得这个机构的信息
                    {literal}
                    $.post("/space/dept/findOne.html",{id:rows[0].id},function(jsonData){
                        if(jsonData==null){
                            $.messager.show({
                                msg:"此机构已不存在！",
                                title:"提示"
                            });
                        }else{
                            $("#mainEditor").dialog({
                                title: "修改机构信息",
                                height:280,
                                width:300,
                                closed: false,
                                cache: false,
                                modal: true
                            });

                            $("#dataform").css("display","block");
                            $("#saveAndAdd").css("display","none");
                            $("#lblSaveAndAdd").css("display","none");
                            $("#dataform").form("load",{
                                id : jsonData.id,
                                name:jsonData.name,
                                parentid:jsonData.parentid,
                                managerid:jsonData.managerid,
                                remark:jsonData.remark
                            });
                        }
                    },"json");
                    {/literal}
                }
            });

            //删除
            $("#delete").click(function(){
                var ids = [];
                var rows = $("#mainGrid").treegrid("getSelections");
                if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要删除的机构。",
                        title:"提示"
                     })
                }else{
                    var blnResult=false;
                    var options = { type:"post",url:"/space/dept/isCanDelete.html", data:{ id:rows[0].id},
                        async:false,success:function(data){
                            var message="";
                            switch (parseInt(data)){
                                case 1:
                                    message="此机构还包含下级机构，不允许删除!";
                                    break;
                                case 2:
                                    message="此机构还包含岗位关系，不允许删除!";
                                    break;
                                case 3:
                                    message="此机构还包含人员，不允许删除!";
                                    break;
                            }
                            if(message!=""){
                                $.messager.show({
                                    msg:message,
                                    title:"提示"
                                });
                                blnResult=false;//不符合条件
                            }else{
                                blnResult=true;//通过校验
                            }
                        }
                    };
                    $.ajax(options);//发送验证请求

                    if(blnResult){
                        $.messager.confirm("请确认", "您确定要删除当前所选机构吗？", function(result) {
                            if (result) {
                                {literal}
                                $.post("/space/dept/delete.html",{id:rows[0].id,parentid:rows[0].parentid},function(data){
                                    if (parseInt(data) == 0) {
                                        $("#mainGrid").treegrid("unselectAll");
                                        showUndoDept();
                                        $.messager.show({
                                            title:"提示",
                                            msg:"删除机构成功！"
                                        });
                                    } else {
                                        $.messager.show({
                                            msg:"删除机构失败!",
                                            title:"提示"
                                        });
                                    }
                                },"text");
                                {/literal}
                            }
                        });

                    }
                }
            });

            //编辑部门的窗口 保存
            $("#form_ok").click(function(){
                $("#dataform").form("submit",{
                    url: "/space/dept/saveOrUpdate.html",
                    onSubmit:function(){
                        if(!$("#dataform").form("validate")){
                            return false;//form 表单验证失败
                        }
                        //对用户名是否存在进行验证
                        var strId = $("#id").val();//获取ID值
                        var strName = $("#name").val();//获取机构名
                        var strParentid = $("#parentid").val();//获取上级机构ID
                        var blnResult=false;//返回结果

                       var options = { type:"post",url:"/space/dept/isExistByName.html", data:{ id:strId,name:strName,parentid:strParentid},
                            async:false,success:function(data){
                                if(parseInt(data) == 1){
                                    $.messager.show({
                                        msg:"同级机构不能重名,请修改!",
                                        title:"提示"
                                    });
                                    blnResult=false;//机构名已存在
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
                            if($("#saveAndAdd").is(":checked")){ //选中了保存并新增
                                $("#dataform").form("load",{
                                    id : "",
                                    name:"",
                                    managerid:"",
                                    remark:""
                                })
                            }
                            else{
                                $("#mainEditor").dialog("close");//关闭弹出框
                            }

                            showUndoDept();
                            $.messager.show({
                                msg:"保存机构成功!",
                                title:"提示"
                            })
                        }else{
                            $.messager.show({
                                msg:"保存机构失败!",
                                title:"提示"
                            })
                        }

                    }
                })
            });

            //编辑部门的窗口 关闭
            $("#form_cancel").click(function(){
                $("#mainEditor").dialog("close");//关闭弹出框
            });

            //移动合并部门
            $("#changeDept").click(function(){
                var rows = $("#mainGrid").treegrid("getSelections");
                if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要移动合并的机构!",
                        title:"提示"
                    })
                }else if(rows.length == 1){
                    $("#deptChangeEdit").dialog({
                        title: "移动合并机构",
                        height:180,
                        width:300,
                        closed: false,
                        cache: false,
                        modal: true
                    });
                    $("#deptChangeForm").css("display","block");
                    $("#deptChangeForm").form("load",{
                        originalAncestorids:rows[0].ancestorids,
                        originalParentid:rows[0].parentid,
                        originalDeptid:rows[0].id,
                        operateType:1,
                        destinationDeptid:""
                    })
                }
            });

            //移动合并部门窗口的 保存
            $("#deptChange_ok").click(function(){
                var operateType = $("#operateType").val() ;
                var originalDeptValue = $("#originalDeptid").combogrid("getValue");
                var destinationDeptValue = $("#destinationDeptid").combogrid("getValue");

                var operateTypeText = operateType =="1"?'移动到':'合并到';
                var originalDeptName = $("#originalDeptid").combogrid("getText");
                var destinationDeptName = $("#destinationDeptid").combogrid("getText");

                $.messager.confirm("请确认", "您确定要将'"+originalDeptName+"'"+operateTypeText+"'"+destinationDeptName+"'吗?", function(result) {
                    if (result) {
                        $("#deptChangeForm").form("submit",{
                            url: "/space/dept/moveOrMergeDept.html",
                            onSubmit:function(){
                                if(!$("#deptChangeForm").form("validate")){
                                    return false;//form 表单验证失败
                                }
                                if(originalDeptValue == destinationDeptValue){
                                    $.messager.show({
                                        msg:"原机构与目标机构相同,不能执行此操作!",
                                        title:"提示"
                                    });
                                    return false;
                                }

                                var blnResult=false;

                                //是否允许移动或合并的 业务性校验
                                if(operateType == "1"){ // 移动机构
                                    var originalParentid = $("#originalParentid").val();
                                    if(originalParentid == destinationDeptValue){
                                        $.messager.show({
                                            msg:"原机构本身就在目标机构下,不需要执行移动操作!",
                                            title:"提示"
                                        });
                                        return false;
                                    }

                                    var options = { type:"post",url:"/space/dept/isSubordinateDept.html", data:{ originalDeptid:originalDeptValue,destinationDeptid:destinationDeptValue},
                                        async:false,success:function(data){
                                            if(parseInt(data) == 1){
                                                $.messager.show({
                                                    msg:"机构不能移动到自己的下级机构,请修改!",
                                                    title:"提示"
                                                });
                                                blnResult=false;//机构不能移动到自己的下级机构
                                            }else{
                                                blnResult=true;
                                            }
                                        }
                                    };
                                    $.ajax(options);//发送验证请求

                                    if(blnResult)
                                    {
                                        var options = { type:"post",url:"/space/dept/isSubordinateDept.html", data:{ originalDeptid:originalDeptValue,destinationDeptid:destinationDeptValue},
                                            async:false,success:function(data){
                                                if(parseInt(data) == 1){
                                                    $.messager.show({
                                                        msg:"机构不能移动到自己的下级机构,请修改!",
                                                        title:"提示"
                                                    });
                                                    blnResult=false;//机构不能移动到自己的下级机构
                                                }else{
                                                    blnResult=true;
                                                }
                                            }
                                        };
                                        $.ajax(options);//发送验证请求

                                        if(blnResult)
                                        {
                                            var options = { type:"post",url:"/space/dept/isDestinationDeptHasSameNameDept.html", data:{ originalDeptid:originalDeptValue,originalDeptName:originalDeptName, destinationDeptid:destinationDeptValue},
                                                async:false,success:function(data){
                                                    if(data == "1"){
                                                        $.messager.show({
                                                            msg:"目的机构中存在相同的已撤销的机构名称，不能执行此操作!",
                                                            title:"提示"
                                                        });
                                                        blnResult=false;
                                                    }else if(data == "2"){
                                                        $.messager.confirm("请确认", "相同名称的机构将进行合并，您确定执行此操作吗？", function(result) {
                                                            if (result) {
                                                                blnResult=true;
                                                            }
                                                            else{
                                                                blnResult=false;
                                                            }
                                                        });
                                                    }
                                                }
                                            };
                                            $.ajax(options);//发送验证请求
                                        }
                                    }
                                    return blnResult;
                                }
                                else{ // 合并机构
                                    var options = { type:"post",url:"/space/dept/isSameLeveDept.html", data:{ originalDeptid:originalDeptValue,destinationDeptid:destinationDeptValue},
                                        async:false,success:function(data){
                                            if(parseInt(data) == 1){
                                                $.messager.show({
                                                    msg:"只有同一层级的机构才能进行合并操作,请修改!",
                                                    title:"提示"
                                                });
                                                blnResult=false;//只有同一层级的机构才能进行合并操作
                                            }else{
                                                blnResult=true;
                                            }
                                        }
                                    };
                                    $.ajax(options);//发送验证请求
                                    return blnResult;
                                }
                            },
                            success:function(data){
                                if(parseInt(data) == 0){
                                    $("#deptChangeEdit").dialog("close");//关闭弹出框
                                    showUndoDept();
                                    $.messager.show({
                                        msg:"操作成功!",
                                        title:"提示"
                                    })
                                }else{
                                    $.messager.show({
                                        msg:"操作失败!",
                                        title:"提示"
                                    })
                                }

                            }
                        })
                    }
                });
            });

            //移动合并部门窗口的 取消
            $("#deptChange_cancel").click(function(){
                $("#deptChangeEdit").dialog("close");//关闭弹出框
            });

            //撤销部门
            $("#undoDept").click(function(){ //
                var rows = $("#mainGrid").treegrid("getSelections");
                if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要撤销的机构!",
                        title:"提示"
                    })
                }else if(rows.length == 1){

                    var blnResult=false;
                    var options = { type:"post",url:"/space/dept/isCanUndoDept.html", data:{ id:rows[0].id},
                        async:false,success:function(data){
                            var message="";
                            switch (parseInt(data)){
                                case 1:
                                    message="此机构还包含未撤销的下级机构，不允许撤销!";
                                    break;
                                case 2:
                                    message="此机构还包含岗位关系，不允许撤销!";
                                    break;
                                case 3:
                                    message="此机构还包含人员，不允许撤销!";
                                    break;
                            }
                            if(message!=""){
                                $.messager.show({
                                    msg:message,
                                    title:"提示"
                                });
                                blnResult=false;//不符合条件
                            }else{
                                blnResult=true;//通过校验
                            }
                        }
                    };
                    $.ajax(options);//发送验证请求

                    if(blnResult){
                        $("#undoDeptEdit").dialog({
                            title: "撤销机构",
                            height:180,
                            width:300,
                            closed: false,
                            cache: false,
                            modal: true
                        });
                        $("#undoDeptForm").css("display","block");

                        //获取当前日期
                        var currDate = new Date();
                        var currMonth =  parseInt(currDate.getMonth())+1;
                        currDate = currDate.getFullYear()+"-"+currMonth+"-"+currDate.getDate();

                        $("#undoDeptForm").form("load",{
                            undoDeptId:rows[0].id,
                            undoCanceldate:currDate
                        })
                    }
                }
            });

            //撤销部门窗口的 保存
            $("#undoDept_ok").click(function(){
                $.messager.confirm("请确认", "您确定要撤销所选机构吗?", function(result) {
                    if (result) {
                        $("#undoDeptForm").form("submit",{
                            url: "/space/dept/undoDept.html",
                            onSubmit:function(){
                                return $("#undoDeptForm").form("validate");
                            },
                            success:function(data){
                                if(parseInt(data) == 1){
                                    $("#undoDeptEdit").dialog("close");//关闭弹出框
                                    showUndoDept();
                                    $.messager.show({
                                        msg:"操作成功!",
                                        title:"提示"
                                    })
                                }else{
                                    $.messager.show({
                                        msg:"操作失败!",
                                        title:"提示"
                                    })
                                }

                            }
                        })
                    }
                });
            });

            //撤销部门窗口的 取消
            $("#undoDept_cancel").click(function(){
                $("#undoDeptEdit").dialog("close");//关闭弹出框
            });

            //反撤销部门
            $("#redoDept").click(function(){
                var rows = $("#mainGrid").treegrid("getSelections");
                if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要反撤销的机构。",
                        title:"提示"
                    })
                }else{
                    var blnResult=false;
                    var options = { type:"post",url:"/space/dept/isParentDeptUndo.html", data:{ parentid:rows[0].parentid},
                        async:false,success:function(data){
                            if(parseInt(data) == 1){
                                $.messager.show({
                                    msg:"请先选择上级机构进行反撤销操作!",
                                    title:"提示"
                                });
                                blnResult=false;//请先选择上级机构进行反撤销操作
                            }else{
                                blnResult=true;
                            }
                        }
                    };
                    $.ajax(options);//发送验证请求

                    if(!blnResult){
                        return;
                    }

                    var options1 = { type:"post",url:"/space/dept/isHaveSubDept.html", data:{ id:rows[0].id},
                        async:false,success:function(data){
                            if(parseInt(data) == 1){
                                $.messager.confirm("请确认", "存在下属机构，您确定要一并反撤销吗？", function(result) {
                                    if(result){
                                        redoDept(rows[0].id,rows[0].ancestorids);
                                    }
                                });

                            }else{
                                $.messager.confirm("请确认", "您确定要反撤销所选机构吗？", function(result) {
                                    if (result) {
                                        redoDept(rows[0].id,rows[0].ancestorids);
                                    }
                                });

                            }
                        }
                    };
                    $.ajax(options1);//发送验证请求
                }
            });

            //岗位关系
            $("#jobRelation").click(function(){

            });

            //机构界面中的 显示撤销部门 文字点击
            $("#lblShowUndoDept").click(function(){
                var bln = !$("#showUndoDept").is(":checked");
                $("#showUndoDept").attr("checked",bln);
                showUndoDept();
            });

            //编辑机构界面中的保存并新增 文字点击
            $("#lblSaveAndAdd").click(function(){
                var bln = !$("#saveAndAdd").is(":checked");
                $("#saveAndAdd").attr("checked",bln);
            });



        });

        function redoDept(id,ancestorids){
            $.post("/space/dept/redoDept.html",{ id:id,ancestorids:ancestorids},function(data){
                if (parseInt(data) == 1) {
                    $("#mainGrid").treegrid("unselectAll");
                    showUndoDept();
                    $.messager.show({
                        title:"提示",
                        msg:"反撤销机构成功！"
                    });
                } else {
                    $.messager.show({
                        msg:"反撤销机构失败!",
                        title:"提示"
                    });
                }
            },"text");
        }
        //显示撤销机构的控制函数
        function showUndoDept(){
            if($("#showUndoDept").is(":checked")){
                $.post("/space/dept/findAll.html",{ status:1},function(data){
                    $("#mainGrid").treegrid("loadData",data);
                },'json');
            }
            else{
                $.post("/space/dept/findAll.html",{ },function(data){
                    $("#mainGrid").treegrid("loadData",data);
                },'json');
            }
        }

    </script>
</head>
  
<body style="padding:10px;">

    <table id="mainGrid"></table>

    <div id="tb" style="padding:5px;height:auto">
        <div style="margin-bottom:5px">
            <a id="addNew" href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-add" plain="true">增加</a>
            <a id="modify"  href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-edit" plain="true">修改</a>
            <a  id="delete" href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-remove" plain="true">删除</a>
            <a  id="changeDept" href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-cut" plain="true">移动合并</a>

            <a  id="undoDept"  href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-undo" plain="true">撤销</a>
            <a  id="redoDept" style="display: none;" href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-redo" plain="true">反撤销</a>

            <a  id="jobRelation" href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-tip" plain="true">岗位关系</a>

            <table style="display:inline-block ;margin-left: 10px;padding: 0px;" cellpadding="0px">
                <tr>
                    <td><input id="showUndoDept" type="checkbox"  style="vertical-align: middle;cursor: pointer;" onclick="showUndoDept()"/></td>
                    <td><label id="lblShowUndoDept" style="vertical-align: middle;cursor: pointer;" >显示撤销机构</label></td>
                </tr>
            </table>
        </div>
    </div>

    <!--弹出的新增或修改界面 -->
    <div id="mainEditor">
            <form id="dataform" class="easyui-form"  method ="post" enctype="multipart/form-data" style="display:none; padding-left: 10px; padding-top: 10px; ">
                <input type="hidden" id="id" name="id">
                <input type="hidden" id="parentid"  name="parentid">
                <input type="hidden" name="ancestorids">
                <input type="hidden" name="level">

                <table>
                    <tr><td>机构名称：</td><td><input id="name" name="name" type="text" style="width:180px;"/></td></tr>
                    <tr><td>负责人：</td><td>
                        <select id="managerid" name="managerid" class="easyui-combogrid" style="width: 185px;"
                                data-options="panelWidth:335,idField:'id',textField:'name',url:'/space/employee/findAllForPersonEdit.html',
                                    columns:[[
                                        { field:'id',title:'id',hidden:true},
                                        { field:'name',title:'姓名',width:80},
                                        { field:'dept',title:'部门',width:145},
                                         { field:'job',title:'岗位',width:80}
                                    ]],fitColumns:true"
                                > </select>
                    </td></tr>
                    <tr><td>备注：</td><td><textarea id="remark" name="remark" style="width: 180px;height: 60px; resize:none;"></textarea></td></tr>
                    <tr align="right" >
                        <td  colspan="2">
                            <table id="tableSaveAndAdd" cellpadding="0px" ><tr>
                                <td>
                                    <input type="checkbox" id="saveAndAdd" style="cursor: pointer;vertical-align:middle;">
                                </td>
                                <td>
                                    <label id="lblSaveAndAdd" style="cursor: pointer;vertical-align:middle;" >保存并新增</label>
                                </td></tr></table>

                        </td>
                    </tr>
                    <tr align="center" >
                        <td colspan="2" style="padding-top: 10px; padding-left: 10px;">
                            <a id="form_ok" class="easyui-linkbutton" iconCls="icon-save">保存</a>
                            <a id="form_cancel" class="easyui-linkbutton" iconCls="icon-cancel">取消</a>
                        </td>
                    </tr>
                </table>
            </form>
    </div>

    <!--弹出的移动合并界面 -->
    <div id="deptChangeEdit">
        <form id="deptChangeForm" class="easyui-form"  method ="post" enctype="multipart/form-data" style="display:none; padding-left: 10px; padding-top: 10px; ">
            <input id="originalAncestorids" name="originalAncestorids" type="hidden"/>
            <input id="originalParentid" name="originalParentid" type="hidden"/>
            <table>
                <tr><td>原机构：</td>
                    <td><select id="originalDeptid" name="originalDeptid" class="easyui-combogrid" style="width: 180px;"
                                data-options="panelWidth:280,url:'/space/dept/findAll.html',idField:'id',textField:'name',
                                    columns:[[
                                        { field:'id',title:'id',hidden:true},
                                        { field:'name',title:'名称',width:150},
                                        { field:'employeename',title:'负责人',width:80}
                                    ]]">
                    </select></td>
                </tr>
                <tr><td>操作：</td>
                    <td>
                        <select id="operateType" name="operateType" style="width: 180px;">
                            <option value="1">移动至</option>
                            <option value="2">合并至</option>
                        </select>
                    </td>
                </tr>
                <tr><td>目标机构：</td>
                    <td><select id="destinationDeptid" name="destinationDeptid" class="easyui-combogrid" style="width: 180px;"
                                data-options="panelWidth:280,url:'/space/dept/findAll.html',idField:'id',textField:'name',
                                    columns:[[
                                        { field:'id',title:'id',hidden:true},
                                        { field:'name',title:'名称',width:150},
                                        { field:'employeename',title:'负责人',width:80}
                                    ]]">
                    </select></td>
                </tr>

                <tr align="center" >
                    <td colspan="2" style="padding-top: 10px; padding-left: 10px;">
                        <a id="deptChange_ok" class="easyui-linkbutton" iconCls="icon-save">保存</a>
                        <a id="deptChange_cancel" class="easyui-linkbutton" iconCls="icon-cancel">取消</a>
                    </td>
                </tr>
            </table>
        </form>
    </div>


    <!--弹出的撤销 界面 -->
    <div id="undoDeptEdit">
        <form id="undoDeptForm" class="easyui-form"  method ="post" enctype="multipart/form-data" style="display:none; padding-left: 10px; padding-top: 10px; ">
            <input id="undoDeptId" name="undoDeptId" type="hidden">
            <input id="status" name="status" type="hidden" value="2">
            <table>
                <tr>
                    <td>撤销日期:</td>
                    <td><input id="undoCanceldate" name="undoCanceldate" type="text" class="easyui-datebox"/></td>
                </tr>

                <tr align="center" >
                    <td colspan="2" style="padding-top: 10px; padding-left: 10px;">
                        <a id="undoDept_ok" class="easyui-linkbutton" iconCls="icon-save">保存</a>
                        <a id="undoDept_cancel" class="easyui-linkbutton" iconCls="icon-cancel">取消</a>
                    </td>
                </tr>
            </table>
        </form>
    </div>

    <!--弹出的岗位关系界面 -->
    <div id="deptJobRelationEdit">
        <form id="deptJobRelationForm" class="easyui-form"  method ="post" enctype="multipart/form-data" style="display:none; padding-left: 10px; padding-top: 10px; ">

            <table id="deptjobtable">
                <tr>
                    <td><input type="checkbox" /></td>

                </tr>
                <tr align="center" >
                    <td colspan="2" style="padding-top: 10px; padding-left: 10px;">
                        <a id="deptJobRelation_ok" class="easyui-linkbutton" iconCls="icon-save">保存</a>
                        <a id="deptJobRelation_cancel" class="easyui-linkbutton" iconCls="icon-cancel">取消</a>
                    </td>
                </tr>
            </table>
        </form>
    </div>

</body>
</html>
