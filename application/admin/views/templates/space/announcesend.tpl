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

    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/xheditor/1.1.14/xheditor-zh-cn.min.js"></script>
    <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/xheditor/1.1.14/xheditor_skin/default/ui.css">

    <style type="text/css">

        table.announcetbl{

        }
        table.announcetbl td{
            padding: 3px;
        }

        label.red{
            color: red;
        }

    </style>

    <script type="text/javascript">

        var editor;

        $(document).ready(function(){

            editor = $('#content').xheditor( { tools:'full',skin:'default'});

            $("#mainGrid").datagrid({
                title:"公告信息",
                url:"/space/announcesend/findSome.html",
                toolbar:"#tb",
                sortName:"id",
                sortOrder:"desc",
                idField:"id",
                nowrap:true,
                striped:true,
                singleSelect:true,
                pagination:true,
                pageNumber:1,
                pageSize: 10,//每页显示的记录条数，默认为10
                pageList: [5,10,15],//可以设置每页记录条数的列表
                frozenColumns:[[
                    { field:"ck",checkbox:true},
                    { field:"id",title:"ID",sortable:true}
                ]],
                columns:[[
                    { field:"title",title:"公告标题"},
                    { field:"employeename",title:"发布人"},
                    { field:"status",title:"状态",
                        formatter:function(value){
                            switch (parseInt(value)){
                                case 0:
                                    return "草稿";
                                case 1:
                                    return "已发布";
                                case 2:
                                    return "撤销";
                                default:
                                    return "";
                            }
                        },styler:function(value,row,index){
                        if(value=="2"){
                            return 'background-color:red;color:white;';
                        }
                        else if (value=="0"){
                            return 'background-color:green;color:white;';
                        }
                    }
                    },
                    { field:"createtime",title:"发布时间"}
                ]]
            });

            $("#mainGrid").datagrid({
                onClickRow:function(rowIndex, rowData){
                    if(rowData.status == 1){ //已发布
                        $("#undoAnnounce").css("display","inline-block");
                        $("#sendAnnounce").css("display","none");
                    }
                    else{ //已撤销公告 或 草稿箱公告
                        $("#undoAnnounce").css("display","none");
                        $("#sendAnnounce").css("display","inline-block");
                    }
                }
            })

            //修改
            $("a[iconCls='icon-edit']").click(function(){
                var rows = $("#mainGrid").datagrid("getSelections");

               if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要修改的记录。",
                        title:"提示"
                    })
                }else if(rows.length == 1){
                    //从数据库中重新获得这个公告的信息
                    $.post("/space/announcesend/findOne.html",{ id:rows[0].id},function(jsonData){

                        if(jsonData==null){
                            $.messager.show({
                                msg:"此记录已不存在！",
                                title:"提示"
                            });
                        }else{
                            $("#griddiv").css("display","none");
                            $("#addAnnounceForm").css("display","block");

                            $("#announceid").val( rows[0].id );
                            $("#announcetype ").combobox("select",jsonData.typeid);
                            $("#title").val(jsonData.title);
                            editor.setSource(jsonData.content);

                            if( jsonData.isallowcomment == "1"){
                                $("#rdo1").attr("checked","checked");
                                $("#rdo0").removeAttr("checked");
                            }
                            else{
                                $("#rdo0").attr("checked","checked");
                                $("#rdo1").removeAttr("checked");
                            }
                            $("#signname").val(jsonData.signname);
                            $("#status").val(jsonData.status);

                            $('#announceSend').css("display","none");
                            $("#announceSave").linkbutton({ text:"更新"});
                        }
                    },"json");

                }

            });

            //删除选中的公告
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
                            $.post("/space/announcesend/delete.html",{ id:rows[0].id},function(data){
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



            //新建公告
            $("a[iconCls='icon-add']").click(function(){

               $("#griddiv").css("display","none");
                $("#addAnnounceForm").css("display","block");

                $('#announceSend').css("display","inline-block");
                $("#announceSave").linkbutton({ text:"存草稿"});

                $("#announceid").val("");
                $("#title").val("");
                $("#content").val("");

                $("#rdo1").attr("checked","checked");
                $("#rdo0").removeAttr("checked");

                $("#signname").val("");

            });

            //撤销公告
            $("#undoAnnounce").click(function(){ //
                var rows = $("#mainGrid").datagrid("getSelections");
                if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要撤销的公告!",
                        title:"提示"
                    })
                }else if(rows.length == 1){
                    $.post("/space/announcesend/undoAnnounce.html",{ announceid:rows[0].id},function(data){
                        if (parseInt(data) == 0) {
                            $("#mainGrid").datagrid("unselectAll");
                            $("#mainGrid").datagrid("reload");
                            $.messager.show({
                                title:"提示",
                                msg:"撤销成功！"
                            });
                        } else {
                            $.messager.show({
                                msg:"撤销失败!",
                                title:"提示"
                            });
                        }
                    },"text");
                }
            });

            //发布公告
            $("#sendAnnounce").click(function(){ //
                var rows = $("#mainGrid").datagrid("getSelections");
                if(rows.length == 0){
                    $.messager.show({
                        msg:"请选择要发布的公告!",
                        title:"提示"
                    })
                }else if(rows.length == 1){
                    $.post("/space/announcesend/sendAnnounce.html",{ announceid:rows[0].id},function(data){
                        if (parseInt(data) == 0) {
                            $("#mainGrid").datagrid("unselectAll");
                            $("#mainGrid").datagrid("reload");
                            $.messager.show({
                                title:"提示",
                                msg:"发布成功！"
                            });
                        } else {
                            $.messager.show({
                                msg:"发布失败!",
                                title:"提示"
                            });
                        }
                    },"text");
                }
            });

        });

        //发布新建公告
        function sendAnnounce(){
            addAnnounce(1);
        }
        //新建公告 存草稿
        function saveAnnounce(){
            var announceid = $("#announceid").val();
            if(announceid == ""){ //ID为空，证明为新增公告，此操作为存草稿
                  addAnnounce(0);
            }
            else{ //ID不为空，证明为修改公告，此操作为更新操作
                addAnnounce($("#status").val() );
            }
        }
        //保存公告
        function addAnnounce(status){

            editor.getSource();//执行此句代码 才能取得公告的内容

            $("#status").val(status); //公告状态(0草稿、1已发布、2撤销)
            var isallowcomment=$('input:radio[name="iscomment"]:checked').val();
            $("#isallowcomment").val(isallowcomment);

            $("#addAnnounceForm").form("submit",{
                url: "/space/announcesend/saveOrUpdate.html",
                onSubmit:function(){
                    if(!$(this).form("validate")){
                        return false;//form 表单验证失败
                    }
                },
                success:function(data){
                    if(parseInt(data) == 0){

                        $("#addAnnounceForm").css("display","none");
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
            })
        }

        //预览新建公告
        function previewAnnounce(){

           var content = editor.getSource();//执行此句代码 才能取得公告的内容

            $("#contentinfo").html(content);
            $("#previewdiv").dialog({
                title: "预览公告",
                height:400,
                width:600,
                closed: false,
                cache: false,
                modal: true
            });
            $("#contentinfo").css("display","break");

        }

        //取消新建公告
        function cancelAdd(){
            $("#addAnnounceForm").css("display","none");
            $("#griddiv").css("display","block");
        }



    </script>
</head>
  
<body style="padding:10px;">

    <div id="griddiv">
        <table id="mainGrid"></table>

        <div id="tb" style="padding:5px;height:auto">
            <div style="margin-bottom:5px">
                <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-add" plain="true">新建公告</a>
                <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-edit" plain="true">修改公告</a>
                <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-remove" plain="true">删除公告</a>

                <a  id="undoAnnounce"  href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-undo" plain="true">撤销</a>
                <a  id="sendAnnounce" style="display: none;" href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-redo" plain="true">发布</a>


            </div>
        </div>
    </div>

        <div id="addAnnounceDiv">
            <form id="addAnnounceForm" class="easyui-form"  method ="post" style="margin-top: 10px; display: none; ">
                <input type="hidden" id="announceid" name="announceid">
                <input type="hidden" id="status" name="status">
                <input type="hidden" id="isallowcomment" name="isallowcomment">
                <table class="announcetbl">
                    <tr>
                        <td><label style="color: red;">*</label> 分类:
                            <select name="announcetype" id="announcetype" class="easyui-combobox" style="width: 150px;" editable = false >
                                {foreach from=$typeList item=type}
                                    <option value="{$type->id}">{$type->name}</option>
                                {/foreach}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td><label class="red">*</label> 标题: <input id="title" name="title" style="width:586px;"/></td>
                    </tr>
                    <tr>
                        <td><label class="red">*</label> 内容:
                            <textarea class="xheditor" id="content" name="content" rows="6" style="width:590px;height:260px"></textarea>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            &nbsp &nbsp评论: <input id="rdo1" type="radio" name="iscomment" checked="checked" value="1">允许评论<input id="rdo0" type="radio" name="iscomment" value="0">禁止评论
                            <label style="margin-left: 232px;">落款名称：</label><input id="signname" name="signname"/>
                        </td>
                    </tr>
                    <tr align="center" >
                        <td colspan="2">
                            <a id="announceSend" onclick="sendAnnounce()"  class="easyui-linkbutton" iconCls="icon-ok">发布</a>
                            <a id="announceSave" onclick="saveAnnounce()" class="easyui-linkbutton" iconCls="icon-save">存草稿</a>
                            <a id="announcePreview"  onclick="previewAnnounce()" class="easyui-linkbutton" iconCls="icon-print">预览</a>
                            <a id="announceCancel" onclick="cancelAdd()" class="easyui-linkbutton" iconCls="icon-cancel">取消</a>
                        </td>
                    </tr>
                </table>
            </form>
        </div>

        <div id="previewdiv">
                <div id="contentinfo" ></div>
        </div>
</body>
</html>
