<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/group.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <title>首页-畅捷通-企业空间</title>
</head>
<body>
{include file="employee/header.tpl"}
<div class="container clearfix" style="width:980px;margin-top:25px;">
   {include file="employee/leftbar.tpl"}
   <div class="grid group_wrap">
        {include file="employee/group/head.tpl"}
        <div class="group_content">
        {if $status ==2}
        <p class="groupMess">这是一个私人群组，请申请加入后查看该群组信息。</p>
        {else if $status ==3}
        <p class="groupMess">您已加入群组，请等待管理员审核。</p>
        {else}
			<div class="fileTop">
				<a class="uploadFileGroup button_blue group_button" href="javascript:;" id="upload">上传文档</a>
			</div>
			<table id="yyDataTable" cellpadding="0" cellspacing="0">
                <thead><tr></tr></thead>
                <tfoot style="display:none;"></tfoot>
                <tbody></tbody>
            </table>
            <div id="yyActLine" class="grid container" style="margin-top: 10px;width: 760px;">
				 <div class="grid_12 yy-page-line"></div>
			</div>
        {/if}
        </div> 
    </div>
</div>
<script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script src="/js/yonyou/lib/yonyou.js"></script>
<script src="/js/yonyou/lib/yy.core.js"></script>
{include file="employee/footer.tpl"}
<script>
(function($, YY, util){
	$(function(){
		$(".yy-file-op").live("hover", function(){
			var a = $(this).attr("id");
			$("#"+a+" .tkBox").show();
		});
		$(".yy-file-op").live("mouseleave", function(){
			var a = $(this).attr("id");
			$("#"+a+" .tkBox").hide();
		});
        YY.loadScript('yonyou/widgets/dataTable/dataTable.js', {
            fn: function() {
                var remoteUrl = util.url('employee/group/ajaxGetGroupFileList?id={$group["id"]}'); // 请求远程数据的uri地址

                // 初始化数据表格对象;
                var dtObj = new YY.DataTable({
                    // 表格选择器;
                    selector: '#yyDataTable',
                    // 操作按钮所在的块(包括上下翻页、各种批量操作等);
                    actLine: '#yyActLine',
                    // 页码行;
                    pageLine: '.yy-page-line',
                    // 每页显示的数量;
                    perPage: 10,
                    // 分页中显示的数量，最好使用基数，易于对称性;
                    pageCount: 9,
                    // 远程获取数据的URL;
                    remoteUrl: remoteUrl,
                    // 表示是否一次性获取所有数据;
                    isOnce: false,
                    success: function() {
                        // do nothing
                    }
                });
                util.trace(dtObj)
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
</script>
<script type="text/javascript">
    window.sessid = "{session_id()}";
    window.rscallback = "{$rscallback}";
    window.rscallbackflag = "{$rscallbackflag}";
    if(rscallback != '') $.yy.rscallback(rscallback, rscallbackflag);
</script>
</body>
</html>

