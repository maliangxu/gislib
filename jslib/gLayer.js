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
			zIndex: 5
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
           //var mouseXY=this.getScreenCenter();
		}else{
			var tx = mouseXY.x;
		    var ty = mouseXY.y;
		    var s = tx + "px " + ty + "px";
		    d.style.webkitTransformOrigin = s;
		    d.style.transformOrigin = s;
		}
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
					alert("地图请求失败！");
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
		this.minLevel =  gEcnu.config.minLevel;
		this.maxLevel =  gEcnu.config.maxLevel;
		if(options){
			this.minLevel = options.minLevel ? options.minLevel : this.minLevel;
			this.maxLevel = options.maxLevel ? options.maxLevel : this.maxLevel;
		}
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
		this.fileServer = map.tileFileServer;
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
	 * 获取当前切片的缩放级别
	 */
	getCurrentLevel: function (){
		var zl = this._map.zl;
		return zl;
	},

	/**
	 * 判断缩放级别是否处在该切片的有效缩放范围内[minLevel,maxLevel]
	 */
	isInLevel: function(){
		var mapZl = this.getCurrentLevel();
		var minZl = this.minLevel;
		var maxZl = this.maxLevel;
		if(mapZl>=minZl && mapZl<=maxZl){
			return true;
		}else{
			return false;
		}
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
 * 针对自定义的切片尺寸:切片尺寸在请求返回来的参数里
 */
gEcnu.Layer.Tile_Ex = gEcnu.Layer.extend({
	init: function (id,tileName,options) {
		this._super(id,options);
		this.options = {
			opacity: 1.0,
			zIndex: 4
		};
		this.tileName= tileName;  //   ecnugis/qinpu
		this.oClass = "tileLayer";
		this.minLevel =  14;
		this.maxLevel =  21;
		if(options){
			this.minLevel = options.minLevel || 14;
			this.maxLevel = options.maxLevel || 21;
		}
		this.xScale = 1;  //切片配准问题：用于将切片拉伸
		this.yScale = 1;
		
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
			zl:zoom.zl + 17,
			cx: cxy.x, //-43000,//cxy.x,
			cy: cxy.y, //-29000,//,
			"return": 'json',
			map:tileName
		};
		this.zl = this._params.zl;   // 18对应1  19对应2
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
		this.mapSize = size;
		this.nWidth = Math.ceil(parseInt(size.w) / map.tileWidth) + 1;
		this.nHeight = Math.ceil(parseInt(size.h) / map.tileHeight) + 1;
		this.tileMapURL = map.tileMapURL_Ex;//"https://ccgis.cn/mapb/webtilemap";//map.tileMapURL_Ex; 
		this.fileServer = map.fileServer_Ex; //"https://ccgis.cn/mapb/fileServer?fn=map/"; //map.fileServer_Ex;
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
		this.createTileFlag = true;   //切片尺寸在响应完成后才返回来
		//this._createTiles();
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
	 * 视野放大 zl--
	 */
	zoomIn: function (mouseXY) {
		var curLevel = this.getCurrentLevel(); 
		if(curLevel < this.minLevel) return;
		this.mapTool = 'zoomin';
		this.ifzoominOrout=true;
		this.scaleMap(mouseXY);
		//this.zl--;
		this.renew();
	},
	/**
	 * 视野缩小
	 */
	zoomOut: function (mouseXY) {
		var curLevel = this.getCurrentLevel();
		if(curLevel > this.maxLevel) return;
		this.mapTool = 'zoomout';
		this.ifzoominOrout=true;
		this.scaleMap(mouseXY);
		//this.zl++;
		this.renew();
	},
	zoomTo: function () {
		this.ifZoomTo = true;
		// this._params.zl = this._map.zl;
		this._params.zl = this._map.zl+17;
		this._params.cx = this._map.cx;
		this._params.cy = this._map.cy;
		this._resetTile();
		this.renew();	
		this.mapTool = 'pan';
	},
	/**
	 * 获取当前切片的缩放级别
	 */
	getCurrentLevel: function (){
		var zl = this._map.zl+17;
		return zl;
	},

	/**
	 * 判断缩放级别是否处在该切片的有效缩放范围内[minLevel,maxLevel]
	 */
	isInLevel: function(){
		var mapZl = this.getCurrentLevel();
		var minZl = this.minLevel;
		var maxZl = this.maxLevel;
		if(mapZl>=minZl && mapZl<=maxZl){
			return true;
		}else{
			return false;
		}
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
		// this._params.zl = this._map.zl;  
		this._params.zl = this._map.zl + 17; 
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
		var self=this;
		if(self.resizeTimerID){
		clearTimeout(self.resizeTimerID);
		}
		self.resizeTimerID = setTimeout(function (){ 
			self._resize();
		},250);
		
	},
	_resize: function (){ 
		this._layerContainer.style.width = this._map.w + 'px';
		this._layerContainer.style.height = this._map.h + 'px';
		//this._super(); 
		var map = this.getMap();
		var size = map.getSize();
		this.nWidth = Math.ceil(parseInt(size.w) / this.tileWidth) + 1;
		this.nHeight = Math.ceil(parseInt(size.h) / this.tileHeight) + 1;
		
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
			if(params.zl <= this.maxLevel && params.zl >= this.minLevel){
				gEcnu.Util.ajax("get", mapurl, params, ifinit, function (data) { 
					data = JSON.parse(data);
					self.resetTileInfo(data);  //重置切片信息 
					self._showMap(data);
					
				});
			}
		} catch (e) {
			alert("出现异常在：" + e);
		}
	},
	resetTileInfo: function (data){
		this.tileWidth = typeof data.tileInfo.tileWidth==='undefined' ? this.tileWidth : data.tileInfo.tileWidth;
		this.tileHeight = typeof data.tileInfo.tileHeight==='undefined' ? this.tileHeight : data.tileInfo.tileHeight;
		//this.pxScale = data.tileInfo.pxScale;
		this.xScale = data.tileInfo.xScale;
		this.yScale = data.tileInfo.yScale;

		var map = this.getMap();
		var size = map.getSize();
		this.nWidth = Math.ceil(parseInt(size.w) / this.tileWidth) + 1;
		this.nHeight = Math.ceil(parseInt(size.h) / this.tileHeight) + 1;
		
		this.baseMap.style.width = this.nWidth * this.tileWidth + 'px';
		this.baseMap.style.height = this.nHeight * this.tileHeight + 'px';

		this.baseBgMap.style.width = this.nWidth * this.tileWidth + 'px';
		this.baseBgMap.style.height = this.nHeight * this.tileHeight + 'px';

		if(this.createTileFlag){//切片尺寸在响应完成后才返回来
			this._createTiles();
			this.createTileFlag = false; 
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
		//this._normalTile();   //恢复切片容器
		function getImg() { 
			var actImgNum=nWidth*nHeight;
			if (j >= len || j>=actImgNum) {
				 self.mapTool = 'pan';
				// self._scaleTile();
				return;
			}
			var row = data.tiles[j].row;
			var col = data.tiles[j].col;  
			if( row <= nHeight  && col <= nWidth){
				var k = (row - 1) * nWidth + (col - 1);   
				var imgtmp = d.childNodes[k];   
				var tmpUrl = data.tiles[j].url;
		
				var tmpzl=tmpUrl.split('/')[2];
				
				var bx = this.tileWidth * this.nWidth / 2;
				var by = this.tileHeight * this.nHeight / 2; 

				 // if (typeof (imgtmp) != "undefined" && tmpzl == self._params.zl && responseCenterx==requestCenterx && requestCentery==responseCentery) {
			 if (typeof (imgtmp) != "undefined") {

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
	* 2015-11-26 256*256切片和250*200切片的配准： 将切片层拉伸
	* 1.029m分辨率---1m分辨率
	*/
	_scaleTile: function (){ 
		var odiv = this.baseMap;
		var zl = this.getMap().getZoom().zl;
		var resolution = Math.pow(2,zl-1);
		var xscale = resolution / this.xScale;
		var yscale = resolution / this.yScale;

    	odiv.style.transformOriogin = "50% 50%";
    	odiv.style.webkitTransformOriogin = "50% 50%";

    	odiv.style.transform = 'scale('+xscale+','+yscale+')';
    	odiv.style.webkitTransform = 'scale('+xscale+','+yscale+')';  
	},
	_normalTile: function (){
		var odiv = this.baseMap;
    	odiv.style.transformOriogin = "50% 50%";
    	odiv.style.webkitTransformOriogin = "50% 50%";

    	odiv.style.transform = 'scale(1,1)';
    	odiv.style.webkitTransform = 'scale(1,1)';   
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
		var isExistScript=this._isExistScript();  
		if(isExistScript){
			showOtherMap_self();
			return;
		}
		switch (this.mapSource) {
		case 'google':
			self.otherPxScale=0.001373291015625;
			script.src = 'http://maps.googleapis.com/maps/api/js?sensor=false&callback=showOtherMap_self';
			break;
		case 'baidu':
			self.otherPxScale=0.0011498312500000019;
			script.src = 'http://api.map.baidu.com/api?v=1.4&callback=showOtherMap_self';
			this.oMapMaxLevel=19;
			break;
		case 'tianditu':
			self.otherPxScale=0.0013767249999999897;
			script.src = "http://api.tianditu.com/js/maps.js";
			script.onload = showOtherMap_self;
			break;
		}
		document.getElementsByTagName('head')[0].appendChild(script);

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
		    var latlng = gEcnu.Util.shToLngLat(cxy.x-410, cxy.y+260);
		    this.oMap.setCenterAtLngLat(new TLngLat(latlng.lng, latlng.lat));
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
		var gPxScale=this.otherPxScale;
		var mapz=zoom.z;
		var LngDiff=gPxScale*gSelf.w;  //zl=10时 经度差
		switch (mapsource) {
			case 'google':
			this.oMap.setCenter(new google.maps.LatLng(cxy.y, cxy.x));
			//var mapz=zoom.z;
			//var gPxScale=0.001373291015625;
			// var LngDiff=gPxScale*gSelf.w;  //zl=10时 经度差
			var zl=10-Math.log(mapz/LngDiff)/Math.log(2);
			this.oMap.setZoom(zl);	
			break;
			case 'tianditu':
			// var mapz=zoom.z;
			// var gPxScale=0.0013767249999999897;
			// var LngDiff=gPxScale*gSelf.w;  //zl=10时 经度差
			var zl=10-Math.log(mapz/LngDiff)/Math.log(2);
			this.oMap.centerAndZoom(new TLngLat(cxy.x, cxy.y),zl);
			break;
			case "baidu":
			// var mapz=zoom.z;
			// var gPxScale=0.0011498312500000019;
			// var LngDiff=gPxScale*gSelf.w;  //zl=10时 经度差
			var zl=11-Math.log(mapz/LngDiff)/Math.log(2);
			this.oMap.centerAndZoom(new BMap.Point(cxy.x, cxy.y), zl);
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
		    var latlng = gEcnu.Util.shToLngLat(cxy.x-410, cxy.y+260);
			this.oMap.centerAndZoom(new TLngLat(latlng.lng, latlng.lat), 18 - zoom.zl);
			break;
		case 'baidu':
			this.oMap.centerAndZoom(new BMap.Point(latlng.lng, latlng.lat), 19 - zoom.zl);
			break;
				}
	}
});

gEcnu.Layer.Feature = gEcnu.Layer.extend({
	init: function (id, style, options,labelOptions) {  //labelOptions{'autoLabel':是否标注（bool）,'lableField':标注字段,'Mapping':映射关系}
	//labelOptions {'autoLabel':true,'lableField':'LANDTYPE','Mapping':{'grass':'草地'，'forest':'林地'，。。。} }
		this._super(id);
		this.options = {
			zIndex: 6
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
	 * 设置标注大小
	 * @param size 
	 */
	setLabelSize: function (size) { 
		size = parseInt(size);
	    if (this.style instanceof gEcnu.Style_Ex) {
            var stylearr = this.style.styles;
            var len_style = stylearr.length;
            for (var j = 0; j < len_style; j++) {
                var tmpstyle = stylearr[j];
                tmpstyle.fontSize = size;
            }
        } else if (this.style instanceof gEcnu.Style) {
            this.style.fontSize = size;
        } 
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
	removeTextsByText: function (value) {
		var removeTexts = this.oTexts;
		var len_removeTexts=removeTexts.length;
		for (var i = 0; i < len_removeTexts; i++) {
			var tmpremoveText=removeTexts[i];
			if(tmpremoveText.text==value){
			  this.removeText(tmpremoveText);
			}
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
	removeMarkerByName: function (value) {
		var oMarker = [];
		for (var i = 0, a = 0; i < this.oMarkers.length; i++) {
			if (this.oMarkers[i]['name'] != value) {
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
		break;
	case 'baidu':
		var centerPt = new BMap.Point(latlng.lng, latlng.lat);
		gSelf.activeLayer.oMap = new BMap.Map(gSelf.activeLayer.id);
		gSelf.activeLayer.oMap.centerAndZoom(centerPt, 19 - zl);
		gSelf.activeLayer.oMap.Minlevel=1;
		gSelf.activeLayer.oMap.MaxLevel=19;
		break;
	case 'tianditu':
	    var latlng = gEcnu.Util.shToLngLat(cxy.x-410, cxy.y+260);
		gSelf.activeLayer.oMap = new TMap(gSelf.activeLayer.id);
		gSelf.activeLayer.oMap.centerAndZoom(new TLngLat(latlng.lng, latlng.lat), 18 - zl);
		gSelf.activeLayer.oMap.Minlevel=1;
		gSelf.activeLayer.oMap.MaxLevel=18;
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



/**
 * 热力图层
 * @type {*|void}
 */
gEcnu.Layer.Heatmap = gEcnu.Layer.Feature.extend({
  init: function (id, options) {
    this._super(id, options);
    this.options = {
      opacity: 1.0,
      zIndex: 19
    };
    this.options = gEcnu.Util.setOptions(this, options);
    this.oClass = 'heatmapLayer';
    this.heatmap = {};
    this.multi = 1;
  },
  onAdd: function (map) {
    this._super(map);
    this._map = map;
    var container = this._map.getContainer();

    this.heatmap = gHeatmap.create({
      container : container,
      canvas : this._layerContainer,
      radius : 20
    });
  },
  setFtsData:function(fts){
    this.data = fts;
    var fieldFeatures = fts.field;
    var pointsFeatures = fts.points;
    var oFeatures = this.getScrFeatures(pointsFeatures);

    var options = {};
    if(fts.max!=undefined) options.max = fts.max;
    if(fts.min!=undefined) options.min = fts.min;

    var heatmapPoints = [];
    for (var i = 0,len = oFeatures.length; i < len; i++) {
        var worldX = oFeatures[i].shape.Points[0].X;
        var worldY = oFeatures[i].shape.Points[0].Y;
        var screenPoint = gEcnu.Util.worldToScreen(worldX,worldY);
        var valuePoint = oFeatures[i].fields[fieldFeatures]; 
        var point = { x: screenPoint.x, y: screenPoint.y, value: valuePoint };
        heatmapPoints.push(point);
    };
    options.data = heatmapPoints;

    this.heatmap.setData(options);
  },
  setData:function(fts){

    this.data = fts;
    var data = fts.data;

	var options = {};
    if(fts.max!=undefined) options.max = fts.max;
    if(fts.min!=undefined) options.min = fts.min;

    var heatmapPoints = [];
    var len = data.length;
	while (len--) {
		var point = {};
        var screenPoint = gEcnu.Util.worldToScreen(data[len].x,data[len].y);
        point.x = screenPoint.x;
        point.y = screenPoint.y;
        if(data[len].value!=undefined) point.value = data[len].value;
        if(data[len].radius!=undefined) point.radius = data[len].radius * this.multi;       
        heatmapPoints.push(point);
	}
	options.data = heatmapPoints;
    this.heatmap.setData(options);
  },
  clearHeatmap : function () {
    this.heatmap.clear();
    this.data = null;
  },
  resize: function () {
    this._super();
    this._layerContainer.width = this._map.w;
    this._layerContainer.height = this._map.h;
    this.renew();
  },
  zoomIn: function () {
  	this.multi *= 2; 
    this.renew();
  },
  zoomOut: function () {
  	this.multi *= 0.5;
    this.renew();
  },
  zoomAll : function () {
  	this.multi = 1;
  	this.renew();
  },
  renew: function () {  
    this._super();console.log(this.data);
    if(this.data && this.data!=null){
        /*if(arguments[0]){
            this.heatmap._store._cfgRadius *= arguments[0];          
        }*/
        this.setData(this.data,this.multi);      
    }
  },
    /**
   * 获取视窗范围内要素
   * @returns {Array}
   */
  getScrFeatures: function (allfeatures) {
    var returnFeas=[];
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
  }

});