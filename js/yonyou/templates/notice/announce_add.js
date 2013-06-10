(function($, YY, util){
    var notice = YY.noticeTemplate;
    /**
     * 动态--添加任务
     * @param  {[object]} data 传入的数据，对象字面量json格式;
     * @return {[string]}      返回拼接好的模版字符串;
     */
    notice.announce_add = function(data){
        var ret = [],
            isnew = '',
            newCalss = 'messageRead';
        if(data.isnew == 1){
            isnew = 'new';
            newCalss = 'newRemind';
        }
        ret.push('<div class="message relative notice-section '+isnew+'" resource-id="'+parseInt(data.noticeid)+'">');
        ret.push('<div class="'+newCalss+'"><span></span></div>');
        ret.push('<div class="newMessageR">');
        ret.push('<div class="fl clearfix user_card content_title">');
        ret.push('<span class="gg_ico fl"></span><a target="_blank" rel="" tips="1" href="">谈旭</a>发布了公告[<a target="_blank" href="">行政公告</a>]<a target="_blank" href="">健康周启动通知</a>');
        ret.push('</div>');
        ret.push('<time>2013-05-06 10:35:27</time>');
        ret.push('</div>');
        ret.push('</div>');
        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));

