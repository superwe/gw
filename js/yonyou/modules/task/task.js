var Task = function(options){
    var self = this;
    self.init = function(){
        this.today = options.today;
        this.joinUser = options.inviteUser;
        this.manageUser = options.manageUser;
        this.noticeUser = options.noticeUser;
        this.fileList = options.fileList;

    };
    self.showButton = function($me){
        if($("#taskaddForm").length == 0) return ;
        var title = $("#tasktitle"),
            content = $("#taskaddForm>#tcontent"),
            $submit = $("#savesubmit");

        if(content.length>0){
            self.txtCounter(content, 2000);
        }
        self.txtCounter(title, 200);

        var tv = title.val();
        if (!tv) tv = '';
        tv = $.trim(tv);
        var len = 0;
        for (var i=0; i<tv.length; i++) {
            var c = tv.charCodeAt(i);
            //单字节加1
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
                len++;
            }
            else {
                len+=2;
            }
        }
        if (len > 80) {
            $.yy.rscallback('任务标题不能超过40个汉字',1);
            title.css("color", "red");
        } else {
            title.removeAttr('style');
        }
        // title 不为空，并且日期正确（date_flag为true）
        if( title.val() && len <= 80){
            $submit.removeAttr('disabled').removeClass("grayButton")
                .addClass("gzChengButton");
        } else {
            $submit.attr('disabled', 'disabled').removeClass("gzChengButton")
                .addClass("grayButton");
        }
    };

    self.strLen = function(str) {
        if(str == '' || typeof str == "undefined") return 0;
        var len = 0;
        for(var i = 0; i < str.length; i++) {
            len += str.charCodeAt(i) < 0 || str.charCodeAt(i) > 255 ? 2 : 1;
        }
        return len;
    };

    self.txtCounter = function(obj, maxlimit) {
        if(self.strLen(obj.val()) > maxlimit){
            obj.val(self.getStrbylen(obj.val(), maxlimit));
        }
    };

    self.getStrbylen = function(str, len) {
        var num = 0;
        var strlen = 0;
        var newstr = "";
        var obj_value_arr = str.split("");
        for(var i = 0; i < obj_value_arr.length; i ++) {
            if(i < len && num + self.byteLength(obj_value_arr[i]) <= len) {
                num += self.byteLength(obj_value_arr[i]);
                strlen = i + 1;
            }
        }
        if(str.length > strlen) {
            newstr = str.substr(0, strlen);
        } else {
            newstr = str;
        }
        return newstr;
    };

    self.byteLength = function(sStr) {
        aMatch = sStr.match(/[^\x00-\x80]/g);
        return (sStr.length + (! aMatch ? 0 : aMatch.length));
    };

    self.load = function(){
        //添加附件的文件
        if ($("#fileContainer").length > 0 && self.fileList.length > 0) {
            fileids = $('#fids').val();
            for (i=0; i<self.fileList.length; i++) {
                str = '<li id="_file' + self.fileList[i].id + '" class="clearfix"><span>' + self.fileList[i].title + '</span> <a onclick="t.delTaskUploadFile(' + self.fileList[i].id + ');" class="fr" href="javascript:;">×</a></li>';
                $("#fileContainer").append(str).show();
                fileids =  fileids ? fileids + ',' + self.fileList[i].id : self.fileList[i].id;
            }
            $('#fids').val(fileids);
            if ($('#community_fids').length > 0) {
                $('#community_fids').val(fileids);
            }
        }
    };

    //获取中间部分任务列表的ajax请求
    self.ajaxMiddleRequest = function (params) {
        YY.util.ajaxApi('/employee/task/taskList.html', function(s){
            if(s.indexOf("container")!=-1){
                $("#getcontent").html(s);
                $('#task_moreFeed').die('click');
                $('#task_moreFeed').live('click', getMoreClick);
                $('#task_moreFeed').html('查看更多>>');
                $('#footer_morefeed').show();
            }else {
                $("#getcontent").html("<div style='padding:20px;clear:both;'>没有相关任务！</div>");
                $('#footer_morefeed').hide();
            }
        }, 'POST', 'html', params);
    }

    //任务分类列表 （ 创建的   参与的...） 鼠标点击事件处理函数
    self.taskMenuListClick = function (e) {
        if (! $(e.target).hasClass('selected')) {
            $preSelectObj = $(e.target).parent().find('.selected');
            if ($preSelectObj.length > 0) {
                $preSelectObj.removeClass('selected');
            }
            $(e.target).addClass('selected');
        }
        var params = {};
        //勾选待处理
        if($('#taskMenuList').find('.yy-handleType:checked').length > 0 ){//选中
            params.handleType = 1;
            $('#task_li_status').find('aside').find("a:gt(4)").css("display", "none");
        } else{
            $('#task_li_status').find('aside').find("a:gt(4)").css("display", "block");
        }

        if ($(e.target).attr('role') !== '') {
            params.myrole = $(e.target).attr('role');
        }
        if ($(e.target).attr('data') !== '') {
            params.showtype = $(e.target).attr('data');
        }

        //初始化查看状态
        var statusDiv = $('#task_li_status').find('.data');
        if (statusDiv.length > 0) {
            statusDiv.attr('data', -1);
            statusDiv.html('查看状态');
        }

        //ajax请求
        self.ajaxMiddleRequest(params);
    }

    //勾选待处理的点击事件处理函数
    self.handleType = function(){
        var params = {},
            liObj = $('#taskMenuList').find('a.selected');
        if($('#taskMenuList').find('.yy-handleType:checked').length > 0 ){//选中
            params.handleType = 1;
            $('#task_li_status').find('aside').find("a:gt(4)").css("display", "none");
        } else{
            $('#task_li_status').find('aside').find("a:gt(4)").css("display", "block");
        }
        if(liObj.attr('role') !== '') {
            params.myrole = liObj.attr('role');
        }
        if(liObj.attr('data') !== '') {
            params.showtype = liObj.attr('data');
        }
        //初始化查看状态
        var statusDiv = $('#task_li_status').find('.data');
        if(statusDiv.length > 0) {
            statusDiv.attr('data', -1);
            statusDiv.html('查看状态');
        }
        //ajax请求
        self.ajaxMiddleRequest(params);
    }

    //查看状态下拉列表的点击事件处理函数
    self.statusClick = function (e) {
        //获取当前点击对象的参数值
        if ($(e.target).attr('data') !== '') {
            var curData = $(e.target).attr('data');
        } else {
            var curData = 0;
        }
        if ($(e.target).attr('title') !== '') {
            var curTitle = $(e.target).attr('title');
        } else {
            var curTitle = '查看状态';
        }

        var divObj = $('#task_li_status').find('.data');
        if (divObj.length > 0) {
            divObj.attr('data', curData);
            divObj.html(curTitle);
        }

        //关闭下拉菜单
        $('#task_li_status').find('aside').hide();

        var params = {};
        params.status = curData;

        var curSelectMenu = $('#taskMenuList').find('.selected');
        if (curSelectMenu.length > 0) {
            if (curSelectMenu.attr('role') !== '') {
                params.myrole = curSelectMenu.attr('role');
            }
            if (curSelectMenu.attr('data') !== '') {
                params.showtype = curSelectMenu.attr('data');
            }
        }
        //勾选待处理
        if($('#taskMenuList').find('.yy-handleType:checked').length > 0 ){//选中
            params.handleType = 1;
            $('#task_li_status').find('aside').find("a:gt(4)").css("display", "none");
        } else{
            $('#task_li_status').find('aside').find("a:gt(4)").css("display", "block");
        }
        self.ajaxMiddleRequest(params);
    }

    self.listen = function(){
       $("[name='imp']").live('click', function(){
            $("[name='important']").val($(this).attr("data"));
            $("[name='imp']").removeAttr("class");
            $(this).addClass("cur");
        });

        //查看状态鼠标事件
        $("#task_li_status").live('mouseleave', function(){
            $(this).find(".tkBox").hide();
        }).live('mouseenter', function(){
                $(this).find(".tkBox").show();
            });
        //查看状态下拉框点击事件
        $("#task_li_status").find('a').bind('click', self.statusClick);

        //任务分类菜单绑定鼠标点击事件
        $('#taskMenuList').find('a').bind('click', self.taskMenuListClick);

        //任务待处理绑定鼠标点击事件
        $('.yy-handleType').bind('click', self.handleType);

        $("#tasktitle").live({
            keyup: self.showButton,
            blur: self.showButton
        });

        $("#tcontent").live({
            keyup: self.showButton,
            blur: self.showButton
        });

        //获取更多绑定事件
        $('#task_moreFeed').live('click', getMoreClick);
    };

    self.delTaskUploadFile = function (file_id){
        $('#_file' + file_id).remove();
        fileids = $('#fids').val();
        if (fileids) {
            fileids = fileids.split(',');
            leftfids = [];
            for(i=0; i<fileids.length; i++) {
                if (fileids[i] != file_id) {
                    leftfids.push(fileids[i]);
                }
            }
            fileids = leftfids.join(',');
            $('#fids').val(fileids);
        }

        //删除社区中的文件记录
        if ($('#community_fids').length > 0) {
            fileids = $('#community_fids').val();
            if (fileids) {
                fileids = fileids.split(',');
                leftfids = [];
                for(i=0; i<fileids.length; i++) {
                    if (fileids[i] != file_id) {
                        leftfids.push(fileids[i]);
                    }
                }
                fileids = leftfids.join(',');
                $('#community_fids').val(fileids);
            }
        }
    }
    //获取更多函数
    function getMoreClick()
    {
        var $me = $(this);
        $me.html("加载中...");
        var contioner = $me.attr("resource-id");
        var obj = $("#" + contioner).find(".feed-section");
        var resource_id = obj.last().attr("resource-id");
        var param = {
            tid:resource_id
        };

        var curSelectMenu = $('#taskMenuList').find('.selected');
        if (curSelectMenu.length > 0) {
            if (curSelectMenu.attr('role') !== '') {
                param.myrole = curSelectMenu.attr('role');
            }
            if (curSelectMenu.attr('data') !== '') {
                param.showtype = curSelectMenu.attr('data');
            }
        }

        var curStatus = $('#task_li_status').find('.data');
        if (curStatus.length > 0 && curStatus.attr('data') !== '') {
            param.status = curStatus.attr('data');
        }

        /*是否勾选了待处理*/
        if($('.yy-taskMenu').find('.yy-handleType:checked').length > 0 ){//选中
            param.handleType = 1;
        }

        YY.util.ajaxApi($me.attr("data"), function(data){
            if(data.indexOf('nodata') >=0 ){
                $me.html("没有更多内容了");
                $("#task_moreFeed").die('click');
            }else{
                $(data).appendTo("#getcontent");
                $me.html("查看更多>>");
            }
        }, 'POST', "html", param);
    }
};

