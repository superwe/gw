<div class="grid leftbar">
    <div  style="padding: 5px;"><img src="/images/test/logo140.jpg"/></div>
    <div class="clear" style="height: 20px"></div>
    <div class="app_panel">
        <h3>应用</h3>
        <ul>
        	{if !empty($appList)}
            {foreach from=$appList item=app}
                <li><img src="{$app['imageurl']}"/><a href="{$app['url']}">{$app['name']}</a></li>
            {/foreach}
            {/if}
        </ul>
    </div>
    <div class="clear" style="height: 20px"></div>
    <div class="group_panel">
        <h3>群组<a id="creator" href="javascript:;">+</a>
        	<p style="margin-top: -22px;margin-left: 120px;"><a href="/employee/group/mylist" title="设置"><img src="/images/group_set.png"></a></p>
        </h3>
        <ul class="group_list">
        	{if !empty($groupList)}
            {foreach from = $groupList item = group}
	        <li class="groupIcon"><a href="/employee/group/index?id={$group['id']}">{$group['name']}</a></li>
	        {/foreach}
	        {/if}
			<li class="allGIcon"><a href="/employee/group/lists">所有群组</a></li>
        </ul>
    </div>
</div>
