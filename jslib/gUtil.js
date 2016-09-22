/**
 * 创建div
 * @param id
 * @param w
 * @param h
 * @param pos
 * @returns {HTMLElement}
 */
gEcnu.Util = {};
gEcnu.Util.createDiv = function (id, w, h, pos) {
	var div = document.createElement('div');
	div.id = id;
	div.style.width = w + 'px';
	div.style.height = h + 'px';
	if (pos) {
		div.style.position = "absolute";
	}
	div.style.zIndex = 1;
	return div;
};
gEcnu.Util.createTextArea = function (id, w, h, pos) {
	var div = document.createElement('textarea');
	div.id = id;
	div.style.width = w + 'px';
	div.style.height = h + 'px';
	if (pos) {
		div.style.position = "absolute";
	}
	div.style.zIndex = 1;
	return div;
};

/**
 * 创建canvas
 * @param id
 * @param w
 * @param h
 * @param pos
 * @returns {HTMLElement}
 */
gEcnu.Util.createCanvas = function (id, w, h, pos) {
	var canvas = document.createElement('canvas');
	if(gEcnu.Util.getIEVersion()!=0){
        canvas=window.G_vmlCanvasManager.initElement(canvas);
    }
	canvas.id = id;
	canvas.width = w;
	canvas.height = h;
	canvas.style.width = w + 'px';
	canvas.style.height = h + 'px';
	if (pos) {
		canvas.style.position = "absolute";
	}
	return canvas;
};

/**
 * 判断元素是否在数组中
 * @returns {boolean}
 */
gEcnu.Util.isInArray = function (arr, val) {
	for (var i in arr) {
		if (arr[i] == val) {
			return true;
		}
	}
	return false;
};
/**
 * 判断对象是否在数组中
 * @param arr 数组
 * @param obj 对象
 * @returns {boolean}
 */
gEcnu.Util.isObjInArray = function (arr, obj) {
	for (var i in arr) {
		/*if (arr[i].id == obj.id && arr[i] == obj) {*/
		if (arr[i].id == obj.id){
			alert('已被添加，请更换图层id'+obj.id);
			return true;
		}
	}
	return false;
};
/**
 * 将上海坐标系的要素对象转换成经纬度坐标
 * @param map 地图对象
 * @param wx 地理坐标x
 * @param wy 地理坐标y
 * @returns {{x: number, y: number}}
 */
gEcnu.Util.transformProj2Geo=function (features){
	var feaLen=features.length;
	var transPoints=[];
	for(var i=0;i<feaLen;i++){
		var curfea=features[i];
		var points=curfea.shape.Points;
		var shpbox=curfea.shape.shpBox;
		var tmprings=curfea._lineRings;
		//var lineRings=curfea._lineRings[0].points;
		curfea.shape.Points=gEcnu.Util.trans2Geo(points);
		curfea.shape.shpBox=gEcnu.Util.transShpbox2Geo(shpbox);
		for(var j=0,len=tmprings.length;j<len;j++){
			var tmpPoints=tmprings[j].points;
			curfea._lineRings[j].points=gEcnu.Util.trans2Geo(tmpPoints);
		}
		// curfea._lineRings[0].points=gEcnu.Util.trans2Geo(lineRings);
	}
	return features;
};
gEcnu.Util.trans2Geo=function(points){
	var len=points.length;
	var ptArr=[];
	for(var i=0;i<len;i++){
		var pt=points[i];
		var latlng=gEcnu.Util.shToLngLat(pt.x,pt.y);
		var obj={x:latlng.lng,y:latlng.lat};
		ptArr.push(obj);
	}
	return ptArr;
};
gEcnu.Util.transShpbox2Geo=function(shpbox){
	var xmin=shpbox[0];
	var ymin=shpbox[1];
	var xmax=shpbox[2];
	var ymax=shpbox[3];
	var latlng1=gEcnu.Util.shToLngLat(xmin,ymin);
	var latlng2=gEcnu.Util.shToLngLat(xmax,ymax);
	var lat_min=latlng1.lat;
	var lat_max=latlng2.lat;
	var lng_min=latlng1.lng;
	var lng_max=latlng2.lng;
	var shpBox=[lng_min,lat_min,lng_max,lat_max];  //console.log('shpBox',shpBox);
	return shpBox;
};
//将经纬度转换成上海坐标
gEcnu.Util.transformGeo2Proj=function (features){
	var feaLen=features.length;
	var transPoints=[];
	for(var i=0;i<feaLen;i++){
		var curfea=features[i];
		var points=curfea.shape.Points;
		var shpbox=curfea.shape.shpBox;
		var tmprings=curfea._lineRings;
		//var lineRings=curfea._lineRings[0].points;
		curfea.shape.Points=gEcnu.Util.trans2Proj(points);
		curfea.shape.shpBox=gEcnu.Util.transShpbox2Proj(shpbox);
		for(var j=0,len=tmprings.length;j<len;j++){
			var tmpPoints=tmprings[j].points;
			curfea._lineRings[j].points=gEcnu.Util.trans2Proj(tmpPoints);
		}
		// curfea._lineRings[0].points=gEcnu.Util.trans2Geo(lineRings);
	}
	return features;

};
gEcnu.Util.trans2Proj=function(points){
	var len=points.length;
	var ptArr=[];
	for(var i=0;i<len;i++){
		var pt=points[i];
		var shxy=gEcnu.Util.lnglatToSh(pt.x,pt.y);
		var obj={x:shxy.x,y:shxy.y};
		ptArr.push(obj);
	}
	return ptArr;
};
gEcnu.Util.transShpbox2Proj=function(shpbox){
	var xmin=shpbox[0];
	var ymin=shpbox[1];
	var xmax=shpbox[2];
	var ymax=shpbox[3];
	var shxy1=gEcnu.Util.lnglatToSh(xmin,ymin);
	var shxy2=gEcnu.Util.lnglatToSh(xmax,ymax);
	var xmin=shxy1.x;
	var xmax=shxy2.x;
	var ymin=shxy1.y;
	var ymax=shxy2.y;
	var shpBox=[xmin,ymin,xmax,ymax];  //console.log('shpBox',shpBox);
	return shpBox;
};
/**
 * 地理坐标转屏幕坐标
 * @param map 地图对象
 * @param wx 地理坐标x
 * @param wy 地理坐标y
 * @returns {{x: number, y: number}}
 */
gEcnu.Util.worldToScreen = function (wx, wy) {  
	var cxy = gSelf.getCenter();  
	var wcx = cxy.x;
	var wcy = cxy.y;
	var scx = parseInt(gSelf.w) / 2;
	var scy = parseInt(gSelf.h) / 2;
	var scale = gSelf.zoom / parseInt(gSelf.w);
	
	var sx = parseFloat(scx) + parseFloat((wx - wcx) / scale) + 0.5;
	var sy = parseFloat(scy) - parseFloat((wy - wcy) / scale) + 0.5;   
	return {
		x: sx,
		y: sy
	};
};
/**
 * 屏幕坐标转地理坐标
 * @param map 地图对象
 * @param sx 屏幕坐标x
 * @param sy 屏幕坐标y
 * @returns {{x: number, y: number}}
 */
