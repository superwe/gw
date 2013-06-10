/*********************
//2010-12-18 梦三秋
//http://www.skygq.com
*********************/
/*********************
//modified by Heero.Yu
*********************/
;(function($){
	$.fn.slidemenu = function(settings){
		var defaultSettings = {
			arrowDownImage	: ['downarrowclass', 'images/down.gif', 23],//菜单向下箭头图片设置，数组的第一个代表css的class，第二个代表箭头图片的路径，第三个代表padding-right的数值
			arrowRightImage	: ['rightarrowclass', 'images/right.gif'], // 菜单向右箭头图片设置，数组的第一个代表css的class，第二个代表箭头图片的路径，不需要第三个值
			SUtime			: 300,//鼠标放到菜单上，下拉菜单向下滑动的时间 单位 毫秒
			SDtime			: 300//鼠标移出菜单时，下拉菜单向上收起的时间 单位 毫秒
		}
		settings = $.extend(defaultSettings,settings);
		return this.each(function(){
			var $mainmenu = $(this).find("ul").eq(0);
			var $headers=$mainmenu.find("ul").parent();
			$headers.each(function(i){
				var $curobj=$(this)
				var $subul=$(this).find('ul:eq(0)')
				this._dimensions={w:this.offsetWidth, h:this.offsetHeight, subulw:$subul.outerWidth(), subulh:$subul.outerHeight()};
				this.istopheader=$curobj.parents("ul").length==1? true : false;
				$subul.css({top:this.istopheader? this._dimensions.h+"px" : 0})
				$curobj.children("a:eq(0)").css(this.istopheader? {paddingRight: settings.arrowDownImage[2]} : {}).append(
					'<img src="'+ (this.istopheader? settings.arrowDownImage[1] : settings.arrowRightImage[1])
					+'" class="' + (this.istopheader? settings.arrowDownImage[0] : settings.arrowRightImage[0])
					+ '" style="border:0;" />'
				)
				$curobj.hover(
					function(e){
						var $targetul=$(this).children("ul:eq(0)")
						this._offsets={left:$(this).offset().left, top:$(this).offset().top}
						var menuleft=this.istopheader? 0 : this._dimensions.w
						menuleft=(this._offsets.left+menuleft+this._dimensions.subulw>$(window).width())? (this.istopheader? -this._dimensions.subulw+this._dimensions.w : -this._dimensions.w) : menuleft
						if ($targetul.queue().length<=1) //if 1 or less queued animations
							$targetul.css({left:menuleft+"px", width:this._dimensions.subulw+'px'}).slideDown(settings.SUtime)
					},
					function(e){
						var $targetul=$(this).children("ul:eq(0)")
						$targetul.slideUp(settings.SDtime)
					}
				) //end hover
				$curobj.click(function(){
					$(this).children("ul:eq(0)").hide()
				})
			}) //end $headers.each()
			$mainmenu.find("ul").css({display:'none', visibility:'visible'})
		});
	}
})(jQuery);