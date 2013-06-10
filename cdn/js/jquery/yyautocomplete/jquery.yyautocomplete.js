(function($, YY){
    var util = YY.util;
    var cache = {};
    $.widget( "ui.yyautocomplete", $.ui.autocomplete, {
        options: {
            inputName: '',
            appendTo: "body",
            autoFocus: false,
            cacheKey: 'default',
            delay: 300,
            minLength: 0,
            maxwidth: 250,
            selAppendTo: "",
            selTag: "<li></li>",
            selCss: "clearfix rcAddmenListli",
            group: true,
            ajaxUrl: util.url("/data/search.data.php"),
            position: {
                my: "left top",
                at: "left bottom",
                collision: "none"
            },
            focus: function(event, ui ){
                return false;
            },
            source: function(request, response) {
                var self = this;
                function split( val ) {
                    return val.split( /,\s*/ );
                }
                function extractLast( term ) {
                    return split( term ).pop();
                }
                var term = request.term;
                if(typeof(cache[self.options.cacheKey]) == 'undefined'){
                    cache[self.options.cacheKey] = {};
                }
                if (term in cache[self.options.cacheKey]) {
                    response(cache[self.options.cacheKey][term]);
                    return;
                }
                lastXhr = $.getJSON(self.options.ajaxUrl, request, function(data, status, xhr) {
                    cache[self.options.cacheKey][term] = data;
                    response( data );
                });
            }
        },
        _create: function() {
            var self = this,
                doc = this.element[ 0 ].ownerDocument,
                suppressKeyPress;

            this.element
                .addClass( "ui-autocomplete-input" )
                .attr( "autocomplete", "off" )
                // TODO verify these actually work as intended
                .attr({
                    role: "textbox",
                    "aria-autocomplete": "list",
                    "aria-haspopup": "true"
                })
                .bind( "keydown.autocomplete", function( event ) {
                    if ( self.options.disabled || self.element.propAttr( "readOnly" ) ) {
                        return;
                    }

                    suppressKeyPress = false;
                    var keyCode = $.ui.keyCode;
                    switch( event.keyCode ) {
                        case keyCode.PAGE_UP:
                            self._move( "previousPage", event );
                            break;
                        case keyCode.PAGE_DOWN:
                            self._move( "nextPage", event );
                            break;
                        case keyCode.UP:
                            self._move( "previous", event );
                            // prevent moving cursor to beginning of text field in some browsers
                            event.preventDefault();
                            break;
                        case keyCode.DOWN:
                            self._move( "next", event );
                            // prevent moving cursor to end of text field in some browsers
                            event.preventDefault();
                            break;
                        case keyCode.ENTER:
                        case keyCode.NUMPAD_ENTER:
                            // when menu is open and has focus
                            if ( self.menu.active ) {
                                // #6055 - Opera still allows the keypress to occur
                                // which causes forms to submit
                                suppressKeyPress = true;
                                event.preventDefault();
                            }
                        //passthrough - ENTER and TAB both select the current element
                        case keyCode.TAB:
                            if ( !self.menu.active ) {
                                return;
                            }
                            self.menu.select( event );
                            break;
                        case keyCode.ESCAPE:
                            self.element.val( self.term );
                            self.close( event );
                            break;
                        default:
                            // keypress is triggered before the input value is changed
                            clearTimeout( self.searching );
                            self.searching = setTimeout(function() {
                                // only search if the value has changed
                                if ( self.term != self.element.val() ) {
                                    self.selectedItem = null;
                                    self.search( null, event );
                                }
                            }, self.options.delay );
                            break;
                    }
                })
                //bug
                .bind("input.autocomplete", function(){
                    $(this).trigger('keydown.autocomplete');
                })
                .bind( "keypress.autocomplete", function( event ) {
                    if ( suppressKeyPress ) {
                        suppressKeyPress = false;
                        event.preventDefault();
                    }
                })
                .bind( "focus.autocomplete", function() {
                    if ( self.options.disabled ) {
                        return;
                    }

                    self.selectedItem = null;
                    self.previous = self.element.val();
                })
                .bind( "blur.autocomplete", function( event ) {
                    if ( self.options.disabled ) {
                        return;
                    }

                    clearTimeout( self.searching );
                    // clicks on the menu (or a button to trigger a search) will cause a blur event
                    self.closing = setTimeout(function() {
                        self.close( event );
                        self._change( event );
                    }, 150 );
                });
            this._initSource();
            this.response = function() {
                return self._response.apply( self, arguments );
            };
            this.menu = $( "<ul></ul>" )
                .addClass( "ui-autocomplete" )
                .appendTo( $( this.options.appendTo || "body", doc )[0] )
                // prevent the close-on-blur in case of a "slow" click on the menu (long mousedown)
                .mousedown(function( event ) {
                    // clicking on the scrollbar causes focus to shift to the body
                    // but we can't detect a mouseup or a click immediately afterward
                    // so we have to track the next mousedown and close the menu if
                    // the user clicks somewhere outside of the autocomplete
                    var menuElement = self.menu.element[ 0 ];
                    if ( !$( event.target ).closest( ".ui-menu-item" ).length ) {
                        setTimeout(function() {
                            $( document ).one( 'mousedown', function( event ) {
                                if ( event.target !== self.element[ 0 ] &&
                                    event.target !== menuElement &&
                                    !$.ui.contains( menuElement, event.target ) ) {
                                    self.close();
                                }
                            });
                        }, 1 );
                    }

                    // use another timeout to make sure the blur-event-handler on the input was already triggered
                    setTimeout(function() {
                        clearTimeout( self.closing );
                    }, 13);
                })
                .menu({
                    focus: function( event, ui ) {
                        var item = ui.item.data( "item.autocomplete" );
                        if ( false !== self._trigger( "focus", event, { item: item } ) ) {
                            // use value to match what will end up in the input, if it was a key event
                            if ( /^key/.test(event.originalEvent.type) ) {
                                self.element.val( '' );
                            }
                        }
                    },
                    selected: function( event, ui ) {
                        var item = ui.item.data( "item.autocomplete" ),
                            previous = self.previous;

                        // only trigger when focus was lost (click on menu)
                        if ( self.element[0] !== doc.activeElement ) {
                            self.element.focus();
                            self.previous = previous;
                            // #6109 - IE triggers two focus events and the second
                            // is asynchronous, so we need to reset the previous
                            // term synchronously and asynchronously :-(
                            setTimeout(function() {
                                self.previous = previous;
                                self.selectedItem = item;
                            }, 1);
                        }

                        if ( false !== self._trigger( "select", event, { item: item } ) ) {
                            self.element.val( '' );
                        }

                        // reset the term after the select event
                        // this allows custom select handling to work properly
                        self.term = self.element.val();

                        $(self.options.selTag)
                            .attr('id', 'yyauto_li_' + item.value)
                            .addClass(self.options.selCss)
                            .append('<span>' + item.label
                                + '</span><input type="hidden" name="'
                                + (self.options.inputName ? self.options.inputName : $(self.options.appendTo).attr('id'))
                                + '_value[]" value="' + item.value + '" />')
                            .append($('<a href="javascript:;" class="close"></a>').bind('click', function(){
                                $(this).parent().remove();
                            }))
                            .insertBefore($(self.options.selAppendTo + ' > li:last'));

                        self.close( event );
                        self.selectedItem = item;
                    },
                    blur: function( event, ui ) {
                        // don't set the value of the text field if it's already correct
                        // this prevents moving the cursor unnecessarily
                        if ( self.menu.element.is(":visible") &&
                            ( self.element.val() !== self.term ) ) {
                            self.element.val( self.term );
                        }
                    }
                })
                .zIndex(this.element.zIndex() + 1000)
                // workaround for jQuery bug #5781 http://dev.jquery.com/ticket/5781
                .css({ top: 0, left: 0 })
                .hide()
                .data( "menu" );
            if ( $.fn.bgiframe ) {
                this.menu.element.bgiframe();
            }
            // turning off autocomplete prevents the browser from remembering the
            // value when navigating through history, so we re-enable autocomplete
            // if the page is unloaded before the widget is destroyed. #7790
            self.beforeunloadHandler = function() {
                self.element.removeAttr( "autocomplete" );
            };
            $( window ).bind( "beforeunload", self.beforeunloadHandler );

            if(typeof(self.options.defaultValue) != "undefined"){
                var item;
                for(var i = 0; i< self.options.defaultValue.length; i++){
                    item = self.options.defaultValue[i];
                    $(self.options.selTag)
                        .attr('id', 'yyauto_li_' + item.value)
                        .addClass(self.options.selCss)
                        .append('<span>' + item.label
                            + '</span><input type="hidden" name="'
                            + $(self.options.appendTo).attr('id')
                            + '_value[]" value="' + item.value + '" />')
                        .append($('<a href="javascript:;" class="close"></a>').bind('click', function(){
                            $(this).parent().remove();
                        }))
                        .prependTo($(self.options.selAppendTo));
                }
            }
        },
        _resizeMenu: function() {
            var self = this;
            var ul = this.menu.element;
            var width = Math.max(
                // Firefox wraps long text (possibly a rounding bug)
                // so we add 1px to avoid the wrapping (#7513)
                ul.width( "" ).outerWidth() + 1,
                this.element.outerWidth()
            );
            ul.outerWidth( width <= self.options.maxwidth ? width : self.options.maxwidth  );
        },
        _suggest: function( items ) {
            var ul = this.menu.element
                .empty()
                .zIndex( this.element.zIndex() + 1 );
            //过滤
            var valueObj = $(this.options.selAppendTo+" input"), count= 0;
            $.each( items, function( index, item ) {
                for(var j =0; j<valueObj.length; j++){
                    var r = valueObj[j];
                    if(item.value == r.value){
                        count --;
                    }
                }
            });
            if(count<0 && Math.abs(count) == items.length){
                ul.hide();
                return false;
            }

            this._renderMenu( ul, items );
            // TODO refresh should check if the active item is still in the dom, removing the need for a manual deactivate
            this.menu.deactivate();
            this.menu.refresh();

            // size and position menu
            ul.show();
            this._resizeMenu();
            ul.position( $.extend({
                of: this.element
            }, this.options.position ));

            if ( this.options.autoFocus ) {
                this.menu.next( new $.Event("mouseover") );
            }
        },
        _renderMenu: function( ul, items ) {
            var self = this,
                currentCategory = "",
                isfrist = self.options.group,
                mapping = {10: 'ico01',25:'ico08' ,35: 'ico09', 40: 'ico02', 45: 'ico07', 50: 'ico03', 60: 'ico06', 65: 'ico05'};
            ul.removeClass('ui-autocomplete ui-menu ui-widget ui-widget-content ui-corner-all');
            ul.addClass('tkBox relative c6').zIndex(100); //add by Baixg 2012-4-21

            $.each( items, function( index, item ) {
                if ( item.category != currentCategory && self.options.group) {
                    isfrist = true;
                    ul.append( "<span class='" + mapping[item.category] + " tkIcoBox '></span>" );
                    currentCategory = item.category;
                }
                self._renderItem( ul, item, item.category, isfrist, items.length );
                isfrist = false;
            });

        },
        _renderItem : function( ul, item, type, isfirst, count ) {
            //过滤
            var valueObj = $(this.options.selAppendTo+" input");
            for(var j =0; j<valueObj.length; j++){
                var r = valueObj[j];
                if(item.value == r.value){
                    count --;
                    if(count == 0) {ul.hide();}
                    return ;
                }
            }

            if(type == '10'){
                return $( "<li></li>")
                    .addClass('tkCont02' + (isfirst ? ' tline' : ''))
                    .data( "item.autocomplete", item )
                    .append( $("<a class='clearfix tkIn ui_autocomplate_box'><img src='" + item.avatar + "'/><span class='block'>"
                        + item.label + "</span><span class='block'>" + item.desc
                        + "</span><div class='block lxuser_mailbj fl hidden'>"
                        + item.other3
                        +"</div></a>") )

                    .appendTo( ul );
            }
            return $( "<li></li>")
                .addClass('tkCont02 h20' + (isfirst ? ' tline' : ''))
                .data( "item.autocomplete", item )
                .append( $('<a class="clearfix tkIn">'+ item.label + '</a>'))
                .appendTo( ul );
        }

    });
    isSearch_window = false;
    position_window = 0;
    old_value_window = "";
    selected_window = {};
    //@搜索##(话题)
    $.widget( "ui.yysearch", $.ui.yyautocomplete, {
        state:false,
        isSearch:false,
        oldStr:"",
        oldlength:"",
        search: function(value, event){
            value = value != null ? value : this.element.val();
            old_value_window = value;
            var self = this,
                tag_arr = ['@', '#'],
                tag = getTag(value, tag_arr),
                state = false,
                length = value.length;
            var char1 = value.substr(value.length-1,value.length);
            function getTag(str, tag_arr){
                var last_pos = [];
                $.each(tag_arr, function(i,v){
                    last_pos[i] = str.lastIndexOf(v);
                });
                var max_pos = eval('Math.max(' + last_pos.toString() + ')'),
                    tag_id = $.inArray(max_pos, last_pos);
                return tag_arr[tag_id];
            }
            if(char1=="@" || char1=="#"){
                if(self.oldStr == "@" || self.oldStr=="#" || !isSearch_window){
                    position_window = value.length-1;
                }
                isSearch_window = true;
            }
            if(char1==" "|| value==""){
                isSearch_window = false;
            }

            //YY.util.trace(tag);
            //第一个字符是@
            //term = decodeURIComponent(term);
            var lenStr = value.length,
                firstChar = value.charAt(0), //第一个字符
                lastChar = value.charAt(lenStr - 1), //最后一个字符
                rposSpace = value.lastIndexOf(' '), //最后一个空格的位置
                rposSpaceChar = value.charAt(rposSpace + 1), //最后一个空格后的位置
                strArray = value.split(" "),
                rposAt = strArray[strArray.length-1].indexOf(tag), //第一个@位置
                searchStr = $.trim(value.substring(position_window)), //搜索字符串
                hasSpace = searchStr.lastIndexOf(" ");
            selected_window = YY.util.selected(this.element[0]);
            if(self.oldlength > lenStr){
                self.oldStr = value.substring(lenStr-1,lenStr);
            }else{
                self.oldStr = char1;
            }
            self.oldlength =  lenStr;

            if(typeof(this.term) != "undefined"){
                if(this.term.indexOf(searchStr) >= 0 &&
                    ( typeof(cache[self.options.cacheKey][this.term]) != "undefined" &&
                        $.isEmptyObject(cache[self.options.cacheKey][this.term]) )) {
                    isSearch_window = false;
                }
            }

            if (!isSearch_window || hasSpace>-1 ) {
                this.close( event );
                return;
            }

            if (rposAt !== -1 ) {
                value = searchStr;

            }

            // always save the actual value, not the one passed as an argument
            this.term = this.element.val();

            if ( value.length < this.options.minLength ) {
                return this.close( event );
            }

            clearTimeout( this.closing );
            if ( this._trigger( "search", event ) === false ) {
                return;
            }
            return this._search( encodeURIComponent(value) );
        }
    });
})(jQuery, YonYou);