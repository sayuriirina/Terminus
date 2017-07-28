/**
 * Objects used to build levels
 */

/**
 * ROOMS
 * Players can cd between rooms
 *
 * API: new Room(roomid, img)
 *     roomid : non 'room_' part of a key 'room_<roomid>' in GameDialogs file
 *              GameDialogs file shall contain :
 *               - room_<roomid> :      the name of the room
 *               - room_<roomid>_text : the description of what happening in
 *                                      the room
 *     img : img file in image directory
 *
 * API: new Iterm(itemid, img)
 *      The logic is identical to new Room API
 */

//HOME
var Home = newRoom('home', "loc_farm.gif");
Home.newItem('welcome_letter');
// Initiate Game state 
var state = new GameState(Home); // GameState to initialize in game script
var vt;
function start_game(){
  gettext_check();
  vt=new VTerm(state.getCurrentRoom(),'term',null,'follow','./img/');
  vt.show_msg(_('item_welcome_letter_text'));
  console.log("Game loaded");
}
//WESTERN FOREST
var WesternForest = newRoom('western_forest', "loc_forest.gif");
WesternForest.newItem('western_forest_academy_direction',"loc_forest.gif");
WesternForest.newItem('western_forest_back_direction',"loc_forest.gif");

//SPELL CASTING ACADEMY
var SpellCastingAcademy = newRoom('spell_casting_academy', "loc_academy.gif");
SpellCastingAcademy.newPeople('academy_student', "item_student.gif");

//PRACTICE ROOM
var PracticeRoom = newRoom('academy_practice', "loc_practiceroom.gif")
	.addCommand("mv");
PracticeRoom.newItem('academy_practice', "item_manuscript.gif");
PracticeRoom.newItemBatch('practice_dummy',[1,2,3,4,5], "item_dummy.gif");

//BOX
var Box = newRoom('box', "item_box.gif")
	.removeCommand("cd")
	.addCmdText("cd",_('room_box_cd'));

//NORTHERN MEADOW
var NorthernMeadow = newRoom('meadow', "loc_meadow.gif");
NorthernMeadow.newPeople("poney", "item_fatpony.gif");

//EASTERN MOUNTAINS
var EasternMountains = newRoom('mountain', "loc_mountains.gif");
EasternMountains.newPeople('man_sage', "item_mysteryman.gif");
EasternMountains.newItem('man', "item_manuscript.gif");

//LESSONS
var Lessons = newRoom('lessons',"loc_classroom.gif");
Lessons.newPeople('professor', "item_professor.gif");

//CAVE
var Cave = newRoom('cave', "loc_cave.gif");

//DARK CORRIDOR
var DarkCorridor = newRoom('dark_corridor', "loc_corridor.gif");

//STAIRCASE
var Staircase = newRoom('staircase', "loc_stair.gif");
Staircase.newItem('dead_end', "item_sign.gif");

//DANK ROOM
var DankRoom = newRoom('dank',"loc_darkroom.gif", {
    'mv':function(ct){return (ct.arg == 'Boulder' ? 'mvBoulder' : '');}
}).addCommand("mv")
	.addListener("mvBoulder", function(){
	    state.apply("mvBoulder");
	});
var Boulder=DankRoom.newItem('boulder','item_boulder.gif');
state.add("mvBoulder",function(re){ 
    link_rooms(DankRoom, Tunnel);
    if (re) {
        SmallHole.addItem(Boulder);
        DankRoom.removeItem(_("item_boulder"));
    }
});
//SMALL HOLE
var SmallHole = newRoom('small_hole', "none.gif")
	.addCmdText("cd", _('room_small_hole_cd'));

//TUNNEL
var Tunnel = newRoom('tunnel',"loc_tunnel.gif");
Tunnel.newPeople('rat',"item_rat.gif");

//STONE CHAMBER
var StoneChamber = newRoom('stone_chamber',"loc_portalroom.gif");

//PORTAL (to bring you to the next level
var Portal = newRoom('portal',"item_portal.gif");
//---------------END LEVEL 1-----------------


