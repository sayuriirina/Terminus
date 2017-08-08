/* light dom manipulation and common type testing tool */

var dom = document;
dom.Id = dom.getElementById;
dom.El = dom.createElement;

function addEl(root,tag,clss,txt,title,fun){
  var el=dom.El(tag);
  if (def(clss)) {el.className=clss;}
  if (def(title)) {el.title=title;}
  if (def(txt)) {el.innerHTML='<span>'+txt+'</span>';}
  if (def(fun)) {el.onclick=fun;}
  root.appendChild(el);
  return el;
}

function addAttrs(el,attrs){
  for (var i in attrs) {
    if (attrs.hasOwnProperty(i)){
      el.setAttribute(i,attrs[i]); 
    }
  }
  return el;
}

function objToStr(o){
  return o.toString();
}
function d(v,w){
	return typeof v === 'undefined' ? w : v ;
}
function def(v){
	return (typeof v !== 'undefined');
}
function ndef(v){
	return (typeof v === 'undefined');
}
function pushDef(v,h){
  if (typeof v !== 'undefined'){
    h.push(v);
  }
}
function hdef(h,k,v){
  if (ndef(h[k])){
    h[k] = [];
  }
  h[k].push(v);
};
