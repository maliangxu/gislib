(function() {
  // 当前是否处于创建类的阶段
  var initializing = false;
  gClass = function() { };
  gClass.extend = function(prop) {
    // 如果调用当前函数的对象（这里是函数）不是Class，则是父类
    var baseClass = null;
    if (this !== gClass) {
      baseClass = this;
    }
    // 本次调用所创建的类（构造函数）
    function F() {
      // 如果当前处于实例化类的阶段，则调用init原型函数
      if (!initializing) {
        // 如果父类存在，则实例对象的baseprototype指向父类的原型
        // 这就提供了在实例对象中调用父类方法的途径
        if (baseClass) {
          this._superprototype = baseClass.prototype;
        }
        this.init.apply(this, arguments);
      }
    }
    // 如果此类需要从其它类扩展
    if (baseClass) {
      initializing = true;
      F.prototype = new baseClass();
      F.prototype.constructor = F;
      initializing = false;
    }
    // 新创建的类自动附加extend函数
    F.extend = arguments.callee;

    // 覆盖父类的同名函数
    for (var name in prop) {
      if (prop.hasOwnProperty(name)) {
        // 如果此类继承自父类baseClass并且父类原型中存在同名函数name
        if (baseClass &&
            typeof (prop[name]) === "function" &&
            typeof (F.prototype[name]) === "function" &&
            /\b_super\b/.test(prop[name])) {
          // 重定义函数name -
          // 首先在函数上下文设置this._super指向父类原型中的同名函数
          // 然后调用函数prop[name]，返回函数结果
          // 注意：这里的自执行函数创建了一个上下文，这个上下文返回另一个函数，
          // 此函数中可以应用此上下文中的变量，这就是闭包（Closure）。
          // 这是JavaScript框架开发中常用的技巧。
          F.prototype[name] = (function(name, fn) {
            return function() {
              this._super = baseClass.prototype[name];
              return fn.apply(this, arguments);
            };
          })(name, prop[name]);
        } else {
          F.prototype[name] = prop[name];
        }
      }
    }
    return F;
  };
})();
var gEcnu={};

/**********gEcnu的相关配置信息****************/
gEcnu.config = {
  'version': '1.0.0',//地图对象版本编号
  //'port': 81,//地图对象，wms,wfs服务请求端口
  'maxLevel': 10,//地图对象版本号最大缩放级别
  'minLevel': 1,//地图对象版本号最小缩放级别
  'tileWidth': 250,//地图对象中切片大小
  'tileHeight': 200,//地图对象中切片大小
  //'webHostIP': '58.198.183.6', //地图对象请求IP地址 http://58.198.183.10:81/
  'geoserver':'/mapb/',  //实用相对路径  
  'mapserver':'http://webgis.ecnu.edu.cn:81/', //请求切片的地址，如不设置，使用geoserver的路径 
  //'dynMapURL':'http://webgis.ecnu.edu.cn:81/', //请求动态图的地址，如不设置，使用geoserver的路径 
  'imgPath':'https://ccgis.cn/geosvr183/jslib/images/',
  'cat':'data/userdata/upload/'
};


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
   },
   _initContainer: function(){
       var w = 30, h = 60;
       var zoomDiv = gEcnu.Util.createDiv('zoomCtrl',w,h,true);
       var zoomInDiv = gEcnu.Util.createDiv('zoomInDiv',w,h/2,false);
       var zoomInImg = new Image();
       zoomInImg.src = gEcnu.config.imgPath+"zoomin.png";
       zoomInDiv.appendChild(zoomInImg);
       var zoomOutDiv = gEcnu.Util.createDiv('zoomOutDiv',w,h/2,false);
       var zoomOutImg = new Image();
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
   setPos: function(){
      this._container.style.right =  '15px';
      this._container.style.top = '40px';
      this._container.style.zIndex = this.options.zIndex;
   }
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
   this._reqDyn();          //请求动态图
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
    var mapurl=gEcnu.config.geoserver+"WebMap";
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
    var params={'map':ws,'cx':eagle_cx,'cy':eagle_cy,'w':w,'h':h,'zoom':eagleZoom,'lyrs':reqlyrs,'mt':'zoomto','return':'json'};
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
      });
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
  //this._reqDyn();
 }
//gEcnu.Feature = {};
gEcnu.DrawFeature = gClass.extend({
  init:function(name){
    this.name = name;
  } 
});
gEcnu.DrawFeature.setting=null;//用来存储用户自定义事件的回调
gEcnu.DrawFeature.Marker=gEcnu.DrawFeature.extend({
	init:function(){
       this._layer=gSelf.mLayer;  
	},
	activate:function(){
       this._layer._map.setMode('drawMarker');
       gEcnu.DrawFeature.setting=this;
	},
	deactivate:function(){
       this._layer._map.setMode('map');
	},
	events:{
       _events:{},
       on:function(eventType,callback){
            switch(eventType){
            	case 'added':
                this._events.added=callback;
            	break;
            }
       }
	}
});
gEcnu.DrawFeature.Point=gEcnu.DrawFeature.extend({
	init:function(layer){
       this._layer=layer; 
	},
  reVoke: function (){
    
  },
	activate:function(){
       this._layer._map.setMode('drawPoint');
       gEcnu.DrawFeature.setting=this;
	},
	deactivate:function(){
       this._layer._map.setMode('map');
	},
	events:{
       _events:{},
       on:function(eventType,callback){
           switch(eventType){
            	case 'added':
                    this._events.added=callback;
            	break;
            }
       }
	}
});
gEcnu.DrawFeature.Line=gEcnu.DrawFeature.extend({
	init:function(layer,catchable){
       this._layer=layer; 
       this._catchable=true;
       if(arguments.length>1){
        this._catchable=catchable;
       }
  },
  setCatchable:function(bool_catch){
     this._catchable=bool_catch;
  },
  reVoke:function(){
    if(gEcnu.Edit.draw_line_points.length>0){
      gEcnu.Edit.draw_line_points.pop();
      var line_line_style=new gEcnu.Style({opacity:1,fillColor:'#82D900',strokeColor:'#82D900',lineWeight:1})
      this._layer._map.overLayer.setStyle(line_line_style);
      var ctx=this._layer._map.overLayer._ctx;
      gEcnu.Util.setStyle(ctx,line_line_style);
      var len=gEcnu.Edit.draw_line_points.length;
      var ptArr=gEcnu.Edit.draw_line_points;
      this._layer._map.overLayer.clear();
      if (len >= 1) {
        var sxy = gEcnu.Util.worldToScreen(ptArr[len - 1].x, ptArr[len - 1].y);
        gEcnu.Graph.drawLine(ctx, sxy, gEcnu.Edit.NowPoint);
        if(len>=2){
            var sxy_fir = gEcnu.Util.worldToScreen(ptArr[0].x, ptArr[0].y);
            gEcnu.Graph.drawLine(ctx, sxy_fir, gEcnu.Edit.NowPoint);
        }
        gEcnu.Graph.drawLines_geo(ctx, ptArr);
      }
      //绘制端点集合
      gEcnu.Graph.drawPoints_geo(ctx,ptArr);
    }else{
      alert('节点为空，不能撤销节点');
    }
  },
	activate:function(){
       this._layer._map.setMode('drawLine');
       gEcnu.DrawFeature.setting=this;
	},
	deactivate:function(){
       this._layer._map.setMode('map');
	},
	events:{
       _events:{},
       on:function(eventType,callback){
            switch(eventType){
            	case 'added':
                     this._events.added=callback;
            	break;
            }
       }
	}
});
gEcnu.DrawFeature.Polygon=gEcnu.DrawFeature.extend({
	init:function(layer,catchable){
       this._layer=layer; 
       this._catchable=true;
       if(arguments.length>1){
        this._catchable=catchable;
       }
	},
  setCatchable:function(bool_catch){
     this._catchable=bool_catch;
  },
  reVoke:function(){
    if(gEcnu.Edit.draw_polygon_points.length>0){
      gEcnu.Edit.draw_polygon_points.pop();
      var line_line_style=new gEcnu.Style({opacity:1,fillColor:'#82D900',strokeColor:'#82D900',lineWeight:1})
      this._layer._map.overLayer.setStyle(line_line_style);
      var ctx=this._layer._map.overLayer._ctx;
      gEcnu.Util.setStyle(ctx,line_line_style);
      var len=gEcnu.Edit.draw_polygon_points.length;
      var ptArr=gEcnu.Edit.draw_polygon_points;
      this._layer._map.overLayer.clear();
      if (len >= 1) {
        var sxy = gEcnu.Util.worldToScreen(ptArr[len - 1].x, ptArr[len - 1].y);
        gEcnu.Graph.drawLine(ctx, sxy, gEcnu.Edit.NowPoint);
        if(len>=2){
            var sxy_fir = gEcnu.Util.worldToScreen(ptArr[0].x, ptArr[0].y);
            gEcnu.Graph.drawLine(ctx, sxy_fir, gEcnu.Edit.NowPoint);
        }
        gEcnu.Graph.drawLines_geo(ctx, ptArr);
      }
      //绘制端点集合
      gEcnu.Graph.drawPoints_geo(ctx,ptArr);
    }else{
      alert('节点为空，不能撤销节点');
    }
  },
	activate:function(){
       this._layer._map.setMode('drawPolygon');
       gEcnu.DrawFeature.setting=this;
	},
	deactivate:function(){
       this._layer._map.setMode('map');
	},
	events:{
       _events:{},
       on:function(eventType,callback){
            switch(eventType){
            	case 'added':
                this._events.added=callback;
            	break;
            }
       }
	}
});
gEcnu.DrawFeature.Rect=gEcnu.DrawFeature.extend({
  init:function (layer){
    this._layer=layer;
    },
  activate:function(){
       this._layer._map.setMode('drawRect');
       gEcnu.DrawFeature.setting=this;
  },
  deactivate:function(){
       this._layer._map.setMode('map');
  },
  events:{
       _events:{},
       on:function(eventType,callback){
            switch(eventType){
              case 'added':
                this._events.added=callback;
              break;
            }
       }
  }
  
});

/*gEcnu.DrawFeature.Circle=gEcnu.DrawFeature.extend({
  init:function (layer){
    this._layer=layer;
  },
  activate:function(){
       this._layer._map.setMode('drawCircle');
       gEcnu.DrawFeature.setting=this;
  }, 
  deactivate:function(){
       this._layer._map.setMode('map');
  }, 
  events:{
       _events:{},
       on:function(eventType,callback){
            switch(eventType){
              case 'added':
                this._events.added=callback;
              break;
            }
       }
  }
});*/

/**
 * 查询时 实时显示半径 
 */
gEcnu.DrawFeature.Circle=gEcnu.DrawFeature.extend({
  init:function (layer,isDisplayRadius){
    this._layer=layer;
    this.isDisplayRadius = arguments.length>1 ? arguments[1] : false;
  },
  activate:function(){
       this._layer._map.setMode('drawCircle');
       gEcnu.DrawFeature.setting=this;
  }, 
  deactivate:function(){
       this._layer._map.setMode('map');
  }, 
  events:{
       _events:{},
       on:function(eventType,callback){
            switch(eventType){
              case 'added':
                this._events.added=callback;
              break;
            }
       }
  }
});
gEcnu.DrawFeature.Text=gEcnu.DrawFeature.extend({
  init:function (layer){
    this._layer=layer;
  },
  activate:function(){
       this._layer._map.setMode('drawText');
       gEcnu.DrawFeature.setting=this;
  }, 
  deactivate:function(){
       this._layer._map.setMode('map');
  }, 
  events:{
       _events:{},
       on:function(eventType,callback){
            switch(eventType){
              case 'added':
                this._events.added=callback;
              break;
            }
       }
  }
});

/**
 * 要素编辑
 * @param  {[type]} ){                  }} [description]
 * @return {[type]}     [description]
 */
gEcnu.EditFeature = gClass.extend({
  init:function(){
   
  }
});
gEcnu.EditFeature.setting=null;//用来存储用户自定义事件的回调
gEcnu.EditFeature.Polygon=gEcnu.EditFeature.extend({
    init:function(layer,catchable){
       this._layer=layer; 
       this._catchable=true;
       this._reshape=false;
       if(arguments.length>1){
        this._catchable=catchable;
       }
    },
    activate:function(reShape){   //true的话表示可以进行要素编辑(默认可以进行节点平移)，否则只进行选择
       this._layer._map.setMode('selectPolygon');
       if(arguments.length>0){
        this._reshape=reShape;
       }
       gEcnu.EditFeature.setting=this;
    },
    deactivate:function(){
         this._layer._map.setMode('map');
         this._layer._map.overLayer.clear();
         gEcnu.EditFeature.setting=null;
         gEcnu.Edit.selectedPolygon=null;//编辑多边形时选中的多边形
         gEcnu.Edit.selectedPolygon_pre=null;//编辑多边形时选中的多边形_为了匹配layer中对应的要素
         gEcnu.Edit.Poly_sellineRing_index=-1;//选中的多边形的的线环下标值
         gEcnu.Edit.Poly_selPoint_index=-1;//选中的多边形的编辑节点的下标值
         gEcnu.Edit.multiSelectedFeatures=[];
         this._layer._map.mLayer.getLayerContainer().style.cursor = "default";
    },
    //添加节点添加和删除功能
    //TODO  someThing
    addPoint:function(){
      if( gEcnu.EditFeature.setting==null||gEcnu.Edit.selectedPolygon==null){
        return;
      }
      this._layer._map.setMode('addPoint');
    },
    delPoint:function(){
      if( gEcnu.EditFeature.setting==null||gEcnu.Edit.selectedPolygon==null){
        return;
      }
      this._layer._map.setMode('delPoint');
    },
    reShape:function(){
       this._reshape=true;
    },
    offReShape:function(){
       this._reshape=false;
    },
    setCatchable:function(bool_catch){
      this._catchable=bool_catch;
    },
    events:{
        _events:{},
        on:function(eventType,callback){
            switch(eventType){
              case 'selected':
                this._events.selected=callback;
              break;
              case 'multiSelected':
                this._events.multiSelected=callback;
              break;
              case 'updateCompleted':
                this._events.updateCompleted=callback;
              break;
            }
        }
    }
});

gEcnu.EditFeature.Line=gEcnu.EditFeature.extend({
    init:function(layer,catchable){
       this._layer=layer; 
       this._catchable=true;
       if(arguments.length>1){
        this._catchable=catchable;
       }
        this._reshape=false;
    },
    activate:function(reShape){  //true的话表示可以进行要素编辑(默认可以进行节点平移)，否则只进行选择
       this._layer._map.setMode('selectLine');
       if(arguments.length>0){
        this._reshape=reShape;
       }
       gEcnu.EditFeature.setting=this;
    },
    deactivate:function(){
         this._layer._map.setMode('map');
         this._layer._map.overLayer.clear();
         gEcnu.EditFeature.setting=null;
         gEcnu.Edit.selectedLine=null;//编辑线要素时选中的多边形
         gEcnu.Edit.selectedLine_pre=null;//编辑线要素时选中的多边形_为了匹配layer中对应的要素
         gEcnu.Edit.Line_sellineString_index=-1;//选中的线要素的的线环下标值
         gEcnu.Edit.Line_selPoint_index=-1;//选中的线要素的编辑节点的下标值
         gEcnu.Edit.multiSelectedFeatures=[];
         this._layer._map.mLayer.getLayerContainer().style.cursor = "default";
    },
    //添加节点添加和删除功能
    //TODO  someThing
    addPoint:function(){
      if( gEcnu.EditFeature.setting==null||gEcnu.Edit.selectedLine==null){
        return;
      }
      this._layer._map.setMode('addPoint_line');
    },
    delPoint:function(){
      if( gEcnu.EditFeature.setting==null||gEcnu.Edit.selectedLine==null){
        return;
      }
      this._layer._map.setMode('delPoint_line');
    },
    reShape:function(){
       this._reshape=true;
    },
    offReShape:function(){
       this._reshape=false;
    },
    setCatchable:function(bool_catch){
      this._catchable=bool_catch;
    },
    events:{
        _events:{},
        on:function(eventType,callback){
            switch(eventType){
              case 'selected':
                this._events.selected=callback;
              break;
              case 'multiSelected':
                this._events.multiSelected=callback;
              break;
              case 'updateCompleted':
                this._events.updateCompleted=callback;
              break;
            }
        }
    }
});

gEcnu.EditFeature.Point=gEcnu.EditFeature.extend({
  init:function(layer){
       this._layer=layer; 
    },
    activate:function(){  //true的话表示可以进行要素编辑(默认可以进行节点平移)，否则只进行选择
       this._layer._map.setMode('selectPoint');
       gEcnu.EditFeature.setting=this;
    },
    deactivate:function(){
         this._layer._map.setMode('map');
         this._layer._map.overLayer.clear();
         gEcnu.EditFeature.setting=null;
         gEcnu.Edit.selectedPoint=null;        //编辑点要素时选中的要素
         gEcnu.Edit.multiSelectedFeatures=[];  //多选的要素
         this._layer._map.mLayer.getLayerContainer().style.cursor = "default";
    },
    events:{
        _events:{},
        on:function(eventType,callback){
            switch(eventType){
              case 'selected':
                this._events.selected=callback;
              break;
              case 'multiSelected':
                this._events.multiSelected=callback;
              break;
              case 'updateCompleted':
                this._events.updateCompleted=callback;  
              break;
            }
        }
    }
});
gEcnu.EditFeature.Text=gEcnu.EditFeature.extend({
  init:function(layer){
       this._layer=layer; 
    },
    activate:function(){  //true的话表示可以进行要素编辑(默认可以进行节点平移)，否则只进行选择
       this._layer._map.setMode('selectText');
       gEcnu.EditFeature.setting=this;
    },
    deactivate:function(){
         this._layer._map.setMode('map');
         this._layer._map.overLayer.clear();
         gEcnu.EditFeature.setting=null;
         this._layer._map.mLayer.getLayerContainer().style.cursor = "default";
    },
    events:{
        _events:{},
        on:function(eventType,callback){
            switch(eventType){
              case 'selected':
                this._events.selected=callback;
              break;
            }
        }
    }

});

/**
*1、编辑动态图中各图层的样式 2015-3-3 by Lc
*2、获取指定图层样式  2015-8-14 by lc 
*/

gEcnu.DynLayerStyle=gClass.extend({
	init:function (ws,lyrname,style){
		this.ws=ws;
		this.lyrName=lyrname;
	},
	update:function (){

	}
});
/**
*编辑点图层的样式 
*/
//  数据库默认是ecnugis  其他的通过ws: publicdb/mapname
gEcnu.DynLayerStyle.PointStyle=gEcnu.DynLayerStyle.extend({
	init:function (ws,lyrname,style){
		this._super(ws,lyrname);
		this.ptStyle=style;
		this._getmapName();
	},
	_getmapName:function (){
		var ws=this.ws;
		if(ws.indexOf('/')>0){
			this.dbName=ws.split("/")[0];
			this.mapName=ws.split("/")[1];
		}else{
			this.dbName="ecnugis";
			this.mapName=ws;
		}
	},
	//ptstyle {color:,size:} option{success:,fail:}
	update:function (option){
		var self=this;
		var dbname=this.dbName;
		var mapname=this.mapName;
		var lyrname=this.lyrName;
		this.succCallback=option ? option.success : function (){};
		this.failCallback=option ? option.fail : function (){};
		var queryService=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (data){
			var mapid=data[0]['g_layers.map_id'];
			var updStyle={}; 
			var lyrStyle=self._getNewLyrStyle(data); 
			var labelstyle_all=self._getLabelStyle_all(data[0]['labelstyle']);
			var zindex_res=self._getZindex();
			if(zindex_res){
				updStyle['zIndex']=zindex_res;
			}
			if(lyrStyle){
				updStyle['lyrStyle']=lyrStyle;
			}
			if(labelstyle_all){
				updStyle['labelStyle_all']=labelstyle_all;
			}
			//console.log('updStyle',updStyle);
			//var updStyle={'lyrStyle':lyrStyle,'labelStyle_all':labelstyle_all,'zIndex':zindex};
			self._exec(mapid,lyrname,updStyle); 
        	 },'processFailed':function (){ }});
    	var params={'lyr':'g_layers,g_map','fields':'lyr_style,labelstyle,g_layers.map_id','filter':'lyr_name='+"'"+lyrname+"'"+"and g_map.map_id=g_layers.map_id and g_map.map_id="+"'"+mapname+"'"};
    	queryService.processAscyn(gEcnu.ActType.SQLQUERY,dbname,params);
	},
	_getNewLyrStyle:function (data){
		var ptStyle=this.ptStyle;
		var color=ptStyle.color;  // ?? 颜色值需要进一步处理
		var ptSize=ptStyle.size;
		var oldStyle=data[0]['lyr_style'];
		var mapid=data[0]['g_layers.map_id'];
		var arr=oldStyle.split(",");
		var newColor=arr[2];
		var newSize=arr[3];
		if(color!=undefined){
			newColor=this._webColor2dbcolor(color);
		}
		if(ptSize!=undefined){
			newSize=ptSize;
		}
		arr[2]=newColor;
		arr[3]=newSize;
		var updStyle=arr.join(","); 
		return updStyle;
	},
	_getLabelStyle_all:function (dbStyle){
		var style=this.ptStyle;
		var autoLabel=style.autoLabel;  
		var labelFld=style.labelField;
		var labelStyle=style.labelStyle;
		var all_labelStyle={};
		var arr=dbStyle.split(',');
		if(autoLabel!=undefined){ 
			all_labelStyle['autoLabel']=autoLabel;
		}
		if(labelFld && labelFld!=''){
			all_labelStyle['labelField']=labelFld;
		}
		if(labelStyle && labelStyle!=''){
			var ftColor=labelStyle.fontColor;
			var fontType=labelStyle.fontType ? labelStyle.fontType : arr[1];
			//var fontColor= ftColor ? ftColor.toString().substr(1,ftColor.length-1) : arr[2];//去除颜色值前面的 #
			var fontColor= ftColor ? this._webColor2dbcolor(ftColor): arr[2];
			var fontSize=labelStyle.fontSize ? "-"+labelStyle.fontSize : arr[3];
			var fontStyle=labelStyle.fontStyle ? labelStyle.fontStyle : arr[4];  
			all_labelStyle['labelStyle']="134,"+fontType+","+fontColor+","+fontSize+","+fontStyle;
		}     
		return all_labelStyle;
	},
	_getZindex:function (){
		var style=this.ptStyle;
		var zindex=style.zIndex;
		if(zindex && zindex!=''){
			return zindex;
		}else{
			return false;
		}
	},
	_exec:function (mapid,lyrname,updStyle){
		var succ=this.succCallback;
		var fail=this.failCallback;
		var dbname=this.dbName;
		var lyrStyle=updStyle.lyrStyle;
		var labelStyle_all=updStyle.labelStyle_all;
		var zindex=updStyle.zIndex;
		var updSQL='';

		var lyrstyle_sql=lyrStyle ? 'lyr_style='+"'"+lyrStyle+"'" : '';
		var zindex_sql=zindex ? "z_index="+zindex : '';
		var autolabel_sql=(labelStyle_all.autoLabel !=undefined) ? 'autolabel='+labelStyle_all.autoLabel : '';
		var labelfld_sql=(labelStyle_all.labelField !=undefined) ? 'lablefield='+"'"+labelStyle_all.labelField+"'" : '';
		var labelstyle_sql=(labelStyle_all.labelStyle !=undefined) ? 'labelstyle='+"'"+labelStyle_all.labelStyle+"'" : '';

		//var updSQL=lyrstyle_sql+","+zindex_sql+","+autolabel_sql+","+labelfld_sql+","+labelstyle_sql;
		//sql有为空的时候
		if(lyrstyle_sql!="")    updSQL+=lyrstyle_sql+",";
		if(zindex_sql!="")      updSQL+=zindex_sql+",";
		if(autolabel_sql!="")   updSQL+=autolabel_sql+",";
		if(labelfld_sql!="")    updSQL+=labelfld_sql+",";
		if(labelstyle_sql!="")  updSQL+=labelstyle_sql+",";
		updSQL=updSQL.substr(0,updSQL.length-1);
		if(updSQL==''){
			return;
		}
		var sqlService_upd=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (msg){ 
			if(succ!=undefined){
 				succ();
 			}
		},'processFailed':function (){
			if(fail!=undefined){
				fail();
			}
		 }});
		var sql="update g_layers set "+updSQL+" where map_id="+mapid+" and lyr_name="+"'"+lyrname+"'"; 
		// var sql="update g_layers set lyr_style="+"'"+updStyle+"'"+" where map_id="+mapid+" and lyr_name="+"'"+lyrname+"'"; 
        sqlService_upd.processAscyn(gEcnu.ActType.SQLEXEC,dbname,sql);
	},
	//color $0058ff
	_webColor2dbcolor:function (color){
		var rgb=color.substring(1);
		var rr=rgb.substr(0,2);
		var gg=rgb.substr(2,2);
		var bb=rgb.substr(4,2);
		newColor="$00"+bb+gg+rr;   //  clRed形式
		return newColor;
	},
	//针对16进制颜色和字符串颜色（red，green。。。转换）
	_getColor:function (color){

	}
});
/**
*编辑线图层的样式 
*/
gEcnu.DynLayerStyle.LineStyle=gEcnu.DynLayerStyle.extend({
	init:function (ws,lyrname,style){
		this._super(ws,lyrname);
		this.lineStyle=style;
		this._getmapName();
	},
	_getmapName:function (){
		var ws=this.ws;
		if(ws.indexOf('/')>0){
			this.dbName=ws.split("/")[0];
			this.mapName=ws.split("/")[1];
		}else{
			this.dbName="ecnugis";
			this.mapName=ws;
		}
	},
	//linestyle {lineType:,strokeColor:,lineWidth:}
	update:function (option){
		var self=this;
		var dbname=this.dbName;
		var mapname=this.mapName;
		var lyrname=this.lyrName;
		this.succCallback=option ? option.success : function (){};
		this.failCallback=option ? option.fail : function (){};
		var queryService=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (data){
			var mapid=data[0]['g_layers.map_id']; 
			var updStyle={}; 
			var lyrStyle=self._getNewLyrStyle(data); 
			var labelstyle_all=self._getLabelStyle_all(data[0]['labelstyle']);
			var zindex_res=self._getZindex();
			if(zindex_res){
				updStyle['zIndex']=zindex_res;
			}
			if(lyrStyle){
				updStyle['lyrStyle']=lyrStyle;
			}
			if(labelstyle_all){
				updStyle['labelStyle_all']=labelstyle_all;
			}
			//console.log('updStyle',updStyle);
			//var updStyle={'lyrStyle':lyrStyle,'labelStyle_all':labelstyle_all,'zIndex':zindex};
			self._exec(mapid,lyrname,updStyle); 
        	 },'processFailed':function (){ }});
    	var params={'lyr':'g_layers,g_map','fields':'lyr_style,labelstyle,g_layers.map_id','filter':'lyr_name='+"'"+lyrname+"'"+"and g_map.map_id=g_layers.map_id and g_map.map_id="+"'"+mapname+"'"};
    	queryService.processAscyn(gEcnu.ActType.SQLQUERY,dbname,params);
	},
	_getNewLyrStyle:function (data){
		var self=this;
		var lineStyle=this.lineStyle;
		var linetype=lineStyle.lineType;  
		var linecolor=lineStyle.strokeColor;
		var linewidth=lineStyle.lineWidth;
		var oldStyle=data[0]['lyr_style'];
		var mapid=data[0]['g_layers.map_id'];
		var arr=oldStyle.split(",");
		var newType;
		var newColor;
		var newWidth;
		if(linecolor!=undefined){
			newColor=this._webColor2dbcolor(linecolor);
		}else{
			newColor=arr[1];
		}
		newType=(linetype!=undefined) ? linetype : arr[0];
		newWidth=(linewidth!=undefined) ? linewidth : arr[2];

		arr[0]=newType;
		arr[1]=newColor;
		arr[2]=newWidth;
		var updStyle=arr.join(",");  
		return updStyle;
	},
	//labelStyle: {fontType:,fontColor:,fontSize:,fontStyle:}
	_getLabelStyle_all:function (dbStyle){
		var style=this.lineStyle;
		var autoLabel=style.autoLabel;
		var labelFld=style.labelField;
		var labelStyle=style.labelStyle;
		var all_labelStyle={};
		var arr=dbStyle.split(',');
		if(autoLabel!=undefined){
			all_labelStyle['autoLabel']=autoLabel;
		}
		if(labelFld && labelFld!=''){
			all_labelStyle['labelField']=labelFld;
		}
		if(labelStyle && labelStyle!=''){
			var ftColor=labelStyle.fontColor;
			var fontType=labelStyle.fontType ? labelStyle.fontType : arr[1];
			//var fontColor= ftColor ? ftColor.toString().substr(1,ftColor.length-1) : arr[2];//去除颜色值前面的 #
			var fontColor= ftColor ? this._webColor2dbcolor(ftColor): arr[2];
			var fontSize=labelStyle.fontSize ? "-"+labelStyle.fontSize : arr[3];
			var fontStyle=labelStyle.fontStyle ? labelStyle.fontStyle : arr[4];  
			all_labelStyle['labelStyle']="134,"+fontType+","+fontColor+","+fontSize+","+fontStyle;
		}
		return all_labelStyle;
	},
	_getZindex:function (){
		var style=this.lineStyle;
		var zindex=style.zIndex;
		if(zindex && zindex!=''){
			return zindex;
		}else{
			return false;
		}
	},
	_exec:function (mapid,lyrname,updStyle){
		var succ=this.succCallback;
		var fail=this.failCallback;
		var dbname=this.dbName;
		var lyrStyle=updStyle.lyrStyle;
		var labelStyle_all=updStyle.labelStyle_all;
		var zindex=updStyle.zIndex;
		var updSQL='';

		var lyrstyle_sql=lyrStyle ? 'lyr_style='+"'"+lyrStyle+"'" : '';
		var zindex_sql=zindex ? "z_index="+zindex : '';
		var autolabel_sql=(labelStyle_all.autoLabel !=undefined) ? 'autolabel='+labelStyle_all.autoLabel : '';
		var labelfld_sql=(labelStyle_all.labelField !=undefined) ? 'lablefield='+"'"+labelStyle_all.labelField+"'" : '';
		var labelstyle_sql=(labelStyle_all.labelStyle!=undefined) ? 'labelstyle='+"'"+labelStyle_all.labelStyle+"'" : '';

		if(lyrstyle_sql!="")    updSQL+=lyrstyle_sql+",";
		if(zindex_sql!="")      updSQL+=zindex_sql+",";
		if(autolabel_sql!="")   updSQL+=autolabel_sql+",";
		if(labelfld_sql!="")    updSQL+=labelfld_sql+",";
		if(labelstyle_sql!="")  updSQL+=labelstyle_sql+",";
		updSQL=updSQL.substr(0,updSQL.length-1);
		if(updSQL==''){
			return;
		}
		var sqlService_upd=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (msg){
			if(succ!=undefined){
 				succ();
 			}
		},'processFailed':function (){
			if(fail!=undefined){
				fail();
			}
		 }});
		var sql="update g_layers set "+updSQL+" where map_id="+mapid+" and lyr_name="+"'"+lyrname+"'"; 
        sqlService_upd.processAscyn(gEcnu.ActType.SQLEXEC,dbname,sql);
	},
	//color $0058ff
	_webColor2dbcolor:function (color){
		var rgb=color.substring(1);
		var rr=rgb.substr(0,2);
		var gg=rgb.substr(2,2);
		var bb=rgb.substr(4,2);
		newColor="$00"+bb+gg+rr;
		return newColor;
	},
	//针对16进制颜色和字符串颜色（red，green。。。转换）
	_getColor:function (color){

	}
});
/**
*编辑面图层的样式 
*/
//polystyle {borderType:,strokeColor:,borderWidth:,fillType:,fillColor:,autoLabel: ,labelField:,labelStyle:{fontType:,fontColor:,fontSize:,fontStyle:},zIndex:}
gEcnu.DynLayerStyle.PolygonStyle=gEcnu.DynLayerStyle.extend({
	init:function (ws,lyrname,style){
		this._super(ws,lyrname);
		this.polyStyle=style; 
		this._getmapName();
	},
	_getmapName:function (){
		var ws=this.ws;
		if(ws.indexOf('/')>0){
			this.dbName=ws.split("/")[0];
			this.mapName=ws.split("/")[1];
		}else{
			this.dbName="ecnugis";
			this.mapName=ws;
		}
	},
	update:function (option){
		var self=this;
		var dbname=this.dbName;
		var mapname=this.mapName;
		var lyrname=this.lyrName;
		this.succCallback=option ? option.success : function (){};
		this.failCallback=option ? option.fail : function (){};
		var queryService=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (data){
			var mapid=data[0]['g_layers.map_id'];
			var updStyle={}; 
			var lyrStyle=self._getNewLyrStyle(data); 
			var labelstyle_all=self._getLabelStyle_all(data[0]['labelstyle']);
			var zindex_res=self._getZindex();
			if(zindex_res){
				updStyle['zIndex']=zindex_res;
			}
			if(lyrStyle){
				updStyle['lyrStyle']=lyrStyle;
			}
			if(labelstyle_all){
				updStyle['labelStyle_all']=labelstyle_all;
			}
			//console.log('updStyle',updStyle);
			//var updStyle={'lyrStyle':lyrStyle,'labelStyle_all':labelstyle_all,'zIndex':zindex};
			self._exec(mapid,lyrname,updStyle); 
        	 },'processFailed':function (){ }});
    	var params={'lyr':'g_layers,g_map','fields':'lyr_style,labelstyle,g_layers.map_id','filter':'lyr_name='+"'"+lyrname+"'"+"and g_map.map_id=g_layers.map_id and g_map.map_id="+"'"+mapname+"'"};
    	queryService.processAscyn(gEcnu.ActType.SQLQUERY,dbname,params);
	},
	_getNewLyrStyle:function (data){
		var self=this;
		var polyStyle=this.polyStyle;
		var borderType=polyStyle.borderType;
		var strokeColor=polyStyle.strokeColor;
		var borderWidth=polyStyle.borderWidth;
		var fillType=polyStyle.fillType;
		var fillColor=polyStyle.fillColor;
		var oldStyle=data[0]['lyr_style'];
		var mapid=data[0]['g_layers.map_id'];
		var arr=oldStyle.split(",");
		var newBorderType,newStrokColor,newBorderWid,newFillType,newFillColor;
		newBorderType=(borderType!=undefined) ? borderType : arr[0];
		newStrokColor=strokeColor ? this._webColor2dbcolor(strokeColor) : arr[1];
		newBorderWid=(borderWidth!=undefined) ? borderWidth : arr[2];
		newFillType=(fillType!=undefined) ? fillType : arr[3]; 
		newFillColor=fillColor ? this._webColor2dbcolor(fillColor) : arr[4];
		arr[0]=newBorderType;
		arr[1]=newStrokColor;
		arr[2]=newBorderWid;
		arr[3]=newFillType;
		arr[4]=newFillColor;
		var updStyle=arr.join(","); 
		return updStyle;
	},
	//labelStyle: {fontType:,fontColor:,fontSize:,fontStyle:}
	_getLabelStyle_all:function (dbStyle){
		var style=this.polyStyle;
		var autoLabel=style.autoLabel;
		var labelFld=style.labelField;
		var labelStyle=style.labelStyle;
		var all_labelStyle={};
		var arr=dbStyle.split(',');
		if(autoLabel!=undefined){
			all_labelStyle['autoLabel']=autoLabel;
		}
		if(labelFld && labelFld!=''){
			all_labelStyle['labelField']=labelFld;
		}
		if(labelStyle && labelStyle!=''){
			var ftColor=labelStyle.fontColor;
			var fontType=labelStyle.fontType ? labelStyle.fontType : arr[1];
			// var fontColor= ftColor ? ftColor.toString().substr(1,ftColor.length-1) : arr[2];//去除颜色值前面的 # 
			var fontColor= ftColor ? this._webColor2dbcolor(ftColor) : arr[2];
			var fontSize=labelStyle.fontSize ? "-"+labelStyle.fontSize : arr[3];
			var fontStyle=labelStyle.fontStyle ? labelStyle.fontStyle : arr[4];  
			all_labelStyle['labelStyle']="134,"+fontType+","+fontColor+","+fontSize+","+fontStyle;
		}
		return all_labelStyle;
	},
	_getZindex:function (){
		var style=this.polyStyle;
		var zindex=style.zIndex;
		if(zindex && zindex!=''){
			return zindex;
		}else{
			return false;
		}
	},

	//updStyle={lyrStyle:,labelStyle_all:{autoLabel:,labelField:,labelStyle},zIndex:}
	_exec:function (mapid,lyrname,updStyle){
		var dbname=this.dbName;
		var succ=this.succCallback;
		var fail=this.failCallback;
		var lyrStyle=updStyle.lyrStyle;
		var labelStyle_all=updStyle.labelStyle_all;
		var zindex=updStyle.zIndex;
		var updSQL='';

		var lyrstyle_sql=lyrStyle ? 'lyr_style='+"'"+lyrStyle+"'" : '';
		var zindex_sql=zindex ? "z_index="+zindex : '';
		var autolabel_sql=(labelStyle_all.autoLabel !=undefined) ? 'autolabel='+labelStyle_all.autoLabel : '';
		var labelfld_sql=(labelStyle_all.labelField!=undefined) ? 'lablefield='+"'"+labelStyle_all.labelField+"'" : '';
		var labelstyle_sql=(labelStyle_all.labelStyle!=undefined) ? 'labelstyle='+"'"+labelStyle_all.labelStyle+"'" : '';

		//var updSQL=lyrstyle_sql+","+zindex_sql+","+autolabel_sql+","+labelfld_sql+","+labelstyle_sql;
		//sql有为空的时候
		if(lyrstyle_sql!="")    updSQL+=lyrstyle_sql+",";
		if(zindex_sql!="")      updSQL+=zindex_sql+",";
		if(autolabel_sql!="")   updSQL+=autolabel_sql+",";
		if(labelfld_sql!="")    updSQL+=labelfld_sql+",";
		if(labelstyle_sql!="")  updSQL+=labelstyle_sql+",";
		updSQL=updSQL.substr(0,updSQL.length-1);
		if(updSQL==''){
			return;
		}
		var sqlService_upd=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (msg){ 
			if(succ!=undefined){
 				succ();
 			}
		},'processFailed':function (){
			if(fail!=undefined){
				fail();
			}
		 }});
		var sql="update g_layers set "+updSQL+" where map_id="+mapid+" and lyr_name="+"'"+lyrname+"'"; 
		// var sql="update g_layers set lyr_style="+"'"+updStyle+"'"+" where map_id="+mapid+" and lyr_name="+"'"+lyrname+"'"; 
        sqlService_upd.processAscyn(gEcnu.ActType.SQLEXEC,dbname,sql);
	},

	/**
	*web中的html颜色与数据库中颜色格式之间的转换
	*@param color:#0058ff  
	*/
	_webColor2dbcolor:function (color){
		var rgb=color.substring(1);
		var rr=rgb.substr(0,2);
		var gg=rgb.substr(2,2);
		var bb=rgb.substr(4,2);
		newColor="$00"+bb+gg+rr;
		return newColor;
	},
	/**
	*返回16进制颜色值 六位编码 针对16进制颜色和字符串颜色（#ff0000, #f00,red 三种格式的统一）
	*/
	_get16Color:function (color){

	}
});


