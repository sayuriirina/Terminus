function commonprefix(array) {
  //https://stackoverflow.com/questions/1916218/find-the-longest-common-starting-substring-in-a-set-of-strings/1917041#1917041
  var A= array.concat().sort(), 
    a1= A[0], a2= A[A.length-1], L= a1.length, i= 0;
  while(i<L && a1.charAt(i)=== a2.charAt(i)) i++;
  return a1.substring(0, i);
}

function VTerm(context, container_id, img_id,img_mode,img_dir){
  var term = dom.Id(container_id);
  var cmd = dom.El('p'); cmd.className="input";
  var pr = dom.El('input');pr.autofocus='autofocus';pr.size=80;
  //  var cmdspan = dom.El('span'); cmdline.appendChild(cmdspan);
  //  this.cmdspan = cmdspan;  cmdspan.innerText=pr.value;
  var sug=dom.El('div'); sug.className = "suggest";
  cmd.appendChild(pr);
  cmd.appendChild(sug);
  term.appendChild(cmd);
  this.suggestions=sug;
  this.cmdline = cmd;
  this.input = pr;
  this.container = term;
  this.context = context;
  this.img_mode=img_mode.charAt(0);//follow or static
  this.img_dir=img_dir; // shall contains last slash './img/'
  this.img_element= (img_id ? dom.Id(img_id) : cmd );
  this.imgs=[];
  this.history=[];
  this.histchecking=false;
  this.histindex=0;
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
        var c = dom.El('div'); c.className = "img-container";
        for (var i in this.imgs) {
          if (this.imgs.hasOwnProperty(i)){
            var img=this.imgs[i];
//            console.log(img);
            if (img && img.alt.length > 0){
              var el = dom.El('img');
              el.src = this.img_dir + img.src;
              el.title = img.title;
              el.alt = img.alt;
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
  show_suggestions: function (txt){
    var m=dom.El('p'); m.innerText=txt;
    this.suggestions.appendChild(m);
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
    dom.body.onkeydown = function (e) {
      e = e || window.event;//Get event
      var k=e.which;
      //      if (k === 33 || k  === 34 || k === 38 || k  === 40) {
      if (k === 33 || k  === 34 || k === 38 || k  === 40) {
      } else {
        var focused = d.activeElement;
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
        t.histindex=0;
        // Enter -> exec command
        args=t.get_line().replace(/\s+$/,"").split(' ');
        echo=t.context.exec(t, args);
        t.show_previous_prompt(pr.value);
        t.history.push(pr.value);
        t.show_img();
        t.show_msg(echo);
        t.set_line('');
        window.scrollTo(0,t.cmdline.offsetTop + t.cmdline.offsetHeight);
      } else if (e.which === 9 && !(e.ctrlKey || e.altKey)) { // TAB
        overide=true;
        t.histindex=0;
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
            setTimeout(function(){t.set_line(l+'??');},100)
            setTimeout(function(){t.set_line(l);},200)
          } else if (match.length == 1){
//          console.log(match);
            args.push(match[0]);
            t.set_line(args.join(" "));
          } else {
            var lcp=commonprefix(match);
            for (var i=0;i<match.length; i++){
              t.show_suggestions(match[i]);
            }
            if (lcp.length > 0){
              args.push(lcp);
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
        } else if ( k === 88 || k === 86 || k === 89 || k === 90  ) { // CTRL + X -replace CTRL + W - remove last component
          // CTRL + V - CTRL + Z - CTRL +Y
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



