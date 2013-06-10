<script type="text/javascript">
    (function(global){
        /**
         * 图片错误处理函数;
         * @return Array [description]
         */
        function imgError(o) {
            var error_data = o.getAttribute('errordata'),
                    rel_data   = o.getAttribute('rel');
            if (!!rel_data) {
                o.setAttribute('src', rel_data);
            }
            if (!!error_data) {
                var parent_node = getParentNode(o);
                parent_node.className = parent_node.className === '' ? error_data : ' ' + error_data;
                parent_node.removeChild(o);
                // console.log(parent_node.className)
            }
            o.onerror = null;
        }
        /**
         * 获取父节点元素;
         * @param  Array o [description]
         * @return Array   [description]
         */
        function getParentNode(o){
            var p = o.parentNode;
            while(p.nodeType !== 1){
                p = p.parentNode;
            }
            return p;
        }
        // 将方法导出到全局;
        global.imgError = imgError;
    }(window));

</script>
<!--页头-->
<div class="globalheader_wrap">
    <div class="container clearfix" style="width: 980px;">
        <div class="grid" style="width:150px;margin-top: 10px;">
            <a href="/employee/home/index.html" class="logo"></a>
        </div>
        <div class="grid" style="width: 590px;">
            <ul class="nav">
                <li id = 'personnal'>
                    <a style='float: left' href='/employee/homepage/index/{$personalInfo['id']}.html' tips='1'  rel ='/employee/employee/cardInfo/{$personalInfo['id']}'>
                        <img class='headimg' src='http://staticoss.chanjet.com/qiater/{$personalInfo['imageurl']}.thumb.jpg' onerror='imgError(this);' rel='http://staticoss.chanjet.com/qiater/default_avatar.thumb.jpg'>
                        <span class='headname' title="{$personalInfo['name']}">{$personalInfo['name']}</span>
                    </a>
                </li>
                <span class="topline"></span>
                <li><a href="/employee/employee/index">全体成员</a></li>
                <span class="topline"></span>
                <li><a href="/employee/announce/index.html">公告</a></li>
            </ul>
        </div>
        <div style="cursor: pointer; padding-top: 19px; width: 30px;" id="bar_msg_div" class="grid">
            <a target="_blank" href="/employee/notice/index.html" class="relative"><span class="noticeIcon"></span></a>
        </div>
        <div class="grid" style="width:210px;">
            <ul class="nav">
                <li><a class="right"><img style="float: left;margin-left:8px;margin-top: 19px;" src="/images/home_help.png"/>帮助</a></li>
                <li><a href="/home/quit.html" class="right">退出</a></li>
            </ul>
        </div>
    </div>
</div>