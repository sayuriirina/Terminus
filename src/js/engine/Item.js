function Item(name, intro, picname){
  this.itemname = name;
  this.picture = picname ? new Pic(picname) : img.item_none;
  this.cmd_text = {less: intro ? intro : _('item_none_text')};
  this.cmd_event = {};
  this.valid_cmds = ["less"];
  this.room=null;
  this.ev = new EventTarget();
}
Item.prototype = {
  fire_event:function(vt,cmd,args,idx){
    var ck=null;
    var context={term:vt,room:this.room, item:this, arg:args[idx], args:args, i:idx};
    if (cmd in this.cmd_event) {
      ck = this.cmd_event[cmd](context);
    }
    if (ck) {
      this.ev.fire(ck);
    }
  },
  addListener : function(name,fun) {
    this.ev.addListener(name,fun);
    return this;
  },
  addCmdEvent : function(cmd, fun) {
    this.cmd_event[cmd] = fun;
    return this;
  },
  addCmdText : function(cmd, text) {
    this.cmd_text[cmd] = text;
    return this;
  },
  addValidCmd : function(cmd){
    this.valid_cmds.push(cmd);
    return this;
  },
  moveTo : function(room){
    this.room.removeItemByName(this.itemname);
    room.addItem(this);
    return this;
  },
  toString : function(){
    return this.itemname;
  },
  changePic : function(newpicname){
    this.picture = new Pic(newpicname);
  }
};

// Useless : just used for making distinction between living being and non-living things
// Does people are items ?
function People(name, intro, picname,alt,title){
  this.itemname = name;
  this.picture = picname ? new Pic(picname) : img.people_none;
  this.cmd_text = {less: intro ? intro : _('people_none_text')};
  this.valid_cmds = ["less"];
  this.room=null;
  this.people=true;
  this.cmd_event = {};
  this.ev = new EventTarget();
}
People.prototype.addCmdText = Item.prototype.addCmdText;
People.prototype.addCmdEvent = Item.prototype.addCmdEvent;
People.prototype.addListener = Item.prototype.addListener;
People.prototype.addValidCmd = Item.prototype.addValidCmd;
People.prototype.moveTo = Item.prototype.moveTo;
People.prototype.toString = Item.prototype.toString;
People.prototype.changePic = Item.prototype.changePic;
People.prototype.fire_event = Item.prototype.fire_event;
