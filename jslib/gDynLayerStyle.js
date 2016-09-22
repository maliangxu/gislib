
/**
*编辑动态图中各图层的样式 2015-3-3 by Lc
*/

gEcnu.DynLayerStyle=gClass.extend({
	init:function (ws,lyrname,style){
		this.ws=ws;
		this.lyrName=lyrname;
	},
	update:function (){

	}
});
/**
*编辑点图层的样式 
*/
//  数据库默认是ecnugis  其他的通过ws: publicdb/mapname
gEcnu.DynLayerStyle.PointStyle=gEcnu.DynLayerStyle.extend({
	init:function (ws,lyrname,style){
		this._super(ws,lyrname);
		this.ptStyle=style;
		this._getmapName();
	},
	_getmapName:function (){
		var ws=this.ws;
		if(ws.indexOf('/')>0){
			this.dbName=ws.split("/")[0];
			this.mapName=ws.split("/")[1];
		}else{
			this.dbName="ecnugis";
			this.mapName=ws;
		}
	},
	//ptstyle {color:,size:} option{success:,fail:}
	update:function (option){
		var self=this;
		var dbname=this.dbName;
		var mapname=this.mapName;
		var lyrname=this.lyrName;
		this.succCallback=option ? option.success : function (){};
		this.failCallback=option ? option.fail : function (){};
		var queryService=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (data){
			var mapid=data[0]['g_layers.map_id'];
			var updStyle={}; 
			var lyrStyle=self._getNewLyrStyle(data); 
			var labelstyle_all=self._getLabelStyle_all(data[0]['labelstyle']);
			var zindex_res=self._getZindex();
			if(zindex_res){
				updStyle['zIndex']=zindex_res;
			}
			if(lyrStyle){
				updStyle['lyrStyle']=lyrStyle;
			}
			if(labelstyle_all){
				updStyle['labelStyle_all']=labelstyle_all;
			}
			//console.log('updStyle',updStyle);
			//var updStyle={'lyrStyle':lyrStyle,'labelStyle_all':labelstyle_all,'zIndex':zindex};
			self._exec(mapid,lyrname,updStyle); 
        	 },'processFailed':function (){ }});
    	var params={'lyr':'g_layers,g_map','fields':'lyr_style,labelstyle,g_layers.map_id','filter':'lyr_name='+"'"+lyrname+"'"+"and g_map.map_id=g_layers.map_id and g_map.map_id="+"'"+mapname+"'"};
    	queryService.processAscyn(gEcnu.ActType.SQLQUERY,dbname,params);
	},
	_getNewLyrStyle:function (data){
		var ptStyle=this.ptStyle;
		var color=ptStyle.color;  // ?? 颜色值需要进一步处理
		var ptSize=ptStyle.size;
		var oldStyle=data[0]['lyr_style'];
		var mapid=data[0]['g_layers.map_id'];
		var arr=oldStyle.split(",");
		var newColor=arr[2];
		var newSize=arr[3];
		if(color!=undefined){
			newColor=this._webColor2dbcolor(color);
		}
		if(ptSize!=undefined){
			newSize=ptSize;
		}
		arr[2]=newColor;
		arr[3]=newSize;
		var updStyle=arr.join(","); 
		return updStyle;
	},
	_getLabelStyle_all:function (dbStyle){
		var style=this.ptStyle;
		var autoLabel=style.autoLabel;  
		var labelFld=style.labelField;
		var labelStyle=style.labelStyle;
		var all_labelStyle={};
		var arr=dbStyle.split(',');
		if(autoLabel!=undefined){ 
			all_labelStyle['autoLabel']=autoLabel;
		}
		if(labelFld && labelFld!=''){
			all_labelStyle['labelField']=labelFld;
		}
		if(labelStyle && labelStyle!=''){
			var ftColor=labelStyle.fontColor;
			var fontType=labelStyle.fontType ? labelStyle.fontType : arr[1];
			//var fontColor= ftColor ? ftColor.toString().substr(1,ftColor.length-1) : arr[2];//去除颜色值前面的 #
			var fontColor= ftColor ? this._webColor2dbcolor(ftColor): arr[2];
			var fontSize=labelStyle.fontSize ? "-"+labelStyle.fontSize : arr[3];
			var fontStyle=labelStyle.fontStyle ? labelStyle.fontStyle : arr[4];  
			all_labelStyle['labelStyle']="134,"+fontType+","+fontColor+","+fontSize+","+fontStyle;
		}     
		return all_labelStyle;
	},
	_getZindex:function (){
		var style=this.ptStyle;
		var zindex=style.zIndex;
		if(zindex && zindex!=''){
			return zindex;
		}else{
			return false;
		}
	},
	_exec:function (mapid,lyrname,updStyle){
		var succ=this.succCallback;
		var fail=this.failCallback;
		var dbname=this.dbName;
		var lyrStyle=updStyle.lyrStyle;
		var labelStyle_all=updStyle.labelStyle_all;
		var zindex=updStyle.zIndex;
		var updSQL='';

		var lyrstyle_sql=lyrStyle ? 'lyr_style='+"'"+lyrStyle+"'" : '';
		var zindex_sql=zindex ? "z_index="+zindex : '';
		var autolabel_sql=(labelStyle_all.autoLabel !=undefined) ? 'autolabel='+labelStyle_all.autoLabel : '';
		var labelfld_sql=(labelStyle_all.labelField !=undefined) ? 'lablefield='+"'"+labelStyle_all.labelField+"'" : '';
		var labelstyle_sql=(labelStyle_all.labelStyle !=undefined) ? 'labelstyle='+"'"+labelStyle_all.labelStyle+"'" : '';

		//var updSQL=lyrstyle_sql+","+zindex_sql+","+autolabel_sql+","+labelfld_sql+","+labelstyle_sql;
		//sql有为空的时候
		if(lyrstyle_sql!="")    updSQL+=lyrstyle_sql+",";
		if(zindex_sql!="")      updSQL+=zindex_sql+",";
		if(autolabel_sql!="")   updSQL+=autolabel_sql+",";
		if(labelfld_sql!="")    updSQL+=labelfld_sql+",";
		if(labelstyle_sql!="")  updSQL+=labelstyle_sql+",";
		updSQL=updSQL.substr(0,updSQL.length-1);
		if(updSQL==''){
			return;
		}
		var sqlService_upd=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (msg){ 
			if(succ!=undefined){
 				succ();
 			}
		},'processFailed':function (){
			if(fail!=undefined){
				fail();
			}
		 }});
		var sql="update g_layers set "+updSQL+" where map_id="+mapid+" and lyr_name="+"'"+lyrname+"'"; 
		// var sql="update g_layers set lyr_style="+"'"+updStyle+"'"+" where map_id="+mapid+" and lyr_name="+"'"+lyrname+"'"; 
        sqlService_upd.processAscyn(gEcnu.ActType.SQLEXEC,dbname,sql);
	},
	//color $0058ff
	_webColor2dbcolor:function (color){
		var rgb=color.substring(1);
		var rr=rgb.substr(0,2);
		var gg=rgb.substr(2,2);
		var bb=rgb.substr(4,2);
		newColor="$00"+bb+gg+rr;   //  clRed形式
		return newColor;
	},
	//针对16进制颜色和字符串颜色（red，green。。。转换）
	_getColor:function (color){

	}
});
/**
*编辑线图层的样式 
*/
gEcnu.DynLayerStyle.LineStyle=gEcnu.DynLayerStyle.extend({
	init:function (ws,lyrname,style){
		this._super(ws,lyrname);
		this.lineStyle=style;
		this._getmapName();
	},
	_getmapName:function (){
		var ws=this.ws;
		if(ws.indexOf('/')>0){
			this.dbName=ws.split("/")[0];
			this.mapName=ws.split("/")[1];
		}else{
			this.dbName="ecnugis";
			this.mapName=ws;
		}
	},
	//linestyle {lineType:,strokeColor:,lineWidth:}
	update:function (option){
		var self=this;
		var dbname=this.dbName;
		var mapname=this.mapName;
		var lyrname=this.lyrName;
		this.succCallback=option ? option.success : function (){};
		this.failCallback=option ? option.fail : function (){};
		var queryService=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (data){
			var mapid=data[0]['g_layers.map_id']; 
			var updStyle={}; 
			var lyrStyle=self._getNewLyrStyle(data); 
			var labelstyle_all=self._getLabelStyle_all(data[0]['labelstyle']);
			var zindex_res=self._getZindex();
			if(zindex_res){
				updStyle['zIndex']=zindex_res;
			}
			if(lyrStyle){
				updStyle['lyrStyle']=lyrStyle;
			}
			if(labelstyle_all){
				updStyle['labelStyle_all']=labelstyle_all;
			}
			//console.log('updStyle',updStyle);
			//var updStyle={'lyrStyle':lyrStyle,'labelStyle_all':labelstyle_all,'zIndex':zindex};
			self._exec(mapid,lyrname,updStyle); 
        	 },'processFailed':function (){ }});
    	var params={'lyr':'g_layers,g_map','fields':'lyr_style,labelstyle,g_layers.map_id','filter':'lyr_name='+"'"+lyrname+"'"+"and g_map.map_id=g_layers.map_id and g_map.map_id="+"'"+mapname+"'"};
    	queryService.processAscyn(gEcnu.ActType.SQLQUERY,dbname,params);
	},
	_getNewLyrStyle:function (data){
		var self=this;
		var lineStyle=this.lineStyle;
		var linetype=lineStyle.lineType;  
		var linecolor=lineStyle.strokeColor;
		var linewidth=lineStyle.lineWidth;
		var oldStyle=data[0]['lyr_style'];
		var mapid=data[0]['g_layers.map_id'];
		var arr=oldStyle.split(",");
		var newType;
		var newColor;
		var newWidth;
		if(linecolor!=undefined){
			newColor=this._webColor2dbcolor(linecolor);
		}else{
			newColor=arr[1];
		}
		newType=(linetype!=undefined) ? linetype : arr[0];
		newWidth=(linewidth!=undefined) ? linewidth : arr[2];

		arr[0]=newType;
		arr[1]=newColor;
		arr[2]=newWidth;
		var updStyle=arr.join(",");  
		return updStyle;
	},
	//labelStyle: {fontType:,fontColor:,fontSize:,fontStyle:}
	_getLabelStyle_all:function (dbStyle){
		var style=this.lineStyle;
		var autoLabel=style.autoLabel;
		var labelFld=style.labelField;
		var labelStyle=style.labelStyle;
		var all_labelStyle={};
		var arr=dbStyle.split(',');
		if(autoLabel!=undefined){
			all_labelStyle['autoLabel']=autoLabel;
		}
		if(labelFld && labelFld!=''){
			all_labelStyle['labelField']=labelFld;
		}
		if(labelStyle && labelStyle!=''){
			var ftColor=labelStyle.fontColor;
			var fontType=labelStyle.fontType ? labelStyle.fontType : arr[1];
			//var fontColor= ftColor ? ftColor.toString().substr(1,ftColor.length-1) : arr[2];//去除颜色值前面的 #
			var fontColor= ftColor ? this._webColor2dbcolor(ftColor): arr[2];
			var fontSize=labelStyle.fontSize ? "-"+labelStyle.fontSize : arr[3];
			var fontStyle=labelStyle.fontStyle ? labelStyle.fontStyle : arr[4];  
			all_labelStyle['labelStyle']="134,"+fontType+","+fontColor+","+fontSize+","+fontStyle;
		}
		return all_labelStyle;
	},
	_getZindex:function (){
		var style=this.lineStyle;
		var zindex=style.zIndex;
		if(zindex && zindex!=''){
			return zindex;
		}else{
			return false;
		}
	},
	_exec:function (mapid,lyrname,updStyle){
		var succ=this.succCallback;
		var fail=this.failCallback;
		var dbname=this.dbName;
		var lyrStyle=updStyle.lyrStyle;
		var labelStyle_all=updStyle.labelStyle_all;
		var zindex=updStyle.zIndex;
		var updSQL='';

		var lyrstyle_sql=lyrStyle ? 'lyr_style='+"'"+lyrStyle+"'" : '';
		var zindex_sql=zindex ? "z_index="+zindex : '';
		var autolabel_sql=(labelStyle_all.autoLabel !=undefined) ? 'autolabel='+labelStyle_all.autoLabel : '';
		var labelfld_sql=(labelStyle_all.labelField !=undefined) ? 'lablefield='+"'"+labelStyle_all.labelField+"'" : '';
		var labelstyle_sql=(labelStyle_all.labelStyle!=undefined) ? 'labelstyle='+"'"+labelStyle_all.labelStyle+"'" : '';

		if(lyrstyle_sql!="")    updSQL+=lyrstyle_sql+",";
		if(zindex_sql!="")      updSQL+=zindex_sql+",";
		if(autolabel_sql!="")   updSQL+=autolabel_sql+",";
		if(labelfld_sql!="")    updSQL+=labelfld_sql+",";
		if(labelstyle_sql!="")  updSQL+=labelstyle_sql+",";
		updSQL=updSQL.substr(0,updSQL.length-1);
		if(updSQL==''){
			return;
		}
		var sqlService_upd=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (msg){
			if(succ!=undefined){
 				succ();
 			}
		},'processFailed':function (){
			if(fail!=undefined){
				fail();
			}
		 }});
		var sql="update g_layers set "+updSQL+" where map_id="+mapid+" and lyr_name="+"'"+lyrname+"'"; 
        sqlService_upd.processAscyn(gEcnu.ActType.SQLEXEC,dbname,sql);
	},
	//color $0058ff
	_webColor2dbcolor:function (color){
		var rgb=color.substring(1);
		var rr=rgb.substr(0,2);
		var gg=rgb.substr(2,2);
		var bb=rgb.substr(4,2);
		newColor="$00"+bb+gg+rr;
		return newColor;
	},
	//针对16进制颜色和字符串颜色（red，green。。。转换）
	_getColor:function (color){

	}
});
/**
*编辑面图层的样式 
*/
//polystyle {borderType:,strokeColor:,borderWidth:,fillType:,fillColor:,autoLabel: ,labelField:,labelStyle:{fontType:,fontColor:,fontSize:,fontStyle:},zIndex:}
gEcnu.DynLayerStyle.PolygonStyle=gEcnu.DynLayerStyle.extend({
	init:function (ws,lyrname,style){
		this._super(ws,lyrname);
		this.polyStyle=style; 
		this._getmapName();
	},
	_getmapName:function (){
		var ws=this.ws;
		if(ws.indexOf('/')>0){
			this.dbName=ws.split("/")[0];
			this.mapName=ws.split("/")[1];
		}else{
			this.dbName="ecnugis";
			this.mapName=ws;
		}
	},
	update:function (option){
		var self=this;
		var dbname=this.dbName;
		var mapname=this.mapName;
		var lyrname=this.lyrName;
		this.succCallback=option ? option.success : function (){};
		this.failCallback=option ? option.fail : function (){};
		var queryService=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (data){
			var mapid=data[0]['g_layers.map_id'];
			var updStyle={}; 
			var lyrStyle=self._getNewLyrStyle(data); 
			var labelstyle_all=self._getLabelStyle_all(data[0]['labelstyle']);
			var zindex_res=self._getZindex();
			if(zindex_res){
				updStyle['zIndex']=zindex_res;
			}
			if(lyrStyle){
				updStyle['lyrStyle']=lyrStyle;
			}
			if(labelstyle_all){
				updStyle['labelStyle_all']=labelstyle_all;
			}
			//console.log('updStyle',updStyle);
			//var updStyle={'lyrStyle':lyrStyle,'labelStyle_all':labelstyle_all,'zIndex':zindex};
			self._exec(mapid,lyrname,updStyle); 
        	 },'processFailed':function (){ }});
    	var params={'lyr':'g_layers,g_map','fields':'lyr_style,labelstyle,g_layers.map_id','filter':'lyr_name='+"'"+lyrname+"'"+"and g_map.map_id=g_layers.map_id and g_map.map_id="+"'"+mapname+"'"};
    	queryService.processAscyn(gEcnu.ActType.SQLQUERY,dbname,params);
	},
	_getNewLyrStyle:function (data){
		var self=this;
		var polyStyle=this.polyStyle;
		var borderType=polyStyle.borderType;
		var strokeColor=polyStyle.strokeColor;
		var borderWidth=polyStyle.borderWidth;
		var fillType=polyStyle.fillType;
		var fillColor=polyStyle.fillColor;
		var oldStyle=data[0]['lyr_style'];
		var mapid=data[0]['g_layers.map_id'];
		var arr=oldStyle.split(",");
		var newBorderType,newStrokColor,newBorderWid,newFillType,newFillColor;
		newBorderType=(borderType!=undefined) ? borderType : arr[0];
		newStrokColor=strokeColor ? this._webColor2dbcolor(strokeColor) : arr[1];
		newBorderWid=(borderWidth!=undefined) ? borderWidth : arr[2];
		newFillType=(fillType!=undefined) ? fillType : arr[3]; 
		newFillColor=fillColor ? this._webColor2dbcolor(fillColor) : arr[4];
		arr[0]=newBorderType;
		arr[1]=newStrokColor;
		arr[2]=newBorderWid;
		arr[3]=newFillType;
		arr[4]=newFillColor;
		var updStyle=arr.join(","); 
		return updStyle;
	},
	//labelStyle: {fontType:,fontColor:,fontSize:,fontStyle:}
	_getLabelStyle_all:function (dbStyle){
		var style=this.polyStyle;
		var autoLabel=style.autoLabel;
		var labelFld=style.labelField;
		var labelStyle=style.labelStyle;
		var all_labelStyle={};
		var arr=dbStyle.split(',');
		if(autoLabel!=undefined){
			all_labelStyle['autoLabel']=autoLabel;
		}
		if(labelFld && labelFld!=''){
			all_labelStyle['labelField']=labelFld;
		}
		if(labelStyle && labelStyle!=''){
			var ftColor=labelStyle.fontColor;
			var fontType=labelStyle.fontType ? labelStyle.fontType : arr[1];
			// var fontColor= ftColor ? ftColor.toString().substr(1,ftColor.length-1) : arr[2];//去除颜色值前面的 # 
			var fontColor= ftColor ? this._webColor2dbcolor(ftColor) : arr[2];
			var fontSize=labelStyle.fontSize ? "-"+labelStyle.fontSize : arr[3];
			var fontStyle=labelStyle.fontStyle ? labelStyle.fontStyle : arr[4];  
			all_labelStyle['labelStyle']="134,"+fontType+","+fontColor+","+fontSize+","+fontStyle;
		}
		return all_labelStyle;
	},
	_getZindex:function (){
		var style=this.polyStyle;
		var zindex=style.zIndex;
		if(zindex && zindex!=''){
			return zindex;
		}else{
			return false;
		}
	},

	//updStyle={lyrStyle:,labelStyle_all:{autoLabel:,labelField:,labelStyle},zIndex:}
	_exec:function (mapid,lyrname,updStyle){
		var dbname=this.dbName;
		var succ=this.succCallback;
		var fail=this.failCallback;
		var lyrStyle=updStyle.lyrStyle;
		var labelStyle_all=updStyle.labelStyle_all;
		var zindex=updStyle.zIndex;
		var updSQL='';

		var lyrstyle_sql=lyrStyle ? 'lyr_style='+"'"+lyrStyle+"'" : '';
		var zindex_sql=zindex ? "z_index="+zindex : '';
		var autolabel_sql=(labelStyle_all.autoLabel !=undefined) ? 'autolabel='+labelStyle_all.autoLabel : '';
		var labelfld_sql=(labelStyle_all.labelField!=undefined) ? 'lablefield='+"'"+labelStyle_all.labelField+"'" : '';
		var labelstyle_sql=(labelStyle_all.labelStyle!=undefined) ? 'labelstyle='+"'"+labelStyle_all.labelStyle+"'" : '';

		//var updSQL=lyrstyle_sql+","+zindex_sql+","+autolabel_sql+","+labelfld_sql+","+labelstyle_sql;
		//sql有为空的时候
		if(lyrstyle_sql!="")    updSQL+=lyrstyle_sql+",";
		if(zindex_sql!="")      updSQL+=zindex_sql+",";
		if(autolabel_sql!="")   updSQL+=autolabel_sql+",";
		if(labelfld_sql!="")    updSQL+=labelfld_sql+",";
		if(labelstyle_sql!="")  updSQL+=labelstyle_sql+",";
		updSQL=updSQL.substr(0,updSQL.length-1);
		if(updSQL==''){
			return;
		}
		var sqlService_upd=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (msg){ 
			if(succ!=undefined){
 				succ();
 			}
		},'processFailed':function (){
			if(fail!=undefined){
				fail();
			}
		 }});
		var sql="update g_layers set "+updSQL+" where map_id="+mapid+" and lyr_name="+"'"+lyrname+"'"; 
		// var sql="update g_layers set lyr_style="+"'"+updStyle+"'"+" where map_id="+mapid+" and lyr_name="+"'"+lyrname+"'"; 
        sqlService_upd.processAscyn(gEcnu.ActType.SQLEXEC,dbname,sql);
	},

	/**
	*web中的html颜色与数据库中颜色格式之间的转换
	*@param color:#0058ff  
	*/
	_webColor2dbcolor:function (color){
		var rgb=color.substring(1);
		var rr=rgb.substr(0,2);
		var gg=rgb.substr(2,2);
		var bb=rgb.substr(4,2);
		newColor="$00"+bb+gg+rr;
		return newColor;
	},
	/**
	*返回16进制颜色值 六位编码 针对16进制颜色和字符串颜色（#ff0000, #f00,red 三种格式的统一）
	*/
	_get16Color:function (color){

	}
});
/********************2015-8-14获取指定图层的样式*************************/
gEcnu.DynLayerStyle.getStyle = gEcnu.DynLayerStyle.extend({
	init: function (ws,lyrnameArr){
		this.ws = ws;
		this.lyrArr = lyrnameArr;
		this._getmapName();
	},
	processAscyn: function (succ,fail){
		this.succCallback = arguments.length > 0 ? arguments[0] : function (){};
		this.failCallback = arguments.length > 1 ? arguments[1] : function (){};
		this._queryStyle();
	},
	_getmapName: function (){
		var ws=this.ws;
		if(ws.indexOf('/')>0){
			this.dbName=ws.split("/")[0];
			this.mapName=ws.split("/")[1];
		}else{
			this.dbName="ecnugis";
			this.mapName=ws;
		}
	},
	//查询图层样式
	_queryStyle: function (){
		var self = this;
		var ws = this.ws;
		var lyrs = this.lyrArr;
		var dbname = this.dbName;
		var mapname = this.mapName;
		var lyrStr = '';
		for(var i=0,len=lyrs.length;i<len;i++){
			if(i!=len-1){
				lyrStr +="'"+lyrs[i]+"'"+",";
			}else{
				lyrStr +="'"+lyrs[i]+"'";
			}
		}
		lyrStr = " ("+lyrStr+") ";
		var process = this._processResult;
		var fail = this.failCallback;
		var queryService=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (data){
			;
			self.bindContext(self,process,[data]);
        	 },'processFailed':function (){ 
        	 	fail();
        	 }});
    	var params={'lyr':'g_layers,g_map','fields':'lyr_name,alias,lyr_type,autolabel,lyr_style,labelstyle,lablefield','filter':'lyr_name in'+lyrStr+"and g_map.map_id=g_layers.map_id and g_map.map_id="+mapname};
    	queryService.processAscyn(gEcnu.ActType.SQLQUERY,dbname,params);
	},
	_processResult: function (data){ 
		var succ = this.succCallback;
		var paramArr = [];
		for(var i=0,len=data.length;i<len;i++){
			var record = data[i];
			var lyrname = record.lyr_name;
			var alias = record.alias;
			var shptype = record.lyr_type;
			var lyrstyle = record.lyr_style;
			var labelstyle = record.labelstyle;
			var isAutoLabel = record.autolabel;
			var labelfld = record.lablefield;
			var lyrStyleObj = this._getLyrStyle(shptype,lyrstyle);
			var labelstyleObj = this._getLabelStyle(isAutoLabel,labelfld,labelstyle);
			var param = {'lyrName':lyrname,'alias':alias,'shpType':shptype,'lyrStyle':lyrStyleObj,'labelStyle':labelstyleObj};
			paramArr.push(param);
		}
		succ(paramArr);
	},
	_getLabelStyle: function(isAutoLabel,labelfld,fStyle){
		var fontObj ={};
		var arr = fStyle.split(",");
		var fontFamily = arr[1] || '宋体';
		var fontColor = gEcnu.Util.dbColor2webColor(arr[2]);
		var fontSize = arr[3].toString().substring(1);
		fontObj={'autoLabel':isAutoLabel,'labelFld':labelfld,'fontFamily':fontFamily,'fontColor':fontColor,'fontSize':fontSize};
		return fontObj;
	},
	_getLyrStyle: function(shptype,shpStyle){  
		var arr = shpStyle.split(",");
		var lyrStyle = {};
		switch(shptype){
			case 1:
			case 8:
			var fillColor = gEcnu.Util.dbColor2webColor(arr[2]);
			var radius = arr[3];
			lyrStyle = {'radius':radius,'fillColor':fillColor};
			break;
			case 3:
			var strokeColor = gEcnu.Util.dbColor2webColor(arr[1]);
			var lineWidth = arr[2];
			lyrStyle = {'strokeColor':strokeColor,'lineWidth':lineWidth};
			break;
			case 5:
			var strokeColor = gEcnu.Util.dbColor2webColor(arr[1]);
			var lineWidth = arr[2];
			var isFill = arr[3] //填充样式 0：填充 1：不填充 其他值有填充样式（如斜线填充）
			var fillColor = gEcnu.Util.dbColor2webColor(arr[4]);
			lyrStyle = {'strokeColor':strokeColor,'lineWidth':lineWidth,'fillColor':fillColor};
			break;
		}
		return lyrStyle;
	},
	bindContext: function (context,fun,argsArr){
		fun.apply(context,argsArr);
	}
});
