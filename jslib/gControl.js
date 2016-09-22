
/**********gEcnu的Control信息****************/
var eagleEye_self=null;
gEcnu.Control = gClass.extend({
  init: function(id,options) {
      this.id = id; 
      this.options =  {
          top: 15,
          left: 15,
          zIndex: 500
      };
      
  },
  
 setPos: function(){
      this._container.style.left = this.options.left + 'px';
      this._container.style.top = this.options.top + 'px';
      this._container.style.zIndex = this.options.zIndex;
  },
  renew:function(){
  }
});
/**********gEcnu的Control——Zoom缩放条  信息****************/
gEcnu.Control.Zoom = gEcnu.Control.extend({
   init: function(id,options){
       this._super(id,options);
       this.options = gEcnu.Util.setOptions(this, options);
       this.posOption = options || {right:'15',bottom:'10'};
   },
   _initContainer: function(){
       var w = 35, h = 70;
       var zoomDiv = gEcnu.Util.createDiv('zoomCtrl',w,h,true);
       zoomDiv.style.boxShadow = '3px 3px 6px rgba(0,0,0,0.9)';
       var zoomInDiv = gEcnu.Util.createDiv('zoomInDiv',w,h/2,false);
       var zoomInImg = new Image();
       zoomInImg.src = gEcnu.config.imgPath+"zoomin.png";
       zoomInImg.style.width = w;
       zoomInImg.style.height = h/2;
       zoomInDiv.appendChild(zoomInImg);
       var zoomOutDiv = gEcnu.Util.createDiv('zoomOutDiv',w,h/2,false);
       var zoomOutImg = new Image();
       zoomOutImg.style.width = w;
       zoomOutImg.style.height = h/2;
       zoomOutImg.src = gEcnu.config.imgPath+"zoomout.png";
       zoomInImg.onmouseup = function(e){
         //gEcnu.Util.compelteEdit();
         gEcnu.Util.stopPropagation(e);
         gSelf.zoomIn();
       };
       zoomOutImg.onmouseup = function(e){
         gEcnu.Util.stopPropagation(e);
         //gEcnu.Util.compelteEdit();
         gSelf.zoomOut();
       };
       zoomOutDiv.appendChild(zoomOutImg);
       zoomDiv.appendChild(zoomInDiv);
       zoomDiv.appendChild(zoomOutDiv);
       this._container = zoomDiv;
   },
   onAdd: function(map){
       //this._super();
       var container = map.getContainer();
       this._initContainer();
       this.setPos();
       container.appendChild(this._container);
       //console.log(this.initZoom(map));
   },
   setPos: function (){
      var option = this.posOption;  
      if(option){
        if(typeof option.right!=undefined){
          this._container.style.right = option.right+"px";
        }
        if(option.bottom!=undefined){
          this._container.style.bottom = option.bottom+"px";
        }
        if(option.left!=undefined){
          this._container.style.left = option.left+"px";
        }
        if(option.top!=undefined){
          this._container.style.top = option.top+"px";
        }
      }else{
        this._container.style.right = '15px';
        this._container.style.bottom = '10px';
      } 
        this._container.style.zIndex = this.options.zIndex;
     },
   // setPos: function(){
   //    this._container.style.right =  '15px';
   //    this._container.style.top = '40px';
   //    this._container.style.zIndex = this.options.zIndex;
   // }
});
gEcnu.Control.Scale = gEcnu.Control.extend({
    init:function(id,options){
         this._super(id,options);
         this.options =  {
             // top: 0,
             // left: 0,
             zIndex: 15,
             fontColor:'#000'
         };
         this.oClass = 'scaleControl';
         this.options = gEcnu.Util.setOptions(this,options);

     },
      //option  {right:,bottom:}
    setScalePos: function(option){
      this.posOption = option;  
    },
    onAdd: function(map){
         this.scaleLeft = 20;
         this.scaleTop = 7;
         this._initContainer(map);
         this.setPos();
         map.getContainer().appendChild(this._container);
     },
     setPos: function (){
      var option = this.posOption;  
      if(option){
        if(option.right!=undefined){
          this._container.style.right = option.right+"px";
        }
        if(option.bottom!=undefined){
          this._container.style.bottom = option.bottom+"px";
        }
        if(option.left!=undefined){
          this._container.style.left = option.left+"px";
        }
        if(option.top!=undefined){
          this._container.style.top = option.top+"px";
        }
      }else{
        this._container.style.right = '15px';
        this._container.style.bottom = '10px';
      } 
        this._container.style.zIndex = this.options.zIndex;
     },
    
     _initContainer: function(map){
         this._map = map;  
         var size = map.getSize();
         var w=180,h=30;
         var scaleCanvas = gEcnu.Util.createCanvas('scaleCtrl',w,h,true);
         scaleCanvas.style.backgroundColor='rgba(224,224,224,0.75)';
         var ctx = scaleCanvas.getContext('2d');
         this._container = scaleCanvas;
         this._ctx = ctx;
         this._showScale(size);
     },
     _showScale: function(size){
         var height  = size.h;
         var ctx = this._ctx;
         var showscale=this._showScaleText(ctx,height);
         
         var width=showscale.allpx;
         var widthHalf=showscale.halfpx;

         var left = this.scaleLeft;
         var top = this.scaleTop;

         ctx.beginPath();
         ctx.strokeStyle =  this.options.fontColor;
         ctx.fillStyle = this.options.fontColor;
         ctx.linewidth = 1;
         ctx.moveTo(left,top);//设置起点
         ctx.lineTo(left,top+3);

         ctx.lineTo(width+left,top+3);
         ctx.lineTo(width+left,top);
         ctx.closePath();
         ctx.fill();

         ctx.beginPath();
         ctx.moveTo(left+1,top+3);
         ctx.lineTo(left+1,top+6);
         ctx.closePath();
         ctx.stroke();

         ctx.beginPath();
         ctx.moveTo(width+left-1,top+3);
         ctx.lineTo(width+left-1,top+6);
         ctx.closePath();
         ctx.stroke();

         ctx.beginPath();
         ctx.moveTo(widthHalf+left-1,top+3);
         ctx.lineTo(widthHalf+left-1,top+6);
         ctx.closePath();
         ctx.stroke();
         
     },
     _showScaleText: function(ctx,h){
          var scale;
          if(gSelf.coordsFlag=="GEOGRAPHIC"){
          var actualZoom=gSelf.zoom*111.31955*1000;   //世界地图：返回的zoom为经纬度 1度对应111.31955Km
             scale = actualZoom / parseInt(gSelf.w); 
         }else{
            scale = gSelf.zoom / parseInt(gSelf.w); 
         }
         var result=this._getScaleWidth(scale);
         var halfkmscale = result.halfmeter;
         var kmscale=result.allmeter;

         var width=result.allpx;
         var widthHalf=result.halfpx;
         var left = this.scaleLeft;
         var top = this.scaleTop;

         ctx.clearRect(0,0,200,h);
         ctx.font = '14px serif';
         ctx.fillStyle = this.options.fontColor;

         ctx.fillText('0', left, top + 20);//IE不支持
         ctx.fillText(halfkmscale, left+widthHalf-5, top + 20);
         ctx.fillText(kmscale, left+width, top + 20);
         return result;
     },
     _getScaleWidth: function(s){
         var result={};
         if(s<=16){
           result.halfpx=50;
           result.allpx=100;
           result.halfmeter=Math.round(50*s)+"m";
           result.allmeter=Math.round(50*s)*2+"m";
         }else{
           result.halfpx=50;
           result.allpx=100;
           result.halfmeter=Math.round(50*s/1000)+"km";
           result.allmeter=Math.round(50*s/1000)*2+"km";
         }
         return result;
     },
     clear: function(){
         var canvas = this._container;
         this._ctx.clearRect(0, 0, canvas.width, canvas.height);
     },
     renew: function(){
         this.clear();
         this._showScale(this._map);
     }
});
gEcnu.Control.Scale_bak = gEcnu.Control.extend({
     init:function(id,options){
         this._super(id,options);
         this.options =  {
             top: 0,
             left: 0,
             zIndex: 15,
             fontColor:'#000'
         };
         this.oClass = 'scaleControl';
         this.options = gEcnu.Util.setOptions(this,options);

     },
     onAdd: function(map){
         this.scaleLeft = this.scaleLeft || 26;
         this.scaleTop = this.scaleTop || map.getSize().h-33;
         this._initContainer(map);
         this.setPos();
         map.getContainer().appendChild(this._container);
        
     },
     _initContainer: function(map){
         this._map = map;  
         var size = map.getSize();
         var scaleCanvas = gEcnu.Util.createCanvas('scaleCtrl',size.w,size.h,true);
         var ctx = scaleCanvas.getContext('2d');
         this._container = scaleCanvas;
         this._ctx = ctx;
         this._showScale(size);
     },
      //设置比例尺的位置{left:26,top:100,right:,bottom}
     setScalePos:function (map,opt){
      var opt= opt || {};
      var size = map.getSize();
      var left = opt.left ? opt.left : (opt.right ? (size.w-opt.right) : 26);
      var top = opt.top ? opt.top : (opt.bottom ? (size.h-opt.bottom) : size.h-33);
      this.scaleLeft = left;
      this.scaleTop = top;
     },
     _showScale: function(size){
         var height  = size.h;
         var ctx = this._ctx;
         var showscale=this._showScaleText(ctx,height);
         
         var width=showscale.allpx;
         var widthHalf=showscale.halfpx;

         var left = this.scaleLeft;
         var top = this.scaleTop;

         ctx.beginPath();
         ctx.strokeStyle =  this.options.fontColor;
         ctx.fillStyle = this.options.fontColor;
         ctx.linewidth = 1;
         ctx.moveTo(left,top);//设置起点
         ctx.lineTo(left,top+3);

         ctx.lineTo(width+left,top+3);
         ctx.lineTo(width+left,top);
         ctx.closePath();
         ctx.fill();

         ctx.beginPath();
         ctx.moveTo(left+1,top+3);
         ctx.lineTo(left+1,top+6);
         ctx.closePath();
         ctx.stroke();

         ctx.beginPath();
         ctx.moveTo(width+left-1,top+3);
         ctx.lineTo(width+left-1,top+6);
         ctx.closePath();
         ctx.stroke();

         ctx.beginPath();
         ctx.moveTo(widthHalf+left-1,top+3);
         ctx.lineTo(widthHalf+left-1,top+6);
         ctx.closePath();
         ctx.stroke();
         
     },
     _showScaleText: function(ctx,h){
          var scale;
          if(gSelf.coordsFlag=="GEOGRAPHIC"){
          var actualZoom=gSelf.zoom*111.31955*1000;   //世界地图：返回的zoom为经纬度 1度对应111.31955Km
             scale = actualZoom / parseInt(gSelf.w); 
         }else{
            scale = gSelf.zoom / parseInt(gSelf.w); 
         }
         var result=this._getScaleWidth(scale);
         var halfkmscale = result.halfmeter;
         var kmscale=result.allmeter;

         var width=result.allpx;
         var widthHalf=result.halfpx;
         var left = this.scaleLeft;
         var top = this.scaleTop;

         ctx.clearRect(0,0,200,h);
         ctx.font = '14px serif';
         ctx.fillStyle = this.options.fontColor;

         ctx.fillText('0', left, top + 20);//IE不支持
         ctx.fillText(halfkmscale, left+widthHalf-5, top + 20);
         ctx.fillText(kmscale, left+width, top + 20);
         return result;
     },
     _getScaleWidth: function(s){
         var result={};
         if(s<=16){
           result.halfpx=50;
           result.allpx=100;
           result.halfmeter=Math.round(50*s)+"m";
           result.allmeter=Math.round(50*s)*2+"m";
         }else{
           result.halfpx=50;
           result.allpx=100;
           result.halfmeter=Math.round(50*s/1000)+"km";
           result.allmeter=Math.round(50*s/1000)*2+"km";
         }
         return result;
     },
     clear: function(){
         var canvas = this._container;
         this._ctx.clearRect(0, 0, canvas.width, canvas.height);
     },
     renew: function(){
         this.clear();
         this._showScale(this._map);
     }
});


