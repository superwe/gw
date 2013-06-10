(function($, YY, util){
    var feed = YY.feedTemplate;

    /**
     * 动态--加入空间
     * @return {[string]}      返回拼接好的模版字符串;
     */

    feed.space_join = function(data){
        var ret = [];
        ret.push('<div class="all container feed-section" style="width:608px;">');
        ret.push('<div style="width: 40px;" class="grid center"><a style="cursor: default"><img src="/images/space_default_ico.png"></a></div>');
        ret.push('<div style="width: 540px;margin-bottom:5px;padding-left: 9px;" class="grid">');
        ret.push('<h2 class="clearfix c9 filesharetit">');
        ret.push('<lable style="color: #0178b3">'+data.spacename +'</lable> 加入了新成员');
        ret.push('</h2>');
        if( data.list && !$.isEmptyObject(data.list) ){
            var temp = [];
            temp.push('<ul class="joinSpaceFeed">');
            var num = 0;
            $.each(data.list, function(i, o){
                temp.push('<li class="clearfix user_card" resource-id="'+parseInt(o.feedid)+'">');
                temp.push('<a href="/employee/homepage/index/'+o.id+'.html" tips="1"  rel ="/employee/employee/cardInfo/'+o.id+'">');
                temp.push('<img src="http://staticoss.chanjet.com/qiater/'+o.imageurl+'"  onerror="imgError(this);" rel="http://staticoss.chanjet.com/qiater/default_avatar.thumb.jpg">');
                temp.push('<p>'+o.name+'</p>');
                temp.push('</a>');
                temp.push('</li>');
                num++;
            });
            temp.push('</ul>');
            ret.push( temp.join('') );
        }
        ret.push('</div></div>');
        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));
