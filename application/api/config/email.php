<?php

$config['useragent'] = '';                                          //用户代理 "user agent"。
$config['protocol'] = 'smtp';                                   //邮件发送协议。
$config['mailpath'] = '/usr/sbin/sendmail';         //服务器上 Sendmail 的实际路径。protocol 为 sendmail 时使用。
$config['smtp_host'] = 'smtp.126.com';              //SMTP 服务器地址。
$config['smtp_user'] = 'newesn@126.com';       //SMTP 用户账号
$config['smtp_pass'] = 'newesn.com';                 //SMTP 密码
$config['smtp_port'] = 25;                                     //SMTP 端口。
$config['smtp_timeout'] = 5;                                //SMTP 超时设置(单位：秒)。
$config['wordwrap'] = TRUE;                               //开启自动换行。
$config['wordchars'] = 76;                                   //自动换行时每行的最大字符数。
$config['mailtype'] = 'html';                               // text 或 html  邮件类型。发送 HTML 邮件比如是完整的网页。请确认网页中是否有相对路径的链接和图片地址，它们在邮件中不能正确显示。
$config['charset'] = 'utf-8';                               //字符集(utf-8, iso-8859-1 等)。
$config['validate'] = false;                                //是否验证邮件地址。
$config['priority'] = 3;                                         //Email 优先级. 1 = 最高. 5 = 最低. 3 = 正常.
$config['crlf'] = '\n';                                         //"\r\n" or "\n" or "\r"	换行符. (使用 "\r\n" to 以遵守RFC 822).
$config['newline'] = '\n';                                   //"\r\n" or "\n" or "\r"	换行符. (使用 "\r\n" to 以遵守RFC 822).
$config['bcc_batch_mode'] = 'false';            //启用批量暗送模式.
$config['bcc_batch_size'] = 200;                    //批量暗送的邮件数.

/**
 * Created by lisheng.
 * User: lisheng
 * Date: 13-3-12
 * Time: 上午10:37
 * To change this template use File | Settings | File Templates.
 */