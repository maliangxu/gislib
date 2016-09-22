/********gEcnu的绘制对象*************/
gEcnu.Graph = {};
  /**
   * 绘制点
   * @param ctx
   * @param pt
   */
  gEcnu.Graph.drawPoint = function (ctx, pt) { 
   // var opt = gEcnu.Util.setStyle(ctx, 'point');
    var pt=gEcnu.Util.worldToScreen(pt.x,pt.y)  /***add**********/
    ctx.beginPath();  ctx.fillStyle="red"; 
    ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  };

  /**
   * 绘制节点
   * @param ctx
   * @param pt
   */
  gEcnu.Graph.drawVtx = function (ctx, pt) {
    var opt = gEcnu.Util.setStyle(ctx, 'vtx');
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, opt.vtxRadius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  };

  /**
   * 绘制线
   * @param ctx
   * @param pt1
   * @param pt2
   */
  gEcnu.Graph.drawLine = function (ctx, pt1, pt2) {  /*worldToScreen放在该函数中更合适些  lc*/
    ctx.beginPath();
    ctx.moveTo(pt1.x, pt1.y);
    ctx.lineTo(pt2.x, pt2.y);
    ctx.closePath();
    ctx.stroke();
  };

  /**
   * 绘制多个点
   * @param ctx
   * @param ptArr
   */
  gEcnu.Graph.drawPoints = function (ctx, ptArr) {  
    for (var i = 0; i < ptArr.length; i++) {
      this.drawPoint(ctx, ptArr[i]);
    }
  };


  /**
   * 绘制多条线
   * @param ctx
   * @param ptArr
   */
  gEcnu.Graph.drawLines = function (ctx, ptArr) {
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
   * 获取节点数组
   * @param ptArr
   * @returns {Array}
   */
  gEcnu.Graph.getSelectedPolyPoints = function (ptArr) {
    var tmpArr = [];
    for (var m = 0; m < ptArr.length; m++) {
      var vtxObj = {};
      vtxObj.ID = ptArr[m].ID;
      var sxy = gEcnu.Util.worldToScreen(ptArr[m].x, ptArr[m].y);
      vtxObj.sx = sxy.x;
      vtxObj.sy = sxy.y;
      vtxObj.x = ptArr[m].x;
      vtxObj.y = ptArr[m].y;
      tmpArr.push(vtxObj);
    }
    return tmpArr;
  };

  /**
   * 捕捉点
   * @param pt
   * @param polyArr
   * @returns {string}
   */
  gEcnu.Graph.catchPoint = function (pt, polyArr) {  //多边形数组
    var returncatchPoint = "false";
    if (polyArr.length == 0) {
      return returncatchPoint;
    } else {

      for (var i = 0; i < polyArr.length; i++) {
        var ptArr = polyArr[i].vtxArr;          //每个多边形的节点数组
        for (var j = 0; j < ptArr.length; j++) {

          var sxy = gEcnu.Util.worldToScreen(ptArr[j].x, ptArr[j].y);
          sxy.PolyID = polyArr[i].ID;
          sxy.cID = j;
          //console.log(pt,sxy);
          var dis = Math.sqrt((pt.x - sxy.x) * (pt.x - sxy.x) + (pt.y - sxy.y) * (pt.y - sxy.y));  //屏幕距离差
          //console.log(dis);
          if (dis <= 5) //5为容限
          {
            pt.x = sxy.x;
            pt.y = sxy.y;
            if (returncatchPoint == "false") {
              returncatchPoint = "true|" + pt.x + "," + pt.y + "," + sxy.PolyID + "," + sxy.cID;
            } else if (returncatchPoint != "false") {
              returncatchPoint += "|" + pt.x + "," + pt.y + "," + sxy.PolyID + "," + sxy.cID;  /**************/
            }
          }
        }
      }
    }
    return returncatchPoint;
  };

  /**
   * 捕捉线
   * @param pt
   * @param polyArr
   * @returns {string}
   */
   //判断当前点距离哪条线段最近
  gEcnu.Graph.catchLine = function (pt, polyArr) {  
    var x = pt.x;
    var y = pt.y;
    var returnString = "false";
    for (var i = 0; i < polyArr.length; i++) {
      var ptArr = polyArr[i].vtxArr;
      for (var j = 0; j < ptArr.length; j++) {
        if (j < ptArr.length - 1) {
          var sxy1 = gEcnu.Util.worldToScreen(ptArr[j].x, ptArr[j].y);
          var sxy2 = gEcnu.Util.worldToScreen(ptArr[j + 1].x, ptArr[j + 1].y);
          var minx = Math.min(sxy1.x, sxy2.x);
          var maxx = Math.max(sxy1.x, sxy2.x);
          var miny = Math.min(sxy1.y, sxy2.y);
          var maxy = Math.max(sxy1.y, sxy2.y);
          //存在斜率并且斜率不为0的情况
          if ((sxy1.x != sxy2.x) && (sxy1.y != sxy2.y)) {
            var k = (sxy2.y - sxy1.y) / (sxy2.x - sxy1.x);
            var k_v = (-1) / k;
            var b = sxy1.y - k * (sxy1.x);
            var b_v = y - k_v * x;
            //计算鼠标单击处与直线交点坐标
            var interVtx_X = (b_v - b) / (k - k_v);
            var interVtx_Y = k * interVtx_X + b;
            if (interVtx_X >= minx && interVtx_X <= maxx && interVtx_Y >= miny && interVtx_Y <= maxy) {
              var dis = Math.sqrt((x - interVtx_X) * (x - interVtx_X) + (y - interVtx_Y) * (y - interVtx_Y));
              if (dis < 5) {
                returnString = "true|" + interVtx_X + "," + interVtx_Y + "|" + sxy1.x + "," + sxy1.y + "|" + sxy2.x + "," + sxy2.y + "|" + polyArr[i].ID;
                return returnString;
                break;
              }
            }
          }
          if (sxy1.x == sxy2.x) //斜率为无穷大
          {
            //计算鼠标单击处与直线交点坐标
            var interVtx_X = sxy1.x;
            var interVtx_Y = y;
            if (interVtx_X >= minx && interVtx_X <= maxx && interVtx_Y >= miny && interVtx_Y <= maxy) {
              var dis = Math.abs(interVtx_X - x);
              if (dis < 5) {
                returnString = "true|" + interVtx_X + "," + interVtx_Y + "|" + sxy1.x + "," + sxy1.y + "|" + sxy2.x + "," + sxy2.y + "|" + polyArr[i].ID;
                return returnString;
                break;
              }
            }
          }

          if (sxy1.y == sxy2.y) //斜率为0
          {
            //计算鼠标单击处与直线交点坐标
            var interVtx_X = x;
            var interVtx_Y = sxy1.y;
            if (interVtx_X >= minx && interVtx_X <= maxx && interVtx_Y >= miny && interVtx_Y <= maxy) {
              var dis = Math.abs(y - interVtx_Y);
              if (dis < 5) {
                returnString = "true|" + interVtx_X + "," + interVtx_Y + "|" + sxy1.x + "," + sxy1.y + "|" + sxy2.x + "," + sxy2.y + "|" + polyArr[i].ID;
                return returnString;
                break;
              }
            }
          }
        } else {   //计算鼠标单击处与直线（第一个结点与最后一个节点的连线）交点坐标
          var sxy0 = gEcnu.Util.worldToScreen(ptArr[0].x, ptArr[0].y);
          var sxy1 = gEcnu.Util.worldToScreen(ptArr[j].x, ptArr[j].y);
          var minx1 = Math.min(sxy1.x, sxy0.x);
          var maxx1 = Math.max(sxy1.x, sxy0.x);
          var miny1 = Math.min(sxy1.y, sxy0.y);
          var maxy1 = Math.max(sxy1.y, sxy0.y);
          if ((sxy1.x != sxy0.x) && (sxy1.y != sxy0.y)) {
            var k = (sxy0.y - sxy1.y) / (sxy0.x - sxy1.x)
            var k_v = (-1) / k;
            var b = sxy1.y - k * (sxy1.x);
            var b_v = y - k_v * x;
            //计算鼠标单击处与直线交点坐标
            var interVtx_X = (b_v - b) / (k - k_v);
            var interVtx_Y = k * interVtx_X + b;
            //判断鼠标单击位置位于特定范围内
            if (interVtx_X >= minx1 && interVtx_X <= maxx1 && interVtx_Y >= miny1 && interVtx_Y <= maxy1) {
              var dis = Math.sqrt((x - interVtx_X) * (x - interVtx_X) + (y - interVtx_Y) * (y - interVtx_Y));
              if (dis < 5) {
                returnString = "true|" + interVtx_X + "," + interVtx_Y + "|" + sxy1.x + "," + sxy1.y + "|" + sxy0.x + "," + sxy0.y + "|" + polyArr[i].ID;
                return returnString;
                break;
              }
            }
          }
          if (sxy1.x == sxy0.x) //斜率为无穷大
          {
            //计算鼠标单击处与直线交点坐标
            var interVtx_X = sxy1.x;
            var interVtx_Y = y;
            if (interVtx_X >= minx1 && interVtx_X <= maxx1 && interVtx_Y >= miny1 && interVtx_Y <= maxy1) {
              var dis = Math.abs(interVtx_X - x);
              if (dis < 5) {
                returnString = "true|" + interVtx_X + "," + interVtx_Y + "|" + sxy1.x + "," + sxy1.y + "|" + sxy0.x + "," + sxy0.y + "|" + polyArr[i].ID;
                return returnString;
                break;
              }
            }
          }
          if (sxy1.y == sxy0.y) //斜率为0
          {
            //计算鼠标单击处与直线交点坐标
            var interVtx_X = x;
            var interVtx_Y = sxy1.y;
            if (interVtx_X >= minx1 && interVtx_X <= maxx1 && interVtx_Y >= miny1 && interVtx_Y <= maxy1) {
              var dis = Math.abs(y - interVtx_Y);
              if (dis < 5) {
                returnString = "true|" + interVtx_X + "," + interVtx_Y + "|" + sxy1.x + "," + sxy1.y + "|" + sxy0.x + "," + sxy0.y + "|" + polyArr[i].ID;
                return returnString;
                break;
              }
            }
          }
        }
      }
    }
    return returnString;
  };

  /**
   * 添加节点
   * @param pt
   * @param poly
   * @returns {Array}
   */
  gEcnu.Graph.addPolygonvtx = function (pt, poly) {
    var reutrnpoly = [];
    var addVtxJsonID = poly[0].ID;
    for (var m = 1; m < poly.length; m++) {
      if (addVtxJsonID <= poly[m].ID) {
        addVtxJsonID = poly[m].ID;
      }
    }
    addVtxJsonID++;
    var addvtx_X = pt.x;
    var addvtx_Y = pt.y;
    for (var i = 0; i < poly.length; i++) {
      if (i < poly.length - 1) {
        if ((poly[i].sx != poly[i + 1].sx) && (poly[i].sy != poly[i + 1].sy)) {
          var k = (poly[i + 1].sy - poly[i].sy) / (poly[i + 1].sx - poly[i].sx);
          var k_v = (-1) / k;
          var b = poly[i].sy - k * (poly[i].sx);
          var b_v = addvtx_Y - k_v * addvtx_X;
          //计算鼠标单击处与直线交点坐标
          var interVtx_X = (b_v - b) / (k - k_v);
          var interVtx_Y = k * interVtx_X + b;
          //判断鼠标单击位置位于特定范围内
          if (interVtx_X >= Math.min(poly[i].sx, poly[i + 1].sx) && interVtx_X <= Math.max(poly[i].sx, poly[i + 1].sx) && interVtx_Y >= Math.min(poly[i].sy, poly[i + 1].sy) && interVtx_Y <= Math.max(poly[i].sy, poly[i + 1].sy)) {
            var dis = Math.sqrt((addvtx_X - interVtx_X) * (addvtx_X - interVtx_X) + (addvtx_Y - interVtx_Y) * (addvtx_Y - interVtx_Y));
            if (dis < 5) {
              var wxy = gEcnu.Util.screenToWorld(interVtx_X, interVtx_Y);
              var addVtsJson = {
                'ID': addVtxJsonID,
                'x': parseInt(wxy.x),
                'y': parseInt(wxy.y)
              };
              for (var j = 0; j < poly.length; j++) {
                var ptObj = {      //第i个结点坐标信息
                  'ID': poly[j].ID,
                  'x': poly[j].x,
                  'y': poly[j].y
                };
                if (j == i) {
                  reutrnpoly.push(ptObj);  
                  reutrnpoly.push(addVtsJson);
                } else {
                  reutrnpoly.push(ptObj);
                }
              }
              break;
            }
          }
        }

        if (poly[i].sx == poly[i + 1].sx) //斜率为无穷大
        {
          //计算鼠标单击处与直线交点坐标
          var interVtx_X = poly[i].sx;
          var interVtx_Y = addvtx_Y;
          if (interVtx_X >= Math.min(poly[i].sx, poly[i + 1].sx) && interVtx_X <= Math.max(poly[i].sx, poly[i + 1].sx) && interVtx_Y >= Math.min(poly[i].sy, poly[i + 1].sy) && interVtx_Y <= Math.max(poly[i].sy, poly[i + 1].sy)) {
            var dis = Math.abs(interVtx_X - addvtx_X);
            if (dis < 5) {
              var wxy = gEcnu.Util.screenToWorld(interVtx_X, interVtx_Y);
              var addVtsJson = {
                ID: addVtxJsonID,
                'x': parseInt(wxy.x),
                'y': parseInt(wxy.y)
              };
              for (var j = 0; j < poly.length; j++) {
                var ptObj = {
                  'ID': poly[j].ID,
                  'x': poly[j].x,
                  'y': poly[j].y
                };
                if (j == i) {
                  reutrnpoly.push(ptObj);
                  reutrnpoly.push(addVtsJson);
                } else {
                  reutrnpoly.push(ptObj);
                }
              }
              break;
            }
          }
        }

        if (poly[i].sy == poly[i + 1].sy) //斜率为0
        {
          //计算鼠标单击处与直线交点坐标
          var interVtx_X = addvtx_X;
          var interVtx_Y = poly[i].sx;
          if (interVtx_X >= Math.min(poly[i].sx, poly[i + 1].sx) && interVtx_X <= Math.max(poly[i].sx, poly[i + 1].sx) && interVtx_Y >= Math.min(poly[i].sy, poly[i + 1].sy) && interVtx_Y <= Math.max(poly[i].sy, poly[i + 1].sy)) {
            var dis = Math.abs(addvtx_Y - interVtx_Y);
            if (dis < 5) {
              var wxy = gEcnu.Util.screenToWorld(interVtx_X, interVtx_Y);
              var addVtsJson = {
                ID: addVtxJsonID,
                'x': parseInt(wxy.x),
                'y': parseInt(wxy.y)
              };
              for (var j = 0; j < poly.length; j++) {
                var ptObj = {
                  'ID': poly[j].ID,
                  'x': poly[j].x,
                  'y': poly[j].y
                };
                if (j == i) {
                  reutrnpoly.push(poly[j]);
                  reutrnpoly.push(addVtsJson);
                } else {
                  reutrnpoly.push(poly[j]);
                }
              }
              break;
            }
          }
        }

      } else //当i为多边形顶点的最后一个时，需要和第一个组对
      {
        if ((poly[i].sx != poly[0].sx) && (poly[i].sy != poly[0].sy)) {
          var k = (poly[0].sy - poly[i].sy) / (poly[0].sx - poly[i].sx);
          var k_v = (-1) / k;
          var b = poly[i].sy - k * (poly[i].sx);
          var b_v = addvtx_Y - k_v * addvtx_X;
          //计算鼠标单击处与直线交点坐标
          var interVtx_X = (b_v - b) / (k - k_v);
          var interVtx_Y = k * interVtx_X + b;
          //判断鼠标单击位置位于特定范围内
          if (interVtx_X >= Math.min(poly[i].sx, poly[0].sx) && interVtx_X <= Math.max(poly[i].sx, poly[0].sx) && interVtx_Y >= Math.min(poly[i].sy, poly[0].sy) && interVtx_Y <= Math.max(poly[i].sy, poly[0].sy)) {
            var dis = Math.sqrt((addvtx_X - interVtx_X) * (addvtx_X - interVtx_X) + (addvtx_Y - interVtx_Y) * (addvtx_Y - interVtx_Y));
            if (dis < 5) {
              var wxy = gEcnu.Util.screenToWorld(interVtx_X, interVtx_Y);
              var addVtsJson = {
                ID: addVtxJsonID,
                'x': parseInt(wxy.x),
                'y': parseInt(wxy.y)
              };
              for (var j = 0; j < poly.length; j++) {
                var ptObj = {
                  'ID': poly[j].ID,
                  'x': poly[j].x,
                  'y': poly[j].y
                };
                reutrnpoly.push(ptObj);
              }
              reutrnpoly.push(addVtsJson);
              break;
            }
          }
        }
        if (poly[i].sx == poly[0].sx) //斜率为无穷大
        {
          //计算鼠标单击处与直线交点坐标
          var interVtx_X = poly[i].sx;
          var interVtx_Y = addvtx_Y;
          if (interVtx_X >= Math.min(poly[i].sx, poly[0].sx) && interVtx_X <= Math.max(poly[i].sx, poly[0].sx) && interVtx_Y >= Math.min(poly[i].sy, poly[0].sy) && interVtx_Y <= Math.max(poly[i].sy, poly[0].sy)) {
            var dis = Math.abs(interVtx_X - addvtx_X);
            if (dis < 5) {
              var wxy = gEcnu.Util.screenToWorld(interVtx_X, interVtx_Y);
              var addVtsJson = {
                ID: addVtxJsonID,
                'x': parseInt(wxy.x),
                'y': parseInt(wxy.y)
              };
              for (var j = 0; j < poly.length; j++) {
                var ptObj = {
                  'ID': poly[j].ID,
                  'x': poly[j].x,
                  'y': poly[j].y
                };
                reutrnpoly.push(ptObj);
              }
              reutrnpoly.push(addVtsJson);
              break;
            }
          }
        }
        if (poly[i].sy == poly[0].sy) //斜率为0
        {
          //计算鼠标单击处与直线交点坐标
          var interVtx_X = addvtx_X;
          var interVtx_Y = poly[i].sy;
          if (interVtx_X >= Math.min(poly[i].sx, poly[0].sx) && interVtx_X <= Math.max(poly[i].sx, poly[0].sx) && interVtx_Y >= Math.min(poly[i].sy, poly[0].sy) && interVtx_Y <= Math.max(poly[i].sy, poly[0].sy)) {
            var dis = Math.abs(addvtx_Y - interVtx_Y);
            if (dis < 5) {
              var wxy = gEcnu.Util.screenToWorld(interVtx_X, interVtx_Y);
              var addVtsJson = {
                ID: addVtxJsonID,
                'x': parseInt(wxy.x),
                'y': parseInt(wxy.y)
              };
              for (var j = 0; j < poly.length; j++) {
                var ptObj = {
                  'ID': poly[j].ID,
                  'x': poly[j].x,
                  'y': poly[j].y
                };
                reutrnpoly.push(ptObj);
              }
              reutrnpoly.push(addVtsJson);
              break;
            }
          }
        }
      }
    }
    return reutrnpoly;
  };


  /**
   * 判断点是否在多边形内
   * @param pt
   * @param poly
   * @returns {boolean}
   */
  gEcnu.Graph.pointInPoly = function (pt, poly) {         /********pt范围判断 ；分母为0？？交点求法有问题*************/
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
      ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && (c = !c);
    return c;
  };

  /**
   * 获取节点屏幕坐标数组
   * @param ptArr
   * @returns {Array}
   */
  gEcnu.Graph.getScreenPointArr = function (ptArr) {
    var polyPointArr = [];
    for (var j = 0; j < ptArr.length; j++) {
      var sxy = gEcnu.Util.worldToScreen(ptArr[j].x, ptArr[j].y);
      polyPointArr.push(sxy);
    }
    return polyPointArr;
  };

  /**
   * 获取最小外接矩形
   * @param ptArr
   * @returns {{xmin: (*|x|x|x|x|x), ymin: (*|y|y|y|y|y), xmax: (*|x|x|x|x|x), ymax: (*|y|y|y|y|y)}}
   */
  gEcnu.Graph.getShpBox = function (ptArr) {
    var pts = ptArr;
    var xmin, ymin, xmax, ymax;
    xmin = pts[0].x;
    ymin = pts[0].y;
    xmax = pts[0].x;
    ymax = pts[0].y;
    for (var i = 0; i < pts.length; i++) {
      if (xmin > pts[i].x) {
        xmin = pts[i].x;
      }
      if (xmax < pts[i].x) {
        xmax = pts[i].x;
      }
      if (ymin > pts[i].y) {
        ymin = pts[i].y;
      }
      if (ymax < pts[i].y) {
        ymax = pts[i].y;
      }
    }
    return {
      xmin: xmin,
      ymin: ymin,
      xmax: xmax,
      ymax: ymax
    };
  };

  /**
   * 获取当前视图范围内多边形
   * @param allpolygons
   * @returns {Array}
   */
  gEcnu.Graph.getCurViewPolys = function (allpolygons) {
    var curViewPolygons = [];
    if (allpolygons.length == 0) return curViewPolygons;
    var leftopCoords = gEcnu.Util.screenToWorld(0, 0); //视窗范围内左上角地理坐标
    var ritbotCoords = gEcnu.Util.screenToWorld(parseInt(gSelf.w), parseInt(gSelf.h)); //视窗范围内右下角地理坐标
    var borderMinX = Math.min(leftopCoords.x, ritbotCoords.x);
    var borderMaxX = Math.max(leftopCoords.x, ritbotCoords.x);
    var borderMinY = Math.min(leftopCoords.y, ritbotCoords.y);
    var borderMaxY = Math.max(leftopCoords.y, ritbotCoords.y);
    var tmpcurrScrPoly = [];
    var len = allpolygons.length;
    for (var i = 0; i < len; i++) {
      var xmin = allpolygons[i].geoShpBox.xmin;
      var ymin = allpolygons[i].geoShpBox.ymin;
      var xmax = allpolygons[i].geoShpBox.xmax;
      var ymax = allpolygons[i].geoShpBox.ymax;
      if (borderMinX < xmin && xmin < borderMaxX && borderMinY < ymin && ymin < borderMaxY) {
        tmpcurrScrPoly.push(allpolygons[i]);
        continue;
      } else if (borderMinX < xmin && xmin < borderMaxX && borderMinY < ymax && ymax < borderMaxY) {
        tmpcurrScrPoly.push(allpolygons[i]);
        continue;
      } else if (borderMinX < xmax && xmax < borderMaxX && borderMinY < ymin && ymin < borderMaxY) {
        tmpcurrScrPoly.push(allpolygons[i]);
        continue;
      } else if (borderMinX < xmax && xmax < borderMaxX && borderMinY < ymax && ymax < borderMaxY) {
        tmpcurrScrPoly.push(allpolygons[i]);
        continue;
      }
    }
    curViewPolygons = tmpcurrScrPoly.concat();
    return curViewPolygons;
  };

  /**
   * 平移多边形
   * @param ctx
   * @param selectedPolyId
   * @param dltx
   * @param dlty
   */
  gEcnu.Graph.movePolygon = function (ctx, selectedPolyId, dltx, dlty) {
    gSelf.activeLayer.clear();
    var storePoly = gSelf.curScrPolys;
    for (var i = 0; i < storePoly.length; i++) {
      if (storePoly[i].ID == selectedPolyId) {
        var ptArr = storePoly[i].vtxArr;
        for (var j = 0; j < ptArr.length; j++) {
          var sxy = gEcnu.Util.worldToScreen(G.selectedPoly.vtxArr[j].x, G.selectedPoly.vtxArr[j].y);
          //console.log(sxy);
          var x = sxy.x + dltx;
          var y = sxy.y + dlty;
          //console.log(sxy.x,sxy.y,dltx,dlty);
          var wxy = gEcnu.Util.screenToWorld(x, y);
          ptArr[j].x = wxy.x;
          ptArr[j].y = wxy.y;
        }
        //console.log(storePoly[i]);
        gSelf.activeLayer.renew();   /***************调用Layer.Feature类的renew方法,重绘****************/
        break;
      }
    }
  };


  /**
   * 删除要素
   * @param type
   */
  gEcnu.Graph.delFeature = function (type) {
    switch (type) {
    case 'polygon':
      if (!G.selectedPolygonID) {
        alert('未选中要素!');
      } else {
        var oFeatures = gSelf.activeLayer.getAllFeatures();
        for (var i = 0; i < oFeatures.length; i++) {

          if (oFeatures[i].ID == G.selectedPolygonID && oFeatures[i].class == 'polygon') {
            gSelf.activeLayer.removeFeature(oFeatures[i]);
            //oFeatures.splice(i,1);
            break;
          }
        }
        var oFeatures = gSelf.activeLayer.getAllFeatures();
      }
      break;
    }
  };