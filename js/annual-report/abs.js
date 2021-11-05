var bandwidth, lg, springOpt, renderInterface;
bandwidth = function(x){
  if (x && x.bandwidth) {
    return x.bandwidth();
  } else {
    return 0;
  }
};
lg = /lg/.exec(window.location.search) ? true : false;
springOpt = lg
  ? {
    timing: 0.975,
    decay: 0.01,
    cycle: 8
  }
  : {
    timing: 0.955,
    decay: 0.003,
    cycle: 4
  };
renderInterface = {
  renderLine: function(opt){
    var root, animate, f, bouncing, delta, wrap, line, configLine, initSel, x$, y$, configSparkle, this$ = this;
    opt == null && (opt = {});
    d3.select(this.svg.trend).selectAll('g.chart').data(["1"]).enter().append('g').attr('class', 'chart');
    root = d3.select(this.svg.trend).select('g.chart');
    root.attr('filter', 'url(#lava)');
    if (opt) {
      animate = opt.animate;
    }
    if ((this.bounce || (this.bounce = {})).reset && animate !== 1) {
      return;
    }
    if (!(animate != null)) {
      animate = 1;
      (this.bounce || (this.bounce = {})).reset = true;
    } else {
      animate = animate * springOpt.timing;
      (this.bounce || (this.bounce = {})).reset = false;
    }
    if (animate >= 0.01) {
      f = function(){
        return requestAnimationFrame(function(){
          if (this$.renderLine) {
            return this$.renderLine({
              animate: animate || 1
            });
          }
        });
      };
      if (animate === 1) {
        setTimeout(function(){
          return f();
        }, 1000);
      } else {
        f();
      }
    } else {
      animate = 0.01;
    }
    bouncing = animate > 0.01 && !this.bounce.reset;
    delta = this.scale.y.domain();
    delta = (delta[1] - delta[0]) * springOpt.decay;
    wrap = function(pts){
      var ret, i$, i, pi, pj, y, obj;
      ret = pts.map(function(it){
        return it;
      });
      for (i$ = pts.length - 1; i$ >= 1; --i$) {
        i = i$;
        pi = pts[i];
        pj = pts[i - 1];
        y = (pi.y + pj.y) / 2 + Math.sin(animate * Math.PI * 2 * springOpt.cycle) * delta * animate;
        obj = {
          x: (pi.x + pj.x) / 2,
          y: y
        };
        ret.splice(i, 0, obj);
        if (!isNaN(y)) {
          obj.value = 0;
          obj.valueAlt = 0;
        }
      }
      return ret;
    };
    line = d3.line().curve(d3.curveCardinal).defined(function(d){
      return !isNaN(d.value) && !isNaN(d.valueAlt);
    }).x(function(d){
      var ret;
      ret = this$.scale.x(Math.round(d.x));
      ret += this$.bipolar
        ? 0
        : bandwidth(this$.scale.x) / 2 + bandwidth(this$.scale.x) * (d.x - Math.round(d.x));
      return ret;
    }).y(function(d){
      var ret;
      ret = this$.scale.y(d.y);
      return ret;
    });
    configLine = function(sel, enter){
      sel = (bouncing || enter
        ? sel
        : sel.transition().duration(350)).filter(function(d, i){
        return !d.deleted;
      }).attr('d', function(d){
        return line(wrap(d.pts));
      }).attr('fill', 'none').attr('class', function(d, i){
        if (this$.bipolar && this$.active && d.catname === this$.active.catname) {
          return 'line highlight';
        } else {
          return 'line';
        }
      }).attr('stroke', function(d){
        return this$.scale.color(d.catname);
      }).attr('stroke-width', function(d, i){
        if (this$.active && d.catname === this$.active.catname) {
          return 3;
        } else {
          return 1;
        }
      }).attr('opacity', 0);
      return sel = (bouncing || !enter
        ? sel
        : sel.transition().duration(350)).filter(function(d, i){
        return !d.deleted;
      }).attr('opacity', function(){
        if (this$.mode === 'proportion') {
          return 0;
        } else {
          return 1;
        }
      });
    };
    initSel = root.selectAll('path.line').data(this.lines, function(it){
      return it.catname;
    });
    x$ = initSel.exit();
    x$.each(function(d, i){
      return d.deleted = true;
    }).transition().duration(350).attr('opacity', 0).remove();
    configLine(initSel.enter().append('path'), true);
    configLine(root.selectAll('path.line').filter(function(it){
      return !it.deleted;
    }));
    initSel = root.selectAll('ellipse.sparkle').data(this.lines, function(it){
      return it.catname;
    });
    y$ = initSel.exit();
    y$.each(function(d, i){
      return d.deleted = true;
    }).transition().duration(350).attr('opacity', 0).remove();
    configSparkle = function(sel, enter){
      if (enter) {
        sel.each(function(d, i){
          return d3.select(this).append('animateMotion');
        });
      }
      return sel.attr('class', 'sparkle').attr('rx', 3).attr('ry', 2).attr('fill', function(d){
        return this$.scale.color(d.catname);
      }).each(function(d, i){
        return d3.select(this).select('animateMotion').attr('id', "ani" + i).attr('dur', (i * 0.00 + 1.5) + "s").attr('begin', "ani" + i + ".end+" + (i * 0.01 + 1) + "s").attr('path', line(d.pts));
      });
    };
    configSparkle(initSel.enter().append('ellipse'), true);
    return configSparkle(root.selectAll('ellipse.sparkle').filter(function(it){
      return !it.deleted;
    }));
  },
  renderCircle: function(){
    var configCircle, initSel, x$, this$ = this;
    configCircle = function(sel, enter){
      sel = (enter
        ? sel
        : sel.transition().duration(350)).filter(function(d, i){
        return !d.deleted;
      }).attr('cx', function(d){
        return this$.scale.x(d.x) + (this$.bipolar
          ? 0
          : bandwidth(this$.scale.x) / 2);
      }).attr('cy', function(d){
        if (this$.mode === 'proportion') {
          return this$.scale.py(d.percent.offset + d.percent.delta / 2);
        } else {
          return this$.scale.y(d.y);
        }
      }).attr('r', function(d){
        if (this$.active && d.key === this$.active.key) {
          return 10;
        } else {
          return 5;
        }
      }).attr('fill', function(d){
        return this$.scale.color(d.catname);
      }).attr('opacity', 0);
      return sel = (!enter
        ? sel
        : sel.transition().duration(350)).filter(function(d, i){
        return !d.deleted;
      }).attr('opacity', function(){
        if (this$.mode === 'proportion') {
          return 0;
        } else {
          return 1;
        }
      });
    };
    initSel = d3.select(this.svg.trend).selectAll('circle.ptr').data(this.ptsValid, function(it){
      return it.key;
    });
    x$ = initSel.exit();
    x$.each(function(d, i){
      return d.deleted = true;
    }).transition().duration(350).attr('opacity', 0).remove();
    configCircle(initSel.enter().append('circle').attr('class', 'ptr'), true);
    return configCircle(d3.select(this.svg.trend).selectAll('circle.ptr').filter(function(it){
      return !it.deleted;
    }));
  },
  renderRect: function(){
    var configRect, initSel, x$, this$ = this;
    configRect = function(sel, enter){
      sel = (enter
        ? sel
        : sel.transition().duration(350)).attr('class', 'stack').attr('x', function(d){
        return this$.scale.x(d.x);
      }).attr('y', function(d){
        return this$.scale.py(d.percent.offset + d.percent.delta / 2);
      }).attr('height', 0).attr('width', function(){
        if (this$.bipolar) {
          return 0;
        } else {
          return bandwidth(this$.scale.x);
        }
      }).attr('fill', function(d){
        return this$.scale.color(d.catname);
      }).attr('opacity', 0);
      return sel = (!enter
        ? sel
        : sel.transition().duration(350)).filter(function(d, i){
        return !d.deleted;
      }).attr('y', function(d){
        if (this$.mode !== 'proportion') {
          return this$.scale.py(d.percent.offset + d.percent.delta / 2);
        } else {
          return this$.scale.py(d.percent.offset);
        }
      }).attr('height', function(d){
        if (this$.mode !== 'proportion') {
          return 0;
        } else {
          return Math.abs(this$.scale.py(d.percent.offset + d.percent.delta) - this$.scale.py(d.percent.offset));
        }
      }).attr('opacity', 1);
    };
    initSel = d3.select(this.svg.trend).selectAll('rect.stack').data(this.ptsValid, function(it){
      return it.key;
    });
    x$ = initSel.exit();
    x$.each(function(d, i){
      return d.deleted = true;
    }).transition().duration(350).attr('opacity', 0).remove();
    configRect(initSel.enter().append('rect').attr('class', 'stack'), true);
    return configRect(d3.select(this.svg.trend).selectAll('rect.stack').filter(function(it){
      return !it.deleted;
    }));
  }
};