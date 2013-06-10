(function($, YY, util){
    var feed = YY.feedTemplate;

    /**
     * 动态--文档
     * @return {[string]}      返回拼接好的模版字符串;
     */

    feed.files = function(data){
        var ret = [];

		if(data.template == 109101){
        	var s = '上传';
        }else if(data.template == 109102){
        	var s = '更新';
        }else if(data.template == 109103){
        	var s = '下载';
        }else if(data.template == 109104){
        	var s = '关注';
        }else if(data.template == 109105){
        	var s = '共享';
        }
        ret.push('<div id="feed_'+data.feedid+'" class="all container feed-section" resource-id="'+parseInt(data.feedid)+'">');
        ret.push('<div style="width:40px;" class="grid center user_card"><a href="/employee/myhomepage/index.html" tips="1" rel ="/employee/employee/cardInfo/'+data.creatorid+'"><img src="http://static.yonyou.com/qz/'+data.creatorimg+'.thumb.jpg"  onerror="imgError(this);" rel="http://static.yonyou.com/qz/default_avatar.thumb.jpg" class="headPhoto" ></a></div>');
        ret.push('<div class="feeddetail grid">');
        ret.push('<h2 class="clearfix c9 filesharetit">');
        ret.push('<a href="/employee/myhomepage/index.html?creatorid='+data.creatorid+'" class="blueLink yy-name" tips="1" rel="">'+data.creatorname+'</a>'+s+'了文档资料');
        ret.push('</h2>');
        if( data.list && !$.isEmptyObject(data.list) ){//文档列表
            var temp = [];
            temp.push('<ul class="fileshareul">');
            var num = 0;
            $.each(data.list, function(i, o){
				var datetime = YY.date.format2(o.createtime);
                temp.push('<li resource-id="'+parseInt(o.feedid)+'" ');
                if(num >= 3){
                    temp.push(' class="clearfix yy-feed-'+o.feedid+' hidden">');
                }else{
                    temp.push(' class="clearfix">');
                }
                temp.push('<div class="fl fileico"><a class="ico_'+o.filetype+'_s"></a></div>');
                temp.push('<div class="fl filedetail">');
                temp.push('<a class="fl lenname" href="/employee/file/view?fileid='+o.id+'" title="'+o.title+'">'+o.title+'</a>');
                temp.push('<div class="fr c9">'+datetime+'</div>');
                temp.push('</div>');
                temp.push('</li>');
                num++;
            });
            if(num >= 3){
                var last = parseInt(num) - 3;
                temp.push('<li class="borderNone clearfix">');
                temp.push('<a class="fr c9 yy-feed-view" data="'+data.feedid+'" href="##">还有'+last+'条资料，点击这里显示&gt;&gt;</a>');
                temp.push('<a href="##" data="'+data.feedid+'" class="fr c9 yy-feed-view hidden">收起&gt;&gt;</a>');
                temp.push('</li>');
            }
            temp.push('</ul>');
            ret.push( temp.join('') );
        }
        ret.push('</div></div> </div>');
        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));

$('.yy-feed-view').live('click', function(){
    var obj = $(this);
    $('.yy-feed-' + obj.attr('data')).toggleClass('hidden');
    $('#feed_' + obj.attr('data')).find('.yy-feed-view').toggleClass('hidden');
});