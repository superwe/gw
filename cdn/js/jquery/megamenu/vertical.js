var Tree = new Class({
	options: {
		transparency:1,                            //透明度
		hasChildName:'hasChild',                   //tree节点下还有分支是调用的class名称。
		currentClass:'current',                    //当前tree节点调用的class名称。
		holder:'categorySelect',                   //点击id为holder的元素，将激活树的第一个ul。
		showResultBox:'selectText',                //点击任意tree节点后，将tree节点的值写入id为showResultBox的元素里。
		disappearTime:200,                         //鼠标移出tree后经过多少毫秒后树消失。
		firstUlDisappearTime:2000,                 //点击holder后第一个ul消失的时间。
		timer:null                                 //鼠标事件的计时器。
	},
	initialize: function(treeId,options) {
		this.setOptions(options);
		this.tempArr = [];
		this.aliasUrl = '';
		this.container = $(treeId);
		this.close();
		this.getTreeNodes().each(function(treeNode){
			treeNode.addEvents({
				mouseenter:function(){
					$clear(this.options.timer);
					this.close();
					this.showCurrentRoute(treeNode);
				}.bind(this),
				mouseleave:function(){
					this.options.timer = this.close.delay(this.options.disappearTime,this);
				}.bind(this),
				click:function(){
					this.aliasUrl = '';
					$(this.options.showResultBox).set('text',treeNode.get('text'));
					$(this.options.showResultBox).set('alias',this.getAlias(treeNode));
					this.close();
				}.bind(this)
			});
		}.bind(this))
		$(this.options.holder).addEvent('click',function(){
			this.showDirectTreeNodes(this.getTreeBlks()[0]);
			var coordinates = $(this.options.holder).getCoordinates();
			this.container.setStyles({
				left:coordinates.left,
				top:coordinates.top + coordinates.height
			});
			this.options.timer = this.close.delay(this.options.firstUlDisappearTime,this);
		}.bind(this));
		this.getTreeNodes().each(function(treeNode){
			treeNode.setStyle('opacity',this.options.transparency);
		}.bind(this));
	},
	close:function(){
		this.getTreeNodes().each(function(treeNode){
			treeNode.removeClass(this.options.currentClass);
			treeNode.setStyle('display','none');
		}.bind(this));
	},
	getTreeBlks:function(){
		return this.container.getElements('ul');
	},
	getTreeNodes:function(){
		return this.container.getElements('a');
	},
	getAlias:function(treeNode){
		if(!treeNode.getParent().getParent().hasClass('rootUl')){
			this.aliasUrl = treeNode.get('alias') + '/' + this.aliasUrl;
			this.getAlias(treeNode.getParent().getParent().getPrevious());
		}
		else{
			this.aliasUrl = 'products/' + treeNode.get('alias') + '/' + this.aliasUrl;
		}
		return this.aliasUrl;
	},
	showDirectTreeNodes:function(treeBlk){
		treeBlk.getChildren().each(function(treeLi){
			treeLi.getChildren().each(function(treeNode){
				treeNode.setStyle('display','block');						 
			});
		});
	},
	showCurrentRoute:function(treeNode){
		var treeNodeParent = treeNode.getParent().getParent();
		if(treeNode.hasClass(this.options.hasChildName)){
			this.tempArr.push(treeNode.getNext());
			this.tempArr.push(treeNode);
			this.tempArr.push(treeNodeParent);
		}
		else{
			this.tempArr.push(treeNode);
			this.tempArr.push(treeNodeParent);
		}
		this.showBlkParent(treeNodeParent)
	},
	showBlkParent:function(treeBlk){
		var treeParentNode = treeBlk.getPrevious();
		if(treeBlk.getParent() != this.container){
			var treeParentNodeParent = treeParentNode.getParent().getParent();
			this.tempArr.push(treeParentNode);
			this.tempArr.push(treeParentNodeParent);
			this.showBlkParent(treeParentNodeParent);
		}
		else{
			this.drawRoute(this.tempArr,null);
		}
	},
	drawRoute:function(arr,lastTreeNode){
		if(arr.length >= 2){
			var treeBlk = arr.pop();
			this.showDirectTreeNodes(treeBlk);
			if(lastTreeNode != null){
				treeBlk.setStyles({
					top:lastTreeNode.offsetTop
				})
			}
			var tempTreeNode = arr.pop();
			tempTreeNode.addClass(this.options.currentClass);
			this.drawRoute(arr,tempTreeNode);
		}
		else if(arr.length == 1){
			var treeBlk = arr.pop();
			treeBlk.setStyles({
				top:lastTreeNode.offsetTop
			})
			this.showDirectTreeNodes(treeBlk);
		}
	}
});
Tree.implement(new Events,new Options);
