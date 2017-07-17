function GameState(first_room){
	this.currentRoom = first_room;
	this.params = {};
  this.actions = {};
}

GameState.prototype = {
  getCurrentRoom : function() {
    //this function reads from a cookie if one exists
    //by default the new room is just the current room
    var newRoomToSet=this.currentRoom;
    //if there is a cookie, the newRoomToSet is read from the cookie
    //	var cookieval=this.readCookie();
    // TODO : find alternative way to manage information you get with cookies
    var cookieval=false;//never use cookie
    if (cookieval){
      //parse the cookie. right now it is only the current room name
      var cookieargs = cookieval.split("=");
      var room_name_to_set = cookieargs.splice(0, 1);
      var cookie_params = cookieargs;
      for (var i = 0; i < cookie_params.length; i++){
        var param_pair = cookie_params[i].split(":");
        this.params[param_pair[0]] = param_pair[1];
        this.apply(param_pair[0], true);
      }
      newRoomToSet=window[room_name_to_set];
    }
    //call setCurrentRoom to reset the expiration date on the cookie
    this.setCurrentRoom(newRoomToSet);
    return this.currentRoom;
  },

  setCurrentRoom : function(newRoom){
    this.currentRoom=newRoom;
    //when you call this function, set the cookie in the browser
    var date = new Date();
    //by default, cookies active for a week
    date.setTime(date.getTime()+(7*24*60*60*1000));
    document.cookie = "terminuscookie="+this.get()+"; expires="+date.toGMTString()+"; path=/";
  },

  get : function(){
    //for anything in the state, if it is not written in the cookie explicitly, it's value is 0
    var param_string = "";
    for (var key in this.params){
      if (this.params.hasOwnProperty(key)){
        param_string += key + ":" + this.params[key] + "=";
      }
    }
    return this.currentRoom.toString() + "=" + param_string;
  },

  readCookie : function(){
    var nameCookie = "terminuscookie";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameCookie) === 0) 
        return c.substring(nameCookie.length + 1,c.length);
    }
    return null;
  },

  add : function(param_name, fun){
    this.actions[param_name]=fun;
  },

  apply : function(param_name, replay){
    this.params[name_prop] = 1;
    if (param_name in this.actions) {
      this.actions[param_name](typeof replay === 'boolean' && replay);
    }
  }
};
var current_room;
/*
function start_game_bak(){
  current_room = state.getCurrentRoom();
  $(document).ready(function() {
    $('#term').terminal(function(input, term) {
      var split = input.replace(/\s+/," ").replace(/\s+$/,"").replace(/\/$/,"").split(" ");
      var command = split[0].toString();
      var args = split.splice(1,split.length);
      var exec = true;
      if( current_room.commands.indexOf(command) > -1 ){ //Could Utilises current_room.hasOwnProperty(command)
        var prev_room_to_test = current_room;
        if (args.length > 0 && args[0].indexOf("/") > 0){
          var rooms_in_order = args[0].split("/");
          var cur_room_to_test = current_room;
                for (var i = 0; i < rooms_in_order.length; i++){
                  prev_room_to_test = cur_room_to_test;
                  var room_to_cd = rooms_in_order[i];
                  if (i > 0 && rooms_in_order[i-1] === "~"){
                    cur_room_to_test = Home.can_cd(room_to_cd)
                  } else if (room_to_cd === "~"){
                        cur_room_to_test = Home;
                  } else {
                    cur_room_to_test = cur_room_to_test.can_cd(room_to_cd);
                  }
                  if ((command === "cd" || command === "ls") && cur_room_to_test === false){
                    term.echo("That is not reachable from here.");
                        exec = false;
                  }
                }
          args[0] = cur_room_to_test.room_name;
        }
        if (exec){
          var text_to_display = prev_room_to_test[command](args);
          if (text_to_display){
            term.echo(text_to_display);
          }
          if (command in current_room.cmd_text){
            term.echo(current_room.cmd_text[command]);
          }
        }
      }
      else{
        term.echo("Command '"+command+"' not found in room '"+current_room.room_name+"'");
      }
    }, {
//      history: true,                     // Keep user's history of commands
      prompt: '>',                        // Text that prefixes terminal entries
      name: 'terminus_terminal',          // Name of terminal
      // Signiture to include at top of terminal
      greetings:_('item_welcome_letter_text'),
      exit: false,                        // Disable 'exit' command
      clear: true,                       // Disable 'clear' command
    });

    // Clear history on page reload
//    $("#term").terminal().history().clear();
    //Give term focus (Fixes weird initial draw issue)
    $("#term").click();
    //Tab Completion FOR LAST ARGUMENT
    $(window).keyup(function(event){
      if(event.keyCode == 9){
        var command = $("#term").terminal().get_command().replace(/\s+$/,"");
        var split_command = command.split(" ");
        var first_arg = split_command[0]
        var last_arg = split_command.pop();
        //Start in a room, try to move through path, and if we get to the end
        // check whether a room/item could complete our trip

        //Get starting room
        var search_room;
        if(last_arg.substring(0,1) == "~"){
          search_room = jQuery.extend(true, {}, Home);
        }
        else{
          search_room = jQuery.extend(true, {}, current_room);
        }
        //Iterate through each room
        var path_rooms = last_arg.split("/");
        var new_room;
        var incomplete_room;
        var substring_matches = [];
        for (room_num=0;room_num<path_rooms.length;room_num++)
        {
          new_room = search_room.can_cd(path_rooms[room_num]);
          if(new_room){
            search_room = new_room;
          }
          else{
            //We've made it to the final room,
            // so we should look for things to complete our journey
            if(room_num == path_rooms.length-1){
              //IF cd, ls, cp, mv, less
              //Compare to this room's children
              if(first_arg == "cd" ||
                first_arg == "ls" ||
                first_arg == "mv")
              {
                for(child_num = 0; child_num<search_room.children.length; child_num++){
                  if(search_room.children[child_num].room_name.match("^"+path_rooms[room_num])){
                    substring_matches.push(search_room.children[child_num].room_name);
                  }
                }
              }
              //IF cp, mv, less, grep, touch
              //Compare to this room's items
              if(first_arg == "cp" ||
                first_arg == "mv" ||
                first_arg == "less" ||
                first_arg == "grep" ||
                first_arg == "touch" ||
                first_arg == "rm" ||
                first_arg == "sudo")
              {
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
                split_command.push(path_rooms.join("/"))
                $("#term").terminal().set_command(split_command.join(" "));
              }
              //If multiple matches exist
              else if(substring_matches.length > 1){
                //Search for longest common substring (taken from: http://stackoverflow.com/questions/1837555/ajax-autocomplete-or-autosuggest-with-tab-completion-autofill-similar-to-shell/1897480#1897480)
                var lCSindex = 0
                var i, ch, memo
                do {
                  memo = null
                  for (i=0; i < substring_matches.length; i++) {
                    ch = substring_matches[i].charAt(lCSindex)
                    if (!ch) break
                    if (!memo) memo = ch
                    else if (ch != memo) break
                  }
                } while (i == substring_matches.length && ++lCSindex)

                  var longestCommonSubstring = substring_matches[0].slice(0, lCSindex)
                //If there is a common substring...
                if(longestCommonSubstring != ""){
                  //If it already matches the last snippit, then show the options
                  if(path_rooms[room_num] == longestCommonSubstring){
                    split_command.push(last_arg)                                                    //Join final argument to split_command
                    $("#term").terminal().echo(">"+split_command.join(" ").replace(/\s+$/,""));     //Print what the user entered
                    $("#term").terminal().echo(substring_matches.join(" "));                        //Print the matches
                    $("#term").terminal().set_command(split_command.join(" ").replace(/\s+$/,""));  //Set the text to what the user entered
                  }
                  //Otherwise, fill in the longest common substring
                  else{
                    path_rooms.pop();                           //Pop final snippit
                    path_rooms.push(longestCommonSubstring);    //Push longest common substring
                    split_command.push(path_rooms.join("/"))    //Join room paths
                    $("#term").terminal().set_command(split_command.join(" ")); //Set the terminal text to this auto-completion
                  }
                }
                //Otherwise, there is no common substring.  Show all of the options.
                else{
                  split_command.push(last_arg)                                                    //Join final argument to split_command
                  $("#term").terminal().echo(">"+split_command.join(" ").replace(/\s+$/,""));     //Print what the user entered
                  $("#term").terminal().echo(substring_matches.join(" "));                        //Print the matches
                  $("#term").terminal().set_command(split_command.join(" ").replace(/\s+$/,""));  //Set the text to what the user entered
                }
              }
              //If no match exists
              else{
                //DO NOTHING (except remove TAB)
                $("#term").terminal().set_command(command.replace(/\s+$/,""));
              }
            }
            else{
              //DO NOTHING (except remove TAB)
              $("#term").terminal().set_command(command.replace(/\s+$/,""));
            }
          }
        }
      }
    });
  });
  console.log("Game loaded");
}
*/
/*
function VTerm(name, room){
  this.title=name;
  this.current_room=room;

}
VTerm.prototype = {
}
*/
var term, pr, args, cmd, history;
function start_game(){
  current_room = state.getCurrentRoom();
  term=document.getElementById('term');
  prcontainer = document.createElement('p');
  prcontainer.className = "input";
  pr = document.createElement('input');
//  history = document.createElement('datalist');
  pr.autofocus="autofocus";
  pr.autocomplete="on";
  pr.value='ls';
  pr.size=80;
//  var hist=['ls','cd','less'];
//  history.state=hist;
//  pr.name='terminus';
  pr.list='commands';
  prcontainer.appendChild(pr);
  term.appendChild(prcontainer);

  var welcome=document.createElement('p');
  welcome.innerText=_('item_welcome_letter_text');
  term.insertBefore(welcome,prcontainer);

  //  term.appendChild(history);
  term.onclick = function (e) {
    pr.focus();
  }
	pr.onkeydown = function (e) {
    var k=e.which;
    if ( k === 9 || k == 13 ) {
      e.preventDefault();
    }
  }
  pr.onkeyup = function (e) {
    var k=e.which;
    var echo="";
//    console.log(e);
    if (k === 13) {
      // Enter -> exec command
      args=pr.value.replace(/\s+/," ").replace(/\s+$/,"").replace(/\/$/,"").split(" ");

      echo=current_room.exec(args);
      var prevcmd=document.createElement('p');
      var msg=document.createElement('pre');
      prevcmd.className = "input";
      prevcmd.innerText = pr.value;
      msg.innerText= echo;
      msg.className = "msg";
      term.insertBefore(prevcmd, prcontainer);
      term.insertBefore(msg, prcontainer);
      e.preventDefault();
      pr.value='';
      window.scrollTo(0,prcontainer.offsetTop);
    } else if ( k === 9) {
      // Tab -> complete command
      e.preventDefault();
      args=pr.value.replace(/\s+/," ").replace(/\s+$/,"").replace(/\/$/,"").split(" ");
      if (args.length > 1) {
        var tocomplete=args.pop();
        var match=current_room._completeRoomName(args[0],tocomplete);
        if (match.length == 0){
        } else if (match.length == 1){
          args.push(match[0]);
          pr.value=args.join(" ");
        } else {
//          console.log(match);
        }
      }
    } else if (k === 37 || k === 39 || k === 38 || k  === 40) {
//				e.preventDefault()
      //arows
    }
  }
  console.log("Game loaded");
}
