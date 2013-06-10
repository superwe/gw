<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/speech.css" />
    <link rel="stylesheet" type="text/css" href="/css/group.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <title>首页-畅捷通-企业空间</title>
</head>
<body>
{include file="employee/header.tpl"}
<div class="container clearfix" style="width:980px;margin-top:25px;">
   {include file="employee/leftbar.tpl"}
   <div class="grid home_wrap group_wrap">
        {include file="employee/group/head.tpl"}
        <div class= "groupMain">
        {if $status ==2}
        <p>这是一个私人群组，请申请加入后查看该群组信息。</p>
        {else if $status ==3}
        <p>您已加入群组，请等待管理员审核。</p>
        {else}
        	<div class = "groupMainLeft">
        	  <div id="speechArea" style="width:620px">
			  {include file="employee/_common/speechEditor.tpl"}
              {include file="employee/_common/speechEditorJsTemplate.tpl"}
			  </div>
		      <div class="feed_div" id="{$group['id']}">

	          </div>
	          <div style="margin: 10px 15px;" class="bottomMore clearfix" id="footer_morefeed">
	              <a href="javascript:;" id="index_moreFeed" data="/employee/group/feed?id={$group['id']}" resource-id="feed_div">查看更多&gt;&gt;</a>
	          </div>
        	</div>
        	<div class = "groupMainRight">
        		<div class="box">
        			<a href="javascript:void(0)" id="addEmployee" class="button_gray group_button">添加成员</a>
        			<a href="javascript:void(0)" id="upload" class="button_blue group_button">上传文档</a>
        		</div>
        		<div class="box">
        			<h1>群组公告</h1>
        			<p>{$group['announce']}</p>
        		</div>
        		<div class="box">
        			<h1>热门文档<span><a href="/employee/group/file?id={$group['id']}">>></a></span></h1>
        			<ul>
        				{foreach from = $hotFiles item = file}
        				<li><h2><a href="/employee/file/view?fileid={$file['id']}">{$file['title']}</a></h2><span>{$file['createtime']}</span></li>
        				{/foreach}
        			</ul>
        		</div>
        		<div class="box">
        			<h1>成员({$employeeTotal[0]['num']})<span><a href="/employee/group/employee?id={$group['id']}">>></a></span></h1>
        			<ul class="employeeListUl user_card">
        				{foreach from = $employeeList item = employee}
        				<li><a class="boxLiLeft" href="/employee/homepage/index?employeeid={$employee['employeeid']}" title="{$employee['name']}" tips="1" rel ="/employee/employee/cardInfo/{$employee['employeeid']}">{avatar pic=$employee['imageurl']  size='small' title=$employee['name']}</a><span class="boxLiRight"><a href="#">{$employee['name']}</a></span></li>
        				{/foreach}
        			</ul>
        		</div>
        	</div>
        {/if}
        </div>
    </div>
</div>
<script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script src="/js/yonyou/lib/yonyou.js"></script>
<script src="/js/yonyou/lib/yy.core.js"></script>
<script src="/js/yonyou/modules/group/group_feed.js"></script>
<script type="text/javascript" src="/js/yonyou/modules/speech/speech.js"></script>
{include file="employee/footer.tpl"}
<script src="/js/yonyou/widgets/tips/tips.js"></script>
<script>
(function($, YY, util){
	$(function(){
		//用户卡片;
        var userCard = new YY.Tips({
            wrapper: '.user_card',
            tipClass: 'mp_div',
            remote: true,
            events: 'hover'
        });
        // 初始化任务卡片的tips;
        userCard.init();
		//新建成员分组弹出层
        YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js'], {
            fn: function(){
				var dialog_obj = new YY.SimpleDialog({
					'width'	: 400,
					'height': 200,
					'title'	: '上传文档至群组文档',
					'overlay' : true,
					'autoOpen': false,
					'url'	: '/employee/group/upload?id={$group["id"]}&name={$group["name"]}',
					'onConfirm': function(){
						$('#file').submit();
	                	return true;
		            }
				});
				$('#upload').on({
					'click': function(){
						dialog_obj.open();
					}
				});
			}
		});
	});
}(jQuery, YonYou, YonYou.util));
(function($, YY, util){
	$(function(){
		//新建成员分组弹出层
        YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js'], {
            fn: function(){
				var dialog_obj = new YY.SimpleDialog({
					'width'	: 400,
					'height': 200,
					'title'	: '添加群组成员',
					'overlay' : true,
					'autoOpen': false,
					'hasFooter' : false,
					'url'	: '/employee/group/addGroupEmployee?id={$group["id"]}',
					'onConfirm': function(){
						$('#addGroupEmployee').submit();
	                	return true;
		            }
				});
				$('#addEmployee').on({
					'click': function(){
						dialog_obj.open();
					}
				});
			}
		});
     	// 加载发言编辑器js
        util.loadScript(['yonyou/widgets/speechEditor/speechEditor.js'], {
            fn: function(){
                var editor_int = new YY.SpeechEditor({
                    'wrap'      : $('#speechArea .editor-wrap'), // 编辑框的包裹起
                    'searchUrl' : util.url('/common/search/index'), // 搜索@和#的URL
                    'auto'      : false, // 自动初始化
                    'feature' : { // 支持的功能
                        'face' : true,  // 表情
                        'at'   : true,  // @
                        'file' : true,  // 上传文件
                        'video': false  // 添加视频
                    }
                });
                editor_int.init();
            }
        });
	});
}(jQuery, YonYou, YonYou.util));
</script>
<script type="text/javascript">
    window.sessid = "{session_id()}";
    window.rscallback = "{$rscallback}";
    window.rscallbackflag = "{$rscallbackflag}";
    if(rscallback != '') $.yy.rscallback(rscallback, rscallbackflag);
</script>
</body>
</html>

