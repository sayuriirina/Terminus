/* light dom manipulation and common type testing tool */
var dom = document;
dom.Id = dom.getElementById;
dom.El = dom.createElement;

function prEl(root,tag,attrs){
  var el=dom.El(tag);
  root.prepend(el);
  var ty=typeof attrs;
  if (ty == 'string'){el.className=attrs;}
  else if (ty=='object'){addAttrs(el,attrs);}
  return el;
}
function addEl(root,tag,attrs){
  var el=dom.El(tag);
  root.appendChild(el);
  var ty=typeof attrs;
  if (ty == 'string'){el.className=attrs;}
  else if (ty=='object'){addAttrs(el,attrs);}
  return el;
}
function span(cls,content){
  return "<span class='"+cls+"'>"+content+"</span>";
}
function addAttrs(el,attrs){
  for (var i in attrs) {
    if (attrs.hasOwnProperty(i)){
      el.setAttribute(i,attrs[i]); 
    }
  }
  return el;
}

function addBtn(root,clss,txt,title,fun){
  var el=dom.El('button');
  if (def(clss)) {el.className=clss;}
  if (def(title)) {el.title=title;}
  if (def(txt)) {el.innerHTML='<span>'+txt+'</span>';}
  if (def(fun)) {el.onclick=fun;}
  root.appendChild(el);
  return el;
}
