gEcnu.WebFeatureServices = gClass.extend({
    init: function() {},
});
/**
 * 地图工具 进行点查、矩形查询、多边形查询等（图查属性）
 */
gEcnu.QueryType = {};
gEcnu.QueryType.Point = "point_qry";
gEcnu.QueryType.Line = "line_qry";
gEcnu.QueryType.Polygon = "polygon_qry";
gEcnu.QueryType.Rect = "rect_qry";
gEcnu.layerType = {};
gEcnu.layerType.Esri = "shp";
gEcnu.layerType.GeoDB = "geodb";
gEcnu.WebFeatureServices.QueryByGeometry = gEcnu.WebFeatureServices.extend({
    init: function(eventsListener) {
        if (typeof eventsListener != "undefined") {
            this.events._events.processCompleted = eventsListener.processCompleted;
            this.events._events.processFailed = eventsListener.processFailed;
        }
    },
    //{shape:geometry,queryLyrType:,mapOrGeodb:,lyrOrFtset:,returnShape:bool,returnFields:string,format:'geojson',zip:bool,tolerance:number}
    processAscyn: function(option) {
        //var webfeatureUrl = 'http://' + gEcnu.config.webHostIP + ":" + gEcnu.config.port + "/WebFeature";
        var webfeatureUrl =gEcnu.config.geoserver+"WebFeature";
        var geometry=option.shape;
        var lyrType=option.queryLyrType || 'geodb';
        var mapOrdb=option.mapOrGeodb;
        var lyrOrftset=option.lyrOrFtset;
        // var geodb=option.geodb;
        // var ftset=option.ftset;
        var shapeFlag_bool=option.returnShape || false;
        var returnFields=option.returnFields || '';
        var format=(option.format==undefined) ? '' : option.format;  
        var zip=(option.zip!=undefined) ? option.zip : true;             //默认使用压缩
        var tolerance=option.tolerance || 1000;
        console.log(option);
        var shapeFlag=0;
        if (shapeFlag_bool) {
            shapeFlag = 1;
        } else {
            shapeFlag = 0;
        }
        if (geometry instanceof gEcnu.Geometry.Point) {
            //TODO  执行点选查询
            var pointParams = {};
            if (lyrType == "geodb") {
                pointParams = {
                    "mt": "SeachAt",
                    "geoDB": mapOrdb,
                    "ftSet": lyrOrftset,
                    "format":format,
                    "zip":zip,
                    "Point": {
                        "x": geometry.x,
                        "y": geometry.y
                    },
                    "Err": tolerance,
                    "return": {
                        "shape": shapeFlag,
                        "fields": returnFields
                    }
                }
            } else if (lyrType == "shp") {
                pointParams = {
                    "mt": "SeachAt",
                    "map": mapOrdb,
                    "lyr": lyrOrftset,
                    "format":format,
                    "zip":zip,
                    "Point": {
                        "x": geometry.x,
                        "y": geometry.y
                    },
                    "Err": tolerance,
                    "return": {
                        "shape": shapeFlag,
                        "fields": returnFields
                    }
                }
            }
            var datastr = JSON.stringify(pointParams);
            var params = {
                req: datastr
            };
        } else if ((geometry instanceof gEcnu.Geometry.LineString) && geometry.className == "line") {
        }else if ((geometry instanceof gEcnu.Geometry.LinearRing) && geometry.className == "polygon") {
            var polygonParams = {};
            var qry_Polygon = new gEcnu.Feature.Polygon([geometry], {});
            var opeShape = qry_Polygon.shape;
            if (lyrType == "geodb") {
                polygonParams = {
                    "mt": "SelectByShape",
                    "geoDB": mapOrdb,
                    "ftSet": lyrOrftset,
                    "format":format,
                    "zip":zip,
                    "shape": opeShape,
                    "sMode": 0,
                    "return": {
                        "shape": shapeFlag,
                        "fields": returnFields
                    }
                }
            } else if (lyrType == "shp") {
                polygonParams = {
                    "mt": "SelectByShape",
                    "map": mapOrdb,
                    "lyr": lyrOrftset,
                    "format":format,
                    "zip":zip,
                    "shape": opeShape,
                    "sMode": 0,
                    "return": {
                        "shape": shapeFlag,
                        "fields": returnFields
                    }
                }
            }
            var datastr = JSON.stringify(polygonParams);
            var params = {
                req: datastr
            };
        }else if((geometry instanceof gEcnu.Geometry.RectRing) && geometry.className == "rect"){
            var rectParams = {};
            var shpBox=gEcnu.Util.getShpBox(geometry.points);
            if (lyrType == "geodb") {
                rectParams = {
                  "mt":"SelectByRect",
                  "geoDB":mapOrdb,
                  "ftSet":lyrOrftset,
                  "format":format,
                  "zip":zip,
                  "rect":{"xmin":shpBox[0],"ymin":shpBox[1],"xmax":shpBox[2],"ymax":shpBox[3]},
                  "return":{"shape":shapeFlag,"fields":returnFields}
                }
            } else if (lyrType == "shp") {
                rectParams = {
                  "mt":"SelectByRect",
                  "map":mapOrdb,
                  "lyr":lyrOrftset,
                  "format":format,
                  "zip":zip,
                  "rect":{"xmin":shpBox[0],"ymin":shpBox[1],"xmax":shpBox[2],"ymax":shpBox[3]},
                  "return":{"shape":shapeFlag,"fields":returnFields}
                }
            }
            var datastr = JSON.stringify(rectParams);
            var params = {
                req: datastr
            };
        }else if((geometry instanceof gEcnu.Geometry.RadiusRing) && geometry.className == "radius"){
            var radiusParams = {};
            if (lyrType == "geodb") {
                radiusParams = {
                  "mt":"SelectByRadius",
                  "geoDB":mapOrdb,
                  "ftSet":lyrOrftset,
                  "format":format,
                  "zip":zip,
                  "Point":{"x":geometry.centerPoint.x,"y":geometry.centerPoint.y},
                  "R":geometry.radius,
                  "return":{"shape":shapeFlag,"fields":returnFields}
                }
            } else if (lyrType == "shp") {
                radiusParams = {
                  "mt":"SelectByRadius",
                  "map":mapOrdb,
                  "lyr":lyrOrftset,
                  "format":format,
                  "zip":zip,
                  "Point":{"x":geometry.centerPoint.x,"y":geometry.centerPoint.y},
                  "R":geometry.radius,
                  "return":{"shape":shapeFlag,"fields":returnFields}
                }
            }
            var datastr = JSON.stringify(radiusParams);
            var params = {
                req: datastr
            };
        }
        var webfeaServices = this;
        var events_data_suc=webfeaServices.events._events.processCompleted;
        var events_data_fail=webfeaServices.events._events.processFailed;
        //gEcnu.webfeaServicesCase[id_num_data]=events_data;
        try {
            gEcnu.Util.ajax("POST", webfeatureUrl, params, true, function(data,process_res) {
                //console.log('完成');
                var sucCompleted=process_res['suc'];
                var jsonparase = JSON.parse(data);
                var returnFeatures = [];
                if(format.toLowerCase()=='geojson'){  //返回GeoJson格式的数据
                     returnFeatures = jsonparase.features; 
                     if (returnFeatures.length == 0) {
                        if (typeof(sucCompleted) != "undefined") {
                            sucCompleted(returnFeatures);
                        }
                    }else{
                         //TODO此时说明有返回要素
                        if (shapeFlag == 1) {  //有空间信息
                            var resultFeatures = [];
                            var decode_data=gEcnu.Util.decode(jsonparase);//解码GeoJson格式的数据
                           // console.log('解码后',JSON.stringify(decode_data));
                             returnFeatures= decode_data.features;  
                            for (var fetureNum = 0; fetureNum < returnFeatures.length; fetureNum++) {
                                var returnFeature = returnFeatures[fetureNum];
                                var geometry = returnFeature.geometry;
                                var coordinates =geometry.coordinates;
                                var properties= returnFeature.properties;
                                var shptype = geometry.type;  
                                var feature_Attr={};
                                switch(shptype) {
                                    case "Polygon": 
                                    var shpPart_len=coordinates.length;
                                    var lineRings=[];
                                    for(var i=0;i<shpPart_len;i++){
                                        var shpPart=coordinates[i];
                                        var lineRing_Points=[];
                                        for(var j=0,pt_len=shpPart.length;j<pt_len;j++){
                                            var pt=shpPart[j];
                                            var x=pt[0];
                                            var y=pt[1];
                                            var geometry_point = new gEcnu.Geometry.Point(x,y);
                                            lineRing_Points.push(geometry_point);
                                        }
                                        var tmpLineRing = new gEcnu.Geometry.LinearRing(lineRing_Points);
                                        lineRings.push(tmpLineRing);
                                    }
                                    for(var key in properties){
                                        feature_Attr[key] = properties[key];
                                    }
                                    feature_Attr.FID=returnFeature.id;
                                    var tmpFeature = new gEcnu.Feature.Polygon(lineRings, feature_Attr);
                                    resultFeatures.push(tmpFeature); 
                                    break;
                                    case "Polyline":
                                    var shpPart_len=coordinates.length;
                                    var lineStrings=[];
                                    for(var i=0;i<shpPart_len;i++){
                                        var shpPart=coordinates[i];
                                        var lineString_Points=[];
                                        for(var j=0,pt_len=shpPart.length;j<pt_len;j++){
                                            var pt=shpPart[j];
                                            var x=pt[0];
                                            var y=pt[1];
                                            var geometry_point = new gEcnu.Geometry.Point(x,y);
                                            lineString_Points.push(geometry_point);
                                        }
                                        var tmpLineString = new gEcnu.Geometry.LineString(lineString_Points);
                                        lineStrings.push(tmpLineString); 
                                    }
                                    for(var key in properties){
                                        feature_Attr[key] = properties[key];
                                    }
                                    feature_Attr.FID=returnFeature.id;
                                    var tmpFeature = new gEcnu.Feature.Polyline(lineStrings, feature_Attr);
                                    resultFeatures.push(tmpFeature); 
                                    break;
                                    case "Point":
                                    case "MultiPoint":
                                    var shpPart_len=coordinates.length;
                                    var lineStrings=[];
                                    for(var i=0;i<shpPart_len;i++){
                                        var shpPart=coordinates[i];
                                        var geometrys=[];
                                        for(var j=0,pt_len=shpPart.length;j<pt_len;j++){
                                            var pt=shpPart[j];
                                            var x=pt[0];
                                            var y=pt[1];
                                            var geometry_point = new gEcnu.Geometry.Point(x,y);
                                            geometrys.push(geometry_point);
                                        }
                                    }
                                    for(var key in properties){
                                        feature_Attr[key] = properties[key];
                                    }
                                    feature_Attr.FID=returnFeature.id;
                                    var tmpFeature = new gEcnu.Feature.Point(geometrys, feature_Attr);
                                    resultFeatures.push(tmpFeature); 
                                    break;
                                }  //switch  end
                            }  //for end
                            if (typeof(sucCompleted) != "undefined") {
                                sucCompleted(resultFeatures);
                            }
                        }else if(shapeFlag == 0){
                            //此时只是返回属性信息
                            var resultFeatures = [];
                            for (var fetureNum = 0; fetureNum < returnFeatures.length; fetureNum++) {
                            //TODO  此时返回fetures要素
                            var returnFeature = returnFeatures[fetureNum];
                            var shpfields = returnFeature.properties;
                            var center=shpfields.cp;
                            var feature_Attr = {};
                            for(var key in shpfields){
                                feature_Attr[key]= shpfields[key];
                            }
                            feature_Attr.FID = returnFeature.id;
                            feature_Attr.cx = center[0];
                            feature_Attr.cy = center[1];
                            resultFeatures.push(feature_Attr);
                            }
                            if (typeof(sucCompleted) != "undefined") {
                                sucCompleted(resultFeatures);
                            }
                        }
                    }
                }else{ //返回的数据格式是 非GeoJson
                    returnFeatures = jsonparase.Features;
                    if (returnFeatures.length == 0) {
                        //TODO直接调用回调函数
                        if (typeof(sucCompleted) != "undefined") {
                            sucCompleted(returnFeatures);
                        }
                    } else {
                    //TODO此时说明有返回要素
                    if (shapeFlag == 1) {
                        var resultFeatures = [];
                        for (var fetureNum = 0; fetureNum < returnFeatures.length; fetureNum++) {
                            //TODO  此时返回fetures要素
                            var returnFeature = returnFeatures[fetureNum];
                            var returnFeatureType = returnFeature.shape.shpType;
                            if (returnFeatureType == 5) {
                                //说明返回的是多边形要素
                                var shpParts = returnFeature.shape.Parts;
                                var Parts_len = shpParts.length;
                                var shpPoints = returnFeature.shape.Points;
                                var lineRings = [];
                                for (var j = 0; j < Parts_len; j++) {
                                    var begin_Index = shpParts[j];
                                    if (j == (Parts_len - 1)) {
                                        var next_Index = shpPoints.length;
                                    } else {
                                        var next_Index = shpParts[j + 1];
                                    }
                                    var lineRing_Points = [];
                                    for (var k = begin_Index; k < (next_Index - 1); k++) {
                                        var geometry_point = new gEcnu.Geometry.Point(shpPoints[k].X, shpPoints[k].Y);
                                        lineRing_Points.push(geometry_point);
                                    }
                                    var tmpLineRing = new gEcnu.Geometry.LinearRing(lineRing_Points);
                                    lineRings.push(tmpLineRing);
                                }
                                var shpfields = returnFeature.fields;
                                var feature_Attr = {};
                                if (typeof shpfields != "undefined") {
                                    var shpfields_len = shpfields.length;
                                    for (var kk = 0; kk < shpfields_len; kk++) {
                                        var tmpfield = shpfields[kk];
                                        for (m in tmpfield) {
                                            feature_Attr[m] = tmpfield[m];
                                        }
                                    }
                                }
                                feature_Attr.FID = returnFeature.FID;
                                var tmpFeature = new gEcnu.Feature.Polygon(lineRings, feature_Attr);
                                resultFeatures.push(tmpFeature);
                            } else if (returnFeatureType == 3) {
                                //说明返回的是线要素
                                var shpParts = returnFeature.shape.Parts;
                                var Parts_len = shpParts.length;
                                var shpPoints = returnFeature.shape.Points;
                                var lineStrings = [];
                                for (var j = 0; j < Parts_len; j++) {
                                    var begin_Index = shpParts[j];
                                    if (j == (Parts_len - 1)) {
                                        var next_Index = shpPoints.length;
                                    } else {
                                        var next_Index = shpParts[j + 1];
                                    }
                                    var lineString_Points = [];
                                    for (var k = begin_Index; k < next_Index; k++) {
                                        var geometry_point = new gEcnu.Geometry.Point(shpPoints[k].X, shpPoints[k].Y);
                                        lineString_Points.push(geometry_point);
                                    }
                                    var tmpLineString = new gEcnu.Geometry.LineString(lineString_Points);
                                    lineStrings.push(tmpLineString);
                                }
                                var shpfields = returnFeature.fields;
                                var feature_Attr = {};
                                if (typeof shpfields != "undefined") {
                                    var shpfields_len = shpfields.length;
                                    for (var kk = 0; kk < shpfields_len; kk++) {
                                        var tmpfield = shpfields[kk];
                                        for (m in tmpfield) {
                                            feature_Attr[m] = tmpfield[m];
                                        }
                                    }
                                }
                                feature_Attr.FID = returnFeature.FID;
                                var tmpFeature = new gEcnu.Feature.Polyline(lineStrings, feature_Attr);
                                resultFeatures.push(tmpFeature);
                            } else {
                                //说明返回的是点要素
                                var shpPoints = returnFeature.shape.Points;
                                var geometrys = [];
                                for (var j = 0; j < shpPoints.length; j++) {
                                    var geometry_point = new gEcnu.Geometry.Point(shpPoints[j].X, shpPoints[j].Y);
                                    geometrys.push(geometry_point);
                                }
                                var shpfields = returnFeature.fields;
                                var feature_Attr = {};
                                if (typeof shpfields != "undefined") {
                                    var shpfields_len = shpfields.length;
                                    for (var kk = 0; kk < shpfields_len; kk++) {
                                        var tmpfield = shpfields[kk];
                                        for (m in tmpfield) {
                                            feature_Attr[m] = tmpfield[m];
                                        }
                                    }
                                }
                                feature_Attr.FID = returnFeature.FID;
                                var tmpFeature = new gEcnu.Feature.Point(geometrys, feature_Attr);
                                resultFeatures.push(tmpFeature);
                            }
                        }
                        if (typeof(sucCompleted) != "undefined") {
                            sucCompleted(resultFeatures);
                        }
                    } else if (shapeFlag == 0) {
                        //此时只是返回属性信息
                        var resultFeatures = [];
                        for (var fetureNum = 0; fetureNum < returnFeatures.length; fetureNum++) {
                            //TODO  此时返回fetures要素
                            var returnFeature = returnFeatures[fetureNum];
                            //var returnFeatureType=returnFeature.shape.shpType;
                            var shpfields = returnFeature.fields;
                            var feature_Attr = {};
                            if (typeof shpfields != "undefined") {
                                var shpfields_len = shpfields.length;
                                for (var kk = 0; kk < shpfields_len; kk++) {
                                    var tmpfield = shpfields[kk];
                                    for (m in tmpfield) {
                                        feature_Attr[m] = tmpfield[m];
                                    }
                                }
                            }
                            feature_Attr.FID = returnFeature.FID;
                            feature_Attr.cx = returnFeature.cx;
                            feature_Attr.cy = returnFeature.cy;
                            resultFeatures.push(feature_Attr);
                        }
                        if (typeof(sucCompleted) != "undefined") {
                            sucCompleted(resultFeatures);
                        }
                    }
                }

            }   
            }, function() {
                alert('webfeature请求超时');
            }, 50000,{'suc':events_data_suc,'fail':events_data_fail});
        } catch (e) {
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
/**
 * 根据一个要素图层查询另一个图层
 * @param geometry
 * @param qryLyr
 * @param targetLyr
 */
gEcnu.WebFeatureServices.QueryByGeometry_ex=gEcnu.WebFeatureServices.extend({
    init: function(eventsListener) {
        if (typeof eventsListener != "undefined") {
            this.events._events.processCompleted = eventsListener.processCompleted;
            this.events._events.processFailed = eventsListener.processFailed;
        }
    },
    // option {'geometry':,qryLyr:{name:,LyrType:geodb,mapOrGeodb:},targetLyr:{name:,LyrType:,mapOrGeodb:,returnShape:bool,returnFields:string}}  
    processAscyn: function(option){
        var webfeatureUrl =gEcnu.config.geoserver+"WebFeature";
        var geometry=option.geometry;
        var qryLyrInfo = option.qryLyr;
        var targetLyrInfo = option.targetLyr;

        var qryLyr = qryLyrInfo.name;
        var lyrtype_qry = qryLyrInfo.LyrType;
        var map_qry = qryLyrInfo.mapOrGeodb;

        var targetLyr = targetLyrInfo.name;
        var lyrtype_target = targetLyrInfo.LyrType;
        var map_target = targetLyrInfo.mapOrGeodb;
        var shapeBool_target = targetLyrInfo.returnShape;
        var returnFlds_target = targetLyrInfo.returnFields;
        var shapeFlag_target=0;
        if (shapeBool_target) {
            shapeFlag_target = 1;
        } else {
            shapeFlag_target = 0;
        }

        
        var self = this;
        var events_data_suc=self.events._events.processCompleted;
        var events_data_fail=self.events._events.processFailed;

        //根据点击位置获取qrylyr查询图层的形状,再根据查询出来的形状获取目标图层
        var qry_param=this._getQueryParam(geometry,lyrtype_qry,map_qry,qryLyr,1,''); 
        this._execute(qry_param,function (resultFeas){  //查询落在这些要素范围内的目标图层
            var result_total=[];  //对目标图层的查询结果
            var i=0,qry_len=resultFeas.length;
            var getFeas= function (){
                if(i>=qry_len){   return result_total;  }
                var geometry_i=resultFeas[i].getGeometrys()[0]; 
                var target_param=self._getQueryParam(geometry_i,lyrtype_target,map_target,targetLyr,shapeFlag_target,returnFlds_target);
                self._execute(target_param,function (resultFeatures){
                    result_total=result_total.concat(resultFeatures);
                    i++;
                    getFeas();
                });
                
            };
            getFeas();
        },function (){
            if(events_data_fail!=undefined){
                events_data_fail();
            }
        });
    },
    //获取几何查询的参数
     _getQueryParam: function (geometry,lyrType,mapOrdb,lyrOrftset,shapeFlag,returnFields){  
        var format='geojson';  //默认使用Geojson压缩格式，
        var zip=true;
        if (geometry instanceof gEcnu.Geometry.Point) { 
            //TODO  执行点选查询
            var pointParams = {};
            if (lyrType == "geodb") {
                pointParams = {
                    "mt": "SeachAt",
                    "geoDB": mapOrdb,
                    "ftSet": lyrOrftset,
                    "format":format,
                    "zip":zip,
                    "Point": {
                        "x": geometry.x,
                        "y": geometry.y
                    },
                    "Err": 1000,
                    "return": {
                        "shape": shapeFlag,
                        "fields": returnFields
                    }
                }
            } else if (lyrType == "shp") {
                pointParams = {
                    "mt": "SeachAt",
                    "map": mapOrdb,
                    "lyr": lyrOrftset,
                    "format":format,
                    "zip":zip,
                    "Point": {
                        "x": geometry.x,
                        "y": geometry.y
                    },
                    "Err": 1000,
                    "return": {
                        "shape": shapeFlag,
                        "fields": returnFields
                    }
                }
            }
            var datastr = JSON.stringify(pointParams);
            var params = {
                req: datastr
            };
        } else if ((geometry instanceof gEcnu.Geometry.LineString) && geometry.className == "line") {
        }else if ((geometry instanceof gEcnu.Geometry.LinearRing) && geometry.className == "polygon") { 
            var polygonParams = {};
            var qry_Polygon = new gEcnu.Feature.Polygon([geometry], {});
            var opeShape = qry_Polygon.shape;
            if (lyrType == "geodb") {
                polygonParams = {
                    "mt": "SelectByShape",
                    "geoDB": mapOrdb,
                    "ftSet": lyrOrftset,
                    "format":format,
                    "zip":zip,
                    "shape": opeShape,
                    "sMode": 0,
                    "return": {
                        "shape": shapeFlag,
                        "fields": returnFields
                    }
                }
            } else if (lyrType == "shp") { 
                polygonParams = {
                    "mt": "SelectByShape",
                    "map": mapOrdb,
                    "lyr": lyrOrftset,
                    "format":format,
                    "zip":zip,
                    "shape": opeShape,
                    "sMode": 0,
                    "return": {
                        "shape": shapeFlag,
                        "fields": returnFields
                    }
                }
                
            }
            var datastr = JSON.stringify(polygonParams);
            var params = {
                req: datastr
            };
        }else if((geometry instanceof gEcnu.Geometry.RectRing) && geometry.className == "rect"){
            var rectParams = {};
            var shpBox=gEcnu.Util.getShpBox(geometry.points);
            if (lyrType == "geodb") {
                rectParams = {
                  "mt":"SelectByRect",
                  "geoDB":mapOrdb,
                  "ftSet":lyrOrftset,
                  "format":format,
                  "zip":zip,
                  "rect":{"xmin":shpBox[0],"ymin":shpBox[1],"xmax":shpBox[2],"ymax":shpBox[3]},
                  "return":{"shape":shapeFlag,"fields":returnFields}
                }
            } else if (lyrType == "shp") {
                rectParams = {
                  "mt":"SelectByRect",
                  "map":mapOrdb,
                  "lyr":lyrOrftset,
                  "format":format,
                  "zip":zip,
                  "rect":{"xmin":shpBox[0],"ymin":shpBox[1],"xmax":shpBox[2],"ymax":shpBox[3]},
                  "return":{"shape":shapeFlag,"fields":returnFields}
                }
            }
            var datastr = JSON.stringify(rectParams);
            var params = {
                req: datastr
            };
        }else if((geometry instanceof gEcnu.Geometry.RadiusRing) && geometry.className == "radius"){
            var radiusParams = {};
            if (lyrType == "geodb") {
                radiusParams = {
                  "mt":"SelectByRadius",
                  "geoDB":mapOrdb,
                  "ftSet":lyrOrftset,
                  "format":format,
                  "zip":zip,
                  "Point":{"x":geometry.centerPoint.x,"y":geometry.centerPoint.y},
                  "R":geometry.radius,
                  "return":{"shape":shapeFlag,"fields":returnFields}
                }
            } else if (lyrType == "shp") {
                radiusParams = {
                  "mt":"SelectByRadius",
                  "map":mapOrdb,
                  "lyr":lyrOrftset,
                  "format":format,
                  "zip":zip,
                  "Point":{"x":geometry.centerPoint.x,"y":geometry.centerPoint.y},
                  "R":geometry.radius,
                  "return":{"shape":shapeFlag,"fields":returnFields}
                }
            }
            var datastr = JSON.stringify(radiusParams);
            var params = {
                req: datastr
            };
        }
        return params;
    },
    //执行查询
    _execute: function (params,callback,failback){
        var webfeatureUrl =gEcnu.config.geoserver+"WebFeature";
        var succCallback=arguments.length > 1 ? arguments[1] : function (){};
        var failCallback=arguments.length > 2 ? arguments[2] : function (){};
        var para_obj=JSON.parse(params.req);
        var format=para_obj.format;
        var shapeFlag=para_obj.return.shape;
        try {
            gEcnu.Util.ajax("POST", webfeatureUrl, params, true, function(data,process_res){
                //console.log('完成');
                var sucCompleted=process_res['suc'];
                var jsonparase = JSON.parse(data);
                var returnFeatures = [];
                if(format.toLowerCase()=='geojson'){  //返回GeoJson格式的数据
                     returnFeatures = jsonparase.features; 
                     if (returnFeatures.length == 0) {
                        if (typeof(sucCompleted) != "undefined") {
                            sucCompleted(returnFeatures);
                        }
                    }else{
                         //TODO此时说明有返回要素
                        if (shapeFlag == 1) {  //有空间信息
                            var resultFeatures = [];
                            var decode_data=gEcnu.Util.decode(jsonparase);//解码GeoJson格式的数据
                           // console.log('解码后',JSON.stringify(decode_data));
                             returnFeatures= decode_data.features;  
                            for (var fetureNum = 0; fetureNum < returnFeatures.length; fetureNum++) {
                                var returnFeature = returnFeatures[fetureNum];
                                var geometry = returnFeature.geometry;
                                var coordinates =geometry.coordinates;
                                var properties= returnFeature.properties;
                                var shptype = geometry.type;  
                                var feature_Attr={};
                                switch(shptype) {
                                    case "Polygon": 
                                    var shpPart_len=coordinates.length;
                                    var lineRings=[];
                                    for(var i=0;i<shpPart_len;i++){
                                        var shpPart=coordinates[i];
                                        var lineRing_Points=[];
                                        for(var j=0,pt_len=shpPart.length;j<pt_len;j++){
                                            var pt=shpPart[j];
                                            var x=pt[0];
                                            var y=pt[1];
                                            var geometry_point = new gEcnu.Geometry.Point(x,y);
                                            lineRing_Points.push(geometry_point);
                                        }
                                        var tmpLineRing = new gEcnu.Geometry.LinearRing(lineRing_Points);
                                        lineRings.push(tmpLineRing);
                                    }
                                    for(var key in properties){
                                        feature_Attr[key] = properties[key];
                                    }
                                    feature_Attr.FID=returnFeature.id;
                                    var tmpFeature = new gEcnu.Feature.Polygon(lineRings, feature_Attr);
                                    resultFeatures.push(tmpFeature); 
                                    break;
                                    case "Polyline":
                                    var shpPart_len=coordinates.length;
                                    var lineStrings=[];
                                    for(var i=0;i<shpPart_len;i++){
                                        var shpPart=coordinates[i];
                                        var lineString_Points=[];
                                        for(var j=0,pt_len=shpPart.length;j<pt_len;j++){
                                            var pt=shpPart[j];
                                            var x=pt[0];
                                            var y=pt[1];
                                            var geometry_point = new gEcnu.Geometry.Point(x,y);
                                            lineString_Points.push(geometry_point);
                                        }
                                        var tmpLineString = new gEcnu.Geometry.LineString(lineString_Points);
                                        lineStrings.push(tmpLineString); 
                                    }
                                    for(var key in properties){
                                        feature_Attr[key] = properties[key];
                                    }
                                    feature_Attr.FID=returnFeature.id;
                                    var tmpFeature = new gEcnu.Feature.Polyline(lineStrings, feature_Attr);
                                    resultFeatures.push(tmpFeature); 
                                    break;
                                    case "Point":
                                    case "MultiPoint":
                                    var shpPart_len=coordinates.length;
                                    var lineStrings=[];
                                    for(var i=0;i<shpPart_len;i++){
                                        var shpPart=coordinates[i];
                                        var geometrys=[];
                                        for(var j=0,pt_len=shpPart.length;j<pt_len;j++){
                                            var pt=shpPart[j];
                                            var x=pt[0];
                                            var y=pt[1];
                                            var geometry_point = new gEcnu.Geometry.Point(x,y);
                                            geometrys.push(geometry_point);
                                        }
                                    }
                                    for(var key in properties){
                                        feature_Attr[key] = properties[key];
                                    }
                                    feature_Attr.FID=returnFeature.id;
                                    var tmpFeature = new gEcnu.Feature.Point(geometrys, feature_Attr);
                                    resultFeatures.push(tmpFeature); 
                                    break;
                                }  //switch  end
                            }  //for end
                            if (typeof(sucCompleted) != "undefined") {
                                sucCompleted(resultFeatures);
                            }
                        }else if(shapeFlag == 0){
                            //此时只是返回属性信息
                            var resultFeatures = [];
                            for (var fetureNum = 0; fetureNum < returnFeatures.length; fetureNum++) {
                            //TODO  此时返回fetures要素
                            var returnFeature = returnFeatures[fetureNum];
                            var shpfields = returnFeature.properties;
                            var center=shpfields.cp;
                            var feature_Attr = {};
                            for(var key in shpfields){
                                feature_Attr[key]= shpfields[key];
                            }
                            feature_Attr.FID = returnFeature.id;
                            feature_Attr.cx = center[0];
                            feature_Attr.cy = center[1];
                            resultFeatures.push(feature_Attr);
                            }
                            if (typeof(sucCompleted) != "undefined") {
                                sucCompleted(resultFeatures);
                            }
                        }
                    }
                }else{ //返回的数据格式是 非GeoJson
                    returnFeatures = jsonparase.Features;
                    if (returnFeatures.length == 0) {
                        //TODO直接调用回调函数
                        if (typeof(sucCompleted) != "undefined") {
                            sucCompleted(returnFeatures);
                        }
                    } else {
                    //TODO此时说明有返回要素
                    if (shapeFlag == 1) {
                        var resultFeatures = [];
                        for (var fetureNum = 0; fetureNum < returnFeatures.length; fetureNum++) {
                            //TODO  此时返回fetures要素
                            var returnFeature = returnFeatures[fetureNum];
                            var returnFeatureType = returnFeature.shape.shpType;
                            if (returnFeatureType == 5) {
                                //说明返回的是多边形要素
                                var shpParts = returnFeature.shape.Parts;
                                var Parts_len = shpParts.length;
                                var shpPoints = returnFeature.shape.Points;
                                var lineRings = [];
                                for (var j = 0; j < Parts_len; j++) {
                                    var begin_Index = shpParts[j];
                                    if (j == (Parts_len - 1)) {
                                        var next_Index = shpPoints.length;
                                    } else {
                                        var next_Index = shpParts[j + 1];
                                    }
                                    var lineRing_Points = [];
                                    for (var k = begin_Index; k < (next_Index - 1); k++) {
                                        var geometry_point = new gEcnu.Geometry.Point(shpPoints[k].X, shpPoints[k].Y);
                                        lineRing_Points.push(geometry_point);
                                    }
                                    var tmpLineRing = new gEcnu.Geometry.LinearRing(lineRing_Points);
                                    lineRings.push(tmpLineRing);
                                }
                                var shpfields = returnFeature.fields;
                                var feature_Attr = {};
                                if (typeof shpfields != "undefined") {
                                    var shpfields_len = shpfields.length;
                                    for (var kk = 0; kk < shpfields_len; kk++) {
                                        var tmpfield = shpfields[kk];
                                        for (m in tmpfield) {
                                            feature_Attr[m] = tmpfield[m];
                                        }
                                    }
                                }
                                feature_Attr.FID = returnFeature.FID;
                                var tmpFeature = new gEcnu.Feature.Polygon(lineRings, feature_Attr);
                                resultFeatures.push(tmpFeature);
                            } else if (returnFeatureType == 3) {
                                //说明返回的是线要素
                                var shpParts = returnFeature.shape.Parts;
                                var Parts_len = shpParts.length;
                                var shpPoints = returnFeature.shape.Points;
                                var lineStrings = [];
                                for (var j = 0; j < Parts_len; j++) {
                                    var begin_Index = shpParts[j];
                                    if (j == (Parts_len - 1)) {
                                        var next_Index = shpPoints.length;
                                    } else {
                                        var next_Index = shpParts[j + 1];
                                    }
                                    var lineString_Points = [];
                                    for (var k = begin_Index; k < next_Index; k++) {
                                        var geometry_point = new gEcnu.Geometry.Point(shpPoints[k].X, shpPoints[k].Y);
                                        lineString_Points.push(geometry_point);
                                    }
                                    var tmpLineString = new gEcnu.Geometry.LineString(lineString_Points);
                                    lineStrings.push(tmpLineString);
                                }
                                var shpfields = returnFeature.fields;
                                var feature_Attr = {};
                                if (typeof shpfields != "undefined") {
                                    var shpfields_len = shpfields.length;
                                    for (var kk = 0; kk < shpfields_len; kk++) {
                                        var tmpfield = shpfields[kk];
                                        for (m in tmpfield) {
                                            feature_Attr[m] = tmpfield[m];
                                        }
                                    }
                                }
                                feature_Attr.FID = returnFeature.FID;
                                var tmpFeature = new gEcnu.Feature.Polyline(lineStrings, feature_Attr);
                                resultFeatures.push(tmpFeature);
                            } else {
                                //说明返回的是点要素
                                var shpPoints = returnFeature.shape.Points;
                                var geometrys = [];
                                for (var j = 0; j < shpPoints.length; j++) {
                                    var geometry_point = new gEcnu.Geometry.Point(shpPoints[j].X, shpPoints[j].Y);
                                    geometrys.push(geometry_point);
                                }
                                var shpfields = returnFeature.fields;
                                var feature_Attr = {};
                                if (typeof shpfields != "undefined") {
                                    var shpfields_len = shpfields.length;
                                    for (var kk = 0; kk < shpfields_len; kk++) {
                                        var tmpfield = shpfields[kk];
                                        for (m in tmpfield) {
                                            feature_Attr[m] = tmpfield[m];
                                        }
                                    }
                                }
                                feature_Attr.FID = returnFeature.FID;
                                var tmpFeature = new gEcnu.Feature.Point(geometrys, feature_Attr);
                                resultFeatures.push(tmpFeature);
                            }
                        }
                        if (typeof(sucCompleted) != "undefined") {
                            sucCompleted(resultFeatures);
                        }
                    } else if (shapeFlag == 0) {
                        //此时只是返回属性信息
                        var resultFeatures = [];
                        for (var fetureNum = 0; fetureNum < returnFeatures.length; fetureNum++) {
                            //TODO  此时返回fetures要素
                            var returnFeature = returnFeatures[fetureNum];
                            //var returnFeatureType=returnFeature.shape.shpType;
                            var shpfields = returnFeature.fields;
                            var feature_Attr = {};
                            if (typeof shpfields != "undefined") {
                                var shpfields_len = shpfields.length;
                                for (var kk = 0; kk < shpfields_len; kk++) {
                                    var tmpfield = shpfields[kk];
                                    for (m in tmpfield) {
                                        feature_Attr[m] = tmpfield[m];
                                    }
                                }
                            }
                            feature_Attr.FID = returnFeature.FID;
                            feature_Attr.cx = returnFeature.cx;
                            feature_Attr.cy = returnFeature.cy;
                            resultFeatures.push(feature_Attr);
                        }
                        if (typeof(sucCompleted) != "undefined") {
                            sucCompleted(resultFeatures);
                        }
                    }
                }

            }   
            }, function() {
                alert('webfeature请求超时');
            }, 50000,{'suc':succCallback,'fail':failCallback});
        } catch (e) {
            if (typeof(failCallback) != "undefined") {
                failCallback(e);
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
/**
 * 进行要素查询（属性查图）
 */
gEcnu.WebFeatureServices.QueryBySQL = gEcnu.WebFeatureServices.extend({
    init: function(eventsListener) {
        if (typeof eventsListener != "undefined") {
            this.events._events.processCompleted = eventsListener.processCompleted;
            this.events._events.processFailed = eventsListener.processFailed;
        }
    },
    //option {sql:,lyrType:,mapOrGeodb:,lyrOrFtset:,returnFields:string,returnShape:bool,format:geoJson,zip:}
    processAscyn: function(option) {
        //var webfeatureUrl = 'http://' + gEcnu.config.webHostIP + ":" + gEcnu.config.port + "/WebFeature";
        var webfeatureUrl =gEcnu.config.geoserver+"WebFeature";
         var sql=option.sql || '';
         var lyrType=option.lyrType;
         var mapOrdb=option.mapOrGeodb;
         var lyrOrftset=option.lyrOrFtset;
         // var geodb=option.geodb;
         // var ftset=option.ftset;
         var returnFields=option.returnFields || '';
         var returnShape=option.returnShape || false;
         var format=option.format || '';
         var zip=(option.zip!=undefined)? option.zip : true; //默认使用压缩  （）
         var shapeFlag=0;
        if (returnShape) {
            shapeFlag = 1;
        } else {
            shapeFlag = 0;
        }
        //TODO  执行点选查询
        var sqlParams = {};
        if (lyrType == "geodb") {
            sqlParams = {
                "mt":"SQLQuery",
                "geoDB":mapOrdb,
                "ftSet":lyrOrftset,
                "format":format,
                "zip":zip,
                "sql":sql,
                "return":{"shape":shapeFlag,"fields":returnFields}
            }
        } else if (lyrType == "shp") {
            alert('暂时不支持shp图层查询');return;
            sqlParams = {
                "mt":"SQLQuery",
                "map":mapOrdb,
                "lyr":lyrOrftset,
                "format":format,
                "zip":zip,
                "sql":sql,
                "return":{"shape":shapeFlag,"fields":returnFields}
            }
        }
        var datastr = JSON.stringify(sqlParams);
        var params = {
            req: datastr
        };
        var webfeaServices = this;
        var events_data_suc=webfeaServices.events._events.processCompleted;
        var events_data_fail=webfeaServices.events._events.processFailed;
        try {
            gEcnu.Util.ajax("POST", webfeatureUrl, params, true, function(data,process_res) {
                var sucCompleted=process_res['suc']; 
                var jsonparase = JSON.parse(data);   
                var returnFeatures = [];   
               if(format.toLowerCase()=='geojson'){ //返回的空间数据是GeoJson格式
                    returnFeatures = jsonparase.features; 
                    console.log('geojson',jsonparase);
                    if(returnFeatures.length == 0){
                        //TODO直接调用回调函数
                        if (typeof(sucCompleted) != "undefined") {
                            sucCompleted(returnFeatures);
                        }
                    }else{  //TODO此时说明有返回要素
                        if (shapeFlag == 1){
                            var resultFeatures = [];
                            var decode_data=gEcnu.Util.decode(jsonparase);//解码GeoJson格式的数据
                            returnFeatures= decode_data.features;  
                            for (var fetureNum = 0; fetureNum < returnFeatures.length; fetureNum++) {
                                var returnFeature = returnFeatures[fetureNum];
                                var geometry = returnFeature.geometry;
                                var coordinates =geometry.coordinates;
                                var properties= returnFeature.properties;
                                var shptype = geometry.type;
                                var feature_Attr={};
                                var iferror=false;
                                switch(shptype){
                                    case "Polygon":
                                    var shpPart_len=coordinates.length;
                                    var lineRings=[];
                                    for(var i=0;i<shpPart_len;i++){
                                        var shpPart=coordinates[i];
                                        var lineRing_Points=[];
                                        for(var j=0,pt_len=shpPart.length;j<pt_len;j++){
                                            var pt=shpPart[j];
                                            var x=pt[0];
                                            var y=pt[1];
                                            var geometry_point = new gEcnu.Geometry.Point(x,y);
                                            lineRing_Points.push(geometry_point);
                                        }
                                        lineRing_Points.pop();  //Geojson中已经是闭合的点数组
                                        var tmpLineRing = new gEcnu.Geometry.LinearRing(lineRing_Points);
                                        if(tmpLineRing.className=="polygon"){
                                            lineRings.push(tmpLineRing);
                                        }else{
                                           iferror=true;
                                           break;
                                        }
                                    }
                                    if(iferror){  continue;}
                                    for(var key in properties){
                                        feature_Attr[key] = properties[key];
                                    }
                                    feature_Attr.FID=returnFeature.id;
                                    var tmpFeature = new gEcnu.Feature.Polygon(lineRings, feature_Attr);
                                    resultFeatures.push(tmpFeature); 
                                    break;
                                    case "Polyline":
                                    var shpPart_len=coordinates.length;
                                    var lineStrings=[];
                                    for(var i=0;i<shpPart_len;i++){
                                        var shpPart=coordinates[i];
                                        var lineString_Points=[];
                                        for(var j=0,pt_len=shpPart.length;j<pt_len;j++){
                                            var pt=shpPart[j];
                                            var x=pt[0];
                                            var y=pt[1];
                                            var geometry_point = new gEcnu.Geometry.Point(x,y);
                                            lineString_Points.push(geometry_point);
                                        }
                                        var tmpLineString = new gEcnu.Geometry.LineString(lineString_Points);
                                        lineStrings.push(tmpLineString); 
                                    }
                                    for(var key in properties){
                                        feature_Attr[key] = properties[key];
                                    }
                                    feature_Attr.FID=returnFeature.id;
                                    var tmpFeature = new gEcnu.Feature.Polyline(lineStrings, feature_Attr);
                                    resultFeatures.push(tmpFeature); 
                                    break;
                                    case "Point":
                                    case "MultiPoint":
                                    var shpPart_len=coordinates.length;
                                    var lineStrings=[];
                                    for(var i=0;i<shpPart_len;i++){
                                        var shpPart=coordinates[i];
                                        var geometrys=[];
                                        for(var j=0,pt_len=shpPart.length;j<pt_len;j++){
                                            var pt=shpPart[j];
                                            var x=pt[0];
                                            var y=pt[1];
                                            var geometry_point = new gEcnu.Geometry.Point(x,y);
                                            geometrys.push(geometry_point);
                                        }
                                    }
                                    for(var key in properties){
                                        feature_Attr[key] = properties[key];
                                    }
                                    feature_Attr.FID=returnFeature.id;
                                    var tmpFeature = new gEcnu.Feature.Point(geometrys, feature_Attr);
                                    resultFeatures.push(tmpFeature); 
                                    break;
                                }//switch  end
                                // if (typeof(sucCompleted) != "undefined") {
                                //     sucCompleted(resultFeatures);
                                // }
                            }      //for  end 
                            if (typeof(sucCompleted) != "undefined") {
                                    sucCompleted(resultFeatures);
                            }
                        }else{   //此时只是返回属性信息
                            
                            var resultFeatures = [];
                            for (var fetureNum = 0; fetureNum < returnFeatures.length; fetureNum++) {
                            //TODO  此时返回fetures要素
                            var returnFeature = returnFeatures[fetureNum];
                            var shpfields = returnFeature.properties;
                            var center=shpfields.cp;
                            var feature_Attr = {};
                            for(var key in shpfields){
                                feature_Attr[key]= shpfields[key];
                            }
                            feature_Attr.FID = returnFeature.id;
                            feature_Attr.cx = center[0];
                            feature_Attr.cy = center[1];
                            resultFeatures.push(feature_Attr);
                            }
                            if (typeof(sucCompleted) != "undefined") {
                                sucCompleted(resultFeatures);
                            }
                        }
                    }
                }else{ //返回 非GeoJson格式的数据
                 returnFeatures = jsonparase.Features;  
                    if (returnFeatures.length == 0) {
                    //TODO直接调用回调函数
                    if (typeof(sucCompleted) != "undefined") {
                        sucCompleted(returnFeatures);
                    }
                    } else {
                    //TODO此时说明有返回要素
                    if (shapeFlag == 1) {
                        var resultFeatures = [];
                        for (var fetureNum = 0; fetureNum < returnFeatures.length; fetureNum++) {
                            var iferror=false;
                            //TODO  此时返回fetures要素
                            var returnFeature = returnFeatures[fetureNum];
                            var returnFeatureType = returnFeature.shape.shpType;
                            if (returnFeatureType == 5) {
                                //说明返回的是多边形要素
                                var shpParts = returnFeature.shape.Parts;
                                var Parts_len = shpParts.length;
                                var shpPoints = returnFeature.shape.Points;
                                var lineRings = [];
                                for (var j = 0; j < Parts_len; j++) {
                                    var begin_Index = shpParts[j];
                                    if (j == (Parts_len - 1)) {
                                        var next_Index = shpPoints.length;
                                    } else {
                                        var next_Index = shpParts[j + 1];
                                    }
                                    var lineRing_Points = [];
                                    for (var k = begin_Index; k < (next_Index - 1); k++) {
                                        var geometry_point = new gEcnu.Geometry.Point(shpPoints[k].X, shpPoints[k].Y);
                                        lineRing_Points.push(geometry_point);
                                    }
                                    var tmpLineRing = new gEcnu.Geometry.LinearRing(lineRing_Points);
                                    if(tmpLineRing.className=="polygon"){
                                      lineRings.push(tmpLineRing);
                                    }else{
                                       iferror=true;
                                       break;
                                    }
                                }
                                if(iferror){
                                    continue;
                                }
                                var shpfields = returnFeature.fields;
                                var feature_Attr = {};
                                if (typeof shpfields != "undefined") {
                                    var shpfields_len = shpfields.length;
                                    for (var kk = 0; kk < shpfields_len; kk++) {
                                        var tmpfield = shpfields[kk];
                                        for (m in tmpfield) {
                                            feature_Attr[m] = tmpfield[m];
                                        }
                                    }
                                }
                                feature_Attr.FID = returnFeature.FID;
                                var tmpFeature = new gEcnu.Feature.Polygon(lineRings, feature_Attr);
                                resultFeatures.push(tmpFeature);
                            } else if (returnFeatureType == 3) {  
                                //说明返回的是线要素
                                var shpParts = returnFeature.shape.Parts;
                                var Parts_len = shpParts.length;
                                var shpPoints = returnFeature.shape.Points;
                                var lineStrings = [];
                                for (var j = 0; j < Parts_len; j++) {
                                    var begin_Index = shpParts[j];
                                    if (j == (Parts_len - 1)) {
                                        var next_Index = shpPoints.length;
                                    } else {
                                        var next_Index = shpParts[j + 1];
                                    }
                                    var lineString_Points = [];
                                    for (var k = begin_Index; k < next_Index; k++) {
                                        var geometry_point = new gEcnu.Geometry.Point(shpPoints[k].X, shpPoints[k].Y);
                                        lineString_Points.push(geometry_point);
                                    }
                                   

                                    var tmpLineString =new gEcnu.Geometry.LineString(lineString_Points);
                                    lineStrings.push(tmpLineString); 
                                }
                                
                                var shpfields = returnFeature.fields;
                                var feature_Attr = {};
                                if (typeof shpfields != "undefined") {
                                    var shpfields_len = shpfields.length;
                                    for (var kk = 0; kk < shpfields_len; kk++) {
                                        var tmpfield = shpfields[kk];
                                        for (m in tmpfield) {
                                            feature_Attr[m] = tmpfield[m];
                                        }
                                    }
                                }
                                feature_Attr.FID = returnFeature.FID;
                                var tmpFeature = new gEcnu.Feature.Polyline(lineStrings, feature_Attr);
                          
                                resultFeatures.push(tmpFeature);
                            } else {
                                //说明返回的是点要素
                                var shpPoints = returnFeature.shape.Points;
                                var geometrys = [];  
                                for (var j = 0; j < shpPoints.length; j++) {
                                    
                                    var geometry_point = new gEcnu.Geometry.Point(shpPoints[j].X, shpPoints[j].Y);
                                    geometrys.push(geometry_point);
                                }
                                var shpfields = returnFeature.fields;
                                var feature_Attr = {};
                                if (typeof shpfields != "undefined") {
                                    var shpfields_len = shpfields.length;
                                    for (var kk = 0; kk < shpfields_len; kk++) {
                                        var tmpfield = shpfields[kk];
                                        for (m in tmpfield) {
                                            feature_Attr[m] = tmpfield[m];
                                        }
                                    }
                                }
                                feature_Attr.FID = returnFeature.FID;
                                var tmpFeature = new gEcnu.Feature.Point(geometrys, feature_Attr);
                                resultFeatures.push(tmpFeature);
                            }
                        }
                        if (typeof(sucCompleted) != "undefined") {
                            sucCompleted(resultFeatures);
                        }
                    } else if (shapeFlag == 0) {
                        //此时只是返回属性信息
                        var resultFeatures = [];
                        for (var fetureNum = 0; fetureNum < returnFeatures.length; fetureNum++) {
                            //TODO  此时返回fetures要素
                            var returnFeature = returnFeatures[fetureNum];
                            //var returnFeatureType=returnFeature.shape.shpType;
                            var shpfields = returnFeature.fields;
                            var feature_Attr = {};
                            if (typeof shpfields != "undefined") {
                                var shpfields_len = shpfields.length;
                                for (var kk = 0; kk < shpfields_len; kk++) {
                                    var tmpfield = shpfields[kk];
                                    for (m in tmpfield) {
                                        feature_Attr[m] = tmpfield[m];
                                    }
                                }
                            }
                            feature_Attr.FID = returnFeature.FID;
                            feature_Attr.cx = returnFeature.cx;
                            feature_Attr.cy = returnFeature.cy;
                            resultFeatures.push(feature_Attr);
                        }
                        if (typeof(sucCompleted) != "undefined") {
                            sucCompleted(resultFeatures);
                        }
                    }
                    }
               }
                
            }, function() {
                alert('webfeature请求超时');
            }, 500000,{'suc':events_data_suc,'fail':events_data_fail});
        } catch (e) {
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
/**
 * 进行要素增删改操作（ADD,DELETE,UPDATE,SQLTask等批量操作）
 */
gEcnu.ActType = {};
gEcnu.ActType.ADD = "ADD";
gEcnu.ActType.DELETE = "DELETE";
gEcnu.ActType.UPDATE = "UPDATE";
gEcnu.ActType.SQLQUERY= "SQLQUERY";
gEcnu.ActType.SQLEXEC= "SQLEXEC";
gEcnu.ActType.SQLTask = "SQLTask"; 

gEcnu.WebFeatureServices.FeatureServices = gEcnu.WebFeatureServices.extend({
    init: function(eventsListener) {
        if (typeof eventsListener != "undefined") {
            this.events._events.processCompleted = eventsListener.processCompleted;
            this.events._events.processFailed = eventsListener.processFailed;
        }
    },
    processAscyn: function(ActionType,lyrType,map,lyrOrSQLTask,featuresOrSQL){
       // var webfeatureUrl = 'http://' + gEcnu.config.webHostIP + ":" + gEcnu.config.port + "/WebFeature";
        var webfeatureUrl =gEcnu.config.geoserver+"WebFeature";
        if(ActionType=="ADD"){
            var addParams = {};
            var featuresOrSQL_len=featuresOrSQL.length;
            var addFeatures=[];
            for(var i=0;i<featuresOrSQL_len;i++){
                var tmpAddfea={};
                tmpAddfea.shape=featuresOrSQL[i].shape;
                //tmpAddfea.fields=featuresOrSQL[i].fields;
                tmpAddfea.fields=[];
                var feaFields=featuresOrSQL[i].fields;

                for (var kk in feaFields){
                    var str={};
                    str[kk]=escape(feaFields[kk]);
                    tmpAddfea.fields.push(str);
                }

                addFeatures.push(tmpAddfea);
            }
            if (lyrType == "geodb") {
                addParams = {
                    "mt":"SQLInsert",
                    "geoDB":map,
                    "ftSet":lyrOrSQLTask,
                    "features":addFeatures
                }
            } else if (lyrType == "shp") {
                addParams = {
                    "mt":"SQLInsert",
                    "map":map,
                    "lyr":lyrOrSQLTask,
                    "features":addFeatures
                }
            }
            var datastr = JSON.stringify(addParams);
            var params = {
                req: datastr
            };
        }else if(ActionType=="DELETE"){
            var delParams = {};
            if (lyrType == "geodb") {
                delParams = {
                    "mt":"SQLDelete",
                    "geoDB":map,
                    "ftSet":lyrOrSQLTask,
                    "sql":featuresOrSQL
                }
            } else if (lyrType == "shp") {
                delParams = {
                    "mt":"SQLDelete",
                    "map":map,
                    "lyr":lyrOrSQLTask,
                    "sql":featuresOrSQL
                }
            }
            var datastr = JSON.stringify(delParams);
            var params = {
                req: datastr
            };
        }else if(ActionType=="UPDATE"){
            var updateParams = {};
            var featuresOrSQL_len=featuresOrSQL.length;
            var updateFeatures=[];
            for(var i=0;i<featuresOrSQL_len;i++){
                var tmpUpdatefea={};
                tmpUpdatefea.FID=featuresOrSQL[i].FID;
                if(featuresOrSQL[i].UPDATE=="SHP"){//只更新图形信息
                   tmpUpdatefea.shape=featuresOrSQL[i].Feature.shape;
               }else if(featuresOrSQL[i].UPDATE=="FIELDS"){//只更新字段信息
                    tmpUpdatefea.fields=[];
                    var feaFields=featuresOrSQL[i].Feature.fields;

                    for (var kk in feaFields){
                        var str={};
                        //str[kk]=escape(feaFields[kk]);
                        str[kk]=feaFields[kk];
                        tmpUpdatefea.fields.push(str);
                    }

                }else{//全部更新信息
                    tmpUpdatefea.shape=featuresOrSQL[i].Feature.shape; 
                    tmpUpdatefea.fields=[];
                    var feaFields=featuresOrSQL[i].Feature.fields;

                    for (var kk in feaFields){
                        var str={};
                        //str[kk]=escape(feaFields[kk]);
                         str[kk]=feaFields[kk];
                        tmpUpdatefea.fields.push(str);
                    }

                }
                updateFeatures.push(tmpUpdatefea);
            }
            if (lyrType == "geodb") {
                updateParams = {
                    "mt":"SQLUpdate",
                    "geoDB":map,
                    "ftSet":lyrOrSQLTask,
                    "features":updateFeatures
                }
            } else if (lyrType == "shp") {
                updateParams = {
                    "mt":"SQLUpdate",
                    "map":map,
                    "lyr":lyrOrSQLTask,
                    "features":updateFeatures
                }
            }
            var datastr = JSON.stringify(updateParams);
            var params = {
                req: datastr
            };
        }else if(ActionType=="SQLTask"){
            var sqltaskParams = {};
            if (lyrType == "geodb") {
                sqltaskParams = {
                    "mt":"SQLTask",
                    "geoDB":map,
                    "task":lyrOrSQLTask
                }
            } else if (lyrType == "shp") {
                alert('对不起，暂时不支持shp图层批量操作！');
                sqltaskParams = {
                    "mt":"SQLTask",
                    "map":map,
                    "task":lyrOrSQLTask
                }
            }
            var datastr = JSON.stringify(sqltaskParams);
            var params = {
                req: datastr
            };
        }
        var webfeaServices = this;
        try {
            gEcnu.Util.ajax("POST", webfeatureUrl, params, true, function(data){
                if (typeof(webfeaServices.events._events.processCompleted) != "undefined") {
                    webfeaServices.events._events.processCompleted();
                }
            },function() {
                alert('webfeature请求超时');
            },500000);
        }catch (e) {
            if (typeof(webfeaServices.events._events.processFailed) != "undefined") {
                webfeaServices.events._events.processFailed(e);
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
gEcnu.WebFeatureServices.SQLTasks = gEcnu.WebFeatureServices.extend({
    init:function(ActionType,lyrType,lyr,featuresOrSQL){
        if(ActionType=="ADD"){
            var addParams = {};
            var featuresOrSQL_len=featuresOrSQL.length;
            var addFeatures=[];
            for(var i=0;i<featuresOrSQL_len;i++){
                var tmpAddfea={};
                tmpAddfea.shape=featuresOrSQL[i].shape;
                //tmpAddfea.fields=featuresOrSQL[i].fields;
                tmpAddfea.fields=[];
                var feaFields=featuresOrSQL[i].fields;
 
                for (var kk in feaFields){
                    var str={};
                    //str[kk]=escape(tmpfield[kk]);
                    str[kk]=(feaFields[kk]);
                    tmpAddfea.fields.push(str);
                }

                addFeatures.push(tmpAddfea);
            }
            if (lyrType == "geodb") {
                addParams = {
                    "mt":"SQLInsert",
                    "ftSet":lyr,
                    "features":addFeatures
                }
            } else if (lyrType == "shp") {
                addParams = {
                    "mt":"SQLInsert",
                    "lyr":lyr,
                    "features":addFeatures
                }
            }
            //return addParams;
             this.taskParams=addParams;     
        }else if(ActionType=="DELETE"){
            var delParams = {};
            if (lyrType == "geodb") {
                delParams = {
                    "mt":"SQLDelete",
                    "ftSet":lyr,
                    "sql":featuresOrSQL
                }
            } else if (lyrType == "shp") {
                delParams = {
                    "mt":"SQLDelete",
                    "lyr":lyr,
                    "sql":featuresOrSQL
                }
            }
            //return delParams;
            this.taskParams=delParams;
        }else if(ActionType=="UPDATE"){
            var updateParams = {};
            var featuresOrSQL_len=featuresOrSQL.length;
            var updateFeatures=[];
            for(var i=0;i<featuresOrSQL_len;i++){
                var tmpUpdatefea={};
                tmpUpdatefea.FID=featuresOrSQL[i].FID;
                if(featuresOrSQL[i].UPDATE=="SHP"){//只更新图形信息
                   tmpUpdatefea.shape=featuresOrSQL[i].Feature.shape;
               }else if(featuresOrSQL[i].UPDATE=="FIELDS"){//只更新字段信息
                    tmpUpdatefea.fields=[];
                    var feaFields=featuresOrSQL[i].Feature.fields;
     
                    for (var kk in feaFields){
                        var str={};
                        //str[kk]=escape(feaFields[kk]);
                        str[kk]=feaFields[kk];
                        tmpUpdatefea.fields.push(str);
                    }

                }else{//全部更新信息
                   tmpUpdatefea.shape=featuresOrSQL[i].Feature.shape; 
                   tmpUpdatefea.fields=[];
                    var feaFields=featuresOrSQL[i].Feature.fields;
  
                    for (var kk in feaFields){
                        var str={};
                        //str[kk]=escape(feaFields[kk]);
                        str[kk]=feaFields[kk];
                        tmpUpdatefea.fields.push(str);
                    }

                }
                updateFeatures.push(tmpUpdatefea);
            }
            if (lyrType == "geodb") {
                updateParams = {
                    "mt":"SQLUpdate",
                    "ftSet":lyr,
                    "features":updateFeatures
                }
            } else if (lyrType == "shp") {
                updateParams = {
                    "mt":"SQLUpdate",
                    "lyr":lyr,
                    "features":updateFeatures
                }
            }
            this.taskParams=updateParams;
        }
    }
});

//创建要素图层

gEcnu.FtSetParams={};
gEcnu.FtSetParams.PUBLICDB="publicdb";  //用户自定义要素图层所在的数据库
gEcnu.FtSetParams.FIELDMETEDATA="fieldinfo"; //字段元数据表
gEcnu.FtSetParams.FEATURESETLIST="ftSetList"; //要素信息列表表
gEcnu.FtSetParams.META='g_Meta';


/**
 * 新建地图 地图名不能重复
 */
//createService类可以将创建要素和创建地图作为子类
/*新建地图,在g_map中添加记录*/
gEcnu.WebFeatureServices.createService=gEcnu.WebFeatureServices.extend({
    init:function (){
    },
    //新建地图
    createMap:function (mapname,mapalias,mapcoords,mapextent,callback){
        this.mapName=mapname;  
        this.mapAlias=mapalias;  
        this.mapCoords=mapcoords;
        this.mapExtent=mapextent;
        this._callback=callback;
        this._checkMapExist(); 
    },
    //创建要素
    createFeatureSet:function (ftsetName,shpType,viewExtent,coordsys,fieldArr,callback){
        this._create(ftsetName,shpType,viewExtent,coordsys,fieldArr,callback);
    },
    /**
     * 检查数据库中是否有该地图
     * @return {[type]} [description]
     */
    _checkMapExist:function (){
        var mapname=this.mapName;
        var _self=this;
        var sqlService_qryid=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (result){  
        if(result.length>0){ alert("已经存在该地图，请更换地图名"); return;  }     
        _self._addMapRecord();
        },'processFailed':function (){}});
        var params={'lyr':'g_map','fields':'map_name,map_id','filter':'map_name='+"'"+mapname+"'"};
        sqlService_qryid.processAscyn(gEcnu.ActType.SQLQUERY,gEcnu.FtSetParams.PUBLICDB,params);
    },
    /**
     * 向g_map中追加记录
     */
    _addMapRecord:function (){
        var _self=this;
        var callback=this._callback;
        var sqlService_add=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (msg){
           // alert("添加g_map记录成功");
            if(callback!=undefined){
                callback();  //执行回调
            } 
        },'processFailed':function (){ }});
        var mapName=this.mapName;
        var mapAlias=this.mapAlias;
        var mapExtent=this.mapExtent;
        var mapCoords=this.mapCoords;
        var params={'Fields':['map_name','map_alias','ViewExtent','coordsys'],'Data':[[mapName,mapAlias,mapExtent,mapCoords]]};
        sqlService_add.processAscyn(gEcnu.ActType.ADD,gEcnu.FtSetParams.PUBLICDB,'g_map',params);
    },
    _create:function (ftsetName,shpType,viewExtent,coordsys,fieldArr,callback){   
        this.ftsetName=ftsetName;
        this.shpType=shpType;
        this.viewExtent=viewExtent;
        this.coordSystem=coordsys;
        this.fields=[];
        this.fields=this.fields.concat(fieldArr);  
        this._callback=callback;  
        this._createFtset();
    },
    /**
     * 创建要素表
     * @return {[type]} 
     */
    _createFtset:function (){
        var _self=this;
        var tableName="f_"+this.ftsetName; 
        var ftService_exec=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (msg){  //alert("创建要素表成功"); 
            _self._addftsetRecord();
        },'processFailed':function (){ }});  
        var sql="create table if not exists "+tableName+" (FID integer PRIMARY KEY,shpType integer,xmin double,ymin double,xmax double,ymax double,shpLen double,shpArea double,shpData blob,V0,V1,V2,V3,V4,V5,V6,V7,V8,V9,V10,V11,V12,V13,V14,V15)";  //主键为整型时 默认自动增长
        ftService_exec.processAscyn(gEcnu.ActType.SQLEXEC,gEcnu.FtSetParams.PUBLICDB,sql);
    },
    /**
     * 向要素列表中追加该要素的记录
     */
    _addftsetRecord:function (){
        var _self=this;
        var ftsetName=this.ftsetName;
        var shpType=this.shpType;
        var viewExtent=this.viewExtent;
        var coordsys=this.coordSystem;
        var inserService=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (msg){ 
           //alert("添加要素列表记录成功");
           _self._insertMetaRecord();
        },'processFailed':function (){ }});   
        var params={'Fields':['ftsetName','shptype','viewextent','coordsys','datasource'],'Data':[[ftsetName,shpType,viewExtent,coordsys,ftsetName]]};
        inserService.processAscyn(gEcnu.ActType.ADD,gEcnu.FtSetParams.PUBLICDB,gEcnu.FtSetParams.FEATURESETLIST,params);
    },
    _insertMetaRecord:function (){  //向g_meta表中追加记录，否则的话，要素层的样式会不生效
        var _self=this;
        var ftsetName=this.ftsetName;
        var shpType=this.shpType;
        var viewExtent=this.viewExtent;
        
        var scope=viewExtent.split(',');
        var xmin=scope[0];
        var ymin=scope[1];
        var xmax=scope[2];
        var ymax=scope[3]; 
        var dataValue=[ftsetName,shpType,xmin,ymin,xmax,ymax];
        var dataArr=[dataValue];
        var addService=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (msg){ 
          // alert("向字段元数据表中添加记录成功");
          _self._addFieldinfoRecord();
        },'processFailed':function (){ }});
        var params={'Fields':['name','shptype','xmin','ymin','xmax','ymax'],'Data':dataArr};
        //console.log('addfield',params);
        addService.processAscyn(gEcnu.ActType.ADD,gEcnu.FtSetParams.PUBLICDB,gEcnu.FtSetParams.META,params);

    },
    /**
     * 向字段元数据表中添加记录
     * @param {[array]} fieldArr 字段数组
     */
    _addFieldinfoRecord:function (){
        var _self=this;
        var fields=[];
        var tmpfieldArr=this.fields;
        fields=fields.concat(tmpfieldArr);
        var tabname="f_"+this.ftsetName;
        var callback=this._callback;

        var dataArr=[]; 
        if(fields.length<1){
            if(callback!=undefined){
                callback();
            }
            return;
        }
        for(var i=0,len=fields.length;i<len;i++){    
            var tmpobj=fields[i];  //{'field':'name','fieldType':'text'}
            var fieldname=tmpobj.field;
            var fieldType=tmpobj.fieldType;
            var field="V"+i;
            var tmparr=[field,tabname,fieldname,fieldType];
            dataArr.push(tmparr);
        }
        var addService=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (msg){ 
          // alert("向字段元数据表中添加记录成功");
          if(callback!=undefined){
                callback();
            }
        },'processFailed':function (){ }});
        var params={'Fields':['field','tabname','fieldRealname','fieldtype'],'Data':dataArr};
        console.log('addfield',params);
        addService.processAscyn(gEcnu.ActType.ADD,gEcnu.FtSetParams.PUBLICDB,gEcnu.FtSetParams.FIELDMETEDATA,params);
    }
});
/********向指定map中添加图层：在g_layers中追加记录，并在g_Meta中追加记录（否则要素图层的样式无法修改）*********/




gEcnu.WebFeatureServices.mapService=gEcnu.WebFeatureServices.extend({
    init:function (mapname){
        this.mapName=mapname;
    },
    //更新地图内容 
    addLyrs:function (lyrArr,callback){  
        this._callback=callback;
        this.lyrArr=lyrArr;
        this._insertFtset(lyrArr);
    },
    deleteLyrs:function (delMapLyrs){
        var mapname=this.mapName;
        this.delLyrs=delMapLyrs;
        var _self=this;
        if(delMapLyrs.length<1){
            return;
        }
        var sqlService_qryid=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (result){ 
         var mapId=result[0]['map_id'];  
        _self._execDel(mapId);
        },'processFailed':function (){}});
        var params={'lyr':'g_map','fields':'map_id','filter':'map_name='+"'"+mapname+"'"};
        sqlService_qryid.processAscyn(gEcnu.ActType.SQLQUERY,gEcnu.FtSetParams.PUBLICDB,params);
    },

    _execDel:function (mapId){
        var _self=this;
        var delArr=this.delLyrs;
        var delsql='';
        var len=delArr.length;
        for(var i=0;i<len;i++){
            if(i!=len-1){
                delsql=delsql+"lyr_name="+"'"+delArr[i]+"'"+" or ";
            }else{
                delsql=delsql+"lyr_name="+"'"+delArr[i]+"'";
            }
        }
        var sqlService_qryid=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (result){ 
         
        },'processFailed':function (){ alert('删除图层出错');}});
        var sql="delete from g_layers where map_id="+mapId+" and ("+delsql+")";
        sqlService_qryid.processAscyn(gEcnu.ActType.SQLEXEC,gEcnu.FtSetParams.PUBLICDB,sql);
    },
   
    //添加要素层
    _insertFtset:function (ftsets){
        var mapname=this.mapName;
        var _self=this;
        if(ftsets.length<1){return;}
        var sqlService_qryid=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (result){ 
            if(result.length<1){ alert('不存在该地图'); return ;}
         var mapId=result[0]['map_id']; 
          _self._getFtsetInfo(mapId);
        
        },'processFailed':function (){}});
        var params={'lyr':'g_map','fields':'map_id','filter':'map_name='+"'"+mapname+"'"};
        sqlService_qryid.processAscyn(gEcnu.ActType.SQLQUERY,gEcnu.FtSetParams.PUBLICDB,params);

    },
    
    removeLyr:function (){

    },
    removeFtset:function (){

    },
    /**
     * 通过要素名获取要素字段值（shptype datasource）
     * @return {[type]} [description]
     */
    _getFtsetInfo:function (mapId){
        var _self=this;
        var layersInfo=[]; //存储查询结果
        var layerArr=[];
        layerArr=layerArr.concat(this.lyrArr); 
        var i=0;
        var len=layerArr.length;
        var sql='';
        for(var i=0;i<len;i++){
            if(i!=len-1){
                 sql=sql+" ftsetName="+"'"+layerArr[i]+"' or ";
             }else{
                sql=sql+" ftsetName="+"'"+layerArr[i]+"'";
             }
        }
         var sqlService=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (result){  
            layersInfo=layersInfo.concat(result);
            _self._addFtsetRecord(mapId,layersInfo);  //图层信息获取完毕，开始添加记录   
            },'processFailed':function (){}});
           var params={'lyr':gEcnu.FtSetParams.FEATURESETLIST,'fields':'ftsetName,shptype,datasource,viewExtent','filter':sql};
           sqlService.processAscyn(gEcnu.ActType.SQLQUERY,gEcnu.FtSetParams.PUBLICDB,params);
    },
    /**
     * 向g_layers中添加记录
     */
    _addFtsetRecord: function(mapId,layersInfo){  console.log(layersInfo);
        var _self=this;
        var callback=this._callback;
        var sqlService_insert=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (msg){
            if(callback!=undefined){ console.log('向地图中添加图层成功');
                callback();  //执行回调
            }    
        },'processFailed':function (){ }});
        var layerArr=[];
        layerArr=layerArr.concat(this.ftsets); 
        //其他字段暂未处理 都为空; z_index,visible,'selectble','autolabel',labelfield'zoomlayer' lyr_flag数据库有默认值
        
        var LABEL_STYLE='134,宋体,0,-14,0';
        var dataArr=[]; 
        for(var i=0,len=layersInfo.length;i<len;i++){
            var tmparr=[];
            var lyrname=layersInfo[i].ftsetName;
            var shptype=layersInfo[i].shptype;
            switch(shptype){
                case "8":
                case "1":
                var LYR_STYLE="GeoSymbols,35,$00c0c0c0,6";
                break;
                case "3":
                var LYR_STYLE="0,$00ffff80,1";
                break;
                case "5":
                var LYR_STYLE="0,$00006432,1,0,$00006432";
                break;
                default:
                var LYR_STYLE="0,$00ff8000,1,0,$00ff0000"; 
            }
            tmparr[0]=lyrname;
            tmparr[1]=layersInfo[i].shptype; 
            tmparr[2]=mapId;
            tmparr[3]=lyrname;
            tmparr[4]=layersInfo[i].datasource;  //类似data\road.shp 
            //tmparr[4]=escape(layersInfo[i].datasource);
            tmparr[5]=LABEL_STYLE;
            tmparr[6]=LYR_STYLE;
            tmparr[7]=1000;
            dataArr.push(tmparr);
        }
        var params={'Fields':['lyr_name','lyr_type','map_id','alias','datasource','labelstyle','lyr_style','z_index'],'Data':dataArr};
        sqlService_insert.processAscyn(gEcnu.ActType.ADD,gEcnu.FtSetParams.PUBLICDB,'g_layers',params);
    }

});


