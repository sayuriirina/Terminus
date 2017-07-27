String.prototype.replaceAll = function(from, to){
	ret = this.toString();
	while (ret.indexOf(from) > 0){
		ret = ret.replace(from, to);
	}
	return ret;
};
var global_spec={};
function Room(roomname, introtext, roompic, inside_evts,outside_evts){
	this.parents = [];
  this.previous = this;
	this.children = [];
	this.items = [];
	this.commands = ["cd", "ls", "less", "man", "help", "exit", "pwd"];
  this.fire = null;
	this.room_name = d(roomname, _('room_none'));
	this.intro_text = d(introtext, _('room_none_text'));
	this.room_pic = d(new Pic(roompic), img.room_none);
  this.cmd_text = {"pwd": _('cmd_pwd',[this.room_name])};
	//for event handling
	this.ev = new EventTarget();
  this.cmd_inside_spec=d(inside_evts, {});
  global_spec[this.room_name]=d(outside_evts, {});
  EventTarget.call(this);
}
function newRoom(id, roompic, inside_evts,outside_evts){
  return new Room(
    _('room_'+id,or='room_none'),
    _('room_'+id+'_text',or='room_none_text'),
    roompic,
    inside_evts,
    outside_evts);
}
function enterRoom(new_room,vt){
  vt.push_img(null);
  vt.setContext(new_room);
  state.setCurrentRoom(new_room);
  return [new_room.toString(), new_room.intro_text];
}


