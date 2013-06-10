<!--发起投票-->
{if $creatList|default:array()}
<section class="alignLeft">
    <header class="clearfix rightTitle">
        <h2>发起榜单</h2>
    </header>
        <div class="rdtDiv new_tp_list">
            <div class="new_tpR_tit">
                <div class="wid_01">排名</div>
                <div class="wid_02">用户</div>
                <div class="wid_03">发起数</div>
            </div>
            <ul>
                {foreach key=creatkey item=creatitem from=$creatList}
                    <li>
                        <div class="wid_01">
                            <span class="tppm_num {if $creatkey < 3}tppm_num{$creatkey+1}{/if}">{$creatkey+1}</span>
                        </div>
                        <div class="wid_02 user_card"><a href="employee/vote/id/{$creatitem.creatorid}" tips="1" rel="">{$creatitem.name}</a></div>
                        <div class="wid_03">{$creatitem.num}</div>
                    </li>
                {/foreach}
            </ul>
        </div>
</section>
{/if}
<!--参与投票-->
{if $actorList|default:array()}
<section class="alignLeft mt15">
    <header class="clearfix rightTitle">
        <h2>参与榜单</h2>
    </header>
        <div class="rdtDiv new_tp_list">
            <div class="new_tpR_tit">
                <div class="wid_01">排名</div>
                <div class="wid_02">用户</div>
                <div class="wid_03">参与数</div>
            </div>
            <ul>
                {foreach key=actorkey item=actoritem from=$actorList}
                    <li>
                        <div class="wid_01"><span class="tppm_num {if $actorkey eq 0}tppm_num1{/if}{if $actorkey eq 1}tppm_num2{/if}{if $actorkey eq 2}tppm_num3{/if}">{$actorkey+1}</span></div>
                        <div class="wid_02 user_card"><a href="{$actoritem.employeeid}" tips="1" rel="{$actoritem.employeeid}">{$actoritem.name}</a></div>
                        <div class="wid_03">{$actoritem.num}</div>
                    </li>
                {/foreach}
            </ul>
        </div>
</section>
{/if}
<!--猜你喜欢-->
{if $thinkList|default:array()}
<section class="alignLeft mt30">
    <header class="clearfix rightTitle">
        <h2>猜你喜欢</h2>
    </header>
    <div class="rdtDiv gg_list tp_xt_list">
        <ul>
            {foreach key=thinkkey item=thinkitem from=$thinkList|default:array()}
                <li>
                    <a href="{$thinkitem.id|default:0}" class="yyIco07" title="{$thinkitem.title}">{$thinkitem.title}</a>
                    <span class="cy_num">已有{$thinkitem.num|default:0}人参与</span>
                </li>
            {/foreach}

        </ul>
    </div>
</section>
{/if}