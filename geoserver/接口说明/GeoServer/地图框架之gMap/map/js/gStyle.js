 /**
   * 样式对象
   * @type {*|void}
   */
gEcnu.Style = gClass.extend({
  init:function(options){
    if(options.fillColor==undefined){
      this.fillColor='yellow';
    }else{this.fillColor=options.fillColor;}
    if(options.strokeColor==undefined){
      this.strokeColor='orange';
    }else{this.strokeColor=options.strokeColor;}
    if(options.lineWeight==undefined){
      this.lineWeight= 1;
    }else{this.lineWeight=options.lineWeight;}
    if(options.borderStatus==undefined){
      this.borderStatus= true;
    }else{this.borderStatus=false;}
    if(options.fillStatus==undefined){
      this.fillStatus=true;
    }else{this.fillStatus=false;}
    if(options.vtxStatus==undefined){
      this.vtxStatus= false;
    }else{this.vtxStatus=true;}
    if(options.vtxRadius==undefined){
      this.vtxRadius=3;
    }else{this.vtxRadius=options.vtxRadius};
    if(options.tlr==undefined){
      this.tlr=5;
    }else{this.tlr=options.tlr;}
    if(options.opacity==undefined){
      this.opacity=0.6;
    }else{this.opacity=options.opacity;}
  }
});