//---------------LEVEL 2---------------------
//TOWN SQUARE
var TownSquare = newRoom("townsquare", "loc_square.gif");
TownSquare.newPeople('citizen1',"item_citizen1.gif");
TownSquare.newPeople('citizen2',"item_citizen2.gif");
TownSquare.newPeople('citizen3',"item_lady.gif");

//MARKETPLACE
var Marketplace = newRoom('market',"loc_market.gif")
	.addCommand('rm')
	.addCommand('mv')
;
Marketplace.newPeople("vendor", "item_merchant.gif")
    .addCmdText("rm", _('people_vendor_rm'));
Marketplace.newItem("backpack","item_backpack.gif")
    .addCmdText("mv", _('item_backpack_stolen'));
Marketplace.newItem("rm_spell","item_manuscript.gif");
Marketplace.newItem("mkdir_spell","item_manuscript.gif");

//LIBRARY
var Library = newRoom("library", "loc_library.gif", {
    'less':function(ct){
	return (ct.arg == _('item_lever') ? 'pullLever':
		( ct.arg == _('item_vimbook') ? 'openVim': '')
	       );
    }
})
	.addCommand("grep")
	.addListener("pullLever", function(){
	    state.apply("pullLever");
	})
	.addListener("openVim", function(){
	    Library.removeItem(_('item_vimbook'));
	});
Library.newItem('radspellbook',"item_radspellbook.gif");
Library.newItem('romancebook',"item_romancenovel.gif");
Library.newItem('historybook',"item_historybook.gif");
Library.newItem('nostalgicbook',"item_historybook.gif");
Library.newItem('vimbook',"item_historybook.gif");
Library.newItem("lever", "item_lever.gif");
state.add("pullLever", function(re){
    link_rooms(Library, BackRoom);
});

//BACK ROOM
var BackRoom = newRoom('backroom',"loc_backroom.gif")
	.addCommand("grep");
BackRoom.newItem("grep", "grep.gif");
BackRoom.newItem("practicebook");
BackRoom.newPeople("librarian", "item_librarian.gif");

//ROCKY PATH
var RockyPath = newRoom("rockypath", "loc_rockypath.gif",
			{
			    'rm': function(ct){
				return (ct.arg == _('item_largeboulder') ? 'rmLargeBoulder': '');
			    }
			})
	.addListener("rmLargeBoulder", function(){
	    state.apply("rmLargeBoulder");
	})
	.addCommand("rm");
state.add("rmLargeBoulder",function(re){
    link_rooms(RockyPath, Farm);
    if (re) RockyPath.removeItem(_("item_largeboulder"));
});

var LargeBoulder = RockyPath.newItem("largeboulder", "item_boulder.gif")
	.addCmdText("rm", _('item_largeboulder_rm'))
	.addValidCmd("rm");

//ARTISAN'S SHOP
var ArtisanShop = newRoom("artisanshop", "loc_artisanshop.gif",{
    'touch': function(ct){
	if (ct.arg === _("item_gear")){
	    return "touchGear";
	}
    },
    'cp': function(ct){
	var re=new RegExp(_("item_gear")+"\d");
	if (re.test(ct.arg)){
	    for (var j=1; j<6;j++) {
		if (ct.room.getItemFromName(_("item_gear")+j) == -1){
		    return '';
		}
		return "FiveGearsCopied";
	    }
	}
    },
}).addCommand("touch")
	.addListener("touchGear", function(){ state.apply("touchGear"); })
	.addListener("FiveGearsCopied", function(){ state.apply("FiveGearsCopied"); })
;

