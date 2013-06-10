<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Sb Catq
 * Date: 13-4-20
 * Time: 下午5:13
 * To change this template use File | Settings | File Templates.
 */

class Announce_model extends CI_Model{
    public function __construct(){
        $this->load->database('default');
    }

    /**
    * 获取公告类型id和显示名称
    * @param $spaceId
    * @return
    */
    public function getAnnounceType($spaceId)
    {
        $strSql='SELECT id,`name` FROM tb_announce_type WHERE spaceid=? ORDER BY sortvalue ASC';
        $query = $this->db->query($strSql,array($spaceId));
        return $query->result();
    }

    /**
    * 获取公告信息
    * @param $spaceId 空间ID
    * @param $type 公告类型
    * @param $pageSize 每页行数
    * @param $currentPage 当前页码
    * @param $total 是否返回总页数
    * @return array
    */
    public function getAnnounceList($spaceId,$type,$pageSize,$currentPage,$total)
    {
        $data = [];
        $data['rs']=true;
        $data['error']='';
        if($type==0)
        {
            $table = $this->getAllAnnounce($spaceId,$pageSize,$currentPage);
            $i=0;
            foreach($table as $row)
            {
                $str=$row->title;
                if(strlen($row->title)>55)
                {
                    $str=$this->utf_substr($row->title,55).'...';
                }
                $headtip='<a tips="1" href="/employee/homepage/index/'.$row->creatorid.'.html" rel="/employee/employee/cardInfo/'.$row->creatorid.'">
                                    <span class="headname cr" title="'.$row->creator.'">'.$row->creator.'</span></a>';
                $data['data']['table'][$i][0] = '<table class="contenttb" cellpadding="0" cellspacing="0">'
                                                                .'<tr><td class="w4 " name="title"><a href="/employee/announce/detail/0/'
                                                                .$row->id.'.html" class="tt" title="'
                                                                .$row->title.'" accid="'.$row->id.'">'.$str.'</a></td><td class="w1 " name="type">'
                                                                .$row->type.'</td><td class="w1 " name="rccount">'
                                                                .$row->rccount.'</td><td class="w15 " name="creator,">'.$headtip
                                                                .'</td><td class="w2 " name="updatetime">'.$row->updatetime
                                                                .'</td></table><div class="contentkey" style="line-height:20px;">'
                                                                .$this->utf_substr(strip_tags($row->content),450).'<a href="/employee/announce/detail/0/'
                                                                .$row->id.'.html" > 阅读原文>></a></div>';
                $i++;
            }
        }
        else
        {
            $table = $this->getAnnounceByType($spaceId,$type,$pageSize,$currentPage);
            $i=0;
            foreach($table as $row)
            {
                $str=$row->title;
                if(strlen($row->title)>48)
                {
                    $str=$this->utf_substr($row->title,48).'...';
                }
                $headtip='<a tips="1" href="/employee/homepage/index/'.$row->creatorid.'.html" rel="/employee/employee/cardInfo/'.$row->creatorid.'">
                                    <span class="headname cr" title="'.$row->creator.'">'.$row->creator.'</span></a>';
                $data['data']['table'][$i][0] = '<table class="contenttb" cellpadding="0" cellspacing="0">'
                                                                .'<tr><td class="w4 " name="title"><a href="/employee/announce/detail/'
                                                                .$type.'/'.$row->id.'.html" class="tt" title="'
                                                                .$row->title.'" accid="'.$row->id.'">'.$str.'</a></td><td class="w15" name="rccount">'
                                                                .$row->rccount.'</td><td class="w1" name="creator,">'.$headtip
                                                                .'</td><td class="w3 " name="updatetime">'.$row->updatetime
                                                                .'</td></table><div class="contentkey" style="line-height:20px;">'
                                                                .$this->utf_substr(strip_tags($row->content),450)
                                                                .'<a href="/employee/announce/detail/'.$type.'/'.$row->id.'.html" > 阅读原文>></a></div>';
                $i++;
            }
        }
        if($total)
        {
            $data['data']['total'] = $this->getAnnounceCount($spaceId,$type);
        }
        $data['type']='table';
        return $data;
    }

