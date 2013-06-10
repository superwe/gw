/**
 * Created with JetBrains PhpStorm.
 * User: yuanjinga
 * Date: 13-5-8
 * Time: 下午1:39
 * To change this template use File | Settings | File Templates.
 */
(function($, YY, util){
    $(document).ready(function()
    {
        //点击发言
        $("#speechApp").click(function(){
            $("#speechArea").toggleClass("hidden");
        });

        $.post("/employee/announce/setSessionStorage",{ type: 0 },function(data){
            if(data.length>0)
            {
                for(var i=0;i<data.length;i++)
                {
                    sessionStorage.setItem(data[i]['key'],data[i]['prev']+"_"+data[i]['next']);
                }
            }
        },"json");

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
        })
        YY.loadScript(['yonyou/templates/attachment.js',
            'yonyou/templates/pic.js','yonyou/modules/task/task.js','yonyou/lib/yy.core.js'], {
            fn:function(){
                // 动态
                $('.yy-feed-menu').find("[ele-role=feed_title]").live('click', function(){
                    $me = $(this);
                    $('#index_moreFeed').attr('data', $me.attr("data"));
//                    if($me.parent().hasClass('cur')) return;
                    $('.yy-feed-menu').find("[ele-role=feed_title]").parent().removeClass("cur");
                    $me.parent().addClass('cur');
                    $('.feed_div').html('');
                    YY.util.ajaxApi($me.attr("data"), function(data){
                        if (data && typeof data === 'object') {
                            YY.addFeed($('.feed_div'), data, null, false);
                            $('#index_moreFeed').html("查看更多>>");
                        }else{
                            $('#index_moreFeed').html("没有更多内容了");
                            $('#index_moreFeed').die('click');
                        }
                    }, 'GET', "json");
                });

                // 更多动态
                $('#index_moreFeed').live('click', function(){
                    var $me = $(this);
                    var contioner = $me.attr("resource-id");
                    var obj = jQuery("." + contioner).find(".feed-section");
                    var objLi = obj.last();
                    if(objLi.find("li[resource-id]").length > 0){
                        var feed_id = objLi.find("li[resource-id]:last").attr("resource-id");
                    }else{
                        var feed_id = objLi.attr("resource-id");
                    }
                    YY.util.ajaxApi($me.attr("data"), function(data){
                        if (data && typeof data === 'object') {
                            YY.addFeed($('.feed_div'), data, null, false);
                            $me.html("查看更多>>");
                        }else{
                            $me.html('没有更多内容了');
                            $me.die('click');
                        }
                    }, 'GET', "json", {feedid : feed_id});
                    return false;
                });
                // 打开首页后加载动态
                $('.yy-feed-menu #member-feed').trigger('click');
            }
        });
        // 加载发言编辑器js
        util.loadScript(['jquery/jquery.form-3.0.9.js','yonyou/widgets/speechEditor/speechEditor.js'], {
            fn: function(){
                var editor_int = new YY.SpeechEditor({
                    'wrap'      : $('#speechArea .editor-wrap'), // 编辑框的包裹起
                    'submitUrl' : util.url('/employee/speech/addSpeech.html'),
                    'searchUrl' : util.url('/employee/search/searchForAt.html'), // 搜索@和#的URL
                    'auto'      : false, // 自动初始化
                    'feature' : { // 支持的功能
                        'face' : true,  // 表情
                        'at'   : true,  // @
                        'file' : true,  // 上传文件
                        'video': false  // 添加视频
                    },
                    'beforeSubmit': function(formData, $form, options){

                        return true;
                    },
                    'successSubmit': function(responseText, statusText, xhr, $form){

                    }
                });
                editor_int.init();
            }
        });

    });
}(jQuery, YonYou, YonYou.util));
