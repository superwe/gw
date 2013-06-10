<style>
table{
	margin:10px;
}
table tr{
	line-height:40px;
}
textarea.input {
	width: 400px;
	height: 100px;
}
</style>
<form method="post" action="/employee/group/create" id="group" enctype="multipart/form-data">
	<table>
		<tr><td>群组名称：</td><td><input type="text" class="input" name="group_name" id="group_name" maxlength="20"></td></tr>
		<tr><td>群组简介：</td><td><textarea name="description" cols="" rows="" id="description" class="input"></textarea></td></tr>
		<tr><td>LOGO：</td><td><input type="file" size="10" class="inputFile" name="group_logo" id="group_logo"></td></tr>
		<tr><td></td><td><input type="hidden" name="do" value='1'></td></tr>
		<tr><td></td><td>仅支持JPG图片文件，且文件小于5M</td></tr>
	</table>
</form>