(function($, YY, util){
    /**
     * 获取唯一id;
     */
    function getUniqueId () {
        return (new Date()).getTime()+Math.random();
    }
    /**
     * 一个简单弹出框模块;
     * @param {[type]} options [description]
     */
    function SimpleDialog(options){
        var me = this,
            defaults = {
                'mixObj': null,  // 混合类型对象，可以是seletor、dom对象、jquery对象、或者字符串，在url参数为空的时候使用;
                'wrapClass': '', // 最外层的附加class
                'width' : 480,
                'height': 360,
                'borderWidth': 5,
                'xPos': 0,
                'yPos': 0,
                'title' : '',      // 标题;
                'zindex': '9999',  // dialog的层级;
                'cache': true,     // 缓存dialog的内容;
                'overlay': true,   // 显示遮罩层;
                'hasBorder': true, // 显示边框;
                'hasHeader': true, // 显示头;
                'hasFooter': true, // 显示底;
                'autoOpen': true,  // 是否自动初始化渲染显示;
                'url': '',         // 请求远程数据的URL
                'params': {},
                /**
                 * dialog开始加载时调用，
                 *     返回true继续执行，false停止执行;
                 * @return {[type]} [description]
                 */
                'onStart': function(){
                    return true;
                },
                'onComplete': function($wrap){}, // dialog完成加载时调用
                /**
                 * 请求远程数据返回后执行，默认直接返回传入的数据，
                 * 也可以自行处理，然后再返回合适的数据;
                 * @param  {[type]} data 请求返回的数据
                 * @return {[type]}      处理后可以添加到content中的数据，可以为字符串、dom、jquery对象等
                 */
                'onRemoteComplete': function(data){
                    return data;
                },
                /**
                 * 点击确认按钮的回调函数，在dialog关闭前调用，
                 * 需要返回true才能正常关闭，否则dialog无法关闭;
                 * @return {[type]} [description]
                 */
                'onConfirm': function(){
                    return true;
                },
                /**
                 * 关闭时候执行的回调
                 * 可以执行一些关闭时候的操作，例如数据清理、状态还原等...
                 */
                'onClose': function($wrap){}
            };
        //实际配置
        var setting = me.setting = $.extend(true, defaults, options);
        // 缓存数据
        me.dataCache = {
            $wrap: null,    // 最外层包裹器
            $content: null, // 主体容器
            $header: null,  // 头部
            $title : null,  // 标题
            $close : null,  // 关闭x
            $footer: null,  // 底部
            $confirm: null, // 确认按钮
            $cancel : null, // 取消按钮
            $overlay: null, // 遮罩层
            contentData: '' // dialog主体内容的缓存
        };

        var fn = SimpleDialog.prototype;
        if (typeof me._bindEvent !== 'function') {
            /**
             * 创建遮罩层;
             * @return {[type]} [description]
             */
            fn._createOverlay = function(){
                var me = this,
                    setting = me.setting,
                    dataCache = me.dataCache;

                var $overlay = dataCache.$overlay = $('<div style="display:block;opacity:0.2;filter:alpha(opacity=20);background:#666;position:fixed;left:0px;top:0px;height:100%;width:100%;z-index:'+(setting.zindex-1)+';"></div>');
                $('body').append($overlay);
            };
            /**
             * 销毁遮罩层;
             * @return {[type]} [description]
             */
            fn._destroyOverlay = function(){
                var me = this;

                me.dataCache.$overlay.off().remove();
            };
            /**
             * 设置dialog的位置;
             */
            fn._setPosition = function(x, y){
                var me = this,
                    dataCache = me.dataCache,
                    $wrap = dataCache.$wrap;

                x = parseInt(x, 10);
                y = parseInt(y, 10);
                var left, top;
                if (x || y) {
                    left = x ? x : 0;
                    top  = y ? y : 0;
                } else {
                    var $window = $(window),
                        w_width  = $window.width(),
                        w_height = $window.height(),
                        d_width  = $wrap.width(),
                        d_height = $wrap.height();
                    left = (w_width-d_width)/2;
                    top  = (w_height-d_height)/2;
                }
                $wrap.css({
                    'position': 'fixed',
                    'left': left,
                    'top' : top
                });
            }
            fn._setContentSize = function(){
                var me = this,
                    setting = me.setting,
                    dataCache = me.dataCache,
                    height = setting.height,
                    header_height = setting.hasHeader ? dataCache.$header.outerHeight() : 0,
                    footer_height = setting.hasFooter ? dataCache.$footer.outerHeight() : 0;

                dataCache.$content.height(height-header_height-footer_height);
            }
            /**
             * 设置头;
             * @return {[type]} [description]
             */
            fn._setHeader = function(){
                var me = this,
                    setting   = me.setting,
                    dataCache = me.dataCache,
                    title = setting.title;
                setting.hasHeader = !title ? false : setting.hasHeader;
                if (!dataCache.$header && setting.hasHeader) {
                    var $header = dataCache.$header = $('<div class="dialog_header"></div>'),
                        $title = dataCache.$title = $('<h3 class="title">'+title+'</h3>'),
                        $close = dataCache.$close = $('<a href="javascript:;" class="close" title="关闭">x</a>');
                    $header.append($title, $close);
                }
            }
            /**
             * 设置底;
             * @return {[type]} [description]
             */
            fn._setFooter = function(){
                var me = this,
                    setting = me.setting,
                    dataCache = me.dataCache;

                if (!dataCache.$footer && setting.hasFooter) {
                    var $footer  = dataCache.$footer  = $('<div class="dialog_footer"></div>'),
                        $confirm = dataCache.$confirm = $('<button class="confirm">确 定</button>'),
                        $cancel  = dataCache.$cancel  = $('<button class="cancel">取 消</button>');
                    $footer.append($confirm, $cancel);
                }
            }
            /**
             * 设置主体内容
             * @return {[type]} [description]
             */
            fn._setContent = function(){
                var me = this,
                    dataCache = me.dataCache;
                dataCache.$content = $('<div class="dialog_content"></div>');
            }
            /**
             * 设置content中的内容;
             * @param {Function} callback [description]
             */
            fn._setContentData = function(callback){
                var me = this,
                    setting = me.setting,
                    dataCache = me.dataCache,
                    $content  = dataCache.$content;

                $content.empty();

                var contentData  = dataCache.contentData,
                    $contentData = null;
                if (contentData) {
                    $contentData = $(contentData);
                    $contentData.length ? $content.append($contentData) : $content.html(contentData);
                    typeof callback === 'function' && callback();
                } else {
                    $content.append('<img src="'+util.url('js/yonyou/widgets/simpleDialog/ajaxLoader.gif')+'">');
                    // var i = 0;
                    // 把contentData添加到$content中;
                    function appendContentData(){
                        contentData = dataCache.contentData;
                        if (contentData) {
                            $contentData = $(contentData);
                            $contentData.length ? $content.empty().append($contentData) : $content.html(contentData);
                            typeof callback === 'function' && callback();
                        } else {
                            setTimeout(appendContentData, 50);
                        }
                    }
                    setTimeout(appendContentData, 50);
                }
            }
            /**
             * 获取需要添加到dialog_content里的内容，然后存入dataCache.contentData;
             * @return {[type]} [description]
             */
            fn._getContentData = function(){
                var me = this,
                    setting = me.setting,
                    dataCache = me.dataCache,
                    url = setting.url;
                // contentData已经存在，直接返回;
                if (!!dataCache.contentData) {
                    return ;
                }
                if (url) {
                    var params = setting.params;
                    util.ajaxApi(url, function(d, s){
                        if (s==='success' && d) {
                            var d = (typeof me.onRemoteComplete === 'function' ? me.onRemoteComplete(d) : d).toString(),
                                $d = $(d);
                            dataCache.contentData = $d.length ? $d.get() : d;
                            
                        }
                    }, 'GET', 'html', params);
                } else {
                	var $mixObj = $(setting.mixObj);
                    dataCache.contentData = $mixObj.length ? $mixObj.get() : setting.mixObj;
                }
            }
            /**
             * 清空dataCache.contentData中的内容;
             * @return {[type]} [description]
             */
            fn._clearContentData = function(){
                var me = this,
                    dataCache = me.dataCache;

                dataCache.contentData = null;
                dataCache.$content.empty();
            }
            fn._reloadContentData = function(){
                var me = this,
                    dataCache = me.dataCache;

                dataCache.contentData = null;
                me._getContentData();
            }
            /**
             * 组装dialog框;
             * @return {[type]} [description]
             */
            fn._buildUp = function(){
                var me = this,
                    setting = me.setting,
                    dataCache = me.dataCache,
                    wrapClass = setting.wrapClass, // 包裹器上的额外class
                    $wrap = me.uniqueId ? $('#'+me.uniqueId) : null;
                // 不存在唯一id，以及其dom对象，那么在body中添加
                if (!($wrap&&!!$wrap.length)) {
                    var uniqueId = me.uniqueId = getUniqueId(), // 唯一id;
                        width  = parseInt(setting.width, 10),
                        height = parseInt(setting.height, 10);

                    var boder = parseInt(setting.borderWidth);
                    boder = setting.hasBorder && boder ? boder : 0;
                    var wrap_str = '<div class="dialog_wrap'+(wrapClass ? ' '+wrapClass : '')+'" id="'+uniqueId+
                        '" style="width:'+width+'px;height:'+height+'px;z-index:'+setting.zindex+';padding:'+boder+'px;"></div>';
                    $wrap = dataCache.$wrap = $(wrap_str);
                    var $container = dataCache.$container = $('<div class="dialog_container"></div>');
                    if (setting.hasHeader) {
                        $container.append(dataCache.$header);
                    }
                    $container.append(dataCache.$content);
                    if (setting.hasFooter) {
                        $container.append(dataCache.$footer);
                    }
                    $wrap.append($container);
                }
            }
            /**
             * 绑定事件
             * @return {[type]} [description]
             */
            fn._bindEvent = function(){
                var me = this,
                    setting = me.setting,
                    dataCache = me.dataCache,
                    $wrap = dataCache.$wrap;
                // 弹出dialog上的事件绑定;
                $wrap.on({
                    'click': function(e){
                        var $target = $(e.target);

                        if ($target.is(dataCache.$close) || $target.is(dataCache.$cancel)) {
                            // 关闭 或者 取消
                            me.close();
                            // return false;
                        } else if ($target.is(dataCache.$confirm)) {
                            // 确认
                            if (typeof me.onConfirm === 'function') {
                                me.onConfirm() && me.close();
                            } else {
                                me.close();
                            }
                            // return false;
                        }
                    }
                });
                var $doc = $(document);
                $doc.on({
                    'keydown': closeDialog
                });
                function closeDialog(e){
                    if (e.keyCode===27) {
                        $doc.off('keydown', closeDialog);
                        me.close();
                    }
                }
                var $win = $(window);
                $win.on({
                    'resize': resetDialogPosition
                });
                function resetDialogPosition(e){
                    me._setPosition(setting.xPos, setting.yPos);
                }
            }
            /**
             * 显示头
             * @return {[type]} [description]
             */
            fn.showHeader = function(){
                var me = this,
                    dataCache = me.dataCache;
                
                me.setting.hasHeader = true;
                if (dataCache.$header) {
                    dataCache.$header.show();
                } else {
                    me._setHeader();
                    dataCache.$header.insertBefore(dataCache.$content);
                }
                me._setContentSize();
            };
            /**
             * 隐藏头
             * @return {[type]} [description]
             */
            fn.hideHeader = function(){
                var me = this,
                    dataCache = me.dataCache;

                me.setting.hasHeader = false;
                if (dataCache.$header) {
                    dataCache.$header.hide();
                }
                me._setContentSize();
            };
            /**
             * 显示底
             * @return {[type]} [description]
             */
            fn.showFooter = function(){
                var me = this,
                    dataCache = me.dataCache;

                me.setting.hasFooter = true;
                if (dataCache.$footer) {
                    dataCache.$footer.show();
                } else {
                    me._setFooter();
                    dataCache.$footer.insertAfter(dataCache.$content);
                }
                me._setContentSize();
            };
            /**
             * 隐藏底
             * @return {[type]} [description]
             */
            fn.hideFooter = function(){
                var me = this,
                    dataCache = me.dataCache;

                me.setting.hasFooter = false;
                if (dataCache.$footer) {
                    dataCache.$footer.hide();
                }
                me._setContentSize();
            };
            /**
             * 设置远程请求URL
             * @param {[type]} url [description]
             */
            fn.setUrl = function(url){
                var me = this;

                return me.setting.url = url;
            };
            /**
             * 移除远程请求URL
             * @return {[type]} [description]
             */
            fn.removeUrl = function(){
                var me = this;

                me.setting.url = '';
            };
            /**
             * 设置URL的请求参数;
             * @param {[type]} key [description]
             * @param {[type]} val [description]
             */
            fn.setParam = function(key, val){
                var me = this,
                    setting = me.setting;

                if (key) {
                    if (typeof key === 'object') {
                        $.extend(setting.params, key);
                    } else {
                        setting.params[key] = val;
                    }
                }
            }
            /**
             * 移除URL的请求参数;
             * @param  {[type]} key [description]
             * @return {[type]}     [description]
             */
            fn.removeParam = function(key){
                var me = this,
                    setting = me.setting;

                if (key === undefined) {
                    setting.params = {};
                } else {
                    if (typeof setting.params[key] !== 'undefined') {
                        delete setting.params[key];
                    }
                }
            }
            /**
             * 重置dialog的尺寸;
             * @param {[type]} size {width:480, height:360}
             */
            fn.resize = function(size){
                if(!(size && typeof size === 'object')) return ;

                var me = this,
                    setting = me.setting,
                    dataCache = me.dataCache,
                    width  = parseInt(size.width, 10),
                    height = parseInt(size.height, 10);
                if (width && height) {
                    var boder = parseInt(setting.borderWidth);
                    boder = setting.hasBorder && boder ? boder : 0;
                    dataCache.$wrap.css({
                        'width' : width,
                        'height': height,
                        // 'border-radius': boder,
                        'padding': boder
                    });
                    setting.width = width;
                    setting.height = height;
                    me._setContentSize();
                    me._setPosition(setting.xPos, setting.yPos); // 设置位置
                }
            }
            /**
             * 设置dataCache.contentData；
             * 在此出设置数据，优先级高于默认设置的mixObj和从URL请求的数据;
             * @param mixObj
             */
            fn.setContentData = function(mixObj){
                var me = this,
                    dataCache = me.dataCache;

                var $mixObj = $(mixObj);
                dataCache.contentData = $mixObj.length ? $mixObj.get() : setting.mixObj;
            }
            /**
             * 移除contentData缓存;
             */
            fn.removeContentData = function(){
                var me = this;

                me._clearContentData()
            }
            /**
             * 设置头部标题，只有当头部显示的时候有效;
             * @param title
             */
            fn.setTitle = function(title){
                var me = this,
                    setting = me.setting,
                    dataCache = me.dataCache;

                setting.hasHeader && dataCache.$title.html(title);
            }
            /**
             * 关闭;
             * @return {[type]} [description]
             */
            fn.close = function(){
                var me = this,
                    setting = me.setting,
                    $wrap = me.dataCache.$wrap;
                if ($wrap && $wrap.length) {
                    if(typeof me.onClose === 'function'){
                        me.onClose($wrap);
                    }

                    $wrap.off().remove();
                    // $(window).off('resize');//, resetDialogPosition

                    // 不缓存，并且设置了请求url
                    if (!setting.cache && setting.url) {
                        me._clearContentData();
                    }
                    // 销毁遮罩层
                    setting.overlay && me._destroyOverlay();
                }
            }
            /**
             * 打开dialog;
             * @return {[type]} 打开失败，返回false，成功返回true
             */
            fn.open = function(){
                var me = this,
                    setting = me.setting,
                    dataCache = me.dataCache,
                    $wrap = dataCache.$wrap;

                if(typeof me.onStart === 'function'){
                    if (!me.onStart()) {
                        // @TODO dialog启动失败
                        return false;
                    }
                }
                me._getContentData(); // 获取添加到dialog_content中的数据;

                $('body').append($wrap);
                me._setContentSize(); // 通过计算，设置dialog_content块的高宽尺寸;
                me._setPosition(setting.xPos, setting.yPos); // 设置位置
                $wrap.css({
                    'visibility': 'visible'
                });
                me._setContentData(function(){
                    if (typeof me.onComplete === 'function') {
                        me.onComplete($wrap);
                    }
                });
                // 创建遮罩层
                setting.overlay && me._createOverlay();
                me._bindEvent();
            }
        }
        me._setHeader();
        me._setFooter();
        me._setContent();
        me._buildUp();

        me.onStart = setting.onStart;
        me.onComplete = setting.onComplete;
        me.onRemoteComplete = setting.onRemoteComplete;
        me.onConfirm = setting.onConfirm;
        me.onClose = setting.onClose;

        delete setting.onStart;
        delete setting.onComplete;
        delete setting.onRemoteComplete;
        delete setting.onConfirm;
        delete setting.onClose;
        // 自动显示
        setting.autoOpen && me.open();
    }

    YY.SimpleDialog = SimpleDialog;
}(jQuery, YonYou, YonYou.util));

// 基本使用范例：
// $(function(){
//     util.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js'], {
//         fn: function(){
//             var dialog_obj = new YY.SimpleDialog({
//                 'mixObj': '#yySetting',
//                 'title': '这是一个测试dialog',
//                 'width': 800,
//                 'height': 600,
//                 'overlay' : true,
//                 'autoOpen': false,
//                 'onStart': function(){
//                     // util.trace('onStart');
//                     return true;
//                 },
//                 'onComplete': function(){
//                     // util.trace('onComplete');
//                     return true;
//                 },
//                 'onRemoteComplete': function(data){
//                     return data;
//                 },
//                 'onConfirm': function(){
//                     return true;
//                 }
//             });
//             $('#clickclick').on({
//                 'click': function(){
//                     dialog_obj.open();
//                 }
//             })
//         }
//     });
// });