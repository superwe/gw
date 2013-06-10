<div class="boxContainer" style=" width: 700px;">
    <div class="boxContainerTitle">
        <h2 class="floatL">位置共享</h2>
        <a title="关闭" class="close floatR"></a>
    </div>
    <div class="boxShareContent">
        <!--我的共享列表开始-->
        <p style="height: 25px;line-height:25px;">
            <span class="floatL font14">我的共享</span>
            <span class="floatL">（以下这些人可以看到我的签到记录）</span>
            <a href="javascript:;" class="floatR boxShareAddEmployee" for="boxShare">+添加共享</a>
        </p>
        <ul class="clearfix boxShareUl" id="boxShare_list">
            {foreach item=item from=$lists.fromMe}
            <li id="list_{$item.id}">
                <div class="figure"><img src="http://static.yonyou.com/qz/avatar/000/01/73/23.jpg.thumb.jpg" alt="" /></div>
                <div class="floatL name">
                    <p><a href="" target="_blank">{$item.name}</a></p>
                    <p>{$item.duty|default:''}</p>
                </div>
            </li>
            {foreachelse}
            <li class="nodata" style="color:#0178B3;">暂时没有我的共享数据...</li>
            {/foreach}
        </ul>
        <div class="clearfix" style="margin: 6px 0;"></div>
        <!--共享给我的列表开始-->
        <p style="height: 25px;line-height:25px;">
            <span class="floatL font14">共享给我</span>
            <span class="floatL">（我可以看到以下这些人的签到记录）</span>
            {if $lists.toMe}<a href="/employee/sign/shareSignList" class="floatR ">查看签到</a>{/if}
        </p>
        <ul class="clearfix boxShareUl">
            {foreach item=item from=$lists.toMe}
            <li>
                <div class="figure"><img src="http://static.yonyou.com/qz/avatar/000/01/73/23.jpg.thumb.jpg" alt="" /></div>
                <div class="floatL name">
                    <p>
                        <a href="#" target="_blank">{$item.name}</a>
                    </p>
                    <p>{$item.duty|default:''}</p>
                </div>
            </li>
            {foreachelse}
            <li style="color:#0178B3;">暂时没有共享给我的数据...</li>
            {/foreach}
        </ul>
    </div>
</div>