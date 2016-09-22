var gEdit = {};
gEdit.polyPointId = 0;
gEdit.polylinePointId = 0;
gEdit.featureObj = {};
gEdit.featureObj.points = [];
gEdit.selectedPolygonID = 0;
gEdit.polySelected = false; //此处变量控制是否有要素被选中
gEdit.selectedPolygonVtxID = 0;
gEdit.selectedPolyPoints = []; //选中多边形节点数据
gEdit.moving = false; //此处功能是判断鼠标是否处于按下状态，编辑多边形时使用
gEdit.selectedPoly; //选中的多边形
gEdit.snapStatus = true;
gEdit.lastPoint = {};

	var Edit = {};
	/**
	 * 地图浏览操作外的mousedown响应函数
	 * @param e
	 * @param map
	 */
	Edit.graphMouseDownEvt = function (e, map) {
		var mode = map.getMode();
		var mxy = gEcnu.Util.getMouseXY(e);
		gSelf.startX = mxy.x;
		gSelf.startY = mxy.y;
		var wxy = gEcnu.Util.screenToWorld(mxy.x, mxy.y);
		var ctx = map.overLayer.getCtx();
		gEdit.moving = true;
		//gEditraph.setStyle(ctx);
		switch (mode) {
		case 'drawMarker':
			var tMarker = new gEcnu.Feature.Marker('tMarker', {
				'x': wxy.x,
				'y': wxy.y,
				'info': 'Hello tMarker'
			});
			map.activeLayer.addMarker(tMarker);
			break;
			//绘制Polyline
		case 'drawPolyline':
			gEdit.polylinePointId++;
			var pt = gEcnu.Feature.Point(gEdit.polyPointId, wxy.x, wxy.y);
			gEditraph.drawPoint(ctx, mxy);
			gEdit.featureObj.points.push(pt);
			break;
			//绘制Polygon
		case 'drawPolygon':
			var returnpointxy = "false";
			if (gEdit.featureObj.points.length == 0) {
				lastPoint = ""; //撤销操作时保存的撤销点，便于重绘撤销点操作 (位于comm.js中)
			}
			gEdit.polyPointId++;
			if (gEdit.snapStatus) //此处的功能为捕捉功能开启执行语句，否则，不进行捕捉
			{
				returnpointxy = gEditraph.catchPoint(mxy, map.curScrPolys);
			}
			var pt = {};
			if (returnpointxy.indexOf("true") >= 0) {
				var point_x = returnpointxy.split("|")[1].split(",")[0];
				var point_y = returnpointxy.split("|")[1].split(",")[1];
				//存入节点数组
				var wxy = gEcnu.Util.screenToWorld(point_x, point_y);
				pt = gEcnu.Feature.Point(gEdit.polyPointId, wxy.x, wxy.y);
				gEditraph.drawPoint(ctx, {
					x: point_x,
					y: point_y
				});
			} else {
				var wxy = gEcnu.Util.screenToWorld(mxy.x, mxy.y);
				pt = gEcnu.Feature.Point(gEdit.polyPointId, wxy.x, wxy.y);
				gEditraph.drawPoint(ctx, mxy);
			}
			gEdit.featureObj.points.push(pt);
			break;
			//编辑Polygon
		case 'editPolygon':
			var curScrPolys = map.curScrPolys;
			if (curScrPolys.length == 0) {
				alert('无可编辑多边形');
				gEdit.selectedPolygonID = 0;
				gEdit.polySelected = false; //此处变量控制是否有要素被选中
				gEdit.selectedPolygonVtxID = 0;
				gEdit.selectedPolyPoints = []; //选中多边形节点数据
				map.setMode("map");
				map.mapTool = "pan";
				return;
			} else {
				for (var i = 0; i < curScrPolys.length; i++) {
					var polyPointArr = gEditraph.getScreenPointArr(curScrPolys[i].vtxArr);
					if (gEditraph.pointInPoly(mxy, polyPointArr)) {
						gEdit.selectedPolygonID = curScrPolys[i].ID;
						//console.log(G.selectedPolygonID);
						gEdit.polySelected = true; //此处变量控制是否有要素被选中
						gEdit.selectedPolygonVtxID = 0;
						map.overLayer.clear();
						curScrPolys[i].onSelect();
						gEdit.selectedPolyPoints = [];
						var ptArr = curScrPolys[i].vtxArr;
						gEdit.selectedPolyPoints = gEditraph.getSelectedPolyPoints(ptArr);
						//console.log(G.selectedPolyPoints);
						break;
					} else {
						gEdit.selectedPolygonID = 0;
					}
				}
			}
			break;
			//平移多边形
		case 'movePolygon':
			if (!gEdit.polySelected) {
				alert('请选择多边形!');
				gEdit.polySelected = false; //此处变量控制是否有要素被选中
				gEdit.selectedPolygonVtxID = 0;
				gEdit.selectedPolyPoints = []; //选中多边形节点数据
				map.setMode('map');
				map.mapTool = "pan";
				return;
			} else {
				var storePoly = map.curScrPolys;
				var selectedPolyId = gEdit.selectedPolygonID;
				for (var i = 0; i < storePoly.length; i++) {
					if (storePoly[i].ID == selectedPolyId) {
						gEdit.selectedPoly = new gEcnu.Feature.Polygon('tmp', gEcnu.Util.cloneObj(storePoly[i].vtxArr), {
							'type': 'tmp'
						});
						gEdit.selectedPoly.ID = storePoly[i].ID;
						//console.log(G.selectedPoly);
						//G.selectedPoly = gEcnu.Util.cloneObj(storePoly[i]));
						break;
					}
				}
			}
			break;
			//编辑多边形顶点点
		case 'editPolygonVtx':
			if (!gEdit.polySelected) {
				alert('请选择多边形!');
				gEdit.polySelected = false; //此处变量控制是否有要素被选中
				gEdit.selectedPolygonVtxID = 0;
				gEdit.selectedPolyPoints = []; //选中多边形节点数据
				map.setMode('map');
				map.mapTool = "pan";
				return;
			} else {
				var curScrPolys = map.curScrPolys;
				for (i = 0; i < curScrPolys.length; i++) {
					if (gEdit.selectedPolygonID == curScrPolys[i].ID) {
						var ptArr = curScrPolys[i].vtxArr;
						for (j = 0; j < ptArr.length; j++) {
							var sxy = gEcnu.Util.worldToScreen(ptArr[j].x, ptArr[j].y);
							var dis = Math.sqrt((mxy.x - sxy.x) * (mxy.x - sxy.x) + (mxy.y - sxy.y) * (mxy.y - sxy.y));
							if (dis <= map.tlr) {
								gEdit.selectedPolygonVtxID = ptArr[j].ID;
								//console.log(G.selectedPolygonVtxID);
								//drawSimplePoint(gmap.overlayCtx,x,y,true);
								var ctx = map.overLayer.getCtx();
								gEditraph.drawVtx(ctx, sxy);
								map.setMode("movePolygonVtx");
								return;
							}
						}
					}
				}
			}
			break;
			//添加多边形节点
		case 'addPolygonVtx':
			if (!gEdit.polySelected) {
				alert('请选择多边形!');
				gEdit.polySelected = false; //此处变量控制是否有要素被选中
				gEdit.selectedPolygonVtxID = 0;
				gEdit.selectedPolyPoints = []; //选中多边形节点数据
				map.setMode('map');
				map.mapTool = "pan";
				return;
			} else {
				var addPolygonVtxpoints = [];
				addPolygonVtxpoints = gEditraph.addPolygonvtx(mxy, gEdit.selectedPolyPoints);
				//console.log(addPolygonVtxpoints);
				if (addPolygonVtxpoints.length == 0) {
					alert('添加节点失败!');
					gEdit.moving = false;
					return;
				} else {
					var oFeatures = map.activeLayer.getAllFeatures();
					for (i = 0; i < oFeatures.length; i++) {
						if (gEdit.selectedPolygonID == oFeatures[i].ID) {
							oFeatures[i].vtxArr = addPolygonVtxpoints;
							oFeatures[i].geoShpBox = gEditraph.getShpBox(addPolygonVtxpoints);
							gEdit.selectedPolyPoints = [];
							gEdit.selectedPolyPoints = gEditraph.getSelectedPolyPoints(addPolygonVtxpoints);
							oFeatures[i].onSelect();
						}
					}
					map.curScrPolys = gEditraph.getCurViewPolys(oFeatures);
					map.setMode("addPolygonVtx");
				}
			}
			break;
			//删除多边形节点
		case 'delPolygonVtx':
			if (!gEdit.polySelected) {
				alert('请选择多边形!');
				gEdit.polySelected = false; //此处变量控制是否有要素被选中
				gEdit.selectedPolygonVtxID = 0;
				gEdit.selectedPolyPoints = []; //选中多边形节点数据
				map.setMode('map');
				map.mapTool = "pan";
				return;
			} else {
				var oFeatures = map.activeLayer.getAllFeatures();
				for (i = 0; i < oFeatures.length; i++) {
					if (gEdit.selectedPolygonID == oFeatures[i].ID) {
						var ptArr = oFeatures[i].vtxArr;
						for (j = 0; j < ptArr.length; j++) {
							var sxy = gEcnu.Util.worldToScreen(ptArr[j].x, ptArr[j].y);
							var x = sxy.x;
							var y = sxy.y;
							var dis = Math.sqrt((mxy.x - x) * (mxy.x - x) + (mxy.y - y) * (mxy.y - y));
							if (dis <= 5) {
								gEdit.selectedPolygonVtxID = ptArr[j].ID;
								if (ptArr.length > 3) {
									for (var k = j; k < ptArr.length - 1; k++) {
										ptArr[k] = ptArr[k + 1];
									}
									ptArr.pop();
								}
								oFeatures[i].geoShpBox = gEditraph.getShpBox(ptArr);
								map.activeLayer.clear();
								map.curScrPolys = gEditraph.getCurViewPolys(oFeatures);
								map.activeLayer.renew();
								break;
							}
						}
						map.overLayer.clear();
						oFeatures[i].onSelect();
					}
				}
				map.setMode('deletePolygonVtx');
			}
			break;
		case 'default':

			break;
		}
	}

	/**
	 * 地图浏览操作外的mousemove响应函数
	 * @param e
	 * @param map
	 */
	Edit.graphMouseMoveEvt = function (e, map) {
		var mode = map.getMode();
		var mxy = gEcnu.Util.getMouseXY(e);
		var ctx = map.overLayer.getCtx();
		var ptArr = gEdit.featureObj.points;
		var len = ptArr.length;
		switch (mode) {
		case 'drawPolyline':
			if (len >= 1) {
				map.overLayer.clear();
				var sxy = gEcnu.Util.worldToScreen(ptArr[len - 1].x, ptArr[len - 1].y);
				gEditraph.drawLine(ctx, sxy, mxy);
				gEditraph.drawLines(ctx, ptArr);
			}
			break;
		case 'drawPolygon':
			map.overLayer.clear();
			var returnpoint = "";
			if (gEdit.snapStatus) //此处的功能为捕捉功能开启执行语句，否则，不进行捕捉
			{
				returnpoint = gEditraph.catchPoint(mxy, map.curScrPolys);
			}
			if (returnpoint.indexOf("true") >= 0) {
				//如果捕捉到顶点，则鼠标形状显示为十字丝形状
				map.overLayer.getLayerContainer().style.cursor = "crosshair";
				var pointx = returnpoint.split("|")[1].split(",")[0];
				var pointy = returnpoint.split("|")[1].split(",")[1];
				gEditraph.drawVtx(ctx, {
					x: pointx,
					y: pointy
				});
			} else {
				map.overLayer.getLayerContainer().style.cursor = "default";
				//判断捕捉线
				var returnstring = "";
				if (map.curScrPolys.length >= 1) { //进行捕捉判断
					var returnstring = "false";
					if (gEdit.snapStatus) {
						returnstring = gEditraph.catchLine(mxy, map.curScrPolys);
					}
					if (returnstring.indexOf("true") >= 0) { //捕捉到了线段
						var startx = returnstring.split('|')[2].split(',')[0];
						var starty = returnstring.split('|')[2].split(',')[1];
						var endx = returnstring.split('|')[3].split(',')[0];
						var endy = returnstring.split('|')[3].split(',')[1];
						var pt1 = gEcnu.Feature.Point('1', startx, starty);
						var pt2 = gEcnu.Feature.Point('2', endx, endy);
						gEcnu.Util.setStyle(ctx, 'catchLine');
						gEditraph.drawLine(ctx, pt1, pt2);
					} else { //没有捕捉到
						//不用进行操作
					}
				} else { //没有多边形 也就没有必要进行捕捉了
					//不用进行操作
				}
			}
			gEcnu.Util.setStyle(ctx);
			if (len >= 1) {
				var sxy = gEcnu.Util.worldToScreen(ptArr[len - 1].x, ptArr[len - 1].y);
				gEditraph.drawLine(ctx, sxy, mxy);
				if (len >= 2) {
					gEditraph.drawLines(ctx, ptArr);
					sxy = gEcnu.Util.worldToScreen(ptArr[0].x, ptArr[0].y);
					gEditraph.drawLine(ctx, mxy, sxy);
				}
			}
			break;
		case 'movePolygon':
			if (gEdit.selectedPolygonID != 0 && G.moving) {
				map.overLayer.clear();
				var dltx = mxy.x - map.startX;
				var dlty = mxy.y - map.startY;
				var ctx = map.activeLayer.getCtx();
				gEditraph.movePolygon(ctx, G.selectedPolygonID, dltx, dlty);
			}
			break;
		case 'movePolygonVtx':
			if (gEdit.selectedPolygonVtxID != 0 && G.moving) {
				var curScrPolys = map.curScrPolys;
				for (i = 0; i < curScrPolys.length; i++) {
					if (gEdit.selectedPolygonID == curScrPolys[i].ID) {
						map.overLayer.clear();
						var catchPointpolyline = [];
						for (var m = 0; m < curScrPolys.length; m++) {
							if (gEdit.selectedPolygonID != curScrPolys[m].ID) {
								catchPointpolyline.push(curScrPolys[m]);
							}
						}
						var ptArr = curScrPolys[i].vtxArr;
						for (j = 0; j < ptArr.length; j++) {
							if (ptArr[j].ID == gEdit.selectedPolygonVtxID) {
								var returnpoint = gEditraph.catchPoint(mxy, catchPointpolyline);
								if (returnpoint.indexOf("true") >= 0) {
									map.overLayer.getLayerContainer().style.cursor = "crosshair";
									var pointx = returnpoint.split("|")[1].split(",")[0];
									var pointy = returnpoint.split("|")[1].split(",")[1];
									var pt = gEcnu.Util.screenToWorld(pointx, pointy);
									ptArr[j].x = pt.x;
									ptArr[j].y = pt.y;
									var ctx = map.overLayer.getCtx();
									gEditraph.drawVtx(ctx, {
										x: pointx,
										y: pointy
									});
									map.activeLayer.renew();
								} else {
									map.overLayer.getLayerContainer().style.cursor = "move";
									//捕捉线段
									var returnstring = gEditraph.catchLine(mxy, catchPointpolyline);
									if (returnstring.indexOf("true") >= 0) {
										var startx = returnstring.split('|')[2].split(',')[0];
										var starty = returnstring.split('|')[2].split(',')[1];
										var endx = returnstring.split('|')[3].split(',')[0];
										var endy = returnstring.split('|')[3].split(',')[1];
										var pt1 = gEcnu.Feature.Point('1', startx, starty);
										var pt2 = gEcnu.Feature.Point('2', endx, endy);
										map.activeLayer.renew();
										var ctx = map.activeLayer.getCtx();
										ctx.strokeStyle = '#ff0000';
										gEditraph.drawLine(ctx, pt1, pt2);
										var interx = returnstring.split('|')[1].split(',')[0];
										var intery = returnstring.split('|')[1].split(',')[1];
										var pt = gEcnu.Util.screenToWorld(interx, intery);
										ptArr[j].x = pt.x;
										ptArr[j].y = pt.y;
										gEditraph.drawVtx(ctx, {
											'x': interx,
											'y': intery
										});
									} else {
										var pt = gEcnu.Util.screenToWorld(mxy.x, mxy.y);
										ptArr[j].x = pt.x;
										ptArr[j].y = pt.y;
										map.activeLayer.renew();
									}
								}
							}
						}
					}
				}
			}
			break;
		}
	}

	/**
	 * 地图浏览操作外的mousee响应函数
	 * @param e
	 * @param map
	 */
	Edit.graphMouseUpEvt = function (e, map) {
		var mode = map.getMode();
		var mxy = gEcnu.Util.getMouseXY(e);
		var wxy = gEcnu.Util.screenToWorld(mxy.x, mxy.y);
		gEdit.moving = false;
		switch (mode) {
		case 'drawPolygon':

			break;
		case 'movePolygonVtx':
			map.activeLayer.clear();
			if (gEdit.selectedPolygonVtxID != 0) {
				var curScrPolys = map.curScrPolys;
				map.activeLayer.renew();
				for (var i = 0; i < curScrPolys.length; i++) {
					if (curScrPolys[i].ID == gEdit.selectedPolygonID) {
						curScrPolys[i].onSelect();
						var polyPointObj = [];
						gEdit.selectedPolyPoints = [];
						var oFeatures = map.activeLayer.getAllgEcnu.Features();
						for (var j = 0; j < oFeatures.length; j++) {
							if (oFeatures[j].ID == gEdit.selectedPolygonID) {
								oFeatures[j] = curScrPolys[i];
							}
						}
						var ptArr = curScrPolys[i].vtxArr;
						curScrPolys[i].geoShpBox = gEditraph.getShpBox(ptArr);
						gEdit.selectedPolyPoints = gEditraph.getSelectedPolyPoints(ptArr);
						map.curScrPolys = gEditraph.getCurViewPolys(oFeatures);
						break;
					}
				}
				gEdit.selectedPolygonVtxID = 0;
				map.setMode('editPolygonVtx');
				gEdit.polySelected = true;
			}
			map.overLayer.getLayerContainer().style.cursor = "default";
			break;
		case 'movePolygon':
			var storePoly = map.curScrPolys;
			for (var i = 0; i < storePoly.length; i++) {
				if (storePoly[i].ID == gEdit.selectedPolygonID) {
					storePoly[i].onSelect();
					break;
				}
			}
			break;

		}
	}

	/**
	 * 地图浏览操作外的mouse响应函数
	 * @param e
	 * @param map
	 */
	Edit.graphMouseDblClickEvt = function (e, map) {
		var mode = map.getMode();
		switch (mode) {
		case 'drawPolyline':
            gEdit.featureObj.points.pop();
			var poly = new gEcnu.Feature.Polyline('polyline', gEdit.featureObj.points);
			map.overLayer.clear();
			map.activeLayer.addgEcnu.Feature(poly);
            gEdit.polyPointId = 0;
			gEdit.featureObj.points = [];
			break;
		case 'drawPolygon':
            gEdit.featureObj.points.pop();
			var poly = new gEcnu.Feature.Polygon('poly', gEdit.featureObj.points, {
				'type': 'orange'
			});
			map.overLayer.clear();
			map.activeLayer.addgEcnu.Feature(poly);
			gEdit.featureObj.points = [];
            gEdit.polyPointId = 0;
			gEditraph.getCurViewPolys(map.activeLayer.getAllgEcnu.Features());
			break;
		}
	};

	/**
	 * 样式设置
	 * @param ctx
	 * @param type
	 * @returns {{fillColor: string, strokeColor: string, lineWeight: number, borderStatus: boolean, fillStatus: boolean, vtxStatus: boolean, vtxRadius: number, tlr: number}}
	 */
	gEcnu.Util.setStyle = function (ctx, type) {
		var opt = {
			'fillColor': 'yellow',
			'strokeColor': 'yellow',
			'lineWeight': 1,
			'borderStatus': true,
			'fillStatus': true,
			'vtxStatus': false,
			'vtxRadius': 3,
			'opacity': 0.4
		};
		switch (type) {
		case 'grass':
			opt.strokeColor = 'green';
			opt.fillColor = 'green';
			break;
		case 'orange':
			opt.strokeColor = 'orange';
			opt.fillColor = 'orange';
			break;
		case 'flora':
			opt.strokeColor = 'red';
			opt.fillColor = 'red';
			break;
		case 'vtx':
			opt.strokeColor = 'orange';
			opt.fillColor = 'orange';
			break;
		case 'catchLine':
			opt.strokeColor = '#ff0000';
			break;
		case 'rulerLine':
			opt.strokeColor = "#FFE153";
			opt.fillColor = "#FFE153";
			opt.lineWeight = 2;
			break;
		}
		ctx.fillStyle = opt.fillColor;
		ctx.strokeStyle = opt.strokeColor;
		ctx.lineWidth = opt.lineWeight;
		return opt;
	};
	function compelteEdit(){
       gSelf.overLayer.clear();
       gEdit.selectedPolygonID=0;
       gEdit.polySelected = false;//此处变量控制是否有要素被选中
       gEdit.selectedPolygonVtxID = 0;
       gEdit.selectedPolyPoints=[];//选中多边形节点数据
       gSelf.setMode("map");
       gSelf.mapTool="pan";
   };