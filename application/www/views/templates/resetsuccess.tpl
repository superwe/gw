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
            var i=1;
            $('body').everyTime('1s',function(){
                i--;
                if(i==0)
                {
                    $('body').everyTime('1s',function(){
                        $('body').stopTime();
                        location.href = "/home/index.html";
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
                <p>修改密码</p>
            </div>
            <div class="grid pub_content" style="color: #767676">
                <form action="/home/senderemail.html" method="post" onsubmit=" return IsValidOnSubmit();">
                        <p class="bigp">修改成功!</p>
                        <p class="smallp">如未跳转，请<a href="/home/index.html" class="returnhome">【点击跳转】</a></p>
                </form>
            </div>
        </div>
</div>

{include file="footer.tpl"}

</body>
</html>