/********************2015-8-14获取指定图层的样式*************************/
gEcnu.DynLayerStyle.getStyle = gEcnu.DynLayerStyle.extend({
	init: function (ws,lyrnameArr){
		this.ws = ws;
		this.lyrArr = lyrnameArr;
		this._getmapName();
	},
	processAscyn: function (succ,fail){
		this.succCallback = arguments.length > 0 ? arguments[0] : function (){};
		this.failCallback = arguments.length > 1 ? arguments[1] : function (){};
		this._queryStyle();
	},
	_getmapName: function (){
		var ws=this.ws;
		if(ws.indexOf('/')>0){
			this.dbName=ws.split("/")[0];
			this.mapName=ws.split("/")[1];
		}else{
			this.dbName="ecnugis";
			this.mapName=ws;
		}
	},
	//查询图层样式
	_queryStyle: function (){
		var self = this;
		var ws = this.ws;
		var lyrs = this.lyrArr;
		var dbname = this.dbName;
		var mapname = this.mapName;
		var lyrStr = '';
		for(var i=0,len=lyrs.length;i<len;i++){
			if(i!=len-1){
				lyrStr +="'"+lyrs[i]+"'"+",";
			}else{
				lyrStr +="'"+lyrs[i]+"'";
			}
		}
		lyrStr = " ("+lyrStr+") ";
		var process = this._processResult;
		var fail = this.failCallback;
		var queryService=new gEcnu.WebSQLServices.SQLServices({'processCompleted':function (data){
			;
			self.bindContext(self,process,[data]);
        	 },'processFailed':function (){ 
        	 	fail();
        	 }});
    	var params={'lyr':'g_layers,g_map','fields':'lyr_name,alias,lyr_type,autolabel,lyr_style,labelstyle,lablefield','filter':'lyr_name in'+lyrStr+"and g_map.map_id=g_layers.map_id and g_map.map_id="+"'"+mapname+"'"};
    	queryService.processAscyn(gEcnu.ActType.SQLQUERY,dbname,params);
	},
	_processResult: function (data){ 
		var succ = this.succCallback;
		var paramArr = [];
		for(var i=0,len=data.length;i<len;i++){
			var record = data[i];
			var lyrname = record.lyr_name;
			var alias = record.alias;
			var shptype = record.lyr_type;
			var lyrstyle = record.lyr_style;
			var labelstyle = record.labelstyle;
			var isAutoLabel = record.autolabel;
			var labelfld = record.lablefield;
			var lyrStyleObj = this._getLyrStyle(shptype,lyrstyle);
			var labelstyleObj = this._getLabelStyle(isAutoLabel,labelfld,labelstyle);
			var param = {'lyrName':lyrname,'alias':alias,'shpType':shptype,'lyrStyle':lyrStyleObj,'labelStyle':labelstyleObj};
			paramArr.push(param);
		}
		succ(paramArr);
	},
	_getLabelStyle: function(isAutoLabel,labelfld,fStyle){
		var fontObj ={};
		var arr = fStyle.split(",");
		var fontFamily = arr[1] || '宋体';
		var fontColor = gEcnu.Util.dbColor2webColor(arr[2]);
		var fontSize = arr[3].toString().substring(1);
		fontObj={'autoLabel':isAutoLabel,'labelFld':labelfld,'fontFamily':fontFamily,'fontColor':fontColor,'fontSize':fontSize};
		return fontObj;
	},
	_getLyrStyle: function(shptype,shpStyle){  
		var arr = shpStyle.split(",");
		var lyrStyle = {};
		switch(shptype){
			case 1:
			case 8:
			var fillColor = gEcnu.Util.dbColor2webColor(arr[2]);
			var radius = arr[3];
			lyrStyle = {'radius':radius,'fillColor':fillColor};
			break;
			case 3:
			var strokeColor = gEcnu.Util.dbColor2webColor(arr[1]);
			var lineWidth = arr[2];
			lyrStyle = {'strokeColor':strokeColor,'lineWidth':lineWidth};
			break;
			case 5:
			var strokeColor = gEcnu.Util.dbColor2webColor(arr[1]);
			var lineWidth = arr[2];
			var isFill = arr[3] //填充样式 0：填充 1：不填充 其他值有填充样式（如斜线填充）
			var fillColor = gEcnu.Util.dbColor2webColor(arr[4]);
			lyrStyle = {'strokeColor':strokeColor,'lineWidth':lineWidth,'fillColor':fillColor};
			break;
		}
		return lyrStyle;
	},
	bindContext: function (context,fun,argsArr){
		fun.apply(context,argsArr);
	}





});
gEcnu.Edit={};
gEcnu.Edit.moving = false; //此处功能是判断鼠标是否处于按下状态，编辑多边形时使用
gEcnu.Edit.draw_line_points=[];//用户存储绘制多段线过程中
gEcnu.Edit.draw_polygon_points=[];//用户存储绘制多边形过程中
gEcnu.Edit.selectedPolygon=null;//编辑多边形时选中的多边形
gEcnu.Edit.selectedPolygon_pre=null;//编辑多边形时选中的多边形_为了匹配layer中对应的要素
gEcnu.Edit.selectedLine=null;//编辑线要素时选中的要素
gEcnu.Edit.selectedLine_pre=null;//编辑线要素时选中的多边形_为了匹配layer中对应的要素
gEcnu.Edit.Poly_sellineRing_index=-1;//选中的多边形的的线环下标值
gEcnu.Edit.Poly_selPoint_index=-1;//选中的多边形的编辑节点的下标值
gEcnu.Edit.Line_sellineString_index=-1;//选中的线要素的的线环下标值
gEcnu.Edit.Line_selPoint_index=-1;//选中的线要素的编辑节点的下标值
gEcnu.Edit.NowPoint=null;
gEcnu.Edit.selectedPoint=null;  //编辑点要素时选中的点
gEcnu.Edit.multiSelectedFeatures=[];//当按下shift键执行多选时存储的要素数组

gEcnu.Edit.draw_rect_points=[]; //存储绘制的矩形框节点
gEcnu.Edit.draw_circle_points=[];//储存圆的中心点和半径
gEcnu.Edit.drawCircleEnd=false;
gEcnu.Edit.graphMouseDownEvt=function(e,map){
	var mode = map.getMode();
	var mxy = gEcnu.Util.getMouseXY(gSelf._container,e);
	gSelf.startX = mxy.x;
	gSelf.startY = mxy.y;
	var wxy = gEcnu.Util.screenToWorld(mxy.x, mxy.y);
	var ctx = map.overLayer.getCtx();
	gEcnu.Edit.moving = true;
	switch (mode) {
	    case 'drawMarker':
	       var point_geometry=new gEcnu.Geometry.Point(wxy.x,wxy.y);
	       map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['mark'];
	       var callback_marker=gEcnu.DrawFeature.setting.events._events.added;
           if(typeof callback_marker != "undefined"){
              callback_marker(e,point_geometry);
           }
	    break;
	    case 'drawPoint':
	       var point_geometry=new gEcnu.Geometry.Point(wxy.x,wxy.y);
	       var callback_marker=gEcnu.DrawFeature.setting.events._events.added;
           if(typeof callback_marker != "undefined"){
              callback_marker(e,point_geometry);
           }
	    break;
	    case 'drawLine':
            var curobj=gEcnu.DrawFeature.setting;
	        var catchable=curobj._catchable;//捕捉是否开启，bool类型
	        var catchLayer=curobj._layer;

            if(catchable){//捕捉开启
            	var returnpoint = "",returnstring="";
                var features=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
                //第一步首先判断是否捕捉到线
                /*********待优化，最好获取一下视窗范围的features，减少后续的遍历*********/
                //var features=catchLayer.getScrFeatures();
                returnpoint = gEcnu.Graph.catchPoint(mxy,features);
                if (returnpoint.indexOf("true") >= 0) {//捕捉到了节点
			       var pointx = parseFloat(returnpoint.split("|")[1].split(",")[0]);
			       var pointy = parseFloat(returnpoint.split("|")[1].split(",")[1]);
			       var pointx_geo = parseFloat(returnpoint.split("|")[1].split(",")[2]);
			       var pointy_geo = parseFloat(returnpoint.split("|")[1].split(",")[3]);
			       mxy={x:pointx,y:pointy};
			       wxy={x:pointx_geo,y:pointy_geo};
                }else{
                	map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['draw'];
                	//第二步判断是否捕捉到线段
                    returnstring = gEcnu.Graph.catchLine(mxy,features);
                   if(returnstring.indexOf("true") >= 0){
                       var interX_scr = parseFloat(returnstring.split('|')[1].split(',')[0]);
					   var interY_scr  = parseFloat(returnstring.split('|')[1].split(',')[1]);
					   var interX = parseFloat(returnstring.split('|')[1].split(',')[2]);
					   var interY  = parseFloat(returnstring.split('|')[1].split(',')[3]);
					   mxy={x:interX_scr,y:interY_scr};
			           wxy={x:interX,y:interY};				   
                   }else{       
                   } 
                }
            }


	       var point_geometry=new gEcnu.Geometry.Point(wxy.x,wxy.y);
	       gEcnu.Edit.draw_line_points.push(point_geometry);
	       //首先执行绘制点过程，在overlay层上面
	        var line_point_style=new gEcnu.Style({cirRadius:3, opacity:1,fillColor:'#82D900',strokeColor:'#82D900',lineWeight:1});
	       map.overLayer.setStyle(line_point_style);
	       var ctx=map.overLayer._ctx;
	       gEcnu.Util.setStyle(ctx,line_point_style);
	       gEcnu.Graph.drawPoint(ctx,mxy); 
	       //执行线段绘制
	       var len=gEcnu.Edit.draw_line_points.length;
	       if(len>1){
	       	  //TODO_此时需要绘制多段线
	       	   var line_line_style=new gEcnu.Style({opacity:1,fillColor:'#82D900',strokeColor:'#118811',lineWeight:1})
	       	   map.overLayer.setStyle(line_line_style);
	           var ctx=map.overLayer._ctx;
	           gEcnu.Util.setStyle(ctx,line_line_style);
	       	   gEcnu.Graph.drawLines_geo(ctx,gEcnu.Edit.draw_line_points);
	       }
	    break;
	    case 'drawPolygon':
	        var curobj=gEcnu.DrawFeature.setting;
	        var catchable=curobj._catchable;//捕捉是否开启，bool类型
	        var catchLayer=curobj._layer;
            if(catchable){//捕捉开启
            	var returnpoint = "",returnstring="";
                var features=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
                //第一步首先判断是否捕捉到线
                /*********待优化，洗出最好获取一下视窗范围的features，减少后续的遍历*********/
                //var features=catchLayer.getScrFeatures();
                returnpoint = gEcnu.Graph.catchPoint(mxy,features);
                if (returnpoint.indexOf("true") >= 0) {//捕捉到了节点
			       var pointx = parseFloat(returnpoint.split("|")[1].split(",")[0]);
			       var pointy = parseFloat(returnpoint.split("|")[1].split(",")[1]);
			       var pointx_geo = parseFloat(returnpoint.split("|")[1].split(",")[2]);
			       var pointy_geo = parseFloat(returnpoint.split("|")[1].split(",")[3]);
			       mxy={x:pointx,y:pointy};
			       wxy={x:pointx_geo,y:pointy_geo};
                }else{
                	map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['draw'];
                	//第二步判断是否捕捉到线段
                    returnstring = gEcnu.Graph.catchLine(mxy,features);
                   if(returnstring.indexOf("true") >= 0){
                       var interX_scr = parseFloat(returnstring.split('|')[1].split(',')[0]);
					   var interY_scr  = parseFloat(returnstring.split('|')[1].split(',')[1]);
					   var interX = parseFloat(returnstring.split('|')[1].split(',')[2]);
					   var interY  = parseFloat(returnstring.split('|')[1].split(',')[3]);
					   mxy={x:interX_scr,y:interY_scr};
			           wxy={x:interX,y:interY};				   
                   }else{       
                   } 
                }
            }

	       var point_geometry=new gEcnu.Geometry.Point(wxy.x,wxy.y);
	       gEcnu.Edit.draw_polygon_points.push(point_geometry);
	       //首先执行绘制点过程，在overlay层上面
	       var poly_point_style=new gEcnu.Style({cirRadius:3, opacity:1,fillColor:'#82D900',strokeColor:'#82D900',lineWeight:1});
	       map.overLayer.setStyle(poly_point_style);
	       var ctx=map.overLayer._ctx;
	       gEcnu.Util.setStyle(ctx,poly_point_style);
	       gEcnu.Graph.drawPoint(ctx,mxy); 
	       //执行线段绘制
	       var len=gEcnu.Edit.draw_polygon_points.length;
	       if(len>1){
	       	  //TODO_此时需要绘制多段线
	       	   var line_line_style=new gEcnu.Style({opacity:1,fillColor:'#82D900',strokeColor:'#82D900',lineWeight:1})
	       	   map.overLayer.setStyle(line_line_style);
	           var ctx=map.overLayer._ctx;
	           gEcnu.Util.setStyle(ctx,line_line_style);
	       	   gEcnu.Graph.drawLines_geo(ctx,gEcnu.Edit.draw_polygon_points);
	       }   
	    break;
	    case 'selectPolygon':
	    //判断是否有按下shift键，如果按下shift键，则认为多选
            if(gEcnu.Util.ifshift(e)){ 
                var curobj=gEcnu.EditFeature.setting;
	            var catchLayer=curobj._layer;
	            var features=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
	            var len=features.length;
	            var returnfea=null;  
	            for(var i=0;i<len;i++){
	            	var ifexit=false;
	            	var linering_len=features[i]._lineRings.length;
	            	for(var j=0;j<linering_len;j++){
	            	    var tmppoints=features[i]._lineRings[j].points;
	            	    if (gEcnu.Graph.pointInPoly(wxy, tmppoints)) {
                            //将要素显示选中状态
                            var ifchoosed_muti=false;
                            var multifeas=gEcnu.Edit.multiSelectedFeatures;
                            var mltis_len=multifeas.length;
                            for(var multi_len=0;multi_len<mltis_len;multi_len++){
                            	var tmpfea_multi=multifeas[multi_len];
                            	if(tmpfea_multi==features[i]){
                            		ifchoosed_muti=true;
                                    //取消选中状态,清空overlaycanvas
                                    map.overLayer.clear();
                                    gEcnu.Edit.multiSelectedFeatures.splice(multi_len,1);                     
                                    break;
                            	}
                            }
                            if(ifchoosed_muti){
                                //执行重绘高亮功能
                                var multifeas_new=gEcnu.Edit.multiSelectedFeatures;
                                var new_mltis_len=multifeas_new.length;
                                for(var mufeaIndex=0;mufeaIndex<new_mltis_len;mufeaIndex++){
                                    multifeas_new[mufeaIndex].onSelect_ex();
                                }
                            }else{
                            	gEcnu.Edit.multiSelectedFeatures.push(features[i]);
                                features[i].onSelect_ex();
                            }
                            returnfea=features[i];
                            ifexit=true;
                            break;
	            	    }
	            	}
	            	if(ifexit) break;
	            }
	            var callback_marker=gEcnu.EditFeature.setting.events._events.multiSelected;
	            var returnFeatures=[];
	            if(returnfea!=null){
                  returnFeatures.push(returnfea);
	            }
                if(typeof callback_marker != "undefined"){
                    callback_marker(e,returnFeatures);
                }
            }else{
	            var curobj=gEcnu.EditFeature.setting;
	            var catchLayer=curobj._layer;
	            var features=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
	            var len=features.length;
	            var returnfea=null;   
	            for(var i=0;i<len;i++){
	            	var ifexit=false;
	            	var linering_len=features[i]._lineRings.length;
	            	for(var j=0;j<linering_len;j++){
	            	    var tmppoints=features[i]._lineRings[j].points; 
	            	    if (gEcnu.Graph.pointInPoly(wxy, tmppoints)) { 
                            //将要素显示选中状态
                            if(gEcnu.EditFeature.setting._reshape){
                               features[i].onSelect();//需要reshape
                            }else{
                               features[i].onSelect_ex();//需要reshape
                            } 
                            returnfea=features[i];
                            gEcnu.Edit.selectedPolygon=returnfea;
                            gEcnu.Edit.selectedPolygon_pre=returnfea;
                            //map.setMode('selectPolygon');
                            ifexit=true;
                            break;
	            	    }
	            	}
	            	if(ifexit) break;
	            }
	            var callback_marker=gEcnu.EditFeature.setting.events._events.selected;
	            var returnFeatures=[];
	            if(returnfea!=null){
                  returnFeatures.push(returnfea);
	            }
                if(typeof callback_marker != "undefined"){
                    callback_marker(e,returnFeatures);
                }
            }
	    break;
	    case 'addPoint':
	        var returnstring = "false";
	        if(gEcnu.Edit.selectedPolygon==null){return;}
	        returnstring = gEcnu.Graph.catchLine(mxy,[gEcnu.Edit.selectedPolygon]);
    	    if (returnstring.indexOf("true") >= 0) { //捕捉到了线段
                //改变鼠标样式
                var pointx_geo = parseFloat(returnstring.split("|")[1].split(",")[2]);
			    var pointy_geo = parseFloat(returnstring.split("|")[1].split(",")[3]);
			    var lineerring_index=parseFloat(returnstring.split("|")[4].split(",")[0]);
			    var linestrPoint_index=parseFloat(returnstring.split("|")[4].split(",")[1]);
			    var opeLinerRing=gEcnu.Edit.selectedPolygon._lineRings[lineerring_index];
			    var insertPoint=new gEcnu.Geometry.Point(pointx_geo,pointy_geo);
                var myindex=parseInt(linestrPoint_index)+1;
			    opeLinerRing.addPoint(insertPoint,myindex);

			    var curobj=gEcnu.EditFeature.setting;
	            var catchLayer=curobj._layer;
	            var allfeatures=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
                //遍历数组之后，将本身的多边形数据从数组中除去，以备后面捕捉使用
                var catchPolygons = [];
                for (var m = 0; m < allfeatures.length; m++) {
                    if (allfeatures[m] != gEcnu.Edit.selectedPolygon_pre) {
                        catchPolygons.push(allfeatures[m]);
                    }
                }
              

			   var opeFea=new gEcnu.Feature.Polygon(gEcnu.Edit.selectedPolygon._lineRings,gEcnu.Edit.selectedPolygon._data);
			   
			   

	            catchPolygons.push(opeFea);
	            gEcnu.Edit.selectedPolygon.shape=opeFea.shape;
	            gEcnu.Edit.selectedPolygon_pre=opeFea;
	            gEcnu.Edit.selectedPolygon=opeFea;
	            catchLayer.removeAllFeatures();
                catchLayer.addFeatures(catchPolygons);
                opeFea.onSelect();
		        map.setMode('moveNode_mouseDwon');
		        var callback_marker=gEcnu.EditFeature.setting.events._events.updateCompleted;
                if(typeof callback_marker != "undefined"){
                    callback_marker(e,opeFea);
                }
            }else{
            	//var pointx_geo = wxy.x;
			    //var pointy_geo = wxy.y;
            }
	    break;
	    case 'delPoint':
	    	var returnpoint = "false";
	        if(gEcnu.Edit.selectedPolygon==null){return;}
	        returnpoint = gEcnu.Graph.catchPoint(mxy,[gEcnu.Edit.selectedPolygon]);
    	    if (returnpoint.indexOf("true") >= 0) { //捕捉到了线段
			    var lineRing_index = parseFloat(returnpoint.split("|")[2].split(",")[0]);
			    var lineRingPoint_index = parseFloat(returnpoint.split("|")[2].split(",")[1]);
			    var opeLinerRing=gEcnu.Edit.selectedPolygon._lineRings[lineRing_index];
			    var myindex=parseInt(lineRingPoint_index);
			    opeLinerRing.delPoint(myindex);

                var curobj=gEcnu.EditFeature.setting;
	            var catchLayer=curobj._layer;
	            var allfeatures=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
                //遍历数组之后，将本身的多边形数据从数组中除去，以备后面捕捉使用
                var catchPolygons = [];
                for (var m = 0; m < allfeatures.length; m++) {
                    if (allfeatures[m] != gEcnu.Edit.selectedPolygon_pre) {
                        catchPolygons.push(allfeatures[m]);
                    }
                }  
			    var opeFea=new gEcnu.Feature.Polygon(gEcnu.Edit.selectedPolygon._lineRings,gEcnu.Edit.selectedPolygon._data);
	            catchPolygons.push(opeFea);
	            gEcnu.Edit.selectedPolygon.shape=opeFea.shape;
	            gEcnu.Edit.selectedPolygon_pre=opeFea;
	            gEcnu.Edit.selectedPolygon=opeFea;
	            catchLayer.removeAllFeatures();
                catchLayer.addFeatures(catchPolygons);
                opeFea.onSelect();
		        map.setMode('moveNode_mouseDwon');
		        var callback_marker=gEcnu.EditFeature.setting.events._events.updateCompleted;
                if(typeof callback_marker != "undefined"){
                    callback_marker(e,opeFea);
                }
            }else{
            }
	    break;
	    case 'moveNode_mouseDwon':
            map.setMode('moveNode');
	    break;
	    case 'selectLine':
	       if(gEcnu.Util.ifshift(e)){  console.log('shift');
	           	var curobj=gEcnu.EditFeature.setting;
	            var catchLayer=curobj._layer;
	            var features=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
	             //var features=catchLayer.getScrFeatures();
	            var len=features.length; 
	            var returnfea=null;
                var returnString=gEcnu.Graph.catchLine(mxy,features); 
                if(returnString.indexOf('true')>=0){
                	var linefea_index=parseFloat(returnString.split("|")[4].split(",")[2]);
                	linefea_index=parseInt(linefea_index);
                	var linefea=features[linefea_index];

                	var ifchoosed_muti=false;  
                    var multifeas=gEcnu.Edit.multiSelectedFeatures;
                    var mltis_len=multifeas.length; 
                    	for(var multi_len=0;multi_len<mltis_len;multi_len++){
                         var tmpfea_multi=multifeas[multi_len];
                         if(tmpfea_multi==linefea){
                           ifchoosed_muti=true;
                             //取消选中状态,清空overlaycanvas
                             map.overLayer.clear();
                             gEcnu.Edit.multiSelectedFeatures.splice(multi_len,1);     
                               break;
                             }
                            }
                            if(!ifchoosed_muti){
                                gEcnu.Edit.multiSelectedFeatures.push(linefea);
                            } //执行重绘高亮功能
                            var multifeas_new=gEcnu.Edit.multiSelectedFeatures;
                            var new_mltis_len=multifeas_new.length;
                            for(var mufeaIndex=0;mufeaIndex<new_mltis_len;mufeaIndex++){  multifeas_new[mufeaIndex].onSelect_ex();
                              } 
                	//linefea.onSelect_ex();
                	returnfea=linefea;
                }
                var callback_marker=gEcnu.EditFeature.setting.events._events.multiSelected;
	            var returnFeatures=[];
	            if(returnfea!=null){
                  returnFeatures.push(returnfea);
	            }
                if(typeof callback_marker != "undefined"){
                    callback_marker(e,returnFeatures);
                } 
	       }else{
	            var curobj=gEcnu.EditFeature.setting;
	            var catchLayer=curobj._layer;
	            var features=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
	             //var features=catchLayer.getScrFeatures();
	            var len=features.length; 
	            var returnfea=null;
                var returnString=gEcnu.Graph.catchLine(mxy,features);
                if(returnString.indexOf('true')>=0){
                	var linefea_index=parseFloat(returnString.split("|")[4].split(",")[2]);
                	linefea_index=parseInt(linefea_index);
                	var linefea=features[linefea_index];
                	if(gEcnu.EditFeature.setting._reshape){
                	    linefea.onSelect();
                	}else{
                		linefea.onSelect_ex();
                	}
                	returnfea=linefea;
                    gEcnu.Edit.selectedLine=returnfea;
                    gEcnu.Edit.selectedLine_pre=returnfea;
                }
                var callback_marker=gEcnu.EditFeature.setting.events._events.selected;
	            var returnFeatures=[];
	            if(returnfea!=null){
                  returnFeatures.push(returnfea);
	            }
                if(typeof callback_marker != "undefined"){
                    callback_marker(e,returnFeatures);
                }   
            }   
	    break;
	    case 'moveNodeLine_mouseDwon':
	        map.setMode('moveNode_Line');
	    break;
	    case 'addPoint_line':
	    	var returnstring = "false";
	        if(gEcnu.Edit.selectedLine==null){return;}
	        returnstring = gEcnu.Graph.catchLine(mxy,[gEcnu.Edit.selectedLine]);
    	    if (returnstring.indexOf("true") >= 0) { //捕捉到了线段
                //改变鼠标样式
                var pointx_geo = parseFloat(returnstring.split("|")[1].split(",")[2]);
			    var pointy_geo = parseFloat(returnstring.split("|")[1].split(",")[3]);
			    var lineerring_index=parseFloat(returnstring.split("|")[4].split(",")[0]);
			    var linestrPoint_index=parseFloat(returnstring.split("|")[4].split(",")[1]);
			    var opeLinerRing=gEcnu.Edit.selectedLine._lineStrings[lineerring_index];
			    var insertPoint=new gEcnu.Geometry.Point(pointx_geo,pointy_geo);
                var myindex=parseInt(linestrPoint_index)+1;
			    opeLinerRing.addPoint(insertPoint,myindex);

			    var curobj=gEcnu.EditFeature.setting;
	            var catchLayer=curobj._layer;
	            var allfeatures=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
                //遍历数组之后，将本身的多边形数据从数组中除去，以备后面捕捉使用
                var catchPolygons = [];
                for (var m = 0; m < allfeatures.length; m++) {
                    if (allfeatures[m] != gEcnu.Edit.selectedLine_pre) {
                        catchPolygons.push(allfeatures[m]);
                    }
                }

			    var opeFea=new gEcnu.Feature.Polyline(gEcnu.Edit.selectedLine._lineStrings,gEcnu.Edit.selectedLine._data);
	            catchPolygons.push(opeFea);
	            gEcnu.Edit.selectedLine.shape=opeFea.shape;
	            gEcnu.Edit.selectedLine_pre=opeFea;
	            gEcnu.Edit.selectedLine=opeFea;
	            catchLayer.removeAllFeatures();
                catchLayer.addFeatures(catchPolygons);
                opeFea.onSelect();
		        map.setMode('moveNodeLine_mouseDwon');
		        var callback_marker=gEcnu.EditFeature.setting.events._events.updateCompleted;
                if(typeof callback_marker != "undefined"){
                    callback_marker(e,opeFea);
                }
            }else{
            	//var pointx_geo = wxy.x;
			    //var pointy_geo = wxy.y;
            }
	    break;
	    case 'delPoint_line':
	    	var returnpoint = "false";
	        if(gEcnu.Edit.selectedLine==null){return;}
	        returnpoint = gEcnu.Graph.catchPoint(mxy,[gEcnu.Edit.selectedLine]);
    	    if (returnpoint.indexOf("true") >= 0) { //捕捉到了线段
			    var lineRing_index = parseFloat(returnpoint.split("|")[2].split(",")[0]);
			    var lineRingPoint_index = parseFloat(returnpoint.split("|")[2].split(",")[1]);
			    var opeLinerRing=gEcnu.Edit.selectedLine._lineStrings[lineRing_index];
			    var myindex=parseInt(lineRingPoint_index);
			    opeLinerRing.delPoint(myindex);

                var curobj=gEcnu.EditFeature.setting;
	            var catchLayer=curobj._layer;
	            var allfeatures=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
                //遍历数组之后，将本身的多边形数据从数组中除去，以备后面捕捉使用
                var catchPolygons = [];
                for (var m = 0; m < allfeatures.length; m++) {
                    if (allfeatures[m] != gEcnu.Edit.selectedLine_pre) {
                        catchPolygons.push(allfeatures[m]);
                    }
                }
			    var opeFea=new gEcnu.Feature.Polyline(gEcnu.Edit.selectedLine._lineStrings,gEcnu.Edit.selectedLine._data);
	            catchPolygons.push(opeFea);
	            gEcnu.Edit.selectedLine.shape=opeFea.shape;
	            gEcnu.Edit.selectedLine_pre=opeFea;
	            gEcnu.Edit.selectedLine=opeFea;
	            catchLayer.removeAllFeatures();
                catchLayer.addFeatures(catchPolygons);
                opeFea.onSelect();
		        map.setMode('moveNodeLine_mouseDwon');
		        var callback_marker=gEcnu.EditFeature.setting.events._events.updateCompleted;
                if(typeof callback_marker != "undefined"){
                    callback_marker(e,opeFea);
                }
            }else{
            }
	    break;
	    case "selectPoint":  
	            var curobj=gEcnu.EditFeature.setting;
	            var catchLayer=curobj._layer;
	            var features=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
	             //var features=catchLayer.getScrFeatures();
	            var len=features.length;   
	            var returnfea=null;
	            for(var i=0;i<len;i++){  //判断选中的元素
	            	var curfea=features[i];  
	            	var curfea_ptlen=curfea.shape.NumPoints; 
	            	for(var j=0;j<curfea_ptlen;j++){ 
	            		//var dis=Math.sqrt((wxy.x-curfea.shape.Points[j].X)*(wxy.x-curfea.shape.Points[j].X)+(wxy.y-curfea.shape.Points[j].Y)*(wxy.y-curfea.shape.Points[j].Y));
	            	  var screenxy=gEcnu.Util.worldToScreen(curfea.shape.Points[j].X,curfea.shape.Points[j].Y);
	            	  var dis=Math.sqrt((screenxy.x-mxy.x)*(screenxy.x-mxy.x)+(screenxy.y-mxy.y)*(screenxy.y-mxy.y));
	            	  if(dis<5){
	            	     returnfea=curfea;
	            	     //returnfea.onSelect();
	            	     break;
	            	  }	
	            	}
	              }
                if(!returnfea){ return;} //未选中要素
	            if(gEcnu.Util.ifshift(e)){ //按下shift键进行多选
                    var ifchoosed_muti=false;  
                    var multifeas=gEcnu.Edit.multiSelectedFeatures;
                    var mltis_len=multifeas.length; 
                    	for(var multi_len=0;multi_len<mltis_len;multi_len++){
                         var tmpfea_multi=multifeas[multi_len];
                         if(tmpfea_multi==returnfea){
                           ifchoosed_muti=true;
                             //取消选中状态,清空overlaycanvas
                             map.overLayer.clear();
                             gEcnu.Edit.multiSelectedFeatures.splice(multi_len,1);     
                               break;
                             }
                            }
                            if(!ifchoosed_muti){
                                gEcnu.Edit.multiSelectedFeatures.push(returnfea);
                            } //执行重绘高亮功能
                            var multifeas_new=gEcnu.Edit.multiSelectedFeatures;
                            var new_mltis_len=multifeas_new.length;
                            for(var mufeaIndex=0;mufeaIndex<new_mltis_len;mufeaIndex++){  multifeas_new[mufeaIndex].onSelect();
                              } 
                            var callback_multi=gEcnu.EditFeature.setting.events._events.multiSelected;  
                            var returnFeatures=[];
	                         if(returnfea!=null){
                               returnFeatures.push(returnfea);
	                         }
                            if(typeof callback_multi != "undefined"){
                               callback_multi(e,returnFeatures);
                             }
	              }else{  //单选
	                if(returnfea){
	            	gEcnu.Edit.selectedPoint=returnfea;
	            	returnfea.onSelect();
	               }
	               var callback_marker=gEcnu.EditFeature.setting.events._events.selected;
	               var returnFeatures=[];
	               if(returnfea!=null){
                     returnFeatures.push(returnfea);
	               }
                   if(typeof callback_marker != "undefined"){
                    callback_marker(e,returnFeatures);
                   }
	            }
	    break;
	    case "selectText":
	        var curobj=gEcnu.EditFeature.setting;
	        var catchLayer=curobj._layer;
	        var texts=catchLayer.getTextsInWindow();
            var len=texts.length;   
	        var returntext=null;
	        for(var i=0;i<len;i++){  //判断选中的元素
	        	var curtext=texts[i];
	        	if(mxy.x>=curtext.boxScrSize.xmin&&mxy.x<=curtext.boxScrSize.xmax&&mxy.y>=curtext.boxScrSize.ymin&&mxy.y<=curtext.boxScrSize.ymax){
                   returntext=curtext;
	        	   break;
	        	}  
	        }
	        var callback_marker=gEcnu.EditFeature.setting.events._events.selected;
	        var returnTexts=[];
	        if(returntext!=null){
              returnTexts.push(returntext);
	        }
            if(typeof callback_marker != "undefined"){
              callback_marker(e,returnTexts);
            }
	    break;
	    case "drawRect":
	    var geometry_pt=new gEcnu.Geometry.Point(wxy.x,wxy.y);
	    gEcnu.Edit.draw_rect_points.push(geometry_pt);
	    break;
	    case "drawCircle":
	    /*if(gEcnu.Edit.draw_circle_points.length>0){ // 双击结束时 触发mousedown事件，圆心半径以确定，绘制结束
	    	gEcnu.Edit.drawCircleEnd=true;
	    }else{
	    	gSelf.overLayer.clear();
	    	gEcnu.Edit.drawCircleEnd=false;  //重新绘制新的圆
	    }
	    var geometry_pt=new gEcnu.Geometry.Point(wxy.x,wxy.y); 
	    gEcnu.Edit.draw_circle_points.push(geometry_pt);*/   //2015-7-3 注释掉 by lc 绘制圆改为mouseup触发
	     gEcnu.Edit.draw_circle_points = [];
	    var geometry_pt=new gEcnu.Geometry.Point(wxy.x,wxy.y); 
	    gEcnu.Edit.draw_circle_points.push(geometry_pt);
	    break;
	    case 'drawText':
		    var callback_marker=gEcnu.DrawFeature.setting.events._events.added;
            if(typeof callback_marker != "undefined"){
                callback_marker(e);
            }
		break;
    }
};
/**
 * 地图浏览操作外的mousemove响应函数
 * @param e
 * @param map
 */
