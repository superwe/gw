/**
 * 发言模块
 * @required jQuery YonYou YonYou.util
 */
(function($, YY, util){
    // DOM ready
    $(function(){
        util.loadScript(['yonyou/templates/reply_box.js', 'yonyou/templates/reply_list.js'], {
            fn : function(){
                var feedTemplate = YY.feedTemplate;

                //动态列表相关事件
                $('div.feed-section').live({
                    'click' : function(e){
                        var $target = $(e.target),
                            $feedSection = $(this);

                        //点击回复，显示回复框、回复列表
                        if($target.is('a.oplist_reply')){
                            var $replyContainer = $feedSection.find('.replyContainer');//回复DOM容器
                            if(!$replyContainer.length){//添加回复框、回复列表，创建回复DOM容器
                                $replyContainer = $('<div class="grid hidden replyContainer"></div>');//创建回复DOM容器
                                //添加回复框
                                var $replyBoxTemplate = $('#EditorTemplate'),
                                    $replyBox = $($replyBoxTemplate.val());
                                $replyContainer.append($replyBox);
                                //获取回复列表
                                YY.util.ajaxApi(util.url('employee/reply/ajaxGetReplyList'), function(data){
                                    var replyListStr = feedTemplate.replyList(data);//回复列表
                                    $replyContainer.append(replyListStr);
                                }, 'GET', "JSON", { targetId : $target.attr('targetid'), module : $target.attr('module') });

                                $feedSection.append($replyContainer);//添加回复DOM容器到动态列表

                                // 加载发言编辑器js
                                util.loadScript(['jquery/jquery.form-3.0.9.js','yonyou/widgets/speechEditor/speechEditor.js'], {
                                    fn: function(){
                                        var editor_int = new YY.SpeechEditor({
                                            'wrap'      : $replyBox, // 编辑框的包裹起
                                            'submitUrl' : util.url('/employee/reply/ajaxAddReply'),
                                            'searchUrl' : util.url('/employee/search/searchForAt.html'), // 搜索@和#的URL
                                            'auto'      : false, // 自动初始化
                                            'feature' : { // 支持的功能
                                                'face' : true,  // 表情
                                                'at'   : true,  // @
                                                'file' : true,  // 上传文件
                                                'video': false  // 添加视频
                                            },
                                            'beforeSubmit': function(formData, $form, options){
                                                formData.push(
                                                    {
                                                        'name': 'targetId',//产生动态的对象id
                                                        'value': $('a.oplist_reply', $feedSection).attr('targetid')
                                                    },{
                                                        'name' : 'module',//产生动态的对象类型
                                                        'value' : $('a.oplist_reply', $feedSection).attr('module')
                                                    },
                                                    {
                                                        'name' : 'parentreplyId',//父级回复的ID
                                                        'value' : $target.siblings("input[name='parentreplyId']").val()
                                                    },
                                                    {
                                                        'name' : 'parentemployeeId',//父级回复的人员ID
                                                        'value' : $target.siblings("input[name='parentemployeeId']").val()
                                                    }
                                                );
                                                return true;
                                            },
                                            'successSubmit': function(responseText, statusText, xhr, $form){
                                                $('div.content-block', $replyBox).html('');
                                                responseText = $.parseJSON(responseText);
                                                if(!responseText.rs){
                                                    return false;
                                                }
                                                var replyUlObj = $('ul.replyListUl', $feedSection),
                                                    host = 'http://staticoss.yonyou.com/qiater/',
                                                    data = responseText.data,
                                                    str = '<li data="' + data.replyId + '" class="clearfix"><img onerror="imgError(this);" rel="' + host + 'default_avatar.thumb.jpg" class="fl avatar" alt="' + data.employeeName + '" src="' + data.avatar + '"><div class="grid rightContainer"><p><a href="/employee/homepage?id=' + data.employeeId + '">' + data.employeeName + '</a>&nbsp;回复：' + data.content + '<br></p><div class="clearfix"><span class="fl replyRemarks">' + YY.date.format2(data.replyTime)  + '&nbsp;&nbsp;来自网页</span><span class="fr relpyOp hidden"><a class="relpyOp_reply" href="javascript:;">回复</a><a class="relpyOp_del" href="javascript:;">删除</a></span></div></div></li>';
                                                if(replyUlObj.length){
                                                    replyUlObj.prepend(str);
                                                } else{
                                                    replyUlObj = $('<ul class="replyListUl">' + str + '</ul>');
                                                    $('div.replyListContainer', $feedSection).append(replyUlObj);
                                                }
                                            }
                                        });
                                        editor_int.init();
                                    }
                                });
                            }
                            $replyContainer.toggleClass('hidden');
                            return false;
                        }
                        //查看更多回复
                        if($target.is('a.moreReply')){
                            YY.util.ajaxApi(util.url('employee/reply/ajaxGetReplyList'), function(data){
                                var $replyContainer = $target.closest('.replyContainer'),
                                    listStr = feedTemplate.replyList(data);//回复列表
                                $target.remove();
                                $replyContainer.append(listStr);
                            }, 'GET', 'JSON', { targetId : $target.attr('targetid'), module : $target.attr('module'), page : $target.attr('page'), showReplyOnly : 1 });
                        }
                        //删除某条回复
                        if($target.is('a.relpyOp_del')){
                            if(!confirm('您确定要删除此回复？')){
                                return false;
                            }
                            var $currentLi = $target.closest('li');
                            YY.util.ajaxApi(util.url('/employee/reply/delreply'),function(obj){
                                if(obj.rs){
                                    $currentLi.remove();
                                }
                            }, 'GET', 'JSON',{ replyid : $currentLi.attr('data') });
                        }
                        //回复某条回复
                        if($target.is('a.relpyOp_reply')){
                            var $rightContainer = $target.closest('.rightContainer'),
                                $rightContainerReplyBox = $rightContainer.find('.editor-wrap');
                            $feedSection.find('ul.replyListUl').find('.editor-wrap').hide();//隐藏其余回复列表里的回复框
                            if(!$rightContainerReplyBox.length){
                                var $replyBoxTemplate = $('#EditorTemplate'),
                                    $rightContainerReplyBox = $($replyBoxTemplate.val());
                                $rightContainerReplyBox.appendTo($rightContainer);
                            }
                            // 加载发言编辑器js
                            util.loadScript(['jquery/jquery.form-3.0.9.js','yonyou/widgets/speechEditor/speechEditor.js'], {
                                fn: function(){
                                    var editor_int = new YY.SpeechEditor({
                                        'wrap'      : $rightContainerReplyBox, // 编辑框的包裹起
                                        'submitUrl' : util.url('/employee/reply/ajaxAddReply'),
                                        'searchUrl' : util.url('/employee/search/searchForAt.html'), // 搜索@和#的URL
                                        'auto'      : false, // 自动初始化
                                        'feature' : { // 支持的功能
                                            'face' : true,  // 表情
                                            'at'   : true,  // @
                                            'file' : true,  // 上传文件
                                            'video': false  // 添加视频
                                        },
                                        'beforeSubmit': function(formData, $form, options){
                                            formData.push(
                                                {
                                                    'name': 'targetId',//产生动态的对象id
                                                    'value': $('a.oplist_reply', $feedSection).attr('targetid')
                                                },{
                                                    'name' : 'module',//产生动态的对象类型
                                                    'value' : $('a.oplist_reply', $feedSection).attr('module')
                                                },
                                                {
                                                    'name' : 'parentreplyId',//父级回复的ID
                                                    'value' : $target.siblings("input[name='parentreplyId']").val()
                                                },
                                                {
                                                    'name' : 'parentemployeeId',//父级回复的人员ID
                                                    'value' : $target.siblings("input[name='parentemployeeId']").val()
                                                }
                                            );
                                            return true;
                                        },
                                        'successSubmit': function(responseText, statusText, xhr, $form){
                                            $('div.content-block', $rightContainerReplyBox).html('');
                                            responseText = $.parseJSON(responseText);
                                            if(!responseText.rs){
                                                return false;
                                            }
                                            var replyUlObj = $('ul.replyListUl', $feedSection),
                                                host = 'http://staticoss.yonyou.com/qiater/',
                                                data = responseText.data,
                                                str = '<li data="' + data.replyId + '" class="clearfix"><img onerror="imgError(this);" rel="' + host + 'default_avatar.thumb.jpg" class="fl avatar" alt="' + data.employeeName + '" src="' + data.avatar + '"><div class="grid rightContainer"><p><a href="/employee/homepage?id=' + data.employeeId + '">' + data.employeeName + '</a>&nbsp;回复：' + data.content + '<br></p><div class="clearfix"><span class="fl replyRemarks">' + YY.date.format2(data.replyTime)  + '&nbsp;&nbsp;来自网页</span><span class="fr relpyOp hidden"><a class="relpyOp_reply" href="javascript:;">回复</a><a class="relpyOp_del" href="javascript:;">删除</a></span></div></div></li>';
                                            if(replyUlObj.length){
                                                replyUlObj.prepend(str);
                                            } else{
                                                replyUlObj = $('<ul class="replyListUl">' + str + '</ul>');
                                                $('div.replyListContainer', $feedSection).append(replyUlObj);
                                            }
                                        }
                                    });
                                    editor_int.init();
                                }
                            });
                            $rightContainerReplyBox.show();//显示回复框
                        }
                        //点击喜欢
                        if($target.is('a.oplist_like')){
                            var speechid = $target.attr('targetid');
                            var feedid =  $target.attr('feedid');
                            var groupid = $target.attr('groupid');
                            YY.util.ajaxApi(util.url('employee/speech/like'),function(returnData){
                                if(returnData.rs){
                                    $target.removeClass('oplist_like');
                                    $target.addClass('oplist_cancel_like');
                                    $target.html('取消喜欢');

                                }
                            },'POST', 'JSON',{ speechid:speechid,feedid:feedid,groupid:groupid });
                        }
                        //点击取消喜欢
                        if($target.is('a.oplist_cancel_like')){
                            var speechid = $target.attr('targetid');
                            YY.util.ajaxApi(util.url('employee/speech/cancelLike'),function(returnData){
                                if(returnData.rs){
                                    $target.addClass('oplist_like');
                                    $target.removeClass('oplist_cancel_like');
                                    $target.html('喜欢');

                                }
                            },'POST', 'JSON',{ speechid:speechid });
                        }
                        //点击收藏
                        if($target.is('a.oplist_favor')){
                            var speechid = $target.attr('targetid');
                            var feedid =  $target.attr('feedid');
                            var groupid = $target.attr('groupid');
                            YY.util.ajaxApi(util.url('employee/speech/favor'),function(returnData){
                                if(returnData.rs){
                                    $target.removeClass('oplist_favor');
                                    $target.addClass('oplist_cancel_favor');
                                    $target.html('取消收藏');

                                }
                            },'POST', 'JSON',{ speechid:speechid,feedid:feedid,groupid:groupid });
                        }
                        //点击取消收藏
                        if($target.is('a.oplist_cancel_favor')){
                            var speechid = $target.attr('targetid');
                            YY.util.ajaxApi(util.url('employee/speech/cancelFavor'),function(returnData){
                                if(returnData.rs){
                                    $target.addClass('oplist_favor');
                                    $target.removeClass('oplist_cancel_favor');
                                    $target.html('收藏');

                                }
                            },'POST', 'JSON',{ speechid:speechid });
                        }

                        //点击 删除
                        if($target.is('a.oplist_delete')){
                            if(!confirm('您确定要删除此条发言吗？')){
                                return false;
                            }
                            var speechid = $target.attr('targetid');
                            var feedid =  $target.attr('feedid');
                            YY.util.ajaxApi(util.url('employee/speech/delete'),function(returnData){
                                if(!returnData.rs){
                                    alert('删除失败！')
                                }
                                else{
                                    $target.closest('.feed-section').remove();//删除成功后 移除发言框
                                }

                            },'POST', 'JSON',{ speechid:speechid,feedid:feedid });
                        }
                    },
                    'mouseover' : function(e){
                        var $target = $(e.target),
                            $feedSection = $(this);
                        //鼠标移动到回复列表显示此回复的相关操作按钮(回复、删除)
                        if($target.closest('ul.replyListUl').length){
                            var replyLi = $target.closest('li');
                            if(replyLi.length){
                                $(replyLi).find('.relpyOp').removeClass('hidden');
                            }
                        }
                    },
                    'mouseout' : function(e){
                        var $target = $(e.target),
                            $feedSection = $(this);
                        //鼠标移动到回复列表隐藏此回复的相关操作按钮(回复、删除)
                        if($target.closest('ul.replyListUl').length){
                            var replyLi = $target.closest('li');
                            if(replyLi.length){
                                $(replyLi).find('.relpyOp').addClass('hidden');
                            }
                        }
                    }
                });
            }
        })

    })
}(jQuery, YonYou, YonYou.util));