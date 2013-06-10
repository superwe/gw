(function($, YY, util){
    var feed = YY.feedTemplate;
    /**
     * 动态--添加任务
     * @param  {[object]} data 传入的数据，对象字面量json格式;
     * @return {[string]}      返回拼接好的模版字符串;
     */
     feed.task_add = function(data){
        var ret = [];
        var tid = parseInt(data.id),
            userList = data.userList;
        ret.push('<div class="all container feed-section" employeeid="'+data.creatorid+'" resource-id="'+parseInt(data.feedid)+'">');
        ret.push('<div style="width: 40px;" class="grid center user_card"><a href="/employee/homepage/index/'+data.creatorid+'.html" tips="1" rel ="/employee/employee/cardInfo/'+data.creatorid+'"><img src="http://staticoss.chanjet.com/qiater/'+data.creatorimg+'" class="headPhoto" onerror="imgError(this);" rel="http://staticoss.chanjet.com/qiater/default_avatar.thumb.jpg"></a></div>');
        ret.push('<div class="feeddetail grid">');
        ret.push('<h3>');
        ret.push('<a class="title" href="/employee/task/info?tid='+tid+'">'+data.title+'</a>');
        if(parseInt(data.parentid) > 0){
            ret.push('  >> 上级任务 <a href="/employee/task/info?tid='+data.parentid+'">'+data.parenttitle+'</a>');
        }
        ret.push('<br><a class="name" href="/employee/myhomepage/index.html">'+data.creatorname+'</a>');
        ret.push('<img src="/images/group1.png"><a class="space" href="/employee/home/index.html">'+data.spacename+'</a>')
        if(data.status != 2){
            ret.push('<span class="status"><img src="/images/stateIcon_clock.png">'+data.tastStatus+'</span>');
        }
        if(parseInt(data.isimportant) > 0){
            ret.push('<span class="status icostar">重要</span>');
        }
        if(parseInt(data.tpstatus) > 0){
            ret.push('<span class="opbutton" name="_t_'+tid+'">');
            ret.push('<a class="button acceptbutton" name="acceptTask" data="'+tid+'">接受</a>');
            ret.push('<a class="button refusebutton" name="refuseTask" data="'+tid+'">拒绝</a>');
            ret.push('</span>');
        }
        ret.push('</h3>');
        ret.push('<table cellspacing="0" cellpadding="0" rules="groups" class="content user_card">');
        ret.push('<tbody><tr><td class="prompt">负责人：</td><td>');
        $.each(userList.manage, function(k, v){
            ret.push('<a href="/employee/homepage/index/'+k+'.html" tips="1" rel ="/employee/employee/cardInfo/'+k+'">',v,'</a>');
        });
        ret.push('</td> </tr>');
         if(userList.join !== undefined){
            ret.push('<tr><td class="prompt">参与人：</td><td>');
            $.each(userList.join, function(k, v){
                ret.push('<a href="/employee/homepage/index/'+k+'.html" tips="1" rel ="/employee/employee/cardInfo/'+k+'">',v,'</a>');
            });
            ret.push('</td> </tr>');
         }

         if(userList.notice !== undefined){
            ret.push('<tr><td class="prompt">知会人：</td><td>');
            $.each(userList.notice, function(k, v){
                ret.push('<a href="/employee/homepage/index/'+k+'.html" tips="1" rel ="/employee/employee/cardInfo/'+k+'">',v,'</a>');
            });
            ret.push('</td> </tr>');
         }

        ret.push('<tr><td class="prompt">任务时间：</td><td>');
        if(data.expectendtime){
            ret.push(data.starttime + '--' + data.expectendtime);
        }else{
            ret.push('尽快完成');
        }
        ret.push('</td> </tr>');
        ret.push('<tr><td class="prompt">创建时间：</td><td>'+data.createtime+'</td> </tr>');
        var remindtimetype = parseInt(data.remindtimetype);
        if(remindtimetype > 0){
            ret.push('<tr><td class="prompt">提醒方式：</td><td>');
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
            ret.push('的形式通知</td> </tr>');
        }
        if(data.content){
            ret.push('<tr><td class="prompt">任务说明：</td><td>'+data.content+'</td> </tr>');
        }
        ret.push('</tbody></table>');

        // todo 附件
         //附件相关
         if (data.ishasfile) {
             imageList = data['imageList'];    // 图片附件
             fileList = data['fileList'];   // 文件附件
             if(fileList.length > 0){ //文件附件
                 ret.push(feed.attachment(fileList));
             }

             if(imageList.length > 0){  //图片附件
                 ret.push(feed.pic(imageList));
             }
         }

        ret.push('<div class="oplist">'+data.createtime+' 来自 网页');
        if(parseInt(data.issumit) > 0){
            ret.push('<a class="submittask yy-task-submit" id="yy-task-submit-'+tid+'" data="'+tid+'" href="javascript:;">提交任务</a>');
        }
        if(parseInt(data.isassign) > 0){
            ret.push('<a class="dispatchtask" id="yy-task-assign-'+tid+'" href="/employee/task/assign?tid='+tid+'" target="_blank">分配任务</a>');
        }
        if(parseInt(data.ispass) > 0){
            ret.push('<a class="dispatchtask yy-task-unpass" id="yy-task-unpass-'+tid+'" href="javascript:;" data="'+tid+'">不通过</a>');
            ret.push('<a class="dispatchtask yy-task-pass" id="yy-task-pass-'+tid+'" href="javascript:;" data="'+tid+'">通过</a>');
        }
        if(parseInt(data.isclose) > 0){
            var rel = 6,
                status = '关闭';
            if(parseInt(data.status) == 6){
                rel = 0;
                status = '开启';
            }
            ret.push('<a class="dispatchtask" id="yy-task-close" data="'+tid+'" href="javascript:;" rel="'+rel+'">'+status+'</a>');
        }
        if(parseInt(data.isreply) > 0){
            data.replyNum = data.replyNum == undefined ? 0 : parseInt(data.replyNum);
            ret.push('<a href="javascript:;" class="oplist_reply reply" targetId="'+tid+'" module="'+data.module+'">回复('+data.replyNum+')</a>');
        }
        if(parseInt(data.isedit) > 0){
            ret.push('<a class="dispatchtask" href="/employee/task/edit?tid='+tid+'" target="_blank">编辑</a>');
        }
        if(parseInt(data.isdel) > 0){
            ret.push('<a class="submittask yy-task-del" data="'+tid+'" href="javascript:;">删除</a>');
            ret.push('<div style="left: 460px; top: 30px;" class="delLay relative fl yy-delete z5 hidden">');
            ret.push('   <aside class="delTk">确定要删除该会话？<br>');
            ret.push('   <a href="javascript:void(0);" data="'+tid+'" class="feed-delete-confirm" style="color:#FFF">删除</a>');
            ret.push('    <a href="javascript:void(0);" class="yy-delete-cancel">不删除</a>');
            ret.push('   <span class="sj xsj"></span>');
            ret.push('</aside>');
            ret.push(' </div>');
        }
        ret.push('</div></div> </div>');

        return ret.join('');
    }
}(jQuery, YonYou, YonYou.util));

