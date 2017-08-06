function commonprefix(array) {
  //https://stackoverflow.com/questions/1916218/find-the-longest-common-starting-substring-in-a-set-of-strings/1917041#1917041
  var A= array.concat().sort(), 
    a1= A[0], a2= A[A.length-1], L= a1.length, i= 0;
  while(i<L && a1.charAt(i)=== a2.charAt(i)) i++;
  return a1.substring(0, i);
}
function addspace(i){return i+' ';}
function addEl(root,tag,clss,txt,title,fun){
  var el=dom.El(tag);
  if (def(clss)) {el.className=clss;}
  if (def(title)) {el.title=title;}
  if (def(txt)) {el.innerHTML='<span>'+txt+'</span>';}
  if (def(fun)) {el.onclick=fun;}
  root.appendChild(el);
  return el;
}
function addAttrs(el,attrs){
  for (var i in attrs) {
    if (attrs.hasOwnProperty(i)){
      el.setAttribute(i,attrs[i]); 
    }
  }
  return el;
}
function VTerm(context, container_id, img_id,img_mode,img_dir){
  var term = dom.Id(container_id);
  var cmd = addEl(term,'p','input');
  var t=this;
  var belt=addEl(term,'div','belt');
  var keys=addEl(belt,'div','keys');
  addEl(keys,'button','key','✗','Ctrl-U',function(e){
    t.set_line(''); t.show_suggestions(t.context.commands.map(addspace));
  });
  addEl(keys,'button','key','↹','Tab',function(e){t.make_suggestions();});
  addEl(keys,'button','key','↵','Tab',function(e){t.enter();});
  this.suggestions=addEl(belt,'div','suggest');
  this.cmdline = cmd;
  this.input = addAttrs(addEl(cmd,'input'),{autofocus:'autofocus',size:80});
  this.container = term;
  this.context = context;
  this.img_mode=img_mode.charAt(0);//follow or static
  this.img_dir=img_dir; // shall contains last slash './img/'
  this.img_element= (img_id ? dom.Id(img_id) : cmd );
  this.imgs=[];
  this.history=[];
  this.histchecking=false;
  this.histindex=0;
  this.scrolling=0;
}
VTerm.prototype={
  start: function(ctx){
    this.setContext(ctx);
    this.behave();
  },
  setContext: function(ctx){
    this.context=ctx;
    this.show_suggestions(this.context.commands.map(addspace));
  },
  push_img: function(img){
    this.imgs.push(img);
  },
  show_img: function(){
    var t=this;
    if (t.imgs.length>0) {
      if (t.img_mode === 's'){
        var i=t.imgs.pop();
        if (i.hasOwnProperty('src')){
          addAttrs(t.img_element, {src: t.img_dir + i.src, alt:i.alt, title:i.title});
        } else {
          //Always show blank image when moving into a room
          addAttrs(t.img_element, {src: t.img_dir + img.room_none.src, alt:img.room_none.alt, title:img.room_none.title});
        }
      } else {
        var c = dom.El('div'); c.className = "img-container";
        for (var i in t.imgs) {
          if (t.imgs.hasOwnProperty(i)){
            var im=t.imgs[i];
            if (im && im.alt.length > 0){
              addAttrs(addEl(c,'img'),{src:t.img_dir + im.src,title:im.title,alt:im.alt})
                .
//                onload=t.scrl;
                onload=function(){
//                  setTimeout(function() {
                    t.scrl();
//                  },200); 
                };
            }
          } 
        }
        this.container.insertBefore(c, this.img_element);
      }
      this.imgs=[];
    } 
  },
  show_previous_prompt: function (txt){
    var msg=dom.El('p');
    msg.innerText = txt;
    msg.className = "input";
    this.container.insertBefore(msg,this.cmdline);
  },

  get_line:function(){
    return this.input.value.replace(/\s+/," ");
  },
  set_line:function(val){
    this.input.value = val;
  },
  show_msg: function (txt){
    var m=dom.El('p'); m.innerText = txt; m.className = "msg";
    this.container.insertBefore(m,this.cmdline);
  },
  make_suggestions: function (autocomplete){
    var t=this;    
    var ac=d(autocomplete,true);
    t.suggestions.innerHTML = '';
    var l=t.get_line();
    args=l.split(' ');
    if (args.length > 0) {
      var tocomplete;
      var match;
      if (args.length > 1) {
        tocomplete=args.pop();
        match=t.context._completeArgs(args[0],tocomplete);
      } else if (args[0].length>0) {
        tocomplete="";
        t.set_line(l+' ');
        match=t.context._completeArgs(args[0],tocomplete);
      } else {
        tocomplete="";
        match=t.context.commands.map(addspace);
      }
      if (match.length == 0){
        t.set_line(l+'?');
        setTimeout(function(){t.set_line(l+'??');},100)
        setTimeout(function(){t.set_line(l);},200)
      } else if (match.length == 1 ){
        if (ac) {
          var lb=tocomplete.split('/');
          lb.pop();
          lb.push(match[0]);
          args.push(lb.join('/'));
          t.set_line(args.join(" "));
        } else {
          t.show_suggestions(match); 
        }
      } else {
        var lcp=commonprefix(match);
        t.show_suggestions(match);
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
    var m=dom.El('button'); m.innerHTML='<span>'+txt+'</span>';
    var t=this;
    t.histindex=0;
    m.onclick =function (e){
      var l=t.get_line();
      var newl=l+txt;
      t.set_line(newl);
      //      t.hide_suggestions();
      if (t.argsValid(newl.replace(/\s+$/,"").split(" "))){
        t.enter();
      } else {
        t.make_suggestions(false);
      }
    }
    t.suggestions.appendChild(m);
    t.scrl();
  },
  hide_suggestions: function (){
    this.suggestions.innerHTML = '';
  },
  argsValid: function(args){
    return this.context._validArgs(args.shift(),args);
  },
  enter : function(){
    var t=this;   
    var pr=t.input;
    t.histindex=0;
    // Enter -> exec command
    args=t.get_line().replace(/\s+$/,"").split(' ');
    echo=t.context.exec(t, args);
    t.show_previous_prompt(pr.value);
    t.history.push(pr.value);
    t.show_img();
    t.show_msg(echo);
    t.set_line('');
    t.hide_suggestions();
    t.show_suggestions(this.context.commands.map(addspace));
  },
  scrl : function(){
    // we want to scroll to the bottom
    var c=this.container;
    var increment = this.input.clientHeight, time = 300;
    var tinc=1;var ttim=20;
    var t=this;
    this.scrolling++;
    function scroller() {
      if (this.scrolling>1){
        this.scrooling--;
      } else {
        var diff= c.offsetTop + c.offsetHeight - window.pageYOffset - window.innerHeight;
        if ( diff > 0){
          window.scrollBy( 0,increment );
          setTimeout(scroller, time);
        } else {
          this.scrolling--;
        }
      } 
    }
    scroller();
  }, 
  behave: function (){
    // behavior 
    var args;
    var t=this;
    var pr=t.input;
    //    var cmd=this.cmdspan;
    var term=this.container;
    
    var echo=t.context.getStarterMsg(t);
    if (echo) {
      t.show_img();
      t.show_msg(echo);
    }
    
    dom.body.onkeydown = function (e) {
      e = e || window.event;//Get event
      var k=e.which;
      if (k === 33 || k  === 34 || k === 38 || k  === 40) {
      } else {
        var focused = d.activeElement;
        if ( !focused || focused != pr) {
          pr.focus();t.scrl();
        }
        pr.onkeydown(e);
      }
    }
    term.onclick = function (e) {
      pr.focus();
    }
    window.onbeforeunload = function(e) {
      return 'Quit the game ?';
    }
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
    }
    pr.onkeyup = function (e) {
      var k=e.which;
      var echo="";
      var overide=false;
      t.hide_suggestions();
      if (k === 13) { // ENTER
        overide=true;
        t.enter();t.scrl();
      } else if (e.which === 9 && !(e.ctrlKey || e.altKey)) { // TAB
        overide=true;
        t.make_suggestions();t.scrl();
      } else if (e.ctrlKey){
        if (k === 67) { // CTRL+C - clear
          overide=true;
          t.show_previous_prompt(t.get_line() + '^C');
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
          if (t.histindex==0){
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
    }
  }
}



