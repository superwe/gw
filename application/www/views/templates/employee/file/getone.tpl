<div class="container clearfix allreply" style="width:750px;">
    <div class="grid fl dt_ico">
        {avatar pic=$reply.imageurl style="width:40px;"}
    </div>
    <div class="grid fl replyinfo">
        <div class="author"><a href="/employee/homepage/index?employeeid={$reply.employeeid}">{$reply.name}</a> 回复 {if $reply.parentname}<a href="/employee/homepage/index?employeeid={$reply.parentemployeeid}">{$reply.parentname}</a>{/if}</div>
        <div style="font-size:14px;">{$reply.content}</div>
        <div class="xuxian"></div>
        <div style="line-height:20px;">
            <div class="fl time">{sgmdate date="`$reply.replytime`" dateformat='Y-m-d'} 来自：{$reply.from_org}</div>
            <div class="fr otheraction"><a class="reply-del" fid="{$reply.id}" for="/employee/reply/delreply?fileid={$reply.targetid}&replyid={$reply.id}" name="回复">删除</a> <a href="javascript:;" replyid="{$reply.id}" class="yy-reply">回复</a></div>
        </div>
        <div class="filereply fl hidden">
            <div class="container" style="width: 100%" id="replyinput">
                <form method="post" class="replyfilediv">
                    <input type="text" class="coninput" name="replycontent" id="replycontent" value="">
                    <input type="button" name="replysubmit" id="replysubmit" class="blueButton repsubmit" value="回复">
                    <input type="hidden" value="{$reply.id}" name="replyid" id="replyid">
                </form>
            </div>
            <div id="showreplyto"></div>
        </div>
    </div>
</div>