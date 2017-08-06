/**
 * This is the game script and represent map too
 */
//HOME - required
newRoom('home', "loc_farm.gif")
//  .setStarterMsg()
;
$home.newItem('welcome_letter');
// Initiate Game state 
var state = new GameState($home); // GameState to initialize in game script
var vt;
function start_game(){
  vt=new VTerm(null,'term',null,'follow','./img/');
  var loaded=state.loadCookie('terminuscookie',7*24*60);// delay in minutes;the cookie expire in a week
  if (loaded){
    vt.show_msg(_("game_loaded"));
  } else {
    vt.show_msg(_('gamestart_text'));
  }
  gettext_check();
  vt.start(state.getCurrentRoom());
  console.log("Game loaded");
}
//WESTERN FOREST
newRoom('western_forest', "loc_forest.gif");
$western_forest.newItem('western_forest_academy_direction',"loc_forest.gif");
$western_forest.newItem('western_forest_back_direction',"loc_forest.gif");

//SPELL CASTING ACADEMY
newRoom('spell_casting_academy', "loc_academy.gif")
  .newPeople('academy_student', "item_student.gif");

//PRACTICE ROOM
newRoom('academy_practice', "loc_practiceroom.gif")
	.addCommand("mv")
  .newItem('academy_practice', "item_manuscript.gif");
$academy_practice.newItemBatch('practice_dummy',[1,2,3,4,5], "item_dummy.gif");

//BOX
newRoom('box', "item_box.gif")
	.removeCommand("cd")
	.addCmdText("cd",_('room_box_cd'));

//NORTHERN MEADOW
newRoom('meadow', "loc_meadow.gif")
  .newPeople("poney", "item_fatpony.gif");

//EASTERN MOUNTAINS
newRoom('mountain', "loc_mountains.gif")
  .newPeople('man_sage', "item_mysteryman.gif");
$mountain.newItem('man', "item_manuscript.gif");

//LESSONS
newRoom('lessons',"loc_classroom.gif")
  .newPeople('professor', "item_professor.gif");

//CAVE
newRoom('cave', "loc_cave.gif");

//DARK CORRIDOR
newRoom('dark_corridor', "loc_corridor.gif");

//STAIRCASE
newRoom('staircase', "loc_stair.gif")
  .newItem('dead_end', "item_sign.gif");

//DANK ROOM
newRoom('dank',"loc_darkroom.gif", {
    'mv':function(ct){return (ct.arg == 'Boulder' ? 'mvBoulder' : '');}
}).addCommand("mv")
	.addListener("mvBoulder", function(){
	    state.apply("mvBoulder");
	})
var Boulder=$dank.newItem('boulder','item_boulder.gif');
state.add("mvBoulder",function(re){ 
    link_rooms($dank, $tunnel);
    if (re) {
        $small_hole.addItem(Boulder);
        $dank.removeItem(_("item_boulder"));
    }
});
//SMALL HOLE
newRoom('small_hole', "none.gif")
	.addCmdText("cd", _('room_small_hole_cd'));

//TUNNEL
newRoom('tunnel',"loc_tunnel.gif")
  .newPeople('rat',"item_rat.gif");

//STONE CHAMBER
newRoom('stone_chamber',"loc_portalroom.gif");

//PORTAL (to bring you to the next level
newRoom('portal',"item_portal.gif");
//---------------END LEVEL 1-----------------


//---------------LEVEL 2---------------------
//TOWN SQUARE
newRoom("townsquare", "loc_square.gif");
$townsquare.newPeople('citizen1',"item_citizen1.gif");
$townsquare.newPeople('citizen2',"item_citizen2.gif");
$townsquare.newPeople('citizen3',"item_lady.gif");

//MARKETPLACE
newRoom('market',"loc_market.gif")
	.addCommand('rm')
	.addCommand('mv')
;
$market.newPeople("vendor", "item_merchant.gif")
    .addCmdText("rm", _('people_vendor_rm'));
$market.newItem("backpack","item_backpack.gif")
    .addCmdText("mv", _('item_backpack_stolen'));
$market.newItem("rm_spell","item_manuscript.gif");
$market.newItem("mkdir_spell","item_manuscript.gif");

//LIBRARY
newRoom("library", "loc_library.gif", {
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
	    $library.removeItem(_('item_vimbook'));
	});
