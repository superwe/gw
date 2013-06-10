(function($, YY, util){
    var notice = YY.noticeTemplate;
    /**
     * 通知--文档
     * @param  {[object]} data 传入的数据，对象字面量json格式;
     * @return {[string]}      返回拼接好的模版字符串;
     */
    notice.files = function(data){
        var ret = [],
            isnew = '',
            newCalss = 'messageRead',
			type = 1;
        if(data.isnew == 1){
            isnew = 'new';
            newCalss = 'newRemind';
        }
		if(data.template == 109201){
        	var s = '共享文档';
        }else if(data.template == 109202){
        	var s = '取消共享文档';
        }else if(data.template == 109203){
			type = 2;
        	var s = '评论您的文档';
        }else if(data.template == 109204){
			type = 2;
        	var s = '评论了您对文档的评论';
        }else if(data.template == 109205){
			type = 2;
        	var s = '更新了文档版本';
        }
        ret.push('<div class="message relative notice-section '+isnew+'" resource-id="'+parseInt(data.noticeid)+'">');
        ret.push('<div class="'+newCalss+'"><span></span></div>');
        ret.push('<div class="newMessageR">');
        ret.push('<div class="fl clearfix user_card content_title">');
		if(type == 1){
			ret.push('<span class="gg_ico fl"></span><a target="_blank" rel="" tips="1" href="/employee/homepage/index?employeeid=2">'+data.authorname+'</a>'+s+' <a target="_blank" href="/employee/file/view?fileid='+data.id+'">'+data.title+'</a> 给您');
		}
		if(type == 2){
			ret.push('<span class="gg_ico fl"></span><a target="_blank" rel="" tips="1" href="/employee/homepage/index?employeeid=2">'+data.authorname+'</a>'+s+' <a target="_blank" href="/employee/file/view?fileid='+data.id+'">'+data.title+'</a>');
		}
        ret.push('</div>');
        ret.push('<time>'+data.createtime+'</time>');
        ret.push('</div>');
        ret.push('</div>');
        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));

