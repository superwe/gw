(function($, YY, util){
    var notice = YY.noticeTemplate;
    /**
     * 通知--群组
     * @param  {[object]} data 传入的数据，对象字面量json格式;
     * @return {[string]}      返回拼接好的模版字符串;
     */

    notice.reply_add = function(data){
        var ret = [],
            isnew = '',
            newCalss = 'messageRead';
        if(data){
            if(data.isnew == 1){
                isnew = 'new';
                newCalss = 'newRemind';
            }
            ret.push('<div class="message relative notice-section '+isnew+'" resource-id="'+parseInt(data.noticeid)+'">');
            ret.push('<div class="' + newCalss + '"><span></span></div>');
            ret.push('<div class="newMessageR">');
            if(1 == 1){
                ret.push('<h3><a href="#">翟延彬</a>在一条发言中提到了您</h3>');
            } else{
                ret.push('<h3><a href="#">翟延彬</a>在任务<a href="#">全球邮空间推送邮件功能测试</a>的回复中提到了您</h3>');
            }
            ret.push('<div class="replyContainer">');
            ret.push('<ul>');
            $.each(data.list, function(i, o){
                ret.push('<li>');
                ret.push('<a href="#" class="grid floatL"><img src="" alt="" /></a>');
                ret.push('<div class="grid floatR"><a href="#">毕胜华</a>：三大法撒旦发的撒斯蒂芬森达发的撒斯蒂芬森达发的撒斯蒂芬森达发的撒斯蒂芬森达发的撒斯蒂芬森达发的撒斯蒂芬森达撒旦法大赛斯蒂芬撒三大法撒旦法撒旦斯蒂芬<br/>2013-05-16 12:32:12</div>');
                ret.push('</li>');
            });
            ret.push('</ul>');
            ret.push('<p class="">查看详情&gt;&gt;</p>');
            ret.push('</div>');
            ret.push('<p class="remark">' + data.createtime  + '</p>');
            ret.push('</div>');
            ret.push('</div>');
        }
        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));