$library.newItem('radspellbook',"item_radspellbook.gif");
$library.newItem('romancebook',"item_romancenovel.gif");
$library.newItem('historybook',"item_historybook.gif");
$library.newItem('nostalgicbook',"item_historybook.gif");
$library.newItem('vimbook',"item_historybook.gif");
$library.newItem("lever", "item_lever.gif");
state.add("pullLever", function(re){
    link_rooms($library, $backroom);
});

//BACK ROOM
newRoom('backroom',"loc_backroom.gif")
	.addCommand("grep");
$backroom.newItem("grep", "grep.gif");
$backroom.newItem("practicebook");
$backroom.newPeople("librarian", "item_librarian.gif");

//ROCKY PATH
newRoom("rockypath", "loc_rockypath.gif",
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
    link_rooms($rockypath, Farm);
    if (re) $rockypath.removeItem(_("item_largeboulder"));
});

$rockypath.newItem("largeboulder", "item_boulder.gif")
	.addCmdText("rm", _('item_largeboulder_rm'))
	.addValidCmd("rm");

//ARTISAN'S SHOP
newRoom("artisanshop", "loc_artisanshop.gif",{
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
    $artisanshop.addCommand("cp");
    if (re) $artisanshop.addItem(new Item("Gear", _('item_gear_text'),"item_gear.gif"));
    else $artisanshop.getItemFromName("Gear").changePic("item_gear.gif");
});
state.add("FiveGearsCopied",function(re){
    Artisan.addCmdText("less", _('item_gear_artisans_ok'));
    if (re){
	$artisanshop.newItemBatch("gear",['1','2','3','4','5']);
    }
});
$artisanshop.newItem("strangetrinket", "item_trinket.gif")
	.addCmdText("rm", _('item_strangetrinket_rm'))
	.addCmdText("mv", _('item_strangetrinket_mv'));
$artisanshop.newItem("dragon", "item_clockdragon.gif")
	.addCmdText("rm", _('item_dragon_rm'))  
	.addCmdText("mv", _('item_dragon_mv')); 
var Artisan=$artisanshop.newPeople("artisan", "item_artisan.gif");

//FARM
newRoom("farm", "loc_farm.gif",{
  cp:function(ct){
    if (ct.args[0] === "EarOfCorn" && ct.args[1] === "AnotherEarOfCorn"){
      return "CornCopied";
    }
  }
}).addCommand("cp")
  .addListener("CornCopied", function(){
    state.apply("CornCopied");
  })
  .newItem("earofcorn", "item_corn.gif")
  .addCmdText("rm",_('item_earofcorn_rm'));

state.add("CornCopied",function(re){
    Farmer.addCmdText("less", _('corn_farmer_ok'));
    if (re) $farm.addNewItem('another_earofcorn');
});
var Farmer=$farm.newPeople('farmer',"item_farmer.gif");

//CLEARING
newRoom("clearing", "loc_clearing.gif", {
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
    if (re) $clearing.addChild(newRoom('house'));
    $clearing.getChildFromName(_('room_house'))
	.addCmdText("cd", _('room_house_cd') )
	.addCmdText("ls", _('room_house_ls') );
    $clearing.removeCmdText("cd");
    $clearing.changeIntroText(_('room_clearing_text2'));
    CryingMan.addCmdText("less", _('room_clearing_less2'));
});
var CryingMan=$clearing.newPeople('cryingman',"item_man.gif");

//BROKEN BRIDGE
newRoom("brokenbridge", "loc_bridge.gif",{
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
    $clearing.addCommand("cd");
    $clearing.removeCmdText("cd");
    $brokenbridge.removeCmdText("cd");
    $brokenbridge.changeIntroText(_('room_brokenbridge_text2'));
    if (re) $brokenbridge.addNewItem('plank',"item_plank.gif");
    else $brokenbridge.getItemFromName(_('item_plank')).changePic("item_plank.gif");
});

//OMINOUS-LOOKING PATH
newRoom("ominouspath", "loc_path.gif", {
    'rm':function (ct) {
	return (ct.arg == 'ThornyBrambles' ? 'rmBrambles' : '');
    }
})
	.addCommand("rm")
	.addListener("rmBrambles", function(){
	    state.apply("rmBrambles");
	})
  .newItem("brambles", "item_brambles.gif")
    .addCmdText("mv", _('item_brambles_mv'))
    .addCmdText("rm", _('item_brambles_rm'))
    .addValidCmd("rm");