gEcnu.Edit.graphMouseMoveEvt = function (e, map) {
    var mode = map.getMode();
	var mxy = gEcnu.Util.getMouseXY(gSelf._container,e);
	gEcnu.Edit.NowPoint=mxy;
	var ctx = map.overLayer.getCtx();
	switch (mode) {
	    case 'drawLine':
	        var ptArr =gEcnu.Edit.draw_line_points;
	        var len = ptArr.length;
	        var curobj=gEcnu.DrawFeature.setting;
	        var catchable=curobj._catchable;//捕捉是否开启，bool类型
	        var catchLayer=curobj._layer;
	        map.overLayer.clear();
	        map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['draw'];
	        if(catchable){//捕捉开启
            	var returnpoint = "",returnstring = "";
                var features=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
                //第一步首先判断是否捕捉到线
                /*********待优化，洗出最好获取一下视窗范围的features，减少后续的遍历*********/
                //var features=catchLayer.getScrFeatures();
                returnpoint = gEcnu.Graph.catchPoint(mxy,features);
                if (returnpoint.indexOf("true") >= 0) {//捕捉到了节点
                   map.overLayer.clear();
                   map.mLayer.getLayerContainer().style.cursor = "crosshair";
			       var pointx = parseFloat(returnpoint.split("|")[1].split(",")[0]);
			       var pointy = parseFloat(returnpoint.split("|")[1].split(",")[1]);
			       mxy={x:pointx,y:pointy};
			       var line_point_style=new gEcnu.Style({cirRadius:3, opacity:1,fillColor:'red',strokeColor:'red',lineWeight:2});
	               map.overLayer.setStyle(line_point_style);
	               var ctx=map.overLayer._ctx;
	               gEcnu.Util.setStyle(ctx,line_point_style);
			       gEcnu.Graph.drawPoint(ctx,mxy);
                }else{
                //	map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['draw'];
                	//第二步判断是否捕捉到线段
                    returnstring = gEcnu.Graph.catchLine(mxy,features);
                   if(returnstring.indexOf("true") >= 0){
                       var startx = parseFloat(returnstring.split('|')[2].split(',')[0]);
					   var starty = parseFloat(returnstring.split('|')[2].split(',')[1]);
					   var endx = parseFloat(returnstring.split('|')[3].split(',')[0]);
					   var endy = parseFloat(returnstring.split('|')[3].split(',')[1]);
					   var pt1 = {x:startx, y:starty};
					   var pt2 = {x:endx, y:endy};
					   var line_point_style=new gEcnu.Style({cirRadius:3, opacity:1,fillColor:'red',strokeColor:'red',lineWeight:2});
	                   map.overLayer.setStyle(line_point_style);
	                   var ctx=map.overLayer._ctx;
	                   gEcnu.Util.setStyle(ctx,line_point_style);
					   gEcnu.Graph.drawLine(ctx, pt1, pt2);
                   }else{       
                   }     
                }
            } 
	        if (len >= 1) {
			    //map.overLayer.clear();
	            var line_point_style=new gEcnu.Style({opacity:1,fillColor:'#82D900',strokeColor:'#82D900',lineWeight:1});
	            map.overLayer.setStyle(line_point_style);
	            var ctx=map.overLayer._ctx;
	            gEcnu.Util.setStyle(ctx,line_point_style);
			    var sxy = gEcnu.Util.worldToScreen(ptArr[len - 1].x, ptArr[len - 1].y);
			    gEcnu.Graph.drawLine(ctx, sxy, mxy);
			    gEcnu.Graph.drawLines_geo(ctx, ptArr);
		    }
		    //绘制端点集合
		    gEcnu.Graph.drawPoints_geo(ctx,ptArr);
	    break;
	    case 'drawPolygon':
	        var ptArr =gEcnu.Edit.draw_polygon_points;
	        var len = ptArr.length;
	        var curobj=gEcnu.DrawFeature.setting;
	        var catchable=curobj._catchable;//捕捉是否开启，bool类型
	        var catchLayer=curobj._layer;
	        map.overLayer.clear();
            map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['draw'];
            if(catchable){//捕捉开启
            	var returnpoint = "",returnstring = "";
                var features=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
                //第一步首先判断是否捕捉到线
                /*********待优化，洗出最好获取一下视窗范围的features，减少后续的遍历*********/
                //var features=catchLayer.getScrFeatures();
                returnpoint = gEcnu.Graph.catchPoint(mxy,features);
                if (returnpoint.indexOf("true") >= 0) {//捕捉到了节点
                   map.overLayer.clear();
                   map.mLayer.getLayerContainer().style.cursor = "crosshair";
			       var pointx = parseFloat(returnpoint.split("|")[1].split(",")[0]);
			       var pointy = parseFloat(returnpoint.split("|")[1].split(",")[1]);
			       mxy={x:pointx,y:pointy};
			       var line_point_style=new gEcnu.Style({cirRadius:3, opacity:1,fillColor:'red',strokeColor:'red',lineWeight:2});
	               map.overLayer.setStyle(line_point_style);
	               var ctx=map.overLayer._ctx;
	               gEcnu.Util.setStyle(ctx,line_point_style);
			       gEcnu.Graph.drawPoint(ctx,mxy);
                }else{
                //	map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['draw'];
                	//第二步判断是否捕捉到线段
                    returnstring = gEcnu.Graph.catchLine(mxy,features);
                   if(returnstring.indexOf("true") >= 0){
                       var startx = parseFloat(returnstring.split('|')[2].split(',')[0]);
					   var starty = parseFloat(returnstring.split('|')[2].split(',')[1]);
					   var endx = parseFloat(returnstring.split('|')[3].split(',')[0]);
					   var endy = parseFloat(returnstring.split('|')[3].split(',')[1]);
					   var pt1 = {x:startx, y:starty};
					   var pt2 = {x:endx, y:endy};
					   var line_point_style=new gEcnu.Style({cirRadius:3, opacity:1,fillColor:'red',strokeColor:'red',lineWeight:2});
	                   map.overLayer.setStyle(line_point_style);
	                   var ctx=map.overLayer._ctx;
	                   gEcnu.Util.setStyle(ctx,line_point_style);
					   gEcnu.Graph.drawLine(ctx, pt1, pt2);
                   }else{       
                   }     
                }
            }     
	        if (len >= 1) {
			    //map.overLayer.clear();
			    var line_point_style=new gEcnu.Style({opacity:1,fillColor:'#82D900',strokeColor:'#82D900',lineWeight:1});
	            map.overLayer.setStyle(line_point_style);
	            var ctx=map.overLayer._ctx;
	            gEcnu.Util.setStyle(ctx,line_point_style);
			    var sxy = gEcnu.Util.worldToScreen(ptArr[len - 1].x, ptArr[len - 1].y);
			    gEcnu.Graph.drawLine(ctx, sxy, mxy);
			    if(len>=2){
                   var sxy_fir = gEcnu.Util.worldToScreen(ptArr[0].x, ptArr[0].y);
			       gEcnu.Graph.drawLine(ctx, sxy_fir, mxy);
			    }
			    gEcnu.Graph.drawLines_geo(ctx, ptArr);
			    if (returnpoint.indexOf("true") >= 0) {
			    	gEcnu.Graph.drawPoint(ctx,mxy);
			    }
		    }
		    //绘制端点集合
		    gEcnu.Graph.drawPoints_geo(ctx,ptArr);
	    break;
	    case 'moveNode_mouseDwon':
	    case 'selectPolygon':
	        map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['select'];
	        if(gEcnu.Edit.selectedPolygon!=null&&gEcnu.EditFeature.setting._reshape){
	      	    map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['select'];
	      	    var thislen=gEcnu.Edit.selectedPolygon._lineRings.length;
	      	    for(var m=0;m<thislen;m++){
                    var tmppoints=gEcnu.Edit.selectedPolygon._lineRings[m].points;
                    var tmppoints_len=tmppoints.length;
                    for(var j=0;j<tmppoints_len;j++){
                    	var thispoint=gEcnu.Util.worldToScreen(tmppoints[j].x, tmppoints[j].y);
                        var dis=Math.sqrt((mxy.x-thispoint.x)*(mxy.x-thispoint.x)+(mxy.y-thispoint.y)*(mxy.y-thispoint.y));
                        if(dis<5){ 
                        	gEcnu.Edit.Poly_selPoint_index=j;
                        	gEcnu.Edit.Poly_sellineRing_index=m;
                            map.mLayer.getLayerContainer().style.cursor = "move";
                            map.setMode('moveNode_mouseDwon');return;
                        }
                    }
                }
	      }
	      map.setMode('selectPolygon');
	    break;
	    case 'moveNode':
	        if (gEcnu.Edit.Poly_selPoint_index!=-1) {
    	         var opePolygon=gEcnu.Edit.selectedPolygon;
    	         var opeVtx=opePolygon._lineRings[gEcnu.Edit.Poly_sellineRing_index].points[gEcnu.Edit.Poly_selPoint_index];
    	         var opepoint_len=opePolygon._lineRings[gEcnu.Edit.Poly_sellineRing_index].points.length;
    	         var opelastPoint=opePolygon._lineRings[gEcnu.Edit.Poly_sellineRing_index].points[opepoint_len-1];
    	         var curobj=gEcnu.EditFeature.setting;
	             var catchable=curobj._catchable;//捕捉是否开启，bool类型
	             var catchLayer=curobj._layer;
                 map.overLayer.clear();
                   
	             if(catchable){//捕捉开启
	                 var allfeatures=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
	                // var allfeatures=catchLayer.getScrFeatures();
                     //遍历数组之后，将本身的多边形数据从数组中除去，以备后面捕捉使用
                     var catchPolygons = new Array();
                     for (var m = 0; m < allfeatures.length; m++) {
                         if (allfeatures[m] != opePolygon) {
                             catchPolygons.push(allfeatures[m]);
                         }
                     }
                     var returnpoint =gEcnu.Graph.catchPoint(mxy,catchPolygons);
                     if (returnpoint.indexOf("true") >= 0) {
                         //如果捕捉到顶点，则鼠标形状显示为十字丝形状
                         map.mLayer.getLayerContainer().style.cursor = "crosshair";
                         var pointx = parseFloat(returnpoint.split("|")[1].split(",")[0]);
			             var pointy = parseFloat(returnpoint.split("|")[1].split(",")[1]);
			             mxy={x:pointx,y:pointy}; 
			             opeVtx.x=parseFloat(returnpoint.split("|")[1].split(",")[2]);
			             opeVtx.y=parseFloat(returnpoint.split("|")[1].split(",")[3]);
			             if(gEcnu.Edit.Poly_selPoint_index==0){
			             	opelastPoint.x=opeVtx.x;
			             	opelastPoint.y=opeVtx.y;
			             	
			             }
                         var ctx=map.overLayer._ctx;
			             gEcnu.Graph.drawPoint(ctx,mxy);
                     }else {
                          map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['select'];
                         //捕捉线段
                         var returnstring = gEcnu.Graph.catchLine(mxy,catchPolygons);;
                         if (returnstring.indexOf("true") >= 0) {
                         	map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['select'];
                             var startx = parseFloat(returnstring.split('|')[2].split(',')[0]);
                             var starty = parseFloat(returnstring.split('|')[2].split(',')[1]);
                             var endx = parseFloat(returnstring.split('|')[3].split(',')[0]);
                             var endy = parseFloat(returnstring.split('|')[3].split(',')[1]);
                             var pt1 = {x:startx, y:starty};
					         var pt2 = {x:endx, y:endy};
					         opeVtx.x=parseFloat(returnstring.split("|")[1].split(",")[2]);
			                 opeVtx.y=parseFloat(returnstring.split("|")[1].split(",")[3]);
			                 if(gEcnu.Edit.Poly_selPoint_index==0){
			                 	opelastPoint.x=opeVtx.x;
			                 	opelastPoint.y=opeVtx.y;
			                 }
					         var ctx=map.overLayer._ctx;
					         gEcnu.Graph.drawLine(ctx, pt1, pt2);
                         }else{
                         	 map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['select'];
                         	 //既没有捕捉到点有没有捕捉到线
                         	 var pt2 = gEcnu.Util.screenToWorld(mxy.x, mxy.y);
                             opeVtx.x= pt2.x;
                             opeVtx.y= pt2.y;
                             if(gEcnu.Edit.Poly_selPoint_index==0){
			                 	opelastPoint.x=opeVtx.x;
			                 	opelastPoint.y=opeVtx.y;
			                 }
                         }
                     }
                     var ctx = map.overLayer._ctx;
                     var poly_point_style=new gEcnu.Style({opacity:1,fillColor:'#82D900',strokeColor:'#82D900',lineWeight:1});
	                 map.overLayer.setStyle(poly_point_style);
	                 gEcnu.Util.setStyle(ctx,poly_point_style);
                     gEcnu.Graph.drawPoints_geo(ctx,opePolygon._lineRings[gEcnu.Edit.Poly_sellineRing_index].points);
                     var poly_line_style=new gEcnu.Style({opacity:1,fillColor:'red',strokeColor:'red',lineWeight:1});
	                 map.overLayer.setStyle(poly_line_style);
	                 gEcnu.Util.setStyle(ctx,poly_line_style);
                     gEcnu.Graph.drawLines_geo(ctx,opePolygon._lineRings[gEcnu.Edit.Poly_sellineRing_index].points);
                }else{
                	map.mLayer.getLayerContainer().style.cursor = "pointer";
                    //既没有捕捉到点有没有捕捉到线
                    var pt2 = gEcnu.Util.screenToWorld(mxy.x, mxy.y);
                    opeVtx.x= pt2.x;
                    opeVtx.y= pt2.y;
                    if(gEcnu.Edit.Poly_selPoint_index==0){
			        	opelastPoint.x=opeVtx.x;
			        	opelastPoint.y=opeVtx.y;
			        }
                    var ctx = map.overLayer._ctx;
                    var poly_point_style=new gEcnu.Style({opacity:1,fillColor:'#82D900',strokeColor:'#82D900',lineWeight:1});
	                map.overLayer.setStyle(poly_point_style);
	                gEcnu.Util.setStyle(ctx,poly_point_style);
                    gEcnu.Graph.drawPoints_geo(ctx,opePolygon._lineRings[gEcnu.Edit.Poly_sellineRing_index].points);
                    var poly_line_style=new gEcnu.Style({opacity:1,fillColor:'red',strokeColor:'red',lineWeight:1});
	                map.overLayer.setStyle(poly_line_style);
	                gEcnu.Util.setStyle(ctx,poly_line_style);
                    gEcnu.Graph.drawLines_geo(ctx,opePolygon._lineRings[gEcnu.Edit.Poly_sellineRing_index].points);
                }
            }
	    break;
	    case 'addPoint':
	        var returnstring = "false";
	        if(gEcnu.Edit.selectedPolygon==null){return;}
	        returnstring = gEcnu.Graph.catchLine(mxy,[gEcnu.Edit.selectedPolygon]);
    	    if (returnstring.indexOf("true") >= 0) { //捕捉到了线段
                //改变鼠标样式
                map.mLayer.getLayerContainer().style.cursor = "crosshair";
                var interX_scr = parseFloat(returnstring.split('|')[1].split(',')[0]);
			    var interY_scr  = parseFloat(returnstring.split('|')[1].split(',')[1]);
			    var ctx=map.overLayer._ctx;
	            gEcnu.Edit.selectedPolygon.onSelect();
	            var line_point_style=new gEcnu.Style({opacity:1,fillColor:'red',strokeColor:'red',lineWeight:1});
	            map.overLayer.setStyle(line_point_style);
	            gEcnu.Util.setStyle(ctx,line_point_style);
			    gEcnu.Graph.drawPoint(ctx,{x:interX_scr,y:interY_scr});
              return;
            }else{
            	 map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['select'];
            	 gEcnu.Edit.selectedPolygon.onSelect();
            }
	    break;
	    case 'delPoint':
	      	var returnpoint = "false";
	        if(gEcnu.Edit.selectedPolygon==null){return;}
	        returnpoint = gEcnu.Graph.catchPoint(mxy,[gEcnu.Edit.selectedPolygon]);
    	    if (returnpoint.indexOf("true") >= 0) { //捕捉到了线段
                //改变鼠标样式
                map.mLayer.getLayerContainer().style.cursor = "pointer";
                var pointx = parseFloat(returnpoint.split("|")[1].split(",")[0]);
			    var pointy = parseFloat(returnpoint.split("|")[1].split(",")[1]);
			    var ctx=map.overLayer._ctx;
	            gEcnu.Edit.selectedPolygon.onSelect();
	            var line_point_style=new gEcnu.Style({opacity:1,fillColor:'red',strokeColor:'red',lineWeight:1});
	            map.overLayer.setStyle(line_point_style);
	            gEcnu.Util.setStyle(ctx,line_point_style);
			    gEcnu.Graph.drawPoint(ctx,{x:pointx,y:pointy});
              return;
            }else{
            	 map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['select'];
            	 gEcnu.Edit.selectedPolygon.onSelect();
            }
	    break;
	    case 'moveNodeLine_mouseDwon':
	    case 'selectLine':
	    	map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['select'];
	        if(gEcnu.Edit.selectedLine!=null&&gEcnu.EditFeature.setting._reshape){
	      	    map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['select'];
	      	    var thislen=gEcnu.Edit.selectedLine._lineStrings.length;
	      	    for(var m=0;m<thislen;m++){
                    var tmppoints=gEcnu.Edit.selectedLine._lineStrings[m].points;
                    var tmppoints_len=tmppoints.length;
                    for(var j=0;j<tmppoints_len;j++){
                    	var thispoint=gEcnu.Util.worldToScreen(tmppoints[j].x, tmppoints[j].y);
                        var dis=Math.sqrt((mxy.x-thispoint.x)*(mxy.x-thispoint.x)+(mxy.y-thispoint.y)*(mxy.y-thispoint.y));
                        if(dis<5){ 
                        	gEcnu.Edit.Line_sellineString_index=m;//选中的线要素的的线环下标值
                            gEcnu.Edit.Line_selPoint_index=j;//选中的线要素的编辑节点的下标值
                            map.mLayer.getLayerContainer().style.cursor = "move";
                            map.setMode('moveNodeLine_mouseDwon');return;
                        }
                    }
                }
	      }
	      map.setMode('selectLine');
	    break;
	    case "selectPoint":
	    case "selectText":
	      map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['select'];
	    break;
	    case 'moveNode_Line':
	        if (gEcnu.Edit.Line_selPoint_index!=-1) {
    	       var opeLine=gEcnu.Edit.selectedLine;
    	       var opeVtx=opeLine._lineStrings[gEcnu.Edit.Line_sellineString_index].points[gEcnu.Edit.Line_selPoint_index];
    	       var curobj=gEcnu.EditFeature.setting;
	           var catchable=curobj._catchable;//捕捉是否开启，bool类型
	           var catchLayer=curobj._layer;
               map.overLayer.clear();
	           if(catchable){//捕捉开启
	               var allfeatures=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
	                //var allfeatures=catchLayer.getScrFeatures();
                   //遍历数组之后，将本身的多边形数据从数组中除去，以备后面捕捉使用
                   var catchPolygons = new Array();
                   for (var m = 0; m < allfeatures.length; m++) {
                       if (allfeatures[m] != opeLine) {
                           catchPolygons.push(allfeatures[m]);
                       }
                   }
                   var returnpoint =gEcnu.Graph.catchPoint(mxy,catchPolygons);
                   if (returnpoint.indexOf("true") >= 0) {
                       //如果捕捉到顶点，则鼠标形状显示为十字丝形状
                       map.mLayer.getLayerContainer().style.cursor = "crosshair";
                       var pointx = parseFloat(returnpoint.split("|")[1].split(",")[0]);
		            var pointy = parseFloat(returnpoint.split("|")[1].split(",")[1]);
		            mxy={x:pointx,y:pointy}; 
		            opeVtx.x=parseFloat(returnpoint.split("|")[1].split(",")[2]);
		            opeVtx.y=parseFloat(returnpoint.split("|")[1].split(",")[3]);
                       var ctx=map.overLayer._ctx;
		            gEcnu.Graph.drawPoint(ctx,mxy);
                   }else {
                        map.mLayer.getLayerContainer().style.cursor = "move";
                       //捕捉线段
                       var returnstring = gEcnu.Graph.catchLine(mxy,catchPolygons);;
                       if (returnstring.indexOf("true") >= 0) {
                       	map.mLayer.getLayerContainer().style.cursor = "default";
                           var startx = parseFloat(returnstring.split('|')[2].split(',')[0]);
                           var starty = parseFloat(returnstring.split('|')[2].split(',')[1]);
                           var endx = parseFloat(returnstring.split('|')[3].split(',')[0]);
                           var endy = parseFloat(returnstring.split('|')[3].split(',')[1]);
                           var pt1 = {x:startx, y:starty}; 	         
                           var pt2 = {x:endx, y:endy}; 	        
                            opeVtx.x=parseFloat(returnstring.split("|")[1].split(",")[2]);
		                    opeVtx.y=parseFloat(returnstring.split("|")[1].split(",")[3]); 	       
		                    var ctx=map.overLayer._ctx; 	         
		                    gEcnu.Graph.drawLine(ctx, pt1, pt2);
                       }else{
                       	 map.mLayer.getLayerContainer().style.cursor = "move";
                       	 //既没有捕捉到点有没有捕捉到线
                       	 var pt2 = gEcnu.Util.screenToWorld(mxy.x, mxy.y);
                           opeVtx.x= pt2.x;
                           opeVtx.y= pt2.y;
                       }
                   }
                   var ctx = map.overLayer._ctx;
                   gEcnu.Graph.drawPoints_geo(ctx,opeLine._lineStrings[gEcnu.Edit.Line_sellineString_index].points);
                   gEcnu.Graph.drawLines_geo(ctx,opeLine._lineStrings[gEcnu.Edit.Line_sellineString_index].points);
              }else{
              	map.mLayer.getLayerContainer().style.cursor = "pointer";
                  //既没有捕捉到点有没有捕捉到线
                  var pt2 = gEcnu.Util.screenToWorld(mxy.x, mxy.y);
                  opeVtx.x= pt2.x;
                  opeVtx.y= pt2.y;
                  var ctx = map.overLayer._ctx;
                  gEcnu.Graph.drawPoints_geo(ctx,opeLine._lineStrings[gEcnu.Edit.Line_sellineString_index].points);
                  gEcnu.Graph.drawLines_geo(ctx,opeLine._lineStrings[gEcnu.Edit.Line_sellineString_index].points);
                  }
            }
	    break;
	    case 'addPoint_line':
	        var returnstring = "false";
	        if(gEcnu.Edit.selectedLine==null){return;}
	        returnstring = gEcnu.Graph.catchLine(mxy,[gEcnu.Edit.selectedLine]);
    	    if (returnstring.indexOf("true") >= 0) { //捕捉到了线段
                //改变鼠标样式
                map.mLayer.getLayerContainer().style.cursor = "crosshair";
                var interX_scr = parseFloat(returnstring.split('|')[1].split(',')[0]);
			    var interY_scr  = parseFloat(returnstring.split('|')[1].split(',')[1]);
			    var ctx=map.overLayer._ctx;
	            gEcnu.Edit.selectedLine.onSelect();
	            var line_point_style=new gEcnu.Style({opacity:1,fillColor:'red',strokeColor:'red',lineWeight:1});
	            map.overLayer.setStyle(line_point_style);
	            gEcnu.Util.setStyle(ctx,line_point_style);
			    gEcnu.Graph.drawPoint(ctx,{x:interX_scr,y:interY_scr});
              return;
            }else{
            	 map.mLayer.getLayerContainer().style.cursor = "default";
            	 gEcnu.Edit.selectedLine.onSelect();
            }
	    break;
	    case 'delPoint_line':
	      	var returnpoint = "false";
	        if(gEcnu.Edit.selectedLine==null){return;}
	        returnpoint = gEcnu.Graph.catchPoint(mxy,[gEcnu.Edit.selectedLine]);
    	    if (returnpoint.indexOf("true") >= 0) { //捕捉到了线段
                //改变鼠标样式
                map.mLayer.getLayerContainer().style.cursor = "pointer";
                var pointx = parseFloat(returnpoint.split("|")[1].split(",")[0]);
			    var pointy = parseFloat(returnpoint.split("|")[1].split(",")[1]);
			    var ctx=map.overLayer._ctx;
	            gEcnu.Edit.selectedLine.onSelect();
	            var line_point_style=new gEcnu.Style({opacity:1,fillColor:'red',strokeColor:'red',lineWeight:1});
	            map.overLayer.setStyle(line_point_style);
	            gEcnu.Util.setStyle(ctx,line_point_style);
			    gEcnu.Graph.drawPoint(ctx,{x:pointx,y:pointy});
              return;
            }else{
            	 map.mLayer.getLayerContainer().style.cursor = "default";
            	 gEcnu.Edit.selectedLine.onSelect();
            }
	    break;
	    case "drawRect":
        map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['draw'];
	    var wxy = gEcnu.Util.screenToWorld(mxy.x, mxy.y);
	    var geometry_pt=new gEcnu.Geometry.Point(wxy.x,wxy.y);
	    if(gEcnu.Edit.draw_rect_points.length>0){
	    gSelf.overLayer.clear();
	    var ctx=gSelf.overLayer.getCtx();
	    ctx.strokeStyle="red";
	    var w=mxy.x-gSelf.startX;
	    var h=mxy.y-gSelf.startY;
	    ctx.strokeRect(gSelf.startX,gSelf.startY,w,h);
	    }
	    break;
	    case "drawCircle":
       map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['draw'];
	    var wxy = gEcnu.Util.screenToWorld(mxy.x, mxy.y);
	    var geometry_pt=new gEcnu.Geometry.Point(wxy.x,wxy.y);
	    if(gEcnu.Edit.draw_circle_points.length>0){
	    //if(gEcnu.Edit.drawCircleEnd){ return;}  //绘制圆结束,不清除
	    gSelf.overLayer.clear();
	    var ctx=gSelf.overLayer.getCtx();
	    ctx.strokeStyle="red";
	    ctx.beginPath();
	    var radius=Math.sqrt((mxy.x-gSelf.startX)*(mxy.x-gSelf.startX)+(mxy.y-gSelf.startY)*(mxy.y-gSelf.startY));
	    ctx.arc(gSelf.startX,gSelf.startY,radius,0,Math.PI*2,true); 
	    ctx.stroke();

	    //显示半径
	    ctx.closePath();
	    var isDisplay = gEcnu.DrawFeature.setting.isDisplayRadius;
	    if(isDisplay){
	    	ctx.beginPath();
	    	ctx.moveTo(gSelf.startX,gSelf.startY);
	    	ctx.lineTo(mxy.x,mxy.y);
	    	ctx.stroke();
	    	var wxy0 = gEcnu.Util.screenToWorld_geo(mxy.x,mxy.y);
	    	var wxy1 = gEcnu.Util.screenToWorld_geo(gSelf.startX,gSelf.startY);
	    	var dis = Math.sqrt((wxy1.x-wxy0.x)*(wxy1.x-wxy0.x)+(wxy1.y-wxy0.y)*(wxy1.y-wxy0.y)); 
	    	var center_x = (mxy.x+gSelf.startX)/2;
	    	var center_y = (mxy.y+gSelf.startY)/2;
	    	ctx.fillStyle='red';
	    	ctx.font="14px Arial";
	    	var txt = Number(dis).toFixed(0)+'米';
	    	if(parseInt(dis/1000)>0){
	    		txt = (dis/1000).toFixed(0)+'千米';
	    	}
	    	ctx.fillText(txt,center_x-50,center_y-10);  	
	    }
	    }


	    break;
	    case 'drawMarker':
	        map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['mark'];
	    break;
	    case 'drawPoint':
	        map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['draw'];
	    break;
	    case 'drawText':
	        map.mLayer.getLayerContainer().style.cursor = map.cursorStyle['draw'];
	    break;
    }
};
/**
 * 地图浏览操作外的mousee响应函数
 * @param e
 * @param map
 */
