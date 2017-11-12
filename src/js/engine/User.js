
var user={groups:[]};
function _addGroup(grp){
  user.groups.push(grp);
}
function _hasGroup(grp){
  return user.groups.indexOf(grp)>-1;
}
