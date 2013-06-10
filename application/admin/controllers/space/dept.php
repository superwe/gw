<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Dept extends CI_Controller {

    private $spaceId; //空间id
    public function __construct()
    {
        parent::__construct();

       $this->load->helper('cache');
        $this->spaceId = QiaterCache::spaceid();
    }

	public function index(){
        $data=[];
        $this->load->library('smarty');
        $this->smarty->view('space/dept.tpl',$data);
	}

    //插入或修改记录
    public function saveOrUpdate(){
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $name =  isset($_POST['name']) ? $_POST['name'] : '';
        $parentid =  isset($_POST['parentid']) ? $_POST['parentid'] : 0;
        $ancestorids =  isset($_POST['ancestorids']) ? $_POST['ancestorids'] : '';
        $level =  isset($_POST['level']) ? $_POST['level'] : '';
        $managerid =  isset($_POST['managerid']) ? $_POST['managerid'] : 0;
        if($managerid=='')
            $managerid=0;
        $remark =  isset($_POST['remark']) ? $_POST['remark'] : '';

        $this->load->database('default');
        $this->db->trans_begin();
        if($id == 0){//新增
            $isleaf = 1;//新增的一定为叶子节点
            $this->db->query('INSERT INTO tb_dept (spaceid,name,parentid,ancestorids,level,isleaf,managerid,remark,createdate) VALUES (?,?,?,?,?,?,?,?,NOW())',array($this->spaceid,$name,$parentid,$ancestorids,$level,$isleaf,$managerid,$remark));
            //将上级节点的是否叶子节点置为否
            $this->db->query('update tb_dept set isleaf=0 where id=?',array($parentid));
        }else{//修改
            $this->db->query('UPDATE tb_dept SET name=?,managerid=?,remark=? WHERE id =?',array($name,$managerid,$remark,$id));
        }

        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
            echo -1;
        }else{
            $this->db->trans_commit();
            echo 0;
        }
    }

    //删除选中记录
    public function delete(){
        $id =  isset($_POST['id']) ? $_POST['id'] : 0;
        $parentid =  isset($_POST['parentid']) ? $_POST['parentid'] : '';
        if($id!=''){
            $this->load->database('default');
            $this->db->trans_begin();
            $this->db->query('DELETE FROM tb_dept WHERE id IN ('.$id.')');

            //判断该部门的上级部门是否还有下级部门
            $query = $this->db->query('select id from tb_dept  where parentid=?',array($parentid));
            if($query->num_rows() == 0){//如没有下级部门，将是否叶子节点置为否
                 $this->db->query('update tb_dept set isleaf =1 where id=?',array($parentid));
            }

            if ($this->db->trans_status() == FALSE){
                $this->db->trans_rollback();
                echo -1;
            }else{
                $this->db->trans_commit();
                echo 0;
            }
        }else
            echo -1;
    }

    //判断是否可以删除
    public function isCanDelete()
    {
        $id = isset($_POST['id']) ? $_POST['id']: '';//所选部门的id

        $this->load->database('default');

        if( $id!=''){
            $query = $this->db->query('select id from tb_dept where parentid=? limit 1',array($id));
            if($query->num_rows()>0){
                echo 1;//有下级部门
            }else{
                $query = $this->db->query('select id from tb_dept_job where deptid=? limit 1',array($id));
                if($query->num_rows()>0){
                    echo 2;//有岗位关系
                }else{
                    $query = $this->db->query('select id from tb_employee where deptid=? limit 1',array($id));
                    if($query->num_rows()>0){
                        echo 3;//有人员存在
                    }else{
                        echo 4;//符合条件 可以被撤销
                    }
                }
            }
        }
        else{
            echo 0;
        }

    }

    public function findAll(){
        $strWhereStatus = ' a.status =1 and ';//默认只选择正常的
        if(isset($_POST['status']))
        {
            $strWhereStatus='';
        }

        $this->load->database('default');
        $query = $this->db->query('SELECT a.id,a.name,a.parentid,(case a.parentid when 0 then null else a.parentid end) as _parentId,a.ancestorids,a.level,a.isleaf,a.createdate,a.canceldate,b.name as employeename,a.status,a.remark FROM tb_dept as a left join tb_employee as b on a.managerid = b.id WHERE '.$strWhereStatus .  'a.spaceid=?  ORDER BY id ASC,sortvalue ASC',array($this->spaceId));

        $data['rows'] = $query->result();
        echo json_encode($data);
    }

    //获取一个用户的信息
    public function findOne(){
        $id =  isset($_POST['id']) ? $_POST['id'] : '';
        $data = [];
        if($id!=''){
            $this->load->database('default');
            $query = $this->db->query('SELECT a.id,a.parentid,a.name,a.managerid,a.remark FROM tb_dept AS a  WHERE a.id=? LIMIT 1',array($id));
            if($query->num_rows()>0)
                echo json_encode($query->row());
            else
                echo '';
        }else
            echo '';
    }

    //判断部门名称是否重复  规则：同级部门不能重复
    public  function isExistByName()
    {
        $id =  isset($_POST['id']) ? $_POST['id']==''?0:$_POST['id'] : 0;
        $name =  isset($_POST['name']) ? $_POST['name'] : '';
        $parentid =  isset($_POST['parentid']) ? $_POST['parentid'] :0;

        $this->load->database('default');
        $query = $this->db->query('SELECT id FROM tb_dept  WHERE spaceid=? and  id<>? and parentid=? and name=?  LIMIT 1',array($this->spaceid,$id,$parentid,$name));
        if($query->num_rows()>0)
        {
            echo 1;
        }
        else
        {
            echo 0;
        }
    }

    //移动合并机构
    public function moveOrMergeDept()
    {
        $originalAncestorids =  isset($_POST['originalAncestorids']) ? $_POST['originalAncestorids'] : '';
        $originalDeptid =  isset($_POST['originalDeptid']) ? $_POST['originalDeptid']==''?0:$_POST['originalDeptid'] : 0;
        $operateType =  isset($_POST['operateType']) ? $_POST['operateType'] : '';
        $destinationDeptid =  isset($_POST['destinationDeptid']) ? $_POST['destinationDeptid'] :0;

        $likeAncestorids = $originalAncestorids.$originalDeptid.'|%';

        $this->load->database('default');
        $this->db->trans_begin();

        if($operateType == "1"){ //移动机构
            $query = $this->db->query('select ancestorids,level,isleaf from tb_dept where id = ?',array($destinationDeptid));//获取目标机构的详细信息
            if($query->num_rows()>0){

                $row = $query->row(0);

                $newAncestorids = $row->ancestorids.$destinationDeptid.'|';//为原机构获得新的祖先ID序列
                $newLevel = intval($row->level)+1;//为原机构获得新的层级
                $this->db->query('update tb_dept set ancestorids=replace(ancestorids,?,?) where ancestorids like ?',array($originalAncestorids,$newAncestorids,$likeAncestorids));
                $this->db->query('update tb_dept set parentid=?,ancestorids=?,level=?  where id=?',array($destinationDeptid,$newAncestorids,$newLevel,$originalDeptid));//移动到目标机构下

                if($row->level == '1'){ //如果目标机构为叶子节点，将目标机构的是否叶子节点置为否
                    $this->db->query('update tb_dept set isleaf=0 where id=?',array($destinationDeptid));
                }
            }
        }
        else{ //合并机构
            //将原机构及下级部门里的人员的部门修改为目标机构
            $this->db->query('update tb_employee set deptid = ? where deptid in (select id from tb_dept where ancestorids like  ? or id =?)',array($destinationDeptid,$likeAncestorids,$originalDeptid));
            //转移岗位关系8
            $this->db->query('insert into tb_dept_job (deptid,jobid) select ?,jobid from tb_dept_job where deptid in (SELECT id from tb_dept where ancestorids like ? or id =?) and jobid not in (select jobid from tb_dept_job where deptid = ?)',array($destinationDeptid,$likeAncestorids,$originalDeptid,$destinationDeptid));
            //删除原机构及下级部门
            $this->db->query('DELETE FROM tb_dept where ancestorids like ? or id =?',array($likeAncestorids,$originalDeptid));
        }

        if ($this->db->trans_status() == FALSE){
            $this->db->trans_rollback();
            echo -1;
        }else{
            $this->db->trans_commit();
            echo 0;
        }
    }

    //判断在发生转移的时候  目标机构是否是原机构的下属机构
    // 1为是下级机构  0为不是下级机构  -1为目标机构不存在
    public function isSubordinateDept()
    {
        $originalDeptid =  isset($_POST['originalDeptid']) ? $_POST['originalDeptid']==''?0:$_POST['originalDeptid'] : 0;//原机构
        $destinationDeptid =  isset($_POST['destinationDeptid']) ? $_POST['destinationDeptid'] :0;//目标机构

        $this->load->database('default');
        $query = $this->db->query('select ancestorids from tb_dept where id = ?',array($destinationDeptid));//获取目标机构的详细信息
        if($query->num_rows()>0){
            $query = $this->db->query(' select id from tb_dept where instr(?,?) limit 1',array($query->row(0)->ancestorids,$originalDeptid));
            if($query->num_rows()>0){
                echo 1;
            }
            else{
                echo 0;
            }
        }
        else{
            echo -1;
        }
    }

    //移动部门的时候 检验目标机构中有没有和原机构相同名称的子部门
    public function isDestinationDeptHasSameNameDept()
    {
        $originalDeptid =  isset($_POST['originalDeptid']) ? $_POST['originalDeptid']==''?0:$_POST['originalDeptid'] : 0;//原机构
        $originalDeptName =  isset($_POST['originalDeptName']) ? $_POST['originalDeptName'] :0;//原机构名称
        $destinationDeptid =  isset($_POST['destinationDeptid']) ? $_POST['destinationDeptid'] :0;//目标机构

        $this->load->database('default');
        $query = $this->db->query('select ancestorids from tb_dept where id = ?',array($destinationDeptid));//获取目标机构的详细信息
        if($query->num_rows()>0){
            $query = $this->db->query(' select id from tb_dept where status=2 and parentid=? and name=? limit 1',array($destinationDeptid,$originalDeptName));
            if($query->num_rows()>0){
                echo 1;//存在相同名称 且已撤销的机构
            }
            else{
                $query = $this->db->query(' select id from tb_dept where status=1 and parentid=? and name=? limit 1',array($destinationDeptid,$originalDeptName));
                if($query->num_rows()>0){
                    echo 2;//存在相同名称未撤销的部门
                }
                else{
                    echo 3;//正常
                }
            }
        }
        else{
            echo -1;
        }
    }

    //合并机构时 判断是否是兄弟也就是同一层级的 机构
    public function isSameLeveDept()
    {
        $originalDeptid =  isset($_POST['originalDeptid']) ? $_POST['originalDeptid']==''?0:$_POST['originalDeptid'] : 0;//原机构
        $destinationDeptid =  isset($_POST['destinationDeptid']) ? $_POST['destinationDeptid'] :0;//目标机构

        $this->load->database('default');
        $query = $this->db->query('select id from tb_dept where id = ? and parentid in (select parentid from tb_dept where id=?)',array($originalDeptid,$destinationDeptid));//获取目标机构的详细信息
        if($query->num_rows()>0){
            echo 0;
        }
        else{
            echo 1;
        }
    }

    //撤销机构
    public function undoDept()
    {
        $id =  isset($_POST['undoDeptId']) ? $_POST['undoDeptId']==''?0:$_POST['undoDeptId'] : 0;
        $canceldate = isset($_POST['undoCanceldate']) ? $_POST['undoCanceldate']==''?'0000-00-00':$_POST['undoCanceldate']: '0000-00-00';

        $this->load->database('default');
        $this->db->query('update tb_dept set status =2,canceldate=? where id=? ',array($canceldate,$id));
        echo 1;
    }
    //判断机构是否可以被撤销
    public function isCanUndoDept()
    {
        $id = isset($_POST['id']) ? $_POST['id']: '';//所选部门的id

        $this->load->database('default');

        if( $id!=''){
            $query = $this->db->query('select id from tb_dept where status=1 and parentid=? limit 1',array($id));
            if($query->num_rows()>0){
                echo 1;//有未撤销的下级部门
            }else{
                $query = $this->db->query('select id from tb_dept_job where deptid=? limit 1',array($id));
                if($query->num_rows()>0){
                    echo 2;//有岗位关系
                }else{
                    $query = $this->db->query('select id from tb_employee where deptid=? limit 1',array($id));
                    if($query->num_rows()>0){
                        echo 3;//有人员存在
                    }else{
                        echo 4;//符合条件 可以被撤销
                    }
                }
            }
        }
        else{
            echo 0;
        }
    }


    //反撤销机构
    public function redoDept()
    {
        $id =  isset($_POST['id']) ? $_POST['id']==''?0:$_POST['id'] : 0;
        $ancestorids = isset($_POST['ancestorids']) ? $_POST['ancestorids']: '';

        $this->load->database('default');
        $this->db->query('update tb_dept set status =1 where id=? or ancestorids like ?',array($id,$ancestorids.$id.'%'));
        echo 1;
    }

    //判断上级部门 是否已撤销
    public function isParentDeptUndo()
    {
        $parentid = isset($_POST['parentid']) ? $_POST['parentid']: '';//所选部门的上级部门id

        if($parentid!=''){
            $this->load->database('default');
            $query = $this->db->query('select id from tb_dept where status =2 and id=?',array($parentid));
            if($query->num_rows()>0){
                echo 1;
            }
            else{
                echo 0;
            }
        }
        else{
            echo 0;
        }
    }

    //判断是否存在下级部门
    public function isHaveSubDept()
    {
        $id = isset($_POST['id']) ? $_POST['id']: '';//所选部门的id

        if( $id!=''){
            $this->load->database('default');
            $query = $this->db->query('select id from tb_dept where parentid=? limit 1',array($id));
            if($query->num_rows()>0){
                echo 1;
            }
            else{
                echo 0;
            }
        }
        else{
            echo 0;
        }
    }

    //部门与岗位关系
    public function saveDeptAndJobRelation()
    {

    }

}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */