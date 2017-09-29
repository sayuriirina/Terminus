String.prototype.replaceAll = function(from, to){
	ret = this.toString();
	while (ret.indexOf(from) > 0){
		ret = ret.replace(from, to);
	}
	return ret;
};
var global_spec={};
function Room(roomname, introtext, roompic,varname){
  this.name=varname;//currently undefined for user created rooms, see mkdir
  this.parents = [];
  this.previous = this;
	this.children = [];
	this.items = [];
  this.commands_lock={};
	this.commands = ["poe","pogen","cd", "ls", "less", "man", "help", "exit", "pwd","tar","unzip"];
  this.fire = null;
	this.room_name =d(roomname, _(PO_DEFAULT_ROOM,[]));
	this.intro_text = d(introtext, _(PO_DEFAULT_ROOM_DESC));
  this.room_pic = roompic ;
  this.cmd_text = {"pwd": _(POPREFIX_CMD+'pwd',[this.room_name]).concat("\n").concat(this.intro_text) };
	this.starter_msg=null;
	this.enter_callback=null;
  //for event handling
	this.ev = new EventTarget();
  this.cmd_event={};
  EventTarget.call(this);
}
function newRoom(id, roompic){
  //this function automatically set the variable $id to ease game saving
  var varname= '$'+id;
  var poid='room_'+id;
  var n= new Room(
    _(poid,[],{or:PO_DEFAULT_ROOM}),
    _(poid+POSUFFIX_DESC,[],{or:PO_DEFAULT_ROOM_DESC}),
    roompic,
    varname);
  n.poid=poid;
  window[varname]=n;
  return n;
}
function enterRoom(new_room,vt){
  vt.setContext(new_room);
  state.setCurrentRoom(new_room);
  if (typeof new_room.enter_callback == 'function'){
     new_room.enter_callback();
  }
  return [new_room.toString(), new_room.intro_text];
}

