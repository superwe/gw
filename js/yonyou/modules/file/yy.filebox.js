/*文件选择框*/

//获得右侧文档列表
function getContent(href){
	YY.util.ajaxApi(href, function(htm){
		var $containter = $('#selectedfileTable');
		$containter.html('');
		$(htm).appendTo($containter);
	}, 'POST', 'html');
}
//重置选项
function resetSelected(){
	$('#selectedfileAdd').removeClass('blueButton').addClass('grayButton');
	$('.yy-attatchment-tr', '#selectedfileTable').removeClass('yy-attatchment-selected');
}
//弹出框关闭按钮
$('#selectedfileClose').live('click', function(){
	//$('#selectedfileDiv').hide();
	//resetSelected();
	$.fancybox.close();
});

//点击左侧导航
$('.yy-file-selected-link', '#selectedfileAside').live('click', function(){
	$(".selectTkContL a").removeClass('cur');
	$(this).addClass('cur');
	var href = $(this).attr('href');
	getContent(href);
	resetSelected();
	return false;
});

//选择一行
$('.yy-attatchment-tr').live('click', function(){
	$('#selectedfileAdd').removeClass('grayButton').addClass('blueButton');
	$('.yy-attatchment-tr', '#selectedfileTable').removeClass('yy-attatchment-selected');
	$(this).addClass('yy-attatchment-selected');
	return false;
});

//取消选择
$('#selectedFileCancel').live('click', function(){
	resetSelected();
	return false;
});

//添加文档
$('#selectedfileAdd').live('click', function(){
	if($('#selectedfileAdd').hasClass('grayButton')){
		return false;
	}
	$('#selectedfileClose').trigger('click');
	//console.log($('.yy-attatchment-selected', '#selectedfileTable'));
});
