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

  apply : function(param_name, replay=false){
    this.params[name_prop] = 1;
    if (param_name in this.actions) {
      this.actions[param_name](replay);
    }
  }
};
