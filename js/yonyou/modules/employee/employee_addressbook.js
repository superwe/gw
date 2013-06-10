//前台全体成员通讯录视图
(function($, YY, util){
    var pageObj = null;
    // DOM ready;
    $(function(){
    	var $Employee_AddressBook = $('#Employee_AddressBook');
        //加载组织架构树
        YY.loadScript('/jquery/ztree/3.5/jquery.ztree.core.min.js', {
            fn : function(){
                var setting = {
                    view: {
                        showIcon: showIconForTree
                    },
                    data: {
                        simpleData: {
                            enable: true,
                            idKey: "id",
                            pIdKey: "pId",
                            rootPId: 0
                        }
                    },
                    callback: {
                        onClick: onClick
                    },
                    async: {
                        enable: true,//设置 zTree 是否开启异步加载模式
                        type: "get",//Ajax的http请求模式，默认值："post"[setting.async.enable = true 时生效]
                        url: util.url('employee/employee/ajaxGetDept'),
                        autoParam:["id", "name=n", "level=lv"],//异步加载时需要自动提交父节点属性的参数。[setting.async.enable = true 时生效]
                        dataFilter: filter//用于对 Ajax 返回数据进行预处理的函数。[setting.async.enable = true 时生效]
                    }
                };
                $.fn.zTree.init($("#addressbookTree", $Employee_AddressBook), setting);
            }
        });
        //加载右侧成员分页
        YY.loadScript('yonyou/widgets/pageNavi/pageNavi.js', {
            fn : function(){
                pageObj = new YY.PageNavi({
                    'pageLine'  : $('.qitaterPage', $Employee_AddressBook),
                    'perPage'   : 15,
                    'paramData' : '',
                    'autoRender': false,
                    'totalNum'  : $('.qitaterPage', $Employee_AddressBook).attr('data')
                });
                pageObj.setRemoteUrl(util.url('employee/employee/ajaxGetEmployeeListByDeptId'));
                pageObj.render();
            }
        });
        //右侧点击首字母筛选成员
        $('.firstletter', $Employee_AddressBook).on('click', function(e){
            var obj = $(e.target),
                firstLetter = obj.html() == '所有' ? '' : obj.html(),
                deptId = $Employee_AddressBook.attr('data') ? $Employee_AddressBook.attr('data') : 0;
            if(obj.is('a')){
                var currentUrl = pageObj.getRemoteUrl();
                YY.util.ajaxApi(currentUrl, function(obj, status){
                    var str = cleanUpAjaxData(obj);
                    if(str){
                        $('tbody', '#addressbookTable').html(str);
                        if(obj && obj.total){
                            pageObj.setTotalNum(obj.total);
                            pageObj.setRemoteUrl(obj.url);
                            pageObj.render();
                        }
                    }
                }, 'GET', 'JSON', {firstLetter : firstLetter, id : deptId});
                return false;
            }
        });
        //按照姓名查找
        $("input[name='searchBtn']", $Employee_AddressBook).on('click', function(e){
            var currentUrl = pageObj.getRemoteUrl(),
                firstLetter = $('div.firstletter').find('a.cur').html(),
                name = $("input[name='searchName']").val(),
                deptId = $Employee_AddressBook.attr('data') ? $Employee_AddressBook.attr('data') : 0;
            firstLetter = firstLetter == '所有' ? '' : firstLetter;
            YY.util.ajaxApi(currentUrl, function(obj, status){
                var str = cleanUpAjaxData(obj);
                if(str){
                    $('tbody', '#addressbookTable').html(str);
                    if(obj && obj.total){
                        pageObj.setTotalNum(obj.total);
                        //pageObj.setRemoteUrl(obj.url);
                        pageObj.render();
                    }
                }
            }, 'GET', 'JSON', {firstLetter : firstLetter, id : deptId, name : name});
            $("input[name='searchName']").val('');
            return false;
        });
    });
    //设置zTree不显示节点图标
    function showIconForTree(treeId, treeNode){
        return !treeNode.isParent;
    }
    //处理AJAX返回的zTree数据
    function filter(treeId, parentNode, childNodes) {
        if (!childNodes) return null;
        for (var i=0, l=childNodes.length; i<l; i++) {
            childNodes[i].name = childNodes[i].name.replace(/\.n/g, '.');
        }
        return childNodes;
    }
    //处理zTree点击事件,请求对应部门的成员
    function onClick(event, treeId, treeNode, clickFlag) {
        //console.log(treeNode);
        $('#Employee_AddressBook').attr('data', treeNode.id);
        YY.util.ajaxApi(util.url('employee/employee/ajaxGetEmployeeListByDeptId'), function(obj, status){
            var str = cleanUpAjaxData(obj);
            if(str){
                $('tbody', '#addressbookTable').html(str);
                if(obj && obj.total){
                    pageObj.setTotalNum(obj.total);
                    pageObj.setRemoteUrl(obj.url);
                    pageObj.render();
                }
            }
        }, 'GET', 'JSON', {id:treeNode.id, lever:treeNode.level});
    }
    //整理AJAX返回的成员列表数据
    function cleanUpAjaxData(obj){
        var str = '',
            host = 'http://staticoss.yonyou.com/qiater/';
        if(obj && obj.lists){
            var returnData = [];
            $.each(obj.lists, function(i, o){
                var str = '<tr>';
                //str += '<td><input type="checkbox" name="employeeId[]" value="' + o.id + '" /></td>';
                str += '<td><a href="/employee/homepage/index?employeeid=' + o.id + '"><img src="' + host + o.imageurl + '" alt="' + o.name + '" /></a><a href="/employee/homepage/index?employeeid=' + o.id + '">' + o.name + '</a></td>';
                str += '<td>' + o.deptName + '</td>';
                str += '<td>' + o.duty + '</td>';
                str += '<td>' + o.email + '</td>';
                str += '<td>' + o.mobile + '</td>';
                str += '</tr>';
                returnData.push(str);
            });
            var str = returnData.join('');
            str = str ? str : '<tr><td colspan="6" style="text-align:center;">暂时没有符合条件的成员相关数据...</td></tr>';
       }
        return str;
    }
}(jQuery, YonYou, YonYou.util));

