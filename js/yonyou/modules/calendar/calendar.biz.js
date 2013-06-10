/**
 * 日历task相关业务逻辑处理;
 */
(function($, YY, util){
    YY = YY || {};

    var calendarBiz = {
        $body: $('body'),
        $calendar: $('#Calendar', this.$body),
        $main: $('#CalendarMain', this.$calendar),
        $mainGridWrapper: $('#CalendarMainGrid', this.$main),//日历外框架;
        $mainEditWrapper: $('#yyCalendarMainEdit', this.$main),//日历task编辑外框;
        $mainSearchWrapper: $('#yyCalendarMainSearch', this.$main),
        settingPanelHtml: '',
        th1: 0,
        calendarCombo: null,
        actMap: {
            checkInCalendar: 'checkInCalendar'
        },
        /**
         * 初始化弹出框;
         * @return {[type]} [description]
         *//*
        initFloatBox: function(){
            if(!$('#yyFloatbox').length) {
                var str = '<div class="yy-floatbox" id="yyFloatbox" style="z-index:1001;display:none;"><div class="yy-floatbox-main">'
                        + '<div class="title"><ul><li class="cur">默认标题</li></ul><a href="#" class="close fr" title="关闭"></a></div>'
                        + '<p class="yy-floatbox-bottom-arrow" id="yyFloatboxArrow"></p>';
                me.$body.append(str);
            }
        },*/
        /**
         * 打开浮动盒子；
         */
        openFloatBox: function(settings){
            settings = settings instanceof Object ? settings : {};
            var me = this,
                defaults = {
                    wrap: '#yyFloatbox',
                    fix_num: 20,
                    x: 0,
                    y: 0
                };
            settings = $.extend({}, defaults, settings);
            var $floatBox = $(settings.wrap),
                $floatBoxArrow = $('.yy-floatbox-arrow', $floatBox),
                fix_num = settings.fix_num,
                x = settings.x, 
                y = settings.y,
                scroll_top = $(window).scrollTop();

            //将none设置为block，获取浮动弹出框的高和宽；
            $floatBox.show();
            var floatBox_height = $floatBox.outerHeight(true),
                floatBox_width  = $floatBox.outerWidth(true),
                floatBox_width_half = floatBox_width/2,
                floatBoxArrow_width  = $floatBoxArrow.width(),
                floatBoxArrow_width_half = floatBoxArrow_width/2,
                floatBoxArrow_height = $floatBoxArrow.height(),
                top, left, arrow_left,
                body_width = me.$body.width();
            var bottom_arrow = 'yy-floatbox-bottom-arrow',
                top_arrow = 'yy-floatbox-top-arrow';
            //纵向定位;
            if((y-scroll_top)>(floatBox_height+floatBoxArrow_height+1)){//y-scroll_top-49
                $floatBoxArrow.addClass(bottom_arrow)
                    .removeClass(top_arrow);
                top = y-floatBox_height-floatBoxArrow_height-1;
            }
            else {
                $floatBoxArrow.addClass(top_arrow)
                    .removeClass(bottom_arrow);
                top  = -(-y-floatBoxArrow_height-1);
            }
            left = x-floatBox_width_half;
            //横向定位;
            if(x<(floatBox_width_half+fix_num)){//鼠标靠左;
                left = fix_num;
                arrow_left = x-left-floatBoxArrow_width_half;
            }
            else if((body_width-x)<(floatBox_width_half+fix_num)){//鼠标靠右;
                left = body_width-floatBox_width-fix_num;
                arrow_left = x-left-floatBoxArrow_width_half;
            }
            else {
                arrow_left = floatBox_width_half-floatBoxArrow_width_half;
            }
            if ((arrow_left+floatBoxArrow_width_half>(floatBox_width-10)) 
                    || (arrow_left-floatBoxArrow_width_half<10) ) {
                arrow_left = floatBox_width_half-floatBoxArrow_width_half;
            }
            $floatBoxArrow.css({left:arrow_left});
            $floatBox.offset({top:top,left:left}).css({visibility:'visible'});
        },
        /**
         * 激活我的操作列表;
         */
        openOperateList: function($target){
            var me = this,
                $operates = $target.closest('.yy-calendar-operates'),
                $operate = $target.closest('.yy-calendar-operate');
            clearTimeout(me.th1);
            $operate.addClass('actived')
                .siblings().removeClass('actived');
            $operates.children().show();
        },
        /**
         * 取消我的操作列表;
         */
        closeOpereateList: function($target){
            var me = this;
            me.th1 = setTimeout(function(){
                $target.children().hide();
                $target.find('.yy-calendar-operate').removeClass('actived');
            }, 200);
        },
        /**
         * 处理表单状态;
         */
        /*
        handleFormStatus: function($target){
            var val = $target.val(),
                $submit = $target.closest('form').find('input[type="submit"]');
            $.trim(val) 
                ? $submit.removeClass('darkGrayButton').addClass('blueButton') //.removeAttr('disabled')
                : $submit.removeClass('blueButton').addClass('darkGrayButton');//.attr('disabled','disabled')
        },*/
        /**
         * 删除task;
         */
        deleteTask: function(fromid, type, start, end){
            var Cal = YY.calendar,
                // request_url = YY.util.url('/api/feed/delfeed'),
                request_url = util.url('/employee/calendar/delete'),
                data = {fromid:fromid, type:type};
            util.ajaxApi(request_url, function(d, s){
                if (s==='success' && d.rs) {
                    Cal.deleteTaskData(fromid, type, start, end);
                    Cal.closeFloatBox();
                    Cal.refreshCalendar();
                    $.yy.rscallback('删除成功！');
                }
                else {
                    $.yy.rscallback('操作错误删除失败！', 1);
                }
            },'POST','json',data);
            return true;
        },
        /**
         * 获取shcedule、task详细信息;
         */
        getTaskDetail: function(fromid, type, fn){
            if(typeof fn !== 'function') return ;
            var url_arr = ['/employee/calendar/ajaxSnapshot', '/task/add/api'],
                data = {from_id:fromid},
                i = (type==25 ) ? 0 : (type==35 ? 1 : 999);//25日程,35任务;
            util.ajaxApi(util.url(url_arr[i]), function(d,s){
                typeof fn === 'function' && fn(d);
            },'POST', 'html', data);
        },
        // /**
        //  * 打开task详细信息;
        //  */
        // openTaskDetailBox: function(e, fromid, type){
        //     var me = this,
        //         $floatbox = $('#yyFloatbox'),
        //         $floatboxTitle = $('.yy-floatbox-title h3', $floatbox),
        //         $floatboxContent = $('.yy-floatbox-content', $floatbox);
        //     me.getTaskDetail(fromid, type, function(d){
        //         $floatboxTitle.html('日程详情');
        //         $floatboxContent.html(d);
        //         me.openFloatBox({
        //             x: e.pageX,
        //             y: e.pageY
        //         });
        //     });
        // },
        // /**
        //  * task搜索列表中，+号展开详情;
        //  */
        // toggleSearchLineDetail: function($realTarget){
        //     var $line   = $realTarget.closest('.yy-calendar-search-line'),
        //         $detail = $('.yy-calendar-search-line-detail', $line);
        //     if($realTarget.hasClass('zk') 
        //             && $detail.find('.yy-loading').length){
        //         var resource_id = $realTarget.attr('resource_id')
        //         YY.util.ajaxApi(YY.util.url('/api/calendar/detail/feedid/')+resource_id, function(d,s){
        //             if(s==='success' && d){
        //                 setTimeout(function(){
        //                     $detail.html(d);
        //                 },200);
                        
        //             }
        //         }, 'POST', 'html');
        //     }
        //     $detail.toggle();
        //     $line.toggleClass('cur');
        //     $realTarget.toggleClass('zk sq');
        //     return true;
        // },
        /**
         * 切换到当前task所在的day日历;
         */
        checkInCalendar: function($target){
            var timestamp = parseInt($target.attr('timestamp')),
                Cal = YY.calendar;
            timestamp = Cal.getTimestamp(Cal.getDateObj(timestamp));
            Cal.setDay(timestamp);
            Cal.openCalendarView(Cal.viewType[2]);
        },
        /*
        showErrorRange: function(e) {
            var me = this,
                $body = me.$body,
                str = '<div id="yyErrorFloatbox" class="yy-floatbox rili_taskTk riliTishi relative" style="z-index:1001;display:none">'
                    + '<div class="yy-floatbox-main">'
                    + '<div class="yy-floatbox-content"><span class="icoWrongtk">您不能创建结束时间在当前时间前的任务。</span></div>'
                    + '<p class="yy-floatbox-arrow yy-floatbox-bottom-arrow"></p>'
                    + '</div></div>';
            $body.append(str);
            me.openFloatBox({
                wrap: '#yyErrorFloatbox',
                x: e.pageX,
                y: e.pageY
            });
        },*/
        /**
         * 没有权限
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        showNoPermission: function(e) {
            var me = this,
                $body = me.$body,
                str = '<div id="yyNoPermissionFloatbox" class="yy-floatbox rili_taskTk riliTishi relative" style="z-index:1001;display:none">'
                    + '<div class="yy-floatbox-main">'
                    + '<div class="yy-floatbox-content"><span class="icoWrongtk">您不可以在Ta人的日历中创建日程。</span></div>'
                    + '<p class="yy-floatbox-arrow yy-floatbox-bottom-arrow"></p>'
                    + '</div></div>';
            $body.append(str);
            me.openFloatBox({
                wrap: '#yyNoPermissionFloatbox',
                x: e.pageX,
                y: e.pageY
            });
        }/*,*/
        /**
         * 设置层相对body的位置，默认为居中;
         * @param {[type]} $o [description]
         *//*
        setPosition: function($o) {
            if (!$o.length) { return;}

            var me = this,
                $win = $(window);

            var width  = $o.outerWidth(true),
                height = $o.outerHeight(true),

                win_width  = $win.width(),
                win_height = $win.height(),
                win_scrollTop = $win.scrollTop();

            var top  = (win_height-height)/2+win_scrollTop,
                left = (win_width-width)/2;
            $o.css({
                'position': 'absolute',
                'top': top,
                'left': left
            });
        }*//*,
        handleFloatboxContent: function($target) {
            var $floatboxContent = $target.closest('#yyFloatbox'),
                options = {
                        'beforeSubmit': beforeSubmit,
                        'success': saveSuccess
                };
            function beforeSubmit(formData, jqForm, options) {
                $.each(formData, function(i, v){
                    if(v['name'] === 'taskumup') {
                        v['value'] = v['value'] ? v['value'] : '任务总结';
                        return false;
                    }
                    return true;
                });
                return true;
            }
            function saveSuccess(responseText, statusText, xhr, $form) {
                try{
                    var res = $.parseJSON(responseText);
                    if (typeof res.rs !== 'undefined' && res.rs) {
                        var Cal = YY.calendar;
                        Cal.closeFloatBox();
                        $.yy.rscallback('提交成功！');
                    }
                }catch(ex) {}
            }

            // 是否激活任务提交;
            if($target.hasClass('yy-task-active-commit')) {
                var $line = $('.yy-line', $floatboxContent),
                    $commitForm = $('.yy-form', $floatboxContent);
                if ($line.is(':hidden')) {
                    $line.show();
                    $commitForm.show();
                }
                else {
                    $line.hide();
                    $commitForm.hide();
                }
            }
            // 提交任务;
            if ($target.hasClass('yy-task-commit')) {
                var $form = $('.yy-form form', $floatboxContent);
                $form.ajaxSubmit(options);
            }
        }*/
    };

    YY.calendarBiz = calendarBiz;
}(jQuery, YY, YY.util));
/**
 * hashchange的支持
 */
