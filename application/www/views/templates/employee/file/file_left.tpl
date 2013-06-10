<script type="text/javascript">var DOC_RT_FLAG = "{$p1}", DOC_RT_ITEM= "{$p2}";</script>
<div class="grid leftNavBar" style="width:200px;"  id="doc-leftnav-containter">
    <dl class="wLeftMenu">
        <dt class="doc-leftnav" flag="all"><a href="javascript:;"><span class="wMIcon1"></span><span class="leftnav-title">全部文档</span></a></dt>
        <dt class="doc-leftnav" flag="group"><a href="javascript:;"><span class="wMIcon2"></span><span class="leftnav-title">群组文档</span></a></dt>
        <dd  id="subnav-containter-group" class="sub-leftnav-containter hidden">
            <dl class="wSecMenu">
                {foreach item=item key=key from=$grouplist}
                    <dd>
                        <a isupload="1" url="/employee/file/getAjaxFile?groupid={$item.id}" item_id="{$item.id}" floor="0" href="javascript:;" title="{$item.name}"><span class="wMIcon5"></span><span>{$item.name}</span>
                        </a>
                    </dd>
                {/foreach}
            </dl>
        </dd>
        <dt class="doc-leftnav" flag="self"><a href="javascript:;" class="fl"><span class="wMIcon3"></span><span class="leftnav-title">我的文档</span></a><a  data="1" href="javascript:;" class="setIcon fr right-option-folder"></a></dt>
        <dd id="subnav-containter-self" class="sub-leftnav-containter hidden">
            <dl class="wSecMenu">
                <dd><a isupload="1" href="javascript:;" url="/employee/file/getAjaxShare" item_id="-2" floor_id="0" floor="0" title="TA人共享"><span class="wMIcon5"></span><span>TA人共享</span></a></dd>
                <dd><a isupload="1" href="javascript:;" url="/employee/file/getAjaxFile?type=1&folderid=-1" item_id="-1" floor_id="0" floor="0" title="我的文件夹"><span class="wMIcon5"></span><span>我的文件夹</span></a></dd>
                {foreach item=person from=$personbox}
                    <dd>
                        <a url="/employee/file/getAjaxFile?type=1&folderid={$person.id}" item_id="{$person.id}" floor="0" floor_id="0" href="javascript:;" title="{$person.name}" pmvalid="/file/box/valid/type/1/folderid/{$person.id}">
                            <span class="wMIcon5"></span>
                            <span>{$person.name}</span>
                        </a>
                    </dd>
                {/foreach}
            </dl>
        </dd>
        <dt class="doc-leftnav" flag="corp" showfolder="{$showfolder}"><a href="javascript:;" class="fl"><span class="wMIcon4"></span><span class="leftnav-title">企业文档</span></a>{if $isadmin}<a href="javascript:;" data="2" class="setIcon fr right-option-folder_crop"></a>{/if}</dt>
        <dd id="subnav-containter-corp" class="sub-leftnav-containter hidden">
            <dl class="wSecMenu">
                {foreach item=item key=key from=$groupbox}
                    <dd>
                        <a url="/employee/file/getAjaxFile?type=2&folderid={$item.id}" item_id="{$item.id}" floor="0" floor_id="{$item.id}" href="javascript:;" title="{$item.name}" pmvalid="/file/box/valid/type/2/folderid/{$item.id}" isupload="1"">
                        <span class="wMIcon5"></span><span>{$item.name}</span>
                        </a>
                        {if isset($item.pbox)}
                            <ul class="wThirdMenu">
                                {foreach item=pitem key=key from=$item.pbox}
                                    <li>
                                        <a url="/employee/file/getAjaxFile?type=2&folderid={$pitem.id}" item_id="{$pitem.id}" floor_id="{$item.id}" floor="1" href="javascript:;" title="{$pitem.name}"
                                           pmvalid="/file/box/valid?type=2&folderid={$pitem.id}" isupload="1">
                                            <span class="wMIcon5"></span>
                                            <span>{$pitem.name}</span>
                                        </a>
                                    </li>
                                {/foreach}
                            </ul>
                        {/if}
                    </dd>
                {/foreach}
            </dl>
        </dd>
    </dl>
</div>