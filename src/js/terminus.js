/**
 * This is the game script and represent the map too
 */
var ldr=1; function app_loaded(){
  if (ldr==0 && snd.isloaded()){
    start_game();// make views and interact
  }
}
// Initiate Game state - required to be called 'state'
var state = new GameState(); // GameState to initialize in game script
var vt;
var snd=new SoundBank(app_loaded);
var music=new Music(snd);
/// sound set
// The sounds in vterm are : choicemove choicemove question exclm endoftext dot learned space ret tag virg char
snd.set('choicemove','./snd/sfx_movement_ladder5a.',['wav']);
snd.set('choiceselect','./snd/sfx_movement_ladder2a.',['wav']);
snd.set('tag','./snd/sfx_movement_ladder2a.',['wav']);
snd.set('char','./snd/char.',['wav']);
snd.set('grl','./snd/grl.',['wav']);
snd.set('poney','./snd/sfx_menu_move3.',['wav']);
snd.set('portal','./snd/sfx_movement_portal6.',['wav']);
snd.set('learned','./snd/sfx_sounds_fanfare3.',['wav']);
snd.set('unlocked','./snd/sfx_sounds_fanfare3.',['wav']);
music.set('chapter2','./music/slowdrum-cave.',['wav']);
music.set('academy','./music/caravan.',['ogg']);
// music set
music.set('yourduty','./music/enterTheHero.',['mp3']);
music.set('trl','./music/trolls-beatdown-05l.',['wav']);

/*
 * recurrent events
 **/
function learn(vt, cmds,re){
  if (typeof cmds == 'string'){
    cmds=[cmds];
  }
  for (var j=0; j<cmds.length;j++) {
    global_commands.push(cmds[j]);
  }
  if (!re){
    global_fireables.done.push(
      function(){
        for (var j=0; j<cmds.length;j++) {
          vt.badge(cmds[j],_('you_learn',[cmds[j]]));
          vt.playSound('learned');
        }
      }
    );
  }
}
function unlock(vt, unlocked,re){
  if (!re) {
    global_fireables.done.push(
      function(){
        vt.playSound('unlocked'); 
      }
    );
  }
}

//$home - required - default room
newRoom('home', "loc_farm.gif") ;
state.setCurrentRoom($home);
  
