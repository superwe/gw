<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/home.css" />
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script type="text/javascript" src="/js/yonyou/modules/login/employeeInfo.js"></script>
    <title>企业空间-完善个人信息</title>
</head>

<body >
{include file="header.tpl"}

<div class="container clearfix guide" style="width:980px;margin-top: 20px;margin-bottom: 40px;">
    <div class="header_box">
        <p>欢迎登录企业空间！<label>为了让您更好的使用空间，请进一步完善信息！</label></p>
        <p><img src="/images/personalinfo.png" /></p>
    </div>
    <div style="border-top: 1px dashed #e0e3e3;width: 80%;margin-left: 95px;margin-top: -10px;"></div>
    <div class="pub_header">
        <p>个人资料</p>
    </div>
    <form  id="selectspaceform" action="/home/addInSpace.html" method="post" style="margin-top: 5px;" onsubmit=" return saveInfoOnSubmit();">
        <div class="pub_content" style="color: #767676;">
            <div class="text_panel">
                <input type="hidden" value="1" name="sex" id = 'sex' />
                <ul>
                    <li>性别： </li>
                    <li class="right">男<input id='male' style="margin-left: 10px;margin-right: 20px;" type="radio" checked="checked"/>女<input id='female' style="margin-left: 10px;" type="radio"/></li>
                </ul>
                <ul>
                    <li>生日：</li>
                    <li class="right">
                        <select id='year' name='year' style="width: 120px;margin-right: 3px;"></select><label style="font-size: 9pt;">年</label>
                        <select id='month' name='month' style="width: 40px;margin-right: 3px;"></select><label style="font-size: 9pt;">月</label>
                        <select id='day' name='day' style="width: 40px;margin-right: 3px;"></select><label style="font-size: 9pt;">日</label>
                    </li>
                </ul>
                <ul>
                    <li>qq：</li>
                    <li class="right"><input id='QQ' name='QQ' type="text" style="width: 200px;"></li>
                </ul>
                <ul>
                    <li>微博：</li>
                    <li class="right"><input id='weibo' name='weibo' type="text" style="width: 200px;"></li>
                </ul>
                <ul>
                    <li>家乡：</li>
                    <li class="right">
                        <select id='province' name='province' style="width: 130px;margin-right: 5px;"></select>
                        <select id='city' name='city' style="width: 155px;"></select>
                    </li>
                </ul>
                <ul>
                    <li>血型：</li>
                    <li class="right"><select id='bloodgroups' name='bloodgroups' style="width: 90px;"></select></li>
                </ul>
                <ul>
                    <li>星座：</li>
                    <li class="right"><select id='constellation' name='constellation' style="width: 90px;"></select></li>
                </ul>
                <ul>
                    <li>我的简介：</li>
                    <li class="right"><textarea id='introduce' name='introduce' style="resize:none;overflow-y: hidden;width: 380px;height: 80px;margin-top: 9px;"></textarea></li>
                </ul>
            </div>
        </div>
        <div class="pub_bottom">
            <div class="container clearfix" style="margin-left: 350px;">
                <input class="blueButton grid" type="submit"  style="margin-top: 10px;" value="完 成"/>
                <div class="grid" style="margin-top: 24px;margin-left: 20px;"><a style="color:#3378ba;font-size: 10pt;">全部跳过>></a></div>
            </div>
        </div>
    </form>

</div>

{include file="footer.tpl"}
</body>
</html>
