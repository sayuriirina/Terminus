function Item(name, intro, picname, prop){
  this.name = name;
  this.picture = new Pic(picname, prop);
  this.cmd_text = {less: intro ? intro : _(PO_DEFAULT_ITEM)};
  this.cmd_event = {};
  this.valid_cmds = ["less"];
  this.room=null;
  this.ev = new EventTarget();
  this.poprefix=POPREFIX_ITEM;
  prop=d(prop,{});
  if (prop.poid){
    this.setPo(prop.poid,prop.povars);
  }
}
// Useless : just used for making distinction between living being and non-living things
// Does people are items ?
function People(name, intro, picname, prop){
  this.name = name;
  this.picture = new Pic(picname, prop);
  this.cmd_text = {less: intro ? intro : _(PO_DEFAULT_PEOPLE)};
  this.valid_cmds = ["less"];
  this.room=null;
  this.people=true;
  this.cmd_event = {};
  this.ev = new EventTarget();
  this.poprefix=POPREFIX_PEOPLE;
  prop=d(prop,{});
  if (prop.poid){ 
    this.setPo(prop.poid,prop.povars);
  }
}
Item.prototype = {
  getPic : function(newpicname){
    this.picture = newpicname;
  },
  addPicMod : function (id,picname,prop){
    var newpic=new Pic(picname,prop);
    this.picture.setChild(id,newpic);
    return this;
  },
  rmPicMod : function (id,picname){
    this.picture.unsetChild(id,newpic);
    return this;
  },
  copy:function(name){
    var nut = new Item(name);
    nut.picture = this.picture.copy();
    nut.cmd_text = clone(this.cmd_text);
    nut.valid_cmds = clone(this.valid_cmds);
    nut.cmd_event = clone(this.cmd_event);
//    nut.room = clone(this.room);
    nut.room = this.room;
    nut.people = this.people;
    nut.ev = clone(this.ev);
    nut.poprefix = this.poprefix;
    return nut;
  },
  setPic : function(newpicname){
    this.picture.set(newpicname);
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
    this.poid=this.poprefix+name;
    this.povars=vars;
    this.name=_(this.poid,vars);
    this.cmd_text.less=_(this.poid+POSUFFIX_DESC,vars);
    return this;
  },
  checkTextIdx : function(textidx) {
    return dialog.hasOwnProperty(this.poid+POSUFFIX_DESC+textidx);
  },
  setTextIdx : function(textidx,vars) {
    this.cmd_text.less = _(this.poid+POSUFFIX_DESC+textidx,vars,{or:this.poid+POSUFFIX_DESC});
    return this;
  },
  setPoDelta:function(delta){
    if (typeof delta == 'string'){
      this.poid+=delta;
    } else {
      this.povars=delta;
    }
    this.name=_(this.poid,vars);
    this.cmd_text.less=_(this.poid+POSUFFIX_DESC,this.povars);
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
  addState : function(name,fun){
    this.ev.addListener(name,state.Event);
    state.add(name,fun);
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
  unsetCmdEvent : function(cmd) {
    delete this.cmd_event[cmd];
    return this;
  },
  setCmdEvent : function(cmd, fun) {
    this.cmd_event[cmd] = fun;
    return this;
  },
  setCmdText : function(cmd, text) {
    this.cmd_text[cmd] = text;
    return this;
  },
  unsetCmdText : function(cmd){
    delete this.cmd_text[cmd];
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
People.prototype.checkTextIdx = Item.prototype.checkTextIdx;
People.prototype.setTextIdx = Item.prototype.setTextIdx;
People.prototype.setCmdText = Item.prototype.setCmdText;
People.prototype.unsetCmdText = Item.prototype.unsetCmdText;
People.prototype.setCmdEvent = Item.prototype.setCmdEvent;
People.prototype.unsetCmdEvent = Item.prototype.unsetCmdEvent;
People.prototype.addListener = Item.prototype.addListener;
People.prototype.addStates = Item.prototype.addStates;
People.prototype.addState = Item.prototype.addState;
People.prototype.addValidCmd = Item.prototype.addValidCmd;
People.prototype.moveTo = Item.prototype.moveTo;
People.prototype.disappear = Item.prototype.disappear;
People.prototype.toString = Item.prototype.toString;
People.prototype.changePic = Item.prototype.changePic;
People.prototype.fire_event = Item.prototype.fire_event;
People.prototype.addPicMod = Item.prototype.addPicMod;
People.prototype.rmPicMod = Item.prototype.rmPicMod;