function start_game(){
  // build view
  vt=new VTerm('term');
  vt.soundbank=snd; 
  vt.muteSound();
  vt.charduration=20; 
  vt.charfactor[' ']=25;//on each nbsp , it will take 1/2 second
  vt.disable_input();
  vt.epic_img_enter('titlescreen.gif','epicfromright',2000);
  
  // prepare game loading
  var has_save=state.startCookie('terminuscookie');
  var choices=[_('cookie_yes'),_('cookie_no')];
  if (has_save) choices.unshift(_('cookie_yes_load'));

  var game_start=function(vt, use_cookies){
    var loaded=false;
    if (pogencnt>0){ vt.show_msg(_('pogen_alert',pogencnt)); }
    console.log(has_save,use_cookies);
    if ((use_cookies - (has_save?1:0))<=0){ // yes new game or load
      state.setCookieDuration(7*24*60);// in minutes
      if(use_cookies==0){// load
        loaded=state.loadCookie();
      } 
    } else {// do not use cookie
      state.stopCookie();
    }
    vt.clear();
    vt.setContext(state.getCurrentRoom());
    if (loaded){
      vt.unmuteSound();
      vt.notification(_("game_loaded"));
      vt.show_msg( vt.context.getStarterMsg());
      vt.enable_input();
    } else {
      vt.muteCommandResult();
      vt.show_msg(_('gamestart_text'));
      vt.enable_input();
    }
  };
  setTimeout(function(){
    vt.ask_choose(_('cookie'), choices,game_start,{instant:true});
  },2000);
}
// home
$home.setCmdEvent('poe_cmd_not_found','poe_mode')
  .setCmdEvent('cmd_not_found','add_cat')
  .setCmdEvent('destination_invalid','destination_invalid')
  .addStates({
    poe_mode: function(re){
      vt.show_msg(_('cmd_poe_revealed'),undefined,false);
      learn(vt,['poe','pogen'],re);
    },
    add_cat:function(re){
      learn(vt,['cat'],re);
      if (!re){
        setTimeout(function(){
          vt.unmuteSound();
          vt.show_msg(_('cmd_cat_revealed'));
          vt.unmuteCommandResult();
          $home.unsetCmdEvent('cmd_not_found');
          setTimeout(function(){ 
            vt.show_img();
            global_fire_done();
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
shelly=$home.newPeople('shell')
  .setTextIdx(0)
  .setCmdEvent('less','add_ls')
  .setCmdEvent('less_done','chtxt')
  .addStates({
    add_ls:function(re){
      shelly.unsetCmdEvent('less');
      learn(vt,['cd','ls'],re);
    },
    chtxt:function(){
      shelly.unsetCmdEvent('less_done');
      shelly.setTextIdx('');
      state.saveCookie();
    }
  });

//WESTERN FOREST
newRoom('western_forest', "loc_forest.gif");
$western_forest.newItem('western_forest_academy_direction','item_sign.png');
$western_forest.newItem('western_forest_back_direction')
  .setCmdEvent('less','pwdCmd')
  .addStates({
    pwdCmd:function(re){
      if (global_commands.indexOf('pwd')==-1){
        learn(vt,'pwd',re);
      }
    }
  })
;

//SPELL CASTING ACADEMY

newRoom('spell_casting_academy', "loc_academy.gif");
//  .newPeople('academy_student', "item_student.png");
$spell_casting_academy.setEnterCallback(function(){
  music.play('academy');
});
//PRACTICE ROOM
newRoom('academy_practice', "loc_practiceroom.gif")
  .addCommand("mv");
//  .newItem('academy_practice', "item_manuscript.png")
$academy_practice.newItemBatch('practice_dummy',[1,2,3], "item_dummy.png")
  .map(function(i){
    i.addValidCmd('mv');
  }
  );

//BOX
newRoom('box', "item_box.png")
  .removeCommand("cd")
  .setCmdText("cd",_('room_box_cd'));

//EASTERN MOUNTAINS
man_sage=newRoom('mountain', "loc_mountains.gif")
  .newPeople('man_sage', "item_mysteryman.png");
man_sage.setCmdEvent('less','exitCmd')
  .addStates({
    exitCmd:function (re){
      man_sage.unsetCmdEvent('less');
      learn(vt, ['exit'], re);
      
      man=$mountain.newItem('man', "item_manuscript.png");
      man
        .setCmdEvent('less','manCmd')
        .addStates({
          manCmd:function (re){
            man.unsetCmdEvent('less');
            learn(vt, ['man', 'help'], re);
          }
        })
        .setCmdEvent('less_done','trueStart')
        .addStates({
          trueStart:function (re){
            man.unsetCmdEvent('less_done');
            music.play('yourduty',{loop:true});
          }
        });
    }
  });
man_sage.setCmdEvent('less_done','manLeave')
  .addStates({
    manLeave: function(re){
      man_sage.disappear();
    }
  })
;
var poney_txt_id=1;
function poney_dial(re){
  if (!isStr(poney_txt_id)){
    poney.setTextIdx(poney_txt_id++);
    if (poney_txt_id==5){
      poney.setCmdEvent('less_done','uptxthint')
    }
  }
}
function poney_dialhint(re){
  poney.setCmdEvent('less_done','uptxthint')
  if (!vt.statkey.Tab || vt.statkey.Tab==0) {
    poney.setTextIdx('tab');
  } else if (!global_hasCmd('mv')){
    poney.setTextIdx('mv');
  } else if (state.applied('mvBoulder')){
    poney.setTextIdx('mountain');
  } else {
    poney.setTextIdx('help');
  }
}
//NORTHERN MEADOW
var poney=newRoom('meadow', "loc_meadow.gif")
  .newPeople("poney", "item_fatpony.png")
  .setCmdEvent('less','add_mountain')
  .setCmdEvent('less_done','uptxt')
  .addStates({
    add_mountain:function(re){
      $meadow.addPath($mountain);
      unlock(vt, $mountain.room_name, re);
      poney.unsetCmdEvent('less');
    },
    uptxt:poney_dial,
    uptxthint:poney_dialhint
  });

//LESSONS
newRoom('lessons',"loc_classroom.gif")
  .newPeople('professor', "item_professor.png")
  .setCmdEvent('less','learn_mv')
  .addState('learn_mv',function(re){
      learn(vt,'mv',re);
  });

//CAVE
newRoom('cave', "loc_cave.gif");

//DARK CORRIDOR
newRoom('dark_corridor', "loc_corridor.gif");

//STAIRCASE
newRoom('staircase', "loc_stair.gif")
  .newItem('dead_end', "item_sign.png");

//DANK ROOM
newRoom('dank',"loc_darkroom.gif").addCommand("mv")
  .newItem('boulder','item_boulder.png',{cls:'large'}).addValidCmd('mv')
  .setCmdEvent('mv','mvBoulder')
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

var rat_txtidx=1;
function rat_dial(re){
  rat.setTextIdx(rat_txtidx++);
}

//TUNNEL
var rat=newRoom('tunnel',"loc_tunnel.gif")
  .newPeople('rat',"item_rat.png",{pic_shown_in_ls:false})
  .setCmdEvent('less_done','idRat')
  .addStates({
    idRat: function(re){
      rat.setCmdEvent('less_done','ratDial');
      rat.setPoDelta('_identified');
    },
    ratDial:rat_dial
  });

//STONE CHAMBER
newRoom('stone_chamber',"loc_portalroom.gif");

//PORTAL ring you to the next level
newRoom('portal',"item_portal.png")
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
$townsquare.newPeople('citizen1',"item_citizen1.png");
$townsquare.newPeople('citizen2',"item_citizen2.png");
$townsquare.newPeople('citizen3',"item_lady.png");

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
vendor=$market.newPeople("vendor", "item_merchant.png")
  .setCmdText("less","")
  .setCmdEvent("less",function(){
    vt.show_img();
    vt.ask_choose(_('people_vendor_text'), [_('people_vendor_sell_mkdir'),_('people_vendor_sell_rm'),_('people_vendor_sell_nothing')],buy_to_vendor,
      {disabled_choices:disabled_sell_choices});
  })
  ;

var backpack=$market.newItem("backpack","item_backpack.png")
  .addValidCmd('mv')
  .addValidCmd('less')
  .setCmdEvent("mv", function(ct){
    vt.show_msg(_('item_backpack_stolen'));
    backpack.unsetCmdEvent("mv");
  })
  .setCmdEvent("less", function(ct){$market.ev.fire('unzipUnlocked');})
  ;

$market.addStates({
  unzipUnlocked:function(re){
    backpack.addValidCmd('unzip');
    learn(vt, 'unzip', re);
    backpack.unsetCmdEvent("less");
    backpack.setPoDelta(['.zip']);
    backpack.setCmdEvent('unzip',function(ct){
      unzipped=[];
      unzipped.push(ct.room.newItem('rm_cost'));
      unzipped.push(ct.room.newItem('mkdir_cost'));
      backpack.setPoDelta([]);
      backpack.unsetCmdEvent('unzip');
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
    learn(vt,'mkdir',re);
    disabled_sell_choices.push(0);
    $market.removeItem('mkdir_spell');
  }
})
;
$market.newItem("rm_spell","item_manuscript.png");
$market.newItem("mkdir_spell","item_manuscript.png");

//LIBRARY
newRoom("library", "loc_library.gif")
  .addCommand("grep");
$library.newItem('radspellbook',"item_radspellbook.png");
$library.newItem('romancebook',"item_romancenovel.png");
$library.newItem('historybook',"item_historybook.png");
$library.newItem('nostalgicbook',"item_historybook.png")
  .setCmdEvent('less','pwdCmd')
  .addStates({
    pwdCmd:function(re){
      if (global_commands.indexOf('pwd')==-1){
        learn(vt,'pwd',re);
      }
    }
  })
;
vimbook=$library.newItem('vimbook',"item_vimbook.png")
  .setCmdEvent('less','openVim')
  .addListener("openVim", function(){
    vt.flash(1600,1000);
    vt.rmCurrentImg(2650);
    vimbook.disappear();
  });
lever=$library.newItem("lever", "item_lever.png")
  .setCmdEvent('less','pullLever')
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

$backroom.newPeople("grep", "grep.png")
  .setCmdEvent('less','grep')
  .addStates({
    grep:function(re){
      learn(vt,'grep',re);
    }
  })
  ;

$backroom.newPeople("librarian", "item_librarian.png");

//ROCKY PATH
newRoom("rockypath", "loc_rockypath.gif")
  .newItem("largeboulder", "item_boulder.png")
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
  .setCmdEvents({
    touch:function(ct){
      if (ct.arg === _("item_gear")){
        return "touchGear";
      }
    },
    cp:function(ct){
      var re=new RegExp(_('item_gear')+"\\d");
//      console.log('five ?');
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
      if (re) $artisanshop.newItem('gear',"item_gear.png");
      else $artisanshop.getItem('gear').setPic("item_gear.png");
      state.saveCookie();
    },
    "FiveGearsCopied": function(re){
      Artisan.setCmdText("less", _('item_gear_artisans_ok'));
      if (re){
        $artisanshop.newItemBatch("gear",['1','2','3','4','5']);
      }
      state.saveCookie();
    }
  })
;

$artisanshop.newItem("strangetrinket", "item_trinket.png")
  .setCmdText("rm", _('item_strangetrinket_rm'))
  .setCmdText("mv", _('item_strangetrinket_mv'));
$artisanshop.newItem("dragon", "item_clockdragon.png",{pic_shown_in_ls:false})
  .setCmdText("rm", _('item_dragon_rm'))  
  .setCmdText("mv", _('item_dragon_mv')); 
var Artisan=$artisanshop.newPeople("artisan", "item_artisan.png")
  .setCmdEvent('less', 'touch' )
  .addStates({
    'touch': function(re){
      learn(vt,'touch',re);
      Artisan.unsetCmdEvent('less');
      state.saveCookie();
    }
  })
  ;

//FARM
newRoom("farm", "loc_farm.gif")
  .addCommand("cp")
  .newItem("earofcorn", "item_corn.png")
  .setCmdText("rm",_('item_earofcorn_rm'))
  .setCmdEvent('cp','CornCopied')
  .addStates({
    CornCopied:function(re){
      Farmer.setCmdText("less", _('corn_farmer_ok'));
      if (re) $farm.newItem('another_earofcorn');
    }
  });

var Farmer=$farm.newPeople('farmer',"item_farmer.png");

//CLEARING
newRoom("clearing", "loc_clearing.gif")
  .setCmdEvent('mkdir',function(ct){
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
var CryingMan=$clearing.newPeople('cryingman',"item_man.png");

//BROKEN BRIDGE
newRoom("brokenbridge", "loc_bridge.gif")
  .setCmdEvent('touch',function(ct){return (ct.arg === _("item_plank")) ? "touchPlank" : "";})
  .addCommand("touch")
  .addStates({
    touchPlank: function(re){
      $clearing.addCommand("cd");
      $clearing.unsetCmdText("cd");
      $brokenbridge.unsetCmdText("cd");
      $brokenbridge.setIntroText(_('room_brokenbridge_text2'));
      if (re) $brokenbridge.newItem('plank',"item_plank.png");
      else $brokenbridge.getItem('plank').setPic("item_plank.png");
    }
  });

//OMINOUS-LOOKING PATH
newRoom("ominouspath", "loc_path.gif")
  .addCommand("rm")
  .newItem("brambles", "item_brambles.png",{cls:'large'})
  .setCmdEvent('rm','rmBrambles')
  .setCmdText("mv", _('item_brambles_mv'))
  .setCmdText("rm", _('item_brambles_rm'))
  .addValidCmd("rm")
  .addStates({
    "rmBrambles":function(re){
      $ominouspath.addPath($trollcave) ;
      if (re) $ominouspath.removeItem('brambles');
    }
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
  .setCmdEvent('less','sudo')
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
  .setCmdEvent('mv',troll_evt)
  .setCmdEvent('rm',troll_evt)
  .addCommand("rm")
  .addCommand("mv")
  .addCommand("cp")
;

$trollcave.newPeople('troll1', "item_troll1.png")
  .addValidCmd("rm")
  .setCmdText("rm", _('people_troll11_rm'))
  .addValidCmd("mv")
  .setCmdText("mv", _('people_troll11_mv'))
  .addValidCmd("cp")
  .setCmdText("cp",_('people_troll11_cp'))
  .setCmdEvent('mv','openSlide')
  .setCmdEvent('rm','openSlide')
  .addStates({
    openSlide:function(re){
      $slide.addCommand("cd");
      $slide.setCmdText("cd", _('room_slide_cd2'));
      if (re) $trollcave.removePeople('troll1');
    }
  });

$trollcave.newPeople('troll2', "item_troll2.png")
  .addValidCmd("rm")
  .addValidCmd("mv")
  .setCmdText("rm",_('people_troll11_rm'));

$trollcave.newPeople('supertroll', "item_supertroll.png")
  .setCmdText("rm", _('people_supertroll_rm'))
  .setCmdText("mv", _('people_supertroll_mv'));

//CAGE
newRoom('cage', "item_cage.png",{cls:'covering'})
  .removeCommand("cd")
  .setCmdText("cd", _('room_cage_cd'));
var Kid=$cage.newPeople('kidnapped', "item_boy.png")
  .addValidCmd("mv")
  .setCmdText("mv", _('people_kidnapped_mv'))
  .setCmdEvent("mv",'freekid')
  .addStates({
    freeKid:function(){Kid.moveTo($clearing);}
  });

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
