subchart.bar = function(opt){
  opt == null && (opt = {});
  this.host = opt.host;
  this.svg = opt.svg;
  this.demo = opt.demo;
  this.timeline = opt.timeline;
  this.aniloop = opt.aniloop;
  return this;
};
subchart.bar.prototype = import$(import$(Object.create(Object.prototype), subchart['interface']), {
  len: 10,
  timeDelta: 0,
  scale: {},
  hide: function(){
    return this.svg.classList.toggle('d-none', true);
  },
  prepare: function(){
    var ref$, ref1$, timeline, aniloop, list, k, v, min, max;
    this.svg.classList.toggle('d-none', false);
    this.box = this.svg.getBoundingClientRect();
    this.values = (ref$ = this.host).values;
    this.years = ref$.years;
    this.valtypes = ref$.valtypes;
    this.categories = ref$.categories;
    ref1$ = [this.timeline, this.aniloop], timeline = ref1$[0], aniloop = ref1$[1];
    aniloop.setObj(this);
    timeline.set({
      years: this.years,
      svg: this.svg
    });
    aniloop.reset();
    list = (function(){
      var ref$, results$ = [];
      for (k in ref$ = this.values) {
        v = ref$[k];
        results$.push([k, v]);
      }
      return results$;
    }.call(this)).filter(function(it){
      return !(it[0] === '合計');
    }).map(function(it){
      return it[1].map(function(it){
        return +it;
      }).filter(function(it){
        return !isNaN(it);
      });
    });
    min = Math.min.apply(Math, list.map(function(it){
      return Math.min.apply(Math, it);
    }));
    max = Math.max.apply(Math, list.map(function(it){
      return Math.max.apply(Math, it);
    }));
    this.textLen = Math.max.apply(Math, this.categories.map(function(it){
      return it.length;
    }));
    this.data = this.categories.filter(function(it){
      return !(it === '合計');
    }).map(function(d, i){
      return {
        key: d,
        val: 0
      };
    });
    this.dh = (this.box.height - 80) / this.data.length;
    if (this.demo) {
      this.scale = d3.scaleLinear().domain([0, max]).range([this.textLen * 14 + 10, this.box.width - 30]);
    } else {
      this.scale = d3.scaleLinear().domain([0, max]).range([this.textLen * 20 + 10, this.box.width - 30]);
    }
    if (this.host.active) {
      aniloop.setTime((this.host.active.year - this.years[0]) * 1000, true);
      aniloop.pause();
      return aniloop.render();
    }
  },
  delta: function(t){
    var offset, idx, percent, this$ = this;
    offset = t / 1000;
    idx = Math.floor(offset);
    percent = offset - idx;
    idx = idx % (this.years.length - 1);
    if (aniloop.main.time.keep && !idx && t > 0) {
      idx = this.years.length - 1;
    }
    this.data.map(function(d, i){
      var v1, v2;
      v1 = +this$.values[d.key][idx];
      v2 = +this$.values[d.key][(idx + 1) % this$.years.length];
      v1 = isNaN(v1) ? 0 : v1;
      v2 = isNaN(v2) ? 0 : v2;
      this$.data[i].val = (v2 - v1) * percent + v1;
      if (aniloop.main.time.keep) {
        return this$.data[i].val = v1;
      }
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
    if (aniloop.main.time.keep) {
      return this.render(t);
    }
  },
  render: function(t){
    var obj, initSel, sel, this$ = this;
    obj = this;
    initSel = d3.select(this.svg).selectAll('g.bar').data(this.data, function(it){
      return it.key;
    });
    initSel.exit().remove();
    initSel.enter().append('g').attr('class', 'bar').each(function(d, i){
      d3.select(this).append('rect');
      d3.select(this).append('text').attr('class', 'value').attr('opacity', obj.demo ? 0 : 1);
      return d3.select(this).append('text').attr('class', 'label').attr('text-anchor', 'end').attr('dy', '.38em').attr('opacity', obj.demo ? 1 : 1);
    });
    sel = d3.select(this.svg).selectAll('g.bar').attr('transform', function(d, i){
      var y;
      y = d.odx * (this$.dh + 1) + 10;
      if (aniloop.main.time.keep) {
        y = d.idx * (this$.dh + 1) + 10;
      }
      return "translate(10," + y + ")";
    }).each(function(d, i){
      var w, v;
      w = obj.scale(d.val) - obj.scale(0);
      v = d.val;
      v = v > 10000
        ? Number(v / 1000).toFixed(1) + "k"
        : Number(v).toFixed(2);
      d3.select(this).select('text.label').text(d.key).attr('x', obj.scale(0) - 10).attr('y', obj.dh / 2);
      d3.select(this).select('text.value').attr('x', obj.scale(d.val) + (w > 20 * 10 ? -5 : 5)).attr('y', obj.dh / 2).attr('dy', '.38em').attr('text-anchor', w > 20 * 10 ? 'end' : 'start').text(v);
      return d3.select(this).select('rect').attr('x', obj.scale(0)).attr('width', w).attr('height', function(){
        return obj.dh;
      }).attr('fill', function(){
        return obj.host.scale.color(d.key);
      });
    });
    if (!this.demo) {
      return this.chartInfo(t, 'right');
    }
  }
});
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}