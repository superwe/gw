var YY = YY || {};
/**
 * 基础上传设置；
 */
YY.uploadBaseSettings = {
    flash_url : YY.util.url('http://gw.com/js/swfupload/swfupload.swf'),
    upload_url: '',
    file_post_name: "filedata",
   // post_params: { "sessid" : sessid },
    file_size_limit : "100 MB",
    // file_types : "*.jpg;*.jpeg;*.gif;*.png;*.doc;*.docx;*.ppt;*.pptx;*.xls;*.xlsx;*.pot;*.potx;*.pps;*.ppsx;*.wps;*.wpsx;*.dps;*.wpt;*.dpt;*.txt;*.pdf;*.rar;*.zip;*.csv;*.csvx;*.bmp;*.wma;*.tar;*.mdb;*.mp3;*.wav;*.avi;*.rmvb;*.flv;*.ram;*.ra",
    file_types_description : "All Files",
    file_upload_limit : 100,
    file_queue_limit : 10,
//    custom_settings : {
//        progressTarget : "fsUploadProgress",
//        cancelButtonId : "btnCancel"
//    },
    debug: false,
//Button settings
    button_image_url: "http://",
    button_width: "150",
    button_height: "20",
    button_placeholder_id: "spanButtonPlaceHolder",
//    button_text: '<span class="theFont">上传文件</span>',
//    button_text_style: ".theFont { font-size: 12; }",
    button_text: '选择文件',
    button_text_left_padding: 0,
    button_text_top_padding: 4,
    button_cursor: SWFUpload.CURSOR.HAND,
    button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
    prevent_swf_caching: false
};
/**
 * 构造装载上传处理函数;
 * @param settings
 * @param newUi
 * @returns {SetupUploadHandler}
 */
