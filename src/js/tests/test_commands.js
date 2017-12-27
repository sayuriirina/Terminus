
add_test(function(next){
  console.log('TEST CMD GREP');
  _addGroup('grep');
  vt.enter();
  setTimeout(next,1000);
}); 

add_test(function(next){
  vt.set_line('grep cd Palourde');
  vt.enter();
  setTimeout(next,1000);
});

