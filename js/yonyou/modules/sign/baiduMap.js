var markerNew = {};
var map = new BMap.Map("signMapContainer");//创建地图实例
map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);//初始化地图,设置中心点坐标和地图级别
map.addControl(new BMap.NavigationControl());//添加平移缩放控件
map.enableScrollWheelZoom();//启用滚轮放大缩小
//map.addControl(new BMap.ScaleControl());//添加比例尺控件
//map.addControl(new BMap.OverviewMapControl());//添加缩略地图控件
//map.addControl(new BMap.MapTypeControl());//添加地图类型控件
map.setCurrentCity("北京");//设置地图显示的城市 此项是必须设置的
//map.removeOverlay();//重置地图标注信息

//添加标注
function addMarker(obj){
    //加入自定义的图像
    var myIcon = null;
    if(obj.signId == obj.currentId){
        myIcon = new BMap.Icon(obj.tubiao,new BMap.Size(27,36));
    } else{
        myIcon = new BMap.Icon(obj.tubiao,new BMap.Size(20,32));//红色（23 31）
    }
    var marker = new BMap.Marker(obj.point,{icon:myIcon});
    if(obj.signId == obj.currentId){
        marker.setTop({isTop:true});
    }
    markerNew[obj.id] = marker;
    map.addOverlay(marker);
    //自定义html,含有图像
    var myContent = "<div class='mapLayer'><div class='employeeInfo'><div class='grid avatar'>"+
        "<img src='"+obj.avatar+"'><p><a href='/space/cons/index/id/"+obj.employeeid+"' target='_blank'>"+obj.name+"</a></p></div>"+
        "<div class='grid address'><a href='javascript:;' class='floatL'><span class='floatL'>在</span>"+obj.address+"</a></div></div>"+
        "<p class='signTimeInfo'><span class='floatL'>"+obj.signtime+"</span><span class='floatR'>签到</span></p>"+
        "</div>";
    //alert(myContent);
    var infoWindow = new BMap.InfoWindow(myContent);//创建信息窗口对象
    if(obj.signId == obj.currentId){
        marker.openInfoWindow(infoWindow);
    }
    marker.addEventListener("click", function(){
        this.openInfoWindow(infoWindow);
    });
}

//设置标注
function setMarker(obj){
    var mymarker = markerNew[obj.id];
    map.removeOverlay(mymarker);
    //加入自定义的图像
    var myIcon = null;
    if(obj.signId == obj.currentId){
        myIcon = new BMap.Icon(obj.tubiao,new BMap.Size(27,36));
    } else{
        myIcon = new BMap.Icon(obj.tubiao,new BMap.Size(20,32));//红色（23 31）
    }
    mymarker.setIcon(myIcon);
    if(obj.signId == obj.currentId){
        mymarker.setTop(true);
    } else{
        mymarker.setTop(false);
    }
    map.addOverlay(mymarker);
    //自定义html,含有图像
    var myContent = "<div class='mapLayer'><div class='employeeInfo'><div class='grid avatar'>"+
        "<img src='"+obj.avatar+"'><p><a href='/space/cons/index/id/"+obj.employeeid+"' target='_blank'>"+obj.name+"</a></p></div>"+
        "<div class='grid address'><a href='javascript:;' class='floatL'><span class='floatL'>在</span>"+obj.address+"</a></div></div>"+
        "<p class='signTime'><span class='floatL'>"+obj.signtime+"</span><span class='floatR'>签到</span></p>"+
        "</div>";
    //alert(myContent);
    map.centerAndZoom(obj.point, 11);
    var infoWindow = new BMap.InfoWindow(myContent);  // 创建信息窗口对象
    if(obj.signId == obj.currentId){
        mymarker.openInfoWindow(infoWindow);
    }
    mymarker.addEventListener("click", function(){
        this.openInfoWindow(infoWindow);
    });
}