//解码
/*编码规则：1、坐标整形化，将浮点型的坐标乘以一个scale值，经纬度的scale值取100000，上海坐标的
scale值取2,  2、将要素的第一个坐标（整形化后的）设为encodeOffsets,第一个坐标存储为0，
后面每个坐标存储为与前面坐标的差值   据此进行解码*/
// function _decode(json){ 
//     var scale=json.scale;    
//     if(!json.UTF8Encoding) {  
//         var features = json.features;  
//         for (var f = 0; f < features.length; f++) {
//             var feature = features[f];
//             var coordinates = feature.geometry.coordinates;
//             var encodeOffsets = feature.geometry.encodeOffsets[0];
//             var cp=feature.properties.cp;    
//             //针对一个要素有多部分组成的 即multiPolyline的情况
//             var parts=feature.geometry.Parts || [0];
//             feature.geometry.coordinates=_decodePolygon(parts,coordinates,encodeOffsets,scale);  
//         } 
//       }
//       //console.log('解码后',JSON.stringify(json));
//       return json;
// }
// function _decodePolygon(parts,coordinate,encodeOffsets,scale){ 
//     var coord=[];
//     var startX = parseFloat(encodeOffsets[0]);
//     var startY = parseFloat(encodeOffsets[1]);  
//     var partLen=parts.length;
//     var prevPt=[];  //保存前一个点（解码后的坐标值）
//     for(var partNum=0;partNum<partLen;partNum++){
//         var ptarr=[]; 
//         var startIndex=parts[partNum];  //起始节点的位置
//         if(partNum==partLen-1){
//             var endIndex=(coordinate.length)/2;  //结束点的位置
//         }else{
//            var endIndex=parts[partNum+1]; 
//         }  
//         for(var i=startIndex*2;i<endIndex*2;i=i+2){
//             var dltx=parseFloat(coordinate[i]);
//             var dlty=parseFloat(coordinate[i+1]);  
//             if(i==0){ 
//                 var x=parseFloat(startX/scale);
//                 var y=parseFloat(startY/scale);
//                 var pt=[ Number(x.toFixed(4)), Number(y.toFixed(4))];
//                 ptarr.push(pt); 
//                 prevPt=pt;
//             }else{ 
//                 var prevXY=prevPt;   //prevPtArr[prevPtArr.length-1];
//                 var x=(parseFloat(prevXY[0])+parseFloat(dltx/scale)); 
//                 var y=(parseFloat(prevXY[1])+parseFloat(dlty/scale));
//                 var pt=[ Number(x.toFixed(4)), Number(y.toFixed(4))];
//                 prevPt=pt;
//                 ptarr.push(pt);
//             } 
//         }
//         coord.push(ptarr);  
//     }
//     return coord;
// }
