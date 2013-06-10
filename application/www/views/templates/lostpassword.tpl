<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/home.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>

    <script language="Javascript">

        $(document).ready(function(){

            if($.trim($("#txtEmail").val()).length>0)
            {
                $("#tipEmail").css("display","none");
            }

            $("#txtEmail").focus(function()
            {
                $("#tipEmail").css("display","none");
                $("#errEmail").css("display","none");
            });

            $("#txtEmail").blur(function()
            {
                if($.trim($("#txtEmail").val()).length==0)
                {
                    $("#tipEmail").css("display","block");
                    $("#txtEmail").val("");
                    $("#errEmail").css("display","block");
                    $("#txtErr").text("请输入email地址!");
                    return;
                }
                var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
                if(!reg.test($("#txtEmail").val()))
                {
                    $("#errEmail").css("display","block");
                    $("#txtErr").text("请输入正确的email地址");
                }
            });

            $("#tipEmail").click(function()
            {
                $("#txtEmail").focus();
                $("#txtEmail").val("");
            });
        });

        function IsValidOnSubmit(){

            if($.trim($("#txtEmail").val()).length==0)
            {
                $("#tipEmail").css("display","block");
                $("#txtEmail").val("");
                $("#errEmail").css("display","block");
                $("#txtErr").text("请输入email地址!");
                return false;
            }
            var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
            if(!reg.test($("#txtEmail").val()))
            {
                $("#errEmail").css("display","block");
                $("#txtErr").text("请输入正确的email地址");
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
                <p>找回密码</p>
            </div>
            <div class="grid pub_content">
                <form action="/home/senderemail.html" method="post" onsubmit=" return IsValidOnSubmit();">
                    <div class="grid inputbar">
                        <div class="grid">
                            <input id="txtEmail" name="txtEmail" class="textbox" />
                        </div>
                        <div id="errEmail" class="errTip" style="margin-left:260px; margin-top: 4px;width: 180px;height: 30px;">
                            <img style="margin-top: 7px;margin-left: 8px;" src="/images/msg_error.jpg"/>
                            <p id = "txtErr" style="margin-top: -13px;margin-left: 32px;color: #ff0000;font-family:'微软雅黑';">请输入正确的email地址</p>
                        </div>
                    </div>
                    <div class="grid tips" id="tipEmail" style="margin-top:15px;margin-left: -240px;">
                        <div class="grid"><img src="/images/lostpwd_email.png"></div>
                        <div class="grid" style="margin-left: 3px;">请填写注册空间时所填写的邮箱</div>
                    </div>
                    <div class="grid" style="margin-left: -247px;margin-top: 55px;">
                        <input type="submit" class="submitbtn" style="margin-top: 15px;" value="提 交"/>
                        <p style="margin-top: 40px;">
                            <a class="turnhome" href="/home/index.html"><<返回首页</a>
                        </p>
                    </div>
                </form>
                <div class="pub_tips" style="margin-top: 170px;width: 850px; color: #767676">
                    <br><p style="font-weight: bold;font-size: 14px;">如何找回密码？</p>
                    <p><span style="font-weight: bold;">第一步：</span>
                        请在邮箱输入框中，输入注册空间时所填写的邮箱全称，包含@后面的内容；</p>
                    <p><span style="font-weight: bold;">第二步：</span>
                        邮箱校验通过后 ，点击"提交"按钮，系统会向邮箱中发送主题是"企业空间找回密码申请"邮件，点击邮件中的链接，输入新密码即可。</p>
                    <p>如有疑问请联系我们的客户服务</p>
                    <p>服务热线：<a class="telphone">4008-600-566</a></p>
                    <p>客服邮箱：<a class="mailto" href="mailto:kefu@chanjet.com">kefu@chanjet.com</a></p>
                </div>
            </div>
        </div>
</div>

{include file="footer.tpl"}

</body>
</html>
