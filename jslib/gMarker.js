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