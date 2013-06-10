 /*
 add by lisheng
 2013-4-23
 选人界面 js
  */
(function($, YY, util){
    $(function(){
                var fordiv = "",
                    $activedSelector = null;
                var defaults = {
                    'selector': '',
                    'fordiv':'',
                    'callback': function(){ return true;}
                }
                function userSelector( options){
                    options = options || {};
                    options = $.extend(true, {}, defaults, options);
                    var dialog_obj = new YY.SimpleDialog({
                     'title': '选择人员',
                     'width': 640,
                     'height': 480,
                     'overlay' : true,
                     'autoOpen': false,
                     'cache': false,     // 缓存dialog的内容;
                     'hasHeader' : true,
                     'hasFooter' : false,
                     'url':"/employee/employee/selectEmployee.html",
                     'onComplete': function($wrap){ //弹出页面成功后 所做操作
                        //初始化分组和人数
                         initEmployeeNum();
                        //绑定事件
                         $(".selectEmployee", $wrap).on({
                             "click" :function(e){
                                 $target = $(e.target);
                                 if($target.closest('.category-item').length){
                                     $target.toggleClass("itemSelected");
                                     return;
                                 }
                                 //关注的人
                                 if($target.closest('#fans').length){
                                     initFans();
                                     return;
                                 }
                                 //同部门的人
                                 if($target.closest('#sameDeptEmployees').length){
                                     initSameDeptEmployees();
                                     return;
                                 }
                                 //所有的人
                                 if($target.closest('#allEmployees').length){
                                     initAllEmployees();
                                     return;
                                 }
                                 //选择人员到右侧
                                 if($target.closest('#selectToRight').length){
                                     var selected = $(".fromperson li.itemSelected").clone();
                                     takeSelectedToRight(selected);
                                     return;
                                 }

                                 //选择人员到右侧
                                 if($target.closest('.closeX').length){
                                     $target.closest('.selecteditem').remove();//移除
                                     return;
                                 }
                             }
                         });

                         //输入查询值 进行模糊查询
                         $("#keySearch").on({
                             'keyup': function(){
                                 emptyEmployees();
                                 initEmployeeNum();
                             },
                             'click':function(){
                                 if ($(this).val().trim() == "查找联系人") {
                                     $(this).val("");
                                 }
                             },
                             'blur':function(){
                                 if($(this).val().trim() ==""){
                                    $(this).val("查找联系人");
                                 }
                             }
                         });
                         //查询小按钮 单击事件
                         $("#searchBtn").on({
                             'click':function(){
                                 emptyEmployees();
                                 initEmployeeNum();
                             }
                         });

                         //确定按钮
                         $("#btnOK").on({
                             'click':function(){
                                var selected = $("li.selecteditem"),
                                    data = [];

                                 if(selected.length == 0){
                                     $("#prompt").css("display","inline-block");
                                     return;
                                 }

                                 selected.each(function(i){
                                     var $me = $(this);
                                     data[i] = {
                                         'id':$me.attr('itemid'),
                                         'name': $me.attr('name'),
                                         'email':$me.attr('email'),
                                         'imageurl':$me.find("img").attr("src")
                                     };
                                 });

                                var callback = options.callback;
                                typeof callback === 'function' && callback(fordiv,data,$activedSelector);

                                 dialog_obj.close();//关闭弹出框
                             }
                         });

                         //取消按钮 关闭弹出框
                         $("#btnCancel").on({
                             'click':function(){
                                 dialog_obj.close();
                             }
                         });

                         //获取分组人员数量
                         function initEmployeeNum(){
                             var searchKey = getSearchKey();
                             $.post("/employee/employee/ajaxGetEmployeeNumForSelectEmployee.html",{ searchKey:searchKey},function(jsonData){
                                 if(jsonData==null){
                                     return;
                                 }else{
                                     $("#fans").html("关注的人("+jsonData.fansNum+")");
                                     $("#sameDeptEmployees").html("同部门的人("+jsonData.sameDeptEmployeesNum+")");
                                     $("#allEmployees").html("所有的人("+jsonData.allEmployeesNum+")");
                                 }
                             },"json");
                         }
                         //初始化关注的人
                         function initFans(){
                             if($("#fansul li").length > 0)
                             {// 加载了数据后，点击分组，收起
                                 $("#fansul").html("");
                                 $("#fans").attr("class","expand");
                                 return;
                             }
                             var searchKey = getSearchKey();
                             $.post("/employee/employee/ajaxGetFansForSelectEmployee.html",{ searchKey:searchKey},function(jsonData){
                                 if(jsonData==null){
                                     return;
                                 }else{
                                     $("#fans").html("关注的人("+jsonData.length+")")
                                     $("#fans").attr("class","shrink");//变换图标
                                     var strHtml = getHtml(jsonData);
                                     $("#fansul").html(strHtml);
                                 }
                             },"json");
                         }
                         //初始化同部门的人
                         function initSameDeptEmployees(){
                             if($("#samedeptul li").length > 0)
                             { // 加载了数据后，点击分组，收起
                                 $("#samedeptul").html("");
                                 $("#sameDeptEmployees").attr("class","expand");
                                 return;
                             }

                             var searchKey = getSearchKey();
                             $.post("/employee/employee/ajaxGetSameDeptEmployeeForSelectEmployee.html",{ searchKey:searchKey},function(jsonData){
                                 if(jsonData==null){
                                     return;
                                 }else{
                                     $("#sameDeptEmployees").html("同部门的人("+jsonData.length+")")
                                     $("#sameDeptEmployees").attr("class","shrink");//变换图标
                                     var strHtml = getHtml(jsonData);
                                     $("#samedeptul").html(strHtml);
                                 }
                             },"json");
                         }
                         //初始化所有人
                         function initAllEmployees(){
                             if($("#allul li").length > 0)
                             { // 加载了数据后，点击分组，收起
                                 $("#allul").html("");
                                 $("#allEmployees").attr("class","expand");
                                 return;
                             }

                             var searchKey = getSearchKey();
                             $.post("/employee/employee/ajaxGetAllEmployeeForSelectEmployee.html",{ searchKey:searchKey},function(jsonData){
                                 if(jsonData==null){
                                     return;
                                 }else{
                                     $("#allEmployees").html("所有的人("+jsonData.length+")")
                                     $("#allEmployees").attr("class","shrink");//变换图标
                                     var strHtml = getHtml(jsonData);
                                     $("#allul").html(strHtml);
                                 }
                             },"json");
                         }

                         //获取查询值
                         function getSearchKey(){
                             var key = $("#keySearch").val();
                             if(key == "查找联系人"){
                                 key = "";
                             }
                             return key;
                         }
                         //根据json数据 拼接处html
                         function getHtml(jsonData){
                             var ret = [];
                             var imageurl = '';
                             for(var i=0;i<jsonData.length;i++){
                                 if(jsonData[i].imageurl){
                                     imageurl = 'http://static.yonyou.com/qz/'+jsonData[i].imageurl+'.thumb.jpg';
                                 }
                                 else{
                                     imageurl = 'http://static.yonyou.com/qz/default_avatar.thumb.jpg';
                                 }
                                 ret.push("<li class='category-item' name='"+jsonData[i].name+"' email='"+jsonData[i].email+"' itemid='"+jsonData[i].id+"'>");
                                 ret.push("<img src='"+imageurl+"'.thumb.jpg'>");
                                 ret.push(jsonData[i].name+"("+jsonData[i].email+")");
                                 ret.push("</li>");
                             }
                             return ret.join('');
                         }
                         //清空现有人员，便于查询
                         function emptyEmployees(){
                             $("#fansul").html("");
                             $("#fans").attr("class","expand");
                             $("#samedeptul").html("");
                             $("#sameDeptEmployees").attr("class","expand");
                             $("#allul").html("");
                             $("#allEmployees").attr("class","expand");
                         }

                         //获取左侧选中记录，添加到右侧
                         function takeSelectedToRight(selected){
                             selected.removeClass("category-item");
                             selected.removeClass("itemSelected");
                             selected.addClass("selecteditem");

                             selected.each(function(){
                                 var itemid = $(this).attr("itemid");
                                 if( $("#selectedEmployees li[itemid='"+itemid+"']").length == 0){
                                    $(this).append("<span class='closeX'>x</span>");
                                     $("#selectedEmployees").append($(this));
                                 }
                             });
                             $(".fromperson li.itemSelected").removeClass("itemSelected");
                         }

                         return true;
                     }
                    });

                    //点击选人界面
                    $(options.selector).on({ //创建选人弹出框
                        'click': function(){
                            $activedSelector = $(this);
                            fordiv = $activedSelector.attr("for");
                            dialog_obj.open();
                        }
                    });
                }

                YY.userSelector = userSelector;

    });
}(jQuery, YonYou, YonYou.util));

 /*
 实例
  YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js',
  'yonyou/modules/employee/employee_select.js'], {
      fn: function(){

          YY.userSelector({
          'selector': '.userSelector',//所有css为userSelector的  点击都弹出选人提示框
          'callback': function(fordiv,data){ //回调函数  对返回的数据进行处理
               // fordiv  标识是哪个位置触发弹出了选人框，用以对data进行处理
               //data  选择的所有人的数据  包括 id ，name，email，imageurl
          }
          });
      }
  })
 })*/