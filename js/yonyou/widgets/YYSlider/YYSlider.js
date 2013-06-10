/**
 * by qiutao
 */
;(function($){
    $.fn.YYSlider = function(options){
        var defaults = {
                wrapper: '.yy-slider-wrapper',  // 主内容块容器的包含器;
                big: '.yy-slider-big',          // 主内容块容器;
                big_item: '.yy-slider-big-item',// 每个内容块的统一标识符;
                nav: '.yy-slider-nav',          // 滑动的导航容器;
                nav_item: '.yy-slider-nav-item',// 每个导航块的统一标识符;
                nav_flag: true,                 // 是否显示nav区域，true表示显示，false表示不显示;
                arrow_left:  '.yy-arrow-left',  // 向左滑动的箭头块;
                arrow_right: '.yy-arrow-right', // 向右滑动的箭头块;
                arrow_flag: false,              // 是否显示箭头块;
                width: 675,                     // 每个内容块的宽度;
                show_num: 1,                    // 可视区域内显示的内容块数量;
                cur: 'cur',                     // nav区域的当前激活标识;
                delay: 400,                     // 鼠标放在nav上切换的延时;
                auto_flag: true,                // 表示是否自动播放;
                autodelay: 3500,                // 自动播放时候的时间间隔;
                show_type: 1,                   // 展示类型，1为水平滑动效果，2为直接切换效果;
                disabled_class: 'yy-disabled',  // 表示当前元素为disabled的class;
                start_pos: 0,                   // 起始播放的位置;
                nav_click: false,
                nav_hover: true
            };
        options = $.extend(defaults, options);
        var cur = options.cur,
            width = options.width,            
            wrapper_width = width*options.show_num,
            auto_flag = options.auto_flag,
            disabled  = options.disabled_class,
            start_pos = options.start_pos;            

        var $me = this,
            $wrapper = $(options.wrapper, $me),
            $big = $(options.big, $wrapper),
            $bigItem   = $(options.big_item, $big),
            $nav = $(options.nav, $me),
            $navItem   = $(options.nav_item, $nav),
            $arrowLeft  = $(options.arrow_left, $me),
            $arrowRight = $(options.arrow_right, $me),
            slider_num = $big.children().length,  // 内容块总数量;
            nav_num = $navItem.length,
            th1, th2;
        
        var slider = new YYSlider();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function _init(){
            $wrapper.css({'width':wrapper_width});
            if (options.height) {
                $wrapper.css({'height': options.height});
            }
            
            $big.css({'width': slider_num*width});
            $bigItem.css({'width': width});

            slider.start(start_pos);

            var $n_items = $navItem,
	            $cur     = $n_items.filter('.'+cur);
	        $cur = $cur.length ? $cur : $n_items.first();

            // 如果自动轮播开启...
            if (auto_flag) {
                // 鼠标移入 slider 块停止轮播，移除后继续轮播;
                $wrapper.live({
                    mouseenter: function(){
                        stopAutoHorizontal();  // 停止自动轮播;
                    },
                    mouseleave: function(){
                        startAutoHorizontal(); // 开始自动轮播;
                    }
                });
                autoHorizontal();//加载后自动开始;
            }
            // 如果显示 nav 导航...
            if (options.nav_flag) {
                // 当鼠标定位到 nav 块上的时候，切换到 nav 块所指的内容块;
                if (options.nav_hover) {
                    $navItem.live({
                        mouseenter: function(){
                            var $n_item = $(this);
                            th1 = setTimeout(function(){
                                horizontal($n_item);
                            }, options.delay);
                        },
                        mouseleave: function(){
                            clearTimeout(th1);
                        }
                    });
                }
                if(options.nav_click) {
                    $navItem.live({
                        click: function(){
                            var $n_item = $(this);
                            horizontal($n_item);
                            return false;
                        }
                    });
                }
            } else{
                $nav.hide();
            }

            // 如果需要显示左右箭头...
            if (options.arrow_flag) {
                $arrowLeft.show();
                $arrowRight.show();
                // 左移动
                $arrowLeft.live({
                	click: function(e){
                        var $n_items = $navItem,
                            $cur     = $n_items.filter('.'+cur);
                        $cur = $cur.length ? $cur : $n_items.first();
	                    if (!$cur.prev().length) {
	                        return false;
	                    }
	                    $prev = $cur.prev().length ? $cur.prev() : $n_items.last();
	                    horizontal($prev);//自动水平滑动;
	                    return false;
                	},
                	focus: function(e){
                		$(this).find('a').blur();
                	}
                });
                // 右移动
                $arrowRight.live({
                	click: function(e){
	                    var $n_items = $navItem,
	                        $cur     = $n_items.filter('.'+cur);
	                    $cur = $cur.length ? $cur : $n_items.first();
	
	                    if (!$cur.next().length) {
	                        return false;
	                    }
	                    $next = $cur.next().length ? $cur.next() : $n_items.first();
	                    horizontal($next);//自动水平滑动;
	                    return false;
                	},
                	focus: function(e){
                		$(this).find('a').blur();
                	}
                });
            } else{
                $arrowLeft.hide();
                $arrowRight.hide();
            }
        }
        /**
         * 水平滑动
         * @param  {[type]} $o [description]
         * @return {[type]}    [description]
         */
        function horizontal($o) {
            $o = $o || $navItem.filter('.'+cur) || $navItem.first();
            $o.addClass(cur).siblings().removeClass(cur);
            // 当前滑动所在位置索引;
            var index = $o.index();
            // 当已经移动到最后一个，那么将禁止再向右翻;
            if (index===(nav_num-1)) {
                $arrowRight.addClass(disabled);
                $arrowLeft.removeClass(disabled);
            }
            // 当已经移动到第一个，那么将禁止再向左翻;
            else if (index===0) {
                $arrowLeft.addClass(disabled);
                $arrowRight.removeClass(disabled);
            }
            else {
                $arrowLeft.removeClass(disabled);
                $arrowRight.removeClass(disabled);
            }

            var show_type = parseInt(options.show_type)
            switch(show_type){
                case 1:
                    $big.animate({left:-wrapper_width*index}, 'normal','swing');
                    break;
                case 2:
                    $big.css({'left':'-'+wrapper_width*index+'px'});
                    break;
            }
        }
        /**
         * 自动水平滑动
         * @param  {[type]} $o [description]
         * @return {[type]}    [description]
         */
        function autoHorizontal($o) {
            var $n_items = $navItem,
                $cur     = $n_items.filter('.'+cur);
            $cur = $cur.length ? $cur : $n_items.first();

            $o = (typeof $o !== 'undefined') ? $o : $cur;
            // 水平滑动;
            horizontal($o);
            th2 = setTimeout(function(){
                $o = $o.next().length ? $o.next() : $n_items.first();
                horizontal($o);
                th2 = setTimeout(arguments.callee, options.autodelay);
            }, options.autodelay);
        }
        /**
         * 停止自动滑动
         * @return {[type]} [description]
         */
        function stopAutoHorizontal() {
            // 清除setTimeout句柄，停止循环滑动;
            clearTimeout(th2);
        }
        /**
         * 开始自动滑动
         * @return {[type]} [description]
         */
        function startAutoHorizontal() {
            var $n_items = $navItem,
                $cur     = $n_items.filter('.'+cur);
            $cur = $cur.length ? $cur : $n_items.first();
            autoHorizontal($cur);//自动水平滑动；
        }
        _init();//初始化;

        function YYSlider(){
            var me = this;
            /**
             * [start 开始播放]
             * @return {[type]} [description]
             */
            me.start = function(pos){
                var $n_items = $navItem,
                    $cur     = (pos < nav_num) ? $n_items.eq(pos) : $n_items.first();
                horizontal($cur);
            };
        }

        return slider;
    };
})(jQuery);