gEcnu.WebGeoCoding = gClass.extend({
    init: function(eventsListener) {
        if (typeof eventsListener != "undefined") {
            this.events._events.processCompleted = eventsListener.processCompleted;
            this.events._events.processFailed = eventsListener.processFailed;
        }
    },
    geoCoding: function(feature) {
        //var webgeoCodingUrl = 'http://' + gEcnu.config.webHostIP + ":" + gEcnu.config.port + "/GeoUtils";
        var webgeoCodingUrl = gEcnu.config.geoserver + "GeoUtils";
        var geoParmas = {
            "mt": "GeoCoding",
            "shape": feature.shape
        }
        var datastr = JSON.stringify(geoParmas);
        var params = {
            req: datastr
        };
        var webgeocodingServices = this;
        try {
            gEcnu.Util.ajax("POST", webgeoCodingUrl, params, false, function(data) {
                if (typeof(webgeocodingServices.events._events.processCompleted) != "undefined") {
                    var jsonparase = JSON.parse(data);
                    webgeocodingServices.events._events.processCompleted(jsonparase);
                }
            }, function() {
                alert('webgeocoding请求超时');
            }, 500000);
        } catch (e) {
            if (typeof(webgeocodingServices.events._events.processFailed) != "undefined") {
                webgeocodingServices.events._events.processFailed(e);
            }
        }
    },
    deGeoCoding: function(geoCode) {

    },
    events: {
        _events: {},
        on: function(eventType, callback) {
            switch (eventType) {
                case 'processCompleted':
                    this._events.processCompleted = callback;
                    break;
                case 'processFailed':
                    this._events.processFailed = callback;
                    break;
            }
        }
    }
});

