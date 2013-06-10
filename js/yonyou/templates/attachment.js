(function($, YY, util){
    var feed = YY.feedTemplate;

    /**
     * 附件列表
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    feed.attachment = function(data){
        var ret = [];

        if ((data instanceof Array) && data.length) {
            ret.push('<ul class="new_dt_fj">');
            $.each(data, function(i, item){
                ret.push('<li class="attachment-item">');

                    ret.push('<div class = "file">')

                        ret.push('<span class="fl logo">');
                            ret.push('<a class="ico_',item['ext'],'_s">');
                            ret.push('</a>');
                        ret.push('</span>');

                        ret.push('<div class="fl secr operation">');
                            ret.push('<a class="fl name" href="',util.url('/file/view/index/fid/'),item['id'],'">',item['title'],'</a>');
                            ret.push('<span class="fr attachment-item-op">');
                                ret.push('<a class="fd_ico" href="',util.url('/file/view/index/fid/'),item['id'],'">预览</a>');
                                ret.push('<a class="xz_ico" href="',util.url('/file/act/down/fid/'),item['id'],'">下载</a>');
                                ret.push('<a class="ck_ico" href="',util.url('/file/view/index/fid/'),item['id'],'">查看文档主页</a>');
                            ret.push('</span>');
                        ret.push('</div>');

                    ret.push('</div>');
                ret.push('</li>');
            });
            ret.push('</ul>')
        }

        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));
/*
data [
    {'id':1, 'title': '文件abc.doc', 'ext': 'doc'},
    {'id':2, 'title': '文件efg.pdf', 'ext': 'pdf'}
]
 */