/**
 * 处理时刻选择相关业务;
 *
 * @author qiutao qiutao@chanjet.com
 */
;(function($, YY, util){
    var dateParse = Date.parse,
        /**
         * 将字符串解析成10进制数字;
         * @param  {[type]} str [description]
         * @return {[type]}     [description]
         */
            intPasre  = function(str) {
            return parseInt(str, 10);
        };
    /**
     * 获取指定Unix时间戳(毫米级)的日期对象;
     * @param  {[type]} timestamp [timestamp不为空的时候，获取指定Unix时间戳的日期对象，否则获取当前的日期对象]
     * @return {[type]}           [description]
     */
    function getDateObj(timestamp){
        return timestamp ? new Date(timestamp) : new Date();
    }
    /**
     * 修复月日历的起止日期；
     * 由于 me.date 中保存的起止日期是从当月初到下月初的，
     *      没有涵盖日历上的所有日期，所以将其修复覆盖所有日期；
     * @param  {[type]} start [description]
     * @param  {[type]} end   [description]
     * @return {[type]}       [description]
     */
    function fixDate(start, end) {
        var me = this;

        var startObj = getDateObj(start),
        // startObj_weekday = fixWeek(startObj.getDay()),
            startObj_weekday = startObj.getDay(),

            endObj = getDateObj(end),
        // endObj_weekday = fixWeek(endObj.getDay());
            endObj_weekday = endObj.getDay();

        // return [start-(startObj_weekday-1)*ONE_DAY, end+(8-endObj_weekday)*ONE_DAY];
        return [start-startObj_weekday*ONE_DAY, end+(7-endObj_weekday)*ONE_DAY];
    }
    // /**
    //  * 根据年份获取option包裹的年份列表;
    //  * @param  {[type]} year [description]
    //  * @return {[type]}      [description]
    //  */
    // function getOptionByYear(year) {
    //     year = year || today.year;
    //     var year_str = '', year_str1 = '', year_str2 = '';

    //     for (var i = 1; i<5; i++) {
    //         year_str1  = '<option>' + (year-i) + '</option>' + year_str1;
    //         year_str2 += '<option>' + (year+i) + '</option>';
    //     }
    //     year_str = year_str1 + '<option selected>' + year + '</option>' + year_str2;
    //     return year_str;
    // }
    // /**
    //  * 根据年份获取option包裹的年份列表;
    //  * @param  {[type]} month [description]
    //  * @return {[type]}       [description]
    //  */
    // function getOptionByMonth(month) {
    //     month = month || today.month;
    //     var 
    //         month_str = '',
    //         i = 12;
    //     while(i--){
    //         month_str = '<option'+((i+1)===month ? ' selected' : '')+'>' + (i+1) + '</option>' + month_str;
    //     }
    //     return month_str;
    // }
    function getMonthStr(month, pos) {
        pos = pos || 6;
        month = intPasre(month);
        var i = 12,
            ret_str = '',
            cur_month = month;
        month = month < pos ? (12-pos+month+1) : (month-pos+1);

        while(i--) {
            month = month===13 ? 1 : month;
            ret_str += '<li style="float:left;display:block;"'+(cur_month===month ? 'class="cur"' : '')+'>'
                + month
                + '</li>';
            month++
        }
        return ret_str;
    }
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
    // 获取今天日期;
    var
        dateObj = typeof NOWTIMESTAMP !== 'undefined' && NOWTIMESTAMP ? new Date(NOWTIMESTAMP*1000) : new Date(),
        today = {
            dateObj: dateObj,
            year : dateObj.getFullYear(),
            month: dateObj.getMonth()+1,
            day  : dateObj.getDate(),
            // week : fixWeek(dateObj.getDay())
            week : dateObj.getDay()
        };
    today.timestamp = dateParse(today.month + '/' + today.day + '/' + today.year);

    // 验证时间的正则表达式;
    var REG_TIME = /^([01]?[\d]|2[0123]):[012345]?[\d]$/;
    // var REG_TIME = /^(am|pm):(0?[\d]|1[012]):[012345]?[\d]$/,
    REG_YEAR = /^[1-9]\d{0,3}$/;

    var ONE_HALF_HOUR = 1800000,   // 半小时
        ONE_DAY = 86400000,        // 一天
        WEEK = ['日', '一', '二', '三', '四', '五', '六'];

    var $body = $('body'),
        $window = $(window);

    function DateSelector(options) {
        options = options || {};
        var
            me = this,
            defaults = {
                wrap: '.yy-time-select',
                time_range: ONE_HALF_HOUR,
                zindex: 99999,
                monthPos: 6,
                onConfirm: function($dateWrap, $wrap){return true;}
            },
            start_date = '.start',
            end_date   = '.end',
            date = '.date', // 日期
            week = '.week', // 星期
            time = '.time'; // 时刻
        options = me.options = $.extend(defaults, options);

        var
            $wrap = me.$wrap = $(options.wrap),         // 日期选择器的包含容器
            $start_date = me.$start_date = $(start_date, $wrap);  // 开始日期
        $start_date_date = me.$start_date_date = $(date, $start_date),
            $start_date_week = me.$start_date_week = $(week, $start_date),
            $start_date_time = me.$start_date_time = $(time, $start_date),
            $end_date = me.$end_date = $(end_date, $wrap),    // 结束日期
            $end_date_date = me.$end_date_date = $(date, $end_date),
            $end_date_week = me.$end_date_week = $(week, $end_date),
            $end_date_time = me.$end_date_time = $(time, $end_date);

        // 在相应的函数中将其初始化;
        // me.date;
        // me.year;
        // me.month;
        // me.date_arr;
        var fn = DateSelector.prototype;
        if (typeof me.eventBind !== 'function') {
            /**
             * 获取日历头部html;
             * @return {[type]} [description]
             */
            fn.getHeader = function(){
                var me = this,
                    ret = '',
                    year  = me.year,
                    month = me.month,
                    monthPos = me.options.monthPos;
                var li_width = 38;
                var month_str = getMonthStr(month, monthPos);

                ret = '<header class="dataHeader"><a class="leftP fl yy-prev-year" title="去年" href="#"></a><div class="yearBox fl">'+
                    '<input type="text" value="'+year+'" class="ySel fl year"><label class="fl">年</label><input type="button" class="fl yearSel_but yy-year-enter">'+
                    '<div class="month-wrap"><ul class="fl month" style="position:absolute;top:0px;left:0px;">' + month_str + '</ul><span class="cur_time yy-cur-month" style="left:'+(li_width*(monthPos-1))+'px"></span></div><label class="fl">月</label></div><a class="rightP fr yy-next-year" title="明年" href="#"></a></header>';
                return ret;
            };
            /**
             * 获取星期那一行的html;
             * @return {[type]} [description]
             */
            fn.getWeekStr = function() {
                var me = this;
                var ret = '',
                    week = me.week;
                ret = '<header class="clearfix dataTitle"><ul class="weekList fl">';
                $.each(WEEK, function(i, n){
                    ret += '<li'+(week === i ? ' class="titleCur"' : '')+'>'+n+'</li>';
                });

                var date_str = me.$save_wrap === me.$start_date ?
                    '结束时间：' + $end_date_date.val() + ' '  + $end_date_time.val() :
                    '开始时间：' + $start_date_date.val() + ' ' + $start_date_time.val();
                var time_str = me.time_str;
                ret += '</ul><ul class="timeTList fl">'
                    +  '<li>' + date_str + '</li><li class="titleCur">' + time_str + '</li>'
                    +  '</ul></header>';

                return ret;
            };
            /**
             * 获取日历主体内容;
             * @return {[type]} [description]
             */
            fn.getDateBody = function(){
                var me = this,
                    day = me.day;

                // 设置日期数组;
                me.setDateArr();

                var date_arr = me.date_arr,
                    str_arr = [];
                var flag_enddate = me.$save_wrap === me.$end_date,
                    flag_alldisabled = false;
                // 选择结束时间;
                if (flag_enddate) {
                    var start_date = (me.$start_date_date.val()).split('-'),
                        start_year  = intPasre(start_date[0]),
                        start_month = intPasre(start_date[1]),
                        start_day   = intPasre(start_date[2]);
                    var year  = me.year,
                        month = me.month;
                    var same_year  = year===start_year,
                        same_month = same_year && month === start_month;
                    flag_alldisabled = year < start_year
                        ? true
                        : (same_year
                        ? (month < start_month ? true : false)
                        : false);
                }
                me.flag_alldisabled = flag_alldisabled;

                var k = 0, t = 0, t_abs = 0, class_str = '', disabled_str = '', selected_str = '';
                for(var i = 0, len = date_arr.length; i < len; i++){
                    k = (k === 7) ? 0 : k;
                    t = date_arr[i]; // 日历数组项的值（非当前月份为负）;
                    t_abs = Math.abs(t); // 日历数组项的 绝对值;
                    disabled_str = flag_enddate
                        ? (flag_alldisabled
                        ? ' disabled'
                        : (same_month
                        ? ((t < start_day)&&(t < 0 ? t_abs > 20 : true) ? ' disabled' : '')
                        : ''))
                        : '';
                    selected_str = !disabled_str && day===t && me.day_select? ' dataCur' : '';
                    str_arr[i] = (k === 0 ? '<ul>' : '')
                        + '<li class="' + (t > 0 ? '' : 'c6')
                        + selected_str
                        + (k === 0 || k === 6 ? ' weekend' : '')
                        + disabled_str
                        + /*(today_flag && today_day === t ? ' redBor">' : '">')*/'">' + t_abs + '</li>' //(t>0 ? t_abs : '')
                        + (k === 6 ? '</ul>' : '');
                    k++;
                }

                // me.unlockDaySelect();

                return str_arr.join('');
            };
            /**
             * 根据传入的月份的起止时间，以及相应的月份修复起止时间，来获取对应的日历数组;
             * @return {[type]}             [description]
             */
            fn.setDateArr = function(){
                var me = this;

                var date  = me.date,
                    start = date[0],
                    end   = date[1];
                var fixed = fixDate(start, end),
                    fixed_start = fixed[0],
                    fixed_end   = fixed[1];

                var lastDay = getDateObj(end-ONE_DAY),
                    lastDay_day  = lastDay.getDate(), // 月份最后一天的数值
                    before_count = (start-fixed_start)/ONE_DAY,  // 前补充天数
                    after_count  = (fixed_end-end)/ONE_DAY;      // 后补充天数

                var date_arr = me.date_arr = [];

                var is_short = (lastDay_day+before_count+after_count) < 42 // 日历占位是否小于42个;
                    ? true
                    : false;

                var i = 0;
                // 需要补充上个月的日期;
                if (before_count){
                    var fixedStartObj = getDateObj(fixed_start),
                        fixedStartObj_day = fixedStartObj.getDate();
                    while(before_count--){
                        date_arr[i++] = - fixedStartObj_day++;
                    }
                }
                // 当月日期;
                for(var a = 1; a <= lastDay_day; a++){
                    date_arr[i++] = a;
                }
                // 需要补充下个月的日期;
                if (after_count){
                    for(var b = 1; b <= after_count; b++){
                        date_arr[i++] = - b;
                    }
                }
                // 如果长度短于默认的 42 ，那么将其不全;
                if (is_short) {
                    for (; i < 42; i++) {
                        date_arr[i] = - b++;
                    }
                }
            };
            /**
             * 设置小日历的起止时间;
             *         me.date;
             *         me.year;
             *         me.month;
             * @param {[type]} timestamp [description]
             */
            fn.setDate = function(timestamp){
                var me = this;

                var date = typeof me.date !== 'undefined' ? me.date : [0,0];

                // 设置 年-月-日-周
                // if(timestamp < date[0] || timestamp >= date[1]){
                var dateObj = getDateObj(timestamp);

                me.dateObj = dateObj; //cache日期对象，以备其他处使用
                me.year  = dateObj.getFullYear(); // 年
                me.month = dateObj.getMonth()+1;  //实际月份;
                me.day   = dateObj.getDate();     // 日
                me.week  = dateObj.getDay();      // 周
                // }
                // else {
                //     me.dateObj = today.dateObj;
                //     me.year  = today.year;
                //     me.month = today.month;
                //     me.day   = today.day;
                //     me.week  = today.week;
                // }
                var month = me.month,
                    year  = me.year,
                    next_month = month+1,
                    next_month_year = year;
                if (next_month === 13) {
                    next_month = 1;
                    next_month_year += 1;
                }
                date[0] = dateParse(month + '/1/' + year);
                date[1] = dateParse(next_month + '/1/' + next_month_year);
                me.date = date;
            };
            /**
             * 获取时刻主体内容;
             * @return {[type]} [description]
             */
            fn.getTimeBody = function() {
                var me = this,
                    fix2Length = util.fix2Length,
                    ret = '';
                var
                    time_arr = me.time_str.split(':'),
                    hour = intPasre(time_arr[0]),
                    min  = intPasre(time_arr[1]),
                    is_moreHalf = min < 30 ? false : true;
                var flag_alltimedisabled = false,
                    flag_alldisabled = me.flag_alldisabled;
                if (me.$save_wrap === me.$end_date) {
                    var start_date = (me.$start_date_date.val()).split('-'),
                        start_year  = intPasre(start_date[0]),
                        start_month = intPasre(start_date[1]),
                        start_day   = intPasre(start_date[2]),
                        start_time  = (me.$start_date_time.val()).split(':'),
                        start_hour  = intPasre(start_time[0]),
                        start_min   = intPasre(start_time[1]);
                    var year  = me.year,
                        month = me.month,
                        day   = me.day;
                    // 同年同月;
                    var same_month = start_year===year && start_month===month,
                        same_day   = same_month && day===start_day;
                    flag_alltimedisabled = flag_alldisabled
                        ? true
                        : (same_month
                        ? (day < start_day ? true : false)
                        : false);
                }
                var t = 0, disabled = false;
                for(var i=0; i<24; i++) {
                    if (i===0) {
                        ret += '<ul>';
                    } else {
                        ret += i%6===0 ? '</ul><ul>' : '';
                    }
                    t = fix2Length(i);

                    disabled = flag_alltimedisabled
                        ? true
                        : (same_day
                        ? (start_hour>i
                        ? true
                        : (start_hour===i ? true : false))
                        : false);
                    disabled_half = flag_alltimedisabled || (disabled&&(start_hour===i ? !(start_min<30) : true));
                    ret += '<li class="'
                        + (disabled ? 'disabled' : '')
                        + (i===hour&&!is_moreHalf&&!disabled ? 'dataCur' : '')
                        + '">'+t+':00</li><li class="'
                        + (disabled_half ? 'disabled' : '')
                        + (i===hour&&is_moreHalf&&!disabled_half ? 'dataCur' : '')
                        + '">'+t+':30</li>';
                    if(i===23) {
                        ret += '</ul>';
                    }
                }
                return ret;
            };
            /**
             * 输出显示日期时间选择框;
             * @return {[type]} [description]
             */
            fn.render = function(callback) {
                var me = this;

                var date_wrap_str = '<div class="dataWrap date-wrap">'
                    + me.getHeader()
                    + '<div class="dataCont">'
                    + me.getWeekStr()
                    + '<div class="clearfix dataList">'
                    + '<div class="dataLeft fl">' + me.getDateBody() + '</div>'
                    + '<div class="timRight fl">' + me.getTimeBody() + '</div>'
                    + '<div class="dataBtBox"><span class="warn"></span><a class="blueBt confirm" href="#">确定</a><a class="grayBt cancel" href="#">取消</a></div>'
                    +'</div></div></div>';
                var $dateWrap = me.$dateWrap = $(date_wrap_str);
                $dateWrap.appendTo($body);
                me.render_flag = true;

                me.setPanelPos($dateWrap);
                me.createOverlay();
                typeof callback === 'function' && callback(me);
            };
            /**
             * 设置时间选择面板的位置;
             * @param {[type]} $obj [description]
             */
            fn.setPanelPos = function($obj) {
                var me = this;

                var w_height = $obj.height(),
                    w_width  = $obj.width();
                var height = $window.height(),
                    width  = $window.width();
                $obj.css({
                    'z-index': me.options.zindex,
                    'position': 'fixed',
                    'top': (height-w_height)/2,
                    'left': (width-w_width)/2
                });
            };
            /**
             * 创建遮罩层;
             * @return {[type]} [description]
             */
            fn.createOverlay = function() {
                var me = this;
                var $overlay = me.$overlay = $('<div style="display:block;opacity:0.2;filter:alpha(opacity=20);background:#666;position:fixed;left:0px;top:0px;height:100%;width:100%;z-index:'+(me.options.zindex-1)+';"></div>');
                $body.append($overlay);
            };
            /**
             * 销毁遮罩层;
             * @return {[type]} [description]
             */
            fn.destroyOverlay = function() {
                var me = this;
                me.$overlay.remove();
            };
            fn.renderDateBody = function() {
                var me = this;

                var
                    $dateWrap = me.$dateWrap,
                    date_body_str = me.getDateBody();

                $('.dataLeft', $dateWrap).html(date_body_str);
            };
            fn.renderTimeBody = function() {
                var me = this;

                var
                    $dateWrap = me.$dateWrap,
                    time_body_str = me.getTimeBody();

                $('.timRight', $dateWrap).html(time_body_str);
            };
            // fn.setYearMonth = function() {
            //     var me = this,
            //         year = me.year,
            //         month = me.month,
            //         $dateWrap = me.$dateWrap;

            //     var year_str  = getOptionByYear(year),
            //         month_str = getOptionByMonth(month);

            //     $('.year', $dateWrap).html(year_str);
            //     $('.month', $dateWrap).html(month_str);
            // };
            /**
             * 根据传入的时间戳，重载日历;
             * @param  {[type]} timestamp [description]
             * @return {[type]}           [description]
             */
            fn.reloadCalendar = function(timestamp) {
                var me = this;

                me.setDate(timestamp);  // 根据时间戳，设置日期范围
                // me.setYearMonth();      // 设置年月
                me.renderDateBody();    // 设置日历主体部分
                me.renderTimeBody();    // 设置日历时刻部分
                if (me.$save_wrap === me.$start_date) {
                    me.setEndDateStr();
                }
            };
            fn.prevYear = function() {
                var me = this;

                me.changeYear(me.year-1);
            };
            fn.nextYear = function() {
                var me = this;

                me.changeYear(me.year+1);
            };
            fn.changeMonth = function($month) {
                var me = this,
                    month = intPasre($month.text()),
                    width = $month.width(),
                    index = $month.index(),
                    $ul  = $month.parent().addClass('lock'),
                    $li  = $ul.children(),
                    $cur = $li.filter('.cur'),
                    cur_month = intPasre($cur.text()),
                    num = index - $cur.index(),
                    $dateWrap = me.$dateWrap,
                    str = '', left = 0;
                var $year = $('.year', $dateWrap),
                    year = intPasre($year.val());
                // 向前切换月份
                if (num>0) {
                    var last_month = intPasre($li.last().text())+1;
                    left = -num*width;
                    while(num--) {
                        str += '<li style="float:left;display:block;width:25px;height:25px;">'+(last_month === 13 ? (last_month = 1) : last_month)+'</li>';
                        last_month++;
                    }
                    $ul.append(str);
                    month<cur_month && year++; // 切换到明年;
                } else {
                    // 向后切换月份
                    var first_month = intPasre($li.first().text())-1;
                    left = num*width;
                    num = Math.abs(num);
                    while(num--) {
                        str = '<li style="float:left;display:block;width:25px;height:25px;">'+(first_month === 0 ? (first_month = 12) : first_month)+'</li>' + str;
                        first_month--;
                    }
                    $ul.prepend(str).css({
                        'left': left
                    });
                    left = 0;
                    month>cur_month && year--; // 切换到之前一年;
                }

                $ul.animate({'left':left}, function(){
                    var $me = $(this);
                    var month_str = getMonthStr(month, me.options.monthPos);
                    $me.html(month_str).css({
                        'left':0
                    }).removeClass('lock');
                });

                $year.val(year);

                // 修复切换月份的时候
                var lastDay_obj = month===12
                        ? (new Date(dateParse('1/1/'+(year+1))-ONE_DAY))
                        : (new Date(dateParse((month+1)+'/1/'+year)-ONE_DAY)),
                    lastDay_day = lastDay_obj.getDate(),
                    day = me.day;
                me.day = day > lastDay_day ? lastDay_day : day;

                me.reloadCalendar(dateParse(month+'/'+me.day+'/'+year));
            };
            fn.changeYear = function(year) {
                var me = this;

                $('.year', me.$dateWrap).val(year);

                var month = me.month,
                    day   = me.day;
                // 修复切换月份的时候
                var lastDay_obj = month===12
                        ? (new Date(dateParse('1/1/'+(year+1))-ONE_DAY))
                        : (new Date(dateParse((month+1)+'/1/'+year)-ONE_DAY)),
                    lastDay_day = lastDay_obj.getDate();
                me.day = day > lastDay_day ? lastDay_day : day;

                me.reloadCalendar(dateParse(me.month+'/'+me.day+'/'+year));
            };
            fn.lockDaySelect = function() {
                var me = this;

                me.day_select = true;
            };
            fn.unlockDaySelect = function() {
                var me = this;

                typeof me.day_select !== 'undefined' && delete me.day_select;
            };
            /**
             * 根据日期和时刻，获取时间戳;
             * @param  {[type]} date_str [description]
             * @param  {[type]} time_str [description]
             * @return {[type]}          [description]
             */
            fn.getTimestamp = function(date_str, time_str) {
                var date = date_str.split('-'),
                    time = time_str;
                time = time ? (time + ':00').split(':') : ('00:00:00').split(':');

                return (new Date(date[0], date[1]-1, date[2], time[0], time[1], time[2])).getTime();
            };
            /**
             * 获取起始时刻的时间戳;
             * @return {[type]} [description]
             */
            fn.getStartTimestamp = function() {
                var me = this;
                // 起始 日期 和 时间
                return me.getTimestamp(me.$start_date_date.val(), me.$start_date_time.val());
            };
            /**
             * 获取结束时刻的时间戳;
             * @return {[type]} [description]
             */
            fn.getEndTimestamp = function() {
                var me = this,
                    $end_date_date = me.$end_date_date,
                    $end_date_time = me.$end_date_time;
                // 结束 日期 和 时间
                return me.getTimestamp($end_date_date.val(), $end_date_time.val());
            };
            /**
             * 缓存起始时间和结束时间的时间差，以时间戳的形式存储;
             * @return {timestamp} 返回设置后的时间戳;
             */
            fn.setTimeRange = function() {
                var me = this;

                var start = me.getStartTimestamp(),
                    end   = me.getEndTimestamp();

                me.time_range = end-start;

                return me.time_range;
            };
            /**
             * 获取缓存的时间差;
             * @return {[type]} [description]
             */
            fn.getTimeRage = function() {
                var me = this;

                return me.time_range || me.options.time_range;
            }
            /**
             * 根据设定的时间范围，更新结束日期;
             * @return {[type]} [description]
             */
            fn.updateEndDateByTimeRange = function() {
                var me = this;

                var start_timestamp = me.getStartTimestamp(),
                    end_timestamp   = start_timestamp+me.getTimeRage();
                var data = me.formatDate(end_timestamp);
                // 根据结束时间戳，设置结束时间;
                me.saveEndDate(data);
            };
            /**
             * 根据Unix时间戳（毫米级的时间戳），获取日期
             * @param  {[type]} timestamp [description]
             * @return {[type]}           [description]
             */
            fn.formatDate = function(timestamp) {
                var fix2Length = util.fix2Length;

                var dateObj = getDateObj(timestamp),
                    hour = fix2Length(dateObj.getHours()),
                    min  = fix2Length(dateObj.getMinutes()),
                    year  = dateObj.getFullYear(),
                    month = fix2Length(dateObj.getMonth()+1),
                    day   = fix2Length(dateObj.getDate()),
                    week  = dateObj.getDay();

                return [year + '-' + month + '-' + day,
                    '星期' + WEEK[week],
                    hour + ':' + min];
            };
            /**
             * 获取选择的数据，日期-周-时刻;
             * @return {[type]} [description]
             */
            fn.getSelectedData = function() {
                var me = this,
                    fix2Length = util.fix2Length
                $dateWrap = me.$dateWrap;
                var ret = [];

                var day = me.$dataLeft.find('.dataCur').text();
                if (!day) {
                    me.$dataBtBox.find('.warn').html('您还没有选择日期，请选择！');
                    return false;
                }
                ret.push(me.year + '-' + fix2Length(me.month) + '-' + fix2Length(day));
                ret.push('星期'+WEEK[me.week]);
                ret.push(me.time_str);
                return ret;
            };
            /**
             * 保存最后选择的日期;
             * @return {[type]} [description]
             */
            fn.saveDate = function() {
                var me = this,
                    flag = true;
                var data = me.getSelectedData();

                flag = data === false ? false : flag;
                if (flag) {
                    flag = me.$save_wrap === me.$start_date
                        ? me.saveStartDate(data)    // 开始
                        : me.saveEndDate(data);     // 结束
                }

                return flag;
            };
            /**
             * 保存设置开始时间日期;
             * @param  {[type]} date [description]
             * @return {[type]}      [description]
             */
            fn.saveStartDate = function(data) {
                var me = this;

                me.$start_date_date.val(data[0]);
                me.$start_date_week.val(data[1]);
                me.saveStartDateTime(data[2]);

                me.updateEndDateByTimeRange();
                me.setTimeRange();

                return true;
            };
            fn.saveStartDateTime = function(time_str) {
                var me = this,
                    $start_date_time = me.$start_date_time;
                $start_date_time.val(time_str);

                return $start_date_time;
            };
            /**
             * 保存设置结束时间日期;
             * @param  {[type]} data [description]
             * @return {[type]}      [description]
             */
            fn.saveEndDate = function(data) {
                var me = this;

                var start   = me.getStartTimestamp(),
                    new_end = me.getTimestamp(data[0], data[2]);
                if (!(new_end>start)) {
                    me.$dataBtBox.find('.warn').html('结束时间必须大于开始时间！');
                    return false;
                }
                me.$end_date_date.val(data[0]);
                me.$end_date_week.val(data[1]);
                me.$end_date_time.val(data[2]);
                me.setTimeRange();
                return true;
            };
            /**
             * 在选择开始时间面板，设置相应的结束时间;
             */
            fn.setEndDateStr = function() {
                var me = this;

                var selected = me.getSelectedData();
                var start_timestamp = me.getTimestamp(selected[0], selected[2]),
                    end_timestamp = start_timestamp + me.getTimeRage();
                var date = me.formatDate(end_timestamp);
                me.$timeTList_li.eq(0).html('结束时间：' + date[0] + ' ' + date[2]);
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
                    hour = intPasre(time[0]);
                    min  = intPasre(time[1]);
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
             * 在日期和时刻选择框上绑定事件;
             * @return {[type]} [description]
             */
            fn.eventBind = function() {
                var me = this;

                $.each([me.$start_date_date, me.$start_date_week, me.$start_date_time], function(i, $start){
                    $start.on({
                        'focus': startDateFocus,
                        'click': startDateFocus,
                        'change': startDateChange
                    });
                });
                $.each([me.$end_date_date, me.$end_date_week, me.$end_date_time], function(i, $end){
                    $end.on({
                        'focus': endDateFocus,
                        'click': endDateFocus,
                        'change': endDateChange
                    });
                });

                function startDateFocus(e) {
                    if (me.render_flag===true) { return ;}

                    var $target = $(e.target);
                    var time_str = $target.is('.time') ?
                        $target.val() :
                        $target.siblings('.time').val();
                    me.time_str = time_str;

                    me.$save_wrap = me.$start_date;
                    me.lockDaySelect(); // 表示要激活日期的 天 选择;

                    me.setDate(dateParse(me.$start_date_date.val()));
                    me.render(me.bindDateWrapEvent);
                    me.setTimeRange(); // 设置起止时间差;
                    $target.blur();
                }
                function startDateChange(e) {
                    var $target = $(e.target);
                    if ($target.is('.time')) {
                        var flag = REG_TIME.test($target.val());
                        if (!flag) {
                            // 当输入的时刻不符合，获取跟当前时刻最接近的整点时刻;
                            var start_time = me.getFocusTime();
                            me.saveStartDateTime(start_time);
                        }
                    }
                    // 根据缓存起始时间和结束时间的时间差，更新结束日期;
                    me.updateEndDateByTimeRange();
                    // 设置起止时间差;
                    me.setTimeRange();
                }
                function endDateFocus(e) {
                    if (me.render_flag===true) { return ;}

                    var $target = $(e.target);
                    var time_str = $target.is('.time') ?
                        $target.val() :
                        $target.siblings('.time').val();
                    me.time_str = time_str;

                    me.$save_wrap = me.$end_date;
                    me.lockDaySelect(); // 表示要激活日期的 天 选择;

                    me.setDate(dateParse(me.$end_date_date.val()));
                    me.render(me.bindDateWrapEvent);
                    me.setTimeRange(); // 设置起止时间差;
                    $target.blur();
                }
                function endDateChange(e) {
                    // 设置起止时间差;
                    me.setTimeRange();
                }
            };
            fn.bindDateWrapEvent = function(me) {
                var $dateWrap = me.$dateWrap;
                // 头部月份 年份切换操作;
                var $dataHeader = me.$dataHeader = $('.dataHeader', $dateWrap);
                $dataHeader.on({
                    'click': function(e){
                        var $target = $(e.target);
                        // 上年
                        if($target.is('.yy-prev-year')){
                            me.prevYear();
                            return false;
                            // 下年
                        } else if($target.is('.yy-next-year')){
                            me.nextYear();
                            return false;
                            // 直接选择月份
                        } else if ($target.is('li')) {
                            $ul = $target.closest('.month');
                            if (!!$ul.length && !$ul.is('.locked')) {
                                me.changeMonth($target);
                            }
                        }
                    },
                    'change': function(e) {
                        var $target = $(e.target);
                        if ($target.is('.year')) {
                            var year = $target.val();

                            REG_YEAR.test(year)
                                ? me.changeYear(year)
                                : $target.val(me.year);
                        }
                    }
                });
                // 左侧日历主体;
                var $dataLeft = me.$dataLeft = $('.dataLeft', $dateWrap)//,
                $weekList_li = $('.weekList > li', $dateWrap);
                $dataLeft.on({
                    'click': function(e) {
                        var $me = $(this),
                            $target = $(e.target);

                        if ($target.is('.disabled')) {
                            return false;
                        }
                        if(!$target.is('.dataCur') && $target.is('li') && !!$target.html()) {
                            $me.find('li').removeClass('dataCur');
                            $target.addClass('dataCur');
                            var week = $target.index();
                            $weekList_li.removeClass('titleCur').eq(week).addClass('titleCur');
                            // 设置天和周;
                            me.day = intPasre($target.text());
                            me.week = week;

                            // 切换 起始日期 的时候，根据时间差，显示结束时间的更新;
                            if (me.$save_wrap === me.$start_date) {
                                me.setEndDateStr();
                            }
                            else {
                                me.renderTimeBody();
                            }
                        }
                    }
                });
                // 右侧时间块;
                var $timRight = me.$timRight = $('.timRight', $dateWrap),
                    $timeTList_li = me.$timeTList_li = $('.timeTList > li', $dateWrap);
                $timRight.on({
                    'click': function(e) {
                        var $target = $(e.target);

                        if ($target.is('.disabled')) {
                            return false;
                        }
                        if (/*!$target.is('.dataCur') && */$target.is('li')) {
                            $timRight.find('li').removeClass('dataCur');
                            $target.addClass('dataCur');
                            me.time_str = $target.text();
                            $timeTList_li.eq(1).html(me.time_str);

                            // 切换起始时刻的时候，根据时间差，显示结束时间的更新;
                            if (me.$save_wrap === me.$start_date) {
                                me.setEndDateStr();
                            }
                        }
                    }
                });
                // 按钮栏操作;
                var $dataBtBox = me.$dataBtBox = $('.dataBtBox', $dateWrap);
                $dataBtBox.on({
                    'click': function(e) {
                        var $target = $(e.target);
                        if ($target.is('.confirm')) {
                            if(typeof me.onConfirm === 'function'){
                                me.onConfirm($dateWrap, me.$wrap) && me.saveDate() && closeTimeSelectPanel();
                            } else {
                                // 保存成功，关闭时间选择面板;
                                me.saveDate() && closeTimeSelectPanel();
                            }
                        } else if ($target.is('.cancel')) {
                            closeTimeSelectPanel();
                        }
                        return false;
                    }
                });
                $window.on('resize', function(e){
                    me.setPanelPos($dateWrap);
                });
                $body.on('keypress', pressEsc);
                /**
                 * 按esc键关闭;
                 * @param e
                 */
                function pressEsc(e){
                    if (e.keyCode === 27) {
                        closeTimeSelectPanel();
                    }
                }
                /**
                 * 关闭时间选择面板，并且做一些清扫处理;
                 * @return {[type]} [description]
                 */
                function closeTimeSelectPanel() {
                    $dataHeader.off();
                    $dataLeft.off();
                    $timRight.off();
                    //$window.off('resize');
                    $body.off('keypress', pressEsc);
                    me.destroyOverlay();
                    $dateWrap.remove();
                    me.render_flag = false;
                }
            };

        }
        me.onConfirm = me.options.onConfirm;

        delete me.options.onConfirm;
        me.eventBind();
    }

    YY.DateSelector = DateSelector;
}(jQuery, YY, YY.util));

// 基本使用范例：
/*
<div class="scInput clearfix yy-time-select">
    <input class="fl" type="checkbox" id="allday" name="allday" value="1" {if (isset($schedule.allday) && $schedule.allday == 1)}checked{/if}><label class="fl" for="">全天日程</label>
    <div class="fl block start">
        <input type="text" name="start_date" class="date" readonly="readonly" value="2013-02-27">
        <input type="text" name="start_week" class="week" readonly="readonly" value="星期五">
        <input type="text" name="start_time" class="time" value="09:20">
    </div>
    <span class="fl scUntil">至</span>
    <div class="fl block end">
        <input type="text" name="end_date" class="date" readonly="readonly" value="2013-02-27">
        <input type="text" name="end_week" class="week" readonly="readonly" value="星期六">
        <input type="text" name="end_time" class="time" value="10:20">
    </div>
</div>
 */
// $(function(){
//     util.loadScript(['yonyou/widgets/dateSelector/dateSelector.js'], {
//         fn: function(){
//             new YY.DateSelector({
//                 wrap : '.yy-time-select'
//             });
//         }
//     });
// });