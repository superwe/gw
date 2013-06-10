<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/home.css" />
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script type="text/javascript">
        function selectSpaceOnSubmit(){
            var strSpace= $(':checked');
            if(strSpace.length>0)
            {
                return true;
            }
            else
            {
                alert('请选择要加入的空间!');
                return false;
            }
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
            <p>加入空间</p>
        </div>
        <div class="grid pub_content" style="color: #767676">
            <p class="bigp">亲爱的 <a class="telphone">{if isset($email) }{$email}:{/if}</a></p>
            <p class="bigp">系统检测到以下几个与您相关的企业和团队，请选择将要加入的企业或团队<label style="color: #ff0000">(可多选)</label>：</p>
            <form id="selectspaceform" action="/home/addInSpace.html" method="post" style="margin-top: 5px;" onsubmit=" return selectSpaceOnSubmit();">
                <input type="hidden" name="email" value=" {if isset($email) }{$email}{/if}">
                <input type="hidden" name="password" value=" {if isset($pwd) }{$pwd}{/if}">

                {if count($spaceList) gt 0}
                    {foreach from=$spaceList item=space}
                    <div style="margin-top: 10px;border-bottom: 1px solid #cccccc;width: 70%">
                        <div class="gird" style="width: 15px">
                            <input name="space[]" style="margin-left: 0px;" type="checkbox" value="{$space->id}"/>
                        </div>
                        <div class="gird" style="padding-bottom: 10px;">
                            <p class="bigp" style="margin-left: 25px;margin-top: -17px;font-weight: bold">{$space->name}</p>
                            <p class="smallp" style="margin-left: 25px;margin-top: -8px;">有2个人邀请了你：李驍、还是李骁</p>
                        </div>
                    </div>
                    {/foreach}
                    <p style="margin-top: 25px;margin-left: 120px;margin-bottom:40px;">
                        <input type="submit" id ="resendBtn" class="submitbtn" style="margin-top: 20px;margin-left:170px;" value="加 入"/>
                    </p>
                {/if}
            </form>
            <p class="bigp"><a href="/home/registerSpace.html?email={$encryptEmail}&password={$pwd}&ex=1" style="color: #3CADE7;">点击这里</a>创建自己的企业空间</p>
        </div>
    </div>
</div>
{include file="footer.tpl"}
</body>
</html>


