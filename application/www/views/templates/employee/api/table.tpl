<div style="white-space:normal;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style=" width:530px; table-layout:fixed;">
        <tr>
            <th width="25%">名称</th>
            <th width="20%">类型</th>
            <th width="15%">最后更新人</th>
            <th width="20%">最后更新时间</th>
        </tr>
    </table>
</div>
<div style="overflow-y:auto;white-space:normal;max-height:240px;_height:expression(this.scrollHeight > 240 ? '240px' : 'auto');">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout:fixed">
        {foreach item=row from=$getfiles}
            <tr class="yy-attatchment-tr" file_id="{$row.id}" title="{$row.title}">
                <td width="25%">{$row.title}</td>
                <td width="20%">{$row.filetype}</td>
                <td width="15%"><img src="{$row.imageurl}" height="20" width="20">{$row.name}</td>
                <td width="20%">{$row.createtime}</td>
            </tr>
        {/foreach}
    </table>
</div>