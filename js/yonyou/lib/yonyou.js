/**
 * YonYou命名空间入口;
 */
(function(global, document){
    // 'use strict';
    var
        // 定义的一些常量;
        DIR     = global.YY_JS_DIR || 'js', // js所在的根目录
        VERSION = global.YY_VERSION || '',  // 当前js的统一版本号;
        DEBUG   = global.YY_DEBUG_MODE || 0,// 是否debug模式，值可为1和0;（1表示调试模式，0表示线上生产环境模式;）
        W3C     = document.dispatchEvent,   // IE9开始支持W3C的事件模型与getComputedStyle取样式值
        URI     = global.YY_BASE_URI || 'http://' + location.host + '/',// 网站的基本uri
        CDN_URI = global.YY_CDN_URI || 'http://cdn.qiater.com/', // 网站CDN的uri
        RESOURCE_URI = global.RESOURCE_URI || 'http://static.yonyou.com/qz/', // 网站资源URI
        FEEDCOMB = false;   // 是否启用和并版的动态模版

    var YonYou  = {};
    YonYou.DIR          = DIR;
    YonYou.VERSION      = VERSION;
    YonYou.DEBUG        = DEBUG;
    YonYou.W3C          = W3C;
    YonYou.URI          = URI;
    YonYou.CDN_URI      = CDN_URI;
    YonYou.RESOURCE_URI = RESOURCE_URI
    YonYou.FEEDCOMB     = FEEDCOMB;

    var 
        // JS基础加载器;
        JSLoader = function(){
            var scripts = {}; // scripts['a.js'] = {loaded:false,funs:[]}
            /**
             * 根据URL，获取已经加在的js状态信息缓存，如果没有加载，则加载;
             * @param  {[type]} url [description]
             * @return {[type]}     [description]
             */
            function getScript(url){
                var script = scripts[url];
                if (!script){
                    script = {loaded:false, funs:[]};
                    scripts[url] = script;
                    add(script, url);
                }
                return script;
            }
            /**
             * 运行script中的函数队列;
             * @param  {[type]} script [description]
             * @return {[type]}        [description]
             */
            function run(script){
                var funs = script.funs,
                    len = funs.length,
                    i = 0;
                
                for (; i<len; i++){
                    var fun = funs.pop();
                    fun();
                }
            }
            /**
             * 将scriptdom添加到body中;
             * @param {[type]} script [description]
             * @param {[type]} url    [description]
             */
            function add(script, url){
                var scriptdom = document.createElement('script');
                scriptdom.type = 'text/javascript';
                scriptdom.loaded = false;
                scriptdom.src = url;
                
                scriptdom.onload = function(){
                    scriptdom.loaded = true;
                    run(script);
                    script.loaded = true;
                    scriptdom.onload = scriptdom.onreadystatechange = null;
                };
                
                //for ie
                scriptdom.onreadystatechange = function(){
                    if ((scriptdom.readyState === 'loaded' || 
                            scriptdom.readyState === 'complete') && !scriptdom.loaded) {
                        script.loaded = true;
                        run(script);
                        scriptdom.onload = scriptdom.onreadystatechange = null;
                    }
                };
                document.getElementsByTagName('body')[0].appendChild(scriptdom);        
            }
            
            return {
                load: function(url){
                    var arg = arguments,
                        script = getScript(url),
                        // 加载状态;
                        loaded = script.loaded;
                    for (var i = 1, len = arg.length; i<len; i++){
                        var fun = arg[i];
                        if (typeof fun === 'function'){
                            if (loaded)
                                fun();
                            else {
                                script.funs.push(fun);
                            }
                        }
                    }
                }
            };
        }(),
        /**
         * 加载脚本,可根据 options 中的 async 参数判断是异步还是阻塞式加载；
         * @param arr
         * @param JSLoader 加载器；
         * @param options 可选参数 async 和 fn ，
         *      async 默认为false//如果为true异步加载，否则阻塞式加载；
         *      fn    默认为null//回调函数，目前只在阻塞式加载中有效；
         */
        loadScript = function(arr, options) {
            JSLoader = JSLoader || 'undefined';
            var dir     = DIR,
                version = VERSION;

            arr = typeof arr === 'string' ? [arr] : arr;

            if(typeof JSLoader === 'undefined' 
                    || typeof arr !== 'object' || !arr.length) return;

            options = options || {};
            options.async = typeof options.async !== 'undefined' ? options.async : false;// true为异步加载，false为阻塞加载；默认为false；
            options.fn    = typeof options.fn === 'function' ? options.fn : null;// 加载完所有必须的js后执行的回调函数；
            
            var script = arr,// 传入的数组对象，保存着要加载的js串；
                scriptLen = script.length,
                script_url = '';
            // 异步加载；
            if(options.async) {
                for(var i = scriptLen - 1; i>=0; i--) {
                    script_url = script[i];
                    if(script_url.indexOf('http://')===-1 
                            && script_url.indexOf('https://')===-1) {
                        script_url = dir+'/'+script_url;
                    }
                    script[i] = url(script_url);
                    JSLoader.load(script[i]+version);
                }
            }
            // 阻塞式加载；
            else {
                (function(){
                    var first = '',
                        arg = arguments;
                    if (scriptLen--) {
                        script_url = script.shift();
                        if(script_url.indexOf('http://')===-1 
                                && script_url.indexOf('https://')===-1) {
                            script_url = dir+'/'+script_url;
                        }
                        first = url(script_url);
                        JSLoader.load(first+version,function(){
                            arg.callee();
                        });
                    }
                    else {
                        typeof options.fn === 'function' && options.fn();
                    }
                })();
            }
        };

    /**
     * 加载脚本,可根据options中的async参数判断是异步还是阻塞式加载；
     * @param arr
     * @param options 可选参数 async 和 fn，
     *      async //如果为true异步加载，否则阻塞式加载；
     *      fn //回调函数，目前只在阻塞式加载中有效；
     * NOTE:去除在loadScript中参数的传入;
     */
    YonYou.loadScript = function(arr, options) {
        // 存在全局的loadScript方法；
        typeof loadScript === 'function' 
            && loadScript(arr, options);
        return;
    };
    YonYou.url = url;
    /**
     * url处理函数;
     * @param  {[type]} str [description]
     * @return {[type]}     [description]
     */
    function url(str) {
        var url = str;
        if(typeof url !== 'string') return false;
        // 已经是完整URL;
        if(url.indexOf('http://')!==-1 
                || url.indexOf('https://')!==-1) {
            return url;
        }

        if(url.charAt(0)==='/'){// 去除最左侧的斜线
            url = url.substring(1);
        }
        var pos = url.lastIndexOf('.'); // url中点号(.)的位置;
        if(pos===-1){
            url = URI+url;
        } else {
            var suffix = url.substring(pos+1);
            if (suffix==='html') {
                url = URI+url;
            } else {
                var first_nine = url.substring(0,9);
                url = first_nine==='js/yonyou' || first_nine==='js/swfupl'
                    ? URI+url       // 前边6个字符为'yonyou',就用基础URL
                    : CDN_URI+url;  // 否则使用CDN的URL
            }
        }

        return url;
    }

    // 动态 和 通知的模版命名空间；
    YonYou.feedTemplate = {};
    YonYou.noticeTemplate = {};

    // 创建全局命名空间 YonYou 和 YY ;
    global.YonYou = YonYou;
    global.YY     = YonYou;
})(window, window.document);

