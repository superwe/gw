(function($, YY, util){
    var notice = YY.noticeTemplate;
    /**
     * 动态--添加任务
     * @param  {[object]} data 传入的数据，对象字面量json格式;
     * @return {[string]}      返回拼接好的模版字符串;
     */
    notice.task_refuse = function(data){
        var ret = [],
            isnew = '',
            newCalss = 'messageRead';
        if(data.isnew == 1){
            isnew = 'new';
            newCalss = 'newRemind';
        }
        if(data.template == 107204){
            var op = '拒绝了您对',
                what = '任务的邀请';
        }else if(data.template == 107210){
            var op = '驳回了任务',
                what = '';
        }
        ret.push('<div class="message relative notice-section '+isnew+'" resource-id="'+parseInt(data.noticeid)+'">');
        ret.push('<div class="'+newCalss+'"><span></span></div>');
        ret.push('<div class="newMessageR">');
        ret.push('<div class="fl clearfix user_card content_title">');
        ret.push('<span class="gg_ico fl"></span><a target="_blank" href="/employee/myhomepage/index/'+data.authorid+'.html" tips="1" rel ="/employee/employee/cardInfo/'+data.authorid+'">'+data.authorname+'</a> '+op+'"<a href="/employee/task/info?tid='+data.id+'" target="_blank">'+data.title+'</a>"' + what);
//        {$notice.data.note1 = unserialize($notice.data.note)}
//        {if $notice.data.note && !is_array($notice.data.note1)}，拒绝理由为：{$notice.data.note|stripslashes}{/if}');
        ret.push('</div>');
        ret.push('<time>'+data.createtime+'</time>');
        ret.push('</div>');
        ret.push('</div>');
        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));

