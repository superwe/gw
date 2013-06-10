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
                        $("#resendBtn").removeAttr("disabled");
                        $('body').stopTime();
                    });
                }
            });

            $("#resendBtn").click(function()
            {
                $("#resendBtn").attr("disabled","disabled" );
                $.post("resendApplyEmail.html", { email:'{$email}',password:'{$password}'},function(data){
                    if(data == "1")
                    {
                        $("#tip").text("邮件已重发，请查看邮箱。");
                        $("#msgTip").css("display","block");
                    }
                    else
                    {
                        $("#tip").text("发送失败，请联系客服或重新发送。");
                        $("#msgTip").css("display","block");
                    }
                    $('body').oneTime('7s','a',function()
                    {
                        $("#msgTip").css("display","none");
                    });
                    var i=60;
                    $('body').everyTime('1s',function()
                    {
                        $("#timeCtrl").text(i--);
                        if(i==0)
                        {
                            $('body').everyTime('1s',function(){
                                $("#resendBtn").removeAttr("disabled");
                                $('body').stopTime();
                            });
                        }
                    });
                },"text")
            })

        });

        function IsValidOnSubmit(){
            var valid=true;
            return valid;
        }

    </script>

    <title>注册-企业空间</title>
</head>

<body >
{include file="header.tpl"}

<!--内容-->
<div class="container clearfix" style="width:980px;margin-top: 40px;margin-bottom: 40px;">
    <div class="grid pub_wrap" style="text-align: left;">
        <div class="pub_header">
            <p>邮箱验证</p>
        </div>
        <div class="grid pub_content" style="color: #767676">
                <p class="bigp">请验证您的邮箱完成注册，</p>
                <p class="bigp">我们已经发送邮件到您的邮箱：<span class="yourmail">{$email}</span></p><input  id="txtEmail" name="txtEmail" value="{$email}" type="hidden"/>
                <p class="bigp">请查看您的邮箱，请根据邮件中的提示完成操作。</p>
                <p class="smallp" style="color:  #999;margin-top: 30px;">收不到验证邮件？</p>
                <p class="smallp" style="color:  #999;">有可能被误判为垃圾邮件了，请到垃圾邮件文件夹查找。</p>
                <p class="smallp" style="color:  #999;">用注册邮箱发邮件到 <a class="mailto" href="mailto:kefu@chanjet.com">kefu@chanjet.com</a>，并注明未收到激活邮件。
                <p class="smallp" style="color:  #999;">或拨打客服电话：<a class="telphone">4008-600-566</a></p>
                <p class="smallp" style="color:  #999;">若没有找到该邮件，在 <span id="timeCtrl">60</span> 秒后重新发送邮件</p>
                <input type="button" id ="resendBtn" class="submitbtn" style="margin-top: 20px;width: 100px;" disabled="disabled" value="重新发送邮件"/>
        </div>
        <div id="msgTip" class="grid box" style="margin-left: -908px;width:190px;margin-top: 360px;display: none;">
            <span class="arrow"></span>
            <span class="arrow-1"></span>
            <p style="margin-left: -10px;">
                <label id="tip" style="color:#999999;">发送失败，请联系客服或重新发送。</label>
            </p>
        </div>
    </div>
</div>
{include file="footer.tpl"}

</body>
</html>
