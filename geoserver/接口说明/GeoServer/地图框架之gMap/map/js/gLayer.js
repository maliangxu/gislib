/**********gEcnu的Control——Layer图层  信息****************/
gEcnu.Layer = gClass.extend({
    init: function (id, options) { 
      this.id = id;
      this.visible = true;
      this.options = {
        opacity: 1.0,
        zIndex: 0
      };
    },
    /**
     * 添加图层时触发
     * @param map 地图对象
     */
    onAdd: function (map) {
      var self = this;
      this._map = map;
      this._container = map.getContainer();
      var size = map.getSize();
      this._initLayerContainer(this.id, size.w, size.h);  //初始化图层容器
      this._initProp(map);
      this._initParams(map);
      this._container.appendChild(this._layerContainer);
      this.setzIndex();
    },
    /**
     * 移除图层时触发
     * @param map 地图对象
     */
    onRemove: function (map) {
      var container = map.getContainer();
      container.removeChild(this._layerContainer);
      //this._layerContainer = null;
    },
    /**
     * 属性初始化
     * @param map
     * @private
     */
    _initProp: function (map) {

    },
    /**
     * 参数初始化
     * @param map
     * @private
     */
    _initParams: function (map) {

    },
    /**
     * 拖动地图时触发
     * @param dltx x方向变化量
     * @param dlty y方向变化量
     */
    onDrag: function (dltx, dlty) {
      this._layerContainer.style.left = this.startLeft + dltx + 'px';
      this._layerContainer.style.top = this.startTop + dlty + 'px';
    },
    zoomIn: function () {
      this.renew();
    },
    zoomOut: function () {
      this.renew();
    },
    zoomTo: function () {
      this.renew();
    },
    /**
     * 刷新地图时触发
     */
    renew: function () {                       
      this._layerContainer.style.left = this.startLeft + 'px';
      this._layerContainer.style.top = this.startTop + 'px';
    },
    /**
     * 显示地图
     */
    show: function () {
      this._layerContainer.show();   /*show()方法直接调用？  定义？*/
      this.visible = true;
    },
    /**
     * 隐藏地图
     */
    hide: function () {
      this._layerContainer.hide();
      this.visible = false;
    },
    /**
     * 获取容器宽高
     * @returns {{w: *, h: *}}
     */
    getSize: function () {
      return {
        w: this._layerContainer.clientWidth,
        h: this._layerContainer.clientHeight
      };
    },
    /**
     * 获取屏幕中心点
     * @returns {{x: Number, h: Number}}
     */
    getScreenCenter: function () {
      return {
        x: parseInt(this._layerContainer.clientWidth / 2),
        y: parseInt(this._layerContainer.clientHeight / 2)
      };
    },
    getMap: function () {
      return this._map;
    },
    /**
     * 获取图层容器
     * @returns {*}
     */
    getLayerContainer: function () {
      return this._layerContainer;
    },
    /**
     * 设置zIndex值
     */
    setzIndex: function () {
      if (!isNaN(this.options.zIndex)) {
        this._layerContainer.style.zIndex = this.options.zIndex;
      }
    },
    /**
     * 图层resize操作
     */
    resize: function () {
      this._layerContainer.style.width = this._map.w + 'px';  //_map指向的是map对象
      this._layerContainer.style.height = this._map.h + 'px';
    }
  });

  /***********************************Layer子类---Dyn*******************************/
