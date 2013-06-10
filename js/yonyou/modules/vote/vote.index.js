/**
 * 投票相关的事件绑定；
 *
 */
(function($, YY, util){
    $(function(){
        /**
         **   初始化会话中投票的内容。
         **/
        var optionClick = function (e) {
            var me = $(this);

            if (me.attr('type') == 'checkbox') {
                e.stopPropagation();
                var inputObj = me;
            } else {
                var inputObj = me.find('input');
                if (inputObj.is(':checkbox')) {
                    if (inputObj.is(':checked')) {
                        inputObj.attr('checked', false);
                    } else {
                        inputObj.attr('checked', true);
                    }
                } else {
                    inputObj.attr('checked', true);
                }
            }

            //var parentObj   = inputObj.parent().parent();
            var parentObj = inputObj.closest('ul');
            var feed_id = inputObj.attr('feed_id');
            var voteBtn = $('#vote_btn_' + feed_id);

            //过期的投票不能操作
            if (voteBtn.length > 0 && voteBtn.attr('isover') == 1) {
                return false;
            }
            //voteBtn     = parentObj.find(":button[value='投票']");
            //console.log(parentObj);
            if (parentObj.find(":input:checked").size() > 0){
                voteBtn.attr("class", "button gzChengButton voteSubmit").removeAttr("disabled");
            }else {
                voteBtn.attr("class", "button grayButton voteSubmit").attr("disabled", "disabled");
            }
            if (inputObj.attr('type')== 'checkbox') {
                if(parentObj.find(":input:checked").size()>inputObj.attr('for')) {
                    inputObj.attr('checked',false);
                    alert('最多选'+inputObj.attr('for')+'项', 1);
                    return false;
//                    $.yy.rscallback('最多选'+inputObj.attr('for')+'项', 1);
                }
            }
        }

        $("li[id^='voteBox']").find('p, input[type="checkbox"]').live('click', optionClick);
        //图片投票
        $("ul[id^='voteBox']").find('.cont_img, input[type="checkbox"]').live('click', optionClick);

        //投票记录按钮绑定点击事件
        $('.yy-voteRecordSpan').live('click', function(){
            //alert(1);
            var me = $(this);
            var sectionObj = me.closest('section.gzContRight');
            if (me.attr('data') == '0') {
                var vote_id = sectionObj.attr('resource-id');
                var params = {
                    vote_id: vote_id
                };
                var url = yyBaseurl + "/vote/vote/voterecord";
                YY.util.ajaxApi(url, function(data){
                    var replyObj = sectionObj.find('.reply-placeholder-block');
                    if (replyObj.length > 0 && !replyObj.hasClass('hidden')) {
                        replyObj.addClass('hidden');
                        var arrowObj = sectionObj.find('.yy-reply').find('.colorSj');
                        if (arrowObj.length > 0) {
                            arrowObj.addClass('hidden');
                        }
                    }
                    var recordObj = sectionObj.find('.tp_jilu');
                    if (recordObj.length > 0) {
                        recordObj.remove();
                    }
                    sectionObj.append(data);
                    //重置标识
                    me.attr('data', 1);
                    var arrowObj = me.parent().find('.colorSj');
                    if (arrowObj.length > 0 && arrowObj.hasClass('hidden')) {
                        me.parent().find('.colorSj').removeClass('hidden');
                    }
                }, 'POST', "html", params);
            } else {
                var recordObj = sectionObj.find('.tp_jilu');
                if (recordObj.length > 0) {
                    recordObj.remove();
                }
                me.attr('data', 0);
                var arrowObj = me.parent().find('.colorSj');
                if (arrowObj.length > 0 && !arrowObj.hasClass('hidden')) {
                    me.parent().find('.colorSj').addClass('hidden');
                }
            }

        });

        //投票获取更多的处理事件
        $('.yymoreVoteRcord').live('click', function(){
            var me = $(this);
            var params = {};
            if (me.attr('vote_id') > 0) {
                params.vote_id = me.attr('vote_id');

                //获取最后一个记录的id值
                var ulObj = me.parent().find('ul');
                if (ulObj.length > 0) {
                    var record_id = ulObj.children().last().attr('record_id');
                    if (record_id > 0) {
                        params.record_id = record_id;
                    }
                }

                //ajax请求
                var url = yyBaseurl + "/vote/vote/voterecord";
                YY.util.ajaxApi(url, function(data){
                    if (data.indexOf('nodata') >=0) {
                        me.html('没有更多内容了');
                        me.die('click');
                    } else {
                        ulObj.append(data);
                    }
                }, 'POST', "html", params);
            }
        });

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
                url: "/employee/vote/voteOption",
                data: data,
                success: function(html){
                    if (html == 1) {
                        alert('该投票已结束');
                        //$.yy.rscallback('该投票已结束', 1);
                    }else if (html == 2) {
                        alert('您已参与过该投票');
                        //$.yy.rscallback('您已参与过该投票', 1);
                    }else {
                        vote_box.html('');
                        //vote_box.parent().append(html);
                        vote_box.append(html);
                    }
                }
            });
        });

        /**
         *投票部分结束
         ***/
    });
}(jQuery, YY, YY.util));