<div class="addMenTk" style="display:block;overflow:hidden;">
    <form action="/employee/file/addBoxOk" method="post" enctype="multipart/form-data" name="groupForm" id="addboxForm">
        <header class="clearfix lightBoxHeader">
            <h2>{if isset($boxinfo.id)}编辑{else}新建{/if}文件夹</h2>
        </header>
        <div class="clearfix addMenTkCont zlCon1">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td width="25%" align="right" valign="center">文件夹名称:</td>
                    <td width="78%" align="left" valign="top"><input value="{if isset($boxinfo.name)}{$boxinfo.name}{/if}" name="foldername" id="foldername" type="text" class="zskInText1"><input type="hidden" class="" value="{if isset($boxinfo.id)}{$boxinfo.id}{/if}" name="folderid" id="folderid"></td>
                </tr>
            </table>
        </div>
        <!--<footer class="lightBoxFooter clearfix ">
            <input name="cancel" type="button"  value="取消" class="fr button grayBt2 confirm">
            <input name="created" type="submit" value="{if isset($boxinfo.id)}编辑{else}创建{/if}" class="fr ya_button ya_blueButton cancel">
        </footer>-->
    </form>
</div>