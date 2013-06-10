<div class="groupUpload">
	<form method="post" action="/employee/group/upload" id="file" enctype="multipart/form-data">
	<ul>
		<li>该文档添加到{$name}</li>
		<li><input type="hidden" id="gid" name="gid" value="{$id}"><input type="hidden" id="do" name="do" value="1"></li>
		<li>从电脑直接上传</li>
        <li><input type="file" size="10" name="group_file" id="group_file"></li>
        <li>文档上传小于100M</li>
	</ul>
	</form>
</div>