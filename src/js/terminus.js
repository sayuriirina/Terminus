/**
 * This is the game script and represent map too
 */
var ldr=1; function app_loaded(){
  if (ldr==0 && snd.isloaded()){
    start_game();// make views and interact
  }
}
var snd=new SoundBank(app_loaded);
var music=new Music(snd);
/// sound set
// The sounds in vterm are : choicemove choicemove question exclm endoftext dot learned space ret tag virg char
snd.set('choicemove','./snd/sfx_movement_ladder5a.',['wav']);
snd.set('choiceselect','./snd/sfx_movement_ladder2a.',['wav']);
snd.set('tag','./snd/sfx_movement_ladder2a.',['wav']);
snd.set('learned','./snd/sfx_sounds_powerup4.',['wav']);
// music set
//music.set('yourduty','./music/enterTheHero.',['mp3']);

// global_commands are player commands allowed, this is the base knowledge
// that will be improved with events
// it aims to force the player to explore the world to learn the commands
//
var global_commands=["cd", "ls", "less", "pwd"];
//$home - required
newRoom('home', "loc_farm.gif") ;
$home.newItem('welcome_letter');

// Initiate Game state - required to be called 'state'
var state = new GameState($home); // GameState to initialize in game script
var vt;
function start_game(){
  vt=new VTerm('term','./img/');
  vt.soundbank=snd; 
  vt.charduration=10; 
  vt.disable_input();
  vt.epic_img_enter(new Pic('titlescreen.gif'),'epicfromright',2000);
  var game_start=function(use_cookies){
    var loaded=false;
    gettext_check();
    if(use_cookies==0){
      loaded=state.loadCookie('terminuscookie',7*24*60);// delay in minutes;the cookie expire in a week
    }
    vt.monitor.innerHTML="";//clear screen
    vt.setContext(state.getCurrentRoom());
    if (loaded){
      vt.show_msg(_("game_loaded") + "\n\n" + vt.context.getStarterMsg());
      vt.enable_input();
    } else {
      vt.show_msg(_('gamestart_text'));
      setTimeout(function(){vt.enable_input();},6000);
    }
  }
  setTimeout(function(){
    vt.ask_choose(_('cookie'), [_('yes'),_('no')],game_start);
  },2000);
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
man_sage=newRoom('mountain', "loc_mountains.gif")
  .newPeople('man_sage', "item_mysteryman.gif");
man_sage.addCmdEvent('less','manLeave')
  .addStates({
    manLeave: function(re){
      global_commands.push('exit');
      global_commands.push('man');
      global_commands.push('help');
      vt.playSound('learned');
      man_sage.disappear();
      $mountain.newItem('man', "item_manuscript.gif")
      .addCmdEvent('less','trueStart')
      .addStates({
        trueStart:function (re){
          music.play('yourduty',{loop:true});
        }
      });
    }
  })
;

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
newRoom('dank',"loc_darkroom.gif").addCommand("mv")
  .newItem('boulder','item_boulder.gif').addValidCmd('mv')
  .addCmdEvent('mv','mvBoulder')
  .addStates({
    mvBoulder: function(re){
      $dank.addPath($tunnel);
      if (re) {
        $dank.getItem('boulder').moveTo($small_hole);
      }
    }
  })
;

//SMALL HOLE
newRoom('small_hole')
  .addCmdText("cd", _('room_small_hole_cd'));

//TUNNEL
var rat=newRoom('tunnel',"loc_tunnel.gif")
  .newPeople('rat',"item_rat.gif")
  .addCmdEvent('less','idRat')
  .addStates({
    idRat: function(re){
      rat.name=_('people_rat_identified');
    }
  });

//STONE CHAMBER
newRoom('stone_chamber',"loc_portalroom.gif");

//PORTAL (to bring you to the next level
newRoom('portal',"item_portal.gif");
//---------------END LEVEL 1-----------------


//---------------LEVEL 2---------------------
//TOWN SQUARE
newRoom("townsquare", "loc_square.gif");
$townsquare.setEnterCallback(function(){
  music.play('chapter2',{loop:true});

});
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
  .addValidCmd('mv')
//  .addCmdText("mv", _('item_backpack_stolen'));
  .addCmdEvent("mv", function(ct){
    vt.show_msg(_('item_backpack_stolen'));
  });

$market.newItem("rm_spell","item_manuscript.gif").addCmdEvent('less','rm').addStates({
  rm:function(re){global_commands.push('rm');vt.playSound('learned');}
});

$market.newItem("mkdir_spell","item_manuscript.gif").addCmdEvent('less','mkdir').addStates({
  mkdir:function(re){global_commands.push('mkdir');vt.playSound('learned');}
});

//LIBRARY
newRoom("library", "loc_library.gif")
  .addCommand("grep");
$library.newItem('radspellbook',"item_radspellbook.gif");
$library.newItem('romancebook',"item_romancenovel.gif");
$library.newItem('historybook',"item_historybook.gif");
$library.newItem('nostalgicbook',"item_historybook.gif");
vimbook=$library.newItem('vimbook',"item_historybook.gif")
  .addCmdEvent('less','openVim')
  .addListener("openVim", function(){
    vt.flash(1600,1000);
    vt.rmCurrentImg(2650);
    vimbook.disappear();
  });
lever=$library.newItem("lever", "item_lever.gif")
  .addCmdEvent('less','pullLever')
  .addStates({
    pullLever:function(re){
      $library.addPath($backroom);
      lever.disappear();
    }
  })
  ;

//BACK ROOM
newRoom('backroom',"loc_backroom.gif")
  .addCommand("grep");

$backroom.newPeople("grep", "grep.gif")
  .addCmdEvent('less','grep')
  .addStates({
    grep:function(re){
      global_commands.push('grep');
     vt.playSound('learned');
    }
  })
  ;

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
  $rockypath.addPath($farm);
  if (re) $rockypath.removeItem('largeboulder');
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
    var re=new RegExp(_('item_gear')+"\\d");
    console.log('five ?');
    if (re.test(ct.arg)){
      for (var j=1; j<6;j++) {
        if (!ct.room.getItemFromName(_('item_gear',[j]))){
          return '';
        }
      }
      return "FiveGearsCopied";
    }
  },
}).addCommand("touch")
  .addStates({
    'touchGear': function (re){
      Artisan.addCmdText("less", _('item_gear_touch'));
      $artisanshop.addCommand("cp");
      if (re) $artisanshop.newItem('gear',"item_gear.gif");
      else $artisanshop.getItem('gear').changePic("item_gear.gif");
    },
    "FiveGearsCopied": function(re){
      Artisan.addCmdText("less", _('item_gear_artisans_ok'));
      if (re){
        $artisanshop.newItemBatch("gear",['1','2','3','4','5']);
      }
    }
  })
