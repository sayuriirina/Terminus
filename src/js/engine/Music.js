
function Music(soundbank){
  this.current=0;
  this.soundbank=soundbank;
  this.loop=false;
}

function listenerAudioLoop() {
  this.currentTime = 0;
  this.play();
}
function setAudioLoop(audio,bool){
  audio.setAttribute('loop','true');
  if (typeof audio.loop == 'boolean')
  {
    audio.loop = bool;
  }
  else
  {
    if (bool){
      audio.addEventListener('ended',listenerAudioLoop, false);
    } else {
      audio.removeEventListener('ended',listenerAudioLoop, false);
    }
  }
}
function setAudioFade(audio,fade){
  steps=fade[3]/100;
  audio.volume=fade[0];

//  console.log(fade);
  for (var i=steps;i>0;i--){
    setTimeout(function(){
//      audio.volume=1/i+0.01
//      console.log(
//        parseFloat(((fade[1]-fade[3])*(i/steps))+fade[3]).toPrecision(4),
//        fade[1],fade[3],i,steps,(i/steps)
//
//    );
      audio.volume=parseFloat(((fade[1]-fade[3])*(i/steps))+fade[3]).toPrecision(4);
//  ; 
    },i*100);
  } 
  setTimeout(function(){
    audio.volume=fade[1]; 
  },fade[2]);
}
Music.prototype = {
  set:function(ref,file,exts){
    this.soundbank.set(ref,file,exts,false);
  },
  play:function(ref,attrs){
    attrs=d(attrs,{});
    if (this.current!==ref){
      c=this.soundbank.get(this.current);
      if (c){
        c.stop();
        c.currentTime = 0;
      }
      n=this.soundbank.get(ref);
      if (n){
        this.current=ref;
        setAudioLoop(n,d(attrs.loop,false));
        setAudioFade(n,d(attrs.fadein,[1,1,0]));
        n.currenttime=0;
        n.play();

      }
    }
  },
  fadeTo:function(vol,time){
    c=this.soundbank.get(this.current);
    if (c){
      setAudioFade(c,[c.volume,vol,time]);
    }
  }

};