gEcnu.Layer.Dyn = gEcnu.Layer.extend({
    init: function (ws, id, lyrStr, options) {  //工作空间、id、图层名、
      this._super(id, options);
      this.options = {
        zIndex: 4
      };
      this.lyrStr = lyrStr;
      this.ws = ws;
      this.class = "dynLayer";
    },
    /**
     * 请求参数初始化
     * @private
     */
    _initParams: function (map) {
      var cxy = map.getCenter();
      var zoom = map.getZoom(); console.log('zoom:',zoom);
      var size = map.getSize();
      this.webMapURL = map.webMapURL;
      this.fileServer = map.fileServer;
      this._params = {
        map: this.ws,
        w: size.w,
        h: size.h,
        mt: 'zoomto',
        cx: cxy.x,
        cy: cxy.y,
        zoom: zoom.z,   // 。。。原来初始化4800。。。。。。。。。。。。。。。。。
        "return": "json",
        lyrs: ''
      };
    },
    /**
     * 对象属性初始化
     * @private
     */
    _initProp: function (map) {
      var size = map.getSize();
      this._mapImg = new Image();
      this._layerContainer.appendChild(this._mapImg);
      this._mapImg.width = size.w;
      this._mapImg.height = size.h;
      this.ctrlLyrs = [];
      this.mapUrl = null;
      this.startLeft = 0;
      this.startTop = 0;
    },
    /**
     * 图层容器初始化
     * @param id 图层id
     * @param w 地图容器宽
     * @param h 地图容器高
     * @private
     */
    _initLayerContainer: function (id, w, h) {
      var div = gEcnu.Util.createDiv(id, w, h, true);
      div.style.zIndex = 2;
      this._layerContainer = div;
    },
    /**
     * 添加图层时触发
     * @param map 地图对象
     */
    onAdd: function (map) {
      map.ownDyn = true;
      this._super(map);
      this.addLyr(this.lyrStr);
      //this._request(this._params);
    },
    /**
     * 添加动态图层
     * @param {String} lyrStr 动态图层字符串
     */
    addLyr: function (lyrStr) {
      var arr = lyrStr.split(",");
      for (var i = 0; i < arr.length; i++) {
        var j = this.ctrlLyrs.indexOf(arr[i]);
        if (j < 0)
          this.ctrlLyrs.push(arr[i]);
      }
      this._params.lyrs = this.ctrlLyrs.join(",");
      this._params.mt = 'zoomto';
      this._request(this._params);
    },
    /**
     * 移除动态图层
     * @param {String} lyrStr 动态图层字符串
     */
    removeLyr: function (lyrStr) {
      var arr = lyrStr.split(",");
      for (var i = 0; i < arr.length; i++) {
        var k = this.ctrlLyrs.indexOf(arr[i]);
        if (k >= 0) {
          for (var j = k; j < this.ctrlLyrs.length - 1; j++) {
            this.ctrlLyrs[j] = this.ctrlLyrs[j + 1];
          }
          this.ctrlLyrs.length--;
        }
      }
      this._params.lyrs = this.ctrlLyrs.join(",");
      this._params.mt = 'zoomto';
      this._request(this._params);
    },

    /**
     * 视野放大操作
     */
    zoomIn: function () {
      var params = this._params;
      params.zoom = params.zoom / 2;
      this.scaleMap('zoomin');
      this.renew();
    },
    /**
     * 视野缩小操作
     */
    zoomOut: function () {
      var params = this._params;
      params.zoom = params.zoom * 2;
      this.scaleMap('zoomout');
      this.renew();
    },
    zoomTo: function () {
      this._params.zoom = this._map.zoom;
      this._params.cx = this._map.cx;
      this._params.cy = this._map.cy;
      this.renew();
    },
    scaleMap: function (tool) {
      var d = this._layerContainer;
      d.style.transition = "transform 100ms ease-in-out";
      d.style.transition = "-webkit-transform 100ms ease-in-out";
      if (tool == 'zoomin') {
        d.style.transform = "scale(2,2)";
        d.style.webkitTransform = "scale(2,2)";
      }
      if (tool == 'zoomout') {
        d.style.transform = "scale(0.5,0.5)";
        d.style.webkitTransform = "scale(0.5,0.5)";
      }
    },
    /**
     * 刷新地图
     */
    renew: function () {
      this._params.cx = this._map.cx;
      this._params.cy = this._map.cy;
      this._params.zoom = this._map.zoom;
      this._request(this._params);
    },
    resize: function () {   //由map的resize函数触发
      this._super();
      var map = this.getMap();
      var size = this.getSize();
      this._mapImg.width = size.w;
      this._mapImg.height = size.h;
      this._params.w = size.w;
      this._params.h = size.h;
      this._params.zoom = "";
      this.renew();
    },
    /**
     * 请求地图服务
     * @param {Object} params 动态地图请求参数
     */
    _request: function (params) { console.log('动态请求参数：',params);
      var self = this;
      var mapurl = this.webMapURL;
/*      var reqUrl = "http://localhost:81/webmap?map=shxz2008&w=" + params.w + "&h=" + params.h + "&cx=" + params.cx + "&cy=" + params.cy + "&zoom=" + params.zoom + "&lyrs=" + params.lyrs + "&mt=" + params.mt + "&return=json";*/
      //console.log(reqUrl);
      var d = this._layerContainer
      try {
        gEcnu.Util.ajax("get", mapurl, params, false, function (data) {
          data = JSON.parse(data);

          if (!data.mapURL) {
            alert("地图请求失败！");
            return;
          }
          self._mapImg.src = self.fileServer + data.mapURL;
          self._mapImg.onload = function () {
            d.style.left =self.startLeft+'px';
            d.style.top = self.startTop+'px';
            d.style.transform = "scale(1,1)";
            d.style.webkitTransform = "scale(1,1)";
            d.style.transition = "transform 0ms ease-in-out";
            d.style.transition = "-webkit-transform 0ms ease-in-out";
          }
        });
      } catch (e) {
        alert("出现异常在：" + e);
      }
    }
  });



