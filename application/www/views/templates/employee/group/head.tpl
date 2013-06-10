<div class="group_header" {if $group['bgurl']}style="background:url({$group['bgurl']}) left top;"{/if}>
	<div class="title">{$group['name']}</div>
    <div class="group-desc">{$group['description']}</div>
    <ul class="tab">
    	{if (in_array($action, array('index', 'employee', 'file')))}
    	<li><a href="/employee/group?id={$group['id']}" {if $action == 'index'}class="selected"{/if}>会话</a></li>
        <li><a href="/employee/group/employee?id={$group['id']}" {if $action == 'employee'}class="selected"{/if}>成员</a></li>
        <li><a href="/employee/group/file?id={$group['id']}" {if $action == 'file'}class="selected"{/if}>文库</a></li>
        {else}
        <li><a href="/employee/group/setting?id={$group['id']}" {if $action == 'setting'}class="selected"{/if}>设置</a></li>
        <li><a href="/employee/group/auditsEmployee?id={$group['id']}" {if $action == 'auditsEmployee'}class="selected"{/if}>成员审核</a></li>
      	<li><a href="/employee/group/listEmployee?id={$group['id']}" {if $action == 'listEmployee'}class="selected"{/if}>群组成员</a></li>
        <li><a href="/employee/group/addEmployee?id={$group['id']}" {if $action == 'addEmployee'}class="selected"{/if}>添加成员</a></li>
        {/if}
    </ul>
    <div class="group-right">
    <div class="group-logo"><a href="/employee/group/index?id={$group['id']}"><img src="{$group['logourl']}" height="60" width="60"></div></a>
    {if (in_array($action, array('index', 'employee', 'file')))}
	    {if $status == 1}
         <span class="group-set"><a href="/employee/group/quit?id={$group['id']}" class="button_blue center" id="quit">退出群组</a></span>
        {/if}
        {if $status == 2}
         <span class="group-set"><a href="/employee/group/join?id={$group['id']}" class="button_blue center" id="join">加入群组</a></span>
        {/if}
        {if $status == 0}
         <span class="group-set"><a href="/employee/group/setting?id={$group['id']}" class="button_blue center" id="setting">设置</a></span>
        {/if}
        {if $status == 3}
        <span class="group-set"><a href="#" class="button_gray center">审核中</a></span>
        {/if}
    {else}
    <span class="group-homepage"><a href="/employee/group/index?id={$group['id']}">返回群组首页</a></span>
    {/if}
    </div>
</div>