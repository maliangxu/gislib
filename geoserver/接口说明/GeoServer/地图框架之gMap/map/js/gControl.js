
/**********gEcnu的Control信息****************/
gEcnu.Control = gClass.extend({
  init: function(id,options) {
      this.id = id;
      this.options =  {
          top: 15,
          left: 15,
          zIndex: 500
      };
  },
  setPos: function(){   /*设置容器的位置*/
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
       this._super();
       this.options = gEcnu.Util.setOptions(this, options);
   },
   _initContainer: function(){
       var w = 30, h = 60;
       var zoomDiv = gEcnu.Util.createDiv('zoomCtrl',w,h,true);
       var zoomInDiv = gEcnu.Util.createDiv('zoomInDiv',w,h/2,false);
       var zoomInImg = new Image();
       zoomInImg.src = "images/zoomin.png";
       zoomInDiv.appendChild(zoomInImg);
       var zoomOutDiv = gEcnu.Util.createDiv('zoomInDiv',w,h/2,false);
       var zoomOutImg = new Image();
       zoomOutImg.src = "images/zoomout.png";
       zoomInImg.onmousedown = function(e){
         //gEcnu.Util.compelteEdit();
         gSelf.zoomIn();
       };
       zoomOutImg.onmousedown = function(e){
         //gEcnu.Util.compelteEdit();
         gSelf.zoomOut();
       };
       /*********2014-5-15lc添加*************/
       zoomInImg.ontouchstart=function(e){
         gSelf.zoomIn();
       };
       zoomOutImg.ontouchstart = function(e){
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
   }
});
gEcnu.Control.Scale = gEcnu.Control.extend({
     init:function(id,options){
         this._super(id,options);
         this.options =  {
             top: 0,
             left: 0,
             zIndex: 15
         };
         this.class='scaleControl';
         this.options=gEcnu.Util.setOptions(this,options);
     },
     onAdd: function(map){
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
     _showScale: function(size){
         var height  = size.h;
         var ctx = this._ctx;
         var showscale=this._showScaleText(ctx,height);
         var multiple=showscale.m;
         var width=100*multiple;
         var widthHalf=Math.round(width/2);

         ctx.beginPath();
         //ctx.strokeStyle = "#F5F5F5";
         //ctx.linewidth = 5;
         ctx.strokeStyle = "#fff";
         //ctx.strokeStyle = "#000000";
         ctx.fillStyle = "#fff";
         ctx.linewidth = 1;
         ctx.moveTo(26,height - 33);//设置起点
         ctx.lineTo(26,height - 30);

         ctx.lineTo(width+26,height - 30);
         ctx.lineTo(width+26,height - 33);
         ctx.closePath();
         ctx.fill();

         ctx.beginPath();
         ctx.moveTo(27,height - 30);
         ctx.lineTo(27,height - 24);
         ctx.closePath();
         ctx.stroke();

         ctx.beginPath();
         ctx.moveTo(width+25,height - 30);
         ctx.lineTo(width+25,height - 24);
         ctx.closePath();
         ctx.stroke();

         ctx.beginPath();
         ctx.moveTo(widthHalf+25,height - 30);
         ctx.lineTo(widthHalf+25,height - 24);
         ctx.closePath();
         ctx.stroke();
     },
     _showScaleText: function(ctx,h){
         var scale = gSelf.zoom / parseInt(gSelf.w);
         var scaleInt=(100*scale/1000).toPrecision(3);     
         var result=this._getScaleWidth(scaleInt);
         var kmscale = result.kmScale;
         var halfkmscale=result.halfkmscale;

         var multiple=result.m;
         var width=100*multiple;
         var widthHalf=Math.round(width/2);

         ctx.clearRect(0,0,200,h);
         ctx.font = '14px serif';
         ctx.fillStyle = '#F5F5F5';

         ctx.fillText('0', 25, h - 10);//IE不支持
         ctx.fillText(halfkmscale, widthHalf+22, h - 10);
         ctx.fillText(kmscale, width+15, h - 10);
         return result;
     },
     _getScaleWidth: function(s){
         var result={};
         if(s>=0.5 && s<=15){
             var scale=Math.round(s);
             switch(scale){
                 case 1:
                     result.m = (s/1).toPrecision(2);
                     result.kmScale ="1公里";
                     result.halfkmscale ="0.5";
                     break;
                 case 2:
                     result.m = (s/2).toPrecision(2);
                     result.kmScale ="2公里";
                     result.halfkmscale ="1";
                     break;
                 case 3:
                     result.m = (s/3).toPrecision(2);
                     result.kmScale ="3公里";
                     result.halfkmscale ="1.5";
                     break;
                 case 4:
                     result.m = (s/4).toPrecision(2);
                     result.kmScale ="4公里";
                     result.halfkmscale ="2";
                     break;
                 case 5:
                     result.m = (s/5).toPrecision(2);
                     result.kmScale ="5公里";
                     result.halfkmscale ="2.5";
                     break;
                 case 6:
                     result.m = (s/6).toPrecision(2);
                     result.kmScale ="6公里";
                     result.halfkmscale ="3";
                     break;
             }
         }else if(s<1){
             s=s*1000;
             if(s<500 && s>200){
                 result.m = (s/500).toPrecision(2);
                 result.kmScale ="500米";
                 result.halfkmscale ="250";
             }else if(s<=200 && s>100){
                 result.m = (s/200).toPrecision(2);
                 result.kmScale ="200米";
                 result.halfkmscale ="100";
             }else if(s<=100 && s>50){
                 result.m = (s/100).toPrecision(2);
                 result.kmScale ="100米";
                 result.halfkmscale ="50";
             }else{
                 result.m = 1;
                 result.kmScale =s/1000+"公里";
                 result.halfkmscale ="s/2000";
             }
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