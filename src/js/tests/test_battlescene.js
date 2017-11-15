
function drawPlatform(c,op,custom_matrix,bgstyle){
  var m=custom_matrix||op.grid.matrix,
    range=op.range;
  var x=op.grid.x,
    y=op.grid.y;
  var bl;
  if (bgstyle){c.setAttribute('style',bgstyle);}
  for (var j=0;j<m.length;j++){
    for (var i=0;i<m[j].length;i++){
//        bl=addEl(c,'div',{'style':'z-index:99;position:absolute;background:rgba(33,33,33,.3);border:1px solid #fff;box-sizing:border-box;width:'+x+'%;height:'+y+'%;left:'+(i*x)+'%;bottom:'+(j*y)+'%;'});
      if (m[j][i]==1){
        bl=addEl(c,'img',{'src':'./img/box.png','style':'z-index:99;position:absolute;height:'+y+'%;width:'+x+'%;left:'+(i*x)+'%;bottom:'+(j*y)+'%;'});
      } else if (m[j][i]==2){
        bl=addEl(c,'div',{'style':'z-index:99;position:absolute;background:rgba(33,33,33,.3);border:1px solid #fff;box-sizing:border-box;width:'+x+'%;height:'+y+'%;left:'+(i*x)+'%;bottom:'+(j*y)+'%;'});
  } else if (m[j][i]==3){
        bl=addEl(c,'img',{'src':'./img/boulder.png','style':'z-index:99;position:absolute;height:'+y+'%;left:'+(i*x)+'%;bottom:'+(j*y)+'%;'});
  } else if (m[j][i]==4){
        bl=addEl(c,'img',{'src':'./img/item_clockdragon.png','style':'z-index:99;position:absolute;width:'+2*x+'%;left:'+(i*x)+'%;bottom:'+(j*y)+'%;'});
      }

    }
  }


}
function minigame_start(vt,bs,end){
  bs.setAttribute('style','height:420px');
  vt.show_msg([_('prelude_tuto'),
    function(){minigame(vt,bs,end);}],{el:bs});
}
function minigame(vt,bs,end){
  var frisk=new Pic('kid_profile.png');
  var robot=new Pic('computer_empty.png');
  var robot2=new Pic('computer_empty.png');
  var onload=function(){
    vt.scrl(1000);
  };
  var c = addEl(bs,'div', "img-container");
  var robot_layer=robot.render(c,onload);
  robot_layer.othercls="big";
  var robot_layer2=robot2.render(c,onload);
  var frisk_layer=frisk.render(c,onload);
  var keydown=false;
  var enemy=2;
  var endfu=function(l,x,y){
    if(x>90){
      enemy--;
      vt.show_msg(_('prelude_enemy_kill'),{el:bs});
      l.pic.set('computer_overkill.png');
      var loo=0,inte=setInterval(function(){
        l.pic.setChild('kick','computer_overkill_blur.png')||l.pic.unsetChild('kick');
        l.update();
        if (loo++ > 10){
          clearInterval(inte); 
        }
      },200);
      l.pic.unsetChild('lock');
      l.update();
      if (enemy<=0){
        music.play();
        end();
      }
    }
  };
  var collect_string="";
  bs.onkeydown = function (e) {
      var k=e.key;
     
     if (!keydown){
//       console.log(k);
       keydown=true;
      if ( k === 'Tab') {
        frisk_layer.setOffsetDeltaXStepped(10,5,100);
        setTimeout(function(){
        frisk.setChild('kick','kid_kick_part.png');
        frisk_layer.update();
        },100);
        setTimeout(function(){
          frisk.unsetChild('kick');
          frisk_layer.update();
        },1000);
        if (frisk_layer.collide(robot_layer)){
          snd.play('hit');
      vt.show_msg(_('prelude_tab'),{el:bs});
          robot_layer.setOffsetDeltaXStepped(50,5,100,endfu);
          if (enemy<2){music.play();}
        }
        if (frisk_layer.collide(robot_layer2)){
          snd.play('hit');
      vt.show_msg(_('prelude_tab'),{el:bs});
          if (enemy<2){music.play();}
          robot_layer2.setOffsetDeltaXStepped(50,5,100,endfu);
        }
        overide(e);
      } else if ( k == 'Enter' ) {
        frisk.setChild('arm','kid_punch_part.png');
        frisk_layer.update();
        setTimeout(function(){
          frisk.unsetChild('arm');
          frisk_layer.update();
        },1000);
        if (frisk_layer.collide(robot_layer)){
          robot.setChild('lock','computer_content.png',{index:-1});
          snd.play('poweron');
          vt.show_msg(_('prelude_enter'),{el:bs});
          robot_layer.update();
        }
        if (frisk_layer.collide(robot_layer2)){
          robot2.setChild('lock','computer_content.png',{index:-1});
          vt.show_msg(_('prelude_enter'),{el:bs});
          snd.play('poweron');
          robot_layer2.update();
        }
        overide(e);
      } else if ( e.ctrlKey ) {
        if (k === 'c' || k === 'v' || k === 'x'|| k === 'y' || k === 'z'   ) { 
          overide(e);
        }
      } else if (k === 'PageUp' || k  === 'PageDown' ){
        window.focus();
        bs.blur();
      } 
       if ( k === 'ArrowUp') {
         overide(e);
         frisk_layer.setOffsetDeltaYStepped(30,5,100);
       } else if ( k  === 'ArrowDown') {
         overide(e);
         frisk.set('kid_sit.png');
         frisk_layer.update();
         setTimeout(function(){
           frisk.set('kid_profile.png');
           frisk_layer.update();
         },1000);
       }
       if ( k === 'ArrowLeft') {
         overide(e);
         if (!frisk_layer.reverseX){frisk.set('kid_face.png');}
         else {frisk.set('kid_profile.png');}
         frisk_layer.update();
         frisk_layer.reverseX=true;
         frisk_layer.setOffsetDeltaX(-2);
       } else if ( k  === 'ArrowRight') {
         overide(e);
         if (frisk_layer.reverseX){frisk.set('kid_face.png');}
         else {frisk.set('kid_profile.png');}
         frisk_layer.reverseX=false;
         frisk_layer.update();
         frisk_layer.setOffsetDeltaX(2);
       }
     } else {
       if (k.match('Arrow')) overide(e);
     }
    return !e.defaultPrevented;
  };
  var mon=addEl(bs,'p');
  var parseCollectStr=function(){
        var ret=collect_string+" : ";
        if (collect_string=='ls'){
          robot_layer.setOffsetDeltaXStepped(50,5,100,endfu);
          ret+=_('prelude_success_cmd');
        } else if (collect_string=='cat'||collect_string=='less'){
          robot_layer2.setOffsetDeltaXStepped(50,5,100,endfu);
          ret+=_('prelude_success_cmd');
        } else if (collect_string=='cd'){
          frisk_layer.setOffsetDeltaYStepped(50,5,100,endfu);
          ret+=_('prelude_success_cmd');
        } else if (collect_string=='exit'){
          frisk_layer.setOffsetDeltaXStepped(50,5,100,endfu);
          ret+=_('prelude_success_cmd');
        } else if (collect_string=='talk'){
          frisk_layer.setOffsetDeltaXStepped(50,5,100,endfu);
          ret+=_('prelude_success_cmd');
        } else if (collect_string=='rm -rf *'){
          ret+="You finish the game! Yeah !"; 
        } else if (collect_string=='red'){
          frisk_layer.othercls='red';
          frisk_layer.update();
        } else if (collect_string=='hado'||collect_string=='hadoken'||collect_string=='hadouken'||collect_string=='kameha'||collect_string=='kamehameha'){
          ret+=_('prelude_wrong_game');
        } else {
          ret=null;
        }
        if (ret) {vt.show_msg(ret,{el:bs});}
        collect_string='';
  }
  bs.onkeyup = function (e) {
    var k=e.key;
    keydown=false;
    if ( k === 'Tab' || k == 'Enter' ) {
      parseCollectStr();
    }
    if (k.length==1){
      collect_string+=k;
      mon.innerHTML=collect_string;
      setTimeout(parseCollectStr,1200);
    }
//    console.log(k);
  };
  frisk_layer.gravity=function(){
    setTimeout(function(){
      if (!frisk_layer.setOffsetDeltaY(-5)){
        if (frisk_layer.nextgroundevt){
           frisk_layer.nextgroundevt();
           frisk_layer.nextgroundevt=null;
        }
      }
    },100);
  };
  robot_layer2.gravity=function(){
    setTimeout(function(){
      robot_layer2.setOffsetDeltaY(-5);
    },100);
  };
  frisk_layer.setOffsetProp({unit:['%','%'],prop:["left","bottom"],range:[[0,100],[0,100]]});
  frisk_layer.setPlatformGrid([
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,0,0,0,0,0,0]
  ].reverse());
  var op=frisk_layer.getOffsetProp();
  drawPlatform(c,op, [
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [3,0,0,1,0,0,0,0,0,3]
  ].reverse(),
  'background:url(./img/grass.png) repeat-x bottom;'
  );
  frisk_layer.nextgroundevt=function(){
    music.play('battle',{loop:true});
  };
  robot_layer.setOffsetProp(op);
  robot_layer2.setOffsetProp(op);
  frisk_layer.setOffset([0,50]);
  robot_layer.setOffset([50,0]);
  robot_layer2.setOffset([32,30]);
  
  
}
add_test(function(next){
  vt.wait_free(function(vt){
    vt.battlescene(minigame);
  });
  vt.loop_waiting();
});
TESTING=false;