(function($, window, undefined){

    var 
        str_hashchange = 'hashchange',
        // 方法和对象的引用
        doc = document,
        fake_onhashchange,
        special = $.event.special,
        // 判断浏览器是否支持hashchange
        doc_mode = doc.documentMode,
        supports_onhashchange = 'on' + str_hashchange in window && ( doc_mode === undefined || doc_mode > 7 );

    /**
     * 获取location.hash
     * @param  {[type]} url [description]
     * @return {[type]}     [description]
     */
    function get_fragment(url) {
        url = url || location.href;
        return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
    }
    /**
     * 绑定hashchange事件
     * @param  {Function} fn [description]
     * @return {[type]}      [description]
     */
    $.fn[str_hashchange] = function(fn) {
        return fn ? this.bind(str_hashchange, fn) : this.trigger(str_hashchange);
    };
    $.fn[str_hashchange].delay = 50;// 轮询延迟时间
    /*
    $.fn[str_hashchange].domain = null;
    $.fn[str_hashchange].src = null;
    */
    // 扩展special
    special[str_hashchange] = $.extend(special[str_hashchange], {
        /**
         * 第一次hashchange事件绑定在window上调用
         * @return {[type]} [description]
         */
        setup: function() {
            // 支持原生的window.onhashchange事件
            if (supports_onhashchange) { return false; }

            $(fake_onhashchange.start);
        },
        /**
         * 最后一个hashchange事件解绑
         * @return {[type]} [description]
         */
        teardown: function() {
            // 支持原生的window.onhashchange事件
            if (supports_onhashchange) { return false; }

            // 使用伪hashchange自己来停止
            $(fake_onhashchange.stop);
        }
    });
  
    // 伪hashchange，主要用于解决ie67不支持hashchange的功能
    fake_onhashchange = (function(){
        var 
            self = {},
            timeout_id,

            // 保存初始化hash
            last_hash = get_fragment(),

            fn_retval = function(val){ return val; },
            history_set = fn_retval,
            history_get = fn_retval;
    
        // 开启轮询循环
        self.start = function() {
            timeout_id || poll();
        };
        // 停止轮询循环
        self.stop = function() {
            timeout_id && clearTimeout( timeout_id );
            timeout_id = undefined;
        };
    
        // 以$.fn.hashchange.delay微秒的时间间隔，轮询检查location.hash值的改变，出发hashchange事件
        function poll() {
            var hash = get_fragment(),
                history_hash = history_get(last_hash);

            if (hash !== last_hash) {
                history_set(last_hash = hash, history_hash);

                $(window).trigger(str_hashchange);

            } else if (history_hash !== last_hash) {
                location.href = location.href.replace(/#.*/, '') + history_hash;
            }
            timeout_id = setTimeout(poll, $.fn[str_hashchange].delay);
        }
    
        // 支持ie6、7(8、9在ie7兼容模式下也需要)
        (navigator.userAgent.match(/MSIE/i) !== null) && !supports_onhashchange && (function(){
            var 
                iframe,
                iframe_src;
            /**
             * 在ie67事件绑定和轮询开始画，创建一个隐藏的iframe，记录历史状态
             * @return {[type]} [description]
             */
            self.start = function(){
                if (!iframe) {
                    iframe_src = $.fn[str_hashchange].src;
                    iframe_src = iframe_src && iframe_src + get_fragment();

                    iframe = $('<iframe tabindex="-1" title="empty"/>').hide()
                        // iframe加载完毕，初始化历史状态，开始轮询
                        .one( 'load', function(){
                            iframe_src || history_set(get_fragment());
                            poll();
                        })
                        // 加载iframe的src
                        .attr('src', iframe_src || 'javascript:0')
                        .insertAfter('body')[0].contentWindow;

                    // 当document.title改变时，也更新iframe的title，用于前进后退
                    doc.onpropertychange = function(){
                        try {
                            if (event.propertyName === 'title') {
                                iframe.document.title = doc.title;
                            }
                        } catch(e) {}
                    };
                }
            };

            self.stop = fn_retval;

            /**
             * 根据iframe的href，获取history
             * @return {[type]} [description]
             */
            history_get = function() {
                return get_fragment(iframe.location.href);
            };
            /**
             * 设置新的history
             * @param  {[type]} hash         [description]
             * @param  {[type]} history_hash [description]
             * @return {[type]}              [description]
             */
            history_set = function(hash, history_hash) {
                var iframe_doc = iframe.document,
                    domain = $.fn[str_hashchange].domain;

                if (hash !== history_hash) {
                    iframe_doc.title = doc.title;
                    iframe_doc.open();
                    domain && iframe_doc.write( '<script>document.domain="' + domain + '"</script>' );
                    iframe_doc.close();
                    iframe.location.hash = hash;
                }
            };
        })();

        return self;
    })();
})(jQuery, this);

/**
 * hash串相关的操作;
 */
(function($, YY, util){

    var hash = {
        get: function(){
            var me = this;

            return me.getCache();
        },
        /**
         * 设置hash串
         * @param {mix} hash string | object
         */
        set: function(hash){
            var me = this;

            if (hash && typeof hash==='object') {
                var temp = [];
                $.each(hash, function(k,v){
                    temp.push(k+'='+v);
                });
                hash = temp.join('&');
            }
            hash = hash || '';

            var url = location.href,
                url_nonhash = url.replace(/^([^#]*)#?(.*)$/, '$1');
            
            me.setCache(hash);// 保存设置的hash串
// alert('hash:'+hash)
// alert('url_nonhash:'+url_nonhash)
            location.href = hash ? url_nonhash+'#'+hash : url_nonhash;
        },
        /**
         * 解析hash串的参数，最后返回固定格式：
         *     {
         *         key : val
         *     }
         * @param  {[type]} hash [description]
         * @return {[type]}      [description]
         */
        parse: function(hash){
            var ret = {};

            if (hash) {
                hash = hash.split('&');
                $.each(hash, function(i, val){
                    val = val.split('=');
                    ret[val[0]] = val[1] ? val[1] : '';
                });
            }
            return ret;
        },
        setCache: function(hash_str){
            var me = this;

            me.hashCache = hash_str;
        },
        getCache: function(){
            var me = this;

            return me.hashCache || '';
        }
    }
    YY.hash = hash;
    hash = null;
}(jQuery, YonYou, YonYou.util));