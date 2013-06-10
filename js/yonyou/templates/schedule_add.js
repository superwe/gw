(function($, YY, util){
    var feed = YY.feedTemplate;

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
            group = data['group'],  // 群组
            object_type = data['object_type'], // 对象类型
            isSelf = data['isSelf']; // 是否为自己

        var schedule_url = util.url('/employee/calendar/index#scheduleid=')+schedule['id'];
        ret.push('<div class="all container feed-section" style="width:608px;" employeeid="'+data.creatorid+'" resource-id="'+parseInt(data.feedid)+'">');
        ret.push('<h2 class="clearfix c9 lh_20"><p class="fl" style="width:385px;"><a class="blueLink f14 fontB" href="',schedule_url,'">',schedule['title'],'</a></p>');
        // 日程页不显示屏蔽按钮
        if (data['module']!=='schedule') {
            ret.push('<a class="yy-feed-del fr ml5 hidden" href="javascript:;" title="屏蔽" for="',data['feed_id'],'"></a>');
        }
        var now_timestamp = (new Date()).getTime();
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
            /*群组URL*/util.url('/group/index/index/gid/'),group['id'],'" class="c3Link" title="',
            group['name'],'">',group['name'],(group['ispub'] ? '' : '<span class="icoSuo_red"></span>'),'</a></span></p></h2>');
        ret.push('<ul schedule-starttime="',schedule['starttime'],'" class="">');
        // 创建人
        ret.push('<li><b>创建人：</b><a href="',util.url('/space/cons/index/id/'),schedule['creatorid'],'">',schedule['name'],'</a></li>');
        // 参与人
        if (partners instanceof Array) {
            ret.push('<li><b>参与人：</b>');
            $.each(partners, function(k, v){
                ret.push('<a href="',util.url('/space/cons/index/id/'),v['employeeid'],'">',v['name'],'</a>');
            });
            ret.push('</li>');
        }
        // 知会人
        if (notifiers instanceof Array) {
            ret.push('<li><b>知会人：</b>');
            $.each(notifiers, function(k, v){
                ret.push('<a href="',util.url('/space/cons/index/id/'),v['employeeid'],'">',v['name'],'</a>');
            });
            ret.push('</li>');
        }
        var date_time = '';
        if (schedule['allday']) {
            date_time = YY.date.format(schedule['starttime'], 1)+'(全天)';
        } else {
            date_time = YY.date.format(schedule['starttime'], 5)+' - '+YY.date.format(schedule['endtime'], 5);
        }
        // 日程时间
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
        ret.push('<ul  style="*height:22px;"><li class="mt5 gzContRighta c9a clearfix clear rc_timeTk"><p class="fl c6">',
            schedule['createtime'],' 来自<a class="blueLink2" href="',util.url('/space/home/index'),'">',group['name'],'</a>');

        var clientArr = ['网页', 'iPhone', 'Android', 'WinPhone', '桌面端'],
            client_type = parseInt(schedule['clienttype'],10);
        ret.push(clientArr[client_type],'</p><div class="fr mt5 gzFy02 z5 yy-feedOp"><a href="javascript:;" class="blueLink2 yy-reply"><span class="yy-feedReplySpan">回复(',
            reply['num'],')</span><span class="colorSj colorTsj hidden"></span><span class="colorSj colorTsjin hidden"></span></a>',
            (data['permission'] ? '<a class="blueLink2" href="'+schedule_url+'">编辑</a><a href="javascript:;" class="blueLink2 yy-feedDel" style="*width: 65px;">删除</a>' : ''),
            '</div></li></ul>');
        ret.push('</div>')
        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));
/**
 * data参数样板格式：
 *
 * data{
 *     'schedule_url': '',
 *     'schedule_title': '',
 *     'schedule_module': 'schedule',
 *     'feed_id': 20,
 *     'endtime': 5456465,
 *     'starttime': 564564564,
 *     'important': 1,
 *     'member_id': 1
 *     'employee_name': '',
 *     'group_id': 1,
 *     'group_name': '',
 *     'ispub': true,
 *     'partners': [{'id':1,'name':'邱韬'}],
 *     'notifiers': [{'id':1,'name':'邱韬'}],
 *     'allday':true,
 *     'date_time': '',
 *     'address': '',
 *     'noticetype': '',
 *     'uppertime': '',
 *     'unittype': '',
 *     'create_time': '',
 *     'space_name': '',
 *     'client_type': 0,
 *     'followstatus': 1,
 *     'replyNum': 3,
 *     'edit_permission': true,
 *     'object_type': '',
 *     'scheduleid': 1,
 *     'doid': 1,
 *     'delete_permission': true
 * }
 * 
 */

 /*
 data{
    'schedule': {
        'id': 18,
        'title': '到了房交会上雕刻技法',
        'address': '',
        'content': '',
        'starttime': 1366340400,
        'endtime': 1366365600,
        'creatorid': 47,
        'createtime': '2013-04-21 13:04:44',
        'isimportant': 0,
        'remindway': '',
        'leadtime': 0,
        'ishasfile': 0,
        'fromtype': 0,
        'clienttype': 0,
        'name': '邱韬',
        'allday': false
    },
    'partners': [
        {'employeeid': 2, 'role': 0, 'status': 0, 'name': ''}
    ],
    'notifiers': [],
    'group': {
        'id': 1,
        'name': '群组',
        'ispub': true
    },
    'reply': {
        'num': 0
    },
    'object_type': 25,
    'permission': true,
    'isSelf': true,
    'module': 'schedule',
    'feed_id': 123
 }
 */