/********gEcnu的绘制对象*************/
gEcnu.Graph = {};
  /**
   * 绘制点
   * @param ctx
   * @param pt
   */
  gEcnu.Graph.drawPoint = function (ctx, pt) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  };
    /**
   * 绘制线
   * @param ctx
   * @param pt1
   * @param pt2
   */
  gEcnu.Graph.drawLine = function (ctx, pt1, pt2) {
    ctx.beginPath();
    ctx.moveTo(pt1.x, pt1.y);
    ctx.lineTo(pt2.x, pt2.y);
    ctx.closePath();
    ctx.stroke();
  };
  gEcnu.Graph.drawPoint_geo = function (ctx, pt) {
    var sxy = gEcnu.Util.worldToScreen(pt.x, pt.y);
    ctx.beginPath();
    ctx.arc(sxy.x, sxy.y, 3, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  };
    /**
   * 绘制线
   * @param ctx
   * @param pt1
   * @param pt2
   */
  gEcnu.Graph.drawLine_geo = function (ctx, pt1, pt2) {
    var sxy1 = gEcnu.Util.worldToScreen(pt1.x, pt1.y);
    var sxy2 = gEcnu.Util.worldToScreen(pt2.x, pt2.y);
    ctx.beginPath();
    ctx.moveTo(sxy1.x, sxy1.y);
    ctx.lineTo(sxy2.x, sxy2.y);
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
      var sxy = {x:ptArr[i].x, y:ptArr[i].y};
      this.drawPoint(ctx, sxy);
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
    var sxy = {x:ptArr[0].x, y:ptArr[0].y};
    ctx.moveTo(sxy.x, sxy.y);
    for (var i = 1; i < ptArr.length; i++) {
      sxy = {x:ptArr[i].x, y:ptArr[i].y};
      ctx.lineTo(sxy.x, sxy.y);
    }
    ctx.stroke();
    //ctx.closePath();
  };
    /**
   * 绘制多个点
   * @param ctx
   * @param ptArr
   */
  gEcnu.Graph.drawPoints_geo = function (ctx, ptArr) {
    for (var i = 0; i < ptArr.length; i++) {
      var sxy = gEcnu.Util.worldToScreen(ptArr[i].x, ptArr[i].y);
      this.drawPoint(ctx, sxy);
    }
  };
  /**
   * 绘制多条线
   * @param ctx
   * @param ptArr
   */
  gEcnu.Graph.drawLines_geo = function (ctx, ptArr) {
    var len = ptArr.length;
    ctx.beginPath();
    var sxy = gEcnu.Util.worldToScreen(ptArr[0].x, ptArr[0].y);
    ctx.moveTo(sxy.x, sxy.y);
    for (var i = 1; i < ptArr.length; i++) {
      sxy = gEcnu.Util.worldToScreen(ptArr[i].x, ptArr[i].y);
      ctx.lineTo(sxy.x, sxy.y);
    }
    ctx.stroke();
    //ctx.closePath();
  };


  //点的捕捉
  /**
   * 判断是否取捕捉到的节点位置
   * @param  {Object} pt 节点对象
   * @param  {Array} storePolygons
   */
/*   gEcnu.Graph.catchPoint=function(pt,storePolygons){
    var returncatchPoint="false";
    var catchTole=5;
    if (storePolygons.length==0)
    {
      return returncatchPoint;
    }
    else
    {
      for (var i=0;i<storePolygons.length;i++)
      {
        var tmppoints=storePolygons[i].shape.Points;
        for (var j=0;j<tmppoints.length;j++)
        {
          var tmppoint=tmppoints[j];
          var sxy = gEcnu.Util.worldToScreen(tmppoint.x,tmppoint.y);
          var dis=Math.sqrt((pt.x-sxy.x)*(pt.x-sxy.x)+(pt.y-sxy.y)*(pt.y-sxy.y));
          if (dis<=catchTole)//3为容限
          {
            pt.x=sxy.x;
            pt.y=sxy.y;
            if(returncatchPoint=="false"){
              returncatchPoint="true|"+pt.x+","+pt.y+","+tmppoint.x+","+tmppoint.y;
              return returncatchPoint;
            }
          }
        }
      }
    }
    return returncatchPoint;
  };*/
  gEcnu.Graph.catchPoint=function(pt,storePolygons){
    var returncatchPoint="false";
    var catchTole=3;
    if (storePolygons.length==0)
    {
      return returncatchPoint;
    }
    else
    {
      for (var i=0;i<storePolygons.length;i++)
      {
        var _linestrings=storePolygons[i]._lineStrings;
        if(typeof _linestrings =="undefined"){
          var opelinePoints=storePolygons[i]._lineRings;
        }else{
           var opelinePoints=storePolygons[i]._lineStrings;
        }
        for(var jnum=0;jnum<opelinePoints.length;jnum++){
          var tmppoints=opelinePoints[jnum].points;
          var tmppoints_len=tmppoints.length;
          //var tmppoints=storePolygons[i].shape.Points;
          for (var j=0;j<tmppoints_len;j++)
          {
            var tmppoint=tmppoints[j];
            var sxy = gEcnu.Util.worldToScreen(tmppoint.x,tmppoint.y);
            var dis=Math.sqrt((pt.x-sxy.x)*(pt.x-sxy.x)+(pt.y-sxy.y)*(pt.y-sxy.y));
            if (dis<=catchTole)//3为容限
            {
              pt.x=sxy.x;
              pt.y=sxy.y;
              if(returncatchPoint=="false"){
                returncatchPoint="true|"+pt.x+","+pt.y+","+tmppoint.x+","+tmppoint.y+"|"+jnum+","+j;
                return returncatchPoint;
              }
            }
          }
        }
      }
    }
    return returncatchPoint;
  };
  /**
 * 判断是否捕捉到线
 * @param  {Number} x  鼠标指向坐标X 
 * @param  {Number} y  鼠标指向坐标Y
 * @param  {Array} storePolygons  多边形数组
 */
  gEcnu.Graph.catchLine=function(pt,storePolygons){
    var x=pt.x;
    var y=pt.y;
    var catchTole=3;
    var returnString="false";
    var mouse_WXY=gEcnu.Util.screenToWorld(x,y);
    var wcoord_x=mouse_WXY.x;
    var wcoord_y=mouse_WXY.y;
    var poly_len=storePolygons.length;
    for (var i=0;i<poly_len;i++)
    {
      var _linestrings=storePolygons[i]._lineStrings;
      if(typeof _linestrings =="undefined"){
        var opelinePoints=storePolygons[i]._lineRings;
      }else{
         var opelinePoints=storePolygons[i]._lineStrings;
      }
      for(var jnum=0;jnum<opelinePoints.length;jnum++){
      var tmppoints=opelinePoints[jnum].points;
      var tmppoints_len=tmppoints.length;
      for (var j=0;j<tmppoints_len;j++)
      {
        var tmppoint=tmppoints[j];
        if (j<tmppoints_len-1)
        {
          var tmppoint2=tmppoints[j+1];
          var sxy1 = gEcnu.Util.worldToScreen(tmppoint.x,tmppoint.y);
          var wx1=tmppoint.x;
          var wy1=tmppoint.y;
          var sxy2 = gEcnu.Util.worldToScreen(tmppoint2.x,tmppoint2.y);
          var wx2=tmppoint2.x;
          var wy2=tmppoint2.y;
          var minx=Math.min(wx1,wx2);
          var maxx=Math.max(wx1,wx2);
          var miny=Math.min(wy1,wy2);
          var maxy=Math.max(wy1,wy2);
          //存在斜率并且斜率不为0的情况
          if ((wx1!=wx2)&&(wy1!=wy2))
          {
            var k=(wy2-wy1)/(wx2-wx1);
            var k_v=(-1)/k;
            var b=wy1-k*wx1;
            var b_v=wcoord_y-k_v*wcoord_x;
            //计算鼠标单击处与直线交点坐标
            var interVtx_X=(b_v-b)/(k-k_v);
            var interVtx_Y=k*interVtx_X+b;      
            if (interVtx_X>minx&&interVtx_X<maxx&&interVtx_Y>miny&&interVtx_Y<maxy)
            {
               var scr_k=(sxy2.y-sxy1.y)/(sxy2.x-sxy1.x);
               var scr_k_v=(-1)/scr_k;
               var scr_b=sxy1.y-scr_k*(sxy1.x);
               var scr_b_v=y-scr_k_v*x;
               //计算鼠标单击处与直线交点坐标
               var scr_interVtx_X=(scr_b_v-scr_b)/(scr_k-scr_k_v);
               var scr_interVtx_Y=scr_k*scr_interVtx_X+scr_b;
               var dis=Math.sqrt((x-scr_interVtx_X)*(x-scr_interVtx_X)+(y-scr_interVtx_Y)*(y-scr_interVtx_Y));
               if (dis<catchTole)
               {
                returnString="true|"+scr_interVtx_X+","+scr_interVtx_Y+","+interVtx_X+","+interVtx_Y+"|"+sxy1.x+","+sxy1.y+"|"+sxy2.x+","+sxy2.y+"|"+jnum+","+j+","+i;
                break;
               }
            }
          }
          if(wx1==wx2)//斜率为无穷大
          {
            //计算鼠标单击处与直线交点坐标
            var interVtx_X=sxy1.x;
            var interVtx_Y=y;
            var w_XY=gEcnu.Util.screenToWorld(interVtx_X,interVtx_Y);
            if (wx1>=minx&&wx1<=maxx&&w_XY.y>=miny&&w_XY.y<=maxy)
            {
              var dis=Math.abs(interVtx_X-x);
              if (dis<catchTole)
              {
                returnString="true|"+interVtx_X+","+interVtx_Y+","+wx1+","+w_XY.y+"|"+sxy1.x+","+sxy1.y+"|"+sxy2.x+","+sxy2.y+"|"+jnum+","+j+","+i;
                break;
              }
            }
          }
          if (wy1==wy2)//斜率为0
          {
            //计算鼠标单击处与直线交点坐标
            var interVtx_X=x;
            var interVtx_Y=sxy1.y;
            var w_XY=gEcnu.Util.screenToWorld(interVtx_X,interVtx_Y);
            if (w_XY.x>=minx&&w_XY.x<=maxx&&wy1>=miny&&wy1<=maxy)
            {
              var dis=Math.abs(y-interVtx_Y);
              if (dis<catchTole)
              {
                returnString="true|"+interVtx_X+","+interVtx_Y+","+w_XY.x+","+wy1+"|"+sxy1.x+","+sxy1.y+"|"+sxy2.x+","+sxy2.y+"|"+jnum+","+j+","+i;
                break;
              }
            }
          }
        }
      }
    }
    }
    return returnString;
  };
    /**
   * 判断点是否在多边形内
   * @param pt
   * @param poly
   * @returns {boolean}
   */
  gEcnu.Graph.pointInPoly = function (pt, poly) {  
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
      ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && (c = !c);
    return c;
  };
  /**
   * 判断点是否在多段线容限范围内
   * @param pt
   * @param poly
   * @returns {boolean}
   */
  gEcnu.Graph.pointJionLine = function (pt, points) {
    var len=points.length;
    var c=false;
    if(len<=0){ return c;}

    return c;
  };
   /**
   * 获取视窗范围内的要素
   * @param map
   * @param fetures
   * @returns {Array}
   */
/*  gEcnu.Graph.pointJionLine = function (map, fetures) {
    var fea_len=fetures.length;
    
  };*/