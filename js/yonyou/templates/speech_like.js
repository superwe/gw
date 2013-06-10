(function($, YY, util){
    var feed = YY.feedTemplate;
    /**
     * 动态--喜欢发言
     * @param  {[object]} data 传入的数据，对象字面量json格式;
     * @return {[string]}      返回拼接好的模版字符串;
     */
    feed.speech_like = function(data){
        var ret = [];
        var employeeId = data['creatorid'],    // 人员ID
            employeeName = data['creatorname'],    // 人员姓名
            employeeImageurl = data['creatorimg'],//人员头像url
            likeList = data['list']; // 喜欢的数据列表

        ret.push('<div class="all container user_card likediv feed-section" resource-id="'+parseInt(data.feedid)+'">');
            ret.push('<div class="grid" style="width: 40px;">');
                ret.push('<a tips="1" href ="/employee/homepage/index/'+employeeId+'.html"  rel="'+'/employee/employee/cardInfo/'+employeeId+'">');
                    ret.push('<img class="headPhoto"  src="http://staticoss.yonyou.com/qiater/'+employeeImageurl+'" onerror="imgError(this);" rel="http://staticoss.chanjet.com/qiater/default_avatar.thumb.jpg"  title="'+employeeName+'" >');
                ret.push('</a>');
            ret.push('</div>');

            ret.push('<div class="grid likeInfo" >');
                ret.push('<div style="font-size: 14px;">');
                    ret.push('<a style="color: #0178B3;" href="/employee/homepage/index/'+employeeId+'.html" tips="1" rel="'+'/employee/employee/cardInfo/'+employeeId+'">'+employeeName+'</a>喜欢了发言');
                ret.push('</div>');
                $.each(likeList, function(i, item){
                    ret.push('<div class ="likeDetail">');
                        ret.push('在<a >'+item.groupname+'</a>中喜欢了'+'<a>'+item.feedCreatorName+'</a>的发言: '+'<a>'+item.feedContent+'</a>');
                    ret.push('</div>');
                    ret.push('<a class="likeTime">'+item.createtime.substr(0,10)+'</a>');
                });
            ret.push('</div>');
        ret.push('</div>');

        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));