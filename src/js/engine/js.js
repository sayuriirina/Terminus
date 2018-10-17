// input specific - from js fiddle
// function findWord(str,pos){
//    var words=str.split(' ');
//    var offset=0;
//    var i;
//    for(i=0;i<words.length;i++){
//        offset+=words[i].length+1;
//        if (offset>pos) break;
//
//    }
//    return words[i];
// }

// function almostEqual(a,delta,b){
//   if(a==b){
//      return true;
//   } else if (a>b) {
//     return (b+delta)>a;
//   } else {
//     return (a+delta)>b;
//   }
//   return false;
// }

function d (v, w) {
  return typeof v === 'undefined' ? w : v
}
// function anyStr(v,w){
//	 return typeof v === 'string' ? v : (typeof w == 'string' ? w : null) ;
// }
// function aStrArray(v){
//   return typeof v === 'string' ? [v] : ((v && v.length) ? v : []);
// }
function isStr (v) {
  return (typeof v === 'string')
}
// function isObj(v){
//	 return (typeof v === 'object');
// }
function def (v) {
  return (typeof v !== 'undefined')
}
// function pushDef(v,h){
//   if (typeof v !== 'undefined'){
//     h.push(v);
//   }
// }
function inc (h, k) {
  if (h[k]) { h[k]++ } else { h[k] = 1 }
}
function hdef (h, k, v) {
  if (!def(h[k])) {
    h[k] = []
  }
  h[k].push(v)
}
function rmIdxOf (l, str) {
  index = l.indexOf(str)
  return ((index === -1) ? null : l.splice(index, 1))
}
// String.prototype.replaceAll = function(from, to){
//	ret = this.toString();
//	while (ret.indexOf(from) > 0){
//		ret = ret.replace(from, to);
//	}
//	return ret;
// };
