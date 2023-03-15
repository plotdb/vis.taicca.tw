subchart.map = function(opt){
  opt == null && (opt = {});
  this.host = opt.host;
  this.svg = opt.svg;
  this.aniloop = opt.aniloop;
  this.timeline = opt.timeline;
  return this;
};
subchart.map.prototype = import$(import$(Object.create(Object.prototype), subchart['interface']), {
  hide: function(){
    return this.svg.classList.toggle('d-none', true);
  },
  prepare: function(){
    var ref$, ref1$, timeline, aniloop, p, this$ = this;
    this.values = (ref$ = this.host).values;
    this.years = ref$.years;
    this.valtypes = ref$.valtypes;
    this.categories = ref$.categories;
    this.svg.classList.toggle('d-none', false);
    this.box = this.svg.getBoundingClientRect();
    this.popup = debounce(350, function(d){
      return this$._popup(d);
    });
    ref1$ = [this.timeline, this.aniloop], timeline = ref1$[0], aniloop = ref1$[1];
    p = this.inited
      ? Promise.resolve()
      : (this.pdmap = new pdmaptw({
        root: this.svg,
        type: 'county',
        baseurl: "assets/lib/pdmaptw/main",
        padding: 40
      }), this.pdmap.init().then(function(){
        return this$.inited = true;
      }));
    return p.then(function(){
      this$.pdmap.fit();
      aniloop.setObj(this$);
      timeline.set({
        years: this$.years,
        svg: this$.svg
      });
      aniloop.reset();
      if (this$.host.active) {
        aniloop.setTime((this$.host.active.year - this$.years[0]) * 1000);
        aniloop.pause();
        return aniloop.render();
      }
    });
  },
  delta: function(){},
  _popup: function(data){
    var popup, ref$, pbox, x, y, r, box, this$ = this;
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
              return node.innerText = context.properties.name;
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
              return node.innerText = context.properties.value;
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
    pbox = data.properties.node.getBoundingClientRect();
    ref$ = [pbox.x + pbox.width / 2, pbox.y + pbox.height / 2], x = ref$[0], y = ref$[1], r = ref$[2];
    box = popup.getBoundingClientRect();
    return import$(popup.style, {
      left: x + "px",
      top: (y > this.box.height / 2
        ? y - box.height
        : y + box.height) + "px",
      opacity: 1
    });
  },
  render: function(t){
    var time;
    this.dataset = this.host.dataset;
    time = this.timeline.getTime();
    if (!t || this.activeTime !== Math.floor(time)) {
      this.activeTime = Math.floor(time);
      return this.renderAlt(t);
    }
  },
  renderAlt: function(t){
    var mapData, mapYear, mapVals, k, v, min, max, yearIdx, scale, ticks, x$, y$, z$, this$ = this;
    this.dataset = this.host.dataset;
    mapData = this.dataset["縣市"].attr[this.host.valtype].data;
    mapYear = this.dataset["縣市"].label;
    mapVals = (function(){
      var ref$, results$ = [];
      for (k in ref$ = mapData) {
        v = ref$[k];
        results$.push([k, v]);
      }
      return results$;
    }()).filter(function(it){
      var ref$;
      return !((ref$ = it[0]) === '無法區分' || ref$ === '合計');
    }).map(function(it){
      return it[1].map(function(it){
        return +it;
      }).filter(function(it){
        return !isNaN(it);
      });
    });
    min = Math.min.apply(Math, mapVals.map(function(it){
      return Math.min.apply(Math, it);
    }));
    max = Math.max.apply(Math, mapVals.map(function(it){
      return Math.max.apply(Math, it);
    }));
    yearIdx = this.activeTime % mapYear.length;
    d3.select(this.svg).select('g.pdmaptw').selectAll('path').each(function(d, i){
      var n;
      n = d.properties.name.replace(/台/g, "臺");
      d.properties.value = +mapData[n][yearIdx];
      return d.properties.node = this;
    }).on('mouseover', function(d, i){
      this$.popup.clear();
      return this$.popup(d);
    }).on('mouseout', function(d, i){
      return this$.popup();
    });
    scale = d3.scaleSequential(d3.interpolateCividis).domain([min, max]);
    ticks = scale.ticks(5);
    d3.select(this.svg).select('g.pdmaptw').selectAll('path').transition().duration(350).attr('fill', function(it){
      return scale(it.properties.value);
    });
    x$ = d3.select(this.svg).selectAll('text.unit').data([1], function(it){
      return it;
    });
    x$.exit().remove();
    x$.enter().append('text').attr('class', 'unit');
    d3.select(this.svg).selectAll('text.unit').text("單位: " + this.host.unit).attr('x', 16).attr('y', 24).attr('font-size', '.8em');
    y$ = d3.select(this.svg).selectAll('g.color-legends').data([1], function(it){
      return it;
    });
    y$.exit().remove();
    y$.enter().append('g').attr('class', 'color-legends');
    d3.select(this.svg).selectAll('g.color-legends').attr('transform', "translate(24,42)");
    z$ = d3.select(this.svg).select('g.color-legends').selectAll('g.color-legend').data(ticks);
    z$.exit().remove();
    z$.enter().append('g').attr('class', 'color-legend').each(function(d, i){
      d3.select(this).append('circle');
      return d3.select(this).append('text');
    });
    d3.select(this.svg).selectAll('g.color-legend').attr('transform', function(d, i){
      return "translate(0," + i * 20 + ")";
    }).each(function(d, i){
      d3.select(this).select('circle').attr('fill', scale(d)).attr('r', 6);
      return d3.select(this).select('text').attr('dy', '.38em').attr('dx', 9).attr('font-size', '.8em').text(d);
    });
    return this.chartInfo(t, 'right');
  }
});
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}