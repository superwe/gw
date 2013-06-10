/**
 * Created with JetBrains PhpStorm.
 * User: lixiao1
 * Date: 13-5-2
 * Time: 下午4:50
 * To change this template use File | Settings | File Templates.
 */
(function($, YY, util){
    $(function(){
     // 初始化头像模块;
     var avatar = new YY.Avatar({
         aspectRatio:1,                 // 宽高比例;
         boxWidth: 400,                  //
         boxHeight: 400,                 //
         minSize: [48, 48],              // 选择的最小尺寸(若设置为0，则不限);
         maxSize: [150, 150],            // 选择的最大尺寸(若设置为0，则不限);
         bgColor: 'black',               // 阴影部分背景颜色;
         bgOpacity: .6                   // 背景透明度;
     }, {
         //debug: true,
         // trace_debug: true,
         button_placeholder_id: 'avatarUploadButton',
         upload_url: YY.util.url('/employee/homepage/uploadHeadImg')
     }, {
         processContainer: '.yy-upload-process-container',
         previews: {                     // 设置预览的选择器，和容器宽高，【选择器：[宽,高]】;
             '#avatarMiddle': [150, 150],
             '#avatarSmall': [48, 48],
             '#avatarTiny': [30, 30]
         }
     });
     avatar.bindEvents();
});
}(jQuery, YonYou, YonYou.util));