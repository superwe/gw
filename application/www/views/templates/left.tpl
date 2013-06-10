<div class="grid" style="width:150px;background: #FFF6BF;border-radius: 5px 0 0 5px;">
    <div  style="padding: 5px;"><img src="/images/test/logo140.jpg"/></div>
    <div class="clear" style="height: 20px"></div>
    <div class="app">
        <h3>应用</h3>
        <ul>
            {foreach from=$appList item=app}
                <li><img src="{$app->imageurl}"/><a href="{$app->url}">{$app->name}</a></li>
            {/foreach}
        </ul>
    </div>
    <div class="clear" style="height: 20px"></div>
    <div class="group">
        <h3>群组+</h3>
        <ul>
            <li class="selected"><img src="/images/app_speak_small.png"/><a>畅捷通企业空间</a></li>
            <li><img src="/images/app_calendar_small.png"/><a>全体成员</a></li>
            <li><img src="/images/app_speak_small.png"/><a>产品群组</a></li>
            <li><img src="/images/app_library_small.png"/><a>产品二部</a></li>
            <li><img src="/images/app_blog_small.png"/><a>所有群组</a></li>
        </ul>
    </div>
</div>