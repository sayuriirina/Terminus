var dialog=[];

String.prototype.printf=function (vars){
  var i = 0;
  return this.replace(/\%[sd]/g,
    function (a, b) {
      i++;
      return vars[i];
    });
};

function _(str,vars=[],or='',_or='') {
  var _arguments=arguments;
  if (typeof vars == "string") {
    vars = _arguments; 
  } else {
    vars.unshift('');
  }
  if (str in dialog) {
    return dialog[str].printf(vars);
  } else if (or && or in dialog) {
    return dialog[or].printf(vars);
  } else if (_or && _or in dialog) {
    return dialog[_or].printf(vars);
  }

  return str;
}