/**
 * YonYou.util
 * YonYou命名空间下的工具集;
 *
 * @required YonYou
 * @author qiutao qiutao@chanjet.com
 * @version 20130421
 */
(function($, YY){
    YY = YY || {};

    var
        DIR   = YY.DIR || 'js',
        DEBUG = YY.DEBUG || 0;

    isIE  = !-[1,];
    isIE6 = !!(isIE && !window.XMLHttpRequest);
    //工具集；
    YY.util = {
        /**
         * debug标识符，1为debug,应用在开发环境中，0为release，应用在线上生产环境中;
         */
        debug: DEBUG,
        /**
         * js目录;
         * @type {[string]}
         */
        jsDir: DIR,
        /**
         * 安全的console.log方法；
         */
        trace: function(param){
            if(window.console&&window.console.log) {
                console.log(param);
            }
        },
        /**
         * js文件中统一使用的url函数，用来url全路径；
         *      可以引入任何资源类文件，以及组装各处的ajax请求的URL；
         *      替代了window.yyBaseurl和window.yyurl的功能；
         * @param str
         * @return s
         */
        url: YY.url,
        /**
         * ajax调用接口--基于jquery；
         * 可包含必填参数queryUrl，fn，以及可选参数theType，theDataType，data；
         *      默认开启ajax缓存;
         */
        ajaxApi: function (queryUrl, fn){
            if(typeof fn !== 'function') return false;

            var me = this,
                len = arguments.length,
                theType     = len > 2 ? arguments[2] : '',
                theDataType = len > 3 ? arguments[3] : '',
                data        = len > 4 ? arguments[4] : {},
                timeout     = len > 5 ? arguments[5] : 30000;
            // data['ajax'] = 1;
            var xhr =  $.ajax({
                async : true,
                type  : (theType ? theType : 'post'),
                url   : queryUrl,
                cache : true,
                timeout : timeout,
                data  : data,
                dataType : (theDataType ? theDataType : 'html').toLowerCase(),
                success  : function(data, status){
                    fn(data, status);
                },
                error : function(XMLHttpRequest, textStatus, errorThrown){
                    xhr.abort();
                    fn(textStatus, errorThrown);
                    // alert(errorThrown);
                }
            });
            return xhr;
        },
        /**
         * YY.loadScript的别名
         */
        loadScript: YY.loadScript,
        /**
         * 是否已经初始化加载上传相关的代码;
         */
        initUploaded_flag: false,
        /**
         * 初始化文件上传功能；
         */
        initUpload: function(func){
            var me = this,
                uploadScript =  ['swfupload/swfupload.js',
                    'swfupload/swfupload.queue.js',
                    'swfupload/yy.upload.handlers.js'];
            if(me.initUploaded_flag){
                typeof func === 'function' && func();
                return;
            }
            //阻塞式加载
            me.loadScript(uploadScript,{
                fn: function(){
                    me.initUploaded_flag = true;
                    typeof func === 'function' && func();
                }
            });
        },
        /**
         * 判断浏览器是否为ie;
         * @return boolean true为ie，false为非ie;
         */
        isIE: isIE,
        /**
         * 判断浏览器是否为ie6;
         * @return boolean true为ie6，false为非ie6;
         */
        isIE6: isIE6,
        /**
         * 默认按照10进制整型解析;
         * @return {[type]} [description]
         */
        intParse: function(str, radix){
            radix = radix || 10;
            return parseInt(str, radix);
        },
        /**
         *
         */
        formatCookieField: function(str){
            return 'YY' + str;
        },
        addCookie: function(objName, objValue, objHours){
            objName = this.formatCookieField(objName);
            var str = objName + "=" + escape(objValue);
            if(objHours > 0){//为0时不设定过期时间，浏览器关闭时cookie自动消失
                var date = new Date();
                var ms = objHours*3600*1000;
                date.setTime(date.getTime() + ms);
                str += "; expires=" + date.toGMTString();
            }
            document.cookie = str;
        },
        getCookie: function (objName){//获取指定名称的cookie的值
            objName = this.formatCookieField(objName);
            var arrStr = document.cookie.split("; ");
            for(var i = 0;i < arrStr.length;i ++){
                var temp = arrStr[i].split("=");
                if(temp[0] == objName) return unescape(temp[1]);
            }
        },
        delCookie: function (objName){//为了删除指定名称的cookie，可以将其过期时间设定为一个过去的时间
            objName = this.formatCookieField(objName);
            var date = new Date();
            date.setTime(date.getTime() - 10000);
            document.cookie = objName + "=a; expires=" + date.toGMTString();
        },
        strWrap: function(str){ // 将内容换行显示
            str = str.replace(/\r\n/ig,"<br/>");
            str = str.replace(/\r/ig,"<br/>");
            str = str.replace(/ /ig,"&nbsp;");
            return str;
        },
        keyEnable:function(code){
            if($.browser.mozilla&&(code==173||code==61)){
                return true;
            }
            if(!((code>=65 && code<=90)||(code>=48 && code<=57)||(code>=186 && code<=192)||(code>=219 && code<=222)||(code>=96 && code<=109)||code==32)&&code!=8){
                return false;
            }else{
                return true;
            }
        },
        selected:function savePos(textBox){
            var end = 0,
                start = 0;
            if(typeof(textBox.selectionStart) == "number"){
                start = textBox.selectionStart;
                end = textBox.selectionEnd;
            }
            else if(document.selection){
                var range = document.selection.createRange();
                if(range.parentElement().id == textBox.id){
                    var range_all = document.body.createTextRange();
                    range_all.moveToElementText(textBox);
                    for (start=0; range_all.compareEndPoints("StartToStart", range) < 0; start++)
                        range_all.moveStart('character', 1);
                    for (var i = 0; i <= start; i ++){
                        if (textBox.value.charAt(i) == '/n')
                            start++;
                    }
                    var range_all = document.body.createTextRange();
                    range_all.moveToElementText(textBox);
                    for (end = 0; range_all.compareEndPoints('StartToEnd', range) < 0; end ++)
                        range_all.moveStart('character', 1);
                    for (var i = 0; i <= end; i ++){
                        if (textBox.value.charAt(i) == '/n')
                            end ++;
                    }
                }
            }
            return {start:start,end:end};
        },
        /**
         * 设置元素文本的选择范围;
         * @param elememt
         * @param start_index 起始位置
         * @param end_index   结束位置
         */
        setSelected: function (element, start_index, end_index){
            if (element.createTextRange){           // ie
                var range = element.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end_index);
                range.moveStart('character', start_index);
                range.select();
            } else if (element.setSelectionRange){  // w3c
                element.focus();
                element.setSelectionRange(start_index, end_index);
            }
        },
        /**
         * 光标定位到元素结尾文本处;
         * @param element
         */
        setFocusEnd: function(element){
            if (element && typeof element==='object') {
                var len = element.value.length;
                this.setSelected(element, len, len);
            }
        },
        textLength:function(text){
            if($.type(text)!=="string")return;
            return Math.floor(text.len());
        },
        removeHTMLTag : function (str) {
            str = str.replace(/<\/?[^>]*>/g,'');
            str = str.replace(/[ | ]*\n/g,'');
            //str = str.replace(/\n[\s| | ]*\r/g,'\n');
            str=str.replace(/&nbsp;/ig,'');
            return str;
        },
        /**
         * 构造函数原型的继承功能
         * @return {[type]}     继承后的子构造函数
         */
        extend:(function() {
            var oc = Object.prototype.constructor;
            return function(subclass, superclass) {
                var spp = superclass.prototype;
                var sbp = subclass.prototype;
                var F = function() {};
                F.prototype = spp;
                sbp = subclass.prototype = new F();
                subclass.superclass = spp;
                sbp.constructor = subclass;
                if (spp.constructor == oc) {
                    spp.constructor = superclass;
                }
                subclass.prototype.toString = superclass.prototype.toString;
                return subclass;
            };
        } ()),
        /**
         * 格式化简单的模版;
         * @param temp_str
         * @param data
         * @returns {*}
         */
        templateFormat: function(temp_str, data){
            temp_str = temp_str.toString();
            if(typeof data==='object' && data !== null){
                for(var key in data){
                    var reg = new RegExp('\\<\\%\\=' + key + '\\%\\>', 'gi');
                    temp_str = temp_str.replace(reg, data[key] ? (data[key]==='null' ? '' : data[key]) : '');
                }
            }
            return temp_str;
        }
    };

	String.prototype.format =  function(data){
		if(data != null){
			var string = this;
			for(var key in data){
				var reg = new RegExp('\\<\\%\\=' + key + '\\%\\>', 'gi');
				string = string.replace(reg,data[key]?(data[key]=='null'?"":data[key]):"");
			}
		}
		return string;
	};

}(jQuery, YonYou));

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
                    dateformat = '{year}-{month}-{day} {hour}:{min}';
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
                timestamp = util.intParse(Date.parse(timestamp.replace(/-/g, '/'))/1000);
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
/**
 * 添加动态
 */
