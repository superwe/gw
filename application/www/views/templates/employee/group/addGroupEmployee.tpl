<div class="addGroupEmployee">
	<form method="post" action="/employee/group/addGroupEmployee" id="addemployee">
	<input type="text" class="input userSelector" style="width:280px;" name="employeename" id="employeename" maxlength="20" value="输入用户名或邮箱">
	<input type="hidden" name="gid" value="{$id}">
	<input type="hidden" name="do" value="1">
	<input type="submit" value="添加">
	</form>
</div>
<script>
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