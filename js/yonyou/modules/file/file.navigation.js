var fileNavigation = function(){
	var _self = this,
		topNavBaseUrl_new = YY.util.url('employee/file/getAjaxIndex'),
		topNavBaseUrl = topNavBaseUrl_new + '/flag/',
		leftNavBaseUrl = YY.util.url('employee/file/getAjaxShare/type/'),
		//defaultUrl = topNavBaseUrl_new + '/flag/' + DOC_CUR_FLAG,
		defaultUrl = YY.util.url('employee/file/getAjaxFile?from=all'),
		topNavSelector = '#doc-top-navigation a',
		topNavCurClass = 'meCur',
		pathFirst = ['我的文档', '全部文档', '群组文档', '企业文档'],
		pathSelector = '.doc-path',
		pathContainterSelector = '#doc-path-containter',
		pathHtmlTpl = '<span class="fl sep doc-path-sep">&gt;</span><span class="fl doc-path-append">%title</span>',
		leftnavSelector = '.doc-leftnav',
		leftnavContainter = '#doc-leftnav-containter',
		leftSubnavIdprefix = '#subnav-containter-',
		leftSubnavContainterSelector = ".sub-leftnav-containter",
		leftnavCurClass = 'secMenuCur',
		leftnavTitleSelector = '.leftnav-title',
		rightOptioinContainterSelector = '#doc-right-option-containter',
		rightOptionUploadSelector = '#right-option-upload',
		rightOptionFolderSelector = '.right-option-folder',
		rightOptionFolderSelectorCrop = '.right-option-folder_crop',
		rightOptionNewFolderSelector = '#right-option-newfolder',
		rightOptionQuitSelector = '#right-option-quit',
		rightOptionReturnSelector = '#right-option-return',
		$table,
		$oldtable;

	//设置路径导航位置文字. args: 路径数组[p1, p2, p3]...
	function pathRender(args){
		$("#doc-path-containter").show();
		var p = args, 
			pnum = p.length, //路径深度
			$pathsep, //路径间的分隔对象，循环中使用
			idx = 0;
		//前2层为默认路径，必定存在
		$(pathSelector, pathContainterSelector).each(function(i){
			idx = i;
			$pathsep = $('.doc-path-sep:eq('+(i-1)+')', pathContainterSelector);
			if(i < pnum){
				$(this).html(p[i]);
				$(this).show();
				i>0 ? $pathsep.show() : '';
			}else{
				$(this).hide();
				i>0 ? $pathsep.hide() : '';
			}
		});
		//删除旧的非默认路径
		$('.doc-path-append', pathContainterSelector).each(function(i){
			$(this).prev('span.doc-path-sep').remove();
			$(this).remove();
		});
		//添加新的非默认路径
		var path = '';
		for(var i = idx+1; i<pnum; i++){
			path = pathHtmlTpl.replace('%title', p[i]);
			$(path).appendTo(pathContainterSelector);
		}
	}
	//顶部导航选中状态样式
	function selectTopNavigation($selector){
		$selector.closest('ul').find('li').removeClass(topNavCurClass);
		$selector.closest('li').addClass(topNavCurClass);
		//导航文字呈现
		pathRender(['全部文档', $selector.html()]);
	}
	//绑定知识库顶部导航"我浏览",'我关注'...不影响顶部右侧按钮显示
	function bindTopNavigationEvents(){
		$(topNavSelector).bind('click', function(){
			var $me = $(this),
				remoteUrl = topNavBaseUrl + $me.attr('flag');
			$(leftSubnavContainterSelector, leftnavContainter).addClass('hidden');
			//重新加载表格数据
			$table.reload(remoteUrl);
			//更改顶部点击的链接样式为选中
			selectTopNavigation($me);
			//更改导航路径文字
			rightOptionLoad('topnav', 0);
			return false;
		});
		
	}
	//初始化顶部导航
	function initTopNavigation(){
		//DOC_CUR_FLAG --file_daohang.html中定义
		//默认为我浏览的
		selectTopNavigation($(topNavSelector + '[flag="' + DOC_CUR_FLAG + '"]'));
		//绑定顶部导航事件
		bindTopNavigationEvents();
	};
	
	//右侧操作连接呈现。selector : 选择器数组[s1, s2, s3]...
	function rightOptionShow(selector){
		if($.isArray(selector))
			selector = selector.join(',');
		//将选择器中的右侧操作连接呈现
		$(selector, rightOptioinContainterSelector).removeClass('hidden');
	}
	
	//加载顶部右侧操作链接。flag: 字符串可以为(self, corp,topnav,group,folder), 
	//	item_id: 个人文档1/企业文档2
	function rightOptionLoad(flag, item_id, params){
		//将所有顶部右侧操作链接恢复初始状态
		$(rightOptioinContainterSelector + ' a').addClass('hidden');
		//如果不是顶部导航点击调用，则使所有顶部导航为非选中状态
		if(flag != 'topnav')$(topNavSelector).closest('li').removeClass(topNavCurClass);
		//
		var type = {self: 1, group: item_id, corp: 2, folder: item_id, topnav: 1};
		//上传操作设置上传到的对象id：群组id/文件夹id
		$(rightOptionUploadSelector, rightOptioinContainterSelector).attr('data', item_id);
		//管理文件夹操作设置文件夹类型为：个人文档1/企业文档2
		$(rightOptionFolderSelector, rightOptioinContainterSelector).attr('data', type[flag]);
		
		switch(flag){
			case 'self'://点击【个人文档】顶部右侧操作显示：【上传文档，管理文件夹】
				rightOptionShow([rightOptionUploadSelector, rightOptionFolderSelector]);
				break;
			case 'topnav'://点击【顶部导航】右侧操作显示：群组【上传文档】
				$("a", leftnavContainter).removeClass(leftnavCurClass);
			case 'group'://点击【群组文档】顶部右侧操作显示：上传文档
				rightOptionShow([rightOptionUploadSelector]);
				break;
			case 'corp'://点击【企业文档】顶部右侧操作显示：【上传文档，管理文件夹】
				if(item_id <= 0){//如果企业文档没有文件夹且当前用户为管理员则显示管理文件夹页面
					$(rightOptionFolderSelector, rightOptioinContainterSelector).trigger('click');
					break;
				}
				//【企业文档】顶部右侧操作验证，是否有上传文档权限、管理文件夹权限
				break;
			case 'folder'://点击【管理文件夹】顶部右侧操作 或【企业一级文件夹列表中文件夹名】
				//设置【新建文件夹】操作data属性为：个人文档1/企业文档2
				$(rightOptionNewFolderSelector).attr('data', item_id);
				//设置【退出管理】操作data属性为：个人文档1/企业文档2
				$(rightOptionQuitSelector).attr('data', item_id);
				//设置【返回】操作data属性为父级文件夹id
				$(rightOptionReturnSelector).attr('data', params.pid);
				
				var showArr = [rightOptionNewFolderSelector];
				if(params.pid){
					showArr.push(rightOptionReturnSelector);
				}else{
					showArr.push(rightOptionQuitSelector);
				}
				//通过点击【管理文件夹】进入显示【新建文件夹，退出管理】，
				//通过点击【企业一级文件夹列表中文件夹名】显示【新建文件夹，返回】
				rightOptionShow(showArr);
				break;
			default:
		}
		
	}
	
	//左侧导航内部链接点击事件
	function bindLeftSubNavigationEvents(){
		$(leftSubnavContainterSelector + ' a', leftnavContainter).live('click', function(){
			var $me = $(this);
				remoteUrl = $me.attr('url'),
				$subleftnavContainter = $me.closest(leftSubnavContainterSelector);
				flag = $subleftnavContainter.attr('id').split('-')[2],
				$mainLeftnav = $(leftnavSelector + '[flag="' + flag + '"]', leftnavContainter),
				title = $me.attr('title'),
				path = [$(leftnavTitleSelector, $mainLeftnav).html(), title],
				floor = $me.attr('floor'),
				item_id = $me.attr('item_id'),
				reload = true;
			$("#file_upload_priv").hide();
			$("#file_list").show();
			$('#file_upload').hide();
			$('#file_manage').hide();
			
			//点击左侧的时候右侧按文件格式选择取消
			$("#extcancel").addClass("hidden");
			$('input[name="fileext"]').attr("checked",false);
			$table.delParam('fileext');
			$table.delParam('filesearch');
			$table.delParam('searchtype');
			$table.delParam('paixu');
			//搜索框内容取消
			$("#filesearch").val('');
			$("#searchList").addClass('hidden');
			$('input[name="searchtype"]').attr("checked",false);

			var needValid = $me.attr('pmvalid') ? $me.attr('pmvalid') : false;
			var validResult = needValid ? ($me.attr('validresult') == 'valid' ? true : false) : true;
			//企业文档/个人文档 文件夹权限验证
			if(needValid && typeof($me.attr('validresult')) == 'undefined'){
				YY.util.ajaxApi({
					url: $me.attr('pmvalid'), 
					success: function(d,s){
								if(! d.rs) {
									$me.attr('validresultmsg', d.error);
									$me.attr('validresult', 'invalid');
									reload = false;
									validResult = false;
								}else{
									$me.attr('validresult', 'valid');
									validResult = true;
								}
							}, 
					async: false,
					type : 'POST',
					dataType : 'json'});
			}
			//如果企业/个人文件夹没有浏览权限那么，提示信息
			if(! reload || ! validResult){
				//$.yy.rscallback($me.attr('validresultmsg'),1);
			}
			//重新加载表格数据，没有浏览权限那么会为空
			$table.reload(remoteUrl);
			
			//所有左侧导航链接取消选中状态
			$(leftSubnavContainterSelector + ' a', leftnavContainter).removeClass(leftnavCurClass);
			//使本次点击的左侧导航为选中状态
			$me.addClass(leftnavCurClass);
			
			//多级路径
			if(floor != '0'){//floor路径深度
				path.splice(1, 1);
				//加载所有继承自同一父级的文件夹
				$('a[floor_id="' + $me.attr('floor_id') + '"]', $subleftnavContainter).each(function(i){
					$item = $(this);
					//深度小于当前被点击的左侧导航才被加入到路径中
					if(parseInt($item.attr('floor')) < parseInt(floor)){
						path.push($item.attr('title'));
					}
				});
				//加载当前被点击的左侧导航
				path.push(title);
			}
			//导航路径呈现
			pathRender(path);
			//对应的顶部右侧操作显示
			rightOptionLoad(flag, item_id);
			//控制共享时间
			var sharetime = $("#sharetime");
			if(remoteUrl == '/employee/file/getAjaxShare'){
				sharetime.removeClass('hidden');
			}else{
				sharetime.addClass('hidden');
			}
			//设置默认排序
			return false;
		});
	}
	
	//编辑左侧导航
	function editLeftNavigation(flag, name, fullname, item_id){
		var $dl = $('dl', leftSubnavIdprefix + flag),
			$a = $dl.find('a[item_id="' + item_id + '"]');
		$a.attr('fullname', fullname);
		$a.html('<span class="wMIcon5"></span><span>' + name + '</span>');
	}
	
	//添加左侧导航
	function addLeftNavigation(flag, name, fullname, item_id, url, pid){
		//企业文档二级目录新建文件夹后，同步添加左侧导航
		if(pid > 0 ){
			var $ul = $('a[item_id="' + pid + '"]', leftSubnavIdprefix + flag).next('ul'),
				str = '<li><a title="' + fullname + '" href="javascript:;" floor="1" floor_id="' 
						+ pid + '" item_id="' + item_id + 
						'" url="' + url + '"><span class="wMIcon5"></span><span>' 
						+ name+ '</span></a></li>';
			$(str).appendTo($ul);
			return;
		}
		//个人文文档，企业文档一级目录新建文件夹后，同步添加左侧导航
		var $dl = $('dl', leftSubnavIdprefix + flag),
			str = '<dd><a title="' + fullname + '" floor="0" item_id="' + item_id + 
	'" url="' + url + '" href="javascript:;"><span class="wMIcon5"></span><span>' + name +'</span></a><ul></ul></dd>';
		$(str).appendTo($dl);
	}
	
	//绑定左侧大导航点击事件【个人文档，群组文档，企业文档】
	function bindLeftNavigationEvents(){
		$(leftnavSelector, leftnavContainter).bind('click', function(){
			var $me = $(this),
				flag = $me.attr('flag'),
				id = leftSubnavIdprefix + flag,
				$subnav = $(id + ' a:first');
			
			//点击左侧的时候右侧按文件格式选择取消
			$("#extcancel").addClass("hidden");
			$('input[name="fileext"]').attr("checked",false);
			//取消传递的参数
			$table.delParam('fileext');
			$table.delParam('filesearch');
			$table.delParam('searchtype');
			//搜索框内容取消
			$("#filesearch").val('');
			$("#searchList").addClass('hidden');
			$('input[name="searchtype"]').attr("checked",false);

			$("#file_upload_priv").hide();//隐藏上传文档页面权限控制
			$("#file_list").show();
			$('#file_upload').hide();
			$('#file_manage').hide();

			
			//左侧子导航容器恢复初始不可见状态
			$(leftSubnavContainterSelector, leftnavContainter).addClass('hidden');
			//被点击的左侧大导航对应的自导航容器可见
			$(id).removeClass('hidden');
			//如果自导航容器内有链接，则自动触发第一个链接点击事件
			if($subnav.length > 0){
				$(id + ' a:first').trigger('click');
			}else{
				if(flag == 'corp'){
					//只有企业文档可能出现不存在子项的问题
					pathRender(['企业文档']);
					$table.reload('employee/file/getAjaxNew/boxid/0/type/2');
					if($me.attr('showfolder') > 0){//当前登陆人为管理员
						rightOptionLoad('corp', 0);
					}else{
						//将所有顶部右侧操作链接恢复初始状态
						$(rightOptioinContainterSelector + ' a').addClass('hidden');
					}
				}else{
					//只有企业文档可能出现不存在子项的问题
					pathRender(['全部文档']);
					$table.reload(defaultUrl);
					if($me.attr('showfolder') > 0){//当前登陆人为管理员
						rightOptionLoad('corp', 0);
					}else{
						//将所有顶部右侧操作链接恢复初始状态
						$(rightOptioinContainterSelector + ' a').addClass('hidden');
					}
				}
				
			}
			
		});
	}
	
	//初始化左侧导航事件
	function initLeftNavigation(){
		$(leftnavSelector, leftnavContainter).css('cursor','pointer');
		//左侧子导航事件
		bindLeftSubNavigationEvents();
		//左侧大导航事件
		bindLeftNavigationEvents();
	};
	

	//绑定顶部右侧操作事件
	function bindRightOptionEvents(){
		//个人管理文件夹
		$(rightOptionFolderSelector).bind('click', function(e, pid, pname){
			var $me = $(this),
				type = $me.attr('data'),
				remoteUrl = YY.util.url("employee/file/getAjaxFolder"),
				remoteUrl = remoteUrl + '?type=1';
				mapping = ['我的文档', '我的文档', '企业文档'],
				fpath = [mapping[type]];
			$("#file_upload_priv").hide();
			$("#file_list").hide();
			$('#file_upload').hide();
			$('#file_manage').show();
			if(typeof(pid) != 'undefined'){
				remoteUrl += '/pid/' + pid;
				fpath.push(pname);
			}else{
				pid = 0;
			}
			$oldtable = new fileoldTable(remoteUrl);
			pathRender(fpath);
			$oldtable.oldreload(remoteUrl);
			rightOptionLoad('folder', type, {pid: pid});
			return false;
		});
		//企业管理文件夹
		$(rightOptionFolderSelectorCrop).bind('click', function(e, pid, pname){
			var $me = $(this),
				type = $me.attr('data'),
				remoteUrl = YY.util.url("employee/file/getAjaxFolder"),
				remoteUrl = remoteUrl + "?type=2";
				mapping = ['我的文档', '我的文档', '企业文档'],
				fpath = [mapping[type]];
			$("#file_upload_priv").hide();
			$("#file_list").hide();
			$('#file_upload').hide();
			$('#file_manage').show();
			if(typeof(pid) != 'undefined'){
				remoteUrl += '&pid=' + pid;
				fpath.push(pname);
			}else{
				pid = 0;
			}
			$oldtable = new fileoldTable(remoteUrl);
			pathRender(fpath);
			$oldtable.oldreload(remoteUrl);
			rightOptionLoad('folder', type, {pid: pid});
			return false;
		});
		//返回
		$(rightOptionReturnSelector).bind('click', function(){
			var $me = $(this);
			$(rightOptionFolderSelectorCrop).trigger('click');
		});
		//退出管理
		$(rightOptionQuitSelector).bind('click', function(){
			var $cur = $('.' + leftnavCurClass, leftnavContainter);
			if($cur.length > 0){
				$cur.trigger('click');
			}else{//如果被删除的文件夹为左侧导航当前选中的项
				var flag = $(this).attr('data'),
					mapping = ['', 'self', 'corp'];
				$(leftnavSelector + '[flag="' + mapping[flag] +  '"]', leftnavContainter).trigger('click');
			}
			
		});

		YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js'],{
			fn: function(){
				 var dialog_obj = new YY.SimpleDialog({
					 'mixObj': '#yySetting',
					 'title': '这是一个测试dialog',
					 'width': 400,
					 'height': 150,
					 'cache': false,
					 'hasHeader':false,
					 'hasFooter':true,
					 'overlay' : true,
					 'autoOpen': false,
					 'onStart': function(){
						 YY.util.trace('onStart');
						 return true;
					 },
					 'onComplete': function(){
						 YY.util.trace('onComplete');
						 return true;
					 },
					 'onRemoteComplete': function(data){
						 return data;
					 },
					 'onConfirm': function(){
					 }
				 });

				 //新建文件夹
				$(rightOptionNewFolderSelector).bind('click', function(e, boxid){
					var $me = $(this),
						type = $me.attr('data');
					var reloadurl = YY.util.url("employee/file/getAjaxFolder"),
						reloadurl = reloadurl + "?type="+type;
					$oldtable = new fileoldTable(reloadurl);
					if(type == '1'){//个人文档文件夹
						var href = YY.util.url("employee/file/addBox"),
						mapping = ['self', 'self', 'corp'];
						if(typeof(boxid) != 'undefined')href += '?folderid=' + boxid;
						dialog_obj.setUrl(href);
						dialog_obj.open();
						dialog_obj.onConfirm = function(){
							var foldername = $('#foldername').val();
							if(foldername == ''){
								$.yy.rscallback("文件夹名称必填！",1);
								return false;
							}
							var url = YY.util.url("employee/file/addBoxOk");
							YY.util.ajaxApi(url, 
								function(d,s){
									if(s === 'success' && d) {
										var data = d.data;
										if(typeof(boxid) != 'undefined'){
											editLeftNavigation(mapping[type], data.boxname, data.fullboxname, boxid, 0);
										}else{
											addLeftNavigation(mapping[type], data.boxname, data.fullboxname, data.boxid, data.url, 0);
										}
										$oldtable.oldreload(reloadurl);
										$.yy.rscallback(data.msg);
									}else{
										$.yy.rscallback(d.error, 1);
									}
								}, 'POST', 'json', {folderid: $('#folderid').val(), foldername: foldername});
							 return true;
						};
					}else{
						var href = YY.util.url('employee/file/groupaddbox'),
							mapping = ['self', 'self', 'corp'],
							pid = 0,
							$rt = $(rightOptionReturnSelector);
						if(! $rt.hasClass('hidden'))pid = $rt.attr('data');
						href += '?pid=' + pid;
						if(typeof(boxid) != 'undefined')href += '&folderid=' + boxid;
						
						YY.util.ajaxApi(href, 
							function(d){
								$('#yyGroupTable').hide();
								$('#yyGroupPage').hide();
								$(d).insertAfter($oldtable.getoldTableSelector());
								//new docBoxAdd();
								$('#addGroupboxForm').bind('click', function(){
									var foldername = $('#foldername').val();
									if(foldername == ''){
										$.yy.rscallback("文件夹名称必填！", 1);
										return false;
									}
									var $form = $(this),
										url = $form.attr('action'),
										rq_data = {folderid: $('#folderid').val(), foldername: foldername, pid: $('#pid').val()},
										$fabuCk = $('input[name="upset"]'),
										$liulanCk = $('input[name="viewset"]');
									var ok_url = YY.util.url("employee/file/groupaddok");
									rq_data.notice_div_value = [];
									rq_data.notice_div_n_value = [];
									$('input[name="notice_div_value[]"]').each(function(i){
										rq_data.notice_div_value.push($(this).val());
									});
									$('input[name="notice_div_n_value[]"]').each(function(i){
										rq_data.notice_div_n_value.push($(this).val());
									});
									rq_data.upset = ($fabuCk.attr('checked')) ? 1 : 0;
									rq_data.viewset = ($liulanCk.attr('checked')) ? 1 : 0;
									YY.util.ajaxApi(ok_url, 
										function(d){
											if(d.rs) {
												var data = d.data;
												if(typeof(boxid) != 'undefined'){
													editLeftNavigation(data.flag, data.boxname, data.fullboxname, boxid, pid);
												}else{
													addLeftNavigation(data.flag, data.boxname, data.fullboxname, data.boxid, data.url, pid);
												}
												$oldtable.oldreload();
												$.yy.rscallback(data.msg);
											}else{
												$.yy.rscallback(d.error, 1);
											}
									}, 'POST', 'json', rq_data);
									return false;
								});
									
						}, 'POST', 'html');
					}
				});
			}
		});
		
	}
	
	_self.init = function(){
		//initTopNavigation(); //顶部的去掉
		initLeftNavigation();
		bindRightOptionEvents(); //文件夹操作
		var remoteUrl = defaultUrl;
		if(DOC_RT_FLAG != ''){
			remoteUrl = '';
			$table = new fileTable(remoteUrl);
			$('a[item_id="' + DOC_RT_ITEM + '"]', leftSubnavIdprefix + DOC_RT_FLAG).trigger('click');
			$(leftSubnavIdprefix + DOC_RT_FLAG).removeClass('hidden');
		}else{
			var employeeid = $("#employeeid").val();
			var getdefault = localStorage.getItem(employeeid);//获取默认排序值
			if(getdefault){
				remoteUrl = remoteUrl + "&paixu="+getdefault;
			}
			//初次默认进入页面
			$table = new fileTable(remoteUrl);
			pathRender(['全部文档']);
		}
	};
	
	_self.reload = function(remoteUrl, num, callback, params){
		if(arguments.length > 3){
			for(var i in params){
				$table.setParam(i, params[i]);
			}
		}
		$table.reload(remoteUrl, num, callback);
	};

	_self.delParam = function(name){
		$table.delParam(name);
	};

	_self.oldreload = function(remoteUrl, num, callback, params){
		if(arguments.length > 3){
			for(var i in params){
				$table.setParam(i, params[i]);
			}
		}
		$oldtable.oldreload(remoteUrl, num, callback);
	};
	
	//左侧导航同步排序
	_self.leftSubNavSyncSort = function(flag, item_id, order, pid){
		var label = pid>0 ? 'li' : 'dd';
		var	$item = $('a[item_id="' + item_id + '"]', leftSubnavIdprefix + flag).closest(label),
			$move;
		if(order == 'up'){
			$move = $item.prev(label);
			$move.insertAfter($item);
		}else{
			$move = $item.next(label);
			$move.insertBefore($item);
		}
	};
	
};
//关闭视频预览
function closeVideo(){
	$('#videoSta').val(0);
	$('#videoPic').html('');
	$('#videoPic').hide();
	$('#videoInput').show();
	$('#videoUrl').val('');
	$("#errorinfo").html('');
}