gEcnu.Util.screenToWorld = function (sx, sy) {
	var cxy = gSelf.getCenter();
	var wcx = cxy.x;
	var wcy = cxy.y;
	var scx = parseInt(gSelf.w) / 2;
	var scy = parseInt(gSelf.h) / 2;
	//要加载过动态图层或切片图层，才能直接获取正确的zoom值，若只有第三方地图图层，则需在前端换算坐标...
	var scale = gSelf.zoom / parseInt(gSelf.w);
	var wx = parseFloat(wcx) + parseFloat((sx - scx) * scale);
	var wy = parseFloat(wcy)- parseFloat((sy - scy) * scale);
	return {
		x: wx,
		y: wy
	};
};
gEcnu.Util.worldToScreen_geo = function (wx, wy) {
	var cxy = gSelf.getCenter();
	var wcx = cxy.x;
	var wcy = cxy.y;
	var scx = parseInt(gSelf.w) / 2;
	var scy = parseInt(gSelf.h) / 2;
	var scale = gSelf.zoom / parseInt(gSelf.w);

	if(gSelf.coordsFlag == "GEOGRAPHIC"){
     var lon = cxy.x;
	 var lat = cxy.y;
	 wcx=lon*111000*Math.cos(lat);  
	 wcy=lat*111000; 
      var actualZoom=gSelf.zoom*111.31955*1000;
      scale = actualZoom / parseInt(gSelf.w);
    }
	var sx = scx + parseFloat(wx - wcx) / scale + 0.5;
	var sy = scy - parseFloat(wy - wcy) / scale + 0.5;
	return {
		x: sx,
		y: sy
	};
};
gEcnu.Util.screenToWorld_geo = function (sx, sy) {
	var cxy = gSelf.getCenter();
	var wcx = cxy.x;
	var wcy = cxy.y;
	var scx = parseInt(gSelf.w) / 2;
	var scy = parseInt(gSelf.h) / 2;
	//要加载过动态图层或切片图层，才能直接获取正确的zoom值，若只有第三方地图图层，则需在前端换算坐标...
	var scale = gSelf.zoom / parseInt(gSelf.w);

	 if(gSelf.coordsFlag == "GEOGRAPHIC"){ 
	 var lon = cxy.x;
	 var lat = cxy.y;   //console.log("经纬度",lon,lat);
	 wcx=lon*111000*Math.cos(lat);  //假设此纬线的纬度为α 经度1°对应的实际弧长大约为111cosαkm
	 wcy=lat*111000;  //全球各地纬度1°的间隔长度都相等（因为所有经线的长度都相等），大约是111km/1°
	 var actualZoom=gSelf.zoom*111.31955*1000;
     scale = actualZoom / parseInt(gSelf.w);
	 }
	var wx = wcx + parseFloat(sx - scx) * scale;
	var wy = wcy - parseFloat(sy - scy) * scale;
	return {
		x: wx,
		y: wy
	};
};
/**
 * 获取鼠标位置坐标
 * @param e 鼠标事件
 * @returns {{x: number, y: number}}
 */
gEcnu.Util.getMouseXY = function (ele,e) {
	var x = 0,
		y = 0;
	/*x = e.layerX;
     y = e.layerY;*/
	var obj = e.srcElement ? e.srcElement : e.target;
	if(obj.nodeType!=1){
		return {
			x: x,
			y: y
		};
	}
	if (!document.attachEvent) {
		//获取事件源
		while (obj && obj != ele) {
			var btw = gEcnu.Util.getEleStyle(obj, 'border-top-width') == 'medium' ? 0 : gEcnu.Util.delpx(gEcnu.Util.getEleStyle(obj, 'border-top-width'));
			var blw = gEcnu.Util.getEleStyle(obj, 'border-left-width') == 'medium' ? 0 : gEcnu.Util.delpx(gEcnu.Util.getEleStyle(obj, 'border-left-width'));
			x += obj.offsetLeft + blw;
			y += obj.offsetTop + btw;
			obj = obj.offsetParent;
		}
		/*x = e.clientX - x + document.body.scrollLeft;
		y = e.clientY - y + document.body.scrollTop;*/
		x = e.offsetX + x + document.body.scrollLeft;
		y = e.offsetY + y + document.body.scrollTop;
		//x = e.clientX + x + document.body.scrollLeft;
		//y = e.clientY + y + document.body.scrollTop;
		
	} else {	
		var btw = gEcnu.Util.getEleStyle(obj, 'border-top-width') == 'medium' ? 0 : gEcnu.Util.delpx(gEcnu.Util.getEleStyle(obj, 'border-top-width'));
		var blw = gEcnu.Util.getEleStyle(obj, 'border-left-width') == 'medium' ? 0 : gEcnu.Util.delpx(gEcnu.Util.getEleStyle(obj, 'border-left-width'));
		x = e.layerX - blw;
		y = e.layerY - btw;
	}
	return {
		x: x,
		y: y
	};
};

/**
 * 获取触点坐标
 * @param evt
 * @returns {{x: (number|*), y: (number|*)}}
 */
gEcnu.Util.getTouchXY = function (evt) {
	for (var i = 0; i < evt.targetTouches.length; i++) {
		var touch = evt.targetTouches[i];
		ox = touch.pageX;
		oy = touch.pageY;
	}
	x = ox - gSelf.mapLeft;
	y = oy - gSelf.mapTop;
	return {
		x: x,
		y: y
	};
};

/**
 * 获取触点屏幕坐标
 * @param event
 * @returns {{x: number, y: number}}
 */
gEcnu.Util.getTouchPos = function (event) {
	var touchxy = {
		'x': 0,
		'y': 0
	};
	//console.log(event);
	try {
		touchxy.x = event.touches[0].screenX;
		touchxy.y = event.touches[0].screenY;
	} catch (e) {
		console.log(e.toString());
	}
	return touchxy;
};
/**
 * 获取最小外接矩形
 * @param event
 * @returns {{x: number, y: number}}
 */
gEcnu.Util.getShpBox = function (points) {  
   var len=points.length;
   if(len>=1){
   	 var shpbox=[]; 
     var xmin= points[0].x;
     var ymin= points[0].y;
     var xmax= points[0].x;
     var ymax= points[0].y;
     if(len>=2){
     	for(var j=1;j<len;j++){
           var tmppoint=points[j];
           if(xmin>=tmppoint.x){
               xmin=tmppoint.x;
           }
           if(xmax<=tmppoint.x){
               xmax=tmppoint.x;
           }
           if(ymin>=tmppoint.y){
               ymin=tmppoint.y;
           }
           if(ymax<=tmppoint.y){
               ymax=tmppoint.y;
           }
     	}
     }
     shpbox=[xmin,ymin,xmax,ymax];
     return shpbox;
   }else{
   	  alert('获取最小外接矩形失败！');return;
   }
};
gEcnu.Util.getType=function(o){
    var _t;
    return ((_t = typeof(o)) == "object" ? o==null && "null" || Object.prototype.toString.call(o).slice(8,-1):_t).toLowerCase();
};
gEcnu.Util.extend=function(destination,source){
    for(var p in source)
    {
        if(gEcnu.Util.getType(source[p])=="array"||gEcnu.Util.getType(source[p])=="object")
        {
            destination[p]=gEcnu.Util.getType(source[p])=="array"?[]:{};
            arguments.callee(destination[p],source[p]);
        }
        else
        {
            destination[p]=source[p];
        }
    }
};
/**
 *获取触点
 * @param touch
 * @returns {{x: number, y: number}}
 */
gEcnu.Util.getTouchPt = function (touch) {
	var x = touch.pageX - gSelf.mapLeft;
	var y = touch.pageY - gSelf.mapTop;
	return {
		x: x,
		y: y
	};
};

/**
 * 获取鼠标屏幕坐标
 * @returns {{x: Number, y: Number}}
 */
gEcnu.Util.getMousePos = function (event) {
	var e = event || window.event;
	return {
		'x': e.screenX,
		'y': e.screenY
	};
}

/**
 * 获取两点间距
 * @param p1
 * @param p2
 * @returns {Number}
 */
gEcnu.Util.p1top2Dis = function (p1, p2) {
	var dx = parseInt(p1.x - p2.x);
	var dy = parseInt(p1.y - p2.y);
	var dis = parseInt(Math.sqrt(dx * dx + dy * dy));
	return dis;
}

/**
 * 获取元素样式计算值
 * @param obj
 * @param attribute
 * @returns {*}
 */
gEcnu.Util.getEleStyle = function (obj, attribute) {
	// 返回最终样式函数，兼容IE和DOM，设置参数：元素对象、样式特性
	var arr = attribute.split('-');
	var attr = arr[0];
	if (attr.length > 1) {
		for (var i = 1; i < arr.length; i++) {
			attr += arr[i].substring(0, 1).toUpperCase() + arr[i].substring(1);
			//除第一个单词外，其余单词首字母转为大写，并拼接起来
		}
	} else {
		attr = attribute;
	}
	return obj.currentStyle ? obj.currentStyle[attr] : document.defaultView.getComputedStyle(obj, false)[attr];
}
/**
 * 配置信息
 * @param obj
 * @param options
 * @returns {{}}
 */
gEcnu.Util.setOptions = function (obj, options) {
	var tmpObj = gEcnu.Util.cloneObj(obj.options);
	for (var k in options) {
		if (options[k] != null || options[k] != undefined || options[k] != '') {
			tmpObj[k] = options[k];
		}
	}
	return tmpObj;
};


/**
 * 上海市坐标转经纬度
 * @param x
 * @param y
 * @returns {{lat: number, lng: number}}
 */
