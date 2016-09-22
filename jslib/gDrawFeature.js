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