var timeline;
timeline = function(opt){
  opt == null && (opt = {});
  this.aniloop = opt.aniloop;
  this.inited = false;
  return this;
};
timeline.prototype = import$(Object.create(Object.prototype), {
  getTime: function(){
    return this.time;
  },
  set: function(opt){
    var obj, aniloop, x$, y$, z$, this$ = this;
    opt == null && (opt = {});
    obj = this;
    aniloop = obj.aniloop;
    opt.years.sort(function(a, b){
      return a - b;
    });
    this.years = opt.years;
    this.svg = opt.svg;
    this.box = this.svg.getBoundingClientRect();
    this.box.size = this.box.width < 480
      ? this.box.width
      : this.box.width / 2 < 480
        ? 480
        : this.box.width / 2;
    this.scale = d3.scaleLinear().range([30, this.box.size - 30]).domain([0, this.years.length - 1]);
    this.axis = d3.axisBottom(this.scale).tickFormat(function(d){
      return d + this$.years[0];
    });
    x$ = d3.select(this.svg).selectAll('g.timeline').data([1], function(it){
      return it;
    });
    x$.exit().remove();
    x$.enter().append('g').attr('class', 'timeline');
    d3.select(this.svg).selectAll('g.timeline').attr('transform', "translate(" + (this.box.width - this.box.size) / 2 + " " + (this.box.height - 30) + ")").call(this.axis);
    y$ = d3.select(this.svg).select('g.timeline').selectAll('circle').data([1], function(it){
      return it;
    });
    y$.exit().remove();
    y$.enter().append('circle').attr('cx', 0).attr('cy', 0).attr('r', 5).attr('fill', '#000');
    z$ = d3.select(this.svg).select('g.timeline').selectAll('rect').data([1], function(it){
      return it;
    });
    z$.exit().remove();
    z$.enter().append('rect').style('cursor', 'pointer').attr('x', 0).attr('y', -10).attr('width', this.box.size).attr('height', this.box.height).attr('fill', '#000').attr('fill-opacity', '0').on('mousedown', function(){
      var newTime;
      obj.resumable = aniloop.isRunning();
      aniloop.pause();
      obj.dragging = true;
      newTime = obj.scale.invert(d3.mouse(this)[0]) * 1000;
      aniloop.setTime(newTime);
      return aniloop.render();
    });
    if (!this.inited) {
      document.addEventListener('mousemove', function(e){
        var node, box, mx, newTime, ref$;
        if (!obj.dragging) {
          return;
        }
        node = ld$.find(obj.svg, 'g.timeline rect', 0);
        box = node.getBoundingClientRect();
        mx = e.clientX - box.x;
        newTime = (ref$ = obj.scale.invert(mx)) > 0 ? ref$ : 0;
        if (newTime >= obj.years.length - 1) {
          newTime = obj.years.length - 1;
        }
        newTime = newTime * 1000;
        aniloop.setTime(newTime);
        return aniloop.render();
      });
      document.addEventListener('mouseup', function(){
        if (!obj.dragging) {
          return;
        }
        obj.dragging = false;
        if (obj.resumable) {
          return aniloop.run();
        } else {
          aniloop.setSnap(true);
          return aniloop.run();
        }
      });
    }
    return this.inited = true;
  },
  render: function(t){
    var this$ = this;
    this.rawtime = t;
    t = t / 1000;
    this.time = t - Math.floor(t) + Math.floor(t) % (this.years.length - 1);
    if (t && !this.time) {
      this.time = this.years.length - 1;
    }
    return d3.select(this.svg).select('g.timeline').selectAll('circle').attr('cx', function(){
      return this$.scale(this$.time);
    });
  }
});
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}