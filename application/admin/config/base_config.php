<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

$config['base_config']['object_type_all']          = 100;    //所有
$config['base_config']['object_type_qz']           = 101;    //空间
$config['base_config']['object_type_member']      = 102;    //成员
$config['base_config']['object_type_speech']      = 103;    //发言
$config['base_config']['object_type_reply']       = 104;    //回复
$config['base_config']['object_type_schedule']    = 105;    //日程
$config['base_config']['object_type_calendar']    = 106;    //日历
$config['base_config']['object_type_task']        = 107;    //任务
$config['base_config']['object_type_group']       = 108;    //群组
$config['base_config']['object_type_files']       = 109;    //文库
$config['base_config']['object_type_vote']         = 110;    //投票
$config['base_config']['object_type_app']          = 111;    //APP
$config['base_config']['object_type_announce']    = 112;    //公告
$config['base_config']['object_type_home']         = 113;    //首页
$config['base_config']['object_type_share']        = 114;    //转发
$config['base_config']['object_type_sign']         = 115;    //签到
$config['base_config']['object_type_medal']        = 116;    //CRM
$config['base_config']['object_type_event']        = 117;    //活动
$config['base_config']['object_type_screen']       = 118;    //微博墙
$config['base_config']['object_type_goods']        = 119;    //商品
$config['base_config']['object_type_order']        = 120;    //订单
$config['base_config']['object_type_feed']         = 121;    //动态
$config['base_config']['object_type_topic']       = 122;    //话题
$config['base_config']['object_type_message']     = 123;    //微邮
$config['base_config']['object_type_daily']        = 124;    //博客
$config['base_config']['object_type_medal']       = 125;    //荣誉
$config['base_config']['object_type_call']         = 126;    //打招呼

/**
 * 规则：类型编号为三位数，模板编号为六位数 模板编号的前三位数为类型编号
 * 模板变量名称中，ft 代表动态模板 feed template  数字以101开头  nt代表通知模板 notice template 数字以201开头
 */
$config['feed_config']['ft_speech_add']         = 103101;      //添加发言动态

$config['feed_config']['ft_task_add']              = 107101;    //添加任务动态
$config['notice_config']['nt_task_invite']         = 107201;    //任务邀请负责人与参与人通知
$config['notice_config']['nt_task_inform']         = 107202;    //任务知会人通知
$config['notice_config']['nt_task_accept']         = 107203;    //接受任务邀请通知
$config['notice_config']['nt_task_refuse']         = 107204;    //拒绝任务邀请通知
$config['notice_config']['nt_task_post']           = 107205;    //负责人提交任务通知
$config['notice_config']['nt_task_close']          = 107206;    //创建人关闭任务通知
$config['notice_config']['nt_task_open']           = 107207;    //创建人开启任务通知
$config['notice_config']['nt_task_delete']         = 107208;    //创建人删除任务通知

//文库动态及通知
$config['feed_config']['ft_files_add']              = 109101;    //上传文档动态
$config['feed_config']['ft_files_edit']             = 109102;    //更新文档动态
$config['feed_config']['ft_files_down']             = 109103;    //下载文档动态
$config['feed_config']['ft_files_follow']           = 109104;    //关注文档动态
$config['feed_config']['ft_files_share']            = 109105;    //共享文档动态

$config['notice_config']['nt_files_share']          = 109201;    //文件共享通知
$config['notice_config']['nt_files_sharedel']       = 109202;    //取消文件共享通知

//群组动态及通知
$config['feed_config']['ft_group_create']      		= 108101;    //创建群组动态
$config['feed_config']['ft_group_join']				= 108102;    //加入群组动态
$config['notice_config']['nt_group_join']			= 108201;    //加入群组通知
$config['notice_config']['nt_group_quit']			= 108202;    //退出群组通知
$config['notice_config']['nt_group_add_employee']	= 108203;    //添加群组成员通知
$config['notice_config']['nt_group_del_employee']	= 108204;    //删除群组成员通知
$config['notice_config']['nt_group_set_admin']		= 108205;    //设置群组管理员通知
$config['notice_config']['nt_group_cancel_admin']	= 108206;    //取消群组管理员通知
//成员动态及通知
$config['notice_config']['nt_employee_follow']       = 102201;    //关注成员通知
//签到动态通知
$config['notice_config']['nt_sign_join']             = 115101;    //加入签到通知
$config['notice_config']['nt_sign_cancel_join']     = 115102;    //取消加入签到通知
$config['notice_config']['nt_sign_view']             = 115103;    //查看签到通知
$config['notice_config']['nt_sign_cancel_view']     = 115103;    //取消查看签到通知

/* End of file base_config.php */
/* Location: ./application/config/base_config.php */
