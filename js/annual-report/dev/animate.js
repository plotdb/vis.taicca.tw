/*
svg = ld$.find \svg, 0
len = 10
data = null
dataset = [0 to 10].map -> [0 til len].map (d,i) -> {key: i, val: Math.round(Math.random! * 10000)}
render = (opt = {}) ->
  data = opt.data
  init-sel = d3.select svg .selectAll \rect .data data, (->it.key)
  init-sel.exit!remove!
  init-sel.enter!append \rect
  sel = d3.select svg .selectAll \rect
  sel
    .attr \x, (d,i) -> 0
    #.attr \y, (d,i) -> d.order * 21
    .attr \y, (d,i) -> d.odx * 21
    .attr \width, (d,i) -> 300 * d.val / 10000
    .attr \height, (d,i) -> 20
    .attr \fill, -> \#000
    .attr \fill, (d,i) -> d3.interpolateTurbo(d.key / (data.length - 1))

lc = {}
lc.data = [0 til len].map (d,i) -> {key: i, val: 0}
f = (time) ->
  if !(lc.time?) => lc.time = time
  offset = (time - lc.time)/1000
  idx = Math.floor(offset)
  percent = offset - idx
  idx = idx % 10
  lc.data.map (d,i) ->
    v1 = dataset[idx][d.key].val
    v2 = dataset[(idx + 1) % 10][d.key].val
    lc.data[i].val = ((v2 - v1) * percent) + v1
  lc.data.sort (a,b) -> if b.val > a.val => 1 else if b.val < a.val => -1 else 0
  lc.data.map (d,i) ->
    if d.idx != i =>
      if !(d.odx?) => d.odx = i
      d.idx = i
      d.itime = time
    d.odx = ((d.idx - d.odx) * 0.2) + d.odx

  render {data: lc.data}
  requestAnimationFrame (-> f it)

requestAnimationFrame (-> f it)
*/
var obj, bubble, aniloop;
obj = {
  len: 10,
  timeDelta: 0,
  scale: {},
  init: function(){
    var xaxis, x$, y$, z$, this$ = this;
    this.svg = ld$.find('svg', 0);
    this.data = (function(){
      var i$, to$, results$ = [];
      for (i$ = 0, to$ = this.len; i$ < to$; ++i$) {
        results$.push(i$);
      }
      return results$;
    }.call(this)).map(function(d, i){
      return {
        key: i,
        val: 0
      };
    });
    this.dataset = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function(){
      return (function(){
        var i$, to$, results$ = [];
        for (i$ = 0, to$ = this.len; i$ < to$; ++i$) {
          results$.push(i$);
        }
        return results$;
      }.call(this$)).map(function(d, i){
        return {
          key: i,
          val: Math.round(Math.random() * 10000)
        };
      });
    });
    this.scale.x = d3.scaleLinear().range([0, 500]).domain([2008, 2018]);
    xaxis = d3.axisBottom(this.scale.x).tickFormat(function(d){
      if (d >= 3000) {
        return numformat(d);
      } else {
        return d;
      }
    });
    x$ = d3.select(this.svg).selectAll('g.axis-x').data([1], function(it){
      return it;
    });
    x$.exit().remove();
    x$.enter().append('g').attr('class', 'axis-x').attr('transform', "translate(0 231)").call(xaxis);
    y$ = d3.select(this.svg).selectAll('circle').data([1], function(it){
      return it;
    });
    y$.exit().remove();
    y$.enter().append('circle').attr('transform', "translate(0 231)").attr('cx', 0).attr('cy', 0).attr('r', 5);
    z$ = d3.select(this.svg).selectAll('rect.mouse').data([1], function(it){
      return it;
    });
    z$.exit().remove();
    z$.enter().append('rect').attr('class', 'mouse').attr('transform', "translate(0 221)").attr('x', 0).attr('y', 0).attr('width', 500).attr('height', 36).attr('fill-opacity', 0.1).on('mousemove', function(){
      var m;
      m = d3.mouse(ld$.find(this$.svg, 'rect.mouse', 0));
      return this$.timeDelta = 1000 * (10 * m[0] / 500);
    });
    return z$;
  },
  delta: function(t){
    var offset, idx, percent, this$ = this;
    if (!(this.time != null)) {
      this.time = t;
    }
    offset = (this.timeDelta + t - this.time) / 1000;
    idx = Math.floor(offset);
    percent = offset - idx;
    idx = idx % 10;
    this.data.map(function(d, i){
      var v1, v2;
      v1 = this$.dataset[idx][d.key].val;
      v2 = this$.dataset[(idx + 1) % 10][d.key].val;
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
    return this.data.map(function(d, i){
      if (d.idx !== i) {
        if (!(d.odx != null)) {
          d.odx = i;
        }
        d.idx = i;
      }
      return d.odx = (d.idx - d.odx) * 0.2 + d.odx;
    });
  },
  render: function(t){
    var initSel, sel, this$ = this;
    initSel = d3.select(this.svg).selectAll('rect.bar').data(this.data, function(it){
      return it.key;
    });
    initSel.exit().remove();
    initSel.enter().append('rect').attr('class', 'bar');
    sel = d3.select(svg).selectAll('rect.bar');
    sel.attr('x', function(d, i){
      return 0;
    }).attr('y', function(d, i){
      return d.odx * 21;
    }).attr('width', function(d, i){
      return 300 * d.val / 10000;
    }).attr('height', function(d, i){
      return 20;
    }).attr('fill', function(){
      return '#000';
    }).attr('fill', function(d, i){
      return d3.interpolateTurbo(d.key / (this$.data.length - 1));
    });
    return d3.select(this.svg).selectAll('circle').attr('cx', function(){
      var delta, i;
      delta = (this$.timeDelta + t - this$.time) / 1000;
      i = Math.floor(delta);
      return this$.scale.x(2008 + (delta - i) + i % 10);
    });
  }
};
bubble = {
  len: 10,
  timeDelta: 0,
  init: function(){
    var this$ = this;
    this.svg = ld$.find('svg', 0);
    this.data = (function(){
      var i$, to$, results$ = [];
      for (i$ = 0, to$ = this.len; i$ < to$; ++i$) {
        results$.push(i$);
      }
      return results$;
    }.call(this)).map(function(d, i){
      return {
        key: i,
        val: 0
      };
    });
    return this.dataset = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function(){
      return (function(){
        var i$, to$, results$ = [];
        for (i$ = 0, to$ = this.len; i$ < to$; ++i$) {
          results$.push(i$);
        }
        return results$;
      }.call(this$)).map(function(d, i){
        return {
          key: i,
          val: Math.round(Math.random() * 10000)
        };
      });
    });
  },
  delta: function(t){
    var offset, idx, percent, nodes, this$ = this;
    if (!(this.time != null)) {
      this.time = t;
    }
    offset = (this.timeDelta + t - this.time) / 1000;
    idx = Math.floor(offset);
    percent = offset - idx;
    idx = idx % 10;
    this.data.map(function(d, i){
      var v1, v2;
      v1 = this$.dataset[idx][d.key].val;
      v2 = this$.dataset[(idx + 1) % 10][d.key].val;
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
    this.bubble = d3.pack({
      children: this.data
    }).size([500, 500]).padding(1.5);
    nodes = d3.hierarchy({
      children: this.data
    }).sum(function(it){
      return it.val;
    });
    return this.dataBubble = this.bubble(nodes).descendants().filter(function(it){
      return it.depth;
    });
  },
  render: function(){
    var x$;
    x$ = d3.select(this.svg).selectAll('circle.bubble').data(this.dataBubble);
    x$.exit().remove();
    x$.enter().append('circle').attr('class', 'bubble');
    return d3.select(this.svg).selectAll('circle.bubble').attr('cx', function(d, i){
      return d.x;
    }).attr('cy', function(d, i){
      return d.y;
    }).attr('r', function(d, i){
      return d.r;
    }).attr('fill', function(d, i){
      return '#000';
    }).attr('fill-opacity', function(d, i){
      return 0.2;
    });
  }
};
aniloop = {
  init: function(obj){
    return this.obj = obj;
  },
  handler: function(t){
    this.obj.delta(t);
    this.obj.render(t);
    return requestAnimationFrame(function(it){
      return aniloop.handler(it);
    });
  },
  run: function(){
    return requestAnimationFrame(function(it){
      return aniloop.handler(it);
    });
  }
};
obj.init();
aniloop.init(obj);
aniloop.run();