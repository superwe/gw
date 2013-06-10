/**
 * 处理图片预览相关业务;
 * 
 * @author qiutao qiutao@chanjet.com
 */
;(function($, YY, util){
    YY = YY || {};

    /**
     * 图片弹出预览框模块;
     * @param  {[type]} $    [description]
     * @param  {[type]} YY   [description]
     * @param  {[type]} util [description]
     * @return {[type]}      [description]
     */
    YY.PreviewBox = function(options){
        options = options || {};
        var me = this;

        var defaults = {
            'wrap': '.yy-pic-preview',
            'turn_right': '.yy-turnright',
            'turn_left': '.yy-turnleft',
            'arrow_left': '.yy-arrow-left',
            'arrow_right': '.yy-arrow-right',
            'big_preview': '.yy-big-preview',
            'nav_arrow_left': '.yy-nav-arrow-left',
            'nav_arrow_right': '.yy-nav-arrow-right',
            'nav_wrap': '.yy-nav-wrapper',
            'nav_list': '.yy-nav-list',
            'operation_line': '.yy-img-operation',
            'pack_up': '.yy-pack-up',
            'max_width': '',
            'max_height': '',
            'count': 5
        };
        me.options = options = $.extend(defaults, options);

        var $wrap = me.$wrap = $(options.wrap);                     // 图片预览的;
        me.$turn_left  = $(options.turn_left, $wrap);               // 左旋转
        me.$turn_right = $(options.turn_right, $wrap);              // 右旋转
        me.$arrow_left  = $(options.arrow_left, $wrap);             // 图片左翻
        me.$arrow_right = $(options.arrow_right, $wrap);            // 图片右翻
        me.$nav_arrow_left  = $(options.nav_arrow_left, $wrap);     // 导航左翻
        me.$nav_arrow_right = $(options.nav_arrow_right, $wrap);    // 导航右翻
        me.$nav_wrap = $(options.nav_wrap, $wrap);
        me.$nav_list = $(options.nav_list, me.$nav_wrap);           // 导航ul块
        me.$nav_item = $('li', me.$nav_list);                       // 导航项
        me.$big_preview = $(options.big_preview, $wrap);            //
        me.$img_big = $('img', me.$big_preview);                    // 大图
        me.$operation_line = $(options.operation_line, $wrap);      // 操作行

        var fn = YY.PreviewBox.prototype;
        if(typeof fn.init !== 'function'){
            /**
             * 初始化，加载依赖，绑定事件;
             * @return {[type]} [description]
             */
            fn.init = function(fn){
                var me = this;

                me.loadDependence(['lib/yy.image.js'], function(){
                    var $img = me.$img_big;

                    var img_obj = me.img_obj = new YY.Image($img),
                        options = me.options,
                        max_width  = options.max_width,
                        max_height = options.max_height;
                    // 缓存canvas对象;
                    me.$canvas_big = $img.siblings().eq(0);
                    // 设置图片可以显示的最大高宽;
                    img_obj.setMaxSize(max_width, max_height);

                    me.eventBind();

                    typeof fn === 'function' && fn();
                });
            };
            /**
             * 加载依赖的模块，并执行相应的回调函数;
             * @param  {[type]}   dependence [description]
             * @param  {Function} callback   [description]
             * @return {[type]}              [description]
             */
            fn.loadDependence = function(dependence, callback){
                util.loadScript(dependence, {
                    fn: function(){
                        typeof callback === 'function' && callback();
                    }
                });
            };
            /**
             * 根据图片地址，获取其宽高尺寸，然后执行回调函数;
             * @param  {[type]} url [description]
             * @return {[type]}     [description]
             */
            fn.getImageOrigSize = function(url, callback){
                var temp_img = new Image();
                temp_img.src = url;

                var orig_width, orig_height;
                setTimeout(function(){
                    // 获取图片的原始高宽;
                    orig_width  = temp_img.width;
                    orig_height = temp_img.height;
                    if (orig_width) {
                        typeof callback === 'function' && callback(orig_width, orig_height);
                    }
                    else {
                        setTimeout(arguments.callee, 100);
                    }
                }, 100);
            };
            /**
             * 获取图片实际可显示尺寸;
             * @param  {[type]} orig_width  [description]
             * @param  {[type]} orig_height [description]
             * @return {[type]}             [description]
             */
            fn.getImageShowSize = function(orig_width, orig_height){
                var me = this;

                var width  = orig_width, // 图片的原始宽;
                    height = orig_height,// 图片的原始高;
                    options = me.options,
                    max_width  = options.max_width, // 图片可显示的最大宽;
                    max_height = options.max_height;// 图片可显示的最大高;
                // 将大于最大高度或者最大宽度的图片等比缩放;
                if (orig_width > max_width || orig_height > max_height) {
                    var width_ratio  = orig_width/max_width,
                        height_ratio = orig_height/max_height;
                    if(width_ratio > height_ratio) {
                        width  = max_width;
                        height = orig_height/width_ratio;
                    }
                    else {
                        width  = orig_width/height_ratio;
                        height = max_height;
                    }
                }
                return [width, height];
            };
            /**
             * 设置图片的实际可显示尺寸;
             * @param {[type]} orig_width  [description]
             * @param {[type]} orig_height [description]
             */
            fn.setImageSize = function(orig_width, orig_height){
                var me = this;

                // 获取可显示尺寸;
                var showSize = me.getImageShowSize(orig_width, orig_height),
                    width  = showSize[0],
                    height = showSize[1];

                me.$img_big.css({'width': width,'height': height}).fadeIn(10);//.show();
                me.$canvas_big.css({'width': width,'height': height});

                var img_obj = me.img_obj;
                // 重置图片的旋转状态;
                img_obj.resetStatus();
                // 设置图片的原始尺寸;
                img_obj.setOrigSize(orig_width, orig_height);
            };
            /**
             * 设置查看详情URL;
             * @param {[type]} $item [description]
             */
            fn.setViewDetail = function($item){
                var me = this;

                // 设置查看原图的地址;
                var href = $item.attr('rel');
                var $view_orig = me.$operation_line.find('.yy-view-orig');
                $view_orig.attr('href', href);
            };
            /**
             * 设置下载URL;
             * @param {[type]} $item [description]
             */
            fn.setDownloadUrl = function($item){
                var me = this;

                // 设置查看原图的地址;
                var fid = $item.attr('fid');
                var $download = me.$operation_line.find('.yy-download'),
                    download_baseurl = me.download_baseurl;
                if (typeof download_baseurl === 'undefined') {
                    download_baseurl = $download.attr('href');
                    var last_slash_pos = download_baseurl.lastIndexOf('/');

                    me.download_baseurl = download_baseurl = download_baseurl.substring(0, last_slash_pos)+'/';
                }
                $download.attr('href', download_baseurl+fid);
            };
            /**
             * 事件绑定;
             * @return {[type]} [description]
             */
            fn.eventBind = function(){
                var me = this;
                
                var $nav_list = me.$nav_list,             // 包含 nav_item 的 nav 块;
                    $nav_item = me.$nav_item,   // 导航项
                    nav_item_count = $nav_item.length;              // nav项目条的总数量;

                var one_flag = nav_item_count === 1 ? true : false;

                var $dtBImg = $('.dtBImg', me.$wrap),
                    $big_img_area = $('.dImgList', me.$wrap);

                var nav_wrapper_width = me.$nav_wrap.width(),      // wrapper的宽度;
                    nav_wrapper_item_count = me.options.count,     // wrapper中能显示item数量;
                    ul_index = 0,                 // nav ul在wrapper中的位置;
                    block_count = Math.floor(nav_item_count/nav_wrapper_item_count); // 导航能翻转的页数;

                // 点击预览小图，查看完整大图;
                $nav_item.on({
                    click: function(e){
                        var $item = $(this),
                            url = $item.find('img').attr('src');
                        url = url.split('.thumb.jpg')[0];

                        var $img_big = me.$img_big,
                            big_url  = $img_big.attr('src');

                        $dtBImg.show();

                        // 如果只有一张图片
                        if (one_flag) {
                            me.$nav_wrap.hide();
                        }
                        // 多张图片
                        else {
                            $item.addClass('cur').find('a').append('<span></span>');
                            $item.siblings().removeClass('cur').find('span').remove();
                        }
                        if (url === big_url) {
                            return false;
                        }
                        var item_index = $item.index();
                        
                        if (item_index===0 || item_index===(nav_item_count-1)) {
                            // 第一张
                            if(item_index===0) {
                                me.$arrow_left.addClass('non').hide();
                            }
                            // 最后一张
                            if (item_index===(nav_item_count-1)) {
                                me.$arrow_right.addClass('non').hide();
                            }
                        }
                        // 其他位置
                        else {
                            me.$arrow_left.removeClass('non');
                            me.$arrow_right.removeClass('non');
                        }
                        // 设置导航ul在导航块中的位置;
                        // ul_index = Math.ceil((item_index+1)/nav_wrapper_item_count)-1;

                        // 设置下载地址;
                        me.setDownloadUrl($item);
                        // 设置查看详情的;
                        me.setViewDetail($item);

                        var $canvas_big = me.$canvas_big;
                        // 初始化图片和canvas的状态;
                        $canvas_big.hide();
                        $img_big.removeAttr('style').hide().attr('src', url);//

                        // 根据图片地址，获取其宽高尺寸，然后执行回调函数;
                        me.getImageOrigSize(url, function(orig_width, orig_height){
                            // 设置图片的实际可显示尺寸;
                            me.setImageSize(orig_width, orig_height);
                        });
                    }
                });
                // 在大图上的移入移出事件;
                $big_img_area.on({
                    mouseenter: function() {
                        var $arrow_left  = me.$arrow_left,
                            $arrow_right = me.$arrow_right;
                        if (!$arrow_left.hasClass('non')) {
                            $arrow_left.show();
                        }
                        if (!$arrow_right.hasClass('non')) {
                            $arrow_right.show();
                        }
                    },
                    mouseleave: function() {
                        me.$arrow_left.hide();
                        me.$arrow_right.hide();
                    }
                });
                // 向左切换图片;
                me.$arrow_left.on({
                    click: function(e) {
                        var pos = $nav_item.filter('.cur').index();
                        if (pos===0) {
                            return false;
                        }
                        var new_pos = pos-1;
                        if (new_pos!==(nav_item_count-1)) {
                            me.$arrow_right.show();
                        }
                        $nav_item.eq(new_pos).click();

                        var num = Math.floor((new_pos)/nav_wrapper_item_count);
                        if (num < ul_index) {
                            me.$nav_arrow_left.click();
                        }
                    }
                });
                // 向右切换图片;
                me.$arrow_right.on({
                    click: function(e) {
                        var pos = $nav_item.filter('.cur').index();
                        if (pos===(nav_item_count-1)) {
                            return false;
                        }
                        var new_pos = pos+1;
                        if (new_pos!==0) {
                            me.$arrow_left.show();
                        }
                        $nav_item.eq(new_pos).click();

                        var num = Math.floor((new_pos)/nav_wrapper_item_count);
                        if (num > ul_index) {
                            me.$nav_arrow_right.click();
                        }
                    }
                });
                // 小图导航左移动
                me.$nav_arrow_left.on({
                    click: function() {
                        if (ul_index && ul_index--) {
                            if (ul_index === 0) {
                                $(this).hide();
                            }
                            if (ul_index !== block_count) {
                                me.$nav_arrow_right.show();
                            }
                            $nav_list.animate({left:-nav_wrapper_width*ul_index}, 'normal', 'swing');
                            if ($dtBImg.is(':visible')) {
                                $nav_item.eq(nav_wrapper_item_count*(ul_index+1)-1).click();
                            }
                        }
                    }
                });
                // 小图导航右移动
                me.$nav_arrow_right.on({
                    click: function() {
                        if (ul_index < block_count) {
                            ul_index++;
                            if (ul_index !== 0) {
                                me.$nav_arrow_left.show();
                            }
                            if (ul_index === block_count) {
                                $(this).hide();
                            }
                            $nav_list.animate({left:-nav_wrapper_width*ul_index}, 'normal', 'swing');
                            if ($dtBImg.is(':visible')) {
                                $nav_item.eq(nav_wrapper_item_count*ul_index).click();
                            }
                            
                        }
                    }
                });
                // 图片左旋转
                me.$turn_left.on({
                    click: function(){
                        me.img_obj.rotate(1);
                    }
                });
                // 图片右旋转
                me.$turn_right.on({
                    click: function(){
                        me.img_obj.rotate(-1);
                    }
                });
                // 收起;
                var $pack_up = $('.yy-pack-up', me.$operation_line);
                if(one_flag) {
                    $pack_up = $pack_up.add($big_img_area);
                }
                $pack_up.on({
                    click: function() {
                        $dtBImg.hide();
                        $nav_item.removeClass('cur').find('span').remove();
                        if (one_flag) {
                            me.$nav_wrap.show();
                        }
                    }
                });
            };
        }
    };
}(jQuery, YY, YY.util));


// $(function(){
//     var options = {
//             'wrap': '.yy-pic-preview',
//             'turn_right': '.yy-turnright',
//             'turn_left': '.yy-turnleft',
//             'arrow_left': '.yy-arrow-left',
//             'arrow_right': '.yy-arrow-right',
//             'big_preview': '.yy-big-preview',
//             'nav_arrow_left': '.yy-nav-arrow-left',
//             'nav_arrow_right': '.yy-nav-arrow-right',
//             'nav_wrap': '.yy-nav-wrapper',
//             'nav_list': '.yy-preview-nav',
//             'operation_line': '.yy-img-operation',
//             'max_width': 522,
//             'max_height': 395
//         };
//     var prev_obj = new YY.PreviewBox(options);

//     prev_obj.init();
// });