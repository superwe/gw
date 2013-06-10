/**
 * 一些基本的功能模块;
 */
(function($, util){
    $.yy = $.yy || {};
	$.fn.yy = $.fn.yy || {};
    // 统一的提示;
	$.extend($.yy, {
		rscallback: function(msg, flag){
            var $body = $('body'),
                $rs = $('#rscallback');

            if(!$rs.length){
                $rs = $('<div class="tsBox" id="rscallback" style="position:absolute;z-index:99999;"></div>');
                $rs.appendTo($body);
            }
			$rs.html('<span class="' + (parseInt(flag)>0 ? 'icoWrongtk' : 'icoRighttk') + '">' + msg + '</span>')
                .show();

            var body_width = $body.width(),
                rs_width   = $rs.width(),
                fixed = 70;
            $rs.css({
                'left': (body_width - rs_width)/2,
                'top': (document.documentElement.scrollTop+fixed)
            });
			setTimeout(function(){
				$rs.hide();
			}, 4000);
		}
	});
	//默认文本输入框文字
	var text_span_suffix = '_yy_dl';
	$.extend($.yy, {
		defaultText: function(options){
            /**
             * 生成labelid;
             * @param  {[type]} id [description]
             * @return {[type]}    [description]
             */
			function labelid(id){
				var labid  = id;
				if(typeof(id) == "object"){
					labid = id.attr('id');
				}
				return labid + text_span_suffix;
			}
            /**
             * 事件绑定;
             * @param  {[type]} obj   [description]
             * @param  {[type]} lab   [description]
             * @param  {[type]} txt   [description]
             * @param  {[type]} focus [description]
             * @param  {[type]} blur  [description]
             * @return {[type]}       [description]
             */
			function bindevent($obj, $lab, txt, focus, blur){
                // label的事件;
                $lab.on('click', function(){
                    $obj.focus();
                });
                // input框的事件;
                $obj.on({
                    // 当文本框失去焦点时,如果文本框值为空,则显示默认span内容
                    blur: function(){
                        var $me = $(this)
                        if($.trim($me.val()) === ''){
                            $me.val('');
                            $lab.html(txt);
                        }else{
                            $lab.html('');
                        }
                        blur($obj);
                    },
                    keydown: setLabelText,
                    keyup  : setLabelText,
                    change : setLabelText
                });
                /**
                 * 设置label的值;
                 */
                function setLabelText() {
                    var $me = $(this);
                    setTimeout(function (){
                        !!$me.val() ? $lab.html('') : $lab.html(txt);
                    },15);
                }
			}
			$.each(options, function(id, rowoption){
				var defaultRow = {txt: '请输入', css: 'inputSpan', val: '', focus: function(){}, blur: function(){}};
				if( typeof(rowoption) == "string" ){
					rowoption = {'txt': rowoption};
				}
				$.extend(defaultRow, rowoption);
				var tmpobj = $('#' + id);
				if(typeof(tmpobj.attr('id')) == 'undefined')return;
				tmpobj.val(defaultRow.val);
                var label_id = labelid(id);
				$('<span id="' + label_id + '" class="' + defaultRow.css + '">' + defaultRow.txt + '</span>')
						.insertBefore(tmpobj);
				bindevent(tmpobj, $('#' + label_id), defaultRow.txt, defaultRow.focus, defaultRow.blur);
			});
		}
	});
	/**
	 * 下拉浮层
	 */
	$.extend($.yy, {
		comboDiv: function(options){
			/*data: [{id: 'id值', title:'a标签title显示文字' , txt: '链接文字', href:'链接地址', css:'链接样式', ico: '链接后是否加样式',
				icotitle: 'span中得值'}]*/
			var _self = this, 
                suffixIco = '<span class="arrowDown"></span>';
			_self.selected = function(e){
				var itemid = $(this).attr('id');
				var id = $(this).parent().attr('id');
				id = _self.id(id, 0, true);
				_self.parameters[id].defaultid = _self.id(itemid, 2, true);
				$("#group").val(_self.id(itemid, 2, true));
				if($('span.arrowDown', '#' + _self.id(id, 1)).length > 0){
					$('#' + _self.id(id, 1)).html($(this).text() + suffixIco);
				}else{
					$('#' + _self.id(id, 1)).html($(this).text());
				}

				$.each($('#' + _self.id(id, 0) + ' > a'), function(i, elm){
					$(this).find('.' + selClassName).remove();
				});
				$('<span class="' + selClassName + '" data="' + _self.parameters[id].defaultid + '"></span>').appendTo($(this));
				$('#' + _self.id(id, 0)).hide();
				_self.parameters[id].callback(_self.parameters[id].defaultid,_self.parameters[id]);
				return false;
			};

			//title, h2
			_self.settings = {labelcss: 'blueLink', defaultid :0, labelover: 'cur', css: 'tkBox c3a',
					data: [{id: 0, title: '',  txt: '选择', href:'###', css:'', ico: '', icotitle: ''}],
					remote: false, selected: _self.selected, firstrq: true, callback: function(){}};

			var selClassName = 'icor';

			_self.parameters = {};
			_self.id = function(id, type, reverse ){
				var dt = ['aside_', 'label_', 'combo_list_'];
				if(reverse == true){
					return id.replace(dt[type], '');
				}
				return dt[type] + id;
			};

			_self.display = function(asideobj, id){
				if(_self.parameters[id].ajax)return false;
				if($.trim(asideobj.html()) == '')
					$(_self.createHtml(id)).appendTo(asideobj);
				if(typeof($('#' + asideobj.attr('id') + ' > a').data("events")) == 'undefined'){
					$('#' + asideobj.attr('id') + ' > a').bind('click', _self.parameters[id].selected);
				}
				_self.parameters[id].showFlag = true;
				asideobj.show();
			};
            /**
             * 隐藏对象;
             * @param  {[type]} asideobj [description]
             * @param  {[type]} id       [description]
             * @return {[type]}          [description]
             */
			_self.hide = function(asideobj, id){
				setTimeout(function(){
					if(! _self.parameters[id].showFlag){
						asideobj.hide();
						_self.parameters[id].showFlag = false;
					}
				}, 100);
			};
            /**
             * 事件绑定;
             * @param  {[type]} obj      [description]
             * @param  {[type]} asideobj [description]
             * @param  {[type]} id       [description]
             * @return {[type]}          [description]
             */
			_self.bindevent = function(obj, asideobj, id){
                obj.on({
                    mouseenter: function(e) {
                        var id_obj = _self.parameters[id];
                        if (id_obj !== 'undefined') {
                            $('#' + _self.id(id, 1)).addClass(id_obj.labelover);
                            if(id_obj.remote){
                                if(id_obj.firstrq){
                                    id_obj.ajax = true;
                                    id_obj.firstrq = false;
                                    $.post(id_obj.remote, [], function(data){
                                        id_obj.ajax = false;
                                        id_obj.data = data;
                                        _self.display(asideobj, id);
                                        typeof id_obj.callback === 'function' && id_obj.callback(data);
                                        
                                        return false;
                                    }, 'json');
                                }else if(!id_obj.ajax){
                                    _self.display(asideobj, id);
                                }
                            }else{
                                _self.display(asideobj, id);
                            }
                        }
                    },
                    mouseleave: function(e) {
                        var id_obj = _self.parameters[id];
                        if (id_obj !== 'undefined') {
                            $('#' + _self.id(id, 1)).removeClass(id_obj.labelover);
                            id_obj.showFlag = false;
                            _self.hide(asideobj, id);
                        }
                    }
                });
                
				asideobj.on({
                    mouseleave: function(e){
                        var id_obj = _self.parameters[id];
                        if (id_obj !== 'undefined') {
                            $('#' + _self.id(id, 1)).removeClass(id_obj.labelover);
                            id_obj.showFlag = false;
                            _self.hide(asideobj, id);
                        }
                    }
                });
			};
			_self.drawlist = function(id, data, html, group){
				if(_self.parameters[id].ajax)return html;
				var data = group >= 0 ? data[group] : data;
				$.each(data, function(i, row){
					html.push('<a id="' + _self.id(row.id, 2) + '" ');
					if(typeof(row.css) != 'undefined'){
						html.push('class="' + row.css + '" ');
					}
					if(typeof(row.href) == 'undefined'){
						row.href = '###';
					}

					html.push('href="' + row.href + '" title="'+ (typeof(row.title)== 'string' ? row.title : '' ) +'"><span class="fl">' + row.txt + '</span>' );
					if(typeof(row.ico) != 'undefined'){
						if(typeof(row.icotitle) == 'undefined')row.icotitle = '';
						html.push('<span class="' + row.ico + '">' + row.icotitle + '</span>');
					}

					if(i == _self.val(id) ){
						html.push('<span class="' + selClassName + '"></span>');
					}
					html.push('</a>');
				});
				return html;
			};
			_self.createHtml = function(id){
				if(_self.parameters[id].ajax)return '';
				var data = _self.parameters[id].data;
				var html = new Array();
				if(_self.parameters[id].h2 instanceof Array){
					for(var idx =0; idx< _self.parameters[id].h2.length; idx++){
						html.push('<h2>' + _self.parameters[id].h2[idx] + '</h2>');
						html = _self.drawlist(id, data, html, idx);
					}
				}else if( typeof(_self.parameters[id].h2) != 'undefined'){
					html.push('<h2>' + _self.parameters[id].h2 + '</h2>');
					html = _self.drawlist(id, data, html, -1);
				}else{
					html = _self.drawlist(id, data, html, -1);
				}
				return html.join('');
			};
			_self.init = function(){
				$.each(options, function(id, config){
					if( typeof(_self.parameters[id]) !== "undefined" ) return;

                    var obj = _self.parameters[id] = {'showFlag': false, 'ajax': false};

					$.extend(obj, _self.settings, config);
					var callback = obj.callback;
					$('<a id="' + _self.id(id, 1)
							+ '" class="' + obj.labelcss + '" href="javascript:;">'
							+ ( typeof(obj.title) === 'undefined' ? obj.data[_self.val(id)].txt : obj.title ) 
                            + suffixIco + '</a>').appendTo( $('#' + id));
                    // 如果定义了远程地址，并且没有定义标题;
					if(obj.remote && typeof(obj.title) == 'undefined'){
						$.post(obj.remote, [], function(data){
							data = obj.format(data);
							obj.data = data;
							obj.firstrq = false;
							$('#' + _self.id(id, 1)).html(data[0].txt + suffixIco);
							obj.defaultid = data[0].id;
							
							typeof callback === 'function' && callback(data);
						}, 'json');
					}

					$('<aside id="' + _self.id(id, 0)
							+ '" class="' + obj.css + '"></aside>').appendTo($('#' + id));

					$('#' + _self.id(id, 0)).hide();
					_self.bindevent($('#' + id), $('#' + _self.id(id, 0)), id);
				});
			};

			_self.val = function(id){
				return typeof _self.parameters[id]!=='undefined' ? _self.parameters[id].defaultid : 0;
			};

			_self.init();
		}
	});
    $.extend($.yy, {
        comboDiv1: function(options){
            /*data: [{id: 'id值', title:'a标签title显示文字' , txt: '链接文字', href:'链接地址', css:'链接样式', ico: '链接后是否加样式',
                icotitle: 'span中得值'}]*/
            var _self = this, 
                suffixIco = '<span class="arrowDown"></span>';
            _self.selected = function(e){
                var itemid = $(this).attr('id');
                var id = $(this).parent().attr('id');
                id = _self.id(id, 0, true);
                _self.parameters[id].defaultid = _self.id(itemid, 2, true);
                $("#group").val(_self.id(itemid, 2, true));
                if($('span.arrowDown', '#' + _self.id(id, 1)).length > 0){
                    $('#' + _self.id(id, 1)).html($(this).text() + suffixIco);
                }else{
                    $('#' + _self.id(id, 1)).html($(this).text());
                }

                $.each($('#' + _self.id(id, 0) + ' > a'), function(i, elm){
                    $(this).find('.' + selClassName).remove();
                });
                $('<span class="' + selClassName + '" data="' + _self.parameters[id].defaultid + '"></span>').appendTo($(this));
                $('#' + _self.id(id, 0)).hide();
                _self.parameters[id].callback(_self.parameters[id].defaultid,_self.parameters[id]);
                return false;
            };

            //title, h2
            _self.settings = {labelcss: 'blueLink', defaultid :0, labelover: 'cur', css: 'tkBox c3a',
                    data: [{id: 0, title: '',  txt: '', href:'###', css:'', ico: '', icotitle: ''}],
                    remote: false, selected: _self.selected, firstrq: true, callback: function(){}};

            var selClassName = 'icor';

            _self.parameters = {};
            _self.id = function(id, type, reverse ){
                var dt = ['aside_', 'label_', 'combo_list_'];
                if(reverse == true){
                    return id.replace(dt[type], '');
                }
                return dt[type] + id;
            };

            _self.display = function(asideobj, id){
                if(_self.parameters[id].ajax)return false;
                if($.trim(asideobj.html()) == '')
                    $(_self.createHtml(id)).appendTo(asideobj);
                if(typeof($('#' + asideobj.attr('id') + ' > a').data("events")) == 'undefined'){
                    $('#' + asideobj.attr('id') + ' > a').bind('click', _self.parameters[id].selected);
                }
                _self.parameters[id].showFlag = true;
                asideobj.show();
            };
            /**
             * 隐藏对象;
             * @param  {[type]} asideobj [description]
             * @param  {[type]} id       [description]
             * @return {[type]}          [description]
             */
            _self.hide = function(asideobj, id){
                setTimeout(function(){
                    if(! _self.parameters[id].showFlag){
                        asideobj.hide();
                        _self.parameters[id].showFlag = false;
                    }
                }, 100);
            };
            /**
             * 事件绑定;
             * @param  {[type]} obj      [description]
             * @param  {[type]} asideobj [description]
             * @param  {[type]} id       [description]
             * @return {[type]}          [description]
             */
            _self.bindevent = function(obj, asideobj, id){
                obj.on({
                    mouseover: function(e) {
                        var id_obj = _self.parameters[id];
                        if (id_obj !== 'undefined') {
                            $('#' + _self.id(id, 1)).addClass(id_obj.labelover);
                            if(id_obj.remote){
                                if(id_obj.firstrq){
                                    id_obj.ajax = true;
                                    id_obj.firstrq = false;
                                    $.post(id_obj.remote, [], function(data){
                                        id_obj.ajax = false;
                                        id_obj.data = data;
                                        _self.display(asideobj, id);
                                        return false;
                                    }, 'json');
                                }else if(!id_obj.ajax){
                                    _self.display(asideobj, id);
                                }
                            }else{
                                _self.display(asideobj, id);
                            }
                        }
                    },
                    mouseout: function(e) {
                        var id_obj = _self.parameters[id];
                        if (id_obj !== 'undefined') {
                            $('#' + _self.id(id, 1)).removeClass(id_obj.labelover);
                            id_obj.showFlag = false;
                            _self.hide(asideobj, id);
                        }
                    },
                    click:function(){
                        return false;
                    }
                });
                
                asideobj.on({
                    mouseout: function(e){
                        var id_obj = _self.parameters[id];
                        if (id_obj !== 'undefined') {
                            $('#' + _self.id(id, 1)).removeClass(id_obj.labelover);
                            id_obj.showFlag = false;
                            _self.hide(asideobj, id);
                        }
                    }
                });
            };
            _self.drawlist = function(id, data, html, group){
                if(_self.parameters[id].ajax)return html;
                var data = group >= 0 ? data[group] : data;
                $.each(data, function(i, row){
                    html.push('<a id="' + _self.id(row.id, 2) + '" ');
                    if(typeof(row.css) != 'undefined'){
                        html.push('class="' + row.css + '" ');
                    }
                    if(typeof(row.href) == 'undefined'){
                        row.href = '###';
                    }

                    html.push('href="' + row.href + '" title="'+ (typeof(row.title)== 'string' ? row.title : '' ) +'"><span class="fl">' + row.txt + '</span>' );
                    if(typeof(row.ico) != 'undefined'){
                        if(typeof(row.icotitle) == 'undefined')row.icotitle = '';
                        html.push('<span class="' + row.ico + '">' + row.icotitle + '</span>');
                    }

                    if(i == _self.val(id) ){
                        html.push('<span class="' + selClassName + '"></span>');
                    }
                    html.push('</a>');
                });
                return html;
            };
            _self.createHtml = function(id){
                if(_self.parameters[id].ajax)return '';
                var data = _self.parameters[id].data;
                var html = new Array();
                if(_self.parameters[id].h2 instanceof Array){
                    for(var idx =0; idx< _self.parameters[id].h2.length; idx++){
                        html.push('<h2>' + _self.parameters[id].h2[idx] + '</h2>');
                        html = _self.drawlist(id, data, html, idx);
                    }
                }else if( typeof(_self.parameters[id].h2) != 'undefined'){
                    html.push('<h2>' + _self.parameters[id].h2 + '</h2>');
                    html = _self.drawlist(id, data, html, -1);
                }else{
                    html = _self.drawlist(id, data, html, -1);
                }
                return html.join('');
            };
            _self.init = function(){
                $.each(options, function(id, config){
                    if( typeof(_self.parameters[id]) !== "undefined" ) return;

                    var obj = _self.parameters[id] = {'showFlag': false, 'ajax': false};

                    $.extend(obj, _self.settings, config);
                    $('<a id="' + _self.id(id, 1)
                            + '" class="' + obj.labelcss + '" href="javascript:;">'
                            + ( typeof(obj.title) === 'undefined' ? obj.data[_self.val(id)].txt : obj.title ) 
                            + suffixIco + '</a>').appendTo( $('#' + id));
                    // 如果定义了远程地址，并且没有定义标题;
                    if(obj.remote && typeof(obj.title) == 'undefined'){
                        $.post(obj.remote, [], function(data){
                            data = obj.format(data);
                            obj.data = data;
                            obj.firstrq = false;
                            $('#' + _self.id(id, 1)).html(data[0].txt + suffixIco);
                            obj.defaultid = data[0].id;
                        }, 'json');
                    }

                    $('<aside id="' + _self.id(id, 0)
                            + '" class="' + obj.css + '"></aside>').appendTo($('#' + id));

                    $('#' + _self.id(id, 0)).hide();
                    _self.bindevent($('#' + id), $('#' + _self.id(id, 0)), id);
                });
            };

            _self.val = function(id){
                return typeof _self.parameters[id]!=='undefined' ? _self.parameters[id].defaultid : 0;
            };

            _self.init();
        }
    });
	
	
	/**
	 * 下拉浮层2
	 */
	$.extend($.yy, {
		comboDiv2: function(options){
			/*data: [{id: 'id值', title:'a标签title显示文字' , txt: '链接文字', href:'链接地址', css:'链接样式', ico: '链接后是否加样式',
				icotitle: 'span中得值'}]*/
			var _self = this, 
                suffixIco = '<span class="arrowDown"></span>';
			_self.selected = function(e){
				var itemid = $(this).attr('id');
				var id = $(this).parent().attr('id');
				id = _self.id(id, 0, true);
				_self.parameters[id].defaultid = _self.id(itemid, 2, true);
				$("#group").val(_self.id(itemid, 2, true));
				if($('span.arrowDown', '#' + _self.id(id, 1)).length > 0){
					$('#' + _self.id(id, 1)).html($(this).text() + suffixIco);
				}else{
					$('#' + _self.id(id, 1)).html($(this).text());
				}

				$.each($('#' + _self.id(id, 0) + ' > a'), function(i, elm){
					$(this).find('.' + selClassName).remove();
				});
				$('<span class="' + selClassName + '" data="' + _self.parameters[id].defaultid + '"></span>').appendTo($(this));
				$('#' + _self.id(id, 0)).hide();
				_self.parameters[id].callback(_self.parameters[id].defaultid,_self.parameters[id]);
				return false;
			};

			//title, h2
			_self.settings = {labelcss: 'blueLink', defaultid :0, labelover: 'cur', css: 'tkBox c3a',
					data: [{id: 0, title: '',  txt: '选择', href:'###', css:'', ico: '', icotitle: ''}],
					remote: false, selected: _self.selected, firstrq: true, callback: function(){}};

			var selClassName = 'icor';

			_self.parameters = {};
			_self.id = function(id, type, reverse ){
				var dt = ['aside_', 'label_', 'combo_list_'];
				if(reverse == true){
					return id.replace(dt[type], '');
				}
				return dt[type] + id;
			};

			_self.display = function(asideobj, id){
				if(_self.parameters[id].ajax)return false;
				if($.trim(asideobj.html()) == '')
					$(_self.createHtml(id)).appendTo(asideobj);
				if(typeof($('#' + asideobj.attr('id') + ' > a').data("events")) == 'undefined'){
					$('#' + asideobj.attr('id') + ' > a').bind('click', _self.parameters[id].selected);
				}
				_self.parameters[id].showFlag = true;
				asideobj.show();
			};
            /**
             * 隐藏对象;
             * @param  {[type]} asideobj [description]
             * @param  {[type]} id       [description]
             * @return {[type]}          [description]
             */
			_self.hide = function(asideobj, id){
				setTimeout(function(){
					if(! _self.parameters[id].showFlag){
						asideobj.hide();
						_self.parameters[id].showFlag = false;
					}
				}, 100);
			};
            /**
             * 事件绑定;
             * @param  {[type]} obj      [description]
             * @param  {[type]} asideobj [description]
             * @param  {[type]} id       [description]
             * @return {[type]}          [description]
             */
			_self.bindevent = function(obj, asideobj, id){
                obj.on({
                    mouseover: function(e) {
                        var id_obj = _self.parameters[id];
                        if (id_obj !== 'undefined') {
                            $('#' + _self.id(id, 1)).addClass(id_obj.labelover);
                            if(id_obj.remote){
                                if(id_obj.firstrq){
                                    id_obj.ajax = true;
                                    id_obj.firstrq = false;
                                    $.post(id_obj.remote, [], function(data){
                                        id_obj.ajax = false;
                                        id_obj.data = data;
                                        _self.display(asideobj, id);
                                        return false;
                                    }, 'json');
                                }else if(!id_obj.ajax){
                                    _self.display(asideobj, id);
                                }
                            }else{
                                _self.display(asideobj, id);
                            }
                        }
                    },
                    mouseout: function(e) {
                        var id_obj = _self.parameters[id];
                        if (id_obj !== 'undefined') {
                            $('#' + _self.id(id, 1)).removeClass(id_obj.labelover);
                            id_obj.showFlag = false;
                            _self.hide(asideobj, id);
                        }
                    }
                });
                
				asideobj.on({
                    mouseout: function(e){
                        var id_obj = _self.parameters[id];
                        if (id_obj !== 'undefined') {
                            $('#' + _self.id(id, 1)).removeClass(id_obj.labelover);
                            id_obj.showFlag = false;
                            _self.hide(asideobj, id);
                        }
                    }
                });
			};
			_self.drawlist = function(id, data, html, group){
				if(_self.parameters[id].ajax)return html;
				var data = group >= 0 ? data[group] : data;
				$.each(data, function(i, row){
					html.push('<a id="' + _self.id(row.id, 2) + '" ');
					if(i == _self.val(id) ){
						row.css = (typeof(row.css) != 'undefined') ? row.css + ' cur' : 'cur';
					}
					if(typeof(row.css) != 'undefined'){
						html.push('class="' + row.css + '" ');
					}
					if(typeof(row.href) == 'undefined'){
						row.href = '###';
					}
					
					html.push('href="' + row.href + '" title="'+ (typeof(row.title)== 'string' ? row.title : '' ) +'">' + row.txt );
					if(typeof(row.ico) != 'undefined'){
						if(typeof(row.icotitle) == 'undefined')row.icotitle = '';
						html.push('<span class="' + row.ico + '">' + row.icotitle + '</span>');
					}

					if(i == _self.val(id) ){
						html.push('<span class="' + selClassName + '"></span>');
					}
					html.push('</a>');
				});
				return html;
			};
			_self.createHtml = function(id){
				if(_self.parameters[id].ajax)return '';
				var data = _self.parameters[id].data;
				var html = new Array();
				if(_self.parameters[id].h2 instanceof Array){
					for(var idx =0; idx< _self.parameters[id].h2.length; idx++){
						html.push('<h2>' + _self.parameters[id].h2[idx] + '</h2>');
						html = _self.drawlist(id, data, html, idx);
					}
				}else if( typeof(_self.parameters[id].h2) != 'undefined'){
					html.push('<h2>' + _self.parameters[id].h2 + '</h2>');
					html = _self.drawlist(id, data, html, -1);
				}else{
					html = _self.drawlist(id, data, html, -1);
				}
				return html.join('');
			};
			_self.init = function(){
				$.each(options, function(id, config){
					if( typeof(_self.parameters[id]) !== "undefined" ) return;

                    var obj = _self.parameters[id] = {'showFlag': false, 'ajax': false};

					$.extend(obj, _self.settings, config);
					$('<a id="' + _self.id(id, 1)
							+ '" class="' + obj.labelcss + '" href="javascript:;">'
							+ ( typeof(obj.title) === 'undefined' ? obj.data[_self.val(id)].txt : obj.title ) 
                            + suffixIco + '</a>').appendTo( $('#' + id));
                    // 如果定义了远程地址，并且没有定义标题;
					if(obj.remote && typeof(obj.title) == 'undefined'){
						$.post(obj.remote, [], function(data){
							data = obj.format(data);
							obj.data = data;
							obj.firstrq = false;
							$('#' + _self.id(id, 1)).html(data[0].txt + suffixIco);
							obj.defaultid = data[0].id;
						}, 'json');
					}

					$('<aside id="' + _self.id(id, 0)
							+ '" class="' + obj.css + '"></aside>').appendTo($('#' + id));

					$('#' + _self.id(id, 0)).hide();
					_self.bindevent($('#' + id), $('#' + _self.id(id, 0)), id);
				});
			};

			_self.val = function(id){
				return typeof _self.parameters[id]!=='undefined' ? _self.parameters[id].defaultid : 0;
			};

			_self.init();
		}
	});
	
	/**
	 * 关注
	 */
	$.extend($.yy, {
		followCommon: function(options){//add by zn
			var self = this;
			var defaultOption = {
					setsId: 'body',
					confirm: {txt: '加关注', css: 'gzChengButton'},
					cancel: {txt: '取消关注', css: 'gzGrayButton'},
					callback: function(status, data, obj){},
					reload: true,
					followSelector : '.yy-follow-common',
					batch: false,//是否为批量关注
					batchClass : 'yy-follow-batch',//批量关注按钮筛选样式
					checkBoxSelector : 'input[name="member_id"]:checked'//批量操作的复选框筛选
					
			};
			$.extend(defaultOption, options);
			$(defaultOption.setsId).find(defaultOption.followSelector).live('click', function(){
				var $me = $(this),
					status = 0,//0:取消关注;1:关注
					params = {status: status, type: $me.attr('role'), id: $me.attr('for')};
				if($me.hasClass(defaultOption.confirm.css)) params.status = 1;
				if(defaultOption.batch && $me.hasClass(defaultOption.batchSelector) ){
					params.id = [];
					$(defaultOption.checkBoxSelector).each(function(){    
						params.id.push($(this).val());    
					});  
					if(params.id.length == 0){
						$.yy.rscallback('必须选择一项');
						return false;
					}
				}
				
                //关注/取消关注
				$.post(yyBaseurl + '/space/ajax/follow', params, function(data){
					if(! data.rs){
						alert(data.error);
						return;
					}
					$me.toggleClass(defaultOption.confirm.css);
					$me.toggleClass(defaultOption.cancel.css);
					var msg = '关注成功';
					if(params.status == 0){
						msg = '已取消关注';
						$me.html(defaultOption.confirm.txt);
                        $.yy.rscallback(msg);
					}else{
						$me.html(defaultOption.cancel.txt);
						$.yy.rscallback(msg);
					}
					defaultOption.callback(status, data, $me);
						
				}, 'json');

				return false;});
		},
		follow: function(options){
			var self = this;
			var defaultOption = {
					setsId: 'body',
					confirm: {txt: '加关注', css: 'gzChengButton'},//blueGz  cYelBt
					cancel: {txt: '取消关注', css: 'gzGrayButton'},//grayGz cGrayBt
					callback: function(status, data, obj){},
					reload: true,
					followSelector : '.yy-follow'
			};
			$.extend(defaultOption, options);
			$(defaultOption.setsId).find(defaultOption.followSelector).live('click', function(){
				var self = $(this);
				var ele_role = self.attr("ele_role");
				var status = 0;//0:取消关注;1:关注
				if(self.hasClass(defaultOption.confirm.css)) status = 1;
				if(ele_role=="file"){
				    if(self.hasClass("confirm"))status = 1;
				}
				//modify by shiying 2012/9/7 增加批量关注操作
				if(typeof($(this).attr('for')) != "undefined" ){
					//var poststring = "{status: status, id: "+$(this).attr('for')+", type:"+ $(this).attr('role')+" }";
					var poststring = "/status/"+status+"/id/"+$(this).attr('for')+"/type/"+$(this).attr('role');
				}else{
					var chk_value =[];    
					$('input[name="member_id"]:checked').each(function(){    
						chk_value.push($(this).val());    
					});  
					if(chk_value.length == 0){
						alert("必须选择一项");
						return false;
					}
					var poststring = "/status/"+status+"/id/"+chk_value+"/type/"+$(this).attr('role');
					//var poststring = "{status: status, id: chk_value , type: $(this).attr('role') }";
				}
                // ...
				$.post(yyBaseurl + '/space/ajax/follow'+poststring,
						'',
					function(data){
						if(! data.rs){
							alert(data.error);
							return;
						}
						self.toggleClass(defaultOption.confirm.css);
						self.toggleClass(defaultOption.cancel.css);
						var msg = '关注成功';
                        var type = self.attr('type');
						if(status == 0){
							msg = '已取消关注';
							self.html(defaultOption.confirm.txt);
							self.parent().parent().find(".cyName").find("input").removeAttr("disabled").attr({value:self.attr("for"),name:"member_id",id:"member_id"});
                            //self.parent().parent().find(".cyName").prepend("<input type='checkbox' role='"+self.attr("role")+"' for='"+self.attr("for")+"'>");
                            if(self.parent().attr("class") == "doBt pl13"){
                                a = self.parent().find('a');
                                self.parent().parent().html('').append(a);
                                self.removeClass('gzGrayButton');
                            }
                            
                            $.yy.rscallback(msg);
                            if(defaultOption.reload)location.reload();
						}else{
							self.html(defaultOption.cancel.txt);
							 if(ele_role=="file"){
							 }else{
							 	 self.prev("input[type='checkbox']").hide(); //群组成员列表页面checkbox要隐藏
							 	 self.closest("li").find("input[type='checkbox']").attr('disabled', 'disabled');//全体成员页面
                                var followhref = yyBaseurl + '/followed/group/list/fid/'+ self.attr('for');
                                    $.fancybox({
                                        'href' : followhref,
                                        'margin':0,
                                        'padding':0,
                                        'autoScale':true,
                                        'titleShow': false,
                                        'showCloseButton': false,
                                        'centerOnScroll': true,
                                        'overlayOpacity': 0.9,
                                        'hideOnOverlayClick': true
                                        });
							 }
                           
						}
						defaultOption.callback(status, data, self);
						
				}, 'json');

               if (status == 0){
                    // ...
                    util.ajaxApi(util.url('/followed/group/ajaxcancel/'), function(d, s){
                        if (d) {}
                    }, 'POST', 'json', {id:$(this).attr('for')});
                }
				return false;
			});
		}
	});
	/**
	 * 我的群组
	 */
	$.extend($.yy, {
		mygroup: function(callback, substr){
			if(typeof($.yy.groupData) == "undefined"){
				$.post(yyBaseurl + '/api/info/mygroup/substr/' + substr, {}, function(data){
					callback(data);
				}, 'json');
			}else{
				callback($.yy.groupData);
			}
		}
	});
	/**
	 * 自动换行
	 */
	$.fn.yyautoWrap = function(maxchar){
	    var $me = $(this),
	        me_lineheight = $me.css('line-height'),
	        me_fontsize = $me.css('font-size'),
		    $hiddenDiv = $('<div id="'+(new Date().getTime())+'" style="display:none;font-size:'+me_fontsize+';line-height:'+me_lineheight+';"></div>'),
	        orig_height = $me.height(),
	        before_text = '';
		$me.css('overflow', 'hidden');
		$hiddenDiv.css('width', $me.css('width')).appendTo('body');
		$me.on({
		    'keydown': flexTextareaHeight,
		    'keyup': flexTextareaHeight,
		    'change': flexTextareaHeight
		});
		function flexTextareaHeight(e){
			var orig_text = $me.val(),
			    text = orig_text.substring(0, maxchar);
			if(orig_text!==text || before_text!==text){
    			var newText = text.replace(/[<]/g, '&lt;')
    				              .replace(/[>]/g, '&gt;')
    				              .replace(/\n|\r|(\r\n)/g, '<br />');
    			before_text = text;
    			$hiddenDiv.html(newText);
    			var new_height = parseInt($hiddenDiv.css('height'))+14,
    			    height = new_height<orig_height ? orig_height : new_height;
    			orig_text===text 
    			        ? $me.css('height', height+'px') 
		                : $me.val(text).css('height', height+'px');
			}
		}
	};
	/**
	 * 全选
	 */
	$.extend($.yy, {
		checkAll: function(options){
			options.checkAllObj.live('click', function(){
				var ischeck = $(this).attr('checked') == 'checked' ? true : false;
				if(ischeck){
					options.checkboxObj.attr('checked', 'checked');
				}else {
					options.checkboxObj.removeAttr('checked');
					if(typeof(options.callback) != 'undefined') options.callback();
				}
			});
			
			
		}
	});
    // DOM ready...
    $(function(){
        $('#rscallback').bind('click', function(){
            $('#rscallback').hide();
            return false;
        });
        $("input").blur(function (){
            var _this= $(this);
            var title = _this.attr('default');
            if(title==""){
                return;
            }
            if(_this.val()==''){
                _this.val(title);
            }
        });
        $("input").focus(function (){
            var _this=$(this);
            var title = _this.attr("default");
            if(title==""){
                return;
            }
            if(_this.val()==title){
            _this.val("");
            }
        });
    });
})(jQuery, YY.util||{});