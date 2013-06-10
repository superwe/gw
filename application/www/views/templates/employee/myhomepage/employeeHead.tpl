<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/jquery.Jcrop.min.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/cookie/jquery.cookie.js"></script>
    <script type="text/javascript" src="/js/yonyou/lib/yonyou.js"></script>
    <script type="text/javascript" src="/js/yonyou/lib/yy.core.js"></script>
    <script type="text/javascript" src="/js/yonyou/modules/employee/uploadHeadImg.js"></script>
    <script type="text/javascript" src="/js/yonyou/widgets/avatar/avatar.js"></script>
    <script language="Javascript">

    </script>

    <title>企业空间-完善个人信息</title>
</head>

<body >
{include file="employee/header.tpl"}

<div class="container clearfix workDiv">
    {include file="employee/leftbar.tpl"}
    <div class="grid announce_box" id='content'>
        <div class="announce_header" id='anchead' style="width: 830px;">
            <ul id='anctype' class="tab" style="float:left;margin-left: 10px;margin-top: 18px;">
                <li><a ancid='0'>基础设置</a></li>
                <li><a class="selected" ancid='1'>上传头像</a></li>
                <li><a ancid='2'>个人资料</a></li>
                <li><a ancid='3'>修改密码</a></li>
            </ul>
        </div>
        <div class="announce_panel guide" id='ancpl'>
            <div class="wrap grid" style="width: 708px;" id="avatarUploadBlock">
                <p class="upload"><a id='avatarUploadButton' ></a></p>
                <p class="yy-upload-process-container">仅支持JPG、GIF、PNG图片格式文件，且小于5M</p>
                <div class="grid" style="margin-top: 8px;">
                    <div class="maxImg">
                        <table>
                            <tr>
                                <td valign="middle" align="center" style="width: 300px;height: 300px;vertical-align: middle;text-align: center;text-align: -webkit-center;">
                                    <img id="avatarOrigin" src="/images/headpic_1.png">
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div class="grid yy-button-line" style="margin-top: 10px;margin-left: 20px;visibility: hidden;">
                        <input type="hidden" value="" name="filepath" id="filepath">
                        <input type="hidden" value="0620" name="mid" id="mid">
                        <input type="hidden" value="53" name="uid" id="uid">
                        <input type="hidden" value="" name="bigwidth" id="bigwidth">
                        <input type="hidden" value="" name="bigheight" id="bigheight">
                        <input type="hidden" value="" name="x" id="x">
                        <input type="hidden" value="" name="y" id="y">
                        <input type="hidden" value="" name="w" id="w">
                        <input type="hidden" value="" name="h" id="h">
                        <input class="blueButton" type="button" value="保 存" id = 'sub'>
                        <input class="whiteButton yy-cancel-avatar-upload" type="button" value="取 消">
                    </div>
                </div>
                <div class="grid right_panel">
                    <p style="line-height: 18px;">您上传的头像会自动生成三种尺寸，<br>请关注小尺寸的头像是否清晰。</p>
                    <div class="grid">
                        <div class="bImg" style="margin-top: 30px;">
                            <img id = 'avatarMiddle' src='http://staticoss.chanjet.com/qiater/{$personalInfo['imageurl']}.middle.jpg' onerror='imgError(this);' rel='/images/headpic_2.png'>
                        </div>
                        <p class="tip" style="margin-left: 7px;">大头像尺寸150X150像素</p>
                    </div>
                    <div class="grid" style="margin-left: 80px;">
                        <div class="mImg">
                            <img id = 'avatarSmall' src='http://staticoss.chanjet.com/qiater/{$personalInfo['imageurl']}.thumb.jpg' onerror='imgError(this);' rel='/images/headpic_3.png'>
                        </div>
                        <p class="tip" style="margin-left: -4px;line-height: 17px;">大头像尺寸<br>48X48像素 <br> (自动生成)</p>
                        <div class="sImg"  style=" margin-left: 9px;margin-top: 5px;" >
                            <div>
                                <img id = 'avatarTiny' style="width: 30px;height: 30px; " src='http://staticoss.chanjet.com/qiater/{$personalInfo['imageurl']}.thumb.jpg' onerror='imgError(this);' rel='/images/headpic_4.png'>
                            </div>
                        </div>
                        <p class="tip" style="margin-left: -4px;line-height: 17px;">小头像尺寸<br>30X30像素 <br> (自动生成)</p>
                    </div>
                </div>
            </div>
            <div class="container clearfix" style="margin-left: 330px;">
                <a href="/employee/myhomepage/employeeInfo.html"><input class="blueButton grid" type="button"  style="margin-top: 20px;" value="继续下一项"/></a>
            </div>
        </div>
    </div>
</div>


{include file="employee/footer.tpl"}
</body>
</html>
