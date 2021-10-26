(function(){
var konfig;
konfig = function(opt){
  var this$ = this;
  opt == null && (opt = {});
  this.root = typeof opt.root === 'string'
    ? document.querySelector(opt.root)
    : opt.root;
  this.opt = opt;
  this.evtHandler = {};
  this.useBundle = opt.useBundle != null ? opt.useBundle : true;
  this._ctrlobj = {};
  this._ctrllist = [];
  this._tabobj = {};
  this._tablist = [];
  this._meta = opt.meta || {};
  this._tab = opt.tab || {};
  this._val = {};
  this.typemap = opt.typemap || null;
  this.mgr = this.mgrFallback = new block.manager({
    registry: function(arg$){
      var name, version, path;
      name = arg$.name, version = arg$.version, path = arg$.path;
      throw new Error("@plotdb/konfig: " + name + "@" + version + " is not supported");
    }
  });
  if (opt.manager) {
    this.mgr = opt.manager;
    this.mgr.setFallback(this.mgrFallback);
  }
  this.init = proxise.once(function(){
    return this$._init();
  });
  this.update = debounce(150, function(){
    return this$._update();
  });
  return this;
};
konfig.prototype = import$(Object.create(Object.prototype), {
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
  render: function(){
    return this.view.render();
  },
  meta: function(it){
    if (!(it != null)) {
      return this._meta;
    }
    this._meta = it;
    return this.render();
  },
  tab: function(it){
    if (!(it != null)) {
      return this._tab;
    }
    this._tab = it;
    return this.render();
  },
  get: function(){
    return JSON.parse(JSON.stringify(this._val));
  },
  set: function(it){
    this._val = JSON.parse(JSON.stringify(it));
    return this.render();
  },
  _update: function(){
    return this.fire('change', this._val);
  },
  _init: function(){
    var this$ = this;
    return this.mgr.init().then(function(){
      if (this$.useBundle) {
        return konfig.bundle || [];
      } else {
        return [];
      }
    }).then(function(data){
      return this$.mgr.set(data.map(function(d){
        return new block['class']((d.manager = this$.mgr, d));
      }));
    }).then(function(){
      return this$.build();
    });
  },
  _prepareTab: function(tab){
    var ref$, root, d;
    if (this._tabobj[tab.id]) {
      return ref$ = this._tabobj[tab.id], ref$.tab = tab, ref$;
    }
    root = document.createElement('div');
    this._tablist.push(d = {
      root: root,
      tab: tab,
      key: Math.random().toString(36).substring(2)
    });
    return this._tabobj[tab.id] = d;
  },
  _prepareCtrl: function(meta, val, ctrl){
    var id, ref$, name, version, path, ret, this$ = this;
    id = meta.id;
    if (ctrl[id]) {
      return Promise.resolve();
    }
    if (meta.block) {
      ref$ = {
        name: (ref$ = meta.block).name,
        version: ref$.version,
        path: ref$.path
      }, name = ref$.name, version = ref$.version, path = ref$.path;
    } else if (this.typemap && (ret = this.typemap(meta.id))) {
      name = ret.name, version = ret.version, path = ret.path;
    } else {
      ref$ = [meta.id, "master", ''], name = ref$[0], version = ref$[1], path = ref$[2];
    }
    return this.mgr.get({
      name: name,
      version: version,
      path: path
    }).then(function(it){
      return it.create({
        data: meta
      });
    }).then(function(itf){
      var root;
      root = document.createElement('div');
      if (!(meta.tab != null)) {
        meta.tab = 'default';
      }
      if (!this$._tabobj[meta.tab]) {
        this$._prepareTab({
          id: meta.tab
        });
      }
      this$._ctrllist.push(ctrl[id] = {
        itf: itf,
        meta: meta,
        root: root,
        key: Math.random().toString(36).substring(2)
      });
      return itf.attach({
        root: root
      }).then(function(){
        return itf['interface']();
      });
    }).then(function(item){
      var v;
      val[id] = v = item.get();
      this$.update();
      return item.on('change', function(it){
        val[id] = it;
        return this$.update();
      });
    }).then(function(){
      return ctrl[id];
    });
  },
  _view: function(){
    var this$ = this;
    return this.view = new ldview({
      root: this.root,
      handler: {
        config: {
          list: function(){
            return this$._ctrllist;
          },
          key: function(it){
            return it.key;
          },
          init: function(arg$){
            var node, data;
            node = arg$.node, data = arg$.data;
            return node.appendChild(data.root);
          }
        }
      }
    });
  },
  _viewAlt: function(){
    var this$ = this;
    this._tablist.sort(function(a, b){
      return b.tab.order - a.tab.order;
    });
    return this.view = new ldview({
      root: this.root,
      handler: {
        tab: {
          list: function(){
            return this$._tablist;
          },
          key: function(it){
            return it.key;
          },
          view: {
            text: {
              name: function(arg$){
                var ctx;
                ctx = arg$.ctx;
                return ctx.tab.id;
              }
            },
            handler: {
              config: {
                list: function(arg$){
                  var ctx;
                  ctx = arg$.ctx;
                  return this$._ctrllist.filter(function(it){
                    return it.meta.tab === ctx.tab.id;
                  });
                },
                key: function(it){
                  return it.key;
                },
                init: function(arg$){
                  var node, data;
                  node = arg$.node, data = arg$.data;
                  return node.appendChild(data.root);
                }
              }
            }
          }
        }
      }
    });
  },
  build: function(clear){
    var this$ = this;
    clear == null && (clear = false);
    this._buildTab(clear);
    return this._buildCtrl(clear).then(function(){
      return this$._viewAlt();
    });
  },
  _buildCtrl: function(clear){
    var promises, traverse, this$ = this;
    clear == null && (clear = false);
    promises = [];
    traverse = function(meta, val, ctrl){
      var ctrls, id, v, results$ = [];
      val == null && (val = {});
      ctrl == null && (ctrl = {});
      if (!meta) {
        return;
      }
      ctrls = meta.child ? meta.child : meta;
      if (!ctrls) {
        return;
      }
      for (id in ctrls) {
        v = ctrls[id];
        v.id = id;
        if (v.type) {
          promises.push(this$._prepareCtrl(v, val, ctrl));
          continue;
        }
        results$.push(traverse(v, val[id] || (val[id] = {}), ctrl[id] || (ctrl[id] = {})));
      }
      return results$;
    };
    if (clear && this._ctrllist) {
      this._ctrllist.map(function(arg$){
        var itf, root;
        itf = arg$.itf, root = arg$.root;
        if (itf.destroy) {
          itf.destroy();
        }
        if (root.parentNode) {
          return root.parentNode.removeChild(root);
        }
      });
    }
    if (clear || !this._val) {
      this._val = {};
    }
    if (clear || !this._ctrlobj) {
      this._ctrlobj = {};
    }
    if (clear || !this._ctrllist) {
      this._ctrllist = [];
    }
    traverse(this._meta, this._val, this._ctrlobj);
    return Promise.all(promises);
  },
  _buildTab: function(clear){
    var traverse, this$ = this;
    clear == null && (clear = false);
    if (this.renderMode === 'ctrl') {
      return;
    }
    if (clear && this._tablist) {
      this._tablist.map(function(arg$){
        var root;
        root = arg$.root;
        return root.parentNode.removeChild(root);
      });
    }
    if (clear || !this._tablist) {
      this._tablist = [];
    }
    if (clear || !this._tab) {
      this._tab = {};
    }
    traverse = function(tab){
      var list, id, v, i$, len$, item, results$ = [];
      if (!tab) {
        return;
      }
      list = Array.isArray(tab)
        ? tab
        : (function(){
          var ref$, results$ = [];
          for (id in ref$ = tab) {
            v = ref$[id];
            results$.push({
              id: id,
              v: v
            });
          }
          return results$;
        }()).map(function(arg$, i){
          var id, v;
          id = arg$.id, v = arg$.v;
          if (!(v.order != null)) {
            v.order = i;
          }
          return v.id = id, v;
        });
      for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
        item = list[i$];
        this$._prepareTab(item);
        results$.push(traverse(item.child));
      }
      return results$;
    };
    return traverse(this._tab);
  }
});
if (typeof module != 'undefined' && module !== null) {
  module.exports = konfig;
} else if (typeof window != 'undefined' && window !== null) {
  window.konfig = konfig;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
konfig.bundle = (konfig.bundle || []).concat([{"name":"@plotdb/konfig.widget.default","version":"master","path":"base","code":"<div><div class=\"d-flex\"><div class=\"flex-grow-1 d-flex align-items-center\"><div ld=\"name\"></div><div ld=\"hint\">?</div></div><plug name=\"ctrl\"></plug></div><plug name=\"config\"></plug><style type=\"text/css\">[ld=hint] {\n  margin-left: 0.5em;\n  width: 1.2em;\n  height: 1.2em;\n  border-radius: 50%;\n  background: rgba(0,0,0,0.1);\n  font-size: 10px;\n  line-height: 1.1em;\n  text-align: center;\n  cursor: pointer;\n}\n</style><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      dependencies: [\n        {\n          url: \"/assets/lib/ldview/main/index.js\"\n        }, {\n          url: \"/assets/lib/@loadingio/debounce.js/main/debounce.min.js\"\n        }\n      ]\n    },\n    init: function(arg$){\n      var root, context, data, pubsub, t, view, this$ = this;\n      root = arg$.root, context = arg$.context, data = arg$.data, pubsub = arg$.pubsub, t = arg$.t;\n      this.data = {};\n      pubsub.on('init', function(opt){\n        var itf;\n        opt == null && (opt = {});\n        this$.data = opt.data || {};\n        this$.itf = itf = {\n          evtHandler: {},\n          get: opt.get || function(){},\n          set: opt.set || function(){},\n          on: function(n, cb){\n            var ref$;\n            return ((ref$ = this.evtHandler)[n] || (ref$[n] = [])).push(cb);\n          },\n          fire: function(n){\n            var v, res$, i$, to$, ref$, len$, cb, results$ = [];\n            res$ = [];\n            for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {\n              res$.push(arguments[i$]);\n            }\n            v = res$;\n            for (i$ = 0, len$ = (ref$ = this.evtHandler[n] || []).length; i$ < len$; ++i$) {\n              cb = ref$[i$];\n              results$.push(cb.apply(this, v));\n            }\n            return results$;\n          }\n        };\n        return view.render('hint');\n      });\n      pubsub.on('event', function(n){\n        var v, res$, i$, to$;\n        res$ = [];\n        for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {\n          res$.push(arguments[i$]);\n        }\n        v = res$;\n        return this$.itf.fire.apply(this$.itf, [n].concat(v));\n      });\n      return view = new ldview({\n        root: root,\n        text: {\n          name: function(){\n            return t(data.name);\n          }\n        },\n        handler: {\n          hint: function(arg$){\n            var node;\n            node = arg$.node;\n            return node.classList.toggle('d-none', !this$.data.hint);\n          }\n        },\n        action: {\n          click: {\n            hint: function(){\n              return alert(t(this$.data.hint || 'no hint'));\n            }\n          }\n        }\n      });\n    },\n    'interface': function(){\n      return this.itf;\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"boolean","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: []\n    },\n    init: function(arg$){\n      var root, context, pubsub, ldview, obj, view;\n      root = arg$.root, context = arg$.context, pubsub = arg$.pubsub;\n      ldview = context.ldview;\n      obj = {\n        state: false\n      };\n      pubsub.fire('init', {\n        get: function(){\n          return obj.state;\n        },\n        set: function(it){\n          return obj.state = !!it;\n        }\n      });\n      return view = new ldview({\n        root: root,\n        action: {\n          click: {\n            'switch': function(){\n              obj.state = !obj.state;\n              view.render('switch');\n              return pubsub.fire('event', 'change', obj.state);\n            }\n          }\n        },\n        handler: {\n          'switch': function(arg$){\n            var node;\n            node = arg$.node;\n            return node.classList.toggle('on', obj.state);\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"choice","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: []\n    },\n    init: function(arg$){\n      var root, context, data, pubsub, cfg, ldview, view;\n      root = arg$.root, context = arg$.context, data = arg$.data, pubsub = arg$.pubsub;\n      cfg = data;\n      ldview = context.ldview;\n      pubsub.fire('init', {\n        get: function(){\n          return view.get('select').value;\n        },\n        set: function(it){\n          return view.get('select').value = it;\n        }\n      });\n      return view = new ldview({\n        root: root,\n        action: {\n          change: {\n            select: function(arg$){\n              var node;\n              node = arg$.node;\n              return pubsub.fire('event', 'change', node.value);\n            }\n          }\n        },\n        handler: {\n          option: {\n            list: function(){\n              return cfg.values;\n            },\n            key: function(it){\n              return it;\n            },\n            init: function(arg$){\n              var node, data;\n              node = arg$.node, data = arg$.data;\n              if (cfg['default'] === data) {\n                return node.setAttribute('selected', 'selected');\n              }\n            },\n            handler: function(arg$){\n              var node, data;\n              node = arg$.node, data = arg$.data;\n              node.setAttribute('value', data);\n              return node.textContent = data;\n            }\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"color","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: [\n        {\n          url: \"/assets/lib/ldcolor/main/ldcolor.min.js\",\n          async: false\n        }, {\n          url: \"/assets/lib/@loadingio/ldcolorpicker/main/ldcp.min.js\"\n        }, {\n          url: \"/assets/lib/@loadingio/ldcolorpicker/main/ldcp.min.css\",\n          global: true\n        }\n      ]\n    },\n    init: function(arg$){\n      var root, context, pubsub, ldview, ldcolor, view, this$ = this;\n      root = arg$.root, context = arg$.context, pubsub = arg$.pubsub;\n      ldview = context.ldview, ldcolor = context.ldcolor;\n      pubsub.fire('init', {\n        get: function(){\n          if (this$.ldcp) {\n            return ldcolor.web(this$.ldcp.getColor());\n          }\n        },\n        set: function(it){\n          return this$.ldcp.set(it);\n        }\n      });\n      return view = new ldview({\n        root: root,\n        init: {\n          color: function(arg$){\n            var node;\n            node = arg$.node;\n            this$.ldcp = new ldcolorpicker(node);\n            node.style.backgroundColor = ldcolor.web(this$.ldcp.getColor());\n            return this$.ldcp.on('change', function(it){\n              pubsub.fire('event', 'change', it);\n              return node.style.backgroundColor = ldcolor.web(it);\n            });\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"font","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: [\n        {\n          url: \"/assets/lib/choosefont.js/main/choosefont.min.js\"\n        }, {\n          url: \"/assets/lib/choosefont.js/main/choosefont.min.css\",\n          global: true\n        }, {\n          url: \"/assets/lib/ldcover/main/ldcv.min.js\"\n        }, {\n          url: \"/assets/lib/ldcover/main/ldcv.min.css\"\n        }\n      ]\n    },\n    init: function(arg$){\n      var root, context, data, pubsub, ldview, ldcover, ChooseFont, obj, view;\n      root = arg$.root, context = arg$.context, data = arg$.data, pubsub = arg$.pubsub;\n      ldview = context.ldview, ldcover = context.ldcover, ChooseFont = context.ChooseFont;\n      obj = {\n        font: {}\n      };\n      pubsub.fire('init', {\n        get: function(){\n          return obj.font;\n        },\n        set: function(it){\n          return obj.fontview.get('input').value = it || '';\n        }\n      });\n      return view = new ldview({\n        root: root,\n        init: {\n          ldcv: function(arg$){\n            var node;\n            node = arg$.node;\n            return obj.ldcv = new ldCover({\n              root: node\n            });\n          },\n          inner: function(arg$){\n            var node;\n            node = arg$.node;\n            obj.cf = new ChooseFont({\n              root: node,\n              metaUrl: '/assets/lib/choosefont.js/main/fontinfo/meta.json',\n              base: 'https://plotdb.github.io/xl-fontset/alpha'\n            });\n            return obj.cf.init().then(function(){\n              return obj.cf.on('choose', function(it){\n                return obj.ldcv.set(it);\n              });\n            });\n          }\n        },\n        action: {\n          click: {\n            button: function(){\n              return obj.ldcv.get().then(function(it){\n                if (!it) {\n                  return;\n                }\n                return obj.font = it;\n              });\n            }\n          }\n        },\n        text: {\n          \"font-name\": function(){\n            return obj.font.name || 'Font';\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"number","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: [\n        {\n          url: \"/assets/lib/ldslider/main/ldrs.css\",\n          type: 'css'\n        }, {\n          url: \"/assets/lib/ldslider/main/ldrs.js\",\n          async: false\n        }\n      ]\n    },\n    init: function(arg$){\n      var root, context, data, pubsub, ldview, ldrs, obj, view;\n      root = arg$.root, context = arg$.context, data = arg$.data, pubsub = arg$.pubsub;\n      ldview = context.ldview, ldrs = context.ldrs;\n      obj = {};\n      pubsub.fire('init', {\n        get: function(){\n          return obj.ldrs.get();\n        },\n        set: function(it){\n          return obj.ldrs.set(it);\n        },\n        data: data\n      });\n      return view = new ldview({\n        root: root,\n        action: {\n          click: {\n            'switch': function(){\n              return obj.ldrs.edit();\n            }\n          }\n        },\n        init: {\n          ldrs: function(arg$){\n            var node, ref$;\n            node = arg$.node;\n            obj.ldrs = new ldslider((ref$ = {\n              root: node\n            }, ref$.min = data.min, ref$.max = data.max, ref$.step = data.step, ref$.from = data.from, ref$.to = data.to, ref$.exp = data.exp, ref$.limitMax = data.limitMax, ref$.range = data.range, ref$.label = data.label, ref$.limitMax = data.limitMax, ref$));\n            return obj.ldrs.on('change', function(it){\n              return pubsub.fire('event', 'change', it);\n            });\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"palette","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: [\n        {\n          url: \"/assets/lib/ldcover/main/ldcv.css\",\n          type: 'css'\n        }, {\n          url: \"/assets/lib/ldcover/main/ldcv.js\"\n        }, {\n          url: \"/assets/lib/ldcolor/main/ldcolor.js\",\n          async: false\n        }, {\n          url: \"/assets/lib/ldslider/main/ldrs.css\",\n          type: 'css'\n        }, {\n          url: \"/assets/lib/ldslider/main/ldrs.js\",\n          async: false\n        }, {\n          url: \"/assets/lib/@loadingio/ldcolorpicker/main/ldcp.css\",\n          type: 'css'\n        }, {\n          url: \"/assets/lib/@loadingio/ldcolorpicker/main/ldcp.js\",\n          async: false\n        }, {\n          url: \"/assets/lib/ldpalettepicker/main/ldpp.css\",\n          type: 'css'\n        }, {\n          url: \"/assets/lib/ldpalettepicker/main/ldpp.js\"\n        }\n      ]\n    },\n    init: function(arg$){\n      var root, context, pubsub, data, ldview, ldcolor, ldpp, ldCover, obj, view;\n      root = arg$.root, context = arg$.context, pubsub = arg$.pubsub, data = arg$.data;\n      ldview = context.ldview, ldcolor = context.ldcolor, ldpp = context.ldpp, ldCover = context.ldCover;\n      obj = {\n        pal: null\n      };\n      pubsub.fire('init', {\n        data: data,\n        get: function(){\n          return obj.pal;\n        },\n        set: function(it){\n          obj.pal = it;\n          return view.render();\n        }\n      });\n      root = ld$.find(root, '[plug=config]', 0);\n      view = new ldview({\n        root: root,\n        action: {\n          click: {\n            ldp: function(){\n              return obj.ldpp.get().then(function(it){\n                if (!it) {\n                  return;\n                }\n                obj.pal = it;\n                view.render('color');\n                return pubsub.fire('event', 'change', obj.pal);\n              });\n            }\n          }\n        },\n        init: {\n          ldcv: function(arg$){\n            var node;\n            node = arg$.node;\n            obj.ldpp = new ldpp({\n              root: node,\n              ldcv: true\n            });\n            return obj.pal = obj.ldpp.ldpe.getPal();\n          }\n        },\n        handler: {\n          color: {\n            list: function(){\n              var ref$;\n              return (ref$ = obj.pal || (obj.pal = {})).colors || (ref$.colors = []);\n            },\n            key: function(it){\n              return ldcolor.web(it);\n            },\n            handler: function(arg$){\n              var node, data;\n              node = arg$.node, data = arg$.data;\n              return node.style.backgroundColor = ldcolor.web(data);\n            }\n          }\n        }\n      });\n      return view.render();\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"paragraph","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: [\n        {\n          url: \"/assets/lib/ldcover/main/ldcv.min.js\"\n        }, {\n          url: \"/assets/lib/ldcover/main/ldcv.min.css\"\n        }\n      ]\n    },\n    init: function(arg$){\n      var root, context, data, pubsub, obj, ldview, ldCover, view;\n      root = arg$.root, context = arg$.context, data = arg$.data, pubsub = arg$.pubsub;\n      obj = {\n        data: data['default'] || ''\n      };\n      ldview = context.ldview, ldCover = context.ldCover;\n      pubsub.fire('init', {\n        get: function(){\n          return obj.data || '';\n        },\n        set: function(it){\n          obj.data = it || '';\n          return view.render();\n        }\n      });\n      return view = new ldview({\n        root: root,\n        init: {\n          ldcv: function(arg$){\n            var node;\n            node = arg$.node;\n            return obj.ldcv = new ldCover({\n              root: node\n            });\n          }\n        },\n        handler: {\n          panel: function(arg$){\n            var node;\n            node = arg$.node;\n          },\n          input: function(arg$){\n            var node;\n            node = arg$.node;\n            return node.value = obj.data || '';\n          },\n          textarea: function(arg$){\n            var node;\n            node = arg$.node;\n            return node.value = obj.data || '';\n          }\n        },\n        action: {\n          click: {\n            input: function(arg$){\n              var node, ibox, pbox;\n              node = arg$.node;\n              ibox = view.get('input').getBoundingClientRect();\n              pbox = view.get('panel').getBoundingClientRect();\n              import$(view.get('panel').style, {\n                width: ibox.width + \"px\",\n                left: ibox.left + \"px\",\n                top: ibox.top + \"px\"\n              });\n              return obj.ldcv.get().then(function(it){\n                var value;\n                if (it !== 'ok') {\n                  return;\n                }\n                value = view.get('textarea').value;\n                if (obj.data !== value) {\n                  pubsub.fire('event', 'change', value);\n                }\n                obj.data = value;\n                return view.render();\n              });\n            }\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});\nfunction import$(obj, src){\n  var own = {}.hasOwnProperty;\n  for (var key in src) if (own.call(src, key)) obj[key] = src[key];\n  return obj;\n}</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"text","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: []\n    },\n    init: function(arg$){\n      var root, context, data, pubsub, ldview, view;\n      root = arg$.root, context = arg$.context, data = arg$.data, pubsub = arg$.pubsub;\n      ldview = context.ldview;\n      pubsub.fire('init', {\n        get: function(){\n          return view.get('input').value || '';\n        },\n        set: function(it){\n          return view.get('input').value = it || '';\n        }\n      });\n      return view = new ldview({\n        root: root,\n        init: {\n          input: function(arg$){\n            var node;\n            node = arg$.node;\n            return node.value = data['default'] || '';\n          }\n        },\n        action: {\n          input: {\n            input: function(arg$){\n              var node;\n              node = arg$.node;\n              return pubsub.fire('event', 'change', node.value);\n            }\n          },\n          change: {\n            input: function(arg$){\n              var node;\n              node = arg$.node;\n              return pubsub.fire('event', 'change', node.value);\n            }\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"upload","code":"<div><script type=\"@plotdb/block\">(function(it){\n  return it();\n})(function(){\n  var blockFactory;\n  blockFactory = {\n    pkg: {\n      extend: {\n        name: '@plotdb/konfig.widget.default',\n        version: 'master',\n        path: 'base'\n      },\n      dependencies: []\n    },\n    init: function(arg$){\n      var root, context, data, pubsub, ldview, view;\n      root = arg$.root, context = arg$.context, data = arg$.data, pubsub = arg$.pubsub;\n      ldview = context.ldview;\n      pubsub.fire('init', {\n        get: function(){\n          return view.get('input').value || '';\n        },\n        set: function(it){\n          return view.get('input').value = it || '';\n        }\n      });\n      return view = new ldview({\n        root: root,\n        init: {\n          input: function(arg$){\n            var node;\n            node = arg$.node;\n            if (data.multiple) {\n              return node.setAttribute('multiple', true);\n            }\n          }\n        },\n        action: {\n          change: {\n            input: function(arg$){\n              var node;\n              node = arg$.node;\n              return pubsub.fire('event', 'change', node.files);\n            }\n          }\n        }\n      });\n    }\n  };\n  return blockFactory;\n});</script></div>"}]);
})();
