<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/home.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/cookie/jquery.cookie.js"></script>
    <script type="text/javascript" src="/js/yonyou/modules/login/login.js"></script>
    <script type="text/javascript">
        $(document).ready(function()
        {
            var a='{$errorMessage}';
            if(a.length>0)
            {
                $("#pwdErrtip").text(a);
                $("#errPwd").css("display","block");
            }
        });
    </script>
    <title>畅捷通企业空间</title>
</head>

<body>

<div class="newheader_wrap">
    <!--页头-->
    <div class="header_box"></div>
    <div class="container clearfix" style="position:relative;width: 980px;margin-top: -78px">
        <div class="grid" style="width:270px;margin-top: 15px;">
            <a><img src="/images/homelogo.png"/></a>
            <p style="margin-top: -20px;margin-left: 135px">
                <a style="color: #666666">全球组织社会化协同平台</a>
            </p>
        </div>
        <div class="grid" style="width:490px;margin-left: 120px;">
            <ul class="newnav">
                <li><a href="/home/forglobal.html">产品介绍</a></li>
                <li><a href="/home/download.html">客户端下载</a></li>
                <li><a href="/home/contact.html">联系我们</a></li>
            </ul>
        </div>
        <div class="grid" style="width:100px;margin-top: 18px;">
            <img src="/images/chanjetlogo.png"/>
        </div>
    </div>

    <!--内容-->
    <div class="login_box container clearfix">
        <!--移动端下载-->
        <div class="grid" style="display: block;position:absolute;margin-left: 30px;margin-top:215px">
            <div class="grid">
                <a class="iphoneapp" href="http://esn.yonyou.com/ESNS.ipa" title="iPhone客户端下载"></a>
            </div>
            <div class="grid" style="margin-top: 45px;margin-left: -167px">
                <a class="androidapp" href="http://esn.yonyou.com/ESNS.apk" title="Android客户端下载"></a>
            </div>
        </div>
        <!--登录区-->
        <div id="loginDiv" class="grid login_panel">
            <form id="loginform" action="/home/login.html" method="post" onsubmit="return IsValidOnSubmit();" >
                <input id = "ref" name="ref" type="hidden" value="{if $ref neq ""}{$ref}{/if}"/>
                <div class="grid">
                    <div class="grid usrhead_panel"></div>
                    <div class="grid input_panel">
                        <input id="txtUser" name="txtUser" type="text" disableautocomplete="" autocomplete="off" style="width: 260px" value="{if $email neq ""}{$email}{/if}"/>
                    </div>
                    <div class="grid tipbox"><p id="tipUser">输入邮箱或用户名</p></div>
                </div>
                <div id="errEmail" class="grid box" style="position: absolute;margin-left: 105px;width:243px;margin-top: 81px;display: none;">
                    <span class="arrow"></span>
                    <span class="arrow-1"></span>
                    <img src="/images/msg_error.jpg" style="margin-left: -15px;margin-top: -2px;">
                    <p style="margin-top: -14px;margin-left: 8px;">
                        <label id="emailErrtip" style="color:#999999;">您输入的邮箱或用户名不存在,请重新输入.</label>
                    </p>
                </div>
                <div style="display: none"><input type="password"></div>
                <div class="grid" style="margin-top: 4px;">
                    <div class="grid pwdhead_panel"></div>
                    <div class="grid input_panel">
                        <input type="password" id="txtPwd" style="width: 225px" name="txtPwd"/>
                    </div>
                    <div class="grid tipbox"><p id="tipPwd"><a>密码</a></p></div>
                </div>
                <div class="grid" style="margin-left: -45px;margin-top:26px;">
                    <a href="/home/findpassword.html" class="lostpwd" title="忘记密码"></a>
                </div>
                <div id="errPwd" class="grid box" style="position: absolute;margin-left: 105px;width:243px;margin-top: 160px;display: none;">
                    <span class="arrow"></span>
                    <span class="arrow-1"></span>
                    <img src="/images/msg_error.jpg" style="margin-left: -15px;margin-top: -2px;">
                    <p style="margin-top: -14px;margin-left: 8px;">
                        <label id="pwdErrtip" style="color:#999999;">您输入的密码和账户名不匹配,请重新输入.</label>
                    </p>
                </div>
                <div class="grid" style="margin-top: 10px;">
                    <input class="submitBtn" id="loginBtn" type="submit" value="登 录"/>
                </div>
                <div class="grid unselectText" style="margin-top: 8px;margin-left:86px;" unselectable="none" onselectstart="return false;">
                    <div class="grid" style="width: 15px;height:17px; padding: 0">
                        <input id="chkAutologin" name="autologin" value="1" checked="checked" type="checkbox" style="vertical-align: text-top;"/>
                    </div>
                    <div class="grid" style="width: 70px;height:17px;margin-top: 3px;">
                        <p style="margin-left: 7px;"><label style="color: #999999;"  id="lbAutocheck">自动登录</label></p>
                    </div>
                </div>
            </form>
        </div>
        <!--注册区-->
        <div id="regDiv" class="grid login_panel" style="display: none">
            <form id="registerform" action="/home/validateUser.html" method="post"  onsubmit="return IsValidOnRegSubmit();">
                <div style="display: none"><input type="password"></div>
                <div class="grid">
                    <div class="grid emailhead_panel"></div>
                    <div class="grid input_panel">
                        <input id="txtRegUser" name="txtRegUser" disableautocomplete="" autocomplete="off" style="width: 260px"/>
                    </div>
                    <div class="grid tipbox"><p id="tipRegUser">请使用您的工作邮箱</p></div>
                </div>
                <div id="errInput" class="grid box" style="position: absolute;margin-left: 100px;width:258px;margin-top: 81px;display: none;">
                    <span class="arrow"></span>
                    <span class="arrow-1"></span>
                    <img src="/images/msg_error.jpg" style="margin-left: -15px;margin-top: -2px;">
                    <p style="margin-top: -14px;margin-left: 8px">
                        <label id="inputErrtip" style="color:#999999;">请输入正确的邮箱格式:example@example.com.</label>
                    </p>
                </div>
                <div class="grid" style="margin-top: 4px;">
                    <div class="grid pwdhead_panel"></div>
                    <div class="grid input_panel">
                        <input id="txtRegPwd" name="txtRegPwd" style="width: 240px" type="password"/>
                    </div>
                    <div class="grid tipbox"><p id="tipRegPwd"><a>请输入密码</a></p></div>
                </div>
                <div id="errRegPwd" class="grid box" style="position: absolute;margin-left: 105px;width:243px;margin-top: 160px;display: none;">
                    <span class="arrow"></span>
                    <span class="arrow-1"></span>
                    <img src="/images/msg_error.jpg" style="margin-left: -15px;margin-top: -2px;">
                    <p style="margin-top: -14px;margin-left: 8px;">
                        <label id="regPwdErrtip" style="color:#999999;">请输入6-12位数字或字母.</label>
                    </p>
                </div>
                <div id = "pwdagain" class="grid" style="margin-top: 4px;margin-left: 75px;display: none;">
                    <div class="grid input_panel">
                        <input id="txtRegPwd2" name="txtRegPwd2" style="width: 240px" type="password"/>
                    </div>
                    <div class="grid tipbox"><p id="tipRegPwd2"><a>再次输入密码</a></p></div>
                </div>
                <div id="errRegPwd2" class="grid box" style="position: absolute;margin-left: 105px;width:243px;margin-top: 240px;display: none;">
                    <span class="arrow"></span>
                    <span class="arrow-1"></span>
                    <img src="/images/msg_error.jpg" style="margin-left: -15px;margin-top: -2px;">
                    <p style="margin-top: -14px;margin-left: 8px;">
                        <label id="regPwdErrtip2" style="color:#999999;">请输入6-12位数字或字母.</label>
                    </p>
                </div>
                <div class="grid" style="margin-top: 10px;">
                    <input class="submitBtn" id="regButton" type="submit" value="注 册"/>
                </div>
                <div class="grid unselectText" style="margin-top: 8px;margin-left:86px;" unselectable="none" onselectstart="return false;">
                    <div class="grid" style="width: 15px;height:17px; padding: 0">
                        <input id="chkAgreement" name="agreement" value="0" type="checkbox" style="vertical-align: text-top;"/>
                    </div>
                    <div class="grid" style="width: 110px;height:17px;margin-top: 3px;">
                        <p style="margin-left: 7px;"><label style="color: #999999;"  id="lbAgreement">企业空间使用协议</label></p>
                    </div>
                </div>
                <div id="errAgreement" class="grid box" style="position: absolute;margin-left: 105px;width:243px;margin-top: 340px;display: none;">
                    <span class="arrow"></span>
                    <span class="arrow-1"></span>
                    <img src="/images/msg_error.jpg" style="margin-left: -15px;margin-top: -2px;">
                    <p style="margin-top: -14px;margin-left: 8px;">
                        <label style="color:#999999;">注册前请阅读并接受企业空间使用协议</label>
                    </p>
                </div>
            </form>
        </div>
        <!--切换注册和登录-->
        <div class="grid switch_bar">
            <div class="grid ball_bar">
                <a id="switchBtn" class="unselectText" unselectable="none" onselectstart="return false;" style="font-size: 16px;">注册>></a>
            </div>
        </div>
    </div>

    <!--页尾-->
    <div id="footer" class="container clearfix" style="width:100%;margin-top: 123px">
            <div class="container clearfix" style="width: 100%">
                <div class="grid" style="font: 100% Verdana, Tahoma, Arial;width: 100%;text-align: center;padding: 0;line-height: 20px;">
                    版权所有：畅捷通信息技术股份有限公司 © 2009-2013
                </div>
            </div>
    </div>
</div>

</body>
</html>

