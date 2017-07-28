function Pic(picname,alt,title){
  this.src=picname;
  this.alt=d(alt, _(picname + '_alt'));
  this.title=d(title, _(picname + '_title'));
}
img={ room_none:new Pic("none.gif",'',''),
      people_none:new Pic("none.gif",'',''),
      item_none:new Pic("none.gif",'','')};


