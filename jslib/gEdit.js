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