;

$artisanshop.newItem("strangetrinket", "item_trinket.gif")
  .addCmdText("rm", _('item_strangetrinket_rm'))
  .addCmdText("mv", _('item_strangetrinket_mv'));
$artisanshop.newItem("dragon", "item_clockdragon.gif")
  .addCmdText("rm", _('item_dragon_rm'))  
  .addCmdText("mv", _('item_dragon_mv')); 
var Artisan=$artisanshop.newPeople("artisan", "item_artisan.gif")
  .addCmdEvent('less', 'touch' )
  .addStates({
    'touch': function(re){
      global_commands.push('touch');
      vt.playSound('learned');
      Artisan.removeCmdEvent('less');
    }
  })
  ;

//FARM
newRoom("farm", "loc_farm.gif",{
  cp:function(ct){
    if (ct.args[0] === _("item_earofcorn") && ct.args[1] === _("item_another_earofcorn")){
      return "CornCopied";
    }
  }
}).addCommand("cp")
  .addStates({
    CornCopied:function(re){
      Farmer.addCmdText("less", _('corn_farmer_ok'));
      if (re) $farm.newItem('another_earofcorn');
    }
  })
  .newItem("earofcorn", "item_corn.gif")
  .addCmdText("rm",_('item_earofcorn_rm'));

var Farmer=$farm.newPeople('farmer',"item_farmer.gif");

