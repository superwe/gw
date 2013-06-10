var shareList = function(options){
	var _self = this,
		proccess = false,
		leftArrowClass = 'yy-share-arrow-left',
		rightArrowClass = 'yy-share-arrow-right',
		arrowClass = 'yy-share-arrow',
		itemClass = 'yy-share-item',
		itemRealContainterClass = 'yy-share-containter',
		total = 0,
		page = 1, 
		pagerecord = [];
	
	function itemRender(data){
		var item = [];
		var smallAvatar = YY.util.url('/images/default_avatar_small.gif'),
			urlSpace = YY.util.url('/space/cons/index/id/'),
			urlUserCard =  YY.util.url('/api/ajax/partnerinfo/pid/');
		
		if(data.length > 0){
			for(var i=0,j=data.length;i<j;i++){
				item.push('<li rel="' + urlUserCard +data[i].id + '" class="' + itemClass + '">');
				item.push('<a href="' + urlSpace + data[i].id + '" title="'+ data[i].name + '">');
				item.push('<img width="30" src="' + YY.util.url(data[i].avatar) + '" rel="' 
								+ smallAvatar + '" /><br/>' + data[i].name + '</a></li>');
			}
		}
		
		return item.join('');
	}
	
	_self.tipRender = function($me){
		var request_url = YY.util.url($me.attr('rel')),
			page = _self.getPage(),
			nextClass = ' hidden';
		if(proccess)return;
		proccess = true;
		
		var html = [];
		html.push('<div class="fl leftPage hidden"><a class="' + leftArrowClass + ' ' + arrowClass + 
				'" href="javascript:;">&lt;&lt;</a></div><div class="fl dataDet"><ul>');		
		YY.util.ajax({url: request_url, async: false, success: function(d, s){
			var data = d.data.followers;
			total = d.data.total;
			if(data.length > 0){
				html.push(itemRender(data));
				_self.setPage(page);
				data.length < total ? nextClass = '' : '';
			}
			
			proccess = false;
		}, type: 'GET', dataType: 'json', data: {pageNum: page, pageSize: _self.options.pageSize}});
		
		html.push('</ul></div><div class="fl leftPage' + nextClass + 
				'"><a class="' + rightArrowClass + ' ' + arrowClass + 
				'" href="javascript:;">&gt;&gt;</a></div>');
		return html.join('');
	};
	
	_self.defaultRender = function($arrow){
		var $me = $(_self.options.selector),
			request_url = YY.util.url($me.attr('rel')),
			page = _self.getPage($arrow),
			$tip = $('#' + $me.attr('rnum')),
			nextClass = ' hidden';
		
		if($.inArray(page, pagerecord) >= 0){
			_self.setPage(page);
			_self.formatItem($tip);
			return;
		}
		
		if(proccess)return;
		proccess = true;
		
		var itemCount = $tip.find('.' + itemClass).length;
		YY.util.ajax({url: request_url, success: function(d,s){
			var data = d.data.followers, html = '';
			total = d.data.total;
			itemCount += data.length;
			
			if(data.length > 0){
				html = itemRender(data);
				_self.setPage(page);
				itemCount < total ? nextClass = '' : '';
			}
			
			$(html).appendTo($tip.find('.' + itemClass).parent());
			_self.formatItem($tip);
			proccess = false;
		}, type: 'GET', dataType: 'json', data: {pageNum: page, pageSize: _self.options.pageSize}});
	};
	
	var defaultOptions = {selector: '.yy-doc-share', pageSize: 6, tipPosition: 'top', tipClass: 'z5',
						  tipRender: _self.tipRender, render: _self.defaultRender};
	
	$.extend(options, defaultOptions);
	_self.options = options;
	
	_self.setPage = function(p){
		page = p;
		if($.inArray(page, pagerecord) == -1)pagerecord.push(page);
	};
	
	_self.getPage = function($arrow){
		if(typeof($arrow) == "undefined")return page;
		if($arrow.hasClass(leftArrowClass) && page>1)return page-1;
		if($arrow.hasClass(rightArrowClass))return page+1;
		return page;
	};
	
	_self.formatItem = function($me){
		var endIdx = _self.getPage() * _self.options.pageSize;
		endIdx > total ? endIdx = total : '';
		var startIdx = endIdx - _self.options.pageSize;
		$me.find('.' + itemClass).each(function(i){
			if(i < startIdx || i >= endIdx){
				$(this).addClass('hidden');
			}else{
				$(this).removeClass('hidden');
			}
		});
		
		$prefix = $me.find('.' + leftArrowClass).parent();
		$next = $me.find('.' + rightArrowClass).parent();
		if(page > 1){
			$prefix.removeClass('hidden');
		}else{
			$prefix.addClass('hidden');
		}
		if(page < Math.ceil(total *1.0 / _self.options.pageSize)){
			$next.removeClass('hidden');
		}else{
			$next.addClass('hidden');
		}
	};
	
	_self.bindArrowEvents = function(){
		var id = $(_self.options.selector).attr('rnum');
		$('#' + id).find('.' + arrowClass).live('click', function(){
			$arrow = $(this);
			_self.defaultRender($arrow);
		});
	};
	
	//绑定鼠标悬浮、离开事件
	/*function bindRenderEvents(){
		//共享人
		var tips = new YY.Tips({remote:false, wrapper: _self.options.selector, tipHeight: 82,
								tipClass : _self.options.tipClass, callback: _self.bindArrowEvents,
								contentCall: _self.options.tipRender, position: _self.options.tipPosition});
		tips.init();
	};*/
	
	
	
	_self.init = function(){
		//bindRenderEvents();
	};
};