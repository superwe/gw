<div class="editor-wrap">
    <form class="form-block" action="" method="POST" enctype="multipart/form-data">
        <div class="content-block-wrap" style="position:relative;display:block;">
            <div ele-role="textarea" class="content-block" contentEditable="true"></div>
            <input name="groupid" type="hidden" value="{$groupId|default:'0'}">
        </div>
        <div class="action-line" style="display:block;height:30px;width:100%;float:left;">
            <a href="javascript:;" class="face-button icon_face fl" title="添加表情"></a>
            <a href="javascript:;" class="at-button icon_ait fl" title="@"></a>
            <a href="javascript:;" class="file-button icoWd fl" title="添加文档"></a>
            {*<a href="javascript:;" class="topic-button fl icoHt" title="添加话题"></a>*}
            <a href="javascript:;" class="video-button fl yy_redioIcon " title="视频链接"></a>

            <input type="submit" class="submit-button chengBt fr" value="发布" title="Ctrl+Enter" />
        </div>
    </form>
</div>