var aniloop, subchart;
aniloop = function(){
  this.running = false;
  this.time = {
    now: 0
  };
  return this;
};
aniloop.prototype = import$(Object.create(Object.prototype), {
  setObj: function(obj){
    return this.obj = obj;
  },
  reset: function(){
    return this.time = {
      now: 0
    };
  },
  setTimeline: function(it){
    return this.timeline = it;
  },
  setTime: function(t, keep){
    this.time.now = t;
    return this.time.keep = keep;
  },
  getTime: function(){
    return this.time.now;
  },
  setSnap: function(it){
    return this.snap = it;
  },
  isRunning: function(){
    return this.running;
  },
  toggle: function(it){
    if (it != null) {
      this.running = !it;
    }
    if (this.running) {
      return this.pause();
    } else {
      return this.run();
    }
  },
  pause: function(){
    return this.running = false;
  },
  render: function(){
    if (!this.obj) {
      return;
    }
    this.obj.delta(this.time.now);
    this.obj.render(this.time.now);
    if (this.running) {
      this.time.keep = false;
    }
    return this.timeline.render(this.time.now);
  },
  run: function(){
    var this$ = this;
    if (this.running) {
      return;
    }
    this.running = true;
    return requestAnimationFrame(function(t){
      return this$.handler(this$.time.last = t);
    });
  },
  handler: function(t){
    var delta, this$ = this;
    if (!this.running) {
      return;
    }
    if (this.snap) {
      delta = t - (!(this.time.last != null)
        ? t
        : this.time.last);
      this.time.now = this.time.now + delta * 2 * (this.time.now % 1000 > 500
        ? 1
        : -1);
      if (this.time.now % 1000 < 150) {
        this.time.now = this.time.now - this.time.now % 1000;
        this.snap = false;
        this.time.keep = true;
        this.pause();
      }
    } else {
      this.time.now += t - (!(this.time.last != null)
        ? t
        : this.time.last);
    }
    this.time.last = t;
    this.render();
    return requestAnimationFrame(function(t){
      return this$.handler(t);
    });
  },
  oldHandler: function(t){
    var this$ = this;
    if (!this.time) {
      this.time = t;
    }
    if (this.obj) {
      this.obj.delta(t - this.time);
      this.obj.render(t - this.time);
      this.timeline.render(t - this.time);
    }
    return requestAnimationFrame(function(it){
      return this$.handler(it);
    });
  }
});
aniloop.main = new aniloop();
aniloop.main.run();
subchart = {};
subchart['interface'] = {
  chartInfo: function(t, position){
    var cfg, sel, x$, y$, z$, this$ = this;
    position == null && (position = 'left');
    if (position === 'left') {
      cfg = {
        anchor: 'start',
        x: 100
      };
    } else {
      cfg = {
        anchor: 'end',
        x: this.box.width - 100
      };
    }
    sel = d3.select(this.svg).selectAll('text.year').data([1], function(it){
      return it;
    });
    x$ = sel;
    x$.exit().remove();
    x$.enter().append('text').attr('class', 'year');
    sel = d3.select(this.svg).selectAll('text.year').text(function(){
      var v;
      v = Math.floor(t / 1000) % (this$.years.length - 1);
      if (aniloop.main.time.keep && !v && t > 0) {
        v = this$.years.length - 1;
      }
      return this$.years[v];
    }).attr('font-size', '3em').attr('x', cfg.x).attr('y', this.box.height - 100).attr('dy', '-1.25em').attr('text-anchor', cfg.anchor);
    sel = d3.select(this.svg).selectAll('text.title').data([1], function(it){
      return it;
    });
    y$ = sel;
    y$.exit().remove();
    y$.enter().append('text').attr('class', 'title');
    sel = d3.select(this.svg).selectAll('text.title').text(function(){
      return this$.host.cattype + "年度" + this$.host.valtype;
    }).attr('font-size', '1.5em').attr('x', cfg.x).attr('y', this.box.height - 100).attr('dy', '-1.2em').attr('text-anchor', cfg.anchor);
    sel = d3.select(this.svg).selectAll('text.unit').data([1], function(it){
      return it;
    });
    z$ = sel;
    z$.exit().remove();
    z$.enter().append('text').attr('class', 'unit');
    return sel = d3.select(this.svg).selectAll('text.unit').text("單位: " + this.host.unit).attr('x', cfg.x).attr('y', this.box.height - 100).attr('text-anchor', cfg.anchor);
  }
};
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}