/************************Layer——Tile****************************************/
gEcnu.Layer.Tile = gEcnu.Layer.extend({
    init: function (id, options) {
      this._super(id, options);
      this.options = {
        opacity: 1.0,
        zIndex: 2
      };
      this.class = "tileLayer";
    },
    /**
     * 图层容器初始化
     * @param id 图层容器ID
     * @param w 图层容器宽
     * @param h 图层容器高
     */
    _initLayerContainer: function (id, w, h) {
      var div = gEcnu.Util.createDiv(id, w, h, true);
      //div.style.zIndex = 2;
      this._layerContainer = div;
      this._initMapView(w, h);
    },
    /**
     * 地图视图初始化
     */
    _initMapView: function (w, h) {
      //创建mapView
      this.mapView = document.createElement('div');
      this.mapView.id = 'mapView';
      this.mapView.width = this.w;                     /*******this.w何处初始化********/
      this.mapView.height = this.h;
      this.mapView.style.position = "absolute";
      this.mapView.style.top = "0px";
      this.mapView.style.left = "0px";
      this.mapView.style.width = w + "px";
      this.mapView.style.height = h + "px";
      this.mapView.style.overflow = "hidden";
      this.mapView.style.zIndex = 1;
      //创建baseMap
      this.baseMap = document.createElement('div');
      this.baseMap.id = 'baseMap';
      this.baseMap.style.position = "absolute";
      this.baseMap.style.left = this.xOffset + "px";
      this.baseMap.style.top = this.yOffset + "px";
      this.baseMap.style.width = this.nWidth * this.tileWidth + 'px';
      this.baseMap.style.height = this.nHeight * this.tileHeight + 'px';
      this.baseMap.style.zIndex = 2;
      //创建baseBgMap
      this.baseBgMap = this.baseMap.cloneNode();
      this.baseBgMap.id = "baseBgMap";
      this.mapView.appendChild(this.baseMap);
      this.mapView.appendChild(this.baseBgMap);
      this._layerContainer.appendChild(this.mapView);
      this.baseBgMap.style.zIndex = 1;
    },
    /**
     * 请求参数初始化
     * @private
     */
    _initParams: function (map) {
      var size = map.getSize();
      var cxy = map.getCenter();
      var zoom = map.getZoom();
      this._params = {
        req: 'getmap',
        w: size.w,
        h: size.h,
        zl: zoom.zl,
        cx: cxy.x,
        cy: cxy.y,
        "return": 'json'
      };
    },
    /**
     * 参数初始化
     */
    _initProp: function (map) {
      this.mapLeft = this._container.offsetLeft;
      this.mapTop = this._container.offsetTop;
      this.startLeft = 0;
      this.startTop = 0;
      this.xOffset = -100;
      this.yOffset = -100;
      this.imgURL = "images/blank.png";
      this.hasImgURL = [];
      //用来判断是否需要对切片中的图片进行更改
      this.tileWidth = map.tileWidth;
      this.tileHeight = map.tileHeight;
      var size = map.getSize();
      this.nWidth = Math.ceil(parseInt(size.w) / map.tileWidth) + 1;
      this.nHeight = Math.ceil(parseInt(size.h) / map.tileHeight) + 1;
      this.tileMapURL = map.tileMapURL;
      this.fileServer = map.fileServer;
      this.mapTool = 'pan';
      this.ifInit = false;
      this.ifZoomTo = false;
    },
    /**
     * 添加图层时触发
     * @param {Object} map
     */
    onAdd: function (map) {
      map.ownTile = true;
      this._super(map);
      this._createTiles();
      this.ifInit = true;
      this._request(this._params);
      this.ifInit = false;
      //console.log(this.mapLeft);
    },
    /**
     * 拖动地图时触发
     * @param dltx x方向变化量
     * @param dlty y方向变化量
     */
    onDrag: function (dltx, dlty) {
      this.baseMap.style.left = this.startLeft + dltx + 'px';
      this.baseMap.style.top = this.startTop + dlty + 'px';
    },
    /**
     * 地图平移
     * @private
     */
    _panMap: function () {
      this.hideLayer('baseMap');
      while (this.xOffset > 0)
        this.wrapR2L();
      while (this.yOffset > 0)
        this.wrapB2T();
      while (this.xOffset < -this.tileWidth)
        this.wrapL2R();
      while (this.yOffset < -this.tileHeight)
        this.wrapT2B();
      this.showLayer('baseMap');
    },
    /**
     * 视野放大
     */
    zoomIn: function () {
      this.mapTool = 'zoomin';
      this.scaleMap();
      this.renew();
    },
    /**
     * 视野缩小
     */
    zoomOut: function () {
      this.mapTool = 'zoomout';
      this.scaleMap();
      this.renew();
    },
    zoomTo: function () {
      this.ifZoomTo = true;
      this._params.zl = this._map.zl;
      this._params.cx = this._map.cx;
      this._params.cy = this._map.cy;
      this._resetTile();
      this.renew();
      this.ifZoomTo = false;
      this.mapTool = 'pan';
    },
    /**
     * 图层缩放动画
     */
    scaleMap: function () {
      //this.hideLayer('bgMap');
      this.hideLayer('baseMap');
      var tx, ty;
      var scxy = this.getScreenCenter();
      var d = this.baseBgMap;
      var tx = scxy.x - gEcnu.Util.delpx(this.baseMap.style.left);
      var ty = scxy.y - gEcnu.Util.delpx(this.baseMap.style.top);
      //console.log(scxy);
      var bx = this.tileWidth * this.nWidth / 2;
      var by = this.tileHeight * this.nHeight / 2;
      var s = tx + "px " + ty + "px";
      d.style.webkitTransformOrigin = s;
      d.style.transformOrigin = s;
      var len = this.baseMap.childNodes.length;
      for (var i = 0; i < len; i++) {
        var imgtmp = this.baseMap.childNodes[0];
        d.appendChild(imgtmp);
      }
      //this.showLayer('bgMap');
      if (this.mapTool == 'zoomin') {
        d.style.transform = "scale(2,2)";
        d.style.webkitTransform = "scale(2,2)";
      }
      if (this.mapTool == 'zoomout') {
        d.style.transform = "scale(0.5,0.5)";
        d.style.webkitTransform = "scale(0.5,0.5)";
      }
      d.style.transition = "transform 100ms ease-in-out";
      d.style.transition = "-webkit-transform 100ms ease-in-out";
    },
    /**
     * 刷新地图
     */
    renew: function () {
      this._params.cx = this._map.cx;
      this._params.cy = this._map.cy;
      this._params.zl = this._map.zl;
      //console.log(this.mapTool);
      if (this.mapTool == 'pan') {
        //console.log("OK");
        this._panMap();
      }
      this._request(this._params);
      this.mapTool = 'pan';
    },
    resize: function () {
      this._super();
      var map = this.getMap();
      var size = map.getSize();
      this.nWidth = Math.ceil(parseInt(size.w) / map.tileWidth) + 1;
      this.nHeight = Math.ceil(parseInt(size.h) / map.tileHeight) + 1;
      this.mapView.style.width = size.w + 'px';
      this.mapView.style.height = size.h + 'px';
      this.baseMap.style.width = this.baseBgMap.style.width = this.nWidth * this.tileWidth + 'px';
      this.baseMap.style.height = this.baseBgMap.style.height = this.nHeight * this.tileHeight + 'px';
      this._params.w = size.w;
      this._params.h = size.h;
      for (var i = this.baseMap.childNodes.length - 1; i >= 0; i--) {
        var tmpimg = this.baseMap.childNodes[i];
        this.baseMap.removeChild(tmpimg);
        tmpimg = null;
      }
      this.ifZoomTo = true;
      this._createTiles();
      this.renew();
      this.ifZoomTo = false;
    },
    /**
     * 请求地图
     * @param params 切片地图参数
     * @private
     */
    _request: function (params) {  
      var self = this;
      var mapurl = this.tileMapURL;
     // var reqUrl = mapurl + "?w=" + params.w + "&h=" + params.h + "&cx=" + params.cx + "&cy=" + params.cy + "&zoom=" + params.zoom + "&lyrs=" + params.lyrs + "&mt=" + params.mt + "&return=json";
     var reqUrl = mapurl + "?w=" + params.w + "&h=" + params.h + "&cx=" + params.cx + "&cy=" + params.cy + "&zl=" + params.zl +  "&return=json";
      console.log(reqUrl);
      try {
        gEcnu.Util.ajax("get", mapurl, params, false, function (data) {
          data = JSON.parse(data);
          self._showMap(data);
        });
      } catch (e) {
        alert("出现异常在：" + e);
      }
    },
    /**
     * 切片显示
     * @param data json数据
     * @private
     */
    _showMap: function (data) {   console.log("切片请求的返回信息：",data);
      var self = this;
      var d = this.baseMap;
      var nWidth = this.nWidth;
      var nHeight = this.nHeight;
      if (this.ifInit || this.ifZoomTo || (this.mapTool == "zoomin") || (this.mapTool == "zoomout")) {
        this.xOffset = data.tileInfo.xoff;
        this.yOffset = data.tileInfo.yoff;
        d.style.left = this.xOffset + "px";
        d.style.top = this.yOffset + "px";
        this._map.setZoom(data.tileInfo.zoom);
      }
      if (this.ifInit) {
        this.baseBgMap.style.left = d.style.left;
        this.baseBgMap.style.top = d.style.top;
        if (this._map.ownDyn) {
          var oLayers = this._map.getAllLayers();
          for (var i in oLayers) {
            if (oLayers[i].class == 'dynLayer') {
              oLayers[i].renew();
            }
          }
        }
      }
      if ((this.mapTool == "zoomin") || (this.mapTool == "zoomout")) {
        this._createTiles();
      }
      var len = data.tiles.length;
      var j = 0;
      var i = 0;
      //加载切片
      function getImg() {
        if (j >= len) {
          return;
        }
        var row = data.tiles[j].row;
        var col = data.tiles[j].col;
        var k = (row - 1) * nWidth + (col - 1);
        var imgtmp = d.childNodes[k];
        var tmpUrl = data.tiles[j].url;
        var tmpzl = tmpUrl.substring(16, 17);
        var bx = this.tileWidth * this.nWidth / 2;
        var by = this.tileHeight * this.nHeight / 2;
        if (!(self.hasImgURL[imgtmp.id]) && tmpzl == self._params.zl) {
          var imgUrl = self.fileServer + tmpUrl;
          imgtmp.src = imgUrl;
          imgtmp.onload = function () {
            i++;
            if (i == len) {
              var bg = self.baseBgMap;
              bg.style.left = self.baseMap.style.left;
              bg.style.top = self.baseMap.style.top;
              self.showLayer('baseMap');
              for (var q = bg.childNodes.length; q > 0; q--) {
                var imgtmp = bg.childNodes[q - 1];
                bg.removeChild(imgtmp);
                imgtmp = null;
              }
              bg.style.webkitTransform = "scale(1,1)";
              bg.style.transform = "scale(1,1)";
              var s = bx + "px " + by + "px";
              bg.style.webkitTransformOrigin = s;  //旋转基点 绕地图中心旋转
              bg.style.transformOrigin = s;
              bg.style.transition = "transform 10ms ease-in-out";
              bg.style.transition = "-webkit-transform 10ms ease-in-out";
            }
          }
          self.hasImgURL[imgtmp.id] = true;
        }
        j++;
        getImg();
      }
      getImg();
    },
    /**
     * 重置切片
     * @private
     */
    _resetTile: function () {
      var d = this.baseMap;
      for (var q = d.childNodes.length; q > 0; q--) {
        var imgtmp = d.childNodes[q - 1];
        d.removeChild(imgtmp);
        imgtmp = null;
      }
      this._createTiles();
    },
    /**
     * 创建切片
     * @private
     */
    _createTiles: function () {
      var ileft, itop;
      var num = this.nWidth * this.nHeight;
      for (var i = 0; i < num; i++) {
        var newImg = document.createElement('img');
        newImg.id = "mt_" + i;
        newImg.src = this.imgURL;
        this.hasImgURL[newImg.id] = false;
        newImg.style.position = "absolute";
        //important
        itop = Math.floor(i / this.nWidth) * this.tileHeight;
        ileft = Math.floor(i % this.nWidth) * this.tileWidth;
        newImg.style.left = ileft + "px";
        newImg.style.top = itop + "px";
        newImg.style.width = this.tileWidth + "px";
        newImg.style.height = this.tileHeight + "px";
        this.baseMap.appendChild(newImg);
      }
    },
    /**
     * 回绕 右至左
     */
    wrapR2L: function () {
      this.xOffset = this.xOffset - this.tileWidth;
      var d = this.baseMap;
      var offLeft = gEcnu.Util.delpx(d.childNodes[0].style.left);
      for (var j = 0; j < this.nHeight; j++) {
        var imgLast = d.childNodes[((j + 1) * this.nWidth) - 1];
        var imgNext = d.childNodes[j * this.nWidth];
        imgLast.style.left = (offLeft - this.tileWidth) + "px";
        imgLast.src = this.imgURL;
        d.removeChild(imgLast);
        d.insertBefore(imgLast, imgNext);
        this.hasImgURL[imgLast.id] = false;
      }
    },
    /**
     * 回绕 左至右
     */
    wrapL2R: function () {
      this.xOffset = this.xOffset + this.tileWidth;
      var d = this.baseMap;
      var offLeft = gEcnu.Util.delpx(d.childNodes[this.nWidth - 1].style.left);
      for (var j = 0; j < this.nHeight; j++) {
        var imgFirst = d.childNodes[j * this.nWidth];
        var imgNext;
        if (j < this.nHeight - 1) {
          imgNext = d.childNodes[(j + 1) * this.nWidth];
        } else {
          imgNext = null;
        }
        imgFirst.style.left = (offLeft + this.tileWidth) + "px";
        imgFirst.src = this.imgURL;
        d.removeChild(imgFirst);
        if (imgNext) {
          d.insertBefore(imgFirst, imgNext);
        } else {
          d.appendChild(imgFirst);
        }
        this.hasImgURL[imgFirst.id] = false;
      }
    },
    /**
     * 回绕 顶至底
     */
    wrapT2B: function () {
      this.yOffset = this.yOffset + this.tileHeight;
      var d = this.baseMap;
      var offTop = gEcnu.Util.delpx(d.childNodes[(this.nHeight * this.nWidth) - 1].style.top);
      for (var i = 0; i < this.nWidth; i++) {
        var imgBottom = d.childNodes[0];
        imgBottom.style.top = (offTop + this.tileHeight) + "px";
        imgBottom.src = this.imgURL;
        d.removeChild(imgBottom);
        d.appendChild(imgBottom);
        this.hasImgURL[imgBottom.id] = false;
      }
    },
    /**
     * 回绕 底至顶
     */
    wrapB2T: function () {
      this.yOffset = this.yOffset - this.tileHeight;
      var d = this.baseMap;
      var offTop = gEcnu.Util.delpx(d.childNodes[0].style.top);
      for (var i = 0; i < this.nWidth; i++) {
        var imgTop = d.childNodes[(this.nHeight * this.nWidth) - 1];
        imgTop.style.top = (offTop - this.tileHeight) + "px";
        imgTop.src = this.imgURL;
        d.removeChild(imgTop);
        d.insertBefore(imgTop, d.childNodes[0]);
        this.hasImgURL[imgTop.id] = false;
      }
    },
    /**
     * 容器显示
     * @param type 容器类型
     */
    showLayer: function (type) {
      switch (type) {
      case 'baseMap':
        this.baseMap.style.display = 'block';
        break;
      case 'bgMap':
        this.baseBgMap.style.display = 'block';
        break;
      }
    },
    /**
     * 容器隐藏
     * @param type 容器类型
     */
    hideLayer: function (type) {
      switch (type) {
      case 'baseMap':
        this.baseMap.style.display = 'none';
        break;
      case 'bgMap':
        this.baseBgMap.style.display = 'none';
        break;
      }
    }
  });




  /**
   * 第三方地图
   * @type {*|void}
   */
