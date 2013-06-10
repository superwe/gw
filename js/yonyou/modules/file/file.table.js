var fileTable = function(remoteUrl){
	var _self = this,
		tableSelector = '#yyDataList',
		$table,
		remoteUrl = remoteUrl != '' ? YY.util.url(remoteUrl) : '';
	
	// 加载数据表格;
	function loadTable(){
		$table = new YY.DataListLoader({
			// 数据列表容器，包括列表和分页;
			wrapper: tableSelector,
			dataList: '.yy-data-list',
			// 页码行包裹器;
			pageLineWrap: '.yy-page-line-wrap',
			// 页码行;
			pageLine: '.yy-page-line',
			// 页码按钮;
			pageBtn: '.yy-page',
			// 上一页翻页按钮
			nextBtn: '.yy-next-page',
			// 下一页翻页按钮
			prevBtn: '.yy-prev-page',
			// 第一页翻页按钮;
			firstBtn: '.yy-first',
			// 最后页翻页按钮;
			lastBtn: '.yy-last',
			// 每页显示的数量;
			perPage: 15,
			// 分页中显示的数量，最好使用基数，易于对称性;
			pageCount: 15,
			// 远程获取数据的URL;
			remoteUrl: remoteUrl,
			// 表示是否一次性获取所有数据;
			isOnce: false,
			success: function() {}
		});
		return $table;
	}
	loadTable();

	//重构表格
	_self.reload = function (remoteUrl, num, callback){
		//删除无用层---特例
		$('#corp-newfloder-containter').remove();
		if(arguments.length > 0 && remoteUrl)
		$table.setRemoteUrl(remoteUrl);
		$table.reloadDataList(num, callback);
	};
	
	_self.setParam = function(key, value){
		$table.setParamData(key, value);
	};

	_self.delParam = function(name){
		$table.delParamData(name);
	};
	
	_self.getTableSelector = function(){
		return tableSelector;
	};
};