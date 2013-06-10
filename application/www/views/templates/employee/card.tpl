{if ($employeeid !=0 && isset($name))}

<div class="container clearfix">

    <div class="grid" style="width: 60px;padding-left:20px;padding-top: 20px;">
         <a href="javascript:;" >{avatar pic={$imageurl} size="small"}</a>
    </div>
    <div class="grid" style="width: 260px; padding-top: 20px;">
         <div class="tipname">
             <a class="fontset" href="javascript:;">{$name}{if !empty($nickname)}({substr($nickname,0,18)}){/if}</a>
             {if $employeeid == $visiterid && (empty($nickname))}<a class="fontset"  href="javascript:;">(填写花名)</a>{/if}

             {if ($employeeid == $visiterid)}
                 <a class="button_orange buttonset"  href="javascript:;">我自己</a>
             {elseif empty($isfollowed) }
                 <a class="button_orange buttonset"  for="{$employeeid|default:0}"  href="javascript:;">加关注</a>
             {else}
                 <a class="button_gray buttonset"   for="{$employeeid|default:0}"  href="javascript:;">取消关注</a>
             {/if}
         </div>

        <div style="padding-top: 10px;">职务：{$duty}</div>
        <div>电话：{$phone}  {$mobile}</div>
        <div class="followdiv">
            <b>关注</b> <a href="javascript:;" target="_blank" class="blueLink">{$follownum|default:0}</a>
            <b>粉丝</b> <a href="javascript:;" target="_blank" class="blueLink">{$fansnum|default:0}</a>
        </div>
    </div>
</div>

<div class="container clearfix">
    <div class="grid mp_bottom">
        <a href="javascript:;" class="blueLink">打招呼</a>
        <a href="javascript:;" class="blueLink">@TA</a>
        <a href="javascript:;" class="blueLink">与TA协同</a>
    </div>
</div>

<div style="container clearfix" style="height: 20px;">&nbsp</div>

{else}
    <p >抱歉，该成员目前不存在当前空间！</p>
{/if}