gEcnu.Edit.graphMouseUpEvt=function(e,map){
	var mode = map.getMode();
	var mxy = gEcnu.Util.getMouseXY(gSelf._container,e);
	var wxy = gEcnu.Util.screenToWorld(mxy.x, mxy.y);
	gEcnu.Edit.moving = false;
	switch (mode) {
		case 'moveNode':
		    var curobj=gEcnu.EditFeature.setting;
	        var catchLayer=curobj._layer;
	        var allfeatures=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
            //遍历数组之后，将本身的多边形数据从数组中除去，以备后面捕捉使用
            var catchPolygons = [];
            for (var m = 0; m < allfeatures.length; m++) {
                if (allfeatures[m] != gEcnu.Edit.selectedPolygon_pre) {
                    catchPolygons.push(allfeatures[m]);
                }
            }
            //catchPolygons.push(gEcnu.Edit.selectedPolygon);
            var returnfields=gEcnu.Edit.selectedPolygon._data;
            var newfields={};
            for(var kk in returnfields){
               newfields[kk]=returnfields[kk];
            }
            var opeFea=new gEcnu.Feature.Polygon(gEcnu.Edit.selectedPolygon._lineRings,newfields);
	        catchPolygons.push(opeFea);
	        gEcnu.Edit.selectedPolygon.shape=opeFea.shape;
	        gEcnu.Edit.selectedPolygon_pre=opeFea;
	        gEcnu.Edit.selectedPolygon=opeFea;
	        catchLayer.removeAllFeatures();
            catchLayer.addFeatures(catchPolygons);
            opeFea.onSelect();
		    map.setMode('moveNode_mouseDwon');
		    var callback_marker=gEcnu.EditFeature.setting.events._events.updateCompleted;
            if(typeof callback_marker != "undefined"){
                callback_marker(e,opeFea);
            }
		break;
		case 'moveNode_Line':
			var curobj=gEcnu.EditFeature.setting;
	        var catchLayer=curobj._layer;
	        var allfeatures=catchLayer.getAllFeatures();//此处返回的是所有该图层上的矢量数据
            //遍历数组之后，将本身的多边形数据从数组中除去，以备后面捕捉使用
            var catchPolygons = [];
            for (var m = 0; m < allfeatures.length; m++) {
                if (allfeatures[m] != gEcnu.Edit.selectedLine_pre) {
                    catchPolygons.push(allfeatures[m]);
                }
            }
            //catchPolygons.push(gEcnu.Edit.selectedPolygon);
            var returnfields=gEcnu.Edit.selectedLine._data;
            var newfields={};
            for(var kk in returnfields){
               newfields[kk]=returnfields[kk];
            }
            var opeFea=new gEcnu.Feature.Polyline(gEcnu.Edit.selectedLine._lineStrings,newfields);
	        catchPolygons.push(opeFea);
	        gEcnu.Edit.selectedLine.shape=opeFea.shape;
	        gEcnu.Edit.selectedLine_pre=opeFea;
	        gEcnu.Edit.selectedLine=opeFea;
	        catchLayer.removeAllFeatures();
            catchLayer.addFeatures(catchPolygons);
            opeFea.onSelect();
		    map.setMode('moveNodeLine_mouseDwon');
		    var callback_marker=gEcnu.EditFeature.setting.events._events.updateCompleted;
            if(typeof callback_marker != "undefined"){
                callback_marker(e,opeFea);
            }
		break;
		case "drawRect":console.log('up');
		var geometry_pt=new gEcnu.Geometry.Point(wxy.x,wxy.y);
		gEcnu.Edit.draw_rect_points.push(geometry_pt);
		var pt1x=gEcnu.Edit.draw_rect_points[1].x;
		var pt1y=gEcnu.Edit.draw_rect_points[0].y;
		var pt2x=gEcnu.Edit.draw_rect_points[1].x;
		var pt2y=gEcnu.Edit.draw_rect_points[1].y;
		var pt3x=gEcnu.Edit.draw_rect_points[0].x;
		var pt3y=gEcnu.Edit.draw_rect_points[1].y;
		var geopt1=new gEcnu.Geometry.Point(pt1x,pt1y);
		var geopt2=new gEcnu.Geometry.Point(pt2x,pt2y);
		var geopt3=new gEcnu.Geometry.Point(pt3x,pt3y);
		gEcnu.Edit.draw_rect_points[1]=geopt1;
		gEcnu.Edit.draw_rect_points.push(geopt2);
		gEcnu.Edit.draw_rect_points.push(geopt3);
		var rectRing=new gEcnu.Geometry.RectRing(gEcnu.Edit.draw_rect_points);
		var callback=gEcnu.DrawFeature.setting.events._events.added;
        if(typeof callback!= "undefined"){
              callback(e,rectRing);
              gEcnu.Edit.draw_rect_points=[];
            }
	    gSelf.overLayer.clear();
	    break;
	    case "drawCircle":  //2015-7-3 半径查询或绘制时 up时结束  By lc
	    var geometry_pt=new gEcnu.Geometry.Point(wxy.x,wxy.y); 
	    gEcnu.Edit.draw_circle_points.push(geometry_pt);
	    var centerpt=gEcnu.Edit.draw_circle_points[0];
	    if(gEcnu.Edit.draw_circle_points.length>=2){
	    	var pt1=gEcnu.Edit.draw_circle_points[0];
	    	var pt2=gEcnu.Edit.draw_circle_points[1];
	    	var radius=Math.sqrt((pt2.x-pt1.x)*(pt2.x-pt1.x)+(pt2.y-pt1.y)*(pt2.y-pt1.y));
	        var RadiusRing=new gEcnu.Geometry.RadiusRing(centerpt,radius);
	        var callback=gEcnu.DrawFeature.setting.events._events.added;
        if(typeof callback!= "undefined"){
              callback(e,RadiusRing);
              gEcnu.Edit.draw_circle_points=[];
            }
		}
	    break;
		/*case 'drawText':
		    var callback_marker=gEcnu.DrawFeature.setting.events._events.added;
            if(typeof callback_marker != "undefined"){
                callback_marker(e);
            }
		break;*/
	}
};


/**
 * 地图浏览操作外的mouse响应函数
 * @param e
 * @param map
 */
gEcnu.Edit.graphMouseDblClickEvt = function (e,map){
    var mode = map.getMode();
	switch (mode) {
	    case 'drawLine':
		    gEcnu.Edit.draw_line_points.pop();
		    var linestring=new gEcnu.Geometry.LineString(gEcnu.Edit.draw_line_points);
		    var callback_marker=gEcnu.DrawFeature.setting.events._events.added;
            if(typeof callback_marker != "undefined"){
               callback_marker(e,linestring);
               gEcnu.Edit.draw_line_points=[];
            }
		    map.overLayer.clear();
		break;
		case 'drawPolygon':
		    gEcnu.Edit.draw_polygon_points.pop();
		    var linerRing=new gEcnu.Geometry.LinearRing(gEcnu.Edit.draw_polygon_points);
		    var callback_marker=gEcnu.DrawFeature.setting.events._events.added;
            if(typeof callback_marker != "undefined"){
               callback_marker(e,linerRing);
               gEcnu.Edit.draw_polygon_points=[];
            }
		    map.overLayer.clear();
		break;
		/*case "drawRect":
		gEcnu.Edit.draw_rect_points.pop();
		var pt1x=gEcnu.Edit.draw_rect_points[1].x;
		var pt1y=gEcnu.Edit.draw_rect_points[0].y;
		var pt2x=gEcnu.Edit.draw_rect_points[1].x;
		var pt2y=gEcnu.Edit.draw_rect_points[1].y;
		var pt3x=gEcnu.Edit.draw_rect_points[0].x;
		var pt3y=gEcnu.Edit.draw_rect_points[1].y;
		var geopt1=new gEcnu.Geometry.Point(pt1x,pt1y);
		var geopt2=new gEcnu.Geometry.Point(pt2x,pt2y);
		var geopt3=new gEcnu.Geometry.Point(pt3x,pt3y);
		gEcnu.Edit.draw_rect_points[1]=geopt1;
		gEcnu.Edit.draw_rect_points.push(geopt2);
		gEcnu.Edit.draw_rect_points.push(geopt3);
		var rectRing=new gEcnu.Geometry.RectRing(gEcnu.Edit.draw_rect_points);
		//var points=gEcnu.Edit.draw_rect_points;
		//var linearRing=new gEcnu.Geometry.LinearRing(points);
		var callback=gEcnu.DrawFeature.setting.events._events.added;
        if(typeof callback!= "undefined"){
              callback(e,rectRing);
              gEcnu.Edit.draw_rect_points=[];
            }
	    gSelf.overLayer.clear();
	    break;*/
	    /*case "drawCircle": //删除双击事件  2015-7-3 半径查询或绘制时 up时结束  By lc
	    gEcnu.Edit.draw_circle_points.pop();
	    var centerpt=gEcnu.Edit.draw_circle_points[0];
	    if(gEcnu.Edit.draw_circle_points.length>=2){
	    	var pt1=gEcnu.Edit.draw_circle_points[0];
	    	var pt2=gEcnu.Edit.draw_circle_points[1];
	    	var radius=Math.sqrt((pt2.x-pt1.x)*(pt2.x-pt1.x)+(pt2.y-pt1.y)*(pt2.y-pt1.y));
	        var RadiusRing=new gEcnu.Geometry.RadiusRing(centerpt,radius);
	        var callback=gEcnu.DrawFeature.setting.events._events.added;
        if(typeof callback!= "undefined"){
              callback(e,RadiusRing);
              gEcnu.Edit.draw_circle_points=[];
            }
	   // gSelf.overLayer.clear();

	    }
	    break;*/
	}
}


/* by lc 2015-4-23
导出数据部分：
1、导出图层数据：Geojson格式，存为json文件
2、导出属性数据：csv格式 
*/

gEcnu.Export = gClass.extend({
	init: function(){

	}
});
gEcnu.exportParams={};
gEcnu.exportParams.DB='mapb';

//导出要素图层：geojson 格式
gEcnu.Export.Feature = gEcnu.Export.extend({
	//导出整张要素表 or 过滤条件筛选
	init: function(geodb,ftset,ftsetid,filter){
		this.ftset=ftset;
		this.geodb = geodb;
		this.ftsetid = ftsetid;
		this.filter=filter;
		this.webfeatureUrl =gEcnu.config.geoserver+"WebFeature";
		this.websqlUrl=gEcnu.config.geoserver+"WebSQL";
	},
	processAscyn:function (succ,fail){  //可选参数
		this._succCallback=succ;
		this._failCallback=fail;
		var self=this;
		var ftsetName=this.ftset;
		var filter=this.filter;
		this._getFtsetNum(function (ftsetNum){ 
			if(ftsetNum<1){ return;}
			var count=Math.ceil(ftsetNum/5000);  //分批进行要素查询
    		var i=0;  
    		var start=i*5000;
    		var result=[];
    		var geojson={"type":"FeatureCollection","FeatureNum":ftsetNum,"UTF8Encoding":false};
    		var getGeojson=function (){
    		  if(i>=count){ 
    		  		geojson.features=result;
    		  		self._download(JSON.stringify(geojson));
    		  		return;
    		  }
    		  var option={start:start,filter:filter};
    		  self._getFtsetGeojson(option,function (decodeData){
    		  	var feas=decodeData.features;
    		  	if(geojson.scale==undefined){
    		  		geojson.scale=decodeData.scale;
    		  	}
    		  	result=result.concat(feas);
    		    i++;
    		    start=i*5000;
    		    getGeojson();
    		 });
		
    		};
    		getGeojson();

		});

	},
	_getFtsetNum:function (callback){
		var ftset=this.ftset;
		var tabname="f_"+ftset;
		var websqlUrl=this.websqlUrl;
		var failCallback=this._failCallback;
		var sql='select count(*) from '+tabname;
		var db = this.geodb;
		var qryParams={
            	"mt":"SQLQuery",
                "GeoDB":db,
                "SQL":sql
            }
        var datastr = JSON.stringify(qryParams);
        var params = { req: datastr};
         try { 
            gEcnu.Util.ajax("POST", websqlUrl, params, true,function (data){
            	var jsonparser=JSON.parse(data);
            	var res=jsonparser.data;
  		 		var ftsetNum=res[0][0]; 
  		 		callback(ftsetNum);
            });
        }catch(e){
        	if(failCallback!=undefined){
  				failCallback();
  			}
        }
	},
	_getFtsetGeojson:function (option,callback){
		//var ftset=this.ftset;
		var ftsetId = this.ftsetid;
		var db = this.geodb;
		var webfeatureUrl=this.webfeatureUrl;
		var failcallback=this._failCallback;
		var start=option.start || 0;
		var filter=option.filter;
		filter=(filter==undefined || filter == '') ? '1=1' : filter;
		var sqlFilter=filter+" limit 5000 offset "+start;
		var sqlParams = {
                "mt":"SQLQuery",
                "geoDB":db,
                //"ftSet":ftset,
                "ftSet":ftsetId,
                "format":'geojson',
                "zip":true,
                "sql":sqlFilter,
                "return":{"shape":1,"fields":"%all%"}
            };
        var datastr = JSON.stringify(sqlParams);
        var params = {req: datastr};
        try{
        	gEcnu.Util.ajax('POST', webfeatureUrl, params, true, function (data){
        		var jsonparase = JSON.parse(data); 
                var decode_data=gEcnu.Util.decode(jsonparase);//解码GeoJson格式的数据
                if(callback!=undefined){
                	callback(decode_data);
                } 
        	});
        }catch(e){
        	if(failcallback!=undefined){
        		failcallback();
        	}
        }
	},
	//下载文件
	_download:function (content){
		var callback=this._succCallback;
		var fail=this._failCallback;
		var ftsetName=this.ftset; 
		var blob = new Blob([content], {type: 'text'}); 
		var a =document.getElementById('downloadFtsetBtn');
		if(a==undefined){
			a=document.createElement('a');
			a.id='downloadFtsetBtn';
			a.style.display='none';
			a.target='_blank';  
			document.body.appendChild(a);
		}
		try{
			var URL=window.URL || window.webkitURL;
			a.href=URL.createObjectURL(blob);
			a.download = ftsetName+'.json';  
			if (typeof navigator.msSaveBlob == "function"){  //IE
				navigator.msSaveBlob(blob, ftsetName+'.json');
			}
			a.click();
			if(callback!=undefined){
				callback();
			}
		}catch(e){
			if(fail!=undefined){
				fail();
			}
		}
		
	}
});

//导出csv数据
gEcnu.Export.Data = gEcnu.Export.extend({
	init: function(geodb,tabname,filter){
		this.tabName=tabname;
		this.filter=filter;
		this.geodb = geodb;
		this.websqlUrl=gEcnu.config.geoserver+"WebSQL";
	},
	processAscyn:function (succ,fail){  //可选参数
		this._succCallback=succ;
		this._failCallback=fail;
		var self=this;
		var tabname=this.tabName;
		var filter=this.filter;
		this._getTabData(function (json){  
			var content='';
			var fldsArr=json.fldsDef;
			var allFlds=[];
			for(var k=0,fld_len=fldsArr.length;k<fld_len;k++){
				var fld=fldsArr[k].name;
				allFlds.push(fld);
			}
			var fldstr=allFlds.join(',');
			content=content+fldstr+"\r\n";
			for(var i=0,len=json.data.length;i<len;i++){
				var record=json.data[i];
				content+=record.join(',')+"\r\n";
			}
			self._download(content);
		});
	},
	_getTabData:function (callback){
		var websqlUrl=this.websqlUrl;
		var tabname=this.tabName;
		var filter=this.filter;
		var db = this.geodb;
		if(filter!=undefined && filter!=''){
			var sql="select * from "+tabname+" where "+filter;
		}else{
			var sql="select * from "+tabname;
		}
		var qryParams={
            	"mt":"SQLQuery",
                "GeoDB":db,
                "SQL":sql
        }
        var datastr = JSON.stringify(qryParams);
        var params = { req: datastr};
        try { 
            gEcnu.Util.ajax("POST", websqlUrl, params, true,function (data){
            	var jsonparser=JSON.parse(data);
  		 		callback(jsonparser);
            });
        }catch(e){
        	if(failCallback!=undefined){
  				failCallback();
  			}
        }
	},
	_download:function (content){
		var callback=this._succCallback;
		var fail=this._failCallback;
		var tabname=this.tabName;
		var blob = new Blob([content], {type: 'text'}); 
		var a =document.getElementById('downloadTabBtn');
		if(a==undefined){
			a=document.createElement('a');
			a.id='downloadTabBtn';
			a.style.display='none';
			a.download = tabname+'.csv';
			a.target='_blank';  
			document.body.appendChild(a);
		}
		try{
			var URL=window.URL || window.webkitURL;
			a.href=URL.createObjectURL(blob);
			if (typeof navigator.msSaveBlob == "function"){  //IE
				navigator.msSaveBlob(blob, tabname+'.csv');
			}
			a.click();
			if(callback!=undefined){
				callback();
			}
		}catch(e){
			if(fail!=undefined){
				fail();
			}
		}

	}
});



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
      if(typeof (this.style) =="undefined" || resetFlag){
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
      }
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
      if(typeof (this.style) =="undefined" || resetFlag){
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
      }
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
      if(typeof (this.style) =="undefined" || resetFlag){  //重设样式
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
      }
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
  
