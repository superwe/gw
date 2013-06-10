$(document).ready(function() {
    //更多详细资料显示
    $("#showdetails").live('click',function(){
        var $me = $(this);
        var myhomeStatus = $("#myhome").hasClass('hidden');
        if(myhomeStatus){
            $("#myhome").removeClass('hidden');
            $("#details").addClass('hidden');
            $me.html("更多详细资料...");
        }else{
            $("#myhome").addClass('hidden');
            $("#details").removeClass('hidden');
            $me.html("返回个人主页");
        }
    });
    //编辑简介
    var $titleBlock = $('#fileTitle'),
        $title = $('.yy-file-title',$titleBlock),
        $title_placeholder = $('.placeholder',$titleBlock),
        orig_title = $title_placeholder.html(),
        orig_title_width = $title_placeholder.width();
    //如果标题文字宽度大于125px，那么自动调整input宽度；
    if (orig_title_width>125)
        $title.animate({ width:(orig_title_width+5)},'normal');
    $titleBlock.children().bind('click', function(){
        orig_title_width = $title_placeholder.width();
        orig_title = $title_placeholder.html();
        $title.removeClass('hidden');
        $title_placeholder.addClass('hidden');
        $title.removeAttr('readonly').css('background','#FFF').focus();
        if(! $title_placeholder.hasClass('hidden')){
            var new_width = orig_title_width<295 ? 300 : orig_title_width+5;
            $title.animate({ width: new_width}, 'normal');
        }
        return false;
    });
    $title.blur(function(){
        var $me = $(this),
            new_title = $.trim($me.val());
        //判断字数 start
        str = new_title.replace(/<a[^>]*>/gi,'')
            .replace(/<\/a[^>]*>/gi,'')
            .replace(/[\u4E00-\u9FA5]/gi,'!!')
            .replace(/\<img[\s\S]*?\/?\>/ig,'!!!!')
            .replace(/<br[^>]*>/gi,'')
            .replace(/\&nbsp;/gi," ");
        //判断字数 end
        $title.addClass('hidden');
        $title_placeholder.removeClass('hidden');
        if(new_title != '' && new_title!=orig_title){
            YY.util.ajaxApi(YY.util.url('employee/homepage/updateintro'), function(){
                $title_placeholder.text(new_title);
                $('.yy-file-title').val(new_title);
                orig_title_width = $title_placeholder.width();
                var new_width = orig_title_width<125 ? 130 : (orig_title_width+5);
                $title.animate({ width:new_width},'normal');
            }, 'POST', 'html', 'introduce=' + new_title);
        }
        else {
            var new_width = orig_title_width<125 ? 130 : (orig_title_width+5);
            $title.animate({ width:new_width},'normal');
        }
    }).keydown(function(e){
            var $me = $(this);
            enterExcute(e, function(){
                $me.blur();
            });
        });
    //点击释放回车键，执行函数句柄；
    function enterExcute(e, func){
        if(typeof func !== 'function') return false;
        var keyCode = e.keyCode
            ? e.keyCode
            : (e.which ? e.which : e.charCode);
        if (keyCode == 13) {
            func();
            return false;
        }
        return true;
    }
});