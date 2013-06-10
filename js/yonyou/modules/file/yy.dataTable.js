/**
 * 数据表格插件;
 * @param  {[type]} $       [description]
 * @param  {[type]} YY      [description]
 * @param  {[type]} util    [description]
 * @return {[type]}         [description]
 *
 * @author qiutao qiutao@chanjet.com
 */
(function($, YY, util){
    /**
     * 数据表格构造函数;
     * @param {[type]} options [description]
     */
    function DataTable(options) {
        var me = this;

        var fn = DataTable.prototype;
        if (typeof me.defaults === 'undefined') {
            /**
             * 设置远程请求的URL;
             * @param {[type]} url [description]
             */
            fn.setRemoteUrl = function(url) {
                me.options.remoteUrl = url;
            };
            /**
             * 设置列表每页显示的数量;
             * @param {[type]} num [description]
             */
            fn.setPerPage = function(num) {
                me.options.perPage = num;
            };
            /**
             * 获取每页可显示数量;
             * @return {[type]} [description]
             */
            fn.getPerPage = function() {
                return me.options.perPage;
            };
            /**
             * 设置要切换到达的页面;
             * @param {[type]} p [description]
             */
            fn.setToPage = function(p) {
                me.toPage = parseInt(p);
            };
            /**
             * 获取到达页面;
             * @return {[type]} [description]
             */
            fn.getToPage = function() {
                return me.toPage;
            };
            /**
             * 清空数据缓存;
             * @return {[type]} [description]
             */
            fn.resetDataCache = function() {
                me.dataCache = {'page':{}};
            };
            /**
             * 重新载入表格数据;
             * @return {[type]} [description]
             */
            fn.reloadTable = function(num, callback) {
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
                me.dataCache.page = {};
            };
            /**
             * 重新加载tbody中的列表内容;
             * @param  {[type]} num [description]
             * @return {[type]}     [description]
             */
            fn.reloadBody = function(num) {
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
                // 请求头部信息;
                typeof me.dataCache.head === 'undefined'
                        ? me.setParamData('head', true) 
                        : me.delParamData('head');
                        
                if(url == '')return;
                
                util.ajaxApi(url, function(d, s){
                    if(s === 'success' && d && typeof d === 'object' && d.rs === true) {
                        // 初始化获取总条数，并且输出分页;
                        if(typeof d.data.total !== 'undefined') {
                            me.dataCache.totalNum = d.data.total;
                            (parseInt(d.data.total) > 0) 
                                ? me.renderPage(me.options.pageCount)
                                : me.removePage();
                        }
                        // 输出头部;
                        if(typeof d.data.head !== 'undefined') {
                            me.dataCache.head = d.data.head;
							// console.log(111);
							if(typeof d.data.total !== 'undefined') {
								me.renderHead()
							}
                            /*(parseInt(d.data.total) > 0) 
                                ? me.renderHead() 
                                : me.removeHead();*/
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
                    body_str += '<tr' + (i%2===0 ? ' class="odd"' : '') + '>';
                    for (var j = 0; j < item_len; j++) {
                        body_str += '<td>' + itemData[j] + '</td>';
                    }
                    body_str += '</tr>';
                }
                return body_str;
            };
            /**
             * 将拼接出来的内容，填充到tbody中;
             * @param {[type]} body_str [description]
             */
            fn.addBodyStr = function(body_str, callback) {
                var $tbody = me.$tbody;
                $tbody.html(body_str);
                // 当在主体中更新内容后，执行回调函数;
                typeof callback === 'function' && callback();
            };
            /**
             * 渲染中间内容列表的显示;
             * @return {[type]} [description]
             */
            fn.renderBody = function(callback) {
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
                }
                else {
                    me.getRemoteData(function(d){
                        // 增加主体列表内容;
                        body_str = me.concateBody(d);
                        me.addBodyStr(body_str, callback);
                    });
                }
                // 输出分页;
                me.renderPage(pageCount);
            };
            fn.renderFoot = function() {
                // do nothing;
            };
            /**
             * 移除头部;
             * @return {[type]} [description]
             */
            fn.removeHead = function() {
                var $selector = me.$selector;
                $selector.hide();//.find('thead>tr').html('');
                var $noData = $selector.siblings('.noData');
                !!$noData.length 
                    ? $noData.show() 
                    : $selector.after('<div class="noData">暂时还没有文档</div>');
            };
            /**
             * 渲染头部显示；
             * @return {[type]} [description]
             */
            fn.renderHead = function() {
                var thead = typeof me.dataCache.head !== 'undefined' ? me.dataCache.head : me.options.thead, 
                    len = 0;
                if(thead instanceof Array && (len = thead.length)) {
                    var $selector = me.$selector,
                        head_str = '',
                        sort_arr = ['desc', 'asc'],
                        isSort, sort_type, sort = 'sort';
                    var param_data = me.param_data;
                    for(var i = 0; i < len; i++) {
                        isSort = (typeof thead[i]['isSort'] !== 'undefined' && !!thead[i]['isSort']) 
                               ? true 
                               : false;
                        
                        if (isSort) {
                            sort = 'sort';
                            if (thead[i]['isSortBoth']) {
                                sort += ' sort-both';
                            }
                            sort_type = ($.inArray(thead[i]['sort'], sort_arr)!==-1) 
                                      ? thead[i]['sort']
                                      : '';
                            if (!!sort_type) {
                                sort += ' sort-' + sort_type;
                                param_data[thead[i]['name']] = sort_type;
                            }
                        }
                        head_str += '<th class="' 
                                 + (typeof thead[i]['css'] === 'string' ? thead[i]['css']+' ' : '') 
                                 + (isSort ? sort : '') + '" '
                                 + (typeof thead[i]['name'] === 'string' ? 'name="' + thead[i]['name'] + '"' : '')
                                 + (typeof thead[i]['styles'] !== 'undefined' ? 'style="' + thead[i]['styles'] + '"' : '') + '>' 
                                 + thead[i]['title'] + '</th>';
                    }
                    $selector.show()
                        .find('thead>tr').html(head_str);
                    $('.noData').remove();
                }
            };
            /**
             * 去除分页;
             * @return {[type]} [description]
             */
            fn.removePage = function() {
                var options = me.options;

                $(options.actLine).hide();
                // $(me.options.pageLine).html('');
            };
            /**
             * 渲染输出分页;
             * @return {[type]} [description]
             */
            fn.renderPage = function(count) {
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
                if (totalPage===1) {
                    page_str = '';
                    $(options.actLine).hide();
                }
                else {
                    $(options.actLine).show();
                }
                $(options.pageLine).html(page_str);
            };
            /**
             * 渲染输出整个表格;
             * @return {[type]} [description]
             */
            fn.render = function(callback) {
                me.renderBody(callback);
                me.renderFoot();
                // 表格渲染成功后绑定基本事件;
                me.bindEvent();
            };
            /**
             * 事件绑定;
             * @return {[type]} [description]
             */
            fn.bindEvent = function() {
                var $selector = me.$selector,
                    options   = me.options;
                // 表格区域的点击事件；
                $selector.on({
                    click: function(e) {
                        var $target = $(e.target),
                            $realTarget = null;
                        // 头部---排序规则;
                        if(($realTarget = $target.closest('.sort')).length) {
                            var name = $realTarget.attr('name'),
                                has_desc = !!$realTarget.hasClass('sort-desc'),
                                has_asc  = !!$realTarget.hasClass('sort-asc'),
                                has_both = !!$realTarget.hasClass('sort-both');
                            // 如果已经有排序了;
                            if (has_desc || has_asc) {
                                if(has_both) {
                                    $realTarget.toggleClass('sort-desc sort-asc')
                                        .siblings().removeClass('sort-desc sort-asc');
                                    me.resetParamData();
                                    has_desc ? me.setParamData(name, 'asc') : me.setParamData(name, 'desc');
                                    me.reloadBody();
                                }
                            }
                            // 点击没有排序处;
                            else {
                                $realTarget.addClass('sort-desc')
                                    .siblings().removeClass('sort-desc sort-asc');
                                me.resetParamData();
                                me.setParamData(name, 'desc');
                                me.reloadBody();
                            }
                            return false;
                        }
                    }
                });
                // 操作行的事件绑定；
                $(options.actLine).on({
                    click: function(e) {
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
                            me.setToPage(curPage + 1);
                            me.renderBody();
                        }
                        // 上一页;
                        if(($realTarget = $target.closest(prevBtn)).length) {
                            if (curPage === 1) {
                                return false;
                            }
                            me.setToPage(curPage - 1);
                            me.renderBody();
                        }
                        // 直接根据页码翻页;
                        if(($realTarget = $target.closest(pageBtn)).length) {
                            me.setToPage($realTarget.text());
                            me.renderBody();
                        }
                        // 直接跳转到第一页;
                        if(($realTarget = $target.closest(firstBtn)).length) {
                            me.setToPage(1);
                            me.renderBody();
                        }
                        // 直接跳转到最后一页;
                        if(($realTarget = $target.closest(lastBtn)).length) {
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
                var key_arr = ['head', 'p', 'per', 'total'],
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
                me.param_data[name] = val;
            };
            /**
             * 删除对象的属性;
             * @param  {[type]} name [description]
             * @return {[type]}      [description]
             */
            fn.delParamData = function(name){
                if(typeof me.param_data[name] === 'undefined') return;

                delete me.param_data[name];
            };
            /**
             * 默认参数;
             * @type {Object}
             */
            fn.defaults = {
                // 表格选择器；
                selector: '#yyDataTable',
                // 操作按钮所在的块(包括上下翻页、各种批量操作等);
                actLine: '#yyActLine',
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
                /**
                 * thead为头部的配置参数，数组格式，为必须参数；
                 * 内容格式如下：
                 *     [{
                 *         title: '文档名称',  // 标题（th中的内容，可为html代码）;
                 *         isSort: false,      // 是否可排序;
                 *         sort: 'asc',        // 排序方式;
                 *         css: '',            // th上的class;
                 *         styles: ''          // th上的style样式;
                 *      },{
                 *         title: '全部',  // 标题
                 *         isSort: false,      // 是否可排序
                 *         sort: 'asc',        // 排序方式
                 *         css: ''             // th上的class;
                 *      },{
                 *         title: '共享人数',  // 标题
                 *         isSort: false,      // 是否可排序
                 *         sort: 'asc',        // 排序方式
                 *         css: ''             // th上的class;
                 *      }]
                 * @type {Array}
                 */
                thead: [],
                tfoot: [],
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
        me.options = $.extend({}, me.defaults, options);
        // 表格对象;
        me.$selector = $(me.options.selector);
        // 表格中的tbody对象;
        me.$tbody = $('tbody', me.$selector);
        // 请求参数映射表;
        me.param_data = {};
        // 远程获取数据的缓存;
        me.dataCache = {'page':{}};
        // 设置初始页面为1;
        me.setToPage(1);

        me.render(me.options.success);
    }

    YY.DataTable = DataTable;
}(jQuery, YY, YY.util));

// $(function(){
//     var dataTableObj = new YY.DataTable({
//             // 表格选择器;
//             selector: '#yyDataTable',
//             // 操作按钮所在的块(包括上下翻页、各种批量操作等);
//             actLine: '#yyActLine',
//             // 页码行;
//             pageLine: '.yy-page-line',
//             // 页码按钮;
//             pageBtn: '.yy-page',
//             // 上一页翻页按钮;
//             nextBtn: '.yy-next-page',
//             // 下一页翻页按钮;
//             prevBtn: '.yy-prev-page',
//             // 第一页翻页按钮;
//             firstBtn: '.yy-first',
//             // 最后页翻页按钮;
//             lastBtn: '.yy-last',
//             thead: 
//             [{
//                 name: 'title',
//                 title: '文档名称',
//                 isSort: false,
//                 sort: 'asc',
//                 css: 'wid1'
//              },{
//                 name: 'type',
//                 title: '<span class="hspan">全部</span><a href="#" class="fl zsIcon8"></a> <aside class="tkBox c3a"> <a href="#">doc</a> <a href="#">jpg</a> <a href="#">gif</a> <a href="#">exe</a> </aside>',
//                 isSort: false,
//                 sort: 'asc',
//                 css: 'wid2'
//              },{
//                 name: 'num',
//                 title: '共享人数',
//                 isSort: false,
//                 sort: 'asc',
//                 css: 'wid2'
//              },{
//                 name: 'name',
//                 title: '更新人',
//                 isSort: false,
//                 sort: 'asc',
//                 css: 'wid2'
//              },{
//                 name: 'updatetime',
//                 title: '<span class="hspan">更新时间</span><a href="#" class="fl zsIcon6"></a>',
//                 isSort: true,
//                 sort: 'asc',
//                 css: 'wid3'
//              },{
//                 name: 'viewnum',
//                 title: '<span class="hspan">浏览量</span><a href="#" class="fl zsIcon7"></a>',
//                 isSort: true,
//                 sort: 'asc',
//                 css: 'wid2'
//              },{
//                 name: 'downloadnum',
//                 title: '<span class="fl hspan">下载量</span><a href="#" class="fl zsIcon5 fl"></a>',
//                 isSort: true,
//                 sort: 'asc',
//                 css: 'wid2'
//              },{
//                 name: 'action',
//                 title: '操作',
//                 isSort: false,
//                 sort: 'asc',
//                 css: 'wid4'
//              }],
//             tfoot: [],
//             perPage: 15,
//             // 远程获取数据的URL;
//             remoteUrl: '',
//             // 表示是否一次性获取所有数据;
//             isOnce: false
//     });
//     dataTableObj.render();
// });
