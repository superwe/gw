<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <link rel="stylesheet" type="text/css" href="/css/speech.css" />
    <script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script src="/js/yonyou/lib/yonyou.js"></script>
    <script src="/js/yonyou/lib/yy.core.js"></script>
    <script src="/js/swfupload/swfupload.js"></script>
    <script src="/js/swfupload/swfupload.queue.js"></script>
    <script src="/js/swfupload/yy.upload.handlers.js"></script>
    <script src="/js/yonyou/lib/yy.uploadready.js"></script>
    <script src="/js/yonyou/modules/speech/speech.js"></script>
    <script type="text/javascript">
        $(function(){

            new InitUpload({
                debug: false,
                button_placeholder_id: 'spanButtonPlaceHolder',
                upload_url: '/employee/upload/index.html'
            });

            /*var speechids = [4,5,6,7,8];
            $.post("/employee/speech/getSpeechList.html",{ speechids:speechids },function(data){
                var strHtml ='';
                YY.loadScript(['yonyou/templates/attachment.js',
                    'yonyou/templates/pic.js',
                    'yonyou/templates/speech_add.js'], {
                    fn: function(){
                        $.each(data, function(i, item){
                            strHtml += YY.feedTemplate.speech_add(data[i]);
                        });

                        $(".speakWrap").html(strHtml);
                    }
                });
            },"json");*/

            /*$.post("/employee/speech/getSpeech.html",{ speechid:4 },function(data){
                var strHtml ='';
                YY.loadScript(['yonyou/templates/attachment.js',
                    'yonyou/templates/pic.js',
                    'yonyou/templates/speech_add.js'], {
                    fn: function(){
                        strHtml = YY.feedTemplate.speech_add(data);
                        $(".speakWrap").html(strHtml+strHtml);
                    }
                });


            },"json");*/

        });
    </script>
    <title>发言-畅捷通-企业空间</title>
</head>

<body>
{include file="employee/header.tpl"}

<div class="container clearfix" style="width:980px;margin-top:25px;">
    {include file="employee/leftbar.tpl"}

    {* 发言*}
    <div class="speakWrap">
        <form id="speechForm" method="post" action="/employee/speech/addSpeech.html">
            <div id="switch_div">

                <input type="hidden" name="redirect" value="/space/home/index">
                <div style="position:relative;display:block;">
                    <textarea id="content_div" name="content" ele-role="textarea" class="textarea01" contenteditable="true" onpaste=" var self = this;setTimeout(function(){ coreFun.paste(self); },50);" style="min-height: 40px; height: auto;"></textarea>
                    <a ele_role="need" default="金雪莲" member_id="37871" href="http://esn.uu.com.cn/space/cons/index/id/37871" category="10" tabindex="-1" rel="/api/ajax/partnerinfo/pid/37871" tips="1" class="ya_contentA iconY_01" rnum="9671346">金雪莲</a>
                    <span class="yy-font-num" style="bottom:0px;position:absolute;font-size:24px;right:10px;color:#CCC;opacity:0.5;filter:alpha(opacity:50);">400</span>
                </div>
                群组ID：<input id="groupid" name="groupid" type="text" value="0">
                <input type="hidden" id="fileids" name="fileids" value="">
            </div>
            <div>表情 <a style="float: right;"><input type="checkbox" name="chk_at_see"/>仅@人可见</a> </div>
            <div style="margin-top: 20px;">

                <input type="submit" id="savesubmit" style="float: right;" value="发布" title="Ctrl+Enter">
            </div>
        </form>


        <div id="SearchList" style="position: absolute; left: 352px; top: 235px; display: block;">
            <span class="xsj"></span>
            <span class="xsj2"></span>
            <h3 class="list-title">继续键入以搜索用户、内容</h3>
            <ul class="list-content">

                <li class="item">
                    <span class="iconEmployee tkIcoBox"></span>
                    <a class="employeeInfoA"  tips="1" rel="/employee/employee/cardInfo/2" default="李胜" member_id="2" category="10" tabindex="-1">
                        <img style="display: inline-block" src="http://staticoss.chanjet.com/qiater/avatar/000/00/00/02.jpg.thumb.jpg">
                        <span  style="display: inline-block">
                            <span>李胜</span>
                            <span class="marLeft4" title="lishengb@chanje...">lishengb@chanje...</span>
                            <span class="block">研发-水平-产品管理</span>
                        </span>
                    </a>
                </li>

                <li class="item">
                    <a class="employeeInfoA"  tips="1" rel="/employee/employee/cardInfo/2" default="李胜" member_id="2" category="10" tabindex="-1">
                        <img style="display: inline-block" src="http://staticoss.chanjet.com/qiater/avatar/000/00/00/02.jpg.thumb.jpg">
                        <span  style="display: inline-block">
                            <span>李胜</span>
                            <span class="marLeft4" title="lishengb@chanje...">lishengb@chanje...</span>
                            <span class="block">研发-水平-产品管理</span>
                        </span>

                    </a>
                </li>
            </ul>
        </div>
    </div>

</div>



{include file="employee/footer.tpl"}
</body>
</html>

