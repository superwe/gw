<div class="reply-block yy-upload-block">
    <aside class="selectTk groupTk">
        <form name="myform" action="/employee/file/uploadversionok" method="post" enctype="multipart/form-data">
            <!-- 进度条 -->
            <div class="barBox clearfix yy-upload-process-container" id="divUploadBar" style="display: none;">
                <div class="grayBar fl"> <span class="blueBar yy-upload-process-bar" id="uploadBar"></span> </div>
                <a href="javascript:;" class="del fr c6Link yy-upload-process-cancel">×</a>
            </div>
            <!-- 上传附件列表 -->
            <div class="rcFjList yy-upload-list z3">
                <ul id="fileContainer" class="yy-uploaded-file-list" style="display: none;">
                </ul>
            </div>
            <input id="id" type="hidden" name="id" value="">
            <input id="parentid" type="hidden" name="parentid" value="{$file.id}">
            <input type="hidden" id="ancestorids" name="ancestorids" value="{$file.next_ancestorids}">
            <input type="hidden" id="level" name="level" value="{$file.next_level}">
            <input type="hidden" id="fileid" name="fileid" class="groupUploadFids" value="{$file.id}" />
            <input type="hidden" name="fids" id="fids" class="groupUploadFids" value="" />
            <menu class="tkCont">
                <ul id="before_upload">
                    <li>该文档将被添加到 {$upinfo}</li>
                        <li>从电脑直接上传</li>
                        <li style="height:27px;"><div class="clearfix gzContHfht mt10 rcAddFj z1" id="uploadDoc">
                                <div class="fl relative" id="groupDoc">
                                    <a class="button inputMoni" href="javascript:;"><span id="groupFileUploadBtn">选择文件</span></a><span class="uploadClue">上传文档小于100M</span>
                                </div>
                            </div>
                        </li>
                </ul>
            </menu>
        </form>
    </aside>
</div>