    /**
    * 获取公告全部公告信息
    * @param $spaceId 空间ID
    * @param $pageSize 每页行数
    * @param $currentPage 当前页码
    * @return
    */
    public function getAllAnnounce($spaceId,$pageSize,$currentPage)
    {
        $strSql = 'SELECT a.id,a.title,t.`name` AS type,CONCAT(a.readnum,"/",a.commentnum) AS rccount,e.id as creatorid,e.`name` AS creator,e.imageurl,a.updatetime,a.content '
                        .'FROM tb_announce AS a LEFT JOIN tb_announce_type AS t on a.typeid=t.id '
                        .'LEFT JOIN tb_employee AS e ON a.creatorid=e.id '
                        .'WHERE a.spaceid=? AND a.`status`=1 '
                        .'ORDER BY a.sortvalue DESC,a.updatetime DESC '
                        .'LIMIT ? OFFSET ? ';
        $query = $this->db->query($strSql,array($spaceId,$pageSize,($currentPage-1)*$pageSize));
        return $query->result();
    }

    /**
    * 按分类获取公告信息
    * @param $spaceId 空间ID
    * @param $type 公告类型
    * @param $pageSize 每页行数
    * @param $currentPage 当前页码
    * @return
    */
    public function getAnnounceByType($spaceId,$type,$pageSize,$currentPage)
    {
        $strSql = 'SELECT a.id,a.title,CONCAT(a.readnum,"/",a.commentnum) AS rccount,e.id as creatorid,e.`name` AS creator,e.imageurl,a.updatetime,a.content '
                        .'FROM tb_announce AS a LEFT JOIN tb_announce_type AS t on a.typeid=t.id '
                        .'LEFT JOIN tb_employee AS e ON a.creatorid=e.id '
                        .'WHERE a.spaceid=? AND a.`status`=1 AND t.id=? '
                        .'ORDER BY a.sortvalue DESC,a.updatetime DESC '
                        .'LIMIT ? OFFSET ? ';
        $query = $this->db->query($strSql,array($spaceId,$type,$pageSize,($currentPage-1)*$pageSize));
        return $query->result();
    }

    /**
    * 获取公告数目
    * @param $spaceId 空间ID
    * @param $type 公告类型
    * @return int
    */
    public function getAnnounceCount($spaceId,$type)
    {
        if($type == 0)
        {
            $strSql = 'SELECT  COUNT(id) as pageCount FROM tb_announce WHERE spaceid=? AND `status`=1';
            $query = $this->db->query($strSql,array($spaceId));
            return $query->row()->pageCount;
        }
        else
        {
            $strSql = 'SELECT  COUNT(id) as pageCount FROM tb_announce WHERE spaceid=? AND `status`=1 AND typeid=?';
            $query = $this->db->query($strSql,array($spaceId,$type));
            return $query->row()->pageCount;
        }
    }

    /**
    * 获取公告明细
    * @param $spaceId 空间ID
    * @param $id 公告ID
    * @return array
    */
    public function getAnnounceContent($spaceId,$id)
    {
        $data=[];
        $strSql = 'SELECT a.id,a.title,t.`name` AS type,e.`name` AS creator,a.signname,a.updatetime,a.content,a.isallowcomment '
            .'FROM tb_announce AS a LEFT JOIN tb_announce_type AS t on a.typeid=t.id '
            .'LEFT JOIN tb_employee AS e ON a.creatorid=e.id '
            .'WHERE a.spaceid=? AND a.`status`=1 AND a.id=?';
        $query = $this->db->query($strSql,array($spaceId,$id));
        if ($query->num_rows() > 0)
        {
            $row = $query->row();
            $data='<div><p class="anctitle" ancid="'.$row->id.'">'
                .$row->title.'</p></div><div class="ancinfo"><div class="grid"><p>发布人：'
                .$row->creator.'</p></div><div class="grid"><p> 部门：'
                .$row->signname.'</p></div><div class="grid"><p> 分类：'
                .$row->type.'</p></div><div class="grid"><p> 时间：'
                .$row->updatetime.'</p></div></div><div class="ancdetail">'.$row->content.'</div>';
        }
        return $data;
    }

