<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <style type="">
div.group_wrap div.group_header ul.tab li a {
	width: 75px;
}
div.group_wrap div.group_header ul.tab li a {
	width: 75px;
	border: 0px;
}
.sTitle{
	font-size: 14px;
	line-height:30px;
}
.w50{
	width:50px;
}
.w710{
	width:710px;
}
div.group_wrap div.group_header ul.tab li a.selected{
	width:100px;
}
div.group_wrap div.group_content table a.sName {
	font-size: 14px;
	color: #0178B3;
}
.lCorner {
	border-color: transparent transparent transparent #999;
	display: inline-block;
	margin-left:8px;
	height:12px;
	width: 0;
	height: 0;
	border-style: solid;
	border-width: 5px;
	font-size: 0;
	overflow: hidden;
}
mark {
	background-color:white;
	color:red
}
div.group_wrap div.group_content {
	border:0px;
}
ul.tab li span{
	font-size:10px;
}
    </style>
    <title>首页-畅捷通-企业空间</title>
</head>
<body>
{include file="employee/header.tpl"}
<div class="container clearfix" style="width:980px;margin-top:25px;">
	{include file="employee/leftbar.tpl"}
   <div class="grid group_wrap">
   		<div class="group_header">
			<div class="title">搜索结果</div>
		    <div class="introduce">您搜索的是：“<span id="searchresult" class="rcolor2"></span>”，找到相关结果共<span id="total" class="rcolor2"></span>条，耗时<span id="time" class="rcolor2">0.001</span>秒</div>
		    <ul class="tab _search">
		    	<li><a mtype="all" href="javascript:;" class="selected">全部<span id="m_total">(0)</span></a></li>    
				<li><a mtype="employee" href="javascript:;">用户<span id="m_employee">(0)</span></a></li>    
				<li><a mtype="group" href="javascript:;">群组<span id="m_group">(0)</span></a></li>    
				<li><a mtype="files" href="javascript:;">文档<span id="m_files">(0)</span></a></li>    
				<li><a mtype="topic" href="javascript:;">话题<span id="m_topic">(0)</span></a></li>    
				<li><a mtype="vote" href="javascript:;">投票<span id="m_vote">(0)</span></a></li>    
				<li><a mtype="speech" href="javascript:;">发言<span id="m_speech">(0)</span></a></li>    
				<li><a mtype="schedule" href="javascript:;">日程<span id="m_schedule">(0)</span></a></li>    
				<li><a mtype="task" href="javascript:;">任务<span id="m_task">(0)</span></a></li>    
				<li><a mtype="announce" href="javascript:;">公告<span id="m_announce">(0)</span></a></li>
		    </ul>
		</div>
		<div class="group_content">
			<div class="yy-time-select">
			<input id="inputkey" name="key" type="text" value="" size = 50>
			发表于
            <span class="start">
                <input id="inputdatestart" type="text" name="datestart" style="width:70px;" readonly="readonly" class="date" value="">-
                <input id="inputtimestart" type="text" name="timestart" style="width:40px;" class="time" value="">
            </span>
            至
            <span class="end">
                <input id="inputdateend" type="text" name="dateend" style="width:70px;" class="date" readonly="readonly" value="">-
                <input id="inputtimeend" type="text" name="timeend" style="width:40px;" class="time" value="">
            </span>
            <input id="inputsubmit" name="submit" type="button" value="提交">
            </div>
			<table id="yyDataTable" cellpadding="0" cellspacing="0">
                <thead><tr></tr></thead>
                <tfoot style="display:none;"></tfoot>
                <tbody></tbody>
            </table>
		</div>
	</div>
	 <div id="yyActLine" class="grid container" style="margin-top: 10px;width: 980px;">
		 <div class="grid_12 yy-page-line"></div>
	</div>
</div>
<script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script src="/js/yonyou/lib/yonyou.js"></script>
{include file="employee/footer.tpl"}
<script type="text/javascript">
(function($, YY, util){
	$(function(){
		var uri = '';
		
		YY.loadScript(['yonyou/widgets/dateSelector/dateSelector.js'], {
            fn: function(){
                new YY.DateSelector({
                    wrap : '.yy-time-select'
                });
            }
        });
        
        $('ul._search').on({
        	'click' : function(e){
        		var obj = $(e.target),
        			objParent = obj.closest('li');
        		//console.log(obj);console.log(objParent);
        		if (objParent.is('li')) {
	        		var	obja = objParent.find('a');
	        		$(this).find('a.selected').removeClass('selected');
	        		obja.addClass('selected');
	        		if (uri != '') {
	    				var mtype = obja.attr('mtype');
	    				uri = uri.replace(/type=(\w*)/i, "type=" + mtype);
	    				search(uri, mtype, 0);
	    			}
	    		}
        		
        		return false;
        	}
       	});
       	
       	$('#inputsubmit').on({
       		'click' : function(e) {
       			var obj = $(e.target);
       			if (obj.is('input')) {
       				//提交动作先清零
       				$('ul._search').find('span').html('(0)');
       				var type = $('ul._search').find('a.selected').attr('mtype'),
       					key = $('#inputkey').val(),
       					datestart = $('#inputdatestart').val(),
       					timestart = $('#inputtimestart').val(),
       					dateend = $('#inputdateend').val(),
       					timeend = $('#inputtimeend').val();
       				$('#searchresult').html(key);
       				uri = '?key=' + key + '&type=' + type + '&datestart=' + datestart + 
       					  '&timestart=' + timestart + '&dateend=' + dateend + '&timeend=' + timeend;
       				search(uri, type, 1);
       			}
       		}
       	});
       	
       	function search(uri, type, submit) {
	        YY.loadScript('yonyou/widgets/dataTable/dataTable.js', {
	            fn: function() {
	                var remoteUrl = '/employee/search/ajaxSearch.html' + uri;
	
	                // 初始化数据表格对象;
	                var dtObj = new YY.DataTable({
	                    // 表格选择器;
	                    selector: '#yyDataTable',
	                    // 操作按钮所在的块(包括上下翻页、各种批量操作等);
	                    actLine: '#yyActLine',
	                    // 页码行;
	                    pageLine: '.yy-page-line',
	                    // 每页显示的数量;
	                    perPage: {$limit},
	                    // 分页中显示的数量，最好使用基数，易于对称性;
	                    pageCount: 9,
	                    // 远程获取数据的URL;
	                    remoteUrl: remoteUrl,
	                    // 表示是否一次性获取所有数据;
	                    isOnce: false,
	                    success: function(d) {
	                        //util.trace(d);
	                        var total = d.total;
	                        if (submit) {
		                        $("#total").html(total);
		                        $("#m_total").html('(' + total + ')');
	                        }
	                        $("#time").html(d.time);
	                        if (total != 0) {
	                        	if (type == 'all') {
		                        	$("#total").html(total);
			                        $("#m_total").html('(' + total + ')');
		                        	YY.util.ajaxApi('/employee/search/getnumber.html' + uri, function(d){
							            $.each(d, function(key, value){
							            	if (value != 0) $("#m_" + key).html('(' + value + ')');
							            });
									}, 'GET', 'JSON');
								} else {
									$("#m_" + type).html('(' + total + ')');
								}
	                        }
	                    }
	                });
	                util.trace(dtObj)
	        	}
			});
		}
	});
}(jQuery, YonYou, YonYou.util));
</script>
</body>
</html>