state.add("rmBrambles",function(){
    link_rooms($ominouspath, CaveOfDisgruntledTrolls) ;
    if (re) $ominouspath.removeItem("ThornyBrambles");
});
//SLIDE
newRoom("slide")
	.removeCommand("cd")
	.addCmdText("cd", _('room_slide_cd'));

//KERNEL FILES
newRoom("kernel")
	.addCommand("sudo")
	.addCommand("grep")
	.addCmdText("sudo", _('room_kernel_sudo'))
	.addListener("sudoComplete", function(){
	    state.apply("sudoComplete");
	})
	.addListener("tryEnterSudo", function(){
	    $kernel.addCommand("IHTFP");
	    $kernel.addCmdText("IHTFP", _('room_kernel_IHTFP'));
	});
$kernel.newItem('certificate');
$kernel.newItem("instructions");
state.add("sudoComplete",function(re){
    $kernel.removeCommand("IHTFP");
    $kernel.removeCmdText("IHTFP");
  link_rooms($kernel, $paradise);
    enterRoom($paradise,vt);
});

newRoom("morekernel")
  .newItemBatch("bigfile",['L','M','Q','R','S','T','U','V','W']);

//PARADISE (end game screen)
newRoom("paradise", "loc_theend.gif")
	.addCmdText("ls", _('room_paradise_ls'));

//CAVE
var troll_evt=function(ct){
    return (ct.arg == 'UglyTroll' ? 'openSlide' : '' );
};
newRoom("trollcave", "loc_cave.gif",
				      {'mv':troll_evt,'rm':troll_evt})
	.addCommand("rm")
	.addCommand("mv")
	.addCommand("cp")
	.addListener("openSlide", function(){
	    state.apply("openSlide");
	});

state.add("openSlide",function(re){
    $slide.addCommand("cd");
    $slide.addCmdText("cd", _('room_slide_cd2'));
    if (re) $trollcave.removeItem("UglyTroll");
});
$trollcave.newPeople('troll1', "item_troll1.gif")
    .addValidCmd("rm")
    .addCmdText("rm", _('people_troll11_rm'))
    .addValidCmd("mv")
    .addCmdText("mv", _('people_troll11_mv'))
    .addValidCmd("cp")
    .addCmdText("cp",_('people_troll11_cp'));
$trollcave.newPeople('troll2', "item_troll2.gif")
    .addValidCmd("rm")
    .addCmdText("rm",_('people_troll11_rm'));

$trollcave.newPeople('supertroll', "item_supertroll.gif")
    .addCmdText("rm", _('people_supertroll_rm'))
    .addCmdText("mv", _('people_supertroll_mv'));

//CAGE
newRoom('cage', "item_cage.gif")
  .removeCommand("cd")
  .addCmdText("cd", _('room_cage_cd'))
  .newItem('kidnapped', "item_cagedboy.gif")
  .addCmdText("mv", _('people_kidnapped_mv'));

//Athena cluster
var add_locker_func = function(){
    state.apply("addMagicLocker");
};
state.add("addMagicLocker",function(re){
    link_rooms($home, $magiclocker);
});
newRoom('cluster',  "loc_cluster.gif",
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
	    $cluster.removeCommand("cd");
	})
	.addCommand("tellme")
	.addCommand("add")
  .newItem('workstation', "item_workstation.gif");

//MIT
newRoom("mit" , "loc_MIT.gif")
	.addListener("AthenaComboEntered", function(){
	    state.apply("AthenaComboEntered");
	})
	.addCommand("tellme")
	.addCommand("add")
	.addListener("addMagicLocker", add_locker_func)
	.addListener("tryEnterAthenaCluster", function(){
	    $mit.addCommand("terminus") .addCmdText("terminus", _('room_mit_terminus'));
	    $cluster.removeCommand("ls").addCmdText("ls", _('room_cluster_ls'));
	})
  .newItem("mitletter", "item_manuscript.gif");

state.add("AthenaComboEntered",function(re){
    $cluster.addCommand("ls");
    $cluster.removeCmdText("ls");
    $cluster.addCommand("cd");
    if (!re) enterRoom($cluster,vt);
    $mit.removeCommand("terminus");
    $mit.removeCmdText("terminus");
    $cluster.removeOutsideEvt("cd");
});
//StataCenter
newRoom('stata', "loc_stata.gif")
	.addCommand("tellme")
	.addCommand("add")
	.addListener("addMagicLocker", add_locker_func); 
