<?php
session_start();

$usrname=$_GET['usrname'];  
$pass=$_GET['password'];
$_SESSION['user']=$usrname;

/*验证*/
if($usrname=="root"){
	if($pass=="root"){
		echo $usrname.",你好！欢迎访问...";
	}else{
		echo "抱歉，密码不正确";
	}
}else{
   echo "用户名不正确！请重新输入";
}

?>