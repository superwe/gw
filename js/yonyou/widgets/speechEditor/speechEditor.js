/**
 * 发言编辑器
 * @required jQuery YonYou YonYou.util
 */
(function(window, $, YY, util){
    var 
        win = window,
        doc = document,
        w3c = !!(win.getSelection) || false; // 支持getSelection的现代浏览器 or 老版本的ie..
    var zero_width = '\uFEFF';

    var SpeechEditor = function(setting){
        setting = setting || {};
        var me = this,
            defaults = {
                'wrap'      : null, // 编辑框的包裹器，可以是dom、jquery对象、选择器..
                'submitUrl' : '',   // 编辑器保存内容的提交地址，如果为空，则取form表单上设置的默认提交地址
                'searchUrl' : util.url('/common/search/index'), // 搜索@和#的URL
                'auto'      : true, // 自动初始化
                'feature': { // 编辑器所支持的一些功能
                    'face'  : true, // 表情
                    'at'    : true, // @
                    'file'  : true, // 上传文件
                    'topic' : true, // #添加话题
                    'video' : true, // 添加视频
                    'roam'  : true  // 漫游发言
                },
                'beforeSubmit'  : function(formData, $form, options){ return true}, // 必须保证最后返回的是true，才能正常提交表单
                'successSubmit' : function(responseText, statusText, xhr, $form){}  // 表单保存成功后返回一些数据，然后执行xxoo...
            };
        setting = me.setting =  $.extend(true, {}, defaults, setting);
        setting.form         = '.form-block';           // 表单区域
        setting.content      = '.content-block';        // 发言内容输入主体区域
        setting.action_line  = '.action-line';          // 操作行
        setting.face_button  = '.face-button';          // 表情
        setting.at_button    = '.at-button';            // @某人
        setting.file_button  = '.file-button';          // 上传文档
        setting.topic_button = '.topic-button';         // 添加话题
        setting.video_button = '.video-button';         // 添加视频链接
        setting.roam_button  = '.roam-button';          // 漫游发言
        setting.submit_button= '.submit-button';        // 保存发言
        setting.FaceList     = '#FaceList';             // 表情列表
        setting.VideoTip     = '#VideoTip';
        setting.FileTip      = '#FileTip';

        me.$doc  = $(doc);
        me.$body = $('body');
        // 缓存数据
        me.dataCache = {
            '$content'  : null, // 输入框对象
            'content'   : '',   // 输入框的内容
            'disabled'  : {},
            'curRange'  : null,
            'cursorPos' : null  // 光标位置
        };

        var fn = SpeechEditor.prototype;
        if(typeof me._bindEvent !== 'function'){
            /**
             * 获取一个空的range对象，ie8以前是 TextRange 对象;
             * @return {[type]} [description]
             */
            fn._getEmptyRange = function(){
                return w3c ? 
                    doc.createRange() : 
                    doc.selection.createRange();
            }
            /**
             * 聚焦的元素内容的结尾处
             * @param  {[type]} element [description]
             * @return {[type]}         [description]
             */
            fn._focusEnd = function(element){
                var me = this,
                    userSelection = me._getSelection(),
                    rangeObject = null;
                element = element || me._getContentObj()[0];
                if (w3c) {
                    userSelection.removeAllRanges();
                    rangeObject = me._getEmptyRange();
                    rangeObject.selectNodeContents(element);
                    rangeObject.collapse(false);
                    userSelection.addRange(rangeObject);
                } else {
                    rangeObject = userSelection;
                    rangeObject.moveToElementText(element);
                    rangeObject.select();
                    rangeObject.collapse(false);
                }
                return rangeObject;
            }
            /**
             * 获取一个selection对象，在ie下是 TextRange 对象..
             * @return {[type]} [description]
             */
            fn._getSelection = function(){
                var userSelection = null;
                if (w3c) { 
                    // 现代浏览器
                    userSelection = win.getSelection();
                } else if (doc.selection) { 
                    // IE浏览器 考虑到Opera，应该放在后面
                    userSelection = doc.selection.createRange();
                }
                return userSelection;
            }
            /**
             * 获取一个range对象；
             * @return {[type]} [description]
             */
            fn._getRange = function(){
                var me = this,
                    userSelection = me._getSelection();

                var rangeObject = userSelection; // Range对象
                if (userSelection.getRangeAt) {
                    // 现代浏览器
                    rangeObject = userSelection.getRangeAt(0);
                }
                return rangeObject;
            }
            /**
             * 设置当前的range
             * @param {[type]} rangeObject [description]
             */
            fn._setCurRange = function(rangeObject){
                var me = this;
                var rangeObject = rangeObject || me._getRange();

                return me.dataCache.curRange = rangeObject;
            }
            /**
             * 获取当前range，如果没有，设置一个默认的range；
             * @return {[type]} [description]
             */
            fn._getCurRange = function(){
                var me = this,
                    curRange = me.dataCache.curRange;

                if (!curRange) {
                    curRange = me._setCurRange(me._focusEnd());
                }

                if (w3c) {
                    var userSelection = me._getSelection();
                    // userSelection.removeAllRanges();
                    userSelection.addRange(curRange);
                } else {
                    curRange.select();
                }
                return curRange;
            }
            /**
             * 设置当前光标在发言框中的位置；
             * @private
             */
            fn._setCursorPos = function(rangeObject){
                var me = this,
                    cursorPos = [0, 0];
                
                rangeObject = rangeObject || me._getCurRange();
                if (rangeObject.getBoundingClientRect) { // 用这个貌似有时候获取到的为0，但是不用插入Node，优先使用吧，不行就插入node
                    var ClientRect = rangeObject.getBoundingClientRect();
                    if (ClientRect.top) {
                        var $doc = me.$doc;
                        cursorPos = [ClientRect.top+$doc.scrollTop(), ClientRect.left+$doc.scrollLeft()];
                    }
                }
                if (cursorPos[0]===0 && cursorPos[1]===0) {
                    me._insertNode($('<b id="CursorPosition" style="width:1px;height:1px;visibility:hidden;">i</b>')[0]);
                    var $CursorPosition = $('#CursorPosition'),
                        offset = $CursorPosition.offset();
                    cursorPos = [offset.top, offset.left];
                    $CursorPosition.remove();
                }
                me.dataCache.cursorPos = {
                    'top'  : cursorPos[0],
                    'left' : cursorPos[1]
                };
                return me.dataCache.cursorPos;
            }
            /**
             * 获取当前记录的光标在发言框中的位置；
             * @returns {number}
             * @private
             */
            fn._getCursorPos = function(){
                var me = this;

                return me.dataCache.cursorPos || me._setCursorPos();
            }
            /**
             * 向当前光标位置插入dom节点，
             * 并根据collapse的值，将光标移动到文本相应的位置true为起始位置，false为结束位置
             * @param  {[type]} node     [description]
             * @param  {[type]} collapse [description]
             * @return {[type]}          [description]
             */
            fn._insertNode = function(node, collapse){
                collapse = typeof collapse==='undefined' ? false : !!collapse;

                var me = this,
                    rangeObject = me._getCurRange();
                if (w3c) {
                    rangeObject.insertNode(node);
                    rangeObject.collapse(collapse);

                    //---尼玛，此处不能用这个，因为在谷歌浏览器下输入中文时候会有内容预插入，
                    //---当调用removeAllRanges的时候，输入的内容被清除了，无法正常输入内容，
                    //---而定位光标位置的时候，又需要插入节点判断...所以不能用。
                    // var selection = me._getSelection();
                    // selection.removeAllRanges();
                    // selection.addRange(rangeObject);
                } else {
                    rangeObject.pasteHTML(node.outerHTML||node.nodeValue);
                }

                return me._setCurRange(rangeObject);
            }
            /**
             * 删除搜索串，W3C下
             * @return {[type]} [description]
             */
            fn._deleteSearchStr = function(){
                var me = this;

                var cur_range = me._getCurRange();
                if (cur_range.startOffset===cur_range.endOffset) {
                    var startRangeNode = cur_range.startContainer,
                        startRangeNode_pos = 0,
                        nodeList = null;
                    // 当前range在文本节点内;
                    if (startRangeNode.nodeType===3) {
                        nodeList = startRangeNode.parentNode.childNodes;
                        $.each(nodeList, function(i, node){
                            if (node===startRangeNode) {
                                startRangeNode_pos = i;
                            }
                        });
                    }
                    // 元素节点
                    else {
                        nodeList = startRangeNode.childNodes;
                        startRangeNode_pos = cur_range.startOffset-1;// range的offset位置，即为节点的位置
                    }
                    var k = startRangeNode_pos + 1,
                        curNode = null;
                    while(k--){
                        curNode = nodeList[k];
                        if (k===startRangeNode_pos) { // range所在节点
                            if (curNode.nodeType!==3) { continue;}
                            // startRangeNode为文本节点的时候startOffset为文字偏移量，为元素节点的时候startOffset为range所在的节点位置
                            var prev_str = startRangeNode.nodeType===3
                                    ? curNode.substringData(0, cur_range.startOffset)
                                    : curNode.nodeValue,
                                at_pos   = prev_str.lastIndexOf('@');
                            if (at_pos!==-1) {
                                curNode.deleteData(at_pos, prev_str.length-at_pos);
                                break;
                            } else {
                                curNode.deleteData(0, prev_str.length);
                            }
                        } else {
                            if (curNode.nodeType!==3) { break;}
                            var node_str = curNode.nodeValue,//curNode.data
                                pos = node_str.lastIndexOf('@');
                            if (pos===-1) {
                                curNode.nodeValue = '';
                            } else {
                                curNode.deleteData(pos, node_str.length);
                                break;
                            }
                        }
                    }
                }
            }
            /**
             * 删除搜索串IE下
             * @return {[type]} [description]
             */
            fn._deleteSearchStr4IE = function(){
                var me = this,
                    search_str    = '',
                    cur_range     = me._getCurRange(),
                    parentElement = cur_range.parentElement();

                var empty_range = me._getEmptyRange(),
                    pos_flag = 0;
                empty_range.moveToElementText(parentElement);
                while((pos_flag = empty_range.compareEndPoints('EndToEnd', cur_range))!==0){
                    empty_range.moveEnd('character', pos_flag===1 ? -1 : 1);
                }
                // empty_range.select()
                var search_str = empty_range.htmlText,
                    at_pos = search_str.lastIndexOf('@');

                if (at_pos!==-1) {
                    empty_range.pasteHTML(search_str.substring(0, at_pos));
                }
            }
            /**
             * 添加被AT的对象
             * @param {[type]} node     [description]
             * @param {[type]} $content [description]
             */
            fn._addAtObj = function(node, $content){
                var me = this,
                    search_str = me.dataCache.search_str;
                // 搜索串为空、不包含@符号、包含空格...不做任何删除处理
                if (!(!search_str || search_str.indexOf('@')===-1 || search_str.indexOf(' ')!==-1)) {
                    // 添加AT对象前，删除@搜索串
                    if (w3c) {
                        me._deleteSearchStr();
                    } else {
                        me._deleteSearchStr4IE();
                    }
                }

                me._insertNode(node);
                me._insertNode(doc.createTextNode('\xa0'));
                if (w3c) {
                    var rangeObject = me._getCurRange(),
                        selection = me._getSelection();
                    rangeObject.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(rangeObject);
                    $content.focus(); // ff下得加这个
                }
            }
            /**
             * 添加@标签
             */
            fn._addAtTag = function(){
                var me = this,
                    dataCache = me.dataCache;

                var atNode = doc.createTextNode('@');

                me.dataCache.search_str = '@';
                
                me._insertNode(atNode, false); // 添加@内容节点
                me._setCursorPos(); // 获取range相对于document的坐标..{'top': 0, 'left': 0}rangeObject
                if (w3c) {
                    var rangeObject = me._getCurRange(),
                        selection = me._getSelection();
                    rangeObject.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(rangeObject);
                    me._getContentObj().focus(); // ff下得加这个
                }
            }
            /**
             * 根据传入的字符串，获取at信息
             * @param  {[type]} at_str [description]
             * @return {[type]}        [description]
             */
            fn._atBy = function(at_str){
                var me = this;

                // 搜索@信息
                me._searchBy(at_str, function(d, $searchList){
                    var list_html = me._formatAtList(d);
                    $searchList.find('.list-title').html('继续键入以搜索用户、内容')
                        .end()
                        .find('.list-content').html(list_html);
                    var curPos = me._getCursorPos(); // 获取range相对于document的坐标..{'top': 0, 'left': 0}
                    me._showSearchList(curPos);
                });
            }
            /**
             * 格式AT列表的模版；
             * @param data
             * @returns {string}
             * @private
             */
            fn._formatAtList = function(data){
                var html = [],
                    icons = {
                        '10': 'iconEmployee', '40': 'iconY_02', '50': 'iconY_03',
                        '25': 'iconY_04', '35': 'iconY_05', '65': 'iconY_06',
                        '3233': 'iconY_07'
                    };
                if($.isArray(data)){
                    var e_pos = 0;
                    $.each(data, function(i, item){
                        html.push('<li class="item">');
                        // 人
                        if(parseInt(item['category'],10)===10){
                            // email太长截取
                            var email = item['email'];
                            if(email.length>15){
                                email = email.substring(0,15)+"...";
                            }
                            if (e_pos===0){
                                html.push('<span class="',icons[item['category']],' tkIcoBox"></span>');
                            }
                            e_pos++;
                            html.push('<a class="employeeInfoA" tips="1" rel="',item['rel'],'" default="',
                                item['label'],'" member_id="',item['id'],'" category="',item['category'],'" tabindex="-1"><img src="',
                                item['avatar'],'" style="display: inline-block"><span style="display: inline-block;margin-left: 8px;"><span>',
                                item['label'],'</span><span class="marLeft4" title="',
                                email,'">',email,'</span><span class="block">',item['desc'],'</span></span></a>');
                        }
                        // 其他
                        else {
                            html.push('<a class="" default="',item['label'],'" for="',item['value'],'" category="',
                                item['category'],'" tabindex="-1"><span class="block">',item['label'],'</span></a>');
                        }
                        html.push('</li>');
                    });
                }
                return html.join('');
            }
            /**
             * 添加话题
             * @param str
             * @private
             */
            fn._sharpBy = function(str){

            }
            /**
             * 根据关键词搜索内容；
             * @param keyword
             * @param callback
             * @private
             */
            fn._searchBy = function(keyword, callback){
                var me = this,
                    request_url  = me.getSearchUrl(),
                    request_data = {'key' : encodeURIComponent(keyword)};

                util.ajaxApi(request_url, function(d, s){
                    var $searchList = me._getSearchList();
                    typeof callback === 'function' && callback(d, $searchList);
                }, 'GET', 'json', request_data);
            }
            /**
             * 获取搜索列表对象
             * @returns {*|HTMLElement}
             * @private
             */
            fn._getSearchList = function(){
                var me = this,
                    dataCache = me.dataCache,
                    $searchList = dataCache.$searchList;
                if(!($searchList && $searchList.length)){
                    var list_html = '<div id="SearchList" style="position: absolute;left: 0;top: 0;display: none;"><span class="xsj"></span><span class="xsj2"></span>'+
                        '<h3 class="list-title">搜索列表</h3><ul class="list-content"><li class="item"></li><li class="item-title"></li></ul></div>';
                    dataCache.$searchList = $searchList = $(list_html);
                    $searchList.appendTo(me.$body);

                    me._bindSearchListEvent($searchList);
                }
                return $searchList;
            }
            /**
             * 显示搜索列表；
             * @param $searchList
             * @private
             */
            fn._showSearchList = function(pos){
                var me = this,
                    $searchList = me._getSearchList();
                var pos = pos || {'top':0, 'left':0},
                    left_fixed = 38,
                    top_fixed = 20;
                $searchList.css({
                    'left': pos['left']-left_fixed,
                    'top': pos['top']+top_fixed,
                    'display': 'block'
                });
            }
            /**
             * 隐藏搜索列表
             * @private
             */
            fn._hideSearchList = function(){
                var me = this,
                    $searchList = me._getSearchList();
                $searchList.hide();
            }
            /**
             * 获取form对象
             * @returns {*}
             * @private
             */
            fn._getFormObj = function(){
                var me = this;

                return me.dataCache.$form || me._setFormObj();
            }
            /**
             * 设置form对象
             * @param $form
             * @returns {*}
             * @private
             */
            fn._setFormObj = function($form){
                var me = this,
                    setting = me.setting,
                    $wrap   = me.$wrap || $(setting.wrap);

                $form = $form || $wrap.find(setting.form).eq(0);

                return me.dataCache.$form = $form;
            }
            /**
             * 获取$content对象
             * @return {[type]} [description]
             */
            fn._getContentObj = function(){
                var me = this;

                return me.dataCache.$content || me._setContentObj();
            }
            /**
             * 设置$content对象
             * @param {[type]} $content [description]
             */
            fn._setContentObj = function($content){
                var me = this,
                    setting = me.setting,
                    $wrap   = me.$wrap || $(setting.wrap);

                $content = $content || $wrap.find(setting.content).eq(0);

                return me.dataCache.$content = $content;
            }
            /**
             * 获取操作行对象
             * @return {[type]} [description]
             */
            fn._getActionLine = function(){
                var me = this;

                return me.dataCache.$actionLine || me._setActionLine();
            }
            /**
             * 设置操作行对象
             * @param {[type]} $actionLine [description]
             */
            fn._setActionLine = function($actionLine){
                var me = this,
                    setting = me.setting,
                    $wrap   = me.$wrap || $(setting.wrap);

                $actionLine = $actionLine || $wrap.find(setting.action_line).eq(0);

                return me.dataCache.$actionLine = $actionLine;
            }
            /**
             * W3C下获取搜索串
             * @return {[type]} [description]
             */
            fn._getSearchStr = function(){
                var me = this,
                    search_str = '',
                    cur_range = me._getCurRange();

                if (cur_range.startOffset===cur_range.endOffset) {
                    var startRangeNode = cur_range.startContainer,
                        startRangeNode_pos = 0,
                        nodeList = null;
                    // 当前range在文本节点内;
                    if (startRangeNode.nodeType===3) {
                        nodeList = startRangeNode.parentNode.childNodes;
                        $.each(nodeList, function(i, node){
                            if (node===startRangeNode) {
                                startRangeNode_pos = i;
                            }
                        });
                    }
                    // 元素节点
                    else {
                        nodeList = startRangeNode.childNodes;
                        startRangeNode_pos = cur_range.startOffset;// range的offset位置，即为节点的位置
                    }
                    var k = startRangeNode_pos + 1;
                    while(k--){
                        var curNode = nodeList[k];
                        if (!curNode) { continue;}
                        if (k===startRangeNode_pos) { // range所在节点
                            if (curNode.nodeType!==3) { continue;}
                            var prev_str = curNode.substringData(0, cur_range.startOffset),
                                at_pos   = prev_str.lastIndexOf('@');
                            if (at_pos!==-1) {
                                search_str = prev_str.substring(at_pos, prev_str.length);
                                break;
                            } else {
                                search_str = prev_str + search_str;
                            }
                        } else {
                            if (curNode.nodeType!==3) { break;}
                            var node_str = curNode.nodeValue,//curNode.data
                                pos = node_str.lastIndexOf('@');
                            if (pos===-1) {
                                search_str = node_str + search_str;
                            } else {
                                search_str = node_str.substring(pos) + search_str;
                                break;
                            }
                        }
                    }
                }
                at_pos = search_str.lastIndexOf('@');
                search_str = at_pos===-1 ? '' : search_str.substring(at_pos);

                return search_str;
            }
            /**
             * IE下获取搜索串
             * @return {[type]} [description]
             */
            fn._getSearchStr4IE = function(){
                var me = this,
                    search_str    = '',
                    cur_range     = me._getCurRange(),
                    parentElement = cur_range.parentElement(),
                    nodeList      = parentElement.childNodes;

                var empty_range = me._getEmptyRange(),
                    pos_flag = 0;
                empty_range.moveToElementText(parentElement);
                while((pos_flag = empty_range.compareEndPoints('EndToEnd', cur_range))!==0){
                    empty_range.moveEnd('character', pos_flag===1 ? -1 : 1);
                }
                // empty_range.select()
                search_str = empty_range.text;
                var at_pos = search_str.lastIndexOf('@');
                search_str = at_pos===-1 ? '' : search_str.substring(at_pos);

                return search_str;
            }
            /**
             * 内容搜索监听中...
             * @return {[type]} [description]
             */
            fn._searchListening = function(){
                var me = this,
                    search_str = '';
                if (w3c) {
                    search_str = me._getSearchStr();
                } else {
                    search_str = me._getSearchStr4IE();
                }
                me.dataCache.search_str = search_str;

                // 组合的搜索串中包含@...那么就at之..
                if (!!search_str) {
                    if (search_str.indexOf(' ')!==-1) {
                        me._hideSearchList();
                    } else if (search_str.charAt(0)==='@') {
                        me._setCursorPos();
                        me._atBy(search_str);
                    } else {
                        me._hideSearchList();
                    }
                } else {
                    me._hideSearchList();
                }
            }
        /******* 表情相关 ****************************************************************************/
            /**
             * 获取表情列表；
             * @private
             */
            fn._getFaceList = function(){
                var me = this,
                    setting = me.setting,
                    dataCache = me.dataCache,
                    $facesList = dataCache.$facesList;
                if(!($facesList && $facesList.length)){
                    var FaceList_html = $(setting.FaceList+'Template').val();
                    dataCache.$facesList = $facesList = $(FaceList_html);
                    $facesList.appendTo(me.$body);

                    me._bindFaceListEvent($facesList);
                }
                return $facesList;
            }
            /**
             * 显示表情列表；
             * @param pos
             * @private
             */
            fn._showFaceList = function(pos){
                var me = this,
                    $facesList = me._getFaceList(),
                    left = pos[0] || 0,
                    top  = pos[1] || 0;
                $facesList.css({
                    'position': 'absolute',
                    'left': left,
                    'top' : top,
                    'display': 'block'
                });
            }
            /**
             * 隐藏表情列表；
             * @private
             */
            fn._hideFaceList = function(){
                var me = this,
                    $faceList = me._getFaceList();
                $faceList.hide();
            }
            /**
             * 将指定face_dom添加到目标$content中
             * @param {[type]} face_dom [description]
             * @param {[type]} $content [description]
             */
            fn._addFace = function(face_dom, $content){
                var me = this;

                me._insertNode(face_dom, false);
                if (w3c) {
                    var rangeObject = me._getCurRange(),
                        selection = me._getSelection();
                    rangeObject.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(rangeObject);
                    $content.focus(); // ff下得加这个
                }

                me._hideFaceList();
            }
        /******* 表情相关 END **************************************/

        /******* 上传视频相关 ************************************************************************/
            fn._getUploadVideoTip = function(){
                var me = this,
                    setting   = me.setting,
                    dataCache = me.dataCache,
                    $videoTip = dataCache.$videoTip;
                if (!($videoTip && $videoTip.length)) {
                    var VideoTip_html = $(setting.VideoTip+'Template').val();
                    dataCache.$videoTip = $videoTip = $(VideoTip_html);
                    $videoTip.appendTo(me.$body);

                    me._bindUploadVideoEvent($videoTip); // 绑定视频上传面板相关的事件
                }
                return $videoTip;
            }
            fn._showUploadVideoTip = function(pos){
                var me = this,
                    $videoTip = me._getUploadVideoTip(),
                    left = pos[0] || 0,
                    top  = pos[1] || 0;
                $videoTip.css({
                    'position': 'absolute',
                    'left': left,
                    'top' : top,
                    'display': 'block'
                });
            }
        /******* 上传视频相关 END **********************************/

        /******* 上传文件相关 ************************************************************************/
            fn._getUploadFileTip = function(){
                var me = this,
                    setting = me.setting,
                    dataCache = me.dataCache,
                    $fileTip = dataCache.$fileTip;
                if (!($fileTip && $fileTip.length)){
                    var FileTip_html = $(setting.FileTip+'Template').val();
                    dataCache.$fileTip = $fileTip = $(FileTip_html);
                    $fileTip.appendTo(me.$body);
                    util.initUpload(function(){
                        var $upload_placeholder = $fileTip.find('.upload-placeholder'),
                            random_id = YY.date.getDateObj().getTime();
                        $upload_placeholder.attr('id', random_id);
                        InitUpload({
                            'button_placeholder_id': random_id,
                            'upload_url': util.url('')
                        });
                    });

                    me._bindUploadVideoEvent($fileTip); // 绑定视频上传面板相关的事件
                }
                return $fileTip;
            }
            fn._showUploadFileTip = function(){

            }
        /******* 上传文件相关 END **********************************/

            /**
             * 根据keycode相关参数，判断是否需要出现搜索提示框
             * @param  {[type]} options [description]
             * @return {[type]}         [description]
             */
            fn._listeningEnable = function(options){
                var code = options['keyCode'],
                    shiftKey = options['shiftKey'],
                    ctrlKey  = options['ctrlKey'];

                if (code>=35&&code<=40) {// 位置、方向键
                    if (shiftKey) {
                        return false;
                    }
                    return true;
                }
                if ((code>=65 && code<=90)||(code>=48 && code<=57)
                    ||(code>=186 && code<=192)||(code>=219 && code<=222)
                    ||(code>=96 && code<=111)||code===16) { // 实体字符，包括enter、shift，因为当输入中文的时候，这些键会成为最后内容的确认键
                    if (ctrlKey) {
                        return false;
                    }
                    return true;
                }
                if (code===32||code===8||code===46) { // 空格和删除符
                    return true;
                }

                return false;
            }
            /**
             * 绑定发言相关操作事件
             * @private
             */
            fn._bindEvent = function(){
                var me = this,
                    dataCache = me.dataCache,
                    setting = me.setting,
                    feature = setting.feature,  // 支持的功能
                    $doc    = me.$doc,
                    $form       = me._getFormObj(),
                    $content    = me._getContentObj(),
                    $actionLine = me._getActionLine(),
                    $faceList   = me._getFaceList(),
                    $searchList = me._getSearchList();

                $doc.on({
                    'mousedown': function(e){
                        var $target = $(e.target),
                            $realTarget = null;
                        // 隐藏表情列表
                        if(!($target.closest($faceList).length || $target.is(setting.face_button))){
                            me._hideFaceList();
                        }
                        // 隐藏@和#时候的搜索列表
                        if (!($target.closest($searchList).length)) {
                            me._hideSearchList();
                        }
                    }
                });
                // 表单提交
                $form.off().on({
                    'submit': function(){
                        var options = {
                            'beforeSubmit': function(formData, $form, options){
                                var flag = false,
                                    submit_url = me.getSubmitUrl();
                                if (submit_url){
                                    options.url = submit_url;
                                    // $form.attr('action', submit_url);
                                    flag = true;
                                }
                                var content = me._getContentObj().html();
                                if ($.trim(content)){
                                    // 内容对象
                                    var content_obj = {
                                        'name'  : 'content',
                                        'value' : content
                                    };
                                    formData.push(content_obj);
                                    flag = true;
                                } else {
                                    flag = false;
                                }
                                // 上传文件..
                                // do something

                                return typeof setting.beforeSubmit === 'function'
                                    ? setting.beforeSubmit(formData, $form, options)&&flag
                                    : flag;
                            },
                            'success': function(responseText, statusText, xhr, $form){
                                setting.successSubmit(responseText, statusText, xhr, $form);
                            }
                        };
                        $(this).ajaxSubmit(options);

                        return false;
                    }
                });
                // 内容输入框
                $content.off().on({
                    'click': function(e){
                        me._setCurRange();      // 记录当前的range对象，ie8以下是textRange对象

                        me._searchListening(); // 监听内容搜索..
                    },
                    'keydown': function(e){
                        var keyCode = e.keyCode,
                            shiftKey = e.shiftKey;
                        // ff下backspace删除元素节点...
                        if (keyCode===8 && navigator.userAgent.toLowerCase().indexOf('firefox')) {
                            var rangeObject = me._getCurRange(),
                                startContainer = rangeObject.startContainer;
                            if (startContainer.nodeType!==3) {
                                var node_pos = rangeObject.startOffset-1,
                                    nodeList = startContainer.childNodes,
                                    deleted_node = nodeList[node_pos];
                                // 节点存在，并且不为文本节点
                                if (deleted_node && deleted_node.nodeType!==3) {
                                    deleted_node.parentNode.removeChild(deleted_node);
                                    return false;
                                }
                            }
                        }
                    },
                    'keyup': function(e){
                        var $target = $(e.target),
                            options = {
                                'keyCode'  : e.keyCode,  // 当前的keyCode值
                                'altKey'   : e.altKey,   // alt键的状态
                                'shiftKey' : e.shiftKey, // shift键的状态
                                'ctrlKey'  : e.ctrlKey   // ctrl键的状态
                            };

                        me._setCurRange();      // 记录当前的range对象，ie8以下是textRange对象

                        // AT功能可用
                        if (feature['at']){
                            if (me._listeningEnable(options)) {
                                me._searchListening(); // 监听内容搜索..
                            } else {
                                me._hideSearchList();
                            }
                        }
                        // 话题功能
                        if (feature['topic']){

                        }
                    }
                });
                // 操作行
                $actionLine.off().on({
                    'click': function(e){
                        var $me = $(this),
                            $target = $(e.target),
                            $realTarget = null;

                        // 添加表情
                        if($target.is(setting.face_button)){
                            var offset = $target.offset(),
                                pos = [offset.left, offset.top+20];
                            me._showFaceList(pos);
                            return false;
                        }
                        // @某人
                        // 当点击@按钮的时候，向文本输入框内插入@符号，并且搜索出可选的人等..
                        if($target.is(setting.at_button)){
                            var str = '@';
                            
                            me._addAtTag(); // 添加@标签
                            me._atBy(str);  // 搜索被@的数据列表...

                            return false;
                        }
                        // // 添加文件
                        // if($target.is(setting.file_button)){

                        //     return false;
                        // }
                        // 添加话题
                        // 当点击#按钮的时候，向文本输入框内插入#符号，并且搜索出可选的话题等..
                        if($target.is(setting.topic_button)){

                            return false;
                        }
                        // 添加视频链接
                        if($target.is(setting.video_button)){
                            var offset = $target.offset(),
                                pos = [offset.left, offset.top+20];
                            me._showUploadVideoTip(pos);
                            return false;
                        }
                        // 添加漫游网络
                        if($target.is(setting.roam_button)){
                            return false;
                        }
                    },
                    'mouseover': function(e){
                        var $target = $(e.target);
                        if($target.is(setting.file_button)){
                            me._showUploadFileTip();
                        }
                    },
                    'mouseout': function(e){
                        var $target = $(e.target),
                            $relatedTarget =$(e.relatedTarget);
                    }
                });
            }
            /**
             * 上传文件面板操作事件
             * @param $fileTip
             * @private
             */
            fn._bindUploadFileEvent = function($fileTip){
                if (!($fileTip && $fileTip.length)) {
                    return ;
                }
                var me = this;
                $fileTip.on({
                    'click': function(e){

                    }
                });
            }
            /**
             * 上传视频面板上操作事件
             * @param $videoTip
             * @private
             */
            fn._bindUploadVideoEvent = function($videoTip){
                if (!($videoTip && $videoTip.length)) {
                    return ;
                }
                var me = this;
                $videoTip.on({
                    'click': function(e){
                        var $me = $(this),
                            $target = $(e.target);
                        // 关闭
                        if ($target.is('.close')) {
                            $me.off().remove();
                            me.dataCache.$videoTip = null;
                        }
                        // 上传
                        if($target.is('.upload')){

                            return false;
                        }
                    }
                });
            }
            /**
             * 选择表情面板的事件绑定
             * @param  {[type]} $faceList [description]
             * @return {[type]}           [description]
             */
            fn._bindFaceListEvent = function($faceList){
                if (!($faceList && $faceList.length)) {
                    return false;
                }
                var me = this;
                // 表情列表
                $faceList.on({
                    'click': function(e){
                        var $target = $(e.target);
                        // 插入表情
                        if($target.is('img')){
                            var $content = me._getContentObj(),
                                face_dom = ($target.clone())[0];
                            me._addFace(face_dom, $content);
                            return false;
                        }
                    }
                });
            }
            /**
             * 搜索列表面板事件绑定
             * @param  {[type]} $searchList [description]
             * @return {[type]}             [description]
             */
            fn._bindSearchListEvent = function($searchList){
                if (!($searchList && $searchList.length)) {
                    return false;
                }
                var me = this;
                // 搜索列表
                $searchList.on({
                    'click': function(e){
                        var $target = $(e.target),
                            $realTarget = null;

                        $realTarget = $target.closest('li.item');
                        if (!!$realTarget.length) {
                            var $node = $realTarget.find('a').clone().empty(),
                                $content = me._getContentObj();
                            $node.css({
                                'display':'inline-block'
                            }).attr('contenteditable', false).text($node.attr('default'));

                            me._addAtObj($node[0], $content);
                            me._hideSearchList();
                        }
                    }
                });
            }
            /******* 公开接口 **************************************/
            /**
             * 初始化发言编辑器
             * @return {[type]} [description]
             */
            fn.init = function(){
                var me = this;

                // DOM Ready
                $(function(){
                    var setting   = me.setting,        // 配置
                        feature   = setting.feature,   // 支持的功能
                        dataCache = me.dataCache,      // 缓存数据
                        disabled  = dataCache.disabled,// 不可用的功能
                        $wrap     = $(setting.wrap);
                    // $wrap长度不为1，直接返回不做任何处理..
                    if ($wrap.length!==1) {
                        return ;
                    }

                    me.$wrap = $wrap;
                    // 隐藏功能，隐藏其触发按钮..
                    $.each(feature, function(name, flag){
                        if (!flag) {
                            var $disabled = disabled[name] = $('.'+name+'-button', $wrap);
                            $disabled.hide();
                        }
                    });

                    me._bindEvent();
                });
            }
            /**
             * 设置搜索URL
             * @param {[type]} url [description]
             */
            fn.setSearchUrl = function(url){
                var me = this;

                return me.setting.searchUrl = url;
            }
            /**
             * 获取URL
             * @return {[type]} [description]
             */
            fn.getSearchUrl = function(){
                var me = this;

                return me.setting.searchUrl;
            }
            /**
             * 设置提交URL
             * @param url
             * @returns {*}
             */
            fn.setSubmitUrl = function(url){
                var me = this;

                return me.setting.submitUrl = url;
            }
            /**
             * 获取提交的URL
             * @returns {*}
             * @private
             */
            fn.getSubmitUrl = function(){
                var me = this,
                    setting = me.setting,
                    submit_url = setting.submitUrl;
                if (!submit_url) {
                    var $form = me.$wrap.find('form');
                    submit_url = setting.submitUrl = $form.length ? $form.attr('action') : '';
                }
                return submit_url;
            }

        }

        setting.auto && me.init();
    };

    YY.SpeechEditor = SpeechEditor;
}(window, jQuery, YY, YY.util));