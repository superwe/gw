// 停止音乐flash
function stopMusic(preID, playerID) {
    var musicFlash = preID.toString() + '_' + playerID.toString();
    if(document.getElementById(musicFlash)) {
        document.getElementById(musicFlash).SetVariable('closePlayer', 1);
    }
}
// 显示影视、音乐flash
function showFlash(host, flashvar, obj, shareid, type,option) { //type参数是针对分享组件里的视频添加的，其他模块用不到
    option = option||{};
    var height = option.height||480,
        width = option.width||750;

    if(type == 'share_video'){
        if(obj.nextSibling){
             if(obj.nextSibling.tagName == undefined){   //点击的播放按钮
                obj.style.display = 'none';
                var obj = obj.previousSibling;
            } else {
                obj.nextSibling.style.display = 'none';
            }
        }
        obj.parentNode.nextSibling.style.display = 'none';
    } else {
        type = '';
    }
	var host_url = "http://gw.com";
    var flashAddr = {
        'youku.com' : 'http://player.youku.com/player.php/sid/FLASHVAR=/v.swf',
        'v.ku6.com' : 'http://player.ku6.com/refer/FLASHVAR/v.swf',
        'tudou.com': 'http://www.tudou.com/v/' + flashvar +'/v.swf',
        'youtube.com' : 'http://www.youtube.com/v/FLASHVAR',
        '5show.com' : 'http://www.5show.com/swf/5show_player.swf?flv_id=FLASHVAR',
        'sina.com.cn' : 'http://vhead.blog.sina.com.cn/player/outer_player.swf?vid=FLASHVAR',
        'sohu.com' : 'http://v.blog.sohu.com/fo/v4/FLASHVAR',
        'mofile.com' : 'http://tv.mofile.com/cn/xplayer.swf?v=FLASHVAR',
        'music' : 'FLASHVAR',
        'flash' : 'FLASHVAR',
        'video' : 'FLASHVAR'
    };
    var flash = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,19,0" width="480" height="400">'
        + '<param name="wmode" value="transparent">'
        + '<param name="movie" value="FLASHADDR" />'
        + '<param name="quality" value="high" />'
        + '<param name="bgcolor" value="#FFFFFF" />'
        + '<embed width="'+width+'" height="'+height+'" menu="false" quality="high" src="FLASHADDR" type="application/x-shockwave-flash" />'
        + '</object>';
    var videoFlash = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+width+'" height="'+height+'">'
        + '<param value="transparent" name="wmode"/>'
        + '<param value="true" name="play"/>'
        + '<param value="FLASHADDR" name="movie" />'
        + '<embed src="FLASHADDR" wmode="transparent" allowfullscreen="true" type="application/x-shockwave-flash" width="'+width+'" height="'+height+'"></embed>'
        + '</object>';
    var musicFlash = '<object id="audioplayer_SHAREID" height="24" width="290" data="'+host_url+'/js/yonyou/widgets/flashplayer/player.swf" type="application/x-shockwave-flash">'
        + '<param name="wmode" value="transparent">'
        + '<param value="' + host_url +'/js/yonyou/widgets/flashplayer/player.swf" name="movie"/>'
        + '<param value="autostart=yes&bg=0xCDDFF3&leftbg=0x357DCE&lefticon=0xF2F2F2&rightbg=0xF06A51&rightbghover=0xAF2910&righticon=0xF2F2F2&righticonhover=0xFFFFFF&text=0x357DCE&slider=0x357DCE&track=0xFFFFFF&border=0xFFFFFF&loader=0xAF2910&soundFile=FLASHADDR" name="FlashVars"/>'
        + '<param value="high" name="quality"/>'
        + '<param value="false" name="menu"/>'
        + '<param value="#FFFFFF" name="bgcolor"/>'
        + '</object>';
    var musicMedia = '<object height="64" width="290" data="FLASHADDR" type="audio/x-ms-wma">'
        + '<param value="FLASHADDR" name="src"/>'
        + '<param value="1" name="autostart"/>'
        + '<param value="true" name="controller"/>'
        + '</object>';
    var video = '<embed width="'+width+'" wmode="transparent" height="'+height+'" flashvars="autostart=false&amp;file=FLASHADDR&amp;width='+width+'&amp;height='+height+'" allowfullscreen="true" quality="high" name="playlist" id="playlist" style="" src="' + host_url + '/js/yonyou/widgets/flashplayer/FlvPlayer201002.swf" type="application/x-shockwave-flash"/>';
    var flashHtml = videoFlash;
    var videoMp3 = true;
    if('' == flashvar) {
        alert('音乐地址错误，不能为空');
        return false;
    }
    if('music' == host) {
        var mp3Reg = new RegExp('.mp3$', 'ig');
        var flashReg = new RegExp('.swf$', 'ig');
        flashHtml = musicMedia;
        videoMp3 = false;
        var isVideoMp3 = mp3Reg.test(flashvar);
        var isOtherMp3 = flashReg.test(flashvar);
        if(isVideoMp3) {
            videoMp3 = true;
            flashHtml = musicFlash;
        } else if(isOtherMp3) {
            videoMp3 = true;
            flashHtml = flash;
        }
    }
    if('video' == host) {
        var flashReg = new RegExp('.flv$', 'ig');
        videoMp3 = true;
        flashHtml = video;
    }
    flashvar = encodeURI(flashvar);
    if(flashAddr[host]) {
        var flash = flashAddr[host].replace('FLASHVAR', flashvar);
        flashHtml = flashHtml.replace(/FLASHADDR/g, flash);
        flashHtml = flashHtml.replace(/SHAREID/g, shareid);
    }
    
    if(!obj) {
        $('#flash_div_' + shareid).html(flashHtml);
        return true;
    }
    if($('#flash_div_' + shareid).length > 0) {
        $('#flash_div_' + shareid).show();
        $('#flash_hide_' + shareid).show();
        obj.style.display = 'none';
        return true;
    }
    if(flashAddr[host]) {
        var flashObj = document.createElement('div');
        flashObj.id = 'flash_div_' + shareid;
        /*flashObj.style.backgroundColor  = "#F0F0F0";
        flashObj.style.padding = 3+"px";      //DIV上边距*/
        flashObj.innerHTML = flashHtml;
        obj.parentNode.insertBefore(flashObj, obj);
        $(obj).hide();
        var hideObj = document.createElement('div');
        hideObj.id = 'flash_hide_' + shareid;
        var nodetxt = document.createTextNode("关闭");
        if(!option){
            hideObj.appendChild(nodetxt);
        }
        obj.parentNode.insertBefore(hideObj, obj);
        hideObj.style.cursor = 'pointer';
        hideObj.onclick = function() {
            if(true == videoMp3) {
                stopMusic('audioplayer', shareid);
                flashObj.parentNode.removeChild(flashObj);
                hideObj.parentNode.removeChild(hideObj);
            } else {
                $(flashObj).hide();
                $(hideObj).hide();
            }
            $(obj).show();
            $(obj).show();
            if(type == 'share_video'){
                if(obj&&obj.parentNode&&obj.parentNode.nextSibling){
                    if(obj.parentNode.nextSibling.tagName != undefined)
                    obj.parentNode.nextSibling.style.display = '';
                }
            }
            //obj.parentNode.nextSibling.style.display = '';
        }
    }
}