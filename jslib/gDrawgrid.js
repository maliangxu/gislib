
gEcnu.DrawGrid = gClass.extend({
	init: function(map,layer) {
		this._map = map;
		this._layer = layer;
	}
});

gEcnu.DrawGrid.hexGrid = gEcnu.DrawGrid.extend({
	init: function(map,layer) {
		this._super(map,layer);
		this.mapdb = 'mapb';
	},
	buildGridByFeat: function(fea,r,ctps) {
		var self = this;
		if(!(ctps instanceof Array || ctps == '')) ctps = [ctps];
		if(fea && fea instanceof gEcnu.Feature.Polygon){
			var parts_len = fea.shape.NumParts;
			for (var i = 0; i < parts_len; i++) {
				var poly = fea._lineRings[i];
				var R = self.getmaxR4poly(poly,ctps[i]);
				self._fillGridByPoly(poly,r,R,ctps[i],false);
			};
		}else{
			alert('请检查填充要素类型');
		}	
	},
	getmaxR4poly: function(poly,ctp) {
		var r = r2 = 0;
		var cenPt = typeof ctp == 'undefined'? poly.getCenterPoint() : ctp;
		var points = poly.points;
		var len = points.length;
		for (var i = 0; i < len; i++) {
			var dis2 = Math.pow(points[i].x - cenPt.x,2) + Math.pow(points[i].y - cenPt.y,2);
			if(dis2>r2) r2 = dis2;
		};
		r = Math.sqrt(r2);
		return r;
	},
	_fillGridByPoly: function(poly,r,R,ctp,superPos) {
		var cenPt = typeof ctp == 'undefined'? poly.getCenterPoint() : ctp;
		var r = typeof r == 'undefined'? 50000 : r;
		var hexGd = new gEcnu.Grid.hexGrid(cenPt.x,cenPt.y,r,{R:R});
		var length = 0;
		if(superPos){
			for(var l in hexGd.grid){
    		    length++;
    		}
		}else{
			length = 1;
		}
		for(var lev = 0; lev < length; lev++) {
			//var multHex = [];
			var ele = hexGd.grid['lev_' + lev].ele;
			var sign = lev%2==0?0:1;
			for (var k in ele) {
				var edgeArr;
				var points = [];
				var hexNd = ele[k];
				if(!gEcnu.Graph.pointInPoly(hexNd,poly.points)){
					var flag = false;
					edgeArr = hexGd.getEdgeCoor(hexNd.x,hexNd.y,hexNd.r,sign);
					for (var j = 0; j < edgeArr.length; j++) {
						if(gEcnu.Graph.pointInPoly(edgeArr[j],poly.points)){
							flag = true;
							break;
						}
					};
					if(!flag) continue;
				}
				edgeArr = hexGd.getEdgeCoor(hexNd.x,hexNd.y,hexNd.r,sign);
				for (var ii = 0; ii < edgeArr.length; ii++) {
					var point = new gEcnu.Geometry.Point(edgeArr[ii].x,edgeArr[ii].y);
					points.push(point);
				};
				var hex_ring = new gEcnu.Geometry.LinearRing(points);
				var hexFea = new gEcnu.Feature.Polygon([hex_ring]);
				this._layer.addFeature(hexFea);
				//multHex.push(hex_ring);
			};
			/*var hexFea = new gEcnu.Feature.Polygon(multHex);
			this._layer.addFeature(hexFea);*/
		};
	},
	clear : function () {
		this._layer.removeAllFeatures();
	}
	/*buildGrid: function(fts) {
		var self = this;
		this.ftsetid = fts;
		this._qryVisFtsById(fts,function(feas){
			if(feas && feas[0] instanceof gEcnu.Feature.Polygon){
				var len = feas.length;
				for (var i = 0; i < len; i++) {
					var fea = feas[i];
					var parts_len = fea.shape.NumParts;
					for (var j = 0; j < parts_len; j++) {
						var poly = fea._lineRings[j];
						var r = self.getmaxR4poly(poly);
						self._fillGridByPoly(poly,r,false);
					};
				};
			}else{
				alert('请检查填充要素类型');
			}
		});
	},
	_qryVisFtsById: function(ftId,callback) {
		var self = this;
		var mapbounds = this._map.getBounds();
        var nwPoint = new gEcnu.Geometry.Point(mapbounds.nw.x,mapbounds.nw.y);
        var nePoint = new gEcnu.Geometry.Point(mapbounds.ne.x,mapbounds.ne.y);
        var swPoint = new gEcnu.Geometry.Point(mapbounds.sw.x,mapbounds.sw.y);
        var sePoint = new gEcnu.Geometry.Point(mapbounds.se.x,mapbounds.se.y);
        var boundsPoints = [nwPoint,nePoint,sePoint,swPoint];
		var rect_geometry = new gEcnu.Geometry.RectRing(boundsPoints);        
        var ftServ = new gEcnu.WebFeatureServices.QueryByGeometry({'processCompleted':function (resultfeas){
        	callback(resultfeas);
        },'processFailed':function (){}});
        var option={shape:rect_geometry,queryLyrType:gEcnu.layerType.GeoDB,mapOrGeodb:self.mapdb,lyrOrFtset:ftId,returnShape:true,returnFields:'',format:'geojson',tolerance:1000};
        ftServ.processAscyn(option);
	}*/

});