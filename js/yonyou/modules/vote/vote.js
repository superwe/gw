/**
 * Created with JetBrains PhpStorm.
 * User: Yuanjing
 * Date: 13-4-12
 * Time: 下午4:23
 * To change this template use File | Settings | File Templates.
 */

$(document).ready(function() {
if ($('#vote_type_nav').length > 0) {
    $('#vote_type_nav').children().each(function(){
        var nav = $(this);
        nav.bind('click', function(){
            if (! $(this).hasClass('cur')) {
                var curObj = $('#' + $(this).parent().find('.cur').attr('link'));
                var needObj = $('#' + $(this).attr('link'));
                curObj.hide();
                curObj.appendTo($('#hidden_vote_type'));
                needObj.appendTo($('#div_vote_need_change'));
                needObj.show();
                //导航的状态切换
                $(this).parent().find('.cur').removeClass('cur');
                $(this).addClass('cur');
                //判断提交按钮是否可用
                //me.showButton();
            }
        });
    });
}
// 文字投票结束时间
$("#endTimeBtn").bind("click", function (e){
    if ($(e.target).attr("checked") == 'checked'){
        $("#end_date, #end_hour").hide();
    }else {
        $("#end_date, #end_hour").show();
    }
});
//图片投票的添加说明操作
if ($('#word_vote_add_instruction').length > 0) {
    $('#word_vote_add_instruction').bind('click', function (e) {
        var vote_type = 'word_vote';
        if ($('#' + vote_type + '_instruction').hasClass('hidden')) {
            $('#' + vote_type + '_instruction').removeClass('hidden');
            $(this).html('关闭说明');
        } else {
    $('#' + vote_type + '_instruction').addClass('hidden');
    $(this).html('添加说明');
    }
});
}
//图片投票的添加说明操作
if ($('#pic_vote_add_instruction').length > 0) {
    $('#pic_vote_add_instruction').bind('click', function (e) {
        var vote_type = 'pic_vote';
        if ($('#' + vote_type + '_instruction').hasClass('hidden')) {
            $('#' + vote_type + '_instruction').removeClass('hidden');
            $(this).html('关闭说明');
        } else {
    $('#' + vote_type + '_instruction').addClass('hidden');
    $(this).html('添加说明');
    }
});
}
//文字投票的在添加一项
if ($('#vote_word_option_add').length > 0) {
    $('#vote_word_option_add').bind('click', function(){
        if ($('#div_vote_word_option').length > 0) {
            var optionObj = $('#div_vote_word_option').children().last().clone();
            var index = $('#div_vote_word_option').children().length + 1;
            var textObj = optionObj.find('input');
            if (textObj.length > 0) {
                textObj.attr('id', 'opt' + index);
                textObj.attr('placeholder', '候选项' + index);
                textObj.attr('value', '');
                optionObj.appendTo($('#div_vote_word_option'));
            }
}
});
}
//文字投票显示高级设置
if ($('#vote_word_show_super_set').length > 0) {
    $('#vote_word_show_super_set').bind('click', function(){
        if ($('#div_vote_word_super_set').hasClass('hidden')) {
            $('#div_vote_word_super_set').removeClass('hidden');
            $(this).html('收起高级设置<span class="arrowUp"></span>');
        } else {
    $('#div_vote_word_super_set').addClass('hidden');
    $(this).html('展开高级设置<span class="arrowDown"></span>');
    }
});
}
//输入
$("#title, #pic_vote_title, .tp_add_hxx1").live('keyup', function (){
    var tab =  $('#vote_type_nav').find('.cur').attr('link');
    if (tab == 'voteForm_word') {
    var optNum = 0;
    $('#div_vote_word_option').children().each(function(){
    if ($(this).find('input.addInput').val() !== '') {
    optNum++;
    }
});
if ($('#title').val() !== '' && optNum >= 2) {
    $("#savesubmit").attr('class', 'button gzChengButton').removeAttr('disabled');
    } else {
    $("#savesubmit").attr('class', 'button grayButton').attr('disabled', 'true');
    }
} else {
    var picOptNum = 0;
    $('#ul_vote_pic_option').children().each(function(){
    var img = $(this).find('input[name^=pic_vote_image]').val();
    if (img != '') {
    picOptNum++;
    }
});
if ($('#pic_vote_title').val() !== '' && picOptNum >= 2) {
    $('#savesubmit').attr('class', 'button gzChengButton').removeAttr('disabled');
    } else {
    $('#savesubmit').attr('class', 'button grayButton').attr('disabled', true);
    }
}
});
//文字投票选项添加change事件
$('.tp_add_hxx1').live('blur', function(){
    var optNum = 0;
    $('#div_vote_word_option').children().each(function(){
    if ($(this).find('input.tp_add_hxx1').val() !== '') {
    optNum++;
    }
});
var selectListNum = $('#vote_word_optnum_select').children().length;
if (optNum > selectListNum) {
    $('#vote_word_optnum_select').append('<option value="' + optNum + '">最多选' + optNum + '项</option>');
    } else if (optNum != selectListNum && selectListNum > 2) {
    $('#vote_word_optnum_select').children().last().remove();
    }
});
//图片投票的再添加一项
if ($('#vote_pic_option_add').length > 0) {
    $('#vote_pic_option_add').bind('click', function (e) {
        if ($('#ul_vote_pic_option').length > 0) {
            var index = $('#ul_vote_pic_option').children().length + 1;
            var optionStr = '<li>';
            optionStr += '<div class="fl num">' + index + '.</div>';
            optionStr += '<div class="fl tp_pic relative">';
            optionStr += '<img src="/images/new_qz/pic_tp/pic_tp_up.gif" class="yy-pic-placeholder" width="50" height="50">';
            optionStr += '<a style="display:block;position:absolute;top:8px;height:50px;width:50px;*margin-left:-50px;" href="javascript:;"><span class="yy-upload-placeholder"></span></a>';
            optionStr += '<input type="hidden" value="" name="pic_vote_image[' + index + ']">';
            optionStr += '<input type="hidden" value="" name="pic_vote_fid[]">';
            optionStr += '<div class="pic_r_up" style="display:none;"><a href="javascript:;">重传图片</a></div>';
            optionStr += '<div class="pic_r_up2" style="display:none;"><a class="yy-upload-process-cancel" href="javascript:;">取消</a></div>';
            optionStr += '</div>';
            optionStr += '<div class="fl pic_cont">';
            optionStr += '<p><input type="text" class="input01 qz_tp_wz1" value="" name="pic_vote_image_des[' + index + ']" id="pic_vote_image_des' + index + '" maxlength="20" placeholder="输入图片描述，至多可输入20个字符"></p>';
            optionStr += '<p><input type="text" class="input01 qz_tp_wz1" value="" name="pic_vote_image_link[' + index + ']" id="pic_vote_image_link' + index + '" placeholder="选项链接：http://"></p>';
            optionStr += '</div>';
            optionStr += '</li>';
            $('#ul_vote_pic_option').append(optionStr);
            var $uploadPlaceholder = $('#ul_vote_pic_option').children().last().find('.yy-upload-placeholder');
            addVotePicUpload($uploadPlaceholder);
        }
});
}
//图片显示高级设置
if ($('#vote_pic_show_super_set').length > 0) {
    $('#vote_pic_show_super_set').bind('click', function(){
        if ($('#div_vote_pic_super_set').hasClass('hidden')) {
            $('#div_vote_pic_super_set').removeClass('hidden');
            $(this).html('收起高级设置<span class="arrowUp"></span>');
        } else {
    $('#div_vote_pic_super_set').addClass('hidden');
    $(this).html('展开高级设置<span class="arrowDown"></span>');
    }
});
}
//图片投票不限截止时间
if ($('#pic_endTimeBtn').length > 0) {
    $('#pic_endTimeBtn').bind('click', function(){
        if ($(this).attr("checked") == 'checked'){
            $("#pic_end_date, #pic_end_hour").hide();
        }else {
    $("#pic_end_date, #pic_end_hour").show();
    }
});
}
if($("#fyd").html() == ''){
    $('#fyd').html('畅捷通');
    $("#groupid").val(11);
    } else {
    $("li#fyd").css({ "padding-left": "10px" });
}
// 提交投票
$('#voteForm').live("submit",function(){
    var topicDiv = $('#voteForm').find('.yy-feedTopicDiv');
    if (topicDiv.length > 0 && !topicDiv.is(':hidden')) {
    var $all = topicDiv.find('.ht_tag_list').children('li');
    $all.each(function (){
    var $this = $(this),
    id = $(this).find(".yj-tag-name").attr("data"),
    name = $(this).find(".yj-tag-name").html();
    exp = /^(0|[1-9]\d*)$/;
    if(exp.test(id)){
    $this.closest("ol").append("<input type='hidden' value='"+id+"' name='topicIsId[]'>");
    }else{
    $this.closest("ol").append("<input type='hidden' value='"+name+"' name='topicIsStr[]'>");
    }
});
var a = 0;
for(var i =0,j=1000;i<j;i++){
    a = a+1;
    }
}
});
// 添加投票开始
$('.yy-addTopic').live('click', function(){
        $('.yy-feedTopicDiv,.yy-feedAddTopicDiv').removeClass('hidden');
    });
    //会话---鼠标移到话题区域显示相关操作项
    $('.yy-feedTopicDiv').live('mouseover', function(e){
        $(this).find(".yy_add_topic").show();
    }).live('mouseout', function(){
        if($(this).closest(".yy-feedTopicDiv").find('.yy_list_topic').length > 0)
            $(this).find(".yy_add_topic").hide();
    });

    $(".yy_list_topic").live('mouseover',function(e){
        $(this).find(".yy_delete_topic").removeClass("hidden");
    }).live('mouseout',function (e){
        $(this).find(".yy_delete_topic").addClass("hidden");
    })
    //光标离开话题输入框。
    $(".yy_input_topic").live("blur",function (){
        $(this).closest(".yy-feedTopicDiv").find('.yy_add_topic').removeClass('hidden');
        $(this).parent().addClass('hidden');
    });
    //添加话题
    $(".yy_add_topic").live("click",function(){
        $(this).addClass('hidden');
        $(this).closest(".yy-feedTopicDiv").find('.yy-feedAddTopicDiv').removeClass('hidden').show();
        $(".yy_input_topic").focus();
    });
    //话题删除
    $(".yy_delete_topic").live("click",function (){
        var $this = $(this),
                tempArray = $this.closest(".yy_list_topic").find("a").first().attr("href").split("/"),
                feedId = $this.closest("section").attr("feed-id"),
                topicId = tempArray[tempArray.length-1];
        if(feedId){
            var url = YY.util.url("/topic/topic/ajaxdel/fid/"+feedId+"/topid/"+topicId);
            YY.util.ajaxApi(url,function (data){
                var d = eval("("+data+")");
                $.yy.rscallback(d.error);
                if(d.rs){
                    $this.closest(".yy_list_topic").remove();
                }
            });
        }else{
            $this.closest(".yy_list_topic").remove();
        }
    });
    // 添加投票结束
    /**
     * 为图片投票添加图片上传功能;
     * @param {[type]} $option_obj [description]
     */
    function addVotePicUpload($uploadPlaceholder) {
        if(typeof $uploadPlaceholder === 'object' && !!$uploadPlaceholder.length) {
            $uploadPlaceholder.each(function(){
                var nowTimestamp = (new Date()).getTime();
                $(this).attr('id', nowTimestamp);
                //YY.util.trace($(this))
                new InitUpload({
                    // debug: true,
                    // trace_debug:true,
                    upload_url: '/employee/upload/index.html',
                    file_types : "*.jpg;*.jpeg;*.png",
                    button_placeholder_id: nowTimestamp,
                    button_width: '50',
                    button_height: '50',
                    button_text: '',
                    upload_start_handler: uploadStart,
                    upload_progress_handler: doNothing,
                    upload_success_handler: uploadSuccess,
                    upload_error_handler: doNothing
                });
            });
        }
    }
/**
* 开始上传;
* @param  {[type]} file [description]
* @return {[type]}      [description]
*/
function uploadStart(file){
    try {
    var $flashObj = $('#'+this.movieName),
    $flashWrap = $flashObj.parent();
    $flashWrap.siblings('.yy-pic-placeholder').eq(0).attr('src', '/images/vote/pic_tp_up2.gif');
    $flashWrap.siblings('.pic_r_up').hide();
    $flashWrap.siblings('.pic_r_up2').show();
    } catch (ex) {

    }
return true;
}
function uploadSuccess(file, serverData) {
    try{
    var $flashObj = $('#'+this.movieName),
    $flashWrap = $flashObj.parent();
    serverData = $.parseJSON(serverData);
    if (serverData.length) {
    $flashWrap.siblings('.yy-pic-placeholder').eq(0).attr('src', serverData[3]);
    $flashWrap.siblings('.pic_r_up').show()
    .end()
    .siblings('input:hidden').eq(0).val(serverData[3])
    .siblings('input[name^=pic_vote_fid]').val(serverData[0]);//增加传递fid值
    }
$flashWrap.siblings('.pic_r_up2').hide();
            //选项联动
            if ($('#ul_vote_pic_option').length > 0 && $('#pic_word_optnum_select').length > 0) {
                var count = 0;
                $('#ul_vote_pic_option').children().each(function(){
                    var img = $(this).find('input[name^=pic_vote_image]').val();
if (img != '') {
    count++;
    }
});

//判断提交按钮是否可用
if (count >= 2) {
    if ($('#pic_vote_title').val() !== '') {
    $('#savesubmit').attr('class', 'button gzChengButton').removeAttr('disabled');
    } else {
    $('#savesubmit').attr('class', 'button grayButton').attr('disabled', true);
    }
} else {
    $('#savesubmit').attr('class', 'button grayButton').attr('disabled', true);
    }

if (count > 2) {
    $('#pic_word_optnum_select').children().remove();
    $('#pic_word_optnum_select').append('<option value="0">单选</option><option value="2">最多选2项</option>');
    for(i=3; i<=count; i++) {
    $('#pic_word_optnum_select').append('<option value="' + i + '">最多选' + i + '项</option>');
    }
}
}
} catch(ex){}
}

    $(".voteSubmit").live('click', function(e){
        var obj         = $(e.target),
            vote_id     = obj.attr('vote_id'),
            is_checkbox = obj.attr('is_checkbox'),
            vote_box    = $("#voteBox"+vote_id);
        data        = 'vote_id='+vote_id;
        if (is_checkbox > 1){
            vote_box.find(":checkbox:checked[name='optionsub"+vote_id+"[]']").each(function (){
                data += "&optionsub[]="+$(this).val();
            });
        }else {
            var optVal = vote_box.find(":radio:checked[name='optionsub"+vote_id+"']").val();
            data += "&optionsub="+optVal;
        }
        var created = vote_box.find(":hidden[name='created']").val();
        data += "&created="+created;
        $.ajax({
            type: "POST",
            url: yyBaseurl + "/vote/vote/voteOption",
            data: data,
            success: function(html){
                if (html == 1) {
                    $.yy.rscallback('该投票已结束', 1);
                }else if (html == 2) {
                    $.yy.rscallback('您已参与过该投票', 1);
                }else {
                    vote_box.html('');
                    //vote_box.parent().append(html);
                    vote_box.append(html);
                }
            }
        });
    });

    /**
* 取消上传;
*/
$('.yy-upload-process-cancel').live({
    click: function() {
    var $me = $(this);
    var $cancelWrap = $me.parent();
    $cancelWrap.hide()
    .siblings('input:hidden').eq(0).val('')
    .end()
    .siblings('.yy-pic-placeholder').eq(0).attr('src', '/images/pic_tp_up.gif');
    }
});
//初始化上传图片控件
//YY.util.initUpload(function(){
    new InitUpload({
        debug: true,
        button_placeholder_id: 'spanButtonPlaceHolder',
        upload_url: '/employee/upload/index'
    });
var $uploadPlaceholder = $('#ul_vote_pic_option').find('.yy-upload-placeholder');
//YY.util.trace($uploadPlaceholder)
addVotePicUpload($uploadPlaceholder);
//});
});
