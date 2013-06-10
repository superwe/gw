(function($, YY, util){
    // DOM Ready
    $(function(){
        util.loadScript([YY.CDN_URI + 'js/jquery/jquery.form-3.0.9.js'], {
            fn: function(){
                var options = {
                    'beforeSubmit': taskBeforeSubmit,
                    'dataType': "json",
                    'success': taskSubmitSuccess
                };

                $('#taskaddForm').ajaxForm(options);
                // task 表单验证
                function taskBeforeSubmit(){
                    if($('#tasktitle').val() == ''){
                        $.yy.rscallback('任务标题不能为空', 1);
                        return false;
                    }
                    return true;
                }
                // task 保存成功
                function taskSubmitSuccess(responseText, statusText, xhr, $form){
                    var flag = false,
                        errmsg = '错误！',
                        taskNodeId = 0;
                    var draftflag = $('#draftflag').val();
                    try{
                        flag = responseText.rs;
                        errmsg = responseText.error ? responseText.error : errmsg;
                        taskNodeId = responseText.data.taskNodeId;
                    }catch(ex){}
                    if (taskNodeId && flag) {
                        if(draftflag == '2'){
                            $('#draftflag').val(0);
                            $('#tid').val(taskNodeId);
                            $.yy.rscallback('草稿保存成功！');
                            return;
                        }

                        var redirectUrl = '/employee/task/info?tid=' + taskNodeId;
                        $.yy.rscallback('操作成功，页面正在跳转，请稍等...');
                        window.location.href = redirectUrl;
                    } else{
                        $.yy.rscallback(errmsg, 1);
                    }
                    $form.removeAttr('has-submit');
                    return false;
                }
            }
        });
    })
}(jQuery, YonYou, YonYou.util))