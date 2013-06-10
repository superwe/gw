(function($, YY, util){
/**
 * Tips 插件;
 * @param {[type]} options [description]
 *
 *  tips 的 position：top，right，left，bottom;
 *  
 *  箭头的css：左侧箭头：yy-arrow-left
 *             右侧箭头：yy-arrow-right
 *             顶上箭头：yy-arrow-top
 *             底部箭头：yy-arrow-bottom
 *             
 *  箭头的包含容器：yy-tips-arrow
 *  
 *  @author qiutao qiutao@chanjet.com
 */
    function Tips(options) {
        var me = this;
        var tipsContainer = 'yy-tips-container';

        var defaults = {
            wrapper: '.tips-wrapper', // 触发提示框的包裹容器
            position: 'left',   // 提示框箭头默认的显示位置
            tipWidth : 0,       // 提示框宽
            tipHeight: 0,       // 提示框高
            tipClass: '',       // 提示框的附加class
            remote: true,       // 远程请求，false表示非远程请求
            delay: 400,         // 延迟显示时间
            disappear: 400,     // 延迟消失时间
            contentCall: null,  // 非远程请求数据时候处理要展示在弹出层的内容
            events: 'hover', // hover或者click，目前格式为 'hover,click'
            callback: function(){} // 展示tips时的回调函数
        };

        // 设置 me.options;
        me.options = $.extend({}, defaults, options);
        options = defaults = null;

        me.wrapper  = $(me.options.wrapper);

        // 在相应的函数中将其初始化;
        // me.YYTipsBlock
        // me.realTarget

        var fn = Tips.prototype;
        if (typeof me.init !== 'function') {
            /**
             * 初始化Tips;
             * @return {[type]} [description]
             */
            fn.init = function(){
                var me = this;

                var $YYTipsBlock = $('#YYTipsBlock');
                if (!$YYTipsBlock.length) {
                    $YYTipsBlock = $('<div id="YYTipsBlock"></div>');
                    $('body').append($YYTipsBlock);
                }
                me.YYTipsBlock = $YYTipsBlock;
                me.bindEvents();
            };
            /**
             * 获取 tips 内容;
             * @return {[type]} [description]
             */
            fn.getTips = function(){
                var me = this;

                var $realTarget = me.realTarget;
                // 如果是远程获取数据;
                if (me.options.remote) {
                    var url = $realTarget.attr('rel');
                }

                var random_num = Math.floor(Math.random()*10000000);
                $realTarget.attr('rnum', random_num);
                if (url) {
                    me.addWrap(random_num);
                    util.ajaxApi(url, function(d, s){
                        if (s==='success' && d) {
                            me.addContent(d, random_num);
                        }
                    }, 'GET', 'html');
                }
                else {
                    var contentCall = me.options.contentCall;
                    var str = typeof contentCall === 'function' ? contentCall($realTarget) : '';

                    me.addContent(str, random_num);
                }
      
                me.options.callback();
            };
            /**
             * 先添加tip的wrap，在dom中占位;
             * @param {[type]} random_num [description]
             */
            fn.addWrap = function(random_num) {
                var me = this,
                    $YYTipsBlock = me.YYTipsBlock,
                    tip_class = me.options.tipClass,
                    tips_str = '<aside class="' + tipsContainer + ' ' + tip_class + '" id="' + random_num + '" style="display:none;">' //visibility:hidden;
                             + '<div class="yy-tips-content"></div>'
                             + '<div class="yy-tips-arrow"><span class="xsj"></span><span class="xsj2"></div></span>'
                             + '</aside>';
                $YYTipsBlock.append(tips_str);
            };
            /**
             * 将获取到的内容添加到 tips 的内容块中;
             * @param {[type]} content    [description]
             * @param {[type]} random_num [description]
             */
            fn.addContent =  function(content, random_num){
                var me = this;

                var $tips_str = $('#'+random_num);
                if (!$tips_str.length) {
                    var $YYTipsBlock = me.YYTipsBlock,
                        tip_class = me.options.tipClass,
                        tips_str = '<aside class="' + tipsContainer + ' ' + tip_class + '" id="' + random_num + '" style="">' //visibility:hidden;
                                 + '<div class="yy-tips-content">' + content + '</div>'
                                 + '<div class="yy-tips-arrow"><span class="xsj"></span><span class="xsj2"></div></span>'
                                 + '</aside>';
                    $tips_str = $(tips_str);
                    // 先将 tips 添加到 dom 中，然后设置 tips 的定位;
                    $tips_str.appendTo($YYTipsBlock);
                }
                else {
                    $tips_str.find('.yy-tips-content').html(content);
                }
                // console.log($tips_str.get(0).width)
                me.setTipsPosition($tips_str);

                // 隐藏其他的;
                $tips_str.siblings().hide();
            };
            /**
             * 设置 tips 相对将其激活的对象的位置;
             * @param {[type]} $tips [description]
             */
            fn.setTipsPosition =  function($tips){
                var me = this, left, top, arrow_left, arrow_top, 
                    arrow_class = 'yy-arrow-left';

                var padding = 20, fix_padding = 7;

                var $realTarget = me.realTarget,
                    target_width  = $realTarget.outerWidth(),
                    target_height = $realTarget.outerHeight(),

                    targetOffset = $realTarget.offset(),
                    target_left = targetOffset.left,
                    target_top  = targetOffset.top,

                    options = me.options,
                    position = options.position, // tips 默认出现的方位;
                    width  = options.tipWidth,   // tips 被设置的宽度;
                    height = options.tipHeight;  // tips 被设置的高度;

                var body_width = $('body').width(),
                    tips_width  = width ? width : $tips.outerWidth(),    // tips 的实际宽度;
                    tips_height = height ? height : $tips.outerHeight(); // tips 的实际高度;

                var $arrow = $('.yy-tips-arrow', $tips),
                    arrow_width  = $arrow.width(),
                    arrow_height = $arrow.height(),

                    arrowPosition = $arrow.position(),
                    arrow_left = arrowPosition.left,
                    arrow_top  = arrowPosition.top;

                switch(position) {
                    case 'top':
                    case 'bottom':
                        if (position === 'bottom' 
                                    || target_top < (tips_height+padding)) {
                            position = 'bottom';
                            top = target_top+target_height+fix_padding;
                            arrow_top = -arrow_height;
                            arrow_class = 'yy-arrow-bottom';
                        }
                        else {
                            top = target_top-tips_height-fix_padding;
                            arrow_top = tips_height;
                            arrow_class = 'yy-arrow-top';
                        }
                        left = (body_width<(target_left+tips_width)) 
                            ? (body_width-tips_width) 
                            : target_left;

                        arrow_left = (target_left-left)+(target_width-arrow_width)/2;
                        break;
                    case 'left':
                    case 'right':
                        if (position === 'right' 
                                    || target_left < (tips_width+padding)) {
                            position = 'right';
                            left = target_left+target_width+fix_padding;
                            arrow_left = -arrow_width;
                            arrow_class = 'yy-arrow-right';
                        }
                        else {
                            left = target_left-tips_width-fix_padding;
                            arrow_left = tips_width;
                            arrow_class = 'yy-arrow-left';
                        }
                        top = target_top;
                        arrow_top = (target_height-arrow_height)/2;
                        break;
                }
                $arrow.css({
                    'position': 'absolute',
                    'top' : arrow_top,
                    'left': arrow_left
                }).removeClass().addClass('yy-tips-arrow ' + arrow_class);
                $tips.css({
                    // 'visibility': 'visible',
                    'display': 'block',
                    'position': 'absolute',
                    'top' : top,
                    'left': left
                });
            };
            /**
             * 将tips中的内容渲染到页面之中;
             * @return {[type]} [description]
             */
            fn.render = function(tips_str){
                var me = this;

                var $realTarget  = me.realTarget,
                    $YYTipsBlock = me.YYTipsBlock,
                    rnum = $realTarget.attr('rnum'),
                    $tips = $('#'+rnum, $YYTipsBlock);

                !!$tips.length ? me.showTips($tips) : me.getTips();
            };
            /**
             * 显示已经存在的tips，并且每次都重新计算其位置;
             * @param  {[type]} $tips [description]
             * @return {[type]}       [description]
             */
            fn.showTips = function($tips){
                var me = this;

                me.setTipsPosition($tips);

                $tips.show().siblings().hide();
            };
            /**
             * 关闭 tips 框;
             * @return {[type]} [description]
             */
            fn.close = function($realTarget){
                var rnum;
                $realTarget
                    && (rnum = $realTarget.attr('rnum'));
                var $tips = $('#'+rnum);

                $tips.hide();
            };
            /**
             * 显示 tips;
             * @return {[type]} [description]
             */
            fn.tips = function(){
                var me = this;

                me.render();
            };
            /**
             * 事件绑定;
             * @return {[type]} [description]
             */
            fn.bindEvents = function(){
                var me = this;

                var options = me.options,
                    over_handle = 0, out_handle = 0;
                var $wrapper = me.wrapper,
                    $YYTipsBlock = me.YYTipsBlock;
                $.each(options.events.split(','), function(i, e){
                    if (e==='hover') {
                        $wrapper.live({
                            mouseover: function(e){
                                var $target = $(e.target),
                                    $realTarget = $target.closest('[tips="1"]');

                                // realTarget 存在;
                                if (!!$realTarget.length) {
                                    // 如果 me.realTarget 存在，并且与当前获取的目标相等
                                    if (me.realTarget && me.realTarget[0]===$realTarget[0]) {
                                        // 那么清除 mouseout 的时间句柄;
                                        clearTimeout(out_handle);
                                    }
                                    else {
                                        // 设置当前鼠标放上去的目标对象;
                                        me.realTarget = $realTarget;
                                    }
                                    over_handle = setTimeout(function() {
                                        // 显示弹出 tips;
                                        me.tips();
                                    }, options.delay);
                                }
                            },
                            mouseout: function(e){
                                var $target = $(e.target),
                                    $realTarget = $target.closest('[tips="1"]'),
                                    $relatedTarget = $(e.relatedTarget);

                                if (!$relatedTarget.length 
                                        || $relatedTarget.closest('[tips="1"]').get(0)!==$realTarget.get(0)) {
                                    clearTimeout(over_handle);
                                    out_handle = setTimeout(function(){
                                        me.close(me.realTarget);
                                    }, options.disappear);
                                }
                            }
                        });
                        // 弹出标签上的事件;
                        $YYTipsBlock.on({
                            mouseover: function(e){
                                clearTimeout(out_handle);
                            },
                            mouseout: function(e){
                                var $target = $(e.target),
                                    $realTarget = $target.closest('.'+tipsContainer),
                                    $relatedTarget = $(e.relatedTarget);

                                if (!$relatedTarget.length 
                                        || $relatedTarget.closest('.'+tipsContainer).get(0)!==$realTarget.get(0)) {
                                    out_handle = setTimeout(function(){
                                        $realTarget.hide();
                                    }, options.disappear);
                                }
                            }
                        });
                        /**
                         * 如果点击的不是tips标签框，那么隐藏所有标签框;
                         * @param  {[type]} e [description]
                         * @return {[type]}   [description]
                         */
                        $(document).click(function(e){
                            var $target = $(e.target),
                                $realTarget = $target.closest('.yy-tips-container');
                            if (!$realTarget.length) {
                                $YYTipsBlock.children().hide();
                            }
                        });
                    }
                    if (e==='click') {
                        $wrapper.live({
                            click: function(e){
                                var $target = $(e.target),
                                    $realTarget = $target.closest('[tips="1"]');

                                // 设置当前鼠标放上去的目标对象;
                                me.realTarget = $realTarget;
                                if (!!$realTarget.length) {
                                    // 显示弹出 tips;
                                    me.tips();
                                }
                                return false;
                            }
                        });
                    }
                });
            }

        }// <END IF>
    }

    YY.Tips = Tips;
}(jQuery, YonYou, YonYou.util));

//基本使用范例：
//$(function(){
//    // 用户卡片;
//    var userCard = new YY.Tips({
//        wrapper: '.user_card',
//        tipClass: 'mp_div',
//        remote: true,
//        events: 'hover'
//    });
//    // 初始化任务卡片的tips;
//    userCard.init();
//});
