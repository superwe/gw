$(function(){
    var
        YY = YonYou,                    // YonYou命名空间
        util = YY.util,                 // util工具集
        date = YY.date,                 // date工具函数集
        hash = YY.hash,                 // hash操作工具函数集
        calendar = YY.calendar,         // 日历模块
        calendarBiz = YY.calendarBiz,   // 日历模块部分业务功能
        feedTemplate = YY.feedTemplate, // 动态模版

        // 公共的dom对象引用
        doc = document,
        $doc = $(doc),
        $win = $(window),

        // 一些常量..
        MODE_ARR = ['month', 'week', 'day'],// 日历的显示模式
        ACTION = ['shot', 'detail', 'add', 'edit'], // 状态操作

        today = date.getToday();// 设置今天的日期对象;

    initCalendar();
    /**
     * 初始化日历;
     * @return {[type]} [description]
     */
    function initCalendar(){
        var hash_str = getHashStr(),
            hashData = parseHash(hash_str),
            params = hashData['params'];
        params['m'] = ($.inArray(params['m'], MODE_ARR)!==-1) ? params['m'] : MODE_ARR[1]; // 日历的显示模式，默认显示周历
        params['t'] = params['t'] ? params['t'] : today['timestamp'];    // 被激活日期的时间戳，默认当天

        // 初始化日历组件；
        calendar.init(params['m'], params['t']);

        delete params['m'];
        delete params['t'];
        
        hash_str = getHashStr();
        var sub_str = [];
        if (hashData['action']) {
            sub_str.push('action='+hashData['action']);
        }
        $.each(params, function(n, v){
            sub_str.push(n + '=' + v);
        });
        sub_str = sub_str.join('&');
        hash_str = hash_str ? (sub_str ? hash_str+'&'+sub_str : hash_str) : sub_str;
        
        // 除了m和t外，如果params还有其他状态参数，那么将其设置...设置后，将激活hashchange事件
        YY.hash.set(hash_str);
    }
    /**
     * 根据URL值，设置当前的日历状态;
     * @param {[type]} url [description]
     */
    function setCalendarStatus(url){
        var hash_str = getHashStr(url),
            hashData = parseHash(hash_str), // 解析后的hash参数
            action = hashData['action'];// 状态操作

        if (action) {
            router(action, hashData['params']);
        } else {
            clearStatusAction(hashData['params']);
        }
    }
    /**
     * 解析hash串的参数，最后返回固定格式：
     *     {
     *         'action' : '',
     *         'params' : {
     *             
     *         }
     *     }
     * @param  {[type]} hash [description]
     * @return {[type]}      [description]
     */
    function parseHash(hash_str){
        var ret = {
                'action': '',
                'params': {}
            },
            params = ret['params'];
        if (hash_str) {
            hash_str = hash_str.split('&');
            $.each(hash_str, function(i, val){
                val = val.split('=');
                if (val[0]==='action') {
                    ret['action'] = val[1];
                } else {
                    params[val[0]] = val[1];
                }
            });
        }
        return ret;
    }
    /**
     * 根据URL获取hash串,不包括#号
     * @param  {[type]} url [description]
     * @return {[type]}     [description]
     */
    function getHashStr(url){
        url = url || location.href;
        return url.replace(/^[^#]*#?(.*)$/, '$1');
    }
    // window上的事件绑定；
    $win.on({
        'resize': function(){
            calendar.reSize();
        },
        /**
         * 改变URL hash值的时候触发，
         * hash值内可能包括的参数有：
         *     'action' : 操作状态
         *     'm' : 日历显示模式，现在分三种 month、week、day
         *     'r' : 时间范围，用来确认日历的显示范围，若不带此参数，或者参数不正确，则表示当天所在的范围内（1111111-2222222）
         *     其他参数 : 其他参数一般是跟action相关的一些数据请求参数，是可选的
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        'hashchange': function(e){
            var cur_url = location.href,
                hash = cur_url.replace(/^[^#]*#?(.*)$/, '$1'),
                action = '',
                params = {};

            hash = hash.split('&');
            $.each(hash, function(i, val){
                val = val.split('=');
                if (val[0]==='action') {
                    action = val[1];
                } else {
                    params[val[0]] = val[1];
                }
            });
            if (action) {
                router(action, params);
            } else {
                clearStatusAction(params);
            }
        }
    });
    /**
     * 根据action，路由选择执行方法;
     * @param  {[type]} action [description]
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    function router(action, params){
        var action_list = ACTION;

        if ($.inArray(action, action_list)!==-1) {
            // clearStatusAction(action, params)
            if (action==='shot') {
                calendar.dialog.close();
            } else {
                calendar.closeFloatBox();
            }
            var fn = statusAction[action];
            typeof fn === 'function' && fn(params);
        }
    }
    /**
     * 清除状态操作，所带来的一些界面变化
     * @param  {[type]} excpetion_action [description]
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    function clearStatusAction(excpetion_action, params){
        var action_list = ACTION;

        if (typeof excpetion_action === 'object') {
            params = excpetion_action;
            excpetion_action = '';
        }
        $.each(action_list, function(i, action){
            if (action!==excpetion_action) {
                var fn = statusAction['un'+action];
                typeof fn === 'function' && fn(params);
            }
        });
    }
    /**
     * 日历中跟URL变化的一些行为
     * @type {Object}
     */
    var statusAction = {
        // 显示schedule快照信息
        shot: function(params){
            var B = calendarBiz,
                $floatbox = $('#yyFloatbox'),
                $floatboxContent = $('.yy-floatbox-content', $floatbox);
            $('.yy-floatbox-title h3', $floatbox).html('日程详情');
            $floatboxContent.html('<img src="'+util.url('js/yonyou/widgets/simpleDialog/ajaxLoader.gif')+'">');
            B.openFloatBox({
                x: params['x'],
                y: params['y']
            });
            B.getTaskDetail(params['scheduleid'], params['type'], function(d){
                $floatboxContent.html(d);
                B.openFloatBox({
                    x: params['x'],
                    y: params['y']
                });
            });
        },
        unshot: function(params){
            var C = calendar;

            C.closeFloatBox();
        },
        /**
         * 显示schedule详情
         * @param  {[type]} params [description]
         * @return {[type]}        [description]
         */
        detail: function(params){
            var dialog = calendar.dialog,
                request_url  = util.url('employee/calendar/ajaxDetail'),
                request_data = params;
                // util.trace(dialog)
            dialog.setContentData('<img src="'+util.url('js/yonyou/widgets/simpleDialog/ajaxLoader.gif')+'">');
            dialog.resize({'width':720,'height':$win.height()});//475
            dialog.open();
            util.ajaxApi(request_url, function(d, s){
                if (s==='success' && d.rs) {
                    var feedTemplate = YY.feedTemplate,
                        schedule_add_html = feedTemplate.schedule_add(d['data']);
                    dialog.onComplete = function($wrap){};
                    dialog.setContentData(schedule_add_html);
                    dialog.setTitle('日程详情');
                    dialog.open();
                } else {
                    dialog.setContentData(d['error']);
                }
            }, 'POST', 'json', request_data);
        },
        undetail: function(params){
            var dialog = calendar.dialog;

            dialog.close();
        },
        /**
         * 增加schedule
         * params包含 starttime endtime
         * @param {[type]} params [description]
         */
        add: function(params){
            var C = calendar,
                dialog = C.dialog;

            dialog.onComplete = function($wrap){
                var $CalendarEditForm = $('#CalendarEditForm', $wrap);
                C.initCalendarEditView($CalendarEditForm, params['starttime'], params['endtime']);  // 初始化日历编辑界面相关内容
                C.bindCalendarEditEvent($CalendarEditForm); // 绑定日历编辑的相关事件
            };
            dialog.setContentData(C.getCache('ScheduleEditTemplate'));
            dialog.resize({'width':720,'height':255});
            dialog.setTitle('创建日程');
            dialog.open();
        },
        unadd: function(params){
            var dialog = calendar.dialog;

            dialog.close();
        },
        /**
         * 编辑schedule，
         * 激活日程更新编辑界面；
         * @param  {[type]} params [description]
         * @return {[type]}        [description]
         */
        edit: function(params){
            var C = calendar,
                dialog = C.dialog;

            dialog.setContentData('<img src="'+util.url('js/yonyou/widgets/simpleDialog/ajaxLoader.gif')+'">');
            dialog.resize({'width':720,'height':$win.height()});//475
            dialog.open();
            var request_url = '/employee/calendar/ajaxEdit',
                request_data = params;
            util.ajaxApi(request_url, function(d, s){
                if (s==='success' && d.rs) {
                    dialog.onComplete = function($wrap){
                        var $CalendarEditForm = $('#CalendarEditForm', $wrap);
                        C.initCalendarEditView($CalendarEditForm, d['data']);  // 初始化日历编辑界面相关内容
                        C.bindCalendarEditEvent($CalendarEditForm, d['data']); // 绑定日历编辑的相关事件
                    };
                    dialog.setContentData(C.getCache('ScheduleEditTemplate'));
                    dialog.setTitle('更新日程');
                    dialog.open();
                } else {
                    dialog.setContentData(d['error']);
                }
            }, 'POST', 'json', request_data);
        },
        unedit: function(params){
            var dialog = calendar.dialog;

            dialog.close();
        }
    };

    //加载表单处理插件;
    util.loadScript(['jquery/jquery.form-3.0.9.js']);

    var $CalendarLeft  = $('#CalendarLeft'), // 日历左侧区域;
        $CalendarRight = $('#CalendarRight');
    // 我关注的
    var $FollowedBlock = $('.followed-block', $CalendarLeft),
        $FollowedList = $('.followed-list', $FollowedBlock),
        // $FollowedSortButton = $('.action-sort', $FollowedBlock),
        $FollowedExpandedButton = $('.action-expanded', $FollowedBlock),
        $Followedrili_user = $('.rili_user', $FollowedBlock),
        $FollowedScroller = $('.scroller', $Followedrili_user),
        followed_list_max_height = 205;
    // 共享给我的
    var $SharedBlock = $('.shared-block', $CalendarLeft),
        $SharedList = $('.shared-list', $SharedBlock),
        // $SharedSortButton = $('.action-sort', $SharedBlock),
        $SharedExpandedButton = $('.action-expanded', $SharedBlock)
        $Sharedrili_user = $('.rili_user2', $SharedBlock),
        $SharedScroller = $('.scroller', $Sharedrili_user),
        shared_list_max_height = 205;
    // 展开关注人列表
    $FollowedExpandedButton.on({
        'click': function(){
            var $me = $(this);
            if($me.is('.action-expanded')){
                $me.addClass('action-collapsed').removeClass('action-expanded').html('<>');
                $Followedrili_user.hide();
            } else {
                $me.addClass('action-expanded').removeClass('action-collapsed').html('><');
                $Followedrili_user.show();
            }
        }
    });
    // 展开共享人列表
    $SharedExpandedButton.on({
        'click': function(){
            var $me = $(this);
            if($me.is('.action-expanded')){
                $me.addClass('action-collapsed').removeClass('action-expanded').html('<>');
                $Sharedrili_user.hide();
            } else {
                $me.addClass('action-expanded').removeClass('action-collapsed').html('><');
                $Sharedrili_user.show();
            }
        }
    });
    // 显示隐藏关注人滚动条
    $Followedrili_user.on({
        'mouseenter': function(){
            var height = $FollowedList.height();
            if (height>followed_list_max_height) {
                $FollowedScroller.show();
            }
        },
        'mouseleave': function(){
            $FollowedScroller.hide();
        }
    });
    // 显示隐藏共享人滚动条
    $Sharedrili_user.on({
        'mouseenter': function(){
            var height = $SharedList.height();
            if (height>followed_list_max_height) {
                $SharedScroller.show();
            }
        },
        'mouseleave': function(){
            $SharedScroller.hide();
        }
    });
    // 鼠标移动上去显示删除标记
    $FollowedList.on({
        'mouseover': itemEnterOrLeave,
        'mouseout' : itemEnterOrLeave
    });
    $SharedList.on({
        'mouseover': itemEnterOrLeave,
        'mouseout' : itemEnterOrLeave
    });
    /**
     * 移入、移出
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    function itemEnterOrLeave(e){
        var $target = $(e.target),               // over：进入的对象；out：移出的对象
            $relatedTarget = $(e.relatedTarget), // over：移出的对象；out：进入的对象
            $realTarget = $target.closest('.yy-user-item');
        if ($relatedTarget.closest('.yy-user-item').get(0)!==$realTarget.get(0)) {
            var $deleteButton = $realTarget.find('.yy-user-item-delete');
            // util.trace('移入')
            e.type==='mouseout' ?
                $deleteButton.addClass('hidden') :
                $deleteButton.removeClass('hidden');
        }
    }
    function setUserListHeight($obj, max_height){
        max_height = max_height || 205;
        var $wrap = $obj,
            $container = $obj.find('.scroll-container'),
            $shower = $obj.find('.scroll-shower'),
            height = $shower.height();
        
        var new_height = height>max_height ? max_height : height;
        $wrap.height($wrap.height()-$container.height()+new_height);
        $container.height(new_height);
    }
    setUserListHeight($Followedrili_user, 205);
    setUserListHeight($Sharedrili_user, 205);

    // //选择员工弹出层
    // $('#addFollowed').fancybox();
    // $('#toShared').fancybox();
    util.loadScript(['jquery/jqueryui/jquery-ui-1.8.18.custom.min.js'], {
        fn: function() {
            var start_pos, end_pos;
            /**
             * 我关注的
             * @type {[type]}
             */
            // 排序
            $FollowedList.sortable({
                disabled: false,
                revert: true,
                cursor: 'move',
                opacity: 0.5,
                start: function(e, ui) {
                    var $item = ui.item;
                    start_pos = $item.index();
                },
                stop: function(e, ui) {
                    var $item = ui.item;
                    end_pos = $item.index();
                    if (end_pos !== start_pos) {
                        if (start_pos > end_pos) {
                            var t = start_pos;
                            start_pos = end_pos
                            end_pos   = t;
                        }
                        var $change_items = $FollowedList.children().slice(start_pos, end_pos+1);
                        var sort = {
                            'mid[]': [],
                            'sort[]': [],
                            'type':1
                        };
                        $change_items.each(function(i){
                            var mid = $(this).attr('mid');
                            sort['mid[]'].push(mid);
                            sort['sort[]'].push(start_pos+i+1);
                        });
                        var requerstUrl = YY.util.url('/employee/calendaruser/sort');
                        YY.util.ajaxApi(requerstUrl, function(d, s){
                            // Do Nothing
                        }, 'POST', 'json', sort);
                    }
                }
            });
            /**
             * 共享给我的
             * @type {[type]}
             */
            // 排序
            $SharedList.sortable({
                disabled: false,
                revert: true,
                cursor: 'move',
                opacity: 0.5,
                start: function(e, ui) {
                    var $item = ui.item;
                    start_pos = $item.index();
                },
                stop: function(e, ui) {
                    var $item = ui.item;
                    end_pos = $item.index();
                    if (end_pos !== start_pos) {
                        if (start_pos > end_pos) {
                            var t = start_pos;
                            start_pos = end_pos
                            end_pos   = t;
                        }
                        var $change_items = $SharedList.children().slice(start_pos, end_pos+1);
                        var sort = {
                            'mid[]': [],
                            'sort[]': []
                        };
                        $change_items.each(function(i){
                            var mid = $(this).attr('mid');
                            sort['mid[]'].push(mid);
                            sort['sort[]'].push(start_pos+i+1);
                        });
                        var requerstUrl = util.url('/employee/calendaruser/sort');
                        util.ajaxApi(requerstUrl, function(d, s){
                            // Do Nothing
                        }, 'POST', 'json', sort);
                    }
                }
            });
        }
    });
/*
    // document上的事件绑定；
    $doc.on({

    });
*/
});