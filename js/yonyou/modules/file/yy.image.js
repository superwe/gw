(function($, YY, util){
    YY = YY || {};
    /**
     * 图片构造函数对象;
     * @author bull
     */
    YY.Image = function(img_selector){
        var me = this;
        
        var $img = $(img_selector),
            RotateMatrix = {
                '0' : [1, 0, 0, 1],
                '1' : [0, -1, 1, 0],
                '2' : [-1, 0, 0, -1],
                '3' : [0, 1, -1, 0]
            },
            browser = $.browser,
            ie9 = browser.msie && browser.version == 9,
            innerRotate = 0,
            origSize = [0, 0],
            maxSize  = [0, 0],
            innerCanavas = document.createElement('CANVAS');
        $(innerCanavas).hide();
        $img.after(innerCanavas);
        /**
         * 实现图片的旋转;
         */
        me.rotate = function(rotate){
            rotate = innerRotate + rotate;
            rotate = (4 + rotate) % 4;
            innerRotate = rotate;
            var img = $img[0];

            var fixed = me.fixedImgSize(rotate, origSize[0], origSize[1], maxSize[0], maxSize[1]);
            var sourceWidth  = fixed.width,
                sourceHeight = fixed.height;
            if(ie9 || !browser.msie){
                var canvas = innerCanavas,
                    context = canvas && canvas.getContext('2d');

                canvas && $(canvas).css({
                    width  : sourceWidth,
                    height : sourceHeight
                }).attr({'width': sourceWidth,'height': sourceHeight});
                switch (rotate) {
                    case 0:
                        context.drawImage(img, 0, 0, sourceWidth, sourceHeight);
                        break;
                    case 1:
                        context.rotate(270 * Math.PI / 180);
                        context.drawImage(img, -sourceHeight, 0, sourceHeight, sourceWidth);
                        break;
                    case 2:
                        context.rotate(180 * Math.PI / 180);
                        context.drawImage(img, -sourceWidth, -sourceHeight, sourceWidth, sourceHeight);
                        break;
                    case 3:
                        context.rotate(90 * Math.PI / 180);
                        context.drawImage(img, 0, -sourceWidth, sourceHeight, sourceWidth);
                        break;
                }
                $img.hide();
                $(innerCanavas).show();
            }
            else {
                var matrix = RotateMatrix[rotate];
                img.style.filter = 'progid:DXImageTransform.Microsoft.Matrix(M11=' + matrix[0] + ',M21=' + matrix[1] + ',M12=' + matrix[2] + ',M22=' + matrix[3] + ', sizingmethod="auto expand")';
                if (rotate%2 === 0) {
                    $img.css({'width':sourceWidth, 'height':sourceHeight});
                }
                else {
                    $img.css({'width':sourceHeight, 'height':sourceWidth});
                }
                
            }
        };
        /**
         * 重置图片的旋转效果;
         * @return {[type]} [description]
         */
        me.resetStatus = function(){
            innerRotate = 0;
        };
        /**
         * 设置图片的原始尺寸;
         * @param {[type]} orig_width  [description]
         * @param {[type]} orig_height [description]
         */
        me.setOrigSize = function(orig_width, orig_height){
            if(!orig_width || !orig_height) {
                var src = $img.attr('src'),
                    temp_img = new Image();
                temp_img.src = src;
                orig_width  = temp_img.width;
                orig_height = temp_img.height;
            }
            origSize[0] = orig_width;
            origSize[1] = orig_height;
        };
        /**
         * 设置图片能到的最大宽高;
         * @param {[type]} max_width  [description]
         * @param {[type]} max_height [description]
         */
        me.setMaxSize = function(max_width, max_height){
            maxSize[0] = max_width;
            maxSize[1] = max_height;
        };
        /**
         * 修复图片可显示的宽高;
         * @param  {[type]} rotate      [description]
         * @param  {[type]} orig_width  [description]
         * @param  {[type]} orig_height [description]
         * @param  {[type]} max_width   [description]
         * @param  {[type]} max_height  [description]
         * @return {[type]}             [description]
         */
        me.fixedImgSize = function(rotate, orig_width, orig_height, max_width, max_height){
            var width, height;
            if (rotate % 2 === 0) {
                width  = orig_width;
                height = orig_height;
            } else {
                width  = orig_height;
                height = orig_width;
            }
            max_width  = +max_width;
            max_height = +max_height;
            if (width > max_width || height > max_height) {
                // 此处只能用 max_width>0 比较，因为当 max_width 被转换 NaN 的时候，和0的所有比较均为false,
                // 所以判断 max_width>0 为false的时候，那么就表示 max_width 没有被正确设置或者被设置为0，
                // 那么 width 将根据 height 与 max_height 比例设置;
                
                // 最大宽高均正常设置;
                if (max_width > 0 && max_height > 0) {
                    var width_ratio  = width/max_width,
                        height_ratio = height/max_height;
                    if(width_ratio > height_ratio) {
                        width  = max_width;
                        height = height/width_ratio;
                    }
                    else {
                        width  = width/height_ratio;
                        height = max_height;
                    }
                }
                // 最大宽设置异常，最大高设置正常;
                else if (!(max_width > 0) && max_height > 0) {
                    var height_ratio = height/max_height;
                    width  = width/height_ratio;
                    height = max_height;
                }
                // 最大宽设置正常，最大高设置异常;
                else if (max_width > 0 && !(max_height > 0)) {
                    var width_ratio = width/max_width;
                    width  = max_width;
                    height = height/width_ratio;
                }
                // 最大宽高均设置异常...
                else {
                    // do nothing
                }
            }
            return {'width':width, 'height':height};
        };
    };

}(jQuery, YY, YY.util));
