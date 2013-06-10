<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/home.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>

    <script language="Javascript">

        $(document).ready(function()
        {
            var a='{$ex}';
            if(a == 1)
            {
                $("#prev").css("display","block");
            }

            if($.trim($("#spaceName").val()).length>0)
            {
                $("#tipSpace").css("display","none");
            }
            $("#spaceName").blur(function()
            {
                var str=$("#spaceName").val();
                $.post("/home/hasSameSpace.html",{ spaceShortName: str },function(data){
                    if(data.length>0)
                    {
                        $("#spaceErrtip").text(data);
                        $("#errSpace").css("display","block");
                    }
                },"text");
                if($.trim($("#spaceName").val()).length==0)
                {
                    $("#tipSpace").css("display","block");
                }
            });

            $("#companyName").blur(function()
            {
                var str=$("#companyName").val();
                $.post("/home/hasSameCompany.html",{ spaceFullName: str },function(data){
                    if(data.length>0)
                     {
                         $("#companyErrtip").text(data);
                         $("#errCom").css("display","block");
                     }
                },"text");
            });

            $("#spaceName").focus(function()
            {
                $("#errSpace").css("display","none");
                $("#tipSpace").css("display","none");
            });

            $("#tipSpace").click(function()
            {
                $("#spaceName").focus();
            });

            $("#companyName").focus(function()
            {
                $("#errCom").css("display","none");
            });

        });

        function IsValidOnSubmit(){
            var str=$("#companyName").val();
            var valid=true;
            var options = { type:"post",url:"/home/hasSameCompany.html", data:{ spaceFullName: str },
                async:false,success:function(data){
                    if(data.length>0)
                    {
                        $("#companyErrtip").text(data);
                        $("#errCom").css("display","block");
                        valid= false;
                    }
                }
            };
            str=$("#spaceName").val();
            $.ajax(options);//发送验证请求
            options = { type:"post",url:"/home/hasSameSpace.html", data:{ spaceShortName: str },
                async:false,success:function(data){
                    if(data.length>0)
                    {
                        $("#spaceErrtip").text(data);
                        $("#errSpace").css("display","block");
                        valid= false;
                    }
                }
            };
            $.ajax(options);//发送验证请求
            return valid;
        }

    </script>
    <title>畅捷通企业空间</title>
</head>

<body>
{include file="header.tpl"}

<!--内容-->
<div class="container clearfix" style="width:980px;margin-top: 40px;margin-bottom: 40px;">
        <div class="grid pub_wrap">
            <div class="pub_header">
                <p>创建空间</p>
            </div>
            <div class="grid pub_content">
                <form action="/home/createSpace.html" method="post" onsubmit=" return IsValidOnSubmit();">
                    <input type="hidden" name="email" value="{$email}"/>
                    <input type="hidden" name="password" value="{$password}"/>
                    <input type="hidden" name="ex" value="{$ex}"/>
                    <p style="color: #767676; margin-top: 1px;margin-left: 1px; font-size: 16px">您需要填写简单的信息创建自己的企业:</p>
                    <p style="margin-top: 35px;margin-left: 85px;">
                        <label style="color: #767676;font-size: 16px">企业名称:</label>
                        <input  id="companyName" name="spaceFullName" style="margin-left: 24px;width: 270px;height: 30px;border: 1px solid #969696;border-radius: 1px;"/>
                    </p>
                    <div id="errCom" class="errTip" style="position: absolute;margin-left:480px; margin-top: -34px;width: 220px;height: 30px;">
                        <img style="margin-top: 7px;margin-left: 8px;" src="/images/msg_error.jpg"/>
                        <p id="companyErrtip" style="margin-top: -13px;margin-left: 32px;color: #ff0000;font-family:'微软雅黑';"></p>
                    </div>
                    <div class="grid">
                        <p style="margin-top: 33px;margin-left: 85px;">
                            <label style="color: #767676;font-size: 16px">空间名称:</label>
                            <input  id="spaceName" name="spaceShortName" style="margin-left: 24px;width: 270px;height: 30px;border: 1px solid #969696;border-radius: 1px;"/>
                        </p>
                        <div id="errSpace" class="errTip" style="position: absolute;margin-left:480px; margin-top: -34px;width: 220px;height: 30px;">
                            <img style="margin-top: 7px;margin-left: 8px;" src="/images/msg_error.jpg"/>
                            <p id="spaceErrtip" style="margin-top: -13px;margin-left: 32px;color: #ff0000;font-family:'微软雅黑';"></p>
                        </div>
                        <input type="submit" class="submitbtn"  value="提 交" style="margin-top: 30px;margin-left: 250px;">
                        <p id = "prev" style="display:none;margin-left: 380px;margin-top: -20px;"><a  href="/home/activeUser.html?email={$email}&pwd={$password}">上一步</a></p>
                    </div>
                    <div class="grid tipbox" style="margin-left: -274px;margin-top: 62px;"><p id="tipSpace">限制在8个汉字以内</p></div>
                </form>
            </div>
        </div>
</div>

{include file="footer.tpl"}

</body>
</html>