(function($, YY, util){
    var feedcomb = YY.FEEDCOMB;
    // 动态模版路由表;
    var feed_router = {
        '107101': 'task_add',
		'109101': 'files',
        '109102': 'files',
        '109103': 'files',
        '109104': 'files',
		'109105': 'files',
        '105101': 'schedule_add',
        '108101': 'group',
        '108102': 'group',
        '103101': 'speech_add',
        '101101': 'space_join',
        '103102': 'speech_like',
        '103103': 'speech_favor'
    }
    function addFeed($wrap, data, callback, loaded){
        // 省略loaded参数，则默认表示已经加载了..
        loaded = typeof loaded === 'undefined' ? true : false;
        var temp_str = [],
            temp_queue = [], // 要加载的模版对列
            feedcomb = feedcomb || false,
            router   = feed_router;
        if (data && typeof data === 'object') {
            $.each(data, function(i, item){
                var template_id = item['template'],
                    template_fn = null;
                if (!(template_id && (template_fn = router[template_id]))) {
                    return true;
                }
                // 模版方法已经加载..
                if (loaded) {
                    template_fn = YY.feedTemplate[template_fn];
                    temp_str.push(typeof template_fn === 'function' ? template_fn(item) : '');
                }
                // 非合并版本，并且模版没有加载...
                if (!feedcomb && !loaded) {
                    if($.inArray('yonyou/templates/'+template_fn+'.js', temp_queue) !== -1) return true;
                    temp_queue.push('yonyou/templates/'+template_fn+'.js');
                }
            });
            // 合并版本，并且模版没有加载...
            if (feedcomb && !loaded) {
                temp_queue = ['yonyou/templates/feedTemplate.js'];
            }
            if (!loaded) {
                util.loadScript(temp_queue, {
                    fn: function(){
                        addFeed($wrap, data, callback);
                    }
                });
                return ;
            }
        }
        var $t = $(temp_str.join(''));
        $wrap.append($t);
        typeof callback === 'function' && callback($t);
        $t = null;
    }

    YY.addFeed   = addFeed;
    util.addFeed = addFeed;
}(jQuery, YonYou, YonYou.util));

