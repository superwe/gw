<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/home.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/timers/1.2/jquery.timers.js"></script>
    <script language="Javascript">
        $(document).ready(function(){
            var i=60;
            $('body').everyTime('1s',function(){
                $("#timeCtrl").text(i--);
                if(i==0)
                {
                    $('body').everyTime('1s',function(){
                        $("#subbtn").removeAttr("disabled");
                        $('body').stopTime();
                    });
                }
            });
        });

        function IsValidOnSubmit(){
            var valid=true;
            return valid;
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
            <div class="grid pub_content" style="color: #767676">
                <form action="/home/senderemail.html" method="post" onsubmit=" return IsValidOnSubmit();">
                        <p class="bigp">尊敬的用户，</p>
                        <p class="bigp">重置密码的链接已经发送至您的邮箱：<span class="yourmail">{$email}</span></p><input  id="txtEmail" name="txtEmail" value="{$email}" type="hidden"/>
                        <p class="bigp">请查看您的邮箱，找到重置密码邮件，主题是"企业空间找回密码"，点击链接进入页面，输入新密码完成密码重置。</p>
                        <p style="margin-top: 30px;color:  #999;" class="smallp">若没有找到该邮件，请您在垃圾邮件里找找，</p>
                        <p class="smallp">或可以在 <span id="timeCtrl">60</span> 秒后重新发送邮件</p>
                    <input type="submit" id ="subbtn" class="submitbtn" style="margin-top: 20px;" disabled="disabled" value="重新发送邮件"/>
                    <p style="margin-top: 40px;"><a class="turnhome" href="/home/index.html"><<返回首页</a></p>
                </form>
            </div>
        </div>
</div>

{include file="footer.tpl"}

</body>
</html>
