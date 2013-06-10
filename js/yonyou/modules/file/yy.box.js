$(document).ready(function() {

	function initSubmit(){	
		$("#addboxForm").validate({
			validClass: 'icoRightsss',
			errorClass : 'icoWrong',
			errorBg: 'yellowBg',
			hasIco: false,
			rules: {
				boxname: "required"
		  	},
		    messages: {
		    	boxname: { required:"文件夹名称必须填写" }
		   	}
		});

	}
	$("#addbox").live('click', function(){
		var obj = $(this);
		var href = yyBaseurl + '/file/box/addbox/boxid/'+obj.attr('data');
		$.fancybox({
			'modal'			: true,
			'width'			: 500,
			'height'		: 300,
			'transitionIn'	: 'elastic',
			'transitionOut'	: 'elastic',
			'speedIn'       : 200,
			'speedOut'      : 200,
			'href'			: href,
			'onComplete'	: function(){
				$("#addboxForm").validate({
					validClass: 'icoRightsss',
					errorClass : 'icoWrong',
					errorBg: 'yellowBg',
					hasIco: false,
					rules: {
						boxname: "required"
					},
					messages: {
						boxname: { required:"文件夹名称必须填写" }
					}
				});
			}
		});
	});
	$("#group_addbox").live('click', function(){
		var obj = $(this);
		var pid = obj.attr('pid');
		var href = yyBaseurl + '/file/box/groupaddbox/boxid/'+obj.attr('data')+'/pid/'+pid;
		$.fancybox({
			'modal'			: true,
			'width'			: 500,
			'height'		: 300,
			'transitionIn'	: 'elastic',
			'transitionOut'	: 'elastic',
			'speedIn'       : 200,
			'speedOut'      : 200,
			'href'			: href,
			'onComplete'	: function(){
				//管理员联想
				$('#adminuser').yyautocomplete({
					appendTo: "#admin_div",
					ajaxUrl: url('/common/search/ccnotice'),
					selAppendTo: "#admin_list",
					select:function(event, ui){
					}
				});
				//管理员联想
				$('#personuser').yyautocomplete({
					appendTo: "#person_div",
					ajaxUrl: url('/common/search/ccnotice'),
					selAppendTo: "#person_list",
					select:function(event, ui){
					}
				});
				$("#addboxForm").validate({
					validClass: 'icoRightsss',
					errorClass : 'icoWrong',
					errorBg: 'yellowBg',
					hasIco: false,
					rules: {
						boxname: "required"
					},
					messages: {
						boxname: { required:"文件夹名称必须填写" }
					}
				});
			}
		});
	});
	$("#close").live('click', function(){$(".add_box").hide();});

	//共享人弹框
	$('.share_member').live({
		mouseenter: function(){
			var $me = $(this);
			$me.children().addClass('relative').children('aside').removeClass('hidden');
		},
		mouseleave: function(){
			var $me = $(this);
			$me.children().removeClass('relative').children('aside').addClass('hidden');
		}
	});

	//排序 升序
	$('.zsUp').live('click', function(){
		var $me = $(this);
		var request_url = yyBaseurl + "/file/box/orderup",
			request_data = {
				boxid: $me.attr('boxid'),
				pid:$me.attr('pid'),
				type:$me.attr('type')
			};
		YY.util.ajaxApi(request_url, function(d,s){
			if (d && d.rs==true && d.type==='upper' && s==='success'){
				$.yy.rscallback('操作成功！');
				window.location.reload();
			}
		},'GET','json',request_data);
	});
	
	//排序 升序
	$('.zsDown').live('click', function(){
		var $me = $(this);
		var request_url = yyBaseurl + "/file/box/orderdown",
			request_data = {
				boxid: $me.attr('boxid'),
				pid:$me.attr('pid'),
				type:$me.attr('type')
			};
		YY.util.ajaxApi(request_url, function(d,s){
			if (d && d.rs==true && d.type==='downer' && s==='success'){
				$.yy.rscallback('操作成功！');
				window.location.reload();
			}
		},'GET','json',request_data);
	});
	
});