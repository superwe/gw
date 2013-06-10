/**
 * 滚动条;
 */
(function($, YY, util){
    var $I=function(a){
        return document.getElementById(a);
    }
    var $N=function(a){
        return document.getElementsByName(a);
    }
    var $T=function(a){
        return document.getElementsByTagName(a);
    }
    function geteventobj(event){
        event = event || window.event;
        var obj = event.srcElement ? event.srcElement : event.target;   
        return obj 
    }
    var add_listen=function(obj, action, effect){
        action = action.toLowerCase();
        var ms_action, w3c_action, ot_action;
        if (action.indexOf("on")==0){
            ms_action=action;w3c_action=action.substr(2);
        }
        else {
            ms_action="on"+action; w3c_action=action;
        }
        if (ms_action=="onmousewheel"||ms_action=="mousewheel"||w3c_action=="ondommousescroll"||w3c_action=="dommousescroll"){
            ms_action = "onmousewheel";
            w3c_action = "DOMMouseScroll";
            ot_action = "mousewheel";
        }
        try{
            obj.addEventListener(w3c_action, effect, true);
            if (ot_action) obj.addEventListener(ot_action, effect, true);
        }catch(e){
            obj.attachEvent(ms_action, effect);
            try{ window.event.cancelBubble=true;}
            catch(e){}
        }
    }
    var del_listen=function(obj, action, effect){
        action = action.toLowerCase();
        var ms_action, w3c_action, ot_action;
        if (action.indexOf("on")==0){
            ms_action=action;w3c_action=action.substr(2);
        }
        else {
            ms_action="on"+action; w3c_action=action;
        }
        if (ms_action=="onmousewheel"||ms_action=="mousewheel"||w3c_action=="ondommousescroll"||w3c_action=="dommousescroll"){
            ms_action = "onmousewheel";
            w3c_action = "DOMMouseScroll";
            ot_action = "mousewheel";
        }
        try{
            obj.removeEventListener(w3c_action, effect, true);
            if (ot_action) obj.removeEventListener(ot_action, effect, true);
        }catch(e){
            obj.detachEvent(ms_action, effect);
        }
    }
    var checkinobj=function(obj_father, obj){
        var ok = false;
        while(obj.parentNode && obj.parentNode != undefined){
            obj=obj.parentNode;
            if (obj==obj_father){
                ok = true;
                break;
            }
        }
        return ok;
    }
    var scrolls = function (a){
        var self = this;
        var timer;
        this.container = $I(a+"_container"); // 容器
        this.shower = $I(a+"_shower"); // 显示的内容
        this.scroller = $I(a+"_scroller"); // 滚动条容器
        this.scroll_up = $I(a+"_scroll_up"); // 上翻按钮
        this.scroll_down = $I(a+"_scroll_down"); // 下翻按钮
        this.scroll_bar = $I(a+"_scroll_bar"); // 滑动块
        this.is_bottom = function(){ // 检测是不是位于底部了
            if (self.shower.offsetTop <= self.container.offsetHeight-self.shower.offsetHeight){
                return true;
            }
            return false;
        }
        this.clearselect = window.getSelection ? function(){ window.getSelection().removeAllRanges(); } : function(){ document.selection.empty(); };
        this.resetright = function(){
            var a = self.shower.offsetTop / (self.shower.offsetHeight - self.container.offsetHeight);
            var b = self.scroller.offsetHeight - self.scroll_down.offsetHeight - self.scroll_bar.offsetHeight - self.scroll_up.offsetHeight;
            var c = self.scroll_up.offsetHeight + (0 - b * a);
            self.scroll_bar.style.top = c + "px";
        }
        this.resetleft = function(){
            var a = (self.scroll_bar.offsetTop - self.scroll_up.offsetHeight) / (self.scroller.offsetHeight - self.scroll_up.offsetHeight - self.scroll_down.offsetHeight - self.scroll_bar.offsetHeight);
            var b = self.shower.offsetHeight - self.container.offsetHeight;
            var c = 0 - (b * a);
            self.shower.style.top = c + "px";
        }
        this.move=function(a){
            if (self.shower.offsetTop+a <= 0 && self.shower.offsetTop+a >= self.container.offsetHeight-self.shower.offsetHeight){
                self.shower.style.top = (self.shower.offsetTop+a)+"px";
            }else if (self.shower.offsetTop+a > 0){
                self.shower.style.top = 0+"px";
            }else if (self.shower.offsetTop+a < self.container.offsetHeight-self.shower.offsetHeight){
                self.shower.style.top = self.container.offsetHeight-self.shower.offsetHeight+"px";
            }
            self.resetright();
        }
        this.upper = function(){
            self.clear();
            timer = window.setInterval(function(){
                self.move(2);
                }, 5);
        }
        this.downer = function(){
            self.clear();
            timer = window.setInterval(function(){
                self.move(-2);
                }, 5);
        }
        this.clear = function(){
            window.clearInterval(timer);
        }
        this.test_bar = function(){
            if (self.container.offsetHeight < self.shower.offsetHeight){
                self.scroller.style.display = "block";
            }else {
                self.scroller.style.display = "none";
            }
        }
        this.barmove = function(){
            // 记录当时鼠标的位置与
            self.clearselect;
            var mover = this;
            this.can_move_top = self.scroll_bar.offsetTop - self.scroll_up.offsetHeight; // 这个滚动条上方的可移动距离
            this.can_move_bottom = self.scroller.offsetHeight - self.scroll_bar.offsetTop - self.scroll_down.offsetHeight - self.scroll_bar.offsetHeight; // 这个滚动条下方的可移动距离
            this.e=arguments[0]||window.event;
            this.starts = this.e.clientY;
            this.starttop = self.scroll_bar.offsetTop;
            var flg = self.scroll_disable();
            if(!flg){
                return false ;
            }
            this.drag = function(){
                this.e=arguments[0]||window.event;
                this.ends = this.e.clientY;
                this.dis = this.ends - mover.starts;
                if (this.dis < (0-mover.can_move_top)) this.dis = 0-mover.can_move_top;
                if (this.dis > mover.can_move_bottom) this.dis = mover.can_move_bottom;
                self.scroll_bar.style.top = (mover.starttop + this.dis) + "px";
                self.resetleft();
                self.clearselect;
            }
            this.cleardrag = function(){
                del_listen(document, "mousemove", mover.drag);
                self.clearselect;
            }
            this.add_listener = function(){
                add_listen(document, "mousemove", mover.drag);
                add_listen(document, "mouseup", mover.cleardrag);
            }
            this.add_listener();
        }
        this.outbar = function(){
            
            var e=arguments[0]||window.event;
            var obj = e.srcElement ? e.srcElement : e.target;
            if (obj.id == self.scroller.id){
                var y = e.offsetY || e.layerY;
                var new_top = y - 0.5 * self.scroll_bar.offsetHeight;
                if (y - self.scroll_up.offsetHeight < 0.5 * self.scroll_bar.offsetHeight) new_top = self.scroll_up.offsetHeight;
                if (self.scroller.offsetHeight - y - self.scroll_down.offsetHeight < 0.5 * self.scroll_bar.offsetHeight) new_top = self.scroller.offsetHeight - self.scroll_down.offsetHeight - self.scroll_bar.offsetHeight;
                self.scroll_bar.style.top = new_top + "px";
                self.resetleft();
            }
        }
        this.gotobottom = function(){
            var a = (self.shower.offsetHeight > self.container.offsetHeight) ? self.container.offsetHeight - self.shower.offsetHeight : 0;
            self.shower.style.top = a + "px";
            self.test_bar();
            self.resetright();
        }
        this.wheel = function(){
            var flg = self.scroll_disable();
            if(!flg){
                return false ;
            }
            var e=arguments[0]||window.event;
            var act = e.wheelDelta ? e.wheelDelta/120 : (0 -e.detail/3);
            self.clear();
            self.move(80*act);
            try{ e.preventDefault();}
            catch(e){}
            return false;
        }
        this.scroll_bar.ondrag=function(){
            return false;
            }
        this.scroll_bar.oncontextmenu=function(){
            return false;
            } 
        this.scroll_bar.onselectstart=function(){
            return false;
            }
        this.scroll_disable=function(limit_height){
            limit_height = limit_height || 165;
            var he = $("#scroll_shower").height();
            if(he<limit_height){
                return false ;
            }else{
            	// $("#scroll_scroller").removeClass();
                return true ;
            }
        }
        add_listen(this.scroll_up, "mousedown", this.upper);
        add_listen(this.scroll_down, "mousedown", this.downer);
        add_listen(this.scroll_bar, "mousedown", this.barmove);
        add_listen(this.scroller, "mousedown", this.outbar);
        add_listen(this.shower, "mousewheel", this.wheel);
        add_listen(this.scroller, "mousewheel", this.wheel);
        add_listen(document, "mouseup", this.clear);
    }
    YY.Scrollbar = scrolls;
    
}(jQuery, YY, YY.util));