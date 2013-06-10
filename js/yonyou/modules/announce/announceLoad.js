/**
 * Created with JetBrains PhpStorm.
 * User: lixiao1
 * Date: 13-5-2
 * Time: 下午4:50
 * To change this template use File | Settings | File Templates.
 */
(function($, YY, util){
    $(function(){
        YY.loadScript('yonyou/widgets/dataListLoader/dataListLoader.js', {
            fn: function() {
                var member_list = '#ancList', // 数据表格的id
                    remoteUrl = util.url('employee/announce/getAnnounceListByType'); // 请求远程数据的uri地址
                var dtObj = new YY.DataListLoader({
                    wrapper: member_list,
                    dataList: '.data-list',
                    // 操作按钮所在的块(包括上下翻页、各种批量操作等);
                    pageLineWrap: '#ancLine',
                    // 页码行;
                    pageLine: '.yy-page-line',
                    // 每页显示的数量;
                    perPage: 8,
                    // 分页中显示的数量，最好使用基数，易于对称性;
                    pageCount: 5,
                    // 远程获取数据的URL;
                    remoteUrl: remoteUrl,
                    // 表示是否一次性获取所有数据;
                    isOnce: false,
                    success: function() {
                        // do nothing
                    }
                });

                $("#anctype").click(function(e){
                    var sender=$(e.target);
                    if(sender.is('a')&&!sender.is('.selected'))
                    {
                        dtObj.setParamData('announceType', sender.attr('ancid'));
                        dtObj.reloadDataList();
                        $("#anctype li a").attr('class','');
                        sender.attr('class','selected');
                        $("#trlist").remove('tr');
                        if(sender.attr('ancid') ==0)
                        {
                            var vtr="<tr id='trlist'><th class='w4 ' name='title'>标题</th><th class='w1' name='type'>分类</th><th class='w1 ' name='rccount'>阅读/评论</th><th class='w15 ' name='creator'>发布人</th><th class='w2' name='updatetime'>发布时间</th></tr>";
                            $("#headList").append($(vtr));
                        }
                        else
                        {
                            var vtr="<tr id='trlist'><th class='w4' name='title'>标题</th><th class='w15' name='rccount'>阅读/评论</th><th class='w1 ' name='creator'>发布人</th><th class='w3' name='updatetime'>发布时间</th></tr>";
                            $("#headList").append($(vtr));
                        }

                $.post("/employee/announce/setSessionStorage",{ type: sender.attr('ancid') },function(data){
                    if(data.length>0)
                    {
                        sessionStorage.clear();
                        for(var i=0;i<data.length;i++)
                        {
                            sessionStorage.setItem(data[i]['key'],data[i]['prev']+"_"+data[i]['next']);
                        }
                    }
                },"json");
}
});
            }
        });
    });
}(jQuery, YY, YY.util))