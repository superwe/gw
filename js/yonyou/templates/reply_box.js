(function($, YY, util){
    /**
     * 回复框模版
     * @required YY.util, YY.date
     * @type {{}}
     */
    var feed = YY.feedTemplate;

    /**
     * 动态--回复框
     * @return {[string]}      返回拼接好的模版字符串;
     */

    feed.replyBox = function(){
        var ret = [];
        ret.push('<div class="clearfix replyBoxContainer">');
        ret.push('<div contenteditable="true" class="replyTextArea"></div>');//模拟输入框
        ret.push('<div class="yy-upload-containter"></div>');//上传容器
        //相关按钮
        ret.push('<div class="fl replyBoxBtnContainer">');
        //表情、@人、附件等
        ret.push('<div class="icon fl">');
        ret.push('<a href="javascript:;" class="icon_face" title="添加表情"></a>');
        ret.push('<a href="javascript:;" class="icon_ait" title="@"></a>');
        ret.push('<a href="javascript:;" class="icon_file" title="添加文档"></a>');
        ret.push('</div>');
        //发布按钮
        ret.push('<div class="fr"><input type="hidden" name="fids" value="" /><input type="button" class="button gzGrayButton fr replySubmitBtn" value="发布"></div>');
        ret.push('</div>');

        ret.push('</div>');
        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));