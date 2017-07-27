function Pic(picname,alt,title){
  this.src=picname;
  this.alt=alt ? alt : _(picname + '_alt'); 
  this.title=title ? title : _(picname + '_title'); 
}

img={ room_none:new Pic("none.gif",'',''),
      people_none:new Pic("none.gif",'',''),
      item_none:new Pic("none.gif",'','')};


