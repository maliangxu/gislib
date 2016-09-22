gEcnu.WebSQLServices = gClass.extend({
    init: function() {},
});
gEcnu.ActType = {};
gEcnu.ActType.ADD = "ADD";
gEcnu.ActType.DELETE = "DELETE";
gEcnu.ActType.UPDATE = "UPDATE";
gEcnu.ActType.SQLQUERY= "SQLQUERY";
gEcnu.ActType.SQLEXEC= "SQLEXEC";
gEcnu.ActType.SQLTask = "SQLTask";  
gEcnu.WebSQLServices.SQLServices=gEcnu.WebSQLServices.extend({
    init: function(eventsListener) {
        if (typeof eventsListener != "undefined") {
            this.events._events.processCompleted = eventsListener.processCompleted;
            this.events._events.processFailed = eventsListener.processFailed;
        }
    },
    processAscyn: function(ActionType,map,lyrOrSQL,Params){
        //addParams{'Fields':[Array],'Data':[[Array],[Array]]}
        //delParams{'Fields':'String','Data':[,]}
        //updateParams{'Fields':[Array],'Data':[[Array],[Array]]}Fields中第一个字段为更新标示
        //var websqlUrl = 'http://' + gEcnu.config.webHostIP + ":" + gEcnu.config.port + "/WebSQL";
        var websqlUrl = gEcnu.config.geoserver+"WebSQL";
        if(ActionType=="ADD"){
        	var addParams={
        		"mt":"SQLInsert",
                "GeoDB":map,
                "tablename":lyrOrSQL,
                "fldnames":Params.Fields,
                "data":Params.Data
            }
            var datastr = JSON.stringify(addParams);
            var params = {
                req: datastr
            };
        }else if(ActionType=="SQLQUERY"){
            //此时的lyrOrSQL为{'lyr':'','fields':'','filter':''}
            var sqlqrysql="select "+lyrOrSQL.fields+" from "+lyrOrSQL.lyr;
            if(typeof(lyrOrSQL.filter)!="undefined"&&lyrOrSQL.filter!=""){
                sqlqrysql=sqlqrysql+" where "+lyrOrSQL.filter;
            }
            var qryParams={
            	"mt":"SQLQuery",
                "GeoDB":map,
                "SQL":sqlqrysql
            }
            var datastr = JSON.stringify(qryParams);
            var params = {
                req: datastr
            };
        }else if(ActionType=="DELETE"){
            var delParams={
            	"mt":"SQLDelete",
                "GeoDB":map,
                "tablename":lyrOrSQL,
                "KeyFld":Params.Fields,
                "key":Params.Data
            }
            var datastr = JSON.stringify(delParams);
            var params = {
                req: datastr
            };
        }else if(ActionType=="UPDATE"){
        	var updateParams={
        		"mt":"SQLUpdate",
                "GeoDB":map,
                "tablename":lyrOrSQL,
                "fldnames":Params.Fields,
                "data":Params.Data
            }
            var datastr = JSON.stringify(updateParams);
            var params = {
                req: datastr
            };
        }else if(ActionType=="SQLEXEC"){
        	var sqlexecParams={
        		"mt":"SQLExec",
                "GeoDB":map,
                "SQL":lyrOrSQL
            }
            var datastr = JSON.stringify(sqlexecParams);
            var params = {
                req: datastr
            };
        }else if(ActionType=="SQLTask"){
            var sqltaskParams={
            	"mt":"SQLTask",
                "GeoDB":map,
                "task":lyrOrSQL
            }
            var datastr = JSON.stringify(sqltaskParams);
            var params = {
                req: datastr
            };
        }    
        var websqlServices = this;
        var events_data_suc=websqlServices.events._events.processCompleted;
        var events_data_fail=websqlServices.events._events.processFailed;
        try { 
            gEcnu.Util.ajax("POST", websqlUrl, params, true, function(data,process_res){ 
                var sucCompleted=process_res['suc'];   
                if (typeof(sucCompleted) != "undefined") {
                	var jsonparase;
                    if(ActionType=="SQLQUERY"){
                        //处理返回数据 
                        var jsonparase_tmp=JSON.parse(data);  
                        var returnfields=jsonparase_tmp.data;  
                        var returnfields_len=returnfields.length;
                        var allFieldsArr=jsonparase_tmp.fldsDef;
                        var allFlds=[];
                        var returnArrays=[];
                        //取出所有字段的名称
                        for(var ii=0;ii<allFieldsArr.length;ii++){
                            var fldname=allFieldsArr[ii].name;
                            allFlds.push(fldname);
                        }
                        for(var nn=0;nn<returnfields_len;nn++){
                            var tmprecords=returnfields[nn];//此时是一个数组
                          
                            if(lyrOrSQL.fields!='*' && lyrOrSQL.fields.indexOf('*')<0){ //如果不是查询所有字段，进行字段数判断
                            var qryFields=lyrOrSQL.fields.split(',');
                            var returnFields_len=tmprecords.length;
                            if(returnFields_len!=qryFields.length){
                                alert('查询字段与返回字段个数不统一，问题：存在数据库中不存在字段！');
                                return;
                            }
                            var recordjson={};
                          
                            for(var tt=0;tt<returnFields_len;tt++){
                                var fieldname=qryFields[tt];
                                var fieldvalue=tmprecords[tt];
                                recordjson[fieldname]=fieldvalue; 
                            }
                            returnArrays.push(recordjson);
                         }else{   //返回所有字段
                            var recordjson={};
                            var returnFields_len=tmprecords.length;
                            for(var tt=0;tt<returnFields_len;tt++){
                                var fieldname=allFlds[tt]; 
                                var fieldvalue=tmprecords[tt];  
                                recordjson[fieldname]=fieldvalue; 
                            }
                            returnArrays.push(recordjson);
                         } 
                        }
                        jsonparase=returnArrays;
                    }else{
                        jsonparase=JSON.parse(data)
                    }
                    sucCompleted(jsonparase,allFieldsArr);
                }
            },function() {
                alert('websql请求超时');
            },500000,{'suc':events_data_suc,'fail':events_data_fail});
        }catch (e) {
            if (typeof(events_data_fail) != "undefined") {
                events_data_fail(e);
            }
        }
    },
    events: {
        _events: {},
        on: function(eventType, callback) {
            switch (eventType) {
                case 'processCompleted':
                    this._events.processCompleted = callback;
                    break;
                case 'processFailed':
                    this._events.processFailed = callback;
                    break;
            }
        }
    }
});
gEcnu.WebSQLServices.SQLTasks = gEcnu.WebSQLServices.extend({
    init:function(ActionType,lyrOrSQL,Params){ 
       if(ActionType=="ADD"){
        	var addParams={
        		"mt":"SQLInsert",
                "tablename":lyrOrSQL,
                "fldnames":Params.Fields,
                "data":Params.Data
            }
            //return addParams;
             this.sqlTaskParams=addParams;
        }else if(ActionType=="DELETE"){
            var delParams={
            	"mt":"SQLDelete",
                "tablename":lyrOrSQL,
                "KeyFld":Params.Fields,
                "key":Params.Data
            }
            //return delParams;
           this.sqlTaskParams=delParams;
        }else if(ActionType=="UPDATE"){
        	var updateParams={
        		"mt":"SQLUpdate",
                "tablename":lyrOrSQL,
                "fldnames":Params.Fields,
                "data":Params.Data
            }
            //return updateParams;
            this.sqlTaskParams=updateParams;
        }else if(ActionType=="SQLEXEC"){
        	var sqlexecParams={
        		"mt":"SQLExec",
                "SQL":lyrOrSQL
            }
            //return sqlexecParams;
            this.sqlTaskParams=sqlexecParams;
        }
    }
});