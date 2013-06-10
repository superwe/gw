/**
 * YonYou.date
 * YonYou命名空间下的日期和时间处理工具集;
 *
 * @required  YonYou, YonYou.util
 * @author qiutao qiutao@chanjet.com
 * @version 20130516
 */
(function($, YY, util){
    /**
     * 修复为2个字符长度，长度不足以前置0补齐;
     * @param str
     * @returns {string}
     */
    function fix2Length(str) {
        str = str.toString();
        return str.length < 2 ? '0' + str : str;
    }

    var
        HALFHOUR = 1800,    // 半小时
        ONEHOUR = 3600,     // 一小时
        DAY = 86400,        // 一天
        WEEKNANE = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];

    var date = {
        HALFHOUR : HALFHOUR,    // 半小时
        ONEHOUR : ONEHOUR,
        DAY : DAY,        // 一天
        WEEKNANE : WEEKNANE,
        /**
         * 格式化日期输出(string字符串格式日期)
         * @param timestamp Unix时间戳
         * @param type      选择格式化的类型
         * @returns string
         */
        format: function(timestamp, type){
            if(!timestamp) return false;
            var me = this,
                ret = [];

            timestamp = typeof timestamp!=='object' ? [timestamp] : timestamp;
            type = util.intParse(type) || 1;
            var dateformat = '';
            switch(type){
                case 1:
                    dateformat = '{year}年{month}月{day}日';
                    break;
                case 2:
                    dateformat = '{year}-{month}-{day}';
                    break;
                case 3:
                    dateformat = '{year}年{month}月{day}日({week})';
                    break;
                case 4:
                    dateformat = '{year}年{month}月';
                    break;
                case 5:
                    dateformat = '{year}年{month}月{day}日 {hour}:{min}';
                    break;
                case 6:
                    dateformat = '{year}-{month}-{day}日 {hour}:{min}';
                    break;
                default :
                    break;
            }
            var fix2 = fix2Length,
                weekname = me.WEEKNANE;
            for(var i=0,len=timestamp.length; i<len; i++){
                var dateObj = me.getDateObj(timestamp[i]);
                ret[i] = dateformat.replace('{year}', dateObj.getFullYear())
                    .replace('{month}', fix2(dateObj.getMonth()+1))
                    .replace('{day}', fix2(dateObj.getDate()))
                    .replace('{week}', weekname[dateObj.getDay()])
                    .replace('{hour}', fix2(dateObj.getHours()))
                    .replace('{min}', fix2(dateObj.getMinutes()));
            }
            return ret.length===1 ? ret[0] : ret;
        },
        /**
         * 格式化日期输出(object 以json格式输出date、week、time 分钟取大于当前时间，最近的整点或半点)
         * @param timestamp Unix时间戳
         * @param type      选择格式化的类型
         * @returns object
         */
        formatDateWeekTime: function(timestamp, type){
            if(!timestamp) return false;

            timestamp = typeof timestamp!=='object' ? [timestamp] : timestamp;
            type = type || 1;
            var me = this;

            switch(type){
                case 1:
                    dateformat = '{year}-{month}-{day}|{week}|{hour}:{minute}';
                    break;
                case 2:
                    dateformat = '{year}年{month}月{day}日|{week}|{hour}点{minute}分';
                    break;
            }
            var fix2 = fix2Length,
                weekname = me.WEEKNANE,
                ret = [];
            for(var i=0,len=timestamp.length; i<len; i++){
                var dateObj = me.getDateObj(timestamp[i]),
                    hour   = dateObj.getHours(),
                    minute = dateObj.getMinutes();
                if (minute>30) {
                    hour++;
                    minute = '00';
                } else {
                    minute = minute ? '30' : '00';
                }
                var temp = dateformat.replace('{year}', dateObj.getFullYear())
                    .replace('{month}',  fix2(dateObj.getMonth()+1))
                    .replace('{day}',    fix2(dateObj.getDate()))
                    .replace('{week}',   weekname[dateObj.getDay()])
                    .replace('{hour}',   fix2(hour))
                    .replace('{minute}', minute);

                temp = temp.split('|');
                ret[i] = {'date':temp[0], 'week':temp[1], 'time':temp[2]};
            }
            return ret.length===1 ? ret[0] : ret;
        },
        /**
         * 获取指定Unix时间戳的日期对象；
         * @param timestamp不为空的时候，获取指定Unix时间戳的日期对象，否则获取当前的日期对象；
         */
        getDateObj: function(timestamp){
            return timestamp ? new Date(timestamp*1000) : new Date();
        },
        /**
         * 获取今天相关的日期信息，包括年、月、日、周
         * @returns {{}}
         */
        getToday: function(){
            var me = this,
                ret = {},
                dateObj = me.getDateObj(),
                now_year  = dateObj.getFullYear(),
                now_month = dateObj.getMonth()+1, // 实际月份；
                now_day   = dateObj.getDate(),
                now_theweek = dateObj.getDay();
            // 设置今天的年、月、日、星期 以及 当天凌晨的Unix时间戳 和 日期对象的引用;
            ret.year  = now_year;
            ret.month = now_month;
            ret.day   = now_day;
            ret.week  = now_theweek ? now_theweek : 7;
            ret.week_name = WEEKNANE[now_theweek];
            ret.timestamp = Date.parse(now_month+'/'+now_day+'/'+now_year)/1000;
            ret.ref = dateObj;

            return ret;
        },
        /**
         * 格式化日期输出（相对于当前时间）
         * @param timestamp   Unix时间戳
         * @returns {string}
         */
        format2: function(timestamp){
            var ret = '',
                me = this;
            if (timestamp.indexOf(' ')!==-1) {
                timestamp = util.intParse(Date.parse(timestamp.replace('-', '/'))/1000);
            }
            timestamp = util.intParse(timestamp);
            if (timestamp){
                var cur_timestamp = util.intParse(me.getDateObj().getTime()/1000),
                    range_time = cur_timestamp - timestamp;
                if (range_time>me.DAY){
                    ret = me.format(timestamp, 6);
                } else if (range_time>me.ONEHOUR){
                    ret = util.intParse(range_time/me.ONEHOUR)+'小时前';
                } else if (range_time>60){
                    ret = util.intParse(range_time/60)+'分钟前';
                } else if (range_time>0){
                    ret = range_time+'秒前';
                } else {
                    ret = '现在';
                }
            }
            return ret;
        }

    }
    YY.date = date;
    date = null;
}(jQuery, YonYou, YonYou.util));