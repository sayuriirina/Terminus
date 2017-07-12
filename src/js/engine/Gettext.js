//dialog shall be defined
String.prototype.printf=function (vars){
  var i = -1;
  return this.replace(/\%[sd]/g,
    function (a, b) {
      i++;
      return vars[i];
    });
};
function d(v,w){
	return typeof v === 'undefined' ? w : v ;
}
function _(str,vars,or,_or) {
  vars = d(vars, []);
  or = d(or, '');
  _or = d(_or, '');
  if (str in dialog) {
    return dialog[str].printf(vars);
  } else if (or && or in dialog) {
    return dialog[or].printf(vars);
  } else if (_or && _or in dialog) {
    return dialog[_or].printf(vars);
  }
  return str+' '+vars;
}
