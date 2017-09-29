function Item(name, intro, picname){
  this.name = name;
  this.picture = picname;
  this.cmd_text = {less: intro ? intro : _(PO_DEFAULT_ITEM)};
  this.cmd_event = {};
  this.valid_cmds = ["less"];
  this.room=null;
  this.ev = new EventTarget();
  this.poprefix=POPREFIX_ITEM;
}
// Useless : just used for making distinction between living being and non-living things
// Does people are items ?
function People(name, intro, picname){
  this.name = name;
  this.picture = picname;
  this.cmd_text = {less: intro ? intro : _(PO_DEFAULT_PEOPLE)};
  this.valid_cmds = ["less"];
  this.room=null;
  this.people=true;
  this.cmd_event = {};
  this.ev = new EventTarget();
  this.poprefix=POPREFIX_PEOPLE;
}
Item.prototype = {
  getPic : function(newpicname){
    this.picture = newpicname;
  },
  copy:function(name){
    var nut = new Item(name);
    nut.picture = clone(this.picture);
    nut.cmd_text = clone(this.cmd_text);
    nut.valid_cmds = clone(this.valid_cmds);
    nut.cmd_event = clone(this.cmd_event);
    nut.room = clone(this.room);
    nut.people = this.people;
    nut.ev = clone(this.ev);
    nut.poprefix = this.poprefix;
    return nut;
  },
  setPic : function(newpicname){
    this.picture = newpicname;
    return this;
  },
  getName:function(){
    return this.name;
  },
  setName:function(name){
    this.name=name;
    return this;
  },
  setPo:function(name,vars){
    this.name=_(this.poprefix+name,vars);
    this.cmd_text.less=_(this.poprefix+name+POSUFFIX_DESC,vars);
    this.poid=name;
    this.povars=vars;
    return this;
  },
  setPoDelta:function(delta){
    if (typeof delta == 'string'){
      this.setPo(this.poid+delta,this.povars);
    } else {
      this.setPo(this.poid,delta);
    }
    return this;
  },
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
};

People.prototype.copy = Item.prototype.copy;
People.prototype.getPic = Item.prototype.getPic;
People.prototype.setPic = Item.prototype.setPic;
People.prototype.getName = Item.prototype.getName;
People.prototype.setName = Item.prototype.setName;
People.prototype.setPo = Item.prototype.setPo;
People.prototype.setPoDelta = Item.prototype.setPoDelta;
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
