//dialog shall be defined
String.prototype.printf=function (vars){
  var i = -1;
  return this.replace(/\%[sd]/g,
    function (a, b) {
      i++;
      return vars[i];
    });
};
var var_regexp=/\{\{\w+\}\}/g;
var var_resolve=function(a){return _(a.substring(2,a.length-2));}
function _(str,vars,or) {
  if (typeof vars !== 'object' || vars.length === 0 ){
    vars=['','','',''];
  }
  or = d(or, '');
//  console.log(str,vars);
  var ret;
  if (str in dialog) {
    ret=dialog[str];
  } else {
    if (typeof pogen == 'function' ){
      pogen(str);
    }
    if (or && or in dialog) {
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

  return ret;
}
function gettext_check(){
  if (typeof pogen_deliver == 'function' ){pogen_deliver();}
}
