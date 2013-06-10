<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Yuanjinga
 * Date: 13-4-11
 * Time: 上午10:54
 * To change this template use File | Settings | File Templates.
 */

class Config_model extends  CI_Model{
    /**
     * 对象类型定义
     */
    const OBJECT_TYPE_ALL				   = 0;  //所有
    const OBJECT_TYPE_QZ				   = 5;  //圈子
    const OBJECT_TYPE_MEMBER            = 10; //成员
    const OBJECT_TYPE_SPEECH            = 15; //发言
    const OBJECT_TYPE_REPLY             = 20; //回复
    const OBJECT_TYPE_SCHEDULE          = 25; //日程
    const OBJECT_TYPE_CALENDAR          = 30; //日历
    const OBJECT_TYPE_TASK              = 35; //任务
    const OBJECT_TYPE_GROUP             = 40; //群组
    const OBJECT_TYPE_TOPIC             = 45; //话题
    const OBJECT_TYPE_FILES				= 50; //附件
    const OBJECT_TYPE_MESSAGE           = 55; //微邮
    const OBJECT_TYPE_DAILY				= 60; //日志
    const OBJECT_TYPE_VOTE				= 65; //投票
    const OBJECT_TYPE_APP				    = 70; //APP
    const OBJECT_TYPE_SCREEN	    	    = 75; //微博墙
    const OBJECT_TYPE_MEDAL	    	    = 80; //荣誉
    const OBJECT_TYPE_ANNOUNCE          = 85; //公告
    const OBJECT_TYPE_CALL		        = 90; //打招呼
    const OBJECT_TYPE_HOME               = 95; //首页
    const OBJECT_TYPE_SHARE				= 100; //转发
    const OBJECT_TYPE_SIGN				= 105; //签到
    const OBJECT_TYPE_CRM				= 110; //CRM
    const OBJECT_TYPE_EVENT 			= 115; //活动
    const OBJECT_TYPE_GOODS				= 120; //商品
    const OBJECT_TYPE_ORDER				= 125; //订单
    const OBJECT_TYPE_FEED				= 130; //动态

    /**
     * 对象类型对应名称
     */
    public static $OBJ_NAME = array(
        self::OBJECT_TYPE_ALL => '所有',
        self::OBJECT_TYPE_QZ => '圈子',
        self::OBJECT_TYPE_MEMBER => '成员',
        self::OBJECT_TYPE_SPEECH => '发言',
        self::OBJECT_TYPE_REPLY => '回复',
        self::OBJECT_TYPE_SCHEDULE => '日程',
        self::OBJECT_TYPE_CALENDAR => '日历',
        self::OBJECT_TYPE_TASK => '任务',
        self::OBJECT_TYPE_GROUP => '群组',
        self::OBJECT_TYPE_TOPIC => '话题',
        self::OBJECT_TYPE_FILES => '附件',
        self::OBJECT_TYPE_MESSAGE => '所有',
        self::OBJECT_TYPE_DAILY => '日志',
        self::OBJECT_TYPE_VOTE => '投票',
        self::OBJECT_TYPE_APP => 'APP',
        self::OBJECT_TYPE_SCREEN => '微博墙',
        self::OBJECT_TYPE_MEDAL => '荣誉',
        self::OBJECT_TYPE_ANNOUNCE => '公告',
        self::OBJECT_TYPE_CALL => '打招呼',
        self::OBJECT_TYPE_HOME => '首页',
        self::OBJECT_TYPE_SHARE => '转发',
        self::OBJECT_TYPE_EVENT => '活动'
    );

    /**
     * 对象类型对应主表名称
     */
    public static $OBJ_TABLE = array(
        self::OBJECT_TYPE_QZ => 	'base',
        self::OBJECT_TYPE_MEMBER => 'member',
        self::OBJECT_TYPE_SPEECH => 'speech',
        self::OBJECT_TYPE_REPLY => 'reply',
        self::OBJECT_TYPE_SCHEDULE => 'schedule',
        self::OBJECT_TYPE_TASK => 'task',
        self::OBJECT_TYPE_GROUP => 'group',
        self::OBJECT_TYPE_DAILY => 'blog',
        self::OBJECT_TYPE_VOTE => 'vote',
        self::OBJECT_TYPE_MEDAL => 'medal',
        self::OBJECT_TYPE_ANNOUNCE => 'announce',
        self::OBJECT_TYPE_CALL => 'call',
        self::OBJECT_TYPE_FILES => 'file',
        self::OBJECT_TYPE_SHARE => 'share',
        self::OBJECT_TYPE_EVENT => 'event',
        self::OBJECT_TYPE_ORDER => 'order',
        self::OBJECT_TYPE_SIGN => 'sign',
    );


    /**
     * 信息来源终端
     */
    public static $FEED_CLIENT_TYPE = array(
        0 => '网页',
        1 => 'iPhone',
        2 => 'Android',
        3 => 'WinPhone',
        4 => '桌面端',
        5 => 'CRM',
        6 => 'T+'
    );

    /**
     * 隐私类型定义
     * @var int
     */
    const PRIVACY_TYPE_PUBLIC = 0;  //公开
    const PRIVACY_TYPE_GROUP = 1;  //群组
    const PRIVACY_TYPE_PRIVATEGROUP = 2;  //私有群组
    const PRIVACY_TYPE_DEPARTMENT = 4;  //部门
    const PRIVACY_TYPE_MEMBER = 8;  //指定人
    const PRIVACY_TYPE_CREATED = 16;  //我创建的
    const PRIVACY_TYPE_JOIN = 32;  //我参与的

    const FEED_KEY_ADD = 'ADD';
    const FEED_KEY_EDIT = 'EDIT';
    const FEED_KEY_JOIN = 'JOIN';
    const FEED_KEY_LEAVE = 'LEAVE';
    const FEED_KEY_UPLOAD = 'UPLOAD';
    const FEED_KEY_REPLY = 'REPLY';
    const FEED_KEY_FOLLOW = 'FOLLOW';
    const FEED_KEY_INVITE = 'INVITE';
    const FEED_KEY_INFORM = 'INFORM';
    const FEED_KEY_NOTICE = 'NOTICE';
    const FEED_KEY_REFUSE = 'REFUSE';
    const FEED_KEY_ACCEPT = 'ACCEPT';
    const FEED_KEY_SHARE  = 'SHARE';
    const FEED_KEY_APPLY = 'APPLY';
    const FEED_KEY_DELETE = 'DELETE';
    const FEED_KEY_NEW = 'NEW';
    const FEED_KEY_DOWN = 'DOWN';
    const FEED_KEY_PASS = 'PASS';
    const FEED_KEY_REJECT = 'REJECT';
    const FEED_KEY_CLOSE = 'CLOSE';
    const FEED_KEY_OPEN = 'OPEN';
    const FEED_KEY_POST = 'POST';
    //提交任务
    const FEED_KEY_SUBMIT = 'SUBMIT';
    const FEED_KEY_LIKE = 'LIKE';
    const FEED_KEY_SAVE = 'SAVE';
    const FEED_KEY_PUBLISH = 'PUBLISH';
    const FEED_KEY_UNPUBLISH = 'UNPUBLISH';
    const FEED_KEY_EXPIRE = 'EXPIRE'; //到期
    const FEED_KEY_QUAN = 'QUAN'; // 圈人

    const USER_ONLINE_SMALL_NO 		= 0;
    const USER_ONLINE_SMALL_WEB 	= 1;
    const USER_ONLINE_SMALL_PHONE 	= 2;

    const INDEX_OPERATION_CREATE = 0;
    const INDEX_OPERATION_DELETE = 1;

}