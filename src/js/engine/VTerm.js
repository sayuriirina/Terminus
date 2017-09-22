/* Terminal interface which solve completion problem */

function commonprefix(array) {
  //https://stackoverflow.com/questions/1916218/find-the-longest-common-starting-substring-in-a-set-of-strings/1917041#1917041
  var A= array.concat().sort(), 
    a1= A[0], a2= A[A.length-1], L= a1.length, i= 0;
  while(i<L && a1.charAt(i)=== a2.charAt(i)) i++;
  return a1.substring(0, i);
}
function addspace(i){return i+' ';}
function overide(e){
  e.preventDefault();
  e.stopPropagation();
}
function VTerm(container_id, img_dir,  img_id, context){
  var t=this;
  /* non dom properties */
  t.context = context;
  t.img_dir=(img_dir ? img_dir : './img/'); // shall contains last slash './img/'
  t.charduration=10;
  t.imgs=[];
  t.history=[];
  t.disabled={};
  t.histchecking=false;
  t.histindex=0;
  t.scrl_lock=false;
  /* dom properties (view) */
  t.container = dom.Id(container_id);
  t.monitor = addEl(t.container,'div','monitor');
  // for accessibility
  t.ghost_monitor = prEl(document.body,'div','ghost-monitor');
  addAttrs(t.ghost_monitor,{
    'role':'log',
    'aria-live':'polite',
//    'aria-relevant':'additions removals'
  });
  t.inputdiv = addEl(addEl(t.container,'div','input-container'),'div','input-div');
  t.cmdline = addEl(t.inputdiv,'p','input');
  t.input = addEl(t.cmdline,'input',{size:80});
  var b=addEl(t.cmdline,'div','belt');
  addAttrs(t.cmdline,{
    'role':'log',
    'aria-live':'polite',
  });
  var k=addEl(b,'div','keys');
  t.suggestions= addEl(b,'div','suggest');
  addAttrs(t.suggestions,{
    'role':'log',
    'aria-live':'polite',
    'aria-relevant':'additions removals'
  });
  // buttons
  t.btn_clear=addBtn(k,'key','✗','Ctrl-U',function(e){
    t.set_line(''); t.show_suggestions(this.context.getCommands().map(addspace)); });
  t.btn_tab=addBtn(k,'key','↹','Tab',function(e){t.make_suggestions();});
  t.btn_enter=addBtn(k,'key','↵','Enter',function(e){t.enterKey();});
  // img element if exist
  t.img_element= (img_id ? dom.Id(img_id) : null );
  t.msg_idx=0;
  t.soundbank={};
//     char:null,
//     ret:null,
//     space:null,
//     choosemove:null,
//     chooseselect:null
  this.behave();
}
VTerm.prototype={
  /* API part */
  setContext: function(ctx){
    this.context=ctx;
    this.show_suggestions(this.context.getCommands().map(addspace));
  },
  flash: function(timeout,timeoutdisappear){
    setTimeout(function(){
      document.body.className += ' flash';
      setTimeout(function(){
        document.body.className = document.body.className.replace(/[ ]*flash/,'');
      },timeoutdisappear);
    },timeout);
  },
  push_img: function(img){
    if (img) {
      this.imgs.push(img);
    }
    return this;
  },
  epic_img_enter: function(i, clss, scrl_timeout,callback){
    var t=this;
    t.scrl_lock=true;
    if (t.img_element){
      addAttrs(t.img_element, {src: t.img_dir + i.src, alt:i.alt, title:i.title});
    } else {
      var c = addEl(t.monitor,'div', "img-container "+clss);
      addEl(c,'img',{src:t.img_dir + i.src,title:i.title,alt:i.alt})
        .onload=function(){
          c.className+=' loaded';
          setTimeout(function(){
            t.scrl_lock=false;
            t.scrl();
            if (def(callback)){
              callback();
            }
          },1000);
        };
    }
  },
  playSound : function(key){
    this.soundbank.play(key);
  },
  /* Getter and setters */
  get_line:function(){
    return this.input.value.replace(/\s+/," ");
  },
  set_line:function(val){
    this.input.value = val;
  },
  /* UI part */
  // Scroll the window to the last element (bottom of page)
  scrl : function(timeout){
    var t=this;
    if (!t.scrl_lock){
      if (!def(timeout)){
        var c=t.container;
        window.scrollBy(0, window.innerHeight);
        return true;
      }
    }
    timeout=d(timeout,100);
    setTimeout(function(){
      t.scrl();
    },timeout);
  },
  disable_input:function(){//disable can act as a mutex, if a widget don't get true then it shouldn't enable input
    var t=this;
    if (!t.disabled.input){
      t.disabled.input=true;
      t.btn_clear.setAttribute('disabled','');
      t.btn_tab.setAttribute('disabled','');
      t.inputdiv.removeChild(t.cmdline);
      return true;
    }
    return false;
  },
  enable_input:function(){
    var t=this;
    if (t.disabled.input){
      t.disabled.input=false;
      t.inputdiv.prepend(t.cmdline);
      t.btn_clear.removeAttribute('disabled');
      t.btn_tab.removeAttribute('disabled');
      t.enterKey=t.enter;
      t.input.focus();
      return true;
    }
    return false;
  },
  show_img: function(){
    var t=this;
    var im;
    if (t.imgs.length>0) {
      if (t.img_element){
        im=t.imgs.pop();
        if (im.hasOwnProperty('src')){
          addAttrs(t.img_element, {src: t.img_dir + im.src, alt:im.alt, title:im.title});
        }
      } else {
        var onload=function(){
          console.log('load');
          t.scrl(1000);
        };
        var c = addEl(t.monitor,'div', "img-container");
        for (var i in t.imgs) {
          if (t.imgs.hasOwnProperty(i)){
            im=t.imgs[i];
            if (im && im.alt.length > 0){
              addEl(c,'img',{src:t.img_dir + im.src,title:im.title,alt:im.alt})
                .onload=onload;
            }
          }
        }
      }
      this.imgs=[];
    } 
  },
  show_previous_prompt: function (txt){
    addEl(this.monitor,'p','input').innerText = txt;
  },
  _show_chars: function (msgidx,msg,txttab,dependant){
    l=txttab.shift();
    var t=this;
    if (def(l)){
      var timeout;
       if (l == "<" ){
        var tag="<";
         while (def(l) && (l != ">")){
            l=txttab.shift();
            tag+=l;
         }
         var tagtype=tag.replace(/<([^ ]*).*>/,'$1');
         if (tagtype == 'img') {
           msg.innerHTML += tag ;
           t.playSound('tag');
           timeout=10;
         } else { 
           var tagend="";
           l=txttab.shift();
           while (def(l) && (l != ">")){
             l=txttab.shift();
             tagend+=l;
           }
           msg.innerHTML += tag+tagend ;
         }
        t.scrl();
       } else if (l == "\n" ){
        msg.innerHTML += '<br>' ;
        t.playSound('ret');
        timeout = 10;
        t.scrl();
      } else if (l == '.') {
        msg.innerHTML += l;
        t.playSound('dot');
        timeout = 8;
        t.scrl();
      } else if (l == ',') {
        msg.innerHTML += l;
        t.playSound('virg');
        timeout = 5;
        t.scrl();
      } else if (l == '!') {
        msg.innerHTML += l;
        t.playSound('exclm');
        timeout = 10;
        t.scrl();
      } else if (l == '?') {
        msg.innerHTML += l;
        t.playSound('question');
        timeout = 10;
        t.scrl();
      } else if (l == ' ') {
        msg.innerHTML += l;
        t.playSound('space');
        timeout = 2;
      } else {
        msg.innerHTML += l;
        t.playSound('char');
        timeout = 1;
      }
       if (!dependant || t.msg_idx==msgidx){
         setTimeout(function(){
           t._show_chars(msgidx,msg,txttab,dependant);
         },timeout*t.charduration);
       } 
    } else {
      t.playSound('endoftext');
    }
  },
  rmCurrentImg: function(timeout){
    var t=this;
    setTimeout(function(){
      var y=t.current_msg.getElementsByClassName("img-container"); 
      var i;
      for (i = 0; i < y.length; i++) {
        msg.removeChild(y[i]);
      } 
    },timeout);
  },
  show_msg: function (txt,el,dependant,direct){
    if (def(txt)){
      var t=this;
      el=d(el,t.monitor);
      dependant=d(dependant,true);
      direct=d(direct,false);
      txt=txt.toString();//ensure in case we have an object
      txt=txt.replace(/(#[^#]+#)/g,'<i class="hashtag"> $1 </i>');
      txttab=txt.split('');
      var msg=addEl(el,'p','msg');
      t.current_msg=msg;
      t.msg_idx++;
      gel=addEl(t.ghost_monitor,'p');
      gel.innerHTML=txt.replace(/(<br>)/g,"<&nbsp;><br>").replace(/ /g,"<&nbsp;>").replace(/\n/g,"<br>").replace(/[«»]/g,'"').replace(/(\.\.\.)/g,'<br>');
      if (direct){
        msg.innerHTML=txt;
      } else { // progressive 
        t._show_chars(t.msg_idx,msg,txttab,dependant);
      }  
    }
  },
  /* Suggestion part */
  make_suggestions: function (autocomplete){
    var t=this;    
    var ac=d(autocomplete,true);
    t.suggestions.innerHTML = '';
    var l=t.get_line();
    args=l.split(' ');
    if (args.length > 0) {
      var tocomplete;
      var match=[];
//      console.log('suggestions',ac,l,args);
      // which word to guess
      if (args.length > 1) {
        tocomplete=args.pop();
        match=t.context._completeArgs(args[0],tocomplete);
      } else if (args[0].length>0){
        if (t.context.hasCommand(args[0])) {
        tocomplete="";
        t.set_line(l+' ');
        match=t.context._completeArgs(args[0],tocomplete);
        } else {
          tocomplete=args.pop();
          var cmds=t.context.getCommands();
          for(var i = 0; i<cmds.length; i++){
            if(cmds[i].match("^"+tocomplete)){
                match.push(cmds[i]);
            }
          }
        }
      } else {
        tocomplete="";
        match=t.context.getCommands().map(addspace);
      }
      // find solutions
      if (match.length === 0){
        t.set_line(l+'?');
        setTimeout(function(){t.set_line(l+'??');},100);
        setTimeout(function(){t.set_line(l);},200);
      } else if (match.length == 1 ){
        if (ac) {
          var lb=tocomplete.split('/');
          lb.pop();
          lb.push(match[0]);
          args.push(lb.join('/'));
          t.set_line(args.join(" "));
        } else {
          if (match[0] == tocomplete) {
            t.set_line(l+' ');
          }
          t.show_suggestions(match);
        }
      } else {
        var lcp=commonprefix(match);
        if (match.indexOf(lcp)>-1){
          t.set_line(l+' ');
        }
        if (lcp.length > 0 && ac){
          args.push(lcp);
          t.set_line(args.join(" "));
        }
        t.show_suggestions(match);
      }
    }
  },
  show_suggestions: function (list){
    this.suggestions.innerHTML = '<div class="visually-hidden">'+_('Suggestions')+'</div>';
    for (var i=0;i<list.length; i++){
      this.show_suggestion(list[i]);
    }
  },
  show_suggestion: function (txt){
    var t=this;
    t.histindex=0;
    addBtn(t.suggestions,undefined,txt.replace(/(#[^#]+#)/g,'<i class="hashtag"> $1 </i>'),txt,function (e){
      var l=t.get_line();
      var sp=l.split(" ");
      // replace word by complete suggestion
      var last=sp.pop();
      sp.push('');
      var newl=sp.join(' ')+txt;
      // set the line content and try to exec
      t.set_line(newl);
      if (t.argsValid(newl.replace(/\s+$/,"").split(" "))){
        t.enter();
      } else {
        t.make_suggestions(false);
      }
    });
    t.scrl();
  },
  hide_suggestions: function (){
    this.suggestions.innerHTML = '';
  },
  /* */
  argsValid: function(args){
    return this.context._validArgs(args.shift(),args);
  },
  enter : function(){
    // Enter -> exec command
    var t=this;
    t.playSound('enter');
    var l=t.get_line().replace(/\s+$/,"");
    if (l.length>0){
      var pr=t.input;
      var mon=t.monitor;
      t.monitor = addEl(mon,'div','screen');
      t.histindex=0;
      t.show_previous_prompt(pr.value);
      t.history.push(pr.value);
      var args=l.split(' ');
      var echo=t.context.exec(t, args);
      if (def(echo)){
      t.show_img();
      t.show_msg(echo);
      t.set_line('');
      t.hide_suggestions();
      t.show_suggestions(this.context.getCommands().map(addspace));
      t.monitor = mon;
      }
    }
  },
  enterKey : this.enter,
/*****************/
/** Prompt behavior part **/
/*****************/
  behave: function(){
    this.global_behavior();
    this.input_behavior();
  },
  global_behavior: function (){
    window.onbeforeunload = function(e) {
      return 'Quit the game ?';
    };
  },
  _cmdline_key:function(){
  

  },
  input_behavior: function (){
    // behavior 
    var t=this;
    var pr=t.input;
    //    var cmd=this.cmdspan;

    dom.body.onkeydown = function (e) {
      e = e || window.event;//Get event
      var k=e.key;
//      console.log(e);
      if(def(t.choose_input)){
        t._choose_key(k,e);
      } else if(def(t.password_input)) {
        t._password_key(k,e);
      } else if (k === 'ArrowRight' || k  === 'ArrowLeft' || k === 'ArrowUp' || k  === 'ArrowDown') {
          if (e.shiftKey){
            e.preventDefault();
          }
      } else {
        var focused = dom.activeElement;
        if ( !focused || focused != pr) {
          pr.focus();t.scrl();
        }
        pr.onkeydown(e);
      }
    };
    pr.onkeydown = function (e) {
      var k=e.key;
      if ( k === 'Tab' || k == 'Enter' ) {
        overide(e);
      } else if ( e.ctrlKey ) {
        if (k === 'c' || k === 'v' || k === 'x'|| k === 'y' || k === 'z'   ) { 
          overide(e);
        }
      } else if (k === 'PageUp' || k  === 'PageDown' ){
        window.focus();
        pr.blur();
      }
      if ( k === 'ArrowUp' || k  === 'ArrowDown') {
        overide(e);
      }
      return !e.defaultPrevented;
    };
    pr.onkeyup = function (e) {
      var k=e.key;
      var echo="";
      t.hide_suggestions();
      if (k === 'Enter') {
        overide(e);
        t.enter();t.scrl();
      } else if (k === 'Tab' && !(e.ctrlKey || e.altKey)) {
        overide(e);
        t.make_suggestions();t.scrl();
      } else if (e.ctrlKey){
        if (k === 'c' ) { // CTRL+C - clear
          overide(e);
          t.show_previous_prompt(t.get_line() + '^C');
          t.msg_idx++;
          t.set_line('');
        } else if (k === 'u') { // CTRL+U - clear line
          overide(e);
          t.set_line('');
        } else if (  k === 'v' || k === 'x' || k === 'y' || k === 'z'  ) {
          // replace CTRL + W - remove last component
          overide(e);
          var line=t.get_line();
          line=line.replace(/\/$/,"");
          var lineparts=line.split(' ');
          var lastarg=lineparts.pop().split('/');
          lastarg.pop();
          if (lastarg.length > 1) {
            lastarg.push('');
          }
          lineparts.push(lastarg.join('/'));
          t.set_line(lineparts.join(' '));
        }
      } else if (k === 'PageUp' || k  === 'PageDown') {
        window.focus();
        // Remove focus from any focused element
        pr.blur();
      } else if (k  === 'ArrowDown') {//down
        if (t.histindex>0){
          t.histindex--;
          t.set_line(t.history[t.history.length-1-t.histindex]);
        } 
      } else if ( k === 'ArrowUp') {//up
        //        console.log(t.histindex, t.history);
        if (t.histindex < t.history.length){
          var prev=t.history[t.history.length-1-t.histindex];
          if (t.histindex===0){
            var txt=t.get_line();
            if (txt.length>0 && txt !== prev ){
              t.history.push(txt);
            }
          }
          t.set_line(prev);
          t.histindex++;
        }
      } else {

      }
//      console.log(e);
      return !e.defaultPrevented;
    };
  },
/** Choice prompt **/
  ask_choose:function(question,choices,callback){
    var t=this;
    var choices_btn=[];
    var curidx=0;
    var choicebox = addEl(t.monitor,'div','choicebox');
    t.show_msg(question,choicebox,false);
   
    t.set_line('');
    t.choose_input = addEl(choicebox,'fieldset','choices');
    var reenable=t.disable_input();
    
    var click=function(e){
      var i=e.target.getAttribute('idx');
      addAttrs(choices_btn[curidx],{checked:''});
      addAttrs(choices_btn[i],{checked:'checked'});
      curidx=i;
      return t.enterKey();
    };
    var onkeydown=function(e){
      t._choose_key(e.key,e);
    };
    t.enterKey=function(e){
      t.playSound('choiceselect');
      t.choose_input.value=choices[curidx];
      t.show_msg(choices[curidx],choicebox,false);
      choicebox.removeChild(t.choose_input);
      t.choose_input = undefined;
      if (reenable){ t.enable_input(); }
      t.show_msg(callback(curidx));
      
    };
    t._choose_key=function(k,e){
      console.log(k);
      if (k=='ArrowDown'||k=='ArrowUp' || k == 'Tab' ){
        t.playSound('choicemove');
        choices_btn[curidx].removeAttribute('checked');
        if (k=='ArrowDown'||(!e.shiftKey && k=='Tab')){
          curidx=((++curidx)%choices_btn.length);
        } else if (k=='ArrowUp'||(e.shiftKey && k=='Tab')){
          curidx=(--curidx>=0?curidx:(choices_btn.length-1));
        }
        addAttrs(choices_btn[curidx],{checked:'checked'});
        choices_btn[curidx].focus();
//        gel=addEl(t.ghost_monitor,'p');
        gel.innerHTML=choices[curidx];
      } else if (k=='Enter') {
        t.enterKey();
      }
      e.preventDefault(); 
    };

    for (var i=0;i<choices.length;i++){
      
      cho=addEl(t.choose_input,'div','choice');
      choices[i]=choices[i];
      choices_btn.push(
        addEl(cho,'input',{
          type:'radio',
          name:'choose',
          idx:i,id:'radio'+i
        })
      );
      
  addAttrs(choices_btn[i],{
    'role':'log',
    'aria-live':'polite',
    'aria-relevant':'all'
  });
      choices_btn[i].onclick=click;
      choices_btn[i].onkeydown=onkeydown;
      addEl(cho,'span','selectpointer');
      addEl(cho,'label',{
        for:'radio'+i
      }).innerHTML=choices[i].replace(/(#[^#]+#)/g,'<i class="hashtag"> $1 </i>');
    }
      t.choose_input.onkeydown=onkeydown; 
    addAttrs(t.choose_input,{value:choices[0]});
    addAttrs(choices_btn[0],{checked:'checked'});
//    choices_btn[0].focus();
    t.scrl();
  }, 

/** Question prompt **/
  _begin_answer: function(){
    var t = this;
    t.set_line('');
    t.answer_input =addEl(t.inputdiv,'input',{size:80});
    t.answer_input.focus();
    t.answer_input.onkeyup=function(e){
      var k=e.key;
      if (k === 'Enter') { // ENTER
        t.enterKey();
        e.preventDefault();
        t.scrl();
      }
    };
    t.disable_input();
  },
  _end_answer: function(){
    var t = this;
    t.show_previous_prompt(t.answer_input.value);
    t.inputdiv.removeChild(t.answer_input);
    t.answer_input = undefined;t.enable_input();
  },
  _answer_key:function(k,e){
  //nothing
  },
  _ask_answer:function(question,callback){
    var t=this;
    t.show_msg(question);
    t.enterKey=function(){
      t.playSound('choiceselect');
      var ret = t.answer_input.value;
      t._end_answer();
      t.show_msg(callback(ret));
    };
  }, 
  ask: function(question,callback){
    this._begin_answer();
    this._ask_answer(question,callback);
  },
/** Password prompt **/
  _begin_password: function(){
    var t = this;
    t.set_line('');
    t._cur_box = addEl(t.monitor,'div','choicebox');
    t._div =addEl(t.inputdiv,'div',{class:'passinput'});
    t.password_input =addEl(t._div,'input',{size:20});
    

    t.password_input.focus();
    t.password_input.onkeyup=function(e){
      var k=e.key;
      if (k === 'Enter') { // ENTER
        t.enterKey();
        e.preventDefault();
        t.scrl();
      }
    };
    t.disable_input();
  },
  _end_password: function(){
    var t = this;
    t.inputdiv.removeChild(t._div);
    t.password_input = undefined;
    t._div = undefined;
    t.enable_input();
  },
  _password_key:function(k,e){
  //nothing
  },
  _ask_password_rec:function(cmdpass,callback){
    var t=this;
    if (cmdpass.length > 0){
      var p=cmdpass.shift();
      var question=d(p.question,_('ask_password'));
      t.show_msg( question,t._cur_box);
      t.enterKey=function(){
        t.playSound('choiceselect');
        var ret = t.password_input.value;
        t.password_input.value="";
        if (p.password === ret){
          if (p.passok){
            t.show_msg(p.passok,t._cur_box);
          }
          t._ask_password_rec(cmdpass,callback); 
        } else {
          if (p.passko){
            t.show_msg(p.passko,t._cur_box);
          }
          t.show_msg(callback(false,cmdpass),t._cur_box);
          t._end_password();
        }
      };
      t.scrl();
    } else {
      t.show_msg(callback(true,cmdpass));
      t._end_password();
    }
  }, 
  ask_password: function(cmdpass,callback){
    this._begin_password();
    this._ask_password_rec(cmdpass,callback);
  },
};



