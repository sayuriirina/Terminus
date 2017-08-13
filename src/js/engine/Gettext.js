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
function _(str,vars,or) {
  vars = d(vars, []);
  or = d(or, '');
//  console.log(str);
  var ret;
  if (str in dialog) {
    ret=dialog[str].printf(vars);
  } else {
    if (typeof pogen == 'function' ){
      pogen(str);
    }
    if (or && or in dialog) {
      ret=dialog[or].printf(vars);
    } else {
      ret=str + ' ' + vars.join(' ');
    }
  }

  while (var_regexp.test(ret)) {
    ret=ret.replace(var_regexp, function (a) {
      return _(a.substring(2,a.length-2));
      });
  }
  return ret;
}
function gettext_check(){
  if (typeof pogen_deliver == 'function' ){pogen_deliver();}
}
