<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <link rel="stylesheet" type="text/css" href="/css/file.css" />
    <script src="http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script src="/js/yonyou/lib/yonyou.js"></script>
    <script src="/js/yonyou/lib/yy.core.js"></script>
    <script src="/js/yonyou/modules/file/file.init.js"></script>
    <script src="/js/yonyou/modules/file/yy.file.js"></script>
    <script src="/js/yonyou/widgets/flexpaper/flexpaper_flash.js"></script>
    <script src="/js/yonyou/widgets/flashplayer/yy.player.js"></script>
    <title>首页-畅捷通-企业空间</title>
</head>
<body>
<!--页头-->
{include file="employee/header.tpl"}
<div style="margin:0 auto;width:980px;margin-top:25px;">
    <div class="container clearfix">
        <div class="container wkHeader" style="width: 980px;">
            <div class="grid" style="width:150px;padding-left:20px;">
                <img src="../../images/app_library.png"/>
                <span class="fileTitle">文库</span>
            </div>
            <div class="grid" style="float:right;">
                <a class="filebutton" data="2" href="javascript:;" id="file_upload_button">上传文档</a>
            </div>
        </div>
    </div>
    <input type="hidden" value="{$file.id}" name="fid" id="fid">
    <input type="hidden" value="{$org_fileid}" name="org_fileid" id="org_fileid">
    <div class="container clearfix  wkContent" style="margin-top:25px;display:none;" id="file_index">
        {include file="employee/file/file_left.tpl"}

        <div class="grid rCont">
            <h3 class="wMTittle fl" id="doc-path-containter">
                <span class="fl doc-path path_top">全部文档</span>
                <span class="fl sep doc-path-sep">&gt;</span>
                <span class="fl doc-path">全部文档</span>
            </h3>
            <!--列表展示-->
            <div  id="file_list" class="wListBox fileclear">
                {include file="employee/file/file_search.tpl"}
                <div id="yyDataList" class="wFileList">
                    <ul class="yy-data-list"></ul>
                    <!--分页，用线上统一-->
                    <div class="yy-page-line-wrap clearfix">
                        <div class="yy-page-line newPage"></div>
                    </div>
                </div>
            </div>
            <!--权限控制针对企业文档-->
            <div id="file_upload_priv" class="wUploadWrap uStep2" style="display:none;">
                <h3 class="wUpTitle_priv">您没有权限上传文档</h3>
            </div>
            <!--上传文档-->
            <div id="file_upload" class="wUploadWrap uStep2"  style="display:none;">
                <h3 class="wUpTitle">上传文档</h3>

                <div class="yy-upload-block">
                    <!-- <ul class="yy-upload-file-list-header">
                    </ul> -->
                    <ul class="yy-upload-file-list" style="display:none;">
                        <li class="upFileTitle">
                            <div class="yy-upload-file-title">你选择的文档</div>
                            <div class="yy-upload-file-size">文档大小</div>
                            <div class="yy-upload-file-status">状态</div>
                            <div class="yy-upload-file-oper"></div>
                        </li>
                    </ul>
                    <div class="hide-afert-start clearfix">
                        <div class="upBtWrap relative">
                            <span id="fileNewup">选择文件</span>
                            <span class="wUploadBt">选择文件</span>
                            <span class="file_wd01" style="display:none;"><i class="colorCheng yy-upload-queue-num">0</i> 篇文档等待上传</span>
                        </div>
                        <div class="">
                            <input type="button" class="startBt yy-start-upload" style="display:none;color:#FFFFFF;" value="开始上传">
                            <input type="hidden" id="fids" name="fids" value="">
                            <input type="hidden" id="fileFromObj" name="fileFromObj" value="50">
                            <input id="uploadGroupID" type="hidden" value="0" name="uploadGroupID" />
                        </div>
                    </div>
                </div>
                <div class="hide-afert-start clearfix">
                    <div><strong>温馨提示：</strong></div>
                    <p class="clueCont mt5">支持的文件最大容量：<span class="colorCheng">100MB</span> (每次最多上传<span class="colorCheng">10</span>篇文档，上传过程中请<span class="colorCheng">不要关闭和刷新本页</span>)</p>
                    <p class="clueCont">目前暂不支持exe后缀格式文件</p>
                </div>
            </div>
            <!--文件夹管理-->
            <div id="file_manage" class="wManageBox"  style="display:none;">
                <div class="wMtitle">
                    <div class="fr" id="doc-right-option-containter">
                        <a data="0" id="right-option-return" class="fr zOper10 hidden" href="javascript:;">返回</a>
                        <a href="javascript:;" data="1" id="right-option-quit" class="fr"><span class="wExitIcon"></span><span>退出管理</span></a>
                        <a id="right-option-newfolder" href="javascript:;" class="fr hidden"><span class="wAddIcon"></span><span>新建文件夹</span></a>
                    </div>
                </div>

                <!--文档TAB开始-->
                <table width="98%" border="0" class="manList" cellpadding="0" cellspacing="0" id="yyGroupTable">
                    <thead>
                    <tr></tr>
                    </thead>
                    <tfoot style="display:none;">
                    <tr>
                        <th></th>
                    </tr>
                    </tfoot>
                    <tbody></tbody>
                </table>
                <div id="yyGroupPage" class="cyPageBox">
                    <div class="yy-page-line newPage"></div>
                </div>
            </div>
        </div>
    </div>


    <div class="container clearfix" style="margin-top:25px;" id="file_view">
        <div class="container content_header" style="width:948px;">
            <div class="grid" style="width:80px;height:95px;"><span class="{$file.ico_ext}"></span></div>
            <div class="grid zskxq_title" style="width:570px;">
                <p class="zskxq_wdbt" {if $isedit}id="fileTitle"{/if}>
                    <input type="text" readonly="" value="{if isset($file.title)}{$file.title}{/if}" name="title" class="addInput yy-file-title hidden">
                    <span class="placeholder fontB">{$file.title}</span>
                    {if $isedit}<a href="#yy-file-title-edit" class="icoBj" title="编辑">&nbsp;</a>{/if}
                </p>
                <p><span class="fontB">创建人：</span>
                    <a href="/employee/homepage/index/{$file.fcreatorid}">{$file.fname}</a>（创建人）&nbsp;&nbsp;<a href="/employee/homepage/index/{$file.creatorid}">{$file.name}</a>&nbsp;更新于{$file.update}
                    <span style="display:none;" class="yy-desc-count fr">还可以输入<i style="color:red;" class="count">0</i>个字</span>
                </p>
                <div class="relative" {if $isedit}id="fileDesc"{/if}>
                    {if $file.content}
                        <div class="yy-placeholder">{$file.content}</div>
                        <div class="yy-desc-content fl">{$file.content},</div>
                        <a href="javascript:;" style="visibility:hidden;" class="yy-showmore fl"><span class="downSj"></span></a>
                        {if $isedit}<a href="#yy-file-desc-edit" class="icoBj fl" id="picInfo" title="编辑">&nbsp;</a>{/if}
                    {else}
                        <div class="yy-placeholder"></div>
                        <div class="yy-desc-content fl">这个文档还没有被描述,</div>
                        <a class="yy-showmore fl" style="visibility:hidden;" href="javascript:;"><span class="downSj"></span></a>
                        {if $isedit}<a href="#yy-file-desc-add" class="icoBj fl" id="picInfo">&nbsp;</a>{/if}
                    {/if}
                </div>
                <p class="mt4">
                    文档路径：{$daohang}
                </p>
            </div>
            <div class="grid zskxq_btn" style="width:280px;">
                <p id="atten_file" style="margin-top:15px;padding-left:15px;">
                    {if $followFlag == 0}
                        <a type="1" for="{$file.id}" role="{$file_object_type}" class="yy-follow button addFollowButton" ele_role="file">加关注</a>
                    {else}
                        <a class="yy-follow button cancelFollowButton" role="{$file_object_type}" ele_role="file" type="0" for="{$file.id}">取消关注</a>
                    {/if}
                </p>
                <div class="zskxq_num">
                    <table width="280" cellspacing="0" cellpadding="0" border="0">
                        <tbody><tr>
                            <th width="70">关注</th>
                            <th>下载</th>
                            <th>浏览</th>
                            <th>评论</th>
                        </tr>
                        <tr>
                            <td class="zsk_tNum">{if $file.follownum > 0}{$file.follownum}{else}0{/if}</td>
                            <td class="zsk_tNum">{if $file.downnum > 0}{$file.downnum}{else}0{/if}</td>
                            <td class="zsk_tNum">{if $file.viewnum > 0}{$file.viewnum}{else}0{/if}</td>
                            <td class="zsk_tNum" id="allcommentnum">{if $file.commentnum > 0}{$file.commentnum}{else}0{/if}</td>
                        </tr>
                        </tbody></table>
                </div>
            </div>
        </div>
        <div class="container">
            <div class="grid cont_left" style="width:778px;">
                <div class="zskleft_con">
                    <div class="zskleft_top">
                        {if $isswf}
                            <p class="chakanCont01">
                                <a id="viewerPlaceHolder" style="width:750px;height:480px;display:block"></a>
                            </p>
                        {elseif $file.isImg}
                            <!--如果是图片详情页，增加放大和旋转按钮-->
                            <div class="zskxq_pic_yl yy-operate-line picyl_Tk alignCenter">
                                <a href="{if isset($resource.filepath)}{$resource.filepath}{/if}" target="_blank" class="zskxq_yl_fa"></a>
                                <a href="javascript:;" class="yy-turnleft zskxq_yl_lx"></a>
                                <a href="javascript:;" class="yy-turnright zskxq_yl_rx"></a>
                            </div>
                            <p class="chakanCont01 mt10">
                                <img src="{if isset($resource.filepath)}{$resource.filepath}{/if}" height="300">
                            </p>
                        {elseif $playerType == 'music'}
                            <ul class="chakanCont02 clearfix">
                                <li class="fl docLeft"><span class="{$file.ico_ext}"></span></li>
                                <li class="fr docRight"><img class="playMusic" id="playerBtn" src="../../images/share_music_play.png"alt="点击播放"><br /><br />{if  !empty($file.isdownloadable)}请【<a href="/employee/file/down/fileid/{$file.id}">点击这里</a>】下载！{/if}
                                </li>
                            </ul>
                        {elseif $playerType == 'video'}
                                <input type="hidden" value="video" name="videoType" id="videoType">
                                <p class="chakanCont02">
                                <div id="playerBtn"></div>
                                <span class="fr shipin_span">请【<a href="/employee/file/down?fileid={$file.id}">点击这里</a>】下载！</span>
                                </p>
                        {else}
                            <ul class="chakanCont02 clearfix">
                                <li class="fl docLeft"><span class="{$file.ico_ext}"></span></li>
                            </ul>

                        {/if}
                        <div style="clear:both;"></div>
                        <div class="add_xian"></div>
                        <div style="padding:10px 0;">讨论＂{$file.title}＂</div>
                        <div class="filecomment">
                            <form action="/employee/reply/add" method="post" enctype="multipart/form-data" name="groupForm" id="addboxForm">
                                <input type="hidden" name="targetid" value="{$fileid}" id="targetid">
                                <input type="hidden" name="module" value="{$file_object_type}" id="module">
                                <input type="hidden" name="fromurl" value="{$fromurl}" id="fromurl">
                                <input type="hidden" name="replyid" value="0" id="replyid">
                                <textarea class="coninput" name="replycontent"  cols="120" rows="3" id="replycontent"></textarea>
                                <input name="replysubmit" id="replysubmit" value="评论" type="button" class="commentbutton blueButton">
                            </form>
                        </div>
                    </div>
                    <div id="showcontent">
                        {include file="employee/file/getmorereply.tpl"}
                    </div>
                    {if $replycount >= 6}
                    <div style="margin: 10px 20px 0px;" class="bottomMore" id="footer_morefeed">
                        <input type="hidden" name="showpage" id="showpage" value="2">
                        <a href="javascript:;" id="reply_more" data="" resource-id="getcontent">查看更多&gt;&gt;</a>
                    </div>
                    {/if}
                </div>
            </div>
            <div class="grid rightbar user_card" style="width:198px;">
                <div style="padding: 4px;" class="newmember_panel">
                    <h3 class="thin">文档操作</h3>

                    <div class="zskAction container">
                        {if $file.isImg}
                        <a target="_blank" class="ico04" href="{if isset($resource.filepath)}{$resource.filepath}{/if}">
                            <span class="viewIcon"></span>
                            <span>查看原图</span>
                        </a>
                        {/if}
                        {if $file.isdownloadable}
                        <a class="ico01" href="/employee/file/down?fileid={$file.id}">
                            <span class="downIcon"></span>
                            <span>下载</span>
                        </a>
                        {/if}
                        {if $file.creatorid == $employeeid}
                             {if $file.isdownloadable}
                                 <a href="/employee/file/allowdown?status=0&fileid={$file.id}" class="mr0">
                                     <span class="jzIcon"></span>
                                     <span>禁止下载</span>
                                 </a>
                             {else}
                                    <a href="/employee/file/allowdown?status=1&fileid={$file.id}">
                                        <span class="yxIcon"></span>
                                        <span>允许下载</span>
                                    </a>
                              {/if}
                        {/if}
                        {if $isversion}
                        <a from="" fid="{$file.id}" from="{$from}" class="ico03 uploadVersion" data="{$daleiName}" href="#updateFileVerson">
                            <span class="upNewIcon"></span>
                            上传新版
                        </a>
                        {/if}
                        {if $file.creatorid == $employeeid}
                        <a class="del_ico" href="/employee/file/delfile?fileid={$file.id}&from=1">
                            <span class="delIcon2"></span>
                            <span>删除该版</span>
                        </a>
                        {/if}
                        {if $ishistory}
                        <a class="ico08 mr0" href="/employee/file/toCurrentVersion?fileid={$file.id}">
                            <span class="restIcon"></span>
                            <span>恢复该版</span>
                        </a>
                        {/if}
                        {if $isdel}
                        <div style="left:48px;top:20px;" class="delLay relative fl yy-delete z5">
                            <aside class="delTk hidden">确定要删除该文档？<br>
                                <a style="color:#FFF" class="feed-delete-confirm" href="javascript:void(0);">删除</a>
                                <a class="yy-delete-cancel" href="javascript:void(0);">不删除</a>
                                <span class="sj xsj"></span>
                            </aside>
                        </div>
                        <a for="/employee/file/delfile" fid="{$file.id}" class="ico05 yy-delete-link">
                            <span class="wDelIcon"></span>
                            <span>删除</span>
                        </a>
                        {/if}
                        {if $editshare}
                        <a href="javascript:;" fid="{$file.id}" class="edit_u_ico share_edit">
                            <span class="gxIcon"></span>
                            <span>共享人</span>
                        </a>
                        {/if}
                    </div>
                </div>
                <input type="hidden" value="{$allversionStr}" name="allversionStr" id="allversionStr">
                {if $editshare}
                <div style="padding: 4px;" class="newmember_panel" id="yy_share_file"></div>
                {/if}
                {if $followcount}
                <div style="padding: 4px;" class="newmember_panel" id="yy_follow_file"> </div>
                {/if}
                {if $downcount}
                <div style="padding: 4px;" class="newmember_panel" id="yy_down_file"></div>
                {/if}

                <div style="padding: 4px;" class="newmember_panel">
                    <h3 class="thin">历史版本</h3>
                    <div style="width: 100%;margin: 5px 0;" class="container">
                        {foreach item=item key=key from=$versionList}
                        <div class="grid history">
                            <img src="{$item.imageurl}" class="fl photo" tips="1" rel ="/employee/employee/cardInfo/{$item.creatorid}">
                            <div class="fl photo_title">
                                <a href="/employee/file/view?fileid={$item.id}">
                                {if $item.id == $nowfileid}
                                    当前版本
                                {else}
                                     {$item.name} 更新于{$item.showdate}
                                {/if}
                                 </a>
                            </div>
                        </div>
                        {/foreach}
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>
<script>
    var fid = {$file.id},
            player = '{$player}',
            imgpath = '{$file.image}',
            playertype = '{$playerType}'
    window.session_id = "{$sessionid}";
    window.qiater_user = "{$qiater_user}";
    window.rscallback = "{$rscallback}";
    window.rscallbackflag = "{$rscallbackflag}";
    if(rscallback != '') $.yy.rscallback(rscallback, rscallbackflag);
</script>
<script type="text/template" id="yy_skip_template">
    <h3 class="thin">
        <%=fileTitle%>
        <a class="fr moreRight" id="<%=nextId%>" href="javascript:;"></a>
        <a class="fr moreLeft" id="<%=prevId%>" href="javascript:;"></a>
    </h3>
    <div style="width: 100%;margin: 5px 0;" class="container">
        <div id="<%=listId%>">
        </div>
    </div>
</script>
<aside id="rscallback" class="tsBox absolute z6" style="display:none;z-index:99999;">
    <span class="icoRighttk">上传成功</span>
</aside>
{include file="employee/footer.tpl"}
</body>
</html>