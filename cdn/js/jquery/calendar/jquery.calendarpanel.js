// JavaScript Document
var fw = {};

//历遍数组
fw.each = function(a, cb){
        for (var i=0,l=a.length; i<l; i++) a[i]=cb(a[i],i);
        return a;
}

//获取某年某月的天数
fw.getDays = function (y,m){
        return m==2?(y%4||!(y%100)&&y%400?28:29):(/4|6|9|11/.test(m)?30:31);
}

//获取元素绝对位置
fw.getXy = function (o){
        for(var _pos={x:0,y:0};o;o=o.offsetParent){
                _pos.x+=o.offsetLeft;
                _pos.y+=o.offsetTop;
        };
        return _pos;
}

//两个元素对齐
fw.align = function(o1, o2){
        o2.style.left = o1.style.left;
        o2.style.top = o1.style.top;
        o2.style.width = o1.offsetWidth + "px";
        o2.style.height = o1.offsetHeight + "px";
}


//日历类
var fw_cal = function (me, id, cb){
        this.me = me;
        this.obj = document.getElementById(id);
        this.cb = cb || Function();
        !this.obj && this.addDiv();
        this.week = fw.each('日一二三四五六'.split(''), function(s){return '<b>'+s+'</b>'});
        this.up(new Date().getFullYear(), new Date().getMonth()+1);
        return this;
}


//年月HTML
fw_cal.prototype.ym = function(y, m, bn){
        m==13 && (m=1,y++) || m==0 && (m=12,y--);
        return '<b class="btn" onclick="'+this.me+'.up('+y+','+m+')">'+bn+'</b>';
}

//更新HTML
fw_cal.prototype.up = function(y,m){
        var me = this.me;
        var ti = this.ym(y-1,m,"<<")+this.ym(y,m-1,"<")+'<b class="dateCap">'+y+'年'+m+'月</b>'+this.ym(y,m+1,">")+this.ym(y+1,m,">>");
        var sp = Array(new Date(y+"/"+m+"/1").getDay()+1).join('<b> </b>');
        var ds = fw.each(Array(fw.getDays(y,m)), function(s,i){return '<a href="javascript:'+me+'.cb(\''+[y,m,++i].join('-')+'\');">'+i+'</a>'});
        this.obj.innerHTML = [ti].concat(this.week).concat(sp).concat(ds).join("");
}


//动态添加层
fw_cal.prototype.addDiv = function (){
        var me = this;
        this.ifr = document.createElement("iframe");
        this.ifr.style.cssText = "position:absolute;display:none;width:0px;height:0px";
        this.obj = document.createElement("div");
        this.obj.className = "cal2";
        this.obj.title='点击面板空白处关闭';
        this.obj.style.cssText = "display:none;";
        this.obj.onclick = function(e){(document.all||e.target==me.obj)&&me.hide()};
        document.body.appendChild(this.ifr);
        document.body.appendChild(this.obj);
        this.cb = this.select;
}

//绑定到控件中
fw_cal.prototype.bind = function (id){
        var me = this;
        var obj = document.getElementById(id);
        obj.onfocus = function(){me.show(this)};
        return this;
}

//选中
fw_cal.prototype.select = function (d){
        this.input.value = d;
        this.hide();
}

//显示
fw_cal.prototype.show = function (obj){
        this.input = obj;
        var o = fw.getXy(obj);
        this.obj.style.cssText = "display:''; left:"+o.x+"px; top:"+(o.y+obj.offsetHeight)+"px";
        this.ifr.style.display = "";
        document.all && fw.align(this.obj, this.ifr);
}

//隐藏
fw_cal.prototype.hide = function (){
        this.ifr.style.display = "none";
        this.obj.style.display = "none";
}