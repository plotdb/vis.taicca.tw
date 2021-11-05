var handler, obs;
handler = function(it){
  return it.map(function(entry){
    var v, id, ldfd;
    v = entry.isIntersecting;
    id = entry.target.getAttribute('id');
    ldfd = ld$.find("[href=\"#" + id + "\"]", 0);
    if (ldfd) {
      return ldfd.classList.toggle('highlight', v);
    }
  });
};
obs = new IntersectionObserver(handler, {});
ld$.find('[id]').map(function(it){
  return obs.observe(it);
});