/************9-10***鹰眼图***********/
//是否锁定鹰眼图 不允许鼠标操作
//类似map的实例化  用户指定鹰眼图的div层 （暂时这样处理） 后续：内部创建鹰眼容器
/**
 * 实例化鹰眼图
 * @param  {[type]} id        鹰眼所在的容器的id
 * @param  {[type]} mapsource 指定鹰眼图的底图来源：TMAP、GOOGLE、BAIDU ,NONE(不要底图)
 * @param  {[type]} options   可选参数
 * @return {[type]}           [description]
 */
gEcnu.Control.EagleEye = gEcnu.Control.extend({

   init:function (id,mapsource,options){
    eagleEye_self=this;
    this.id=id;
    this.mapSource=mapsource;
    this.options =  {
             top: 0,
             left: 0,
             zIndex: 500,             
         };
    this.oClass = 'eagleMapControl';
    this.options = gEcnu.Util.setOptions(this,options);
  },
   _initContainer:function (){
    //var w=300,h=270; 
    ////var odiv=gEcnu.Util.createDiv(this.id, w, h, true);
    var odiv=document.getElementById(this.id); 
    var w=gEcnu.Util.delpx(gEcnu.Util.getEleStyle(odiv,'width'));
    var h=gEcnu.Util.delpx(gEcnu.Util.getEleStyle(odiv,'height'));
     
    var tmapDiv=gEcnu.Util.createDiv('eagle_tMap', w, h, true);//天地图容器
    var dynDiv=gEcnu.Util.createDiv('eagle_dynlyr', w, h, true);//动态图容器
    var posCanvas=gEcnu.Util.createCanvas('canvas_grid', w, h, true);//动态显示框
    posCanvas.style.zIndex=10;
    odiv.appendChild(tmapDiv);
    odiv.appendChild(dynDiv);
    odiv.appendChild(posCanvas);
    this._container=odiv;
    this._tianContainer=tmapDiv;
    this._dynContainer=dynDiv;
    this._posCanvas=posCanvas;
    this._eagleWidth=w;
    this._eagleHeight=h;   
  },
  setPos:function (){
    //this.options=gEcnu.Util.setOptions(this,options);
   // this._super();   
  },
  onAdd: function(map){
    this._map=map;
    this._initContainer();
    this._initProp(map);   
    ///this.setPos();
   /// map.getContainer().appendChild(this._container);
    this.reqEagle();
     },
  _initProp:function (map){
    var zoom=map.getZoom();
    var center=map.getCenter();
    this._mapzoom=zoom.z;
    this.eagleZoom=zoom.z*2;            
    this.eCenterX=center.x;
    this.eCenterY=center.y;
    this.eagleBasemap=null;
  },
  //请求鹰眼的zoom centerxy 发生变化时
  eagleMapChange:function (zoom,cx,cy){
    this.eagleZoom=zoom;
    this.eCenterX=cx;
    this.eCenterY=cy;
    this.reqEagle();        //重新请求
  },
  reqEagle:function (){ 
   this._reqMap();          //请求底图
   //this._reqDyn();          //请求动态图
   this._showPosinEagle();  //在鹰眼图中显示主图的位置    
  },
  _reqMap:function (){
    if(this.eagleBasemap!=null){
      this._renewBasemap();
    }else{
      this._firstReqmap();
    }

  },
  _renewBasemap:function (){
    var w=this._eagleWidth; 
    var eagle_cx=this.eCenterX;
    var eagle_cy=this.eCenterY;
    var eagleZoom=this.eagleZoom; 
    var MeterPerPx=eagleZoom/w;
    var zl= parseInt(Math.log(MeterPerPx)/Math.log(2))+1; console.log('other zl',18-zl);
    var latlng = gEcnu.Util.shToLngLat(eagle_cx,eagle_cy);
    switch(this.mapSource){
      case 'GOOGLE':
      this.eagleBasemap.setCenter(new google.maps.LatLng(latlng.lat, latlng.lng));
      this.eagleBasemap.setZoom(18 - zl);
      break;
    case 'BAIDU':
      this.eagleBasemap.centerAndZoom(new BMap.Point(latlng.lng, latlng.lat), 19 - zl);
      break;
    case 'TMAP':
      var latlng = gEcnu.Util.shToLngLat(eagle_cx-400, eagle_cy+230);
      this.eagleBasemap.centerAndZoom(new TLngLat(latlng.lng, latlng.lat), 18 - zl);  
      break;
      }

  },
  _firstReqmap:function (){
    var _self=this;
    var script = document.createElement('script');
    switch (this.mapSource) {
    case 'GOOGLE':
    script.src = 'https://maps.googleapis.com/maps/api/js?sensor=false&callback=showOtherMap_eagle';
    document.getElementsByTagName('head')[0].appendChild(script);
    break;
    case 'BAIDU':
    script.src = 'http://api.map.baidu.com/api?v=1.4&callback=showOtherMap_eagle';
    document.getElementsByTagName('head')[0].appendChild(script);
    break;
    case 'TMAP':
    var src="http://api.tianditu.com/js/maps.js";
    if(!_self._isLoadScript(src)){
       script.src =src; 
       script.onload = showOtherMap_eagle;
       document.getElementsByTagName('head')[0].appendChild(script);
    }else{
       showOtherMap_eagle();
    }
    break;
    case 'NONE':   
           
    break;
    }
  },
  _isLoadScript:function (src){
    var script_head=document.getElementsByTagName('head')[0].getElementsByTagName("script");
   if(script_head==undefined){ return false;}
    for(var j=0,len=script_head.length;j<len;j++){
      if(script_head[j].src==src){ //判断是否加载过
        return true;
      }
    }
    return false;
  },
  _reqDyn:function (){    //显示当前的所有可见动态图层
    var _self=this;
    var dyndiv=this._dynContainer;
    var eagleImg=document.getElementById("eagleImg");
    if(eagleImg==undefined){
      eagleImg=new Image();
      eagleImg.id="eagleImg";
      dyndiv.appendChild(eagleImg);
    }
    var eagle_cx=this.eCenterX;
    var eagle_cy=this.eCenterY;
    var w=this._eagleWidth;
    var h=this._eagleHeight;
    var eagleZoom=this.eagleZoom;  

   
    //var mapurl="http://"+gEcnu.config.webHostIP+":"+gEcnu.config.port+"/WebMap";
    //var mapurl=gEcnu.config.geoserver+"WebMap";
    var ws='shxz2008'; //'shxz2008'
    var reqlyrs='zhenjiedaomian'; //zhenjiedaomian
  //动态获取地图上的可见图层 
    // var lyrArr=gSelf.getAllLayers();
    // for(var i=0,len=lyrArr.length;i<len;i++){
    //   if(lyrArr[i].oClass == "dynLayer"){
    //     ws=lyrArr[i].ws;
    //     reqlyrs=lyrArr[i].lyrStr;
    //   }
    // }
   /* var params={'map':ws,'cx':eagle_cx,'cy':eagle_cy,'w':w,'h':h,'zoom':eagleZoom,'lyrs':reqlyrs,'mt':'zoomto','return':'json'};
    console.log('params',params);
    gEcnu.Util.ajax("get", mapurl, params, true, function (data){
        data = JSON.parse(data);
        if (!data.mapURL) {
          alert("地图请求失败!");
          return;
         }
         //var tmpserv="http://"+gEcnu.config.webHostIP+":"+gEcnu.config.port+"/"+"FileServer?fn="; 
         var tmpserv=gEcnu.config.geoserver+"FileServer?fn="; 
         eagleImg.src = tmpserv + data.mapURL;  
         //_self._showPosinEagle();   //在鹰眼图中显示主图的位置                     
      });*/
  },
  _showPosinEagle:function (){
    var _self=this;
    var map=this._map;
    var mapcenter=map.getCenter();
    var w=this._eagleWidth;
    var h=this._eagleHeight;
    var eagle_cx=this.eCenterX;
    var eagle_cy=this.eCenterY;
    var eagleZoom=this.eagleZoom;  
    var scale=eagleZoom/w;    
   
    //计算主图格在缩略图中的大小
    var mapBounds=map.getBounds();
    var leftTop_x=mapBounds.nw.x;
    var leftTop_y=mapBounds.nw.y;
    var rightBot_x=mapBounds.se.x;
    var rightBot_y=mapBounds.se.y;
    
    var centerScr=this._worldToScr_eagle(mapcenter.x,mapcenter.y);
    var scrxy1=this._worldToScr_eagle(leftTop_x,leftTop_y);
    var scrxy2=this._worldToScr_eagle(rightBot_x,rightBot_y);
    var screenX = centerScr.x;
    var screenY = centerScr.y;
    var map_wid=scrxy2.x-scrxy1.x;
    var map_height=scrxy2.y-scrxy1.y;
    this._drawPosCanvas(scrxy1.x,scrxy1.y,map_wid,map_height);
    //this._drawPosCanvas(screenX-map_wid/2,screenY-map_height/2,map_wid,map_height);
  },

  isInEagleEyemap:function (){
    var mapBounds=this._map.getBounds();
    var leftTop_x=mapBounds.nw.x;
    var leftTop_y=mapBounds.nw.y;
    var rightBot_x=mapBounds.se.x;
    var rightBot_y=mapBounds.se.y;
    
    var leftTop_scr=this._worldToScr_eagle(leftTop_x,leftTop_y);
    var rightBot_scr=this._worldToScr_eagle(rightBot_x,rightBot_y);
    var xmin=leftTop_scr.x;
    var ymin=leftTop_scr.y;
    var xmax=rightBot_scr.x;
    var ymax=rightBot_scr.y;
    var w=this._eagleWidth;
    var h=this._eagleHeight;
    if(xmin<0 || ymin<0 || xmax>w || ymax>h){  
      return false;
    }
    return true;
  },
  _drawPosCanvas:function (x,y,w,h){  
    var canvas_grid=this._posCanvas;
    var ctx=canvas_grid.getContext("2d");
    ctx.clearRect(0,0,this._eagleWidth,this._eagleHeight); 
    ctx.strokeStyle='red';
    ctx.lineWidth=1.0;
    ctx.strokeRect(x,y,w,h);
  },
  //地理坐标转缩略图中的屏幕坐标
 _worldToScr_eagle:function (cx,cy){
    var w=this._eagleWidth;
    var h=this._eagleHeight;
    var eagle_cx=this.eCenterX;
    var eagle_cy=this.eCenterY;
    var eagleZoom=this.eagleZoom;
    var scale=eagleZoom/w;     
    var screenX = w / 2 + (cx - eagle_cx) / scale ;
    var screenY = h / 2 - (cy - eagle_cy) / scale ;
    return {
     x:screenX,
     y:screenY
    };
  },
  renew:function (){
    var mapzoom=this._map.getZoom();
    var currentZoom=mapzoom.z; 
    var preZoom=this._mapzoom;
    if(currentZoom!=preZoom || !this.isInEagleEyemap()){//缩放地图 或者地图中心不在鹰眼范围内
     this._initProp(this._map);
     this.reqEagle();  //重新请求鹰眼
    }else{
      this._showPosinEagle();  //更新主图在鹰眼图中的位置
    }
  }

});

