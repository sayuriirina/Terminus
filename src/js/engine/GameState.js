function GameState(first_room){
	this.params = {'':first_room.name};
  this.actions = {};
  this.cookie=null;
}
GameState.prototype = {
  getCurrentRoom : function() {
    return window[this.params['']];
  },
  setCurrentRoom : function(newRoom){
    this.params['']=newRoom.name;
    //when you call this function, set the cookie in the browser
    if (this.cookie) {
      this.cookie.write(this.params);
    }
  },
  add : function(param_name, fun){
    this.actions[param_name]=fun;
  },
  apply : function(param_name, replay){
    console.log('apply '+param_name);
    this.params[param_name] = 1;
    if (param_name in this.actions) {
      this.actions[param_name]((typeof replay === 'undefined') ? false : replay);
    }
  },
  loadCookie : function(name,minutes){
    //this function reads from a cookie if one exists
    this.cookie=new Cookie(name,minutes);
    var newRoomToSet=this.currentRoom;
    var params=this.cookie.read();
    if (params){
      if ("" in params){
        // set current room
        this.params[""]=params[""];
        delete params[""];
      }
      // set state properties
      for (var k in params){
        if (params.hasOwnProperty(k)){
          this.apply(k, params[k]);
        }
      }
      return true;
    }
    return false;
  },
};