gEcnu.Geocoder = gClass.extend({
    init: function(eventsListener) {
        if (typeof eventsListener != "undefined") {
            this.events._events.processCompleted = eventsListener.processCompleted;
            this.events._events.processFailed = eventsListener.processFailed;
        };
        gEcnu.GeocoderSelf = this;
        this.city = '';
        this.limit = 1000;
        this.delay = 60;
        this.latFld = 'lat';
        this.lngFld = 'lng';
        this.filter = '';
    },
    Geocoder: function(options) {
        this.dbname = options.dbname;
        this.tbname = options.tbname;
        this.keyfld = options.keyfld;
        this.latFld = options.mapping && options.mapping.lat || this.latFld;
        this.lngFld = options.mapping && options.mapping.lng || this.lngFld;
        this.city = options.city || this.city;
        this.limit = options.limit || this.limit;
        this.delay = options.delay || this.delay;
        this.filter = options.filter || this.filter;
        this.updData = [];
        this.updCount = 0;
        this.total = 0;
        this.totalV = 0;
        this.updated = 0;
        if (this._isExistScript()) {
            BMapGeocoder();
            return;
        }
        var script = document.createElement('script');
        script.src = 'http://api.map.baidu.com/api?v=1.4&callback=BMapGeocoder';
        document.getElementsByTagName('head')[0].appendChild(script);
    },
    setConnect: function(opt) {
        this.dbname = opt.dbname;
        this.tbname = opt.tbname;
        this.keyfld = opt.keyfld;
    },
    setCoordFlds: function(opt) {
        this.latFld = opt.lat;
        this.lngFld = opt.lng;
    },
    setLimit: function(val) {
        this.limit = val;
    },
    setDelay: function(val) {
        this.delay = val;
    },
    setCity: function(city) {
        this.city = city;
    },
    setOptions: function(options) {
        this.dbname = options.dbname || this.dbname;
        this.tbname = options.tbname || this.tbname;
        this.keyfld = options.keyfld || this.keyfld;
        this.latFld = options.mapping && options.mapping.lat || this.latFld;
        this.lngFld = options.mapping && options.mapping.lng || this.lngFld;
        this.city = options.city || this.city;
        this.limit = options.limit || this.limit;
        this.delay = options.delay || this.delay;
    },
    _isExistScript: function() {
        var scripts = document.getElementsByTagName('head')[0].getElementsByTagName('script');
        var apiSrc = 'http://api.map.baidu.com/api?v=1.4';
        for (var i = 0, len = scripts.length; i < len; i++) {
            var src = scripts[i].src;
            if (src.indexOf(apiSrc) >= 0) {
                return true;
            }
        }
        return false;
    },
    getTotalRec: function(sucCompleted) {
        var that = this;
        var sql = { 'lyr': this.tbname, 'fields': 'count(*)', 'filter': '' };
        var succ = this._getVtotalRec;
        var sqlservice = new gEcnu.WebSQLServices.SQLServices({
            'processCompleted': function(tmpmsg) {
                var totalNum = tmpmsg[0]['COUNT(*)'];
                that.total = totalNum;
                succ.call(that, totalNum, sucCompleted);
            },
            'processFailed': function() {}
        });
        sqlservice.processAscyn('SQLQUERY', this.dbname, sql);
    },
    _getVtotalRec: function(total, sucCompleted) {
        var that = this;
        var key = this.keyfld;
        var filter = key + "<>'' OR " + key + "<>NULL";
        var sql = { 'lyr': this.tbname, 'fields': 'count(*)', 'filter': filter };
        var sqlservice = new gEcnu.WebSQLServices.SQLServices({
            'processCompleted': function(tmpmsg) {
                var validNum = tmpmsg[0]['COUNT(*)'];
                that.totalV = validNum;
                sucCompleted(total, validNum);
            },
            'processFailed': function() {}
        });
        sqlservice.processAscyn('SQLQUERY', this.dbname, sql);
    },
    getAddress: function(total, sucCompleted) {
        var that = this;
        var key = this.keyfld;
        var tbname = this.tbname;
        var limit = this.limit;
        if (this.filter === '') {
            for (var start = 0; start < total; start += limit) {
                var filter = key + "<>'' OR " + key + "<>NULL limit " + limit + " offset " + start;
                var sql = { 'lyr': tbname, 'fields': key, 'filter': filter };
                var sqlservice = new gEcnu.WebSQLServices.SQLServices({
                    'processCompleted': Complete_addr,
                    'processFailed': function() {}
                });
                sqlservice.processAscyn('SQLQUERY', that.dbname, sql);
            };
        } else {
            var sql = { 'lyr': tbname, 'fields': key, 'filter': this.filter };
            var sqlservice = new gEcnu.WebSQLServices.SQLServices({
                'processCompleted': Complete_addr,
                'processFailed': function() {}
            });
            sqlservice.processAscyn('SQLQUERY', that.dbname, sql);
        }

        function Complete_addr(tmpmsg) {
            var adds = [];
            var len = tmpmsg.length;
            for (var i = 0; i < len; i++) {
                var address = tmpmsg[i][key];
                adds.push(address);
            }
            sucCompleted(adds); //回调函数里返回数据
        }
    },
    addCoordFlds: function(succ) {
        var that = this;
        var func = this._inserFlds;
        var lat = this.latFld;
        var lng = this.lngFld;
        var sqlservice = new gEcnu.WebSQLServices.SQLServices({
            'processCompleted': function(msg) {
                var sql = msg[0]['sql'];
                if (sql.indexOf(lat) >= 0 && sql.indexOf(lng) >= 0) {
                    succ();
                } else {
                    func.call(that, succ);
                }
            },
            'processFailed': function() {
                alert('添加字段失败');
            }
        });
        sqlservice.processAscyn('SQLQUERY', this.dbname, { 'lyr': 'sqlite_master', 'fields': 'sql', 'filter': "tbl_name='" + this.tbname + "'" });
    },
    _inserFlds: function(succ) {
        var sqlservice = new gEcnu.WebSQLServices.SQLServices({
            'processCompleted': function(msg) {
                succ();
            },
            'processFailed': function() {
                alert('添加字段失败');
            }
        });
        var tbname = this.tbname;
        var sql4lat = "alter table '" + tbname + "' add column " + this.latFld + " double";
        var sql4lng = "alter table '" + tbname + "' add column " + this.lngFld + " double";
        sqlservice.processAscyn('SQLTask', this.dbname, [{ "mt": "SQLExec", "SQL": sql4lat }, { "mt": "SQLExec", "SQL": sql4lng }]);
    },
    getPoints: function(adds, cbk) {
        this.__adds = adds;
        this.__cbk = cbk;
        if (this._isExistScript()) {
            BMapGetPoints();
            return;
        }
        var script = document.createElement('script');
        script.src = 'http://api.map.baidu.com/api?v=1.4&callback=BMapGetPoints';
        document.getElementsByTagName('head')[0].appendChild(script);
    },
    __getPoints: function(myGeo) {
        var adds = this.__adds;
        var callback = this.__cbk;
        var len = adds.length;
        var delay = this.delay;
        var city = this.city;
        var coords = [];
        (function(idx) {
            if (idx < len - 1) {
                var func = arguments.callee;
                setTimeout(function() {
                    idx++;
                    func(idx);
                }, delay);
            }
            var add = adds[idx];
            myGeo.getPoint(add, function(point) {
                if (point) {
                    coords.push({ add: add, lat: point.lat, lng: point.lng });
                } else {
                    coords.push({ add: add, lat: '', lng: '' });
                }
                if (coords.length === len) {
                    callback(coords);
                }
            }, city);
        })(0);
    },
    _Geocoding: function(adds) {
        var that = this;
        var len = adds.length;
        var total = this.totalV;
        var delay = this.delay;
        var myGeo = this.myGeo;
        (function(idx) {
            if (idx < len - 1) {
                var func = arguments.callee;
                setTimeout(function() {
                    idx++;
                    func(idx);
                }, delay);
            }
            var add = adds[idx];
            that.events._events.onProgress(++that.updated, total);
            myGeo.getPoint(add, function(point) {
                if (point) {
                    that._convert2WGS(point.lat, point.lng, add);
                } else {
                    that.totalV--;
                    that._convert2WGS();
                }
            }, that.city);
        })(0);
    },
    BD2WGSOnce: function(coord, callback) {
        var lat = coord.lat;
        var lng = coord.lng;
        var url = "http://api.zdoz.net/bd2wgs.aspx?lat=" + lat + "&lng=" + lng;
        $.ajax({
            url: url,
            type: 'GET',
            success: function(wgs) {
                callback(wgs, coord);
            },
            dataType: "jsonp",
            async: false
        });
    },
    BD2WGS: function(coords, callback) {
        var func = this.BD2WGSOnce;
        var newCoords = [];
        for (var i = 0, len = coords.length; i < len; i++) {
            var coord_in = coords[i];
            func.call(null, coord_in, function(wgs, coord) {
                coord.lat_w = wgs.Lat;
                coord.lng_w = wgs.Lng;
                newCoords.push(coord);
                if (newCoords.length == len) {
                    callback(newCoords);
                }
            });
        };
    },
    _convert2WGS: function(lat, lng, add) {
        var that = this;
        var data = this.updData;
        if (arguments.length == 0) {
            updateData(data, that.totalV);
        } else {
            this.BD2WGSOnce({ lat: lat, lng: lng }, function(coord) {
                data.push([add, coord['Lat'], coord['Lng']]);
                updateData(data, that.totalV);
            });
        }

        function updateData(data, total) {
            var len = data.length;
            if (len == 1000 || (that.updCount + len) == total) {
                var updata = data.splice(0, 1000);
                var ifEnd = that.updCount + len == total ? true : false;
                that.updCoordByAdd(updata, ifEnd);
                that.updCount += 1000;
            }
        }
    },
    updCoordByAdd: function(data, flag) {
        var that = this;
        var fields = [this.keyfld, this.latFld, this.lngFld];
        var params = { 'Fields': fields, 'Data': data };
        var sqlservice = new gEcnu.WebSQLServices.SQLServices({
            'processCompleted': function(msg) {
                if (flag && typeof(that.events._events.processCompleted) != "undefined") {
                    that.events._events.processCompleted(msg);
                }
            },
            'processFailed': function() {}
        });
        sqlservice.processAscyn('UPDATE', this.dbname, this.tbname, params);
    },
    events: {
        _events: {
            onProgress: function() {}
        },
        on: function(eventType, callback) {
            switch (eventType) {
                case 'processCompleted':
                    this._events.processCompleted = callback;
                    break;
                case 'processFailed':
                    this._events.processFailed = callback;
                    break;
                case "onProgress":
                    this._events.onProgress = callback;
                    break;
            }
        }
    }
});

