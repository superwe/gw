var docBoxAdd = function() {
	//输入框默认文字
	$.yy.defaultText({
		notice_p: {txt: '发布人'},
		notice_n : { txt: '浏览人'}
		
	});
	var self = this;
	
	self.searchMemberAdd = function (obj){
		var html = '', html1 = '', html2 = '', dot = '';
		var con = $("#selectedContainter").find("figure");
		if(con.length < 1) {
			obj.parent().prepend('<font color="red">请选择人员！</font>');
			return;
		}
		for(var i=0; i<con.length; i++){
			var itemid = $(con[i]).attr("itemid");
			var rname = $(con[i]).text().split('(');
			if($('#yyhidden_inp_'+itemid).length == 0){ //过滤重复的
				html += '<input id="yyhidden_inp_' + itemid + '" type="hidden" class="friendid" value="'+ itemid +'">';
				dot = i != (con.length-1) ? ',' : '';
				html1 += rname[0] + dot;
				html2 += itemid + dot;
			}
		}
		$("#taskMemberListBox").find("input.friendid").remove();
		$("#keywords").val(html2);
		$("#taskMemberListBox").append(html).find('span').html(html1);
		$.fancybox.cancel();
		$.fancybox.close();
	};
	//发布人
	$('#notice_p').yyautocomplete({
		defaultValue: noticemember.upsetmember,
		appendTo: "#notice_div",
		selAppendTo: "#notice_list",
		ajaxUrl: yyBaseurl + "/common/search/ccnotice"
	});

	//浏览人
	$('#notice_n').yyautocomplete({
		defaultValue: noticemember.viewsetmember,
		appendTo: "#notice_div_n",
		selAppendTo: "#notice_list_n",
		ajaxUrl: yyBaseurl + "/common/search/ccnotice"
	});
			
	//弹出组织架构树
	$(".rcAddmenr").fancybox({
		onComplete:function(e){
			var ulbox = {};
			ulbox = $(e).parent().parent().find('.rcAddmenListUl');
			var toDiv = $(e).attr("for");
			$("#consoleBtn_"+toDiv).bind('click', function(){
				if(toDiv == 'keywords'){
					self.searchMemberAdd($(this)); //执行自定义的函数
				}else {
					var html = '';
					var con = $("#selectedContainter").find("figure");
					if(con.length < 1) {
						$('#msgNote').html('请选择人员!');
						return;
					}
					for(var i=0; i<con.length; i++){
						var itemid = $(con[i]).attr("itemid");
						var rname = $(con[i]).text().split('(');
						if($('#yyauto_li_'+itemid).length == 0){ //过滤重复的
							html += '<li id="yyauto_li_' + itemid + '" class="clearfix rcAddmenListli"><span>' + rname[0] + '</span><input type="hidden" value="'
							+ itemid + '" name="'+toDiv+'_value[]"><a class="close" href="javascript:;"></a></li>';
						}
					}
					$(ulbox).prepend(html).find('.close').bind('click', function(){
						$(this).parent().remove();
					});
					$.fancybox.cancel();
					$.fancybox.close();
				}
			});
		}
	});
	$("#viewset").live('click',function(){
		var viewMember = $(".viewMember");
		if(document.getElementById('viewset').checked){
			viewMember.addClass('hidden');
		}else{
			viewMember.removeClass('hidden');
		}
	});
};