Room.prototype = {
  toString : function(){
    return this.room_name;
  },
  fire_event :function(vt,cmd,args,idx,ct){
    ct=d(ct,{});
    var ev_trigger=null;
    console.log('fire '+cmd);
    var context={term:vt, room:this, arg:args[idx], args:args, i:idx,ct:ct};
    if (ct.hasOwnProperty('unreachable_room')) {
      if ((ct.unreachable_room.room_name in global_spec) && (cmd in global_spec[ct.unreachable_room.room_name])) {
        ev_trigger=global_spec[ct.unreachable_room.room_name][cmd];
      }
    } else if (cmd in this.cmd_event) {
//      console.log(cmd,this.cmd_inside_spec[cmd].toString());
      ev_trigger=this.cmd_event[cmd];
    }
    if (ev_trigger) {
      var ck=(typeof ev_trigger === "function" ? ev_trigger(context) : ev_trigger);
      if (ck){
    console.log('FIRE '+ck);
        this.ev.fire(ck);
      }
    }
  },
  // text displayed at each change
  setIntroText : function(txt){
    this.intro_text = txt;
  },
  // callback when entering in the room
  setEnterCallback : function(fu){
    this.enter_callback = fu;
  },
  // a message displayed on game start
  getStarterMsg: function(){
    if (this.starter_msg){
      return this.starter_msg;
    } else {
      return this.cmd_text.pwd;
    }
  },
  setStarterMsg: function(txt){
    this.starter_msg = txt;
  },
  // Room picture
  getPic: function(){
    return this.room_pic;
  },
  setPic: function(pic){
    this.room_pic=pic;
  },
  // item & people management
  addItem : function(newitem) {
    pushDef(newitem,this.items);
    newitem.room=this;
    return this;
  },
  newItem : function(id,picname,name_vars) {
    var ret=new Item('', '', picname);
    ret.setPo(id,name_vars);
    this.addItem(ret);
    return ret;
  },
  newPeople : function(id,picname,name_vars) {
    var ret = new People('','', picname);
    ret.setPo(id,name_vars);
    this.addItem(ret);
    return ret;
  },
  newItemBatch: function(id, names, picname) {
    var ret=[];
    for (var i = 0; i < names.length; i++){
      var name_vars=[names[i]];
      ret[i]=new Item('', '', picname);
      ret[i].setPo(id,name_vars);
      this.addItem(ret[i]);
    }
    return ret;
  },
  removeItemByIdx : function(idx){
    return ((idx == -1) ? null : this.items.splice(idx, 1)[0]);
  },
  removeItemByName : function(name){
    idx = this.idxItemFromName(name);
    return this.removeItemByIdx(idx);
  },
  hasItem : function(name){
    idx = this.idxItemFromName(_(POPREFIX_ITEM+name));
    return (idx > -1);
  },
  removeItem : function(name){
    idx = this.idxItemFromName(_(POPREFIX_ITEM+name));
    return this.removeItemByIdx(idx);
  },
  hasPeople : function(name){
    idx = this.idxItemFromName(_(POPREFIX_PEOPLE+name));
    return (idx > -1);
  },
  removePeople : function(name){
    idx = this.idxItemFromName(_(POPREFIX_PEOPLE+name));
    return this.removeItemByIdx(idx);
  },
  idxItemFromName : function(name){
    return this.items.map(objToStr).indexOf(name);
  },
  idxChildFromName : function(name){
    return this.children.map(objToStr).indexOf(name);
  },
  getItemFromName : function(name){
    console.log(name);
    idx = this.idxItemFromName(name);
    return ((idx == -1) ? null : this.items[idx]);
  },
  getItem : function(name){
    return this.getItemFromName(_('item_'+name));
  },

  // linked room management
  getChildFromName : function(name){
    idx = this.children.map(objToStr).indexOf(name);
    return ((idx == -1) ? null : this.children[idx]);
  },
  addPath : function(newchild,wayback){
    if (pushDef(newchild,this.children) && d(wayback,true)){
        newchild.parents.push(this);
    }
  },
  removeParentPath : function(child){
    index = this.parents.indexOf(child);
    if (index != -1){
      this.parents.splice(index, 1);
    }
  },
  removePath : function(child){
    index = this.children.indexOf(child);
    if (index != -1){
      child.removeParentPath(this);
      this.children.splice(index, 1);
    }
  },
  // Events management
  addListener : function(name,fun){
    this.ev.addListener(name,fun);
    return this;
  },
  addState : function(name,fun){
    this.ev.addListener(name,state.Event);
    state.add(name,fun);
    return this;
  },
  removeState : function(name,fun){
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
  addCmdEvent : function(cmd, fun,decl_command) {
    this.cmd_event[cmd] = fun;
    if (decl_command) {
     if (this.commands.indexOf(cmd) == -1) {
       this.commands.push(cmd);
     }
    }
    return this;
  },
  addCmdEvents : function(h,decl_command) {
    for (var i in h) {
      if (h.hasOwnProperty(i)){
        this.addCmdEvent(i, h[i],decl_command);
      }
    }
    return this;
  },
  removeCmdEvent : function(cmd) {
    delete this.cmd_event[cmd];
    return this;
  },
  addOutsideEvt: function(name,fun){
    global_spec[this.room_name][name]=fun;
    return this;
  },
  removeOutsideEvt: function(name){
    delete global_spec[this.room_name][name];
    return this;
  },

  // command management
  setCommandOptions : function(cmd,options){
    this.commands_lock[cmd]=options;
    return this;
  },
  removeCommandOptions : function(cmd){
    delete this.commands_lock[cmd];
    return this;
  },
  getCommands : function(){
    var ret=[];
    for (var i=0;i<this.commands.length;i++){
      if (this.hasCommand(this.commands[i])){
        ret.push(this.commands[i]);
      }
    }
    return ret;
  },
  hasCommand : function(cmd){
    return ( (this.commands.indexOf(cmd) > -1) && ( global_commands.indexOf(cmd) > -1 ) );
  },
  addCommand : function(cmd,options){
//    console.log(this,cmd);
    this.commands.push(cmd);
    if (def(options)){
      this.setCommandOptions(cmd,options);
    }
    return this;
  },

  removeCommand : function(cmd){
    index = this.commands.indexOf(cmd);
    if (index != -1){
      this.commands.splice(index, 1);
    }
    return this;
  },

  addCmdText : function(cmd, text) {
    this.cmd_text[cmd] = text;
    return this;
  },

  removeCmdText : function(cmd){
    delete this.cmd_text[cmd];
    return this;
  },

  /*Checks if arg can be reached from this room
   * Returns the room if it can
   * Returns false if it cannot
   *
   * 'arg' is a single node, not a path
   * i.e. $home.can_cd("next_room") returns true
   *      $home.can_cd("next_room/another_room") is invalid
   */
  can_cd : function(arg){
    //Don't allow for undefined or multiple paths
    if (arg === undefined || arg.indexOf("/") > -1){
      return false;
    } else if(arg === "~") {
      return $home;
    } else if(arg === "..") {
      return this.parents[0];
    } else if (arg === ".") {
      return this;
    } else {
      for (var i = 0; i < this.children.length; i++){
        if (arg === this.children[i].toString()){
          return this.children[i];
        }
      }
      return false;
    }
  },

  /* Returns the room and the item corresponding to the path
   * if item is null, then the path describe a room and  room is the full path
   * else room is the room containing the item */
  traversee: function(path){
    var pat=path.split('/');
    var room=this;
    var item=null;
    var lastcomponent=null;
    var i;
    var cancd=true;
    for (i = 0; i < pat.length-1; i++){
      if (cancd){
        cancd=room.can_cd(pat[i]);
        if (cancd) {
          room=cancd;
        } else  {
          room=null;break;
        }
      }
    }
    if (room){
      lastcomponent=pat[pat.length-1];
//      console.log(room.items);
      for (i = 0; i < room.items.length; i++){
//      console.log(room.items[i].toString());
        if (lastcomponent === room.items[i].toString()){
          item=room.items[i];
          break;
        }
      }
      if (!item){
        cancd=room.can_cd(pat[pat.length-1]);
        if (cancd) {
          room=cancd;
          lastcomponent=null;
        }
      }
    }
    return [room,item,lastcomponent,i];
  },

  ls : function(args,vt){
    if (args.length > 0){
      var room=this.traversee(args[0])[0];
      if (room) {
        if (room.children.length === 0 && room.items.length === 0 ){
          return _("room_empty");
        }
        return room.printLS();
      } {
          return _("room_unreachable");
      }
    } else {
      vt.push_img(this.room_pic); // Display image of room
      return this.printLS();
    }
  },

  printLS : function(){
    var ret='';
    if (this.children.length > 0){
      ret+= _('directions', [" " + this.children.map(objToStr).join("\n ")]) + " \n";
    }
    var items=this.items.filter(function(o){return !o.people;});
    var peoples=this.items.filter(function(o){return o.people;});
    if (items.length > 0){
      ret+= _('items', [" " + items.map(objToStr).join("\n ")]) + " \n";
    }
    if (peoples.length > 0){
      ret+=_('peoples', [" " + peoples.map(objToStr).join("\n ")]) + " \n";
    }
    return ret;
  },

  cd : function(args,vt){
    if (args.length > 1){
      return _('cmd_cd_flood');
    } else if (args[0] === "-") {
      this.previous.previous=this;
      enterRoom(this.previous, vt);
    } else if (args.length === 0){
      return _('cmd_cd_no_args');
    } else if (args[0] === "~"){
      $home.previous=this;
      enterRoom($home, vt);
      return _('cmd_cd_home');
    } else if (args[0] === "..") {
      this.fire_event(vt,'cd',args,0);
      if (this.parents.length >= 1){
        this.parents[0].previous=this;
        return _('cmd_cd_parent', enterRoom(this.parents[0], vt));
      } else {
        return _('cmd_cd_no_parent');
      }
    } else if (args[0] === ".") {
      vt.push_img(img.room_none);
      return _('cmd_cd',enterRoom(this, vt));
    } else {
      var traversee=this.traversee(args[0]);
      var room=traversee[0];var lastcomponent=traversee[2];
      if (room && !lastcomponent) {
        this.fire_event(vt,'cd',args,0,{'unreachable_room':room});
        if (room.hasCommand("cd")){
          room.previous=this;
          return _('cmd_cd',enterRoom(room,vt));
        } else {
          return room.cmd_text.cd;
        }
//      } else {
//        return _("room_unreachable");
      }
      return _('cmd_cd_failed', args);
    }
  },

  cmd_done: function(vt, fireables, ret, cmd, args){
    // fire events *_done when ret is shown
    var cb=function(){
      for (var i = 0; i < fireables.length; i++) {
        fireables[i][0].fire_event(vt,cmd+'_done',args,fireables[i][1]);
      }
    };
    return [ret,cb];
  },

  less : function(args,vt){// event arg -> object
    if (args.length < 1){
      return _('cmd_less_invalid');
    } else {
      var traversee=this.traversee(args[0]);
      var room=traversee[0];
//      console.log(args,traversee);
      if (room){
        var item=traversee[1];
        if (item) {
            vt.push_img(item.picture); // Display image of item
            room.fire_event(vt,'less',args,0);
            item.fire_event(vt,'less',args,0);
            return this.cmd_done(vt,[[room,0],[item,0]], item.cmd_text.less,'less',args) ;
        } else {
          return _("item_not_exists",args);
        }
      } else {
        return _("room_unreachable");
      }
      return _('cmd_less_invalid',args);
    }
  },

  //only valid for command names
  man : function(args,vt){// event arg -> cmd
    if (args.length < 1){
      return _('cmd_man_no_query');
    } else {
      if (('man_'+args[0]) in dialog){
        return _('man_'+args[0]);
      }
      return _('cmd_man_not_found');
    }
  },

  help : function(args,vt){
    ret=_('cmd_help_begin')+"\n";
    for (var i=0;i<this.commands.length;i++){
      if (this.hasCommand(this.commands[i])){
        ret+='<pre>'+this.commands[i]+'\t</pre>: '+_('help_'+this.commands[i])+"\n";
      }
    }
    return ret;
  },

  exit : function(args,vt){
    this.commands=[];
    setTimeout(function(){
      dom.body.innerHTML=_('cmd_exit_html');
    },2000);
    return _('cmd_exit');
  },

  pwd : function(args,vt){
    vt.push_img(this.room_pic);
    return "";
  },

  mv : function(args,vt){// event arg -> object (source)
    if (args.length != 2){
      return _('cmd_mv_flood');
    } else {
      var src = this.traversee(args[0]);
      var ret;
      if (src[0] && src[1]){
        var item_idx = src[3];
        var dest = this.traversee(args[1]);
        if ((item_idx >= 0) && ( dest[0] )){
          itemtoadd = src[0].items[item_idx];
//          console.log(itemtoadd);
          if (itemtoadd.valid_cmds.indexOf("mv")>-1){
            if (dest[1]){
              dest[0].removeItemByIdx(dest[3]);
            }
            dest[0].addItem(itemtoadd);
            if (dest[2]){
              itemtoadd.name=dest[2];
            }
            src[0].fire_event(vt,'mv',args,0);
            src[0].removeItemByIdx(item_idx);
            if (src[0].room_name !== dest[0].room_name){
              itemtoadd.fire_event(vt,'mv',args,0);
              if ("mv" in itemtoadd.cmd_text){
                ret=itemtoadd.cmd_text.mv;
              }
            }
            if (!ret){ret=_('cmd_mv_done', args);}

            return this.cmd_done(vt,[[itemtoadd,0]], ret,'mv',args) ;
          } else if ("mv" in itemtoadd.cmd_text){
            return itemtoadd.cmd_text.mv;
          } else {
            return _('cmd_mv_fixed'); 
          }
        }
      }
      return _("cmd_mv_invalid"); 
    }
  },

  rm : function(args,vt){// event arg -> object
    if (args.length < 1){
      return _("cmd_rm_miss");
    } else {
      var stringtoreturn = "";
      var item,room,idx;
      for (var i = 0; i < args.length; i++){
        var traversee = this.traversee(args[i]);
        room = traversee[0];
        item = traversee[1];
        idx = traversee[3];
        if (item){
          if (item.valid_cmds.indexOf("rm") > 0){
            var removedItem = room.removeItemByIdx(idx);
            if (removedItem) {
              room.fire_event(vt,'rm',args,i);
              if ("rm" in removedItem.cmd_text){
                stringtoreturn += removedItem.cmd_text.rm + "\n";
              } else {
                stringtoreturn += _('cmd_rm_done', [args[i]]);
              }
            } else {
              stringtoreturn += _('cmd_rm_failed');
            }
          } else {
            if ("rm" in item.cmd_text){
              return item.cmd_text.rm;
            }
            return _('cmd_rm_invalid');
          }
        }
        return stringtoreturn;
      }
    }
  },

  grep : function(args,vt){
    if (this.hasCommand("grep")){
      var word_to_find = args[0];
//      var item=this.getItemFromName(args[1]);
      var traversee=this.traversee(args[1]);
      var item=traversee[1];
      if (item){
        var item_to_find_in_text = item.cmd_text.less;
        var line_array = item_to_find_in_text.split("\n");
        var return_arr = line_array.filter(function(line){ return (line.indexOf(word_to_find) > 0);});
        return return_arr.join("\n");
      } else {
        return _('item_not_exists', args);
      }
    }
    return _('cmd_unknown');
  },

  touch : function(args,vt){
    if (args.length < 1){
      return _('cmd_touch_nothing');
    } else {
      var createdItemsString = "";
      for (var i = args.length - 1; i >= 0; i--) {
        if (this.getItemFromName(args[i])){
          return _('tgt_already_exists',[args[i]]);
        } else if (args[i].length > 0){
          this.addItem(new Item(args[i], _('item_intro', [args[i]])));
          createdItemsString += args[i];
          this.fire_event(vt,'touch',args,i);
        }
      }
      if (createdItemsString === ""){
        return _('cmd_touch_none');
      }
      return _('cmd_touch_created', [createdItemsString]);
    }
    return _('cmd_unknown');
  },

  cp : function(args,vt){//event arg -> destination item
    if (args.length != 2){
      return _('incorrect_syntax');
    } else {
      var i = args[0];
      var nu = args[1];
//      var item = this.getItemFromName(i);
      var src=this.traversee(args[0]);
      var dest=this.traversee(args[1]);
      var item=src[1];
      var nit=dest[1];
      var nro=dest[0];
      if (item){
        if (nit){
          return _('tgt_already_exists',[nit.name]);
        } else if (nro) {
          nut = item.copy(dest[2]);
          nro.addItem(nut);
          nut.fire_event(vt,'cp',args,1);
          item.fire_event(vt,'cp',args,0);
          nro.fire_event(vt,'cp',args,1);

          return this.cmd_done(vt,[[item,0],[nut,1]], _('cmd_cp_copied', [i ,nu]),'cp',args) ;
        }
      }
      return _('cmd_cp_unknown');
    }
    return _('cmd_unknown');
  },

  mkdir : function(args,vt){//event arg -> created dir
    if (this.hasCommand("mkdir")){
      if (args.length === 1){
        this.addPath(new Room(args[0]));
        this.fire_event(vt,'mkdir',args,0);
        return _("room_new_created", args);
      }
      return _("incorrect_syntax");
    }
    return _("cmd_unknown");
  },

  unzip: function(args,vt){
    if (this.hasCommand("unzip")){
      if (args.length === 1){
        var src=this.traversee(args[0]);
        var item=src[1];
        if (item && (item.valid_cmds.indexOf('unzip')>-1)){
          item.fire_event(vt,'unzip',args,0);
          return "";
        } else {
          return _("item_cmd_unknow",'unzip');
        }
      }
      return _("incorrect_syntax");
    }
    return _("cmd_unknown");
  },
  sudo : function(args,vt){
    if (this.hasCommand("sudo")){
      if (args[0] === "less" && args[1] === "Certificate"){
        this.ev.fire("tryEnterSudo");
        return;
      } else {
        return _("room_wrong_syntax");
      }
    }
    return _("cannot_cast");
  },
  poe : function(args,vt){
      var sym=args[0];
      if (sym){
        if (dialog[sym]){
          var cb=function(value){
          dialog[sym]=value;
        }
          vt.ask(_("po_symbol_edit"),cb,{multiline:true,value:dialog[sym]})
          return '';
        } else {
          return _("po_symbol_unknown");
        }
      }
      return _("incorrect_syntax");
  
  },
  pogen : function(args,vt){
    var ret=pogen_deliver_link();
    return [ret,function(){
      ret.click();
    }]; 
  },
  exec : function (vt, arrs){
    var cmd = arrs[0];
    var ret = "";
    var r=this;
    arrs.push(arrs.pop().replace(/\/$/,""));
    var args=arrs.slice(1);
    // test command eligibility when no existant args
    if((args.length === 0 || cmd == 'mkdir' || cmd == 'touch' ) && !r.hasCommand(cmd) ){ 
      if (cmd in r.cmd_text){
        r.fire_event(vt,cmd+'_cmd_text',args,0);
        ret=r.cmd_text[cmd];
      } else {
        r.fire_event(vt,cmd+'_cmd_not_found',args,0);
        ret=_('cmd_not_found',[cmd,r.room_name]);
      }
      return ret;
    } 
    // asume there is a collection of password to unlock
    // if the collection is empty then the command is executed
    var passwordcallback=function(passok,cmdpass){
      var ret = "";
      if (passok) {
        var text_to_display = r[cmd](args,vt);
        if (text_to_display){
          ret=text_to_display;
        } else if (cmd in r.cmd_text){
          ret=r.cmd_text[cmd];
        }
      } else {
        ret=_('room_wrong_password');
      }
      return ret;
    };
    
    // construct the list of passwords to give
    var cmdpass=[];
    if (cmd in this.commands_lock){
      if (cmd.locked_inside) {
        cmdpass.push(this.commands_lock[cmd]);
      }
    }
    for (var i=0;i<args.length;i++ ){
      var traversee=this.traversee(args[i]);
      var cur;
      if (traversee[0]){
        if (traversee[1]){
          //don't ask passwd for items
          continue;
        }
        cur=traversee[0];
      } else {
        continue;
      }
      if (i===0 && !cur.hasCommand(cmd)){
        if (cmd in cur.cmd_text){
          ret=cur.cmd_text[cmd];
        } else {
          ret = _('cmd_not_found',[cmd,cur.room_name]);
        }
        return ret;
      }
      if (cmd in cur.commands_lock){
        if(cmd === "sudo" && cur.hasOwnProperty('supass') && cur.supass){
          continue;
        }
        cmdpass.push(cur.commands_lock[cmd]);
      }
    }
    // ask passwords and exec 
    if (cmdpass.length > 0){
      vt.ask_password(cmdpass,passwordcallback);
    } else {
      return passwordcallback(true);
    }
  },

  _validArgs : function(cmd,args){
    if (cmd =='ls') {
      return true;
    } else {
      if (args.length == 1){
        if (cmd == 'man' ||cmd == 'cd' || cmd == 'mkdir' || cmd == 'less' || cmd == 'touch' || cmd=='unzip'){
          return true;
        }
      }
      return false;
    }
  },
  _completeArgs : function(cmd,prefix){
    var search_room = prefix.substring(0,1) == "~" ? $home : this;
    //Iterate through each room
    var lastchar=prefix.charAt(prefix.length-1);
    var path_rooms = prefix.split("/");
    var new_room;
    var incomplete_room;
    var substring_matches = [];
    if (cmd=='poe') {
      return Object.keys(dialog).filter(function(i){
        return i.match("^"+prefix);
      }).slice(0,20); 
    } 
    if (cmd=='cd' && path_rooms.length == 1 && path_rooms[0].length === 0){
      substring_matches.push('..'); 
    }
    for (room_num=0;room_num<path_rooms.length;room_num++)
    {
      new_room = search_room.can_cd(path_rooms[room_num]);
      if(new_room){
        search_room = new_room;
        if (room_num === path_rooms.length -1){
          ret = [new_room.room_name + '/' ];
        }
      } else {
        //We've made it to the final room,
        // so we should look for things to complete our journey
        if(room_num == path_rooms.length-1){
          //IF cd, ls, cp, mv, less
          //Compare to this room's children
          if(cmd == "cd" || cmd == "ls" || cmd == 'less' || cmd == "mv") {
            for(child_num = 0; child_num<search_room.children.length; child_num++){
              if(search_room.children[child_num].room_name.match("^"+path_rooms[room_num])){
                substring_matches.push(search_room.children[child_num].room_name + '/');
              }
            }
          }
          //IF cp, mv, less, grep, touch
          //Compare to this room's items
          if(cmd == "cp" || cmd == "mv" || cmd == "less" || cmd == "grep" || cmd == "touch" || cmd == "rm" || cmd == "sudo" || cmd=="unzip") {
            for(item_num = 0; item_num<search_room.items.length; item_num++){
              if(search_room.items[item_num].name.match("^"+path_rooms[room_num])){
                substring_matches.push(search_room.items[item_num].name);
              }
            }
          }
          
          //IF man, give commands
          if(cmd == "man") {
            substring_matches=this.commands;
          }

        }
      }
    }
    return substring_matches;
  }


};
