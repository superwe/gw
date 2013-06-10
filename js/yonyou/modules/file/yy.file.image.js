var fileImage = function (){
	var me = this;
	me.clear = '';

	
	
	me.hideTiShi = function(e){
		var obj = $(e.target);
		me.clear = setTimeout(function (){
			obj.closest('.image_group').next().hide();
		}, 1000);
	}
	
	me.showTiShi = function(e){
		clearTimeout(img.clear);
		$("#imageList").find(".pic_tishi").hide() ;
		var obj = $(e.target);
		obj.closest('.image_group').next().show();
	}
};

if(typeof fileImage != "undefined"){
	img = new fileImage();
}
$(document).ready(function(){
	var imageList= $("#imageList").find(".image_group");
	imageList.live({
		mouseenter : img.showTiShi,
		mouseleave : img.hideTiShi
	});
	
	$("#imageList").find(".pic_tishi").live({
		mouseenter: function (e){
			clearTimeout(img.clear);
			$("#imageList").find(".pic_tishi").hide() ;
			$(e.target).closest(".pic_tishi").show();
		},
		mouseleave: function (e){
			img.clear = setTimeout(function (){
				$(e.target).closest(".pic_tishi").hide();
			}, 1000);
		}
	});
	
	$("a.image_group").fancybox({
        'transitionIn'  :   'elastic',
        'transitionOut' :   'elastic',
        'speedIn'       :   200, 
        'speedOut'      :   200, 
        'overlayShow'   :   true,
        'showNavArrows' :   true
    });
});