/**
 * 群组js
 * @required jQuery YonYou YonYou.util
 */
(function($, YY, util){
	// DOM ready;
    $(function(){
		//新建群组弹出层
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
				$('#creator').on({
					'click': function(){
						dialog_obj.open();
					}
				});
			}
	    });
	});
}(jQuery, YonYou, YonYou.util));