$stata.newPeople('gradstudent', "item_grad.gif");
$stata.newPeople('assistant', "item_TA.gif");

//Magic locker
newRoom('magiclocker', "item_locker.gif")
  .newItem( 'morecoming', "item_comingsoon.gif");

/**
 * LINKS BETWEEN ROOMS
 * Fulfill parent/child relationships between rooms
 *
 * API: link(parentRoom, childRoom) 
 */
function link_rooms(parentRoom, childRoom){
  if (!(childRoom in parentRoom.children)){parentRoom.addChild(childRoom);}
  if (!(parentRoom in childRoom.parents)){childRoom.addParent(parentRoom);}
}


// LEVEL 1 LINKS
link_rooms($home, $western_forest);
link_rooms($western_forest, $spell_casting_academy);
link_rooms($spell_casting_academy, $academy_practice );
link_rooms($academy_practice, $box);

link_rooms($home, $meadow);
link_rooms($meadow, $mountain);
link_rooms($spell_casting_academy, $lessons);
link_rooms($mountain, $cave);
link_rooms($cave, $dark_corridor);
link_rooms($cave, $staircase);
link_rooms($dark_corridor, $dank);
link_rooms($dank, $small_hole);
link_rooms($tunnel, $stone_chamber);
link_rooms($stone_chamber, $portal);

//level 1 -> level 2
link_rooms($portal, $townsquare);

//LEVEL 2 LINKS
link_rooms($townsquare, $market);
link_rooms($townsquare, $library);
link_rooms($townsquare, $rockypath);
link_rooms($townsquare, $artisanshop);
link_rooms($townsquare, $brokenbridge);
link_rooms($brokenbridge, $clearing);
link_rooms($clearing, $ominouspath);
link_rooms($trollcave, $cage);
link_rooms($slide, $kernel);
link_rooms($trollcave, $slide);
link_rooms($kernel, $morekernel);

//MIT level links
link_rooms($home, $mit);
link_rooms($mit, $stata);
link_rooms($mit, $cluster);
console.log("Game objects : init");
start_game();// make views and interact



/**
 * ROOMS
 * Players can cd between rooms
 *
 * API:
 *
 * ROOM   e.g. $home
 *    newRoom(id, img, evts, outer_evts) set a new room variable named $id
 *     id : non 'room_' part of a key 'room_<id>' in GameDialogs file
 *              GameDialogs file shall contain :
 *               - room_<roomid> :      the name of the room
 *               - room_<roomid>_text : the description of what happening in
 *                                      the room
 *     img : img file in image directory
 *
 *     cmds : hash { <cmd_name>: function(ct) return event name }
 *         ct  is an event context defined as  
 *         {room:<current_room>, args:<arguments_of_the_command>, arg:<current_argument>,  i:<idx_argument>};
 *
 *     outer_cmds : idem but event is fired when refering to (entering in) directory
 *
 *    Return the <Room> object
 *
 *    Note : $home is required , in order to define path '~/', and command 'cd'.
 *
 * ITEM (or PEOPLE) 
 *
 *     <Room>.newItem(id, img)  or <Room>.newPeople(id, img)
 *     id : non 'item_' (or 'people_') part of a key 'item_<id>' in GameDialogs file
 *              GameDialogs file shall contain :
 *               - item_<id>   :      the name of the item
 *              ( - people_<id> :      the name of the person )
 *               - item_<id>_text   : a description
 *              ( - people_<id>_text : a description )
 *     img : img file in image directory
 
 *    Return the <Item> object
 *
 * FIRST PROMPT
 *
 *    If the player start a game or load it from saved state,
 *    you can display a message for the room she/he starts.
 *    Default is the result of 'pwd'.
 *    <Room>.setStarterMsg(<welcome_message>);
 *
 * COMMANDS
 *
 *    Commands are defined in Room class, (and in Item class for item description).
 *    However the access and the results are limited
 *    and controllable given the Room or the Item :
 *
 *    // disallow or allow usage of command
 *    <Room>.removeCommand(<cmd_name>)
 *    <Room>.addCommand(<cmd_name>)
 *    <Item>.addValidCmd(<cmd_name>)
 *
 *    // alter result of the command
 *    <Room>.addCmdText(<cmd_name>,<cmd_result>)
 *    <Item>.addCmdText(<cmd_name>,<cmd_result>)
 *
 */
