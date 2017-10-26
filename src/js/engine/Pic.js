function Pic(src,prop){
  this.src=src;
  prop=d(prop,{});
  this.img_dir=d(prop.img_dir, './img/'); // shall contains last slash './img/'
  this.cls=prop.cls;
  this.shown_in_ls=d(prop.pic_shown_in_ls,true);
  this.index=d(prop.index,0);
  this.children=prop.children||{};
}

Pic.prototype={
  set:function(src){
    this.src=src;
  },
  setOneShotRenderClass:function(cls){
    this.tmpcls=cls;
  },
  copy:function(children){
    return new Pic(this.src,{
      img_dir:this.img_dir,
      cls:this.cls,
      shown_in_ls:this.shown_in_ls,
      children:clone(this.children)
    });
  },
  addChildren:function(children){
    for (var name in children){
      if (children.hasOwnProperty(name)){
        this.children[name]=children[name];
      }
    }
  },
  setChild:function(name,child){
    this.children[name]=child;
  },
  unsetChild:function(name){
    delete this.children[name];
  },
  exists:function(){
    return this.src || this.children.length;
  },
  render_as_child:function(cont,cnt){
    if (this.src) {
      addEl(cont,'img',{class:'layer layer-'+cnt+' '+(this.cls || '')+' '+(this.tmpcls || ''),src:this.img_dir + this.src, 'aria-hidden':'true'});
      
      for (var name in this.children){
        if (this.children.hasOwnProperty(name)){
          var childpic=this.children[name];
          childpic.render_as_child(cont,cnt);
        }
      }
      delete this.tmpcls;
      return true;
    }
    return false;
  },
  render:function(c,onload){
    if (this.exists()){
      var cont=addEl(c,'div','layers');
        cont.onload=onload ;
      var over=addEl(cont,'div',{'class':'foreground','aria-hidden':'true'});
      var behind=addEl(cont,'div',{'class':'background','aria-hidden':'true'});
      if (this.src){
        addEl(cont,'img',{class:'main '+(this.cls || '')+' '+(this.tmpcls || ''),src:this.img_dir + this.src, 'aria-hidden':'true'})
          .onload=onload;
        delete this.tmpcls;
      }
      var cnt=0;
      for (var name in this.children){
        if (this.children.hasOwnProperty(name)){
          var childpic=this.children[name];
          if (childpic.render_as_child((childpic.index<0?behind:over),cnt+1)){
            cnt++;
          }
        }
      }
    }
  }
};

