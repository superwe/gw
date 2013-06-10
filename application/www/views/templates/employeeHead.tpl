<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/jquery.Jcrop.min.css" />
    <link rel="stylesheet" type="text/css" href="/css/home.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/cookie/jquery.cookie.js"></script>
    <script type="text/javascript" src="/js/yonyou/lib/yonyou.js"></script>
    <script type="text/javascript" src="/js/yonyou/lib/yy.core.js"></script>
    <script type="text/javascript" src="/js/yonyou/modules/login/uploadHeadImg.js"></script>
    <script type="text/javascript" src="/js/yonyou/widgets/avatar/avatar.js"></script>

    <script language="Javascript">

    </script>

    <title>企业空间-完善个人信息</title>
</head>

<body >
{include file="header.tpl"}

<div class="container clearfix guide" style="width:980px;margin-top: 20px;margin-bottom: 40px;">
    <div class="header_box">
        <p>欢迎登录企业空间！<label>为了让您更好的使用空间，请进一步完善信息！</label></p>
        <p><img src="/images/headpic.png" /></p>
        <div class="wrap grid" id="avatarUploadBlock">
            <p style="width: 111px;height:28px;background: url(../images/uploadheadpic.png) no-repeat;"><a id='avatarUploadButton' ></a></p>
            <p class="yy-upload-process-container">仅支持JPG、GIF、PNG图片格式文件，且小于5M</p>
            <div class="grid">
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
                    <input class="blueButton" type="button" value="保 存" id = 'sublead'>
                    <input class="whiteButton yy-cancel-avatar-upload" type="button" value="取 消">
                </div>
            </div>
            <div class="grid right_panel">
                <p style="line-height: 18px;">您上传的头像会自动生成三种尺寸，<br>请关注小尺寸的头像是否清晰。</p>
                <div class="grid">
                    <div class="bImg" style="margin-top: 30px;">
                        <img id = 'avatarMiddle' src="/images/headpic_2.png">
                    </div>
                    <p class="tip" style="margin-left: 7px;">大头像尺寸150X150像素</p>
                </div>
                <div class="grid" style="margin-left: 80px;">
                    <div class="mImg">
                        <img id = 'avatarSmall' src="/images/headpic_3.png">
                    </div>
                    <p class="tip" style="margin-left: -4px;line-height: 17px;">大头像尺寸<br>48X48像素 <br> (自动生成)</p>
                    <div class="sImg"  style=" margin-left: 9px;" >
                        <div>
                            <img id = 'avatarTiny' src="/images/headpic_4.png">
                        </div>
                    </div>
                    <p class="tip" style="margin-left: -4px;line-height: 17px;">小头像尺寸<br>30X30像素 <br> (自动生成)</p>
                </div>
            </div>
        </div>
    </div>
    <div class="container clearfix" style="margin-left: 360px;">
        <a href="/home/employeeInfo.html"><input class="blueButton grid" type="button"  style="margin-top: 20px;" value="继续下一项"/></a>
        <div class="grid" style="margin-top: 34px;margin-left: 20px;"><a style="color:#3378ba;font-size: 10pt;">全部跳过>></a></div>
    </div>
</div>


{include file="footer.tpl"}
</body>
</html>