gEcnu.Util.shToLngLat = function (x, y) {
	var A = 95418.0172735741;
	var B = 48.3052839794785;
	var C = -11592069.1853624;
	var D = 63.9932503167748;
	var E = 110821.847990882;
	var F = -3469087.15690168;
	var lat = (D * x - A * y - (C * D - A * F)) / (B * D - A * E);
	var lng = (E * x - B * y - (C * E - B * F)) / (A * E - B * D);
	return {
		lat: lat,
		lng: lng
	};
}
/**
 * 经纬度转上海坐标
 * @param lat
 * @param lng
 * @returns {{x: number, y: number}}
 */
gEcnu.Util.lnglatToSh = function (lng,lat) {
  var A = 95418.0172735741;
  var B = 48.3052839794785;
  var C = -11592069.1853624;
  var D = 63.9932503167748;
  var E = 110821.847990882;
  var F = -3469087.15690168;
  var x = A * lng + B * lat + C-50+470;
  var y = D * lng + E * lat + F-50-235;
  return {x:x,y:y};
}

/**
 * 去除px字样
 * @param value
 * @returns {*}
 */
gEcnu.Util.delpx = function (value) {
	if (value == "")
		return 0;
	return parseInt(value.substring(0, value.length - 2));
};
/**
 * Ajax请求
 * @param method
 * @param url
 * @param data
 * @param async
 * @param callback
 *otherParams主要为了给callback函数
 */
gEcnu.Util.ajax = function (method, url, data, async, callback,timoutFunc,timeout,otherParams) {
	var timer_out;//设置超时id
	var parames_len=arguments.length;
	if(arguments.length==7||arguments.length==8){
		//创建计时器
		timer_out=setTimeout(function(){
			if (xdr){  
                xdr.abort(); 
            }else if(xhr){
            	//alert(typeof xhr);
            	alert(xhr);
            	xhr.abort(); 
            }
			timoutFunc();
		},timeout);  
	}
	var xhr = null;
	var xdr = null;
	if (data instanceof Object) {  
		var str = "";
		for (k in data) { 
			str += k + "=" + encodeURIComponent(data[k]) + "&";
			//str += k + "=" + escape(data[k]) + "&";
		}
		data = str;   
	}
	if (window.XDomainRequest) {
		xdr = new XDomainRequest();
		if (xdr) {
			xdr.onerror = showerr;
			xdr.onload = function () {
				if (timer_out){  
                   clearTimeout(timer_out);  
                }
                if(arguments.length==8){
                    callback(xdr.responseText,otherParams);
                }else{
                	callback(xdr.responseText);
                }
				
			};
			if ("get" == method.toLowerCase()) {
				if (data == null || data == "") {
					xdr.open("get", url);
				} else {
					xdr.open("get", url + "?" + data);
				}
				xdr.send();
			} else if ("post" == method.toLowerCase()) {
				xdr.open("post", url);
				xdr.setRequestHeader("content-Type", "application/x-www-form-urlencoded");
				xdr.send(data);
			}
		}
	} else {
		if (window.XMLHttpRequest) {
			xhr = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			xhr = new ActiveXObject("Microsoft.XMLHTTP");
		}

		xhr.onreadystatechange = function (e) {
			if (4 == xhr.readyState) {
				if (200 == xhr.status) { 
					if (callback) {
						if (timer_out){
                           clearTimeout(timer_out);  
                        }
                        if(parames_len==8){
                            callback(xhr.responseText,otherParams);
                        }else{
                        	callback(xhr.responseText);
                        }
					}
				} else if (404 == xhr.status) {
					if (hander404) {
						hander404();
					}
				} else if (500 == xhr.status) {
					if (hander500) {
						hander500();
					}
				}
			}
		}

		if ("get" == method.toLowerCase()) {
			if (data == null || data == "") {
				xhr.open("get", url, async);
			} else {
				xhr.open("get", url + "?" + data, async);
			}
			xhr.send(null);
		} else if ("post" == method.toLowerCase()) {
			xhr.open("post", url, async);
			xhr.setRequestHeader("content-Type", "application/x-www-form-urlencoded");
			xhr.send(data);
		}
	}
	function handler404() {
		alert("ReqUrl：not found");
	}

	function handler500() {
		alert("服务器错误，请稍后再试");
	}

	function showerr(e){

	}
}


/*gEcnu.Util.ajax = function (method, url, data, async, callback,timoutFunc,timeout) {
	var timer_out;//设置超时id
	if(arguments.length==7){
		//创建计时器
		timer_out=setTimeout(function(){
			if (xdr){  
                xdr.abort(); 
            }else if(xhr){
            	xhr.abort(); 
            }
			timoutFunc();
		},timeout);  
	}
	var xhr = null;
	var xdr = null;

	if (data instanceof Object) {
		var str = "";
		for (k in data) {
			str += k + "=" + escape(data[k]) + "&";
		}
		data = str;
	}
	if (window.XDomainRequest) {
		xdr = new XDomainRequest();
		if (xdr) {

			xdr.onprogress = function(e){
				//alert("Loading...");
			};
			xdr.onerror = function(e){
				alert(JSON.stringify(e));
			};
			xdr.onload = function () {
				if (timer_out){  
                   clearTimeout(timer_out);  
                }
				callback(xdr.responseText);
			};

			if ("get" == method.toLowerCase()) {
				if (data == null || data == "") {
					xdr.open("get", url);
				} else {
					xdr.open("get", url + "?" + data);
				}
				xdr.send(null);
			} else if ("post" == method.toLowerCase()) {
				xdr.open("post", url);
				xdr.setRequestHeader("content-Type", "application/x-www-form-urlencoded");
				xdr.send(data);
			}
		}
	} else {
		if (window.XMLHttpRequest) {
			xhr = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			xhr = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xhr.onreadystatechange = function (e) {
			//console.log(xhr);
			if (4 == xhr.readyState) {
				if (200 == xhr.status) {
					if (callback) {
						if (timer_out){
                           clearTimeout(timer_out);  
                        }
						callback(xhr.responseText);
					}
				} else if (404 == xhr.status) {
					if (hander404) {
						hander404();
					}
				} else if (500 == xhr.status) {
					if (hander500) {
						hander500();
					}
				}
			} else {
				if (loading) {
					loading();
				}
			}
		}

		if ("get" == method.toLowerCase()) {
			if (data == null || data == "") {
				xhr.open("get", url, async);
			} else {
				xhr.open("get", url + "?" + data, async);
			}
			xhr.send(null);
		} else if ("post" == method.toLowerCase()) {
			xhr.open("post", url, async);
			xhr.setRequestHeader("content-Type", "application/x-www-form-urlencoded");
			//xhr.setRequestHeader("Charset","UTF-8");
			xhr.send(data);
		}
	}
	function handler404() {
		alert("ReqUrl：not found");
	}

	function handler500() {
		alert("服务器错误，请稍后再试");
	}

	function showerr(e){

	}
}*/

/**
 * 对象复制(含数组\JSON数据）
 * @param obj
 * @returns {{}}
 */
gEcnu.Util.cloneObj = function (obj) {
	var newobj, s;
	if (typeof obj !== 'object') {
		return;
	}
	newobj = obj.constructor === Object ? {} : [];
	if (window.JSON) {
		s = JSON.stringify(obj), //序列化对象
		newobj = JSON.parse(s);
		//反序列化（还原）
	} else {
		if (newobj.constructor === Array) {
			newobj.concat(obj);
		} else {
			for (var i in obj) {
				newobj[i] = obj[i];
			}
		}
	}
	return newobj;
};



gEcnu.Util.drawLine = function (ctx, x1, y1, x2, y2) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.closePath();
	ctx.stroke();
};
gEcnu.Util.getPolylineLength = function (polyPtArr) {
	var len = polyPtArr.length;
	var totalDis = 0;
	for (var j = 0; j < (len - 1); j++) {
		var mdis = Math.sqrt((polyPtArr[j].x - polyPtArr[j + 1].x) * (polyPtArr[j].x - polyPtArr[j + 1].x) + (polyPtArr[j].y - polyPtArr[j + 1].y) * (polyPtArr[j].y - polyPtArr[j + 1].y));
		totalDis = totalDis + mdis;
	}
	return totalDis;
};

/**
 * 面积计算
 * @param PtArr
 * @returns {Number}
 */
gEcnu.Util.calcAreaMap = function (PtArr) {
	var ta = 0;
	var ax = PtArr;
	for (var i = 0; i < ax.length; i++) {
		ta = ta + (ax[i].x * ax[(i + 1) % ax.length].y - ax[(i + 1) % ax.length].x * ax[i].y);
	}
	var meter2 = parseInt(Math.abs(0.5 * ta));
	return meter2;
};

/**
 * 周长计算
 * @param ctx
 * @param ptArr
 */
