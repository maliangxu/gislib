 
gEcnu.polyNode = {
	hexNode : function (id, cent_x, cent_y, r) {
		this.id = id;
		this.x = cent_x;
		this.y = cent_y;
		this.r = r;
		this.arnd = {
			up: null,rup: null,rdwn: null,dwn: null,ldwn: null,lup: null
		};
		this.contain = null;
	},
	squareNode : function () {

	}
}

gEcnu.Grid = gClass.extend({
	init : function (x, y) {
		this.cent_x = x;
		this.cent_y = y;
	}
});

gEcnu.Grid.hexGrid = gEcnu.Grid.extend({
	init : function(x, y, r, RorcirNum) {
		this._super(x, y);
		this.init_lev = '0';
		this.init_r = r;
		var cirNum = 0;
		if(RorcirNum.hasOwnProperty('R')){
			var R = RorcirNum.R;
			cirNum = this.getMaxCirNum(R, r);
		}else if(RorcirNum.hasOwnProperty('cirNum')){
			cirNum = RorcirNum.cirNum;
		}else{
			console.log('定义出错，请检查赋值对象');
			return;
		}
		this.cirNum = cirNum;
		this.sqr3 = Math.sqrt(3);
		this.initNd = new gEcnu.polyNode.hexNode('0_0_0', x, y, r);
		this.grid = {
			lev_0: {
				ele: {
					'0_0_0': this.initNd
				},
				cirNum: cirNum,
				leng: 0
			}			
		};
		this.createNode();
	},
	getMaxCirNum : function (R, r) {
		var cirNum = (2*R - r)/(3*r);
		return cirNum;
	},
	createNode : function () {
		var num = this.cirNum;
		var sqr3 = this.sqr3;
		var init_r = this.init_r;
		var cntx = this.cent_x;
		var cnty = this.cent_y;
		var last_mx,last_my,last_sx,last_sy;
		var m = 0;
		while (num >= 0) {
			var count = 1;
			var lev = m;
			r = init_r*Math.pow(sqr3,m);
			var dlt1 = 3*r/2, dlt2 = r*sqr3/2;
			if(m != 0){
				this.grid['lev_' + lev] = new Object();
				this.grid['lev_' + lev].ele = new Object();
				this.grid['lev_' + lev].ele[lev + '_0_0'] = new gEcnu.polyNode.hexNode(lev + '_0_0', this.cent_x, this.cent_y, r);
			}		
			for (var i = 0; i < num ; i++) {		
				var k = i + 1;
				for (var j = 0; j < 6*k; j++) {
					if(m%2 == 0){
						if(j == 0){
							last_mx = cntx;
							last_my = cnty + 2*k*dlt2;
							var tmpNd = new gEcnu.polyNode.hexNode(lev + '_' + k + '_0', last_mx, last_my, r);
						}else{
							var xgn = this._getSign(j, k, 0).xgn;
							var ygn = this._getSign(j, k, 0).ygn;
							last_mx = (xgn=='')?last_mx:eval(last_mx + xgn + dlt1);
							last_my = eval(last_my + ygn + dlt2);
							var tmpNd = new gEcnu.polyNode.hexNode(lev + '_' + k + '_' + j, last_mx, last_my, r);
						}
					}else{
						if(j == 0){
							last_sx = cntx - 2*k*dlt2;
							last_sy = cnty;
							var tmpNd = new gEcnu.polyNode.hexNode(lev + '_' + k + '_0', last_sx, last_sy, r);
						}else{
							var xgn = this._getSign(j, k, 1).xgn;
							var ygn = this._getSign(j, k, 1).ygn;
							last_sx = eval(last_sx + xgn + dlt2);
							last_sy = (ygn=='')?last_sy:eval(last_sy + ygn + dlt1);
							var tmpNd = new gEcnu.polyNode.hexNode(lev + '_' + k + '_' + j, last_sx, last_sy, r);
						}
					}				
					count++;
					this.grid['lev_' + lev].ele[tmpNd.id] = tmpNd;
				};
			};
			this.grid['lev_' + lev].leng = count;
			this.grid['lev_' + lev].cirNum = num;
			if(num > 0) this.addArndAttr4node(this.grid['lev_' + lev]);
			num = num==0?-1:lev%2==0?Math.floor((sqr3*(2*num + 1) - 3) / 6):Math.ceil((sqr3*(2*num + 1) - 3) / 6);m++;
			if(lev>0) this.addContainAttr4node(this.grid['lev_' + lev]);
		};
	},
	addArndAttr4node : function (gdlev) {
		var ele = gdlev.ele;
		for (var k in ele){
			if(k.substring(1) == '_0_0'){
				var lev = k.substring(0,1);
				ele[k].arnd.up = gdlev.ele[lev + '_1_0'];
				ele[k].arnd.rup = gdlev.ele[lev + '_1_1'];
				ele[k].arnd.rdwn = gdlev.ele[lev + '_1_2'];
				ele[k].arnd.dwn = gdlev.ele[lev + '_1_3'];
				ele[k].arnd.ldwn = gdlev.ele[lev + '_1_4'];
				ele[k].arnd.lup = gdlev.ele[lev + '_1_5'];
				if(lev%2 == 1) this._replaceAttr4Arnd(ele[k].arnd);				
			}else{
  				var node = ele[k];
  				this.setAroundAttr(gdlev,node);
  			}
  		}
	},
	addContainAttr4node : function (gdlev) {
		var ele = gdlev.ele;
		for (var k in ele){
			if(k.substring(1) == '_0_0'){
				var lev = parseInt(k.substring(0,1) - 1);
				ele[k].contain = this.grid['lev_' + lev].ele[lev + '_0_0'];			
			}else{
  				var node = ele[k]; 			
  				this.setContainAttr(node);
  			}
  		}
	},
	setAroundAttr : function (gdlev, node) {
		var num = node.id;
		var r1 = parseInt(num.split('_')[0]),r2 = parseInt(num.split('_')[1]),r3 = parseInt(num.split('_')[2]);
		if(r3%r2 == 0){
			var tmpArr = [r1 + '_' + (r2 + 1) + '_' + (r3*(r2 + 1)/r2 - 1), r1 + '_' + (r2 + 1) + '_' + (r3*(r2 + 1)/r2), r1 + '_' + (r2 + 1) + '_' + (r3*(r2 + 1)/r2 + 1), r1 + '_' + r2 + '_' + (r3 + 1), r1 + '_' + (r2 - 1) + '_' + (r3*(r2 - 1)/r2), r1 + '_' + r2 + '_' + (r3 - 1)];
			if(r3 == 0){
				node.arnd.up = gdlev.ele[tmpArr[1]];
				node.arnd.rup = gdlev.ele[tmpArr[2]];
				node.arnd.rdwn = gdlev.ele[tmpArr[3]];
				node.arnd.dwn = gdlev.ele[tmpArr[4]];
				node.arnd.ldwn = gdlev.ele[r1 + '_' + r2 + '_' + (6*r2 - 1)];
				node.arnd.lup = gdlev.ele[r1 + '_' + (r2 + 1) + '_' + (6*(r2 + 1) - 1)];
				if(r1%2 == 1) this._replaceAttr4Arnd(node.arnd);
			}else{
				var n = r3/r2;
				for (var i = 0; i < n-1; i++) {
					tmpArr.unshift(tmpArr.pop());
				};
				node.arnd.up = gdlev.ele[tmpArr[0]];
				node.arnd.rup = gdlev.ele[tmpArr[1]];
				node.arnd.rdwn = gdlev.ele[tmpArr[2]];
				node.arnd.dwn = gdlev.ele[tmpArr[3]];
				node.arnd.ldwn = gdlev.ele[tmpArr[4]];
				node.arnd.lup = gdlev.ele[tmpArr[5]];
				if(r1%2 == 1) this._replaceAttr4Arnd(node.arnd);
			}
		}else{
			var tmpArr = [r1 + '_' + (r2 + 1) + '_' + (Math.floor(r3/r2)*(r2 + 1) + r3%r2), r1 + '_' + (r2 + 1) + '_' + (Math.floor(r3/r2)*(r2 + 1) + r3%r2 + 1), r1 + '_' + r2 + '_' + (r3 + 1), r1 + '_' + (r2 - 1) + '_' + (Math.floor(r3/r2)*(r2 - 1) + r3%r2), r1 + '_' + (r2 - 1) + '_' + (Math.floor(r3/r2)*(r2 - 1) + r3%r2 - 1), r1 + '_' + r2 + '_' + (r3 - 1)];
			if(r3 == 6*r2 - 1){
				node.arnd.up = gdlev.ele[tmpArr[1]];
				node.arnd.rup = gdlev.ele[r1 + '_' + r2 + '_0'];
				node.arnd.rdwn = gdlev.ele[r1 + '_' + (r2-1) + '_0'];
				node.arnd.dwn = gdlev.ele[tmpArr[4]];
				node.arnd.ldwn = gdlev.ele[tmpArr[5]];
				node.arnd.lup = gdlev.ele[tmpArr[0]];
				if(r1%2 == 1) this._replaceAttr4Arnd(node.arnd);
			}else{
				var n = Math.floor(r3/r2);
				for (var i = 0; i < n ; i++) {
					tmpArr.unshift(tmpArr.pop());
				};
				node.arnd.up = gdlev.ele[tmpArr[0]];
				node.arnd.rup = gdlev.ele[tmpArr[1]];
				node.arnd.rdwn = gdlev.ele[tmpArr[2]];
				node.arnd.dwn = gdlev.ele[tmpArr[3]];
				node.arnd.ldwn = gdlev.ele[tmpArr[4]];
				node.arnd.lup = gdlev.ele[tmpArr[5]];
				if(r1%2 == 1) this._replaceAttr4Arnd(node.arnd);			
			}
		}
	},
	setContainAttr : function (node) {
		var num = node.id;
		var r1 = parseInt(num.split('_')[0]), r2 = parseInt(num.split('_')[1]), r3 = parseInt(num.split('_')[2]);
		var ele = this.grid['lev_' + (r1 - 1)].ele;	
		var tmp1 = [5,0,1,2,3,4], tmp2 = [2,3,4,5,0,1];
		var A = Math.floor(r3/r2), B = r3%r2;
		var a = Math.floor((r2 + 1)/2), b = (r2 + 1) % 2;
		if(B<a){
			tmp1[1] = 6;tmp2[4] = 6;		
		}
		var tmp = r1%2==1?tmp1:tmp2;var cr1 = r1 - 1;
		if(b == 1){
			var cr2 = 2*r2 - a + Math.abs(B-a),cr3 = cr2*tmp[A] + 2*(B-a);
		}else{
			if(B >= a){
				var cr2 = 2*r2 - a + 1 + Math.abs(B - a),cr3 = cr2*tmp[A] + 2*(B - a) + 1;
			}else{
				var cr2 = 2*r2 - a + 1 + Math.abs(B - a + 1),cr3 = cr2*tmp[A] + 2*(B - a + 1) - 1;
			}
		}
		node.contain = ele[cr1 + '_' + cr2 + '_' + cr3];
	},
	getEdgeCoor : function (x, y, r, sig) {
		var edgeCoorArr = [];
		var sqr3 = this.sqr3;
		if(sig == 0){
			var edgeX = [x - r/2, x + r/2, x + r, x + r/2, x - r/2, x - r];
			var edgeY = [y + sqr3*r/2, y + sqr3*r/2, y, y - sqr3*r/2, y - sqr3*r/2, y];
		}else{
			var edgeX = [x - sqr3*r/2, x, x + sqr3*r/2, x + sqr3*r/2, x, x - sqr3*r/2];
			var edgeY = [y + r/2, y + r, y + r/2, y - r/2, y - r, y - r/2];
		}	
		for(var i = 0 ; i < 6 ; i++){
			var coorObj = {};
			coorObj.x = edgeX[i];
			coorObj.y = edgeY[i];
			edgeCoorArr.push(coorObj);
		}
		return edgeCoorArr;
	},
	_getSign : function(m,n,sig) {
		var signObj = {
			xgn:'',
			ygn:''
		};
		if(sig==0){
			signObj.ygn=(m<=3*n)?((m>n && m<=2*n)?'-2*':'-'):(m>4*n && m<=5*n)?'+2*':'+';
			signObj.xgn=(m<=n || m>5*n)?'+':(m>2*n && m<=4*n)?'-':'';
		}else{
			signObj.xgn=(m<=3*n)?((m>n && m<=2*n)?'+2*':'+'):(m>4*n && m<=5*n)?'-2*':'-';
			signObj.ygn=(m<=n || m>5*n)?'+':(m>2*n && m<=4*n)?'-':'';
		}		
		return signObj;
	},
	_replaceAttr4Arnd : function (arnd) {
		var tmpNd = arnd.lup;
		arnd.l = arnd.up;
		arnd.lup = arnd.rup;
		arnd.rup = arnd.rdwn;
		arnd.r = arnd.dwn;
		arnd.rdwn = arnd.ldwn;
		arnd.ldwn = tmpNd;
		delete arnd.up;delete arnd.dwn;
	},
	clear : function() {
		this.ctx.clearRect(0, 0, this.w, this.h);
	},
	gridReset : function() {
		this.init_r = '';
		this.cent_x = '';
		this.cent_y = '';
		this.cirNum = -1;
		this.initNd = {};
		this.grid = {};
	},
	onDraw : function (id, superPos) {
		var container = document.getElementById(id);
		var ctx = container.getContext("2d");
		var width = container.width;
		var height = container.height;
		this._container = container;
		this.ctx = ctx;
		this.w = width;
		this.h = height;
		var colorArr = ['#191970', '#8B2500', '#2E8B57', '#CD9B1D', '#68228B', '#CD3278', '#333333', '#FF4500', '#B22222', '#668B8B', '#DC143C', '#1F1F1F'];
		var length = 0;
		if(superPos){
			for(var l in this.grid){
    		    length++;
    		}
		}else{
			length = 1;
		}
		for(var lev = 0; lev < length; lev++) {
			var ele = this.grid['lev_' + lev].ele;
			var sign = lev%2==0?0:1;
			for (var k in ele) {
				var edgeArr = this.getEdgeCoor(ele[k].x,ele[k].y,ele[k].r,sign);
				ctx.beginPath();
				ctx.strokeStyle = colorArr[lev];
				ctx.lineWidth = lev*0.8 + 1;
				ctx.moveTo(edgeArr[0].x,edgeArr[0].y);
				for (var i = 1; i < 6; i++) {
					ctx.lineTo(edgeArr[i].x,edgeArr[i].y);
				};
				ctx.lineTo(edgeArr[0].x,edgeArr[0].y);
				ctx.stroke();
			};
		};
		ctx.beginPath();
		ctx.fillStyle = '#ff0000';
		ctx.arc(this.cent_x,this.cent_y,3,0,2*Math.PI);
		ctx.fill();
	}

});