state.add("touchGear", function (re){
    Artisan.addCmdText("less", _('item_gear_touch'));
    ArtisanShop.addCommand("cp");
    if (re) ArtisanShop.addItem(new Item("Gear", _('item_gear_text'),"item_gear.gif"));
    else ArtisanShop.getItemFromName("Gear").changePic("item_gear.gif");
});
state.add("FiveGearsCopied",function(re){
    Artisan.addCmdText("less", _('item_gear_artisans_ok'));
    if (re){
	ArtisanShop.newItemBatch("gear",['1','2','3','4','5']);
	//	ArtisanShop.addItem(new Item("rouage1", _('item_gear_text'),"item_gear.gif"));
	//	ArtisanShop.addItem(new Item("rouage2", "Ceci est un rouage","item_gear.gif"));
	//	ArtisanShop.addItem(new Item("rouage3", "Ceci est un rouage","item_gear.gif"));
	//	ArtisanShop.addItem(new Item("rouage4", "Ceci est un rouage","item_gear.gif"));
	//	ArtisanShop.addItem(new Item("rouage5", "Ceci est un rouage","item_gear.gif"));
    }
});
var StrangeTrinket = ArtisanShop.newItem("strangetrinket", "item_trinket.gif")
	.addCmdText("rm", _('item_strangetrinket_rm'))
	.addCmdText("mv", _('item_strangetrinket_mv'));
var ClockworkDragon = ArtisanShop.newItem("dragon", "item_clockdragon.gif")
	.addCmdText("rm", _('item_dragon_rm'))  
	.addCmdText("mv", _('item_dragon_mv')); 
var Artisan=ArtisanShop.newPeople("artisan", "item_artisan.gif");

//FARM
var Farm = newRoom("farm", "loc_farm.gif",{
    cp:function(ct){
	if (ct.args[0] === "EarOfCorn" && ct.args[1] === "AnotherEarOfCorn"){
	    return "CornCopied";
	}
    }
}).addCommand("cp")
	.addListener("CornCopied", function(){
	    state.apply("CornCopied");
	});

state.add("CornCopied",function(re){
    Farmer.addCmdText("less", _('corn_farmer_ok'));
    if (re) Farm.addNewItem('another_earofcorn');
});
Farm.newItem("earofcorn", "item_corn.gif")
    .addCmdText("rm",_('item_earofcorn_rm'));
var Farmer=Farm.newPeople('farmer',"item_farmer.gif");

//CLEARING
var Clearing = newRoom("clearing", "loc_clearing.gif", {
    'mkdir':function(ct){
	return (ct.arg == "House" ? 'HouseMade':'');
    }
})
	.removeCommand("cd")
	.addCmdText("cd", _('room_clearing_cd'))
	.addCommand("mkdir")
	.addListener("HouseMade", function(){
	    state.apply("HouseMade");    
	})
;
state.add("HouseMade",function(re){
    if (re) Clearing.addChild(newRoom('house'));
    Clearing.getChildFromName(_('room_house'))
	.addCmdText("cd", _('room_house_cd') )
	.addCmdText("ls", _('room_house_ls') );
    Clearing.removeCmdText("cd");
    Clearing.changeIntroText(_('room_clearing_text2'));
    CryingMan.addCmdText("less", _('room_clearing_less2'));
});
var CryingMan=Clearing.newPeople('cryingman',"item_man.gif");

//BROKEN BRIDGE
var BrokenBridge = newRoom("brokenbridge", "loc_bridge.gif",{
    'touch':function(ct){
	if (ct.arg === "Plank"){
	    this.ev.fire("touchPlank");
	}
    }
})
	.addCommand("touch")
	.addListener("touchPlank", function(){
	    state.apply("touchPlank");
	});

state.add("touchPlank",function(){
    Clearing.addCommand("cd");
    Clearing.removeCmdText("cd");
    BrokenBridge.removeCmdText("cd");
    BrokenBridge.changeIntroText(_('room_brokenbridge_text2'));
    if (re) BrokenBridge.addNewItem('plank',"item_plank.gif");
    else BrokenBridge.getItemFromName(_('item_plank')).changePic("item_plank.gif");
});

//OMINOUS-LOOKING PATH
var OminousLookingPath = newRoom("ominouspath", "loc_path.gif", {
    'rm':function (ct) {
	return (ct.arg == 'ThornyBrambles' ? 'rmBrambles' : '');
    }
})
	.addCommand("rm")
	.addListener("rmBrambles", function(){
	    state.apply("rmBrambles");
	});
OminousLookingPath.newItem("brambles", "item_brambles.gif")
    .addCmdText("mv", _('item_brambles_mv'))
    .addCmdText("rm", _('item_brambles_rm'))
    .addValidCmd("rm");
