
add_test(function(next){
  vt.set_line('cat "Il était un fois..."');
  vt.enter();
  setTimeout(next,2000);
});
