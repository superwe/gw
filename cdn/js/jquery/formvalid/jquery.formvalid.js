/**
 * form validity
 * 
 * @author bull
 */
(function($){
    $.formValid = {
        setting : {
            tipContainer : '.yy-tips',
            normalContainer : '.yy-form-line'
        },
        partterns : {
            qz_name     : /^[a-zA-Z0-9_\u4E00-\u9FA5().]+$/i,
            qz_shortname: /^[a-zA-Z0-9_\u4E00-\u9FA5.]+$/i,
            username    : /^[a-zA-Z0-9_\u4E00-\u9FA5]+$/i,
            email       : /^(?:\w+\.?)*\w+@(?:\w+\.)+\w+$/i,
//            email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i,
            

//            email_prefix: /^\w+([-+.]\w+)*$/i,
//            email_suffix: /^\w+([-.]\w+)*\.\w+([-.]\w+)*$/i,
            name        : /^[a-z\u4E00-\u9FA5]+$/i, 
//            sname       : /^[a-z\u4E00-\u9FA5][a-z0-9\u4E00-\u9FA5]+$/i, 
//            tel_prefix  : /^0\d{2,3}$/,
//            tel_suffix  : /^[1-9]\d{5,7}$/,
            tel         : /^[0-9]+$/,
            mobile      : /^(\+86-?)?1[3458]\d{9}$/
            //seccode     : /^\d{4,}$/,
            //industry    : /^[a-z\/、\u4E00-\u9FA5]+$/,
            //leader    	: /^[a-z\/、\u4E00-\u9FA5]+$/,
//            trade_other : /^[a-z\/、\u4E00-\u9FA5]+$/,
//            position_other: /^[a-z\/、\u4E00-\u9FA5]+$/
        },
        lengthRange : {
            qz_name     : [4,20],
            qz_shortname: [1,20],
            username    : [2,20],
            name        : [2,20],
//            sname       : [4,20],
            password    : [6,16],
//            comname     : [4,40],
            duty        : [2,10]
        },
        defaultMsg : {
            qz_name     : '须同营业执照一致。', 
            qz_shortname: '请输入公司简称',
            username    : "由中文、英文、数字及下划线组成，2-20位字符，注册成功不可修改",
            email       : "请输入你的常用邮箱，用来登录、找回密码、接收通知等",
            password    : "6-16位字符（字符、数字、符号），区分大小写",
            password2   : "请再输入一次密码",
            name        : "请输入真实的中文或英文姓名",
            duty        : "请输入公司职务",
//            sname       : "请输入准确的组织简称，由中文、英文、数字组成，4-20字符之间",
//            gperson     : "请输入注册联系人的真实姓名",
//            comname     : '请输入你的工作单位，4-40个字符之间',
            tel         : '请输入办公电话号码',
            mobile      : '请输入手机号码'
                       
        },
        errorMsg : {
            required    : {
                qz_name     : "请输入公司全称",
                qz_shortname: "请输入公司简称",
                username    : "请输入用户名",
                email       : "请输入邮箱",
//                email_suffix: '请输入邮箱',
//                email_prefix: '请输入邮箱',
                password    : "请输入密码",
                password2   : '请输入确认密码',
                name        : "请输入真实姓名",
                duty        : "请输入公司职务",
//                sname       : "请输入组织简称",
                tel         : "请输入办公电话",
                //comname     : '请输入工作单位',
                //mobile      : '请输入电话或手机',
                //leader    	: '请选择职位',
                //industry    : '请选择行业',
                agreement      : '您还没有选择接受使用协议'
            },
            rel_both_required: {
//                email_suffix : ['email_prefix', "请输入邮箱"]
            },
            rel_required: {
//                mobile   : [['tel_prefix','tel_suffix'], '电话和手机需必填一项']
            },
            regex       : {
                qz_name    : '用户名由中文、英文、数字、小括号及下划线组成，4-20位字符',
                qz_shortname    : '用户名由中文、英文、数字及下划线组成，1-20位字符',
                username    : '用户名由中文、英文、数字及下划线组成，2-20位字符',
                email       : '邮箱格式不对，请重新输入',
//                email_prefix: '邮箱格式不对，请重新输入',
//                email_suffix: '邮箱格式不对，请重新输入',
//                tel_prefix  : '电话格式不对，请重新输入',
//                tel_suffix  : '电话格式不对，请重新输入',
                name        : '请输入真实的中文或英文姓名',
//                sname       : '请输入正确的组织简称',
                mobile      : '手机号格式错误，请重新输入',
                tel         : '电话号码格式不对，请重新输入'//,
                //industry    : '行业数据不正确'
            },
            rel_both_regex   : {
//                email_suffix: ['email_prefix', '邮箱格式不对，请重新输入'],
//                email_prefix: ['email_suffix', '邮箱格式不对，请重新输入'],
//                tel_prefix: ['tel_suffix', '电话格式不对，请重新输入'],
//                tel_suffix: ['tel_prefix', '电话格式不对，请重新输入']
            },
            length      : {
                qz_name     : '用户名长度只能在4-20位字符之间',
                qz_shortname: '用户名长度只能在1-20位字符之间',
                username    : '用户名长度只能在2-20位字符之间',
                name        : '真实姓名长度在2-20位字符之间',
//                sname       : '组织简称长度在4-20字符之间',
                password    : '密码在6-16位字符之间',
//                comname     : '单位名称4-40个字符之间',
                duty        : '公司职务在2-10位字符之间'
            },
            compare     : {
                password2    : ['password','两次输入的密码不一致']
            }
        }
    };
    
    $.fn.extend({
        formValid : function(type){
            var $me = $(this);
            
            switch(type) {
                case 'tips'://提示;
                    var msg = arguments.length>1 ? arguments[1] : '';
                    return tips(msg);
                break;
                case 'valid'://校验;
                    var formData   = arguments.length>1 ? arguments[1] : null,
                        msgShowFlag = arguments.length>2 ? arguments[2] : true;
                    return valid(formData,msgShowFlag);
                break;
            }
                
            //简单提示
            function tips(){
                var msg = arguments.length ? arguments[0] : '';
                if(!msg) {
                    var name = $me.attr('name').replace(/_prefix/, '').replace(/_suffix/, '');
                    msg = $.formValid.defaultMsg[name];
                }
                $me.closest($.formValid.setting.normalContainer)
                    .find($.formValid.setting.tipContainer).eq(0).removeClass('yy-tips-error').html(msg);
            }
			function strlen(str){  
				var len = 0;  
				for (var i=0; i<str.length; i++) {   
				 var c = str.charCodeAt(i);   
				//单字节加1   
				 if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {   
				   len++;   
				 }   
				 else {   
				  len++;   
				 }   
				}   
				return len;  
			}
            //合法性校验;
            function valid(formData,msgShowFlag){
                var v = {
                    minlength : function(str, size) {
                        return strlen(str) >= size ? true : false;
                    },
                    maxlength : function(str, size) {
                        return strlen(str) > size ? false : true;
					/**
						var n=0;
                        for(i=0;i<str.length;i++) {
                            var leg=str.charCodeAt(i);
                            n += leg>255 ? 2 : 1;
                         }
                        return  n<=size? true : size;
						*/
                    },
                    /**
                     * @return errcount || null 返回错误数量(0或者1),或者null(表示传入的为空对象);
                     */
                    elementvalid : function($o,msgShowFlag){//$o为表单元素的jquery对象;
                        if (!$o.length) return null;//对象长度为空,则直接返回;

                        var $tips = $o.closest($.formValid.setting.normalContainer)
                                        .find($.formValid.setting.tipContainer).eq(0),
                            name = $o.attr('name'),
                            val  = $.trim($o.val()),
                            msg = '', errflag = 0, errcount = 0;
                        if ($o.attr('type')==='checkbox') {
                            //针对checkbox类型，验证是否被选择了；
                            if (typeof $.formValid.errorMsg.required[name] !== 'undefined') {
                                var checkflag = false;
                                $('[name="'+name+'"]').each(function(i){
                                    if ($(this).attr('checked')) {
                                        checkflag = true;
                                        return false;
                                    }
                                });
                                msg = checkflag ? '' : $.formValid.errorMsg.required[name];
                                checkflag ? $tips.html('<i class="yy-icon-ok"></i>')
                                          : (++errcount 
                                                && (msgShowFlag
                                                    ? $tips.addClass('yy-tips-error').show().html(msg) : '')
                                                );
                                return errcount;
                            }
                            return ;
                        }
                        if (typeof $.formValid.errorMsg.compare[name] !== 'undefined') {
                            var toCompared = $.formValid.errorMsg.compare[name][0];
                            if (val !== $.trim($('[name="'+toCompared+'"]').val())) {
                                msg = $.formValid.errorMsg.compare[name][1];
                                errflag = 1;
                            }
                        }
                        //验证必填项；
						var requiredFlag = (typeof $.formValid.errorMsg.required[name] !== 'undefined');
                        if (requiredFlag && !errflag) {
                            if(val.length) {
                                //当前验证字段不为空，同时还需要验证关联验证字段；
                                if (typeof $.formValid.errorMsg.rel_both_required[name] !== 'undefined'){
                                    var $relBothField = $('[name="'+$.formValid.errorMsg.rel_both_required[name][0]+'"]');
                                    if (!$.trim($relBothField.val())) {
                                        msg = $.formValid.errorMsg.rel_both_required[name][1];
                                        errflag = 1;
                                    }
                                }
                            }
                            else {
                                if (typeof $.formValid.errorMsg.rel_required[name] !== 'undefined') {
                                    var relFields = (typeof $.formValid.errorMsg.rel_required[name][0]==='string')
                                                    ? [$.formValid.errorMsg.rel_required[name][0]]
                                                    : $.formValid.errorMsg.rel_required[name][0];
                                    $.each(relFields, function(i,n){
                                        var $relField = $('[name="'+n+'"]');
                                        if (!$.trim($relField.val())) {
                                            //关联字段为空，那么这个必须不能为空，否则允许其为空
                                            msg = $.formValid.errorMsg.rel_required[name][1];
                                            errflag = 1;
                                            return false;
                                        }
                                    });
                                }
                                else {
                                    msg = $.formValid.errorMsg.required[name];
                                    errflag = 1;
                                }
                            }
                        }
                        //对长度的校验;
                        if ((typeof $.formValid.errorMsg.length[name] !== 'undefined')
                                && !errflag) {
                            if (val.length&&(!v.minlength(val, $.formValid.lengthRange[name][0])
                                    || !v.maxlength(val, $.formValid.lengthRange[name][1]))) {
                                msg = $.formValid.errorMsg.length[name];
                                errflag = 1;
                            }
                        }
                        //使用正则的校验;
                        if ((typeof $.formValid.errorMsg.regex[name] !== 'undefined')
                                && !errflag) {
                            //当前验证字段有非空字符内容；
                            if (val.length) {
                                if ($.formValid.partterns[name].test(val)) {
                                    //当前字段通过验证，同时还需要确认和其关联的字段是否也通过正则验证；
                                    if (typeof $.formValid.errorMsg.rel_both_regex[name] !== 'undefined') {
                                        var relBothField = $.formValid.errorMsg.rel_both_regex[name][0],
                                            $relBothField = $('[name="'+relBothField+'"]'),
                                            relBothFieldVal = $.trim($relBothField.val());
                                        if (!$.formValid.partterns[relBothField].test(relBothFieldVal)) {
                                            msg = $.formValid.errorMsg.rel_both_regex[name][1];
                                            errflag = 1;
                                        }
                                    }
                                }
                                else {
                                    msg = $.formValid.errorMsg.regex[name];
                                    errflag = 1;
                                }
                            }
                            else {
                                //如果当前字段为空，则检查关联并且必须要正则验证的字段是否也为空，如不为空，那么无法通过验证；
                                if (typeof $.formValid.errorMsg.rel_both_regex[name] !== 'undefined') {
                                    var relBothField = $.formValid.errorMsg.rel_both_regex[name][0],
                                        $relBothField = $('[name="'+relBothField+'"]'),
                                        relBothFieldVal = $.trim($relBothField.val());
                                    if (relBothFieldVal.length) {
                                        msg = $.formValid.errorMsg.rel_both_regex[name][1];
                                        errflag = 1;
                                    }
                                }
                            }
                        }
                        errflag ? (++errcount 
                                    && (msgShowFlag 
                                            ? ($tips.addClass('yy-tips-error').show().html(msg) 
											&& ($('#tip_username').hasClass('yy-tips-error')?$('#s_tip_username').html(''):'')
											)
                                            : ''))
                                : ($tips.find('.yy-icon-ok').length ? '' : $tips.append('<i class="yy-icon-ok"></i>'));
                        return errcount;
                    }//elementvalid function end;
                }
                //formData为null,表示需要验证的是单个表单元素,而不是整个表单;
                if (formData===null) 
                    return v.elementvalid($me,msgShowFlag) ? false : true;//返回true表明通过校验,否则校验失败;
                //formData为非null,则表示验证的是表单内的元素;
                else {
                    var errcount=0;
                    $.each(formData, function(i,n){
                        if (typeof n.name !== 'undefined') {
                            var $o = $('[name="'+n.name+'"]');//form表单中拥有name属性的子元素;
                            if (v.elementvalid($o,msgShowFlag)) errcount++;
                        }
                    });
                    return errcount ? false : true;//当错误数为0,则通过校验返回true,否则返回false;
                }
            }//end of valid function;
        }
        
    });
})(jQuery);