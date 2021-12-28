var Ctrl;
Ctrl = function(opt){
  var root, ref$, winw, winh, w, h, this$ = this;
  opt == null && (opt = {});
  this.opt = opt;
  this.evtHandler = {};
  root = opt.root;
  this.root = root = typeof root === 'string'
    ? document.querySelector(root)
    : root ? root : null;
  this.config = {
    pal: {
      sort: 'hue',
      sel: 'all'
    }
  };
  ref$ = [window.innerWidth, window.innerHeight], winw = ref$[0], winh = ref$[1];
  if (winh * 1.5 > winw) {
    ref$ = [winw, winw * 2 / 3], w = ref$[0], h = ref$[1];
  } else {
    ref$ = [winh * 1.5, winh], w = ref$[0], h = ref$[1];
  }
  ld$.find(root, '[ld=container]').map(function(node){
    var x$;
    x$ = node;
    x$.style.width = w + "px";
    x$.classList.toggle('d-none', false);
    return x$;
  });
  this.aniloop = aniloop.main;
  this.timeline = new timeline({
    aniloop: this.aniloop
  });
  this.aniloop.setTimeline(this.timeline);
  this.svg = {
    map: ld$.find(root, '[ld=svg-map]', 0),
    bubble: ld$.find(root, '[ld=svg-bubble]', 0),
    pie: ld$.find(root, '[ld=svg-pie]', 0),
    bar: ld$.find(root, '[ld=svg-bar]', 0),
    trend: ld$.find(root, '[ld=svg-trend]', 0)
  };
  this.subchart = {
    map: new subchart.map({
      host: this,
      svg: this.svg.map,
      timeline: this.timeline,
      aniloop: this.aniloop
    }),
    bar: new subchart.bar({
      host: this,
      svg: this.svg.bar,
      timeline: this.timeline,
      aniloop: this.aniloop
    }),
    bubble: new subchart.bubble({
      host: this,
      svg: this.svg.bubble,
      timeline: this.timeline,
      aniloop: this.aniloop
    }),
    pie: new subchart.pie({
      host: this,
      svg: this.svg.pie,
      timeline: this.timeline,
      aniloop: this.aniloop
    })
  };
  this.perspective = null;
  this.scale = {};
  this.render = debounce(100, function(opt){
    var k, v;
    this$.getColor(opt);
    (function(){
      var ref$, results$ = [];
      for (k in ref$ = this.subchart) {
        v = ref$[k];
        results$.push({
          k: k,
          v: v
        });
      }
      return results$;
    }.call(this$)).filter(function(it){
      return it.k !== this$.perspective;
    }).map(function(it){
      return it.v.hide();
    });
    if (!this$.perspective) {
      return this$._render(opt);
    } else {
      this$.view.render();
      return this$.subchart[this$.perspective].prepare();
    }
  });
  this.popup = debounce(350, function(){
    return this$._popup();
  });
  this.unpopup = function(){
    var popup;
    return popup = this$.view.get('popup').style.opacity = 0;
  };
  this.highlight = debounce(350, function(){
    return this$._highlight();
  });
  this.mode = 'value';
  this.bipolar = false;
  return this;
};
Ctrl.prototype = import$(import$(Object.create(Object.prototype), renderInterface), {
  on: function(n, cb){
    var ref$;
    return ((ref$ = this.evtHandler)[n] || (ref$[n] = [])).push(cb);
  },
  fire: function(n){
    var v, res$, i$, to$, ref$, len$, cb, results$ = [];
    res$ = [];
    for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {
      res$.push(arguments[i$]);
    }
    v = res$;
    for (i$ = 0, len$ = (ref$ = this.evtHandler[n] || []).length; i$ < len$; ++i$) {
      cb = ref$[i$];
      results$.push(cb.apply(this, v));
    }
    return results$;
  },
  getBipolar: function(){
    return this.bipolar;
  },
  getMode: function(){
    return this.mode;
  },
  setMode: function(mode, force){
    var this$ = this;
    force == null && (force = false);
    this.mode = mode;
    if (this.mode === 'rank' && this.valtypeAlt !== '年份') {
      if (force) {
        this.setValtype('年份', true);
      } else {
        this.ldcv["no-rank"].get().then(function(ret){
          if (ret === 'reset') {
            return this$.setMode(mode, true);
          }
        });
      }
    }
    if (this.mode === 'proportion' && this.valtypeAlt !== '年份') {
      if (force) {
        this.setValtype('年份', true);
      } else {
        this.ldcv["no-proportion"].get().then(function(ret){
          if (ret === 'reset') {
            return this$.setMode(mode, true);
          }
        });
      }
    }
    return this.render().then(function(){
      return this$.fire('mode-changed');
    });
  },
  setPerspective: function(n){
    this.aniloop.pause();
    this.perspective = n;
    return this.render();
  },
  getYears: function(){
    return this.years;
  },
  setYear: function(n){
    this.activeYear = n;
    return this.render();
  },
  getCattypes: function(){
    return this.cattypes;
  },
  getCattype: function(){
    return this.cattype;
  },
  getCategories: function(opt){
    var this$ = this;
    opt == null && (opt = {
      state: true
    });
    if (!opt.state) {
      return this.categories;
    } else {
      return this.categories.map(function(it){
        return {
          name: it,
          active: in$(it, this$.activeCategories || [])
        };
      });
    }
  },
  setCattype: function(n){
    var k, that, this$ = this;
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
    this.active = null;
    this.setValtype(in$(this.valtype, this.valtypes.map(function(it){
      return it.value;
    }))
      ? this.valtype
      : this.valtypes[0].value);
    this.setValtype(in$(this.valtypeAlt, this.valtypes.map(function(it){
      return it.value;
    })) ? this.valtypeAlt : '年份', true);
    if (that = this.view.getAll('perspective').filter(function(it){
      return it.getAttribute('data-name') === 'map';
    })[0]) {
      that.classList.toggle('disabled', this.cattype !== '縣市');
    }
    return this.render().then(function(){
      return this$.fire('cattype-changed', n);
    });
  },
  getValues: function(){
    return this.values;
  },
  getValtypes: function(){
    return this.valtypes;
  },
  getValtype: function(opt){
    opt == null && (opt = {
      alt: false
    });
    if (opt.alt) {
      return this.valtypeAlt;
    } else {
      return this.valtype;
    }
  },
  setValtype: function(n, alt){
    var m, bipolar, ref$, k, res$, this$ = this;
    m = (this.valtypes || []).filter(function(it){
      return ~it.value.indexOf(n);
    })[0];
    n = m ? m.value : n;
    bipolar = {
      cur: this.bipolar,
      old: this.bipolar
    };
    if (alt) {
      ref$ = [n, (this.data.attr[n] || {}).data, (this.data.attr[n] || {}).unit], this.valtypeAlt = ref$[0], this.valuesAlt = ref$[1], this.unitAlt = ref$[2];
      bipolar.cur = this.bipolar = n !== '年份';
      if (this.bipolar && !this.config["connected-scatter-hint"]) {
        this.ldcv["connected-scatter"].toggle(true);
        this.config["connected-scatter-hint"] = true;
      }
    } else {
      ref$ = [n, (this.data.attr[n] || {}).data, (this.data.attr[n] || {}).unit], this.valtype = ref$[0], this.values = ref$[1], this.unit = ref$[2];
    }
    this.categories = (function(){
      var results$ = [];
      for (k in this.values) {
        results$.push(k);
      }
      return results$;
    }.call(this)).filter(function(it){
      return !(it === '合計');
    });
    if (!this.activeCategories) {
      res$ = [];
      for (k in this.values) {
        res$.push(k);
      }
      this.activeCategories = res$;
    }
    return this.render().then(function(){
      if (bipolar.cur !== bipolar.old) {
        this$.fire('bipolar-changed', this$.bipolar);
      }
      return this$.fire('valtype-changed');
    });
  },
  setActiveCategories: function(d){
    var this$ = this;
    this.activeCategories = Array.isArray(d)
      ? d
      : [d];
    return this.render().then(function(){
      return this$.fire('active-categories-changed');
    });
  },
  toggleActiveCategories: function(d){
    var this$ = this;
    d = Array.isArray(d)
      ? d
      : [d];
    d.map(function(d){
      var ac, i;
      ac = this$.activeCategories || [];
      if (d === '全不選') {
        return ac = this$.activeCategories = [];
      } else if (d === '反向選') {
        return ac = this$.activeCategories = this$.categories.filter(function(it){
          return !in$(it, ac);
        });
      } else if (d === '全選') {
        return this$.activeCategories = [].concat(this$.categories);
      } else if (d === '配色') {
        return this$.ldcv["palette-pick"].get().then(function(){
          return this$.render();
        });
      } else {
        if (in$(d, ac) && ~(i = ac.indexOf(d))) {
          return ac.splice(i, 1);
        } else {
          return ac.push(d);
        }
      }
    });
    return this.render().then(function(){
      return this$.fire('active-categories-changed');
    });
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
          return this$.ldcv[node.getAttribute('data-name')] = new ldcover({
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
          "set-pal": function(arg$){
            var node, type, name;
            node = arg$.node;
            type = node.getAttribute('data-type');
            name = node.getAttribute('data-name');
            this$.config.pal[type] = name;
            return this$.view.render();
          },
          "single-year": function(){
            var year, i$, to$, i;
            year = +(this$.view.get('single-year-chooser').value || 2010);
            for (i$ = 0, to$ = this$.bands.length; i$ < to$; ++i$) {
              i = i$;
              if (this$.bands[i].year !== year) {
                continue;
              } else {
                break;
              }
            }
            this$.active = (this$.bands[i] || this$.bands[0]).pts[0];
            this$.ldcv["subchart"].toggle(true);
            return this$.setPerspective('bar');
          },
          perspective: function(arg$){
            var node;
            node = arg$.node;
            if (!node.classList.contains('disabled')) {
              return this$.setPerspective(node.getAttribute('data-name'));
            } else {
              return this$.ldcv["no-map"].toggle(true);
            }
          },
          play: function(arg$){
            var node;
            node = arg$.node;
            if (this$.perspective === 'pie') {
              return this$.ldcv["no-animation"].toggle(true);
            } else {
              return this$.aniloop.toggle(true);
            }
          },
          pause: function(arg$){
            var node;
            node = arg$.node;
            if (this$.perspective === 'pie') {
              return this$.ldcv["no-animation"].toggle(true);
            } else {
              return this$.aniloop.toggle(false);
            }
          },
          close: function(arg$){
            var node;
            node = arg$.node;
            return this$.setPerspective(null);
          },
          download: function(arg$){
            var node, lc, logo, qrcode, watermark, name, csv, k, v, href, ba, svgNode, box;
            node = arg$.node;
            lc = {};
            logo = {
              url: '/assets/img/logo/watermark-sm.png',
              width: 380,
              height: 50
            };
            qrcode = {
              url: '/assets/img/qrcode-sm.png',
              width: 50,
              height: 50
            };
            watermark = {
              padding: 10
            };
            watermark.height = watermark.padding * 2 + logo.height;
            name = node.getAttribute('data-name');
            csv = [[''].concat(this$.data.label)].concat((function(){
              var ref$, results$ = [];
              for (k in ref$ = this.values) {
                v = ref$[k];
                results$.push([k, v]);
              }
              return results$;
            }.call(this$)).map(function(arg$){
              var k, v;
              k = arg$[0], v = arg$[1];
              return [k].concat(v);
            }));
            href = csv4xls.toArray(csv);
            ba = csv4xls.toHref(csv);
            svgNode = this$.svg[this$.perspective || 'trend'];
            box = svgNode.getBoundingClientRect();
            svgNode = svgNode.cloneNode(true);
            svgNode.setAttribute('xmlns', "http://www.w3.org/2000/svg");
            svgNode.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");
            svgNode.setAttribute("viewbox", "0 0 " + box.width + " " + (box.height + watermark.height));
            svgNode.setAttribute("width", box.width + "px");
            svgNode.setAttribute("height", (box.height + watermark.height) + "px");
            return ldfile.fromURL(logo.url, 'dataurl').then(function(arg$){
              var result;
              result = arg$.result;
              lc.logo = result;
              return ldfile.fromURL(qrcode.url, 'dataurl');
            }).then(function(arg$){
              var result, svgStyle, svgRaw, svgXml;
              result = arg$.result;
              lc.qrcode = result;
              svgStyle = "<style type=\"text/css\">\nsvg { background: #fff }\ntext { font-family: sans-serif; }\n.text-sm { font-size: .8em }\n</style>\n<image x=\"" + watermark.padding + "\" y=\"" + (box.height + watermark.padding) + "\"\nxlink:href=\"" + lc.logo + "\" width=\"" + logo.width + "\" height=\"" + logo.height + "\"/>\n<image x=\"" + (box.width - qrcode.width - watermark.padding) + "\" y=\"" + (box.height + watermark.padding) + "\"\nxlink:href=\"" + lc.qrcode + "\" width=\"" + qrcode.width + "\" height=\"" + qrcode.height + "\"/>";
              svgRaw = svgNode.outerHTML.replace('</svg>', svgStyle + "</svg>");
              lc.svgXml = svgXml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" + svgRaw;
              return smiltool.svgToDataurl(svgRaw, box.width, box.height + watermark.height);
            }).then(function(u){
              return smiltool.urlToDataurl(u, box.width, box.height + watermark.height);
            }).then(function(u){
              return smiltool.dataurlToBlob(u);
            }).then(function(png){
              var u, zip;
              switch (name) {
              case 'zip':
                u = URL.createObjectURL(png);
                zip = new JSZip();
                zip.file("result.csv", ba.buffer);
                zip.file("result.svg", lc.svgXml);
                zip.file("result.png", png);
                return zip.generateAsync({
                  type: 'blob'
                }).then(function(it){
                  return {
                    blob: it,
                    name: "result.zip"
                  };
                });
              case 'csv':
                return {
                  blob: csv4xls.toBlob(csv),
                  name: "result.csv"
                };
              case 'png':
                return {
                  blob: png,
                  name: "result.png"
                };
              case 'svg':
                return {
                  blob: new Blob([lc.svgXml], {
                    type: "image/svg+xml"
                  }),
                  name: "result.svg"
                };
              }
            }).then(function(arg$){
              var blob, name;
              blob = arg$.blob, name = arg$.name;
              return ldfile.download({
                blob: blob,
                name: name
              });
            });
          },
          "toggle-ldcv": function(arg$){
            var node;
            node = arg$.node;
            return this$.ldcv[node.getAttribute('data-name')].toggle(true);
          },
          mode: function(arg$){
            var node;
            node = arg$.node;
            return this$.setMode(node.getAttribute('data-name'));
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
        player: function(arg$){
          var node;
          node = arg$.node;
          return node.classList.toggle('disabled', this$.perspective === 'pie');
        },
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
        "set-pal": function(arg$){
          var node, type, name;
          node = arg$.node;
          type = node.getAttribute('data-type');
          name = node.getAttribute('data-name');
          return node.classList.toggle('active', this$.config.pal[type] === name);
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
  init: function(arg$){
    var dataset, this$ = this;
    dataset = arg$.dataset;
    return Promise.resolve().then(function(){
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
      this$.setCattype("產業別");
      this$.setValtype("營業額");
      return this$.prepare();
    });
  },
  _popup: function(){
    var x, y, popup, ref$;
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
      left: (x + (this.bipolar
        ? 0
        : this.scale.x.bandwidth() / 2)) + "px",
      opacity: 1
    });
    if (y <= this.box.height / 2) {
      ref$ = popup.style;
      ref$.top = (y + 60) + "px";
      ref$.bottom = 'auto';
    } else {
      ref$ = popup.style;
      ref$.bottom = (this.box.height - y) + "px";
      ref$.top = 'auto';
    }
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
    d3.select(this.svg.trend).on('click', function(){
      if (+getComputedStyle(this$.view.get('popup')).opacity === 1) {
        return this$.unpopup();
      }
      if (ld$.parent(d3.event.target, '.legend')) {
        return;
      }
      if (!ld$.parent(d3.event.target, '.bands') && !ld$.parent(d3.event.target, '.stack')) {
        return;
      }
      this$.ldcv["subchart"].toggle(true);
      return this$.setPerspective('bar');
    });
    d3.select(this.svg.trend).on('mouseout', function(){
      this$.popup().cancel();
      this$.highlight().cancel();
      return this$.render();
    });
    return d3.select(this.svg.trend).on('mousemove', function(){
      var m, popup, range, x, y, band, pts, pt;
      m = d3.mouse(this$.svg.trend);
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
      d3.select(this$.svg.trend).selectAll('circle').transition('mouse-hover').duration(50).attr('r', function(d, i){
        if (this$.active && d.key === this$.active.key) {
          return 10;
        } else {
          return 5;
        }
      });
      d3.select(this$.svg.trend).selectAll('path.line').transition('mouse-hover').duration(50).attr('stroke-width', function(d, i){
        if (this$.active && d.catname === this$.active.catname) {
          return 3;
        } else {
          return 1;
        }
      });
      return this$.popup();
    });
  },
  getColor: function(opt){
    var hash, isHighlight, isActive, _color, range, hcl, order, ref$, cs, ac, this$ = this;
    opt == null && (opt = {});
    hash = {};
    isHighlight = opt.highlight && Array.isArray(opt.highlight);
    isActive = opt.highlight && this.active;
    _color = function(d, h, c, l){
      if (isHighlight) {
        if (in$(d, opt.highlight)) {
          return range(h, c, l);
        } else {
          return '#eee';
        }
      } else if (isActive) {
        if (d === this$.active.catname) {
          return range(h, c, l);
        } else {
          return '#eee';
        }
      } else {
        return range(h, c, l);
      }
    };
    range = function(h, c, l){
      return ldColor.hex({
        h: 20 + 320 * h,
        c: 70 + 30 * c,
        l: 45 + 45 * l
      });
    };
    if (this.config.pal.sort === 'hue') {
      hcl = function(c, d, i){
        var h, l;
        h = c = i / c.length;
        l = (i % 4) / 3;
        return hash[d] = _color(d, h, c, l);
      };
    } else if (this.config.pal.sort === 'light') {
      hcl = function(c, d, i){
        var l, h;
        c = l = (c.length - i) / c.length;
        h = (i % 6) / 5;
        return hash[d] = _color(d, h, c, l);
      };
    } else {
      order = (ref$ = this.config.pal).order || (ref$.order = []);
      hcl = function(c, d, i){
        var l, h;
        if (!(order.length && order.length === c.length)) {
          order = this$.config.pal.order = (function(){
            var i$, to$, results$ = [];
            for (i$ = 0, to$ = c.length; i$ < to$; ++i$) {
              results$.push(i$);
            }
            return results$;
          }());
          order.sort(function(){
            return Math.random() * 2 - 1;
          });
        }
        i = order.indexOf(i);
        c = l = (c.length - i) / c.length;
        h = (i % 6) / 5;
        return hash[d] = _color(d, h, c, l);
      };
    }
    if (this.config.pal.sel === 'all') {
      cs = this.categories.map(function(d, i){
        return hcl(this$.categories, d, i);
      });
    } else {
      ac = this.activeCategories.map(function(it){
        return it;
      });
      ac.sort(function(a, b){
        return this$.categories.indexOf(a) - this$.categories.indexOf(b);
      });
      ac.map(function(d, i){
        return hcl(ac, d, i);
      });
      this.categories.filter(function(d, i){
        return !in$(d, this$.activeCategories);
      }).map(function(d, i){
        return hash[d] = '#eee';
      });
      cs = this.categories.map(function(d){
        return hash[d];
      });
    }
    return this.scale.color = d3.scaleOrdinal().domain(this.categories.concat(['全不選', '全選', '配色'])).range(cs.concat(['#fff', '#fff', '#fff']));
  },
  _render: function(opt){
    var pts, lines, catname, ref$, vals, line, i$, to$, i, p, ptsValid, valsAlt, legend, x$, legendGroup, vp, y$, numformat, xaxis, yaxis, z$, z1$, yUnit, z2$, z3$, activeLine, ps, psFixed, sim, initSel, z4$, z5$, this$ = this;
    opt == null && (opt = {});
    this.view.render();
    this.pts = pts = [];
    this.lines = lines = [];
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
        p.percent.offset = 100 * p.percent.offset / sum;
        results$.push(p.percent.delta = 100 * p.percent.delta / sum);
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
    this.box = this.svg.trend.getBoundingClientRect();
    this.scale.x = this.bipolar
      ? d3.scaleLinear().domain(this.mode === 'value'
        ? [Math.min.apply(Math, valsAlt), Math.max.apply(Math, valsAlt)]
        : [Math.max.apply(Math, valsAlt), Math.min.apply(Math, valsAlt)])
      : d3.scaleBand().domain(this.years);
    legend = d3.legendColor().shape('path', d3.symbol().type(d3.symbolCircle).size(90)()).shapePadding(3).scale(this.scale.color);
    x$ = d3.select(this.svg.trend).selectAll('g.legend').data([this.cattype], function(it){
      return it;
    });
    x$.exit().remove();
    x$.enter().append('g').attr('class', 'legend text-sm').style('cursor', 'pointer').call(legend).selectAll('g.cell').on('click', function(d){
      return this$.toggleActiveCategories(d);
    });
    d3.select(this.svg.trend).selectAll('g.legend').call(legend);
    legendGroup = ld$.find(this.svg.trend, 'g.legend', 0);
    this.vp = vp = {
      x: cfg.yaxisWidth + cfg.yaxisPl + cfg.margin,
      y: cfg.margin,
      w: this.box.width - legendGroup.getBoundingClientRect().width - cfg.legendPl - 2 * cfg.margin - cfg.yaxisWidth - cfg.yaxisPl,
      h: this.box.height - 2 * cfg.margin - cfg.xaxisHeight - cfg.xaxisPb
    };
    import$(this.scale, {
      py: d3.scaleLinear().range([vp.y + vp.h, vp.y]).domain([100, 0]),
      y: d3.scaleLinear().range([vp.y + vp.h, vp.y]).domain(this.mode === 'value'
        ? [Math.min.apply(Math, vals), Math.max.apply(Math, vals)]
        : [Math.max.apply(Math, vals), Math.min.apply(Math, vals)])
    });
    legendGroup.setAttribute('transform', "translate(" + (vp.x + vp.w + cfg.legendPl) + ", 24)");
    this.scale.x.range([vp.x, vp.x + vp.w]);
    d3.select(this.svg.trend).select('g.legend').selectAll('g.cell').transition().duration(350).style('opacity', function(d, i){
      return (d === '全不選' || d === '全選' || d === '配色') || in$(d, this$.activeCategories || []) ? 1 : 0.3;
    });
    y$ = d3.select(this.svg.trend).select('g.bands').selectAll('rect.band').data(this.bipolar
      ? []
      : this.years, function(it){
      return it;
    });
    y$.exit().remove();
    y$.enter().append('rect').attr('class', 'band');
    d3.select(this.svg.trend).selectAll('rect.band').attr('x', function(it){
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
    z$ = d3.select(this.svg.trend).selectAll('text.axis-x').data([1], function(it){
      return it;
    });
    z$.exit().remove();
    z$.enter().append('text').attr('class', 'axis-x').attr('text-anchor', 'middle').attr('dy', '-.5em').attr('font-size', '.8em');
    d3.select(this.svg.trend).selectAll('text.axis-x').attr('transform', "translate(" + (vp.x + vp.w / 2) + ", " + (this.box.height - cfg.xaxisPb / 2) + ")").text(this.valtypeAlt + (this.unitAlt ? " ╱ 單位：" + this.unitAlt : ''));
    z1$ = d3.select(this.svg.trend).selectAll('text.axis-y').data([1], function(it){
      return it;
    });
    z1$.exit().remove();
    z1$.enter().append('text').attr('class', 'axis-y').attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('rotate', '-90').attr('font-size', '.8em');
    yUnit = this.mode === 'proportion'
      ? "%"
      : this.mode === 'rank'
        ? "排名︹由多到少︺"
        : this.unit;
    d3.select(this.svg.trend).selectAll('text.axis-y').attr('transform', "translate(" + cfg.yaxisPl / 2 + ", " + (20 + vp.y + vp.h / 2) + ") rotate(90)").text(this.valtype + (yUnit ? "　╱　單位 ︰ " + yUnit : ''));
    z2$ = d3.select(this.svg.trend).selectAll('g.axis-x').data([1], function(it){
      return it;
    });
    z2$.exit().remove();
    z2$.enter().append('g').attr('class', 'axis-x').call(xaxis);
    d3.select(this.svg.trend).selectAll('g.axis-x').attr('transform', "translate(0," + (this.box.height - cfg.xaxisHeight - cfg.xaxisPb) + ")").transition().duration(350).call(xaxis);
    z3$ = d3.select(this.svg.trend).selectAll('g.axis-y').data([1], function(it){
      return it;
    });
    z3$.exit().remove();
    z3$.enter().append('g').attr('class', 'axis-y').call(yaxis);
    d3.select(this.svg.trend).selectAll('g.axis-y').attr('transform', "translate(" + (cfg.yaxisWidth + cfg.yaxisPl) + ",0)").transition().duration(350).call(yaxis);
    this.renderLine();
    this.renderCircle();
    this.renderRect();
    if (this.active && this.bipolar) {
      activeLine = lines.filter(function(it){
        return this$.active.catname === it.catname;
      })[0];
      if (activeLine) {
        ps = activeLine.pts.map(function(d){
          return {
            data: d,
            year: d.year,
            x: this$.scale.x(d.x) + Math.random() * 10,
            y: this$.scale.y(d.y) + Math.random() * 10,
            cx: this$.scale.x(d.x),
            cy: this$.scale.y(d.y)
          };
        });
        psFixed = activeLine.pts.map(function(d){
          return {
            data: d,
            year: d.year,
            fx: this$.scale.x(d.x),
            fy: this$.scale.y(d.y),
            cx: this$.scale.x(d.x),
            cy: this$.scale.y(d.y)
          };
        });
        sim = d3.forceSimulation().nodes(ps.concat(psFixed)).force('charge', d3.forceManyBody().strength(-120)).force('sticky', function(alpha){
          return ps.map(function(it){
            var r;
            r = Math.sqrt(Math.pow(it.cx - it.x, 2) + Math.pow(it.cy - it.y, 2));
            it.x = it.x + (it.cx - it.x) * (r - 20) * 0.02 * alpha;
            it.y = it.y + (it.cy - it.y) * (r - 20) * 0.02 * alpha;
            if (it.x >= vp.w + vp.x) {
              it.x = vp.w + vp.x;
            }
            if (it.y >= vp.h + vp.y) {
              it.y = vp.h + vp.y;
            }
            if (it.x <= vp.x) {
              it.x = vp.x;
            }
            if (it.y <= vp.y) {
              return it.y = vp.y;
            }
          });
        });
        sim.stop();
        sim.tick(100);
        initSel = d3.select(this.svg.trend).selectAll('text.year-label').data(ps, function(it){
          return it.year;
        });
        z4$ = initSel;
        z4$.exit().remove();
        z4$.enter().append('text').attr('class', 'year-label').attr('font-size', '.7em').attr('dy', '.38em').attr('text-anchor', 'middle');
        d3.select(this.svg.trend).selectAll('text.year-label').text(function(d){
          return d.year;
        }).attr('x', function(d){
          return d.x;
        }).attr('y', function(d){
          return d.y;
        }).transition().duration(150).attr('opacity', 0.7);
        initSel = d3.select(this.svg.trend).selectAll('line.year-label').data(ps, function(it){
          return it.year;
        });
        z5$ = initSel;
        z5$.exit().remove();
        z5$.enter().append('line').attr('class', 'year-label').attr('stroke', '#ccc').attr('stroke-width', 1).attr('stroke-dasharray', '2 2');
        return d3.select(this.svg.trend).selectAll('line.year-label').text(function(d){
          return d.year;
        }).attr('x1', function(d){
          return d.cx;
        }).attr('y1', function(d){
          return d.cy;
        }).attr('x2', function(d){
          return d.x;
        }).attr('y2', function(d){
          return d.y;
        }).transition().duration(150).attr('opacity', 0.7);
      }
    } else {
      return d3.select(this.svg.trend).selectAll('.year-label').transition().duration(150).attr('opacity', 0);
    }
  }
});
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