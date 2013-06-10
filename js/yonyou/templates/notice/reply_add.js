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
            var replyModule = '',
                moduleUrl = '',
                moduleTitle = '';
            if(data.replyModule == 103){
                replyModule = '信息';
                moduleUrl = '/employee/speech/' + data.replyTargetid;
            }else if(data.replyModule == 107){
                replyModule = '任务';
                moduleUrl = '/employee/task/info?tid=' + data.replyTargetid;
            }
            ret.push('<div class="message relative notice-section '+isnew+'" resource-id="'+parseInt(data.noticeid)+'">');
            ret.push('<div class="' + newCalss + '"><span></span></div>');
            ret.push('<div class="newMessageR">');
            ret.push('<div class="fl clearfix user_card content_title"><span class="fl"></span><a target="_blank" href="/employee/myhomepage/index/'+data.authorid+'.html" tips="1" rel ="/employee/employee/cardInfo/'+data.authorid+'">'+data.authorname+'</a>回复了您的'+replyModule+'<br><a href="'+moduleUrl+'">'+data.moduleTitle+'</a></div>');
            ret.push('<div class="replyContainer fl">');
            ret.push('<ul>');
            $.each(data.list, function(i, o){
                ret.push('<li>');
                ret.push('<a href="#" class="grid floatL"><img src="" alt="" /></a>');
                ret.push('<div class="grid floatR"><a href="#">'+data.authorname+'</a>：'+o.content+'<br/>'+ o.replytime+'</div>');
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