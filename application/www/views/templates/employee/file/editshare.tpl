<div class="reply-block yy-upload-block">
    <aside class="selectTk groupTk">
        <form name="myform" method="post" action="/employee/file/editshareok" enctype="multipart/form-data" class="groupUploadForm">
            <input type="hidden" name="fileid" id="fileid" class="groupUploadFids" value="{$fileid}" />
            <menu class="tkCont">
                {if $shareMember}
                    <ul class="clearfx fl rcAddmenListUl">
                        <li>已共享人</li>
                        {foreach item=share from=$shareMember}
                            <li id="yyauto_li_{$share.id}" class="clearfix rcAddmenListli"><span>{$share.name}</span><a class="close" id="delshare" data="{$share.id}" fileid="{$share.fileid}" href="javascript:;"></a></li>
                        {/foreach}
                    </ul>
                {/if}
                <div style="clear:both;">
                    <div style="padding-left: 6px;">共享人</div>
                    <div class="scInput editshare" style="margin-bottom: 20px;">
                        <div class="rcAddMen">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" class="rcAddmenTab">
                                <tbody><tr>
                                    <td valign="top">
                                        <div class="rcAddmenList">
                                            <ul class="rcAddmenListUl" id="shareuser_list">
                                            </ul>
                                        </div>
                                    </td>
                                    <td valign="middle" class="rbg" align="center">
                                        <a href="javascript:;" class="rcAddmenr userSelector" for="shareuser" ></a>
                                    </td>
                                </tr>
                                </tbody></table>
                        </div>
                    </div>
                </div>
            </menu>
        </form>
    </aside>
</div>
<script>
    YY.loadScript(['yonyou/widgets/simpleDialog/simpleDialog.js',
        'yonyou/modules/employee/employee_select.js'], {
        fn: function(){
            YY.userSelector({
                'selector': '.userSelector',
                'callback': function(fordiv,data){
                    //对所选择的人员信息进行整理
                    var ret = [] ;
                    var addLiId="";
                    for(var i=0;i<data.length;i++){
                        addLiId = "yyauto_li_"+data[i].id;

                        if($("#"+fordiv+"_list li[id="+addLiId+"]").length == 0){
                            //不包含的时候 增加
                            ret.push('<li id="'+addLiId+'" class="rcAddmenListli"><span>');
                            ret.push(data[i].name);
                            ret.push('</span><input type="hidden" name="'+fordiv+'_value[]" value=');
                            ret.push(data[i].id);
                            ret.push('><a href="javascript:;" class="close"></a></li>');
                        }
                    }
                    $("#"+fordiv+"_list").append(ret.join(''));//将选择的人 添加到input框中
                }
            });

            $(".scInput").on({ //删除人
                'click':function(e){
                    $target = $(e.target);
                    $target.closest("li").remove();
                }
            });
        }
    });
</script>