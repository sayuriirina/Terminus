//dialog shall be defined
String.prototype.toString=function(){
  if (def(this.orig)){
  console.log(this.orig);
  }
  return this;
}

String.prototype.printf=function (vars){
  var i = -1;
  return this.replace(/\%[sd]/g,
    function (a, b) {
      i++;
      return vars[i];
    });
};
function objToMsg(o){
  return o.toMsg();
}
var poe=(typeof pogen == 'function' );
var var_regexp=/\{\{\w+\}\}/g;
var var_resolve=function(a){return _(a.substring(2,a.length-2));}
function _(str,vars,or) {
  if (!def(str)) return new strComposite('','',[]);
  if (typeof vars !== 'object' || vars.length === 0 ){
    vars=['','','',''];
  } 
  or = d(or, '');
  var ret;
  if (str in dialog) {
    ret=dialog[str];
  } else {
    if (poe){
      pogen(str);
    }
    if (or && or in dialog) {
      str=ret;
      ret=dialog[or];
    } else {
      ret=str;
      if (vars.length > 0) ret+=' ' + vars.join(' ');
      return ret;
    }
  }
  while (var_regexp.test(ret)) {
    ret=ret.replace(var_regexp, var_resolve );
  }
  ret=ret.printf(vars);
  
  if (poe){
     return ret + "#" + str +"#" ;
  }
  return ret;
}
function gettext_check(){
  if (poe){pogen_deliver();}
}