gEcnu.WebGeoCoding= gClass.extend({
    init: function(eventsListener) {
        if (typeof eventsListener != "undefined") {
            this.events._events.processCompleted = eventsListener.processCompleted;
            this.events._events.processFailed = eventsListener.processFailed;
        }
    },
    geoCoding:function(feature){
    	//var webgeoCodingUrl = 'http://' + gEcnu.config.webHostIP + ":" + gEcnu.config.port + "/GeoUtils";
        var webgeoCodingUrl = gEcnu.config.geoserver+"GeoUtils";
        var geoParmas={
       		"mt":"GeoCoding",
            "shape":feature.shape
        }
        var datastr = JSON.stringify(geoParmas);
        var params = {
            req: datastr
        };
        var webgeocodingServices = this;
        try {
            gEcnu.Util.ajax("POST", webgeoCodingUrl, params, false, function(data){
                if (typeof(webgeocodingServices.events._events.processCompleted) != "undefined") {
                	var jsonparase=JSON.parse(data);
                    webgeocodingServices.events._events.processCompleted(jsonparase);
                }
            },function() {
                alert('webgeocoding请求超时');
            },500000);
        }catch (e) {
            if (typeof(webgeocodingServices.events._events.processFailed) != "undefined") {
                webgeocodingServices.events._events.processFailed(e);
            }
        }
    },
    deGeoCoding:function(geoCode){

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
gEcnu.Geometry = gClass.extend({
	init: function (name) {
		this.name = name;
	},
	getVertices: function () {

	},
	getBounds: function () {

	},
	calcBounds: function () {

	}
});

gEcnu.Geometry.Point = gClass.extend({
	init: function (x, y) {
		this.x = x;
		this.y = y;
		this.className="point";
/*		var r = /^\d+$/;
		if (r.test(ID)) {
			this.ID = ID;
		}*/
	}
});

gEcnu.Geometry.LineString = gEcnu.Geometry.extend({
	init: function (points) {  
		this.className="line";
		this.points = [];
		for (var i = 0; i < points.length; i++) {
			var pt=points[i];
			if(pt instanceof gEcnu.Geometry.Point){
		    	this.points.push(pt);
		    }else{
		    	alert('初始化节点失败！');
		    }
		}
	},
	addPoint: function (pt, index){
		var r = /^\d+$/;
		if (r.test(index)) {
			this.points.splice(index, 0, pt);
		} else {
			this.points.push(pt);
		}
	},
	delPoint:function(index){
		this.points.splice(index,1);   
	},
	removePoint: function (pt) {
		for (var i = 0; i < this.points.length; i++) {
			if (this.points[i] == pt) {
				this.points.splice(i, 1);
				break;
			}
		}
	},
	getLength: function () {
		var len = this.points.length;
		var totalDis = 0;
		for (var j = 0; j < (len - 1); j++) {
			var mdis = Math.sqrt((this.points[j].x - this.points[j + 1].x) * (this.points[j].x - this.points[j + 1].x) + (this.points[j].y - this.points[j + 1].y) * (this.points[j].y - this.points[j + 1].y));
			totalDis = totalDis + mdis;
		}
		return totalDis;
	}
});



gEcnu.Geometry.LinearRing = gEcnu.Geometry.LineString.extend({
	init:function(points){
         var points_len=points.length;
         if(points_len<=2){alert('组成多边形节点个数不足！'); return;}
         this._super(points);
         this.className="polygon";  //应该是多边形
         var lastPoint=points[0];
         this.points.push(lastPoint);
	},
	addPoint: function (pt, index){
		//var r = /^\d+$/;
		//if (r.test(index)) {
			this.points.splice(index, 0, pt);
		//} else {
		//	this.points.push(pt);
		//}
	},
	delPoint:function(index){    
		if(this.points.length==4){alert('节点数低于3个，不能删除！');return;};
		this.points.splice(index,1);
		if(index==0){
           this.points.pop();
           var firstPoint=this.points[0];
           this.points.push(firstPoint);
		}else{		
		}
        
	},
	getCenterPoint:function(){
        var tmppoints=this.points;
        var points_len=tmppoints.length;
        var totalX=0;var totalY=0;
        for(var i=0;i<points_len;i++){
            totalX=totalX+tmppoints[i].x;
            totalY=totalY+tmppoints[i].y;
        }
        var x=totalX/points_len;
        var y=totalY/points_len;
        var point=new gEcnu.Geometry.Point(x,y);
        return point;
    },
	getArea: function () {
		var ta = 0;
		var ax = this.points;
		for (var i = 0; i < ax.length; i++) {   //i<ax.length-1
			ta = ta + (ax[i].x * ax[(i + 1) % ax.length].y - ax[(i + 1) % ax.length].x * ax[i].y);
		}
		var meter2 = parseInt(Math.abs(0.5 * ta));
		return meter2;
	}
});

gEcnu.Geometry.RectRing = gEcnu.Geometry.LineString.extend({
	init:function(points){
         var points_len=points.length;
       //  if(points_len<=4){alert('组成多边形节点个数不足！');}
         if(points_len<4){alert('组成矩形节点个数不足！'); return;}
         this._super(points);
         this.className="rect";
         // var lastPoint=points[0];    // 传入的参数就是四个节点 8.16删除
         // this.points.push(lastPoint);
	},
	addPoint: function (pt, index){
		//var r = /^\d+$/;
		//if (r.test(index)) {
			this.points.splice(index, 0, pt);
		//} else {
		//	this.points.push(pt);
		//}
	},
	delPoint:function(index){
		if(this.points.length==4){alert('节点数低于3个，不能删除！');return;};
		this.points.splice(index,1);
		if(index==0){
           this.points.pop();
           var firstPoint=this.points[0];
           this.points.push(firstPoint);
		}else{		
		}  
	},
	getArea: function () {
		var ta = 0;
		var ax = this.points;
		for (var i = 0; i < ax.length; i++) {
			ta = ta + (ax[i].x * ax[(i + 1) % ax.length].y - ax[(i + 1) % ax.length].x * ax[i].y);
		}
		var meter2 = parseInt(Math.abs(0.5 * ta));
		return meter2;
	}
});
gEcnu.Geometry.RadiusRing = gEcnu.Geometry.extend({
	init:function(point,radius){
        this.radius=radius;
        this.centerPoint=point;
        this.className="radius";
	},
	getArea: function () {
        return 2*3.14159*(this.radius)*(this.radius);
	}
});
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
		this._initLayerContainer(this.id, size.w, size.h);
		this._initProp(map);
		this._initParams(map);
		this._container.appendChild(this._layerContainer);
		this.setzIndex();
		this.setOpacity(this.options.opacity);
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
		//console.log(this.oClass);
		//if(this.oClass != "dynLayer"){
	    	this._layerContainer.style.left = 0 + 'px';
	    	this._layerContainer.style.top = 0 + 'px';
	    //}
		//this._layerContainer.style.left = this.startLeft + 'px';
		//this._layerContainer.style.top = this.startTop + 'px';
	},
	/**
	 * 显示地图
	 */
	show: function () {
		this.zoomTo();
		this._layerContainer.style.display = 'block';
		this.visible = true;
	},
	/**
	 * 隐藏地图
	 */
	hide: function () {
		this._layerContainer.style.display = 'none';
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
	setOpacity: function (val) {
		this.getLayerContainer().style.opacity = val;
	},
	/**
	 * 图层resize操作
	 */
	resize: function () {
		this._layerContainer.style.width = this._map.w + 'px';
		this._layerContainer.style.height = this._map.h + 'px';
	}
});

gEcnu.Layer.Dyn = gEcnu.Layer.extend({
	init: function (ws, id, lyrStr, options) {
		this._super(id, options);
		this.options = {
			zIndex: 4
		};
		this.lyrStr = lyrStr;
		this.ws = ws;
		this.oClass = "dynLayer";
	},
	/**
	 * 请求参数初始化
	 * @private
	 */
	_initParams: function (map) {
		var cxy = map.getCenter();
		var zoom = map.getZoom();
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
			zoom: zoom.z,
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
		this.img_copy = new Image();
		this._layerContainer.appendChild(this._mapImg);
		this._mapImg.width = size.w;
		this._mapImg.height = size.h;
		//this._mapImg.border = "0";
		//this._mapImg.style.border="1px solid red";
		this.ctrlLyrs = [];
		this.mapUrl = null;
		this.startLeft = 0;
		this.startTop = 0;
		this.requestTimer=null;
		this.ifInit=true;
		this.refreshFlag=false;
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
		//在平移地图过程中，阻止动态图载入
		var removeDynLoad=function (context){ 
			var mapTool=context._map.mapTool;
			if(mapTool=='pan'){
				// context._mapImg.onload=null;
				context.img_copy.onload=null;
			}	
		};
		gEcnu.Layer.Dyn._removeDynLoad=removeDynLoad;
	},
	/**
	 * 添加动态图层
	 * @param {String} lyrStr 动态图层字符串
	 */
	addLyr: function (lyrStr,b_Over) {
		if(b_Over){
			this.ctrlLyrs=['empty'];
		}
		var arr = lyrStr.split(",");
		for (var i = 0; i < arr.length; i++) {
			var j = this.ctrlLyrs.indexOf(arr[i]);
			if (j < 0)
				this.ctrlLyrs.push(arr[i]);
		}
		this._params.lyrs = this.ctrlLyrs.join(",");
		this._params.mt = 'zoomto';
		if(b_Over){
			this._params.lyrs='empty,'+lyrStr;
		}
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
	zoomIn: function (mouseXY) {
		var params = this._params;
		params.zoom = params.zoom / 2;
		this.scaleMap('zoomin',mouseXY);
		this.renew();
	},
	/**
	 * 视野缩小操作
	 */
	zoomOut: function (mouseXY) {
		var params = this._params;
		params.zoom = params.zoom * 2;
		this.scaleMap('zoomout',mouseXY);
		this.renew();
	},
	zoomTo: function () {
		
		this._params.zoom = this._map.zoom;
		this._params.cx = this._map.cx;
		this._params.cy = this._map.cy;
		this.renew();
	},
	scaleMap: function (tool,mouseXY) {
		var d = this._layerContainer;
		if(typeof mouseXY=="undefined"){
            mouseXY=this.getScreenCenter();
		}
		//else{
			var tx = mouseXY.x;
		    var ty = mouseXY.y;
		    var s = tx + "px " + ty + "px";
		    d.style.webkitTransformOrigin = s;
		    d.style.transformOrigin = s;
		//}
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
		//console.log(this._params.zoom);
		var self=this;
		if(self.requestTimer){
		  clearTimeout(self.requestTimer);
		}
		self.requestTimer=setTimeout(function(){self._request(self._params);},250);
	},
	resize: function () {
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
	//返回所有可见图层
	getAllVisibleLyrs:function (){
		return this.ctrlLyrs;
	},
	// refresh:function (){ //重读数据库 
	// 	this.refreshFlag=true;
	// 	//this.ws=ws;	
	// },
	refresh:function (){ //重读数据库 
		this.refreshFlag=true;
		this._params.clearmap=this.ws;	
		this._request(this._params);
	},
	/**
	 * 请求地图服务
	 * @param {Object} params 动态地图请求参数
	 */
	_request: function (params) {  
		var self = this;
		var mapurl = this.webMapURL;
		// if(this.refreshFlag){   
		// 	this._params.clearmap=this.ws;	
		// }
		//var reqUrl = "http://58.198.182.28:81/webmap?map=shxz2008&w=" + params.w + "&h=" + params.h + "&cx=" + params.cx + "&cy=" + params.cy + "&zoom=" + params.zoom + "&lyrs=" + params.lyrs + "&mt=" + params.mt + "&return=json";
		var d = this._layerContainer;
		try {
			gEcnu.Util.ajax("get", mapurl, params, true, function (data) {
				self.refreshFlag=false; 
				if(self._params.clearmap){
					self._params.clearmap='';
					delete self._params.clearmap;
				}
				data = JSON.parse(data);
				if (!data.mapURL) {
					//alert("地图请求失败！");
					gSelf._dynError_EX(data);
					return;
				}
				var req_lyrs=params.lyrs.toLowerCase().replace(/(^\s+)|(\s+$)/g,""); //去除空格
                var res_lyrs=data.visibleLayers.toLowerCase().replace(/(^\s+)|(\s+$)/g,"");
                var tmpRequestZoom=parseInt(params.zoom,10);
                var tmpResponseZoom=parseInt(data.mapZoom,10);
                var paraX=Math.round(params.cx);
                var paraY=Math.round(params.cy);
                var resX=Math.round(data.centerX);
                var resY=Math.round(data.centerY);
                if((tmpRequestZoom==tmpResponseZoom)&&(paraX==resX)&&(paraY==resY)&&(req_lyrs==res_lyrs)){
				   		if(gSelf.dragging){  //当前处于平移mousemove时，禁止载入动态图，防止出现动态图跳动
				   			return; //不再处理onload事件
				   		}
				    //创建一张临时图片（解决地图跳动）
				   		if(self.img_copy){
				   			self.img_copy.onload=null;
				   		}
				   		var img_copy=new Image(); 
				   		var size = self.getSize();
				   		img_copy.style.width=size.w+"px";
				   		img_copy.style.height=size.h+"px";
				   		img_copy.width = size.w;
						img_copy.height = size.h;
				   		img_copy.style.position="absolute";
				   		img_copy.style.left='0px';
				   		img_copy.style.top='0px';
				  		img_copy.style.zIndex='10';
				  		self.img_copy=img_copy;
				  		self.img_copy.onload=  function (){
				   		 		d.removeChild(self._mapImg);
				   				d.style.left = '0px';
				    			d.style.top = '0px';
				   				d.appendChild(img_copy);
				   				self._mapImg=img_copy;
				   				
				    			d.style.transform = "scale(1,1)";
				    			d.style.webkitTransform = "scale(1,1)";
				    			d.style.transition = "transform 0ms ease-in-out";
				    			d.style.transition = "-webkit-transform 0ms ease-in-out";
				   		 	
				   		 
				   		 };
				   		img_copy.src=self.fileServer + data.mapURL; 
				    // self._mapImg.onload = function () {  
				    // 	d.style.left = '0px';
				    // 	d.style.top = '0px';
				    // 	d.style.transform = "scale(1,1)";
				    // 	d.style.webkitTransform = "scale(1,1)";
				    // 	d.style.transition = "transform 0ms ease-in-out";
				    // 	d.style.transition = "-webkit-transform 0ms ease-in-out";

				    // 	self.ifInit=false;
				    // 	self._mapImg.onload =null;
				    // }
				    //   self._mapImg.src = self.fileServer + data.mapURL;
				}
			});
		} catch (e) {
			alert("出现异常在：" + e);
		}
	}
});

gEcnu.Layer.Tile = gEcnu.Layer.extend({
	init: function (id,tileName, options) {
		this._super(id, options);
		this.options = {
			opacity: 1.0,
			zIndex: 3
		};
		this.tileName= (!tileName || '')  ? 'shImg2012a' : tileName; //指定切片的路径 shImg2012a、shImg2013
		this.oClass = "tileLayer";
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
	},
	/**
	 * 地图视图初始化
	 */
	_initMapView: function (w, h) {
		//创建mapView
		var key=new Date()-0; 
		this.mapView = document.createElement('div');
		this.mapView.id = 'mapView_'+key;  //多层切片时  id动态变化
		this.mapView.width = this.w;
		this.mapView.height = this.h;   
		this.mapView.style.position = "absolute";
		this.mapView.style.top = "0px";
		this.mapView.style.left = "0px";
		this.mapView.style.width = w + "px";
		this.mapView.style.height = h + "px";
		this.mapView.style.overflow = "hidden";
		this.mapView.style.zIndex = 1;
		//创建baseMap
		this.baseMap = document.createElement('div');  //多层切片 多个baseMap
		this.baseMap.id = 'baseMap'+key;
		this.baseMap.style.position = "absolute";
		this.baseMap.style.left = this.xOffset + "px";
		this.baseMap.style.top = this.yOffset + "px";
		this.baseMap.style.width = this.nWidth * this.tileWidth + 'px';
		this.baseMap.style.height = this.nHeight * this.tileHeight + 'px';
		this.baseMap.style.zIndex = 2;
		//创建baseBgMap
		this.baseBgMap = this.baseMap.cloneNode();
		this.baseBgMap.id = "baseBgMap"+key;
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
		var tileName=this.tileName;
		this._params = {
			req: 'getmap',
			w: size.w,
			h: size.h,
			zl: zoom.zl,
			cx: cxy.x,
			cy: cxy.y,
			"return": 'json',
			map:tileName
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
		this.xMinus=0;//xOffset  为了避免冲突，指代同一个意思
        this.yMinus=0;
		this.imgURL = gEcnu.config.imgPath+"blank.png";

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
		this.requestTimer=null;
		var size = this.getMap().getSize();
		this._initMapView(size.w, size.h);
	},
	/**
	 * 添加图层时触发
	 * @param {Object} map
	 */
	onAdd: function (map) {
		map.ownTile = true;
		map.tileCount++; 
		this._super(map);
		this._createTiles();
		this.ifInit = true;
		this._request(this._params);
		//this.ifInit = false;
		//console.log(this.mapLeft);
	},
	onRemove: function (map) {
		this._super(map);
		map.tileCount--; 
	},
	/**
	 * 拖动地图时触发
	 * @param dltx x方向变化量
	 * @param dlty y方向变化量
	 */
	onDrag: function (dltx, dlty) {
		if (this.visible) {
			this.baseMap.style.left = this.startLeft + dltx + 'px';
			this.baseMap.style.top = this.startTop + dlty + 'px';
		}
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
	zoomIn: function (mouseXY) {
		this.mapTool = 'zoomin';
		this.ifzoominOrout=true;
		this.scaleMap(mouseXY);
		this.renew();
	},
	/**
	 * 视野缩小
	 */
	zoomOut: function (mouseXY) {
		this.mapTool = 'zoomout';
		this.ifzoominOrout=true;
		this.scaleMap(mouseXY);
		this.renew();
	},
	zoomTo: function () {
		this.ifZoomTo = true;
		this._params.zl = this._map.zl;
		this._params.cx = this._map.cx;
		this._params.cy = this._map.cy;
		this._resetTile();
		this.renew();	
		this.mapTool = 'pan';
	},
	/**
	 * 图层缩放动画
	 */
	scaleMap: function (mouseXY) {
		//this.hideLayer('bgMap');
		this.hideLayer('baseMap');
		var tx, ty;
		var scxy = this.getScreenCenter();
		var d = this.baseBgMap;
		var len = this.baseMap.childNodes.length;
		if(typeof mouseXY=="undefined"){
			tx = scxy.x  - this.xMinus;
		    ty = scxy.y - this.yMinus;
		}else{
	    	/**/	 
	    	tx = mouseXY.x - this.xMinus;
	    	ty = mouseXY.y - this.yMinus;	    	
	    }

		var bx = this.tileWidth * this.nWidth / 2;
		var by = this.tileHeight * this.nHeight / 2;
		var s = tx + "px " + ty + "px";
		d.style.webkitTransformOrigin = s;
		d.style.transformOrigin = s;
		var len = this.baseMap.childNodes.length;
		var firImgLeft=0;var firImgTop=0;
		d.style.left =this.xMinus+"px";
		d.style.top = this.yMinus+"px";
		for (var i = 0; i < len; i++) {
			var imgtmp = this.baseMap.childNodes[0];
			if(i==0){
				firImgLeft=gEcnu.Util.delpx(imgtmp.style.left);
				firImgTop=gEcnu.Util.delpx(imgtmp.style.top);
				imgtmp.style.left="0px";
				imgtmp.style.top="0px";
			}else{
				var newLeft=gEcnu.Util.delpx(imgtmp.style.left)-firImgLeft+"px";
                var newTop=gEcnu.Util.delpx(imgtmp.style.top)-firImgTop+"px";
                imgtmp.style.left=newLeft;
				imgtmp.style.top=newTop;
			}
			d.appendChild(imgtmp);
		}
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
		if (this.mapTool == 'pan') {
			this.ifzoominOrout=false;
			this._panMap();
		}
		var self=this;
		if(self.requestTimer){
		clearTimeout(self.requestTimer);
		}
		self.requestTimer=setTimeout(function(){self._request(self._params);},250); //延迟写入事件流，不一定执行
	
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
		//this.ifZoomTo = false;
	},
	/**
	 * 请求地图
	 * @param params 切片地图参数
	 * @private
	 */
	_request: function (params) {  
		var self = this;
		var mapurl = this.tileMapURL;
        //gSelf.zoom 根据zoom值重新计算zl值 （中间动态改变zoom值后 zl与zoom会出现匹配不上现象）
		//var reqUrl = mapurl + "?w=" + params.w + "&h=" + params.h + "&cx=" + params.cx + "&cy=" + params.cy + "&zl=" + params.zl + "&return='json'&map="+mapPath; //mapPath=shImg2012a	
		try {
			var ifinit=false;
			if(this.ifInit){
				ifinit=false;
			}else{
				ifinit=true;
			}                   
			gEcnu.Util.ajax("get", mapurl, params, ifinit, function (data) { 
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
	_showMap: function (data) { 
		var self = this;
		var d = this.baseMap;
		var nWidth = this.nWidth;
		var nHeight = this.nHeight;
		this.xMinus = data.tileInfo.xoff;
		this.yMinus = data.tileInfo.yoff;
		if(this.ifInit || this.ifZoomTo||this.ifzoominOrout){
                this.xOffset = data.tileInfo.xoff;
		    	this.yOffset = data.tileInfo.yoff;
		    	d.style.left = this.xOffset + "px";
		    	d.style.top = this.yOffset + "px";
		    if (this.ifInit || this.ifZoomTo) {
			    this.ifZoomTo = false;
			    this._map.setZoom(data.tileInfo.zoom);
		    }
		}
		if (this.ifInit){
			this.baseBgMap.style.left = d.style.left;
			this.baseBgMap.style.top = d.style.top;
			this.ifInit=false;
		}
		if (this.ifzoominOrout) { 
			//this._createTiles();
			this._resetTile();
		}
		var len = data.tiles.length;
		var responseCenterx=parseInt(data.tileInfo.cx,10);
        var responseCentery=parseInt(data.tileInfo.cy,10);
        var requestCenterx=parseInt(this._params.cx,10);
        var requestCentery=parseInt(this._params.cy,10);  
		var j = 0;
		var i = 0;
		var servTiles = data.tiles;
        var bg = self.baseBgMap;
		var bx = this.tileWidth * this.nWidth / 2;
		var by = this.tileHeight * this.nHeight / 2;
		//加载切片：根据行列号找切片位置
		var resTileInfo={};  //{row_col:isload} 解决服务器返回重复行列问题
		function getImg() { 
			var actImgNum=nWidth*nHeight;
			if (j >= len || j>=actImgNum) {
				 self.mapTool = 'pan';
				return;
			}
			var row = data.tiles[j].row;
			var col = data.tiles[j].col;  
			if( row <= nHeight  && col <= nWidth){
				var k = (row - 1) * nWidth + (col - 1);   
				var imgtmp = d.childNodes[k];   
				var tmpUrl = data.tiles[j].url;
				//var tmpzl = tmpUrl.substring(16, 17);
				var alevel=tmpUrl.split('/')[2];
				var tmpzl=alevel.substr(1, alevel.length-1);
				var bx = this.tileWidth * this.nWidth / 2;
				var by = this.tileHeight * this.nHeight / 2;  
				if (typeof (imgtmp) != "undefined" && tmpzl == self._params.zl && responseCenterx==requestCenterx && requestCentery==responseCentery) { 
					var imgUrl = self.fileServer + tmpUrl;
					if(resTileInfo[row+"_"+col]!=undefined){  //某行列上的切片已加载过
						if(self.mapTool != 'pan') {  //缩放时
							i++;		
						}
					}else{
						resTileInfo[row+"_"+col]=true;
					}
					
					imgtmp.src = imgUrl;
    				imgtmp.onerror=function (){ 
    					imgtmp.src = gEcnu.config.imgPath+"blank.png";
    				};	
					imgtmp.onload = function () {
						i++;
						var actImgNum=nWidth*nHeight;  //console.log(i,len,actImgNum);
						if (i == len || i==actImgNum) {  //缩放时重置切片层的left top
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
							bg.style.webkitTransformOrigin = s;
							bg.style.transformOrigin = s;
							bg.style.transition = "transform 10ms ease-in-out";
							bg.style.transition = "-webkit-transform 10ms ease-in-out";
							}
					};
				self.hasImgURL[imgtmp.id] = true;
			 	}
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
			//newImg.className="gecnu_tileimg";
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
		if (d.childNodes[0] != undefined) {  
			var offLeft = gEcnu.Util.delpx(d.childNodes[0].style.left);  
			for (var j = 0; j < this.nHeight; j++) {
				var imgLast = d.childNodes[((j + 1) * this.nWidth) - 1];
				var imgNext = d.childNodes[j * this.nWidth];
				imgLast.style.left = (offLeft - this.tileWidth) + "px";
				imgLast.src = this.imgURL;
				//imgLast.className="gecnu_tileimg";
				d.removeChild(imgLast);
				d.insertBefore(imgLast, imgNext);
				this.hasImgURL[imgLast.id] = false;
			}
		}
	},
	/**
	 * 回绕 左至右
	 */
	wrapL2R: function () {
		this.xOffset = this.xOffset + this.tileWidth;
		var d = this.baseMap;    
		if (d.childNodes[this.nWidth - 1] != undefined) {
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
				//imgFirst.className="gecnu_tileimg";
				d.removeChild(imgFirst);
				if (imgNext) {
					d.insertBefore(imgFirst, imgNext);
				} else {
					d.appendChild(imgFirst);
				}
				this.hasImgURL[imgFirst.id] = false;
			}
		}
	},
	/**
	 * 回绕 顶至底
	 */
	wrapT2B: function () {
		this.yOffset = this.yOffset + this.tileHeight;
		var d = this.baseMap;
		if (d.childNodes[(this.nHeight * this.nWidth) - 1] != undefined) {
			var offTop = gEcnu.Util.delpx(d.childNodes[(this.nHeight * this.nWidth) - 1].style.top);
			for (var i = 0; i < this.nWidth; i++) {
				var imgBottom = d.childNodes[0];
				imgBottom.style.top = (offTop + this.tileHeight) + "px";
				imgBottom.src = this.imgURL;
				//imgBottom.className="gecnu_tileimg";
				d.removeChild(imgBottom);
				d.appendChild(imgBottom);
				this.hasImgURL[imgBottom.id] = false;
			}
		}
	},
	/**
	 * 回绕 底至顶
	 */
	wrapB2T: function () {
		this.yOffset = this.yOffset - this.tileHeight;
		var d = this.baseMap;
		if (d.childNodes[0] != undefined) {
			var offTop = gEcnu.Util.delpx(d.childNodes[0].style.top);
			for (var i = 0; i < this.nWidth; i++) {
				var imgTop = d.childNodes[(this.nHeight * this.nWidth) - 1];
				imgTop.style.top = (offTop - this.tileHeight) + "px";
				imgTop.src = this.imgURL;
				//imgTop.className="gecnu_tileimg";
				d.removeChild(imgTop);
				d.insertBefore(imgTop, d.childNodes[0]);
				this.hasImgURL[imgTop.id] = false;
			}
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
			zIndex: 2
		}
		this.options = gEcnu.Util.setOptions(this, options);
		this.mapSource = source;
		this.oClass = 'otherLayer';
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
		gSelf.activeLayer = this;
	},
	/**
	 * 添加图层时触发
	 * @param map
	 */
	onAdd: function (map) {
		var self=this;
		map.ownOther = true;
		this._map = map;
		this._super(map);
		this.oMapMinlevel=1;
		this.oMapMaxLevel=18;
		var script = document.createElement('script');
		//初始化各类型第三方地图的像素比例尺
		this.initPxScale(this.mapSource);
		var isExistScript=this._isExistScript();  
		if(isExistScript){
			showOtherMap_self();
			return;
		}
		switch (this.mapSource) {
		case 'google':
			script.src = 'http://maps.googleapis.com/maps/api/js?sensor=false&callback=showOtherMap_self';
			break;
		case 'baidu':
			script.src = 'http://api.map.baidu.com/api?v=1.4&callback=showOtherMap_self';
			this.oMapMaxLevel=19;
			break;
		case 'tianditu':
			script.src = "http://api.tianditu.com/js/maps.js";
			script.onload = showOtherMap_self;
			break;
		case 'bingmap': 
			script.src = "http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&mkt=en-us";
			//script.onload = showOtherMap_self;  //等待依赖脚本(.js)加入
			script.onload = setTimeout(function (){ 
				showOtherMap_self();
			},3000);
		break;
		}
		document.getElementsByTagName('head')[0].appendChild(script);
	},
	/**
	 * 初始化各类型第三方地图的像素比例尺
	 * @param  {[type]} mapSource 类型
	 * @return {[type]}           [description]
	 */
	initPxScale: function (mapSource){
		switch (mapSource) {
		case 'google':
			this.otherPxScale=0.001373291015625;
			break;
		case 'baidu':
			this.otherPxScale=0.0011498312500000019;
			this.oMapMaxLevel=19;
			break;
		case 'tianditu':
			this.otherPxScale=0.0013767249999999897;
			break;
		case 'bingmap': 
			this.otherPxScale=0.001373291015625;   //;0.001373291015625; //0.000010728836059570312;
			this.oMapMaxLevel=20;
		break;
		}
	},
	/**
	*判断相应的地图API脚本是否加载过
	*/
	_isExistScript:function (){
		var scripts=document.getElementsByTagName('head')[0].getElementsByTagName('script');
		var apiSrc='';
		switch(this.mapSource){
			case "google":
			apiSrc='http://maps.googleapis.com/maps/api/js?sensor=false&callback=showOtherMap_self';
			break;
			case "tianditu":
			apiSrc="http://api.tianditu.com/js/maps.js";
			break;
			case "baidu":
			apiSrc='http://api.map.baidu.com/api?v=1.4&callback=showOtherMap_self';
			break;
			case "bingmap":
			//apiSrc='http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&mkt=en-us';
			apiSrc = 'http://ecn.dev.virtualearth.net/mapcontrol/v7.0/7.0.20150610192009.20/js/en-us/veapicore.js';
			break;
		}
		for(var i=0,len=scripts.length;i<len;i++){
			var src=scripts[i].src;    
			if(apiSrc==src){  
				return true;
			}
		}
		return false;
	},
	/**
	 * 视野放大
	 */
	zoomIn: function () {
		this.renew();
	},
	/**
	 * 视野缩小
	 */
	zoomOut: function () {
		this.renew();
	},
	zoomTo: function () {
		this.renew();
	},
	setMapType: function (type) {
		switch (this.mapSource) {
		case 'google':
			switch (type) {
			case 'ROAD':
				this.oMap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
				break;
			case 'SATELLITE':
				this.oMap.setMapTypeId(google.maps.MapTypeId.SATELLITE);
				break;
			case 'HYBRID':
				this.oMap.setMapTypeId(google.maps.MapTypeId.HYBRID);
				break;
			}
			break;
		case 'baidu':
			switch (type) {
			case 'ROAD':
				this.oMap.setMapType(BMAP_NORMAL_MAP);
				break;
			case 'SATELLITE':
				this.oMap.setMapType(BMAP_SATELLITE_MAP);
				break;
			case 'HYBRID':
				this.oMap.setMapType(BMAP_HYBRID_MAP);
				break;
			}
			break;
		case 'tianditu':
			switch (type) {
			case 'ROAD':
				this.oMap.setMapType(TMAP_NORMAL_MAP);
				break;
			case 'SATELLITE':
				this.oMap.setMapType(TMAP_SATELLITE_MAP);
				break;
			case 'HYBRID':
				this.oMap.setMapType(TMAP_HYBRID_MAP);
				break;
			}
			break;
		case "bingmap":
			switch (type){
				case 'road':
				this.oMap.setMapType(Microsoft.Maps.MapTypeId.road);
				break;
				case "arial":
				this.oMap.setMapType(Microsoft.Maps.MapTypeId.aerial);
				break;
				case "birdseye":
				this.oMap.setMapType(Microsoft.Maps.MapTypeId.birdseye);
				break;
				case "collinsBart":
				this.oMap.setMapType(Microsoft.Maps.MapTypeId.collinsBart);
				break;
			}
		break;
		}

	},
	resize:function(){
		var size = this._map.getSize();  
	    var layerContainer=document.getElementById(this._layerContainer.id);
		layerContainer.style.width=size.w+'px';
		layerContainer.style.height=size.h+'px';
		this._layerContainer = layerContainer; 
		var coordsys=gSelf.coordsFlag;
	    if(coordsys=='GEOGRAPHIC'){
	    	this._resize_geo();
	    }else{
	    	this._resize_proj();
	    }	 
	},
	_resize_geo:function (){
		var cxy = gSelf.getCenter();
		switch (this.mapSource) {
		case 'google': 
            this.oMap.setCenter(new google.maps.LatLng(cxy.y, cxy.x));
			break;
		case 'baidu':
            this.oMap.setCenter(new BMap.Point(cxy.x, cxy.y));
			break;
		case 'tianditu':
		    this.oMap.setCenterAtLngLat(new TLngLat(cxy.x, cxy.y));
			break;
		case "bingmap":
			this.oMap.setView({center:new Microsoft.Maps.Location(cxy.x, cxy.y)});
		break;
		}
	},
	_resize_proj:function (){
		var cxy = gSelf.getCenter();
		var latlng = gEcnu.Util.shToLngLat(cxy.x, cxy.y);
		switch (this.mapSource) {
		case 'google': 
            this.oMap.setCenter(new google.maps.LatLng(latlng.lat, latlng.lng));
			break;
		case 'baidu':
            this.oMap.setCenter(new BMap.Point(latlng.lng, latlng.lat));
			break;
		case 'tianditu':
		    var latlng = gEcnu.Util.shToLngLat(cxy.x-370, cxy.y+230);
		    this.oMap.setCenterAtLngLat(new TLngLat(latlng.lng, latlng.lat));
			break;
		case "bingmap":
			var latlng = gEcnu.Util.shToLngLat(cxy.x-370, cxy.y+230);
			this.oMap.setView({center:new Microsoft.Maps.Location(latlng.lat, latlng.lng)});
		break;
		}
		

	},
	/**
	 * 刷新地图
	 */
	 renew: function () {  
		this._super();
		var coordsys=gSelf.coordsFlag;
	    if(coordsys=='GEOGRAPHIC'){
	    	this._renew_geo();
	    }else{
	    	this._renew_proj();
	    }	
		
	},
	_renew_geo:function (){ 
		var cxy = this._map.getCenter();
		var zoom = this._map.getZoom();
		var mapsource=this.mapSource;
		var gPxScale=this.otherPxScale; console.log('gPxScale',gPxScale);
		var mapz=zoom.z;    console.log('own level',zoom.zl);
		var LngDiff=gPxScale*gSelf.w; 
		switch (mapsource) {
			case 'google':
			this.oMap.setCenter(new google.maps.LatLng(cxy.y, cxy.x));
			var zl=10-Math.log(mapz/LngDiff)/Math.log(2); //zl=10时 经度差
			this.oMap.setZoom(zl);	
			break;
			case 'tianditu':
			var zl=10-Math.log(mapz/LngDiff)/Math.log(2);
			this.oMap.centerAndZoom(new TLngLat(cxy.x, cxy.y),zl);
			break;
			case "baidu":
			var zl=11-Math.log(mapz/LngDiff)/Math.log(2);
			this.oMap.centerAndZoom(new BMap.Point(cxy.x, cxy.y), zl);
			break;
			case "bingmap":
			var zl=10-Math.log(mapz/LngDiff)/Math.log(2); 
			this.oMap.setView({center: new Microsoft.Maps.Location(cxy.x, cxy.y), zoom: zl});
			break;
		}
	},
	_renew_proj: function () {
		this._super();
		var cxy = this._map.getCenter();
		var zoom = this._map.getZoom();
		var latlng = gEcnu.Util.shToLngLat(cxy.x, cxy.y);
		var mapsource=this.mapSource;
		switch (mapsource) {
		case 'google':
			this.oMap.setCenter(new google.maps.LatLng(latlng.lat, latlng.lng));
			this.oMap.setZoom(18 - zoom.zl);
			break;
		case 'tianditu':
		    var latlng = gEcnu.Util.shToLngLat(cxy.x-370, cxy.y+230);
			this.oMap.centerAndZoom(new TLngLat(latlng.lng, latlng.lat), 18 - zoom.zl);
			break;
		case 'baidu':
			this.oMap.centerAndZoom(new BMap.Point(latlng.lng, latlng.lat), 19 - zoom.zl);
			break;
		case "bingmap":
			var latlng = gEcnu.Util.shToLngLat(cxy.x-370, cxy.y+230);
          	var center = new Microsoft.Maps.Location(latlng.lat,latlng.lng);
			this.oMap.setView({center: center, zoom: 18 - zoom.zl});
		break;
		}

	}
});

gEcnu.Layer.Feature = gEcnu.Layer.extend({
	init: function (id, style, options,labelOptions) {  //labelOptions{'autoLabel':是否标注（bool）,'lableField':标注字段,'Mapping':映射关系}
	//labelOptions {'autoLabel':true,'lableField':'LANDTYPE','Mapping':{'grass':'草地'，'forest':'林地'，。。。} }
		this._super(id);
		this.options = {
			zIndex: 5
		};
		this._land_label=false;
		if((typeof labelOptions)!="undefined"){
           this._autoLabel=labelOptions.autoLabel;
           this._labelField=labelOptions.lableField;
           if((typeof labelOptions.Mapping)!="undefined"){
             this._labelFieldMapping=labelOptions.Mapping;
           }
		}
		this.options = gEcnu.Util.setOptions(this, options);
		if (arguments.length > 1) {
			this.style = style;
		} else {
			var defaultStyle = new gEcnu.Style({});
			this.style = defaultStyle;
		}
		this.oClass = 'featureLayer';
		this.featureID = 0;
		this.ctrlLyrs = [];
		this._opacity=false;
		this.resetStyle=false;  //重设样式的标志
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
		this._layerContainer.style.left="0px";
		this._layerContainer.style.top="0px";
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
	 * 设置图层显示样式
	 * @param style gEcnu.Style
	 */
	setStyle: function (style) { //此处参数style为gEcnu.Style的实例
		this.style = style;
		this.resetStyle=true;
		this.renew();
	},
	/**
	 * 设置标注字段
	 */
	setLabelOptions:function (labelOptions){
	//labelOptions {'autoLabel':true,'lableField':'LANDTYPE','Mapping':{'grass':'草地',...} }
		if((typeof labelOptions)!="undefined"){
           this._autoLabel=labelOptions.autoLabel;
           this._labelField=labelOptions.lableField;
           if((typeof labelOptions.Mapping)!="undefined"){
             this._labelFieldMapping=labelOptions.Mapping;
           }
		}

	},
	/**
	 * 标注激活
	 */
	activeLabel:function(){   
       if((typeof this._labelField)=="undefined"){
       	 alert('未定义标注字段！');
       	 return;
       }
       if(this._autoLabel){return;}
       this._autoLabel=true;
       this.renew();
	},
	/**
	 * 取消标注
	 */
	deactiveLabel:function(){
		if(!this._autoLabel){return;}
        this._autoLabel=false;
        this.renew();
	},
	/**
	 * 透明激活
	 */
	activeOpacity:function(){   
       this._opacity=true;
       this.renew();
	},
	/**
	 * 取消透明
	 */
	 deactiveOpacity:function(){
		this._opacity=false;
        this.renew();
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
			//console.log(feature);
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
		//map.curScrPolys = gEcnu.Graph.getCurViewPolys(oFeature);
		this.renew();
	},
	addFeatures: function (features) {
		for (var i = 0; i < features.length; i++) {
			this.addFeature(features[i]);
			//console.log(features[0]);
		}
	},
	removeFeatures: function (features) {
		for (var i = 0; i < features.length; i++) {
			this.removeFeature(features[i]);
		}
	},
	removeFeaturesByFiled: function (key,value) {
		var oFeatures = this.getAllFeatures();
		var oFeatures_len=oFeatures.length;
		for(var i=0;i<oFeatures_len;i++){
           var tmpFea=oFeatures[i];
           if(tmpFea.fields[key]==value){
           	 this.removeFeature(tmpFea);
           }
		}
	},
	/**
	 * 要素置空
	 */
	removeAllFeatures: function () {
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
			this.setFeatureStyle(this, oFeatures[i].info);
			oFeatures[i].onDraw(this);
		}
	},
	setFeatureStyle: function () {

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
	refresh:function(){
        var oFeatures = this.getAllFeatures();
		for (var i = 0; i < oFeatures.length; i++) {
			//this.oFeatures.push(oFeatures[i]);
			oFeatures[i].onAdd(this);
		}
	},
/*	refresh:function(){
        var oFeatures = this.getAllFeatures();
        this.removeAllFeatures();
		for (var i = 0; i < oFeatures.length; i++) {
			this.oFeatures.push(oFeatures[i]);
			oFeatures[i].onAdd(this);
		}
	},*/
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
	/*
	*更换制定feature
	*/
	updateFea:function(oldfea,newfea){
		var feasArr=this.oFeatures;
        var len_feasArr=feasArr.length;
        for(var i=(len_feasArr-1);i>=0;i--){
            if(feasArr[i]==oldfea){
                feasArr.splice(i,1,newfea);
          	    break;
            }
        }
	},
	/**
	 * 获取视窗范围内要素
	 * @returns {Array}
	 */
	getScrFeatures: function () {
		var returnFeas=[];
		var allfeatures=this.oFeatures;
		var map=this._map;
		var len_fea=allfeatures.length;
		if(len_fea<=0){return returnFeas;}
		for(var i=0;i<len_fea;i++){
			var curFea=allfeatures[i];
			var shpBox=curFea.shape.shpBox;
			var fea_xmin=shpBox[0];
			var fea_ymin=shpBox[1];
			var fea_xmax=shpBox[2];
			var fea_ymax=shpBox[3];
			//获取map对象的视窗范围
			var mapbounds=map.getBounds();
			var map_xmin=mapbounds.nw.x;
			var map_ymin=mapbounds.se.y;
			var map_xmax=mapbounds.se.x;
			var map_ymax=mapbounds.nw.y;
			var leftbot=(fea_xmin>=map_xmin&&fea_xmin<map_xmax&&fea_ymin>=map_ymin&&fea_ymin<=map_ymax);
			var lefttop=(fea_xmin>=map_xmin&&fea_xmin<map_xmax&&fea_ymax>=map_ymin&&fea_ymax<=map_ymax);
			var rightbot=(fea_xmax>=map_xmin&&fea_xmax<map_xmax&&fea_ymin>=map_ymin&&fea_ymin<=map_ymax);
			var righttop=(fea_xmax>=map_xmin&&fea_xmax<map_xmax&&fea_ymax>=map_ymin&&fea_ymax<=map_ymax);
			if(leftbot||lefttop||rightbot||righttop){
               returnFeas.push(curFea);
			}
		}
		return returnFeas;

	},
	/**
	 * 获取画布上下文
	 * @returns {*}
	 */
	getCtx: function () {
		return this._ctx;
	}
});

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
		this.oClass = 'overlayLayer';
	},
	setStyle:function (style){
        this.style=style;
	},
	/**
	 * 样式初始化
	 */
	initStyle: function () {
		var ctx = this.getCtx();
		ctx.strokeStyle = 'green';
		ctx.fillStyle = 'green';
		this._layerContainer.style.left="0px";
		this._layerContainer.style.top="0px";
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
 * 文本层
 * @type {*|void}
 */
gEcnu.Layer.Text = gEcnu.Layer.extend({
	init: function (id,style,options) {
		this._super(id, options);
		this.options = {
			opacity: 1.0,
			zIndex: 19
		}
		this.options = gEcnu.Util.setOptions(this, options);
		this.id = id;
		this.oClass = 'textLayer';
		this.oTexts = [];
		this.style=style;
		this.resetStyle=false;  //重设样式的标志
	},
	_initLayerContainer: function (id, w, h) {
		var div = gEcnu.Util.createDiv(id, w, h, true);
		this._layerContainer = div;
	},
	addText: function (textObj) {
		if (!gEcnu.Util.isInArray(this.oTexts, textObj)) {
			this.oTexts.push(textObj);
			textObj.onAdd(this);
		}
	},
	removeText: function (textObj) {
		var oText = [];
		for (var i = 0, a = 0; i < this.oTexts.length; i++) {
			if (this.oTexts[i] != textObj) {
				oText[a] = this.oTexts[i];
				a++;
			} else {
				this.oTexts[i].onRemove(this);
			}
		}
		this.oTexts = oText;
		this.renew();
	},
	addTexts: function (textObjs) {
		var oTexts = this.oTexts;
		for (var i = 0; i < textObjs.length; i++) {
			this.addText(textObjs[i]);
		}
	},
	removeTexts: function (textObjs) {
		var removeTexts = textObjs;
		var len_removeTexts=removeTexts.length;
		for (var i = 0; i < len_removeTexts; i++) {
			var tmpremoveText=removeTexts[i];
			this.removeText(tmpremoveText);
		}
	},
	removeTextsByField: function (key,value) {
		var removeTexts = this.oTexts;
		var len_removeTexts=removeTexts.length;
		for (var i = 0; i < len_removeTexts; i++) {
			var tmpremoveText=removeTexts[i];
			if(tmpremoveText.fields[key]==value){
			  this.removeText(tmpremoveText);
			}
		}
	},
	getAllTexts: function () {
		//需要清空
		return this.oTexts;
	},
	removeAllTexts: function () {
		//需要清空
		this._layerContainer.innerHTML = "";
        this.oTexts=[];
        this.renew();
	},
	/**
	 * 设置图层显示样式
	 * @param style gEcnu.Style
	 */
	setStyle: function (style) { //此处参数style为gEcnu.Style的实例
		this.style = style;
		this.resetStyle=true;
		this.renew();
	},
	renew: function () {
		this._super();
		for (var i = 0; i < this.oTexts.length; i++) {
			this.oTexts[i].renew();
		}
	},
	resize: function () {
		this._super();
		this.renew();
	},
	getTextsInWindow:function(){
		var oText = this.oTexts;
		var curTexts=[];
		var oText_len=oText.length;
		var mapWindow=this._map.getBounds();
	    var minx=mapWindow.sw.x;
	    var maxx=mapWindow.ne.x;
	    var miny=mapWindow.sw.y;
	    var maxy=mapWindow.ne.y;
	    var left_top=gEcnu.Util.worldToScreen(minx,maxy);
        var right_bot=gEcnu.Util.worldToScreen(maxx,miny);
        minx=left_top.x;
        maxx=right_bot.x;
        miny=left_top.y;
        maxy=right_bot.y;
		for (var i = 0; i < oText_len; i++) {
			var tmptext=oText[i];
			var left_top=(tmptext.boxScrSize.xmin>minx&&tmptext.boxScrSize.xmin<maxx&&tmptext.boxScrSize.ymax>miny&&tmptext.boxScrSize.ymax<maxy);
			var right_top=(tmptext.boxScrSize.xmax>minx&&tmptext.boxScrSize.xmax<maxx&&tmptext.boxScrSize.ymax>miny&&tmptext.boxScrSize.ymax<maxy);
			var left_bottom=(tmptext.boxScrSize.xmin>minx&&tmptext.boxScrSize.xmin<maxx&&tmptext.boxScrSize.ymin>miny&&tmptext.boxScrSize.ymin<maxy);
			var left_top=(tmptext.boxScrSize.xmax>minx&&tmptext.boxScrSize.xmax<maxx&&tmptext.boxScrSize.ymin>miny&&tmptext.boxScrSize.ymin<maxy);
			if(left_top||right_top||left_bottom||left_top){
				curTexts.push(tmptext);
			}
		}
		return curTexts;
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
		this.oClass = 'markerLayer';
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
	removeMarker: function (marker) {
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
	getAllMarkers: function () {
		return this.oMarkers;	
	},
	addMarkers: function (markers) {
		var oMarkers = this.oMarkers;
		for (var i = 0; i < markers.length; i++) {
			this.addMarker(markers[i]);
		}
	},
	removeMarkers: function (markers) {
		var removeMarkers = markers;
		var len_removeMarkers=removeMarkers.length;
		for (var i = 0; i < len_removeMarkers; i++) {
			var tmpremoveMark=removeMarkers[i];
			this.removeMarker(tmpremoveMark);
		}
	},
	removeAllMarkers:function(){
		var oMarkers = this.oMarkers;
        this.removeMarkers(oMarkers);
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
	},
	getMarkersInWindow:function(){
		var oMarker = this.oMarkers;
		var curMarkers=[];
		var oMarker_len=oMarker.length;
		var mapWindow=this._map.getBounds();
		for (var i = 0; i < oMarker_len; i++) {
			var tmpmarker=oMarker[i];
			var minx=mapWindow.sw.x;
			var maxx=mapWindow.ne.x;
			var miny=mapWindow.sw.y;
			var maxy=mapWindow.ne.y;
			if(tmpmarker.x>minx&&tmpmarker.x<maxx&&tmpmarker.y>miny&&tmpmarker.y<maxy){
				curMarkers.push(tmpmarker);
			}
		}
		return curMarkers;
	}
});
// 经纬度坐标下的动态图的zoom值与第三方地图zoomlevel值的对应关系
// zoom=1.1*Math.pow(2,10-zoomlevel)
// zl:10 对应 z:1.1
function showOtherMap_self() { 
	var coordsys=gSelf.coordsFlag;
	if(coordsys=='GEOGRAPHIC'){
		addOther_geo();
	}else{
		addOther_proj();
	}	
}
//针对经纬度图层 匹配第三方地图
function addOther_geo(){
	var cxy = gSelf.getCenter(); 
	var zoom = gSelf.getZoom();
	var z=zoom.z;    
	switch (gSelf.activeLayer.mapSource) {
	case 'google':
		var gPxScale=0.001373291015625;     //像素比例尺
		var LngDiff=gPxScale*gSelf.w;  //zl=10时 经度差
		var zl=Math.ceil(10-Math.log(z/LngDiff)/Math.log(2));  
		if(zl>18){ zl=18;}
		if(zl<1){  zl=1; }
	    var mapzoom=LngDiff*Math.pow(2,10-zl);   
	    gSelf.zoom=mapzoom;   
		var mapOptions = {
			center: new google.maps.LatLng(cxy.y, cxy.x),
			zoom: zl,
			mapTypeControl: false,
			panControl: false, //停用平移控件
			zoomControl: false, //停用缩放控件
			scaleControl: false, //停用比例尺控件
			rotateControl: false,
			streetViewControl: false
		};
		var tmpele = document.getElementById(gSelf.activeLayer.id);
		gSelf.activeLayer.oMap = new google.maps.Map(tmpele, mapOptions);
		gSelf.activeLayer.oMap.Minlevel=1;
		gSelf.activeLayer.oMap.MaxLevel=18;
		gSelf.activeLayer.oMap.targetLevel = 10;   //以zl=10级别为目标，进行匹配
		break;
	case 'tianditu':
		var gPxScale=0.0013767249999999897;     
		var LngDiff=gPxScale*gSelf.w;  //zl=10时 经度差
		var zl=Math.ceil(10-Math.log(z/LngDiff)/Math.log(2)); 
		if(zl>18){ zl=18;}
		if(zl<1){  zl=1; } 
		var mapzoom=LngDiff*Math.pow(2,10-zl);  
		gSelf.zoom=mapzoom;
		gSelf.activeLayer.oMap = new TMap(gSelf.activeLayer.id);
		gSelf.activeLayer.oMap.centerAndZoom(new TLngLat(cxy.x,cxy.y), zl);
		gSelf.activeLayer.oMap.Minlevel=1;
		gSelf.activeLayer.oMap.MaxLevel=18;
		gSelf.activeLayer.oMap.targetLevel = 10;
		break;
		case "baidu": 
		var gPxScale=0.0011498312500000019;     
		var LngDiff=gPxScale*gSelf.w;  //zl=11时 经度差
		var zl=Math.ceil(11-Math.log(z/LngDiff)/Math.log(2));  
		if(zl>19){ zl=19;}
		if(zl<1){  zl=1; }
		var mapzoom=LngDiff*Math.pow(2,11-zl);  
		gSelf.zoom=mapzoom;
		var centerPt = new BMap.Point(cxy.x, cxy.y);
		gSelf.activeLayer.oMap = new BMap.Map(gSelf.activeLayer.id);
		gSelf.activeLayer.oMap.centerAndZoom(centerPt, zl);
		gSelf.activeLayer.oMap.Minlevel=1;
		gSelf.activeLayer.oMap.MaxLevel=19;
		gSelf.activeLayer.oMap.targetLevel = 11;
		break;
	case "bingmap":
		var gPxScale=0.001373291015625 ;   //zl=10时的像素比例尺
		var LngDiff=gPxScale*gSelf.w;  
		var zl=Math.ceil(10-Math.log(z/LngDiff)/Math.log(2));  
		if(zl>20){ zl=20;}
		if(zl<1){  zl=1; }
		var mapzoom=LngDiff*Math.pow(2,10-zl);  
		gSelf.zoom=mapzoom;
		var centerPt = new Microsoft.Maps.Location(cxy.x,cxy.y);
		var mapOptions = {
			credentials: "Aim92CS40Hzcidl63lqWEM_Jxhsgg9sfE7YlKwtHAhN9-4TmR5Hn6CneOfZx2RcZ",
			center: centerPt,   //new Microsoft.Maps.Location(31, 121),
			mapTypeId: Microsoft.Maps.MapTypeId.aerial,
			zoom:zl
		};
		gSelf.activeLayer.oMap = new Microsoft.Maps.Map(document.getElementById(gSelf.activeLayer.id), mapOptions);
		gSelf.activeLayer.oMap.setView({center: centerPt, zoom: zl});
		gSelf.activeLayer.oMap.Minlevel=1;
		gSelf.activeLayer.oMap.MaxLevel=20;
		gSelf.activeLayer.oMap.targetLevel = 10;

	break;
	}
	    //重新请求动态图
		var oLayers = gSelf.getAllLayers(); 
    	for (var i = 0; i < oLayers.length; i++) {
			if (oLayers[i].oClass != 'otherLayer') { 
				oLayers[i].renew();
			}
		}

}
//以上海坐标系为主 进行第三方地图的匹配
function addOther_proj() {  
	var cxy = gSelf.getCenter();
	var zoom = gSelf.getZoom();
	var latlng = gEcnu.Util.shToLngLat(cxy.x, cxy.y);
	var w = gSelf.getSize().w;
	var MeterPerPx=zoom.z/w;
	var zl=parseInt(Math.log(MeterPerPx)/Math.log(2))+1;
	var MeterPerPx=Math.pow(2,(zl-1));
	gSelf.zoom=MeterPerPx*w;  
	//gSelf.zl=zl;
	switch (gSelf.activeLayer.mapSource) {
	case 'google':
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
		var tmpele = document.getElementById(gSelf.activeLayer.id);
		gSelf.activeLayer.oMap = new google.maps.Map(tmpele, mapOptions);
		gSelf.activeLayer.oMap.Minlevel=1;
		gSelf.activeLayer.oMap.MaxLevel=18;
		gSelf.activeLayer.oMap.targetLevel = 10;   //以zl=10级别为目标，进行匹配
		break;
	case 'baidu':
		var centerPt = new BMap.Point(latlng.lng, latlng.lat);
		gSelf.activeLayer.oMap = new BMap.Map(gSelf.activeLayer.id);
		gSelf.activeLayer.oMap.centerAndZoom(centerPt, 19 - zl);
		gSelf.activeLayer.oMap.Minlevel=1;
		gSelf.activeLayer.oMap.MaxLevel=19;
		gSelf.activeLayer.oMap.targetLevel = 11;   
		break;
	case 'tianditu':
	    var latlng = gEcnu.Util.shToLngLat(cxy.x-370, cxy.y+230);
		gSelf.activeLayer.oMap = new TMap(gSelf.activeLayer.id);
		gSelf.activeLayer.oMap.centerAndZoom(new TLngLat(latlng.lng, latlng.lat), 18 - zl);
		gSelf.activeLayer.oMap.Minlevel=1;
		gSelf.activeLayer.oMap.MaxLevel=18;
		gSelf.activeLayer.oMap.targetLevel = 10; 
		break;
	case "bingmap":
		var latlng = gEcnu.Util.shToLngLat(cxy.x-370, cxy.y+230);
        var center = new Microsoft.Maps.Location(latlng.lat,latlng.lng);
		var mapOptions = {
			credentials: "Aim92CS40Hzcidl63lqWEM_Jxhsgg9sfE7YlKwtHAhN9-4TmR5Hn6CneOfZx2RcZ",
			center: center,   //new Microsoft.Maps.Location(31, 121),
			mapTypeId: Microsoft.Maps.MapTypeId.aerial,    //aerial
			zoom:18-zl
			//showScalebar:true
		} 
		gSelf.activeLayer.oMap = new Microsoft.Maps.Map(document.getElementById(gSelf.activeLayer.id), mapOptions);
		//gSelf.activeLayer.oMap.setView({center: center, zoom: 18-zl});
		gSelf.activeLayer.oMap.Minlevel=1;
		gSelf.activeLayer.oMap.MaxLevel=20;
		gSelf.activeLayer.oMap.targetLevel = 10; 
	break;
	}
	//重新请求动态图
		var oLayers = gSelf.getAllLayers(); 
    	for (var i = 0; i < oLayers.length; i++) {
			if (oLayers[i].oClass != 'otherLayer') { 
				oLayers[i].renew();
			}
		}
}
function getLocation_bingmap(map){
	var geoLocationProvider = new Microsoft.Maps.GeoLocationProvider(map);
     geoLocationProvider.getCurrentPosition();
}
/**
*@name gEcnu.Map
*@class
*@param {String} containerId 容器ID
*@property {String} name 地图对象名称
*@property {String} mapTool 地图工具
*@gEcnu.Map类
*@example 
*var gMap = new gEcnu.Map('map');
*/
var gSelf;
gEcnu.Map = gClass.extend(
	/**
	* @lends gEcnu.Map.prototype
	*/
{
	 /**
	 * 地图配置信息初始化_私有函数
	 * @param {String} containerId 容器ID
	 * @public
	 */
	init: function (containerId) {
		gSelf = this;
		this._initContainer(containerId);
		this._initProp();
		this.overLayer = new gEcnu.Layer.Overlay('overlay');
		this.mLayer = new gEcnu.Layer.Marker('markerLayer');
		this.addLayer(this.mLayer);
		this.addLayer(this.overLayer);
		this._initEvent();
		this.activeLayer = null;
		document.ondragstart = function () {
			return false;
		};
	},
	/**
	 * 地图容器初始化_私有函数
	 * @param {String} containerId 容器ID
	 * @public 
	 */
	_initContainer: function (containerId) {
		// this._container = $('#' + containerId);
		this._container = document.getElementById(containerId);
		this.w = this._container.clientWidth;
		this.h = this._container.clientHeight;
		this._container.style.overflow = 'hidden';
	},
	/**
	 * 地图对象属性初始化_私有函数
	 * @public
	 */
	_initProp: function () {
		this.oLayers = [];
		this.mode = "map";
		this.mapTool = "pan";
		this.dragging = false;
		this.isTouch = false;
		this.coordsFlag="PROJECTED";  //投影坐标系 or 地理坐标系
		this.oLayers = [];
		this.cx = 0;
		this.cy = 0;
		this.zl = 1;
		this.zl_pre=1;
		this.zoom =parseInt(1*this.w);
		this.ownDyn = false;
		this.ownTile = false;
		this.ownOther = false;
		this.maxLevel = gEcnu.config.maxLevel;
		this.minLevel = gEcnu.config.minLevel;
		this.tileWidth = gEcnu.config.tileWidth;
		this.tileHeight = gEcnu.config.tileHeight;
		this.cusEvtArr = [];
		this.tileCount=0;   //多层切片
		this.disUnit = '米';
		this.areaUnit = '平方米';

		this.cursorStyle={'pan':'default','dis':'default','area':'default','select':'default','addpoint':'default','delpoint':'default','mark':'default','draw':'default'};

		this.mapLeft = this._container.offsetLeft;
		this.mapTop = this._container.offsetTop;

		this.disMinus = 0;
		this.pinchPt1;
		this.pinchPt2;
		this.startDis;
		this.endDis;

		this.startX = 0;
		this.startY = 0;
		this.startScrX = 0;
		this.startSrcY = 0;

		this.lengthPtArr = [];
		this.areaPtArr = [];

		this.oControls = [];

		this.resizeTimer = null;
		this.forbidPan_ex=false;//用来判断是否屏蔽地图平移、缩放操作

		this.curScrPolys = [];
		this.tlr = 5;

		//this.webHost = "http://" + window.location.hostname;
		// this.webHost = 'http://' + gEcnu.config.webHostIP;
		// this.serverURL = this.webHost + ":" + gEcnu.config.port + "/";
		this.serverURL = gEcnu.config.geoserver;
		this.mapserverURL = gEcnu.config.mapserver ?  gEcnu.config.mapserver : gEcnu.config.geoserver;
		// this.dynMapURL = gEcnu.config.dynMapURL ? gEcnu.config.dynMapURL :  this.serverURL;
		// this.tileMapURL = gEcnu.config.tileMapURL ? gEcnu.config.tileMapURL : this.serverURL;
		//this.webMapURL = this.serverURL + "WebMap";
		this.webMapURL = this.mapserverURL  + "WebMap";
		this.webFeatureUrl=this.serverURL + "WebFeature";
		//this.tileMapURL = this.serverURL + "TileMap";
		this.tileMapURL = this.mapserverURL+ "TileMap";
		this.fileServer = this.mapserverURL + "FileServer?fn=";
		
	},
	/**
	 * 事件监听注册_私有函数
	 * @public
	 */
	_initEvent: function () {

		var startName = "ontouchstart";
		var doc = document.documentElement;
		var ctn;
		if (gEcnu.Util.getIEVersion() == 0) {
			ctn = this.mLayer.getLayerContainer();
		} else {
			ctn = this._container;
		}
		//var ctn = this.mLayer.getLayerContainer();
		if (startName in doc) {
			ctn.ontouchstart = mapMouseDownEvt_pan;
			ctn.ontouchmove = mapMouseMoveEvt;
			ctn.ontouchend = mapMouseUpEvt;
		}
		
		//ctn.onmousedown=mapMouseDownEvt_pan;
		//gEcnu.Util.addEvtHandler(ctn, 'mousedown', mapMouseDownEvt);
		gEcnu.Util.addEvtHandler(ctn, 'mousedown', mapMouseDownEvt_pan);
		gEcnu.Util.addEvtHandler(ctn, 'mousemove', mapMouseMoveEvt);
		gEcnu.Util.addEvtHandler(ctn, 'mouseup', mapMouseUpEvt);
		gEcnu.Util.addEvtHandler(ctn, 'mousewheel', mapMouseWheelEvt);
		gEcnu.Util.addEvtHandler(ctn, 'dblclick', mapMouseDblEvt);


		function mapMouseDblEvt(e) {
			if (gSelf.mode == 'map') {
				calLenAreMouseDblClickEvt(e);
			} else {
				gSelf.mousedblclickCustom(e);
			}
		}


	

        function mapMouseDownEvt_pan(e){ 
        	var e = e ? e : window.event;
            if(!window.event) {e.preventDefault();}   //
            gSelf.tmpMapmode=gSelf.mode;
            gSelf.tmpMaptool=gSelf.mapTool;
            if(gEcnu.Util.ifctrl(e)){
               gSelf.mode = 'map';
               gSelf.mapTool="pan";
            }
            if(gSelf.mode == 'map'&&(gSelf.mapTool != "rulerLength")&&(gSelf.mapTool != "rulerArea")){                     //  mapTool==pan时
                //地图浏览
                if(gSelf.forbidPan_ex){
                	gSelf.mode=gSelf.tmpMapmode;
                    gSelf.mapTool=gSelf.tmpMaptool;
                	return;
                }
                mapMouseDown_pan(e);
                document.onmousemove=function(e){
            	    if(gSelf.forbidPan_ex){
                	    gSelf.mode=gSelf.tmpMapmode;
                        gSelf.mapTool=gSelf.tmpMaptool;
                	    return;
                    }
                    mapMouseMove_pan(e);
                }
                document.onmouseup=function(e){
                	if(gSelf.forbidPan_ex){
                	    gSelf.mode=gSelf.tmpMapmode;
                        gSelf.mapTool=gSelf.tmpMaptool;
                	    return;
                    }
                	document.onmousemove=null;
                    document.onmouseup=null;
                	mapMouseUp_pan(e);  
                }
            }else{  //非浏览模式（地图绘制或者地图量算）
            	mapMouseDown_pan(e);   //  ??????
                mapMouseDownEvt(e);
            }
            var mosxy = gEcnu.Util.getMouseXY(gSelf._container,e);
            var geoXY=gEcnu.Util.screenToWorld(mosxy.x,mosxy.y);
			var pos={"screenX":mosxy.x,"screenY":mosxy.y,"geoX":geoXY.x,"geoY":geoXY.y};
			gSelf._mousedown_EX(e,pos);
        }
		function mapMouseDown_pan(e) {
			//gEcnu.Util.preventDefault(e);
			//gEcnu.Util.stopPropagation(e);
			if (gSelf.mode == 'map') {
				if (e.type == 'touchstart' && e.touches.length == 2) {
					var tp1 = gEcnu.Util.getTouchPt(e.touches[0]);
					var tp2 = gEcnu.Util.getTouchPt(e.touches[1]);
					gSelf.pinchPt1 = tp1;
					gSelf.pinchPt2 = tp2;
					gSelf.startDis = gEcnu.Util.p1top2Dis(tp1, tp2);
				} else {
					if (gSelf.mapTool == 'pan') { 
						gSelf.dragging = true;
					}
					var mxy, scrxy;
					if (e.type == 'touchstart') {
						mxy = gEcnu.Util.getTouchXY(e);
						scrxy = gEcnu.Util.getTouchPos(e);
						
					} else {
						mxy = gEcnu.Util.getMouseXY(gSelf._container,e);
						scrxy = gEcnu.Util.getMousePos(e);
					}
					gSelf.startX = mxy.x;
					gSelf.startY = mxy.y;
					gSelf.startScrX = scrxy.x;
					gSelf.startScrY = scrxy.y;
					var oLayers = gSelf.getAllLayers();
					for (var i = 0; i < oLayers.length; i++) {
						if (oLayers[i].oClass == 'tileLayer') {
							oLayers[i].startLeft = gEcnu.Util.delpx(oLayers[i].baseMap.style.left);
							oLayers[i].startTop = gEcnu.Util.delpx(oLayers[i].baseMap.style.top);
						} else {
                            oLayers[i].startLeft = gEcnu.Util.delpx(oLayers[i]._layerContainer.style.left);
							oLayers[i].startTop = gEcnu.Util.delpx(oLayers[i]._layerContainer.style.top);
							
						}
					}
				}
			} 
			
		}
		function mapMouseDownEvt(e) {
			gEcnu.Util.preventDefault(e);
			gEcnu.Util.stopPropagation(e);
            if (gSelf.mode == 'map') { 
            	calLenAreMouseDownEvt(e);	
			}else{
				gSelf.mousedownCustom(e);
			}
		}
		function mapMouseMove_pan(e) {
			gEcnu.Util.preventDefault(e);
            if (gSelf.mode == 'map'&&gSelf.mapTool == 'pan') {
				var mxy, scrxy;
				if (e.type == 'touchmove' && e.touches.length == 2) {
					var tp1 = gEcnu.Util.getTouchPt(e.touches[0]);
					var tp2 = gEcnu.Util.getTouchPt(e.touches[1]);
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
						mxy = gEcnu.Util.getMouseXY(gSelf._container,e);
						scrxy = gEcnu.Util.getMousePos(e);
					}
					gSelf.currentX = mxy.x;
					gSelf.currentY = mxy.y;
					if (gSelf.dragging && gSelf.mapTool == 'pan') {
						var dltx = scrxy.x - gSelf.startScrX;
						var dlty = scrxy.y - gSelf.startScrY;
						var oLayers = gSelf.getAllLayers();
						if (Math.abs(dltx) > 0 || Math.abs(dlty) > 0) {
						    for (var i = 0; i < oLayers.length; i++) {
						    	if (oLayers[i].visible) {
						    		oLayers[i].onDrag(dltx, dlty);
						    		if(oLayers[i].oClass=='dynLayer'){ //取消动态图的载入
						    			gEcnu.Layer.Dyn._removeDynLoad(oLayers[i]);
						    		}
						    	}
						    }
					    }
					}
				}
			}
		}
		function mapMouseMoveEvt(e) {
			gEcnu.Util.preventDefault(e);
			if (gSelf.mode == 'map') {
				var mxy;
				if (e.type == 'touchmove') {
					mxy = gEcnu.Util.getTouchXY(e);
				}else{
					mxy = gEcnu.Util.getMouseXY(gSelf._container,e);
				}
	            var maptool=gSelf.mapTool;
	            switch(maptool){
	            	case 'pan':
	            	    gSelf.mLayer.getLayerContainer().style.cursor = gSelf.cursorStyle['pan'];
	            	break;
	            	case 'rulerLength':
	            	    gSelf.mLayer.getLayerContainer().style.cursor = gSelf.cursorStyle['dis'];
	            	break;
	            	case 'rulerArea':
	            	    gSelf.mLayer.getLayerContainer().style.cursor = gSelf.cursorStyle['area'];
	            	break;
	            }
	        

				gSelf.currentX = mxy.x;
				gSelf.currentY = mxy.y;
				calLenAreMouseMoveEvt(e);
			}else{
                gSelf.mousemoveCustom(e);
			}
			var mosxy = gEcnu.Util.getMouseXY(gSelf._container,e);
            var geoXY=gEcnu.Util.screenToWorld(mosxy.x,mosxy.y);
			var pos={"screenX":mosxy.x,"screenY":mosxy.y,"geoX":geoXY.x,"geoY":geoXY.y};
			gSelf._mousemove_EX(e,pos);
		}
		function mapMouseUp_pan(e) { 
			if (gSelf.mode == 'map' && gSelf.mapTool == 'pan') {
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
						mxy = gEcnu.Util.getMouseXY(gSelf._container,e);
						scrxy = gEcnu.Util.getMousePos(e);
					}
					if (gSelf.mapTool == 'pan') {

						var dltx = scrxy.x - gSelf.startScrX;
						var dlty = scrxy.y - gSelf.startScrY;
						if (Math.abs(dltx) > 0 || Math.abs(dlty) > 0) {
						    var scxy = gSelf.getScreenCenter();
						    var nscx = scxy.x - dltx;
						    var nscy = scxy.y - dlty;

						    var wxy = gEcnu.Util.screenToWorld(nscx, nscy);
						   
						    gSelf.setCenter(wxy.x, wxy.y);
						    var oLayers = gSelf.getAllLayers();
						    var lyrs_len=oLayers.length;
						    for (var i = 0; i <lyrs_len ; i++) {
						    	if (oLayers[i].oClass == 'tileLayer' && oLayers[i].visible) {
						    		oLayers[i].xOffset = oLayers[i].xOffset + dltx;
						    		oLayers[i].yOffset = oLayers[i].yOffset + dlty;  
						    		oLayers[i].baseMap.style.left = oLayers[i].startLeft + dltx + 'px';
						    		oLayers[i].baseMap.style.top = oLayers[i].startTop + dlty + 'px';
						    	}   
						    	if (oLayers[i].visible) {
						    	 	oLayers[i].renew();
						    	}
						    }
						    gSelf.dragging = false;
						    gSelf.zl_pre=gSelf.zl;
						    gSelf._boundsChanged();
					    }
					}
				}
			}
			gSelf.mode=gSelf.tmpMapmode;
            gSelf.mapTool=gSelf.tmpMaptool;

		}
		function mapMouseUpEvt(e) {
			if (gSelf.mode == 'map'){
				//gSelf._qryAndMarker(e);
			}else{
				gSelf.mouseupCustom(e);
			}
			var mosxy = gEcnu.Util.getMouseXY(gSelf._container,e);
            var geoXY=gEcnu.Util.screenToWorld(mosxy.x,mosxy.y);
			var pos={"screenX":mosxy.x,"screenY":mosxy.y,"geoX":geoXY.x,"geoY":geoXY.y};
			gSelf._mouseup_EX(e,pos);
		}
		var mousewheel_timer;
		function mapMouseWheelEvt(e) {
			gEcnu.Util.preventDefault(e);
			if(gSelf.forbidPan_ex) return;
			clearTimeout(mousewheel_timer);
			mousewheel_timer=setTimeout(function(){
			    if (gSelf.mode == 'map'&&gSelf.mapTool== 'pan') { 
			    	var delta = e.wheelDelta || -e.detail; 	
			    	if (delta > 0) {
			    		//if (gSelf.ownTile) {
			    		if (gSelf.tileCount > 0) {
		                	if (gSelf.zl <= gSelf.minLevel) {
		                		gSelf._boundsChanged({'error':'zoomin'});
		                		return;
		                	}
		                }
		                gSelf.zl_pre=gSelf.zl;
		                var mouseXY = gEcnu.Util.getMouseXY(gSelf._container,e);
	    	    		//计算新的中心点坐标  
	    	    		//1计算改点对应的地理坐标	
	    	    		var wxy = gEcnu.Util.screenToWorld(mouseXY.x, mouseXY.y);
	    	    		var halfwdltx=(wxy.x-gSelf.cx)/2;
	    	    		var halfwdlty=(wxy.y-gSelf.cy)/2;
	    	    		var newcx=wxy.x-halfwdltx;
	    	    		var newcy=wxy.y-halfwdlty;
	    	    		gSelf.setCenter(newcx, newcy);
			    		gSelf.zoomIn(mouseXY);   //mouseXY是为了使模糊层能够正常显示
			    	} else { 
			    		//if (gSelf.ownTile) {
			    		if (gSelf.tileCount > 0) {
		                	if (gSelf.zl >= gSelf.maxLevel) { 
		                		gSelf._boundsChanged({'error':'zoomout'});
		                		return;
		                	}
		                }
		                
			    		var mouseXY = gEcnu.Util.getMouseXY(gSelf._container,e);
	    	    		//计算新的中心点坐标  
	    	    		//1计算改点对应的地理坐标	
	    	    		var wxy = gEcnu.Util.screenToWorld(mouseXY.x, mouseXY.y);
	    	    		var halfwdltx=(wxy.x-gSelf.cx)*2;
	    	    		var halfwdlty=(wxy.y-gSelf.cy)*2;
	    	    		var newcx=wxy.x-halfwdltx;
	    	    		var newcy=wxy.y-halfwdlty;
	    	    		gSelf.setCenter(newcx, newcy);
			    		gSelf.zoomOut(mouseXY);
			    	}
			    } else {
			    	gSelf.mousewheelCustom(e);
			    }
			},280);
		}

		function calLenAreMouseDownEvt(e) {
			/****进行量算****/
			var ctx = gSelf.overLayer.getCtx();
			if (gSelf.mapTool == "rulerLength") {
				
				var wxy = gEcnu.Util.screenToWorld(gSelf.startX, gSelf.startY);
				if(gSelf.coordsFlag=="GEOGRAPHIC"){
				  wxy = gEcnu.Util.screenToWorld_geo(gSelf.startX, gSelf.startY);
				}
				var measurepoint = {
					x: wxy.x,
					y: wxy.y
				};
				gSelf.lengthPtArr.push(measurepoint);

				if (gSelf.lengthPtArr.length > 1) {
					//G.gEcnu.Graph.setStyle(ctx,'rulerLine');
					//console.log(gSelf.lengthPtArr);
					gEcnu.Util.drawCalPolyline(ctx, gSelf.lengthPtArr)
				}
			} else if (gSelf.mapTool == "rulerArea") {
				var wxy = gEcnu.Util.screenToWorld(gSelf.startX, gSelf.startY);
				if(gSelf.coordsFlag=="GEOGRAPHIC"){
					wxy = gEcnu.Util.screenToWorld_geo(gSelf.startX, gSelf.startY);
				}
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
					if(gSelf.coordsFlag=="GEOGRAPHIC"){
						sxy =gEcnu.Util.worldToScreen_geo(pt.x, pt.y);
					}
					gEcnu.Util.drawLine(ctx, sxy.x, sxy.y, gSelf.currentX, gSelf.currentY);
					gEcnu.Util.drawCalPolyline(ctx, gSelf.lengthPtArr);
					if (gSelf.lengthPtArr.length == 1) {
						var currDis = 0; //当前距离
						var wxy = gEcnu.Util.screenToWorld(gSelf.currentX, gSelf.currentY);
						if(gSelf.coordsFlag=="GEOGRAPHIC"){
					    wxy = gEcnu.Util.screenToWorld_geo(gSelf.currentX, gSelf.currentY);
				        }
						currDis = Math.sqrt((wxy.x - gSelf.lengthPtArr[0].x) * (wxy.x - gSelf.lengthPtArr[0].x) + (wxy.y - gSelf.lengthPtArr[0].y) * (wxy.y - gSelf.lengthPtArr[0].y));
						var msgText1 = "当前距离：" + gSelf.convertUnit('dis',Math.round(currDis));
						var msgText2 = "总距离:" + gSelf.convertUnit('dis',Math.round(currDis));
						ctx.font = ' 13px 幼圆';
						ctx.fillStyle='#fff';
						//ctx.globalAlpha=0.6;
						ctx.fillRect(gSelf.currentX,gSelf.currentY-40,180,50);
						//ctx.globalAlpha=1;
						ctx.strokeStyle='#eaeaea';
						ctx.lineWidth=1;
						ctx.strokeRect(gSelf.currentX,gSelf.currentY-40,180,50);
						ctx.fillStyle='blue';
						ctx.fillText(msgText1, gSelf.currentX, gSelf.currentY-20);
						ctx.fillText(msgText2, gSelf.currentX, gSelf.currentY);
					} else {
						var currDis = 0; //当前距离
						var totalDis = 0; //总距离
						//当前距离
						var i = (gSelf.lengthPtArr.length - 1);
						var currDis = ""; //当前距离
						var wxy = gEcnu.Util.screenToWorld(gSelf.currentX, gSelf.currentY);
						if(gSelf.coordsFlag=="GEOGRAPHIC"){
							wxy=gEcnu.Util.screenToWorld_geo(gSelf.currentX, gSelf.currentY);
						}
						currDis = Math.sqrt((wxy.x - gSelf.lengthPtArr[i].x) * (wxy.x - gSelf.lengthPtArr[i].x) + (wxy.y - gSelf.lengthPtArr[i].y) * (wxy.y - gSelf.lengthPtArr[i].y));
						//总距离
						totalDis = gEcnu.Util.getPolylineLength(gSelf.lengthPtArr);
						totalDis = totalDis + currDis;
						// var msgText = "当前距离：" + Math.round(currDis) + "米" + ";" + "总距离:" + Math.round(totalDis) + "米";
						var msgText1 = "当前距离：" + gSelf.convertUnit('dis',Math.round(currDis)) ;
						var msgText2 = "总距离:" + gSelf.convertUnit('dis',Math.round(totalDis)) ;
						//ctx.font = 'bold 15px 幼圆';
						ctx.font = ' 13px 幼圆';
						ctx.fillStyle='#fff';
						ctx.fillRect(gSelf.currentX,gSelf.currentY-40,180,50);
						ctx.strokeStyle='#333';
						ctx.lineWidth=1;
						ctx.strokeRect(gSelf.currentX,gSelf.currentY-40,180,50);
						ctx.fillStyle='blue';
						ctx.fillText(msgText1, gSelf.currentX+5, gSelf.currentY-20);
						ctx.fillText(msgText2, gSelf.currentX+5, gSelf.currentY);
					}
				}
			} else if (gSelf.mapTool == "rulerArea") {
				if (gSelf.areaPtArr.length > 0) {
					gSelf.overLayer.clear();
					//G.gEcnu.Graph.setStyle(ctx,'rulerLine');
					var maxi = gSelf.areaPtArr.length - 1;
					var sxy = gEcnu.Util.worldToScreen(gSelf.areaPtArr[maxi].x, gSelf.areaPtArr[maxi].y);
					if(gSelf.coordsFlag=="GEOGRAPHIC"){
						sxy =gEcnu.Util.worldToScreen_geo(gSelf.areaPtArr[maxi].x, gSelf.areaPtArr[maxi].y);
					}
					gEcnu.Util.drawLine(ctx, sxy.x, sxy.y, gSelf.currentX, gSelf.currentY);
					if (gSelf.areaPtArr.length > 1) {
						gEcnu.Util.drawCalPolyline(ctx, gSelf.areaPtArr);
						var sxy = gEcnu.Util.worldToScreen(gSelf.areaPtArr[0].x, gSelf.areaPtArr[0].y);
						if(gSelf.coordsFlag=="GEOGRAPHIC"){
						sxy =gEcnu.Util.worldToScreen_geo(gSelf.areaPtArr[0].x, gSelf.areaPtArr[0].y);
					  }
						gEcnu.Util.drawLine(ctx, sxy.x, sxy.y, gSelf.currentX, gSelf.currentY);
						//计算周长
						var perimeter = 0;
						var totalDis = gEcnu.Util.getPolylineLength(gSelf.areaPtArr);
						var worldXY = gEcnu.Util.screenToWorld(gSelf.currentX, gSelf.currentY);
						if(gSelf.coordsFlag=="GEOGRAPHIC"){
							worldXY=gEcnu.Util.screenToWorld_geo(gSelf.currentX, gSelf.currentY);
						}
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
						//var msgText = "周长：" + Math.round(perimeter) + "米" + "面积：" + area + "平方米";
						var msgText1 = "周长：" + gSelf.convertUnit('dis',Math.round(perimeter)); 
						var msgText2 = "面积：" + gSelf.convertUnit('area',area); 
						//ctx.font = 'bold 15px 幼圆';
						ctx.font = ' 13px 幼圆';
						ctx.fillStyle='#fff';
						ctx.fillRect(gSelf.currentX,gSelf.currentY-40,200,50);
						ctx.strokeStyle='#333';
						ctx.lineWidth=1;
						ctx.strokeRect(gSelf.currentX,gSelf.currentY-40,200,50);
						ctx.fillStyle='blue';
						ctx.fillText(msgText1, gSelf.currentX+5, gSelf.currentY-20);
						ctx.fillText(msgText2, gSelf.currentX+5, gSelf.currentY);
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
				if(gSelf.coordsFlag=="GEOGRAPHIC"){
					sxy =gEcnu.Util.worldToScreen_geo(gSelf.lengthPtArr[len - 1].x, gSelf.lengthPtArr[len - 1].y);
				}
				var endx = sxy.x;
				var endy = sxy.y;
				gSelf.lengthPtArr = [];
				returnLenArea = "总距离：" + gSelf.convertUnit('dis',Math.round(totalDis));
				ctx.font = ' 13px 幼圆';
				ctx.fillStyle='#fff';
				ctx.strokeStyle='#333';
				ctx.lineWidth=1;
				ctx.fillRect(endx,endy-15,180,25);
				ctx.strokeRect(endx,endy-15,180,25);
				ctx.fillStyle='blue';
				ctx.fillText(returnLenArea, endx+5, endy);
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
				if(gSelf.coordsFlag=="GEOGRAPHIC"){
					sxy1 =gEcnu.Util.worldToScreen_geo(gSelf.areaPtArr[0].x, gSelf.areaPtArr[0].y);
					sxy2 =gEcnu.Util.worldToScreen_geo(gSelf.areaPtArr[max].x, gSelf.areaPtArr[max].y);
				}
				gEcnu.Util.drawLine(ctx, sxy1.x, sxy1.y, sxy2.x, sxy2.y);
				var sxy = gEcnu.Util.worldToScreen(gSelf.areaPtArr[gSelf.areaPtArr.length - 1].x, gSelf.areaPtArr[gSelf.areaPtArr.length - 1].y);
				if(gSelf.coordsFlag=="GEOGRAPHIC"){
					sxy =gEcnu.Util.worldToScreen_geo(gSelf.areaPtArr[gSelf.areaPtArr.length - 1].x, gSelf.areaPtArr[gSelf.areaPtArr.length - 1].y);
				}
				gSelf.areaPtArr = [];
				returnLenArea = "周长：" + Math.round(perimeter) + "米" + "；" + "面积：" + Math.round(area) + "平方米";
				returnLenArea1 = "周长：" + gSelf.convertUnit('dis',Math.round(perimeter));
				returnLenArea2 = "面积：" + gSelf.convertUnit('area',Math.round(area));
				ctx.font = ' 13px 幼圆';
				//ctx.fillText(returnLenArea, sxy.x, sxy.y);
				ctx.fillStyle='#fff';
				ctx.fillRect(sxy.x, sxy.y-40,200,50);
				ctx.strokeStyle='#333';
				ctx.lineWidth=1;
				ctx.strokeRect(sxy.x, sxy.y-40,200,50);
				ctx.fillStyle='blue';
				ctx.fillText(returnLenArea1, sxy.x+5, sxy.y-20);
				ctx.fillText(returnLenArea2, sxy.x+5, sxy.y);
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
		if (!gEcnu.Util.isObjInArray(oLayers, layer)) {
			layer.onAdd(this);
			oLayers.push(layer);
		}
	},
	/**
	 * 移除图层
	 * @param layer
	 */
	removeLayer: function (layer) {  
		var oLayer = [];
		var oLayers = this.oLayers;
		this.ownTile=false;
		this.ownOther=false;
		for (var i = 0, a = 0; i < oLayers.length; i++) {
			if (oLayers[i] != layer) {
				oLayer[a] = oLayers[i];
				if(oLayer[a].oClass == "tileLayer"){
					this.ownTile=true;
				}
				if(oLayer[a].oClass == "otherLayer"){
					this.ownOther=true;  
				}
				a++;
			} else {
				layer.onRemove(this);
				
			}
		}
		this.oLayers = oLayer;
	},
	/**
	 * 通过图层id移除图层
	 * @param layerid
	 */
	removeLayerById: function (layerid) {
		var oLayer = [];
		var oLayers = this.oLayers;
		this.ownTile=false;
		for (var i = 0, a = 0; i < oLayers.length; i++) {
			if (oLayers[i].id != layerid) {
				oLayer[a] = oLayers[i];
				if(oLayer[a].oClass == "tileLayer"){
					this.ownTile=true;
				}
				a++;
			} else {
				oLayers[i].onRemove(this);
			}
		}
		this.oLayers = oLayer;
	},
		/**
	 * 通过图层id移除图层
	 * @param layerid
	 */
	getLayerById: function (layerid) {
		var oLayer = [];
		var oLayers = this.oLayers;
		//console.log(this.oLayers);
		console.log(layerid);
		for (var i = 0, a = 0; i < oLayers.length; i++) {
			if (oLayers[i].id == layerid) {
				//console.log(oLayers[i]);
                return oLayers[i];
			} 
		}
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
		this.ownTile=false;
		for (var k in layers) {
			for (var i = 0, a = 0; i < oLayers.length; i++) {
				if (oLayers[i] != layers[k]) {
					oLayer[a] = oLayers[i];
					if(oLayer[a].oClass == "tileLayer"){
						this.ownTile=true;
					}
					a++;
				} else {
					layers[k].onRemove(this);
				}
			}
		}
		oLayers = oLayer;
	},
	/**
	 * 控制图层是否可见
	 * @param layers 图层数组
	 */
	showLayer: function (layer) {
		layer.show();
	},
	/**
	 * 控制图层是否可见
	 * @param layers 图层数组
	 */
	hideLayer: function (layer) {
		layer.hide();
	},
	/**
	 * 添加控件（ZoomBar或者Scale）
	 * @param layers 图层数组
	 */
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
	/**
	 * 获取全部控件
	 * @returns {Array}
	 */
	getAllControls: function () {
		return this.oControls;
	},
	/**
	 * 视野放大操作
	 */
	zoomIn: function (mouseXY) {
		// if (this.ownTile) {  
			if (this.tileCount > 0) {
			if (this.zl <= this.minLevel) {
				return;
			}
		}
		var coordsys=gSelf.coordsFlag;
		var oLayers = this.getAllLayers();
		if(this.ownOther){  //判断如果有第三方地图时  其也有缩放级别限制
			if(coordsys=='PROJECTED'){
				var curoMaplevel=gSelf.activeLayer.oMap.MaxLevel-this.zl; //第三方地图的当前所处缩放级别
			if(curoMaplevel>=gSelf.activeLayer.oMap.MaxLevel){  
				alert("已经放大至最大级别");
					return;
				}
		 }else{
		 	var otherZoomlevel=Math.floor(gSelf.activeLayer.oMap.targetLevel-Math.log(gSelf.zoom/(gSelf.activeLayer.otherPxScale*gSelf.w))/Math.log(2));
		 	if(otherZoomlevel>=gSelf.activeLayer.oMap.MaxLevel){
		 		alert("已经放大至最大级别");
					return;
		 	}
		 }	
		}
		this.zoom = (this.zoom) / 2;
		var tmpzl=this.zl;
		this.zl_pre=tmpzl;
		this.zl--;
		for (var i = 0; i < oLayers.length; i++) {
			if (oLayers[i].visible) {
				oLayers[i].zoomIn(mouseXY);
			}
		}
		var oControls = this.getAllControls();
		for (var j = 0; j < oControls.length; j++) {
			oControls[j].renew();
		}
		gSelf._boundsChanged();
	},
	/**
	 * 视野缩小操作
	 */
	zoomOut: function (mouseXY) {  
		//if (this.ownTile) {
		if (this.tileCount > 0) {
			if (this.zl >= this.maxLevel) { 
				return;
			}
		}
		var coordsys=gSelf.coordsFlag;
		var oLayers = this.getAllLayers();
		//判断如果有第三方地图时  其也有缩放级别限制
		if(this.ownOther){
			if(coordsys=='PROJECTED'){
			var curoMaplevel=gSelf.activeLayer.oMap.MaxLevel-this.zl;
			if(curoMaplevel<=gSelf.activeLayer.oMap.Minlevel+1){ 
			    alert("已经缩小至最小级别");
					return;
				 }
			}else{
				var otherZoomlevel=Math.floor(gSelf.activeLayer.oMap.targetLevel-Math.log(gSelf.zoom/(gSelf.activeLayer.otherPxScale*gSelf.w))/Math.log(2));
		 		if(otherZoomlevel<=gSelf.activeLayer.oMap.Minlevel){
		 		alert("已经缩小至最小级别");
					return;
		 	}

			}
		  }	
		this.zoom = (this.zoom) * 2;
		var tmpzl=this.zl;
		this.zl_pre=tmpzl;
		this.zl++;
		for (var i = 0; i < oLayers.length; i++) {
			if (oLayers[i].visible) {
				oLayers[i].zoomOut(mouseXY);
			}
		}
		var oControls = this.getAllControls();
		for (var j = 0; j < oControls.length; j++) {
			oControls[j].renew();
		}
		gSelf._boundsChanged();
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
		if(typeof z=="undefined"){
			for (var i = 0; i < oLayers.length; i++) {
				oLayers[i].zoomTo();
			}
		}else{
		    if (z.hasOwnProperty("zl")) {
		    	var zl=z.zl;
		    	//if(gSelf.ownTile){   //有切片的时候 缩放级别有限制1-7
		    	if (this.tileCount > 0) {
		    		if(zl<gEcnu.config.minLevel){
		    			zl=gEcnu.config.minLevel;
		    		}else if(zl >gEcnu.config.maxLevel){
		    			zl=gEcnu.config.maxLevel;
		    		}
		    	}
		    	this.zl =zl ;
		        var MeterPerPx=Math.pow(2,(this.zl-1));
		    	var w = this._container.clientWidth;
		    	this.zoom=MeterPerPx*w;
		    	for (var i = 0; i < oLayers.length; i++) {
		    		oLayers[i].zoomTo();
		    	}
		    } else if (z.hasOwnProperty("zoom")) { 
		    	this.zoom=z.zoom;
		    	_zoom = z.zoom;
		    	var w = this._container.clientWidth;
		    	var MeterPerPx=_zoom/w;
		    	var zl=parseInt(Math.log(MeterPerPx)/Math.log(2))+1; 
		    	//if(gSelf.ownTile){  //如果有切片 缩放级别有限制1-7
		    	if (this.tileCount > 0) {
		    		if(zl<gEcnu.config.minLevel){
		    			zl=gEcnu.config.minLevel;
		    		}else if(zl >gEcnu.config.maxLevel){
		    			zl=gEcnu.config.maxLevel;
		    		}
		    		   //zoom 与zl保持了对应关系 否则的话 zl与zoom不成对应关系（即无法根据其中一个计算另一个）
		    	}
		    	var MeterPerPx=Math.pow(2,(zl-1));
		    	var newZoom=MeterPerPx*w;
		    	this.zl=zl;
		    	this.zoom=newZoom;
		    	for (var i = 0; i < oLayers.length; i++) {		
		    		oLayers[i].zoomTo();
		    	  }
		    }
		}
		var oControls = this.getAllControls();
		for (var j = 0; j < oControls.length; j++) {
			oControls[j].renew();
		}
		gSelf._boundsChanged();
	},
	/**
	 * 地图resize操作_私有函数
	 */
	resize: function () {
		var prew = this.w;
		var curZoom=this.zoom;
		var MeterPerPx=curZoom/prew;//这里的作用是为了党resize的时候记住每个像素代表实际距离，然后再dynLayer的resize中利用
		var preh = this.h;
		var w = this._container.clientWidth;
		var h = this._container.clientHeight;
		this.zoom=MeterPerPx*w;
		var wxy = gEcnu.Util.screenToWorld(w / 2, h / 2);
		this.cx = wxy.x;
		this.cy = wxy.y;
		this.w = w;
		this.h = h;
		var oLayers = this.getAllLayers();
		for (var i = 0; i < oLayers.length; i++) {
			oLayers[i].resize();
		}
		var oControls = this.getAllControls();
		for (var j = 0; j < oControls.length; j++) {
			oControls[j].renew();
		}
		gSelf._boundsChanged();
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
	 * 获取缩放时上一级别
	 * @returns {{z: number, zl: *}}
	 */
	getPreZl: function () {
		return this.zl_pre;
	},
	/**
	 * 设定视野范围
	 * @param zoom
	 */
	setZoom: function (zoom) {
		this.zoom = zoom;
	},
	/**
	 * 设定视野范围_暂时未写
	 * @param zl
	 */
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
	clearOverlay:function(){
		this.overLayer.clear();
	},
	/**
	 * 禁止地图平移
	 * @param cx
	 * @param cy
	 */
	forbidPan:function(){
      this.forbidPan_ex=true;
	},
	activePan:function(){
      this.forbidPan_ex=false;
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
	/**
	 * 获取地图范围
	 * @returns {{
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
		}}
	 */
	getBounds: function () {
		var cxy = this.getCenter();
		var size = this.getSize();
		var z = this.getZoom();
		var wl = cxy.x - z.z / 2;
		var wr = cxy.x + z.z / 2;
		var scale = z.z/size.w  ;
		var ht = cxy.y - size.h * scale / 2;
		var hb = cxy.y + size.h * scale / 2;
		return {
			'nw': {
				'x': wl,
				'y': hb
			},
			'ne': {
				'x': wr,
				'y': hb
			},
			'sw': {
				'x': wl,
				'y': ht
			},
			'se': {
				'x': wr,
				'y': ht
			}
		}
	},
	/**
	 * 获取地图状态_私有函数
	 * @returns map.mode
	 */
	getMode: function () {
		return this.mode;
	},
	/**
	 * 设置地图状态_私有函数
	 *  @param mode
	 */
	setMode: function (mode) {
		this.mode = mode;
	},
	/**
	 * 获取地图mapTool
	 * @returns map.mapTool
	 */
	getMapTool: function () {
		return this.mapTool;
	},
	/**
	 * 设置地图状态
	 */
	setMapTool: function (maptool) {
		this.mapTool=maptool;
	},
	/**
	 * 设置地图状态
	 */
	setCursorStyle: function (opekind,cururl) {
		this.cursorStyle[opekind]="url("+"'"+cururl+"'"+"),default";
	},
	/**
	 * 为map对象注册监听事件
	 * @example
	 * map.events.on('boundsChanged',callback);
	 */
    events:{
        on:function(eventType,callback){

           switch (eventType){
           	  case 'boundsChanged':
                  gEcnu.Map.prototype._boundsChanged_EX = function (result) {
                  	  callback(result);
                  }
           	  break;
           	  case 'mousedown':
                  gEcnu.Map.prototype._mousedown_EX = function (e,pos) {
                  	  callback(e,pos);
                  }
           	  break;
           	  case 'mousemove':
                  gEcnu.Map.prototype._mousemove_EX = function (e,pos) {
                  	  callback(e,pos);
                  }
           	  break;
           	  case 'mouseup':
                  gEcnu.Map.prototype._mouseup_EX = function (e,pos) {
                  	  callback(e,pos);
                  }
           	  break;
           	  case "dynError":   //请求动态图失败的响应
           	  gEcnu.Map.prototype._dynError_EX = function (msg) {
                  	  callback(msg);
                  }
           	  break;
           }
        }
    },
    /**
	 * 地图可视范围发生变化后触发事件_私有函数
	 * @public
	 */
    _boundsChanged:function(){
    	var oControls = this.getAllControls();
		for (var j = 0; j < oControls.length; j++) { 
			if(oControls[j].oClass=="eagleMapControl"){  //更新鹰眼中矩形框的位置
				oControls[j].renew();
			}
		}
		if(arguments.length>0){
			var params1=arguments[0];
            this._boundsChanged_EX(params1);
		}else{
           this._boundsChanged_EX();
        }
    },
    _boundsChanged_EX:function(){

    },
    /**
	 * map拓展mousedown事件响应函数_外部调用
	 * @param e 
	 */
	_mousedown_EX:function(e,pos){

    },
    _mousemove_EX:function(e,pos){

    },
    _mouseup_EX:function(e,pos){

    },
    /**
     * 2015-7-1 针对多用户操作，用户长时间未操作 地图请求失败的处理
     * @return {[type]} [description]
     */
    _dynError_EX: function (){

    },

	/**
	 * map拓展mousedown事件响应函数_内部调用
	 * @param e
	 */
	mousedownCustom: function (e) {
        gEcnu.Edit.graphMouseDownEvt(e,gSelf);
	},
	/**
	 * map拓展mousemove事件响应函数_内部调用
	 * @param e
	 */
	mousemoveCustom: function (e) {
        gEcnu.Edit.graphMouseMoveEvt(e,gSelf);
	},
	/**
	 * map拓展mouseup事件响应函数_内部调用
	 * @param e
	 */
	mouseupCustom: function (e) {
        gEcnu.Edit.graphMouseUpEvt(e,gSelf);
	},
	/**
	 * map拓展mousewheel事件响应函数_内部调用
	 * @param e
	 */
	mousewheelCustom: function (e) {

	},
	/**
	 * map拓展mousedblclickCustom事件响应函数_内部调用
	 * @param e
	 */
	mousedblclickCustom: function (e) {
        gEcnu.Edit.graphMouseDblClickEvt(e,gSelf);
	},
	setProjCoordsFlag:function (){
		gSelf.coordsFlag="PROJECTED";
	},
	setGeoCoordsFlag:function (){
		gSelf.coordsFlag="GEOGRAPHIC";
	},
	/**
	 * 设置地图量算单位
	 * @param unit  米/千米  平方米/亩/公顷
	 */
	setRulerUnit:function (option){
		this.disUnit = option.disUnit || '米';
		this.areaUnit = option.areaUnit || '平方米';
	},
	convertUnit:function (type,disOrArea){
		var disUnit=this.disUnit;
		var areaUnit=this.areaUnit;
		if(type=='dis'){
			switch(disUnit){
				case "千米":
				return disOrArea/1000 +"千米";
				break;
				case "公里":
				return disOrArea/1000 + "公里";
				break;
				default:
				return disOrArea +"米";
			}
		}else{
			switch(areaUnit){
				case "平方千米":
				return (disOrArea/1000000).toFixed(2) +"平方千米";
				break;
				case "平方公里":
				return (disOrArea/1000000).toFixed(2) + "平方公里";
				break;
				case "亩":
				return (disOrArea*0.0015).toFixed(2) +"亩";
				break;
				case "公顷":
				return (disOrArea/10000).toFixed(2) +"公顷";
				break;
				default:
				return (disOrArea).toFixed(2) +"平方米";
			}

		}

	},
	/**
	 * 按比例尺打印地图  打印动态图（一个工作空间中的图层，多个工作空间的暂未考虑）
	 * 请求动态图时，w h的取值范围只能是 【100，,7000】之间
	 * @author By lc 2015-5-15
	 * jqprint 依赖打印插件
	 * @param  {[type]} scale 比例尺
	 * @param whRate 横向 or 纵向打印
	 */
	saveImageToScale: function(divId,scale,whRate,title){
		var _map = gSelf; //this._map;
		var self = this;
		this.printScale = scale;
		this.MAXWIDTH = 2000;  //每次请求地图时的允许最大地图宽高阈值
		this.MAXHEIGHT = 2000;
		this.MINWIDTH = 100;  //每次请求地图时的允许最小地图宽高阈值
		this.MINHEIGHT = 100;
		var mapurl = this.webMapURL;
		var titleText = title ? title : '上海市1：'+scale+'用地数据';
		this._printTitle = titleText;

		var outerDiv = document.getElementById(divId);  //显示要打印的地图
		outerDiv.innerHTML='';
		outerDiv.style.display = 'block';
		var mapParam = gEcnu.Util.getMapParamByScale(_map,scale,whRate);  
		var w = mapParam.w;
  		var h = mapParam.h;
  		var cx = mapParam.cx;
  		var cy = mapParam.cy;
  		var zoom = mapParam.zoom;  
  		var lyrs = ''; 
  		var ws = '';
  		var oLayers = this.getAllLayers();

  		this.outerDiv = outerDiv;
  		for(var i=0,len=oLayers.length;i<len;i++){  
  			if(oLayers[i].oClass == 'dynLayer'){
  				lyrs = oLayers[i].getAllVisibleLyrs().join(",");
  				ws = oLayers[i].ws;
  			}
  		}

  		this._createPrintDiv(outerDiv,w,h);	
  		var imgDiv = this.imgDiv;	

		//求取整个范围内的地图左上角的坐标
		var cx0 = cx -zoom/2;
		var cy0 = cy + (zoom/w) * h/2;

		
		//分区请求动态图： 将整个划分为几个区域，分别请求动态图
		var colNum = 1,rowNum = 1; //行列数
		var lastDyn_wid,lastDyn_h;  //针对每行最后一个区域图片的宽 每列最后一个图片的高度
		if(w > this.MAXWIDTH){
			var lastDyn_wid_split = parseInt(w % this.MAXWIDTH); 
			if(lastDyn_wid_split < this.MINWIDTH){ 
				colNum= parseInt(w/this.MAXWIDTH);
				lastDyn_wid =  this.MAXWIDTH + lastDyn_wid_split;  //横向 合并最后两个区域
			}else{
				colNum= Math.ceil(w/this.MAXWIDTH);
				lastDyn_wid = lastDyn_wid_split;
			} 
			
		}else{
			lastDyn_wid = w;
		}
		if(h > this.MAXHEIGHT){
			var lastDyn_h_split = h % this.MAXHEIGHT;
			if(lastDyn_h_split < this.MINHEIGHT){  //
				rowNum= parseInt(h/this.MAXHEIGHT);
				lastDyn_h = this.MAXHEIGHT + lastDyn_h_split; //纵向合并两个区域
			}else{
				rowNum= Math.ceil(h/this.MAXHEIGHT);
				lastDyn_h = lastDyn_h_split;
			}
			
		}else{
			lastDyn_h = h;
		}
		var zoom0 = (zoom/w)*this.MAXWIDTH;  //每个完整子区域的zoom值
		var zoom_h = (zoom/w)*this.MAXHEIGHT; //每个完整子区域的纵向实际距离
		//请求每个子区域的动态图
		var totalDynNum = rowNum * colNum;
		this.dynImgCount = 0;//count用于计数动态图个数
		this.totalDynImgNum = totalDynNum;
		var i = 0;
		var oimg = document.createElement('img');
		var getScaleImage = function (){
			if(i >= totalDynNum){ 
		        
				return;
			}
			//使用空图片预先占位
			var row = Math.floor( i / colNum); 
			var col = Math.floor( i % colNum);
			var itop = row*self.MAXHEIGHT;
			var ileft = col*self.MAXWIDTH;
			var img = oimg.cloneNode();    //img.style.width
			img.style.position = 'absolute';
			img.setAttribute('crossOrigin', 'anonymous');
			img.style.left = col*self.MAXWIDTH+'px';
			img.style.top = row*self.MAXHEIGHT+'px';
			imgDiv.appendChild(img);
			//构造请求区域的地图参数 cx cy zoom w h 
			if(col!=colNum-1){
				var zoom_req = zoom0;	
				var width_req = self.MAXWIDTH;		
			}else{
				var width_req = lastDyn_wid;
				var zoom_req = (zoom/w)*width_req;
			}
			if(row!=rowNum-1){
				var height_req = self.MAXHEIGHT;
				var cur_zoomH = zoom_h;
			}else{
				var height_req = lastDyn_h;
				var cur_zoomH = (zoom/w)*height_req;
			}
			
			var cx_req = cx0 + zoom0*col+zoom_req/2;
			var cy_req = cy0 - (zoom_h*row + cur_zoomH/2);
			//设置图片对应的地理中心点坐标，用于匹配返回的动态图
			img.setAttribute('cx',parseInt(cx_req));
			img.setAttribute('cy',parseInt(cy_req));
			var params = {
				map: ws,
				w: width_req,
				h: height_req,
				mt: 'zoomto',
				cx: cx_req,
				cy: cy_req,
				zoom: zoom_req,
				"return": "json",
				lyrs: lyrs
			};	
			// console.log('请求第'+i+'个');
			// console.log(params);
			self._reqImageByScale(params,img,imgDiv);	
			i++;
			if(i>=totalDynNum){ return;}
			getScaleImage();
		
		};

		getScaleImage();
	},
	/**
	 * 创建打印地图时的预览界面
	 * @return {[type]} [description]
	 */
	_createPrintDiv: function (outerDiv,w,h){ 
		var self = this;
		//按钮区域
		var btnDiv = gEcnu.Util.createDiv('printBtnDiv', 300, 40, false);  // 打印 取消 按钮
		var oinput = document.createElement('input');
		oinput.type = 'button';
		oinput.style.width = '60px';
		oinput.style.height = '28px';
		oinput.style.marginLeft = '30px';
		var printBtn = oinput.cloneNode();
		var cancleBtn = oinput.cloneNode();
		var exportBtn = oinput.cloneNode();
		printBtn.value = '打印';
		exportBtn.value = '导出';
		cancleBtn.value = '关闭';
		//btnDiv.style.margin = '0 auto';
		btnDiv.style.lineHeight = '40px';
		btnDiv.appendChild(cancleBtn);
		btnDiv.appendChild(exportBtn);
		btnDiv.appendChild(printBtn);

		outerDiv.appendChild(btnDiv);  

		//打印区域
		var print_w = parseInt(w + 104);  //2px的像素宽
		var print_h = parseInt(h + 40+4+20+20+30+10);
		var printDiv = gEcnu.Util.createDiv('_printDiv', print_w, print_h, false);
		printDiv.style.position = 'relative';
		printDiv.style.left = '30px';
		printDiv.style.textAlign = 'center';
		printDiv.style.border = '2px solid #000';
		printDiv.style.margin = '0 auto';
		printDiv.style.backgroundColor = '#fff';

		
		//打印标题
		var print_title = gEcnu.Util.createDiv('_printTitleDiv', w, 50, false);
		print_title.style.position = 'relative';
		print_title.innerHTML = this._printTitle;
		print_title.style.lineHeight = '100px';
		print_title.style.margin = '0 auto';
		print_title.style.textAlign = 'center';
		print_title.style.fontSize = '1.3em';
		print_title.style.color = '#333';
		print_title.style.fontWeight = 'bold';
		//print_title.style.border = '1px solid red';

		//地图显示区
		var print_map = gEcnu.Util.createDiv('_printMapDiv', w, h, false);
		print_map.style.position = 'relative';
		print_map.style.top = '25px';
		print_map.style.margin = '0 auto';
		print_map.style.border = '1px solid #555';

		var oimg = document.createElement('img');
  		var cavas = gEcnu.Util.createCanvas('canvas2Drawing', w, h, true);
  		var imgDiv = gEcnu.Util.createDiv('tmpImgContainer', w, h, true);  //存放img的容器
  		var cavasImg_export = oimg.cloneNode();  //最终输出的img 预览原图
  		var ctx = cavas.getContext('2d');
  		this._dynctx = ctx;
  		this.cavasImg_export = cavasImg_export;
		this.cavas = cavas;
		this.imgDiv = imgDiv;
		this.printDiv = printDiv;
		//图例显示区
		var legnedDiv = gEcnu.Util.createDiv('_legendDiv', 114, 460, true);
		legnedDiv.style.backgroundColor = 'rgba(255,255,255,0.6)';
		legnedDiv.style.left = '2px';
		legnedDiv.style.top = '2px';
		var legendImg = oimg.cloneNode();
		legendImg.src = 'imgs/legend_print.png';
		legnedDiv.style.zIndex = '11111';
		legnedDiv.appendChild(legendImg);
		print_map.appendChild(legnedDiv);


  		
  		imgDiv.style.display = 'block';
  		imgDiv.style.left = '0px';
		imgDiv.style.top = "0px";
		cavas.style.left = '0px';
		cavas.style.top = "0px";

		cavasImg_export.style.position = 'absolute';
		cavasImg_export.style.left = '0px';
		cavasImg_export.style.top = '0px';
		cavasImg_export.id = 'export_img';
		cavasImg_export.style.width = w+"px";
		cavasImg_export.style.height = h+"px";
		cavasImg_export.style.zIndex = 100;

		print_map.appendChild(imgDiv);
		print_map.appendChild(cavas);  
		print_map.appendChild(cavasImg_export);
		

		//比例尺显示区
		var scaleDiv = gEcnu.Util.createDiv('_scaleDiv', 200, 30, false);
		scaleDiv.innerHTML = '比例尺  1:'+this.printScale;
		//scaleDiv.style.display = 'inline-block';
		scaleDiv.style.marginLeft = '50px';
		scaleDiv.style.marginTop = '35px';
		scaleDiv.style.fontSize = '1em';
		scaleDiv.style.fontWeight = 'bold';
		scaleDiv.style.color = '#333';
		//制作时间
		var infoDiv = gEcnu.Util.createDiv('_infoDiv', 500, 30, true);
		var timeInfo = gEcnu.Util.getTimeInfo();
		var year = timeInfo.year;
		var month = timeInfo.month;
		var day = timeInfo.day;
		infoDiv.innerHTML = '《上海市农业布局动态管理模式研究》课题组\n\n  '+year+'年'+month+"月"+day+'日'; 
		infoDiv.style.bottom = '5px';
		infoDiv.style.right = '50px';
		infoDiv.style.fontSize = '1em';
		infoDiv.style.fontWeight = 'bold';
		infoDiv.style.color = '#333';


		printDiv.appendChild(print_title);
		printDiv.appendChild(print_map);
		printDiv.appendChild(scaleDiv);
		printDiv.appendChild(infoDiv);
		outerDiv.appendChild(printDiv);

		//内部事件处理（打印完成后，移除事件监听）
		cancleBtn.onclick = function (){
			outerDiv.style.display = 'none';
		};
		printBtn.onclick = function (){
			$('#_printDiv').jqprint();  
			exportBtn.onclick = null;
			printBtn.onclick = null;
			cancleBtn.onclick = null;
			self.outerDiv.style.display = 'none';	
		};
		if(w * h > 2000*2000){ 
			//alert('图片过大，暂不支持导出');
			exportBtn.disabled = 'disabled';
		}
		exportBtn.onclick = function (){ 
			var imgdata = self.cavas.toDataURL('image/png');
			self._downloadScaleImg(imgdata);
			self.outerDiv.style = 'none';	
		};

	},
	/**
	 * 获取指定区域的动态图 图片
	 * @return {[type]} [description]
	 */
	_reqImageByScale: function (params,img,imgDiv){
		var self = this;
		var mapurl = this.webMapURL;
		try { 
			gEcnu.Util.ajax("get", mapurl, params, true, function (data) {
				data = JSON.parse(data); 
				if (!data.mapURL) {
					alert("地图请求失败！");
					return;
				}
				var req_lyrs=params.lyrs.toLowerCase();
                var res_lyrs=data.visibleLayers.toLowerCase();
                var tmpRequestZoom=parseInt(params.zoom,10);
                var tmpResponseZoom=parseInt(data.mapZoom,10);
                var paraX=Math.round(params.cx);
                var paraY=Math.round(params.cy);
                var resX=Math.round(data.centerX);
                var resY=Math.round(data.centerY);
                //判断返回的动态图是填充哪张图片
                var target_img = self.getFitedImg(imgDiv,resX,resY);
                target_img.src=self.fileServer + data.mapURL; 
				target_img.onload=  function (){
				  	self.dynImgCount++;
				  	if(self.dynImgCount >= self.totalDynImgNum){ 
				  		self.drawImageOnCavs(self._dynctx,imgDiv); 
				  		var imgdata = self.cavas.toDataURL('image/png'); 
				  		var imgurl = imgdata.replace("image/png", "image/octet-stream"); 
				  		self.cavasImg_export.setAttribute('crossOrigin', 'anonymous');
				  		self.cavasImg_export.src = imgdata;
				  		
				  		
         				//下载图片（大小有限制，过大的图片会导致浏览器崩溃）
         				// self._downloadScaleImg(imgdata);
				  	}		
				};
				
			});
		} catch (e) {
			//alert("出现异常在：" + e);
		}
	},
	/**
	 * 下载图片（大小有限制，过大的图片会导致浏览器崩溃）
	 * @param  {[type]} imgdata 图片内容
	 * @return {[type]}         [description]
	 */
	_downloadScaleImg: function (imgdata){
		var a = document.createElement('a');
		a.href= imgdata;
		a.download = this._printTitle+".png";
		a.click();
		//this.outerDiv.appendChild(a);
	},
	getFitedImg: function (imgDiv,dyn_cx,dyn_cy){ 
		var imgs = imgDiv.getElementsByTagName('img');
		for(var i=0,len=imgs.length;i<len;i++){
			var img = imgs[i];
			var cx = img.getAttribute('cx');
			var cy = img.getAttribute('cy');
			if( Math.abs(cx-dyn_cx)<5 && Math.abs(cy-dyn_cy)<5){
				return img;
			}
		}
	},
	/**
	 * 绘制成功后，将imgDiv移除
	 * @param  {[type]} ctx      [description]
	 * @param  {[type]} imgDiv   [description]
	 * @param  {[type]} outerDiv [description]
	 * @return {[type]}          [description]
	 */
	drawImageOnCavs: function (ctx,imgDiv){
		var imgs = imgDiv.getElementsByTagName('img');
		var self = this;
		for(var i=0,len=imgs.length;i<len;i++){
			var img = imgs[i];
			var left = gEcnu.Util.delpx(gEcnu.Util.getEleStyle(img,'left'));
			var top = gEcnu.Util.delpx(gEcnu.Util.getEleStyle(img,'top'));
			ctx.drawImage(img,left,top);
		}
	}





});
  /**
   * Marker要素
   * @type {*}
   */
 gEcnu.Marker = gClass.extend({
    init: function (name, info, options) {
      this.name = name;
      this._img = new Image();
      this._img.src = info.src;
      this.src=info.src;
      this._img.style.position = 'absolute';
      this._img.style.zIndex = 100;
      this.info = info;
    },
    onAdd: function (layer) {
      this._layer = layer;
      var map = layer.getMap();
      var container = this._container = layer.getLayerContainer();
      this.x=this.info.x;
      this.y=this.info.y;
      var sxy = gEcnu.Util.worldToScreen(this.info.x, this.info.y);
      this._img.style.left = sxy.x+this.info.offset.x+ 'px';
      this._img.style.top = sxy.y+this.info.offset.y + 'px';
      this._img.style.cursor="pointer";
      container.appendChild(this._img);
    },
    onRemove: function () {
      this._container.removeChild(this._img);
    },
    getContainer: function () {
      return this._img;
    },
    regEvent:function(evt,callback){
          if(evt=="click"){
              var self=this;
              gEcnu.Util.addEvtHandler(this.getContainer(),'mousedown',function(e){ 
                  gEcnu.Util.preventDefault(e);
                  gEcnu.Util.stopPropagation(e);  
                  if(gEcnu.Util.getButton(e)==0){
                  callback.apply(self,arguments);}  
              });
              this._img.onmouseup=function(e){
                  gEcnu.Util.preventDefault(e);
                  gEcnu.Util.stopPropagation(e);
              };
              this._img.onclick=function(e){
                  gEcnu.Util.preventDefault(e);
                  gEcnu.Util.stopPropagation(e);
              };
          }else if(evt=="Rclick"){
              var self=this;
              gEcnu.Util.addEvtHandler(this.getContainer(),'mousedown',function(e){
                  gEcnu.Util.preventDefault(e);
                  gEcnu.Util.stopPropagation(e);
                  if(gEcnu.Util.getButton(e)==2){
                  callback.apply(self,arguments);}
              });
              this._img.onmouseup=function(e){
                  gEcnu.Util.preventDefault(e);
                  gEcnu.Util.stopPropagation(e);
              };
              this._img.onclick=function(e){
                  gEcnu.Util.preventDefault(e);
                  gEcnu.Util.stopPropagation(e);
              };
          }
     },
    renew: function () {
      var map = this._layer.getMap();
      var sxy = gEcnu.Util.worldToScreen(this.info.x, this.info.y);
      this._img.style.left = sxy.x +this.info.offset.x+ 'px';
      this._img.style.top = sxy.y +this.info.offset.y+ 'px';
    },
    showInfo: function () {
      console.log("Hello WebGIS");
    }
  });

/**
 * Text要素
 * @type {*}
 */
 gEcnu.Text = gClass.extend({
    init: function (id, info,fields,options) {
      this.id = id;
      this.startPoint=info.startPoint;
      this.boxMaxWidth=info.boxMaxWidth;
      this.text = info.text;
      this.fields=fields;
      this.boxScrSize={'xmin':0,'ymin':0,'xmax':0,'ymax':0};
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
    onAdd: function (layer) {
      var id=this.id;
      this._w=this.boxMaxWidth;
      this._h=50;
      var div = gEcnu.Util.createTextArea(id, this._w, this._h, true);
      div.style.borderWidth=0;
      this._textContainer = div;
      var container = this._container = layer.getLayerContainer();
      container.appendChild(this._textContainer);
      this._layer = layer;
      this.onDraw(layer);
    },
    onDraw:function(layer){
      var _style=layer.style;
      var left_top = gEcnu.Util.worldToScreen(this.startPoint.x,this.startPoint.y);
      var resetFlag=layer.resetStyle;
      if(typeof (this.style) =="undefined" || resetFlag){  //重设样式
        this.style=_style;
      } 
      this._textContainer.style.fontSize=this.style.fontSize+"px";
      this._textContainer.style.fontFamily=this.style.fontFamily+",SimSun";//避免字体不支持
      this._textContainer.style.color=this.style.fontColor;
      this._textContainer.style.borderRadius="3px";
      this._textContainer.style.padding="2px";

      var newwh=gEcnu.Util.resizeDivByContent(this.style.fontSize,this.text,this._w);
      this._textContainer.style.width=newwh.w+"px";
      this._textContainer.style.height=newwh.h+"px";

      var rgba=gEcnu.Util.colorRgb(this.style.bgColor,this.style.opacity-0.1);
      this._textContainer.style.background=rgba;
      this._textContainer.textContent=this.text;
      this._textContainer.style.left=left_top.x+"px";
      this._textContainer.style.top=left_top.y+"px";
      //重新计算this.boxScrSize={'xmin':0,'ymin':0,'xmax':0,'ymax':0};
      this.boxScrSize={'xmin':left_top.x,'ymin':left_top.y,'xmax':left_top.x+newwh.w,'ymax':left_top.y+newwh.h};
      layer._layerContainer.appendChild(this._textContainer); 
    },
    setContent:function(newContent){
      this.text=newContent;
    },
    setPosition:function(wx,wy){
        this.startPoint.x=wx;
        this.startPoint.y=wy;
    },
    setSize:function(width){
       this._w=this.boxMaxWidth=width;
    },
    onRemove: function () {
      this._container.removeChild(this._textContainer);
    },
    getContainer: function () {
      return this._textContainer;
    },
    renew:function(){
      var layer=this._layer;
      this.onDraw(layer);
    },
    refresh:function(){
       this.renew();
    }
  });
 /**
   * 样式对象
   * @type {*|void}
   */
gEcnu.Style = gClass.extend({
  init:function(options){
    this.oStyle='singleStyle';
    if(options.fillColor==undefined){
      this.fillColor='#00DD00';
    }else{this.fillColor=options.fillColor;}
    if(options.strokeColor==undefined){
      this.strokeColor='#00DD00';
    }else{this.strokeColor=options.strokeColor;}
    if(options.lineWeight==undefined){
       this.lineWeight=1;
    }else{this.lineWeight=options.lineWeight;}
    if(options.borderStatus==undefined){
      this.borderStatus= true;
    }else{this.borderStatus=false;}
    if(options.cirRadius==undefined){
      this.cirRadius=3;
    }else{this.cirRadius=options.cirRadius};
    if(options.fillStatus==undefined){
      this.fillStatus=true;
    }else{this.fillStatus=false;}
    if(options.vtxStatus==undefined){
      this.vtxStatus= false;
    }else{this.vtxStatus=true;}
    if(options.vtxRadius==undefined){
      this.vtxRadius=3;
    }else{this.vtxRadius=options.vtxRadius};
    if(options.tlr==undefined){
      this.tlr=5;
    }else{this.tlr=options.tlr;}
    if(options.opacity==undefined){
      this.opacity=0.4;
    }else{this.opacity=options.opacity;}
    if(options.mappingValue==undefined){
      this.mappingValue="default";
    }else{this.mappingValue=options.mappingValue;}
    if(options.fontSize==undefined){
      this.fontSize=13;
    }else{this.fontSize=options.fontSize;}
    if(options.fontFamily==undefined){
      this.fontFamily="KaiTi";
    }else{this.fontFamily=options.fontFamily;}
    if(options.fontColor==undefined){
      this.fontColor="#333333";
    }else{this.fontColor=options.fontColor;}
    if(options.bgColor==undefined){
      this.bgColor="#ffffff";
    }else{this.bgColor=options.bgColor;}
  }
});
 /**
   * 样式对象
   * @type {*|void}
   */
gEcnu.Style_Ex = gClass.extend({
  init:function(styleArr,field){
    this.oStyle='multiStyles';
    this.styles=styleArr;
    this.mappingField=field;
  }
});
/*  by lc--2015-3-12
	1、上传文件至服务器某个文件夹下  2、上传文件流/字符串内容 生成指定类型的文件
	说明:
	1、支持多文件上传
	2、支持一次性上传2G以内大小的文件 
	3、依赖于jquery

	修改于2015-9-15： 服务器接口发生变动

*/

/*上传本地文件至服务器  2015-9-15 By lc  
*@param  gEcnu.Upload 原来是req=put 现改为req=putstream
*/
gEcnu.Upload = gClass.extend({
	init:function (files,path){
		//this.requrl="http://"+gEcnu.config.webHostIP+":"+gEcnu.config.port+"/fileserver?req=putstream&path="+path;
		//this.requrl=gEcnu.config.geoserver+"fileserver?req=putstream&path="+path;
		var CAT =  gEcnu.config.cat || 'data/userdata/upload/';//可以指定默认上传的地址
		this.requrl = gEcnu.config.geoserver+"fileserver?req=putstream&cat="+CAT+"&fn="+path+"/";
		//this.requrl=gEcnu.config.geoserver+"fileserver?req=putstream";
		this.uploadSizeByBlock=1000*1000*1; //分块上传时,每次上传的文件块的大小（2M）
		this.files=files;
		this.inum=0;
		this.itotal=0;
		this.uploaded=0; 
		this.abortFlag=false; //取消的标志
		this.totalFileSize=this._getFilesize();
	},
	processAscyn:function(succ,fail){  //可选参数
		this.fileCount=0;
		this.succCallback= arguments[0] ? arguments[0] : function (){ };
		this.failCallback= arguments[1] ? arguments[1] : function (){ };
		var files=this.files;
		if(!files.length) {
		        alert('请选择文件');
		        return false;
		}
        	this._uploadFile(); 
	},
	_uploadFile:function (){
		var files=this.files;
		var fileNum=files.length;
		if(this.fileCount > fileNum-1){ 
        	this.succCallback();
        	return;
        }
		var file=files[this.fileCount];
		var filelen=file.size;
		if(filelen>1024*1024*1024*2){
		  alert('文件太大');
		  return false;
		}
		// if(this.abortFlag){ alert('abort'); return ;}   //取消上传
		var blobsize=this.uploadSizeByBlock; //每次上传的文件块的大小（1M）,改小这个值可以精细显示上传进度，但会增加http请求数，降低上传效率。
		var blobnum=filelen/blobsize;  //需要分几块上传
		this.inum=0;
		this.itotal=blobnum;
	    this._uploadblob(file,0,blobsize-1);//从第一块开始上传，上传成功的事件里调用下一块文件上传。这样可以确保逐个块上传。
	},
	_uploadblob:function (file,start,end){
		var self=this;
        var reader= new FileReader();
        if(end>=file.size) { end=file.size-1; }
        if(start>end) return;
        var blobsize=end-start+1;
        var blob;
	  	if(file.webkitSlice){
	  	      blob = file.webkitSlice(start, end + 1);
	  	  } else if(file.mozSlice) {
	  	      blob = file.mozSlice(start, end + 1);
	  	  } else if(file.slice) {
	  	      blob = file.slice(start, end + 1);
	  	  }
	  	  if(this.abortFlag){  return ;}   //取消上传
	  	reader.onloadend = function () {

	  	if(file.type.search(/zip/)>=0) self.requrl.replace(/putstream/, "putzip");
	  	var requrl=self.requrl+file.name;
		// var requrl="http://webgis.ecnu.edu.cn:85/fileserver?req=putstream&path=自定义的路径&fn="+file.name;
		$.ajax({
			async:true,// false 确保同步调用, 也可为true 
			url:requrl,
			type:'POST',
			contentType:'application/octet-stream', //（ 二进制流，不知道下载文件类型）文件扩展名为 .*
			processData:false,
			headers: {  //主要信息放在url上，次要参数放在这里，次要参数的值不能有中文,	若需要中文以后再说;后期将支持用户权限，需要再这里加入一个类似userkey:xxxxxxxx的内容
	    	        "filesize":file.size,
	    	        "start":start,
	    	        "blobsize":blobsize
        	        },
			data:this.result,
			success:function (){
					blob=null;
		        	this.result=null;//这两行避免浏览器内存泄漏
		    	    self.inum++;
		    	    self.uploaded=self.uploaded+blobsize;
		    	    self.onProgress(self.uploaded,self.totalFileSize);
				if(self.inum > self.itotal){
					self.fileCount++;
					self._uploadFile();

				}else {
					self._uploadblob(file,self.inum*blobsize,(self.inum+1)*blobsize-1); //	在这里调用可以确保逐个执行readAsArrayBuffer方法，若有更好的确保方法就取代这个方法。
				   } 
			},
			error:function (){
				self.failCallback();
			}
			});	
	  	};    
        reader.readAsArrayBuffer(blob); //此步是异步方式，应该逐个调用此方法，否则大型文件会导致浏览器崩溃
    },
    events:{
    	on:function (evtType,callback){
    		switch (evtType){
    			case "onProgress":
    			if(callback) {
    				gEcnu.Upload.prototype.onProgress = function (uploaded,totalsize) {
                  	  callback(uploaded,totalsize);
                  }
    			}
    			break;
    		}
    	}
    },
    _getFilesize:function (){
    	var files=this.files;
    	var size=0;
    	if(!files.length){ return 0;}
    	for(var i=0,len=files.length;i<len;i++){
    		size+=files[i].size;
    	}
    	return size;
    },
    //取消文件上传
    abort:function (){
    	this.abortFlag=true;
    },
	// showProgressBar:function (progressDiv){
	// 	this.progressBar=progressDiv;
	// 	progressDiv.style='width:100px;height:20px;border:1px solid #333';
	// },
	/**设置上传的参数
	* @param uploadSize 分块上传时一次上传的文件大小
	*/
	setParam:function (uploadSize){
		this.uploadSizeByBlock=sliceSize;
	}
});
gEcnu.Upload.prototype.onProgress=function (){

};
/**
 * 2015-9-11 By lc 
 * 上传字符串内容
 */

gEcnu.UploadString = gClass.extend({
	/**
	 * @param  {[type]} content  字符串、文本内容
	 * @param  {[type]} fn 示例test/test.html
	 * @param {  } [cat] 根路径 默认相对于data/userdata 
	 */
	init: function(content,fn,cat){  
		var arglen = arguments.length;
		fn = arglen>1 ? arguments[1] : 'index.html';
		cat =  arglen>2 ? arguments[2] : 'data/userdata/';
		this.requrl=gEcnu.config.geoserver+"fileserver?req=putstring";
		this.param = {'fn':fn,'cat':cat,'con':content};
	},
	processAscyn:function (succ,fail){
		var requrl = this.requrl;
		this.succCallback = arguments.length>0 ? arguments[0] : function (){};
		this.failCallback = arguments.length>1 ? arguments[1] : function (){};
		var self = this;
		var param = this.param;
		$.ajax({
		async:true,
		url:requrl,
		type:'POST',
		data:param,
		success:function (){
			self.succCallback(); 	
		},
		error:function (){
			self.failCallback();
		}
		});	
	}

});
/**
 * 2015-9-11 By lc 
 * 上传图片 base64编码
 */
gEcnu.UploadBase64 = gClass.extend({

});
/**
 * 2015-9-15 by lc
 * 操作文件夹 ：
 */



//上传文件（表格数据）至数据库 //文件名的唯一性，防止重名覆盖（待解决）
gEcnu.UploadCSVToDB=gClass.extend({
	init:function (file){
		this.file=file;
	},
	processAscyn:function (succ,fail){  //可选参数
		this.succCallback= succ;
		this.failCallback= fail;
		var file=this.file;
  		var filename=file.name.split(".")[0]; 
  		var self=this;
  		var reader = new FileReader(); 
  		reader.readAsText(file,'UTF-8'); 
  		reader.onload=function(){ 
  		    var bigdata=this.result;  
  		    self._read2DB(filename,bigdata);
  		  }
	},
	_read2DB:function (tabname,data){
		var self=this;
  		var arr=data.split(/\r\n/);  
  		if(arr.length<1){ return;} 
  		var fields=arr[0];  //首行：字段信息
  		self._createDBTab(tabname,fields,function (){
  			//self._recordTab();  //追加至记录表
  		  	self._insert2DBTab(tabname,arr);
  		});
	},
	_createDBTab:function (tabname,fields,callback){
  		var websqlUrl=gEcnu.config.geoserver+"WebSQL";
  		var failCallback=this.failCallback;
  		var fldstr=fields;
  		var sql="create table if not exists "+tabname+" ("+fldstr+")";
  		var sqlexecParams={
  		  "mt":"SQLExec",
  		  "GeoDB":'publicdb',
  		  "SQL":sql
  		  }
  		var datastr = JSON.stringify(sqlexecParams);
  		var params = { req: datastr };
  		try{
  		  gEcnu.Util.ajax("POST", websqlUrl, params, true,function (msg){
  		    if(callback!=undefined){
  		      callback();
  		    }
  		  });
  		} catch(e){
  		  if(failCallback!=undefined){
  		    failCallback();
    		}
  		}
	},
	_insert2DBTab:function (tabname,data){
 		var websqlUrl=gEcnu.config.geoserver+"WebSQL";
 		var succCallback=this.succCallback;
 		var fail=this.failCallback;
 		if(data.length<=1){return;}  //data ["id,name","1,hello"]
 		var fileds=data[0].split(",");
 		var dataArr=[];
 		for(var i=1,len=data.length;i<len;i++){
 		  var str=data[i]; 
 		  if(str!=''){
 		    var arr=str.split(",");
 		    // for(var j=0,arrLen=arr.length;j<arrLen;j++){
 		    // 	arr[j]=escape(arr[j]);
 		    // }
 		    dataArr.push(arr);
 		  }
 		}
 		var addParams={
 		  "mt":"SQLInsert",
 		  "GeoDB":"publicdb",
 		  "tablename":tabname,
 		  "fldnames":fileds,
 		  "data":dataArr
 		  };
 		var datastr = JSON.stringify(addParams);
 		var params = { req: datastr};
 		try{
    		gEcnu.Util.ajax("POST", websqlUrl, params, true,function (msg){
    			//console.log('写入到数据库中');
    			if(succCallback!=undefined){
    				succCallback();
    			}
    		});
  		} catch(e){
  			if(fail!=undefined){
  				fail();
  			}
  		}
	}

	});
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
		['olive','#808000','rgb(128,128,0)','rgb(50.2%,50.2%,0%)'],
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

gEcnu.WebSQLServices = gClass.extend({
    init: function() {},
});
gEcnu.ActType = {};
gEcnu.ActType.ADD = "ADD";
gEcnu.ActType.DELETE = "DELETE";
gEcnu.ActType.UPDATE = "UPDATE";
gEcnu.ActType.SQLQUERY= "SQLQUERY";
gEcnu.ActType.SQLEXEC= "SQLEXEC";
gEcnu.ActType.SQLTask = "SQLTask";  
gEcnu.WebSQLServices.SQLServices=gEcnu.WebSQLServices.extend({
    init: function(eventsListener) {
        if (typeof eventsListener != "undefined") {
            this.events._events.processCompleted = eventsListener.processCompleted;
            this.events._events.processFailed = eventsListener.processFailed;
        }
    },
    processAscyn: function(ActionType,map,lyrOrSQL,Params){
        //addParams{'Fields':[Array],'Data':[[Array],[Array]]}
        //delParams{'Fields':'String','Data':[,]}
        //updateParams{'Fields':[Array],'Data':[[Array],[Array]]}Fields中第一个字段为更新标示
        //var websqlUrl = 'http://' + gEcnu.config.webHostIP + ":" + gEcnu.config.port + "/WebSQL";
        var websqlUrl = gEcnu.config.geoserver+"WebSQL";
        if(ActionType=="ADD"){
        	var addParams={
        		"mt":"SQLInsert",
                "GeoDB":map,
                "tablename":lyrOrSQL,
                "fldnames":Params.Fields,
                "data":Params.Data
            }
            var datastr = JSON.stringify(addParams);
            var params = {
                req: datastr
            };
        }else if(ActionType=="SQLQUERY"){
            //此时的lyrOrSQL为{'lyr':'','fields':'','filter':''}
            var sqlqrysql="select "+lyrOrSQL.fields+" from "+lyrOrSQL.lyr;
            if(typeof(lyrOrSQL.filter)!="undefined"&&lyrOrSQL.filter!=""){
                sqlqrysql=sqlqrysql+" where "+lyrOrSQL.filter;
            }
            var qryParams={
            	"mt":"SQLQuery",
                "GeoDB":map,
                "SQL":sqlqrysql
            }
            var datastr = JSON.stringify(qryParams);
            var params = {
                req: datastr
            };
        }else if(ActionType=="DELETE"){
            var delParams={
            	"mt":"SQLDelete",
                "GeoDB":map,
                "tablename":lyrOrSQL,
                "KeyFld":Params.Fields,
                "key":Params.Data
            }
            var datastr = JSON.stringify(delParams);
            var params = {
                req: datastr
            };
        }else if(ActionType=="UPDATE"){
        	var updateParams={
        		"mt":"SQLUpdate",
                "GeoDB":map,
                "tablename":lyrOrSQL,
                "fldnames":Params.Fields,
                "data":Params.Data
            }
            var datastr = JSON.stringify(updateParams);
            var params = {
                req: datastr
            };
        }else if(ActionType=="SQLEXEC"){
        	var sqlexecParams={
        		"mt":"SQLExec",
                "GeoDB":map,
                "SQL":lyrOrSQL
            }
            var datastr = JSON.stringify(sqlexecParams);
            var params = {
                req: datastr
            };
        }else if(ActionType=="SQLTask"){
            var sqltaskParams={
            	"mt":"SQLTask",
                "GeoDB":map,
                "task":lyrOrSQL
            }
            var datastr = JSON.stringify(sqltaskParams);
            var params = {
                req: datastr
            };
        }    
        var websqlServices = this;
        var events_data_suc=websqlServices.events._events.processCompleted;
        var events_data_fail=websqlServices.events._events.processFailed;
        try { 
            gEcnu.Util.ajax("POST", websqlUrl, params, true, function(data,process_res){ 
                var sucCompleted=process_res['suc'];   
                if (typeof(sucCompleted) != "undefined") {
                	var jsonparase;
                    if(ActionType=="SQLQUERY"){
                        //处理返回数据 
                        var jsonparase_tmp=JSON.parse(data);  
                        var returnfields=jsonparase_tmp.data;  
                        var returnfields_len=returnfields.length;
                        var allFieldsArr=jsonparase_tmp.fldsDef;
                        var allFlds=[];
                        var returnArrays=[];
                        //取出所有字段的名称
                        for(var ii=0;ii<allFieldsArr.length;ii++){
                            var fldname=allFieldsArr[ii].name;
                            allFlds.push(fldname);
                        }
                        for(var nn=0;nn<returnfields_len;nn++){
                            var tmprecords=returnfields[nn];//此时是一个数组
                          
                            if(lyrOrSQL.fields!='*' && lyrOrSQL.fields.indexOf('*')<0){ //如果不是查询所有字段，进行字段数判断
                            var qryFields=lyrOrSQL.fields.split(',');
                            var returnFields_len=tmprecords.length;
                            if(returnFields_len!=qryFields.length){
                                alert('查询字段与返回字段个数不统一，问题：存在数据库中不存在字段！');
                                return;
                            }
                            var recordjson={};
                          
                            for(var tt=0;tt<returnFields_len;tt++){
                                var fieldname=qryFields[tt];
                                var fieldvalue=tmprecords[tt];
                                recordjson[fieldname]=fieldvalue; 
                            }
                            returnArrays.push(recordjson);
                         }else{   //返回所有字段
                            var recordjson={};
                            var returnFields_len=tmprecords.length;
                            for(var tt=0;tt<returnFields_len;tt++){
                                var fieldname=allFlds[tt]; 
                                var fieldvalue=tmprecords[tt];  
                                recordjson[fieldname]=fieldvalue; 
                            }
                            returnArrays.push(recordjson);
                         } 
                        }
                        jsonparase=returnArrays;
                    }else{
                        jsonparase=JSON.parse(data)
                    }
                    sucCompleted(jsonparase,allFieldsArr);
                }
            },function() {
                alert('websql请求超时');
            },500000,{'suc':events_data_suc,'fail':events_data_fail});
        }catch (e) {
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
gEcnu.WebSQLServices.SQLTasks = gEcnu.WebSQLServices.extend({
    init:function(ActionType,lyrOrSQL,Params){ 
       if(ActionType=="ADD"){
        	var addParams={
        		"mt":"SQLInsert",
                "tablename":lyrOrSQL,
                "fldnames":Params.Fields,
                "data":Params.Data
            }
            //return addParams;
             this.sqlTaskParams=addParams;
        }else if(ActionType=="DELETE"){
            var delParams={
            	"mt":"SQLDelete",
                "tablename":lyrOrSQL,
                "KeyFld":Params.Fields,
                "key":Params.Data
            }
            //return delParams;
           this.sqlTaskParams=delParams;
        }else if(ActionType=="UPDATE"){
        	var updateParams={
        		"mt":"SQLUpdate",
                "tablename":lyrOrSQL,
                "fldnames":Params.Fields,
                "data":Params.Data
            }
            //return updateParams;
            this.sqlTaskParams=updateParams;
        }else if(ActionType=="SQLEXEC"){
        	var sqlexecParams={
        		"mt":"SQLExec",
                "SQL":lyrOrSQL
            }
            //return sqlexecParams;
            this.sqlTaskParams=sqlexecParams;
        }
    }
});
/**
*执行sql文件
*/
gEcnu.WebsqlScript = gClass.extend({
    init: function(eventListener) { //alert(eventListener);
        this.processCompleted = eventListener.processCompleted || function (){};
        this.processFailed = eventListener.processFailed || function (){};
            
    },
    //{'scriptname':,'resname':....}
    processAscyn: function (params){
    	var reqParam={ req : JSON.stringify(params) };
    	var webscriptUrl = gEcnu.config.geoserver+"websqlscript";
        var _succ= this.processCompleted;   
        var _fail= this.processFailed;
        var self=this;  
        try { 
            gEcnu.Util.ajax("POST", webscriptUrl, reqParam, true, function(data){ 
                if(!data){ return;  }
                var sucCompleted= _succ;  
                var failComplete= _fail; 
                var jsonparse=JSON.parse(data);
                var totalResult=[];  //针对查询类 返回查询结果
                var msg={};   //针对增删改操作，返回操作信息
                var fldsdefArr =[]; //字段信息
                for(var key in jsonparse){
                    if(/^Query_\d+$/i.test(key)){ //筛选出query块 查询结果
                        var query_result=jsonparse[key];
                        // if(query_result['SQL_RESULT']!=undefined && query_result['SQL_RESULT']<0){
                        //     failComplete(query_result['SQL_MSG']);
                        //     return;
                        // }
                        var format_result=self._formatData(query_result);
                        var fldsdef = query_result.fldsDef;
                        totalResult = totalResult.concat(format_result);
                        fldsdefArr.push(fldsdef);
                    }else{
                        msg[key]=jsonparse[key];
                    }
                }
                var finalRes={'message':msg,"queryResult":totalResult,'fldsDef':fldsdefArr};
                if(sucCompleted!=undefined){ 
                    sucCompleted(finalRes);
                }
            },function() {
                //alert('websqlscript请求超时');
            },500000);
            }catch(e){
                if(_fail!=undefined){
                    _fail(e);
                }
            }
    },
    //将数据处理成键值对形式 result  sql块返回的结果 query_2、query_3....
    _formatData: function (result){
        var resultArr=[];
        if(result.data==undefined){
            resultArr.push(result)
            return resultArr;
        }
        var recs=result.data;
        var allTabFlds=result.fldsDef;
        var reqFldNum=allTabFlds.length; //这里返回所有字段
        for(var i=0,len=recs.length;i<len;i++){
            var returnRec={};
            var curRecord=recs[i];  //[0,shmap,5113080]
            if(curRecord.length!=reqFldNum){
                alert('查询字段与返回字段个数不统一，可能存在数据库中不字段！');
                return;
            }
            for(var j=0;j<reqFldNum;j++){
                var fldname=allTabFlds[j].name;
                var value=curRecord[j];
                returnRec[fldname]=value;  
            }
            resultArr.push(returnRec);
        }
        return resultArr;
    }
    // events: {
    //     _events: {},
    //     on: function(eventType, callback) {
    //         switch (eventType) {
    //             case 'processCompleted':
    //                 this._events.processCompleted = callback;
    //                 break;
    //             case 'processFailed':
    //                 this._events.processFailed = callback;
    //                 break;
    //         }
    //     }
    // }
});
