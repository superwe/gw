<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/home.css" />

    <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/default/easyui.css">
    <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/icon.css">
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/jquery.easyui.min.js"></script>
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/locale/easyui-lang-zh_CN.js"></script>

    <script type="text/javascript" src="http://cdn.qiater.com/js/swfupload/swfupload.js"></script>
    <script type="text/javascript" src="http://cdn.qiater.com/js/swfupload/swfupload.queue.js"></script>
    <script type="text/javascript" src="http://cdn.qiater.com/js/swfupload/fileprogress.js"></script>
    <script type="text/javascript" src="http://cdn.qiater.com/js/swfupload/handlers.js"></script>
    <style type="text/css">

        table.adtbl{ }
        table.adtbl td{
            padding: 5px;
        }

        label.red{
            color: red;
        }

    </style>

    <script type="text/javascript">

        $(document).ready(function(){

            $("#mainGrid").datagrid({
                title:"广告信息",
                url:"/space/advertisement/findAll.html",
                toolbar:"#tb",
                sortName:"id",
                sortOrder:"asc",
                idField:"id",
                nowrap:true,
                striped:true,
                singleSelect:true,
                pagination:false,
                frozenColumns:[[
                    { field:"ck",checkbox:true},
                    { field:"id",title:"ID",sortable:true}
                ]],
                columns:[[
                    { field:"title",title:"广告标题"},
                    { field:"location",title:"页面位置",
                        formatter:function(value){
                            switch (parseInt(value)){
                                case 1:
                                    return "首页";
                                default:
                                    return "";
                            }
                        }
                    },
                    { field:"isvalid",title:"有效性",
                        formatter:function(value){
                            switch (parseInt(value)){
                                case 0:
                                    return "无效";
                                case 1:
                                    return "有效";
                                default:
                                    return "";
                            }
                        }
                    },
                    { field:"createtime",title:"创建时间"}
                ]]
            });

            //新建广告
            $("a[iconCls='icon-add']").click(function(){

               $("#griddiv").css("display","none");
                $("#addAdForm").css("display","block");

                $("#adid").val("");
                $("#isvalid").val("");
                $("#openway").val("");
                $("#title").val("");
                $("#location").val("1");

                $("#valid1").attr("checked","checked");//是否有效默认为有效
                $("#valid0").removeAttr("checked");

                $("#image").val("");
                $("#imagelink").val("");

                $("#way2").attr("checked","checked");//链接打开方式 默认为 新页面打开
                $("#way1").removeAttr("checked");

                $("#replacetext").val("");
                $("#issystem").val("0");//新增都为自定义广告 默认为0
            });

            //修改
            $("a[iconCls='icon-edit']").click(function(){
                var rows = $("#mainGrid").datagrid("getSelections");

                if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要修改的记录。",
                        title:"提示"
                    })
                }else if(rows.length == 1){
                    //从数据库中重新获得这个广告的信息
                    $.post("/space/advertisement/findOne.html",{ id:rows[0].id},function(jsonData){

                        if(jsonData==null){
                            $.messager.show({
                                msg:"此记录已不存在！",
                                title:"提示"
                            });
                        }else{
                            $("#griddiv").css("display","none");
                            $("#addAdForm").css("display","block");

                            $("#adid").val( rows[0].id );
                            $("#imageurl").val(jsonData.imageurl);
                            $("#title").val(jsonData.title);
                            $("#location").combobox("select",jsonData.location);

                            $("#image").val(jsonData.imageurl);

                            $("#imagelink").val(jsonData.imagelink);
                            if( jsonData.isvalid == "1"){
                                $("#valid1").attr("checked","checked");
                                $("#valid0").removeAttr("checked");
                            }
                            else{
                                $("#valid0").attr("checked","checked");
                                $("#valid1").removeAttr("checked");
                            }

                            if( jsonData.openway == "1"){ //在本网页打开
                                $("#way1").attr("checked","checked");
                                $("#way2").removeAttr("checked");
                            }
                            else{ //在新网页打开
                                $("#way2").attr("checked","checked");
                                $("#way1").removeAttr("checked");
                            }
                            $("#replacetext").val(jsonData.replacetext);
                            $("#issystem").val(jsonData.issystem);
                        }
                    },"json");

                }

            });

            //删除选中的广告
            $("a[iconCls='icon-remove']").click(function(){
                var ids = [];
                var rows = $("#mainGrid").datagrid("getSelections");
                if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要删除的记录。",
                        title:"提示"
                    })
                }else{
                    $.messager.confirm("请确认", "您确定要删除选中记录吗？", function(result) {
                        if (result) {
                            $.post("/space/advertisement/delete.html",{ id:rows[0].id},function(data){
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


        });

        //保存新建广告
        function saveAd(){
            var isvalid=$('input:radio[name="valid"]:checked').val();
            $("#isvalid").val(isvalid);

            var openway=$('input:radio[name="way"]:checked').val();
            $("#openway").val(openway);

            $("#addAdForm").form("submit",{
                url: "/space/advertisement/saveOrUpdate.html",
                onSubmit:function(){
                    if(!$(this).form("validate")){
                        return false;//form 表单验证失败
                    }
                },
                success:function(data){
                    if(parseInt(data) == 0){

                        $("#addAdForm").css("display","none");
                        $("#griddiv").css("display","block");

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
            });
        }
        //取消新建广告
        function cancelAdd(){
            $("#addAdForm").css("display","none");
            $("#griddiv").css("display","block");
        }

    </script>

</head>
  
<body style="padding:10px;">

    <div id="griddiv">
        <table id="mainGrid"></table>

        <div id="tb" style="padding:5px;height:auto">
            <div style="margin-bottom:5px">
                <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-add" plain="true">新建广告</a>
                <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-edit" plain="true">修改广告</a>
                <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-remove" plain="true">删除广告</a>
            </div>
        </div>
    </div>

        <div id="addAdDiv">
            <form id="addAdForm" class="easyui-form" enctype="multipart/form-data" method ="post" style="margin-top: 10px; display: none; ">
                <input type="hidden" id="adid" name="adid">
                <input type="hidden" id="imageurl" name="imageurl">
                <input type="hidden" id="isvalid" name="isvalid">
                <input type="hidden" id="openway" name="openway">
                <input type="hidden" id="issystem" name="issystem">
                <table class="adtbl">
                    <tr>
                        <td><label class="red">*</label> 广告标题:</td>
                        <td> <input id="title" name="title" style="width:300px;"/></td>
                    </tr>
                    <tr>
                        <td>&nbsp&nbsp广告位置:</td>
                        <td>
                            <select name="location" id="location" class="easyui-combobox" style="width: 150px;" editable = false >
                                <option value="1" selected="selected">首页(600*90)</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>&nbsp&nbsp&nbsp&nbsp有效性:</td>
                        <td>
                            <input type="radio" id="valid1" name="valid" value="1" checked="true">有效
                            <input type="radio" id="valid0" name="valid" value="0" >无效
                        </td>
                    </tr>
                    <tr>
                        <td><label class="red">*</label> 上传图片:</td>
                        <td><input type="file" id="image" name="image"></td>
                    </tr>
                    <tr>
                        <td><label class="red">*</label> 图片链接: </td>
                        <td><input id="imagelink" name="imagelink" style="width:300px;"/></td>
                    </tr>
                    <tr>
                        <td> <label class="red">*</label> 链接打开方式:</td>
                        <td>
                           <input type="radio" id="way1" name="way" value="1">本页面打开
                           <input type="radio" id="way2" name="way" value="2" checked="true">新网页打开
                        </td>
                    </tr>
                    <tr>
                        <td>&nbsp&nbsp图片替换文字:</td>
                        <td><input id="replacetext" name="replacetext" style="width:300px;"/></td>
                    </tr>

                    <tr align="center" >
                        <td colspan="2">
                            <a id="adSend" onclick="saveAd()"  class="easyui-linkbutton" iconCls="icon-ok">提交</a>
                            <a id="adCancel" onclick="cancelAdd()" class="easyui-linkbutton" iconCls="icon-cancel">取消</a>
                        </td>
                    </tr>
                </table>
            </form>
        </div>
</body>
</html>
