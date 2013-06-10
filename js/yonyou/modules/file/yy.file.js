$(document).ready(function() {
	$("#replycontent").val('');
	$("#content_div").trigger('click');
	var playerid = 1;
	$('#playerBtn').bind('click', function(){
		showFlash(playertype, imgpath, this, playerid, '');
	});
	$("#httpVideo").bind('click',function(){
		var $me = $(this);
		showFlash($me.attr('host'), $me.attr('flashvar'), this, $me.attr('fid'), 'share_video');
	});
	if(playertype != '' && playertype == 'video'){
		if($("#videoType").val() == 'http'){
			$('#httpVideo').click();
		}else{
			$('#playerBtn').click();
			$('#flash_hide_' + playerid).hide();
		}
	}
    YY.loadScript(['yonyou/modules/file/yy.image.js'], {
        fn: function(){
            var img = new YY.Image('.chakanCont01 img'),
                $operateLine = $('.yy-operate-line');
            var max_width = 570, max_height = 'auto';

            // 设置图片可以显示的最大高宽;
            img.setMaxSize(max_width, max_height);
            // 设置图片的原始尺寸;
            img.setOrigSize();
            // 图片左旋转
            $('.yy-turnleft', $operateLine).on('click',function(){
                img.rotate(1);
            });
            // 图片右旋转
            $('.yy-turnright', $operateLine).on('click',function(){
                img.rotate(-1);
            });
        }
    });
    YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js'],{
		fn: function(){
			 var dialog_obj = new YY.SimpleDialog({
				 'title': '&nbsp;',
				 'width': 500,
				 'height': 300,
				 'cache': false,
				 'hasHeader':true,
				 //'hasFooter':false,
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
			  $('.share_edit').on({
                 'click': function(){
					 var obj = $(this);
					 var fid = obj.attr('fid');
					 dialog_obj.setTitle("编辑共享人");
					 dialog_obj.resize({width:500, height:400});
					 dialog_obj.setUrl(YY.util.url('employee/file/editshare?fileid=' + fid+'&allversionStr='+allversionStr));
                     dialog_obj.open();
					 dialog_obj.onConfirm = function(){
						var chk_value =[];    
						var $f = $(".editshare");
						$('input[name="shareuser_value[]"]',$f).each(function(i){
							chk_value.push($(this).val());
						});
						//单个用户
						//var shareuser = $.trim($("#shareuser").val());
						if(chk_value){
							 YY.util.ajaxApi(YY.util.url('employee/file/editshareok'), 
								function(d,s){
									if(s === 'success' && d) {
										if(d.rs){
											var sharediv = $("#listps_e2");
											var getshare = d.data.shareuser;
											var userinfo = "";
											if(getshare.length > 0){						
												for(var i=0,j=getshare.length;i<j;i++){
													userinfo = userinfo + '<div class="grid item" id="showshareuser_'+getshare[i].id+'"><img src="'+getshare[i].imageurl+'" class="photo"><a href="#">'+getshare[i].name+'</a></div>';
												}
											}
											sharediv.append(userinfo);
										}else{
											$.yy.rscallback(d.error, 1);
										}
									}
								}, 'GET', 'json', {shareuser:chk_value,fileid:fid});
							 return true;
						}
					 };	
					 dialog_obj.onComplete = function(){
						$("#delshare").live('click',function(){
							var obj = $(this);
							var data= obj.attr('data');
							var fileid = obj.attr('fileid');
							var yyli= $("#yyauto_li_"+data);
							var showshareuser = $("#showshareuser_"+data);
							YY.util.ajaxApi(YY.util.url('employee/file/delshare'), 
								function(d,s){
									if(s === 'success' && d) {
										if(d.rs){
											yyli.fadeOut();
											showshareuser.fadeOut();
										}else{
											$.yy.rscallback("删除失败！", 1);
										}
									}
								}, 'GET', 'json', 
							{fileid: fileid,employeeid:data});
						});
					 }
                 }
             });
			$(".uploadVersion").on({
				'click':function(){
					var obj = $(this);
					dialog_obj.setUrl(YY.util.url('employee/file/uploadversion?fileid=' + obj.attr('fid')));
					var topinfo = "上传文档至&nbsp;<b>"+ obj.attr('data') +"</b>";
					dialog_obj.setTitle(topinfo);

					dialog_obj.open();
					dialog_obj.resize({width:500, height:400});
					dialog_obj.onComplete = function(){
						YY.util.initUpload(function(){
							var parentid = $("#parentid").val(),
								ancestorids = $("#ancestorids").val(),
								level = $("#level").val();
							var p_url = YY.util.url('employee/file/uploadversionok') +"?parentid="+parentid+"&ancestorids="+ancestorids+"&level="+level;
							var fileFromObj = $("#fileFromObj").val(),
								fid = $("#fid").val(),
								upload2 = new InitUpload({
									debug: false,
									button_placeholder_id: 'groupFileUploadBtn',
									upload_url:  p_url,
									post_params: {"session_id" : session_id, "qiater_user" : qiater_user},
								});
						});
						//删除
						$(".yy-uploaded-file-delete").live('click',function(){
							var obj = $(this);
							var fileid = obj.attr('fileid');
							var updiv= $("#upversion_"+fileid);
							YY.util.ajaxApi(YY.util.url('employee/file/delfile'), 
								function(d,s){
									if(s === 'success' && d) {
										updiv.fadeOut();
									}
								}, 'GET', 'json', 
							{fileid: fileid});
						});
					};
					dialog_obj.onConfirm = function(){
						var org_fileid = $("#org_fileid").val();
						if(org_fileid){
							YY.util.ajaxApi(YY.util.url('employee/file/getnew'), 
								function(d,s){
									if(d.rs) {
										if(d.data.newfileid){
											document.location.href ="/employee/file/view?fileid="+d.data.newfileid;
										}
									}
								}, 'GET', 'json', 
							{org_fileid: org_fileid});
							
							return true;
						}
					};	
				}
			});

		}
	});

	//$('#filereply').yyautoWrap(140);

	//pub在view/index.html中定义的
	var fp = new FlexPaperViewer(
			 player,
			 'viewerPlaceHolder', { config : {
			 SwfFile : escape(imgpath),
			 Scale : 0.95,
			 ZoomTransition : 'easeOut',
			 ZoomTime : 0.5,
			 ZoomInterval : 0.2,
			 FitPageOnLoad : true,
			 FitWidthOnLoad : true,
			 PrintEnabled : false,
			 FullScreenAsMaxWindow : false,
			 ProgressiveLoading : false,
			 MinZoomSize : 0.2,
			 MaxZoomSize : 5,
			 SearchMatchAll : true,
			 InitViewMode : 'Portrait',
			 button_window_mode : 'Opaque',
			 PrintPaperAsBitmap : false,
			 ViewModeToolsVisible : true,
			 ZoomToolsVisible : true,
			 NavToolsVisible : true,
			 CursorToolsVisible : false,
			 SearchToolsVisible : false,
			 localeChain: 'zh_CN'
			 }});

(function(){
    //编辑标题
    var $titleBlock = $('#fileTitle'),
        $title = $('.yy-file-title',$titleBlock),
        $title_placeholder = $('.placeholder',$titleBlock),
        orig_title = $title_placeholder.html(),
        orig_title_width = $title_placeholder.width();
    //如果标题文字宽度大于125px，那么自动调整input宽度；
    if (orig_title_width>125)
        $title.animate({ width:(orig_title_width+5)},'normal');
    $titleBlock.children().bind('click', function(){
        orig_title_width = $title_placeholder.width();
        orig_title = $title_placeholder.html();
        $title.removeClass('hidden');
        $title_placeholder.addClass('hidden');
        $title.removeAttr('readonly').css('background','#FFF').focus();
        if(! $title_placeholder.hasClass('hidden')){
	        var new_width = orig_title_width<295 ? 300 : orig_title_width+5;
	        $title.animate({ width: new_width}, 'normal');
        }
        return false;
    });
    $title.blur(function(){
        var $me = $(this),
            new_title = $.trim($me.val());
		//判断字数 start
		str = new_title.replace(/<a[^>]*>/gi,'')
            .replace(/<\/a[^>]*>/gi,'')
            .replace(/[\u4E00-\u9FA5]/gi,'!!')
            .replace(/\<img[\s\S]*?\/?\>/ig,'!!!!')
            .replace(/<br[^>]*>/gi,'')
            .replace(/\&nbsp;/gi," ");
		var title_length = Math.floor(str.length/2);
		if(title_length > 28){
			$.yy.rscallback("文件名不能超过28个字！", 1);
			var new_title = getStrbylen(new_title,28*2);
		}
		//判断字数 end
        $title.addClass('hidden');
        $title_placeholder.removeClass('hidden');
        if(new_title != '' && new_title!=orig_title){
        	YY.util.ajaxApi(YY.util.url('employee/file/subupdate'), function(){
                $title_placeholder.text(new_title);
                $('.yy-file-title').val(new_title);
                orig_title_width = $title_placeholder.width();
                var new_width = orig_title_width<125 ? 130 : (orig_title_width+5);
                $title.animate({ width:new_width},'normal');
            }, 'POST', 'html', 'title=' + new_title + '&fid=' + fid + '&type=1&ajaxsubmit=1');
        }
        else {
            var new_width = orig_title_width<125 ? 130 : (orig_title_width+5);
            $title.animate({ width:new_width},'normal');
        }
    }).keydown(function(e){
        var $me = $(this);
        enterExcute(e, function(){
            $me.blur();
        });
    });
    //编辑描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述
    var $descBlock = $('#fileDesc'),
        $descPlaceholder = $('.yy-placeholder', $descBlock),
        $descContent     = $('.yy-desc-content', $descBlock),
        $descCount = $('.yy-desc-count'),
        desc_init_height = $descContent.height(),
        orig_desc = $descContent.html(),
        orig_desc_width = $descContent.width(),
        DESC_MAX_COUNT = 150;
    // 展开按钮的默认显示状态;
    var visibility = $descPlaceholder.height()>desc_init_height ? 'visible' : 'hidden';
    $('.yy-showmore', $descBlock).css({
        'visibility': visibility
    });
    // 点击编辑按钮，激活编辑状态;
    $('#picInfo', $descBlock).on({
        'click': function(){
            var $me = $(this),
                is_edit = $me.attr('href') === '#yy-file-desc-edit' ? true : false;

            $descContent.attr('contenteditable', true).css({
                'background': '#fff',
                'height': 'auto'
            }).focus();

            if (!is_edit || $descContent.html() === '这个文档还没有被描述,') {
                $descContent.html('');
            }
            var content = $descContent.text(),
                count = calculateTextCount(content),    // 计算当前文字数量;
                $count = $descCount.children('.count');

            $count.html(DESC_MAX_COUNT-count);
            // 显示还可输入数量提示;
            $descCount.show();

            return false;
        }
    });
    // 展开，显示更多描述;
    $('.yy-showmore', $descBlock).on({
        'click': function() {
            var $me = $(this),
                is_expand = $me.attr('is_expand') ? true : false;

            var height = desc_init_height;
            if (is_expand) {
                $me.removeAttr('is_expand');
                height = desc_init_height;
            }
            else {
                $me.attr('is_expand', '1');
                height = 'auto';
            }
            $me.children().toggleClass('downSj upSj');
            $me.siblings('.yy-desc-content').css({
                'height': height
            });
        }
    });
    // 描述编辑结束;
    $descContent.on({
        'blur': function() {
            var $me = $(this),
                new_desc = $me.text();
            // 计算当前文字数量;
            var desc_length = calculateTextCount(new_desc);
            if(desc_length > DESC_MAX_COUNT){
                $me.focus();
                $.yy.rscallback('描述文字不能多于' + DESC_MAX_COUNT + '个字。', 1);
                return false;
                // $descCount.children('.count').html(0);
                // new_desc = getStrbylen(new_desc, DESC_MAX_COUNT*2);
            }
            // new_desc = new_desc.replace()
            // 更新修改后的内容;
            if(new_desc === '' || new_desc === "这个文档还没有被描述,"){
                new_desc = "这个文档还没有被描述,";
            }
            if(new_desc !== orig_desc){
                YY.util.ajaxApi(YY.util.url('employee/file/subupdate'), function(d,s){
                    $.yy.rscallback('文档描述保存成功！');
                }, 'POST', 'json', 'content=' + new_desc + '&fid=' + fid + '&type=2');
            }
            $me.html(new_desc).removeAttr('contenteditable').removeAttr('style');
            $descPlaceholder.html(new_desc);
            var visibility = $descPlaceholder.height()>desc_init_height ? 'visible' : 'hidden';
            $('.yy-showmore', $descBlock).removeAttr('is_expand').css({
                'visibility': visibility
            }).children().removeClass('upSj').addClass('downSj');
            $descCount.hide();
        },
        'keydown': keyDownAndUpEvent,
        'keyup': keyDownAndUpEvent
    });
    /**
     * 键盘的keydown和keyup事件;
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    function keyDownAndUpEvent(e) {
        var $me = $(this),
            new_desc = $me.text();
        // 计算当前文字数量;
        var desc_length = calculateTextCount(new_desc),
            count = DESC_MAX_COUNT-desc_length;
        // if(desc_length > DESC_MAX_COUNT){
        //     count = 0;
        //     new_desc = getStrbylen(new_desc, DESC_MAX_COUNT*2);
        //     $me.html(new_desc);
        // }
        $descCount.children('.count').html(count);

        // 执行回车操作;
        return enterExcute(e, function(){
            $me.blur();
        });
    }
    /**
     * 计算纯文字的数量;
     * @param  {[type]} txt [description]
     * @return {[type]}     [description]
     */
    function calculateTextCount(txt) {
        var count = 0;
        if (txt) {
            txt = $.trim(txt);
            txt = txt.replace(/<a[^>]*>/gi,'')
                    .replace(/<\/a[^>]*>/gi,'')
                    .replace(/[\u4E00-\u9FA5]/gi,'!!')
                    .replace(/\<img[\s\S]*?\/?\>/ig,'!!!!')
                    .replace(/<br[^>]*>/gi,'')
                    .replace(/\&nbsp;/gi," ");
            count = Math.floor(txt.length/2);
        }
        return count;
    }

function getStrbylen(str, len) {
	var num = 0;
	var strlen = 0;
	var newstr = "";
	var obj_value_arr = str.split("");
	for(var i = 0; i < obj_value_arr.length; i ++) {
		if(i < len && num + byteLength(obj_value_arr[i]) <= len) {
			num += byteLength(obj_value_arr[i]);
			strlen = i + 1;
		}
	}
	if(str.length > strlen) {
		newstr = str.substr(0, strlen);
	} else {
		newstr = str;
	}
	return newstr;
}
function byteLength (sStr) {
	aMatch = sStr.match(/[^\x00-\x80]/g);
	return (sStr.length + (! aMatch ? 0 : aMatch.length));
}
//点击释放回车键，执行函数句柄；
function enterExcute(e, func){
    if(typeof func !== 'function') return false;
    var keyCode = e.keyCode
                ? e.keyCode
                : (e.which ? e.which : e.charCode);
    if (keyCode == 13) {
        func();
        return false;
    }
    return true;
}
})();

	/*$.yy.defaultText({
		filereply: { txt: '输入内容'}
	});*/
	$("#allMember").mouseover(function(){
		$("#fydTk").show();
	}).mouseout(function(){
		$("#fydTk").hide();
	});
	//"创建"按钮呈现样式设定
	showButton();
	$('#filereply').bind('keyup', showButton)
			   .bind('blur', showButton);

	//翻页效果
	var fid = $("#fid").val();
	var allversionStr = $("#allversionStr").val();
	var urlSpace = YY.util.url("space/cons/index/id/");

	YY.loadScript(['yonyou/lib/yonyou.js','yonyou/lib/class.js','yonyou/lib/pageskip.js'],{
		fn:function(){
		
			var ps = $.newInstance("lib.common.pageSkip",{
				url:YY.util.url('employee/file/filefollow?fileid='+fid+'&allversionStr='+allversionStr),
				callback:function(rs,pageObj){
					var followers = rs.data.followers;
					var followinfo= "";
					var smallAvatar = YY.util.url('/images/default_avatar_small.gif');
					if(followers.length > 0){
						
						for(var i=0,j=followers.length;i<j;i++){
							followinfo = followinfo +  '<div class="grid item"><img src="'+followers[i].imageurl+'" class="photo"  tips="1" rel ="/employee/employee/cardInfo/'+followers[i].id+'"><a href="/employee/homepage/index?employeeid='+followers[i].id+'">'+followers[i].name+'</a></div>';
						}
					}
					pageObj.renderList(followinfo);
				},
				pageSize:6,
				template:"#yy_skip_template"
			});
			ps.render(function (html){
				html = html.format({fileTitle:'关注的人'});
				$("#yy_follow_file").html(html);
			});
			ps.first();

			var down = $.newInstance("lib.common.pageSkip",{
				url:YY.util.url('employee/file/downuser?fileid='+fid+'&allversionStr='+allversionStr),
				callback:function(rs,pageObj){
					var followers = rs.data.followers;
					var followinfo= "";
					var smallAvatar = YY.util.url('images/default_avatar_small.gif');
					if(followers.length > 0){
						for(var i=0,j=followers.length;i<j;i++){
							followinfo = followinfo +  '<div class="grid item"><img src="'+followers[i].imageurl+'" class="photo" tips="1" rel ="/employee/employee/cardInfo/'+followers[i].id+'"><a href="/employee/homepage/index?employeeid='+followers[i].id+'">'+followers[i].name+'</a></div>';
						}
					}
					pageObj.renderList(followinfo);
				},
				pageSize:6,
				template:"#yy_skip_template"
			});
			down.render(function (html){
				html = html.format({fileTitle:'下载的人'});
				$("#yy_down_file").html(html);
			});
			down.first();

			var share = $.newInstance("lib.common.pageSkip",{
				url:YY.util.url('employee/file/shareuser?fileid='+fid+'&allversionStr='+allversionStr),
				callback:function(rs,pageObj){
					var followers = rs.data.followers;
					var followinfo= "";
					var smallAvatar = YY.util.url('/images/default_avatar_small.gif');
					if(followers.length > 0){
						
						for(var i=0,j=followers.length;i<j;i++){
							followinfo = followinfo +  '<div class="grid item" id="showshareuser_'+followers[i].id+'"><img src="'+followers[i].imageurl+'" class="photo" tips="1" rel ="/employee/employee/cardInfo/'+followers[i].id+'"><a href="/employee/homepage/index?employeeid='+followers[i].id+'">'+followers[i].name+'</a></div>';
						}
					}
					pageObj.renderList(followinfo);
				},
				pageSize:6,
				template:"#yy_skip_template"
			});
			share.render(function (html){
				html = html.format({fileTitle:'共享的人'});
				$("#yy_share_file").html(html);
			});
			share.first();
		}
	});
	function videofunc(){
		//视频操作方法
		var str = $("#videoUrl").val();
		if(str){
			var flag = $.trim(str).match(/http:\/\/.+/);
			var videoPic = $('#videoPic');
			if(flag == null){
				$('#videoSta').val(0);
				$('#errorinfo').show();
				$('#errorinfo').text('不支持的视频地址');
			}else if(flag && videoPic.html() == ''){
				var url = YY.util.url('/file/act/ajaxvideo');
				var rq = {posturl: str};
				YY.util.ajaxApi(url, function(s){
					if(s){
						data = s;
						videoPic.show();
						videoPic.html('<a href="javascript:;" class="videoClosed" onclick="closeVideo();">重新上传</a><img src="' + data.videoPic + '" alt="' + data.title + '" />');
						$('#errorinfo').html('');
						$('#errorinfo').hide();
						$('#videoInput').hide();
						$('#videoSta').val(1);	//视频状态
					}else{
						$('#videoSta').val(0);
						$('#errorinfo').show();
						$('#errorinfo').text('不支持的视频地址');
					}
						
				}, 'POST', 'json', rq);
			}
		}
	}
	
});
$("input[name='groupDocSub']").live('click',function(){
	var checkvideo = $("#videoSta").val();
	var share_div_value = [];
	var $f = $("form[name='myform']");
	$('input[name="share_div_value[]"]', $f).each(function(i){
		share_div_value.push($(this).val());
	});
	var fids = $('#fids', $f).val();
	if(checkvideo > 0){
		//地址视频上传
		var posturl = YY.util.url('/file/act/urlupload');
		var videoinfo = {
			videourl:$("#videoUrl").val(),
			fid:$("#fid").val(),
			videoSta:checkvideo};

		YY.util.ajaxApi(posturl, function(d){
			if(d.rs) {
				$.yy.rscallback('上传成功');				
			}else{
				$.yy.rscallback(d.error, 1);
			}
		}, 'POST', 'json', videoinfo);
		$(".groupUploadColose").click();
	}else{
		if($("input.groupUploadFids").val() != ""){
			$(".groupUploadColose").click();
		}
	}
});
function showButton(){
	if( $("#filereply").val()){
		$("#savesubmit").removeAttr('disabled')
			.removeClass("darkGrayButton")
			.addClass("blueButton");
	}else{
		$("#savesubmit").attr('disabled','true')
			.removeClass("blueButton")
			.addClass("darkGrayButton");
	}
}

