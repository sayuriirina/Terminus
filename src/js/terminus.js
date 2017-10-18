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
snd.set('char','./snd/sfx_movement_ladder2a.',['wav']);
snd.set('grl','./snd/sfx_menu_move4.',['wav']);
snd.set('portal','./snd/sfx_movement_portal6.',['wav']);
snd.set('learned','./snd/sfx_sounds_fanfare3.',['wav']);
snd.set('unlocked','./snd/sfx_sounds_fanfare3.',['wav']);
music.set('chapter2','./music/slowdrum-cave.',['wav']);
// music set
music.set('yourduty','./music/enterTheHero.',['mp3']);
music.set('trl','./music/trolls-beatdown-05l.',['wav']);

music.play('trl',{loop:true});
SAFE_BROKEN_TEXT=true;

// global_commands are the commands the player is allowed to use
//var global_commands=["cd", "ls", "less", "pwd"];
var global_commands=[];
function learn(vt, cmds,re){
  if (typeof cmds == 'string'){
    cmds=[cmds];
  }
  for (var j=0; j<cmds.length;j++) {
    global_commands.push(cmds[j]);
    if (!re){
      vt.badge(cmds[j],_('you_learn',[cmds[j]]));
    }
  }
  if (!re) {
    console.log('learned');
    vt.playSound('learned'); 
  }
}
function unlock(vt, unlocked,re){
  if (!re) {
    vt.playSound('unlocked'); 
  }

}

// Initiate Game state - required to be called 'state'
var state = new GameState(); // GameState to initialize in game script
var vt;
//$home - required
newRoom('home', "loc_farm.gif") ;
function start_game(){
  vt=new VTerm('term','./img/');
  vt.soundbank=snd; 
  vt.charduration=20; 
  vt.charfactor[' ']=25;//on each nbsp , it will take 1/2 second
  vt.disable_input();
  vt.epic_img_enter('titlescreen.gif','epicfromright',2000);
  //default room
  state.setCurrentRoom($home);
  var game_start=function(vt, use_cookies){
    var loaded=false;
    if (pogencnt>0){ evt.show_msg(_('pogen_alert',pogencnt)); }
    if(use_cookies==0){
      loaded=state.loadCookie('terminuscookie',7*24*60);// delay in minutes;the cookie expire in a week
    }
    vt.clear();
    vt.setContext(state.getCurrentRoom());
    if (loaded){
//      vt.show_msg(_("game_loaded") + "\n\n" + vt.context.getStarterMsg());
      vt.notification(_("game_loaded"));
      vt.show_msg( vt.context.getStarterMsg());
      vt.enable_input();
    } else {
      vt.show_msg(_('gamestart_text'));
      vt.enable_input();
//      setTimeout(function(){vt.enable_input();},6000);
    }
  };
  setTimeout(function(){
    vt.ask_choose(_('cookie'), [_('yes'),_('no')],game_start);
  },2000);
}
// home
shelly=$home.newPeople('shell')
  .setTextIdx(0)
  .addCmdEvent('less_done','add_ls')
  .addStates({
    add_ls:function(re){
      shelly.removeCmdEvent('less_done');
      learn(vt,['ls','cd'],re);
      shelly.setTextIdx('');
      state.saveCookie();
    }
  })
  ;
$home.addCmdEvent('poe_cmd_not_found','poe_mode')
//  .addCmdEvent('cmd_not_found','first_interraction')
  .addCmdEvent('cmd_not_found_done','add_cat')
  .addCmdEvent('destination_invalid','destination_invalid')
  .addStates({
    poe_mode: function(re){
      vt.show_msg(_('cmd_poe_revealed'),undefined,false);
      learn(vt,['poe','pogen'],re);
    },
//    first_interraction:function(re){
//      $home.removeCmdEvent('cmd_not_found');
//    },
    add_cat:function(re){
      if (re){
          learn(vt,['cat'],re);
      } else {
      setTimeout(function(){
      vt.push_img('intruder.png'); // Display image of room
      vt.show_msg(_('cmd_cat_revealed'));
      
      $home.removeCmdEvent('cmd_not_found_done');
        setTimeout(function(){ 
          vt.show_img();
          learn(vt,['cat'],re);
          state.saveCookie();
        },1300);
      },1000);
      }
    },
    destination_invalid:function(re){
      if (!re){
      setTimeout(function(){
        vt.show_msg(_('cmd_cat_first_try'));
      },1000);
      }
    }
  });
