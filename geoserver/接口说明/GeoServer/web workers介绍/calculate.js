

 var result="";
onmessage=function(e){ 
  var num=e.data;
  var sum=0;
  for(var i=0;i<num;i++){
   sum+=i;
  }
  result="执行结果是"+sum;
  postMessage(result);
}
