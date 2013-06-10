(function($, YY, util){
    var notice = YY.noticeTemplate;
    /**
     * 通知--群组
     * @param  {[object]} data 传入的数据，对象字面量json格式;
     * @return {[string]}      返回拼接好的模版字符串;
     */

    notice.employee = function(data){
        var ret = [],
            isnew = '',
            newCalss = 'messageRead';
        if(data){
            if(data.isnew == 1){
                isnew = 'new';
                newCalss = 'newRemind';
            }
            ret.push('<div class="message relative notice-section ' + isnew + '" resource-id="'+parseInt(data.noticeid)+'">');
            ret.push('<div class="'+newCalss+'"><span></span></div>');
            ret.push('<div class="newMessageR noticeEmployeeContainer">');
            ret.push('<h3>您有<span class="noticeNum">' + data.list.length + '</span>个新粉丝</h3>');
            ret.push('<ul class="user_card">');
            $.each(data.list, function(i, o){
                ret.push('<li><a href="/employee/homepage/index?employeeid=' + o.id + '" tips="1"  rel ="/employee/employee/cardInfo/'+o.id+'"><img src="http://static.yonyou.com/qz/' + o.imageurl + '" onerror="imgError(this);" rel="http://static.yonyou.com/qz/default_avatar.thumb.jpg" class="headPhoto" alt="' + o.name + '" /></a><br/><a href="/employee/homepage/index?employeeid=' + o.id + '">' + o.name + '</a></li>');
            });
            ret.push('</ul>');
            ret.push('<p class="remark">' + data.createtime  + '</p>');
            ret.push('</div>');
            ret.push('</div>');
        }
        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));