//WESTERN FOREST
newRoom('western_forest', "loc_forest.gif");
$western_forest.newItem('western_forest_academy_direction',"loc_forest.gif");
$western_forest.newItem('western_forest_back_direction',"loc_forest.gif");


//SPELL CASTING ACADEMY
newRoom('spell_casting_academy', "loc_academy.gif");
//  .newPeople('academy_student', "item_student.gif");

//PRACTICE ROOM
newRoom('academy_practice', "loc_practiceroom.gif")
  .addCommand("mv");
//  .newItem('academy_practice', "item_manuscript.gif")
$academy_practice.newItemBatch('practice_dummy',[1,2,3], "item_dummy.gif")
  .map(function(i){
    i.addValidCmd('mv');
  }
  );

//BOX
newRoom('box', "item_box.gif")
  .removeCommand("cd")
  .setCmdText("cd",_('room_box_cd'));

//NORTHERN MEADOW
newRoom('meadow', "loc_meadow.gif")
  .newPeople("poney", "item_fatpony.gif")
  .addCmdEvent('less_done','add_mountain')
  .addState('add_mountain',function(re){
    
    $meadow                . addPath($mountain);
    unlock($mountain.room_name);
  });

//EASTERN MOUNTAINS
man_sage=newRoom('mountain', "loc_mountains.gif")
  .newPeople('man_sage', "item_mysteryman.gif");
man_sage.addCmdEvent('less_done','manLeave')
  .addStates({
    manLeave: function(re){
      learn(vt, ['exit'], re);
      man_sage.disappear();
      man=$mountain.newItem('man', "item_manuscript.gif")
      .addCmdEvent('less_done','trueStart')
      .addStates({
        trueStart:function (re){
          man.removeCmdEvent('less_done');
          music.play('yourduty',{loop:true});
          learn(vt, ['man', 'help'], re);
        }
      });
    }
  })
;

//LESSONS
newRoom('lessons',"loc_classroom.gif")
  .newPeople('professor', "item_professor.gif")
  .addCmdEvent('less_done','learn_mv')
  .addState('learn_mv',function(re){
      learn(vt,'mv',re);
  });

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
  .setCmdText("cd", _('room_small_hole_cd'));

//TUNNEL
var rat=newRoom('tunnel',"loc_tunnel.gif")
  .newPeople('rat',"item_rat.gif")
  .addCmdEvent('less','idRat')
  .addStates({
    idRat: function(re){
      rat.setPoDelta('_identified');
    }
  });

//STONE CHAMBER
newRoom('stone_chamber',"loc_portalroom.gif");

//PORTAL ring you to the next level
newRoom('portal',"item_portal.gif")
  .setEnterCallback(function(){
  vt.playSound('portal');
  music.play('chapter1');
});
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
var disabled_sell_choices=[];
newRoom('market',"loc_market.gif")
  .addCommand('rm')
  .addCommand('mv')
  .addCommand('touch');

function buy_to_vendor(vt, choice){
  if (choice==0) {
    if ($market.hasItem('mkdir_cost')){
      $market.removeItem('mkdir_cost');
      $market.ev.fire('mkdirSold');
      return _('you_buy',[_('item_mkdir_spell')]);
    } else {
      return _('need_money',[_('item_rm_spell')]);
    }
  } else if (choice==1) {
    if ($market.hasItem('rm_cost')){
      $market.removeItem('rm_cost');
      $market.ev.fire('rmSold');
      return _('you_buy',[_('item_rm_spell')]);
    } else {
      return _('need_money',[_('rm_cost')]);
    }
  }
}
vendor=$market.newPeople("vendor", "item_merchant.gif")
  .setCmdText("less","")
  .addCmdEvent("less",function(){
    vt.show_img();
    vt.ask_choose(_('people_vendor_text'), [_('people_vendor_sell_mkdir'),_('people_vendor_sell_rm'),_('people_vendor_sell_nothing')],buy_to_vendor, disabled_sell_choices);
  })
  ;

var backpack=$market.newItem("backpack","item_backpack.gif")
  .addValidCmd('mv')
  .addValidCmd('less')
  .addCmdEvent("mv", function(ct){
    vt.show_msg(_('item_backpack_stolen'));
    backpack.removeCmdEvent("mv");
  })
  .addCmdEvent("less", function(ct){$market.ev.fire('unzipUnlocked');})
  ;

