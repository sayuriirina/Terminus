/* Terminal interface which solve completion problem */

function commonprefix(array) {
  //https://stackoverflow.com/questions/1916218/find-the-longest-common-starting-substring-in-a-set-of-strings/1917041#1917041
  var A= array.concat().sort(), 
    a1= A[0], a2= A[A.length-1], L= a1.length, i= 0;
  while(i<L && a1.charAt(i)=== a2.charAt(i)) i++;
  return a1.substring(0, i);
}
function addspace(i){return i+' ';}

function VTerm(container_id, img_dir,  img_id, context){
  var t=this;
  /* non dom properties */
  t.context = context;
  t.img_dir=(img_dir ? img_dir : './img/'); // shall contains last slash './img/'
  t.charduration=10;
  t.imgs=[];
  t.history=[];
  t.histchecking=false;
  t.histindex=0;
  t.scrl_lock=false;
  /* dom properties (view) */
  t.container = dom.Id(container_id);
  t.monitor = addEl(t.container,'div','monitor');
  inputdiv = addEl(addEl(t.container,'div','input-container'),'div','input-div');
  t.cmdline = addEl(inputdiv,'p','input');
  t.input = addEl(t.cmdline,'input',{size:80});
  var b=addEl(inputdiv,'div','belt');
  var k=addEl(b,'div','keys');
  t.suggestions= addEl(b,'div','suggest');
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
  disable_input:function(){
    var t=this;
    t.btn_clear.setAttribute('disabled','');
    t.btn_tab.setAttribute('disabled','');
    t.cmdline.removeChild(t.input);
    t.suggestions.setAttribute('style','display:none');
  },
  enable_input:function(){
    var t=this;
    t.cmdline.appendChild(t.input);
    t.btn_clear.removeAttribute('disabled');
    t.btn_tab.removeAttribute('disabled');
    t.enterKey=t.enter;
    t.suggestions.removeAttribute('style');
    t.input.focus();
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
  _show_chars: function (msgidx,msg,txttab){
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
         msg.innerHTML += tag ;
         t.playSound('tag');
         timeout=10;
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
       if (t.msg_idx==msgidx){
         setTimeout(function(){
           t._show_chars(msgidx,msg,txttab);
         },timeout*t.charduration);
       } 
    } else {
      t.playSound('endoftext');
    }
  },
  show_msg: function (txt){
    if (def(txt)){
      var t=this;
      txttab=txt.split('');
      var msg=addEl(t.monitor,'p','msg');
      t.msg_idx++;
      msg.focus();
      t._show_chars(t.msg_idx,msg,txttab);
//msg.innerHTML=txt;
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
      if (match.length === 0){
        t.set_line(l+'?');
        setTimeout(function(){t.set_line(l+'??');},100);
        setTimeout(function(){t.set_line(l);},200);
      }
      else if (match.length == 1 ){
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
        t.show_suggestions(match);
        if (match.indexOf(lcp)>-1){
          t.set_line(l+' ');
        }
        if (lcp.length > 0 && ac){
          args.push(lcp);
          t.set_line(args.join(" "));
        }
      }
    }
  },
  show_suggestions: function (list){
    this.suggestions.innerHTML = '';
    for (var i=0;i<list.length; i++){
      this.show_suggestion(list[i]);
    }
  },
  show_suggestion: function (txt){
    var t=this;
    t.histindex=0;
    addBtn(t.suggestions,undefined,txt,txt,function (e){
      var l=t.get_line();
      var newl=l+txt;
      t.set_line(newl);
      //      t.hide_suggestions();
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
    t.playSound('choiceselect');
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
  behave: function (){
    // behavior 
    var args;
    var t=this;
    var pr=t.input;
    //    var cmd=this.cmdspan;

    dom.body.onkeydown = function (e) {
      e = e || window.event;//Get event
      var k=e.which;
      if(def(t.choose_input)){
        t._choose_key(k,e);
      }else if(def(t.password_input)){
        t._password_key(k,e);
      }else{
        if (k === 33 || k  === 34 || k === 38 || k  === 40) {
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
    }
    };

    window.onbeforeunload = function(e) {
      return 'Quit the game ?';
    };
    pr.onkeydown = function (e) {
      var k=e.which;
      var overide=false;
      if ( k === 9 || k == 13 ) { // TAB - ENTER
        overide=true;
      } else if ( e.ctrlKey ) {
        if (k === 67  || k === 88 || k === 86 || k === 89 || k === 90  ) { 
          // CTRL+C - CTRL+X - CTRL+V - CTRL+Y -CTRL+Z
          overide=true;
        }
      } else if (k === 33 || k  === 34 ){
        window.focus();
        pr.blur();
      }
      if ( k === 38 || k  === 40) {
        overide=true;
      }
      if (overide) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    pr.onkeyup = function (e) {
      var k=e.which;
      var echo="";
      var overide=false;
      t.hide_suggestions();
      if (k === 13) { // ENTER
        overide=true;
        t. enter();t.scrl();
      } else if (e.which === 9 && !(e.ctrlKey || e.altKey)) { // TAB
        overide=true;
        t.make_suggestions();t.scrl();
      } else if (e.ctrlKey){
        if (k === 67) { // CTRL+C - clear
          overide=true;
          t.show_previous_prompt(t.get_line() + '^C');
          t.msg_idx++;
          t.set_line('');
        } else if (k === 85) { // CTRL+U - clear line
          overide=true;
          t.set_line('');
        } else if ( k === 88 || k === 86 || k === 89 || k === 90  ) {
          // CTRL + X - CTRL + V - CTRL + Z - CTRL + Y
          // replace CTRL + W - remove last component
          overide=true;
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
      } else if (k === 33 || k  === 34) {
        // pgup / pgdn / up / down
        window.focus();
        // Remove focus from any focused element
        pr.blur();
      } else if (k  === 40) {//down
        if (t.histindex>0){
          t.histindex--;
          t.set_line(t.history[t.history.length-1-t.histindex]);
        } 
      } else if ( k === 38) {//up
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
      //      console.log(k);
      //    cmdspan.innerText=pr.value;
      if (overide) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
    };
  },
/** Choice prompt **/
  _begin_choose: function(){//TODO
    var t = this;
    t.set_line('');
    t.choose_input = addEl(t.cmdline,'fieldset');
    t.disable_input();
  },
  _end_choose: function(){
    var t = this;
    t.show_previous_prompt(t.choose_input.value);
    t.cmdline.removeChild(t.choose_input);
    t.choose_input = undefined;t.enable_input();
  },
  _ask_choose:function(question,choices,callback){
    var t=this;
    var choices_btn=[];
    var curidx=0;
    t.show_msg(question);
    var click=function(e){
      var i=e.target.getAttribute('idx');
      addAttrs(choices_btn[curidx],{checked:''});
      addAttrs(choices_btn[i],{checked:'checked'});
      curidx=i;
      return t.enterKey();
    };
    t.enterKey=function(e){
      t.playSound('choiceselect');
      t.choose_input.value=choices[curidx];
      t._end_choose();
      t.show_msg(callback(i));
    };
    t._choose_key=function(k,e){
      if (k==38||k==39||(!e.shiftKey && k==9)){
        if (curidx<choices_btn.length){
          t.playSound('choicemove');
          addAttrs(choices_btn[curidx],{checked:''});
          addAttrs(choices_btn[++curidx],{checked:'checked'});
        }
      }else if (k==37||k==40||(e.shiftKey && k==9)){
        if (curidx>0){
          t.playSound('choicemove');
          addAttrs(choices_btn[curidx],{checked:''});
          addAttrs(choices_btn[--curidx],{checked:'checked'});
        }
      } else if (k==13) {
        t.enterKey();
      }
      e.preventDefault(); 
    };

    for (var i=0;i<choices.length;i++){
      choices_btn.push(
        addEl(t.choose_input,'input',{
          type:'radio',
          name:'choose',
          idx:i,id:'radio'+i
        })
      );
      choices_btn[i].onclick=click;
      addEl(t.choose_input,'label',{
        for:'radio'+i
      }).innerText=choices[i];
    }
    addAttrs(choices_btn[0],{checked:'checked'});
    t.scrl();
  }, 
  ask_choose: function(question,choices,callback){
    this._begin_choose();
    this._ask_choose(question,choices,callback);
  },

/** Question prompt **/
  _begin_answer: function(){
    var t = this;
    t.set_line('');
    t.answer_input =addEl(t.cmdline,'input',{size:80});
    t.answer_input.focus();
    t.answer_input.onkeyup=function(e){
      var k=e.which;
      if (k === 13) { // ENTER
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
    t.cmdline.removeChild(t.answer_input);
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
    t.password_input =addEl(t.cmdline,'input',{size:20,type:'password'});
    t.password_input.focus();
    t.password_input.onkeyup=function(e){
      var k=e.which;
      if (k === 13) { // ENTER
        t.enterKey();
        e.preventDefault();
        t.scrl();
      }
    };
    t.disable_input();
  },
  _end_password: function(){
    var t = this;
    t.show_previous_prompt(shuffleStr(t.password_input.value,0.5));
    t.cmdline.removeChild(t.password_input);
    t.password_input = undefined;t.enable_input();
  },
  _password_key:function(k,e){
  //nothing
  },
  _ask_password_rec:function(cmdpass,callback){
    var t=this;
    if (cmdpass.length > 0){
      var p=cmdpass.shift();
      var question=d(p.question,_('ask_password'));
      t.show_msg(question);
      t.enterKey=function(){
        t.playSound('choiceselect');
        var ret = t.password_input.value;
        t.password_input.value="";
        if (p.password === ret){
          t._ask_password_rec(cmdpass,callback); 
        } else {
          t.show_msg(callback(false,cmdpass));
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



