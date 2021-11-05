ld$.fetch("assets/data/annual-report/cat6.json", {
  method: 'GET'
}, {
  type: 'json'
}).then(function(dataset){
  var c;
  c = new Ctrl({
    root: '#sect-interface'
  });
  return c.init({
    dataset: dataset
  }).then(function(){
    return debounce(1000);
  }).then(function(){
    return Doc({
      ctrl: c
    });
  });
});