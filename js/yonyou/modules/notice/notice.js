/**
 * Created with JetBrains PhpStorm.
 * User: yuanjinga
 * Date: 13-5-10
 * Time: 下午2:39
 * To change this template use File | Settings | File Templates.
 */

(function($, YY, util){
    $(document).ready(function()
    {
        // 自动加载
        var obj = {module:0, ishandel:$('#ishandel').val()};
        noticeList(obj);
        // 菜单加载
        $('.notice_menu a').live('click', function(){
            $me = $(this);
            $me.parent().find('a').removeClass("cur");
            $me.addClass('cur');
            var obj = {module:$me.attr("module"), ishandel:$('#ishandel').val()};
            noticeList(obj);
        });
        // 分页
        function noticeList(obj){
            YY.loadScript('yonyou/widgets/pageNavi/pageNavi.js', {
            fn : function(){
                var PageObj = new YY.PageNavi({
                    'pageLine'      : $('.notice_page_container', $('.notice_content')),
                    'remoteUrl'     : util.url('employee/notice/noticelist'),
                    'paramData'     : obj,
                    'autoRender'    : false,
                    'perPage'       : 15,
                    'contentLoaded' : function(self, returnData){//回调函数
                        var str = '';
                        if (returnData && typeof returnData.list === 'object') {
                            $('.notice_list').html('');
                            YY.addNotice($('.notice_list'), returnData.list, null, false);
                            self.setTotalNum(returnData.total);
                        }else{
                            $('.notice_list').html('<div id="footer_morefeed" class="bottomMore clearfix">没有找到数据</div>');
                        }
                    }
                });
                PageObj.render();
            }
        });
        }
        //接受任务邀请
        $("[name='acceptTask']").live('click', function(){
            var $this = $(this);
            var accept = $this.attr("name") == "acceptTask" ? 1 : 2;
            var val = $this.attr("data");
            $.getJSON("/employee/task/response?tid="+val+"&accept="+accept, null , function(d, s){
                if(d && d.type === 'success'){
                    if ($("[name='_t_"+ val + "']"))
                        $("[name='_t_"+ val + "']").fadeOut();
                }else {
                    $.yy.rscallback("操作失败！", 1);
                }
            });
        });
        // 审核通过
        $('.yy-task-pass').live('click', function(){
            var $me = $(this);
            var tid = $me.attr('data');
            YY.util.ajaxApi("/employee/task/approval", function(d, s){
                if(d && d.type === 'success'){
                    if ($("[name='_t_"+ tid + "']"))
                        $("[name='_t_"+ tid + "']").fadeOut();
                }else {
                    $.yy.rscallback("操作失败！", 1);
                }
            }, 'GET', "json", {tid:tid});
            return false;
        });
        //拒绝任务邀请，驳回任务
        YY.util.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js'], {
            fn: function(){
                var dialog_obj = new YY.SimpleDialog({
                    'title': '拒绝原因',
                    'width': 500,
                    'height': 300,
                    'overlay' : true,
                    'autoOpen': false
                });
                $("[name='refuseTask']").live({
                    'click': function(){
                        var $this = $(this);
                        var accept = 2;
                        var val = $this.attr("data");
                        dialog_obj.setTitle('拒绝原因');
                        dialog_obj.resize({width:500, height:300});
                        dialog_obj.setContentData('<input type="hidden" value="'+val+'" id="refusetid" name="refusetid" />'
                            +'<div style="padding: 10px;"><textarea name="reason" id="reason" cols="" rows="" '
                            +'style="height:200px;line-height: 20px;padding: 5px;width:470px; border-radius:3px 3px 3px 3px"></textarea></div>');
                        dialog_obj.onConfirm = function(){
                            var content = $("#reason").val();
                            var val = $('#refusetid').val();
                            $.getJSON("/employee/task/response?tid="+val+"&accept=2&content="+content, null , function(d, s){
                                if(d && d.type === 'success'){
                                    if ($("[name='_t_"+ val + "']"))
                                        $("[name='_t_"+ val + "']").fadeOut();
                                }else {
                                    $.yy.rscallback("操作失败！", 1);
                                }
                            });
                            return true;
                        }
                        dialog_obj.open();
                    }
                });
                // 审核不通过
                $(".yy-task-unpass").live({'click': function(){
                    var $this = $(this);
                    var val = $this.attr("data");
                    dialog_obj.setTitle('问题改进建议');
                    dialog_obj.resize({width:500, height:300});
                    dialog_obj.setContentData('<div style="padding: 10px;"><textarea name="content" id="content" cols="" rows="" '
                        +'style="height:200px;line-height: 20px;padding: 5px;width:470px; border-radius:3px 3px 3px 3px"></textarea></div>');
                    dialog_obj.onConfirm = function(){
                        var content = $("#content").val();
                        $.getJSON("/employee/task/approval?tid="+val+"&status=4&content="+content, null , function(d, s){
                            if(d && d.type === 'success'){
                                if ($("[name='_t_"+ val + "']"))
                                    $("[name='_t_"+ val + "']").fadeOut();
                            }else {
                                $.yy.rscallback("操作失败！", 1);
                            }
                        });
                        return true;
                    };
                    dialog_obj.open();
                }});
            }
        });
    });
}(jQuery, YonYou, YonYou.util));