function showOtherMap_eagle() {  
    var _self=eagleEye_self;
    var tmapdiv=_self._tianContainer;
    var w=_self._eagleWidth;
    var h=_self._eagleHeight; 
    var eagle_cx=_self.eCenterX;
    var eagle_cy=_self.eCenterY;
    var eagleZoom=_self.eagleZoom; 
    var MeterPerPx=eagleZoom/w;
    var zl= parseInt(Math.log(MeterPerPx)/Math.log(2))+1; console.log('other zl',18-zl);
    var latlng = gEcnu.Util.shToLngLat(eagle_cx,eagle_cy);
    switch (_self.mapSource) {
    case 'GOOGLE':
    var mapOptions = {
      center: new google.maps.LatLng(latlng.lat, latlng.lng),
      zoom: 18 - zl,
      mapTypeControl: false,
      panControl: false, //停用平移控件
      zoomControl: false, //停用缩放控件
      scaleControl: false, //停用比例尺控件
      rotateControl: false,
      streetViewControl: false
    };
    var otherMap = new google.maps.Map(tmapdiv, mapOptions);
    eagleEye_self.eagleBasemap=otherMap;
    break;
  case 'BAIDU':
    var centerPt = new BMap.Point(latlng.lng, latlng.lat);
    var otherMap = new BMap.Map(tmapdiv.id);
    otherMap.centerAndZoom(centerPt, 19 - zl);
    eagleEye_self.eagleBasemap=otherMap;
    break;
  case 'TMAP':
    var latlng = gEcnu.Util.shToLngLat(eagle_cx-400, eagle_cy+230);
    var otherMap= new TMap(tmapdiv.id);
    otherMap.centerAndZoom(new TLngLat(latlng.lng, latlng.lat), 18 - zl);
    eagleEye_self.eagleBasemap=otherMap;
    break;
  }
 }