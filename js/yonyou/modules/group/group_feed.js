(function($, YY, util){
    $(document).ready(function()
    {
        $.post("/employee/announce/setSessionStorage",{ type: 0 },function(data){
            if(data.length>0)
            {
                for(var i=0;i<data.length;i++)
                {
                    sessionStorage.setItem(data[i]['key'],data[i]['prev']+"_"+data[i]['next']);
                }
            }
        },"json");
        YY.loadScript(['yonyou/templates/attachment.js',
            'yonyou/templates/pic.js'], {
            fn:function(){
                	// 动态
                    var uri = '/employee/group/feed?id='+ $('.feed_div').attr("id");
                    $('.feed_div').html('');
                    YY.util.ajaxApi(uri, function(data){
                        if (data && typeof data === 'object') {
                            YY.addFeed($('.feed_div'), data, null, false);
                            $('#index_moreFeed').html("查看更多>>");
                        }else{
                            $('#index_moreFeed').html("没有更多内容了");
                            $('#index_moreFeed').die('click');
                        }
                    }, 'GET', "json");

                    // 更多动态
                    $('#index_moreFeed').live('click', function(){
                        var $me = $(this);
                        var contioner = $me.attr("resource-id");
                        var obj = jQuery("." + contioner).find(".feed-section");
                        var objLi = obj.last();
                        if(objLi.find("li[resource-id]").length > 0){
                            var feed_id = objLi.find("li[resource-id]:last").attr("resource-id");
                        }else{
                            var feed_id = objLi.attr("resource-id");
                        }
                        YY.util.ajaxApi($me.attr("data"), function(data){
                            if (data && typeof data === 'object') {
                                YY.addFeed($('.feed_div'), data, null, false);
                                $me.html("查看更多>>");
                            }else{
                                $me.html('没有更多内容了');
                                $me.die('click');
                            }
                        }, 'GET', "json", {feedid : feed_id});
                        return false;
                    });
            }
        });

    });
}(jQuery, YonYou, YonYou.util));