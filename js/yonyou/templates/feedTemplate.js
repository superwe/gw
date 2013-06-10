// (function($, YY, util){
//     var feed = YY.feedTemplate;


// }(jQuery, YonYou, YonYou.util));
(function($, YY, util){
    /**
     * 动态模版
     * @required YY.util, YY.date
     * @type {{}}
     */
    var feed = YY.feedTemplate || {};

    /**
     * 动态--添加日程
     * @param  {[object]} data 传入的数据，对象字面量json格式;
     * @return {[string]}      返回拼接好的模版字符串;
     */
    feed.schedule_add = function(data){
        var ret = [];
        var schedule = data['schedule'],    // 日程信息
            partners = data['partners'],    // 参与人
            notifiers = data['notifiers'],  // 知会人
            reply = data['reply'],  // 回复
            space = data['space'],  // 空间信息
            isSelf = data['isSelf']; // 是否为自己

        ret.push('<h2 class=""><p class="fl"><a class="yy-schedule-detail" fromid="',schedule['id'],'" href="javascript:;">',schedule['title'],'</a></p>');
        // 日程页不显示屏蔽按钮
        if (data['module']!=='schedule') {
            ret.push('<a class="yy-feed-del fr ml5 hidden" href="javascript:;" title="屏蔽" for="',data['feed_id'],'"></a>');
        }
        var now_timestamp = (new Date()).getTime()/1000;
        // 日程状态开始
        if (schedule['endtime']<now_timestamp) {
            ret.push('<span class="fr icotime c9">已结束</span>');
        } else if(now_timestamp>=schedule['starttime']){
            ret.push('<span class="fr icotime c9">进行中</span>');
        } else {
            ret.push('<span class=" fr icotime">未开始</span>');
        }
        if (parseInt(schedule['isimportant'], 10)===1) {
            ret.push('<span class=" fr icostar">重要</span>');
        }
        ret.push('</h2><h2 class="clearfix c9 lh_20"><p class="fl" style="width:385px;"><a href="',
            /*个人主页URL*/util.url('/space/cons/index/id/'),schedule['creatorid'],'" class="blueLink yy-name" tips="1" rel="',
            /*人物卡片URL*/util.url('/api/ajax/partnerinfo/pid/'),schedule['creatorid'],'"><span class="fl">',
            schedule['name'],'</span></a><span class="ncIco fl rw_mc_wid2"><a href="',
            /*空间URL*/util.url('/group/index/index/gid/'),space['id'],'" class="c3Link" title="',
            space['name'],'">',space['name'],'</a></span></p></h2>');
        ret.push('<ul schedule-starttime="',schedule['starttime'],'" class="">');
        // 创建人
        ret.push('<li><b>创建人：</b><a href="',util.url('/space/cons/index/id/'),schedule['creatorid'],'">',schedule['name'],'</a></li>');
        // 参与人
        if (partners instanceof Array && partners.length) {
            ret.push('<li><b>参与人：</b>');
            $.each(partners, function(k, v){
                ret.push('<a href="',util.url('/space/cons/index/id/'),v['employeeid'],'">',v['name'],'</a>');
            });
            ret.push('</li>');
        }
        // 知会人
        if (notifiers instanceof Array && notifiers.length) {
            ret.push('<li><b>知会人：</b>');
            $.each(notifiers, function(k, v){
                ret.push('<a href="',util.url('/space/cons/index/id/'),v['employeeid'],'">',v['name'],'</a>');
            });
            ret.push('</li>');
        }
        // 日程时间
        var date_time = schedule['allday']
                ? YY.date.format(schedule['starttime'], 1)+'(全天)'
                : YY.date.format(schedule['starttime'], 5)+' - '+YY.date.format(schedule['endtime'], 5);
        ret.push('<li><b>日程时间：</b>',date_time,'</li>');
        // 地点
        if (schedule['address']) {
            ret.push('<li><b>地点：</b>',schedule['address'],'</li>');
        }
        // 通知方式
        if (schedule['remindway']) {
            var leadtime = schedule['leadtime'];
            ret.push('<li><b>通知方式：</b>日程开始前',(leadtime%60 ? leadtime+'分钟' : (leadtime/60)+'小时'),'以',
                (data['remindway']==='1' ? '邮件' : (data['remindway']==='2' ? '内部消息' : '邮件和内部消息')),'的形式通知</li>');
        }
        ret.push('</ul><div style="clear:both;"></div>');

        // 附件
        if (schedule['ishasfile']) {
            // @Todo 获取附件相关
        }

        // 状态、操作行
        ret.push('<ul class="detail-action-line"><li class="item"><p class="fl">',schedule['createtime'],' 来自');
        var client_type = parseInt(schedule['clienttype'],10);// 客户端类型
        switch(client_type){
            case 0:
                client_type = '网页';
                break;
            case 1:
                client_type = 'iPhone';
                break;
            case 2:
                client_type = 'Android';
                break;
            case 3:
                client_type = 'WinPhone';
                break;
            default:
                client_type = '桌面端';
                break;
        }
        ret.push(client_type,'</p><div class=""><a href="javascript:;" class="yy-reply"><span class="yy-feedReplySpan">回复(',
            reply,')</span><span class="colorSj colorTsj hidden"></span><span class="colorSj colorTsjin hidden"></span></a>',
            (isSelf ? '<a class="yy-edit-active" fromid="'+schedule['id']+'" href="javascript:;">编辑</a><a href="javascript:;" fromid="'+schedule['id']+'" type="105" end="'+schedule['endtime']+'" start="'+schedule['starttime']+'" class="yy-delete">删除</a>' : ''),// yy-feedDel
            '</div></li></ul>');

        return ret.join('');
    }

}(jQuery, YonYou, YonYou.util));