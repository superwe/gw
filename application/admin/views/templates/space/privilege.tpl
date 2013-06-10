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
    <script type="text/javascript">
        var IDMark_Switch = "_switch";
        var IDMark_Icon = "_ico";
        var IDMark_Span = "_span";
        var IDMark_Input = "_input";
        var IDMark_Check = "_check";
        var IDMark_Edit = "_edit";
        var IDMark_Remove = "_remove";
        var IDMark_Ul = "_ul";
        var IDMark_A = "_a";
        function addDiyDom(treeId, node) {
            var aObj = $("#" + node.tId + IDMark_A);
            var editStr = "&nbsp;&nbsp<a href='#' iconClass='add' nodeid='"+node.id+"' parentid='"+node.parentid+"'>添加子项</a>";
            editStr = editStr+"&nbsp;&nbsp<a href='#' iconClass='edit' nodeid='"+node.id+"' parentid='"+node.parentid+"'>修改</a>";
            if(node.isleaf==1)
                editStr = editStr+"&nbsp;&nbsp<a href='#' iconClass='remove' nodeid='"+node.id+"' parentid='"+node.parentid+"'>删除</a>";
            aObj.append(editStr);
            //添加
            $("a[iconClass='add']").click(function(){
                var parentid = parseInt($(this).attr("nodeid"));
                {literal}
                $.post("/space/privilege/findOne.html",{id:parentid},function(jsonData){
                    if(jsonData==null){
                        $.messager.show({
                            msg:"此权限已不存在！",
                            title:"提示"
                        });
                    }else{
                        $("#mainEditor").dialog({
                            title: "添加权限",
                            height:200,
                            width:300,
                            closed: false,
                            cache: false,
                            modal: true
                        });
                        $("#dataform").css("display","block");
                        $("#dataform").form("load",{
                            id : "",
                            parentid:jsonData.id,
                            ancestorids:jsonData.ancestorids+jsonData.id+"|",
                            ancestornames:jsonData.name,
                            name:"",
                            level:parseInt(jsonData.level)+1,
                            sortvalue:0,
                            isleaf:1,
                            url:jsonData.url
                        });
                    }
                },"json");
                {/literal}
            });
            //修改
            $("a[iconClass='edit']").click(function(){
                var id = parseInt($(this).attr("nodeid"));
                {literal}
                    $.post("/space/privilege/findOne.html",{id:id},function(jsonData){
                        var ancestornames=jsonData.name;
                        var name=jsonData.name;
                        var index=jsonData.name.lastIndexOf('/');
                        if(index!=-1){
                            ancestornames=jsonData.name.substr(0,index);
                            name=jsonData.name.substr(index+1);
                        }
                        if(jsonData==null){
                            $.messager.show({
                                msg:"此权限已不存在！",
                                title:"提示"
                            });
                        }else{
                            $("#mainEditor").dialog({
                                title: "修改权限",
                                height:200,
                                width:300,
                                closed: false,
                                cache: false,
                                modal: true
                            });
                            $("#dataform").css("display","block");
                            $("#dataform").form("load",{
                                id : jsonData.id,
                                parentid:jsonData.parentid,
                                ancestorids:jsonData.ancestorids,
                                ancestornames:ancestornames,
                                name:name,
                                level:jsonData.level,
                                sortvalue:jsonData.sortvalue,
                                isleaf:jsonData.isleaf,
                                url:jsonData.url
                            });
                        }
                    },"json");
                {/literal}
            });
            //删除
            $("a[iconClass='remove']").click(function(){
                var id = parseInt($(this).attr("nodeid"));
                var parentid = parseInt($(this).attr("parentid"));
                $.messager.confirm("请确认", "您要删除当前所选权限吗？", function(result) {
                    if (result) {
                    {literal}
                        $.post("/space/privilege/delete.html",{id:id,parentid:parentid},function(data){
                            if (parseInt(data) == 0) {
                                $.messager.show({
                                    title:"提示",
                                    msg:"删除权限成功！"
                                });
                                $("#tree").empty();
                                loadtree();
                            } else {
                                $.messager.show({
                                    msg:"删除权限失败!",
                                    title:"提示"
                                });
                            }
                        },"text");
                    {/literal}
                    }
                });
            });
        }

        function loadtree(){
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
                view: {
                    addDiyDom: addDiyDom,
                    expandSpeed: "fast",
                    selectedMulti:false,
                    showIcon:true,
                    showLine:true,
                    showTitle:true
                }
            };
        {literal}
            $.post("/space/privilege/findAll.html",function(jsonData){
                for(var i=0;i<jsonData.length;i=i+1){
                    var name=jsonData[i].name;
                    var index=name.lastIndexOf('/');
                    if(index!=-1)
                        jsonData[i].name=name.substr(index+1);
                    jsonData[i].ancestornames=name.substr(0,index);
                    if(jsonData[i].isleaf!=1)
                        jsonData[i].open=true;
                }
                $.fn.zTree.init($("#tree"),setting,jsonData);
            },"json");
        {/literal}
        }

        $(document).ready(function(){

            loadtree();

            //新增和编辑界面 form 验证
            $("#name").validatebox({
                required:true,
                missingMessage:"名称不能为空！"
            });
            $("#sortValue").validatebox({
                required:true,
                missingMessage:"排序值不能为空！"
            });
            $("#form_ok").click(function(){
                $("#dataform").form("submit",{
                    url: "/space/privilege/saveOrUpdate.html",
                    onSubmit:function(){
                        return $(this).form("validate");
                    },
                    success:function(data){
                        if(parseInt(data) == 0){
                            $("#mainEditor").dialog("close");//关闭弹出框
                            $.messager.show({
                                msg:"保存权限成功!",
                                title:"提示"
                            })
                            $("#tree").empty();
                            loadtree();
                        }else{
                            $.messager.show({
                                msg:"保存权限失败!",
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

<ul id="tree" class="ztree"></ul>
<!--弹出的新增或修改界面 -->
<div id="mainEditor">
    <form id="dataform" class="easyui-form"  method ="post" style="display:none; padding-left: 10px; padding-top: 10px; ">
        <input type="hidden" name="id" />
        <input type="hidden" name="parentid"/>
        <input type="hidden" name="ancestorids"/>
        <input type="hidden" name="ancestornames"/>
        <input type="hidden" name="level"/>
        <input type="hidden" name="isleaf"/>
        <table>
            <tr><td width="50">名称：</td><td><input id="name" name="name" type="text"/></td></tr>
            <tr><td>URL</td><td><input type="text" id="url" name="url" /></td></tr>
            <tr><td>排序值</td><td><input type="text" id="sortvalue" name="sortvalue"/></td></tr>
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