gEcnu.Util.drawCalPolyline = function (ctx, ptArr) {
	gEcnu.Util.setStyle(ctx);
	var len = ptArr.length;
	ctx.beginPath();
	var sxy = gEcnu.Util.worldToScreen(ptArr[0].x, ptArr[0].y);
	if(gSelf.coordsFlag=="GEOGRAPHIC"){
		sxy =gEcnu.Util.worldToScreen_geo(ptArr[0].x, ptArr[0].y);
	}
	ctx.moveTo(sxy.x, sxy.y);
	for (var i = 1; i < ptArr.length; i++) {
		sxy = gEcnu.Util.worldToScreen(ptArr[i].x, ptArr[i].y);
		if(gSelf.coordsFlag=="GEOGRAPHIC"){
		   sxy =gEcnu.Util.worldToScreen_geo(ptArr[i].x, ptArr[i].y);
	    }
		ctx.lineTo(sxy.x, sxy.y);
	}
	ctx.stroke();
	//ctx.closePath();
};

/**
 * 样式设置
 * @param ctx
 * @returns {{fillColor: string, strokeColor: string, lineWeight: number, borderStatus: boolean, fillStatus: boolean, vtxStatus: boolean, vtxRadius: number, tlr: number}}
 */
gEcnu.Util.setStyle = function (ctx,style) {  
	var tmpOpt = {
		'fillColor': 'blue',
		'strokeColor': 'blue',
		'lineWeight': 2,
		'borderStatus': true,
		'fillStatus': true,
		'vtxStatus': false,
		'vtxRadius': 3,
		'tlr': 5,
		'opacity':1
	}
	if(arguments.length>1){tmpOpt=style;}
	ctx.fillStyle = tmpOpt.fillColor;  
	ctx.strokeStyle = tmpOpt.strokeColor;  
	ctx.lineWidth = tmpOpt.lineWeight;
	ctx.globalAlpha=tmpOpt.opacity;
	return tmpOpt;//无用
};

/**
 * 按一定时间间隔执行函数
 * @param func 欲执行函数
 * @param threshold 时间间隔
 * @param execAsap 在事件初始还是结束时执行
 * @returns {Function}
 */
gEcnu.Util.debounce = function (func, threshold, execAsap, fun) {
	//console.log("OK");
	var timeout;
	return function debounced() {
		var obj = this,
			args = arguments;

		function delayed() {
			if (!execAsap)
				func.apply(obj, args);
			timeout = null;
		};
		if (timeout)
			clearTimeout(timeout);
		else if (execAsap)
			func.apply(obj, args);
		timeout = setTimeout(delayed, threshold || 100);
		fun();
	};
};

gEcnu.Util.addEvtHandler = function (element, evt, func) {
	if (element.addEventListener) {
		element.addEventListener(evt, func, false);
	} else if (element.attachEvent) {
		element.attachEvent("on" + evt, func);
	} else {
		element['on' + evt] = func;
	}
	if (evt == 'mousewheel' && gEcnu.Util.getIEVersion() ==0) { //对于mousewheel事件单独处理
		element.addEventListener("DOMMouseScroll", func, false);
	}
};

gEcnu.Util.removeEvtHandler = function (element, evt, func) {
	if (element.removeEventListener) {
		element.removeEventListener(evt, func, false);
	} else if (element.detachEvent) {
		element.detachEvent("on" + evt, func);
	} else {
		element['on' + evt] = func;
	}
	if (evt == 'mousewheel') { //对于mousewheel事件单独处理
		element.removeEventListener("DOMMouseScroll", func, false);
	}
};

gEcnu.Util.preventDefault = function(event)
{
    if (event.preventDefault)
        {event.preventDefault();}
     else
      { window.event.returnValue=false;}
};

gEcnu.Util.stopPropagation = function(event)
{
    if (event.stopPropagation)
    {
        event.stopPropagation();
    }else
    {
        window.event.cancelBubble=true;
    }
};





/**
 * 自定义事件绑定
 * @param ele
 * @param customEvt
 * @param callback
 */
gEcnu.Util.bindCusEvt = function (ele, customEvt, callback) {
	var e = document.createEvent('Event'); //创建一个Event对象e
	e.initEvent(customEvt, false, false); //进行事件初始化，第二个参数表示事件是否可以起泡，第三个表示是否可用preventDefault阻止事件
	gSelf.cusEvtArr[customEvt] = e;
	ele.addEventListener(customEvt, callback, false); //绑定监听器
};

gEcnu.Util.triggerCusEvt = function (ele, custom) {
	ele.dispatchEvent(gSelf.cusEvtArr[custom]);
};
gEcnu.Util.ifctrl=function(e){ //函数:判断键盘Ctrl按键
     var nav4 = window.Event ? true : false; //初始化变量
     if(nav4) { //对于Netscape浏览器
       //判断是否按下Ctrl按键
       if((typeof e.ctrlKey != 'undefined') ? e.ctrlKey : e.modifiers & Event.CONTROL_MASK > 0) { 
         return true;
       } else {
          return false;
       }
     } else {
       //对于IE浏览器，判断是否按下Ctrl按键
       if(window.event.ctrlKey) {
           return true;
       } else {
           return false;
       }
     }
     return false;
};
gEcnu.Util.ifshift=function(e){ //函数:判断键盘Shift按键
    var nav4 = window.Event ? true : false; //初始化变量
    if(nav4) { //对于Netscape浏览器
      //判断是否按下shift按键
      if((typeof e.shiftKey != 'undefined') ? e.shiftKey : e.modifiers & Event.SHIFT_MASK > 0) { 
        return true;
      } else {
         return false;
      }
    } else {
      //对于IE浏览器，判断是否按下shift按键
      if(window.event.shiftKey) {
          return true;
      } else {
          return false;
      }
    }
    return false;
};
gEcnu.Util.getIEVersion = function(){
	var userAgent = window.navigator.userAgent.toLowerCase();
    //if(/msie 10\.0/i.test(userAgent)) return 10;
    //if(/msie 9\.0/i.test(userAgent)) return 9;
    if(/msie 8\.0/i.test(userAgent)) return 8;
    if(/msie 7\.0/i.test(userAgent)) return 7;
    if(/msie 6\.0/i.test(userAgent)) return 6;
    return 0;
};
if(!Array.indexOf) 
{ 
    Array.prototype.indexOf = function(obj) 
    {                
        for(var i=0; i<this.length; i++) 
        { 
            if(this[i]==obj) 
            { 
                return i; 
            } 
        } 
        return -1; 
    } 
};
gEcnu.Util.getButton=function (event){
    event= event || window.event;
    if(!+[1,]){
      switch(event.button)
      {
        case 0:
        case 1:
        case 3:
        case 5:
        case 7:
          return 0;
        case 2:
        case 6:
          return 2;
        case 4:
          return 1;
      }
    }
    else
    {
      return event.button;
    }
}
/**
 * 改变执行环境：在指定对象上执行操作
 * @param  {[type]} obj  指定的对象
 * @param  {[type]} func 操作函数
 * @return {[type]}      [description]
 */
gEcnu.Util.bindFunction=function(obj,func){
	return function(){   //匿名函数改变执行环境 
		func.apply(obj,arguments);  console.log('util',arguments);
	};

};
//十六进制颜色值的正则表达式  
var gEcnu_reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/; 
gEcnu.Util.colorRgb = function(strColor,opacity){  
    var sColor = strColor.toLowerCase();  
    if(sColor && gEcnu_reg.test(sColor)){  
        if(sColor.length === 4){  
            var sColorNew = "#";  
            for(var i=1; i<4; i+=1){  
                sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));     
            }  
            sColor = sColorNew;  
        }  
        //处理六位的颜色值  
        var sColorChange = [];  
        for(var i=1; i<7; i+=2){  
            sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));    
        }  
        return "RGBA(" + sColorChange.join(",") +","+opacity+")";  
    }else{  
        return sColor;    
    }  
};
 
/**RGB颜色转换为16进制
 *（七个字符表示的）  补充rgba的情况以及去除空格  2015-8-14
 *
 **/  