Room.prototype = {
  toString : function(){
    return this.room_name;
  },

  fire_event:function(cmd,args,idx,otherroomname){
    var ck=null;
    var context={room:this, arg:args[idx], args:args, i:idx};
    if (typeof otherroomname === 'string' ) {
      if ((otherroomname in global_spec) && (cmd in global_spec[otherroomname])) {
        ck = global_spec[otherroomname][cmd](context);
      }
    } else if (cmd in this.cmd_inside_spec) {
      ck = this.cmd_inside_spec[cmd](context);
    }
    if (ck) {
      this.ev.fire(ck);
    }
  },

  changeIntroText : function(new_text){
    this.intro_text = new_text;
  },

  addItem : function(newitem) {
    if (typeof newitem != 'undefined'){
      this.items[this.items.length] = newitem;
    }
    return this;
  },

  newItem : function(id,picname) {
    var name = _('item_'+id,[],'item_none');
    var intro = _('item_'+id+'_text',[],'item_none_text');
    var ret=new Item(name, intro, picname);
    this.addItem(ret);
    return ret;
  },

  newPeople : function(id,picname) {
    var name = _('people_'+id,or='people_none');
    var intro = _('people_'+id+'_text',or='people_none_text');
    var ret = new People(name,intro, picname);
    this.addItem(ret);
    return ret;
  },

  newItemBatch: function(id, names, picname) {
    var ret=[], name, intro;
    for (var i = 0; i < names.length; i++){
      name = _('item_'+id+names[i], [names[i]], 'item_'+id, 'item_none');
      intro = _('item_'+id+name[i]+'_text', [names[i]], 'item_'+id+'_text', 'item_none_text');
      ret[i]=new Item(name,intro,picname);
      this.addItem(ret[i]);
    }
    return ret;
  },

  removeItem : function(itemnametoremove){
    index = this.itemStringArray().indexOf(itemnametoremove);
    if (index != -1){
      return this.items.splice(index, 1)[0];
    }
    return null;
  },

  itemStringArray : function(item){
    itemstrarray = [];
    for (var i = 0; i < this.items.length; i++){
      itemstrarray[itemstrarray.length] = this.items[i].toString();
    }
    return itemstrarray;
  },

  childStringArray : function(child){
    childstrarray = [];
    for (var i = 0; i < this.children.length; i++){
      childstrarray[childstrarray.length] = this.children[i].toString();
    }
    return childstrarray;
  },

  getItemFromName : function(itemname){
    itemindex = this.itemStringArray().indexOf(itemname);
    if (itemindex > -1)
      return this.items[itemindex];
    return -1;
  },

  getChildFromName : function(childname){
    childindex = this.childStringArray().indexOf(childname);
    if (childindex > -1)
      return this.children[childindex];
    return -1;
  },

  addChild : function(newchild){
    if (typeof newchild != 'undefined'){
      this.children[this.children.length] = newchild;
    }
  },

  removeChild : function(child){
    index = this.children.indexOf(child);
    if (index != -1){
      this.children.splice(index, 1);
    }
  },

  childrenStringArray : function(child){
    childrenstrarray = [];
    for (var i = 0; i < this.children.length; i++){
      childrenstrarray[childrenstrarray.length] = this.children[i].toString();
    }
    return childrenstrarray;
  },

  addParent : function(parent){
    this.parents[0] = parent;
  },

  addListener : function(name,fun){
    this.ev.addListener(name,fun);
    return this;
  },

  addCommand : function(cmd){
    this.commands[this.commands.length] = cmd;
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

  traversee: function(path){
      var pat=path.split('/');
      var room=this;
      var item=null;
      var i;
      for (i = 0; i < pat.length-1; i++){
        if (room){
          room=room.can_cd(pat[i]);
        } else {
          return _("room_unreachable");
        }
      }
      for (i = 0; i < room.items.length; i++){
        if (pat[pat.length-1] === room.items[i].toString()){
          item=pat[pat.length-1]
          break;
        }
      }
      if (!item){
         room=room.can_cd(pat[pat.length-1])
      }
      return [room,item];
  },

  ls : function(args,vt){
    if (args.length > 0){
      var room=this.traversee(args[0])[0];
      if (room) {
        if (room.children.length == 0 && room.items.length == 0 ){
          return _("room_empty");
        }
        return room.printLS();
      }
    } else {
      vt.push_img(this.room_pic); // Display image of room
      return this.printLS();
    }
  },

  printLS : function(){
    return _('directions', [" " + (this.children.toString()).replaceAll(",", "\n ")]) +
      "\n" + ( (this.items.length > 0) ? _('items', [" " + (this.items.toString()).replaceAll(",", "\n ")]) : '');
  },

  cd : function(args,vt){
    if (args.length > 1){
      return _('cmd_cd_flood');
    } else if (args[0] === "-") {
      this.previous.previous=this;
      enterRoom(this.previous, vt);
    } else if (args.length === 0){
      Home.previous=this;
      enterRoom(Home, vt);
      return _('cmd_cd_home');
    }else if (args[0] === "..") {
      this.fire_event('cd',args,0);
      if (this.parents.length >= 1){
        this.parents[0].previous=this;
        return _('cmd_cd_parent', enterRoom(this.parents[0], vt));
      } else {
        return _('cmd_cd_no_parent');
      }
    } else if (args[0] === "~"){
      Home.previous=this;
      enterRoom(Home, vt);
      return _('cmd_cd_home');
    } else if (args[0] === ".") {
      vt.push_img(null);
      return _('cmd_cd',enterRoom(this, vt));
      // } else if (args[0].indexOf("/") > 0){
      // 	var rooms_in_order = args[0].split("/");
      // 	var cur_room_to_test = this;
      // 	for (var i = 0; i < rooms_in_order.length; i++){
      // 		cur_room_to_test = cur_room_to_test.can_cd(rooms_in_order[i]);
      // 		if (cur_room_to_test === false){
      // 			return "That is not reachable from here.";
      // 		}
      // 	}
      // 	enterRoom(cur_room_to_test);
      // 	return "You  have moved to " + cur_room_to_test.toString() + ". " + current_room.intro_text;
      //  } else if (args[0][0] === "/") {
      // /* testing ... */
      //    roomname = args[0].substr(1);
      //    this.fire_event('cd',args,O,roomname);
    } else {
      var room=this.traversee(args[0])[0];
      if (room) {
        if (room.commands.indexOf("cd") > -1){
          room.previous=this;
          return _('cmd_cd',enterRoom(room,vt));
        } else {
          this.fire_event('cd',args,0,room.room_name);
          return room.cmd_text.cd;
        }
      }
      //      roomname = args[0];
      //      for (var i = 0; i < this.children.length; i++){
      //        if (roomname === this.children[i].toString()){
      //          if (this.children[i].commands.indexOf("cd") > -1){
      //            this.children[i].previous=this;
      //            return _('cmd_cd',enterRoom(this.children[i],vt));
      //          } else {
      //            this.fire_event('cd',args,0,roomname);
      //            return this.children[i].cmd_text.cd;
      //          }
      //        }
      //    }
      return _('cmd_cd_failed', args);
    }
  },

  /*Checks if arg can be reached from this room
   * Returns the room if it can
   * Returns false if it cannot
   *
   * 'arg' is a single node, not a path
   * i.e. Home.can_cd("next_room") returns true
   *      Home.can_cd("next_room/another_room") is invalid
   */
  can_cd : function(arg){
    //Don't allow for undefined or multiple paths
    if (arg === undefined || arg.indexOf("/") > -1){
      return false;
    }
    else if(arg === "..") {
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

  less : function(args,vt){
    if (args.length < 1){
      return _('cmd_less_invalid');
    } else {
      var traversee=this.traversee(args[0]);
      var room=traversee[0];
      var item=traversee[1];
      for (i = 0; i < room.items.length; i++){
        if (item === room.items[i].toString()){
          vt.push_img(room.items[i].picture); // Display image of item
          var ret=room.items[i].cmd_text.less;
          room.fire_event('less',args,0);
          return ret;
        }
      }
      return _('cmd_less_invalid',args);
    }
  },

  //only valid for command names
  man : function(args){
    if (args.length < 1){
      return _('cmd_man_no_query');
    } else {
      if (('man_'+args[0]) in dialog){
        return _('man_'+args[0]);
      }
      return _('cmd_man_not_found');
    }
  },

  help : function(args){
    return _('cmd_help_suggestion');
  },

  exit : function(args){
    this.commands=[];
    setTimeout(function(){
      document.body.innerHTML=_('cmd_exit_html');
    },2000);
    return _('cmd_exit');
  },

  pwd : function(args,vt){
    vt.push_img(this.room_pic);
    return "";
  },

  mv : function(args){
    if (args.length != 2){
      return _('cmd_mv_flood');
    } else {
      var item_name_to_move = this.itemStringArray().indexOf(args[0]);
      if ((item_name_to_move >= 0) && (this.childrenStringArray().indexOf(args[1]) >= 0)){
        itemtoadd = this.items[this.itemStringArray().indexOf(args[0])];
        this.children[this.childrenStringArray().indexOf(args[1])].addItem(itemtoadd);
        this.fire_event('mv',args,0);
        this.removeItem(args[0]);
        return _('cmd_mv_done', args);
      } else {
        return _("cmd_mv_invalid");
      }
    }
  },

  rm : function(args){
    if (args.length < 1){
      return _("cmd_rm_miss");
    } else {
      stringtoreturn = "";
      for (var i = 0; i < args.length; i++){
        if (this.getItemFromName(args[i]) != -1){
          if (this.getItemFromName(args[i]).valid_cmds.indexOf("rm") > 0){
            var removedItem = this.removeItem(args[i]);
            if (removedItem) {
              this.fire_event('rm',args,i);
              if ("rm" in removedItem.cmd_text){
                stringtoreturn += removedItem.cmd_text.rm + "\n";
              } else {
                stringtoreturn += _('cmd_rm_done', [args[i]]);
              }
            } else {
              stringtoreturn += _('cmd_rm_failed');
            }
          } else {
            return _('cmd_rm_invalid');
          }
        }
        return stringtoreturn;
      }
    }
  },

  grep : function(args){
    if (this.commands.indexOf("grep") > 0){
      var word_to_find = args[0];
      if (this.getItemFromName(args[1]) != -1){
        var item_to_find_in_text = this.getItemFromName(args[1]).cmd_text.less;
        var line_array = item_to_find_in_text.split("\n");
        var return_arr = jQuery.grep(line_array, function(line){ return (line.indexOf(word_to_find) > 0);});
        return return_arr.join("\n");
      } else {
        return "Not a valid item to search in.";
      }
    }
    return _('cmd_unknown');
  },

  touch : function(args){
    if (args.length < 1){
      return _('cmd_touch_nothing');
    } else {
      var createdItemsString = "";
      for (var i = args.length - 1; i >= 0; i--) {
        if (args[i].length > 0){
          this.addItem(new Item(args[i], _('item_intro', [args[i]])));
          createdItemsString += args[i];
          this.fire_event('touch',args,i);
        }
      }
      if (createdItemsString === ""){
        return _('cmd_touch_none');
      }
      return _('cmd_touch_created', [createdItemsString]);
    }
    return _('cmd_unknown');
  },

  cp : function(args){
    if (args.length != 2){
      return _('incorrect_syntax');
    } else {
      var item_to_copy_name = args[0];
      var new_item_name = args[1];
      var item_to_copy = this.getItemFromName(item_to_copy_name);
      if (item_to_copy != -1){
        var newItem = new Item(new_item_name);
        newItem.picture = item_to_copy.picture;
        newItem.cmd_text = item_to_copy.cmd_text;
        newItem.valid_cmds = item_to_copy.valid_cmds;
        this.addItem(newItem);
        this.fire_event('cp',args,0);
        return _('cmd_cp_copied', [item_to_copy_name ,new_item_name]);
      }
      return _('cmd_cp_unknown');
    }
    return _('cmd_unknown');
  },

  terminus : function(args){
    var ret = this.cmd_text.terminus;
    this.ev.fire("AthenaComboEntered");
    return ret;
  },

  tellme : function(args){
    if (args[0] === "combo"){
      return _("combo");
    }
    return _('incorrect_syntax');
  },

  mkdir : function(args){
    if (this.commands.indexOf("mkdir") > 0){
      if (args.length === 1){
        link_rooms(this, new Room(args[0]));
        this.fire_event('mkdir',args,0);
        return _("room_new_created", args);
      }
      return _("incorrect_syntax");
    }
    return _("cmd_unknown");
  },

  sudo : function(args){
    if (this.commands.indexOf("sudo") > 0){
      if (args[0] === "less" && args[1] === "Certificate"){
        this.ev.fire("tryEnterSudo");
        return;
      } else {
        return _("room_wrong_syntax");
      }
    }
    return _("cannot_cast");
  },

  IHTFP : function(args){
    if (this.commands.indexOf("IHTFP") > 0){
      if (args.length === 0){
        var text_to_return = this.cmd_text.IHTFP;
        this.ev.fire("sudoComplete");
        return text_to_return;
      }
      return _('room_wrong_password');
    }
    return _('invalid_spell');
  },

  add : function(args){
    if (this.commands.indexOf("add") > 0){
      if (args[0] === "MagicLocker"){
        this.ev.fire("addMagicLocker");
        if (typeof this.cmd_text.add === 'undefined'){
          return _("lock_added",args);
        }
        return this.cmd_text.add;
      }
      else {
        return _("invalid_locker");
      }
    }
    return _('invalid_spell');
  },
  exec : function (vt, args){
    var cmd = args[0];
    args.push(args.pop().replace(/\/$/,""));
    if( this.commands.indexOf(cmd) > -1 ){ 
      var prev = this;
      //      if (args.length > 1 && args[1].indexOf("/") > 0){
      //        var rooms_in_order = args[1].split("/");
      //        var curr = this;
      //        for (var i = 0; i < rooms_in_order.length; i++){
      //          prev = curr;
      //          var room_to_cd = rooms_in_order[i];
      //          if (i > 0 && rooms_in_order[i-1] === "~"){
      //            curr = Home.can_cd(room_to_cd);
      //          } else if (room_to_cd === "~"){
      //            curr = Home;
      //          } else {
      //            curr = curr.can_cd(room_to_cd);
      //          }
      //          if ((cmd === "cd" || cmd === "ls") && curr === false){
      //            return "That is not reachable from here.";
      //          }
      //        }
      //        args[1] = curr.room_name;
      //      }
      console.log(args);
      var text_to_display = prev[cmd](args.slice(1),vt);
      if (text_to_display){
        return text_to_display;
      }
      if (cmd in this.cmd_text){
        return this.cmd_text[cmd];
      }
    } else{
      return "Command '"+cmd+"' not found in room '"+this.room_name+"'";
    }
  },

  _completeRoomName : function(cmd,prefix){
    var search_room = prefix.substring(0,1) == "~" ? Home : this;
    //Iterate through each room
    var lastchar=prefix.charAt(prefix.length-1);
    var path_rooms = prefix.split("/");
    var new_room;
    var incomplete_room;
    var ret = [];
    var substring_matches = [];
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
          if(cmd == "cp" || cmd == "mv" || cmd == "less" || cmd == "grep" || cmd == "touch" || cmd == "rm" || cmd == "sudo") {
            for(item_num = 0; item_num<search_room.items.length; item_num++){
              if(search_room.items[item_num].itemname.match("^"+path_rooms[room_num])){
                substring_matches.push(search_room.items[item_num].itemname);
              }
            }
          }

          //If one match exists
          if(substring_matches.length == 1){
            path_rooms.pop();
            path_rooms.push(substring_matches[0]);
            ret = [path_rooms.join("/")];
          } else if(substring_matches.length > 1){
            //If multiple matches exist
            ret =  substring_matches;
          }
        }
      }
    }
    return ret;
  }


};
