/**
 * 处理头像上传相关业务;
 * @return {[type]} [description]
 */
(function($, YY, util){
    YY = YY || {};

    /**
     * 设置YY.Avatar对象;
     * @param {[type]} crop_options   [description]
     * @param {[type]} upload_options [description]
     */
    YY.Avatar = function(crop_options, upload_options, ui_options) {
        var me = this, Avatar;

        // 预览区域选择器对象数组;
        me.previewSelectors = [];

        var fn = YY.Avatar.prototype;
        if(typeof me.initUpload !== 'function'){
            /**
             * 初始化上传组件;
             * @return {[type]} [description]
             */
            fn.initUpload = function(){
                util.initUpload(function(){
                    new InitUpload(upload_options, upload_ui);
                });
            };
            /**
             * 初始化裁剪组件;
             * @return {[type]} [description]
             */
            fn.initCrop = function(){
                // 加载图片选择插件Jcrop;
                util.loadScript(['jquery/jcrop/jquery.Jcrop.js'], {
                    fn: function(){
                        /**
                         * 头像选择器封装函数;
                         */
                        Avatar = function(opt){
                            var self = this;
                            /**
                             * 
                             * @param  {[type]} select [description]
                             * @return {[type]}        [description]
                             */
                            self.goss = function (){
                                $(ui_options.avatarOrigin).Jcrop(crop_options, function(){
                                    self.api = this;
                                });
                            };
                        };
                    }
                });
            };
            /**
             * 开始上传
             * @param  {[type]} file [description]
             * @return {[type]}      [description]
             */
            fn.upload_start = function (file){
                try {
                    $processContainer.html('上传中，已上传 <span class="percent">0%</span>');
                } catch (ex) {}

                return true;
            };
            /**
             * 上传处理中
             * @param  {[type]} file        [description]
             * @param  {[type]} bytesLoaded [description]
             * @param  {[type]} bytesTotal  [description]
             * @return {[type]}             [description]
             */
            fn.upload_progress = function (file, bytesLoaded, bytesTotal){
                try {
                    var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
                    var str = '';
                    if (percent===100) {
                        str = '，正在处理，请稍候..'
                    }
                    $processContainer.find('.percent').html(percent + "%" + str);
                } catch (ex) {
                    this.debug(ex);
                }
            };
            /**
             * 上传成功
             * @param  {[type]} file       [description]
             * @param  {[type]} serverData [description]
             * @return {[type]}            [description]
             */
            fn.upload_success = function (file, serverData){
                try{
                    serverData = $.parseJSON(serverData);
                    if (typeof serverData.rs!=='undefined' && serverData.rs) {

                        var $avatarButtonLine = $('.yy-button-line', $avatarUploadBlock);

                        $avatarButtonLine.css({
                            'visibility': 'visible'
                        });
                        if(typeof avatarObj!=='undefined' && typeof avatarObj.api!=='undefined'){
                            avatarObj.api.destroy();
                        }

                        var url = serverData.data+'?'+Math.random();
                        // 头像图片上传成功后重新设置图片;
                        $avatarOrigin.removeAttr('style').attr('src', url);
                        // 设置预览区域的图片URL地址;
                        $.each(me.previewSelectors, function(i, o){
                            o.selector.attr('src', url)
                        });

                        $avatarOrigin.on('load',function(){
                            $(ui_options.inputs_bigWidth).val($avatarOrigin.width());
                            $(ui_options.inputs_bigHeight).val($avatarOrigin.height());

                            var filepath = serverData.data.split('qiater')[1];
                            filepath = filepath.substring(1);
                            $(ui_options.inputs_filepath).val(filepath);

                            $processContainer.html('请选择合适区域');

                            // 设置原始头像的宽高;
                            me.setOrigAvatar();
                            var select = me.getOrigSelect();
                            var move_flag = true;
                            crop_options.allowMove = move_flag;
                            // 设置默认裁剪区域;
                            crop_options.setSelect = select;
                            // 激活 头像裁剪功能;
                            avatarObj.goss();
                            $(this).off('load');
                        });
                    }
                } catch(ex){
                    // YY.util.trace('上传错误！');
                    $processContainer.html('很抱歉，您的图片没有上传成功。');
                }
            };
            /**
             * 上传失败;
             * @return {[type]} [description]
             */
            fn.upload_error = function (){
                $processContainer.html('很抱歉，您的图片没有上传成功。');
            };
            /**
             * 设置原始头像的宽高;
             * @return {[type]} [description]
             */
            fn.setOrigAvatar = function (){
                var ref_width  = ui_options.ref_width,
                    ref_height = ui_options.ref_height,
                    orig_width  = $avatarOrigin.width(),
                    orig_height = $avatarOrigin.height();
                me.scale = 1;
                $avatarOrigin.css({'visibility':'visible'});
                // 图片宽高任意一个，大于原始设定的高度
                if (orig_width>ref_width || orig_height>ref_height) {
                    // 如果图片宽<高
                    if(orig_width<orig_height) {
                        $avatarOrigin.css({
                            'height': ref_height
                        });
                        me.scale = ref_height / orig_height;
                    }
                    else {
                        $avatarOrigin.css({
                            'width': ref_width
                        });
                        me.scale = ref_width / orig_width;
                    }
                }
            };
            /**
             * 获取被选中区域坐标;
             * @param  {[type]} min [description]
             * @return {[type]}     [description]
             */
            fn.getOrigSelect = function (){
                var hidden_flag = $avatarOrigin.is(':hidden');
                hidden_flag && $avatarOrigin.show();

                var ref_width  = ui_options.ref_width,
                    ref_height = ui_options.ref_height,
                    orig_width  = $avatarOrigin.width(),
                    orig_height = $avatarOrigin.height(),
                    flag = orig_width < orig_height,
                    min = flag ? orig_width : orig_height, 
                    len = min - 10, 
                    x, x2, y, y2;
                // YY.util.trace(orig_width)
                // YY.util.trace(orig_height)
                if (flag) {
                    x = 5;
                    y = (orig_height - len)/2;
                } else{
                    x = (orig_width - len)/2;
                    y = 5;
                }
                x2 = x + len;
                y2 = y + len;
                hidden_flag && $avatarOrigin.hide();
                
                return [x, y, x2, y2];
            };
            /**
             * 保存头像;
             * @param  {[type]}   url [description]
             * @param  {Function} fn  [description]
             * @return {[type]}       [description]
             */
            fn.saveAvatar = function (url, fn){
                if(!me.checkCoords()){
                    return false;
                }
                var data = {
                    sub: 1, 
                    filepath: $(ui_options.inputs_filepath).val(), 
                    mid: $(ui_options.inputs_mid).val(),
                    uid: $(ui_options.inputs_uid).val(),
                    bigwidth: $(ui_options.inputs_bigWidth).val(),
                    bigheight: $(ui_options.inputs_bigHeight).val(),
                    x: $(ui_options.inputs_x).val(),
                    y: $(ui_options.inputs_y).val(),
                    w: $(ui_options.inputs_w).val(),
                    h: $(ui_options.inputs_h).val()
                };
                if (ui_options.inputs_eventid) {
                    data.eventid = $(ui_options.inputs_eventid).val();
                }
                
                util.ajaxApi(url, function(d){
                        if (d && typeof d.rs!=='undefined' && d.rs) {
                            // 头像保存成功了执行回调~~
                            typeof fn === 'function' && fn(d.data);
                        }
                    }, 'POST', 'json' , data);
            };
            /**
             * 检查是否有选中的坐标;
             * @return {[type]} [description]
             */
            fn.checkCoords = function () {
                if ($(ui_options.inputs_x).val() == ""){
                    alert("请先上传图片然后选择裁切头像最后进行保存！");
                    return false;
                }
                return true;
            };
            /**
             * 更新起始x、y坐标，更新裁剪的高宽;
             * @param  {[type]} c [description]
             * @return {[type]}   [description]
             */
            fn.updateCoords = function(c) {
                var scale = me.scale;

                $("#x").val(c.x/scale);
                $("#y").val(c.y/scale);
                $("#w").val(c.w/scale);
                $("#h").val(c.h/scale);
            };
            /**
             * 显示预览头像;
             * @param  {[type]} coords [description]
             * @return {[type]}        [description]
             */
            fn.showPreview = function(coords) {
                $.each(me.previewSelectors, function(i, o){
                    me.setPreview(coords, o.selector, o.selector_wrap, o.sizes);
                });
            };
            /**
             * 设置预览显示尺寸;
             * @param {[type]} coords         [description]
             * @param {[type]} $selector      [description]
             * @param {[type]} $selector_wrap [description]
             * @param {[type]} size           [description]
             */
            fn.setPreview = function(coords, $selector,$selector_wrap, sizes){
                var me = this;

                var scale = me.scale,
                    preview_size = sizes;
                var preview_x = preview_size[0]/coords.w,
                    preview_y = preview_size[1]/coords.h,
                    preview_scale = preview_x < preview_y ? preview_x : preview_y,

                    big_width = $(ui_options.inputs_bigWidth).val(),
                    big_height = $(ui_options.inputs_bigHeight).val(),

                    w2 = big_width*scale,
                    h2 = big_height*scale;
                //  如果设定显示的最大尺寸与缩放后的图片截取尺寸的比例大于1，那么将比例设置为1，否则按比例缩放；
                preview_scale = preview_scale > 1 ? 1 : preview_scale;
                var aspect_ratio = coords.w/coords.h,
                    // 预览图的高宽;
                    preview_width, preview_height;
                $selector.css({
                    width:  Math.round(preview_scale * w2) + "px",
                    height: Math.round(preview_scale * h2) + "px",
                    marginLeft: "-" + Math.round(preview_scale * coords.x) + "px",
                    marginTop:  "-" + Math.round(preview_scale * coords.y) + "px"
                });
                // 宽大于高;
                if(aspect_ratio>1){
                    var preview_width = preview_scale < 1 ? preview_size[0] : coords.w,
                        preview_height = preview_width/aspect_ratio;
                    $selector_wrap.css({
                        width:  preview_width,
                        height: preview_height,
                        marginTop:  (preview_size[1]-preview_height)/2,
                        marginLeft: (preview_size[0]-preview_width)/2
                    });
                }
                // 高大于宽;
                else {
                    var preview_height = preview_scale < 1 ? preview_size[1] : coords.h,
                        preview_width  = preview_height*aspect_ratio;
                    $selector_wrap.css({
                        width:  preview_width,
                        height: preview_height,
                        marginTop:  (preview_size[1]-preview_height)/2,
                        marginLeft: (preview_size[0]-preview_width)/2
                    });
                }
            };
            /**
             * 初始化预览区域选择器;
             */
            fn.setPreviewSelector = function(){
                var previews = ui_options.previews,
                    i = 0;
                $.each(previews, function(selector, size){
                    me.previewSelectors[i] = {
                        selector: $(selector),
                        selector_wrap: $(selector).parent(),
                        sizes: size
                    };
                    i++;
                });
            };
            /**
             * 绑定事件;
             * @return {[type]} [description]
             */
            fn.bindEvents = function(){
                var $cancelAvatarUpload = $('.yy-cancel-avatar-upload', $avatarUploadBlock);
                /**
                 * 取消头像上传;
                 */
                $cancelAvatarUpload.on({
                    click: function(){
                        window.location.href = window.location.href;
                    }
                });
                // 个人上传头像
                $('#sub').live('click', function(){
                    var url = util.url('/employee/homepage/subHeadImg');
                    me.saveAvatar(url, function(data){
                        $.yy.rscallback('头像保存成功！');
                        window.location.href = window.location.href;
                        // do nothing...
                    });
                });
                // 空间管理--基础管理--企业上传LOGO
                $('#subLogo').live('click', function(){
                    var url = util.url('/setting/base/subthumb');
                    me.saveAvatar(url, function(data){
                        $.yy.rscallback('LOGO保存成功！');
                        window.location.href = window.location.href;
                        // do nothing...
                    });
                });
                // 空间管理--组织架构--创建子空间
                $('#subSpaceLogo').live('click', function(){
                    var url = util.url('/setting/dept/subthumb');
                    me.saveAvatar(url, function(data){
                    	$('#avatarContainter').find('img').attr('src', data.src);
                    	$('#avatarContainter').find('.subSpaceLogo').val(data.path);
                        $.yy.rscallback('LOGO保存成功！');
                        // do nothing...
                    });
                });
                // 引导页面个人上传头像
                $('#sublead').live('click', function(){
                    var url = util.url('/home/subHeadImg');
                    me.saveAvatar(url, function(data){
                        $.yy.rscallback('头像保存成功！');
                        // do nothing...
                    });
                });
                // 引导页面企业上传LOGO
                $('#subLogolead').live('click', function(){
                    var url = util.url('/setting/base/subthumb');
                    me.saveAvatar(url, function(data){
                        $.yy.rscallback('头像保存成功！');
                        // do nothing...
                    });
                });
                // 引导页面上传頂部LOGO
                $('#topLogo').live('click', function(){
                    var url = util.url('/setting/base/topthumb');
                    me.saveAvatar(url, function(data){
                        $.yy.rscallback('顶部log保存成功！');
                        window.location.href = window.location.href;
                        // do nothing...
                    });
                });
            };
            // 裁剪相关的默认配置;
            fn.crop_defaults = {
                aspectRatio: 0,                 // 宽高比例;
                minSize: [0, 0],                // 选择的最小尺寸(若设置为0，则不限);
                maxSize: [0, 0],                // 选择的最大尺寸(若设置为0，则不限);
                // setSelect: [100, 100, 50, 50],  // 初始化选择坐标;
                bgColor: 'black',               // 阴影部分背景颜色;
                bgOpacity: .6,                  // 背景透明度;
                allowSelect: false,             // 是否允许选择;
                onChange: me.showPreview,       // 改变区域时即时执行;
                onSelect: me.updateCoords       // 选择框变动结束时执行;
            };
            // 上传相关的默认配置;
            fn.upload_defaults = {
                file_types : '*.jpg;*.jpeg;*.png;',
                // post_params: {
                //     'sessid' : sessid,
                //     'mid' : mid, 
                //     'uid' : uid
                // },
                file_size_limit : '5 MB',
                button_width: '111',
                button_height: '28',
                button_text_left_padding: '55',
                button_text: '',//<span class="theFont">选择图片</span>
                button_text_style: '',//.theFont { font-size: 12; color:#FFFFFF; }
                button_placeholder_id: 'avatarUploadButton',
                upload_url: util.url('/common/avatar/upload'),
                upload_start_handler: me.upload_start,         // 开始上传
                upload_progress_handler: me.upload_progress,   // 上传ING
                upload_success_handler: me.upload_success,     // 上传成功
                upload_error_handler: me.upload_error          // 上传失败
            };
            // 上传、裁剪相关的ui组件默认配置;
            fn.ui_defaults = {
                // 上传ui组件;
                uploadBlock: '#avatarUploadBlock',    // 头像上传相关的html代码块容器;
                processContainer: '.yy-upload-process-container', // 进度显示容器;
                // 那么些用于保存头像相关信息的元素选择器;
                avatarOrigin: '#avatarOrigin',
                inputs_filepath: '#filepath',
                inputs_mid: '#mid',
                inputs_uid: '#uid',
                inputs_bigWidth: '#bigwidth',
                inputs_bigHeight: '#bigheight',
                inputs_x: '#x',
                inputs_y: '#y',
                inputs_w: '#w',
                inputs_h: '#h',
                ref_width: 288,                 // 原始图片参考缩放宽度;
                ref_height: 288,                // 原始图片参考缩放高度;
                previews: {                     // 设置预览的选择器，和容器宽高，【选择器：[宽,高]】;
                    '#avatarMiddle': [150, 150],// 裁剪的中图尺寸;
                    '#avatarSmall':  [48, 48],  // 小图的尺寸;
                    '#avatarTiny':   [30, 30]   // 最小图的尺寸;
                }
            };
        }
        // 处理ui相关的配置;
        ui_options = typeof ui_options === 'object' ? ui_options : {};
        ui_options = $.extend({}, me.ui_defaults, ui_options);
        me.ui_options = ui_options;
        // 设置预览选择器;
        me.setPreviewSelector();
        // 处理图片裁减相关的配置;
        crop_options = typeof crop_options === 'object' ? crop_options : {};
        crop_options = $.extend({}, me.crop_defaults, crop_options);
        me.crop_options = crop_options;
        // 初始化头像裁减;
        me.initCrop();

        // 处理上传相关的配置;
        upload_options = typeof upload_options === 'object' ? upload_options : {};
        upload_options = $.extend({}, me.upload_defaults, upload_options);
        me.upload_options = upload_options;
        // 上传控件ui组件;
        var upload_ui = {
            uploadBlock: ui_options.uploadBlock,
            processContainer: ui_options.processContainer
        };
        var $mid = $(ui_options.inputs_mid),
            $uid = $(ui_options.inputs_uid);
        upload_options.post_params = upload_options.post_params || {};
                
        upload_options.post_params['sessid'] = $.cookie("session_id") ? $.cookie("session_id") : '';
        //upload_options.post_params['mid'] = $mid.val() ? $mid.val() : '';
        upload_options.post_params['uid'] = $uid.val() ? $uid.val() : '';

        // 初始化上传;
        me.initUpload();
        var $avatarUploadBlock = $(upload_ui.uploadBlock),
            $processContainer = $(upload_ui.processContainer, $avatarUploadBlock),
            $avatarOrigin = $(ui_options.avatarOrigin),
            // scale = 1, // 缩放比例，此为等比缩放，默认为1；
            avatarObj = null;
        me.$avatarUploadBlock = $avatarUploadBlock;
        me.$processContainer  = $processContainer;
        me.$avatarOrigin      = $avatarOrigin;
        me.scale = 1;
        // 初始化头像裁减;
        setTimeout(function(){
            if(typeof Avatar !== 'undefined'){
                avatarObj = new Avatar(crop_options);
            }
            else {
                me.initCrop();
                setTimeout(arguments.callee,100);
            }
        }, 100);
    };
}(jQuery, YY, YY.util));

// $(function(){
//     // 初始化头像模块;
//     var avatar = new YY.Avatar({
//         aspectRatio: 0,                 // 宽高比例;
//         boxWidth: 400,                  //
//         boxHeight: 400,                 //
//         minSize: [48, 48],              // 选择的最小尺寸(若设置为0，则不限);
//         // maxSize: [160, 160],            // 选择的最大尺寸(若设置为0，则不限);
//         bgColor: 'black',               // 阴影部分背景颜色;
//         bgOpacity: .6                   // 背景透明度;
//     }, {
//         // debug: true,
//         // trace_debug: true,
//         button_placeholder_id: 'avatarUploadButton',
//         upload_url: YY.util.url('/common/avatar/upload')
//     }, {
//         previews: {                     // 设置预览的选择器，和容器宽高，【选择器：[宽,高]】;
//             '#avatarMiddle': [150, 150],
//             '#avatarSmall': [48, 48],
//             '#avatarTiny': [30, 30]
//         }
//     });
//     avatar.bindEvents();
// });
