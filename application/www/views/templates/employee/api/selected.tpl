<script type="text/javascript" src="/js/yonyou/modules/file/yy.filebox.js"></script>

<div class="selectTk greyboxBx" id="selectedfileAside">
    <div class="clearfix selectTkCont">
        <section class="selectTkContL">
            <a href="/employee/api/filelist?filter=all" class="yy-file-selected-link cur">所有文档</a>
            <h3>常用</h3>
            <a href="/employee/api/filelist?filter=recent" class="yy-file-selected-link">最近文档</a>
            <a href="/employee/api/filelist?filter=followed" class="yy-file-selected-link">我关注的</a>
            <a href="/employee/api/filelist?filter=upload" class="yy-file-selected-link">我上传的</a>
            <h3>群组</h3>
            {foreach item=group key=key from=$grouplist}
                <a href="/employee/api/filelist?filter=group&groupid={$group['id']}" class="yy-file-selected-link" title="{$group.name}">{$group.name}</a>
            {/foreach}
        </section>
        <div class="selectTkContR" id="selectedfileTable"></div>
    </div>
    <div class="selectFoot clearfix ">
        <input id="selectedfileAdd" type="button" value="添加" class="fr button blueButton">
        <input name="selectedFileCancel" id="selectedFileCancel" type="button" value="取消" class="fr button grayButton">
    </div>
</div>