gEcnu.FeatureTab = gClass.extend({
    init: function(eventsListener) {
        if (typeof eventsListener != "undefined") {
            this.events._events.processCompleted = eventsListener.processCompleted;
            this.events._events.processFailed = eventsListener.processFailed;
        };
        this.latFld = 'lat';
        this.lngFld = 'lng';
        this.coordsFlag = 'PROJECTED';
    },
    createByCoord: function(options) {
        this.dbname = options.dbname;
        this.tbname = options.tbname;
        this.latFld = options.mapping && options.mapping.lat || this.latFld;
        this.lngFld = options.mapping && options.mapping.lng || this.lngFld;
        this.coordsFlag = options.coordsFlag || this.coordsFlag;
        this.fldsDef = options.fldsDef;
        this.errLat = true;
        this.errLng = true;
        this.fields = '';
        if (this.fldsDef) {
            var _sql = this._proSQL(this.fldsDef);
            var cbk = this._queryData;
            this.createFeatab(_sql, cbk);
        } else {
            this._queryTabInfo();
        }
    },
    setConnect: function(opt) {
        this.dbname = opt.dbname;
        this.tbname = opt.tbname || this.tbname;
    },
    setCoordFlds: function(opt) {
        this.latFld = opt.lat;
        this.lngFld = opt.lng;
    },
    setCoordsFlag: function(flag) {
        this.coordsFlag = flag;
    },
    setFldsDef: function(def) {
        this.fldsDef = def;
    },
    setOptions: function(options) {
        this.dbname = options.dbname || this.dbname;
        this.tbname = options.tbname || this.tbname;
        this.latFld = options.mapping && options.mapping.lat || this.latFld;
        this.lngFld = options.mapping && options.mapping.lng || this.lngFld;
        this.coordsFlag = options.coordsFlag || this.coordsFlag;
        this.fldsDef = options.fldsDef || this.fldsDef;
    },
    _queryTabInfo: function() {
        var that = this;
        var succ = this.createFeatab;
        var cbk = this._queryData;
        var sqlservice = new gEcnu.WebSQLServices.SQLServices({
            'processCompleted': function(msg, flds) {
                var _sql = that._proSQL(flds);
                succ.call(that, _sql, cbk);
            },
            'processFailed': function() {}
        });
        var sql = { 'lyr': this.tbname + ' limit 1', 'fields': '*', 'filter': "" };
        sqlservice.processAscyn('SQLQUERY', this.dbname, sql);
    },
    _proSQL: function(flds) {
        var lat_f = this.latFld.toUpperCase();
        var lng_f = this.lngFld.toUpperCase();
        var _str = ',';
        var fldArr = [];
        var trimArr = ['FID', 'SHPTYPE', 'XMIN', 'YMIN', 'XMAX', 'YMAX', 'SHPLEN', 'SHPAREA', 'SHPDATA'];
        var len_t = trimArr.length;
        for (var i = 0, len = flds.length; i < len; i++) {
            var flag = false;
            var tmpobj = flds[i];
            var field = tmpobj.name || tmpobj.field;
            var UppFld = field.toUpperCase();
            if (UppFld == lat_f) {
                this.errLat = false;
            } else if (UppFld == lng_f) {
                this.errLng = false;
            }
            for (var j = 0; j < len_t; j++) {
                var Tfield = trimArr[j];
                if (UppFld == Tfield) {
                    flag = true;
                    break;
                }
            };
            if (!flag) {
                var type = tmpobj.type || tmpobj.fieldtype;
                _str += field + ' ' + type + ',';
                fldArr.push(field);
            }
        };
        this.fields = fldArr.join(',');
        if (fldArr.length > 0) {
            _str = _str.replace(/,$/, ')');
        } else {
            _str = ')';
        }
        return "create table if not exists 'f_" + this.tbname + "' (fid integer primary key,shpType integer, xmin double,ymin double,xmax double ,ymax double ,shpLen double,shpArea double,shpData blob" + _str;
    },
    createFeatab: function(sql, succ, noErr) {
        var that = this;
        if (!noErr && (this.errLat || this.errLng)) {
            alert("未找到经纬度 " + this.latFld + " 与 " + this.lngFld + " 字段!");
            return;
        }
        var sqlservice = new gEcnu.WebSQLServices.SQLServices({
            'processCompleted': function(msg) {
                succ.call(that);
            },
            'processFailed': function() {}
        });
        sqlservice.processAscyn('SQLEXEC', this.dbname, sql);
    },
    _queryData: function() {
        var that = this;
        var lat = this.latFld;
        var lng = this.lngFld;
        var succ = this.coordsFlag == 'PROJECTED' ? this.getPtFeaPro : this.getPtFeaGeo;
        var cbk = this.inser2tab;
        var sqlservice = new gEcnu.WebSQLServices.SQLServices({
            'processCompleted': function(msg) {
                succ.call(that, msg, { lat: lat.toUpperCase(), lng: lng.toUpperCase() }, cbk);
            },
            'processFailed': function() {}
        });
        var sql = { 'lyr': this.tbname, 'fields': this.fields, 'filter': lat + "<>'' or " + lat + "<>NULL or " + lng + "<>'' or " + lng + "<>'' " };
        sqlservice.processAscyn('SQLQUERY', this.dbname, sql);
    },
    getPtFeaGeo: function(datas, mapping, callback) {
        var features = [];
        var lat = mapping.lat;
        var lng = mapping.lng;
        for (var i = 0, len = datas.length; i < len; i++) {
            var point = {};
            var data = datas[i];
            point.x = data[lng];
            point.y = data[lat];
            features[i] = new gEcnu.Feature.Point([point], data);
        };
        callback.call(this, features);
    },
    getPtFeaPro: function(datas, mapping, callback) {
        var features = [];
        var lat = mapping.lat;
        var lng = mapping.lng;
        for (var i = 0, len = datas.length; i < len; i++) {
            var point = {};
            var data = datas[i];
            point.x = data[lng] * 111000 * Math.cos(data[lat]);
            point.y = data[lat] * 111000;
            features[i] = new gEcnu.Feature.Point([point], data);
        };
        callback.call(this, features);
    },
    inser2tab: function(addfeas) {
        var that = this;
        var sqltaskFeaServices = new gEcnu.WebFeatureServices.FeatureServices({
            'processCompleted': function() {
                if (typeof(that.events._events.processCompleted) != "undefined") {
                    that.events._events.processCompleted();
                }
            },
            'processFailed': function() {}
        });
        sqltaskFeaServices.processAscyn(gEcnu.ActType.ADD, gEcnu.layerType.GeoDB, this.dbname, this.tbname, addfeas);
    },
    events: {
        _events: {},
        on: function(eventType, callback) {
            switch (eventType) {
                case 'processCompleted':
                    this._events.processCompleted = callback;
                    break;
                case 'processFailed':
                    this._events.processFailed = callback;
                    break;
            }
        }
    }
});

function BMapGeocoder() {
    var self = gEcnu.GeocoderSelf;
    self.myGeo = new BMap.Geocoder();
    var insFunc = self.addCoordFlds;
    var totalFunc = self.getTotalRec;
    var addFunc = self.getAddress;
    var geoFunc = self._Geocoding;
    insFunc.call(self, function() {
        totalFunc.call(self, function(total) {
            addFunc.call(self, total, function(adds) {
                geoFunc.call(self, adds);
            });
        });
    });
}

function BMapGetPoints() {
    var self = gEcnu.GeocoderSelf;
    var myGeo = self.myGeo || new BMap.Geocoder();
    self.__getPoints(myGeo);
}
