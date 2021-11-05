var docChart, Doc;
docChart = {};
docChart.cut3 = function(arg$){
  var ctrl, view, c, obj, root, ref$;
  ctrl = arg$.ctrl, view = arg$.view;
  c = ctrl;
  if (!(obj = docChart.cut3.obj)) {
    docChart.cut3.obj = obj = {};
    root = view.getAll('chart').filter(function(it){
      return it.getAttribute('data-name') === 'cut3';
    })[0];
    obj.aniloop = new aniloop();
    obj.timeline = new timeline({
      aniloop: obj.aniloop
    });
    obj.aniloop.setTimeline(obj.timeline);
    obj.active = {
      year: c.getYears()[0]
    };
    obj.svg = {
      map: ld$.find(root, '[ld=map]', 0),
      bar: ld$.find(root, '[ld=bar]', 0),
      bubble: ld$.find(root, '[ld=bubble]', 0)
    };
    obj.subchart = {
      map: new subchart.map((ref$ = {
        host: obj,
        svg: obj.svg.map,
        demo: true
      }, ref$.timeline = obj.timeline, ref$.aniloop = obj.aniloop, ref$)),
      bar: new subchart.bar((ref$ = {
        host: obj,
        svg: obj.svg.bar,
        demo: true
      }, ref$.timeline = obj.timeline, ref$.aniloop = obj.aniloop, ref$)),
      bubble: new subchart.bubble((ref$ = {
        host: obj,
        svg: obj.svg.bubble,
        demo: true
      }, ref$.timeline = obj.timeline, ref$.aniloop = obj.aniloop, ref$))
    };
  }
  obj.values = c.getValues();
  obj.years = c.getYears();
  obj.valtypes = c.getValtypes();
  obj.categories = c.getCategories().map(function(it){
    return it.name;
  });
  obj.scale = c.scale;
  return obj.subchart.bar.prepare();
};
docChart.cut2 = function(arg$){
  var ctrl, view, c, obj, xrange, yrange, root, box, mx, my, m, sx, sy, ref$, w, h;
  ctrl = arg$.ctrl, view = arg$.view;
  c = ctrl;
  obj = {
    svg: {
      trend: null
    },
    lines: c.lines,
    ptsValid: c.ptsValid,
    scale: c.scale,
    mode: c.getMode(),
    bipolar: c.getBipolar()
  };
  xrange = c.scale.x.range();
  yrange = c.scale.y.range();
  root = ld$.find('[ld=chart][data-name=cut2]', 0);
  box = root.getBoundingClientRect();
  mx = (xrange[1] + xrange[0]) / 2;
  my = (yrange[1] + yrange[0]) / 2;
  m = 10;
  sx = (box.width - 2 * m) / (xrange[1] - xrange[0]);
  sy = Math.abs((box.height - 2 * m) / (yrange[1] - yrange[0]));
  ref$ = [(xrange[1] - xrange[0]) * sx, (yrange[0] - yrange[1]) * sy], w = ref$[0], h = ref$[1];
  obj.svg.trend = ld$.find(root, '[ld=line]', 0);
  obj.svg.trend.setAttribute('transform', "translate(" + (m + w / 2) + "," + (m + h / 2) + ") scale(" + sx + "," + sy + ") translate(" + (-mx) + ", " + (-my) + ")");
  c.renderLine.apply(obj);
  c.renderCircle.apply(obj);
  c.renderRect.apply(obj);
  if (c.getValtype({
    alt: true
  }) !== '年份') {
    return d3.select(obj.svg.trend).selectAll('path').each(function(d, i){
      if (d.catname === '廣播電視') {
        return d3.select(this).attr('highlight', true);
      }
    });
  }
};
docChart.cut1 = function(arg$){
  var ctrl, bar, view, c, obj, xrange, yrange, box, mx, my, m, sx, sy, ref$, w, h, pts, scale, root, x$;
  ctrl = arg$.ctrl, bar = arg$.bar, view = arg$.view;
  c = ctrl;
  obj = {
    svg: {
      trend: null
    },
    lines: c.lines,
    ptsValid: c.ptsValid,
    scale: c.scale
  };
  if (c.getMode() === 'value') {
    obj.scale = import$({}, c.scale);
    obj.scale.y = d3.scaleLinear().domain([0, c.scale.y.domain()[1]]).range(c.scale.y.range());
  }
  xrange = c.scale.x.range();
  yrange = c.scale.y.range();
  box = view.get('bar').parentNode.getBoundingClientRect();
  mx = (xrange[1] + xrange[0]) / 2;
  my = (yrange[1] + yrange[0]) / 2;
  m = 10;
  sx = (box.width - 2 * m) / (xrange[1] - xrange[0]);
  sy = Math.abs((box.height - 2 * m) / (yrange[1] - yrange[0]));
  ref$ = [(xrange[1] - xrange[0]) * sx, (yrange[0] - yrange[1]) * sy], w = ref$[0], h = ref$[1];
  pts = c.bands[0].pts.map(function(it){
    return it;
  });
  pts.sort(function(a, b){
    if (isNaN(a.y)) {
      return 1;
    } else if (isNaN(b.y)) {
      return -1;
    } else {
      return b.y - a.y;
    }
  });
  scale = {
    x: d3.scaleBand().range(c.scale.x.range()).domain(pts.map(function(it){
      return it.catname;
    })).paddingInner(0.2)
  };
  d3.select(view.get('line')).transition().duration(350).attr('opacity', bar ? 0 : 1);
  d3.select(view.get('bar')).transition().duration(350).attr('opacity', bar ? 1 : 0);
  if (bar) {
    obj.svg.trend = view.get('bar');
    obj.svg.trend.setAttribute('transform', "translate(" + (m + w / 2) + "," + (m + h / 2) + ") scale(" + sx + "," + sy + ") translate(" + (-mx) + ", " + (-my) + ")");
    root = d3.select(obj.svg.trend);
    x$ = root.selectAll('rect').data(pts);
    x$.exit().remove();
    x$.enter().append('rect').attr('x', function(d, i){
      return scale.x(d.catname);
    }).attr('width', function(d, i){
      return scale.x.bandwidth();
    }).attr('y', function(){
      return yrange[0];
    }).attr('height', function(){
      return 1 / sy;
    }).attr('fill', function(d, i){
      return c.scale.color(d.catname);
    });
    return root.selectAll('rect').transition().duration(350).attr('x', function(d, i){
      return scale.x(d.catname);
    }).attr('width', function(d, i){
      return scale.x.bandwidth();
    }).attr('y', function(d, i){
      var ref$, ref1$;
      return (ref$ = isNaN(d.y)
        ? yrange[0]
        : c.scale.y(d.y)) < (ref1$ = yrange[0] - 1 / sy) ? ref$ : ref1$;
    }).attr('height', function(d, i){
      var ref$, ref1$;
      return (ref$ = isNaN(d.y)
        ? 1 / sy
        : yrange[0] - c.scale.y(d.y)) > (ref1$ = 1 / sy) ? ref$ : ref1$;
    }).attr('fill', function(d, i){
      return c.scale.color(d.catname);
    });
  } else {
    obj.svg.trend = view.get('line');
    obj.svg.trend.setAttribute('transform', "translate(" + (m + w / 2) + "," + (m + h / 2) + ") scale(" + sx + "," + sy + ") translate(" + (-mx) + ", " + (-my) + ")");
    c.renderLine.apply(obj);
    return c.renderCircle.apply(obj);
  }
};
Doc = function(arg$){
  var ctrl, c, barMode, view, check, handler;
  ctrl = arg$.ctrl;
  c = ctrl;
  barMode = true;
  view = new ldView({
    root: document.body,
    action: {
      click: {
        "highlight": function(arg$){
          var node, name;
          node = arg$.node;
          name = (node.getAttribute('data-name') || "").split(',');
          c.render({
            highlight: name
          });
          return view.render(['chart']);
        },
        "cut1-view": function(arg$){
          var node;
          node = arg$.node;
          view.getAll('cut1-view').map(function(it){
            return it.classList.toggle('active', node === it);
          });
          c.setMode('value', true);
          return docChart.cut1({
            ctrl: ctrl,
            bar: barMode = node.getAttribute('data-name') === 'bar',
            view: view
          });
        },
        "cut2-view": function(arg$){
          var node;
          node = arg$.node;
          c.setMode(node.getAttribute('data-name'), true);
          docChart.cut2({
            ctrl: ctrl,
            view: view
          });
          view.render(['cut2-view']);
          return view.render(['cut1-view']);
        },
        "cut2-custom": function(arg$){
          var node;
          node = arg$.node;
          c.setValtype('家數');
          return c.setValtype('營業額', true);
        },
        "cut3-play": function(arg$){
          var node;
          node = arg$.node;
          return docChart.cut3.obj.aniloop.toggle();
        },
        "cut3-view": function(arg$){
          var node;
          node = arg$.node;
          return docChart.cut3.obj.mode = node.getAttribute('data-name');
        },
        "clear-valtype-alt": function(){
          return c.setValtype("年份", true);
        },
        "set-cat": function(arg$){
          var node, name;
          node = arg$.node;
          name = node.getAttribute('data-name');
          view.getAll('set-cat').map(function(it){
            return it.classList.toggle('active', it.getAttribute('data-name') === name);
          });
          return debounce(150).then(function(){
            c.setCattype(name);
            return view.render(['choose-cat', 'choose-val', 'category', 'chart']);
          });
        },
        "cat-all": function(){
          return c.toggleActiveCategories("全選");
        },
        "cat-none": function(){
          return c.toggleActiveCategories("全不選");
        },
        "cat-toggle": function(arg$){
          var node, type;
          node = arg$.node;
          if (type = node.getAttribute('data-cattype')) {
            c.setCattype(type);
          }
          return c.toggleActiveCategories((node.getAttribute('data-name') || '').split(','));
        },
        "cat-set": function(arg$){
          var node, type;
          node = arg$.node;
          if (type = node.getAttribute('data-cattype')) {
            c.setCattype(type);
          }
          return c.setActiveCategories((node.getAttribute('data-name') || '').split(','));
        },
        "cat-hide": function(arg$){
          var node, type, hideCats, cats;
          node = arg$.node;
          if (type = node.getAttribute('data-cattype')) {
            c.setCattype(type);
          }
          hideCats = (node.getAttribute('data-name') || '').split(',');
          cats = c.getCategories().map(function(it){
            return it.name;
          }).filter(function(it){
            return !in$(it, hideCats);
          });
          return c.setActiveCategories(cats);
        }
      },
      input: {
        "choose-view": function(arg$){
          var node;
          node = arg$.node;
          c.setMode(node.value, true);
          return view.render(['choose-view', 'chart']);
        },
        "choose-val": function(arg$){
          var node, isAlt;
          node = arg$.node;
          isAlt = node.hasAttribute('data-alt') && node.getAttribute('data-alt') !== 'false';
          c.setValtype(node.value, isAlt);
          return view.render(['choose-val', 'chart']);
        },
        "choose-cat": function(arg$){
          var node;
          node = arg$.node;
          c.setCattype(node.value);
          return view.render(['choose-cat', 'choose-val', 'category', 'chart']);
        }
      }
    },
    handler: {
      chart: function(arg$){
        var node;
        node = arg$.node;
        return debounce(100).then(function(){
          var name;
          name = node.getAttribute('data-name');
          return docChart[name]({
            ctrl: ctrl,
            bar: barMode,
            view: view
          });
        });
      },
      "choose-cat": function(arg$){
        var node;
        node = arg$.node;
        return node.value = c.getCattype();
      },
      "valtype": function(arg$){
        var node, isAlt, v, u;
        node = arg$.node;
        isAlt = node.hasAttribute('data-alt') && node.getAttribute('data-alt') !== 'false';
        v = c.getValtype({
          alt: isAlt
        });
        u = ['年份', '外銷', '內銷', '家數', '營業額'].filter(function(it){
          return ~v.indexOf(it);
        })[0];
        return node.innerText = u || v;
      },
      "choose-val": function(arg$){
        var node, isAlt, v, u;
        node = arg$.node;
        isAlt = node.hasAttribute('data-alt') && node.getAttribute('data-alt') !== 'false';
        v = c.getValtype({
          alt: isAlt
        });
        u = ['年份', '外銷', '內銷', '家數', '營業額'].filter(function(it){
          return ~v.indexOf(it);
        })[0];
        return node.value = u || v;
      },
      "choose-view": function(arg$){
        var node;
        node = arg$.node;
        return node.value = c.getMode();
      },
      "cut2-view": function(arg$){
        var node;
        node = arg$.node;
        return node.classList.toggle('active', c.getMode() === node.getAttribute('data-name'));
      },
      category: {
        key: function(it){
          return it.name;
        },
        list: function(){
          return c.getCategories().concat([
            {
              name: "全不選",
              active: true
            }, {
              name: "全選",
              active: true
            }
          ]);
        },
        action: {
          click: function(arg$){
            var data;
            data = arg$.data;
            return c.toggleActiveCategories(data.name);
          }
        },
        handler: function(arg$){
          var node, data, idx;
          node = arg$.node, data = arg$.data, idx = arg$.idx;
          node.style.animationDelay = idx / 40 + "s";
          node.classList.toggle('d-flex', true);
          node.classList.toggle('d-none', false);
          ld$.find(node, 'span', 0).innerText = data.name;
          ld$.find(node, 'div', 0).style.background = c.scale.color(data.name);
          return node.classList.toggle('inactive', !data.active);
        }
      }
    }
  });
  c.on('active-categories-changed', function(){
    return view.render(['category', 'chart']);
  });
  c.on('cattype-changed', function(){
    return view.render(['category', 'chart']);
  });
  c.on('mode-changed', function(){
    return view.render(['category', 'cut2-view', 'chart']);
  });
  c.on('bipolar-changed', function(){
    return view.render(['category', 'chart']);
  });
  c.on('valtype-changed', function(){
    return view.render(['category', 'chart', 'choose-val', 'valtype']);
  });
  check = {};
  return handler = function(entries){
    return entries.map(function(entry){
      return check[entry.target.getAttribute('ld')] = entry.isIntersecting;
    });
  };
};
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