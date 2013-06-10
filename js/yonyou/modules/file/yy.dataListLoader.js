/**
 * 数据列表加载模块，包含分页功能;
 * 
 * @author qiutao qiutao@chanjet.com
 */
(function($, YY, util){
    /**
     * 数据列表加载器;
     * @return {[type]} [description]
     */
    function DataListLoader(options) {
        var me = this;

        var fn = DataListLoader.prototype;
        if (typeof me.defaults === 'undefined') {
            /**
             * 设置远程请求的URL;
             * @param {[type]} url [description]
             */
            fn.setRemoteUrl = function(url) {
                var me = this;
                me.options.remoteUrl = url;
            };
            /**
             * 设置列表每页显示的数量;
             * @param {[type]} num [description]
             */
            fn.setPerPage = function(num) {
                var me = this;
                me.options.perPage = num;
            };
            /**
             * 获取每页可显示数量;
             * @return {[type]} [description]
             */
            fn.getPerPage = function() {
                var me = this;
                return me.options.perPage;
            };
            /**
             * 设置要切换到达的页面;
             * @param {[type]} p [description]
             */
            fn.setToPage = function(p) {
                var me = this;
                me.toPage = parseInt(p);
            };
            /**
             * 获取到达页面;
             * @return {[type]} [description]
             */
            fn.getToPage = function() {
                var me = this;
                return me.toPage;
            };
            /**
             * 清空数据缓存;
             * @return {[type]} [description]
             */
            fn.resetDataCache = function() {
                var me = this;
                me.dataCache = {'page':{}};
            };
            /**
             * 重新载入表格数据;
             * @param  {[type]}   num      每页显示的数量;
             * @param  {Function} callback 重新载入表格后的回调函数;
             * @return {[type]}            [description]
             */
            fn.reloadDataList = function(num, callback) {
                var me = this;
                if(typeof num === 'function') {
                    callback = num;
                    num = null
                }
                num && me.setPerPage(num);
                me.setToPage(1);
                me.resetDataCache();
                delete me.totalPage;

                me.renderBody(callback);
            }
            /**
             * 清空主题表格中的数据缓存;
             * @return {[type]} [description]
             */
            fn.resetPageDataCache = function() {
                var me = this;
                me.dataCache.page = {};
            };
            /**
             * 重新加载tbody中的列表内容;
             * @param  {[type]} num [description]
             * @return {[type]}     [description]
             */
            fn.reloadBody = function(num) {
                var me = this;
                num && me.setPerPage(num);
                me.setToPage(1);
                me.resetPageDataCache();
                me.renderBody();
            };
            /**
             * 获取远程数据，返回后执行回调函数callback;
             * @param  {Function} callback [description]
             * @return {[type]}            [description]
             */
            fn.getRemoteData = function(callback) {
                var me = this;
                var url    = me.options.remoteUrl,
                    toPage = me.getToPage(),
                    perPage = me.getPerPage();

                var param_data = me.param_data;
                me.setParamData('p', toPage);
                me.setParamData('per', perPage);
                // 请求总数量;
                typeof me.dataCache.totalNum === 'undefined' 
                        ? me.setParamData('total', true) 
                        : me.delParamData('total');
                        
                if(!url) return;
                
                util.ajaxApi(url, function(d, s){
                    if(s === 'success' && d && typeof d === 'object' && d.rs === true) {
                        // 初始化获取总条数，并且输出分页;
                        if(typeof d.data.total !== 'undefined') {
                            var total = me.dataCache.totalNum = d.data.total;
                            (parseInt(total) > 0) 
                                ? me.renderPage(me.options.pageCount)
                                : me.removePage();
                        }
                        me.dataCache.page[toPage] = d.data.table;
                        callback(d.data.table);
                    }
                }, 'GET', 'json', param_data);
            };
            /**
             * 串接tbody中的内容;
             * @param  {[type]} listData [description]
             * @return {[type]}          [description]
             */
            fn.concateBody = function(listData) {
                var body_str = '',
                    list_len = listData.length;
                for (var i = 0; i < list_len; i++) {
                    var itemData = listData[i],
                        item_len = itemData.length;
                    body_str += '<li' + (i%2===0 ? ' class=""' : '') + ' style="clear:both;">';
                    for (var j = 0; j < item_len; j++) {
                        body_str += itemData[j];
                    }
                    body_str += '</li>';
                }
                if (!list_len) {
                    body_str = '<li style="text-align:center;margin:20px auto;padding:20px;border-bottom:0px;">还没有任何文档！</li>';
                }
                return body_str;
            };
            /**
             * 将拼接出来的内容，填充到tbody中;
             * @param {[type]} body_str [description]
             */
            fn.addBodyStr = function(body_str, callback) {
                var me = this;
                var $dataList = me.$dataList;
                $dataList.html(body_str);
                // 当在主体中更新内容后，执行回调函数;
                typeof callback === 'function' && callback();
            };
            /**
             * 渲染中间内容列表的显示;
             * @return {[type]} [description]
             */
            fn.renderBody = function(callback) {
                var me = this;
                var toPage   = me.toPage,
                    listData = me.dataCache.page[toPage],
                    pageCount = me.options.pageCount,
                    body_str = '';
                // 设置当前页;
                me.curPage = toPage;
                // 如果有缓存，则直接从缓存中读取，否则远程获取内容;
                if (typeof listData !== 'undefined') {
                    body_str = me.concateBody(listData);
                    me.addBodyStr(body_str, callback);
                    // 输出分页;
                    me.renderPage(pageCount);
                }
                else {
                    me.getRemoteData(function(d){
                        // 增加主体列表内容;
                        body_str = me.concateBody(d);
                        me.addBodyStr(body_str, callback);
                        // 输出分页;
                        me.renderPage(pageCount);
                    });
                }
            };
            /**
             * 去除分页;
             * @return {[type]} [description]
             */
            fn.removePage = function() {
                var me = this;
                var options = me.options;

                $(options.pageLineWrap).hide();
                // $(me.options.pageLine).html('');
            };
            /**
             * 渲染输出分页;
             * @return {[type]} [description]
             */
            fn.renderPage = function(count) {
                var me = this;
                count = count || 5;
                var totalNum = me.dataCache.totalNum,
                    perPage  = me.getPerPage(),
                    curPage  = me.curPage;
                if (!totalNum) { 
                    return;
                }
                var totalPage = Math.ceil(totalNum/perPage),
                    mid_count = Math.ceil(count/2);
                if (typeof me.totalPage === 'undefined') {
                    me.totalPage = totalPage;
                }

                var page_str = '<a class="yy-total">' + totalNum + '</a>';
                if (totalPage > count) {
                    page_str += curPage > mid_count 
                                    ? '<a class="yy-first first" href="javascript:;">1 ...</a>' 
                                    : '';
                }
                page_str += curPage === 1 ? '' : '<a class="yy-prev-page pageLeft" href="javascript:;">上一页</a>';

                var prev_count, next_count;
                if (curPage < mid_count) {
                    prev_count = curPage-1;
                    next_count = (totalPage > count) ? (count-prev_count-1) : (totalPage-prev_count-1);
                }
                else {
                    if ((curPage+mid_count-1) > totalPage) {
                        next_count = totalPage-curPage;
                        prev_count = (totalPage > count) ? (count-next_count-1) : (totalPage-next_count-1)
                    }
                    else {
                        next_count = prev_count = mid_count-1;
                    }
                }
                // 当前页面前边的页面;
                for (var i = prev_count; i > 0; i--) {
                    page_str += '<a class="yy-page" href="javascript:;">' + (curPage-i) + '</a>';
                }
                page_str += '<a class="yy-page pCur" href="javascript:;">' + curPage + '</a>';
                // 当前页后边的页面;
                for (var j = 1; j <= next_count; j++) {
                    page_str += '<a class="yy-page" href="javascript:;">' + (curPage+j) + '</a>';
                }
                page_str += (curPage === totalPage ? '' : '<a class="yy-next-page pageRight" href="javascript:;">下一页</a>');
                // 显示最后一页的跳转按钮;
                if (totalPage > count) {
                    page_str += count%2 === 0
                                    ? (curPage < (totalPage-mid_count) ? '<a class="yy-last last" href="javascript:;">... ' + totalPage + '</a>' : '')
                                    : (curPage <= (totalPage-mid_count) ? '<a class="yy-last last" href="javascript:;">... ' + totalPage + '</a>' : '');
                }
                // 将分页添加到分页行中;
                var options = me.options;
                if (totalPage<2) {
                    page_str = '';
                    $(options.pageLineWrap).hide();
                }
                else {
                    $(options.pageLineWrap).show();
                }
                $(options.pageLine).html(page_str).removeClass('yy-click-locked');
            };
            /**
             * 渲染输出整个表格;
             * @return {[type]} [description]
             */
            fn.render = function(callback) {
                var me = this;
                me.renderBody(callback);
                // 表格渲染成功后绑定基本事件;
                me.bindEvent();
            };
            /**
             * 事件绑定;
             * @return {[type]} [description]
             */
            fn.bindEvent = function() {
                var me = this;
                var options   = me.options;
                // 操作行的事件绑定；
                $(options.pageLineWrap).on({
                    click: function(e) {
                        var $me = $(this),
                            $pageLine = $me.find(options.pageLine);
                        // 点击事件被锁定，防止没重复点击;
                        if ($pageLine.is('.yy-click-locked')) {
                            return false;
                        }
                        var $target = $(e.target),
                            $realTarget = null;
                        var nextBtn  = options.nextBtn,
                            prevBtn  = options.prevBtn,
                            pageBtn  = options.pageBtn,
                            firstBtn = options.firstBtn,
                            lastBtn  = options.lastBtn;
                        var curPage = me.toPage;
                        // 下一页;
                        if(($realTarget = $target.closest(nextBtn)).length) {
                            $pageLine.addClass('yy-click-locked');
                            me.setToPage(curPage + 1);
                            me.renderBody();
                        }
                        // 上一页;
                        if(($realTarget = $target.closest(prevBtn)).length) {
                            if (curPage === 1) {
                                return false;
                            }
                            $pageLine.addClass('yy-click-locked');
                            me.setToPage(curPage - 1);
                            me.renderBody();
                        }
                        // 直接根据页码翻页;
                        if(($realTarget = $target.closest(pageBtn)).length) {
                            $pageLine.addClass('yy-click-locked');
                            me.setToPage($realTarget.text());
                            me.renderBody();
                        }
                        // 直接跳转到第一页;
                        if(($realTarget = $target.closest(firstBtn)).length) {
                            $pageLine.addClass('yy-click-locked');
                            me.setToPage(1);
                            me.renderBody();
                        }
                        // 直接跳转到最后一页;
                        if(($realTarget = $target.closest(lastBtn)).length) {
                            $pageLine.addClass('yy-click-locked');
                            var totalPage = me.totalPage;
                            me.setToPage(totalPage);
                            me.renderBody();
                        }
                    }
                });
            };
            /**
             * 重置请求参数,删除排序相关的参数;
             * @return {[type]} [description]
             */
            fn.resetParamData = function(){
                var me = this;
                var key_arr = ['p', 'per', 'total'],
                    param_data = me.param_data;
                param_data['p'] = 1;
                $.each(param_data, function(k, v){
                    if($.inArray(k, key_arr)===-1){
                        me.delParamData(k);
                    }
                });
            };
            /**
             * 设置请求的参数;
             * @param {[type]} name [description]
             * @param {[type]} val [description]
             */
            fn.setParamData = function(name, val){
                var me = this;
                me.param_data[name] = val;
            };
            /**
             * 删除对象的属性;
             * @param  {[type]} name [description]
             * @return {[type]}      [description]
             */
            fn.delParamData = function(name){
                var me = this;
                if(typeof me.param_data[name] === 'undefined') return;

                delete me.param_data[name];
            };
            /**
             * 默认参数;
             * @type {Object}
             */
            fn.defaults = {
                // 数据列表容器，包括列表和分页;
                wrapper: '#yyDataList',
                dataList: '.yy-data-list',
                // 页码行包裹器;
                pageLineWrap: '.yy-page-line-wrap',
                // 页码行;
                pageLine: '.yy-page-line',
                // 页码按钮;
                pageBtn: '.yy-page',
                // 上一页翻页按钮
                nextBtn: '.yy-next-page',
                // 下一页翻页按钮
                prevBtn: '.yy-prev-page',
                // 第一页翻页按钮;
                firstBtn: '.yy-first',
                // 最后页翻页按钮;
                lastBtn: '.yy-last',
                // 每页显示的数量;
                perPage: 15,
                // 分页中显示的数量，最好使用基数，易于对称性;
                pageCount: 5,
                // 远程获取数据的URL;
                remoteUrl: '',
                // 表示是否一次性获取所有数据;
                isOnce: false,
                success: function() {}
            };
        }
        // 获取配置参数;
        options = me.options = $.extend({}, me.defaults, options);
        me.$wrapper  = $(options.wrapper);
        me.$dataList = $(options.dataList, me.$wrapper);
        // 请求参数映射表;
        me.param_data = {};
        // 远程获取数据的缓存;
        me.dataCache = {'page':{}};
        // 设置初始页面为1;
        me.setToPage(1);

        me.render(me.options.success);
    }

    YY.DataListLoader = DataListLoader;
}(jQuery, YY, YY.util));