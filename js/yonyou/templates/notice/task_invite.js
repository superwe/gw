(function($, YY, util){
    var notice = YY.noticeTemplate;
    /**
     * 动态--添加任务
     * @param  {[object]} data 传入的数据，对象字面量json格式;
     * @return {[string]}      返回拼接好的模版字符串;
     */
    notice.task_invite = function(data){
        var ret = [],
            isnew = '',
            newCalss = 'messageRead';
        if(data.isnew == 1){
            isnew = 'new';
            newCalss = 'newRemind';
        }
        userList = data.userList;
        ret.push('<div class="message relative notice-section '+isnew+'" resource-id="'+parseInt(data.noticeid)+'">');
        ret.push('<div class="'+newCalss+'"><span></span></div>');
        ret.push('<div class="newMessageR">');
        ret.push('<div class="clearfix user_card content_title">');
        ret.push('<span class="gg_ico fl"></span><a target="_blank" href="/employee/myhomepage/index/'+data.authorid+'.html" tips="1" rel ="/employee/employee/cardInfo/'+data.authorid+'">'+data.authorname+'</a> 邀请您'+data.createtime+'负责（参与）任务"'+data.title+'"');
        ret.push('</div>');
        if(parseInt(data.tpstatus) > 0){
            ret.push('<div name="_t_'+data.id+'" class="clearfix content">');
            ret.push('    <p>');
            ret.push('    <input type="button" data="'+data.id+'" name="acceptTask" class="button button_blue" value="接受">');
            ret.push('    <input type="button" data="'+data.id+'" name="refuseTask" class="button button_gray" value="拒绝">');
            ret.push('    </p>');
            ret.push('</div>');
        }

        ret.push('        <div class="clearfix content user_card" style="border-bottom: 1px solid #E2E2E2;">');
        ret.push('            <div class="clearfix">');
        ret.push('                <figure class="fl">');
        ret.push('                    <a target="_blank" href="/employee/myhomepage/index/'+data.creatorid+'.html" tips="1" rel ="/employee/employee/cardInfo/'+data.creatorid+'"><img title="'+data.creatorname+'" alt="" src="http://static.yonyou.com/'+data.imageurl+'" onerror="imgError(this);" rel="http://static.yonyou.com/qz/default_avatar.thumb.jpg"></a>');
        ret.push('                  </figure>');
        ret.push('                    <section class="fl right">');
        ret.push('                        <h2 class="clearfix" style="line-height: 16px;">');
        ret.push('                            <a target="_blank" class="fontB f14" href="/employee/task/info?tid='+data.id+'">'+data.title+'</a>');
        ret.push('                        </h2>');
        ret.push('                        <h2 class="clearfix">');
        ret.push('                            <a target="_blank" href="'+data.creatorid+'" class="blueLink">'+data.creatorname+'</a><img src="/images/group1.png"><span>'+data.spacename+'</span>');
        ret.push('                       </h2>');
        ret.push('                           <ul class="pl5">');
        ret.push('                                <li><strong>负责人：</strong>');
        if(userList.manage !== undefined){
            $.each(userList.manage, function(k, v){
                ret.push('<a href="/employee/myhomepage/index/'+k+'.html" tips="1" rel ="/employee/employee/cardInfo/'+k+'">',v,'</a>');
            });
        }
        ret.push('                               </li>');
        if(userList.join !== undefined){
            ret.push('<li><strong>参与人：</strong>');
            $.each(userList.join, function(k, v){
                ret.push('<a href="/employee/myhomepage/index/'+k+'.html" tips="1" rel ="/employee/employee/cardInfo/'+k+'">',v,'</a>');
            });
            ret.push('</li>');
        }

        if(userList.notice !== undefined){
            ret.push('<li><strong>知会人：</strong>');
            $.each(userList.notice, function(k, v){
                ret.push('<a href="/employee/myhomepage/index'+k+'.html" tips="1" rel ="/employee/employee/cardInfo/'+k+'">',v,'</a>');
            });
            ret.push('</li>');
        }

        ret.push('                               <li><strong>开始时间：</strong>'+data.createtime+'&nbsp;&nbsp;&nbsp;');
        if(data.expectendtime){
            ret.push('<strong>结束时间：</strong> ' + data.expectendtime);
        }else{
            ret.push('(尽快完成)');
        }
        ret.push('</li>');
        //
        var remindtimetype = parseInt(data.remindtimetype);
        if(remindtimetype > 0){
            ret.push('<li><strong>提醒方式：</strong>');
            if(remindtimetype == 1){
                ret.push('任务开始和结束前');
            }else if(remindtimetype == 2){
                ret.push('任务开始前');
            }else{
                ret.push('任务结束前');
            }
            ret.push(parseInt(data.leadtime) + '分钟 以');
            var remindway = parseInt(data.remindway);
            if(remindway == 1){
                ret.push('消息');
            }else if(remindway == 2){
                ret.push('邮件');
            }else{
                ret.push('邮件和消息');
            }
        }
        ret.push('                       &nbsp; &nbsp; <span class="ml10">回复</span><a target="_blank" href="/employee/task/info?tid='+data.id+'">'+data.replyNum+'</a>&nbsp; &nbsp; <span>附件</span><a target="_blank" href="/employee/task/info?tid='+data.id+'">'+data.fileId.length+'</a></li>');
        ret.push('                          </ul>');
        ret.push('                       </section>');
        ret.push('                   </div>');
        ret.push('               </div>');
        ret.push('               <p class="messageView"><a target="_blank" class="blueLink" href="/employee/task/info?tid='+data.id+'">查看任务&gt;&gt;</a></p>');
        ret.push('              <time>'+ YY.date.format2(data.createtime) +'</time>');
        ret.push('          </div>');
        ret.push('        </div>');
        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));

