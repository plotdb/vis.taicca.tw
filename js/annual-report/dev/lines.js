var Ctrl, c;
Ctrl = function(opt){
  var root, this$ = this;
  opt == null && (opt = {});
  this.opt = opt;
  root = opt.root;
  this.root = root = typeof root === 'string'
    ? document.querySelector(root)
    : root ? root : null;
  this.svg = ld$.find(root, 'svg', 0);
  this.scale = {};
  this.render = debounce(100, function(opt){
    return this$._render(opt);
  });
  this.popup = debounce(500, function(){
    return this$._popup();
  });
  this.highlight = debounce(1000, function(){
    return this$._highlight();
  });
  this.mode = 'value';
  this.bipolar = false;
  return this;
};
Ctrl.prototype = import$(Object.create(Object.prototype), {
  setCattype: function(n){
    var k;
    this.data = this.dataset[n];
    this.cattype = n;
    this.valtypes = (function(){
      var results$ = [];
      for (k in this.data.attr) {
        results$.push(k);
      }
      return results$;
    }.call(this)).map(function(it){
      return {
        value: it
      };
    });
    this.years = this.data.label.map(function(it){
      return +it;
    });
    this.activeCategories = null;
    this.setValtype(in$(this.valtype, this.valtypes.map(function(it){
      return it.value;
    }))
      ? this.valtype
      : this.valtypes[0].value);
    this.setValtype(in$(this.valtypeAlt, this.valtypes.map(function(it){
      return it.value;
    })) ? this.valtypeAlt : '年份', true);
    return this.render();
  },
  setValtype: function(n, alt){
    var ref$, res$, k;
    if (alt) {
      ref$ = [n, this.data.attr[n]], this.valtypeAlt = ref$[0], this.valuesAlt = ref$[1];
      this.bipolar = n !== '年份';
    } else {
      ref$ = [n, this.data.attr[n]], this.valtype = ref$[0], this.values = ref$[1];
    }
    res$ = [];
    for (k in this.values) {
      res$.push(k);
    }
    this.categories = res$;
    if (!this.activeCategories) {
      res$ = [];
      for (k in this.values) {
        res$.push(k);
      }
      this.activeCategories = res$;
    }
    return this.render();
  },
  prepareView: function(){
    var view, this$ = this;
    this.ldcv = {};
    return this.view = view = new ldView({
      initRender: false,
      root: this.root,
      init: {
        ldcv: function(arg$){
          var node;
          node = arg$.node;
          return this$.ldcv[node.getAttribute('data-name')] = new ldCover({
            root: node
          });
        }
      },
      action: {
        change: {
          valtypes: function(arg$){
            var node, evt;
            node = arg$.node, evt = arg$.evt;
            return this$.setValtype(node.value, !!node.getAttribute('data-alt'));
          },
          cattypes: function(arg$){
            var node, evt;
            node = arg$.node, evt = arg$.evt;
            return this$.setCattype(node.value);
          }
        },
        click: {
          "toggle-ldcv": function(arg$){
            var node;
            node = arg$.node;
            return this$.ldcv[node.getAttribute('data-name')].toggle(true);
          },
          mode: function(arg$){
            var node;
            node = arg$.node;
            this$.mode = node.getAttribute('data-name');
            if (this$.mode === 'rank' && this$.valtypeAlt !== '年份') {
              this$.ldcv["no-rank"].toggle(true);
            }
            if (this$.mode === 'proportion' && this$.valtypeAlt !== '年份') {
              this$.ldcv["no-proportion"].toggle(true);
            }
            return this$.render();
          }
        }
      },
      text: {
        year: function(){
          if (this$.active) {
            return this$.active.year;
          } else {
            return '';
          }
        },
        value: function(){
          if (this$.active) {
            return this$.active.value;
          } else {
            return '';
          }
        },
        valname: function(){
          return this$.valtype;
        },
        catname: function(){
          if (this$.active) {
            return this$.active.catname;
          } else {
            return 'n/a';
          }
        }
      },
      handler: {
        mode: function(arg$){
          var node, n;
          node = arg$.node;
          n = node.getAttribute('data-name');
          node.classList.toggle('active', n === this$.mode);
          return node.classList.toggle('disabled', n !== 'value' && this$.valtypeAlt !== '年份');
        },
        cattypes: function(arg$){
          var node;
          node = arg$.node;
          return node.value = this$.cattype;
        },
        valtypes: function(arg$){
          var node;
          node = arg$.node;
          return node.value = !!node.getAttribute('data-alt')
            ? this$.valtypeAlt
            : this$.valtype;
        },
        cattype: {
          key: function(it){
            return it.value;
          },
          list: function(){
            return this$.cattypes || [];
          },
          handler: function(arg$){
            var node, data;
            node = arg$.node, data = arg$.data;
            node.innerText = data.value;
            node.setAttribute('value', data.value);
            return view.get('cattypes').value = this$.cattype;
          }
        },
        valtype: {
          key: function(it){
            return it.value;
          },
          list: function(arg$){
            var node;
            node = arg$.node;
            return (node.getAttribute('data-alt')
              ? [{
                value: "年份"
              }]
              : []).concat(this$.valtypes || []);
          },
          handler: function(arg$){
            var node, data, sel;
            node = arg$.node, data = arg$.data;
            node.innerText = data.value;
            node.setAttribute('value', data.value);
            sel = node.parentNode;
            return sel.value = node.getAttribute('data-alt')
              ? this$.valtypeAlt
              : this$.valtype;
          }
        }
      }
    });
  },
  init: function(){
    var this$ = this;
    return ld$.fetch("assets/data/annual-report/all.json", {
      method: 'GET'
    }, {
      type: 'json'
    }).then(function(dataset){
      var k;
      this$.prepareView();
      this$.dataset = dataset;
      this$.cattypes = (function(){
        var results$ = [];
        for (k in this.dataset) {
          results$.push(k);
        }
        return results$;
      }.call(this$)).map(function(it){
        return {
          value: it
        };
      });
      this$.setCattype(this$.cattypes[0].value);
      this$.setValtype(this$.valtypes[0].value);
      return this$.prepare();
    });
  },
  _popup: function(){
    var x, y, popup;
    if (!this.active) {
      return;
    }
    x = this.scale.x(this.active.x);
    if (this.mode === 'proportion') {
      y = this.scale.py(this.active.percent.offset + this.active.percent.delta / 2);
    } else {
      y = this.scale.y(this.active.y);
    }
    popup = this.view.get('popup');
    import$(popup.style, {
      top: y + "px",
      left: (x + (this.bipolar
        ? 0
        : this.scale.x.bandwidth() / 2)) + "px",
      opacity: 1
    });
    this.view.render(['year', 'value', 'value-alt', 'catname']);
    return this.highlight();
  },
  _highlight: function(){
    return this.render({
      highlight: true
    });
  },
  prepare: function(){
    var this$ = this;
    d3.select('svg').on('mouseout', function(){
      this$.popup().cancel();
      this$.highlight().cancel();
      return this$.render();
    });
    return d3.select('svg').on('mousemove', function(){
      var m, popup, range, x, y, band, pts, pt;
      m = d3.mouse(this$.svg);
      if (!this$.scale.x) {
        return;
      }
      popup = this$.view.get('popup').style.opacity = 0;
      range = this$.scale.x.range();
      x = m[0] - range[0];
      if (this$.mode === 'proportion') {
        x = this$.scale.x.domain()[Math.floor(x / this$.scale.x.bandwidth())];
        y = this$.scale.py.invert(m[1]);
        if (!(this$.bands && (band = this$.bands.filter(function(b){
          return b.year === x;
        })[0]))) {
          return;
        }
        pts = band.pts.filter(function(it){
          return !isNaN(it.value);
        });
        pt = d3.minIndex(pts, function(it){
          return Math.abs(it.percent.offset + it.percent.delta / 2 - y);
        });
        this$.active = band.pts[pt] || {};
      } else {
        if (this$.bipolar) {
          pt = d3.minIndex(this$.ptsValid, function(it){
            return Math.pow(this$.scale.x(it.x) - m[0], 2) + Math.pow(this$.scale.y(it.y) - m[1], 2);
          });
          this$.active = this$.ptsValid[pt] || {};
        } else {
          x = this$.scale.x.domain()[Math.floor(x / this$.scale.x.bandwidth())];
          y = this$.scale.y.invert(m[1]);
          if (!(this$.bands && (band = this$.bands.filter(function(b){
            return b.year === x;
          })[0]))) {
            return;
          }
          pts = band.pts.filter(function(it){
            return !isNaN(it.value);
          });
          pt = d3.minIndex(pts, function(it){
            return Math.abs(it.y - y);
          });
          this$.active = band.pts[pt] || {};
        }
      }
      d3.select(this$.svg).selectAll('circle').transition('mouse-hover').duration(50).attr('r', function(d, i){
        if (this$.active && d.key === this$.active.key) {
          return 10;
        } else {
          return 5;
        }
      });
      d3.select(this$.svg).selectAll('path.line').transition('mouse-hover').duration(50).attr('stroke-width', function(d, i){
        if (this$.active && d.catname === this$.active.catname) {
          return 3;
        } else {
          return 1;
        }
      });
      return this$.popup();
    });
  },
  _render: function(opt){
    var pts, lines, catname, ref$, vals, line, i$, to$, i, p, ptsValid, valsAlt, cs, legend, x$, legendGroup, offset, y$, numformat, xaxis, yaxis, z$, z1$, configLine, initSel, z2$, configCircle, z3$, configRect, z4$, this$ = this;
    opt == null && (opt = {});
    this.view.render();
    this.pts = pts = [];
    lines = [];
    if (this.valtypeAlt !== '年份') {
      this.mode = 'value';
      this.view.render(['mode']);
    }
    this.bands = this.years.map(function(it){
      return {
        year: it,
        pts: []
      };
    });
    for (catname in ref$ = this.values) {
      vals = ref$[catname];
      if (catname === '合計') {
        continue;
      }
      lines.push(line = {
        catname: catname,
        pts: []
      });
      for (i$ = 0, to$ = this.years.length; i$ < to$; ++i$) {
        i = i$;
        if (!in$(catname, this.activeCategories || [])) {
          continue;
        }
        pts.push(p = {
          key: this.years[i] + "-" + catname,
          valtype: this.valtype,
          catname: catname,
          year: this.years[i],
          raw: vals[i],
          value: +vals[i],
          rawAlt: this.valuesAlt
            ? this.valuesAlt[catname][i]
            : this.years[i],
          valueAlt: this.valuesAlt
            ? +this.valuesAlt[catname][i]
            : this.years[i],
          x: this.valuesAlt
            ? +this.valuesAlt[catname][i]
            : this.years[i],
          y: +vals[i]
        });
        line.pts.push(p);
      }
    }
    pts.map(function(p){
      return this$.bands.filter(function(b){
        return b.year === p.year;
      })[0].pts.push(p);
    });
    this.bands.map(function(band){
      var sum, i$, to$, i, p, v, ref$, len$, results$ = [];
      sum = 0;
      for (i$ = 0, to$ = band.pts.length; i$ < to$; ++i$) {
        i = i$;
        p = band.pts[i];
        v = isNaN(+p.y)
          ? 0
          : +p.y;
        p.percent = {
          offset: sum,
          delta: v
        };
        sum = sum + v;
      }
      for (i$ = 0, len$ = (ref$ = band.pts).length; i$ < len$; ++i$) {
        p = ref$[i$];
        p.percent.offset = p.percent.offset / sum;
        results$.push(p.percent.delta = p.percent.delta / sum);
      }
      return results$;
    });
    if (this.mode === 'rank') {
      this.bands.map(function(d, i){
        var list;
        list = [].concat(d.pts.filter(function(it){
          return !isNaN(it.value);
        }));
        list.sort(function(a, b){
          return b.value - a.value;
        });
        return list.map(function(e, i){
          return e.y = i + 1;
        });
      });
    }
    this.ptsValid = ptsValid = pts.filter(function(it){
      return !(isNaN(it.value) || isNaN(it.valueAlt));
    }).filter(function(it){
      return it.catname !== '合計';
    });
    vals = ptsValid.map(function(it){
      return it.y;
    });
    valsAlt = ptsValid.map(function(it){
      return it.x;
    });
    cs = this.categories.map(function(d, i){
      var p, p2;
      p = i / this$.categories.length;
      p2 = (i % 4) / 3;
      return ldColor.hex({
        h: 360 * p,
        c: 30 + 70 * p,
        l: 40 + 50 * p2
      });
    });
    if (opt.highlight && this.active) {
      cs = this.categories.map(function(d, i){
        var p, p2;
        p = i / this$.categories.length;
        p2 = (i % 4) / 3;
        if (d === this$.active.catname) {
          return ldColor.hex({
            h: 360 * p,
            c: 30 + 70 * p,
            l: 40 + 50 * p2
          });
        } else {
          return '#ccc';
        }
      });
    }
    this.box = this.svg.getBoundingClientRect();
    this.margin = 20;
    this.scale.x = this.bipolar
      ? d3.scaleLinear().domain(this.mode === 'value'
        ? [Math.min.apply(Math, valsAlt), Math.max.apply(Math, valsAlt)]
        : [Math.max.apply(Math, valsAlt), Math.min.apply(Math, valsAlt)])
      : d3.scaleBand().domain(this.years);
    import$(this.scale, {
      color: d3.scaleOrdinal().domain(this.categories.concat(['反向選取', '全選'])).range(cs.concat(['#fff', '#fff'])),
      py: d3.scaleLinear().domain([1, 0]).range([this.box.height - this.margin - 30 + 10, this.margin - 10]),
      y: d3.scaleLinear().domain(this.mode === 'value'
        ? [Math.min.apply(Math, vals), Math.max.apply(Math, vals)]
        : [Math.max.apply(Math, vals), Math.min.apply(Math, vals)]).range([this.box.height - this.margin - 30, this.margin])
    });
    legend = d3.legendColor().shape('path', d3.symbol().type(d3.symbolCircle).size(100)()).shapePadding(5).scale(this.scale.color);
    x$ = d3.select('svg').selectAll('g.legend').data([this.cattype], function(it){
      return it;
    });
    x$.exit().remove();
    x$.enter().append('g').attr('class', 'legend text-sm').call(legend);
    legendGroup = ld$.find(this.root, 'g.legend', 0);
    offset = this.box.width - legendGroup.getBoundingClientRect().width - 20;
    legendGroup.setAttribute('transform', "translate(" + offset + ", 32)");
    this.scale.x.range([this.margin + 40, offset - this.margin]);
    d3.select('svg g.legend').selectAll('g.cell').style('cursor', 'pointer').on('click', function(d){
      var ac, i;
      ac = this$.activeCategories || [];
      if (d === '反向選取') {
        ac = this$.activeCategories = this$.categories.filter(function(it){
          return !in$(it, ac);
        });
      } else if (d === '全選') {
        this$.activeCategories = [].concat(this$.categories);
      } else {
        if (in$(d, ac) && ~(i = ac.indexOf(d))) {
          ac.splice(i, 1);
        } else {
          ac.push(d);
        }
      }
      return this$.render();
    }).transition().duration(350).attr('opacity', function(d, i){
      if ((d === '反向選取' || d === '全選') || in$(d, this$.activeCategories || [])) {
        return 1;
      } else {
        return 0.3;
      }
    });
    y$ = d3.select(this.svg).select('g.bands').selectAll('rect.band').data(this.bipolar
      ? []
      : this.years, function(it){
      return it;
    });
    y$.exit().remove();
    y$.enter().append('rect').attr('class', 'band');
    d3.select(this.svg).selectAll('rect.band').attr('x', function(it){
      return this$.scale.x(it);
    }).attr('width', function(){
      return this$.scale.x.bandwidth();
    }).attr('y', function(){
      return 0;
    }).attr('height', function(){
      return this$.box.height;
    }).attr('fill', '#def').attr('fill-opacity', '0').on('mouseover', function(){
      return d3.select(this).transition().duration(150).attr('fill-opacity', 1);
    }).on('mouseout', function(){
      return d3.select(this).transition().duration(150).attr('fill-opacity', 0);
    });
    numformat = d3.format('~s');
    xaxis = d3.axisBottom(this.scale.x).tickFormat(function(d){
      if (d >= 3000) {
        return numformat(d);
      } else {
        return d;
      }
    });
    yaxis = d3.axisLeft(this.mode === 'proportion'
      ? this.scale.py
      : this.scale.y).tickFormat(function(d){
      if (d >= 3000) {
        return numformat(d);
      } else {
        return d;
      }
    });
    z$ = d3.select('svg').selectAll('g.axis-x').data([1], function(it){
      return it;
    });
    z$.exit().remove();
    z$.enter().append('g').attr('class', 'axis-x').call(xaxis);
    d3.select('svg').selectAll('g.axis-x').attr('transform', "translate(0," + (this.box.height - 30) + ")").transition().duration(350).call(xaxis);
    z1$ = d3.select('svg').selectAll('g.axis-y').data([1], function(it){
      return it;
    });
    z1$.exit().remove();
    z1$.enter().append('g').attr('class', 'axis-y').call(yaxis);
    d3.select('svg').selectAll('g.axis-y').attr('transform', "translate(" + 50 + ",0)").transition().duration(350).call(yaxis);
    line = d3.line().defined(function(d){
      return !isNaN(d.value) && !isNaN(d.valueAlt);
    }).x(function(d){
      return this$.scale.x(d.x) + (this$.bipolar
        ? 0
        : this$.scale.x.bandwidth() / 2);
    }).y(function(d){
      return this$.scale.y(d.y);
    });
    configLine = function(sel, enter){
      sel = (enter
        ? sel
        : sel.transition().duration(350)).filter(function(d, i){
        return !d.deleted;
      }).attr('d', function(d){
        return line(d.pts);
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
      }).attr('stroke-dasharray', function(d, i){
        if (this$.bipolar && this$.active && d.catname === this$.active.catname) {
          return '5 5';
        } else {
          return '1 0';
        }
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
    initSel = d3.select(this.svg).selectAll('path.line').data(lines, function(it){
      return it.catname;
    });
    z2$ = initSel.exit();
    z2$.each(function(d, i){
      return d.deleted = true;
    }).transition().duration(350).attr('opacity', 0).remove();
    configLine(initSel.enter().append('path'), true);
    configLine(d3.select(this.svg).selectAll('path.line').filter(function(it){
      return !it.deleted;
    }));
    configCircle = function(sel, enter){
      sel = (enter
        ? sel
        : sel.transition().duration(350)).filter(function(d, i){
        return !d.deleted;
      }).attr('cx', function(d){
        return this$.scale.x(d.x) + (this$.bipolar
          ? 0
          : this$.scale.x.bandwidth() / 2);
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
    initSel = d3.select(this.svg).selectAll('circle').data(ptsValid, function(it){
      return it.key;
    });
    z3$ = initSel.exit();
    z3$.each(function(d, i){
      return d.deleted = true;
    }).transition().duration(350).attr('opacity', 0).remove();
    configCircle(initSel.enter().append('circle'), true);
    configCircle(d3.select(this.svg).selectAll('circle').filter(function(it){
      return !it.deleted;
    }));
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
          return this$.scale.x.bandwidth();
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
    initSel = d3.select(this.svg).selectAll('rect.stack').data(ptsValid, function(it){
      return it.key;
    });
    z4$ = initSel.exit();
    z4$.each(function(d, i){
      return d.deleted = true;
    }).transition().duration(350).attr('opacity', 0).remove();
    configRect(initSel.enter().append('rect').attr('class', 'stack'), true);
    return configRect(d3.select(this.svg).selectAll('rect.stack').filter(function(it){
      return !it.deleted;
    }));
  }
});
c = new Ctrl({
  root: document.body
});
c.init();
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
function in$(x, xs){
  var i = -1, l = xs.length >>> 0;
  while (++i < l) if (x === xs[i]) return true;
  return false;
}