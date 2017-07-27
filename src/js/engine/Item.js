function Item(name, intro, picname){
	this.itemname = name;
  this.picture = picname ? new Pic(picname) : img.item_none;
  this.cmd_text = {less: intro ? intro : _('item_none_text')};
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

Item.prototype.changePic = function(newpicname){
	this.picture = new Pic(newpicname);
};

// Useless : just used for making distinction between living being and non-living things
// Does people are items ?
function People(name, intro, picname,alt,title){
	this.itemname = name;
  this.picture = picname ? new Pic(picname) : img.people_none;
  this.cmd_text = {less: intro ? intro : _('people_none_text')};
	this.valid_cmds = ["less"];
}
People.prototype.addCmdText = Item.prototype.addCmdText;
People.prototype.addValidCmd = Item.prototype.addValidCmd;
People.prototype.toString = Item.prototype.toString;
People.prototype.changePic = Item.prototype.changePic;