if (typeof taskInfo == 'undefined') {
    var taskInfo = {};
}

if(typeof Task != "undefined"){
    var t = new Task({
        today:typeof taskInfo.today != "undifined" ? taskInfo.today : "",
        inviteUser: typeof taskInfo.inviteuser != "undefined" ? taskInfo.inviteuser : [],
        manageUser: typeof taskInfo.manageuser != "undefined" ? taskInfo.manageuser : [],
        noticeUser: typeof taskInfo.noticeuser != "undefined" ? taskInfo.noticeuser : [],
        fileList: typeof taskInfo.filelist != "undefined" ? taskInfo.filelist : []
    });
}
$(document).ready(function(){
    t.init();
    t.load();
    t.listen();
    t.showButton();
    $draftBtn = $('#taskdraft');
    $draftFlag = $('#draftflag');
    $draftBtn.bind('click', function(){
        $draftFlag.val(2);
        $('#taskaddForm').submit();
        $('#taskaddForm').attr('has-submit',0);
    });

    $('#savesubmit').bind('click', function(){
        $draftFlag.val(0);
        return true;
    });


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

    // 删除任务
    $('.yy-task-del').live('click', function(){
        $(this).closest('.oplist').children('.yy-delete').removeClass('hidden');
    });
    $('.yy-delete-cancel').live('click', function(){
        $(this).closest('.yy-delete').addClass('hidden');
    });
    $('.feed-delete-confirm').live('click', function(){
        var dataDiv = $(this).closest('.feed-section'),
            tid = $(this).attr('data');
        $.getJSON("/employee/task/del?tid="+tid, null , function(d, s){
            if(d && d.type === 'success'){
                dataDiv.fadeOut();
            }else {
                $.yy.rscallback("操作失败！", 1);
            }
        });
    });

    //拒绝任务邀请  提交任务
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
             // 提交任务
             $(".yy-task-submit").live({
                 'click': function(){
                     var $this = $(this);
                     var val = $this.attr("data");
                     dialog_obj.setTitle('提交任务');
                     dialog_obj.resize({width:500, height:300});
                     dialog_obj.setContentData('<input type="hidden" value="'+val+'" id="tasknodeid" name="tasknodeid" />'
                         +'<div style="padding: 10px;"><textarea name="reason" id="reason" cols="" rows="" '
                         +'style="height:200px;line-height: 20px;padding: 5px;width:470px; border-radius:3px 3px 3px 3px"></textarea></div>');
                     dialog_obj.onConfirm = function(){
                         var content = $("#reason").val();
                         var val = $('#tasknodeid').val();
                         $.getJSON("/employee/task/submit?tid="+val+"&content="+content, null , function(d, s){
                             if(d && d.type === 'success'){
                                 if ($("[name='_t_"+ val + "']"))
                                     $("[name='_t_"+ val + "']").fadeOut();
                                 if($('#yy-task-submit-'+val))
                                     $('#yy-task-submit-'+val).fadeOut();
                                 if($('#yy-task-assign-'+val))
                                     $('#yy-task-assign-'+val).fadeOut();
                             }else {
                                 $.yy.rscallback("操作失败！", 1);
                             }
                         });
                         return true;
                     };
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
                             if($('#yy-task-unpass-'+val))
                                 $('#yy-task-unpass-'+val).fadeOut();
                             if($('#yy-task-pass-'+val))
                                 $('#yy-task-pass-'+val).fadeOut();
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

    //关闭开启任务
    $("#yy-task-close").live('click', function(){
        var $me = $(this);
        var tid = $me.attr('data');
        var ac = $me.attr("rel");
        YY.util.ajaxApi("/employee/task/close", function(d, s){
            if (d && s==='success'){
                if(ac == 6){
                    $me.html('开启');
                    //$me.removeClass('closeIco1').addClass('openIco1').html('开启');
                    $me.attr("rel", "0");
                }else {
                    $me.html('关闭');
//                    $me.removeClass('openIco1').addClass('closeIco1').html('关闭');
                    $me.attr("rel", "6");
                }
            } else {
                var errmsg = '操作失败';
                if (d.error != '') {
                    errmsg = d.error;
                }
                $.yy.rscallback(errmsg, 1);
            }
        }, 'GET', "json", {tid:tid, status:ac});
        return false;
    });

    // 审核通过
    $('.yy-task-pass').live('click', function(){
        var $me = $(this);
        var tid = $me.attr('data');
        YY.util.ajaxApi("/employee/task/approval", function(d, s){
            if(d && d.type === 'success'){
                if($('#yy-task-unpass-'+tid))
                    $('#yy-task-unpass-'+tid).fadeOut();
                if($('#yy-task-pass-'+tid))
                    $('#yy-task-pass-'+tid).fadeOut();
            }else {
                $.yy.rscallback("操作失败！", 1);
            }
        }, 'GET', "json", {tid:tid});
        return false;
    });

});
