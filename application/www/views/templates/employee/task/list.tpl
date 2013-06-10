{foreach from=$list item=item}
<div class="all container feed-section" resource-id="{$item.id|default:0}">
    <div style="width: 60px;" class="grid center user_card"><a href="/employee/homepage/index/{$item.creatorid|default:0}.html" tips="1" rel ="/employee/employee/cardInfo/{$item.creatorid|default:0}">{avatar pic="`$item.imageurl`" size='small' title="`$item.creatorname`"}</a></div>
    <div style="width: 730px;" class="grid">
        <h3>
            <a class="title" href="/employee/task/info?tid={$item.id|default:0}">{$item.title|default:''}</a>{if $item.parenttitle|default:''}  >> 上级任务 <a href="/employee/task/info?tid={$item.parentid|default:0}">{$item.parenttitle|default:''}</a>{/if}
            <br>
            <a class="name" href="/employee/myhomepage/index.html" title="{$item.creatorname|default:''}" tips="1" rel ="/employee/employee/cardInfo/{$item.creatorid|default:0}">{$item.creatorname|default:''}</a>
            <img src="/images/group1.png">
            <a class="space" href="/employee/home/index.html">{$spaceName|default:''}</a>
            {if $item.status|default:0 != 2}
            <span class="status"><img src="/images/stateIcon_clock.png">{$item.tastStatus|default:''}</span>
            {/if}
            {if $item.isimportant|default:0}
            <span class="status icostar">重要</span>
            {/if}
            {if $item.tpstatus|default:0}
            <span class="opbutton" name="_t_{$item.id|default:0}">
                <a class="button acceptbutton" name="acceptTask" data="{$item.id|default:0}">接受</a>
                <a class="button refusebutton" name="refuseTask" data="{$item.id|default:0}">拒绝</a>
            </span>
            {/if}
        </h3>
        <table cellspacing="0" cellpadding="0" rules="groups" class="content user_card">
            <tbody><tr><td class="prompt">负责人：</td><td>{foreach from=$item.userList.manage|default:array() item=join key=k}<a href="/employee/myhomepage/index.html" tips="1" rel ="/employee/employee/cardInfo/{$k|default:0}">{$join}</a>{/foreach}</td> </tr>
            {if $item.userList.join|default:array()}<tr><td class="prompt">参与人：</td><td>{foreach from=$item.userList.join|default:array() item=join key=k}<a href="/employee/homepage/index/{$k|default:0}.html" tips="1" rel ="/employee/employee/cardInfo/{$k|default:0}">{$join}</a>{/foreach}</td> </tr>{/if}
            {if $item.userList.notice|default:array()}<tr><td class="prompt">知会人：</td><td>{foreach from=$item.userList.notice|default:array() item=notice key=k}<a href="/employee/homepage/index/{$k|default:0}.html" tips="1" rel ="/employee/employee/cardInfo/{$k|default:0}">{$notice}</a>{/foreach}</td> </tr>{/if}
            <tr><td class="prompt">任务时间：</td><td>{if $item.expectendtime}{$item.starttime}--{$item.expectendtime}{else}尽快完成{/if}</td> </tr>
            <tr><td class="prompt">创建时间：</td><td>{$item.createtime|default:''}</td> </tr>
            {if $item.remindtimetype}
            <tr><td class="prompt">提醒方式：</td><td>{if $item.remindtimetype eq 1}任务开始和结束前{elseif $item.remindtimetype eq 2}任务开始前{else}任务结束前{/if}{$item.leadtime|default:0}分钟 以{if $item.remindway eq 1}消息{elseif $item.remindway eq 2}邮件{else}邮件和消息{/if}的形式通知</td> </tr>
            {/if}
            {if $item.content|default:''}<tr><td class="prompt">任务说明：</td><td>{$item.content|default:''}</td> </tr>{/if}
            </tbody>
        </table>
        {include file="employee/attachment.tpl"}
        <div class="oplist">{sgmdate date=$item.createtime dateformat='Y-m-d'} 来自 网页
            {if $item.isdel|default:0}
                <a class="submittask yy-task-del" data="{$item.id|default:0}" href="javascript:;">删除</a>
                <div class="delLay relative fl yy-delete z5 hidden" style="left: 733px; top: 26px;">
                    <aside class="delTk">确定要删除该会话？<br>
                        <a style="color:#FFF" class="feed-delete-confirm" data="{$item.id|default:0}" href="javascript:void(0);">删除</a>
                        <a class="yy-delete-cancel" href="javascript:void(0);">不删除</a>
                        <span class="sj xsj"></span>
                    </aside>
                </div>
            {/if}
            {if $item.issumit|default:0}<a class="submittask yy-task-submit" id="yy-task-submit-{$item.id|default:0}" data="{$item.id|default:0}" href="javascript:;">提交任务</a>{/if}
            {if $item.isassign|default:0}<a class="dispatchtask" id="yy-task-assign-{$item.id|default:0}" href="/employee/task/assign?tid={$item.id|default:0}">分配任务</a>{/if}
            {if $item.ispass|default:0}
                <a class="dispatchtask yy-task-unpass" id="yy-task-unpass-{$item.id|default:0}" href="javascript:;" data="{$item.id|default:0}">不通过</a>
                <a class="dispatchtask yy-task-pass" id="yy-task-pass-{$item.id|default:0}" href="javascript:;" data="{$item.id|default:0}">通过</a>
            {/if}
            {if $item.isclose|default:0}
                <a class="dispatchtask" id="yy-task-close" data="{$item.id|default:0}" href="javascript:;" rel="{if $item.status==6}0{else}6{/if}">{if $item.status==6}开启{else}关闭{/if}</a>
            {/if}
            {if $item.isreply|default:0}
            <a href="javascript:;" class="oplist_reply reply" targetId="{$item.id}" module="{$model}">回复({$item.replyNum|default:0})</a>
            {/if}
            {if $item.isedit|default:0}
                <a class="dispatchtask" href="/employee/task/edit?tid={$item.id|default:0}">编辑</a>
            {/if}
        </div>
    </div>
</div>
{foreachelse}
    nodata
{/foreach}