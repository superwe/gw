(function($, YY, util){
    var notice = YY.noticeTemplate;
    /**
     * 通知--群组
     * @param  {[object]} data 传入的数据，对象字面量json格式;
     * @return {[string]}      返回拼接好的模版字符串;
     */
    notice.group = function(data){
        var ret = [],
            isnew = '',
            newCalss = 'messageRead';
        if(data.isnew == 1){
            isnew = 'new';
            newCalss = 'newRemind';
        }
		if(data.template == 108201){
        	var s = '加入群组';
        }else if(data.template == 108202){
        	var s = '退出群组';
        }else if(data.template == 108203){
        	var s = '添加您为群组成员';
        }else if(data.template == 108204){
        	var s = '删除您为群组成员';
        }else if(data.template == 108205){
        	var s = '设置您为群组管理员';
        }else if(data.template == 108206){
        	var s = '取消您为群组管理员';
        }
        ret.push('<div class="message relative notice-section '+isnew+'" resource-id="'+parseInt(data.noticeid)+'">');
        ret.push('<div class="'+newCalss+'"><span></span></div>');
        ret.push('<div class="newMessageR">');
        ret.push('<div class="fl clearfix user_card content_title">');
		ret.push('<span class="gg_ico fl"></span><a target="_blank" rel="" tips="1" href="/employee/homepage/index?employeeid=2">'+data.authorname+'</a>'+s+' <a target="_blank" href="/employee/file/view?fileid='+data.id+'">'+data.name+'</a>');
        ret.push('</div>');
        ret.push('<time>'+data.createtime+'</time>');
        ret.push('</div>');
        ret.push('</div>');
        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));

