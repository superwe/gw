// JavaScript Document
$(document).ready(function(){
    var ut1, ut2;
    $('#doc,#docTk').bind('mouseover', function(){
        clearTimeout(ut2);
        ut1 = setTimeout(function(){
            $('#docTk').css({
                'visibility': '',
                'top': '20px'
            });
        }, 100);
    })
        .bind('mouseout', function(){
            clearTimeout(ut1);
            ut2 = setTimeout(function(){
                $('#docTk').css({
                    'top': '-99999px'
                });
            }, 100);
        });

    $("#my_confrm_btn").bind('click', function(){
        $("#needSubmit").val("1");
        $("#speechForm").trigger('submit');
    });

	YY.util.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js'], {
         fn: function(){
             var dialog_obj = new YY.SimpleDialog({
                 'title': '选择空间文档',
                 'width': 500,
                 'height': 300,
                 'overlay' : true,
				 'hasFooter':false,
                 'autoOpen': false
             });
			 $("#selectedfileBtn").live({'click': function(){
				 var $this = $(this);
				 var val = $this.attr("data");
				 dialog_obj.setTitle('选择空间文档');
				 dialog_obj.resize({width:710, height:400});
				 dialog_obj.setUrl(YY.util.url('employee/api/selected'));
				 dialog_obj.onComplete = function(){
					 //按钮重置为灰色
					 $('#selectedfileAdd').removeClass('blueButton').addClass('grayButton');
					 $('.yy-attatchment-tr', '#selectedfileTable').removeClass('yy-attatchment-selected');
					 YY.util.ajaxApi(YY.util.url('employee/api/filelist?filter=all'), function(s){
						var $containter = $('#selectedfileTable');
						$containter.html(s);
					 }, 'POST', 'html','');
					 return true;
				 };
				 dialog_obj.open();
				 $("#selectedfileAdd").live('click',function(){
					var obj = $("a.selectedfileBtn");
					var file_id = $("tr[class$='yy-attatchment-selected']").attr('file_id'),
					file_title = $("tr[class$='yy-attatchment-selected']").attr('title'),
					fidObj = $(obj).closest('form').find("input[name='fids']");
					if(typeof(file_id) != 'undefined'){
						changeFileIds(file_id, "+", $(fidObj));
						if( $(obj).closest('form').find("#fileContainer").length > 0 ){
							str = '<li id="_file' + file_id + '" class="clearfix"><span>' + file_title + '</span> <a onclick="delThisFile(' + file_id + ');" class="fr" href="javascript:;">×</a></li>';
							$("#fileContainer").append(str).show();
						}
						if( $(obj).closest('form').find(".yy-upload-file_containter").length > 0 ){
							var li = $('<li id="_file' + file_id + '" class="clearfix"><span>' + file_title + '</span> <a class="fr" href="javascript:;">×</a></li>');
							li.find('a').on('click', function(){
								$(this).closest('li').fadeOut('500').remove();
								changeFileIds(file_id, '-', fidObj);
							});
							$(obj).closest('form').find(".yy-upload-file_containter").append(li).show();
						}
						dialog_obj.close();
					}
				 });
			 }});
		}
	});

    $('#addtopic').bind('click', function(){
        if($.trim($('#topic_input').val()) == '')return false;
        var liObj = $('<li></li>').addClass('gzBiaoqiana clearfix');
        $('<span></span>').html($('#topic_input').val())
            .appendTo(liObj);
        $('<input type="hidden" name="topic_new_value[]" />').val($('#topic_input').val()).appendTo(liObj);
        $('<a href="###" class="close"></a>')
            .bind('click', function(){
                $(this).parent('li').remove();
            })
            .appendTo(liObj);
        $('#topic_div').prepend(liObj);
        $('#topic_input').val('');
    });
//	$('#addTopicBtn').bind('click', function(){
//		$('#topic_warp').show();
//	});
    //漫游
    $(".icoMy").bind('click', function(){
        var me = $(this);
        if(me.parent().find("#myBox").length == 0){
            YY.util.ajaxApi(yyBaseurl + "/speech/ajax/showmy", function(data) {
                if(data){
                    me.parent().append(data);
                }
            }, 'POST', 'html');
        }else { $("#myBox").show();}
    });
    $("[name='cannel_myBox']").live('click', function(){

        $("#myBox").hide();
    });
    //$("a#showcfmBox").fancybox({modal:true});
});
function changeFileIds(fid, type, obj) {
	if (!fid) {
		return;
	}

	if(obj == 'undefined' || obj == null ){
		var obj = $("#fids");
	}
	var value = obj.val();
	if (type == "-") {
		if (value) {
			var varr = value.split(',');
			var varrtmp = [];
			var vleng = varr.length;
			for (i = 0; i< vleng; i++) {
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
}
function delThisFile(fid, mvname) {
	var li = $("a.selectedfileBtn").closest('form').find("#_file" + fid),
		obj = $("a.selectedfileBtn").closest('form').find("#fids");
		li.fadeOut(1, function () {
			li.remove();
			changeFileIds(fid, '-', obj);
		});
}