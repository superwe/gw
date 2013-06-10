$(document).ready(function(){
	var table_div_name = "#yyDataList";
	YY.loadScript(['yonyou/modules/file/file.table.js','yonyou/modules/file/file.oldtable.js','yonyou/modules/file/file.navigation.js'
	            , 'yonyou/modules/file/file.sharelist.js', 'yonyou/modules/file/yy.boxadd.js','yonyou/modules/file/yy.dataListLoader.js','yonyou/modules/file/yy.dataTable.js'], {
		fn: function(){
			var $fnav = new fileNavigation();
			$fnav.init();
			
			var sharepop = new shareList({selector: $(table_div_name).find('div.yy-doc-share')});
			sharepop.init();
			//操作框中删除按钮
			(function(){

                var upload_obj = null;
				// 激活文件上传;
				$('#file_upload_button').on({
					'click': function(){
						//企业文件夹权限控制
						var $leftMenu = $('#doc-leftnav-containter .wLeftMenu');
						var $dd = $leftMenu.children('.sub-leftnav-containter:visible');
						var $prev_dt = $dd.prev(),
							flag = !!$prev_dt.length ? $prev_dt.attr('flag') : 'group';
						var $isupload = parseInt($dd.find('a.secMenuCur').attr('isupload'));
						var gettitle  = $dd.find('a.secMenuCur').attr('title');
						
						if(flag == 'corp' && $isupload == 0){
							$("#doc-path-containter").hide();
							$('#file_list').hide();
							$('#file_manage').hide();
							$('#file_upload').hide();
							$("#file_upload_priv").show();
							var check_title = "您没有“"+gettitle+"”文件夹上传文档权限，请联系空间管理员。";
							$("#file_upload_priv").find('.wUpTitle_priv').html(check_title);
						}else{
							var $me = $(this);
							var data = $me.attr('data');
							if(data == 2){
								$("#file_index").show();
								$("#file_view").hide();
							}
							$("#doc-path-containter").hide();
							$('#file_list').hide();
							$('#file_manage').hide();
							$('#file_upload').show();
							if (!upload_obj) {
								// 初始化上传对象;
								var t = (function($, YY, util){
									YY.loadScript(['swfupload/swfupload.js','swfupload/swfupload.queue.js','yonyou/modules/file/fileuploader.js'], {
										fn: function() {
											$(function(){
												upload_obj = new YY.FileUploader({
													debug: true,
													upload_url: YY.util.url('employee/file/swfUpload'),
													button_placeholder_id: "fileNewup",
													button_text: '',
													button_width: "132",
													button_height: "38"
												});
											});
										}
									});
								}(jQuery, YY, YY.util));
							}
							else {
								var $uploadBlock = upload_obj.getUploadBlock(),
									$uploadFileList = upload_obj.getUploadFileList(),
									$uploadQueueNum = upload_obj.getUploadQueueNum();
								$uploadFileList.html($uploadFileList.children(':first')[0]).hide();
								$uploadQueueNum.parent().hide();
								$('.fwDetBox', $uploadBlock).remove();
								// $('.hide-afert-start').show();
								$('.hide-afert-start').css({
									'position': 'static'
								});
								$(upload_obj.settings.custom_settings['uploadStartButton'], $uploadBlock).hide();

								upload_obj.deleteSaveBtBox();
								// 清除已有的上传列表;
								upload_obj.cancelQueue();
							}
						}

						return false;
					}
				});
				//文档列表，操作框显示与隐藏；
				$('.yy-file-operate-list', table_div_name).live({
					mouseenter: function(){
						var $me = $(this);
						$me.addClass('relative').children().children('aside').removeClass('hidden');
					},
					mouseleave: function(){
						var $me = $(this);
						$me.removeClass('relative').children().children('aside').addClass('hidden');
					}
				});
				
				//操作框中关注、取消关注
				/*$.yy.followCommon({
					setsId: table_div_name,
					confirm: {txt: '关注', css: 'confirm'},
					cancel: {txt: '取消关注', css: 'cancel'},
					reload: false,
					followSelector : '.yy-follow-doc'
				});*/
				
				//上传
				var tv1 =10, tv2=10,
					delContainterClass = 'doc-del-containter',
					delConfirmClass = 'doc-del-confirm',
					delCancelClass = 'doc-del-cancel';
				$('.doc-del').live('click', function(){
				        var $me = $(this),
				        	fid = $me.attr('fid'),
				        	url = $me.attr('for'),
				        	flag = $me.attr('flag'),
							pid  = $me.attr('pid'),
				        	callback = $me.attr('callback');
						if(typeof(flag) == 'undefined'){
							$td = $me.closest('div.wListOper');
						}else{
							$td = $me.closest('div.yy-file-operate-list').parent();
						}
				        clearTimeout(tv1);
				        tv2 = setTimeout(function(){
				        	$td.children('.' + delContainterClass).length
				                ? $td.children('.delTk').removeClass('hidden')
				                : $td.append('<div class="delLay relative fl yy-delete z5" style="left:48px;top:20px;"><aside class="delTk doc-del-containter">确定要删除该' +
				                		$me.attr('name') + '？<br/>'
				                        +'<a href="javascript:;" pid="' + pid + '" url="' + url + '" fid="' + fid + '"'
				                        + ((typeof(flag) != 'undefined') ? ' flag="' + flag + '"' : '' ) 
				                        + ((typeof(callback) != 'undefined') ? ' callback="' + callback + '"' : '' ) 
				                        + ' class="' + delConfirmClass + '">删除</a> '
				                        +'<a href="javascript:;" class="' + delCancelClass + '">不删除</a>'
				                        +'<span class="sj xsj"></span></aside></div>');
				            $('.yy-file-operate-list').trigger("mouseleave");
				        },300);
				        return false;
				    }
				);
				
				//左侧导航同步删除
				function leftnavsnycDelete($delete){
					var item_id = $delete.attr('fid'),
						flag = $delete.attr('flag'),
						label= 'dd',
						$leftNav = $('a[item_id="'+item_id+'"]', '#subnav-containter-' + flag);
					
					if($leftNav.attr('floor_id') > 0 && 
							($leftNav.attr('floor_id') != $leftNav.attr('item_id')))label = 'li';
					$leftNav.closest(label).remove();
				}
				
				//确认要删除！
				$('.' + delConfirmClass).live('click', function(){
					var $me = $(this),
						url = $me.attr('url'),
						$containter = $me.closest('.' + delContainterClass),
						mappingFunc = [leftnavsnycDelete],
						callback = $me.attr('callback'),
						pid = $me.attr('pid'),
						flag = $me.attr('flag');
					$containter.addClass('hidden');
					YY.util.ajaxApi(url, 
						function(d,s){
							if(s === 'success' && d) {
								if(d.rs){
									$.yy.rscallback('删除成功');
									$containter.remove();
									if(typeof(flag) == 'undefined'){
										$fnav.reload();
									}else{
										if(flag == 'self'){
											var reloadurl = '/employee/file/getAjaxFolder?type=1&pid='+pid;
										}else{
											var reloadurl = '/employee/file/getAjaxFolder?type=2&pid='+pid;
										}
										$fnav.oldreload(reloadurl);
									}
									if(typeof(callback) != 'undefined'){
										mappingFunc[callback]($me);
									}
								}else{
                                    if(d.error){
                                        $.yy.rscallback(d.error);
                                    }else{
                                        $.yy.rscallback('删除失败');
                                    }
								}
							}
						}, 'GET', 'json', '');
			        return false;
				});
				//不想删除，取消；
				$('.' + delCancelClass).live('click', function(){
				    var $me = $(this);
				    $me.closest('.' + delContainterClass).addClass('hidden');
				    return false;
				});
				
				//编辑文件夹
				$('.doc-edit-folder').live('click', function(){
					$('#right-option-newfolder').trigger('click', $(this).attr('boxid'));
				});
				
				//企业文件夹进入子文件夹
				$('.doc-enter-subfolder').live('click', function(){
					var $me = $(this);
					$('.right-option-folder_crop').trigger('click', [$me.attr('boxid'), $me.html()]);
				});
				var mapping = ['', 'self', 'corp'];
				//排序 升序
				$('.orderUp').live('click', function(){
					var $me = $(this);
					var request_url = YY.util.url("employee/file/orderup"),
						request_data = {
							boxid: $me.attr('boxid'),
							pid:$me.attr('pid'),
							type:$me.attr('type')
						};
					var reloadurl = '/employee/file/getAjaxFolder?type='+$me.attr('type')+'&pid='+$me.attr('pid');
					YY.util.ajaxApi(request_url, function(d,s){
						if (d && d.rs==true && d.type==='upper' && s==='success'){
							$.yy.rscallback('操作成功！');
							$fnav.leftSubNavSyncSort(mapping[request_data.type], 
										request_data.boxid, 'up', request_data.pid);
							$fnav.oldreload(reloadurl);
						}
					},'GET','json',request_data);
				});
				
				//排序 升序
				$('.orderDown').live('click', function(){
					var $me = $(this);
					var request_url = YY.util.url("employee/file/orderdown"),
						request_data = {
							boxid: $me.attr('boxid'),
							pid:$me.attr('pid'),
							type:$me.attr('type')
						};
					var reloadurl = '/employee/file/getAjaxFolder?type='+$me.attr('type');
					YY.util.ajaxApi(request_url, function(d,s){
						if (d && d.rs==true && d.type==='downer' && s==='success'){
							$.yy.rscallback('操作成功！');
							$fnav.leftSubNavSyncSort(mapping[request_data.type], 
										request_data.boxid, 'down', request_data.pid);
							$fnav.oldreload(reloadurl);
						}
					},'GET','json',request_data);
				});
				
				//类型选择js
				$('.searchfiletype').live({
					mouseenter: function(){
						var $me = $(this);
						$me.children('aside').removeClass('hidden');
					},
					mouseleave: function(){
						var $me = $(this);
						$me.children('aside').addClass('hidden');
					}
				});
				
				//表格中的筛选
				$('.docTypeSearch a', table_div_name).live('click',function(){
					var $me = $(this),
						fileext = $me.attr('data'),
						type = $me.attr('type'),
						boxid = $me.attr('boxid'),
						filter = {fileext: fileext};
					if(type)filter.type = type;
					if(boxid)filter.boxid = boxid;
					$fnav.reload(null, null, function(){
						$('.docTypeSearch a', table_div_name).show();
						$me.hide();
						$('.typeAll').html($me.html());
					}, filter);
					
					return false;
				});

				var $orderList = $("#orderList"),
					$orderItem = $orderList.children(':not(#orderDefaultShow)');
				//排序功能
				$orderItem.on('click',function(){
					var $me = $(this),
						$a = $me.children(),
						paixu = $a.attr('data'),
						filter = {paixu: paixu};
					$fnav.reload(null, null, function(){
						$orderItem.each(function(){
							$(this).removeClass("orderCurrent");
							$(this).find('span').eq(1).addClass('wP2').removeClass('wP3');
						});
						$me.addClass("orderCurrent");
						$me.find('span').eq(1).removeClass('wP2').addClass("wP3");
					}, filter);
					return false;	
				});
				//条件选择功能
				$("#extSearch input").live('click',function(){
					var $me = $(this);
					var extcancel = $("#extcancel");
					var ext_value = [];
					$('input[name="fileext"]:checked').each(function(){
						ext_value.push($(this).val());
					});
					if(ext_value.length){
						extcancel.removeClass("hidden");
					}else{
						extcancel.addClass("hidden");
					}
					var extStr = ext_value.join(",");
					var filter = {fileext:extStr};
					$fnav.reload(null, null, function(){
						if($me.is(':checked') == false){
							$me.attr("checked",true);
						}else{
							$me.attr("checked",false);
						}
					}, filter);
					return false;
				});
				//清空操作
				$("#extcancel").live('click',function(){
					$(this).addClass("hidden");
					$('input[name="fileext"]').attr("checked",false);
					var filter = {fileext:''};
					$fnav.reload(null, null, function(){
					}, filter);
				});

				//搜索
				$("#fsubmit").live('click',function(){
					var filesearch = $("#filesearch").val();
					var filter = {filesearch:filesearch};
					$fnav.reload(null, null, function(){
						var searchList = $("#searchList");
						searchList.removeClass("hidden");
						$("#filesearch").val(filesearch);
					}, filter);
					return false;
				});

				//搜索选择
				$("#searchtype").live('click',function(){
					var $me = $(this),
						searchtype = $me.val();
					var filter = {searchtype:searchtype};
					$fnav.reload(null, null, function(){
						$me.attr('checked',true);
					}, filter);
					return false;
				});
				$("#filesearch").live('keydown',function(event){
					if(event.keyCode == 13){
						var filesearch = $("#filesearch").val();
						var filter = {filesearch:filesearch};
						$fnav.reload(null, null, function(){
							var searchList = $("#searchList");
							searchList.removeClass("hidden");
							$("#filesearch").val(filesearch);
						}, filter);
						return false;
					}
				});

				//类型选择js
				$('.searchfiletype').live({
					mouseenter: function(){
						var $me = $(this);
						$me.children('aside').removeClass('hidden');
					},
					mouseleave: function(){
						var $me = $(this);
						$me.children('aside').addClass('hidden');
					}
				});

				//类型选择js
				$('#orderDefaultShow').live({
					mouseenter: function(){
						var $me = $(this);
						$me.children('aside').removeClass('hidden');
					},
					mouseleave: function(){
						var $me = $(this);
						$me.children('aside').addClass('hidden');
					}
				});
				
				//默认值设置
				var employeeid = $("#employeeid").val();
				var getdefault = localStorage.getItem(employeeid);//获取值
				if(getdefault){
					var $orderdefault = $(".orderdefault"),
					$orderdefault_a = $orderdefault.children('a');
					$orderdefault.find('a[data="'+getdefault+'"]').addClass("listCur");
					var $orderList = $("#orderList"),
						$orderItem = $orderList.children(':not(#orderDefaultShow)');
					$orderItem.find('a[data="'+getdefault+'"]').closest('li').addClass("orderCurrent");
					$orderItem.find('a[data="'+getdefault+'"]').find('span').eq(1).removeClass('wP2').addClass("wP3");

				}

				//文档选项卡---类型搜索
				var $orderdefault = $(".orderdefault"),
					$orderdefault_a = $orderdefault.children('a');
				$('.orderdefault a').live('click',function(){
					var $me = $(this);
					var orderdefault = $me.attr('data');
					var filter = {paixu:orderdefault};
					$fnav.reload(null, null, function(){
					}, filter);
					if(orderdefault){
						localStorage.setItem(employeeid,orderdefault);
						var istrue = localStorage.getItem(employeeid);//获取值
						if(istrue){
							$orderdefault_a.removeClass("listCur");
							$me.addClass("listCur");
							//导航增加默认排序着重色
							var $orderList = $("#orderList"),
								$orderItem = $orderList.children(':not(#orderDefaultShow)');
							$orderItem.each(function(){
								$(this).removeClass("orderCurrent");
								$(this).find('span').eq(1).addClass('wP2').removeClass('wP3');
							});
							$orderItem.find('a[data="'+orderdefault+'"]').closest('li').addClass("orderCurrent");
							$orderItem.find('a[data="'+orderdefault+'"]').find('span').eq(1).removeClass('wP2').addClass("wP3");

							$.yy.rscallback('操作成功！');
						}
					}

					return false;
				});
				
				//企业文档新建页面的取消按钮事件
				$('#doc-corp-cancel').live('click', function(){
					$('#corp-newfloder-containter').remove();
					$fnav.oldreload();
				});
				
				//优酷，酷6等url地址上传
				$("input[name='groupDocSub']").live('click',function(){
                    if ($(this).hasClass('grayButton')) { return false;}
					var checkvideo = $("#videoSta").val();
					var share_div_value = [];
					var $f = $("form[name='myform']");
					$('input[name="share_div_value[]"]', $f).each(function(i){
						share_div_value.push($(this).val());
					});
					var gid = $('#gid', $f).val();
					var fids = $('#fids', $f).val();
					if(checkvideo > 0){
						//地址视频上传
						var posturl = YY.util.url('/file/act/urlupload');
						var videoinfo = {
							videourl:$("#videoUrl").val(),
							boxid:$("#boxid").val(),
							gid:gid,
							videoSta:checkvideo};
						YY.util.ajaxApi(posturl, function(d){
							if(d.rs) {
								if(fids){
									var newfids = fids + ',' + d.data.fid;
								}else{
									var newfids = d.data.fid;
								}
								if(newfids && newfids !='undefined'){
									if(typeof($("#fid").val()) == 'undefined' || $("#fid").val() == ""){
									var rq = {fids: newfids,
												fileFromObj: $('#fileFromObj', $f).val(),
												uploadGroupID:$('#uploadGroupID', $f).val(),
												share_div_value: share_div_value,
												boxid: $('#boxid', $f).val()};
										YY.util.ajaxApi($f.attr('action'), 
											function(d){
												if(d.rs) {
													$.yy.rscallback('上传成功');
												}else{
													$.yy.rscallback(d.error, 1);
												}
											}, 'POST', 'json', rq);
									}
								}
								if(gid){
									var rq = {fids: newfids,
											fileFromObj: $('#fileFromObj', $f).val(),
											gid: gid};
									YY.util.ajaxApi($f.attr('action'), 
										function(d){
											if(d.rs) {
												$.yy.rscallback('上传成功');
											}else{
												$.yy.rscallback(d.error, 1);
											}
										}, 'POST', 'json', rq);
								}
							}else{
								$.yy.rscallback(d.error, 1);
							}
						}, 'POST', 'json', videoinfo);
					}else{
						if($("input.groupUploadFids").val() != ""){
							//如果是第一次上传
							if(gid){
								var rq = {fids: $('#fids', $f).val(),
										fileFromObj: $('#fileFromObj', $f).val(),
										gid: gid};
							
								YY.util.ajaxApi($f.attr('action'), 
									function(d){
										if(d.rs) {
											$.yy.rscallback('上传成功');
										}else{
											$.yy.rscallback(d.error, 1);
										}
									}, 'POST', 'json', rq);
							}else if(typeof($("#fid").val()) == 'undefined' || $("#fid").val() == ""){
								var rq = {fids: $('#fids', $f).val(),
											fileFromObj: $('#fileFromObj', $f).val(),
											uploadGroupID:$('#uploadGroupID', $f).val(),
											share_div_value: [],
											boxid: $('#boxid', $f).val()};
									
								$('input[name="share_div_value[]"]', $f).each(function(i){
									rq.share_div_value.push($(this).val());
								});
								YY.util.ajaxApi($f.attr('action'), 
									function(d){
										if(d.rs) {
											$.yy.rscallback('上传成功');
										}else{
											$.yy.rscallback(d.error, 1);
										}
									}, 'POST', 'json', rq);
							}
							
						}
					}
					$(".groupUploadColose").click();
				});
				
			})();
		}});
});