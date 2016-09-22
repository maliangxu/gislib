<?php 
//header("Content_type:text/html;charset=utf-8");
$conn=mysql_connect('localhost','root','123') or die('fail to connect to db'.mysql_error());
mysql_query('set names utf8');


$seldb=mysql_select_db("mydb", $conn);
if($seldb){ //数据库存在，创建表
	$tabSql="create table if not exists userinfo(
	usrID int NOT NULL AUTO_INCREMENT, 
    PRIMARY KEY(usrID),
    name varchar(15),
    password varchar(20)
	)";
  mysql_query($tabSql,$conn);
  
}else{
	$sql="create database mydb";
	mysql_query($sql,$conn);
	mysql_select_db("mydb", $conn);
	$tabSql="create table if not exists userinfo(
	usrID int NOT NULL AUTO_INCREMENT, 
    PRIMARY KEY(usrID),
    name varchar(15),
    password varchar(20)
	)";
  mysql_query($tabSql,$conn);
  
}




?>