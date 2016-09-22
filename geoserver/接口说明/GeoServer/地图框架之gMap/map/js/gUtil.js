/**
 * 创建div
 * @param id
 * @param w
 * @param h
 * @param pos
 * @returns {HTMLElement}
 */
gEcnu.Util={};
gEcnu.Util.createDiv = function(id,w,h,pos){
    var div = document.createElement('div');
    div.id = id;
    div.style.width = w + 'px';
    div.style.height = h + 'px';
    if(pos){
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
gEcnu.Util.createCanvas = function(id,w,h,pos){
    var canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    if(pos){
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
        if (arr[i].id == obj.id && arr[i] == obj) {
            return true;
        }
    }
    return false;
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
    var sx = scx + (wx - wcx) / scale + 0.5;
    var sy = scy - (wy - wcy) / scale + 0.5;  
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
    var scale = gSelf.zoom / parseInt(gSelf.w);
    var wx = wcx + (sx - scx) * scale;
    var wy = wcy - (sy - scy) * scale;
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
gEcnu.Util.getMouseXY = function (e) {
    var x = 0,
        y = 0;
    /*x = e.layerX;
     y = e.layerY;*/
    var obj = e.srcElement ? e.srcElement : e.target;
    if (document.attachEvent) {
        //获取事件源
        while (obj && obj != document.body) { //默认值是medium
            var btw = gEcnu.Util.getEleStyle(obj, 'border-top-width') == 'medium' ? 0 : gEcnu.Util.delpx(gEcnu.Util.getEleStyle(obj, 'border-top-width'));
            var blw = gEcnu.Util.getEleStyle(obj, 'border-left-width') == 'medium' ? 0 : gEcnu.Util.delpx(gEcnu.Util.getEleStyle(obj, 'border-left-width'));
            x += obj.offsetLeft + blw;
            y += obj.offsetTop + btw;
            obj = obj.offsetParent;
        }
        x = e.clientX - x + document.scrollLeft;
        y = e.clientY - y + document.scrollTop;
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
 //相对于地图容器的坐标位置

 /*page包含滚动距离,client不包含滚动距离，screen则以屏幕为基准*/
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
 //相对于移动屏幕的坐标位置
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
gEcnu.Util.lnglatToSh = function (lat, lng) {
    var A = 95418.0172735741;
    var B = 48.3052839794785;
    var C = -11592069.1853624;
    var D = -30.5861721426051;
    var E = 110821.847990882;
    var F = -3469087.15690168;
    var x = A * lng + B * lat + C - 50;
    var y = D * lng + E * lat + F - 50;
    return {
        x: x + 470,
        y: y - 235
    };
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
 */
gEcnu.Util.ajax = function (method, url, data, async, callback) {
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhr.onload = function (e) {
        if (this.status == 200) {
            if (callback) {
                callback(xhr.responseText);
            }
        } else if (this.status == 404) {
            handler404();
        } else if (this.status == 500) {
            handler500();
        }
    }
    if ("get" == method.toLowerCase()) {
        if (data == null || data == "") {
            xhr.open("get", url, async);
        } else {
            if (data instanceof Object) {
                var str = "";
                for (k in data) {
                    str += k + "=" + data[k] + "&";
                }
                data = str;
            }
            xhr.open("get", url + "?" + data, async);
        }
        xhr.send(null);
    } else if ("post" == method.toLowerCase()) {
        xhr.open("post", url, async);
        xhr.setRequestHeader("content-Type", "application/x-www-form-urlencoded");
        xhr.send(data);
    }
    function handler404() {
        alert("ReqUrl：not found");
    }
    function handler500() {
        alert("服务器错误，请稍后再试");
    }
}
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



gEcnu.Util.drawLine = function(ctx,x1,y1,x2,y2){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
};
gEcnu.Util.getPolylineLength = function(polyPtArr){
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
gEcnu.Util.calcAreaMap = function(PtArr) {
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
gEcnu.Util.drawCalPolyline = function(ctx,ptArr){
    gEcnu.Util.setStyle(ctx);
    var len = ptArr.length;
    ctx.beginPath();
    var sxy = gEcnu.Util.worldToScreen(ptArr[0].x, ptArr[0].y);
    ctx.moveTo(sxy.x, sxy.y);
    for (var i = 1; i < ptArr.length; i++) {
        sxy = gEcnu.Util.worldToScreen(ptArr[i].x, ptArr[i].y);
        ctx.lineTo(sxy.x, sxy.y);
    }
    ctx.stroke();
    ctx.closePath();
};

/**
 * 样式设置
 * @param ctx
 * @returns {{fillColor: string, strokeColor: string, lineWeight: number, borderStatus: boolean, fillStatus: boolean, vtxStatus: boolean, vtxRadius: number, tlr: number}}
 */
gEcnu.Util.setStyle = function (ctx) {
    var tmpOpt = {
        'fillColor': 'yellow',
        'strokeColor': 'orange',
        'lineWeight': 1,
        'borderStatus': true,
        'fillStatus': true,
        'vtxStatus': false,
        'vtxRadius': 3,
        'tlr': 5
    }
    ctx.fillStyle = tmpOpt.fillColor;
    ctx.strokeStyle = tmpOpt.strokeColor;
    ctx.lineWidth = tmpOpt.lineWeight;
    return tmpOpt;
};

/**
 * 按一定时间间隔执行函数
 * @param func 欲执行函数
 * @param threshold 时间间隔
 * @param execAsap 在事件初始还是结束时执行
 * @returns {Function}
 */
 /**
 *func是否在fun之前执行，有第三个参数决定；返回值是函数，调用时gEcnu.Util.debounce(参数列表)()
 */
gEcnu.Util.debounce  = function (func, threshold, execAsap, fun) {
    //console.log("OK");
    var timeout;
    return function debounced () {
        var obj = this, args = arguments;  
        function delayed () {
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


/**
 * 自定义事件绑定
 * @param ele
 * @param customEvt
 * @param callback
 */
gEcnu.Util.triggerCustomEvent = function(ele,customEvt,callback){
/*    var e = document.createEvent('Event');//创建一个Event对象e
    e.initEvent(customEvt,false,false);//进行事件初始化，第二个参数表示事件是否可以起泡，第三个表示是否可用preventDefault阻止事件
    var callEvt;
    switch(customEvt){
        case 'longPress':
            gEcnu.G.startStamp = new Date().getTime();
            callEvt = function(){
                i = 0;
                ele.addEventListener('mousedown',showInteval,false);
                function showInteval(){
                    if(i==0){gEcnu.G.startStamp = new Date().getTime(); };
                    gEcnu.G.currentStamp = new Date().getTime();
                    var timeInteval = gEcnu.G.currentStamp - gEcnu.G.startStamp;
                    console.log(timeInteval);
                    if(timeInteval>1000){
                        callback();
                        i = 0;
                        return;
                    }
                    i++;
                    showInteval();
                }
            }
            break;
    }
    ele.addEventListener(customEvt,callEvt,false);//绑定监听器
    ele.dispatchEvent(e);//触发该事件*/
};