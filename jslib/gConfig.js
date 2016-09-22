var gEcnu={};

/**********gEcnu的相关配置信息****************/
gEcnu.config = {
  'version': '1.0.0',//地图对象版本编号
  //'port': 81,//地图对象，wms,wfs服务请求端口
  'maxLevel': 7,//地图对象版本号最大缩放级别
  'minLevel': 1,//地图对象版本号最小缩放级别
  'tileWidth': 250,//地图对象中切片大小
  'tileHeight': 200,//地图对象中切片大小
  'tileMapURL':'http://webgis.ecnu.edu.cn:81/',    //28机器上的切片
  'tileMapURL_Ex':'https://ccgis.cn/mapb/', //183上的部分区域的小切片
  //'webHostIP': '58.198.183.6', //地图对象请求IP地址
  'geoserver':'/mapb/',   //
  //'dynMapURL':'/slprj/', //动态图url
  //'geoserver':'https://webgis.ecnu.edu.cn/mapb/',   //https://webgis.ecnu.edu.cn/geosvr185/  本地测试：http://58.198.183.6:81/
  'imgPath':'common/imgs/images/',
  'cat':'webroot/slprj/acesy/'
};

//设置配置信息 option {geoserver:,...}
gEcnu.setConfig  = function (option){
  if(option && Object.prototype.toString.call(option) === '[object Object]' ){
    for(var key in option) {
      if(gEcnu.config[key]) {
        gEcnu.config[key] = option[key];
      }
    }
  } 
};