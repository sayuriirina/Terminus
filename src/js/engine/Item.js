function Item(name, intro, picname){
  this.name = name;
  this.picture = picname ? new Pic(picname) : img.item_none;
  this.cmd_text = {less: intro ? intro : _('item_none_text')};
  this.cmd_event = {};
  this.valid_cmds = ["less"];
  this.room=null;
  this.ev = new EventTarget();
}
Item.prototype = {
  fire_event:function(vt,cmd,args,idx){
    var ev_trigger=null;
    var context={term:vt,room:this.room, item:this, arg:args[idx], args:args, i:idx};
    if (cmd in this.cmd_event) {
      ev_trigger = this.cmd_event[cmd];
    }
    if (ev_trigger) {
      var ck=(typeof ev_trigger === "function" ? ev_trigger(context) : ev_trigger);
      if (ck) {
        this.ev.fire(ck);
      }
    }
  },
  addListener : function(name,fun) {
    this.ev.addListener(name,fun);
    return this;
  },
  addStates : function(h){
    for (var i in h) {
      if (h.hasOwnProperty(i)){
        this.ev.addListener(i,state.Event);
        state.add(i,h[i]);
      }
    }
    return this;
  },
  removeCmdEvent : function(cmd) {
    delete this.cmd_event[cmd];
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
  disappear : function(){
    this.room.removeItemByName(this.name);
  },
  moveTo : function(room){
    this.room.removeItemByName(this.name);
    room.addItem(this);
    return this;
  },
  toString : function(){
    return this.name;
  },
  changePic : function(newpicname){
    this.picture = new Pic(newpicname);
  }
};

// Useless : just used for making distinction between living being and non-living things
// Does people are items ?
function People(name, intro, picname){
  this.name = name;
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
People.prototype.removeCmdEvent = Item.prototype.removeCmdEvent;
People.prototype.addListener = Item.prototype.addListener;
People.prototype.addStates = Item.prototype.addStates;
People.prototype.addValidCmd = Item.prototype.addValidCmd;
People.prototype.moveTo = Item.prototype.moveTo;
People.prototype.disappear = Item.prototype.disappear;
People.prototype.toString = Item.prototype.toString;
People.prototype.changePic = Item.prototype.changePic;
People.prototype.fire_event = Item.prototype.fire_event;
