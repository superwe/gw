//签到模块
(function($, YY, util){
    $(function(){
        //DOM ready;
        var dialog_obj = null,
            $Sign_Index = $('#Sign_Index'),//首页
            $Sign_MySign = $('#Sign_MySign'),//我的签到页面
            $Sign_TaskList = $('#Sign_TaskList'),//定时任务列表页面
            $Sign_TaskInfo = $('#Sign_TaskInfo');//定时任务详情页
            $Sign_ShareSignList = $('#Sign_ShareSignList');//查看分享人页面
            $Sign_Search = $('#Sign_Search');//搜索结果页面

        //顶部菜单切换
        $('div.signMenu').on('mouseover', function(e){
            $(this).find('ul.signMenuUl').removeClass('hidden');
        }).on('mouseout', function(e){
            $(this).find('ul.signMenuUl').addClass('hidden');
        });
        //选人
        if($('div.signSearchEmployee')){
            YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js','yonyou/modules/employee/employee_select.js'], {
                fn: function(){
                    YY.userSelector({
                        'selector': '.selectEmployee',
                        'callback': function(fordiv,data){
                            //对所选择的人员信息进行整理
                            var ret = [],
                                addLiId="";
                            for(var i=0;i<data.length;i++){
                                addLiId = "yyauto_li_"+data[i].id;
                                if($("#"+fordiv+"_list li[id="+addLiId+"]").length == 0){
                                    //不包含的时候 增加
                                    ret.push('<li id="'+addLiId+'" class="rcAddmenListli"><span>');
                                    ret.push(data[i].name);
                                    ret.push('</span><input type="hidden" class="signEmployeeids" name="'+fordiv+'_value[]" value=');
                                    ret.push(data[i].id);
                                    ret.push('><a href="javascript:;" class="close"></a></li>');
                                }
                            }
                            $("#"+fordiv+"_list").find('li:last').before(ret.join(''));//将选择的人 添加到input框中
                        }
                    });
                }
            });
            $('#joinuser_list').on({//删除
                'click' : function(e){
                    var obj = $(e.target);
                    if(obj.is("a.close")){
                        obj.closest('li').remove();
                    }
                }
            });
        }
        //搜索人
        $('a.signSearchBtn').on('click', function(e){
            var obj = $('input.signEmployeeids'),
                mids = [];
            $.each(obj, function(i, o){
                mids.push($(o).val());
            });
            $Sign_Index.length > 0 && indexSignList(mids);
            $Sign_TaskInfo.length >0 && getSignList(mids);
        });
        //鼠标移动到签到列表变换地图
        $('ul.signListUl').on('mouseover', function(e){
            var $me = $(this),
                $relatedTarget = $(e.relatedTarget),
                $target = $(e.target),
                $li = $target.closest('li');
            if(!!$li.length && $li.get(0) !== $relatedTarget.closest('li').get(0)){
                $me.find('li.cur').removeClass('cur').find('div.signBlue').removeClass('signBlue');
                $li.addClass('cur').find('div.signRed').addClass('signBlue');
                if($('#signMapContainer').length > 0){//变换地图
                    $.each($me.find('li'), function(i, o){
                        var mapObj = concatMapData($(o));
                        setMarker(mapObj);
                    });
                    var mapObj = concatMapData($li);
                    setMarker(mapObj);
                }
            }
        });
        //弹出高级搜索签到框
        $('.signSearchNav').on({
            'click' : function(){
                var type = $(this).attr('data');//标识来源，首页还是我的签到页面
                YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js', 'yonyou/widgets/dateSelector/dateSelector.js', 'yonyou/modules/sign/jquery.city.js'], {
                    fn : function(){
                        var dialogObj = new YY.SimpleDialog({
                            'width'     : 500,
                            'height'    : 250,
                            'overlay'   : true,
                            'autoOpen'  : false,
                            'hasHeader' : true,
                            'hasFooter' : false,
                            'url'        : YY.util.url('/employee/sign/ajaxSearchSignBox?type=' + type),
                            'onComplete' : function(){
                                new YY.DateSelector({wrap : '.yy-time-select'});//日期选择控件
                                $.initProv('#yy-signProvince', '#yy-signCity');//加载省市
                                //关闭分享人弹出框
                                $('a.close').on({
                                    'click' : function(){
                                        dialogObj.close();
                                    }
                                });
                                //点击全部进行勾选
                                $("input[name='allSign']").on('click', function(){
                                    var obj = $(this).siblings('input');
                                    $(this).attr('checked') ? obj.attr('checked', 'checked') : obj.removeAttr('checked');
                                });
                                //勾选全部定时任务
                                $("input[name='allTask']").live('click', function(){
                                    var obj = $('ul.taskListUl input');
                                    if(obj.length > 0){
                                        $(this).attr('checked') ? obj.attr('checked', 'checked') : obj.removeAttr('checked');
                                    }
                                });
                                //展开定时任务列表
                                $('a.opTaskList').toggle(
                                    function(){
                                        $(this).html('&uarr;').attr('title', '收起定时任务列表');
                                        YY.util.ajaxApi(util.url('/employee/sign/ajaxGetTaskList'), function(obj){
                                            if(obj){
                                                var temp = [];
                                                $.each(obj, function(i, o){
                                                    temp.push('<li><input type="checkbox" name="tids[]" value="' + o.id + '" />' + o.title + '</li>');
                                                });
                                                $('ul.taskListUl').html( temp.join('')).parent('div.taskList').removeClass('hidden');
                                            }
                                        }, 'GET', 'JSON');
                                    },
                                    function(){
                                        $(this).html('&darr;').attr('title', '展开定时任务列表');
                                        $('div.taskList').addClass('hidden');
                                    }
                                );
                            }
                        });
                        dialogObj.open();//打开弹出框
                    }
                });
            }
        });
        //点击弹出分享人弹出框
        $('a.signShare').on({
            'click' : function(){
                YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js'], {
                    fn : function(){
                        var dialog_obj = new YY.SimpleDialog({
                            'width'     : 700,
                            'height'    : 300,
                            'overlay'   : true,
                            'autoOpen'  : false,
                            'hasHeader' : false,
                            'hasFooter' : false,
                            'url'       : YY.util.url('/employee/sign/ajaxShare'),
                            'onComplete': function(){
                                //关闭分享人弹出框
                                $('a.close').on({
                                    'click' : function(){
                                        dialog_obj.close();
                                    }
                                });
                                //添加分享人弹出框
                                YY.userSelector({
                                    'selector': '.boxShareAddEmployee',
                                    'callback': function(fordiv, data){
                                        var ids = [],
                                            temp = [];
                                        $.each(data, function(i, o){
                                            if( $('li#list_' + o.id).length <= 0 ){
                                                ids.push(o.id);
                                                temp.push('<li id="list_' + o.id + '">');
                                                temp.push('<div class="figure"><img alt="' + o.name + '" src="' + o.imageurl + '"></div>');
                                                temp.push('<div class="floatL name"><p><a target="_blank" href="#">' + o.name + '</a></p><p></p></div></li>');
                                            }
                                        });
                                        //AJAX添加分享人
                                        if(ids.length > 0){
                                            YY.util.ajaxApi(util.url('employee/sign/ajaxAddShare'), function(obj, status){
                                                $('li.nodata').length > 0 ? $('li.nodata').remove() : '';
                                                $('#' + fordiv + '_list').append(temp.join(''));
                                            }, 'GET', 'JSON', {ids : ids.join(',')});
                                        }
                                    }
                                });
                            }
                        });
                        dialog_obj.open();
                    }
                });
            }
        });
        /************首页************/
        if($Sign_Index.length > 0){
            indexSignList();
        }
        /************我的签到页面************/
        if($Sign_MySign.length > 0){
            mySignList();
        }
        /************定时任务页面************/
        if($Sign_TaskList.length > 0){
            getTaskList();//加载定时任务列表
            //点击显示过期任务
            $('input.showOverdueTask').on('click', function(){
                getTaskList();
            });
        }
        /***********定时任务详情页面**********/
        if($Sign_TaskInfo.length > 0){
            getSignList();
            $('.taskSearchNav').on({
                'click' : function(){
                    YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js', 'yonyou/widgets/dateSelector/dateSelector.js', 'yonyou/modules/sign/jquery.city.js'], {
                        fn : function(){
                            var dialogObj = new YY.SimpleDialog({
                                'width'     : 500,
                                'height'    : 200,
                                'overlay'   : true,
                                'autoOpen'  : false,
                                'hasHeader' : true,
                                'hasFooter' : false,
                                'url'        : YY.util.url('/employee/sign/ajaxSearchTaskBox?tid=' + $Sign_TaskInfo.attr('data')),
                                'onComplete': function(){
                                    new YY.DateSelector({wrap : '.yy-time-select'});//日期选择控件
                                    $.initProv('#yy-signProvince', '#yy-signCity');//加载省市
                                    //关闭分享人弹出框
                                    $('a.close').on({
                                        'click' : function(){
                                            dialogObj.close();
                                        }
                                    });
                                }
                            });
                            dialogObj.open();//打开弹出框
                        }
                    });
                }
            });
        }
        /***********分享人签到列表页面**********/
        if($Sign_ShareSignList.length > 0){
            shareEmployeeSignList();
        }
        if($Sign_Search.length > 0){
            var obj = jQuery.parseJSON($Sign_Search.attr('data'));
            searchSignList(obj);
        }
        //首页分页函数
        function indexSignList(mids){
            YY.loadScript(['yonyou/widgets/pageNavi/pageNavi.js','yonyou/modules/sign/baiduMap.js'], {
                fn : function(){
                    var leftPageObj = new YY.PageNavi({
                        'pageLine'      : $('.signPageContainer', $Sign_Index),
                        'remoteUrl'     : util.url('employee/sign/ajaxGetSignList'),
                        'paramData'     : {mids : mids || []},
                        'autoRender'    : false,
                        'contentLoaded' : function(self, returnData){//回调函数
                            var str = '';
                            if(returnData && returnData.list){
                                var clientType = ['网页','IOS系统','Android系统','WP系统','桌面'];
                                $('div.noSignInfo').addClass('hidden');
                                $.each(returnData.list, function(i, o){
                                    str += '<li data="' + o.id + '" precision="' + o.precision + '" latitude="' + o.latitude + '" employeeId="' + o.uid + '" userName="' + o.name + '" address="' + o.address + '" signtime="' + o.signtime + '"><div class="grid signIco signRed">' + (i+1) + '</div><div class="grid figure"><img src="http://static.yonyou.com/qz/avatar/000/01/73/23.jpg.thumb.jpg" alt="' + o.name + '" /></div><div class="grid signDesc"><p><a href="#" class="descColor">' + o.name + '</a>&nbsp;在&nbsp;<span class="descColor">' + o.address + '</span><br/>' + o.signtime + '&nbsp;来自<span class="descColor">' + clientType[o.clienttype] + '</span>客户端</p></div></li>';
                                });
                                self.setTotalNum(returnData.total);
                                $('ul.signListUl', $Sign_Index).html(str);
                                $.each($("ul.signListUl li"), function(i, o){
                                    var mapObj = concatMapData($(o));
                                    addMarker(mapObj);
                                });
                            } else{
                                self.setTotalNum(0);
                                $('li.rcAddmenListli').remove();
                                $('ul.signListUl').html('');
                                $('div.noSignInfo').removeClass('hidden');
                            }
                        }
                    });
                    leftPageObj.render();
                }
            });
        }
        //我的签到分页函数
        function mySignList(){
            YY.loadScript(['yonyou/widgets/pageNavi/pageNavi.js','yonyou/modules/sign/baiduMap.js'], {
                fn : function(){
                    var leftPageObj = new YY.PageNavi({
                        pageLine        : $('.signPageContainer', $Sign_MySign),
                        'remoteUrl'     : util.url('employee/sign/ajaxGetMySign'),
                        'autoRender'    : false,
                        'contentLoaded' : function(self, returnData){//回调函数
                            if(returnData && returnData.list){
                                var str = '',
                                    clientType = ['网页','IOS系统','Android系统','WP系统','桌面'];
                                $.each(returnData.list, function(i, o){
                                    str += '<li data="' + o.id + '" precision="' + o.precision + '" latitude="' + o.latitude + '" employeeId="' + returnData.userInfo.employeeId + '" userName="' + returnData.userInfo.name + '" address="' + o.address + '" signtime="' + o.signtime + '"><div class="grid signIco signRed">' + (i+1) + '</div><div class="grid figure"><img src="http://static.yonyou.com/qz/avatar/000/01/73/23.jpg.thumb.jpg" alt="' + returnData.userInfo.name + '" /></div><div class="grid signDesc"><p><a href="#" class="descColor">' + returnData.userInfo.name + '</a>&nbsp;在&nbsp;<span class="descColor">' + o.address + '</span><br/>' + o.signtime + '&nbsp;来自<span class="descColor">' + clientType[o.clienttype] + '</span>客户端</p></div></li>';
                                });
                                self.setTotalNum(returnData.total);
                                $('ul.signListUl', $Sign_MySign).html(str);
                            }
                            $.each($("ul.signListUl li"), function(i, o){
                                var mapObj = concatMapData($(o));
                                addMarker(mapObj);
                            });
                        }
                    });
                    leftPageObj.render();
                }
            });
        }
        //定时任务列表页分页函数
        function getTaskList(){
            YY.loadScript('yonyou/widgets/pageNavi/pageNavi.js', {
                fn : function(){
                    var showOverdue = $('input.showOverdueTask').is(':checked') ? 1 : 0;
                    var leftPageObj = new YY.PageNavi({
                        'pageLine'      : $('.signPageContainer', $Sign_TaskList),
                        'remoteUrl'     : util.url('employee/sign/ajaxGetAllTaskLeftList?showOverdue=' + showOverdue),
                        'autoRender'    : false,
                        'contentLoaded' : function(self, returnData){//回调函数
                            if(returnData && returnData.list){
                                var str = '';
                                $.each(returnData.list, function(i, o){
                                    str += '<li><a href="/employee/sign/taskInfo?tid=' + o.id + '">' + o.title + '</a>&nbsp;&nbsp;&nbsp;&nbsp;' + o.startTime + '&nbsp;至&nbsp;' + o.endTime + '&nbsp;&nbsp;&nbsp;&nbsp;<span class="taskStatus">' + o.status + '</span></li>';
                                });
                                self.setTotalNum(returnData.total);
                                $('ul.signListUl', $Sign_TaskList).html(str);

                            }
                        }
                    });
                    var rightPageObj = new YY.PageNavi({
                        'pageLine'      : $('.taskRightPage', $Sign_TaskList),
                        'remoteUrl'     : util.url('employee/sign/ajaxGetAllTaskRightList?showOverdue=' + showOverdue),
                        'autoRender'    : false,
                        'contentLoaded' : function(self, returnData){//回调函数
                            if(returnData && returnData.list){
                                var str = '',
                                    clientType = ['网页','IOS系统','Android系统','WP系统','桌面'];
                                $.each(returnData.list, function(i, o){
                                    str += '<tr><td>' + o.name + '</td><td>' + o.signtime + '</td><td>' + o.province + '</td><td>' + o.city + '</td><td>' + o.address + '</td><td>' + o.remark + '</td><td>' + clientType[o.clienttype] + '</td></tr>';
                                });
                                str = str ? str : '<tr><td colspan="7" style="text-align:center;padding:10px 0;">暂时没有相关的签到数据...</td></tr>';
                                self.setTotalNum(returnData.total);
                                $('.signRightTab tbody', $Sign_TaskList).html(str);
                            }
                        }
                    });
                    leftPageObj.render();
                    rightPageObj.render();
                }
            });
        }
        //定时任务详情页分页函数
        function getSignList(mids){
            YY.loadScript('yonyou/widgets/pageNavi/pageNavi.js', {
                fn : function(){
                    var tid = $Sign_TaskInfo.attr('data'),
                        clientType = ['网页','IOS系统','Android系统','WP系统','桌面'];
                    var leftPageObj = new YY.PageNavi({
                        'pageLine'      : $('.signPageContainer', $Sign_TaskInfo),
                        'remoteUrl'     : util.url('employee/sign/ajaxGetLeftSignListByTaskId?tid=' + tid),
                        'paramData'     : {mids : mids || []},
                        'autoRender'    : false,
                        'contentLoaded' : function(self, returnData){//回调函数
                            var str = '';
                            if(returnData && returnData.list){
                                $.each(returnData.list, function(i, o){
                                    str += '<li><div class="grid signIco signRed">' + (i+1) + '</div><div class="grid figure"><img src="http://static.yonyou.com/qz/avatar/000/01/73/23.jpg.thumb.jpg" alt="' + o.name + '" /></div><div class="grid signDesc"><p><a href="#" class="descColor">' + o.name + '</a>&nbsp;在&nbsp;<span class="descColor">' + o.address + '</span><br/>' + o.signtime + '&nbsp;来自<span class="descColor">' + clientType[o.clienttype] + '</span>客户端</p></div></li>';
                                });
                                self.setTotalNum(returnData.total);
                            } else{
                                $('li.rcAddmenListli').remove();
                                $('ul.signListUl').html('');
                                str = '<li style="text-align: center;">没有符合提交的数据...</li>';
                                self.setTotalNum(0);
                            }
                            $('ul.signListUl', $Sign_TaskInfo).html(str);
                        }
                    });
                    var rightPageObj = new YY.PageNavi({
                        'pageLine'      : $('.taskRightPage', $Sign_TaskList),
                        'remoteUrl'     : util.url('employee/sign/ajaxGetRightSignListByTaskId?tid=' + tid),
                        'paramData'     : {mids : mids || []},
                        'autoRender'    : false,
                        'contentLoaded' : function(self, returnData){//回调函数
                            var str = '';
                            if(returnData && returnData.list){
                                $.each(returnData.list, function(i, o){
                                    str += '<tr><td>' + o.name + '</td><td>' + o.signtime + '</td><td>' + o.province + '</td><td>' + o.city + '</td><td>' + o.address + '</td><td>' + o.remark + '</td><td>' + clientType[o.clienttype] + '</td></tr>';
                                });
                                self.setTotalNum(returnData.total);
                            } else{
                                self.setTotalNum(0);
                                str = '<tr><td colspan="7" style="text-align:center;padding:10px 0;">暂时没有相关的签到数据...</td></tr>';
                            }
                            $('.signRightTab tbody', $Sign_TaskInfo).html(str);
                        }
                    });
                    leftPageObj.render();
                    rightPageObj.render();
                }
            });
        }
        //分享人签到列表分页函数
        function shareEmployeeSignList(){
            YY.loadScript('yonyou/widgets/pageNavi/pageNavi.js', {
                fn : function(){
                    var tid = $Sign_TaskInfo.attr('data'),
                        clientType = ['网页','IOS系统','Android系统','WP系统','桌面'];
                    var leftPageObj = new YY.PageNavi({
                        'pageLine'      : $('.signPageContainer', $Sign_TaskInfo),
                        'remoteUrl'     : util.url('employee/sign/ajaxGetShareEmployeeSignLeftList'),
                        'autoRender'    : false,
                        'contentLoaded' : function(self, returnData){//回调函数
                            if(returnData && returnData.list){
                                var str = '';
                                $.each(returnData.list, function(i, o){
                                    str += '<li><div class="grid signIco signRed">' + (i+1) + '</div><div class="grid figure"><img src="http://static.yonyou.com/qz/avatar/000/01/73/23.jpg.thumb.jpg" alt="' + o.name + '" /></div><div class="grid signDesc"><p><a href="#" class="descColor">' + o.name + '</a>&nbsp;在&nbsp;<span class="descColor">' + o.address + '</span><br/>' + o.signtime + '&nbsp;来自<span class="descColor">' + clientType[o.clienttype] + '</span>客户端</p></div></li>';
                                });
                                $('ul.signListUl', $Sign_ShareSignList).html(str);
                                self.setTotalNum(returnData.total);
                            }
                        }
                    });
                    var rightPageObj = new YY.PageNavi({
                        'pageLine'      : $('.taskRightPage', $Sign_TaskList),
                        'remoteUrl'     : util.url('employee/sign/ajaxGetShareEmployeeSignRightList'),
                        'autoRender'    : false,
                        'contentLoaded' : function(self, returnData){//回调函数
                            if(returnData && returnData.list){
                                var str = '';
                                $.each(returnData.list, function(i, o){
                                    str += '<tr><td>' + o.name + '</td><td>' + o.signtime + '</td><td>' + o.province + '</td><td>' + o.city + '</td><td>' + o.address + '</td><td>' + o.remark + '</td><td>' + clientType[o.clienttype] + '</td></tr>';
                                });
                                str = str ? str : '<tr><td colspan="7" style="text-align:center;padding:10px 0;">暂时没有相关的签到数据...</td></tr>';
                                $('.signRightTab tbody', $Sign_ShareSignList).html(str);
                                self.setTotalNum(returnData.total);
                            }
                        }
                    });
                    leftPageObj.render();
                    rightPageObj.render();
                }
            });
        }
        //搜索结果页面分页函数
        function searchSignList(obj){
            if(typeof obj == "object"){
                YY.loadScript('yonyou/widgets/pageNavi/pageNavi.js', {
                    fn : function(){
                        var clientType = ['网页','IOS系统','Android系统','WP系统','桌面'];
                        var leftPageObj = new YY.PageNavi({
                            'pageLine'      : $('.signPageContainer', $Sign_Search),
                            'remoteUrl'     : util.url('employee/sign/ajaxGetSearchResultLeftList'),
                            'paramData'     : obj,
                            'autoRender'    : false,
                            'contentLoaded' : function(self, returnData){//回调函数
                                if(returnData && returnData.list){
                                    var str = '';
                                    $.each(returnData.list, function(i, o){
                                        str += '<li><div class="grid signIco signRed">' + (i+1) + '</div><div class="grid figure"><img src="http://static.yonyou.com/qz/avatar/000/01/73/23.jpg.thumb.jpg" alt="' + o.name + '" /></div><div class="grid signDesc"><p><a href="#" class="descColor">' + o.name + '</a>&nbsp;在&nbsp;<span class="descColor">' + o.address + '</span><br/>' + o.signtime + '&nbsp;来自<span class="descColor">' + clientType[o.clienttype] + '</span>客户端</p></div></li>';
                                    });
                                    $('ul.signListUl', $Sign_Search).html(str);
                                    self.setTotalNum(returnData.total);
                                }
                            }
                        });
                        var rightPageObj = new YY.PageNavi({
                            'pageLine'      : $('.taskRightPage', $Sign_Search),
                            'remoteUrl'     : util.url('employee/sign/ajaxGetSearchResultRightList'),
                            'paramData'     : obj,
                            'autoRender'    : false,
                            'contentLoaded' : function(self, returnData){//回调函数
                                var str = '';
                                if(returnData && returnData.list){
                                    $.each(returnData.list, function(i, o){
                                        str += '<tr><td>' + o.name + '</td><td>' + o.signtime + '</td><td>' + o.province + '</td><td>' + o.city + '</td><td>' + o.address + '</td><td>' + o.remark + '</td><td>' + clientType[o.clienttype] + '</td></tr>';
                                    });
                                    self.setTotalNum(returnData.total);
                                } else{
                                    str = '<tr><td colspan="7" style="text-align:center;padding:10px 0;">暂时没有相关的签到数据...</td></tr>';
                                }
                                $('.signRightTab tbody', $Sign_Search).html(str);
                            }
                        });
                        leftPageObj.render();
                        rightPageObj.render();
                    }
                });
            }
        }
        //整理地图需要的数据
        function concatMapData($obj){
            if(!$obj.length) return ;
            var index = $obj.index() + 1,
                sid   = $obj.attr('data');
            avatar = $obj.find('.figure img').attr('src'),
                $cur = $('ul.signListUl').find('li.cur'),
                currentSid = !!$cur.length ? $cur.attr('data') : 0;//当前选中的签到
            point = new BMap.Point($obj.attr('precision'), $obj.attr('latitude'));//坐标
            return {
                "point"         : point,
                "name"          : $obj.attr('username'),
                "avatar"        : avatar,
                "address"       : $obj.attr('address'),
                "signtime"      : $obj.attr('signtime'),
                "employeeid"    : $obj.attr('employeeid'),
                "tubiao"         : '/images/sign/' + ( (currentSid == sid) ? 'blue' : 'red') + index + '.png',
                "id"              : sid,
                "signId"         : sid,
                "currentId"      : currentSid
            };
        }
        //
    });
}(jQuery, YonYou, YonYou.util));