//CLEARING
newRoom("clearing", "loc_clearing.gif", {
  'mkdir':function(ct){
    return (ct.arg == _('room_house') ? 'HouseMade':'');
  }
})
  .removeCommand("cd")
  .addCmdText("cd", _('room_clearing_cd'))
  .addCommand("mkdir")
  .addStates({
    HouseMade: function(re){
      if (re) { $clearing.leadsTo(newRoom('house')); }
      $clearing.getChildFromName(_('room_house'))
        .addCmdText("cd", _('room_house_cd') )
        .addCmdText("ls", _('room_house_ls') );
      $clearing.removeCmdText("cd");
      $clearing.setIntroText(_('room_clearing_text2'));
      CryingMan.addCmdText("less", _('room_clearing_less2'));
    }
  })
;
var CryingMan=$clearing.newPeople('cryingman',"item_man.gif");

//BROKEN BRIDGE
newRoom("brokenbridge", "loc_bridge.gif",{
  touch:function(ct){return (ct.arg === _("item_plank")) ? "touchPlank" : "";}
})
  .addCommand("touch")
  .addStates({
    touchPlank: function(re){
      $clearing.addCommand("cd");
      $clearing.removeCmdText("cd");
      $brokenbridge.removeCmdText("cd");
      $brokenbridge.setIntroText(_('room_brokenbridge_text2'));
      if (re) $brokenbridge.newItem('plank',"item_plank.gif");
      else $brokenbridge.getItem('plank').changePic("item_plank.gif");
    }
  });

//OMINOUS-LOOKING PATH
newRoom("ominouspath", "loc_path.gif", {
  'rm':function (ct) {
    return (ct.arg == _('item_brambles') ? 'rmBrambles' : '');
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
state.add("rmBrambles",function(re){
  $ominouspath.addPath($trollcave) ;
  if (re) $ominouspath.removeItem('brambles');
});
//SLIDE
newRoom("slide")
  .removeCommand("cd")
  .addCmdText("cd", _('room_slide_cd'));

//KERNEL FILES
newRoom("kernel")
  .addCommand("sudo",{question:undefined,password:"IHTFP"})
  .addCommand("grep")
  .addCmdText("sudo", _('room_kernel_sudo'))
  .addStates({
    sudoComplete : function(re){
      $kernel.addPath($paradise);
    }
  });
$kernel.newItem('certificate');
$kernel.newItem("instructions")
  .addCmdEvent('less','sudo')
  .addStates({
    sudo : function(re){
      global_commands.push('sudo');
      vt.playSound('learned');
    }
  });

newRoom("morekernel")
  .addCommand("grep")
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
  if (re) $trollcave.removePeople('troll1');
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
state.add("freeKid",function(re){
  Kid.moveTo($clearing);
});
newRoom('cage', "item_cage.gif")
  .removeCommand("cd")
  .addCmdText("cd", _('room_cage_cd'));
var Kid=$cage.newPeople('kidnapped', "item_cagedboy.gif")
  .addValidCmd("mv")
  .addCmdText("mv", _('people_kidnapped_mv'))
  .addCmdEvent("mv",function(ct){ return 'freekid'; })
  .addListener("freekid",function(){
    state.apply('freeKid');
  });

//Athena cluster
var add_locker_func = function(){
  state.apply("addMagicLocker");
};
// LEVEL 1 LINKS
$home                  . addPath($western_forest);
$western_forest        . addPath($spell_casting_academy);
$spell_casting_academy . addPath($academy_practice );
$academy_practice      . addPath($box);

$home                  . addPath($meadow);
$meadow                . addPath($mountain);
$spell_casting_academy . addPath($lessons);
$mountain              . addPath($cave);
$cave                  . addPath($dark_corridor);
$cave                  . addPath($staircase);
$dark_corridor         . addPath($dank);
$dank                  . addPath($small_hole);
$tunnel                . addPath($stone_chamber);
$stone_chamber         . addPath($portal);

//level 1 -> level 2
$portal                . addPath($townsquare);

//LEVEL 2 LINKS
$townsquare            . addPath($market);
$townsquare            . addPath($library);
$townsquare            . addPath($rockypath);
$townsquare            . addPath($artisanshop);
$townsquare            . addPath($brokenbridge);
$brokenbridge          . addPath($clearing);
$clearing              . addPath($ominouspath);
$trollcave             . addPath($cage);
$slide                 . addPath($kernel);
$trollcave             . addPath($slide);
$kernel                . addPath($morekernel);

console.log("Game objects : init");
ldr--;
app_loaded();

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
 * CONNECT ROOMS
 *
 *    <Room>.addPath(<Room>)
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