gEcnu.Layer.Other = gEcnu.Layer.extend({
    init: function (id, source, options) {
      this._super(id, options);
      this.options = {
        opacity: 1.0,
        zIndex: 3
      }
      this.mapSource = source;
      this.class = 'otherLayer';
      var tmpOptions = {
        mapType: "roadmap",
        zoomlevel: 10,
        center: {
          lat: 30,
          lng: 30
        },
        control: {
          pan: false,
          scale: false,
          zoom: false,
          mapType: false
        }
      };
      this.oMap = null;
    },
    /**
     * 图层容器初始化
     * @param id 图层id
     * @param w 地图容器宽
     * @param h 地图容器高
     * @private
     */
    _initLayerContainer: function (id, w, h) {
      var div = gEcnu.Util.createDiv(id, w, h, true);
      this._layerContainer = div;
    },
    /**
     * 添加图层时触发
     * @param map
     */
    onAdd: function (map) {
      var self = this;
      map.ownOther = true;
      this._map = map;
      this._super(map);
      var cxy = map.getCenter();
      var zoom = map.getZoom();
      var latlng = gEcnu.Util.shToLngLat(cxy.x, cxy.y);
      //console.log(this.id);
      switch (this.mapSource) {
      case 'google':
        /*require(['async', 'async!https://maps.googleapis.com/maps/api/js?sensor=false'], function () {
          var mapOptions = {
            center: new google.maps.LatLng(latlng.lat, latlng.lng),
            zoom: 18 - zoom.zl,
            mapTypeControl: false,
            panControl: false, //停用平移控件
            zoomControl: false, //停用缩放控件
            scaleControl: false, //停用比例尺控件
            rotateControl: false,
            streetViewControl: false
          };
          var tmpele=document.getElementById(self.id);
          self.oMap = new google.maps.Map(tmpele, mapOptions);
        });*/
      var mapOptions = {
            center: new google.maps.LatLng(latlng.lat, latlng.lng),
            zoom: 18 - zoom.zl,
            mapTypeControl: false,
            panControl: false, //停用平移控件
            zoomControl: false, //停用缩放控件
            scaleControl: false, //停用比例尺控件
            rotateControl: false,
            streetViewControl: false
          };
          var tmpele=document.getElementById(self.id);
          self.oMap = new google.maps.Map(tmpele, mapOptions);
        break;
      case 'baidu':
        /*require(['async', 'async!http://api.map.baidu.com/api?v=1.4'], function () {
          var centerPt = new BMap.Point(latlng.lng, latlng.lat);
          self.oMap = new BMap.Map(self.id);
          //BMap.Convertor.translate(centerPt,0,translateCallback);
          //function translateCallback(point){
          self.oMap.centerAndZoom(centerPt, 19 - zoom.zl);
          //}
        });*/
         var centerPt = new BMap.Point(latlng.lng, latlng.lat);
          self.oMap = new BMap.Map(self.id);
          self.oMap.centerAndZoom(centerPt, 19 - zoom.zl);
        break;
      }

    },
    /**
     * 视野放大
     */
    zoomIn: function () {
      var zoom = this._map.getZoom();
      switch (this.mapSource) {
      case 'google':
        this.oMap.setZoom(18 - zoom.zl);
        break;
      case 'baidu':
        this.oMap.zoomIn();
        break;
      }
    },
    /**
     * 视野缩小
     */
    zoomOut: function () {
      var zoom = this._map.getZoom();
      switch (this.mapSource) {
      case 'google':
        this.oMap.setZoom(18 - zoom.zl);
        break;
      case 'baidu':
        this.oMap.zoomOut();
        break;
      }
    },
    zoomTo: function () {
      this.renew();
    },
    /**
     * 刷新地图
     */
    renew: function () {
      this._super();
      var cxy = this._map.getCenter();
      var zoom = this._map.getZoom();
      var latlng = gEcnu.Util.shToLngLat(cxy.x, cxy.y);
      switch (this.mapSource) {
      case 'google':
        this.oMap.setCenter(new google.maps.LatLng(latlng.lat, latlng.lng));
        this.oMap.setZoom(18 - zoom.zl);
        break;
      case 'baidu':
        this.oMap.centerAndZoom(new BMap.Point(latlng.lng, latlng.lat), 19 - zoom.zl);
        break;
      }
    }
  });






