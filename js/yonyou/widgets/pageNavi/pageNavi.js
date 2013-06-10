/**
 * 分页插件;
 */
(function($, YY, util){
    YY = YY || {};

    function PageNavi(options) {
        var me = this;

        // me.totalPage

        var fn = PageNavi.prototype;
        if (typeof me.defaults === 'undefined') {
            /**
             * 设置请求参数;
             * @param {[type]} param_data [description]
             */
            fn.setParamData = function(param_data) {
                var me = this;

                me.paramData = param_data || {};
            };
            /**
             * 获取请求的参数;
             * @return {[type]} [description]
             */
            fn.getParamData = function() {
                var me = this;

                return me.paramData;
            };
            /**
             * 重置翻页时候的请求参数;
             * @return {[type]} [description]
             */
            fn.resetParamData = function() {
                var me = this;

                me.paramData = {
                    'page' : me.defaults.page,
                    'num'  : me.defaults.perPage
                };
            };
            /**
             * 获取当前页码;
             * @return {[type]} [description]
             */
            fn.getCurPage = function() {
                var me = this;

                return me.curPage;
            };
            /**
             * 设置当前的页码;
             * @param {[type]} page [description]
             */
            fn.setCurPage = function(page) {
                var me = this;

                me.curPage = parseInt(page, 10) || 1;
            };
            /**
             * 获取一次性最多可显示的页数;
             * @return {[type]} [description]
             */
            fn.getPageCount = function() {
                var me = this;

                return me.options.pageCount;
            };
            /**
             * 设置一次性最多可显示的页数;
             * @param {[type]} count [description]
             */
            fn.setPageCount = function(count) {
                var me = this;

                me.options.pageCount = count;
            };
            /**
             * 获取每页可显示的数量;
             * @return {[type]} [description]
             */
            fn.getPerPage = function() {
                var me = this;

                return me.options.perPage;
            };
            /**
             * 设置每页可显示的数量;
             * @param {[type]} num [description]
             */
            fn.setPerPage = function(num) {
                var me = this;

                me.options.perPage = num;
            };
            /**
             * 获取总页数;
             * @return {[type]}            [description]
             */
            fn.getTotalPage = function() {
                var me = this;

                var total = me.getTotalNum(),
                    per   = me.getPerPage();
                me.totalPage = Math.ceil(total/per);

                return me.totalPage;
            };
            /**
             * 获取总数量;
             * @return {[type]} [description]
             */
            fn.getTotalNum = function() {
                var me = this;

                return me.options.totalNum;
            };
            /**
             * 设置总数量;
             * @param {[type]} total_num [description]
             */
            fn.setTotalNum = function(total_num) {
                var me = this;

                me.options.totalNum = total_num;
            };
            /**
             * 获取请求的数据的URL
             * @return {[type]} [description]
             */
            fn.getRemoteUrl = function(){
                var me = this;

                return me.options.remoteUrl;
            }
            /**
             * 设置请求数据的URL;
             * @param url
             */
            fn.setRemoteUrl = function(url){
                var me = this;

                me.options.remoteUrl = url;
            }
            /**
             * 拼接分页的html字符串;
             * @return {[type]} [description]
             */
            fn.concatHtml = function() {
                var me = this;
                var options = me.options,
                    nextBtn  = (options.nextBtn).substr(1),
                    prevBtn  = (options.prevBtn).substr(1),
                    pageBtn  = (options.pageBtn).substr(1),
                    firstBtn = (options.firstBtn).substr(1),
                    lastBtn  = (options.lastBtn).substr(1),

                    count = me.getPageCount(),      // 可显示的数量
                    mid_count = Math.ceil(count/2), // 可显示的中间数
                    total = me.getTotalNum(),       // 总数量
                    cur   = me.getCurPage(),        // 当前页数
                    totalPage = me.getTotalPage();  // 总页数

                var page_str = '<a>' + total + '</a>';
                if (totalPage > count) {
                    page_str += (cur > mid_count) 
                                    ? '<a class="' + firstBtn + ' first" href="javascript:;">1 ...</a>' 
                                    : '';
                }
                page_str += (cur === 1) ? '' : '<a class="' + prevBtn + ' pageLeft" href="javascript:;">上一页</a>';

                // 获取当前也的前后页数;
                var prev_count, next_count;
                if (cur < mid_count) {
                    prev_count = cur-1;
                    next_count = (totalPage > count) ? (count-prev_count-1) : (totalPage-prev_count-1);
                }
                else {
                    if ((cur+mid_count-1) > totalPage) {
                        next_count = totalPage-cur;
                        prev_count = (totalPage > count) ? (count-next_count-1) : (totalPage-next_count-1)
                    }
                    else {
                        next_count = prev_count = mid_count-1;
                    }
                }
                // 当前页面前边的页面;
                for (var i = prev_count; i > 0; i--) {
                    page_str += '<a class="' + pageBtn + '" href="javascript:;">' + (cur-i) + '</a>';
                }
                page_str += '<a class="' + pageBtn + ' pCur" href="javascript:;">' + cur + '</a>';
                // 当前页后边的页面;
                for (var j = 1; j <= next_count; j++) {
                    page_str += '<a class="' + pageBtn + '" href="javascript:;">' + (cur+j) + '</a>';
                }
                page_str += (cur === totalPage) ? '' : '<a class="' + nextBtn + ' pageRight" href="javascript:;">下一页</a>';
                // 显示最后一页的跳转按钮;
                if (totalPage > count) {
                    page_str += (count%2 === 0)
                                    ? (cur < (totalPage-mid_count) ? '<a class="' + lastBtn + ' last" href="javascript:;">... ' + totalPage + '</a>' : '')
                                    : (cur <= (totalPage-mid_count) ? '<a class="' + lastBtn + ' last" href="javascript:;">... ' + totalPage + '</a>' : '');
                }
                return page_str;
            };
            /**
             * 获取内容数据;
             * @return {[type]} [description]
             */
            fn.getContentData = function(callback) {
                var me = this;

                var options = me.options,
                    // 请求地址;
                    remoteUrl  = options.remoteUrl,
                    // 请求参数;
                    param_data = me.getParamData();

                param_data['page'] = me.getCurPage();   // 获取当前页码;
                param_data['num']  = me.getPerPage();   // 获取每页可显示数量;

                if(remoteUrl){
                    util.ajaxApi(remoteUrl, function(d, s){
                        if(s==='success' && typeof callback === 'function'){
                            callback(d);
                        }
                    }, 'GET', 'json', param_data);
                }
            };
            /**
             * 输出分页;
             * @return {[type]} [description]
             */
            fn.render = function() {
                var me = this;

                var options = me.options;
                // 获取页面内容，然后执行处理内容的回调函数;
                me.getContentData(function(d){
                    typeof options.contentLoaded === 'function' && options.contentLoaded(me, d);
                    var page_str = me.getTotalNum() ? me.concatHtml() : '';

                    $(options.pageLine).html(page_str);
                });
            };
            /**
             * 绑定分页中的事件;
             * @return {[type]} [description]
             */
            fn.bindEvent = function() {
                var me = this;
                var options = me.options;
                // 操作行的事件绑定；
                $(options.pageLine).off().on({
                    click: function(e) {
                        var $target = $(e.target),
                            $realTarget = null;
                        // util.trace($target)
                        var nextBtn  = options.nextBtn,
                            prevBtn  = options.prevBtn,
                            pageBtn  = options.pageBtn,
                            firstBtn = options.firstBtn,
                            lastBtn  = options.lastBtn;
                        var curPage   = me.getCurPage(),    // 当前页面;
                            totalPage = me.getTotalPage();  // 总页面数;
                        // 下一页;
                        // util.trace($target.closest(nextBtn))
                        if(($realTarget = $target.closest(nextBtn)).length) {
                            if (curPage === totalPage) {
                                return false;
                            }
                            // util.trace(curPage+1)
                            me.setCurPage(curPage+1);
                            me.render();
                        }
                        // util.trace(options)
                        // 上一页;
                        if(($realTarget = $target.closest(prevBtn)).length) {
                            if (curPage === 1) {
                                return false;
                            }
                            me.setCurPage(curPage-1);
                            me.render();
                        }
                        // 直接根据页码翻页;
                        if(($realTarget = $target.closest(pageBtn)).length) {
                            me.setCurPage($realTarget.text());
                            me.render();
                        }
                        // 直接跳转到第一页;
                        if(($realTarget = $target.closest(firstBtn)).length) {
                            me.setCurPage(1);
                            me.render();
                        }
                        // 直接跳转到最后一页;
                        if(($realTarget = $target.closest(lastBtn)).length) {
                            me.setCurPage(totalPage);
                            me.render();
                        }
                    }
                });
            };
            /**
             * 默认配置;
             * @type {Object}
             */
            fn.defaults = {
                page: 1,            // 初始页面;
                perPage: 15,        // 每页显示的数量;
                pageCount: 5,       // 分页中显示的数量，最好使用基数，易于对称性;
                totalNum: 0,        // 请求分页的总数量;
                autoRender: true,   // 是否自动输出分页;
                // 页码行; 
                pageLine: '.yy-page-line',
                // 页码按钮;
                pageBtn: '.yy-page',
                // 上一页翻页按钮
                prevBtn: '.yy-prev-page',
                // 下一页翻页按钮
                nextBtn: '.yy-next-page',
                // 第一页翻页按钮;
                firstBtn: '.yy-first',
                // 最后页翻页按钮;
                lastBtn: '.yy-last',
                // 翻页请求的地址;
                remoteUrl: '',
                // 请求的参数;
                paramData: {},
                // 页面内容获取成功后调用;
                contentLoaded: function(pageObj, d) {}
            };
        }

        // 获取配置参数;
        var options = me.options = $.extend({}, me.defaults, options);

        me.setParamData(options.paramData);
        delete options.paramData;

        me.setCurPage(options.page);
        me.setPerPage(options.perPage)

        me.bindEvent();
        // isRender为true的时候，在初始化对象的时候自动输出;否则需要在初始化对象后再手动输出;
        options.autoRender && me.render();
    }

    // 将分页对象 pageNavi 导出到全局对象YY中;
    YY.PageNavi = PageNavi;
}(jQuery, YY, YY.util));

// $(function(){
//     var pageObj = new YY.PageNavi({
//         perPage: 15,        // 每页显示的数量;
//         pageCount: 5,       // 分页中显示的数量，最好使用基数，易于对称性;
//         totalNum: 100,      // 请求分页的总数量;
//         autoRender: false,
//         contentLoaded: function(d){
//             YY.util.trace(11111)
//         }
//     });
//     var url = YY.util.url('');
//     pageObj.setTotalNum(150);
//     pageObj.setRemoteUrl(url);
//     pageObj.render();
// });