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
            if($.trim($("#txtPwd").val()).length>0)
            {
                $("#tipPwd").css("display","none");
            }

            $("#txtPwd").focus(function()
            {
                $("#tipPwd").css("display","none");
                $("#errPwd").css("display","none");
                $("#rightPwd").css("display","none");
                $("#errPwd2").css("display","none");
                $("#rightPwd2").css("display","none");
            });

            $("#txtPwd").blur(function()
            {
                if($.trim($("#txtPwd").val()).length==0)
                {
                    $("#tipPwd").css("display","block");
                    $("#txtPwd").val("");
                    $("#errPwd").css("display","block");
                    return;
                }
                if(validPwd($.trim($("#txtPwd").val())))
                {
                    $("#errPwd").css("display","block");
                }
                else
                {
                    $("#rightPwd").css("display","block");
                }
            });

            $("#tipPwd").click(function()
            {
                $("#txtPwd").focus();
                $("#txtPwd").val("");
            });

            if($.trim($("#txtPwd2").val()).length>0)
            {
                $("#tipPwd2").css("display","none");
            }

            $("#txtPwd2").focus(function()
            {
                $("#tipPwd2").css("display","none");
                $("#errPwd2").css("display","none");
                $("#rightPwd2").css("display","none");
            });

            $("#txtPwd2").blur(function()
            {
                if($.trim($("#txtPwd2").val()).length==0)
                {
                    $("#tipPwd2").css("display","block");
                    $("#txtPwd2").val("");
                    $("#errPwd2").css("display","block");
                    $("#txtErr").text("请输入6-12位数字或字母");
                    return;
                }
                if(!validRePwd($.trim($("#txtPwd2").val()),$.trim($("#txtPwd").val())))
                {
                    $("#errPwd2").css("display","block");
                    $("#txtErr").text("输入不一致，请重新输入");
                    return;
                }
                if(validPwd($.trim($("#txtPwd2").val())))
                {
                    $("#errPwd2").css("display","block");
                    $("#txtErr").text("请输入6-12位数字或字母");
                }
                else
                {
                    $("#rightPwd2").css("display","block");
                }
            });

            $("#tipPwd2").click(function()
            {
                $("#txtPwd2").focus();
                $("#txtPwd2").val("");
            });

            $("#txtPwd").keyup(function(e){
                if(e.keyCode==13){
                    $("#txtPwd2").focus();
                }
            });
            $("#txtPwd2").keyup(function(e){
                if(e.keyCode==13){
                    $("#subbtn").focus();
                    $("#subbtn").submit();
                }
            });
        });

        function validRePwd(firobj,curobj)
        {
            if(firobj==curobj)
            {
                return true;
            }
            return false;
        }

        function validPwd(obj)
        {
            var reg = /^[A-Za-z0-9]+$/;
            if(!reg.test(obj))
            {
                return true;
            }
            if(obj.length<6||obj.length>12)
            {
                return true;
            }
            return false;
        }

        function IsValidOnSubmit()
        {
            if($.trim($("#txtPwd").val()).length==0)
            {
                $("#tipPwd").css("display","block");
                $("#txtPwd").val("");
                $("#errPwd").css("display","block");
                return false;
            }
            if(validPwd($.trim($("#txtPwd").val())))
            {
                $("#errPwd").css("display","block");
                return false;
            }
            if($.trim($("#txtPwd2").val()).length==0)
            {
                $("#tipPwd2").css("display","block");
                $("#txtPwd2").val("");
                $("#errPwd2").css("display","block");
                $("#txtErr").text("请输入6-12位数字或字母");
                return false;
            }
            if(!validRePwd($.trim($("#txtPwd2").val()),$.trim($("#txtPwd").val())))
            {
                $("#errPwd2").css("display","block");
                $("#txtErr").text("输入不一致，请重新输入");
                return false;
            }
            if(validPwd($.trim($("#txtPwd2").val())))
            {
                $("#errPwd2").css("display","block");
                $("#txtErr").text("请输入6-12位数字或字母");
                return false;
            }
            return true;
        }

    </script>
    <title>畅捷通企业空间</title>
</head>

<body>
{include file="header.tpl"}

<!--内容-->
<div class="container clearfix" style="width:980px;margin-top: 40px;margin-bottom: 40px;">
        <div class="grid pub_wrap" style="text-align: left;">
            <div class="pub_header">
                <p>重置密码</p>
            </div>
            <div class="grid pub_content">
                <form action="/home/resetPwd.html" method="post" onsubmit=" return IsValidOnSubmit();">
                    <p class="smallp" style="color: #9e9e9e">邮箱：{$email}</p>
                    <div style="display: none">
                        <input type="password"/>
                    </div>
                    <input  id="txtEmail" name="txtEmail" value="{$email}" type="hidden"/>
                    <div class="grid inputbar" style="margin-top: 5px;">
                        <div class="grid">
                            <input id="txtPwd" name="txtPwd" class="textbox" type="password" value=""/>
                        </div>
                        <div id="rightPwd" style="display:none;margin-left: 250px; margin-top: 3px;width: 30px;height: 30px;">
                            <img style="margin-top: 5px;margin-left: 8px;" src="/images/reset_right.png"/>
                        </div>
                        <div id="errPwd" class="errTip" style="margin-left:260px; margin-top: 4px;width: 180px;height: 30px;">
                            <img style="margin-top: 7px;margin-left: 8px;" src="/images/msg_error.jpg"/>
                            <p style="margin-top: -13px;margin-left: 32px;color: #ff0000;font-family:'微软雅黑';">请输入6-12位数字或字母</p>
                        </div>
                    </div>
                    <div id="tipPwd" class="grid tips" style="margin-top: 20px;margin-left: -240px;">
                        <div class="grid"><img src="/images/lostpwd_pwd.png"></div>
                        <div class="grid" style="margin-left: 3px;"> 密码</div>
                    </div>
                    <div class="grid inputbar" style="margin-top: 70px;margin-left: -247px;">
                        <div class="grid">
                            <input id="txtPwd2" name="txtPwd2" class="textbox" type="password" value=""/>
                        </div>
                        <div id="rightPwd2" style="display:none;margin-left: 250px; margin-top:3px;width: 30px;height: 30px;">
                            <img style="margin-top: 5px;margin-left: 8px;" src="/images/reset_right.png"/>
                        </div>
                        <div id="errPwd2" class="errTip" style="margin-left:260px; margin-top: 4px;width: 180px;height: 30px;">
                            <img style="margin-top: 7px;margin-left: 8px;" src="/images/msg_error.jpg"/>
                            <p id = "txtErr" style="margin-top: -13px;margin-left: 32px;color: #ff0000;font-family:'微软雅黑';">请输入6-13位数字或字母</p>
                        </div>
                    </div>
                    <div id="tipPwd2" class="grid tips" style="margin-top: 85px;margin-left: -240px;">
                        <div class="grid"><img src="/images/lostpwd_pwd.png"></div>
                        <div class="grid" style="margin-left: 3px;">确认密码</div>
                    </div>
                    <input type="submit" class="submitbtn" id="subbtn" style="margin-top: 140px;margin-left: -247px;" value="提 交"/>
                </form>
            </div>
        </div>
</div>

{include file="footer.tpl"}

</body>
</html>