$market.addStates({
  unzipUnlocked:function(re){
    backpack.addValidCmd('unzip');
    learn(vt, 'unzip', re);
    backpack.removeCmdEvent("less");
    backpack.setPoDelta(['.zip']);
    backpack.addCmdEvent('unzip',function(ct){
      unzipped=[];
      unzipped.push(ct.room.newItem('rm_cost'));
      unzipped.push(ct.room.newItem('mkdir_cost'));
      backpack.setPoDelta([]);
      backpack.removeCmdEvent('unzip');
      vt.show_msg(_('unzipped',[_('item_backpack'), unzipped.join(", ")]),undefined,false);
    });
  },
  rmSold:function(re){
    learn(vt,'rm',re);
    $market.removeItem('rm_spell');
    disabled_sell_choices.push(1);
    vendor.setCmdText("rm", _('people_vendor_rm'));
  },
  mkdirSold:function(re){
    disabled_sell_choices.push(0);
    $market.removeItem('mkdir_spell');
    learn(vt,'mkdir',re);
  }
})
;
//function(ct){
//    backpack.addValidCmd('unzip');
//    global_commands.push('unzip');
//    backpack.removeCmdEvent("less");
//    backpack.setPoDelta(['.zip']);
//    backpack.addCmdEvent('unzip','unzip');
//  })
$market.newItem("rm_spell","item_manuscript.gif");
$market.newItem("mkdir_spell","item_manuscript.gif");

//LIBRARY
newRoom("library", "loc_library.gif")
  .addCommand("grep");
$library.newItem('radspellbook',"item_radspellbook.gif");
$library.newItem('romancebook',"item_romancenovel.gif");
$library.newItem('historybook',"item_historybook.gif");
$library.newItem('nostalgicbook',"item_historybook.gif");
vimbook=$library.newItem('vimbook',"item_vimbook.jpg")
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
      learn(vt,'grep',re);
    }
  })
  ;

$backroom.newPeople("librarian", "item_librarian.gif");

//ROCKY PATH
newRoom("rockypath", "loc_rockypath.gif")
  .newItem("largeboulder", "item_boulder.gif")
  .setCmdText("rm", _('item_largeboulder_rm'))
  .addValidCmd("rm")
  .addStates({
    rmLargeBoulder: function(re){
      $rockypath.addPath($farm);
      if (re) {
        if (re) $rockypath.removeItem('largeboulder');
      }
    }
  });

//ARTISAN'S SHOP
newRoom("artisanshop", "loc_artisanshop.gif")
  .addCmdEvents({
    touch:function(ct){
      if (ct.arg === _("item_gear")){
        return "touchGear";
      }
    },
    cp:function(ct){
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
    }
  },true)
  .addStates({
    'touchGear': function (re){
      Artisan.setCmdText("less", _('item_gear_touch'));
      $artisanshop.addCommand("cp");
      learn(vt,'cp',re);
      if (re) $artisanshop.newItem('gear',"item_gear.gif");
      else $artisanshop.getItem('gear').setPic("item_gear.gif");
    },
    "FiveGearsCopied": function(re){
      Artisan.setCmdText("less", _('item_gear_artisans_ok'));
      if (re){
        $artisanshop.newItemBatch("gear",['1','2','3','4','5']);
      }
    }
  })
;

$artisanshop.newItem("strangetrinket", "item_trinket.gif")
  .setCmdText("rm", _('item_strangetrinket_rm'))
  .setCmdText("mv", _('item_strangetrinket_mv'));
$artisanshop.newItem("dragon", "item_clockdragon.gif")
  .setCmdText("rm", _('item_dragon_rm'))  
  .setCmdText("mv", _('item_dragon_mv')); 
var Artisan=$artisanshop.newPeople("artisan", "item_artisan.gif")
  .addCmdEvent('less_done', 'touch' )
  .addStates({
    'touch': function(re){
      learn(vt,'touch',re);
      Artisan.removeCmdEvent('less_done');
    }
  })
  ;

//FARM
newRoom("farm", "loc_farm.gif")
  .addCommand("cp")
  .newItem("earofcorn", "item_corn.gif")
  .setCmdText("rm",_('item_earofcorn_rm'))
  .addCmdEvent('cp','CornCopied')
  .addStates({
    CornCopied:function(re){
      Farmer.setCmdText("less", _('corn_farmer_ok'));
      if (re) $farm.newItem('another_earofcorn');
    }
  });

var Farmer=$farm.newPeople('farmer',"item_farmer.gif");

