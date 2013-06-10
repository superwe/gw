<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>管理后台--超级管理员</title>

 <link rel="stylesheet" type="text/css" href="/css/admin.css" />

 <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/default/easyui.css">
 <link rel="stylesheet" type="text/css" href="http://cdn.qiater.com/js/jquery/easyui/1.3.2/themes/icon.css">
 <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
 <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/jquery.easyui.min.js"></script>
 <script type="text/javascript" src="http://cdn.qiater.com/js/jquery/easyui/1.3.2/locale/easyui-lang-zh_CN.js"></script>

<script type="text/javascript">
        $(document).ready(function(){

            $('#functiontabs').tabs('add',{
                 title:'主页',
                 content: '<iframe width="100%" height="100%" frameborder="0"  src="http://esn.yonyou.com/space/home/index/" style="width:100%;height:100%;"></iframe>' ,
                 selected:true
            });

             $('#functiontree').tree({
                  onClick:function(node){

                       var e =$('#functiontabs').tabs('exists',node.text);
                       if(e==true){
                          $('#functiontabs').tabs('select',node.text);
                          return ;
                       }

                      var content="";
                      switch (node.text){
                          case "角色管理":
                              content ="/boss/role/index.html" ;
                              break;
                          case "用户管理":
                              content ="/boss/admin/index.html" ;
                              break;
                          case "公司管理":
                              content ="/boss/company/index.html" ;
                              break;
                          case "空间管理":
                              content ="/boss/space/index.html" ;
                              break;

                          default:
                              return;
                      }

                       $('#functiontabs').tabs('add',{
                          title:node.text,
                          content: '<iframe width="100%" height="100%" frameborder="0"  src='+content+'  style="width:100%;height:100%;"></iframe>',
                          closable:true,
                          selected:true
                       });

                  }
            })

        })
 </script>
</head>

<body>

    <div id="mylayout" class="easyui-layout" fit='true' >

            <div data-options="region:'north'" style="background: #3E82B3; height: 55px;">
                <span>
                    <img src="/images/mainLogo.png" style="margin-left: 30px; margin-top: 10px;">
                    <img src="/images/topRLogo.png" style="margin-left: 630px; margin-top: 10px;">
                </span>
            </div>

             <div data-options="region:'south',split:true" style="height:50px;">
                <p align="center"><font size="1">Copyright 2013 chanjet.com All rights reserved.</font></p>
            </div>

            <div data-options="region:'west',split:true" title="功能菜单" style="width:200px;">
                     <ul id="functiontree" class="easyui-tree" data-options="animate:true">
                         <li>
                              <span>功能菜单</span>
                              <ul>
                                 <li><span>公司管理</span></li>
                                 <li><span>空间管理</span></li>
                                 <li><span>角色管理</span></li>
                                 <li><span>用户管理</span></li>
                             </ul>
                         </li>
                     </ul>
            </div>

            <div data-options="region:'center',iconCls:'icon-ok'" >
                  <div id="functiontabs" class="easyui-tabs" fit='true' ></div>
            </div>

    </div>

</body>
</html>