state.add("rmBrambles",function(){
    link_rooms(OminousLookingPath, CaveOfDisgruntledTrolls) ;
    if (re) OminousLookingPath.removeItem("ThornyBrambles");
});
//SLIDE
var Slide = newRoom("slide")
	.removeCommand("cd")
	.addCmdText("cd", _('room_slide_cd'));

//KERNEL FILES
var KernelFiles = newRoom("kernel")
	.addCommand("sudo")
	.addCommand("grep")
	.addCmdText("sudo", _('room_kernel_sudo'))
	.addListener("sudoComplete", function(){
	    state.apply("sudoComplete");
	})
	.addListener("tryEnterSudo", function(){
	    KernelFiles.addCommand("IHTFP");
	    KernelFiles.addCmdText("IHTFP", _('room_kernel_IHTFP'));
	});
KernelFiles.newItem('certificate');
KernelFiles.newItem("instructions");
state.add("sudoComplete",function(re){
    KernelFiles.removeCommand("IHTFP");
    KernelFiles.removeCmdText("IHTFP");
    link_rooms(KernelFiles, Paradise);
    enterRoom(Paradise,vt);
});
var MoreKernelFiles = newRoom("morekernel");
MoreKernelFiles.newItemBatch("bigfile",['L','M','Q','R','S','T','U','V','W']);

//PARADISE (end game screen)
var Paradise = newRoom("paradise", "loc_theend.gif")
	.addCmdText("ls", _('room_paradise_ls'));

//CAVE
//Room beforeCave = new Room("CaveOfDisgruntledTrolls", "A patch of thorny brambles is growing at the mouth of the cave, blocking your way.", "loc_cave");
var troll_evt=function(ct){
    return (ct.arg == 'UglyTroll' ? 'openSlide' : '' );
};
var CaveOfDisgruntledTrolls = newRoom("trollcave", "loc_cave.gif",
				      {'mv':troll_evt,'rm':troll_evt})
	.addCommand("rm")
	.addCommand("mv")
	.addCommand("cp")
	.addListener("openSlide", function(){
	    state.apply("openSlide");
	});

state.add("openSlide",function(re){
    Slide.addCommand("cd");
    Slide.addCmdText("cd", _('room_slide_cd2'));
    if (re) CaveOfDisgruntledTrolls.removeItem("UglyTroll");
});
CaveOfDisgruntledTrolls.newPeople('troll1', "item_troll1.gif")
    .addValidCmd("rm")
    .addCmdText("rm", _('people_troll11_rm'))
    .addValidCmd("mv")
    .addCmdText("mv", _('people_troll11_mv'))
    .addValidCmd("cp")
    .addCmdText("cp",_('people_troll11_cp'));
CaveOfDisgruntledTrolls.newPeople('troll2', "item_troll2.gif")
    .addValidCmd("rm")
    .addCmdText("rm",_('people_troll11_rm'));

CaveOfDisgruntledTrolls.newPeople('supertroll', "item_supertroll.gif")
    .addCmdText("rm", _('people_supertroll_rm'))
    .addCmdText("mv", _('people_supertroll_mv'));

//CAGE
var Cage = newRoom('cage', "item_cage.gif")
	.removeCommand("cd")
	.addCmdText("cd", _('room_cage_cd'));
Cage.newItem('kidnapped', "item_cagedboy.gif")
    .addCmdText("mv", _('people_kidnapped_mv'));

//Athena cluster
var add_locker_func = function(){
    state.apply("addMagicLocker");
};
state.add("addMagicLocker",function(re){
    link_rooms(Home, MagicLocker);
});
var AthenaCluster = newRoom('cluster',  "loc_cluster.gif",
			    inside_evts = {
				cd:function(ct){
				    return "AthenaClusterExited";
				}
			    },
			    outside_evts = {
				cd:function(ct){
				    return "tryEnterAthenaCluster";
				}
			    })
	.removeCommand("ls")
	.addCmdText("ls",_('room_cluster_ls'))
	.removeCommand("cd")
	.addCmdText("cd",_('room_cluster_cd'))
	.addListener("addMagicLocker", add_locker_func)
	.addListener("AthenaClusterExited", function(){
	    AthenaCluster.removeCommand("cd");
	})
	.addCommand("tellme")
	.addCommand("add");