/********************Layer-Feature********************************************/
gEcnu.Layer.Feature = gEcnu.Layer.extend({
    init: function (id,style, options) {
      this._super(id);
      this.options = {
        zIndex: 5
      };
      this.options = gEcnu.Util.setOptions(this, options);
      if(arguments.length>1){
        this.style=style;
      }else{
        var defaultStyle=new gEcnu.Style({});
        this.style=defaultStyle;
      }
      this.class = 'featureLayer';
      this.featureID = 0;
      this.ctrlLyrs = [];
    },
    /**
     * 图层容器初始化
     * @param id
     * @param w
     * @param h
     * @private
     */
    _initLayerContainer: function (id, w, h) {
      var canvas = gEcnu.Util.createCanvas(id, w, h, true);
      this._layerContainer = canvas;
      this._ctx = canvas.getContext('2d');
    },
    /**
     * 添加图层时触发
     * @param map
     */
    onAdd: function (map) { 
      this._map = map;
      var size = map.getSize();
      var container = this._map.getContainer();
      this._initLayerContainer(this.id, size.w, size.h);
      container.appendChild(this._layerContainer);
      this.setzIndex();
      this.oFeatures = []; 
    },
    /**
     * 添加要素
     * @param feature
     */
    addFeature: function (feature) {
      var oFeatures = this.getAllFeatures(); 
      if (!gEcnu.Util.isInArray(oFeatures, feature)) {
        //this.featureID++;
        //feature.ID = this.featureID;
        oFeatures.push(feature);
        feature.onAdd(this);
      }
      //var map = this.getMap();
      //map.curScrPolys = gEcnu.Graph.getCurViewPolys(oFeatures);
    },
    /**
     * 移除要素
     * @param feature
     */
    removeFeature: function (feature) {
      var oFeature = [];
      for (var i = 0, a = 0; i < this.oFeatures.length; i++) {
        if (this.oFeatures[i] != feature) {
          oFeature[a] = this.oFeatures[i];
          a++;
        } else {
          feature.onRemove(this);
        }
      }
      this.oFeatures = oFeature;
      var map = this.getMap();
      map.curScrPolys = gEcnu.Graph.getCurViewPolys(oFeature);
      this.renew();
    },
    addFeatures: function(features){
      for(var i = 0;i<features.length;i++){
        this.addFeature(features[i]);
      }
    },
    removeFeatures: function(features){
      for(var i = 0;i<features.length;i++){
        this.removeFeature(features[i]);
      }
    },

    /**
     * 要素置空
     */
    removeAllFeatures: function(){
      this.oFeatures = [];
      this.renew();
    },
    /**
     * 绘制要素
     */
    draw: function () {
      var oFeatures = this.getAllFeatures();
      //var curScrPolys = gEcnu.Graph.getCurViewPolys(oFeatures);
      for (var i = 0; i < oFeatures.length; i++) {
        oFeatures[i].onDraw(this);
      }
    },
    /**
     * 刷新图层
     */
    renew: function () {
      this._super();
      this._map.overLayer.clear();
      this.clear();
      this.draw();
    },
    resize: function () {
      this._super();
      this._layerContainer.width = this._map.w;
      this._layerContainer.height = this._map.h;
      this.renew();
    },
    /**
     * 清空画布
     */
    clear: function () {
      var canvas = this.getLayerContainer();
      this._ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    /**
     * 获取要素
     * @returns {Array}
     */
    getAllFeatures: function () { 
      return this.oFeatures;
    },
    /**
     * 获取画布上下文
     * @returns {*}
     */
    getCtx: function () {
      return this._ctx;
    }
  });




/***************************Layer----Overlay*****************************/
  /**
   * 覆盖层
   * @type {*|void}
   */
gEcnu.Layer.Overlay = gEcnu.Layer.Feature.extend({
    init: function (id, options) {
      this._super(id, options);
      this.options = {
        opacity: 1.0,
        zIndex: 10
      };
      this.options = gEcnu.Util.setOptions(this, options);
      this.class = 'overlayLayer';
    },
    /**
     * 样式初始化
     */
    initStyle: function () {
      var ctx = this.getCtx();
      ctx.strokeStyle = 'green';
      ctx.fillStyle = 'green';
      ctx.gloablAlpha = 0.7;
    },
    onAdd: function (map) {
      this._super(map);
      this.initStyle();
    },
    resize: function () {
      this._super();
      this._layerContainer.width = this._map.w;
      this._layerContainer.height = this._map.h;
      this.renew();
    }
  });

  /**
   * 标记层
   * @type {*|void}
   */
gEcnu.Layer.Marker = gEcnu.Layer.extend({
    init: function (id, options) {
      this._super(id, options);
      this.options = {
        opacity: 1.0,
        zIndex: 20
      }
      this.options = gEcnu.Util.setOptions(this, options);
      this.id = id;
      this.class = 'markerLayer';
      this.oMarkers = [];
    },
    _initLayerContainer: function (id, w, h) {
      var div = gEcnu.Util.createDiv(id, w, h, true);
      this._layerContainer = div;
    },
    addMarker: function (marker) {
      if (!gEcnu.Util.isInArray(this.oMarkers, marker)) {
        this.oMarkers.push(marker);
        marker.onAdd(this);
      }
    },
    removeMarker: function(marker){
      var oMarker = [];
      for (var i = 0, a = 0; i < this.oMarkers.length; i++) {
        if (this.oMarkers[i] != marker) {
          oMarker[a] = this.oMarkers[i];
          a++;
        } else {
          this.oMarkers[i].onRemove(this);
        }
      }
      this.oMarkers = oMarker;
      this.renew();
    },
    addMarkers: function (markers) {
      var oMarkers = this.oMarkers;
      for (var i = 0; i < markers.length; i++) {
        this.addMarker(markers[i]);
      }
    },
    renew: function () {
      this._super();
      for (var i = 0; i < this.oMarkers.length; i++) {
        this.oMarkers[i].renew();
      }
    },
    resize: function () {
      this._super();
      this.renew();
    }
});