<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/group.css" />
    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <title>首页-畅捷通-企业空间</title>
</head>
<body>
{include file="employee/header.tpl"}
<div class="container clearfix" style="width:980px;margin-top:25px;">
   {include file="employee/leftbar.tpl"}
   <div class="grid group_wrap">
        {include file="employee/group/head.tpl"}
        <div class="group_content">
			<form method="post" action="/employee/group/addEmployee" id="addemployee">
				输入用户名或邮箱：<input type="text" class="input userSelector" name="employeename" id="employeename"><input type="hidden" name="gid" value="{$group['id']}"/><input type="hidden" name="do" value="1"> <input type="submit" value="添加">
				</ul>
			</form>
        </div> 
    </div>
</div>
<script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
<script src="/js/yonyou/lib/yonyou.js"></script>
<script src="/js/yonyou/lib/yy.core.js"></script>
{include file="employee/footer.tpl"}
<script type="text/javascript">
(function($, YY, util){
            $(document).ready(function()
            {

                YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js',
                    'yonyou/modules/employee/employee_select.js'], {
                    fn: function(){
                        YY.userSelector({
                            'selector': '.userSelector',
                            'callback': function(fordiv,data){
                                //对所选择的人员信息进行整理
                                var ret = [] ;
                                var addLiId="";
                                for(var i=0;i<data.length;i++){
                                	$("#employeename").val(data[i].name);
                                }
                                
                            }
                        });

                    }
                 })
            });
}(jQuery, YonYou, YonYou.util));
</script>
<script type="text/javascript">
    window.sessid = "{session_id()}";
    window.rscallback = "{$rscallback}";
    window.rscallbackflag = "{$rscallbackflag}";
    if(rscallback != '') $.yy.rscallback(rscallback, rscallbackflag);
</script>
</body>
</html>