$('.yy-delete-link').live('click', function(){
	$(this).closest('div').find('.yy-delete:first').trigger('click');
});

//setTimeout的变量；
var tv1 =10, tv2=10;
$('.yy-delete').live('click', function(){
        var $me = $(this);
        clearTimeout(tv1);
        tv2 = setTimeout(function(){
            $me.children('.delTk').length
                ? $me.children('.delTk').removeClass('hidden')
                : $me.append('<aside class="delTk">确定要删除该文档？<br/>'
                        +'<a href="#yy-delete-confirm" class="yy-delete-confirm">删除</a> '
                        +'<a href="#yy-delete-cancel" class="yy-delete-cancel">不删除</a>'
                        +'<span class="sj xsj"></span></aside>');
            $('.yy-file-operate-list').trigger("mouseleave");
            // $('.yy-file-operate-list').die("mouseenter");
            $me.closest("td").removeClass('yy-file-operate-list');
        },300);

    }
);
//确认要删除！
$('.feed-delete-confirm').live('click', function(){
	var url = $(this).closest("div").parent().find(".yy-delete-link").attr("for");
	var old = location.href.split("?")[0];
    var fid = $(this).closest("div").parent().find(".yy-delete-link").attr("fid");
	$(this).closest("td").addClass("yy-file-operate-list");        
    var data = "fileid="+fid;
	var url = YY.util.url("employee/file/delfile")+"?"+data

	YY.util.ajaxApi(url,
		function(d,s){
			if(d.rs){	
				$.yy.rscallback(d.error);
				document.location.href = YY.util.url("employee/file/index");
			}else{
				$.yy.rscallback(d.error,1);
			}
		}, 'GET', 'json', '');
});
//不想删除，取消；
$('.yy-delete-cancel').live('click', function(){
    var $me = $(this);
    $me.closest('.delTk').addClass('hidden');
	$(this).closest("td").addClass("yy-file-operate-list");
    return false;
});
function trim(str){ //删除左右两端的空格
	return str.replace(/(^\s*)|(\s*$)/g, "");
}
//关闭视频预览
function closeVideo(){
	$('#videoSta').val(0);
	$('#videoPic').html('');
	$('#videoPic').hide();
	$('#videoInput').show();
	$('#videoUrl').val('');
	$("#errorinfo").html('');
}
var tv1 =10, tv2=10,
	delContainterClass = 'reply-del-containter',
	delConfirmClass = 'reply-del-confirm',
	delCancelClass = 'reply-del-cancel';
