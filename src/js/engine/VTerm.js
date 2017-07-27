


function VTerm(context, container_id, img_id,img_mode,img_dir){
  var term = document.getElementById(container_id);
  var cmdline = document.createElement('p');
  cmdline.className = "input";
//  var cmdspan = document.createElement('span');
  var pr = document.createElement('input');
  this.history=[];
  pr.autofocus="autofocus";
  pr.autocomplete="on";
  pr.value='ls';
  pr.size=80;
//  cmdline.appendChild(cmdspan);
  var suggestions=document.createElement('div');
  suggestions.className = "suggest";
  cmdline.appendChild(pr);
  cmdline.appendChild(suggestions);
  term.appendChild(cmdline);
  this.suggestions=suggestions;
  this.cmdline = cmdline;
//  this.cmdspan = cmdspan;
  this.input = pr;
  this.container = term;
  this.context = context;
  this.img_mode=img_mode.charAt(0);//follow or static
  this.img_dir=img_dir; // shall contains last slash './img/'
  this.img_element= (img_id ? document.getElementById(img_id) : cmdline );
  this.imgs=[];
//  cmdspan.innerText=pr.value;
  this.behave();
}
VTerm.prototype={
  setContext: function(ctx){
    this.context=ctx;
  },
  push_img: function(img){
    this.imgs.push(img);
  },
  show_img: function(){
    var imge = this.img_element;
    var t=this;
    if (this.imgs.length>0) {
      if (this.img_mode === 's'){
        var img=this.imgs.pop();
        if (img.hasOwnProperty('src')){
          imge.setAttribute("src", this.img_dir + img.src);
          imge.setAttribute("alt", img.alt);
          imge.setAttribute("title", img.title);
        } else {
          //Always show blank image when moving into a room
          imge.setAttribute("src", this.img_dir + img.room_none.src);
          imge.setAttribute("alt", img.room_none.alt);
          imge.setAttribute("title", img.room_none.title);
        }
      } else {
        var c = document.createElement('div');
        c.className = "img-container";
        for (var i in this.imgs) {
          if (this.imgs.hasOwnProperty(i)){
            if (this.imgs[i] && this.imgs[i].alt){
              var el = document.createElement('img');
              el.src = this.img_dir + this.imgs[i].src;
              el.title = this.imgs[i].title;
              el.alt = this.imgs[i].alt;
              c.appendChild(el);
              el.onload=function(){
                window.scrollTo(0,t.cmdline.offsetTop + t.cmdline.offsetHeight);
              };
            }
          } 
        }
        this.container.insertBefore(c, imge);
      }
      this.imgs=[];
    } 
  },
  show_previous_prompt: function (txt){
    var msg=document.createElement('p');
    msg.innerText = txt;
    msg.className = "input";
  
    this.history.push(txt);
  
    this.container.insertBefore(msg,this.cmdline);
  },
  get_line:function(){
    return this.input.value.replace(/\s+/," ");
  },
  set_line:function(val){
    this.input.value = val;
  },
  show_msg: function (txt){
    var msg=document.createElement('p');
    msg.innerText = txt;
    msg.className = "msg";
    this.container.insertBefore(msg,this.cmdline);
  },
  show_suggestions: function (txt){
    var msg=document.createElement('p');
    msg.innerText=txt;
    this.suggestions.appendChild(msg);
  },
  hide_suggestions: function (){
    this.suggestions.innerHTML = '';
  },
  behave: function (){
    // behavior 
    var args;
    var t=this;
    var pr=t.input;
//    var cmd=this.cmdspan;
    var term=this.container;
    document.body.onkeydown = function (e) {
      e = e || window.event;//Get event
      var k=e.which;
//      if (k === 33 || k  === 34 || k === 38 || k  === 40) {
      if (k === 33 || k  === 34 || k === 38 || k  === 40) {
      } else {
        var focused = document.activeElement;
        if ( !focused || focused != pr) {
          pr.focus();
          window.scrollTo(0,t.cmdline.offsetTop + t.cmdline.offsetHeight);
        }
        pr.onkeydown(e);
      }
    }
    term.onclick = function (e) {
      pr.focus();
    }
    pr.onkeydown = function (e) {
      var k=e.which;
      var overide=false;
      if ( k === 9 || k == 13 ) { // TAB - ENTER
        overide=true;
      } else if ( e.ctrlKey ) {
        if (k === 67 || k == 88) { // CTRL+C - CTRL+X
        overide=true;
        }
      } else if (k === 33 || k  === 34 || k === 38 || k  === 40) {
       window.focus();
       pr.blur();
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
      if (k === 13) {
        overide=true;
        // Enter -> exec command
        args=t.get_line().replace(/\s+$/,"").split(' ');
        echo=t.context.exec(t, args);
        t.show_previous_prompt(pr.value);
        t.show_img();
        t.show_msg(echo);
        t.set_line('');
        window.scrollTo(0,t.cmdline.offsetTop + t.cmdline.offsetHeight);
      } else if (e.which === 9 && !(e.ctrlKey || e.altKey)) { // TAB
        overide=true;
        // Tab -> complete command
        var l=t.get_line();
        args=l.split(' ');
        if (args.length > 0) {
          var tocomplete;
          if (args.length > 1) {
            tocomplete=args.pop();
          } else {
            tocomplete="";
          }
          var match=t.context._completeRoomName(args[0],tocomplete);
          if (match.length == 0){
            t.set_line(l+'?');
            setTimeout(function(){t.set_line(l);},200)
          } else if (match.length == 1){
            console.log(match);
            args.push(match[0]);
            t.set_line(args.join(" "));
          } else {
            var shortest=match[0];
            for (var i=1;i<match.length ;i++){
              if (match[i].length < shortest.length){
                shortest=match[i];
              }
            }
            for (var i=0;i<match.length ;i++){
              if (! match[i].match('^'+shortest)){
                shortest='';
              }
              t.show_suggestions(match[i]);
            }
            if (shortest.length > 0){
            console.log(args);
            args.push(shortest);
            t.set_line(args.join(" "));
            }
          }
        }
        window.scrollTo(0,t.cmdline.offsetTop + t.cmdline.offsetHeight);
      } else if (k === 37 || k === 39 ) {
        // left /right
//                } else if (history && e.which === 38 ||
//                           (e.which === 80 && e.ctrlKey)) {
                    //UP ARROW or CTRL+P
//                } else if (e.which === 82 && e.ctrlKey) { // CTRL+R
//                        } else if (e.which === 88 || e.which === 67 || e.which === 84) {
                            //CTRL+X CTRL+C CTRL+W CTRL+T
      } else if (e.ctrlKey){
        if (k === 67) { // CTRL+C - clear
          overide=true;
          t.show_previous_prompt(t.get_line() + '^C');
          t.set_line('');
//        } else if ( k === 87 ) { // CTRL + W -remove last component
        } else if ( k === 88 ) { // CTRL + X -replace CTRL + W - remove last component
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
      } else if (k === 33 || k  === 34 || k === 38 || k  === 40) {
        // pgup / pgdn / up / down
        window.focus();
        // Remove focus from any focused element
        pr.blur();
      }
//    cmdspan.innerText=pr.value;
      if (overide) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
    }
  }
}



