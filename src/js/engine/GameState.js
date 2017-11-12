function GameState(){
	this.params = {};
  this.actions = {};
  this.cookie=null;
  this.Event=function(e){state.apply(e.type);};
}
GameState.prototype = {
  getCurrentRoom : function() {
    return window[this.params['']];
  },
  saveCookie: function(){
    //when you call this function, set the cookie in the browser
    if (this.cookie) {
      this.cookie.write(this.params);
    }
  },
  setCurrentRoom : function(newRoom){
    if(newRoom.varname){
      this.params['']=newRoom.varname;
      this.saveCookie();
    }
  },
  add : function(param_name, fun){
    this.actions[param_name]=fun;
  },
  applied : function(param_name){
    return this.actions[param_name];
  },
  apply : function(param_name, replay){
    console.log('apply '+param_name);
    this.params[param_name] = 1;
    if (param_name in this.actions) {
      this.actions[param_name]((typeof replay === 'undefined') ? false : replay);
    }
  },
  startCookie : function(name){
    this.cookie=new Cookie(name);
    return this.cookie.check();
  },
  stopCookie : function(name){
    this.cookie=null;
  },
  setCookieDuration : function(minutes){
    //this function create a new cookie
    this.cookie.minutes=minutes;
  },
  loadCookie : function(){
    //this function reads from a cookie if one exists
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
      this.saveCookie();
      return true;
    }
    return false;
  },
};
