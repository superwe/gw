<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/home.css" />
        <link rel="stylesheet" type="text/css" href="/css/grid/980_14_70_0.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>

    <script language="Javascript">

    </script>


    <title>企业空间-完善公司信息</title>
</head>

<body >
{include file="header.tpl"}

<div class="container_14 clearfix" >

    <form   id="sendemailform" action="/home/sendValidateEmail" method="post" >
        <ul>
            <li>接收人: <input name="mailto"></li>
            <li>主题: <input name="title"></li>
            <li> 内容:<input name="content"></li>

            <input type="submit">
        </ul>

    </form>

    <form   id="uploadform" action="/home/upload" enctype="multipart/form-data" method="post"  style="margin-top: 30px;">
        <ul>
            <li>头像文件: <input name="userfile" type="file"></li>

            <input type="submit">
        </ul>

    </form>
</div>

{include file="footer.tpl"}

</body>
</html>
