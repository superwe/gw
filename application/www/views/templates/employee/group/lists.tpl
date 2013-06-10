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
        <div class="group_header">
			<div class="title">群组</div>
		    <div class="introduce">所有加入外部社区的用户都会默认进入“外部社区”群组</div>
		    <a href="javascript:;" id="add" class="button_blue creator">创建群组</a>
		    <ul class="tab">
		    	<li><a href="/employee/group/lists" class="selected">所有群组</a></li>
		        <li><a href="/employee/group/mylist">我的群组</a></li>
		    </ul>
		</div>
        <div class="group_content">
            <h1><span style="font-size: 20px;"><a class="letter" href="javascript:;" letter="">所有</a></span>
                |<a class="letter" href="javascript:;" letter="a">A</a>|<a class="letter" href="javascript:;" letter="b">B</a>|<a class="letter" href="javascript:;" letter="c">C</a>|<a class="letter" href="javascript:;" letter="d">D</a>|<a class="letter" href="javascript:;" letter="e">E</a>
                |<a class="letter" href="javascript:;" letter="f">F</a>|<a class="letter" href="javascript:;" letter="g">G</a>|<a class="letter" href="javascript:;" letter="h">H</a>|<a class="letter" href="javascript:;" letter="i">I</a>|<a class="letter" href="javascript:;" letter="j">J</a>
                |<a class="letter" href="javascript:;" letter="k">K</a>|<a class="letter" href="javascript:;" letter="l">L</a>|<a class="letter" href="javascript:;" letter="m">M</a>|<a class="letter" href="javascript:;" letter="n">N</a>|<a class="letter" href="javascript:;" letter="o">O</a>
                |<a class="letter" href="javascript:;" letter="p">P</a>|<a class="letter" href="javascript:;" letter="q">Q</a>|<a class="letter" href="javascript:;" letter="r">R</a>|<a class="letter" href="javascript:;" letter="s">S</a>|<a class="letter" href="javascript:;" letter="t">T</a>
                |<a class="letter" href="javascript:;" letter="u">U</a>|<a class="letter" href="javascript:;" letter="v">V</a>|<a class="letter" href="javascript:;" letter="w">W</a>|<a class="letter" href="javascript:;" letter="x">X</a>|<a class="letter" href="javascript:;" letter="y">Y</a>
                |<a class="letter" href="javascript:;" letter="z">Z</a>
            </h1>
            <table id="yyDataTable" cellpadding="0" cellspacing="0">
                <thead><tr></tr></thead>
                <tfoot style="display:none;"></tfoot>
                <tbody></tbody>
            </table>
            <div id="yyActLine" class="grid container" style="margin-top: 10px;width: 760px;">
				 <div class="grid_12 yy-page-line"></div>
			</div>
        </div> 
    </div>
</div>
<script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script src="/js/yonyou/lib/yonyou.js"></script>
<script src="/js/yonyou/lib/yy.core.js"></script>
{include file="employee/footer.tpl"}
<script type="text/javascript">
(function($, YY, util){
		YY.loadScript('yonyou/widgets/dataTable/dataTable.js', {
            fn: function() {
                var remoteUrl = util.url('employee/group/ajaxGetGroupList'); // 请求远程数据的uri地址
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
//                		dtObj.resetParamData();
                		dtObj.setRemoteUrl(util.url('employee/group/ajaxGetGroupList?letter='+letter));
                		dtObj.reloadBody();
                	}
               	});
                            
                util.trace(dtObj)
        	}
		});
}(jQuery, YonYou, YonYou.util));

(function($, YY, util){
	//加入群组和退出群组
  	$('a.group_button').live('click', function() {
  		if($(this).html() == '加入群组'){
      		$(this).removeClass('button_blue');
      		$(this).addClass('button_gray');
      		$(this).html('退出群组');
  		}else{
  			$(this).removeClass('button_gray');
      		$(this).addClass('button_blue');
      		$(this).html('加入群组');
  		}
  	});
  	$(function(){
		//新建成员分组弹出层
        YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js'], {
            fn: function(){
				var dialog_obj = new YY.SimpleDialog({
					'width'	: 500,
					'height': 350,
					'title'	: '创建群组',
					'overlay' : true,
					'autoOpen': false,
					'url'	: '/employee/group/create',
					'onConfirm': function(){
						$('#group').submit();
	                	return true;
		            }
				});
				$('#add').on({
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

