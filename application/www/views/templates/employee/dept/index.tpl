{extends file='employee/layout.tpl'}
{block name="content"}
<style type="text/css">
    ##deptTree ul {
        list-style: none;
    }
    #deptTree ul li{
        width: 120px;
        list-style: none;
    }

    #deptTree .selected, #firstletter .selected {
        background-color: red;
    }
    #deptTree .expand {
        display: block;
        background: url("/images/tree/expand.gif") no-repeat scroll 0 0 transparent;
        height: 20px;
        width: 18px;
        float: left;;
    }
    #deptTree .collspan {
        display: block;
        background: url("/images/tree/collspan.gif") no-repeat scroll 0 0 transparent;
        height: 20px;
        width: 18px;
        float: left;
    }
</style>
<script type="text/javascript">
    /*呈现左侧部门树*/
    function treeRender(deptid){
        if(deptid == 0){
            $node = $('#deptTree');
        }else{
            $node = $('#deptTree').find("a[deptid='" + deptid + "']").closest('li');
        }
        //如果已经加载过子部门，那么跳过
        if($node.find('ul').length>0)return;
        //请求子部门数据
        $.post('/employee/dept/tree/' + deptid, function(data){
            $ul = $('<ul></ul>');
            for(var i in data){
                $('<li><a deptid="' + data[i].id + '" href="javascript:void(0);" class="collspan"></a>&nbsp;<a deptid="'
                        + data[i].id + '" href="javascript:void(0);" class="title" depth="'
                        + data[i].depth + '">'
                        + data[i].name + '</a></li>').appendTo($ul);
            }
            $ul.appendTo($node);
        }, 'json');
    }

    function memberRender(spaceid, deptid, letter, depth){
        var $memberlist = $('#memberlist');
        $.post('/employee/dept/member/' + spaceid + '/' + deptid + '/' + letter, { depth: depth }, function(data){
            var html =['<table><tr><th>姓名</th><th>职位</th><th>部门</th><th>加入时间</th></tr>'] ;
            for(var i in data){
                html.push('<tr>');
                html.push('<td>' + data[i].name + '</td>');
                html.push('<td>' + data[i].duty + '</td>');
                html.push('<td>' + data[i].dept + '</td>');
                html.push('<td>' + data[i].created + '</td>');
                html.push('</tr>');
            }
            html.push('</table>');
            $memberlist.html('');
            $memberlist.html(html.join(''));
        }, 'json');


    }
    $(document).ready(function(){
        var spaceid = {$spaceid};
        //左侧树初始化呈现
        treeRender(0);
        //右侧人员列表初始化呈现
        memberRender(spaceid, 0, '', '');
        //左侧数节点事件绑定
        $('#deptTree a').live('click', function(){
            var $me = $(this);
            var $li = $me.closest('li');
            var $tree = $('#deptTree');
            var deptid = $me.attr('deptid');
            var depth = $me.attr('depth');

            if($me.hasClass('title')){ //点击部门名称进行人员筛选
                var $seletedLetter = $('#firstletter a.selected');
                var letter = $seletedLetter.length >0 ? $seletedLetter.attr('letter') : '';
                memberRender(spaceid, deptid, letter, depth);
                $('#deptTree a').removeClass('selected');
                $me.addClass('selected');
            }else{ //如果不是点击的部门标题，那么展开/合上部门树
                treeRender(deptid);
                if(deptid>0){
                    $me.toggleClass('collspan');
                    $me.toggleClass('expand');
                }
                $li.find('ul').toggle();
            }


        });
        //右侧字母链接事件绑定
        $('#firstletter a').bind('click', function(){
            var $me = $(this);
            var letter = $me.attr('letter');
            var $seletedDeptNode = $('#deptTree a.selected');
            var deptid = 0, depth = '';
            if( $seletedDeptNode.length>0){
                deptid = $seletedDeptNode.attr('deptid');
                depth = $seletedDeptNode.attr('depth');
            }

            $('#firstletter a').removeClass('selected');
            $me.addClass('selected');
            memberRender(spaceid, deptid, letter, depth);
        });

        //左侧“全部部门”链接事件绑定
        $('#restTree').bind('click', function(){
            var $seletedLetter = $('#firstletter a.selected');
            var letter = $seletedLetter.length >0 ? $seletedLetter.attr('letter') : '';
            treeRender(0);
            memberRender(spaceid, 0, letter, '');
        });

    });
</script>
<!--左侧树-->
<div class="grid_4">
    <div id="deptTree">
        <a href="javascript:void(0);" style="float: left;width:240px;" deptid="0" depth="" id="restTree" class="title selected" >全部部门</a>
    </div>
</div>
<!--右侧列表-->
<div class="grid_10">
    <ul id="firstletter">
        <li style="list-style: none;display: inline-block;"><a href="javascript:void(0);" letter="" class="selected">不限</a></li>
        {foreach from=$firstletter item=letter}
            <li style="list-style: none;display: inline-block;">
                <a href="javascript:void(0);" letter="{$letter}">{$letter}</a>
            </li>
        {/foreach}
    </ul>
    <div id="memberlist"></div>
</div>
<div class="clearfix"></div>
{/block}