AthenaCluster.newItem('workstation', "item_workstation.gif");
//MIT
var MIT = newRoom("mit" , "loc_MIT.gif")
	.addListener("AthenaComboEntered", function(){
	    state.apply("AthenaComboEntered");
	})
	.addCommand("tellme")
	.addCommand("add")
	.addListener("addMagicLocker", add_locker_func)
	.addListener("tryEnterAthenaCluster", function(){
	    MIT.addCommand("terminus") .addCmdText("terminus", _('room_mit_terminus'));
	    AthenaCluster.removeCommand("ls").addCmdText("ls", _('room_cluster_ls'));
	});
MIT.newItem("mitletter", "item_manuscript.gif");

state.add("AthenaComboEntered",function(re){
    AthenaCluster.addCommand("ls");
    AthenaCluster.removeCmdText("ls");
    AthenaCluster.addCommand("cd");
    // AthenaCluster.addCmdText("cd", "You have correctly entered the cluster combo. You may enter.");
    enterRoom(AthenaCluster,vt);
    MIT.removeCommand("terminus");
    MIT.removeCmdText("terminus");
});
//StataCenter
var StataCenter = newRoom('stata', "loc_stata.gif")
	.addCommand("tellme")
	.addCommand("add")
	.addListener("addMagicLocker", add_locker_func); 
StataCenter.newPeople('gradstudent', "item_grad.gif");
StataCenter.newPeople('assistant', "item_TA.gif");

//Magic locker
var MagicLocker = newRoom('magiclocker', "item_locker.gif");
MagicLocker.newItem( 'morecoming', "item_comingsoon.gif");

/**
 * LINKS BETWEEN ROOMS
 * Fulfill parent/child relationships between rooms
 *
 * API: link(parentRoom, childRoom) 
 */
function link_rooms(parentRoom, childRoom){if (!(childRoom in parentRoom.children)){parentRoom.addChild(childRoom);}if (!(parentRoom in childRoom.parents)){childRoom.addParent(parentRoom);}}


// LEVEL 1 LINKS
link_rooms(Home, WesternForest);
link_rooms(WesternForest, SpellCastingAcademy);
link_rooms(SpellCastingAcademy, PracticeRoom);
link_rooms(PracticeRoom, Box);
link_rooms(Home, NorthernMeadow);
link_rooms(NorthernMeadow, EasternMountains);
link_rooms(SpellCastingAcademy, Lessons);
link_rooms(EasternMountains, Cave);
link_rooms(Cave, DarkCorridor);
link_rooms(Cave, Staircase);
link_rooms(DarkCorridor, DankRoom);
link_rooms(DankRoom, SmallHole);
link_rooms(Tunnel, StoneChamber);
link_rooms(StoneChamber, Portal);

//level 1 -> level 2
link_rooms(Portal, TownSquare);

//LEVEL 2 LINKS
link_rooms(TownSquare, Marketplace);
link_rooms(TownSquare, Library);
link_rooms(TownSquare, RockyPath);
link_rooms(TownSquare, ArtisanShop);
link_rooms(TownSquare, BrokenBridge);
//link(library, backRoom); 
// link_rooms(RockyPath, Farm);
link_rooms(BrokenBridge, Clearing);
link_rooms(Clearing, OminousLookingPath);
// link_rooms(OminousLookingPath, CaveOfDisgruntledTrolls) ;
link_rooms(CaveOfDisgruntledTrolls, Cage);
link_rooms(Slide, KernelFiles);
link_rooms(CaveOfDisgruntledTrolls, Slide);
link_rooms(KernelFiles, MoreKernelFiles);

//MIT level links
link_rooms(Home, MIT);
link_rooms(MIT, StataCenter);
link_rooms(MIT, AthenaCluster);
console.log("Game objects : init");
start_game();// make views and interact
