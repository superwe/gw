(function($, YY, util){
    var feed = YY.feedTemplate;

    /**
     * 动态--加入群组
     * @return {[string]}      返回拼接好的模版字符串;
     */

    feed.group = function(data){
        var ret = [];
        if(data.template == 108101){
        	var s = '创建';
        }else{
        	var s = '加入';
        }
        ret.push('<div class="all container feed-section">');
        ret.push('<div style="width: 40px;" class="grid center user_card"><a href="/employee/myhomepage/index.html" tips="1" rel ="/employee/employee/cardInfo/'+data.creatorid+'"><img src="http://static.yonyou.com/qz/'+data.creatorimg+'"  onerror="imgError(this);" rel="http://static.yonyou.com/qz/default_avatar.thumb.jpg" class="headPhoto" ></a></div>');
        ret.push('<div class="feeddetail grid">');
        ret.push('<h2 class="clearfix c9 filesharetit">');
        ret.push('<a href="/employee/myhomepage/index.html?creatorid='+data.creatorid+'" class="blueLink yy-name" tips="1" rel="">'+data.creatorname+'</a>'+s+'了群组');
        ret.push('</h2>');
        if( data.list && !$.isEmptyObject(data.list) ){//关注列表
            var temp = [];
            temp.push('<ul class="groupFeedList">');
            var num = 0;
            $.each(data.list, function(i, o){
                temp.push('<li class="clearfix" resource-id="'+parseInt(o.feedid)+'">');
                temp.push('<a href="/employee/group/index?id='+o.id+'" title="'+o.name+'">');
                temp.push('<img src="http://static.yonyou.com/qz/'+o.logourl+'" alt="'+o.name+'" rel="/images/defaultGroup.gif" onerror="imgError(this);">');
                temp.push('<p>'+o.name+'</p>');
                temp.push('</a>');
                temp.push('</li>');
                num++;
            });
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