gEcnu.Util.colorHex = function(strColor){  console.log(strColor,strColor.length);
    var that = strColor.replace(/\s/g,"");  console.log('that',that);
    if(/^(rgb|RGB)/.test(that)){  
        var aColor = that.replace(/(?:\(|\)|rgba|rgb|RGB)*/gi,"").split(",");  console.log('aColor',aColor);
        // var aColor = that.substr(4,that,length-5).split(',');
        // if(/^(rgba)/i.test(that)){
        // 	 aColor = that.substr(5,that,length-6).split(','); console.log(that.substr(5,that,length-6));
        // }
        var strHex = "#";  
        //for(var i=0; i<aColor.length; i++){  
        var len = aColor.length>3 ? 3: aColor.length;
        for(var i=0; i<len; i++){  
            var hex = parseInt(aColor[i]).toString(16);  console.log('hex',hex);
            if(hex == 0){  console.log(0);
                hex += hex;   
            }  
            strHex += hex;  
        }  console.log('strHex',strHex);
        if(strHex.length !== 7){  
            strHex = that;    
        }  
        return strHex;  
    }else if(gEcnu_reg.test(that)){  
        var aNum = that.replace(/#/,"").split("");  
        if(aNum.length === 6){  
            return that;      
        }else if(aNum.length === 3){  
            var numHex = "#";  
            for(var i=0; i<aNum.length; i+=1){  
                numHex += (aNum[i]+aNum[i]);  
            }  
            return numHex;  
        }  
    }else{  
        return that;      
    }  
}; 
gEcnu.Util.resizeDivByContent=function(fontSize,content,w){
    var rowNum=parseInt(w/fontSize);
    var realContentNum=content.length;
    var rows=parseInt(realContentNum/rowNum)+1;
    var newh=fontSize*rows+3*rows;
    if(rows==1){
      var neww=realContentNum*fontSize;
    }else{
      var neww=w;
    }
    return {w:neww,h:newh};
}

//解码
/*编码规则：1、坐标整形化，将浮点型的坐标乘以一个scale值，经纬度的scale值取100000，上海坐标的
scale值取2,  2、将要素的第一个坐标（整形化后的）设为encodeOffsets,第一个坐标存储为0，
后面每个坐标存储为与前面坐标的差值   据此进行解码*/
gEcnu.Util.decode=function(json){ 
    var scale=json.scale;    
    if(!json.UTF8Encoding) {  
        var features = json.features;  
        for (var f = 0; f < features.length; f++) {
            var feature = features[f];
            var coordinates = feature.geometry.coordinates;
            var encodeOffsets = feature.geometry.encodeOffsets[0];
            var cp=feature.properties.cp;    
            //针对一个要素有多部分组成的 即multiPolyline的情况
            var parts=feature.geometry.Parts || [0];
            feature.geometry.coordinates=gEcnu.Util.decodePolygon(parts,coordinates,encodeOffsets,scale);  
        } 
      }
      //console.log('解码后',JSON.stringify(json));
      return json;
}
gEcnu.Util.decodePolygon = function (parts,coordinate,encodeOffsets,scale){ 
    var coord=[];
    var startX = parseFloat(encodeOffsets[0]);
    var startY = parseFloat(encodeOffsets[1]);  
    var partLen=parts.length;
    var prevPt=[];  //保存前一个点（解码后的坐标值）
    for(var partNum=0;partNum<partLen;partNum++){
        var ptarr=[]; 
        var startIndex=parts[partNum];  //起始节点的位置
        if(partNum==partLen-1){
            var endIndex=(coordinate.length)/2;  //结束点的位置
        }else{
           var endIndex=parts[partNum+1]; 
        }  
        for(var i=startIndex*2;i<endIndex*2;i=i+2){
            var dltx=parseFloat(coordinate[i]);
            var dlty=parseFloat(coordinate[i+1]);  
            if(i==0){ 
                var x=parseFloat(startX/scale);
                var y=parseFloat(startY/scale);
                var pt=[ Number(x.toFixed(4)), Number(y.toFixed(4))];
                ptarr.push(pt); 
                prevPt=pt;
            }else{ 
                var prevXY=prevPt;   //prevPtArr[prevPtArr.length-1];
                var x=(parseFloat(prevXY[0])+parseFloat(dltx/scale)); 
                var y=(parseFloat(prevXY[1])+parseFloat(dlty/scale));
                var pt=[ Number(x.toFixed(4)), Number(y.toFixed(4))];
                prevPt=pt;
                ptarr.push(pt);
            } 
        }
        coord.push(ptarr);  
    }
    return coord;
}
/**
 * 根据指定比例尺计算要打印的地图的宽高：  根据当前的高度计算请求图层的zoom值
 * @author by lc 2015-5-17
 * @param  {[type]} map   [description]
 * @param  {[type]} scale [description]
 * @return {[string]}    whRate   横向（）或纵向(false)  横向 4:3  纵向：3:4
 */
gEcnu.Util.getMapParamByScale = function (map,scale,whRate){
	var size = map.getSize();
	var center  = map.getCenter();
	var x = center.x ,y = center.y;
	var w0 = size.w;
	var h0 = size.h;
	//最大 打印上海市全市范围 120KM * 140KM 根据高度,计算宽度
	var zoom_w = map.getZoom().z;
	var zoom_h = (zoom_w/w0)* h0;
	if(zoom_h > 140000){
		zoom_h = 140000;
		// x = 0;
		// y = 0;
	}
	zoom_w =  zoom_h*whRate;
	var meterPerCm = scale/100;      //1cm代表的实际距离(m)
	var h_cm = zoom_w/meterPerCm; 
	var height_px = parseInt((h_cm/2.54)*96); //96dpi
	var width_px = parseInt(height_px *whRate); 

	
	// 
	// var width_cm = zoom_w/meterPerCm;   //打印的地图的宽度 cm
	// var width_px = parseInt((width_cm/2.54)*96); //96dpi
	// var height_px = parseInt(width_px / whRate);       //parseInt(width_px*h0/w0); 
    return { w:width_px, h: height_px,zoom:zoom_w,cx:x,cy:y};
};
gEcnu.Util.getTimeInfo = function (){
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	return {'year':year,'month':month,'day':day};
}
/**
 * 将web颜色转换为数据库识别的颜色
 * @param  {[type]} color  十六进制的颜色值 #00ffoo
 * @return {[type]}       $00ooff00
 * @author By lc 2015-6-5
 */
gEcnu.Util.webColor2dbColor = function (color){
		var rgb=color.substring(1);
		var rr=rgb.substr(0,2);
		var gg=rgb.substr(2,2);
		var bb=rgb.substr(4,2);
		newColor="$00"+bb+gg+rr;   //  clRed形式
		return newColor;
}
/**
 * 将数据库识别的颜色转换为web颜色
 * @param  {[type]} $00ooff00(即$00bbggrr))或者clRed形式
 * @return {[type]}  color  十六进制的颜色值 #00ffoo     
 */
gEcnu.Util.dbColor2webColor = function (color){
	//var reg = /^$+[0-9a-zA-Z]+/;
	var webColor = '';
	if(color.indexOf('$')==0){
		var bgr = color.substring(3);
		var bb = bgr.substr(0,2);
		var gg = bgr.substr(2,2);
		var rr = bgr.substr(4,2);
		webColor = "#"+rr+gg+bb;

	}else if(color.indexOf('cl')==0){
		webColor = color.substring(2).toLowerCase();
		webColor = gEcnu.Util.corlorName2Hex(webColor);
	}
	return webColor;
}
/**
 * 获取颜色名的16进制颜色编码
 * @param  {[type]} corlorname [description]
 */
gEcnu.Util.corlorName2Hex=function (corlorname){
	var corlorValue ='';
	var colormap=[['aliceblue','#f0f8ff','rgb(240,248,255)','rgb(94.1%,96.9%,100%)'],
		['antiquewhite','#faebd7','rgb(250,235,215)','rgb(98%,92.2%,84.3%)'],
		['aqua','#00ffff','rgb(0,255,255)','rgb(0%,100%,100%)'],
		['aquamarine','#7fffd4','rgb(127,255,212)','rgb(49.8%,100%,83.1%)'],
		['azure','#f0ffff','rgb(240,255,255)','rgb(94.1%,100%,100%)'],
		['beige','#f5f5dc','rgb(245,245,220)','rgb(96.1%,96.1%,86.3%)'],
		['bisque','#ffe4c4','rgb(255,228,196)','rgb(100%,89.4%,76.9%)'],
		['black','#000000','rgb(0,0,0)','rgb(0%,0%,0%)'],
		['blanchedalmond','#ffebcd','rgb(255,235,205)','rgb(100%,92.2%,80.4%)'],
		['blue','#0000ff','rgb(0,0,255)','rgb(0%,0%,100%)'],
		['blueviolet','#8a2be2','rgb(138,43,226)','rgb(54.1%,16.9%,88.6%)'],
		['brown','#a52a2a','rgb(165,42,42)','rgb(64.7%,16.5%,16.5%)'],
		['burlywood','#deb887','rgb(222,184,135)','rgb(87.1%,72.2%,52.9%)'],
		['cadetblue','#5f9ea0','rgb(95,158,160)','rgb(37.3%,62%,62.7%)'],
		['chartreuse','#7fff00','rgb(127,255,0)','rgb(49.8%,100%,0%)'],
		['chocolate','#d2691e','rgb(210,105,30)','rgb(82.4%,41.1%,11.8%)'],
		['coral','#ff7f50','rgb(255,127,80)','rgb(100%,49.8%,31.4%)'],
		['cornflowerblue','#6495ed','rgb(100,149,237)','rgb(39.2%,58.4%,92.9%)'],
		['cornsilk','#fff8dc','rgb(255,248,220)','rgb(100%,97.3%,86.3%)'],
		['crimson','#dc143c','rgb(220,20,60)','rgb(86.3%,7.8%,23.5%)'],
		['cyan','#00ffff','rgb(0,255,255)','rgb(0%,100%,100%)'],
		['darkblue','#00008b','rgb(0,0,139)','rgb(0%,0%,54.5%)'],
		['darkcyan','#008b8b','rgb(0,139,139)','rgb(0%,54.5%,54.5%)'],
		['darkgoldenrod','#b8860b','rgb(184,134,11)','rgb(72.2%,52.5%,4.3%)'],
		['darkgray','#a9a9a9','rgb(169,169,169)','rgb(66.3%,66.3%,66.3%)'],
		['darkgreen','#006400','rgb(0,100,0)','rgb(0%,39.2%,0%)'],
		['darkgrey','#a9a9a9','rgb(169,169,169)','rgb(66.3%,66.3%,66.3%)'],
		['darkkhaki','#bdb76b','rgb(189,183,107)','rgb(74.1%,71.8%,42%)'],
		['darkmagenta','#8b008b','rgb(139,0,139)','rgb(54.5%,0%,54.5%)'],
		['darkolivegreen','#556b2f','rgb(85,107,47)','rgb(33.3%,42%,18.4%)'],
		['darkorange','#ff8c00','rgb(255,140,0)','rgb(100%,54.9%,0%)'],
		['darkorchid','#9932cc','rgb(153,50,204)','rgb(60%,19.6%,80%)'],
		['darkred','#8b0000','rgb(139,0,0)','rgb(54.5%,0%,0%)'],
		['darksalmon','#e9967a','rgb(233,150,122)','rgb(91.4%,58.8%,47.8%)'],
		['darkseagreen','#8fbc8f','rgb(143,188,143)','rgb(56.1%,73.7%,56.1%)'],
		['darkslateblue','#483d8b','rgb(72,61,139)','rgb(28.2%,23.9%,54.5%)'],
		['darkslategray','#2f4f4f','rgb(47,79,79)','rgb(18.4%,31%,31%)'],
		['darkslategrey','#2f4f4f','rgb(47,79,79)','rgb(18.4%,31%,31%)'],
		['darkturquoise','#00ced1','rgb(0,206,209)','rgb(0%,80.8%,82%)'],
		['darkviolet','#9400d3','rgb(148,0,211)','rgb(58%,0%,82.7%)'],
		['deeppink','#ff1493','rgb(255,20,147)','rgb(100%,7.8%,57.6%)'],
		['deepskyblue','#00bfff','rgb(0,191,255)','rgb(0%,74.9%,100%)'],
		['dimgray','#696969','rgb(105,105,105)','rgb(41.1%,41.1%,41.1%)'],
		['dimgrey','#696969','rgb(105,105,105)','rgb(41.1%,41.1%,41.1%)'],
		['dodgerblue','#1e90ff','rgb(30,144,255)','rgb(11.8%,56.5%,100%)'],
		['firebrick','#b22222','rgb(178,34,34)','rgb(69.8%,13.3%,13.3%)'],
		['floralwhite','#fffaf0','rgb(255,250,240)','rgb(100%,98%,94.1%)'],
		['forestgreen','#228b22','rgb(34,139,34)','rgb(13.3%,54.5%,13.3%)'],
		['fuchsia','#ff00ff','rgb(255,0,255)','rgb(100%,0%,100%)'],
		['gainsboro','#dcdcdc','rgb(220,220,220)','rgb(86.3%,86.3%,86.3%)'],
		['ghostwhite','#f8f8ff','rgb(248,248,255)','rgb(97.3%,97.3%,100%)'],
		['gold','#ffd700','rgb(255,215,0)','rgb(100%,84.3%,0%)'],
		['goldenrod','#daa520','rgb(218,165,32)','rgb(85.5%,64.7%,12.5%)'],
		['gray','#808080','rgb(128,128,128)','rgb(50.2%,50.2%,50.2%)'],
		['green','#008000','rgb(0,128,0)','rgb(0%,50.2%,0%)'],
		['greenyellow','#adff2f','rgb(173,255,47)','rgb(67.8%,100%,18.4%)'],
		['grey','#808080','rgb(128,128,128)','rgb(50.2%,50.2%,50.2%)'],
		['honeydew','#f0fff0','rgb(240,255,240)','rgb(94.1%,100%,94.1%)'],
		['hotpink','#ff69b4','rgb(255,105,180)','rgb(100%,41.1%,70.6%)'],
		['indianred','#cd5c5c','rgb(205,92,92)','rgb(80.4%,36%,36%)'],
		['indigo','#4b0082','rgb(75,0,130)','rgb(29.4%,0%,51%)'],
		['ivory','#fffff0','rgb(255,255,240)','rgb(100%,100%,94.1%)'],
		['khaki','#f0e68c','rgb(240,230,140)','rgb(94.1%,90.2%,54.9%)'],
		['lavender','#e6e6fa','rgb(230,230,250)','rgb(90.2%,90.2%,98%)'],
		['lavenderblush','#fff0f5','rgb(255,240,245)','rgb(100%,94.1%,96.1%)'],
		['lawngreen','#7cfc00','rgb(124,252,0)','rgb(48.6%,98.8%,0%)'],
		['lemonchiffon','#fffacd','rgb(255,250,205)','rgb(100%,98%,80.4%)'],
		['lightblue','#add8e6','rgb(173,216,230)','rgb(67.8%,84.7%,90.2%)'],
		['lightcoral','#f08080','rgb(240,128,128)','rgb(94.1%,50.2%,50.2%)'],
		['lightcyan','#e0ffff','rgb(224,255,255)','rgb(87.8%,100%,100%)'],
		['lightgoldenrodyellow','#fafad2','rgb(250,250,210)','rgb(98%,98%,82.4%)'],
		['lightgray','#d3d3d3','rgb(211,211,211)','rgb(82.7%,82.7%,82.7%)'],
		['lightgreen','#90ee90','rgb(144,238,144)','rgb(56.5%,93.3%,56.5%)'],
		['lightgrey','#d3d3d3','rgb(211,211,211)','rgb(82.7%,82.7%,82.7%)'],
		['lightpink','#ffb6c1','rgb(255,182,193)','rgb(100%,71.4%,75.7%)'],
		['lightsalmon','#ffa07a','rgb(255,160,122)','rgb(100%,62.7%,47.8%)'],
		['lightseagreen','#20b2aa','rgb(32,178,170)','rgb(12.5%,69.8%,66.7%)'],
		['lightskyblue','#87cefa','rgb(135,206,250)','rgb(52.9%,80.8%,98%)'],
		['lightslategray','#778899','rgb(119,136,153)','rgb(46.7%,53.3%,60%)'],
		['lightslategrey','#778899','rgb(119,136,153)','rgb(46.7%,53.3%,60%)'],
		['lightsteelblue','#b0c4de','rgb(176,196,222)','rgb(69%,76.9%,87.1%)'],
		['lightyellow','#ffffe0','rgb(255,255,224)','rgb(100%,100%,87.8%)'],
		['lime','#00ff00','rgb(0,255,0)','rgb(0%,100%,0%)'],
		['limegreen','#32cd32','rgb(50,205,50)','rgb(19.6%,80.4%,19.6%)'],
		['linen','#faf0e6','rgb(250,240,230)','rgb(98%,94.1%,90.2%)'],
		['magenta','#ff00ff','rgb(255,0,255)','rgb(100%,0%,100%)'],
		['maroon','#800000','rgb(128,0,0)','rgb(50.2%,0%,0%)'],
		['mediumaquamarine','#66cdaa','rgb(102,205,170)','rgb(40%,80.4%,66.7%)'],
		['mediumblue','#0000cd','rgb(0,0,205)','rgb(0%,0%,80.4%)'],
		['mediumorchid','#ba55d3','rgb(186,85,211)','rgb(72.9%,33.3%,82.7%)'],
		['mediumpurple','#9370db','rgb(147,112,219)','rgb(57.6%,43.9%,85.9%)'],
		['mediumseagreen','#3cb371','rgb(60,179,113)','rgb(23.5%,70.2%,44.3%)'],
		['mediumslateblue','#7b68ee','rgb(123,104,238)','rgb(48.2%,40.8%,93.3%)'],
		['mediumspringgreen','#00fa9a','rgb(0,250,154)','rgb(0%,98%,60.4%)'],
		['mediumturquoise','#48d1cc','rgb(72,209,204)','rgb(28.2%,82%,80%)'],
		['mediumvioletred','#c71585','rgb(199,21,133)','rgb(78%,8.2%,52.2%)'],
		['midnightblue','#191970','rgb(25,25,112)','rgb(9.8%,9.8%,43.9%)'],
		['mintcream','#f5fffa','rgb(245,255,250)','rgb(96.1%,100%,98%)'],
		['mistyrose','#ffe4e1','rgb(255,228,225)','rgb(100%,89.4%,88.2%)'],
		['moccasin','#ffe4b5','rgb(255,228,181)','rgb(100%,89.4%,71%)'],
		['navajowhite','#ffdead','rgb(255,222,173)','rgb(100%,87.1%,67.8%)'],
		['navy','#000080','rgb(0,0,128)','rgb(0%,0%,50.2%)'],
		['oldlace','#fdf5e6','rgb(253,245,230)','rgb(99.2%,96.1%,90.2%)'],
		['Olive','#808000','rgb(128,128,0)','rgb(50.2%,50.2%,0%)'],
		['olivedrab','#6b8e23','rgb(107,142,35)','rgb(42%,55.7%,13.7%)'],
		['orange','#ffa500','rgb(255,165,0)','rgb(100%,64.7%,0%)'],
		['orangered','#ff4500','rgb(255,69,0)','rgb(100%,27.1%,0%)'],
		['orchid','#da70d6','rgb(218,112,214)','rgb(85.5%,43.9%,83.9%)'],
		['palegoldenrod','#eee8aa','rgb(238,232,170)','rgb(93.3%,91%,66.7%)'],
		['palegreen','#98fb98','rgb(152,251,152)','rgb(59.6%,98.4%,59.6%)'],
		['paleturquoise','#afeeee','rgb(175,238,238)','rgb(68.6%,93.3%,93.3%)'],
		['palevioletred','#db7093','rgb(219,112,147)','rgb(85.9%,43.9%,57.6%)'],
		['papayawhip','#ffefd5','rgb(255,239,213)','rgb(100%,93.7%,83.5%)'],
		['peachpuff','#ffdab9','rgb(255,218,185)','rgb(100%,85.5%,72.5%)'],
		['peru','#cd853f','rgb(205,133,63)','rgb(80.4%,52.2%,24.7%)'],
		['pink','#ffc0cb','rgb(255,192,203)','rgb(100%,75.3%,79.6%)'],
		['plum','#dda0dd','rgb(221,160,221)','rgb(86.7%,62.7%,86.7%)'],
		['powderblue','#b0e0e6','rgb(176,224,230)','rgb(69%,87.8%,90.2%)'],
		['purple','#800080','rgb(128,0,128)','rgb(50.2%,0%,50.2%)'],
		['red','#ff0000','rgb(255,0,0)','rgb(100%,0%,0%)'],
		['rosybrown','#bc8f8f','rgb(188,143,143)','rgb(73.7%,56.1%,56.1%)'],
		['royalblue','#4169e1','rgb(65,105,225)','rgb(25.5%,41.1%,100%)'],
		['saddlebrown','#8b4513','rgb(139,69,19)','rgb(54.5%,27.1%,7.5%)'],
		['salmon','#fa8072','rgb(250,128,114)','rgb(98%,50.2%,44.7%)'],
		['sandybrown','#f4a460','rgb(244,164,96)','rgb(95.7%,64.3%,37.6%)'],
		['seagreen','#2e8b57','rgb(46,139,87)','rgb(18%,54.5%,34.1%)'],
		['seashell','#fff5ee','rgb(255,245,238)','rgb(100%,96.1%,93.3%)'],
		['sienna','#a0522d','rgb(160,82,45)','rgb(62.7%,32.2%,17.6%)'],
		['silver','#c0c0c0','rgb(192,192,192)','rgb(75.3%,75.3%,75.3%)'],
		['skyblue','#87ceeb','rgb(135,206,235)','rgb(52.9%,80.8%,92.2%)'],
		['slateblue','#6a5acd','rgb(106,90,205)','rgb(41.6%,35.3%,80.4%)'],
		['slategray','#708090','rgb(112,128,144)','rgb(43.9%,50.2%,56.5%)'],
		['slategrey','#708090','rgb(112,128,144)','rgb(43.9%,50.2%,56.5%)'],
		['snow','#fffafa','rgb(255,250,250)','rgb(100%,98%,98%)'],
		['springgreen','#00ff7f','rgb(0,255,127)','rgb(0%,100%,49.8%)'],
		['steelblue','#4682b4','rgb(70,130,180)','rgb(27.5%,51%,70.6%)'],
		['tan','#d2b48c','rgb(210,180,140)','rgb(82.4%,70.6%,54.9%)'],
		['teal','#008080','rgb(0,128,128)','rgb(0%,50.2%,50.2%)'],
		['thistle','#d8bfd8','rgb(216,191,216)','rgb(84.7%,74.9%,84.7%)'],
		['tomato','#ff6347','rgb(255,99,71)','rgb(100%,38.8%%,27.8%)'],
		['turquoise','#40e0d0','rgb(64,224,208)','rgb(25.1%,87.7%,81.6%)'],
		['violet','#ee82ee','rgb(238,130,238)','rgb(93.3%,51%,93.3%)'],
		['wheat','#f5deb3','rgb(245,222,179)','rgb(96.1%,87.1%,70.2%)'],
		['white','#ffffff','rgb(255,255,255)','rgb(100%,100%,100%)'],
		['whitesmoke','#f5f5f5','rgb(245,245,245)','rgb(96.1%,96.1%,96.1%)'],
		['yellow','#ffff00','rgb(255,255,0)','rgb(100%,100%,0%)'],
		['yellowgreen','#9acd32','rgb(154,205,50)','rgb(60.4%,80.4%,19.6%)']]; 
	for(var i=0,len=colormap.length;i<len;i++){
			var corlor = colormap[i];
			for(var j=0,colorLen=corlor.length;j<colorLen;j++){
				if(corlorname==corlor[0]){
					corlorValue = corlor[1];
					return corlorValue;
				}
			}
		}
		return corlorValue;
	}
//inserAfter实现：  DOM中未提供
gEcnu.Util.insertAfter_cust=  function (newElement,targetElement){
   var parent = targetElement.parentNode;  
    if(parent.lastChild == targetElement){  
        parent.appendChild(newElement);  
      }else{  
        parent.insertBefore(newElement,targetElement.nextSibling);  
      }  
}
/**
 * 拖动元素
 * @param  {[type]} divId      要拖动的元素的id
 * @param  {[type]} dragzoneId 拖动区域的id
 */
gEcnu.Util.dragDiv=function(divId,dragzoneId){
  var odiv=document.getElementById(divId);
  var dragZone=document.getElementById(dragzoneId);
  dragZone.style.cursor='move';

  var odivWid_Px=odiv.currentStyle ? odiv.currentStyle['width'] : document.defaultView.getComputedStyle(odiv, null)['width'];
  var odivheignt_Px=odiv.currentStyle ? odiv.currentStyle['height'] : document.defaultView.getComputedStyle(odiv, null)['height'];
  var odivWid=odivWid_Px.substring(0,odivWid_Px.length-2);
  var odivh=odivheignt_Px.substring(0,odivheignt_Px.length-2);
  dragZone.onmousedown=function (e){  
    var dltx=e.clientX-odiv.offsetLeft;
    var dlty=e.clientY-odiv.offsetTop;
    document.onmousemove=function (e){  //绑定到document上
      var left=e.clientX-dltx;
      var top=e.clientY-dlty;
      if(left<0){
       left=0;
      }else if(left>document.body.clientWidth-odivWid){  
        left=document.body.clientWidth-odivWid;
       }

      if(top<0){
        top=0;
      }else if(top>document.body.clientHeight-odivh){
        top=document.body.clientHeight-odivh;
      }

        odiv.style.left=left+'px';
        odiv.style.top=top+'px';
    };
    document.onmouseup=function (e){
      document.onmousemove=null;
      document.onmouseup=null;
    };
  };
}
/** 
 * 功能: 1)去除字符串前后所有空格2)去除字符串中所有空格(包括中间空格,需要设置第2个参数为:g) 
 */
 
gEcnu.Util.Trim=function (str,is_global) { 
	var result; 
	result = str.replace(/(^\s+)|(\s+$)/g,""); 
	if(is_global){
		if(is_global.toLowerCase()=="g") 
		result = result.replace(/\s/g,""); 	
	}
	return result; 
} 
//判断多边形是否是顺时针方向 poly是包括最后一个和首节点重合的节点
gEcnu.Util.isClockWise =function (poly){
  var area = 0;
  for(var i=0,len=poly.length;i<len-1;i++){
    var p1= poly[i];
    var p2 = poly[i+1];
    var s = (p1.y+p2.y)*(p2.x-p1.x)/2;
    area += s;  
  }
  if(area > 0){
     return true;
  }else{
    return false;
  }
} ;
//
gEcnu.Util.getOuterPolyIndex = function (lineRingArr){
	var index = 0,max=0;
	var polyInfo = {};
	for(var i=0,l=lineRingArr.length;i<l;i++){
		var poly = lineRingArr[i].points;
		var s = gEcnu.Util.getArea(poly);
		polyInfo[i] = s;
		if(max < s){
			max = s;
		}		
	}

	for(var key in polyInfo){
		if(max == polyInfo[key]){
			index = key;
			return index
		}
	}
	return 0;
};
gEcnu.Util.getArea = function (poly) {
	var ta = 0;
	var ax = poly;
	for (var i = 0; i < ax.length; i++) {   //i<ax.length-1
		ta = ta + (ax[i].x * ax[(i + 1) % ax.length].y - ax[(i + 1) % ax.length].x * ax[i].y);
	}
	var meter2 = parseInt(Math.abs(0.5 * ta));
	return meter2;
};
  //判断多边形在多边形内：即判断每一条边是否在多边形内
gEcnu.Util.isPolyInPoly= function (innerPoly,outerPoly){
  var innerLen = innerPoly.length;
  var outerLen = outerPoly.length;
  var pointSet = []; 
  for(var i=0;i<innerLen-1;i++ ){  
    var pt1 = innerPoly[i];
    var pt2 = innerPoly[i+1];
    var line = [pt1,pt2];
     var isInpoly1 = gEcnu.Util.pointInPoly(pt1,outerPoly);
     var isInpoly2 = gEcnu.Util.pointInPoly(pt2,outerPoly);

     if(!isInpoly1 || !isInpoly2){    //线段的两个端点不都在多边形内，
        return false;
     }

    //判断每条边是否在多边形内
    var flag = gEcnu.Util.isLineInPoly(line,outerPoly);
    if(!flag){ 
      return false;
    }
  }

  return true;
};
//判断线段是否在多边形内 line[pt1,pt2]
gEcnu.Util.isLineInPoly = function (linePt,poly){
  var pointSet = [];
  var start = linePt[0];
  var end = linePt[1];
  // var isStartInPoly = pointInPoly(start, poly);
  // var isEndInPoly = pointInPoly(end, poly);
  // if(!isStartInPoly || !isEndInPoly){  //线段的两个端点不都在多边形内，
  //   return false;
  // }
  for(var i=0,len= poly.length;i<len-1;i++){
      var pt1 = poly[i];
      var pt2 = poly[i+1];
      var curLine = [pt1,pt2];

      var startOnline = gEcnu.Util.isPtEqualLinept(start,curLine);
      var endOnline = gEcnu.Util.isPtEqualLinept(end,curLine);

      var pt1Online = gEcnu.Util.isPtEqualLinept(pt1,linePt);
      var pt2Online = gEcnu.Util.isPtEqualLinept(pt2,linePt);

      if(startOnline || endOnline){     //线段PQ的某个端点在多边形的边S上
        if(startOnline){  pointSet.push(startOnline);   }
        if(endOnline){    pointSet.push(endOnline);     }
      }else if(pt1Online || pt2Online){  //S的某个端点在线段PQ上
        if(pt1Online){    pointSet.push(pt1Online);   }
        if(pt2Online){    pointSet.push(pt2Online);   }
      }else if(gEcnu.Util.isLineIntersect(linePt,curLine)){                       // 线段PQ与S相交,交点不在顶点处
        return false;
      }

  }
  //对交点集合进行排序
  if(pointSet.length>0){
    var arr = gEcnu.Util.sortObj(pointSet);
    for(var i=0,ptlen=arr.length;i<ptlen-1;i++){
    var p1 = arr[i];
    var p2 = arr[i+1];
    var cx = (p1.x + p2.x)/2;
    var cy = (p1.y + p2.y)/2;
    var center = {x:cx, y:cy};
    if(!gEcnu.Util.pointInPoly(center, poly)){
      return false;
    }
  }
  }

    return true;    
}
//对象数组的排序
gEcnu.Util.sortObj =  function (pointArr){
  pointArr.sort(gEcnu.Util.compareFun); 
  return pointArr;
}
gEcnu.Util.compareFun = function (pt1,pt2){
     return pt1.x-pt2.x;
}
//点与线段的某个端点重合
gEcnu.Util.isPtEqualLinept = function (pt,line){
  var pt1 = line[0];
  var pt2 = line[1];
  if(pt.x == pt1.x && pt.y==pt1.y){
    return pt1;
  }
  if(pt.x == pt2.x && pt.y==pt2.y){
    return pt2;
  }
  return null;
}
//判断线段与线段相交 
//使用向量的方式：PQ线段中 交点o 满足： Ox = P+r*(Q-P) 0<r<1
//AB线段中 交点o 满足： Ox = A+s*(B-A) 0<s<1  求解r、s，
gEcnu.Util.isLineIntersect = function (line1,line2){
  var line1_pt1 = line1[0];
  var line1_pt2 = line1[1];
  var line2_pt1 = line2[0];
  var line2_pt2 = line2[1];

  var m = (line1_pt2.x - line1_pt1.x)*(line2_pt2.y - line2_pt1.y) - (line1_pt2.y - line1_pt1.y)*(line2_pt2.x - line2_pt1.x);
  var n = (line1_pt1.y - line2_pt1.y)*(line2_pt2.x - line2_pt1.x) - (line1_pt1.x - line2_pt1.x)*(line2_pt2.y - line2_pt1.x);
  if(m==0){  //两直线平行
      return false;
  }

  var r = ((line1_pt1.y - line2_pt1.y)*(line2_pt2.x - line2_pt1.x) - (line1_pt1.x - line2_pt1.x)*(line2_pt2.y - line2_pt1.y))/m;
  var s = ((line1_pt1.y - line2_pt1.y)*(line1_pt2.x - line1_pt1.x) - (line1_pt1.x - line2_pt1.x)*(line1_pt2.y - line1_pt1.y))/m;

  if(r>0 && r<1 && s>0 && s<1){ //alert('相交了'); //线段相交
    return true;
  }
  return false;
}

gEcnu.Util.isPtOnLine = function (pt,line){
  var pt1 = line[0];
  var pt2 = line[1];
  var x_min = Math.min(pt1.x,pt2.x);
  var x_max = Math.max(pt1.x,pt2.x);
  var y_min = Math.min(pt1.y,pt2.y);
  var y_max = Math.max(pt1.y,pt2.y);
  if(pt1.x==pt2.x){  //斜率不存在
    if(pt.x==pt1.x && pt.y>= y_min && pt.y <= y_max){
      return true;
    }
  }else if(pt1.y==pt2.y){  //斜率为0
    if(pt.y==pt1.y && pt.x>= x_min && pt.x<= x_max){
      return true;
    }
  }else{  //斜率存在 且非0
    var k = (pt2.y - pt1.y)/(pt2.x - pt1.x);
    var y = k*(pt.x-pt1.x)+pt1.y;
    if(y == pt.y && y >=y_min && y<= y_max){
      return true;
    }
    return false;
  }
}



//判断点在多边形内:转角和法的改进 假设点P 与任意多边形poly （1）做一条水平射线，判断P在各边的左边还是右边；（2）左边+1，右边-1，积累求和，如果最后结果为0 则在多边形外部，否在在多边形内部

gEcnu.Util.pointInPoly = function (pt, poly) {  
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
      ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && (c = !c);
    return c;
  }