/**
 * 处理时刻选择相关业务;
 * 
 * @author qiutao qiutao@chanjet.com
 */
;(function($, YY, util){
    /**
     * 修复为2个字符长度，长度不足以前置0补齐;
     * @return {[type]} [description]
     */
    util.fix2Length = typeof util.fix2Length === 'function'
                    ? util.fix2Length
                    : function(str) {
                        str = str.toString();
                        return str.length < 2 ? '0' + str : str;
                    };
    // 验证时间的正则表达式;
    var REG_TIME = /^([01]?[\d]|2[0123]):[012345]?[\d]$/;

    var ONE_HALF_HOUR = 1800000,   // 半小时
        ONE_DAY = 86400000;        // 一天

    var $body = $('body');

    function TimeSelect(options) {
        options = options || {};
        var me = this,
            defaults = {
                wrap: '.yy-time-block',
                start_date: '.start-date',
                start_time: '.start-time',
                end_date: '.end-date',
                end_time: '.end-time',
                list_height: '125',
                list_width: '125',
                time_range: ONE_HALF_HOUR
            };
        options = me.options = $.extend(defaults, options);

        var $wrap = me.$wrap = $(options.wrap);         // 日期选择器的包含容器
        me.$start_date = $(options.start_date, $wrap);  // 开始日期
        me.$start_time = $(options.start_time, $wrap);  // 开始时刻
        me.$end_date   = $(options.end_date, $wrap);    // 结束日期
        me.$end_time   = $(options.end_time, $wrap);    // 结束时刻

        var fn = TimeSelect.prototype;
        if (typeof me.eventBind !== 'function') {
            /**
             * 清除开始时刻的html缓存;
             * @return {[type]} [description]
             */
            fn.clearStartTimeCache = function() {
                // do nothing;
            };
            /**
             * 清除开始时刻列表对象;
             * @return {[type]} [description]
             */
            fn.clearStartTimeObjCache = function() {
                var me = this;

                if (me.$start_time_list) {
                    me.$start_time_list.off();
                    me.$start_time_list.remove();
                    me.$start_time_list = null;
                }
            };
            /**
             * 清除结束时刻的html缓存;
             * @return {[type]} [description]
             */
            fn.clearEndTimeCache = function() {
                var me = this;

                me.end_time_list = '';
            };
            /**
             * 清除结束时刻列表对象;
             * @return {[type]} [description]
             */
            fn.clearEndTimeObjCache = function() {
                var me = this;

                if (me.$end_time_list) {
                    me.$end_time_list.off();
                    me.$end_time_list.remove();
                    me.$end_time_list = null;
                }
            };
            /**
             * 根据给定的时刻，返回和其最接近的焦点时刻（正点或者半点时刻）;
             * @param  {[type]} time [description]
             * @return {[type]}      [description]
             */
            fn.getFocusTime = function(time) {
                var hour, min;
                if (time) {
                    time = time.split(':');
                    hour = parseInt(time[0], 10);
                    min  = parseInt(time[1], 10);
                }
                if (isNaN(hour) || isNaN(min)) {
                    var date_obj = new Date();
                    hour = date_obj.getHours();
                    min  = date_obj.getMinutes();
                }
                min = min < 30 ? '00' : '30';
                hour = util.fix2Length(hour);

                return hour + ':' + min;
            };
            /**
             * 获取通用的时刻列表;
             * @return {[type]} [description]
             */
            fn.getCommenTimeList = function() {
                var timelist_str = '<ul class="time-list">';

                var fix2Length = util.fix2Length;
                for (var i = 0; i < 24; i++) {
                    i = fix2Length(i);
                    timelist_str += '<li>' + i + ':00' + '</li>';
                    timelist_str += '<li>' + i + ':30' + '</li>';
                }
                timelist_str += '</ul>';

                // 设置通用的时刻列表的缓存;
                return me.time_list_cache = timelist_str;
            };
            /**
             * 设置开始时刻时间列表的缓存;
             */
            fn.setStartTimeList = function() {
                var me = this;

                // 设置开始时刻的时间列表的缓存;
                return me.start_time_list = me.time_list_cache || me.getCommenTimeList();
            };
            /**
             * 添加开始时刻列表;
             */
            fn.addStartTimeList = function() {
                var me = this;

                // 清除开始时刻列表对象;
                me.clearStartTimeObjCache();

                // 开始时刻的时间列表;
                var timelist_str = me.start_time_list;
                if (!timelist_str) {
                    timelist_str = me.setStartTimeList();
                }
                var $start_time_list = $(timelist_str),
                    $start_time = me.$start_time;

                me.$start_time_list = $start_time_list;
                // 添加时刻列表;
                me.addTimeList($start_time_list, $start_time);
            };
            /**
             * 设置结束时刻时间列表的缓存;
             */
            fn.setEndTimeList = function() {
                var me = this,
                    start_date = me.$start_date.val(),
                    end_date = me.$end_date.val();

                var str = '';
                // 开始日期与结束日期相等;
                if (start_date === end_date) {
                    var start_time = me.$start_time.val();
                    start_time = start_time.split(':');

                    hour = parseInt(start_time[0], 10);
                    min  = parseInt(start_time[1], 10);

                    str = '<ul class="time-list">';

                    var fix2Length = util.fix2Length;
                    var hour1, hour2, min1, min2;
                    for (var i = 0; i < 24; i++) {
                        hour1 = hour+i;
                        hour1 = hour1 < 24 ? hour1 : hour1-24;
                        min1 = min;
                        if (min<30) {
                            hour2 = hour1;
                            min2 = min1+30;
                        }
                        else {
                            hour2 = hour+i < 23 ? hour1+1 : hour+i-23;
                            min2 = min1-30;
                        }
                        str += '<li>' + fix2Length(hour1) + ':' + fix2Length(min1) + '<span>(' + i + '小时)</span></li>';
                        str += '<li>' + fix2Length(hour2) + ':' + fix2Length(min2) + '<span>(' + (i+0.5) + '小时)</span></li>';
                    }
                    str += '</ul>';
                }
                else {
                    str = me.time_list_cache || me.getCommenTimeList();
                }

                // 设置开始时刻的时间列表的缓存;
                return me.end_time_list = str;
            };
            /**
             * 添加结束时刻列表;
             */
            fn.addEndTimeList = function() {
                var me = this;

                // 清除结束时刻html列表缓存;
                me.clearEndTimeCache();
                // 清除结束时刻列表对象
                me.clearEndTimeObjCache();

                // 结束时刻的时间列表;
                var timelist_str = me.end_time_list;
                if (!timelist_str) {
                    timelist_str = me.setEndTimeList();
                }
                var $end_time_list = $(timelist_str),
                    $end_time = me.$end_time;

                me.$end_time_list = $end_time_list;
                // 添加时刻列表;
                me.addTimeList($end_time_list, $end_time);
            };
            /**
             * 添加时刻列表;
             * @param {[type]} $time_list    时刻列表对象;
             * @param {[type]} $target       相对的input框对象;
             */
            fn.addTimeList = function($time_list, $target) {
                var me = this,
                    options = me.options;

                var $timeList = $time_list,
                    $input_time = $target;
                var width  = options.list_width ? options.list_width : $input_time.width(),
                    height = options.list_height ? options.list_height : '125';
                var input_time_pos = $input_time.offset(), // 时间输入框的位置;
                    input_time_pos_left = input_time_pos.left,
                    input_time_pos_top  = input_time_pos.top;

                var $wrap = me.$wrap,
                    wrap_width = $wrap.width()
                    wrap_pos = $wrap.offset(),
                    wrap_pos_left = wrap_pos.left,
                    wrap_pos_right_to_left  = wrap_pos_left + wrap_width; // 日期控件包含器的右边距浏览器左边的距离;

                var left = input_time_pos_left,
                    top  = $input_time.outerHeight()+input_time_pos_top;

                // 时间列表的宽度超出了包裹器的右边位置，那么重新设置时间列表左边的位置;
                if (-(-left-width)>wrap_pos_right_to_left) {
                    left = wrap_pos_right_to_left - width;
                }
                $timeList.css({
                    'position': 'absolute',
                    'left': left,
                    'top': top,
                    'width': width,
                    'height': height,
                    'overflow-x': 'hidden',
                    'overflow-y': 'scroll',
                    'z-index': 99999,
                    'background': '#fff',
                    'border': '1px solid #F1F1F1',
                    'text-align': 'left'
                });
                // $timeList.offset({
                //     'top': top, 'left': left
                // })
                // $input_time.after($timeList); // 添加到时刻输入框元素的后边;
                $timeList.appendTo($body)

                var $timeItems = $timeList.children();
                $timeItems.css({
                    'padding': '0 0 0 8px',
                    'height': '20px',
                    'line-height': '20px'
                });
                var item_height = $timeItems.eq(0).height(),
                    input_time  = $input_time.val();
                input_time = input_time.split(':');
                // 遍历时刻列表，找出合适的位置聚焦;
                $timeItems.each(function(i){
                    var $me = $(this),
                        item_txt = $me.html();
                    item_txt = item_txt.split('<span>')[0];
                    item_txt = item_txt.split(':');
                    if (item_txt[0] >= input_time[0]) {
                        var input_time_temp = parseInt(input_time[0]+''+input_time[1], 10),
                            item_txt_temp   = parseInt(item_txt[0]+''+item_txt[1], 10);
                        
                        if(input_time_temp <= item_txt_temp) {
                            var pos, $pos;
                            // 正好有相等项;
                            if (input_time_temp === item_txt_temp) {
                                pos = i;
                                $pos = $me;
                            }
                            // 没有相等的，那么第一个小于的也成~
                            else {
                                pos = i-1;
                                $pos = $me.prev();
                            }
                            $timeList.scrollTop(pos*item_height);
                            $pos.css({
                                'background': '#F1F1F1'
                            });
                            return false;
                        }
                    }
                });
            };
            /**
             * 根据Unix时间戳（毫米级的时间戳），获取日期
             * @param  {[type]} timestamp [description]
             * @return {[type]}           [description]
             */
            fn.formatDate = function(timestamp){
                var fix2Length = util.fix2Length;

                var dateObj = new Date(timestamp),
                    hour = fix2Length(dateObj.getHours()),
                    min  = fix2Length(dateObj.getMinutes()),
                    year  = dateObj.getFullYear(),
                    month = fix2Length(dateObj.getMonth()+1),
                    day   = fix2Length(dateObj.getDate());

                return {
                    'date': year + '-' + month + '-' + day,
                    'time': hour + ':' + min
                };
            };
            /**
             * 获取起始时刻的时间戳;
             * @return {[type]} [description]
             */
            fn.getStartTimestamp = function() {
                var me = this,
                    $start_date = me.$start_date,
                    $start_time = me.$start_time;
                // 起始 日期 和 时间
                var startdate = $start_date.val().split("-"),
                    starttime = $start_time.val();
                starttime = starttime ? (starttime + ":00").split(":") : ('00:00:00').split(":");
                var startdate_obj = new Date(startdate[0], startdate[1]-1, startdate[2], starttime[0], starttime[1], starttime[2]), //开始时间
                    start_timestamp = startdate_obj.getTime();
                return start_timestamp;
            };
            /**
             * 获取结束时刻的时间戳;
             * @return {[type]} [description]
             */
            fn.getEndTimestamp = function() {
                var me = this,
                    $end_date = me.$end_date,
                    $end_time = me.$end_time;
                // 结束 日期 和 时间
                var enddate = $end_date.val().split("-"),
                    endtime = $end_time.val();
                endtime = endtime ? (endtime + ":00").split(":") : ('00:00:00').split(":");
                var enddate_obj = new Date(enddate[0], enddate[1]-1, enddate[2], endtime[0], endtime[1], endtime[2]), //结束时间
                    end_timestamp = enddate_obj.getTime();
                return end_timestamp;
            };
            /**
             * 缓存起始时间和结束时间的时间差，以时间戳的形式存储;
             * @return {timestamp} 返回设置后的时间戳;
             */
            fn.setTimeRange = function() {
                var me = this;

                var start_timestamp = me.getStartTimestamp(),
                    end_timestamp   = me.getEndTimestamp();

                me.time_range = end_timestamp-start_timestamp;

                return me.time_range;
            };
            /**
             * 根据设定的时间范围，更新结束日期;
             * @return {[type]} [description]
             */
            fn.updateTimeRange = function() {
                var me = this;

                var timestamp = me.time_range || me.options.time_range;

                var start_timestamp = me.getStartTimestamp(),
                    end_timestamp = start_timestamp+timestamp;

                // 根据结束时间戳，设置结束时间;
                me.setEndDate(end_timestamp);
            };
            /**
             * 指定时间戳，设置开始日期;
             * @param {[type]} timestamp [description]
             */
            fn.setStartDate = function(timestamp) {
                var me = this;

                // 根据传入的时间戳，获取日期date和时间time;
                var date = me.formatDate(timestamp);

                me.setStartDateDate(date['date']);
                me.setStartDateTime(date['time']);
            };
            /**
             * 指定时间戳，设置结束日期;
             * @param {[type]} timestamp [description]
             */
            fn.setEndDate = function(timestamp) {
                var me = this;

                // 根据传入的时间戳，获取日期date和时间time;
                var date = me.formatDate(timestamp);

                me.setEndDateDate(date['date']);
                me.setEndDateTime(date['time']);
            };
            /**
             * 设置开始日期;
             * @param {[type]} date [description]
             */
            fn.setStartDateDate = function(date) {
                var me = this,
                    $start_date = me.$start_date;

                !$start_date.is(':disabled') 
                    && $start_date.val(date);
                return $start_date;
            };
            /**
             * 设置开始时刻;
             * @param {[type]} time [description]
             */
            fn.setStartDateTime = function(time) {
                var me = this,
                    $start_time = me.$start_time;

                !$start_time.is(':disabled') 
                    && $start_time.val(time);
                return $start_time;
            };
            /**
             * 设置结束日期;
             * @param {[type]} date [description]
             */
            fn.setEndDateDate = function(date) {
                var me = this,
                    $end_date = me.$end_date;

                !$end_date.is(':disabled') 
                    && $end_date.val(date);
                return $end_date;
            };
            /**
             * 设置结束时刻;
             * @param {[type]} time [description]
             */
            fn.setEndDateTime = function(time) {
                var me = this,
                    $end_time = me.$end_time;

                !$end_time.is(':disabled') 
                    && $end_time.val(time);
                return $end_time;
            };
            fn.getStartTimestampCache = function() {
                var me = this;

                return me.start_timestamp_cache;
            };
            fn.getEndTimestampCache = function() {
                var me = this;

                return me.end_timestamp_cache;
            };            
            fn.setStartTimestampCache = function() {
                var me = this;

                return me.start_timestamp_cache = me.getStartTimestamp();
            };
            fn.setEndTimestampCache = function() {
                var me = this;

                return me.end_timestamp_cache = me.getEndTimestamp();
            };
            /**
             * 在日期和时刻选择框上绑定事件;
             * @return {[type]} [description]
             */
            fn.eventBind = function() {
                var me = this;

                // 开始日期;
                me.$start_date.datepicker({
                    prevText: '上月',
                    nextText: '下月',
                    dateFormat: 'yy-mm-dd',
                    beforeShow: beforeShowHandle,
                    onSelect: function() {
                        // 根据缓存起始时间和结束时间的时间差，更新结束日期;
                        me.updateTimeRange();
                        // 缓存起始时间和结束时间的时间差，以时间戳的形式存储;
                        me.setTimeRange();
                        // util.trace(me.time_range)
                    }
                });
                // 结束日期;
                me.$end_date.datepicker({
                    prevText: '上月',
                    nextText: '下月',
                    dateFormat: 'yy-mm-dd',
                    beforeShow: beforeShowHandle,
                    onSelect: function(dateText, inst) {
                        var $start_date = me.$start_date,
                            $start_time = me.$start_time,
                            $end_date = me.$end_date,
                            $end_time = me.$end_time;

                        var start_timestamp = me.getStartTimestamp();
                            
                        // 结束时刻为空...修复结束时间;
                        if (!$end_time.val()) {
                            // 开始日期小于结束日期;
                            if ($start_date.val() < $end_date.val()) {
                                me.setEndDateTime('00:00');
                            }
                            // 开始日期大于等于结束日期;
                            else {
                                me.setEndDate(start_timestamp+ONE_HALF_HOUR);
                            }
                        }
                        var end_timestamp = me.getEndTimestamp();
                        // 开始时间小于结束时间;
                        if (start_timestamp < end_timestamp) {
                            // 缓存起始时间和结束时间的时间差，以时间戳的形式存储;
                            me.setTimeRange();
                        }
                        else if (start_timestamp === end_timestamp) {
                            if(!!me.$end_time.is(':disabled')) {
                                // 缓存起始时间和结束时间的时间差，以时间戳的形式存储;
                                me.setTimeRange();
                            }
                            else {
                                $.yy.rscallback('时间错误，结束时间必须大于开始时间。', 1);
                                me.setEndDateDate(inst.lastVal);
                            }
                        }
                        else {
                            $.yy.rscallback('时间错误，结束时间必须大于开始时间。', 1);
                            me.setEndDateDate(inst.lastVal);
                        }
                    }
                });
                // 日历显示前的处理;
                function beforeShowHandle(elem, obj) {
                    setTimeout(function(){
                        obj.dpDiv.css({
                            'z-index': 9999
                        });
                    }, 100);
                }
                // 开始时刻
                me.$start_time.on({
                    'focus': function() {
                        // 清除开始时刻列表对象
                        // me.clearStartTimeObjCache();
                        // 添加开始时刻选择列表;
                        me.addStartTimeList();
                        // 在开始时刻选择列表上绑定事件;
                        var $start_time_list = me.$start_time_list,
                            $time_item = $('li', $start_time_list);
                        $start_time_list.on({
                            'click': function(e) {
                                var $target = $(e.target);
                                if ($target.is('li')) {
                                    me.setStartDateTime($target.html()).change();

                                    // 删除之前清除绑定的事件;
                                    $time_item.off();
                                    $start_time_list.off();
                                    // 清除开始时刻列表对象
                                    me.clearStartTimeObjCache();
                                }
                            }
                        });
                        $time_item.on({
                            'mouseenter': timeItemMouseenterHandle
                        });
                    },
                    'change': function() {
                        var flag = REG_TIME.test($(this).val());
                        if (!flag) {
                            // 当输入的时刻不符合，获取跟当前时刻最接近的整点时刻;
                            var start_time = me.getFocusTime();
                            me.setStartDateTime(start_time);
                        }
                        // 根据缓存起始时间和结束时间的时间差，更新结束日期;
                        me.updateTimeRange();
                        // 缓存起始时间和结束时间的时间差，以时间戳的形式存储;
                        me.setTimeRange();
                    }
                });
                // 结束时刻
                me.$end_time.on({
                    'focus': function() {
                        // 添加结束时刻选择列表;
                        me.addEndTimeList();
                        // 在结束时刻选择列表上绑定事件;
                        var $end_time_list = me.$end_time_list,
                            $time_item = $('li', $end_time_list);
                        $end_time_list.on({
                            'click': function(e) {
                                var $target = $(e.target);

                                var $item = $target.closest('li');
                                if (!!$item.length) {
                                    var start_date = me.$start_date.val(),
                                        start_time = me.$start_time.val(),
                                        end_date = me.$end_date.val(),
                                        end_time   = $item.html().split('<')[0];
                                    // 当起始日期等于结束日期，并且结束时刻小于起始时刻，那么将结束日期设置为开始日期的第二天;
                                    if (start_date === end_date && end_time < start_time) {
                                        var start_timestamp = me.getStartTimestamp(),
                                            end_date = me.formatDate(start_timestamp+ONE_DAY)['date'];
                                        me.setEndDateDate(end_date);
                                    }
                                    me.setEndDateTime(end_time).change();

                                    // 删除之前清除绑定的事件;
                                    $time_item.off();
                                    $end_time_list.off();
                                    // 清除结束时刻html列表缓存;
                                    me.clearEndTimeCache();
                                    // 清除结束时刻列表对象
                                    me.clearEndTimeObjCache();
                                }
                            }
                        });
                        $time_item.on({
                            'mouseenter': timeItemMouseenterHandle
                        });
                    },
                    'change': function() {
                        var flag = REG_TIME.test($(this).val());
                        if (!flag) {
                            // 根据缓存起始时间和结束时间的时间差，更新结束日期;
                            me.updateTimeRange();
                        }
                        var $start_date = me.$start_date,
                            $start_time = me.$start_time,
                            $end_date = me.$end_date,
                            $end_time = me.$end_time;

                        var start_timestamp = me.getStartTimestamp();
                        // 结束日期为空;
                        if (!$end_date.val()) {
                            var end_date = $start_time.val() < $end_time.val() 
                                            ? $start_date.val() 
                                            : me.formatDate(start_timestamp+ONE_DAY)['date'];

                            me.setEndDateDate(end_date);
                        }
                        var end_timestamp   = me.getEndTimestamp();
                        if (start_timestamp >= end_timestamp) {
                            $.yy.rscallback('时间错误，结束时间必须大于开始时间。', 1);
                            // 根据缓存起始时间和结束时间的时间差，更新结束日期;
                            me.updateTimeRange();
                        }
                        else {
                            // 缓存起始时间和结束时间的时间差，以时间戳的形式存储;
                            me.setTimeRange();
                        }
                    }
                });
                // 时刻项的mouseenter事件;
                function timeItemMouseenterHandle(e) {
                    var $me = $(this);
                    $me.css({
                        'background': '#F1F1F1',
                        'cursor': 'pointer'
                    }).siblings('li').css({
                        'background': ''
                    });
                }
                // 绑定在body上的事件;
                $('body').on({
                    'click': function(e) {
                        var $target = $(e.target);
                        // 点击在开始时刻选择区域外;
                        if (me.$start_time_list 
                                && !($target.closest(me.$start_time).length || $target.closest(me.$start_time_list).length)) {
                            // 清除开始时刻列表对象;
                            me.clearStartTimeObjCache();
                        }
                        // 点击在结束时刻选择区域外;
                        if (me.$end_time_list 
                                && !($target.closest(me.$end_time).length || $target.closest(me.$end_time_list).length)) {
                            // 清除结束时刻html列表缓存;
                            me.clearEndTimeCache();
                            // 清除结束时刻列表对象;
                            me.clearEndTimeObjCache();
                        }
                    }
                });
            };
        }
    }

    YY.TimeSelect = TimeSelect;
}(jQuery, YY, YY.util));