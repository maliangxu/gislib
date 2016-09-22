<?php 



require_once("conn.php");

$name=$_REQUEST['usrname'];
$pass=$_REQUEST['password'];
$method=$_REQUEST['method'];
switch($method){
	case 'register':
	$sql="insert into userinfo(name,password) values('$name','$pass')";
	if(mysql_query($sql,$conn)){
		echo "恭喜您，注册成功";
	}else{
		echo "抱歉，注册失败，请重试";
	}
	break;
	
	case 'login':
	$sql="select * from userinfo where name="."'$name'"." and password="."'$pass'";
	$result=mysql_query($sql,$conn); 
    if(mysql_num_rows($result)>0){
    	echo $name." 欢迎访问...";
    }else{
    	echo "用户名错误或密码错误！";
    }
	break;

}





?>