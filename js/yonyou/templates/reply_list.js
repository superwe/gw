(function($, YY, util){
    /**
     * 回复列表模版
     * @required YY.util, YY.date
     * @type {{}}
     */
    var feed = YY.feedTemplate;

    /**
     * 动态--回复列表
     * @return {[string]}      返回拼接好的模版字符串;
     */
    /**
    var data = {
        "employeeid":37,
        "collect":{"49":"Jack","56":"Tom"},
        "like":{"34":"Lily","23":"Steven"},
        "reply":[
            {"id":342,"employeeid":45,"name":"Jakert","avatar":"1fheUE9.jpg","parentemployeeid":10,"parentEmployeeName":"HongPeng","content":"I like it","replyTime":"2012-03-12 23:11:28","clientType":4,"image":[],"files":[]},
            {"id":341,"employeeid":40,"name":"LiYang","avatar":"319.jpg","parentemployeeid":30,"parentEmployeeName":"Luce","content":"me too","replyTime":"2013-11-12 13:11:28","clientType":2,"image":[{"view":"","id":1,"filepath":""}],"files":[{"id":1,"title":"文件abc.doc","ext":"doc"},{"id":3,"title":"files.txt","ext":"txt"}]}
        ]
    };
    */

    feed.replyList = function(data){
        var ret = [],
            host = 'http://staticoss.yonyou.com/qiater/',
            clientType = ['网页','IOS','Android','WinPhone','桌面端'];

        ret.push('<div class="clearfix"></div><div class="clearfix replyListContainer">');
        if( data.collect && !$.isEmptyObject(data.collect) ){//收藏
            var temp = [];
            temp.push('<div class="collectContainer">被&nbsp;');
            $.each(data.collect, function(i, o){
                temp.push('<a href="/employee/homepage?id=' + i + '">' + o + '</a>&nbsp;');
            });
            temp.push('收藏了</div>');
            ret.push( temp.join('') );
        }
        if( data.like  && !$.isEmptyObject(data.like) ){//喜欢
            var temp = [];
            temp.push('<div class="likeContainer">被&nbsp;');
            $.each(data.like, function(i, o){
                temp.push('<a href="/employee/homepage?id=' + i + '">' + o + '</a>&nbsp;');
            });
            temp.push('喜欢了</div>');
            ret.push( temp.join('') );
        }
        if( data.reply && !$.isEmptyObject(data.reply) ){//回复列表
            var temp = [];
            temp.push('<ul class="replyListUl">');
            $.each(data.reply, function(i, o){
                temp.push('<li class="clearfix" data="' + o.id + '">');
                temp.push('<img src="' + host + o.imageurl + '.thumb.jpg" alt="' + o.name + '" class="fl avatar" rel="' + host + 'default_avatar.thumb.jpg" onerror="imgError(this);" />');
                temp.push('<div class="grid rightContainer">');
                temp.push('<p><a href="/employee/homepage?id=' + o.employeeId + '">' + o.name + '</a>&nbsp;回复');
                if(o.parentemployeeid && o.parentEmployeeName){
                    temp.push('&nbsp;<a href="/employee/homepage?id=' + o.parentemployeeid + '">' + o.parentEmployeeName + '</a>');
                }
                temp.push('：' + o.content + '</p>');
                //展示图片
                if(o.image && o.image.length){
                    ret.push(feed.pic(o.image));
                }
                //展示文件列表
                if(o.files && o.files.length){
                    ret.push(feed.attachment(o.files));
                }
                //回复时间、操作按钮
                temp.push('<div class="clearfix extendContainer">');
                temp.push('<span class="fl replyRemarks">' + YY.date.format2(o.replytime) + '&nbsp;&nbsp;来自' + clientType[o.clienttype] + '</span>');
                temp.push('<span class="fr hidden relpyOp"><a href="javascript:;" class="relpyOp_reply">回复</a>');
                if(data.employeeid == o.employeeid){
                    temp.push('<a href="javascript:;" class="relpyOp_del">删除</a></span>');
                }
                temp.push('</div>');
                temp.push('</div>');
                temp.push('</li>');
            });
            temp.push('</ul>');
            if(data.more){
                temp.push('<a href="javascript:;" class="more moreReply" module="' + data.module + '" targetid="' + data.targetid + '" page="' + data.page + '">显示更多</a>');
            }
            ret.push( temp.join('') );
        }
        ret.push('</div>');
        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));