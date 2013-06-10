/**
 *rely on:jQuery,yy.util.js,class.js
 * html页面需要三个ID nextId,prevId,listId
 */
//分页功能
$.Class("lib.common.pageSkip",{
    init:function (option){
        this.type="common.pageSkip";
        this.pageNum = option.pageNum;
        this.pageSize = option.pageSize;
        this.total = option.total;
        this.url = option.url;
        this.template = option.template;
        this.callback = option.callback;
        this.eleId = this.getId();
    },
    setTotal:function (total){
        this.total = total;
    },
    //后移
    next:function (){
        if(this.pageNum>this.total-1)return;
        this.pageNum = this.pageNum+1;
    },
    //前移
    prev:function (){
        if(this.pageNum<1)return;
        this.pageNum = this.pageNum-1;
    },
    //加载内容
    load:function (fun){
        var self = this;
        YY.util.ajaxApi(this.url, function(rs){
            if(!rs)return;
            fun(rs,self);
        }, 'POST', 'json','pageSize='+this.pageSize+'&pageNum='+this.pageNum);
    },
    //获取ID
    getId:function (){
        return "ps_"+$.getId();
    },
    template:function (){
        
    },
    //生成外边的块
    render:function (fun){
        var html = $(this.template).html(),
            eleId = this.eleId,
            nextId = "next"+ eleId,
            prevId = "prev"+ eleId,
            listId = "list"+ eleId,
            oneId = "one"+eleId;
        if(!html)return;    
        html = html.format({nextId:nextId,prevId:prevId,listId:listId,oneId:oneId});
        fun(html);
        this.bind();
    },
    //绑定左右事件
    bind:function (){
        // self.first();
        var eleId = this.eleId,
            self = this,
            fun = this.callback;
        $("#next"+eleId).click(function(){
            self.next();
            self.load(fun);
            self.viewState();
        });
        $("#prev"+eleId).click(function(){
            self.prev();
            self.load(fun);
            self.viewState();
        });
    },
    //左右功能屏蔽
    viewState:function(){
        if(this.pageNum>=this.total){
			
            $("#next"+this.eleId).hide();
        }
		if(this.pageNum<=1){
			
            $("#prev"+this.eleId).hide();
        }
		if(this.pageNum>=this.total&&this.pageNum<=1){
			
            $("#next"+this.eleId).hide();
            $("#prev"+this.eleId).hide();
        }
		if(this.pageNum>=this.total&&this.pageNum>1){
			
            $("#next"+this.eleId).hide();
            $("#prev"+this.eleId).show();
        }
		if(this.pageNum<this.total&&this.pageNum<=1){
			
            $("#next"+this.eleId).show();
            $("#prev"+this.eleId).hide();
        }
		if(this.pageNum<this.total&&this.pageNum>1){
            $("#next"+this.eleId).show();
            $("#prev"+this.eleId).show();
        }
    },
    //渲染list
    renderList:function (html){
        $("#list"+this.eleId).html(html);
    },
    hide:function (){
        $("#one"+this.eleId).hide();
    },
    show:function (){
        $("#one"+this.eleId).show();
    },
    //第一次加载时执行，
    first:function (num){
        var self = this,
            fun = function (rs){
                /*if(rs.data.totalPage==0){
             
					return ;
                
				}*/
				self.show();
                self.setTotal(rs.data.totalPage);
                self.callback(rs,self);
                self.viewState();
            }
        this.pageNum = num||1;
        this.load(fun);
    }
});

