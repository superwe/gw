(function($, YY, util){
    var notice = YY.noticeTemplate;
    /**
     * 动态--添加任务
     * @param  {[object]} data 传入的数据，对象字面量json格式;
     * @return {[string]}      返回拼接好的模版字符串;
     */
    notice.task_op = function(data){
        var ret = [],
            isnew = '',
            newCalss = 'messageRead';
        if(data.isnew == 1){
            isnew = 'new';
            newCalss = 'newRemind';
        }
        if(data.template == 107202){
            var op = '在任务',
                title = '"<a href="/employee/task/info?tid='+data.id+'">'+data.title+'</a>"中知会了您';
        }else if(data.template == 107203){
            var op = '接受了您对任务',
                title = '"<a href="/employee/task/info?tid='+data.id+'">'+data.title+'</a>"的邀请';
        }else if(data.template == 107206){
            var op = '关闭了任务',
                title = '"'+data.title+'"';
        }else if(data.template == 107207){
            var op = '开启了任务',
                title = '"<a href="/employee/task/info?tid='+data.id+'">'+data.title+'</a>"';
        }else if(data.template == 107208){
            var op = '删除了任务',
                title = '"'+data.title+'"';
        }else if(data.template == 107209){
            var op = '审核通过了任务',
                title = '"<a href="/employee/task/info?tid='+data.id+'">'+data.title+'</a>"';
        }
        ret.push('<div class="message relative notice-section '+isnew+'" resource-id="'+parseInt(data.noticeid)+'">');
        ret.push('<div class="'+newCalss+'"><span></span></div>');
        ret.push('<div class="newMessageR">');
        ret.push('<div class="fl clearfix user_card content_title">');
        ret.push('<span class="gg_ico fl"></span><a target="_blank" href="/employee/myhomepage/index/'+data.authorid+'.html" tips="1" rel ="/employee/employee/cardInfo/'+data.authorid+'">'+data.authorname+'</a> '+op+title+'');
        ret.push('</div>');
        ret.push('<time>'+ YY.date.format2(data.createtime) +'</time>');
        ret.push('</div>');
        ret.push('</div>');
        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));

