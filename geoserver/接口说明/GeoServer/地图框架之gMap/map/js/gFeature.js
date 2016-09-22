gEcnu.Feature = {};
  /**
   * 点要素
   * @param ID
   * @param x
   * @param y
   * @returns {{}}
   * @constructor
   */
  gEcnu.Feature.Point = function (ID, x, y) {
    var ptObj = {};
    ptObj.ID = ID;
    ptObj.x = x;
    ptObj.y = y;
    return ptObj;
  };

  var gPath = gClass.extend({
    init: function (name,ID, vtxArr, info) {
      this.name = name;
      this.ID=ID;
      this.vtxArr = vtxArr;
      //this.geoShpBox = gEcnu.Graph.getShpBox(vtxArr);
      this.info = {
        'type': 'feature'
      };
      this.info = this.setInfo(info);
    },
    setInfo: function (info) {
      var tmpObj = gEcnu.Util.cloneObj(this.info);   
      for (var k in info) {
        if (info[k] != null || info[k] != undefined || info[k] != '') {
          tmpObj[k] = info[k];
        }
      }
      return tmpObj;
    }
  });

  /**
   * Polyline要素
   * @type {*|void}
   */
  gEcnu.Feature.Polyline = gPath.extend({
    init: function (name,ID, ptArr, info) {
      this._super(name, ID,ptArr, info);
      this.class = 'polyline';
    },
    addEnd: function (pt) {
      this.vtxArr.push(pt);
    },
    removeEnd: function () {
      this.vtxArr.pop();
    },
    /**
     * 重设节点
     * @param ptArr
     */
    setVtxs: function (ptArr) {
      this.vtxArr = ptArr;
    },
    /**
     * 添加节点
     * @param pt
     * @param index
     */
    addVtx: function (pt, index) {
      this.vtxArr.splice(index, 0, pt);
    },
    /**
     * 移除节点
     * @param id
     */
    removeVtx: function (id) {
      for (var i = 0; i < this.vtxArr.length; i++) {
        if (vtxArr[i].id == id) {
          this.points.splice(i, 1);  //删除从 index 处开始的零个或多个元素，并且用参数列表中声明的一个或多个值来替换那些被删除的元素。
          break;
        }
      }
    },
    onAdd: function (layer) {
      this._layer = layer;
      this.onDraw(layer);
    },
    onRemove: function (layer) {

    },
    onDraw: function (layer) {  //在layer画布上绘制
      var ctx = layer.getCtx();
      var opt = gEcnu.Util.setStyle(ctx, this.info.type);  //只接受一个参数
      var map = layer.getMap();
      var len = this.vtxArr.length;
      if (len >= 2) {
        ctx.beginPath();
        var sxy = gEcnu.Util.worldToScreen(this.vtxArr[0].x, this.vtxArr[0].y);
        ctx.moveTo(sxy.x, sxy.y); //设置起点
        for (var i = 1; i < len; i++) {
          sxy = gEcnu.Util.worldToScreen(this.vtxArr[i].x, this.vtxArr[i].y);
          ctx.lineTo(sxy.x, sxy.y);
        }
      }
      ctx.stroke();
    },
    /**
     * 获取所在图层
     * @returns {*}
     */
    getLayer: function () {
      return this._layer;
    }
  });

  gEcnu.Feature.Polygon = gEcnu.Feature.Polyline.extend({
    init: function (name,ID, ptArr, info) {
      this._super(name, ID,ptArr, info);
      this.class = 'polygon';
    },
    /**
     * 绘制
     * @param layer
     */
    onDraw: function (layer) {
      var ctx = layer.getCtx();
     // var opt = gEcnu.Util.setStyle(ctx, this.info.type);
      var opt =layer.style;
      ctx.fillStyle = opt.fillColor;
      ctx.strokeStyle = opt.strokeColor;
      ctx.lineWidth = opt.lineWeight;
      ctx.opacity=opt.opacity;
      var map = layer.getMap();
      var len = this.vtxArr.length;
      if (len > 2) {
        ctx.beginPath();
        var sxy = gEcnu.Util.worldToScreen(this.vtxArr[0].x, this.vtxArr[0].y);
        ctx.moveTo(sxy.x, sxy.y); //设置起点
        for (var i = 1; i < len; i++) {
          sxy = gEcnu.Util.worldToScreen(this.vtxArr[i].x, this.vtxArr[i].y);
          ctx.lineTo(sxy.x, sxy.y);
        }
      }
      ctx.closePath();
      if (opt.borderStatus) {
        ctx.stroke();
      }
      if (opt.fillStatus) {

        ctx.globalAlpha = opt.opacity;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
      if (opt.vtxStatus) {
        for (var k = 0; k < len; k++) {
          gEcnu.Graph.drawPoint(ctx, gEcnu.Util.worldToScreen(this.vtxArr[k].x, this.vtxArr[k].y));
        }
      }
    },
    /**
     * 选中模式
     */
    onSelect: function () {
      var map = this._layer.getMap();
      var ctx = map.overLayer.getCtx();
      gEcnu.Util.setStyle(ctx);
      var len = this.vtxArr.length;
      if (len > 2) {
        ctx.beginPath();
        var sxy = gEcnu.Util.worldToScreen(this.vtxArr[0].x, this.vtxArr[0].y);
        ctx.moveTo(sxy.x, sxy.y); //设置起点
        for (var i = 1; i < len; i++) {
          sxy = gEcnu.Util.worldToScreen(this.vtxArr[i].x, this.vtxArr[i].y);
          ctx.lineTo(sxy.x, sxy.y);
        }
      }
      ctx.closePath();
      ctx.stroke();
      for (var k = 0; k < len; k++) {
        gEcnu.Graph.drawPoint(ctx, gEcnu.Util.worldToScreen(this.vtxArr[k].x, this.vtxArr[k].y));
      }
    }
  });

  /**
   * Marker要素
   * @type {*}
   */
  gEcnu.Feature.Marker = gClass.extend({
    init: function (name, info, options) {
      this.name = name;
      this._img = new Image();
      this._img.src = "images/marker.png";
      this._img.style.position = 'absolute';
      this._img.style.zIndex = 100;
      this.info = info;
    },
    onAdd: function (layer) {
      this._layer = layer;
      var map = layer.getMap();
      var container = this._container = layer.getLayerContainer();
      var sxy = gEcnu.Util.worldToScreen(this.info.x, this.info.y);
      this._img.style.left = sxy.x + 'px';
      this._img.style.top = sxy.y + 'px';
      container.appendChild(this._img);
    },
    onRemove: function () {
      this._container.removeChild(this._img);
    },
    getContainer: function () {
      return this._img;
    },
    renew: function () {
      var map = this._layer.getMap();
      var sxy = gEcnu.Util.worldToScreen(this.info.x, this.info.y);
      this._img.style.left = sxy.x + 'px';
      this._img.style.top = sxy.y + 'px';
    },
    showInfo: function () {
      console.log("Hello WebGIS");
    }
  });