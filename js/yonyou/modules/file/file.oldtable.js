var fileoldTable = function(remoteUrl){
	var _self = this,
		oldtableSelector = '#yyGroupTable',
		$oldtable,
		remoteUrl = remoteUrl != '' ? YY.util.url(remoteUrl) : '';

	//加载原来旧表格
	function reloadoldTable(){
		$oldtable = new YY.DataTable({
				// 表格选择器;
				selector: '#yyGroupTable',
				// 操作按钮所在的块(包括上下翻页、各种批量操作等);
				actLine: '#yyGroupPage',
				// 页码行;
				pageLine: '.yy-page-line',
				// 页码按钮;
				pageBtn: '.yy-page',
				// 上一页翻页按钮;
				nextBtn: '.yy-next-page',
				// 下一页翻页按钮;
				prevBtn: '.yy-prev-page',
				// 第一页翻页按钮;
				firstBtn: '.yy-first',
				// 最后页翻页按钮;
				lastBtn: '.yy-last',
				perPage: 15,
				// 分页中显示的数量，最好使用基数，易于对称性;
				pageCount: 15,
				// 远程获取数据的URL;
				remoteUrl: YY.util.url(remoteUrl),
				// 表示是否一次性获取所有数据;
				isOnce: false,
				success: function() {
					// do nothing
				}
			});
		return $oldtable;
	}

	reloadoldTable();

	_self.getoldTableSelector = function(){
		return oldtableSelector;
	};

	//重构旧表格
	_self.oldreload = function (remoteUrl, num, callback){
		//删除无用层---特例
		$('#corp-newfloder-containter').remove();
		if(arguments.length > 0 && remoteUrl)
		$oldtable.setRemoteUrl(remoteUrl);
		$oldtable.reloadTable(callback);
	};
	
};