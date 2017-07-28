//dialog shall be defined
String.prototype.printf=function (vars){
  var i = -1;
  return this.replace(/\%[sd]/g,
    function (a, b) {
      i++;
      return vars[i];
    });
};
function _(str,vars,or) {
  vars = d(vars, []);
  or = d(or, '');
  if (str in dialog) {
    return dialog[str].printf(vars);
  } else {
    if (typeof pogen == 'function' ){
      pogen(str);
    }
    if (or && or in dialog) {
      return dialog[or].printf(vars);
    }
    return str + vars.join(' ');
  }
};
function gettext_check(){
  if (typeof pogen_deliver == 'function' ){pogen_deliver();}
}
