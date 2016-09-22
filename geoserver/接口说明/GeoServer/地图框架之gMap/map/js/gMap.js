/**********gEcnu的Control——Map地图  信息****************/
var gSelf;
gEcnu.Map = gClass.extend({
    init: function (containerId) {
      gSelf = this;
      this._initContainer(containerId);
      this._initProp();
      this.overLayer = new gEcnu.Layer.Overlay('overlay');
      this.addLayer(this.overLayer);
      this._initEvent();
      this.activeLayer = null;
      document.ondragstart = function () {
        return false;
      };
    },
    /**
     * 容器初始化
     * @param {String} containerId 容器ID
     */
    _initContainer: function (containerId) {
     // this._container = $('#' + containerId);
     this._container = document.getElementById(containerId);
      this.w = this._container.clientWidth;
      this.h = this._container.clientHeight; 
      this._container.style.overflow = 'hidden';
    },
    /**
     * 属性初始化
     */
    _initProp: function () {
      this.oLayers = [];
      this.mode = "map";
      this.mapTool = "pan";
      this.dragging = false;
      this.isTouch = false;
      this.oLayers = [];
      this.cx = 0;
      this.cy = 0;
      this.zl = 4;
      this.zoom = 4800;
      this.ownDyn = false;
      this.ownTile = false;
      this.ownOther = false;
      this.maxLevel = gEcnu.config.maxLevel;
      this.minLevel = gEcnu.config.minLevel;
      this.tileWidth = gEcnu.config.tileWidth;
      this.tileHeight = gEcnu.config.tileHeight;

      this.mapLeft = this._container.offsetLeft;
      this.mapTop = this._container.offsetTop;

      this.disMinus = 0;    /*触摸时两指间的距离*/
      this.pinchPt1;
      this.pinchPt2;
      this.startDis;
      this.endDis;

      this.startX = 0;
      this.startY = 0;
      this.startScrX = 0;  //屏幕坐标系下
      this.startSrcY = 0;

      this.lengthPtArr = [];
      this.areaPtArr = [];

      this.oControls = [];

      this.resizeTimer = null;

      this.curScrPolys = [];
      this.tlr = 5;

      //this.webHost = "http://" + window.location.hostname;
      this.webHost = 'http://' + gEcnu.config.webHostIP;
      this.serverURL = this.webHost + ":" + gEcnu.config.port + "/";
      this.webMapURL = this.serverURL + "WebMap";
      this.tileMapURL = this.serverURL + "TileMap";
      this.fileServer = this.serverURL + "FileServer?fn=";
    },
    /**
     * 事件监听注册
     */
    _initEvent: function () {

      var startName = "ontouchstart";
      var doc = document.documentElement;
      var ctn = this._container;
      if (startName in doc) {
        ctn.ontouchstart=mapMouseDownEvt;
        ctn.ontouchmove=mapMouseMoveEvt;
        ctn.ontouchend=mapMouseUpEvt;
      }
      ctn.onmousedown=mapMouseDownEvt;
      ctn.onmousemove= mapMouseMoveEvt;
      ctn.onmouseup= mapMouseUpEvt;
      ctn.onmousewheel = mapMouseWheelEvt;

      ctn.ondblclick = function (e) {
        if (gSelf.mode == 'map') {
          calLenAreMouseDblClickEvt(e);  //地图浏览模式下，地图量算
        } else {
          gSelf.mousedblclickCustom(e);  //执行其他
        }
      };

      //    window.onresize = function (e) {
      //      if (gSelf.resizeTimer == null) {
      //        gSelf.resizeTimer = setTimeout("doResize()", 1000);
      //      }
      //    };

      /**
       * resize事件监听
       * @param e
       */
      /*
             window.onresize = G.Util.debounce(function(){
             gSelf.resize();
             },500,false,function(){console.log("OK");});
             */

      function mapMouseDownEvt(e) {
        e.preventDefault();
        e.stopPropagation();
        if (gSelf.mode == 'map') { 
          if (e.type == 'touchstart' && e.touches.length == 2) { //缩放操作
            var tp1 = gEcnu.Util.getTouchPt(e.touches[0]);
            var tp2 = gEcnu.Util.getTouchPt(e.touches[1]);
            gSelf.pinchPt1 = tp1;
            gSelf.pinchPt2 = tp2;
            gSelf.startDis = gEcnu.Util.p1top2Dis(tp1, tp2);
            console.log(gSelf.startDis);
          } else {     // 平移操作
            if (gSelf.mapTool == 'pan') {
              gSelf.dragging = true;
            }

            var mxy, scrxy;
            if (e.type == 'touchstart') {
              mxy = gEcnu.Util.getTouchXY(e);     //相对于容器的坐标
              scrxy = gEcnu.Util.getTouchPos(e);  //屏幕坐标
            } else {
              mxy = gEcnu.Util.getMouseXY(e);
              scrxy = gEcnu.Util.getMousePos(e);
            }
            gSelf.startX = mxy.x;
            gSelf.startY = mxy.y;
            gSelf.startScrX = scrxy.x;
            gSelf.startScrY = scrxy.y;
            var oLayers = gSelf.getAllLayers();
            for (var i = 0; i < oLayers.length; i++) {
              if (oLayers[i].class == 'tileLayer') {
                oLayers[i].startLeft = gEcnu.Util.delpx(oLayers[i].baseMap.style.left);  
                oLayers[i].startTop = gEcnu.Util.delpx(oLayers[i].baseMap.style.top);
              } else {
                oLayers[i].startLeft = gEcnu.Util.delpx(oLayers[i]._layerContainer.style.left);
                oLayers[i].startTop = gEcnu.Util.delpx(oLayers[i]._layerContainer.style.top);
              }
            }
          }

          calLenAreMouseDownEvt(e);
        } else {                      //非地图浏览模式下，响应其他鼠标按下操作
          gSelf.mousedownCustom(e);
        }
      }

      function mapMouseMoveEvt(e) {
        e.preventDefault();
        if (gSelf.mode == 'map') {
          var mxy, scrxy;
          if (e.type == 'touchmove' && e.touches.length == 2) {
            var tp1 = gEcnu.Util.getTouchPt(e.touches[0]);
            var tp2 = gEcnu.Util.getTouchPt(e.touches[1]);
            console.log(tp1, tp2);
            gSelf.pinchPt1 = tp1;
            gSelf.pinchPt2 = tp2;
            gSelf.endDis = gEcnu.Util.p1top2Dis(tp1, tp2);
            gSelf.disMinus = gSelf.endDis - gSelf.startDis;
            //console.log(gSelf.startDis);
          } else {
            if (e.type == 'touchmove') {
              mxy = gEcnu.Util.getTouchXY(e);
              scrxy = gEcnu.Util.getTouchPos(e);

              gSelf.endScrX = scrxy.x;
              gSelf.endScrY = scrxy.y;
            } else {
              mxy = gEcnu.Util.getMouseXY(e);
              scrxy = gEcnu.Util.getMousePos(e);
            }
            gSelf.currentX = mxy.x;
            gSelf.currentY = mxy.y;
            if (gSelf.dragging && gSelf.mapTool == 'pan') {
              var dltx = scrxy.x - gSelf.startScrX;
              var dlty = scrxy.y - gSelf.startScrY;
              var oLayers = gSelf.getAllLayers();
              for (var i = 0; i < oLayers.length; i++) {
                oLayers[i].onDrag(dltx, dlty);  //mousemove时，每个图层的容器进行平移
              }
            }
          }
          calLenAreMouseMoveEvt(e);
        } else {
          gSelf.mousemoveCustom(e);
        }

      }

      function mapMouseUpEvt(e) {
        if (gSelf.mode == 'map') {
          var mxy, scrxy;
          if (Math.abs(gSelf.disMinus) > 0) { //多点触摸
            if (gSelf.disMinus > 0) {
              gSelf.zoomIn();
            } else {
              gSelf.zoomOut();
            }
            gSelf.disMinus = 0;
          } else {
            if (e.type == 'touchend') {
              scrxy = {
                x: gSelf.endScrX,
                y: gSelf.endScrY
              };
            } else {
              mxy = gEcnu.Util.getMouseXY(e);
              scrxy = gEcnu.Util.getMousePos(e);
            }
            if (gSelf.mapTool == 'pan') {
              var dltx = scrxy.x - gSelf.startScrX;
              var dlty = scrxy.y - gSelf.startScrY;
              var scxy = gSelf.getScreenCenter();
              var nscx = scxy.x - dltx;
              var nscy = scxy.y - dlty;
              var wxy = gEcnu.Util.screenToWorld(nscx, nscy);
              gSelf.setCenter(wxy.x, wxy.y);
              var oLayers = gSelf.getAllLayers();                           
              for (var i = 0; i < oLayers.length; i++) {
                if (oLayers[i].class == 'tileLayer') {
                  oLayers[i].xOffset = oLayers[i].xOffset + dltx;
                  oLayers[i].yOffset = oLayers[i].yOffset + dlty;
                  oLayers[i].baseMap.style.left = oLayers[i].startLeft + dltx + 'px';
                  oLayers[i].baseMap.style.top = oLayers[i].startTop + dlty + 'px';
                }
                oLayers[i].renew();   //对平移的容器进行复位
              }
              gSelf.dragging = false;
            }
          }

        } else {
          gSelf.mouseupCustom(e);
        }
      }

      function mapMouseWheelEvt(e) {
        if (gSelf.mode == 'map') {
          var e = window.event || e;
          e.preventDefault();
          var delta = e.wheelDelta || -e.detail;
          if (delta > 0) {
            gSelf.zoomIn();
          } else {
            gSelf.zoomOut();
          }
        } else {
          gSelf.mousewheelCustom(e);
        }
      }

      function calLenAreMouseDownEvt(e) {
        /****进行量算****/
        var ctx = gSelf.overLayer.getCtx();
        if (gSelf.mapTool == "rulerLength") {
          var wxy = gEcnu.Util.screenToWorld(gSelf.startX, gSelf.startY);
          var measurepoint = {
            x: wxy.x,
            y: wxy.y
          };
          gSelf.lengthPtArr.push(measurepoint);
          if (gSelf.lengthPtArr.length > 1) {
            //G.gEcnu.Graph.setStyle(ctx,'rulerLine');
            gEcnu.Util.drawCalPolyline(ctx, gSelf.lengthPtArr)
          }
        } else if (gSelf.mapTool == "rulerArea") {
          var wxy = gEcnu.Util.screenToWorld(gSelf.startX, gSelf.startY);
          var measurepoint = {
            x: wxy.x,
            y: wxy.y
          };
          gSelf.areaPtArr.push(measurepoint);
          if (gSelf.areaPtArr.length > 1) {
            //G.gEcnu.Graph.setStyle(ctx,'rulerLine');
            gEcnu.Util.drawCalPolyline(ctx, gSelf.areaPtArr);
          }
        } else {
          gSelf.overLayer.clear();
        }

        /*********量算************/
      }

      function calLenAreMouseMoveEvt(e) {
        var ctx = gSelf.overLayer.getCtx();
        if (gSelf.mapTool == "rulerLength") {
          if (gSelf.lengthPtArr.length > 0) {
            gSelf.overLayer.clear();
            //G.gEcnu.Graph.setStyle(ctx,'rulerLine');
            var pt = {
              x: gSelf.lengthPtArr[gSelf.lengthPtArr.length - 1].x,
              y: gSelf.lengthPtArr[gSelf.lengthPtArr.length - 1].y
            };
            var sxy = gEcnu.Util.worldToScreen(pt.x, pt.y);
            gEcnu.Util.drawLine(ctx, sxy.x, sxy.y, gSelf.currentX, gSelf.currentY);
            gEcnu.Util.drawCalPolyline(ctx, gSelf.lengthPtArr);
            if (gSelf.lengthPtArr.length == 1) {
              var currDis = 0; //当前距离
              var wxy = gEcnu.Util.screenToWorld(gSelf.currentX, gSelf.currentY);
              currDis = Math.sqrt((wxy.x - gSelf.lengthPtArr[0].x) * (wxy.x - gSelf.lengthPtArr[0].x) + (wxy.y - gSelf.lengthPtArr[0].y) * (wxy.y - gSelf.lengthPtArr[0].y));
              var msgText = "当前距离：" + Math.round(currDis) + "米" + ";" + "总距离：" + Math.round(currDis) + "米";
              ctx.font = 'bold 15px 幼圆';
              ctx.fillText(msgText, gSelf.currentX, gSelf.currentY);
            } else {
              var currDis = 0; //当前距离
              var totalDis = 0; //总距离
              //当前距离
              var i = (gSelf.lengthPtArr.length - 1);
              var currDis = ""; //当前距离
              var wxy = gEcnu.Util.screenToWorld(gSelf.currentX, gSelf.currentY);
              currDis = Math.sqrt((wxy.x - gSelf.lengthPtArr[i].x) * (wxy.x - gSelf.lengthPtArr[i].x) + (wxy.y - gSelf.lengthPtArr[i].y) * (wxy.y - gSelf.lengthPtArr[i].y));
              //总距离
              totalDis = gEcnu.Util.getPolylineLength(gSelf.lengthPtArr);
              totalDis = totalDis + currDis;
              var msgText = "当前距离：" + Math.round(currDis) + "米" + ";" + "总距离:" + Math.round(totalDis) + "米";
              ctx.font = 'bold 15px 幼圆';
              ctx.fillText(msgText, gSelf.currentX, gSelf.currentY);
            }
          }
        } else if (gSelf.mapTool == "rulerArea") {
          if (gSelf.areaPtArr.length > 0) {
            gSelf.overLayer.clear();
            //G.gEcnu.Graph.setStyle(ctx,'rulerLine');
            var maxi = gSelf.areaPtArr.length - 1;
            var sxy = gEcnu.Util.worldToScreen(gSelf.areaPtArr[maxi].x, gSelf.areaPtArr[maxi].y);
            gEcnu.Util.drawLine(ctx, sxy.x, sxy.y, gSelf.currentX, gSelf.currentY);
            if (gSelf.areaPtArr.length > 1) {
              gEcnu.Util.drawCalPolyline(ctx, gSelf.areaPtArr);
              var sxy = gEcnu.Util.worldToScreen(gSelf.areaPtArr[0].x, gSelf.areaPtArr[0].y);
              gEcnu.Util.drawLine(ctx, sxy.x, sxy.y, gSelf.currentX, gSelf.currentY);
              //计算周长
              var perimeter = 0;
              var totalDis = gEcnu.Util.getPolylineLength(gSelf.areaPtArr);
              var worldXY = gEcnu.Util.screenToWorld(gSelf.currentX, gSelf.currentY);
              var dis1 = Math.sqrt((worldXY.x - gSelf.areaPtArr[maxi].x) * (worldXY.x - gSelf.areaPtArr[maxi].x) + (worldXY.y - gSelf.areaPtArr[maxi].y) * (worldXY.y - gSelf.areaPtArr[maxi].y));
              var dis2 = Math.sqrt((worldXY.x - gSelf.areaPtArr[0].x) * (worldXY.x - gSelf.areaPtArr[0].x) + (worldXY.y - gSelf.areaPtArr[0].y) * (worldXY.y - gSelf.areaPtArr[0].y));
              perimeter = totalDis + dis1 + dis2;
              //计算面积
              var temgareaPtArr;
              temgareaPtArr = gSelf.areaPtArr.concat();
              var temmouseXY = {
                x: worldXY.x,
                y: worldXY.y
              };
              temgareaPtArr.push(temmouseXY);
              //计算面积
              var area = gEcnu.Util.calcAreaMap(temgareaPtArr);
              var msgText = "周长：" + Math.round(perimeter) + "米" + "面积：" + area + "平方米";
              ctx.font = 'bold 15px 幼圆';
              ctx.fillText(msgText, gSelf.currentX, gSelf.currentY);
            }
          }
        }
      }

      function calLenAreMouseDblClickEvt(e) {
        var ctx = gSelf.overLayer.getCtx();
        var returnLenArea = "";
        if (gSelf.mapTool == "rulerLength") {
          gSelf.lengthPtArr.pop();
          var totalDis = gEcnu.Util.getPolylineLength(gSelf.lengthPtArr);
          //执行重绘
          gSelf.overLayer.clear();
          gEcnu.Util.drawCalPolyline(ctx, gSelf.lengthPtArr);
          //gSelf.maptool = "zoomto";
          var len = gSelf.lengthPtArr.length;
          var sxy = gEcnu.Util.worldToScreen(gSelf.lengthPtArr[len - 1].x, gSelf.lengthPtArr[len - 1].y);
          var endx = sxy.x;
          var endy = sxy.y;
          gSelf.lengthPtArr = [];
          returnLenArea = "总距离：" + Math.round(totalDis) + "米";
          ctx.font = 'bold 15px 幼圆';
          ctx.fillText(returnLenArea, endx, endy);
        } else if (gSelf.mapTool == "rulerArea") {
          gSelf.areaPtArr.pop();
          if (gSelf.areaPtArr.length < 3) {
            alert("绘制节点至少三个！");
            return returnLenArea;
          }
          var totalDis = gEcnu.Util.getPolylineLength(gSelf.areaPtArr);
          //计算起始点和终止点的距离
          var perimeter = 0;
          var max = gSelf.areaPtArr.length - 1;
          var dis = Math.sqrt((gSelf.areaPtArr[max].x - gSelf.areaPtArr[0].x) * (gSelf.areaPtArr[max].x - gSelf.areaPtArr[0].x) + (gSelf.areaPtArr[max].y - gSelf.areaPtArr[0].y) * (gSelf.areaPtArr[max].y - gSelf.areaPtArr[0].y));
          perimeter = totalDis + dis;
          //计算面积
          var area = gEcnu.Util.calcAreaMap(gSelf.areaPtArr);
          //执行重绘
          gSelf.overLayer.clear();
          gEcnu.Util.drawCalPolyline(ctx, gSelf.areaPtArr);
          var sxy1 = gEcnu.Util.worldToScreen(gSelf.areaPtArr[0].x, gSelf.areaPtArr[0].y);
          var sxy2 = gEcnu.Util.worldToScreen(gSelf.areaPtArr[max].x, gSelf.areaPtArr[max].y);
          gEcnu.Util.drawLine(ctx, sxy1.x, sxy1.y, sxy2.x, sxy2.y);
          var sxy = gEcnu.Util.worldToScreen(gSelf.areaPtArr[gSelf.areaPtArr.length - 1].x, gSelf.areaPtArr[gSelf.areaPtArr.length - 1].y);
          gSelf.areaPtArr = [];
          returnLenArea = "周长：" + Math.round(perimeter) + "米" + "；" + "面积：" + Math.round(area) + "平方米";
          ctx.font = 'bold 15px 幼圆';
          ctx.fillText(returnLenArea, sxy.x, sxy.y);
        }
        return returnLenArea;
      }
    },
    /**
     * 添加图层
     * @param {Object} layer
     */
    addLayer: function (layer) {
      var oLayers = this.oLayers;
      //console.log(oLayers);
      if (!gEcnu.Util.isObjInArray(oLayers, layer)) {
        layer.onAdd(this);   // this指向map  onAdd: function (map)
        oLayers.push(layer);
      }
      //console.log(oLayers);
    },
    /**
     * 移除图层
     * @param layer
     */
    removeLayer: function (layer) {
      var oLayer = [];
      var oLayers = this.oLayers;
      for (var i = 0, a = 0; i < oLayers.length; i++) {
        if (oLayers[i] != layer) {
          oLayer[a] = oLayers[i];
          a++;
        } else {
          layer.onRemove(this);
        }
      }
      oLayers = oLayer;
    },
    /**
     *  添加图层组
     * @param layers 图层数组
     */
    addLayers: function (layers) {
      var oLayers = this.oLayers;
      for (var i in layers) {
        if (!gEcnu.Util.isObjInArray(oLayers, layers[i])) {
          layers[i].onAdd(this);
          oLayers.push(layers[i]);
        }
      }
    },
    /**
     *  移除图层组
     * @param layers 图层数组
     */
    removeLayers: function (layers) {
      var oLayer = [];
      var oLayers = this.oLayers;
      for (var k in layers) {
        for (var i = 0, a = 0; i < oLayers.length; i++) {
          if (oLayers[i] != layers[k]) {
            oLayer[a] = oLayers[i];
            a++;
          } else {
            layers[k].onRemove(this);
          }
        }
      }
      oLayers = oLayer;
    },
    addControl: function (control) {
      var oControls = this.getAllControls();
      if (!gEcnu.Util.isObjInArray(oControls, control)) {
        control.onAdd(this);
        oControls.push(control);
      }
      //console.log(oControls);
    },
    /**
     * 获取全部图层
     * @returns {Array}
     */
    getAllLayers: function () {
      return this.oLayers;
    },
    getAllControls: function () {
      return this.oControls;
    },
    /**
     * 视野放大操作
     */
    zoomIn: function () {
      console.log("OK");
      if (this.ownTile) {
        if (this.zl <= this.minLevel) {
          return;
        }
      }
      var oLayers = this.getAllLayers();
      this.zoom = this.zoom / 2;
      this.zl--;
      for (var i = 0; i < oLayers.length; i++) {
        oLayers[i].zoomIn();
      }
      var oControls = this.getAllControls();
      for (var j = 0; j < oControls.length; j++) {
        oControls[j].renew();
      }
    },
    /**
     * 视野缩小操作
     */
    zoomOut: function () {
      if (this.ownTile) {
        if (this.zl >= this.maxLevel) {
          return;
        }
      }
      var oLayers = this.getAllLayers();
      this.zoom = this.zoom * 2;
      this.zl++;
      for (var i = 0; i < oLayers.length; i++) {
        oLayers[i].zoomOut();
      }
      var oControls = this.getAllControls();
      for (var j = 0; j < oControls.length; j++) {
        oControls[j].renew();
      }
    },
    /**
     * 平移地图
     * @param cx 地理中心点x坐标
     * @param cy 地理中心点y坐标
     * @param zl 视野范围
     */
    zoomTo: function (cx, cy, z) {
      this.setCenter(cx, cy);
      var oLayers = this.getAllLayers();
      if (z.hasOwnProperty("zl")) {
        this.zl = z.zl;
        for (var i = 0; i < oLayers.length; i++) {
          if (oLayers[i].class == 'tileLayer') {
            oLayers[i].zoomTo();
          }
        }
        for (var i = 0; i < oLayers.length; i++) {
          if (oLayers[i].class != 'tileLayer') {
            oLayers[i].zoomTo();
          }
        }
      } else if (z.hasOwnProperty("zoom")) {    /*只有动态图 没有切片；有切片必须传zl值*/
        this.zoom = z.zoom;
        for (var i = 0; i < oLayers.length; i++) {
          if (oLayers[i].class == 'dynLayer') {
            oLayers[i].zoomTo();
          }
        }
      }
    },
    /**
     * 地图resize操作
     */
    resize: function () {
      var prew = this.w;
      var preh = this.h;
      var w = this._container.clientWidth;
      var h = this._container.clientHeight;
      var wxy = gEcnu.Util.screenToWorld(w / 2, h / 2);
      this.cx = wxy.x;
      this.cy = wxy.y;
      this.w = w;
      this.h = h;
      var oLayers = this.getAllLayers();
      for (var i = 0; i < oLayers.length; i++) {
        oLayers[i].resize();
      }
    },
    /**
     * 获取地图容器
     * @returns {*|jQuery|HTMLElement|_container}
     */
    getContainer: function () {
      return this._container;
    },
    /**
     * 获取地图宽高
     * @returns {{w: *, h: *}}
     */
    getSize: function () {
      return {
        w: this.w,
        h: this.h
      };
    },
    /**
     * 获取视野范围
     * @returns {{z: number, zl: *}}
     */
    getZoom: function () {
      return {
        z: this.zoom,
        zl: this.zl
      }
    },
    /**
     * 设定视野范围
     * @param zoom
     */
    setZoom: function (zoom) {
      this.zoom = zoom;
    },
    setZoomLevel: function (zl) {

    },
    /**
     * 获取地图中心点
     * @returns {{x: number, y: number}}
     */
    getCenter: function () {
      return {
        x: this.cx,
        y: this.cy
      }
    },
    /**
     * 设定中心点
     * @param cx
     * @param cy
     */
    setCenter: function (cx, cy) {
      this.cx = cx;
      this.cy = cy;
    },
    /**
     * 获取屏幕中心点
     * @returns {{x: number, y: number}}
     */
    getScreenCenter: function () {
      return {
        x: this.w / 2,
        y: this.h / 2
      }
    },
    getBounds: function () {
      var cxy = this.getCenter();
      var size = this.getSize();
      var z = this.getZoom();
      var wl = cxy.x - z.z / 2;
      var wr = cxy.x + z.z / 2;
      var scale = size.w / z.z;
      var ht = cxy.y - size.h * scale / 2;
      var hb = cxy.y + size.h * scale / 2;
      return {
        'nw': {
          'x': wl,
          'y': ht
        },
        'ne': {
          'x': wr,
          'y': ht
        },
        'sw': {
          'x': wl,
          'y': hb
        },
        'se': {
          'x': wr,
          'y': hb
        }
      }
    },
    getMode: function () {
      return this.mode;
    },
    setMode: function (mode) {
      this.mode = mode;
    },
    /**
     * 自定义mousedown事件响应函数
     * @param e
     */
    mousedownCustom: function (e) {

    },
    /**
     * 自定义mousemove事件响应函数
     * @param e
     */
    mousemoveCustom: function (e) {

    },
    /**
     * 自定义mouseup事件响应函数
     * @param e
     */
    mouseupCustom: function (e) {

    },
    /**
     * 自定义mousewheel事件响应函数
     * @param e
     */
    mousewheelCustom: function (e) {

    },
    mousedblclickCustom: function (e) {

    }

});