/**
 * 添加通知
 */
(function($, YY, util){
    var noticecomb = YY.NOTICECOMB;
    // 动态模版路由表;
    var notice_router = {
        '112201' : 'announce_add',
        '107201' : 'task_invite',
        '107205' : 'task_post',
        '107202' : 'task_op',
        '107203' : 'task_op',
        '107206' : 'task_op',
        '107207' : 'task_op',
        '107208' : 'task_op',
        '107209' : 'task_op',
        '107204' : 'task_refuse',
        '107210' : 'task_refuse',
		'109201' : 'files',
		'109202' : 'files',
		'109203' : 'files',
		'109204' : 'files',
		'109205' : 'files',
        '108201' : 'group',
        '108202' : 'group',
        '108203' : 'group',
        '108204' : 'group',
        '108205' : 'group',
        '108206' : 'group',
        '102201' : 'employee',
        '104201' : 'reply_add',
        '104202' : 'reply_quan'
    }
    function addNotice($wrap, data, callback, loaded){
        // 省略loaded参数，则默认表示已经加载了..
        loaded = typeof loaded === 'undefined' ? true : false;
        var temp_str = [],
            temp_queue = [], // 要加载的模版对列
            noticecomb = noticecomb || false,
            router   = notice_router;
        if (data && typeof data === 'object') {
            $.each(data, function(i, item){
                var template_id = item['template'],
                    template_fn = null;
                if (!(template_id && (template_fn = router[template_id]))) {
                    return true;
                }
                // 模版方法已经加载..
                if (loaded) {
                    template_fn = YY.noticeTemplate[template_fn];
                    temp_str.push(typeof template_fn === 'function' ? template_fn(item) : '');
                }
                // 非合并版本，并且模版没有加载...
                if (!noticecomb && !loaded) {
                    if($.inArray('yonyou/templates/notice/'+template_fn+'.js', temp_queue) !== -1) return true;
                    temp_queue.push('yonyou/templates/notice/'+template_fn+'.js');
                }
            });
            // 合并版本，并且模版没有加载...
            if (noticecomb && !loaded) {
                temp_queue = ['yonyou/templates/noticeTemplate.js'];
            }
            if (!loaded) {
                util.loadScript(temp_queue, {
                    fn: function(){
                        addNotice($wrap, data, callback);
                    }
                });
                return ;
            }
        }
        var $t = $(temp_str.join(''));
        $wrap.append($t);
        typeof callback === 'function' && callback($t);
        $t = null;
    }

    YY.addNotice   = addNotice;
    util.addNotice = addNotice;
}(jQuery, YonYou, YonYou.util));