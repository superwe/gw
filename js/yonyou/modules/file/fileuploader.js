/**
 * 处理文档上传的模块；
 *
 * @author qiutao qiutao@chanjet.com
 */
;(function($, YY, util){
    // 上传过程相关事件的处理函数;
    var eventHandler = {
        fileQueued : function (file) {
            try {
                this.settings.custom_settings.trace_debug && YY.util.trace('1-fileQueued');

                // 自定义配置;
                var custom_settings = this.settings.custom_settings;
                //设置上传区域块
                var $uploadBlock = this.$uploadBlock = $(this.movieElement).closest(custom_settings['uploadBlock']),
                    $uploadFileList = this.$uploadFileList = $(custom_settings['uploadFileList'], $uploadBlock);

                get_ext = (file.type).substring(1).toLowerCase();
				if(get_ext == 'rp'){
					var icon_type = "ico_mr_s";
				}else{
					var icon_type = "ico_"+get_ext+"_s";
				}
				var item_str = '';
				item_str += '<li id="' + file.id + '" class="upFileList ' + custom_settings['uploadFileItem'].substring(1) + '"><div class="'
                        +custom_settings['uploadFileTitle'].substring(1)+'"><span class="'+icon_type+'">'+file.name+'</span></div><div class="'
                        +custom_settings['uploadFileSize'].substring(1)+'">'+formateSize(file.size)+'</div><div class="'
                        +custom_settings['uploadFileStatus'].substring(1)+'">等待上传...</div><div class="relative '
                        +custom_settings['uploadFileOper'].substring(1)+'"><a class="fDel '+custom_settings['processCancel'].substring(1)+'" href="#"></a></div></li>';
                // 添加上传文档到列表中显示
                $uploadFileList.append(item_str);
				$(custom_settings['uploadStartButton'], $uploadBlock).show();
            } catch (ex) {
                this.debug(ex);
            }
        },
        fileQueueError : function (file, errorCode, message) {
            try {
                this.settings.custom_settings.trace_debug && YY.util.trace('2-fileQueueError');
                if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
                    alert("您上传列队中文档太多，"+(message==0 ? "已经达到了上限。" : "还能选择" + message + "个文档"));
                    return;
                }

                switch (errorCode) {
                    case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                        alert("文档过大!，请上传小于"+ this.settings.file_size_limit+"的文档");
                        this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                        break;
                    case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                        alert('不能上传 0 字节的文档');
                        this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                        break;
                    case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                        alert('非法的文档格式');
                        this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                        break;
                    default:
                        if (file !== null) {
                            alert('Unhandled Error');
                        }
                        this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                        break;
                }
            } catch (ex) {
                this.debug(ex);
            }
        },
        /**
         * 完成弹出框的文档选择;
         * @param  {[type]} numFilesSelected [description]
         * @param  {[type]} numFilesQueued   [description]
         * @return {[type]}                  [description]
         */
        fileDialogComplete : function (numFilesSelected, numFilesQueued) {
            try {
                this.settings.custom_settings.trace_debug && YY.util.trace('3-fileDialogComplete');
                // 自定义配置;
                var custom_settings = this.settings.custom_settings;

                var $uploadFileList = this.$uploadFileList;
                numFilesQueued && $uploadFileList && $uploadFileList.show();

                // 设置等待上传的数量;
                var stats = this.getStats();
                this.$uploadQueueNum = this.$uploadQueueNum || $(custom_settings['uploadQueueNum'], this.$uploadBlock);
                if (stats.files_queued) {
                    this.$uploadQueueNum.html(stats.files_queued).parent().show();
                }

                // 当配置isAutoUpload为true的时候，可以让上传自动开始;
                this.settings.isAutoUpload && this.startUpload();
            } catch (ex)  {
                this.debug(ex);
            }
        },
        /**
         * 开始上传;
         * @param  {[type]} file [description]
         * @return {[type]}      [description]
         */
        uploadStart : function (file) {
            try {
                this.settings.custom_settings.trace_debug && YY.util.trace('4-uploadStart');
                var custom_settings = this.settings.custom_settings;

                var file_id = file.id,
                    $item = $('#'+file_id, this.$uploadFileList);
                    $status = $item.find(custom_settings['uploadFileStatus']),
                    $oper = $item.find(custom_settings['uploadFileOper']);
                // 设置当前上传文档的信息行的jQuery dom缓存
                this.$uploadFileItem = $item;
                this.$uploadFileStatus = $status;
                this.$uploadFileOper = $oper;

                // 此方法内获取到了this.upload_location和this.location_list
                getLocationList(this);

                // 将上传的等待状态，设置为正在上传的状态
                $status.html('<div class="uRate"><div class="uRin '+custom_settings['processBar'].substring(1)+'" style="width: 0%;"></div></div>');
                return true;
            }
            catch (ex) {}
        },
        /**
         * 上传中...ing
         * @param  {[type]} file        [description]
         * @param  {[type]} bytesLoaded [description]
         * @param  {[type]} bytesTotal  [description]
         * @return {[type]}             [description]
         */
        uploadProgress : function (file, bytesLoaded, bytesTotal) {
            try {
                this.settings.custom_settings.trace_debug && YY.util.trace('5-uploadProgress');

                var custom_settings = this.settings.custom_settings;
                var percent = Math.ceil((bytesLoaded / bytesTotal) * 100),
                    $processBar = $(custom_settings['processBar'], this.$uploadFileItem);
                $processBar.css('width', percent + '%').html(percent + '%');
            } catch (ex) {
                this.debug(ex);
            }
        },
        /**
         * 上传成功
         * @param  {[type]} file       [description]
         * @param  {[type]} serverData [description]  //fid, filename, fvid, thumbSrc, imgSrc
         * @return {[type]}            [description]
         */
        uploadSuccess : function (file, serverData) {
            try {
                this.settings.custom_settings.trace_debug && YY.util.trace('6-uploadSuccess');

                var custom_settings = this.settings.custom_settings;

                if(serverData != 'false'){
                    var dataObj = eval("(" + serverData + ")");
                    var fid = dataObj[0],
                        fvid = dataObj[2];

                    // 设置上传成功后的状态;
                    var $status = this.$uploadFileStatus;
                    $status.html('文档上传成功，请填写信息<a class="grayBt1 ml5" href="#table'+fid+'">填写信息</a>');
                    var $oper = this.$uploadFileOper;
                    $oper.html('<a class="fDel yy-uploaded-file-delete" href="#"></a>');

                    this.$fid = this.$fid || this.$uploadBlock.find('[name="fid"]');
                    typeof custom_settings.changeFileIds === 'function' && custom_settings.changeFileIds(fid, "+", this.$fid);
                    this.$uploadFileItem.attr('fid', fid);

                    addDetailTable(this, dataObj);

                    var convert_url = ( ((typeof custom_settings.convert_url!=='undefined')&&custom_settings.convert_url) 
                                            ? util.url(custom_settings.convert_url)
                                            : util.url('employee/file/convert') )+'?fileid='+fid;
                    // 触发ajax请求，实现文档转换
                    util.ajaxApi(convert_url, function(d,s){
                        // var $font = $uploadedFileItem.find('font');
                        // if (d == 1) {
                        //     $font.html("已完成");
                        // } else if(d == 2){
                        //     $font.html("此格式不支持转换");
                        // } else {
                        //     $font.html("转换失败");
                        // }
                       
                        // if(fvid[5] && fvid[6]){
                        //     var name = "remote-file-info-"+fid;
                        //     $uploadedFileItem.append('<div style="display:none;" class="'+name+'"> <input type="hidden" name="fileInfo[name][]" value="'+fvid[5]+'" > <input type="hidden" name="fileInfo[url][]" value="'+fvid[6]+'"></div>');
                        // }
                    },'GET');
                } else{
                    var $note = $("<li>请上传以下格式的文档:<br>'doc','docx','bmp','ppt','pptx','xls','xlsx','pot','potx','pps','ppsx','wps','wpsx','dps','wpt','dpt','txt','pdf', 'rar', 'zip', 'mp3', 'flv', 'wma', 'csv', 'csvx', 'mdb', 'tar'</li>");

                    $note.appendTo(this.$uploadFileList);
                    setTimeout(function(){
                        $note.remove();
                    }, 12000);
                }
            } catch (ex) {
                this.debug(ex);
            }
        },
        uploadError : function (file, errorCode, message) {
            try {
                this.settings.custom_settings.trace_debug && YY.util.trace('7-uploadError');
                //YY.util.trace(errorCode);
                switch (errorCode) {
                    case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                        this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
                        break;
                    case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                        this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                        break;
                    case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                        this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
                        break;
                    case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                        this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
                        break;
                    case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                        this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                        break;
                    case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                        this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                        break;
                    case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                        // If there aren't any files left (they were all cancelled) disable the cancel button
                        if (this.getStats().files_queued === 0) {
                            // document.getElementById(this.customSettings.cancelButtonId).disabled = true;
                        }
                        break;
                    case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                        // progress.setStatus("Stopped");
                        break;
                    default:
                        this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                        break;
                }
            } catch (ex) {
                this.debug(ex);
            }
        },
        uploadComplete : function (file) {
            this.settings.custom_settings.trace_debug && YY.util.trace('8-uploadComplete');

            var custom_settings = this.settings.custom_settings;
            // 设置等待上传的数量;
            var stats = this.getStats();
            this.$uploadQueueNum = this.$uploadQueueNum || $(custom_settings['uploadQueueNum'], this.$uploadBlock);
            this.$uploadQueueNum.html(stats.files_queued);
        },
        // This event comes from the Queue Plugin
        queueComplete : function (numFilesUploaded) {
            this.settings.custom_settings.trace_debug && YY.util.trace('9-queueComplete');
            //var status = document.getElementById("divStatus");
            //status.innerHTML = numFilesUploaded + " file" + (numFilesUploaded === 1 ? "" : "s") + " uploaded.";
        }
    };
    /**
     * 增加文档详情的填写表格;
     * @param {[type]} dataObj [description]
     */
    function addDetailTable(swfObj, dataObj) {
        if (!swfObj) { return ;}
        var $uploadBlock = swfObj.$uploadBlock,
            $saveBtBox = swfObj.$saveBtBox;

        var fid = dataObj[0],
			fname = dataObj[1];//去掉后缀名

        if (!$saveBtBox) {
			var formaction = YY.util.url('employee/file/edit');
            var $fwDetBox = $('<div class="fwDetBox"><form action="'+formaction+'" method="post"><h4>填写文档信息</h4><div class="saveBtBox"><input type="submit" class="startBt"  value="保存" name="savesubmit"></div></form></div>');
            $fwDetBox.appendTo($uploadBlock);
            $saveBtBox = swfObj.$saveBtBox = $fwDetBox.find('.saveBtBox');
        }
        var borNone = '';
        if (!swfObj.getStats().files_queued) {
            borNone = ' borNone';
        }
        var table_str = '<table id="table'+fid+'" cellspacing="0" cellpadding="0" class="fileMsg'+borNone+'">'
                    +'<tbody><tr>'
                        +'<input type="hidden" value="'+fid+'" name="fids[]"><td class="wt1 pt30">文档名称</td>'
                        +'<td align="left" class="pt30"><input type="text" name="title_'+fid+'" class="wUpText" value="'+fname+'"></td>'
                    +'</tr>'
                    +'<tr>'
                        +'<td class="wt1">文档描述</td>'
                        +'<td><textarea name="desc_'+fid+'" class="wUpClue"></textarea></td>'
                    +'</tr>'
                    /*+'<tr>'
                        +'<td class="wt1">话题</td>'
                        +'<td><input type="text" name="topic_'+fid+'" placeholder="最多5项，用空格分隔" class="wUpText"></td>'
                    +'</tr>'*/
					+'<tr>'
                        +'<td class="wt1"><input type="checkbox" name="allowdown_'+fid+'" value="1"></td>'
                        +'<td>禁止下载</td>'
                    +'</tr>';
		if (swfObj.upload_location['from'] != 'all') {
            table_str += '<tr>'
                        +'<td class="wt1">上传至</td>'
                        +'<td>'
                        +'<input type="hidden" name="orig_location" value="'+swfObj.upload_location['from']+"_"+swfObj.upload_location['val']+'">'
                        +'<select class="wUpSel" name="location_'+fid+'">'
                            + (swfObj.location_list || '')
                        +'</select></td>'
                    +'</tr>'
		}
        if (swfObj.upload_location['from']==='self') {
            table_str += '<tr>'
                            +'<td class="wt1 pb30">共享人</td>'
                            +'<td class="pb30">'
                                +'<div class="rcAddMen clearfix relative z7" style="width:370px;">'
                                +'<table width="100%" cellspacing="0" cellpadding="0" border="0" class="rcAddmenTab">'
                                +'<tbody><tr>'
                                +'<td valign="top"><div class="clearfix rcAddmenList">'
                                +'<ul class="rcAddmenListUl" id="shareuser_list">'
                                +'</ul>'
                                +'</div></td>'
                                +'<td valign="middle" align="center" class="rbg">'
                                +'<a href="javascript:;" class="rcAddmenr userSelector" for="shareuser" ></a>'
                                +'</td>'
                                +'</tr>';
                                +'</tbody></table>'
                                +'</div>'
                            +'</td>'
                        +'</tr>'
        }
        table_str += '</tbody></table>';
        var $table = $(table_str);
        $saveBtBox.before($table);
        if (swfObj.upload_location['from']==='self') {
			YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js',
				'yonyou/modules/employee/employee_select.js'], {
				fn: function(){
					YY.userSelector({
						'selector': '.userSelector',
						'callback': function(fordiv,data){
							//对所选择的人员信息进行整理
							var ret = [] ;
							var addLiId="";
							for(var i=0;i<data.length;i++){
								addLiId = "yyauto_li_"+data[i].id;

								if($("#"+fordiv+"_list li[id="+addLiId+"]").length == 0){
									//不包含的时候 增加
									ret.push('<li id="'+addLiId+'" class="rcAddmenListli"><span>');
									ret.push(data[i].name);
									ret.push('</span><input type="hidden" name="'+fordiv+'_value[]" value=');
									ret.push(data[i].id);
									ret.push('><a href="javascript:;" class="close"></a></li>');
								}
							}
							$("#"+fordiv+"_list").append(ret.join(''));//将选择的人 添加到input框中
						}
					});

					$(".scInput").on({ //删除人
						'click':function(e){
							$target = $(e.target);
							$target.closest("li").remove();
						}
					});
				}
			});
            //日程--添加参与人;
            /*$('[name="share_n"]', $table).yyautocomplete({
               // inputName: 'share_'+fid,
                appendTo: '#table'+fid+' .share_div_p',
                selAppendTo: '#table'+fid+' .share_list_p',
                ajaxUrl: util.url('/common/search/ccnotice')
            });
            $('.rcAddmenr', $table).fancybox({
                onComplete:function(e){
                    var ulbox = {};
                    ulbox = $(e).parent().parent().find('.rcAddmenListUl');
                    var toDiv = $(e).attr("for");
                    $("#consoleBtn_"+toDiv).bind('click', function(){
                        var html = '',
                            con = $("#selectedContainter").find("figure");
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
                    });
                }
            });*/
        }
    }
    /**
     * 获取文档上传的上传位置列表;
     * @return {[type]} [description]
     */
    function getLocationList(swfObj) {
        if (!swfObj) { return ;}

        // 上传位置
        swfObj.upload_location = {
            name: '',
            val: '',
			from:''
        };

        var $leftMenu = $('#doc-leftnav-containter .wLeftMenu');
        var $dd = $leftMenu.children('.sub-leftnav-containter:visible');

        var str = '';
        if (!$dd.length) {
            //$dd = $leftMenu.children('.sub-leftnav-containter').eq(0);//暂时取消默认群组的概念
            var all = 'all';
        }

        var $prev_dt = $dd.prev(),
            flag = !!$prev_dt.length ? $prev_dt.attr('flag') : 'all';
        //swfObj.upload_location['name'] = flag==='group' ? 'gid' : 'boxid';
		//暂时取消默认群组的概念
		if(flag == 'group'){
			swfObj.upload_location['name'] = 'gid';
		}else if(flag == 'self' || flag == 'corp'){
			swfObj.upload_location['name'] = 'boxid';
		}else{
			swfObj.upload_location['name'] = 'all';
		}
		//暂时取消默认群组的概念
		 swfObj.upload_location['from'] = flag;


        var $sub_a = $dd.find('a');
        $sub_a.each(function(i){
            var $cur = $(this),
                item_id = parseInt($cur.attr('item_id')),
				isupload= parseInt($cur.attr('isupload'));
            // 他人共享目录，跳过添加
            if (item_id < -1) {
                swfObj.upload_location['val'] = -1;
                return true;
            }else if(isupload == 0){
                return true;
			}else {
                str += '<option value="'+flag+'_'+item_id+'"'
                // 添加私密标识
                if (!!$cur.find('.lockIcon').length) {
                    str += ' class="selLock"';
                }
                // 表示当前被选择
                if ((!!all && i===0) 
                        || (!all && $cur.is('.secMenuCur'))) {
                    swfObj.upload_location['val'] = item_id;
                    str += ' selected="selected"';
                }
                var indent_str = '',
                    level = parseInt($cur.attr('floor'));
                while(level--) {
                    indent_str += '--';
                }
                str += '>'+indent_str+$cur.text()+'</option>';
            }
        });
        // 设置上传位置
        var name = swfObj.upload_location['name'],
            val  = swfObj.upload_location['val'];
        // 移除不需要的参数;
        switch(name) {
            case 'gid':
                swfObj.removePostParam('boxid');
				break;
            case 'boxid':
                swfObj.removePostParam('gid');
				break;
			case 'all':
				swfObj.removePostParam('gid');//取消默认群组
				swfObj.removePostParam('boxid');
				break;
        }
        swfObj.addPostParam(name, val);

        return swfObj.location_list = str;
    }
    /**
     * 格式化文档尺寸;
     * @param  {[type]} daxiao [description]
     * @return {[type]}        [description]
     */
    function formateSize(daxiao) {
        daxiao1 = parseFloat(daxiao/1024).toFixed(2);
        if(daxiao1>1)
        {
            if(daxiao1>=1024)
            {
                daxiao1 =   parseFloat(daxiao1/1024).toFixed(2);
                daxiao  =   daxiao1+" "+"MB";
            }
            else
            {
                daxiao  =   daxiao1+" "+"KB";
            }
        }
        else
        {
            daxiao  =   daxiao+" "+"B";
        }
        return daxiao;
    }

    // 基础上传设置;
    var uploadBaseSettings = {
            flash_url : "http://gw.com/js/swfupload/swfupload.swf",
            upload_url: '',
            file_post_name: "filedata",
            post_params: {"session_id" : session_id, "qiater_user" : qiater_user},
            file_size_limit : "100 MB",
            // file_types : "*.jpg;*.jpeg;*.gif;*.png;*.doc;*.docx;*.ppt;*.pptx;*.xls;*.xlsx;*.pot;*.potx;*.pps;*.ppsx;*.wps;*.wpsx;*.dps;*.wpt;*.dpt;*.txt;*.pdf;*.rar;*.zip;*.csv;*.csvx;*.bmp;*.wma;*.tar;*.mdb;*.mp3;*.wav;*.avi;*.rmvb;*.flv;*.ram;*.ra",
            file_types : '*.*',
            file_types_description : "All Files",
            file_upload_limit : 100,
            file_queue_limit : 10,
            debug: false,
            // Button settings
            button_image_url: "http://",
            button_width: "150",
            button_height: "20",
            button_placeholder_id: "spanButtonPlaceHolder",
            // button_text: '<span class="theFont">上传文档</span>',
            // button_text_style: ".theFont { font-size: 12; }",
            button_text: '选择文档',
            button_text_left_padding: 0,
            button_text_top_padding: 4,
            button_cursor: SWFUpload.CURSOR.HAND,
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            prevent_swf_caching: false,
            // 自定义配置，此处可添加UI相关的选择器的配置项;
            custom_settings: {
                // 包含上传相关html的包裹器
                uploadBlock: '.yy-upload-block',
                uploadFileList: '.yy-upload-file-list',  // 上传列表
                uploadFileItem: '.yy-upload-file-item',  // 上传项
                uploadFileTitle: '.yy-upload-file-title',// 上传文档名称
                uploadFileSize: '.yy-upload-file-size',  // 上传文档尺寸
                uploadFileStatus: '.yy-upload-file-status', // 上传文档状态
                uploadFileOper: '.yy-upload-file-oper',     // 上传文档的操作
                uploadQueueNum: '.yy-upload-queue-num',  // 上传列队中的数量
                processContainer: '.yy-upload-process-container', // 进度条包裹器
                processBar: '.yy-upload-process-bar', // 进度条本身
                processCancel: '.yy-upload-process-cancel', // 取消上传的按钮
                uploadedFileDelete: '.yy-uploaded-file-delete', // 已经上传成功后的删除按钮
                uploadStartButton: '.yy-start-upload',   // 开始上传按钮
                isBindEvent: true,  // 绑定事件
                isAutoInit: true,   // 自动初始化
                trace_debug: false
            },
            file_queued_handler          : eventHandler.fileQueued,
            file_queue_error_handler     : eventHandler.fileQueueError,
            file_dialog_complete_handler : eventHandler.fileDialogComplete,
            upload_start_handler         : eventHandler.uploadStart,
            upload_progress_handler      : eventHandler.uploadProgress,
            upload_error_handler         : eventHandler.uploadError,
            upload_success_handler       : eventHandler.uploadSuccess,
            upload_complete_handler      : eventHandler.uploadComplete,
            queue_complete_handler       : eventHandler.queueComplete // Queue plugin event
    };

    /**
     * 文档上传器;
     * @param {[type]} settings [description]
     */
    function FileUploader(settings) {
        var me = this;

        var fn = FileUploader.prototype;
        if (typeof me.init !== 'function') {
            /**
             * 初始化上传控件;
             * @return {[type]} [description]
             */
            fn.init = function() {
                var me = this;

                var settings = me.settings,
                    custom_settings = settings.custom_settings,
                    button_placeholder_id = settings.button_placeholder_id || '';
                if(!$('#'+button_placeholder_id).length){
                    return ;
                }
                custom_settings.changeFileIds = me.changeFileIds; // 修改文档id

                var SWFUploadInst = me.SWFUploadInst = new SWFUpload(settings);//构造一个上传实例
                custom_settings.isBindEvent && me.eventBind();
            };
            /**
             * 开始上传;
             * @return {[type]} [description]
             */
            fn.startUpload = function() {
                var me = this;

                me.SWFUploadInst.startUpload();
            };
            /**
             * 取消上传;
             * @return {[type]} [description]
             */
            fn.cancelUpload = function($item) {
                var me = this;
                var file_id = $item.attr('id');

                me.SWFUploadInst.cancelUpload(file_id);

                // 设置等待上传的数量;
                var stats = me.SWFUploadInst.getStats();
                var $uploadQueueNum = $(custom_settings['uploadQueueNum'], me.$uploadBlock)
                $uploadQueueNum.html(stats.files_queued);

                var $siblings = $item.siblings();
                // 所有条目删除完毕;
                if ($siblings.length===1) {
                    $item.parent().hide();
                    $uploadQueueNum.parent().hide();
                    $(custom_settings['uploadStartButton'], me.$uploadBlock).hide();
                    // $('.hide-afert-start').show();
                    $('.hide-afert-start').css({
                        'position': 'static'
                    });
                }

                $item.remove();
            };
            /**
             * 删除文档;
             * @param  {[type]} $obj [description]
             * @return {[type]}      [description]
             */
            fn.deleteFile = function($item) {
                var me = this;

                var custom_settings = me.settings.custom_settings;
                // 消失延迟时间
                var disappearTime = custom_settings.disappearTime || 1000;

                var fid = $item.attr('fid');

                var $table = $('#table'+fid);
                if (!$table.siblings('table').length) {
                    delete me.SWFUploadInst.$saveBtBox;
                    $table.closest('.fwDetBox').remove();
                }
                else {
                    $table.remove();
                }

                var $siblings = $item.siblings();
                // 所有条目删除完毕;
                if ($siblings.length===1) {
                    $item.parent().hide();
                    $(custom_settings.uploadQueueNum, me.$uploadBlock).parent().hide();
                    $(custom_settings['uploadStartButton'], me.$uploadBlock).hide();
                    // $('.hide-afert-start').show();
                    $('.hide-afert-start').css({
                        'position': 'static'
                    });
                }

                $item.fadeOut(disappearTime, function () {
                    var $me = $(this);

                    $me.remove();
                    me.changeFileIds(fid, '-', me.$fid);
					// 删除服务器上的文档
					YY.util.ajaxApi(util.url('/file/act/delattach'), 
					function(d){
						if(d == 1){
							$.yy.rscallback('删除成功');
						}else if (d == 0) {
							$.yy.rscallback('删除失败');
						}
					}, 'POST', 'json', {fid: fid});
                });
            };
            /**
             * 清空上传列队;
             * @return {[type]} [description]
             */
            fn.cancelQueue = function() {
                var me = this;

                try {
                    if (me.SWFUploadInst.getStats().files_queued>0) {
                        me.SWFUploadInst.cancelQueue();
                    }
                }catch(ex){}
            };
            /**
             * 更改保存在input框中的文档id;
             * @param  {[type]} fid    [description]
             * @param  {[type]} type   [description]
             * @param  {[type]} $input [description]
             * @return {[type]}        [description]
             */
            fn.changeFileIds = function(fid, type, $input) {
                if (!fid) return;

                var $obj = $input,
                    value = $obj.val();
                switch(type) {
                    // 删除文档id;
                    case '-':
                        if (!!value) {
                            var varr = value.split(',');
                            for (var i = 0, vleng = varr.length; i < vleng; i++) {
                                if (varr[i] == fid) {
                                    varr.splice(i, 1);
                                    break;
                                }
                            }
                            $obj.val(varr.join(','));
                        }
                    break;
                    // 添加文档id;
                    case '+':
                        value = !value ? fid : value+','+fid;
                        $obj.val(value);
                    break;
                    default:
                    break;
                }
            };
            /**
             * 获取上传区域块的jQuery对象;
             * @return {[type]} [description]
             */
            fn.getUploadBlock = function() {
                var me = this;

                return me.$uploadBlock;
            };
            /**
             * 获取上传列表的jQuery对象;
             * @return {[type]} [description]
             */
            fn.getUploadFileList = function() {
                var me = this,
                    custom_settings = me.settings.custom_settings;

                return me.$uploadFileList 
                    || (me.$uploadFileList = $(custom_settings['uploadFileList'], me.$uploadBlock));
            };
            fn.getUploadQueueNum = function() {
                var me = this,
                    custom_settings = me.settings.custom_settings;

                return me.$uploadQueueNum
                    || (me.$uploadQueueNum = $(custom_settings['uploadQueueNum'], me.$uploadBlock));
            };
            fn.deleteSaveBtBox = function() {
                var me = this;

                delete me.SWFUploadInst.$saveBtBox;
            };
            /**
             * 添加提交参数
             * @param {[type]} name  [description]
             * @param {[type]} value [description]
             */
            fn.addPostParam = function(name, value) {
                var me = this;

                me.SWFUploadInst.addPostParam(name, value);
            };
            /**
             * 删除提交参数;
             * @param  {[type]} name [description]
             * @return {[type]}      [description]
             */
            fn.removePostParam = function(name) {
                var me = this;

                me.SWFUploadInst.removePostParam(name);
            };
            /**
             * 事件绑定;
             * @return {[type]} [description]
             */
            fn.eventBind = function() {
                var me = this;

                var custom_settings = me.settings.custom_settings,
                    $uploadBlock = me.$uploadBlock;
                // 开始上传
                var $uploadStartButton = $(custom_settings['uploadStartButton'], $uploadBlock);
                $uploadStartButton.on({
                    'click': function() {
                        me.startUpload();
                        // $('.hide-afert-start').hide();
                        $('.hide-afert-start').css({
                            'position': 'absolute',
                            'top': '-99999px',
                            'left': '0px'
                        });
                    }
                });
                // 上传文档列表上的相关操作
                var $uploadFileList = $(custom_settings['uploadFileList'], $uploadBlock);
                $uploadFileList.on({
                    'click': function(e) {
                        var $target = $(e.target);
                        // 取消上传
                        if ($target.is(custom_settings['processCancel'])) {
                            var $uploadFileItem = $target.closest(custom_settings['uploadFileItem']);
                            me.cancelUpload($uploadFileItem);
                            return false;
                        }
                        // 删除已经上传的文档
                        else if ($target.is(custom_settings['uploadedFileDelete'])) {
                            var $uploadFileItem = $target.closest(custom_settings['uploadFileItem']);
                            me.deleteFile($uploadFileItem);
                            return false;
                        }
                    }
                });
            };
        }

        var settings = me.settings = $.extend(true, {}, uploadBaseSettings, settings),
            custom_settings = settings.custom_settings;
        me.SWFUploadInst = null;
        me.$uploadBlock = $(custom_settings['uploadBlock']);
        // 保存上传的文档ID
        me.$fid = me.$uploadBlock.find('[name="fid"]');
        // 是否自动初始化
        custom_settings.isAutoInit && me.init();
    }

    YY.FileUploader = FileUploader;
}(jQuery, YY, YY.util));