/**
 * data参数样板格式：
 *{
 * "id":"10016",
 * "taskid":"10017",
 * "creatorid":"2",
 * "createtime":"2013-04-25 11:13:12",
 * "parentid":"0",
 * "ancestorids":"",
 * "level":"1",
 * "isleaf":"0",
 * "title":"title9999",
 * "employeeid":"2",
 * "content":"content9999",
 * "details":"content9999",
 * "isimportant":"0",
 * "remindtimetype":"0",
 * "remindway":"0",
 * "leadtime":"0",
 * "repetition":"0",
 * "ishasfile":"0",
 * "status":"0",
 * "starttime":"2013-04-25 11:30:00",
 * "expectendtime":"2013-05-01 12:00:00",
 * "realendtime":"0000-00-00 00:00:00",
 * "log":"",
 * "clienttype":"0",
 * "parenttitle":null,
 * "creatorname":"\u674e\u80dc",
 * "creatorimg":"201304\/17\/1366185076HTDV.jpg",
 * "tpstatus":"0",
 * "tt":null,
 * "fileList":[],
 * "fileId":[],
 * "isdel":1,
 * "isedit":1,
 * "isreply":1,
 * "isclose":1,
 * "isassign":1,
 * "issumit":1,
 * "tastStatus":"\u8fdb\u884c\u4e2d",
 * "userList":{"2":[
 *                  {"3":"\u5b5f\u6d9b"},
 *                  {"4":"\u5f20\u5f3a"},
 *              ],
*              "3":[
*                   {"48":"\u8881\u5a67"}
*                   ]},
* "userId":{"2":["3","4","8"],"3":["48"]},
* "module":"107",
* "feedid":"10012",
* "template":"107101"}
*
*/
