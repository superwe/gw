        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="stylesheet" type="text/css" href="/css/reset.css" />
        <link rel="stylesheet" type="text/css" href="/css/home.css" />
        <link rel="stylesheet" type="text/css" href="/css/grid.css" />

        <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/default/easyui.css">
        <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/icon.css">
        <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
        <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/jquery.easyui.min.js"></script>
        <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/locale/easyui-lang-zh_CN.js"></script>


        <style type="text/css">

            table.grouptbl{

            }
            table.grouptbl td{
                padding: 3px;
            }

            label.red{
                color: red;
            }

        </style>

        <script type="text/javascript">

        $(document).ready(function(){

            $("#mainGrid").datagrid({
                title:"群组信息",
                url:"/space/group/findSome.html",
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
                    { field:"name",title:"群组名称"},
                    { field:"messagenum",title:"会话数"},
                    { field:"employeenum",title:"成员数"},
                    { field:"employeename",title:"管理员"}
                ]]
            });


            //新建群组
            $("a[iconCls='icon-add']").click(function(){

                $("#griddiv").css("display","none");
                $("#addGroupForm").css("display","block");

                $("#groupid").val("");
                $("#ispublic").val("");
                $("#grade").val("");

                $("#public").attr("checked","checked");
                $("#notpublic").removeAttr("checked");

                $("#name").val("");
                $("#description").val("");
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
                    //从数据库中重新获得这个群组的信息
                    $.post("/space/group/findOne.html",{ id:rows[0].id},function(jsonData){

                        if(jsonData==null){
                            $.messager.show({
                                msg:"此记录已不存在！",
                                title:"提示"
                            });
                        }else{
                            $("#griddiv").css("display","none");
                            $("#addGroupForm").css("display","block");

                            $("#groupid").val(rows[0].id);
                            $("#name").val(jsonData.name);
                            $("#description").val(jsonData.description);

                            if( jsonData.ispublic == "1"){
                                $("#public").attr("checked","checked");
                                $("#notpublic").removeAttr("checked");
                            }
                            else{
                                $("#notpublic").attr("checked","checked");
                                $("#public").removeAttr("checked");
                            }

                            if(jsonData.grade == "1"){
                                $("#gradechk").checked = true;
                            }
                            else{
                                $("#gradechk").checked = false;
                            }

                        }
                    },"json");

                }

            });

            //删除选中的群组
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
                            $.post("/space/group/delete.html",{ id:rows[0].id},function(data){
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
        })

        //保存群组
        function saveGroup(){

            var ispublic=$('input:radio[name="ispublic"]:checked').val();//是否公开 0私密  1公开
            $("#ispublic").val(ispublic);

            if($("#gradechk").attr("checked")==true){
                $("#grade").val("1"); //0  不需要审核  1需要审核
            }
            else{
                $("#grade").val("0");
            }

            $("#addGroupForm").form("submit",{
                url: "/space/group/saveOrUpdate.html",
                onSubmit:function(){
                    if(!$(this).form("validate")){
                        return false;//form 表单验证失败
                    }
                },
                success:function(data){
                    if(parseInt(data) == 0){

                        $("#addGroupForm").css("display","none");
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

        //取消新建群组
        function cancel(){
            $("#addGroupForm").css("display","none");
            $("#griddiv").css("display","block");
        }



        </script>
        </head>

        <body style="padding:10px;">

        <div id="griddiv">
            <table id="mainGrid"></table>

            <div id="tb" style="padding:5px;height:auto">
                <div style="margin-bottom:5px">
                    <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-add" plain="true">创建群组</a>
                    <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-edit" plain="true">修改群组</a>
                    <a href="javascript:void(0)" class="easyui-linkbutton" iconCls="icon-remove" plain="true">删除群组</a>
                </div>
            </div>
        </div>

        <div id="addGroupDiv">
            <form id="addGroupForm" class="easyui-form"  method ="post" style="margin-top: 10px;  display: none;">
                <input type="hidden" id="groupid" name="groupid">
                <input type="hidden" id="grade" name="grade">
                <input type="hidden" id="ispublic" name="ispublic">
                <table class="grouptbl">
                    <tr>
                        <td>群组名称: <input type="text" id="name" name="name"></td>
                    </tr>
                    <tr>
                        <td>群组简介:
                            <textarea  id="description" name="description" rows="3" ></textarea>
                        </td>
                    </tr>
                    <tr>
                        <td>群组LOGO:
                            <image ></image>  <input type="button" class="button blueButton" value="上传" id="uploadLogo">
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input type="radio" id="public" name="ispublic" value="1">公开--任何成员都可以查看和参与此内容 <br/>
                            &nbsp&nbsp&nbsp&nbsp&nbsp<input type="checkbox" id="gradechk">新成员加入需要我审核 <br/>
                            <input type="radio" id="notpublic"  name="ispublic" value="0">私密--新成员需得到批准或受到邀请才可加入，只有成员才可以浏览和参与
                        </td>
                    </tr>

                    <tr>
                        <td>管理员:<input type="text" id="manager" name="manager"></td>
                    </tr>
                    <tr>
                        <td>&nbsp&nbsp成员:<input type="text" id="employee" name="employee"></td>
                    </tr>

                    <tr align="center" >
                        <td colspan="2">
                            <a id="groupSave" onclick="saveGroup()"  class="easyui-linkbutton" iconCls="icon-ok">保存</a>
                            <a id="groupCancel" onclick="cancel()" class="easyui-linkbutton" iconCls="icon-cancel">取消</a>
                        </td>
                    </tr>
                </table>
                <div style="margin-top: 20px;margin-left: 10px;">
                    <p style="margin: 10px 0px;font-weight: bold;">群组定义</p>
                    <p style="margin-bottom: 10px;font-weight: bold;">全体成员</p>
                    <p>"全体成员"是系统的一个默认群组，所有注册成员默认加入"全体成员"群组，此群组为公开群组，且不得退出该群组。</p>
                    <p style="margin: 10px 0px;font-weight: bold;">公开群组</p>
                    <p>网络内的任何成员都可以查看和参与此内容，管理员可以设置新成员加入是否需要审核。</p>
                    <p style="margin: 10px 0px;font-weight: bold;">私密群组</p>
                    <p>新成员需要得到批准或受到邀请才可以加入，只有本群组成员才可以浏览和参与内容。</p>
                </div>
            </form>


        </div>


        </body>
        </html>
