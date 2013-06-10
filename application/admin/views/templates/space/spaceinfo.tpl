<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

    <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/default/easyui.css">
    <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/icon.css">
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/jquery.easyui.min.js"></script>
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/locale/easyui-lang-zh_CN.js"></script>

    <style type="text/css">
        table.tbl{ }
        table.tbl td{ padding: 8px; }
        label.red{ color: red; }
        .savebutton{ width: 100px;height:25px;margin-left: 80px;margin-top:30px; text-align: center; }
    </style>

    <script type="text/javascript">
        $(document).ready(function(){

            $("#savespace").click(function(){

                var islogoupdate = $("#logo").val() == "" ? "0" :"1";
                $("#islogoupdate").val(islogoupdate);//企业logo 是否更新
                var istoplogoupdate = $("#toplogo").val() == "" ? "0" :"1";
                $("#istoplogoupdate").val(istoplogoupdate);//顶部logo是否更新

                $("#spaceForm").form("submit",{
                    url:"/space/spaceinfo/saveSpaceInfo.html",
                    onSubmit:function(){
                        if(!$(this).form("validate")){
                            return false;//form 表单验证失败
                        }
                    },
                    success:function(data){
                        if(parseInt(data) == 0){
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
            });
        });
    </script>
</head>

<body>
    <div style="margin-top: 20px; margin-left: 20px;">
        <h3>基础设置</h3>

        <form id="spaceForm" class="easyui-form" enctype="multipart/form-data" method ="post">
            <input type="hidden" id="id" name="id" value="{$space->id}">
            <input type="hidden" id="islogoupdate" name="islogoupdate" >
            <input type="hidden" id="istoplogoupdate" name="istoplogoupdate" >
            <table>
                <tr>
                    <td>&nbsp&nbsp创建时间:</td>
                    <td>{$space->createtime}</td>
                </tr>
                <tr>
                    <td>&nbsp&nbsp邮箱域名:</td>
                    <td>{$space->emaildomain}</td>
                </tr>
                <tr>
                    <td><label class="red">*</label>空间名称:</td>
                    <td><input id="name" name="name" value="{$space->name}"/></td>
                </tr>

                <tr>
                    <td>&nbsp&nbsp空间简介:</td>
                    <td><textarea id="introduce" name="introduce" style="width: 200px;height: 50px;">{$space->introduce}</textarea></td>
                </tr>
                <tr>
                    <td>&nbsp&nbsp企业logo:</td>
                    <td>
                        <img style="width: 120px;height: 120px;" src="{$space->logourl}">
                        <input type="file" id="logo" name ="logo">
                    </td>
                </tr>
                <tr>
                    <td>&nbsp&nbsp顶部logo:</td>
                    <td>
                        <img style="width: 120px;height: 50px;" src="{$space->toplogourl}">
                        <input type="file" id="toplogo" name ="toplogo">
                    </td>
                </tr>
                <tr>
                    <td><label class="red">*</label>企业联系人:</td>
                    <td><input id="contactperson"  name="contactperson" value="{$space->contactperson}"/></td>
                </tr>
            </table>

            <a id="savespace"  style="background-color:#0092DC; color:white;font-size: 16px;" class="easyui-linkbutton savebutton"  plain="true">保存</a>
        </form>
    </div>
</body>
</html>

