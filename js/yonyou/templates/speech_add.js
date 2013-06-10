(function($, YY, util){
    var feed = YY.feedTemplate;

    /**
 * 动态--发言
 * @param  {[object]} data 传入的数据，对象字面量json格式;
 * @return {[string]}      返回拼接好的模版字符串;
 */
    feed.speech_add = function(data){

        var ret = [];
        var speech = data['speech'],    // 发言详情
            viewerId = data['viewerId'],   //当前浏览人
            originalData = data['originalData'],
            imageList = data['imageList'],    // 图片附件
            fileList = data['fileList'],    // 文件附件
            islike = data['islike'],    //是否喜欢
            isfavor = data['isfavor'];  // 是否收藏

        var clientArr = ['网页', 'iPhone', 'Android', 'WinPhone', '桌面端'],
            client_type = parseInt(speech['clienttype'],10);

        var createtime = YY.date.format2(speech.createtime);

        var imageurl = speech.imageurl ? speech.imageurl+".thumb.jpg" : 'http://static.yonyou.com/qz/default_avatar.thumb.jpg';

        ret.push('<div class="all container user_card speechdiv feed-section" employeeid="'+data.creatorid+'" resource-id="'+parseInt(data.feedid)+'">');
        ret.push('<div class="grid" style="width: 40px;">');
            ret.push('<a tips="1" href ="/employee/homepage/index/'+speech.employeeid+'.html"  rel="/employee/employee/cardInfo/'+speech.employeeid+'">');
                ret.push('<img class="headPhoto" src="'+imageurl+'"  title="'+speech.employeename+'" onerror="imgError(this);" rel="http://staticoss.chanjet.com/qiater/default_avatar.thumb.jpg">');
            ret.push('</a>');
        ret.push('</div> ');

        ret.push('<div class="grid speechInfo" >');
        ret.push('<a  href="/employee/homepage/index/'+speech.employeeid+'.html" tips="1" rel ="'+'/employee/employee/cardInfo/'+speech.employeeid+'" class="ename">'+speech.employeename+'</a>');
        if(speech['privacytype'] != '0'){ //私密发言
            ret.push('<a class="group">私密@</a>');
            ret.push('<a class="secretLogo"></a> ');
            //
        }
        else{
            var groupurl = speech.groupid == 0  ? 'javascript:;' : '/employee/group/index?id='+speech.groupid;
            ret.push('<a href="'+groupurl+'" class="group">'+speech.groupname+'</a>');
        }
        ret.push('<a class="pingbi" style="display: none;"></a>');

        // 发言内容
        ret.push('<div class="speechContent">'+speech.content+'</div>')

        //转发内容
        if(speech.originalid != "0"){
            var originalSpeech = originalData['speech'],          //转发自的发言内容
                originalImageList = originalData['imageList'],    // 图片附件
                originalFileList = originalData['fileList'];      // 文件附件
            var original_client_type = parseInt(originalSpeech['clienttype'],10);  //来源
            var originalCreatetime = YY.date.format2(originalSpeech.createtime); //创建时间

            ret.push('<div class="pl-box relative">')
                ret.push('<i class="ico-pl-sj"></i>')

                ret.push('<div class="originalSpeechInfo" >');
                    ret.push('<a tips="1" rel ="'+'/employee/employee/cardInfo/'+originalSpeech.employeeid+'" class="ename">'+originalSpeech.employeename+'</a>');
                    var originalGroupurl = originalSpeech.groupid == 0  ? 'javascript:;' : '/employee/group/index?id='+originalSpeech.groupid;
                    ret.push('<a href="'+originalGroupurl+'" class="group">'+originalSpeech.groupname+'</a>');
                    ret.push('<a class="pingbi" style="display: none;"></a>');
                    // 发言内容
                    ret.push('<div class="speechContent">'+originalSpeech.content+'</div>')
                    //附件相关
                    if (originalSpeech['ishasfile']) {
                        if(originalFileList.length > 0){ //文件附件
                            ret.push(feed.attachment(originalFileList));
                        }
                        if(originalImageList.length > 0){  //图片附件
                            ret.push(feed.pic(originalImageList));
                        }
                    }
                    ret.push('<div class="speechFooter">');
                        ret.push('<div class="timeAndFrom">'+originalCreatetime+' 来自 '+clientArr[original_client_type]+'</div>');
                        ret.push('<div class="operation">');
                            ret.push('<a id="turnSpeech">转发('+originalSpeech.turnnum+')</a>');
                            ret.push('<a id="replySpeech">回复('+originalSpeech.replynum+')</a>');
                        ret.push('</div>');
                    ret.push('</div>');
                ret.push('</div>');
            ret.push('</div>');
        }
        else{
            //附件相关
            if (speech['ishasfile']) {

                if(fileList.length > 0){ //文件附件
                    ret.push(feed.attachment(fileList));
                }

                if(imageList.length > 0){  //图片附件
                    ret.push(feed.pic(imageList));
                }
            }
        }

        ret.push('<div class="speechFooter">');
        ret.push('<div class="timeAndFrom">'+createtime+' 来自 '+clientArr[client_type]+'</div>');
        ret.push('<div class="operation">');
        if(speech.privacytype == "0"){
            ret.push('<a href="javascript:;" class="oplist_turn" targetid="'+speech.id+'" module="103">转发('+speech.turnnum+')</a>');
        }
        ret.push('<a href="javascript:;" class="oplist_reply" targetid="'+speech.id+'" module="103">回复('+speech.replynum+')</a>');

        if(viewerId != speech.employeeid)
        {
            if(islike){
                ret.push('<a href="javascript:;" class="oplist_cancel_like"  feedid ="'+data.feedid+'"  targetid="'+speech.id+'" module="103">取消喜欢</a>');
            }
            else{
                ret.push('<a href="javascript:;" class="oplist_like" feedid ="'+data.feedid+'" groupid ="'+speech.groupid+'" targetid="'+speech.id+'" module="103">喜欢</a>');
            }
            if(isfavor){
                ret.push('<a href="javascript:;" class="oplist_cancel_favor" feedid ="'+data.feedid+'" targetid="'+speech.id+'" module="103">取消收藏</a>');
            }
            else{
                ret.push('<a href="javascript:;" class="oplist_favor" feedid ="'+data.feedid+'" groupid ="'+speech.groupid+'"  targetid="'+speech.id+'" module="103">收藏</a>');
            }
        }
        else{
            ret.push('<a href="javascript:;" class="oplist_delete" feedid ="'+data.feedid+'"  targetid="'+speech.id+'" module="103">删除</a>');
        }
        ret.push('<a href="javascript:;" class="oplist_view" targetid="'+speech.id+'" module="103">查看会话</a>');
        ret.push('</div>');
        ret.push('</div>');
        ret.push('</div>');
        ret.push('</div>');

        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));

/*  data数据格式
 {
 fileList:-[
         0:-{
         ext:"doc",
         id:"170",
         title:"11.5文档的1.doc"
         }
 ],
 imageList:-[
         0:-{
         filepath:"http://static.yonyou.com/qz/201305/7/1367914831xz3R.jpg",
         id:"256",
         view:""
         }
 ],
 isfavor:0,
 islike:0,
 speech:-{
         clienttype:"12",
         content:"该方法执行成功时将记录集作为关联数组返回。李胜 1",
         createtime:"2013-04-25 13:34:53",
         employeeid:"2",
         employeename:"李胜",
         groupid:"32",
         groupname:"group 1",
         ishasfile:"1",
         originalid:"0",
         privacytype:"1",
         replynum:"3",
         turnnum:"2"
 },
 viewerId:"2"
 }
 */