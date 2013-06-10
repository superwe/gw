<div class="wSeaBox clearfix"  id="extSearch">
    <strong style="float: left;">文档格式选择：</strong>
    <input type="checkbox" value="doc" name="fileext" id="fileext"><label for="">DOC</label>
    <input type="checkbox" value="ppt" name="fileext" id="fileext"><label for="">PPT</label>
    <input type="checkbox" value="txt" name="fileext" id="fileext"><label for="">TXT</label>
    <input type="checkbox" value="pdf" name="fileext" id="fileext"><label for="">PDF</label>
    <input type="checkbox" value="xls" name="fileext" id="fileext"><label for="">XLS</label>
    <input type="checkbox" value="jpg" name="fileext" id="fileext"><label for="">图片</label>
    <input type="checkbox" value="mv" name="fileext"  id="fileext"><label for="">视频</label>
    <input type="checkbox" value="mp3" name="fileext" id="fileext"><label for="">音频</label>
    <a href="javascript:;" name="extcancel" id="extcancel" class="wClearBt hidden">清空</a>
</div>
<div class="wOderBox">
    <ul class="wOders fl" id="orderList">
        <li class="norOder relative" id="orderDefaultShow">
            <a href="javascript:;"><span>默认排序</span><span class="wP1"></span></a>
            <aside class="wPList hidden orderdefault">
                <a href="javascript:;" data="downnum" ><span class="wP3"></span><span>下载量从高到低</span></a>
                <a href="javascript:;" data="follownum" ><span class="wP3"></span><span>关注量从高到低</span></a>
                <a href="javascript:;" data="commentnum" ><span class="wP3"></span><span>评论数从高到低</span></a>
                <a href="javascript:;" data="createtime" ><span class="wP3"></span><span>最新时间</span></a>
            </aside>
        </li>
        <li><a data="downnum" href="javascript:;"><span>下载量</span><span class="wP2"></span></a></li>
        <li><a data="follownum" href="javascript:;"><span>关注量</span><span class="wP2"></span></a></li>
        <li><a data="createtime" href="javascript:;"><span>最新</span><span class="wP2"></span></a></li>
        <li><a data="commentnum" href="javascript:;"><span>评论数</span><span class="wP2"></span></a></li>
        <li><a data="sharetime" href="javascript:;" class="hidden" id="sharetime"><span>共享时间</span><span class="wP2"></span></a></li>
    </ul>
    <div  class="fr wRSeach titleSearch">
        <input name="filesearch" id="filesearch" value="{$filesearch}" type="text" /><input type="button" name="fsubmit" id="fsubmit" class="wrsBt" />
    </div>
</div>
<div class="fr hidden" id="searchList" style="padding-top:5px;">
    <input class="first" type="radio" name="searchtype" id="searchtype" checked="checked" value="title">按名称
    <!--<input type="radio" name="searchtype" id="searchtype"  value="keyword">按关键词-->
    <input type="radio" name="searchtype" id="searchtype"  value="name">按贡献者
</div>
<input type="hidden" name="employeeid" value="{$employeeid}" id="employeeid">