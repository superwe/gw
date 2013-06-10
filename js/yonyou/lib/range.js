(function(window, $, YY, util){
    var 
    // 公共对象
    w3c = window.getSelection,
    doc = document;

    var range = {

        /**
        * 复制位置;
        * @return {[type]} [description]
        */
        cloneRange : function() {
            var s, r;
            if (window.getSelection) {      // w3c
                s = window.getSelection();
                r = s.getRangeAt(0);
                return r.cloneRange();
            } else {                        // ie
                s = document.selection;
                r = s.createRange();
                return r.duplicate();
            }
        },
        /**
        * 复位range位置
        * @param  {[type]} range [description]
        * @return {[type]}       [description]
        */
        resume : function(range) {
            var r = range || this.prevRange,
                s;
            if (window.getSelection) {
                s = window.getSelection();
                s.removeAllRanges();
                s.addRange(r);
                return r;
            }
            r.select();
            return r;
        },
        /**
         * 设置元素文本的选择范围;
         * @param elememt
         * @param start_index 起始位置
         * @param end_index   结束位置
         */
        setSelected: function (element, start_index, end_index){
            if (element.createTextRange){           // ie
                var range = element.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end_index);
                range.moveStart('character', start_index);
                range.select();
            } else if (element.setSelectionRange){  // w3c
                element.focus();
                element.setSelectionRange(start_index, end_index);
            }
        },
        /**
         * 光标定位到元素结尾文本处;
         * @param element
         */
        setFocusEnd: function(element){
            var me = this;

            if (element && typeof element==='object') {
                var len = element.value.length;
                me.setSelected(element, len, len);
            }
        },
        /**
         * 插入节点;
         * @param  {[type]} dom [description]
         * @return {[type]}     [description]
         */
        insertNode:function(dom) {
            var s, r;
            if (window.getSelection) {
                s = window.getSelection();
                r = s.getRangeAt(0);
                s.addRange(r);
                r.insertNode(dom);
                r.collapse(false);
                return;
            }
            s = document.selection;
            r = s.createRange();
            var html = dom.outerHTML || dom.nodeValue;
            r.pasteHTML(html);
        },
    }// range END
    util.range = range;

    range = null;
}(window, jQuery, YonYou, YonYou.util));