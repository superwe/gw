<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/css/employee.css" />
    <link rel="stylesheet" type="text/css" href="/css/common.css" />
    <link rel="stylesheet" type="text/css" href="/css/file.css" />

    <script type="text/javascript" src=" http://cdn.qiater.com/js/jquery/core/1.8.3/jquery.min.js"></script>
    <script type="text/javascript" src="/js/yonyou/lib/yonyou.js"></script>
    <script src="/js/yonyou/lib/yy.core.js"></script>
    <script type="text/javascript" src="/js/yonyou/modules/file/file.init.js"></script>
    <title>文库-企业空间</title>
</head>

<body>
{include file="employee/header.tpl"}

<!--内容-->
<div class="clearfix content" style="margin:0 auto;width:980px;margin-top:25px;">
    <div class="container clearfix">
        <div class="container wkHeader" style="width: 980px;">
            <div class="grid" style="width:150px;padding-left:20px;">
                <span class="filelogo"></span>
                <img src="../../images/app_library.png"/>
                <span class="fileTitle">文库</span>
            </div>
            <div class="grid" style="float:right;">
                <a class="filebutton" data="1" href="javascript:;" id="file_upload_button">上传文档</a>
            </div>
        </div>
    </div>
    <div class="container clearfix  wkContent" style="margin-top:25px;">
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
</div>
<script type="text/javascript">
    window.session_id = "{$sessionid}";
    window.qiater_user = "{$qiater_user}";
    window.rscallback = "{$rscallback}";
    window.rscallbackflag = "{$rscallbackflag}";
    if(rscallback != '') $.yy.rscallback(rscallback, rscallbackflag);
</script>
<aside id="rscallback" class="tsBox absolute z6" style="display:none;z-index:99999;">
    <span class="icoRighttk">上传成功</span>
</aside>
{include file="employee/footer.tpl"}
</body>
</html>

