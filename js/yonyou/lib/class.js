/**
 * 类构造器
 * 依赖于jQuery
 */

$.extend({
        dataContent:{yy:{}},
        namespace: function (nsStr,nsEle){
            var strArr = nsStr.split("."),
                reset = $.dataContent.yy,
                one,
                i = strArr[0]=="yy"?1:0,
                l = strArr.length;
            for(;i<l;i++){
                one = strArr[i]
                    if(i==(l-1)){
                        if(nsEle){
                            //添加命名空间
                            reset[one] = nsEle;
                            return reset;
                        }else{
                            //获得命名空间下的函数。
                            return reset[one];
                        }
                    }else{
                        if(!reset[one]&&nsEle){
                            reset[one]={};
                        }
                    }
                reset = reset[one];
                
            }
            return undefined;
        },
        getUnique:(function (){
            var i = 0;
            return function (){
                return  i++;            
            };
        })(),
    getId:function (){
            return "e" + this.getUnique();
        }
});
(function ($){
var key = 0;
$.Class = function (namespace,objectFuns,staticFuns,extendClass){
	var l = arguments.length,
		//重构函数方法，使其允许3个参数与4个参数。
		extendClass = l == 4?extendClass:staticFuns,
		constructor = function (){
					  		return this.init.apply(this,arguments);
					  };
	//初始化构造器
	$.namespace(namespace,constructor);
	//继承自父类。
	if(extendClass){
		$.Class.extend(constructor,$.namespace(extendClass));
		//重构init方法，使其继承父类构造器。
		if(objectFuns.init){
			var old = objectFuns.init
			objectFuns.init = function (){
				constructor.superConstructor.call(this,arguments);
				old.apply(this,arguments);
			}
		}
	}
	//初始化静态方法
	if(l==4){
		staticFuns = staticFuns||{};
		staticFuns.getInstance = function (){
			return new constructor();
		}
		$.extend(constructor,staticFuns||{});
	}
	//初始化类方法。
	objectFuns = objectFuns||{};
	objectFuns.init = objectFuns.init||function(){};
	objectFuns.constructor = constructor;
	$.extend(constructor.prototype,objectFuns);
	return constructor;
}

/**
 * 原型继承
 * @param {Object} subClass
 * @param {Object} superClass
 */
$.Class.extend = function(subClass,superClass){
	var f = function (){},
		instance = null;
	f.prototype = superClass.prototype;
	f.prototype.constructor = subClass;
	instance = new f();
	if(instance.init){
		subClass.superConstructor = instance.init;
		delete instance.init;
	}else{
		subClass.superConstructor = superClass;
	}
	subClass.prototype = instance;
}
/**
 * 代理
 * @param {Object} namespace
 */
$.Class.proxy = function (domain,fun){
	return func.apply(domain,fun);
}
/**
 * 通过命名空间生成
 * @param {Object} ns
 * @param {Object} param
 */
$.newInstance = function (ns,param){
	return new ($.namespace(ns))(param);
}
/**
 * 通过命名空间获取类
 * @param {Object} namespace
 */
$.getClass = function (namespace){
	return $.namespace(namespace);
}
$.getKey = function (){
	return key ++;
}
})($)
