(function($, YY, util){
    var feed = YY.feedTemplate;

    /**
     * 图片预览模版
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    feed.pic = function(data){
        var ret = [];
        if ((data instanceof Array) && data.length) {
            var count = data.length;
            ret.push('<div class="yy-pic-preview yy-non-actived">');
                ret.push('<div class="dtBImg" style="display:none;">');
                    ret.push('<div class="yy-img-operation imgOpeBox clearfix">');
                        ret.push('<div class="fl action-line">');
                        ret.push('<a class="yy-pack-up" href="javascript:;">收起</a>');
                        ret.push('<a class="yy-view-orig" target="_blank" href="javascript:;">查看详情</a>');
                        ret.push('<a class="op3 yy-download" href="{url url="/file/act/down"}/fid/">下载</a>');
                    ret.push('</div>');
                    ret.push('<div class="fl opb">');
                        ret.push('<a class="yy-turnleft" href="javascript:;">左转</a>');
                        ret.push('<a class="yy-turnright" href="javascript:;">右转</a>');
                    ret.push('</div>');
                ret.push('</div>');
                ret.push('<div class="relative">');
                    ret.push('<a class="yy-arrow-left" href="javascript:;" style="display:none;"></a>');
                    ret.push('<div class="yy-big-preview">');
                        ret.push('<a href="javascript:;" class="yy-big-pic-inner',(count===1?' smallIcon':''),'"><img src=""></a>');
                    ret.push('</div>');
                    ret.push('<a class="yy-arrow-right" href="javascript:;" style="display:none;"></a>');
                ret.push('</div>');
            ret.push('</div>');
            ret.push('<div class="xImgList relative">');
                ret.push('<a class="yy-nav-arrow-left" style="display:none;" href="javascript:;"></a>');
                ret.push('<div class="yy-nav-wrapper relative">');
                    ret.push('<ul class="clearfix yy-nav-list">');
                        $.each(data, function(i, item){
                            ret.push('<li rel="',item['view'],'" fid="',item['id'],'"><a href="javascript:;"',(count===1?' class="bigIcon"':''),'><img src="',item['filepath'],'"></a></li>');
                        });
                    ret.push('</ul>');
                ret.push('</div>');
                ret.push('<a class="yy-nav-arrow-right"',(count<5?' style="display:none;"':''),' href="javascript:;"></a>');
                ret.push('<p class="dtImgNum">共',count,'张图片</p>');
            ret.push('</div>');
            ret.push('</div>');
        }

        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));



/*
data [
    {'view': '', 'id': 1, 'filepath': ''}
]
 */