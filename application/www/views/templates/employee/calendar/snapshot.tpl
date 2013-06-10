<dl class="alignLeft rili_edit">
    <dt class="blueColor f14 fontB"><a href="javascript:;" class="yy-schedule-detail" fromid="{$schedule.id|default:0}">{$schedule.title|default:''}</a></dt>
    <dd><strong>创建人：</strong><a href="/space/cons/index/id/{$schedule.creatorid}">{$schedule.name|default:''}</a></dd>
    <dd><strong>时间：</strong>{if $schedule.allday|default:0 eq 1}{$schedule.starttime|date_format:"%Y年%m月%d日"}(全天){else}{$schedule.starttime|date_format:"%Y年%m月%d日 %H:%M"} - {$schedule.endtime|date_format:"%Y年%m月%d日 %H:%M"}{/if}</dd>
    {if $partners|default:array()}
        <dd><strong>参与人：</strong>
            {foreach from=$partners|default:array item=user}<a href="/space/cons/index/id/{$user.employeeid}">{$user.name|default:''}</a>&nbsp;{/foreach}
        </dd>
    {/if}
    {if $notifiers|default:array()}
        <dd><strong>知会人：</strong>
            {foreach from=$notifiers|default:array item=user}<a href="/space/cons/index/id/{$user.employeeid}">{$user.name|default:''}</a>&nbsp;{/foreach}
        </dd>
    {/if}
</dl>
<div class="tkFooter clearfix mt20 action-line">
    {if $isSelf}
        <a href="javascript:;" class="yy-delete fr pl15" fromid="{$schedule.id|default:0}" type="{$object_type|default:25}" start="{$schedule.starttime|default:0}" end="{$schedule.endtime|default:0}">删除日程&gt;&gt;</a>
        <a href="javascript:;" class="yy-edit-active fr pl15" fromid="{$schedule.id|default:0}">编辑日程&gt;&gt;</a>
    {/if}
    <a href="javascript:;" class="yy-schedule-detail fr" fromid="{$schedule.id|default:0}">日程详情&gt;&gt;</a>
    {*
    {if ( ($schedule.member_id eq $smarty.session.user.memberid || $isAdmin|default:0 eq 1 )&& $schedule.state neq "1")}
           <a href="javascript:;" class="fl yy-delete">删除</a>
    {/if}
    {if $smarty.session.user.memberid|default:0 neq $schedule.member_id|default:0}{if $schedule.followstatus|default:0 eq "0"}<a href="javascript:;" class="fl button blueGz yy-follow">加关注</a>{else}<a href="javascript:;" class="fl button grayGz yy-followed">已关注</a>{/if}{/if}
         *}
</div>
