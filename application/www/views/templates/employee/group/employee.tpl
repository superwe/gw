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
        	<h1><span style="font-size: 20px;"><a class="letter" href="javascript:;" letter="">所有</a></span>
                |<a class="letter" href="javascript:;" letter="a">A</a>|<a class="letter" href="javascript:;" letter="b">B</a>|<a class="letter" href="javascript:;" letter="c">C</a>|<a class="letter" href="javascript:;" letter="d">D</a>|<a class="letter" href="javascript:;" letter="e">E</a>
                |<a class="letter" href="javascript:;" letter="f">F</a>|<a class="letter" href="javascript:;" letter="g">G</a>|<a class="letter" href="javascript:;" letter="h">H</a>|<a class="letter" href="javascript:;" letter="i">I</a>|<a class="letter" href="javascript:;" letter="j">J</a>
                |<a class="letter" href="javascript:;" letter="k">K</a>|<a class="letter" href="javascript:;" letter="l">L</a>|<a class="letter" href="javascript:;" letter="m">M</a>|<a class="letter" href="javascript:;" letter="n">N</a>|<a class="letter" href="javascript:;" letter="o">O</a>
                |<a class="letter" href="javascript:;" letter="p">P</a>|<a class="letter" href="javascript:;" letter="q">Q</a>|<a class="letter" href="javascript:;" letter="r">R</a>|<a class="letter" href="javascript:;" letter="s">S</a>|<a class="letter" href="javascript:;" letter="t">T</a>
                |<a class="letter" href="javascript:;" letter="u">U</a>|<a class="letter" href="javascript:;" letter="v">V</a>|<a class="letter" href="javascript:;" letter="w">W</a>|<a class="letter" href="javascript:;" letter="x">X</a>|<a class="letter" href="javascript:;" letter="y">Y</a>
                |<a class="letter" href="javascript:;" letter="z">Z</a>
            </h1>
			<table id="yyDataTable" cellpadding="0" cellspacing="0" class="user_card">
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
	$(function(e){
		//加关注、取消关注
        $("a.yy-follow").live("click", function(){
            var target = $(this);
        	var type = target.attr('type');
        	YY.util.ajaxApi(util.url('/employee/follow/ajaxFollow'), function(obj){
            	target.html(type == 1 ? '取消关注' : '加关注');
            	target.attr('type', type == 1 ? '0' : '1');
            	target.removeClass('button_blue button_gray').addClass(type == 1 ? 'button_gray' : 'button_blue');
        	}, 'GET', 'JSON', { followid : target.attr('for'), followtype : target.attr('role'), op : type});
        });
  		// 表格数据加载
        YY.loadScript('yonyou/widgets/dataTable/dataTable.js', {
            fn: function() {
                var remoteUrl = util.url('employee/group/ajaxGetEemployeeList?id={$group['id']}'); // 请求远程数据的uri地址

                // 初始化数据表格对象;
                var dtObj = new YY.DataTable({
                    // 表格选择器;
                    selector: '#yyDataTable',
                    // 操作按钮所在的块(包括上下翻页、各种批量操作等);
                    actLine: '#yyActLine',
                    // 页码行;
                    pageLine: '.yy-page-line',
                    // 每页显示的数量;
                    perPage: 5,
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
                $('a.letter').on({
                	'click' : function(e){
                		var letter = $(this).attr("letter");
                		dtObj.setRemoteUrl(util.url('employee/group/ajaxGetEemployeeList?id={$group['id']}&letter='+letter));
                		dtObj.reloadBody();
                	}
               	});     
                util.trace(dtObj)
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

