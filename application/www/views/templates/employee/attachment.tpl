{if $item.fileList|default:array()}
<ul class="new_dt_fj">
    {foreach from=$item.fileList|default:array() item=file}
    <li class="attachment-item">
        <div class="file">
            <span class="fl logo"><a class="ico_{$file.ext|default:'doc'}_s"></a></span>
            <div class="fl secr operation">
                <a href="/file/view/index/fid/{$file.id|default:0}" class="fl name">{$file.title|default:''}</a>
                <span class="fr attachment-item-op"><a href="/file/view/index/fid/{$file.id|default:0}" class="fd_ico">预览</a>
                    <a href="/file/act/down/fid/{$file.id|default:0}" class="xz_ico">下载</a>
                    <a href="/file/view/index/fid/{$file.id|default:0}" class="ck_ico">查看文档主页</a></span>
            </div>
        </div>
    </li>
    {/foreach}
</ul>
{/if}
{if $item.imageList|default:array()}
<div class="yy-pic-preview yy-non-actived">
    <div style="display:none;" class="dtBImg">
        <div class="yy-img-operation imgOpeBox clearfix">
            <div class="fl action-line">
                <a href="javascript:;" class="yy-pack-up">收起</a><a href="javascript:;" target="_blank" class="yy-view-orig">查看详情</a>
                <a  href="">下载</a>
            </div>
            <div class="fl opb">
                <a href="javascript:;" class="yy-turnleft">左转</a>
                <a href="javascript:;" class="yy-turnright">右转</a>
            </div>
        </div>
        <div class="relative">
            <a style="display:none;" href="javascript:;" class="yy-arrow-left"></a>
            <div class="yy-big-preview">
                <a class="yy-big-pic-inner" href="javascript:;">
                    <img src=""></a>
            </div>
            <a style="display:none;" href="javascript:;" class="yy-arrow-right"></a></div>
    </div>
    <div class="xImgList relative">
        <a href="javascript:;" style="display:none;" class="yy-nav-arrow-left"></a>
        <div class="yy-nav-wrapper relative">
            <ul class="clearfix yy-nav-list">
                {foreach from=$item.imageList|default:array() item=image}
                <li fid="{$image.id|default:0}" rel=""><a href="javascript:;" {if count($item.imageList) == 1}class="bigIcon"{/if}><img src="{$image.filepath|default:''}"></a></li>
                {/foreach}
            </ul>
        </div>
        <a href="javascript:;" class="yy-nav-arrow-right" {if count($item.imageList) < 5}style="display: none;" {/if}></a><p class="dtImgNum">共{count($item.imageList)}张图片</p>
    </div>
</div>
{/if}