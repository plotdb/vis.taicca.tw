subchart.bubble = function(opt){
  opt == null && (opt = {});
  this.host = opt.host;
  this.svg = opt.svg;
  this.aniloop = opt.aniloop;
  this.timeline = opt.timeline;
  return this;
};
subchart.bubble.prototype = import$(import$(Object.create(Object.prototype), subchart['interface']), {
  timeDelta: 0,
  scale: {},
  hide: function(){
    return this.svg.classList.toggle('d-none', true);
  },
  prepare: function(){
    var ref$, ref1$, timeline, aniloop, list, k, v, min, max, this$ = this;
    this.sim = null;
    this.svg.classList.toggle('d-none', false);
    this.box = this.svg.getBoundingClientRect();
    this.popup = debounce(350, function(d){
      return this$._popup(d);
    });
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
    this.scale = d3.scaleLinear().domain([0, Math.sqrt(max)]).range([2, 100]);
    if (this.host.active) {
      aniloop.setTime((this.host.active.year - this.years[0]) * 1000, true);
      aniloop.pause();
      return aniloop.render();
    }
  },
  delta: function(t){
    var offset, idx, percent, hash, fc, this$ = this;
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
    hash = {};
    this.data.map(function(it){
      return hash[it.key] = it;
    });
    this.data.map(function(d, i){
      if (d.idx !== i) {
        if (!(d.odx != null)) {
          d.odx = i;
        }
        d.idx = i;
      }
      d.odx = (d.idx - d.odx) * 0.2 + d.odx;
      d.r = this$.scale(Math.sqrt(d.val));
      if (!d.x) {
        d.x = this$.box.width / 2;
      }
      if (!d.y) {
        return d.y = (this$.box.height - 40) / 2;
      }
    });
    if (!this.sim) {
      this.fc = fc = d3.forceCollide();
      this.sim = d3.forceSimulation().force('x', this.fx = d3.forceX(this.box.width / 2).strength(0.1)).force('y', this.fy = d3.forceY((this.box.height - 40) / 2).strength(0.1)).force('collide', fc);
      this.sim.stop();
    }
    this.sim.nodes(this.data);
    this.fc.radius(function(it){
      return it.r + 2;
    });
    this.sim.alpha(0.6);
    this.sim.tick(200);
    this.fx.strength(0.01);
    return this.fy.strength(0.01);
  },
  _popup: function(data){
    var popup, ref$, x, y, r, box, this$ = this;
    if (!this.view) {
      this.view = new ldView({
        root: ld$.find('[ld-scope=perspective-popup]', 0),
        context: data,
        handler: {
          popup: function(){},
          catname: function(arg$){
            var node, context;
            node = arg$.node, context = arg$.context;
            if (context) {
              return node.innerText = context.key;
            }
          },
          unit: function(arg$){
            var node, context;
            node = arg$.node, context = arg$.context;
            return node.innerText = this$.host.unit;
          },
          valname: function(arg$){
            var node, context;
            node = arg$.node, context = arg$.context;
            return node.innerText = this$.host.valtype;
          },
          value: function(arg$){
            var node, context;
            node = arg$.node, context = arg$.context;
            if (context) {
              return node.innerText = context.val;
            }
          }
        }
      });
    }
    popup = this.view.get('popup');
    if (!data) {
      return ref$ = popup.style, ref$.opacity = 0, ref$;
    }
    this.view.setContext(data);
    this.view.render();
    ref$ = [data.x + this.box.x, data.y + this.box.y, data.r], x = ref$[0], y = ref$[1], r = ref$[2];
    box = popup.getBoundingClientRect();
    return import$(popup.style, {
      left: x + "px",
      top: y + "px",
      opacity: 1
    });
  },
  render: function(t){
    var obj, x$, y$, legend, z$, legendGroup, vp, this$ = this;
    obj = this;
    x$ = d3.select(this.svg).selectAll('circle.bubble').data(this.data);
    x$.exit().remove();
    x$.enter().append('circle').attr('class', 'bubble').on('mouseover', function(d, i){
      this$.popup.clear();
      return this$.popup(d);
    }).on('mouseout', function(d, i){
      return this$.popup();
    });
    d3.select(this.svg).selectAll('circle.bubble').attr('cx', function(d, i){
      return d.x;
    }).attr('cy', function(d, i){
      return d.y;
    }).attr('r', function(d, i){
      var ref$;
      return (ref$ = d.r) > 2 ? ref$ : 2;
    }).attr('fill', function(d, i){
      return obj.host.scale.color(d.key);
    });
    y$ = d3.select(this.svg).selectAll('g.label').data(this.data);
    y$.exit().remove();
    y$.enter().append('g').on('mouseover', function(d, i){
      this$.popup.clear();
      return this$.popup(d);
    }).on('mouseout', function(d, i){
      return this$.popup();
    }).attr('class', 'label').each(function(d, i){
      var this$ = this;
      return [0, 1].map(function(){
        return d3.select(this$).append('text');
      }).map(function(it){
        return it.attr('dy', '-.28em').attr('text-anchor', 'middle').attr('font-size', '.9em').style('pointer-event', 'none');
      });
    });
    d3.select(this.svg).selectAll('g.label').attr('transform', function(d, i){
      return "translate(" + d.x + "," + d.y + ")";
    }).each(function(d, i){
      return d3.select(this).selectAll('text').attr('opacity', d.r * 2 < (d.val.toFixed(2) + "").length * 5 ? 0 : 1).attr('dy', function(e, i){
        if (i === 0) {
          return '-.28em';
        } else {
          return '.88em';
        }
      }).text(function(e, i){
        if (i === 0) {
          if (d.val > 1000000) {
            return (d.val / 1000000).toFixed(2) + "M";
          } else if (d.val > 1000) {
            return (d.val / 1000).toFixed(2) + "K";
          } else {
            return d.val.toFixed(2);
          }
        } else {
          return d.key;
        }
      });
    });
    legend = d3.legendColor().shape('path', d3.symbol().type(d3.symbolCircle).size(100)()).shapePadding(5).scale(this.host.scale.color);
    z$ = d3.select(this.svg).selectAll('g.legend').data([this.host.cattype], function(it){
      return it;
    });
    z$.exit().remove();
    z$.enter().append('g').attr('class', 'legend text-sm').call(legend);
    legendGroup = ld$.find(this.svg, 'g.legend', 0);
    d3.select(this.svg).selectAll('g.legend').selectAll('.cell').style('display', function(d, i){
      if (d === '全不選' || d === '反向選取' || d === '全選') {
        return 'none';
      }
    });
    vp = {
      x: this.box.width - cfg.margin - cfg.legendPl - legendGroup.getBoundingClientRect().width
    };
    d3.select(this.svg).selectAll('g.legend').attr('transform', "translate(" + vp.x + ", 24)");
    return this.chartInfo(t);
  }
});
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}