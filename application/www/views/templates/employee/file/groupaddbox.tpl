<div class="wjSetBox" id="corp-newfloder-containter">
    <div class="setTitle">{if isset($boxinfo.id)}编辑{else}新建{/if}企业文件夹</div>
    <div class="formList">
        <form action="/employee/file/groupaddok" method="post" enctype="multipart/form-data" name="groupForm">
            <div class="pb18 clearfix">
                <label class="fl groupnameDiv" for=""><span class="rcolor2">*</span>分类名称</label>
                <input type="hidden" name="pid" value="{if isset($boxinfo.pid)}{$boxinfo.pid}{else}{$pid}{/if}" id="pid">
                <input type="text" value="{if isset($boxinfo.name)}{$boxinfo.name}{/if}" name="foldername" id="foldername" class="typeName fl"><br><input type="hidden" class="" value="{if isset($boxinfo.id)}{$boxinfo.id}{/if}" name="folderid" id="folderid">
            </div>
            <div class="flBts">
                <input id="addGroupboxForm" type="button" class="ya_button ya_blueButton" value="确定" />
                <input type="button" class="cGrayBt" value="取消" id="doc-corp-cancel" />
            </div>
        </form>
    </div>
</div>