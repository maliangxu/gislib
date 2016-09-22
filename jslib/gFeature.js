//gEcnu.Feature = {};
gEcnu.Feature = gClass.extend({
  init:function(name){
    this.name = name;
  },
  getVertices: function(){
    
  },
  getBounds: function(){
    
  },
  calcBounds: function(){
    
  }
  
});
/**
   * 点要素
   * @param ID
   * @param x
   * @param y
   * @returns {{}}
   * @constructor
   */
  
  gEcnu.Feature.Point=gEcnu.Feature.extend({
    init:function(gpoints,data){ 
      this._gpoints=gpoints;
      this.shape = {};
      this.shape.shpType=8;//此时暂时定为8,（multiPoints）;1代表单个点
      this.shape.shpBox=gEcnu.Util.getShpBox(gpoints);
      var len_point=gpoints.length;
      this.shape.NumPoints=len_point;
      this.shape.Points=[];
      for(var j=0;j<len_point;j++){
         var opepoint= gpoints[j];
         var tmppoint={"X":opepoint.x,"Y":opepoint.y};
         this.shape.Points.push(tmppoint);
      }
      this.fields ={};
      if((typeof data)=="object"){
        this.fields =data;
      }
    },
    onAdd: function (layer) {
      this._layer = layer;
      this.onDraw(layer);
    },
    onRemove: function (layer) {

    },
    addFields:function(jsonObj){
      for(var mm in jsonObj){
         this.fields[mm]=jsonObj[mm];
      }
    },
    delFields:function(fieldsArr){
      var fieldsArr_len=fieldsArr.length; 
      var tmpfields={};
      for(var i=0;i<fieldsArr_len;i++){
        var tmpfield=fieldsArr[i];
        delete this.fields[tmpfield];  
      }
    },
    delAllFields:function(){
      this.fields={};
    },
    onDraw: function (layer) {
      var ctx = layer.getCtx();
      var _style=layer.style;
      var resetFlag=layer.resetStyle;
      //if(typeof (this.style) =="undefined" || resetFlag){   //2016-1-19 注释   同一个要素添加到不同要素层上，this.style样式会被缓存
         if(_style instanceof gEcnu.Style_Ex){
            var mapfield=_style.mappingField;
            var fea_fields=this.fields;

            var mapvalue="default";

            for(var key in fea_fields){  
               if(key==mapfield){
                  //mapfield[key];//明天继续做，2014-07-22  丁扬
                  mapvalue=fea_fields[key];
                  break;
               }
            }

            var stylearr=_style.styles;
            var len_style=stylearr.length;
            for(var j=0;j<len_style;j++){
               var tmpstyle=stylearr[j];
               if(tmpstyle.mappingValue==mapvalue){
                 this.style=tmpstyle;
                 continue;
               }         
            }
         }else if(_style instanceof gEcnu.Style){
            this.style=_style;
         }else{
           alert('style样式有问题！');return;
         }
      //}
   if(typeof (this.style) =="undefined"){
        this.style=new gEcnu.Style({});
      }
      var opt = gEcnu.Util.setStyle(ctx,this.style);
      var map = layer.getMap();
      var parts_len = this.shape.NumPoints;
      for(var l=0;l<parts_len;l++){
          var tmppoint=this._gpoints[l];
          var sxy = gEcnu.Util.worldToScreen(tmppoint.x,tmppoint.y);
          ctx.beginPath();
          ctx.arc(sxy.x,sxy.y,this.style.cirRadius,0,2*Math.PI);
          ctx.stroke();
         // ctx.fill();
      }

      var _fillcolor=this.style.fillColor;
        _fillcolor= _fillcolor.replace(/(^\s*)|(\s*$)/g, "");
        if(_fillcolor!=''){  
             ctx.fill();
          }
    },
    onSelect:function (){
      var points=this._gpoints;
      var map=gSelf;
      if(gEcnu.Edit.selectedPoint!=null){
         gEcnu.Edit.selectedPoint=null;
         map.overLayer.clear();
      }
      var point_style=new gEcnu.Style({cirRadius:6,opacity:1,fillColor:'#00FFFF',strokeColor:'#00FFFF',lineWeight:1});
      map.overLayer.setStyle(point_style);
      var ctx=map.overLayer._ctx;
      gEcnu.Util.setStyle(ctx,point_style);
      gEcnu.Graph.drawPoints_geo(ctx,points);
    },
    /**高亮显示要素
    *@param layer(显示层)
    *@param twinkleOpt {isTwinkle:,twinkleCount:,twinkleInterval:}闪烁的相关配置 默认不显示
    *@param fillOpt {radius:,isFill:,fillColor:,strokeColor: } 填充的相关配置 默认填充
    */
    highLight:function (fealayer,twinkleOpt,fillOpt){
        var tmpfea=this;
        var self=this;
        var shptype=tmpfea.shape.shpType;
        var twinkleOpt=arguments.length>1 ? arguments[1] : {isTwinkle:false};
        var fillOp=arguments.length>2 ? arguments[2] : {radius:6,isFill:true,fillColor:'red',strokeColor:'red'};
        var radius=fillOp.radius || 6;
        var isfill=fillOp.isFill!=undefined? fillOp.isFill : true;
        if(isfill){
          var fillColor= fillOp.fillColor || 'red' ;
        }else{
          var fillColor='';
        }
        var strokeColor=fillOp.strokeColor || 'red';
        var isTwinkle=twinkleOpt.isTwinkle;
        var tCount=parseInt(twinkleOpt.twinkleCount) || 3;
        var tInterval=parseInt(twinkleOpt.twinkleInterval) || 1000;
        
        if(isTwinkle){
          var twinkleNum=0;
          var interId=setInterval(function (){
            if(twinkleNum>=tCount*2-1){ 
              window.clearInterval(interId);
             return ;
           } 
           if(twinkleNum % 2==0){ 
            self._drawHighlightFea(fealayer,radius,fillColor,strokeColor);
          }else{  
            fealayer.removeAllFeatures();
          } 
          twinkleNum++;
          },tInterval);
        }else{
          self._drawHighlightFea(fealayer,radius,fillColor,strokeColor);
        }
    },
    _drawHighlightFea:function (fealayer,radius,fillColor,strokeColor){ 
      var tmpfea=this;
      var point_style=new gEcnu.Style({cirRadius:radius,opacity:0.5,fillColor:fillColor,strokeColor:strokeColor});
      fealayer.setStyle(point_style);
      fealayer.addFeature(tmpfea);
    },
    /**
     * 获取所在图层
     * @returns {*}
     */
    getLayer: function () {
      return this._layer;
    },
    getGeometrys:function(){  //返回的数组
      return this._gpoints;
    }
  });
  gEcnu.Feature.Polyline =gEcnu.Feature.extend({
    init:function(lineStrings,data){
      this.shape = {};
      this.shape.shpType=3;//3代表线
      this._lineStrings=lineStrings;
      //this._data=data;
      var linstring_len=lineStrings.length;
      var points=[];
      this.shape.Parts=[];
      for(var j=0;j<linstring_len;j++){
        var tmppoints= lineStrings[j].points;
        var next_value=points.length;
        this.shape.Parts.push(next_value);
        points=points.concat(tmppoints);
      }
      this.shape.shpBox=gEcnu.Util.getShpBox(points);
      var pointslen=points.length;
      this.shape.NumPoints=pointslen;
      this.shape.NumParts=linstring_len;  
      this.shape.Points=[];
      for(var i=0;i<pointslen;i++){
        var tmpPoint=points[i];
        var _tmpPoint={"x":tmpPoint.x,"y":tmpPoint.y};
        this.shape.Points.push(_tmpPoint);
      }
      /*this.fields =[];
      for (k in data) {
        var str={};
        str[k]=data[k];
        this.fields.push(str);
      }*/
      this.fields ={};
      if((typeof data)=="object"){
         for (k in data) {
           this.fields[k]=data[k];
        }
      }
      this._data=this.fields;
    },
    onAdd: function (layer) {
      this._layerID = layer.id;
      this.onDraw(layer);
    },
    onRemove: function (layer) {

    },
    addFields:function(jsonObj){
      for(var mm in jsonObj){
         this.fields[mm]=jsonObj[mm];
      }
    },
    delFields:function(fieldsArr){
      var fieldsArr_len=fieldsArr.length; 
      var tmpfields={};
      for(var i=0;i<fieldsArr_len;i++){
        var tmpfield=fieldsArr[i];
        delete this.fields[tmpfield];  
      }
    },
    delAllFields:function(){
      this.fields={};
    },
    onDraw: function (layer) {
      var ctx = layer.getCtx();
      var _style=layer.style;
      var resetFlag=layer.resetStyle; 
    //  if(typeof (this.style) =="undefined" || resetFlag){  //2016-1-19 By lc 注释掉   同一个要素添加到不同要素层上，this.style样式会被缓存
         if(_style instanceof gEcnu.Style_Ex){
            var mapfield=_style.mappingField;
            var fea_fields=this.fields;

            var mapvalue="default";

               for(var key in fea_fields){  
                  if(key==mapfield){
                     //mapfield[key];//明天继续做，2014-07-22  丁扬
                     mapvalue=fea_fields[key];
                     break;
                  }
               }

            var stylearr=_style.styles;
            var len_style=stylearr.length;
            var ifexit=false;
            for(var j=0;j<len_style;j++){
               var tmpstyle=stylearr[j];
               if(tmpstyle.mappingValue==mapvalue){
                 this.style=tmpstyle;
                 ifexit=true;
                 continue;
               }         
            }
            if(!ifexit){
              var defaultStyle=new gEcnu.Style({});
              this.style=defaultStyle;
            }
         }else if(_style instanceof gEcnu.Style){
            this.style=_style;
         }else{
           alert('style样式有问题！');return;
         }
     // }
    if(typeof (this.style) =="undefined"){
        this.style=new gEcnu.Style({});
      }
      var opt = gEcnu.Util.setStyle(ctx,this.style);
      var map = layer.getMap();
      var parts_len = this.shape.NumParts; 
      for(var l=0;l<parts_len;l++){
          var tmplineStr=this._lineStrings[l];
          var len=tmplineStr.points.length;
          if (len >= 2) {
            ctx.beginPath();
            var sxy = gEcnu.Util.worldToScreen(tmplineStr.points[0].x, tmplineStr.points[0].y);
            ctx.moveTo(sxy.x, sxy.y); //设置起点
            for (var i = 1; i < len; i++) {
              sxy = gEcnu.Util.worldToScreen(tmplineStr.points[i].x, tmplineStr.points[i].y);
              ctx.lineTo(sxy.x, sxy.y);
            }
            //ctx.closePath();
          }
          ctx.stroke();
      }
    },
    onSelect:function(){
      var len=this._lineStrings.length;
      var map=gSelf;
      map.overLayer.clear();
      for(var j=0;j<len;j++){
          var points=this._lineStrings[j].points;
          //进行端点与边界的重绘操作
          var line_point_style=new gEcnu.Style({cirRadius:3,opacity:1,fillColor:'#118811',strokeColor:'#118811',lineWeight:1});
          map.overLayer.setStyle(line_point_style);
          var ctx=map.overLayer._ctx;
          gEcnu.Util.setStyle(ctx,line_point_style);
          gEcnu.Graph.drawPoints_geo(ctx,points);
  
          var line_style=new gEcnu.Style({ opacity:1,fillColor:'red',strokeColor:'red',lineWeight:1});
          map.overLayer.setStyle(line_style);
          var ctx=map.overLayer._ctx;
          gEcnu.Util.setStyle(ctx,line_style);
          gEcnu.Graph.drawLines_geo(ctx,points);
        }
    },
    onSelect_ex:function(){
      var len=this._lineStrings.length;
      var map=gSelf;
      if(gEcnu.Edit.selectedLine!=null)
      {
         gEcnu.Edit.selectedLine=null;
         map.overLayer.clear();
      }
      for(var j=0;j<len;j++){
          var points=this._lineStrings[j].points;
          //进行端点与边界的重绘操作
          var ctx=map.overLayer._ctx;
          var line_style=new gEcnu.Style({ opacity:1,fillColor:'red',strokeColor:'red',lineWeight:1});
          map.overLayer.setStyle(line_style);
          var ctx=map.overLayer._ctx;
          gEcnu.Util.setStyle(ctx,line_style);
          gEcnu.Graph.drawLines_geo(ctx,points);
        }
    },
    /**高亮显示要素
    *@param layer(显示层)
    *@param twinkleOpt {isTwinkle:,twinkleCount:,twinkleInterval:}闪烁的相关配置 默认不闪烁
    *@param fillOpt {isFill:,fillColor:,strokeColor:,lineWeight } 填充的相关配置 默认填充
    */
    highLight:function (fealayer,twinkleOpt,fillOpt){
        var tmpfea=this;
        var self=this;
        var shptype=tmpfea.shape.shpType;
        var twinkleOpt=arguments.length>1 ? arguments[1] :{isTwinkle:false} ;
        var fillOp=arguments.length>2 ? arguments[2] : {strokeColor:'red',lineWeight:2 };
        var strokeColor=fillOp.strokeColor || 'red';
        var lineWeight=fillOp.lineWeight || 2;
        var isTwinkle=twinkleOpt.isTwinkle;
        var tCount=twinkleOpt.twinkleCount || 3;
        var tInterval=parseInt(twinkleOpt.twinkleInterval) || 1000; 
        if(isTwinkle){
          var twinkleNum=0;
          var interId=setInterval(function (){ 
            if(twinkleNum>=tCount*2-1){ 
              window.clearInterval(interId);
             return ;
           } 
           if(twinkleNum % 2==0){ 
            self._drawHighlightFea(fealayer,strokeColor,lineWeight);
          }else{
            fealayer.removeAllFeatures();
          } 
          twinkleNum++;
          },tInterval);
        }else{
          self._drawHighlightFea(fealayer,strokeColor,lineWeight);
        }
    },
    _drawHighlightFea:function (fealayer,strokeColor,lineWeight){ 
      var tmpfea=this;
      var line_style=new gEcnu.Style({ opacity:0.5,strokeColor:strokeColor,lineWeight:lineWeight});
      fealayer.setStyle(line_style);
      fealayer.addFeature(tmpfea);
    },
    /**
     * 获取所在图层
     * @returns {*}
     */
    getLayer: function () {
      return this._layerID;
    },
    getGeometrys:function(){  //返回的数组
      return this._lineStrings;
    }
  });
  gEcnu.Feature.Polygon =gEcnu.Feature.extend({
    init:function(lineRings,data){
      this.shape = {};
      this.shape.shpType=5;//3代表面
      this._lineRings=lineRings;
      //this._data=data;
      var linering_len=lineRings.length;
      var points=[];
      this.shape.Parts=[];
      for(var j=0;j<linering_len;j++){
        var tmppoints= lineRings[j].points;
        var next_value=points.length;
        this.shape.Parts.push(next_value);
        points=points.concat(tmppoints);
      }
      this.shape.shpBox=gEcnu.Util.getShpBox(points);
      var pointslen=points.length;
      this.shape.NumPoints=pointslen;
      this.shape.NumParts=linering_len;  
      this.shape.Points=[];
      for(var i=0;i<pointslen;i++){
        var tmpPoint=points[i];
        var _tmpPoint={"x":tmpPoint.x,"y":tmpPoint.y};
        this.shape.Points.push(_tmpPoint);
      }
      this.fields ={};
      if((typeof data)=="object"){
           for (k in data) {
           this.fields[k]=data[k];
        }
      }
      this._data=this.fields;
      /*for (k in data) {
        var str={};
        str[k]=data[k];
        this.fields.push(str);
      }*/
    },
    onAdd: function (layer) {
      this._layerID = layer.id;
      this.onDraw(layer);
    },
    onRemove: function (layer) {

    },
    addFields:function(jsonObj){
      for(var mm in jsonObj){
         this.fields[mm]=jsonObj[mm];
      }
    },
    delFields:function(fieldsArr){
      var fieldsArr_len=fieldsArr.length; 
      var tmpfields={};
      for(var i=0;i<fieldsArr_len;i++){
        var tmpfield=fieldsArr[i];
        delete this.fields[tmpfield];  
      }
    },
    delAllFields:function(){
      this.fields={};
    },
     onDraw: function (layer) {   
      var ctx = layer.getCtx();
      var _style=layer.style;  
      var resetFlag=layer.resetStyle; 
       
     // if(typeof (this.style) =="undefined" || resetFlag){  //重设样式   2016-1-19 By lc 注释掉   同一个要素添加到不同要素层上，this.style样式会被缓存
         if(_style instanceof gEcnu.Style_Ex){
            var mapfield=_style.mappingField;
            var fea_fields=this.fields;
            var mapvalue="default";
            for(var key in fea_fields){  
               if(key==mapfield){
                  mapvalue=fea_fields[key];
                  break;
               }
            }

            var stylearr=_style.styles;
            var len_style=stylearr.length;
            for(var j=0;j<len_style;j++){
               var tmpstyle=stylearr[j];
               if(tmpstyle.mappingValue==mapvalue){
                 this.style=tmpstyle;
                 continue;
               }         
            }
         }else if(_style instanceof gEcnu.Style){   
            this.style=_style; 
         }else{
           alert('style样式有问题！');return;
         }
      //}
    if(typeof (this.style) =="undefined"){
        this.style=new gEcnu.Style({});
      }
      var opt = gEcnu.Util.setStyle(ctx,this.style);
      var map = layer.getMap();  
      ctx.globalAlpha=1.0;
      var parts_len = this.shape.NumParts;
      //针对多多边形，如果是包含关系的多边形（岛洞），则找到最大的那个多边形，并最先绘制外部多边形（防止覆盖内部白色的洞）
      var outer_index = parseInt(gEcnu.Util.getOuterPolyIndex(this._lineRings));
      var outerRing = this._lineRings[outer_index];
      var outerPoly = this._lineRings[outer_index].points;
      var clockWise_outer = gEcnu.Util.isClockWise(this._lineRings[outer_index].points);  //外部大的多边形的方向
       this._lineRings.splice(outer_index,1);
       this._lineRings.unshift(outerRing); //优先绘制外部多边形
      //考虑复杂多边形，如岛和洞的绘制  2016-1-13 By Lc
      for(var l=0;l<parts_len;l++){
          var tmplineRin=this._lineRings[l];
          var len=tmplineRin.points.length;
          var holeOrIsland = 'normal' ;
          if(l!=outer_index){  //判断其他多边形与该多边形的关系
              var isInpoly =  gEcnu.Util.isPolyInPoly(tmplineRin.points,outerPoly);
              if(isInpoly){  //在多边形内
                var clockWise_inner = gEcnu.Util.isClockWise(tmplineRin.points);
              if((clockWise_outer && !clockWise_inner)||(!clockWise_outer && clockWise_inner)){  //方向不一致：洞
                holeOrIsland = 'hole';
              }else{
                holeOrIsland = 'island';
              }
            }
           
          }
         
          if (len >= 2) {
            ctx.beginPath();
            var sxy = gEcnu.Util.worldToScreen(tmplineRin.points[0].x, tmplineRin.points[0].y);
           
            ctx.moveTo(sxy.x, sxy.y); //设置起点
            for (var i = 1; i < len; i++) {
              sxy = gEcnu.Util.worldToScreen(tmplineRin.points[i].x, tmplineRin.points[i].y);
              ctx.lineTo(sxy.x, sxy.y);
            }
            ctx.closePath();
          }
          ctx.stroke();


          if(layer._opacity){
             ctx.globalAlpha=0.1;
          }else{
            ctx.globalAlpha=opt.opacity;
          }
          var _fillcolor=this.style.fillColor;
          _fillcolor= _fillcolor.replace(/(^\s*)|(\s*$)/g, "");
          if(_fillcolor!=''){  
            switch(holeOrIsland){
              case "island":
              break;
              case "hole":
               ctx.globalAlpha=1.0;
              ctx.fillStyle = '#fff'; 
              ctx.fill();
              break;
              default: 
              ctx.fill();
            }  
          }
          if(layer._autoLabel){ //自动标注
            ctx.globalAlpha = 1;
            var filltext="null";
            var tmpfield=this.fields;
            if((typeof layer._labelFieldMapping)=="undefined"){
             
                 //此时的标注只是针对字段进行标注
                 if((typeof tmpfield[layer._labelField])!="undefined"){
                   filltext=tmpfield[layer._labelField];
                 }
      
            }else{
                 //此时需要做映射字段的标注
                 if((typeof tmpfield[layer._labelField])!="undefined"){
                   var tmpfilltext=tmpfield[layer._labelField];
                   if((typeof layer._labelFieldMapping[tmpfilltext])!="undefined"){
                     filltext=layer._labelFieldMapping[tmpfilltext]; //找到映射标注
                   }
                 }
            }
            var pointx=(this.shape.shpBox[0]+this.shape.shpBox[2])/2;
            var pointy=(this.shape.shpBox[1]+this.shape.shpBox[3])/2;
            var scrcxy=gEcnu.Util.worldToScreen(pointx,pointy);
            ctx.font = '11px serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(filltext,scrcxy.x-20,scrcxy.y);//IE不支持
          }
      }
    },

    onDraw_bak20160113: function (layer) {   
      var ctx = layer.getCtx();
      var _style=layer.style;  
      var resetFlag=layer.resetStyle; 
      //if(typeof (this.style) =="undefined" || resetFlag){  //重设样式   2016-1-19 注释掉
         if(_style instanceof gEcnu.Style_Ex){
            var mapfield=_style.mappingField;
            var fea_fields=this.fields;
            var mapvalue="default";
            for(var key in fea_fields){  
               if(key==mapfield){
                  //mapfield[key];//明天继续做，2014-07-22  丁扬
                  mapvalue=fea_fields[key];
                  break;
               }
            }

            var stylearr=_style.styles;
            var len_style=stylearr.length;
            for(var j=0;j<len_style;j++){
               var tmpstyle=stylearr[j];
               if(tmpstyle.mappingValue==mapvalue){
                 this.style=tmpstyle;
                 continue;
               }         
            }
         }else if(_style instanceof gEcnu.Style){   
            this.style=_style; 
         }else{
           alert('style样式有问题！');return;
         }
      //}
    if(typeof (this.style) =="undefined"){
        this.style=new gEcnu.Style({});
      }
      var opt = gEcnu.Util.setStyle(ctx,this.style);
      var map = layer.getMap();  
      ctx.globalAlpha=1.0;
      var parts_len = this.shape.NumParts;
      for(var l=0;l<parts_len;l++){
          var tmplineRin=this._lineRings[l];
          var len=tmplineRin.points.length;
          if (len >= 2) {
            ctx.beginPath();
            var sxy = gEcnu.Util.worldToScreen(tmplineRin.points[0].x, tmplineRin.points[0].y);
           
            ctx.moveTo(sxy.x, sxy.y); //设置起点
            for (var i = 1; i < len; i++) {
              sxy = gEcnu.Util.worldToScreen(tmplineRin.points[i].x, tmplineRin.points[i].y);
              ctx.lineTo(sxy.x, sxy.y);
            }
            ctx.closePath();
          }
          ctx.stroke();
          if(layer._opacity){
             ctx.globalAlpha=0.1;
          }else{
            ctx.globalAlpha=opt.opacity;
          }
          var _fillcolor=this.style.fillColor;
          _fillcolor= _fillcolor.replace(/(^\s*)|(\s*$)/g, "");
          if(_fillcolor!=''){  
             ctx.fill();
          }
          if(layer._autoLabel){ //自动标注
            ctx.globalAlpha = 1;
            var filltext="null";
            var tmpfield=this.fields;
            if((typeof layer._labelFieldMapping)=="undefined"){
             
                 //此时的标注只是针对字段进行标注
                 if((typeof tmpfield[layer._labelField])!="undefined"){
                   filltext=tmpfield[layer._labelField];
                 }
      
            }else{
                 //此时需要做映射字段的标注
                 if((typeof tmpfield[layer._labelField])!="undefined"){
                   var tmpfilltext=tmpfield[layer._labelField];
                   if((typeof layer._labelFieldMapping[tmpfilltext])!="undefined"){
                     filltext=layer._labelFieldMapping[tmpfilltext]; //找到映射标注
                   }
                 }
            }
            var pointx=(this.shape.shpBox[0]+this.shape.shpBox[2])/2;
            var pointy=(this.shape.shpBox[1]+this.shape.shpBox[3])/2;
            var scrcxy=gEcnu.Util.worldToScreen(pointx,pointy);
            ctx.font = '11px serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(filltext,scrcxy.x-20,scrcxy.y);//IE不支持
          }
      }
    },
    onSelect:function(){
      var len=this._lineRings.length;
      var map=gSelf;
      map.overLayer.clear();
      for(var j=0;j<len;j++){
          var points=this._lineRings[j].points;
          //进行端点与边界的重绘操作
          var line_point_style=new gEcnu.Style({cirRadius:3,opacity:1,fillColor:'#82D900',strokeColor:'#82D900',lineWeight:1});
          map.overLayer.setStyle(line_point_style);
          var ctx=map.overLayer._ctx;
          gEcnu.Util.setStyle(ctx,line_point_style);
          gEcnu.Graph.drawPoints_geo(ctx,points);
  
          var line_style=new gEcnu.Style({ opacity:1,fillColor:'red',strokeColor:'red',lineWeight:1});
          map.overLayer.setStyle(line_style);
          var ctx=map.overLayer._ctx;
          gEcnu.Util.setStyle(ctx,line_style);
          gEcnu.Graph.drawLines_geo(ctx,points);
        }
    },
    onSelect_ex:function(){  
      var len=this._lineRings.length;
      var map=gSelf;
      if(gEcnu.Edit.selectedPolygon!=null)
      {
         gEcnu.Edit.selectedPolygon=null;
         map.overLayer.clear();
      }
      for(var j=0;j<len;j++){
          var points=this._lineRings[j].points;
          //进行端点与边界的重绘操作
          var ctx=map.overLayer._ctx;
          var line_style=new gEcnu.Style({ opacity:1,fillColor:'red',strokeColor:'red',lineWeight:1});
          map.overLayer.setStyle(line_style);
          var ctx=map.overLayer._ctx;
          gEcnu.Util.setStyle(ctx,line_style);
          gEcnu.Graph.drawLines_geo(ctx,points);
        }
    },
    /**高亮显示要素
    *@param layer(显示层)
    *@param twinkleOpt {isTwinkle:,twinkleCount:,twinkleInterval:}闪烁的相关配置 默认不闪烁
    *@param fillOpt {isFill:,fillColor:,strokeColor:,lineWeight } 填充的相关配置 默认填充
    */
    highLight:function (fealayer,twinkleOpt,fillOpt){
        var tmpfea=this;
        var self=this;
        var shptype=tmpfea.shape.shpType;
        var twinkleOpt=arguments.length>1 ? arguments[1] :{isTwinkle:false} ;
        var fillOp=arguments.length>2 ? arguments[2] : {isFill:true,fillColor:'#00FFFF',strokeColor:'red',lineWeight:2 };
        var isfill=fillOp.isFill!=undefined ? fillOp.isFill : true;    //? '#00FFFF' : '';
        if(isfill){
          var fillColor= fillOp.fillColor || '#00FFFF' ;
        }else{
          var fillColor='';
        }
        var strokeColor=fillOp.strokeColor || 'red';
        var lineWeight=fillOp.lineWeight || 2;
        var isTwinkle=twinkleOpt.isTwinkle;
        var tCount=twinkleOpt.twinkleCount || 3;
        var tInterval=parseInt(twinkleOpt.twinkleInterval) || 1000; 
        if(isTwinkle){
          var twinkleNum=0;
          var interId=setInterval(function (){
            if(twinkleNum>=tCount*2-1){ 
              window.clearInterval(interId);
             return ;
           } 
           if(twinkleNum % 2==0){ 
            self._drawHighlightFea(fealayer,fillColor,strokeColor,lineWeight);
          }else{
            fealayer.removeAllFeatures();
          } 
          twinkleNum++;
          },tInterval);
        }else{
          self._drawHighlightFea(fealayer,fillColor,strokeColor,lineWeight);
        }
    },
    _drawHighlightFea:function (fealayer,fillColor,strokeColor,lineWeight){ 
      var tmpfea=this;
      var poly_style=new gEcnu.Style({ opacity:0.5,fillColor:fillColor,strokeColor:strokeColor,lineWeight:lineWeight});
      fealayer.setStyle(poly_style);
      fealayer.addFeature(tmpfea); 
    },
    /**
     * 获取所在图层
     * @returns {*}
     */
    getLayer: function () {
      return this._layerID;
    },
    getGeometrys:function(){  ////返回的数组
    	return this._lineRings;
    },

    pointInFeature:function(geometry_point){
      var len=this._lineRings.length;
      for(var j=0;j<len;j++){
        var tmppoints=this._lineRings[j].points;
        if (gEcnu.Graph.pointInPoly(geometry_point, tmppoints)) {
           return true;
        }
      }
      return false;
    }    
  });
  


