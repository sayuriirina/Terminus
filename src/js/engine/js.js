
var dom = document;
dom.Id = dom.getElementById;
dom.Add = dom.appendChild;
dom.El = dom.createElement;

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
