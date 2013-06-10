//前台全体成员页面
(function($, YY, util){
    // DOM ready;
    $(function(){
        var $Employee_Index = $('#Employee_Index');
        //加载数据表格
        YY.loadScript('yonyou/widgets/dataTable/dataTable.js', {
            fn: function() {
                var employee_list = '#EmployeeTab', // 数据表格的id
                    remoteUrl = util.url('employee/employee/ajaxGetList'); // 请求远程数据的uri地址
                // 初始化数据表格对象;
                var dtObj = new YY.DataTable({
                    // 表格选择器;
                    selector: employee_list,
                    // 操作按钮所在的块(包括上下翻页、各种批量操作等);
                    actLine: '#yyActLine',
                    // 页码行;
                    pageLine: '.yy-page-line',
                    // 每页显示的数量;
                    perPage: 15,
                    // 分页中显示的数量，最好使用基数，易于对称性;
                    pageCount: 9,
                    // 远程获取数据的URL;
                    remoteUrl: remoteUrl,
                    // 表示是否一次性获取所有数据;
                    isOnce: false,
                    //isRender: false,
                    success: function() {
                        // do nothing
                    }
                });
                //dtObj.render();
                //全体成员首页-根据成员分类筛选
                $('div.category', $Employee_Index).on({
                    'click' : function(e){
                        var $target = $(e.target);
                        if($target.is('a')){
                            if($target.attr('data') == 'online'){ //在线成员
                                $('div.client').show();
                            } else{
                                $('div.client').hide();
                            }
                            if($target.attr('data') == 'myFollow'){ //我关注的分组信息
                                $.get('/employee/employee/ajaxGetEmployeeGroup', function(obj){
                                    $('li.ajaxGroup').remove();
                                    if(obj){
                                        var str = more = '';
                                        $.each(obj, function(i, o){
                                            if(i < 3){
                                            str += '<li class="ajaxGroup"><a href="javascript:;" data="' + o.id + '">' + o.name + '</a></li>';
                                            } else{
                                                more += '<a href="javascript:;" data="' + o.id + '">' + o.name + '</a>';
                                            }
                                        });
                                        $('ul.groupUl').find('li.moreGroupLi').before(str);
                                        if(more){
                                            $('li.moreGroupLi').removeClass('hidden');
                                            $('div#moreGroupContainer').html(more);
                                        };
                                    }
                                }, 'JSON');
                                $('div.group').show();
                            } else{
                                $('div.group').hide();
                            }
                            $target.addClass('selected').siblings().removeClass('selected');
                            dtObj.setParamData('type', $target.attr('data'));
                            dtObj.reloadTable();
                            return false;
                        }
                    }
                });
                //查看更多分组
                $('li.moreGroupLi').on({
                    'mouseover' : function(){
                        $(this).find('div#moreGroupContainer').removeClass('hidden');
                    },
                    'mouseout' : function(){
                        $(this).find('div#moreGroupContainer').addClass('hidden');
                    }
                });
                //全体成员首页-客户端筛选
                $('ul.clientUl' , $Employee_Index).on({
                    'click' : function(e){
                        var $target = $(e.target);
                        if($target.is('a')){
                            dtObj.setParamData('client', $target.attr('data'));
                            dtObj.reloadTable();
                            return false;
                        }
                    }
                });
                //全体成员首页-成员分组筛选
                $('ul.groupUl', $Employee_Index).on({
                    'click' : function(e){
                        var $target = $(e.target);
                        if($target.is('a')){
                            dtObj.setParamData('group', $target.attr('data'));
                            dtObj.reloadTable();
                            return false;
                        }
                    }
                });
                //全体成员首页-根据用户首字母筛选;
                $('.firstletter', $Employee_Index).on({
                    'click': function(e) {
                        var $target = $(e.target);
                        if($target.is('a')) {
                            if(!$target.is('.selected')) {
                                var text_str =$target.text();
                                if(text_str==='所有') {
                                    dtObj.delParamData('letter');
                                } else {
                                    dtObj.setParamData('letter', text_str);
                                }
                                // 重载表格;
                                dtObj.reloadTable();
                                $target.addClass('selected').siblings().removeClass('selected');
                            }
                            return false;
                        }
                    }
                });
                //在成员数据表格上绑定事件;
                $(employee_list, $Employee_Index).on({
                    'click': function(e) {
                        var $me = $(this);
                        var $target = $(e.target);
                        //全选
                        if($target.is('.select_all')){
                            $target.is(':checked')
                                ? $me.find('[name="user_id"]').attr('checked', 'checked')
                                : $me.find('[name="user_id"]').removeAttr('checked');
                        }
                        //加关注、取消关注
                        if($target.is('a.yy-follow')){
                            var op = $target.attr('type');//0-取消关注，1-加关注
                            YY.util.ajaxApi(util.url('/employee/follow/ajaxFollow'), function(obj){
                                if(obj && obj.rs){
                                    $target.html(op == 1 ? '取消关注' : '加关注').attr('type', op == 1 ? 0 : 1);
                                    $target.removeClass('cancelFollowButton addFollowButton').addClass(op == 1 ? 'cancelFollowButton' : 'addFollowButton');
                                }
                            }, 'GET', 'JSON', {followid : $target.attr('for'), followtype : $target.attr('role'), op : op});
                        }
                        //批量加关注
                        if($target.is('a.attentionselected')){
                            var followIds = [],
                                followObj = $("input[name='user_id']:checked");
                            $.each(followObj, function(i, o){
                                followIds.push($(o).attr('uid'));
                            });
                            YY.util.ajaxApi(util.url('/employee/follow/ajaxFollow'), function(obj){
                                if(obj && obj.rs){
                                    $('input').removeAttr('checked');
                                    $('a.addFollowButton').removeClass('addFollowButton').addClass('cancelFollowButton').html('取消关注');
                                }
                            }, 'GET', 'JSON', {followid : followIds, followtype : $target.attr('role'), op : 1});
                        }
                    }
                });
                //按用户名搜索
                $('.employeeSearchContainer').on({
                    'click' : function(e){
                        var btn = $(e.target);
                        if(btn.attr('type') === 'button'){
                            var name = btn.siblings("input[name='searchName']");
                            dtObj.setParamData('name', name.val());
                            // 重载表格;
                            dtObj.reloadTable();
                            name.val('');
                        }
                    }
                });
            }
        });
        //全体成员首页-新建成员分组弹出层
        YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js'], {
            fn: function(){
                var dialog_obj = new YY.SimpleDialog({
                    'width'     : 400,
                    'height'    : 200,
                    'title'     : '创建分组',
                    'overlay'   : true,
                    'autoOpen'  : false,
                    'url'        : '/employee/employee/ajaxCreateGroup',
                    'onComplete' : function(){
                        $('.EmployeeGroupName').val('');
                    },
                    'onConfirm' : function(){//添加成员分组
                        var groupName = $.trim($('.EmployeeGroupName').val());
                        if(groupName){
                            YY.util.ajaxApi('/employee/employee/ajaxSaveGroup', function(obj){
                                if(obj.rs){
                                    $('ul.groupUl', $Employee_Index).append('<li class="ajaxGroup"><a data="' + obj.data.id  + '" href="javascript:;">' + groupName + '</a></li>');
                                }
                            }, 'GET', "JSON", {groupName : groupName});
                            dialog_obj.close();
                        }
                    }
                });
                $('.createEmployeeGroup', $Employee_Index).on({//创建分组弹出框
                    'click': function(){
                        dialog_obj.open();
                    }
                });
            }
        });
        //全体成员首页-二级菜单事件
        $('ul.catagoryUl', $Employee_Index).on({
            'click' : function(e){
                var $target = $(e.target);
                if($target.is('a')){
                    $(this).find('a').removeClass('cur');
                    $target.addClass('cur');
                    return false;
                }
            }
        });
    });
}(jQuery, YonYou, YonYou.util));