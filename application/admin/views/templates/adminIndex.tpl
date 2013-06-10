<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="stylesheet" type="text/css" href="/css/home.css" />
<link rel="stylesheet" type="text/css" href="/css/grid/980_14_70_0.css" />
<title>企业空间管理后台----登录</title>

    <style type="text/css">
        div.header_wrap{
            background: #3E82B3;
            width: 100%;
            height: 55px;
        }
        div.nav_wrap{
            background:-moz-linear-gradient(top, #526F8E, #405873);
            background:-webkit-gradient(linear, 0 0, 0 bottom, from(#526F8E), to(#405873));
            filter:alpha(opacity=100 finishopacity=100 style=1 startx=0,starty=0,finishx=0,finishy=40) progid:DXImageTransform.Microsoft.gradient(startcolorstr='#526F8E',endcolorstr='#405873',gradientType=0);
            width: 100%;
            height:40px;
        }
        div.banner_wrap{
            width: 100%;height:440px;
            background: -webkit-gradient(linear, left top, left bottom, from(#BBE6F5), to(#FFFFFF));
            background: -moz-linear-gradient(top, #BBE6F5, #FFFFFF);
            filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#BBE6F5', endColorstr='#FFFFFF');
        }
        #nav_login{
            display: block; text-align: center;
            background:-moz-linear-gradient(top, #9ABED6, #668EB5);
            background:-webkit-gradient(linear, 0 0, 0 bottom, from(#9ABED6), to(#668EB5));
            filter:alpha(opacity=100 finishopacity=100 style=1 startx=0,starty=0,finishx=0,finishy=40) progid:DXImageTransform.Microsoft.gradient(startcolorstr='#9ABED6',endcolorstr='#668EB5',gradientType=0);
            width: 60px;
            height: 25px;
            margin-top: 6px;
            padding-top: 4px;
            color:white;
            font-weight: bold;
        }
        #reg_box{
            position: absolute;
            float:left;
            margin-top: 275px;
        }

        input.loginbtn{
            height:36px;
            width: 140px;
            margin-right: 5px;
            background : url(/images/loginbtn.jpg) no-repeat top;
        }
        #loginform{
            position: absolute;
            left: 400px;
            top:300px;
        }
    </style>
</head>

<body>

<!--页头-->
<div class="header_wrap">
    <div class="container_14 clearfix">
        <div id="header" style="height: 54px;">
            <div class="grid_2" style="margin-top: 10px;">
                <a href="/"><img src="/images/mainLogo.png"/></a>
            </div>

            <div class="grid_2" style="margin-top: 10px; padding-left: 620px;">
                <img src="/images/topRLogo.png"/>
            </div>
        </div>
    </div>
</div>

<!--背景广告-->
<div class="banner_wrap">
    <div class="container_14 clearfix">
        <div class="grid_14">
            <img src="/images/zznbxt.jpg">


        </div>
    </div>
</div>

<form id="loginform" action="/home/adminLogin" method="post" >
    <div style="width:420px; margin:0 auto; ">
        <table width="100%">
            <tr>
                <td align="right" colspan="2" style="padding-bottom: 10px; padding-right: 50px;"><b style="font-size: 14px; color:green;">企业空间管理后台--登录</b></td>
            </tr>
            <tr align="center">
                <td width="40%" align="right"><b>用户名：</b></td>
                <td width="60%" align="left"><input class="easyui-validatebox" name="username" type="text" id="username" style="height: 25px;width: 240px; font-size:16px;color: #333333;"/></td>
            </tr>
            <tr align="center">
                <td align="right" style="padding-top: 8px;"><b>密码：</b></td>
                <td align="left" style="padding-top: 8px;"><input class="easyui-validatebox" name="password" type="password" id="password" style="height: 25px;width: 240px; font-size:16px;color: #333333;"/></td>
            </tr>
            <tr>
                <td align="right" colspan="2"><b style="color:red;">{$errorMessage}</b></td>
            </tr>
            <tr align="right">
                <td colspan="2">
                    <input type="submit" class="loginbtn" value=""/>
                </td>
            </tr>
        </table>
    </div>
</form>

</body>
</html>

