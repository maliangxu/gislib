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

		// this.webHost = "http://" + window.location.hostname;
		// this.webHost = 'http://' + gEcnu.config.webHostIP;
		// this.serverURL = this.webHost + ":" + gEcnu.config.port + "/";
		// this.serverURL = gEcnu.config.geoserver;
		this.serverURL = gEcnu.config.geoserver;//2015-9-2 tile map  58.198.182.28
		this.webMapURL = this.serverURL + "WebMap";
		//this.webFeatureUrl=this.serverURL + "WebFeature";
		this.tileMapURL = gEcnu.config.tileMapURL + "TileMap"; 
		this.tileFileServer = gEcnu.config.tileMapURL +"FileServer?fn=";

		this.tileMapURL_Ex =  gEcnu.config.tileMapURL_Ex+"webtilemap";   //"https://ccgis.cn/mapb/webtilemap";
		this.fileServer_Ex =  gEcnu.config.tileMapURL_Ex+"FileServer?fn=map/";   //"https://ccgis.cn/mapb/fileServer?fn=map/"; 
		//this.tileMapURL =  "http://webgis.ecnu.edu.cn:81/TileMap";
		this.fileServer = this.serverURL + "FileServer?fn=";
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
			    	/*	if (gSelf.tileCount > 0) {     //2016-1-26
		                	if (gSelf.zl <= gSelf.minLevel) {
		                		gSelf._boundsChanged({'error':'zoomin'});
		                		return;
		                	}
		                }*/
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
			    	/*	if (gSelf.tileCount > 0) {    //2016-1-26
		                	if (gSelf.zl >= gSelf.maxLevel) { 
		                		gSelf._boundsChanged({'error':'zoomout'});
		                		return;
		                	}
		                }*/
		                
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

	//操作完成后显示提示信息,tipmsg为提示内容
    showTipWin: function (tipmsg){
    	var tmpdoc=document;
     	var div=tmpdoc.createElement('div');
     	div.id="tipWinID";
     	tmpdoc.body.appendChild(div);
  	    $('#tipWinID').html(tipmsg);
  	    $('#tipWinID').css({
          'position':'none',
          'position':'absolute',
          'left':'0px',
          'top':'-50px',
  	      'right':'0px',
          'bottom':'0px',
          'margin':'auto auto',
          'width':'200px',
          'height':'40px',
  	      'border-radius':'20px',
          'background-color':'#757575',
          'text-align':'center',
          'line-height':'40px',
  	      'font-size':'15px',
          'color':'#fff',
          'z-index':'999999'
        });
  	    $('#tipWinID').fadeIn(200).delay(600).fadeOut(200);
  	    setTimeout(function(){
  	    	tmpdoc.body.removeChild(div);
  	    },900);  	    
  	},
	/**
	 * 视野放大操作
	 */
	 zoomIn: function (mouseXY) { 

		var coordsys=gSelf.coordsFlag;
		var oLayers = this.getAllLayers();
		if(this.ownOther){  //判断如果有第三方地图时  其也有缩放级别限制
			if(coordsys=='PROJECTED'){
				var curoMaplevel=gSelf.activeLayer.oMap.MaxLevel-this.zl; //第三方地图的当前所处缩放级别
			if(curoMaplevel>=gSelf.activeLayer.oMap.MaxLevel){  
				this.showTipWin("已经放大至最大级别");
					return;
				}
		 }else{
		 	var otherZoomlevel=Math.floor(10-Math.log(gSelf.zoom/(gSelf.activeLayer.otherPxScale*gSelf.w))/Math.log(2));
		 	if(otherZoomlevel>=gSelf.activeLayer.oMap.MaxLevel){
		 		this.showTipWin("已经放大至最大级别");
					return;
		 	}
		 }	
		}
		this.zoom = (this.zoom) / 2;
		var tmpzl=this.zl;
		this.zl_pre=tmpzl;
		this.zl--;
		for (var i = 0; i < oLayers.length; i++) {
			var curLayer = oLayers[i];
			if(curLayer.oClass=='tileLayer'   ){  
				if(!(curLayer.isInLevel()) ){
					curLayer.hide();
					
				}else{
					if(!curLayer.visible ){
						curLayer.show();
					}
					
				}
			}
			if (curLayer.visible) {
				curLayer.zoomIn(mouseXY);
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
				var otherZoomlevel=Math.floor(10-Math.log(gSelf.zoom/(gSelf.activeLayer.otherPxScale*gSelf.w))/Math.log(2));
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
			var curLayer = oLayers[i];
			if(curLayer.oClass=='tileLayer'   ){  console.log(curLayer.getCurrentLevel(),curLayer.isInLevel());
				if(!(curLayer.isInLevel()) ){
					curLayer.hide();
				}else{
					if(!curLayer.visible ){
						curLayer.show();
					}
				}
			}
			if (curLayer.visible) {
				curLayer.zoomOut(mouseXY);
			}
		}
		var oControls = this.getAllControls();
		for (var j = 0; j < oControls.length; j++) {
			oControls[j].renew();
		}
		gSelf._boundsChanged();
	},
	zoomIn_bak: function (mouseXY) { 
		// if (this.ownTile) {  
	/*		if (this.tileCount > 0) {
			if (this.zl <= this.minLevel) {
				return;
			}
		}*/
		var coordsys=gSelf.coordsFlag;
		var oLayers = this.getAllLayers();
		if(this.ownOther){  //判断如果有第三方地图时  其也有缩放级别限制
			if(coordsys=='PROJECTED'){
				var curoMaplevel=gSelf.activeLayer.oMap.MaxLevel-this.zl; //第三方地图的当前所处缩放级别
			if(curoMaplevel>=gSelf.activeLayer.oMap.MaxLevel){  
				this.showTipWin("已经放大至最大级别");
					return;
				}
		 }else{
		 	var otherZoomlevel=Math.floor(10-Math.log(gSelf.zoom/(gSelf.activeLayer.otherPxScale*gSelf.w))/Math.log(2));
		 	if(otherZoomlevel>=gSelf.activeLayer.oMap.MaxLevel){
		 		this.showTipWin("已经放大至最大级别");
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
	
	zoomOut_bak: function (mouseXY) {  
		//if (this.ownTile) {
	/*	if (this.tileCount > 0) {
			if (this.zl >= this.maxLevel) { 
				return;
			}
		}*/
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
				var otherZoomlevel=Math.floor(10-Math.log(gSelf.zoom/(gSelf.activeLayer.otherPxScale*gSelf.w))/Math.log(2));
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