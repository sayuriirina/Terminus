function Item(name, intro, picname){
	this.itemname = name;
  this.picturename = i( picname ? picname : img.item_none );
  this.cmd_text = {less: intro ? intro : _('item_none_text')};
  this.valid_cmds = ["less"];
}
function People(name, intro, picname){
	this.itemname = name;
  this.picturename = i( picname ? picname : img.people_none );
  this.cmd_text = {less: intro ? intro : _('people_none_text')};
	this.valid_cmds = ["less"];
}

Item.prototype.addCmdText = function(cmd, text) {
	this.cmd_text[cmd] = text;
  return this;
};

Item.prototype.addValidCmd = function(cmd){
	this.valid_cmds[this.valid_cmds.length] = cmd;
  return this;
}

Item.prototype.toString = function(){
	return this.itemname;
}

Item.prototype.changePicName = function(newpicname){
	this.picturename = i(newpicname);
};

People.prototype.addCmdText = function(cmd, text) {
	this.cmd_text[cmd] = text;
  return this;
};

People.prototype.addValidCmd = function(cmd){
	this.valid_cmds[this.valid_cmds.length] = cmd;
  return this;
}

People.prototype.toString = function(){
	return this.itemname;
}

People.prototype.changePicName = function(newpicname){
	this.picturename = "./static/img/" + newpicname;
};