//CLEARING
newRoom("clearing", "loc_clearing.gif")
  .addCmdEvent('mkdir',function(ct){
    return (ct.arg == _('room_house') ? 'HouseMade':'');
  })
  .removeCommand("cd")
  .setCmdText("cd", _('room_clearing_cd'))
  .addCommand("mkdir")
  .addStates({
    HouseMade: function(re){
      if (re) { $clearing.leadsTo(newRoom('house')); }
      $clearing.getChildFromName(_('room_house'))
        .setCmdText("cd", _('room_house_cd') )
        .setCmdText("ls", _('room_house_ls') );
      $clearing.unsetCmdText("cd");
      $clearing.setIntroText(_('room_clearing_text2'));
      CryingMan.setCmdText("less", _('room_clearing_less2'));
    }
  })
;
var CryingMan=$clearing.newPeople('cryingman',"item_man.gif");

//BROKEN BRIDGE
newRoom("brokenbridge", "loc_bridge.gif")
  .addCmdEvent('touch',function(ct){return (ct.arg === _("item_plank")) ? "touchPlank" : "";})
  .addCommand("touch")
  .addStates({
    touchPlank: function(re){
      $clearing.addCommand("cd");
      $clearing.unsetCmdText("cd");
      $brokenbridge.unsetCmdText("cd");
      $brokenbridge.setIntroText(_('room_brokenbridge_text2'));
      if (re) $brokenbridge.newItem('plank',"item_plank.gif");
      else $brokenbridge.getItem('plank').setPic("item_plank.gif");
    }
  });

//OMINOUS-LOOKING PATH
newRoom("ominouspath", "loc_path.gif")
  .addCmdEvent('rm',function (ct) {
    return (ct.arg == _('item_brambles') ? 'rmBrambles' : '');
  })
  .addCommand("rm")
  .addListener("rmBrambles", function(){
    state.apply("rmBrambles");
  })
  .newItem("brambles", "item_brambles.gif")
  .setCmdText("mv", _('item_brambles_mv'))
  .setCmdText("rm", _('item_brambles_rm'))
  .addValidCmd("rm");
state.add("rmBrambles",function(re){
  $ominouspath.addPath($trollcave) ;
  if (re) $ominouspath.removeItem('brambles');
});
//SLIDE
newRoom("slide")
  .removeCommand("cd")
  .setCmdText("cd", _('room_slide_cd'));

//KERNEL FILES
newRoom("kernel")
  .addCommand("sudo",{question:undefined,password:"IHTFP"})
  .addCommand("grep")
  .setCmdText("sudo", _('room_kernel_sudo'))
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
      learn(vt,'sudo',re);
      vt.playSound('learned');
    }
  });

newRoom("morekernel")
  .addCommand("grep")
  .newItemBatch("bigfile",['L','M','Q','R','S','T','U','V','W']);

//PARADISE (end game screen)
newRoom("paradise", "loc_theend.gif")
  .setCmdText("ls", _('room_paradise_ls'));

//CAVE
var troll_evt=function(ct){
  return (ct.arg == 'UglyTroll' ? 'openSlide' : '' );
};
newRoom("trollcave", "loc_cave.gif")
  .addCmdEvent('mv',troll_evt)
  .addCmdEvent('rm',troll_evt)
  .addCommand("rm")
  .addCommand("mv")
  .addCommand("cp")
  .addListener("openSlide", function(){
    state.apply("openSlide");
  });

state.add("openSlide",function(re){
  $slide.addCommand("cd");
  $slide.setCmdText("cd", _('room_slide_cd2'));
  if (re) $trollcave.removePeople('troll1');
});
$trollcave.newPeople('troll1', "item_troll1.gif")
  .addValidCmd("rm")
  .setCmdText("rm", _('people_troll11_rm'))
  .addValidCmd("mv")
  .setCmdText("mv", _('people_troll11_mv'))
  .addValidCmd("cp")
  .setCmdText("cp",_('people_troll11_cp'));
$trollcave.newPeople('troll2', "item_troll2.gif")
  .addValidCmd("rm")
  .setCmdText("rm",_('people_troll11_rm'));

$trollcave.newPeople('supertroll', "item_supertroll.gif")
  .setCmdText("rm", _('people_supertroll_rm'))
  .setCmdText("mv", _('people_supertroll_mv'));

//CAGE
state.add("freeKid",function(re){
  Kid.moveTo($clearing);
});
newRoom('cage', "item_cage.gif")
  .removeCommand("cd")
  .setCmdText("cd", _('room_cage_cd'));
var Kid=$cage.newPeople('kidnapped', "item_cagedboy.gif")
  .addValidCmd("mv")
  .setCmdText("mv", _('people_kidnapped_mv'))
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
//$meadow                . addPath($mountain);
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
 *    <Room>.setCmdText(<cmd_name>,<cmd_result>)
 *    <Item>.setCmdText(<cmd_name>,<cmd_result>)
 *
 */
