subchart.pie = function(opt){
  opt == null && (opt = {});
  this.host = opt.host;
  this.svg = opt.svg;
  this.aniloop = opt.aniloop;
  this.timeline = opt.timeline;
  return this;
};
subchart.pie.prototype = import$(Object.create(Object.prototype), {
  hide: function(){
    return this.svg.classList.toggle('d-none', true);
  },
  prepare: function(){
    var ref$, ref1$, timeline, aniloop;
    this.svg.classList.toggle('d-none', false);
    this.box = this.svg.getBoundingClientRect();
    this.values = (ref$ = this.host).values;
    this.years = ref$.years;
    this.valtypes = ref$.valtypes;
    this.categories = ref$.categories;
    this.pie = d3.pie();
    this.pie.value(function(it){
      return it.val;
    });
    this.arc = d3.arc().innerRadius(0).outerRadius(200);
    this.data = this.categories.filter(function(it){
      return !(it === '合計');
    }).map(function(d, i){
      return {
        key: d,
        val: 0
      };
    });
    ref1$ = [this.timeline, this.aniloop], timeline = ref1$[0], aniloop = ref1$[1];
    aniloop.setObj(this);
    timeline.set({
      years: this.years,
      svg: this.svg
    });
    return aniloop.reset();
  },
  delta: function(t){
    var offset, idx, percent, this$ = this;
    offset = t / 1000;
    idx = Math.floor(offset);
    percent = offset - idx;
    idx = idx % 10;
    this.data.map(function(d, i){
      var v1, v2;
      v1 = +this$.values[d.key][idx];
      v2 = +this$.values[d.key][(idx + 1) % this$.years.length];
      v1 = isNaN(v1) ? 0 : v1;
      v2 = isNaN(v2) ? 0 : v2;
      return this$.data[i].val = (v2 - v1) * percent + v1;
    });
    this.data.sort(function(a, b){
      if (b.val > a.val) {
        return 1;
      } else if (b.val < a.val) {
        return -1;
      } else {
        return 0;
      }
    });
    this.data.map(function(d, i){
      if (d.idx !== i) {
        if (!(d.odx != null)) {
          d.odx = i;
        }
        d.idx = i;
      }
      return d.odx = (d.idx - d.odx) * 0.2 + d.odx;
    });
    return this.arcs = this.pie(this.data);
  },
  render: function(){
    var obj, x$, y$, z$;
    obj = this;
    x$ = d3.select(this.svg).selectAll('g.pie').data([1], function(it){
      return it;
    });
    x$.exit().remove();
    y$ = x$.enter().append('g');
    y$.attr('class', 'pie');
    y$.attr('transform', "translate(" + this.box.width / 2 + "," + this.box.height / 2 + ")");
    z$ = d3.select(this.svg).selectAll('g.pie').selectAll('path.arc').data(this.arcs);
    z$.exit().remove();
    z$.enter().append('path').attr('class', 'arc');
    return d3.select(this.svg).selectAll('path.arc').attr('d', this.arc).attr('fill', function(d, i){
      return obj.host.scale.color(d.data.key);
    });
  }
});
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}