function SetupUploadHandler(settings, newUi){
    settings = settings || {};
    newUi    = newUi || {};
    var me = this,
        $uploadBlock = null,
        $processContainer = null,
        $processBar = null,
        $processCancel = null,
        $uploadedFileList = null;
    var trace_debug = false;
    if (typeof settings.trace_debug!=='undefined') {
        trace_debug = settings.trace_debug;
        delete settings.trace_debug;
    }
    if(typeof me.fileQueued !== 'function') {
        SetupUploadHandler.prototype.fileQueued = function (file) {
            try {
                trace_debug && YY.util.trace(1);
                //设置上传区域块；
                $uploadBlock = $('#'+this.movieName).closest(me.ui.uploadBlock);
                $processContainer = $(me.ui.processContainer, $uploadBlock);
                $processBar = $(me.ui.processBar, $processContainer);
                $uploadedFileList = $(me.ui.uploadedFileList, $uploadBlock);

                var progress = new FileProgress(file, this.customSettings.progressTarget);
                progress.setStatus("Pending...");
                progress.toggleCancel(true, this);
            } catch (ex) {
                this.debug(ex);
            }
        };
        SetupUploadHandler.prototype.fileQueueError = function (file, errorCode, message) {
            try {
                trace_debug && YY.util.trace(2);
                if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
                    //alert("You have attempted to queue too many files.\n" + (message === 0 ? "You have reached the upload limit." : "You may select " + (message > 1 ? "up to " + message + " files." : "one file.")));
                    alert("您只能上传" + (message > 1 ? message : 1) + "个文件");
                    return;
                }

                var progress = new FileProgress(file, this.customSettings.progressTarget);
                progress.setError();
                progress.toggleCancel(false);

                switch (errorCode) {
                case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                    progress.setStatus("File is too big.");
                    alert("文件过大!，请上传小于"+ this.settings.file_size_limit+"的文件");
                    this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                    break;
                case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                    progress.setStatus("Cannot upload Zero Byte files.");
                    alert('不能上传 0 字节的文件');
                    this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                    break;
                case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                    progress.setStatus("Invalid File Type.");
                    alert('非法的文件格式');
                    this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                    break;
                default:
                    if (file !== null) {
                        progress.setStatus("Unhandled Error");
                    }
                    this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                    break;
                }
            } catch (ex) {
                this.debug(ex);
            }
        };
        SetupUploadHandler.prototype.fileDialogComplete = function (numFilesSelected, numFilesQueued) {
            try {
                trace_debug && YY.util.trace(3);
                /*
                if (numFilesSelected > 0) {
                    document.getElementById(this.customSettings.cancelButtonId).disabled = false;
                }
                */
                /* I want auto start the upload and I can do that here */
                //在这里可以让上传自动开始;
                this.startUpload();
            } catch (ex)  {
                this.debug(ex);
            }
        };
        SetupUploadHandler.prototype.uploadStart = function (file) {
            try {
                trace_debug && YY.util.trace(4);
                /* I don't want to do any file validation or anything,  I'll just update the UI and
                return true to indicate that the upload should start.
                It's important to update the UI here because in Linux no uploadProgress events are called. The best
                we can do is say we are uploading.
                 */
                // YY.util.trace($processContainer)
                $processContainer.show();
                $processBar.css("width", "0%");

                // 上传的过程中禁止内容提交;
                $('.yy-replySubmit, #savesubmit', $uploadBlock).attr('disabled', 'disabled');

                var progress = new FileProgress(file);
                progress.setStatus("Uploading...");
                progress.toggleCancel(true, this);
            }
            catch (ex) {}
            return true;
        };
        SetupUploadHandler.prototype.uploadProgress = function (file, bytesLoaded, bytesTotal) {
            try {
                trace_debug && YY.util.trace(5);
                var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
                $processBar.css("width", percent + "%");

                var progress = new FileProgress(file, this.customSettings.progressTarget);
                progress.setProgress(percent);
                progress.setStatus("Uploading...");
            } catch (ex) {
                this.debug(ex);
            }
        };
        SetupUploadHandler.prototype.uploadSuccess = function (file, serverData) {
            try {
                trace_debug && YY.util.trace(6);
                var progress = new FileProgress(file, this.customSettings.progressTarget);
                progress.setComplete();
                progress.setStatus("Complete.");
                progress.toggleCancel(false);
                $processContainer.fadeOut(me.disappearTime);
                if(serverData != 'false'){
	                var dataObj = eval("(" + serverData + ")");
                	me.createFileContainer(dataObj[0], dataObj[1], dataObj[2], dataObj[3], dataObj[4], this.movieName);
                } else{
                    var $note = $("<li>请上传以下格式的文件:<br>'doc','docx','bmp','ppt','pptx','xls','xlsx','pot','potx','pps','ppsx','wps','wpsx','dps','wpt','dpt','txt','pdf', 'rar', 'zip', 'mp3', 'flv', 'wma', 'csv', 'csvx', 'mdb', 'tar', 'mp4', 'rmvb'</li>");

                 	$note.appendTo($uploadedFileList);
                    $uploadedFileList.show();
                 	setTimeout(function(){
                        $note.remove();
                    }, 12000);
                }
                // 上传成功之后，释放提交按钮的状态;
                $('.yy-replySubmit, #savesubmit', $uploadBlock).removeAttr('disabled');
            } catch (ex) {
                this.debug(ex);
            }
        };
        SetupUploadHandler.prototype.uploadError = function (file, errorCode, message) {
             // console.log("Error:"+errorCode);
            try {
                trace_debug && YY.util.trace(7);
                var progress = new FileProgress(file, this.customSettings.progressTarget);
                progress.setError();
                progress.toggleCancel(false);
                $processContainer.fadeOut(me.disappearTime);
                // YY.util.trace(errorCode);
                switch (errorCode) {
                    case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                        progress.setStatus("Upload Error: " + message);
                        this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
                        break;
                    case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                        progress.setStatus("Upload Failed.");
                        this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                        break;
                    case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                        progress.setStatus("Server (IO) Error");
                        this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
                        break;
                    case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                        progress.setStatus("Security Error");
                        this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
                        break;
                    case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                        progress.setStatus("Upload limit exceeded.");
                        this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                        break;
                    case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                        progress.setStatus("Failed Validation.  Upload skipped.");
                        this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                        break;
                    case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                        // If there aren't any files left (they were all cancelled) disable the cancel button
                        if (this.getStats().files_queued === 0) {
                            document.getElementById(this.customSettings.cancelButtonId).disabled = true;
                        }
                        progress.setStatus("Cancelled");
                        progress.setCancelled();
                        break;
                    case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                        progress.setStatus("Stopped");
                        break;
                    default:
                        progress.setStatus("Unhandled Error: " + errorCode);
                        this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                        break;
                }
            } catch (ex) {
                this.debug(ex);
            }
        };
        SetupUploadHandler.prototype.uploadComplete = function (file) {
            // console.log("complete");
            trace_debug && YY.util.trace(8);
            if (this.getStats().files_queued === 0) {
                //document.getElementById(this.customSettings.cancelButtonId).disabled = true;
            }
        };
        // This event comes from the Queue Plugin
        SetupUploadHandler.prototype.queueComplete = function (numFilesUploaded) {
            trace_debug && YY.util.trace(9);
            //var status = document.getElementById("divStatus");
            //status.innerHTML = numFilesUploaded + " file" + (numFilesUploaded === 1 ? "" : "s") + " uploaded.";
        };
        SetupUploadHandler.prototype.createFileContainer = function (fid, filename, fvid, thumbSrc, imgSrc, mvname) {

            trace_debug && YY.util.trace(10);
            
            $uploadedFileList.fadeIn(me.disappearTime);
            var $uploadedFileItem = $('<li class="clearfix '+(me.ui.uploadedFileItem).substr(1)+'"></li>'),
                input = $uploadBlock.find('input[name="fids"]');
            $uploadedFileItem.append('<div class="clearfix"><span>' + filename + '</span> <a href="javascript:;" id="upversion_'+fid+'" fileid="'+fid+'" class="yy-uploaded-file-delete fr"></a></div>');//(<font>转换中……</font>)
            $uploadedFileList.append($uploadedFileItem);
            me.changeFileIds(fid, "+", input);

            /*var convert_url = ( ((typeof me.settings.convert_url!=='undefined')&&me.settings.convert_url)
					            	? YY.util.url(me.settings.convert_url)
					    			: YY.util.url('/file/act/convert') )+'/fvid/'+fvid[2];
            // 触发ajax请求实现文件转换
            YY.util.ajaxApi(convert_url, function(d,s){
                // var $font = $uploadedFileItem.find('font');
                if (d == 1) {
                    $uploadedFileItem.children('div').eq(0).append('<a href="javascript:;" class="fr mr10 yy-uploaded-file-info">详情<i class="ico_xSJ"></i></a>');
                    $uploadedFileItem.append('<div style="display:none;" class="clearfix mt10"><div class="img fl cyAddico"><img src="' + fvid[3] + '"><div class="message_pic_bj"></div><div class="message_pic"><a class="yl yy-showpic" title="预览" href="' + fvid[4] + '"></a></div></div></div>');
                    
                    //$uploadedFileList.append($uploadedFileItem);
                    // $font.html("已完成");
                } else if(d == 2){
                    // $font.html("此格式不支持转换");
                } else {
                    // $font.html("转换失败");
                }
               
               if(fvid[5] && fvid[6]){
            	    var name = "remote-file-info-"+fid;
                	$uploadedFileItem.append('<div style="display:none;" class="'+name+'"> <input type="hidden" name="fileInfo[name][]" value="'+fvid[5]+'" > <input type="hidden" name="fileInfo[url][]" value="'+fvid[6]+'"></div>');
                }
                $uploadedFileItem.find('a.yy-uploaded-file-delete').bind('click', {item: $uploadedFileItem, fid: fid, input:input}, me.delThisFile);
            },'GET');*/

			// $('a.yy-showpic').live('click', function(){
			// 	$.fancybox({
			// 		'overlayShow'	: true,
			// 		'transitionIn'	: 'elastic',
			// 		'transitionOut'	: 'elastic',
			// 		'href'			: $(this).attr('href')
			// 	});
			// 	return false;
			// });
        };
        SetupUploadHandler.prototype.delThisFile = function (event) {
            trace_debug && YY.util.trace(11);
            var data = event.data;
            data.item.fadeOut(me.disappearTime, function () {
                $(this).remove();
                me.changeFileIds(data.fid, '-', data.input);
            });
            // 擦，这句是神马意思？
            $uploadedFileList.remove(".remote-file-info-"+data.fid);
        };
        SetupUploadHandler.prototype.changeFileIds = function (fid, type, input) {
            trace_debug && YY.util.trace(12);
            if (!fid) return;

            var obj = input,
                value = obj.val();
            if (type == "-") {
                if (value) {
                    var varr = value.split(','),
                        varrtmp = [],
                        vleng = varr.length,
                        i = 0;
                    for (; i< vleng; i++) {
                        if (varr[i] != fid) {
                            varrtmp[i] = varr[i];
                        }
                    }
                    obj.val(varrtmp.join(","));
                }
            } else if (type == "+") {
                if (value == "") {
                    obj.val(value + fid);
                } else {
                    obj.val(value + "," + fid);
                }
            }
        };
    }//if end;
    //事件处理函数;
    var eventHandler = {
            file_queued_handler          : me.fileQueued,
            file_queue_error_handler     : me.fileQueueError,
            file_dialog_complete_handler : me.fileDialogComplete,
            upload_start_handler         : me.uploadStart,
            upload_progress_handler      : me.uploadProgress,
            upload_error_handler         : me.uploadError,
            upload_success_handler       : me.uploadSuccess,
            upload_complete_handler      : me.uploadComplete,
            queue_complete_handler       : me.queueComplete // Queue plugin event
        },
        defaultUi = {
                uploadBlock: '.yy-upload-block',
                processContainer: '.yy-upload-process-container',
                processBar: '.yy-upload-process-bar',
                processCancel: '.yy-upload-process-cancel',
                uploadedFileList: '.yy-uploaded-file-list',
                uploadedFileItem: '.yy-uploaded-file-item',
                uploadedFileDelete: '.yy-uploaded-file-delete'
        },
        defaultSettings = YY.uploadBaseSettings;

    me.disappearTime = 1000;
    me.settings = $.extend({}, defaultSettings, eventHandler, settings);
    me.ui = $.extend({}, defaultUi, newUi);
}
/*
	A simple class for displaying file information and progress
	Note: This is a demonstration only and not part of SWFUpload.
	Note: Some have had problems adapting this class in IE7. It may not be suitable for your application.
*/
// Constructor
// file is a SWFUpload file object
// targetID is the HTML element id attribute that the FileProgress HTML structure will be added to.
// Instantiating a new FileProgress object with an existing file will reuse/update the existing DOM elements
function FileProgress(file) {
	this.fileProgressID = file.id;

	this.opacity = 100;
	this.height = 0;

	this.fileProgressWrapper = document.getElementById(this.fileProgressID);
	if (!this.fileProgressWrapper) {
		this.fileProgressWrapper = document.createElement("div");
		this.fileProgressWrapper.className = "progressWrapper";
		this.fileProgressWrapper.id = this.fileProgressID;

		this.fileProgressElement = document.createElement("div");
		this.fileProgressElement.className = "progressContainer";

		var progressCancel = document.createElement("a");
		progressCancel.className = "progressCancel";
		progressCancel.href = "#";
		progressCancel.style.visibility = "hidden";
		progressCancel.appendChild(document.createTextNode(" "));

		var progressText = document.createElement("div");
		progressText.className = "progressName";
		progressText.appendChild(document.createTextNode(file.name));

		var progressBar = document.createElement("div");
		progressBar.className = "progressBarInProgress";

		var progressStatus = document.createElement("div");
		progressStatus.className = "progressBarStatus";
		progressStatus.innerHTML = "&nbsp;";

		this.fileProgressElement.appendChild(progressCancel);
		this.fileProgressElement.appendChild(progressText);
		this.fileProgressElement.appendChild(progressStatus);
		this.fileProgressElement.appendChild(progressBar);

		this.fileProgressWrapper.appendChild(this.fileProgressElement);

		//document.getElementById(targetID).appendChild(this.fileProgressWrapper);
	} else {
		this.fileProgressElement = this.fileProgressWrapper.firstChild;
		this.reset();
	}

	this.height = this.fileProgressWrapper.offsetHeight;
	this.setTimer(null);
}
FileProgress.prototype.setTimer = function (timer) {
	this.fileProgressElement["FP_TIMER"] = timer;
};
FileProgress.prototype.getTimer = function (timer) {
	return this.fileProgressElement["FP_TIMER"] || null;
};
FileProgress.prototype.reset = function () {
	this.fileProgressElement.className = "progressContainer";

	this.fileProgressElement.childNodes[2].innerHTML = "&nbsp;";
	this.fileProgressElement.childNodes[2].className = "progressBarStatus";
	
	this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
	this.fileProgressElement.childNodes[3].style.width = "0%";
	
	this.appear();	
};
FileProgress.prototype.setProgress = function (percentage) {
	this.fileProgressElement.className = "progressContainer green";
	this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
	this.fileProgressElement.childNodes[3].style.width = percentage + "%";

	this.appear();	
};
FileProgress.prototype.setComplete = function () {
	this.fileProgressElement.className = "progressContainer blue";
	this.fileProgressElement.childNodes[3].className = "progressBarComplete";
	this.fileProgressElement.childNodes[3].style.width = "";

	var oSelf = this;
	this.setTimer(setTimeout(function () {
		oSelf.disappear();
	}, 10000));
};
FileProgress.prototype.setError = function () {
	this.fileProgressElement.className = "progressContainer red";
	this.fileProgressElement.childNodes[3].className = "progressBarError";
	this.fileProgressElement.childNodes[3].style.width = "";

	var oSelf = this;
	this.setTimer(setTimeout(function () {
		oSelf.disappear();
	}, 5000));
};
FileProgress.prototype.setCancelled = function () {
	this.fileProgressElement.className = "progressContainer";
	this.fileProgressElement.childNodes[3].className = "progressBarError";
	this.fileProgressElement.childNodes[3].style.width = "";

	var oSelf = this;
	this.setTimer(setTimeout(function () {
		oSelf.disappear();
	}, 2000));
};
FileProgress.prototype.setStatus = function (status) {
	this.fileProgressElement.childNodes[2].innerHTML = status;
};
// Show/Hide the cancel button
FileProgress.prototype.toggleCancel = function (show, swfUploadInstance) {
	this.fileProgressElement.childNodes[0].style.visibility = show ? "visible" : "hidden";
	if (swfUploadInstance) {
		var fileID = this.fileProgressID;
		this.fileProgressElement.childNodes[0].onclick = function () {
			swfUploadInstance.cancelUpload(fileID);
			return false;
		};
	}
};
FileProgress.prototype.appear = function () {
	if (this.getTimer() !== null) {
		clearTimeout(this.getTimer());
		this.setTimer(null);
	}
	
	if (this.fileProgressWrapper.filters) {
		try {
			this.fileProgressWrapper.filters.item("DXImageTransform.Microsoft.Alpha").opacity = 100;
		} catch (e) {
			// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
			this.fileProgressWrapper.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=100)";
		}
	} else {
		this.fileProgressWrapper.style.opacity = 1;
	}
		
	this.fileProgressWrapper.style.height = "";
	
	this.height = this.fileProgressWrapper.offsetHeight;
	this.opacity = 100;
	this.fileProgressWrapper.style.display = "";
	
};
// Fades out and clips away the FileProgress box.
FileProgress.prototype.disappear = function () {

	var reduceOpacityBy = 15;
	var reduceHeightBy = 4;
	var rate = 30;	// 15 fps

	if (this.opacity > 0) {
		this.opacity -= reduceOpacityBy;
		if (this.opacity < 0) {
			this.opacity = 0;
		}

		if (this.fileProgressWrapper.filters) {
			try {
				this.fileProgressWrapper.filters.item("DXImageTransform.Microsoft.Alpha").opacity = this.opacity;
			} catch (e) {
				// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
				this.fileProgressWrapper.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + this.opacity + ")";
			}
		} else {
			this.fileProgressWrapper.style.opacity = this.opacity / 100;
		}
	}

	if (this.height > 0) {
		this.height -= reduceHeightBy;
		if (this.height < 0) {
			this.height = 0;
		}

		this.fileProgressWrapper.style.height = this.height + "px";
	}

	if (this.height > 0 || this.opacity > 0) {
		var oSelf = this;
		this.setTimer(setTimeout(function () {
			oSelf.disappear();
		}, rate));
	} else {
		this.fileProgressWrapper.style.display = "none";
		this.setTimer(null);
	}
};
/**
 * 根据配置，初始化上传，构造一个上传实例;
 * @param mySettings
 */
function InitUpload(mySettings, myUi){
    var upload = new SetupUploadHandler(mySettings, myUi),//构造一个上传处理实例；
        button_placeholder_id = upload.settings.button_placeholder_id;
    this.SWFUploadInst = null;
    if(button_placeholder_id && $('#'+button_placeholder_id).length){
        var SWFUploadInst  = new SWFUpload(upload.settings),//构造一个上传实例；
            $processCancel = $(upload.ui.processCancel);
        this.SWFUploadInst = SWFUploadInst;    
        //取消上传；
        $processCancel.live({ 
            click: function(){
                SWFUploadInst.cancelQueue();
            }
        });
    }
}
InitUpload.prototype.setURl= function (url){
    //url = YY.util.url(url);
    this.SWFUploadInst.SWFUpload(url);
}
