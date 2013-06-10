<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>管理后台--空间管理员</title>

 <link rel="stylesheet" type="text/css" href="/css/admin.css" />

 <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/default/easyui.css">
 <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/icon.css">
 <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
 <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/jquery.easyui.min.js"></script>
 <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/locale/easyui-lang-zh_CN.js"></script>

    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/ztree/3.5/jquery.ztree.all.min.js"></script>
    <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/json/2.3/jquery.json.min.js"></script>
    <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/ztree/3.5/zTreeStyle.css"/>

 <script type="text/javascript">
        $(document).ready(function(){

            var setting = {
                data:{
                    key:{
                        name:"name"
                    },
                    simpleData :{
                        enable:true,
                        idKey:"id",
                        pIdKey:"parentid"
                    }
                },
                view: {
                    expandSpeed: "fast",
                    selectedMulti:false,
                    showIcon:true,
                    showLine:true,
                    showTitle:true
                },
                callback: {
                    onClick: zTreeOnClick
                }
            };

            $.post("/space/home/findMyPrivilege.html",{ },function(jsonData){
                var funcTop = { "id":0,"name":"功能菜单"};
                jsonData.push(funcTop);//增加功能树根节点

                var functree = $.fn.zTree.init($("#functionTree"),setting,jsonData);
                var node = functree.getNodeByParam("id",0);
                functree.expandNode(node, true, false);//展开一级节点
            },"json");

            $('#functiontabs').tabs('add',{
                 title:'主页',
                selected:true
            });

        });

        //功能树点击事件
        function zTreeOnClick(event, treeId, treeNode) {
            var name = treeNode.name;
            var url = treeNode.funcurl;

            if(url == null || url == ""){
                return;
            }

            if($('#functiontabs').tabs('exists',name)){
                $('#functiontabs').tabs('select',name);
                return ;
            }

            $('#functiontabs').tabs('add',{
                title:name,
                content: '<iframe width="100%" height="100%" frameborder="0"  src='+url+'  style="width:100%;height:100%;"></iframe>',
                closable:true,
                selected:true
            });

        };

 </script>
</head>

<body>

    <div id='mylayout' class="easyui-layout" fit='true' >

            <div data-options="region:'north'" style="background: #3E82B3; height: 55px;">
                <img src="/images/mainLogo.png" style="margin-left: 30px; margin-top: 10px;">
                <a href="/space/home/logout.html" style="color:white;margin-left: 700px; ">注销登录</a>
            </div>

             <div data-options="region:'south',split:true" style="height:50px;">
                <p align="center"><font size="1">Copyright 2013 chanjet.com All rights reserved.</font></p>
            </div>

            <div data-options="region:'west',split:true" title="功能菜单" style="width:200px;">
                <ul id="functionTree" class="ztree"></ul>
            </div>


            <div data-options="region:'center',iconCls:'icon-ok'" >
                  <div id="functiontabs" class="easyui-tabs" fit='true' >

                  </div>
            </div>

    </div>

</body>
</html>

