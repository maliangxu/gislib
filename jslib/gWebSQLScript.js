/**
*执行sql文件
*/
gEcnu.WebsqlScript = gClass.extend({
    init: function(eventListener) { //alert(eventListener);
        this.processCompleted = eventListener.processCompleted || function (){};
        this.processFailed = eventListener.processFailed || function (){};
            
    },
    //{'scriptname':,'resname':....}
    processAscyn: function (params){
    	var reqParam={ req : JSON.stringify(params) };
    	var webscriptUrl = gEcnu.config.geoserver+"websqlscript";
        var _succ= this.processCompleted;   
        var _fail= this.processFailed;
        var self=this;  
        try { 
            gEcnu.Util.ajax("POST", webscriptUrl, reqParam, true, function(data){ 
                if(!data){ return;  }
                var sucCompleted= _succ;  
                var failComplete= _fail; 
                var jsonparse=JSON.parse(data);
                var totalResult=[];  //针对查询类 返回查询结果
                var msg={};   //针对增删改操作，返回操作信息
                var fldsdefArr =[]; //字段信息
                for(var key in jsonparse){
                    if(/^Query_\d+$/i.test(key)){ //筛选出query块 查询结果
                        var query_result=jsonparse[key];
                        // if(query_result['SQL_RESULT']!=undefined && query_result['SQL_RESULT']<0){
                        //     failComplete(query_result['SQL_MSG']);
                        //     return;
                        // }
                        var format_result=self._formatData(query_result);
                        var fldsdef = query_result.fldsDef;
                        totalResult = totalResult.concat(format_result);
                        fldsdefArr.push(fldsdef);
                    }else{
                        msg[key]=jsonparse[key];
                    }
                }
                var finalRes={'message':msg,"queryResult":totalResult,'fldsDef':fldsdefArr};
                if(sucCompleted!=undefined){ 
                    sucCompleted(finalRes);
                }
            },function() {
                //alert('websqlscript请求超时');
            },500000);
            }catch(e){
                if(_fail!=undefined){
                    _fail(e);
                }
            }
    },
    //将数据处理成键值对形式 result  sql块返回的结果 query_2、query_3....
    _formatData: function (result){
        var resultArr=[];
        if(result.data==undefined){
            resultArr.push(result)
            return resultArr;
        }
        var recs=result.data;
        var allTabFlds=result.fldsDef;
        var reqFldNum=allTabFlds.length; //这里返回所有字段
        for(var i=0,len=recs.length;i<len;i++){
            var returnRec={};
            var curRecord=recs[i];  //[0,shmap,5113080]
            if(curRecord.length!=reqFldNum){
                alert('查询字段与返回字段个数不统一，可能存在数据库中不字段！');
                return;
            }
            for(var j=0;j<reqFldNum;j++){
                var fldname=allTabFlds[j].name;
                var value=curRecord[j];
                returnRec[fldname]=value;  
            }
            resultArr.push(returnRec);
        }
        return resultArr;
    }
    // events: {
    //     _events: {},
    //     on: function(eventType, callback) {
    //         switch (eventType) {
    //             case 'processCompleted':
    //                 this._events.processCompleted = callback;
    //                 break;
    //             case 'processFailed':
    //                 this._events.processFailed = callback;
    //                 break;
    //         }
    //     }
    // }
});
