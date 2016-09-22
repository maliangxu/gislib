
/* by lc 2015-4-23
导出数据部分：
1、导出图层数据：Geojson格式，存为json文件
2、导出属性数据：csv格式 
*/

gEcnu.Export = gClass.extend({
	init: function(){

	}
});
gEcnu.exportParams={};
gEcnu.exportParams.DB='mapb';

//导出要素图层：geojson 格式
gEcnu.Export.Feature = gEcnu.Export.extend({
	//导出整张要素表 or 过滤条件筛选
	init: function(geodb,ftset,ftsetid,filter){
		this.ftset=ftset;
		this.geodb = geodb;
		this.ftsetid = ftsetid;
		this.filter=filter;
		this.webfeatureUrl =gEcnu.config.geoserver+"WebFeature";
		this.websqlUrl=gEcnu.config.geoserver+"WebSQL";
	},
	processAscyn:function (succ,fail){  //可选参数
		this._succCallback=succ;
		this._failCallback=fail;
		var self=this;
		var ftsetName=this.ftset;
		var filter=this.filter;
		this._getFtsetNum(function (ftsetNum){ 
			if(ftsetNum<1){ return;}
			var count=Math.ceil(ftsetNum/5000);  //分批进行要素查询
    		var i=0;  
    		var start=i*5000;
    		var result=[];
    		var geojson={"type":"FeatureCollection","FeatureNum":ftsetNum,"UTF8Encoding":false};
    		var getGeojson=function (){
    		  if(i>=count){ 
    		  		geojson.features=result;
    		  		self._download(JSON.stringify(geojson));
    		  		return;
    		  }
    		  var option={start:start,filter:filter};
    		  self._getFtsetGeojson(option,function (decodeData){
    		  	var feas=decodeData.features;
    		  	if(geojson.scale==undefined){
    		  		geojson.scale=decodeData.scale;
    		  	}
    		  	result=result.concat(feas);
    		    i++;
    		    start=i*5000;
    		    getGeojson();
    		 });
		
    		};
    		getGeojson();

		});

	},
	_getFtsetNum:function (callback){
		var ftset=this.ftset;
		var tabname="f_"+ftset;
		var websqlUrl=this.websqlUrl;
		var failCallback=this._failCallback;
		var sql='select count(*) from '+tabname;
		var db = this.geodb;
		var qryParams={
            	"mt":"SQLQuery",
                "GeoDB":db,
                "SQL":sql
            }
        var datastr = JSON.stringify(qryParams);
        var params = { req: datastr};
         try { 
            gEcnu.Util.ajax("POST", websqlUrl, params, true,function (data){
            	var jsonparser=JSON.parse(data);
            	var res=jsonparser.data;
  		 		var ftsetNum=res[0][0]; 
  		 		callback(ftsetNum);
            });
        }catch(e){
        	if(failCallback!=undefined){
  				failCallback();
  			}
        }
	},
	_getFtsetGeojson:function (option,callback){
		//var ftset=this.ftset;
		var ftsetId = this.ftsetid;
		var db = this.geodb;
		var webfeatureUrl=this.webfeatureUrl;
		var failcallback=this._failCallback;
		var start=option.start || 0;
		var filter=option.filter;
		filter=(filter==undefined || filter == '') ? '1=1' : filter;
		var sqlFilter=filter+" limit 5000 offset "+start;
		var sqlParams = {
                "mt":"SQLQuery",
                "geoDB":db,
                //"ftSet":ftset,
                "ftSet":ftsetId,
                "format":'geojson',
                "zip":true,
                "sql":sqlFilter,
                "return":{"shape":1,"fields":"%all%"}
            };
        var datastr = JSON.stringify(sqlParams);
        var params = {req: datastr};
        try{
        	gEcnu.Util.ajax('POST', webfeatureUrl, params, true, function (data){
        		var jsonparase = JSON.parse(data); 
                var decode_data=gEcnu.Util.decode(jsonparase);//解码GeoJson格式的数据
                if(callback!=undefined){
                	callback(decode_data);
                } 
        	});
        }catch(e){
        	if(failcallback!=undefined){
        		failcallback();
        	}
        }
	},
	//下载文件
	_download:function (content){
		var callback=this._succCallback;
		var fail=this._failCallback;
		var ftsetName=this.ftset; 
		var blob = new Blob([content], {type: 'text'}); 
		var a =document.getElementById('downloadFtsetBtn');
		if(a==undefined){
			a=document.createElement('a');
			a.id='downloadFtsetBtn';
			a.style.display='none';
			a.target='_blank';  
			document.body.appendChild(a);
		}
		try{
			var URL=window.URL || window.webkitURL;
			a.href=URL.createObjectURL(blob);
			a.download = ftsetName+'.json';  
			if (typeof navigator.msSaveBlob == "function"){  //IE
				navigator.msSaveBlob(blob, ftsetName+'.json');
			}
			a.click();
			if(callback!=undefined){
				callback();
			}
		}catch(e){
			if(fail!=undefined){
				fail();
			}
		}
		
	}
});

