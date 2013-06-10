<input type="hidden" id="fids" name="fids" value="" />
<input type="hidden" name="frommodule" value="">
<!-- 进度条 -->
<div class="barBox clearfix yy-upload-process-container" id="divUploadBar" style="display: none;">
    <div class="grayBar fl"> <span class="blueBar yy-upload-process-bar" id="uploadBar"></span> </div>
    <a href="javascript:;" class="del fr c6Link yy-upload-process-cancel">×</a>
</div>
<!-- 上传附件列表 -->
<div class="mt10 rcFjList yy-upload-list z4">
    <ul id="fileContainer" class="yy-uploaded-file-list" style="display: none;">
    </ul>
</div>
<div class="gzBiaoqian mt10 clearfix z3" id="topic_warp" {if !$topicValue|default:''}style="display:none;"{/if}>
    <div id="topic_div" class="fl relative addHTlx htBiaoqian wb85">
        <ul class="clearfix">
            {foreach item=item from=$topicValue|default:array()}
                <li class="gzBiaoqiana fl">
                    <span>{$item}</span>
                    <input type="hidden" name="topic_new_value[]" value="{$item}">
                    <a class="close" href="###"></a>
                </li>
            {/foreach}
            <li class="addTopicLi ht_add_wid" id="addTopic_li" {if $topicValue|default:''}style="display:none;"{/if}>
                <div id="addTopic_div">
                    <input type="text" id="topic_input" class="addInput" maxlength="30" value="" />
                    <a id="addtopic" class="c3Link line30" href="javascript:;" data="">添加话题</a>
                </div>
            </li>
        </ul>
    </div>
    {if $topicValue|default:''}
        <div class="fr mr5 addTopicFinished"><a href="javascript:;">编辑话题</a></div>
    {else}
        <div class="fr mr5 addTopicFinished"><a href="javascript:;">完成</a></div>
    {/if}
</div>