$('.reply-del').live('click', function(){
		var $me = $(this),
			fid = $me.attr('fid'),
			url = $me.attr('for');
		$td = $me.closest('div.otheraction');
		clearTimeout(tv1);
		tv2 = setTimeout(function(){
			$td.children('.' + delContainterClass).length
				? $td.children('.delTk').removeClass('hidden')
				: $td.append('<div class="delLay relative fl yy-delete z5" style="left:48px;top:20px;"><aside class="delTk reply-del-containter">确定要删除该' +
						$me.attr('name') + '？<br/>'
						+'<a href="javascript:;" url="' + url + '" fid="' + fid + '"' 
						+ ' class="del-confirm ' + delConfirmClass + '">删除</a> '
						+'<a href="javascript:;" class="del-cancel ' + delCancelClass + '">不删除</a>'
						+'<span class="sj xsj"></span></aside></div>');
		},300);
		return false;
	}
);

//确认要删除！
$('.' + delConfirmClass).live('click', function(){
	var $me = $(this),
		url = $me.attr('url'),
		$containter = $me.closest('.' + delContainterClass);
	$containter.addClass('hidden');
	YY.util.ajaxApi(url, 
		function(d,s){
			if(s === 'success' && d) {
				if(d.rs){
					$.yy.rscallback('删除成功');
					$me.closest('div.allreply').remove();
                    //页面上评论数自增
                    var getcommentnum = parseInt($("#allcommentnum").html()) - 1;
                    if(getcommentnum < 0){
                        var getcommentnum = 0;
                    }
                    $("#allcommentnum").html(getcommentnum);
				}else{
					 $.yy.rscallback('删除失败');
				}
			}
		}, 'GET', 'json', {module:109});
	return false;
});
//不想删除，取消；
$('.' + delCancelClass).live('click', function(){
	var $me = $(this);
	$me.closest('.' + delContainterClass).addClass('hidden');
	return false;
});
//关注
$(".yy-follow").live('click',function(){
	var $me = $(this);
	var op = $me.attr('type');//0-取消关注，1-加关注
	YY.util.ajaxApi(YY.util.url('/employee/follow/ajaxFollow'), function(obj){
		if(obj && obj.rs){
			$me.html(op == 1 ? '取消关注' : '加关注').attr('type', op == 1 ? 0 : 1);
			$me.removeClass('cancelFollowButton addFollowButton').addClass(op == 1 ? 'cancelFollowButton' : 'addFollowButton');
		}
	}, 'GET', 'JSON', {followid : $me.attr('for'), followtype : $me.attr('role'), op : op});
});
//点击查看更多
$('#reply_more').live('click', getMoreClick);
function getMoreClick(){
	var $me = $(this);
    $me.html("加载中...");
	var showpage = $("#showpage").val();
	var allversionStr = $("#allversionStr").val();
	var module = $("#module").val();
	var url = "/employee/reply/getmore";
	var params = {
		showpage:showpage,
		allversionStr:allversionStr,
		module:module
	}
	YY.util.ajaxApi(url, function(data){
		if(data){
			$(data).appendTo("#showcontent");
			$me.html("查看更多>>");
            var newpage = parseInt($("#showpage").val()) + 1;
            $("#showpage").val(newpage);
		}else{
			$me.html("没有更多内容了");
			$("#reply_more").die('click');
		}
	}, 'POST', "html", params);
}
//点击评论中的回复操作
$(".yy-reply").live('click',function(){
	$(".filereply").addClass('hidden');
	var $me = $(this);
	var obj = $me.closest('div.replyinfo').find('.filereply');
	$(".coninput").val('');
	if(obj.hasClass('hidden')){
		obj.removeClass('hidden');
	}else{
		obj.addClass('hidden');
	}
});
//点击回复按钮操作
$("#replysubmit").live('click',function(){
	var $me = $(this),
        $form = $me.closest('form'),
		replycontent = $.trim($form.find('#replycontent').val()),
		replyid = $form.find('#replyid').val();
	var targetid = $("#targetid").val(),
		module = $("#module").val(),
		fromurl = $("#fromurl").val();
	if(replycontent == ""){
		$.yy.rscallback("评论内容必须添加！",1);
	}
	var url = YY.util.url("employee/reply/add");
	var rq = {targetid:targetid,
				module:module,
				fromurl:fromurl,
				replycontent:replycontent,
				replyid:replyid};
	YY.util.ajaxApi(url,function(d,s){
		if(d.rs){	
			var geturl = YY.util.url("employee/reply/getone");
			if(d.data.replyid){
				YY.util.ajaxApi(geturl,function(s){
					if(s){
						$("#showcontent").prepend(s);
						$(".coninput").val('');
						//页面上评论数自增
						var getcommentnum = parseInt($("#allcommentnum").html()) + 1;
						$("#allcommentnum").html(getcommentnum);
					}
				}, 'GET', 'html', {id:d.data.replyid,allversionStr:$("#allversionStr").val()});
			}
			$.yy.rscallback("评论成功！");
		}else{
			$.yy.rscallback("评论失败！",1);
		}
	}, 'POST', 'json', rq);
});