//导出csv数据
gEcnu.Export.Data = gEcnu.Export.extend({
	init: function(geodb,tabname,filter){
		this.tabName=tabname;
		this.filter=filter;
		this.geodb = geodb;
		this.websqlUrl=gEcnu.config.geoserver+"WebSQL";
	},
	processAscyn:function (succ,fail){  //可选参数
		this._succCallback=succ;
		this._failCallback=fail;
		var self=this;
		var tabname=this.tabName;
		var filter=this.filter;
		this._getTabData(function (json){  
			var content='';
			var fldsArr=json.fldsDef;
			var allFlds=[];
			for(var k=0,fld_len=fldsArr.length;k<fld_len;k++){
				var fld=fldsArr[k].name;
				allFlds.push(fld);
			}
			var fldstr=allFlds.join(',');
			content=content+fldstr+"\r\n";
			for(var i=0,len=json.data.length;i<len;i++){
				var record=json.data[i];
				content+=record.join(',')+"\r\n";
			}
			self._download(content);
		});
	},
	_getTabData:function (callback){
		var websqlUrl=this.websqlUrl;
		var tabname=this.tabName;
		var filter=this.filter;
		var db = this.geodb;
		if(filter!=undefined && filter!=''){
			var sql="select * from "+tabname+" where "+filter;
		}else{
			var sql="select * from "+tabname;
		}
		var qryParams={
            	"mt":"SQLQuery",
                "GeoDB":db,
                "SQL":sql
        }
        var datastr = JSON.stringify(qryParams);
        var params = { req: datastr};
        try { 
            gEcnu.Util.ajax("POST", websqlUrl, params, true,function (data){
            	var jsonparser=JSON.parse(data);
  		 		callback(jsonparser);
            });
        }catch(e){
        	if(failCallback!=undefined){
  				failCallback();
  			}
        }
	},
	_download:function (content){
		var callback=this._succCallback;
		var fail=this._failCallback;
		var tabname=this.tabName;
		var blob = new Blob([content], {type: 'text'}); 
		var a =document.getElementById('downloadTabBtn');
		if(a==undefined){
			a=document.createElement('a');
			a.id='downloadTabBtn';
			a.style.display='none';
			a.download = tabname+'.csv';
			a.target='_blank';  
			document.body.appendChild(a);
		}
		try{
			var URL=window.URL || window.webkitURL;
			a.href=URL.createObjectURL(blob);
			if (typeof navigator.msSaveBlob == "function"){  //IE
				navigator.msSaveBlob(blob, tabname+'.csv');
			}
			a.click();
			if(callback!=undefined){
				callback();
			}
		}catch(e){
			if(fail!=undefined){
				fail();
			}
		}

	}
});