    /**
    * 获取公告排序
    * @param $spaceId 空间ID
    * @param $type 公告类型
    * @return array
    */
    public function getAnnounceOrder($spaceId,$type)
    {
        $data=[];
        if($type==0)
        {
            $strSql='SELECT id from tb_announce WHERE spaceid=? AND `status`=1 ORDER BY sortvalue DESC,updatetime DESC';
            $query=$this->db->query($strSql,array($spaceId));
        }
        else
        {
            $strSql='SELECT id from tb_announce WHERE spaceid=?  AND `status`=1 and typeid=? ORDER BY sortvalue DESC,updatetime DESC';
            $query=$this->db->query($strSql,array($spaceId,$type));
        }
        $count=$query->num_rows();
        if ( $count> 0)
        {
            $table = $query->result();
            $i=0;
            foreach($table as $row)
            {
                if($i==0)
                {
                    $data[$i]['key']=$type.'_'.$row->id;
                    $data[$i]['prev']=0;
                    $data[$i]['cur']=$row->id;
                    $data[$i]['next']=0;
                }
                else
                {
                    if($i==$count-1)
                    {
                        $data[$i]['key']=$type.'_'.$row->id;
                        $data[$i]['prev']=$data[$i-1]['cur'];
                        $data[$i]['cur']=$row->id;
                        $data[$i]['next']=0;
                        $data[$i-1]['next']=$row->id;
                    }
                    else
                    {
                        $data[$i]['key']=$type.'_'.$row->id;
                        $data[$i]['prev']=$data[$i-1]['cur'];
                        $data[$i]['cur']=$row->id;
                        $data[$i]['next']=0;
                        $data[$i-1]['next']=$row->id;
                    }
                }
                $i++;
            }
        }
        return $data;
    }

    /**
     * 获取公告排序
     * @param $spaceId 空间ID
     * @param $type 公告类型
     * @param $list
     * @return array
     */
    public function getAnnounceOrderById($spaceId,$type,$list)
    {
        $data=[];
        $idList = implode(',', $list);
        if(empty($idList))
        {
            if($type==0)
            {
                $strSql='SELECT id from tb_announce WHERE spaceid=? AND `status`=1 ORDER BY sortvalue DESC,updatetime DESC';
                $query=$this->db->query($strSql,array($spaceId));
            }
            else
            {
                $strSql='SELECT id from tb_announce WHERE spaceid=? AND `status`=1 and typeid=? ORDER BY sortvalue DESC,updatetime DESC';
                $query=$this->db->query($strSql,array($spaceId,$type));
            }
        }
        else
        {
            if($type==0)
            {
                $strSql='SELECT id from tb_announce WHERE spaceid=? AND `status`=1 and id in ('.$idList.') ORDER BY sortvalue DESC,updatetime DESC';
                $query=$this->db->query($strSql,array($spaceId));
            }
            else
            {
                $strSql='SELECT id from tb_announce WHERE spaceid=? AND `status`=1 and id in ('.$idList.') and typeid=? ORDER BY sortvalue DESC,updatetime DESC';
                $query=$this->db->query($strSql,array($spaceId,$type));
            }
        }
        $count=$query->num_rows();
        if ( $count> 0)
        {
            $table = $query->result();
            $i=0;
            foreach($table as $row)
            {
                if($i==0)
                {
                    $data[$i]['key']=$type.'_'.$row->id;
                    $data[$i]['prev']=0;
                    $data[$i]['cur']=$row->id;
                    $data[$i]['next']=0;
                }
                else
                {
                    if($i==$count-1)
                    {
                        $data[$i]['key']=$type.'_'.$row->id;
                        $data[$i]['prev']=$data[$i-1]['cur'];
                        $data[$i]['cur']=$row->id;
                        $data[$i]['next']=0;
                        $data[$i-1]['next']=$row->id;
                    }
                    else
                    {
                        $data[$i]['key']=$type.'_'.$row->id;
                        $data[$i]['prev']=$data[$i-1]['cur'];
                        $data[$i]['cur']=$row->id;
                        $data[$i]['next']=0;
                        $data[$i-1]['next']=$row->id;
                    }
                }
                $i++;
            }
        }
        return $data;
    }

    /**
    * 截取字符串
    * @param $str 字符串
    * @param $len 截取的长度
    * @return str
    */
    public function utf_substr($str,$len)
    {
        for($i=0;$i<$len;$i++)
        {
            $temp_str=substr($str,0,1);
            if(ord($temp_str) > 127)
            {
                $i++;
                if($i<$len)
                {
                    $new_str[]=substr($str,0,3);
                    $str=substr($str,3);
                }
            }
            else
            {
                $i=$i+2;
                $new_str[]=substr($str,0,1);
                $str=substr($str,1);
            }
        }
        return join($new_str);
    }

}