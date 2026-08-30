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
  this.view = opt.view;
  this.autotab = opt.autotab || false;
  this._ctrlobj = {};
  this._ctrllist = [];
  this._tabobj = {};
  this._tablist = [];
  this._template = null;
  this._meta = this._clone(opt.meta || {});
  this._tab = opt.tab || {};
  this._val = {};
  this._obj = {};
  this._objps = [];
  this.ensureBuilt = proxise(function(){
    return this$.ensureBuilt.running === true
      ? null
      : Promise.resolve();
  });
  this.typemap = opt.typemap || null;
  this.mgr = this.mgrChain = new block.manager({
    registry: function(arg$){
      var name, version, path;
      name = arg$.name, version = arg$.version, path = arg$.path;
      throw new Error("@plotdb/konfig: " + name + "@" + version + "/" + path + " is not supported");
    }
  });
  if (opt.manager) {
    this.mgr = opt.manager;
    this.mgr.chain(this.mgrChain);
  }
  this.init = proxise.once(function(){
    return this$._init();
  }, function(){
    return this$._val;
  });
  this._updateDebounced = debounce(150, function(n, v){
    return this$._update(n, v);
  });
  this.doDebounce = !(opt.debounce != null) || opt.debounce;
  this.update = function(n, v){
    if (this$.doDebounce) {
      return this$._updateDebounced(n, v);
    } else {
      return this$._update(n, v);
    }
  };
  return this;
};
konfig.views = {
  simple: function(){
    var this$ = this;
    return new ldview({
      root: this.root,
      initRender: false,
      handler: {
        ctrl: {
          list: function(){
            return this$._ctrllist.filter(function(it){
              return !it.meta.hidden;
            });
          },
          key: function(it){
            return it.key;
          },
          init: function(arg$){
            var node, data;
            node = arg$.node, data = arg$.data;
            return node.appendChild(data.root);
          },
          handler: function(arg$){
            var node, data;
            node = arg$.node, data = arg$.data;
            if (!data.root.parentNode) {
              return node.appendChild(data.root);
            }
          }
        }
      }
    });
  },
  'default': function(){
    var this$ = this;
    return new ldview({
      root: this.root,
      initRender: false,
      handler: {
        tab: {
          list: function(){
            this$._tablist.sort(function(a, b){
              return b.tab.order - a.tab.order;
            });
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
              ctrl: {
                list: function(arg$){
                  var ctx;
                  ctx = arg$.ctx;
                  return this$._ctrllist.filter(function(it){
                    return it.meta.tab === ctx.tab.id && !it.meta.hidden;
                  });
                },
                key: function(it){
                  return it.key;
                },
                init: function(arg$){
                  var node, data;
                  node = arg$.node, data = arg$.data;
                  return node.appendChild(data.root);
                },
                handler: function(arg$){
                  var node, data;
                  node = arg$.node, data = arg$.data;
                  if (!data.root.parentNode) {
                    node.appendChild(data.root);
                  }
                  return data.itf.render();
                }
              }
            }
          }
        }
      }
    });
  },
  recurse: function(){
    var template, opt, this$ = this;
    if (this._template) {
      template = this._template;
    } else {
      template = ld$.find(this.root, '[ld=template]', 0);
      template.parentNode.removeChild(template);
      template.removeAttribute('ld-scope');
      this._template = template;
    }
    template = template.cloneNode(true);
    return new ldview(import$({
      ctx: {
        tab: {
          id: null
        }
      }
    }, import$(opt = {}, {
      template: template,
      root: this.root,
      initRender: false,
      text: {
        name: function(arg$){
          var ctx;
          ctx = arg$.ctx;
          return ctx.tab ? (ctx.tab.name || '') + "" : '';
        }
      },
      handler: {
        tab: {
          list: function(arg$){
            var ctx, tabs;
            ctx = arg$.ctx;
            tabs = this$._tablist.filter(function(it){
              return !(it.tab.parent.tab.id || ctx.tab.id) || (it.tab.parent && ctx.tab && it.tab.parent.tab.id === ctx.tab.id);
            });
            tabs.sort(function(a, b){
              return b.tab.order - a.tab.order;
            });
            return tabs;
          },
          key: function(it){
            return it.key;
          },
          view: opt
        },
        ctrl: {
          list: function(arg$){
            var ctx, ret;
            ctx = arg$.ctx;
            ret = this$._ctrllist.filter(function(it){
              if (!ctx.tab) {
                return false;
              }
              return it.meta.tab === ctx.tab.id && !it.meta.hidden;
            });
            return ret;
          },
          key: function(it){
            return it.key;
          },
          init: function(arg$){
            var node, data;
            node = arg$.node, data = arg$.data;
            return node.appendChild(data.root);
          },
          handler: function(arg$){
            var node, data;
            node = arg$.node, data = arg$.data;
            if (!data.root.parentNode) {
              node.appendChild(data.root);
            }
            node.style.flex = "1 1 " + 16 * (data.meta.weight || 1) + "%";
            return data.itf.render();
          }
        }
      }
    })));
  }
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
  render: function(clear){
    var payload;
    clear == null && (clear = false);
    if (!this.view) {
      return;
    }
    if (!this._view || clear === true) {
      if (typeof this.view === 'string') {
        this._view = this._view || konfig.views[this.view].apply(this);
      } else if (typeof this.view === 'function') {
        payload = {
          root: this.root,
          ctrls: this._ctrllist,
          tabs: this._tablist
        };
        this._view = this.view.apply(payload, [payload]);
      } else {
        this._view = this.view;
        this._view.ctx({
          root: this.root,
          ctrls: this._ctrllist,
          tabs: this._tablist
        });
      }
    }
    return this._view.render();
  },
  _clone: function(n, r){
    var k, v;
    r == null && (r = {});
    if (Array.isArray(n)) {
      return n.slice(0);
    }
    if (typeof n !== 'object') {
      return n;
    }
    for (k in n) {
      v = n[k];
      r[k] = this._clone(v);
    }
    return r;
  },
  meta: function(o){
    var meta, tab, config, this$ = this;
    if (o == null) {
      return this._clone(this._meta);
    }
    meta = o.meta, tab = o.tab, config = o.config;
    this._meta = {};
    this._tab = {};
    return Promise.resolve().then(function(){
      return this$.fire('meta:building');
    }).then(function(){
      if (!(meta != null) || typeof meta.type === 'string') {
        this$._meta = this$._clone(o);
        return this$.build(true);
      } else {
        if (meta != null) {
          this$._meta = this$._clone(meta);
        }
        if (tab != null) {
          this$._tab = tab;
        }
        return this$.build(true, config);
      }
    }).then(function(){
      return this$.fire('meta:built');
    });
  },
  'default': function(){
    var traverse, ret;
    traverse = function(meta, val, ctrl, pid){
      var ctrls, id, v, results$ = [];
      val == null && (val = {});
      ctrl == null && (ctrl = {});
      ctrls = meta.child ? meta.child : meta;
      for (id in ctrls) {
        v = ctrls[id];
        if (v.type) {
          results$.push(val[id] = ctrl[id].itf['default']());
        } else if (v !== ctrls) {
          results$.push(traverse(v, val[id] || (val[id] = {}), ctrl[id] || (ctrl[id] = {}), id));
        }
      }
      return results$;
    };
    traverse(this._meta, ret = {}, this._ctrlobj, null);
    return ret;
  },
  reset: function(){
    var nv;
    nv = this['default']();
    this.set(nv);
    return this._update();
  },
  limited: function(opt){
    var lc, ret, traverse;
    opt == null && (opt = {});
    lc = {
      any: false
    };
    ret = {};
    traverse = function(meta, val, ctrl){
      var ctrls, id, v, results$ = [];
      val == null && (val = {});
      ctrl == null && (ctrl = {});
      ctrls = meta.child ? meta.child : meta;
      for (id in ctrls) {
        v = ctrls[id];
        if (v.type) {
          val[id] = ctrl[id].itf.limited != null && ctrl[id].itf.limited();
          results$.push(lc.any = lc.any || val[id]);
        } else if (v !== ctrls) {
          results$.push(traverse(v, val[id] || (val[id] = {}), ctrl[id] || (ctrl[id] = {})));
        }
      }
      return results$;
    };
    traverse(this._meta, ret, this._ctrlobj);
    return opt.detail
      ? ret
      : lc.any;
  },
  get: function(){
    return JSON.parse(JSON.stringify(this._val));
  },
  _objwait: function(p){
    var ps;
    this._objps.push(p);
    if (this._objps.length < 100) {
      return;
    }
    ps = this._objps.splice(0);
    return this._objps.push(Promise.all(ps));
  },
  obj: function(){
    var this$ = this;
    return this.ensureBuilt().then(function(){
      return Promise.all(this$._objps);
    })['finally'](function(){
      return this$._objps.splice(0);
    }).then(function(){
      return this$._obj;
    });
  },
  set: function(nv, o){
    var traverse, this$ = this;
    o == null && (o = {});
    nv = JSON.parse(JSON.stringify(nv));
    this.render();
    traverse = function(meta, val, obj, nval, ctrl, pid){
      var ctrls, id, v, results$ = [];
      val == null && (val = {});
      obj == null && (obj = {});
      nval == null && (nval = {});
      ctrl == null && (ctrl = {});
      if (typeof (ctrls = meta.child ? meta.child : meta) !== 'object') {
        return;
      }
      for (id in ctrls) {
        v = ctrls[id];
        if (v.type) {
          if (val[id] !== nval[id] && !(o.append && !(nval[id] != null))) {
            val[id] = nval[id];
            if (!(ctrl[id] && ctrl[id].itf)) {
              results$.push(console.warn("@plotdb/konfig: set config `" + id + "` without corresponding ctrl defined in meta."));
            } else {
              ctrl[id].itf.set(val[id], {
                passive: true
              });
              val[id] = ctrl[id].itf.get();
              results$.push(fn$(id));
            }
          }
        } else if (typeof v === 'object' && v !== ctrls) {
          results$.push(traverse(v, val[id] || (val[id] = {}), obj[id] || (obj[id] = {}), nval[id] || (nval[id] = {}), ctrl[id] || (ctrl[id] = {}), id));
        } else {
          results$.push(console.warn("@plotdb/konfig: set malformat config under " + id, ctrls));
        }
      }
      return results$;
      function fn$(id){
        return this$._objwait(Promise.resolve(ctrl[id].itf.object(val[id])).then(function(it){
          return obj[id] = it;
        }));
      }
    };
    return (o.build
      ? Promise.resolve()
      : this.ensureBuilt()).then(function(){
      if (o.build || !this$.ensureBuilt.running) {
        return traverse(this$._meta, this$._val, this$._obj, nv, this$._ctrlobj, null);
      }
    });
  },
  _update: function(n, v){
    return this.fire('change', JSON.parse(JSON.stringify(this._val)), n, v);
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
    }).then(function(){
      return this$._val;
    });
  },
  _prepareTab: function(tab){
    var ctab, root, d;
    if (this._tabobj[tab.id]) {
      ctab = this._tabobj[tab.id].tab;
      if (ctab.depth < tab.depth) {
        ctab.tab = tab;
      }
      return ctab;
    }
    root = document.createElement('div');
    this._tablist.push(d = {
      root: root,
      tab: tab,
      ctrls: [],
      tabs: [],
      key: "tabkey-" + this._tablist.length + "-" + Math.random().toString(36).substring(2)
    });
    return this._tabobj[tab.id] = d;
  },
  'interface': function(meta){
    var ref$, name, version, path, ret, ns, id, that, this$ = this;
    if (meta.block) {
      ref$ = {
        name: (ref$ = meta.block).name,
        version: ref$.version,
        path: ref$.path
      }, name = ref$.name, version = ref$.version, path = ref$.path;
    } else if (this.typemap && (ret = this.typemap(meta.type))) {
      ns = ret.ns, name = ret.name, version = ret.version, path = ret.path;
    } else {
      ref$ = ['', meta.type, konfig.version, ''], ns = ref$[0], name = ref$[1], version = ref$[2], path = ref$[3];
    }
    id = block.id({
      ns: ns,
      name: name,
      version: version,
      path: path
    });
    if (that = (this._lib || (this._lib = {}))[id]) {
      return Promise.resolve(that);
    }
    return this.mgr.get({
      ns: ns,
      name: name,
      version: version,
      path: path
    }).then(function(it){
      return it.create({
        data: meta
      });
    }).then(function(b){
      return b.attach().then(function(){
        return b['interface']();
      });
    }).then(function(itf){
      itf == null && (itf = {});
      return this$._lib[id] = itf;
    });
  },
  _prepareCtrl: function(meta, val, obj, ctrl){
    var id, ref$, name, version, path, ret, ns, this$ = this;
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
    } else if (this.typemap && (ret = this.typemap(meta.type))) {
      ns = ret.ns, name = ret.name, version = ret.version, path = ret.path;
    } else {
      ref$ = ['', meta.type, konfig.version, ''], ns = ref$[0], name = ref$[1], version = ref$[2], path = ref$[3];
    }
    return this.mgr.get({
      ns: ns,
      name: name,
      version: version,
      path: path
    }).then(function(it){
      return it.create({
        data: meta
      });
    }).then(function(b){
      var root, tabo;
      root = document.createElement('div');
      if (!(meta.tab != null)) {
        meta.tab = 'default';
      }
      tabo = !this$._tabobj[meta.tab]
        ? this$._prepareTab({
          id: meta.tab,
          name: meta.tab,
          depth: 0,
          parent: {
            tab: {}
          }
        })
        : this$._tabobj[meta.tab];
      this$._ctrllist.push(ctrl[id] = {
        block: b,
        meta: meta,
        root: root,
        key: "ctrlkey-" + this$._ctrllist.length + "-" + Math.random().toString(36).substring(2)
      });
      tabo.ctrls.push(ctrl[id]);
      return b.attach({
        root: root,
        defer: true
      }).then(function(){
        return b['interface']();
      }).then(function(it){
        return ctrl[id].itf = it;
      });
    }).then(function(item){
      var v;
      val[id] = v = item.get();
      this$._objwait(Promise.resolve(item.object(v)).then(function(it){
        return obj[id] = it;
      }));
      item.on('action', function(d){
        return this$.fire('action', {
          src: item,
          data: d
        });
      });
      return item.on('change', function(it){
        val[id] = it;
        this$._objwait(Promise.resolve(item.object(it)).then(function(it){
          return obj[id] = it;
        }));
        return this$.update(id, it);
      });
    }).then(function(){
      return ctrl[id];
    });
  },
  build: function(clear, cfg){
    var this$ = this;
    clear == null && (clear = false);
    return (this.ensureBuilt.running
      ? this.ensureBuilt()
      : Promise.resolve()).then(function(){
      this$.ensureBuilt.running = true;
      return Promise.resolve().then(function(){
        this$._buildTab(clear);
        return this$._buildCtrl(clear).then(function(){
          return this$._ctrllist.map(function(c){
            return c.block.attach();
          });
        }).then(function(){
          return this$.render(clear);
        }).then(function(){
          if (cfg != null) {
            return this$.set(cfg, {
              build: true
            });
          }
        }).then(function(){
          this$.ensureBuilt.running = false;
          this$.ensureBuilt.resolve();
        }).then(function(){
          return this$.update();
        });
      });
    });
  },
  _buildCtrl: function(clear){
    var promises, traverse, this$ = this;
    clear == null && (clear = false);
    promises = [];
    traverse = function(meta, val, obj, ctrl, pid, ptabo){
      var ctrls, tab, ref$, _tab, tabo, that, id, v, results$ = [];
      val == null && (val = {});
      obj == null && (obj = {});
      ctrl == null && (ctrl = {});
      if (!(meta && typeof meta === 'object')) {
        return;
      }
      ctrls = meta.child ? meta.child : meta;
      tab = meta.child ? meta.tab : null;
      if (((!tab && this$.autotab) || tab) && pid) {
        if (tab && typeof tab === 'object') {
          ref$ = [tab, tab.id], _tab = ref$[0], tab = ref$[1];
        }
        if (!tab) {
          tab = "tabid-" + this$._tablist.length + "-" + Math.random().toString(36).substring(2);
        }
        tabo = (that = this$._tabobj[tab])
          ? that
          : this$._prepareTab(import$({
            id: tab,
            name: pid,
            depth: ptabo ? ptabo.tab.depth + 1 : 0,
            order: meta.child && meta.order != null ? meta.order : void 8,
            parent: ptabo
              ? ptabo
              : {
                tab: {}
              }
          }, _tab != null && _tab
            ? _tab
            : {}));
        if (!tabo.tab.parent) {
          tabo.tab.parent = ptabo
            ? ptabo
            : {
              tab: {}
            };
        }
        if (tabo.tab.parent === ptabo && !in$(tabo, ptabo.tabs)) {
          ptabo.tabs.push(tabo);
        }
      }
      if (!ctrls) {
        return;
      }
      for (id in ctrls) {
        v = ctrls[id];
        if (v.type) {
          import$((v.id = id, v), tab && !v.tab
            ? {
              tab: tab
            }
            : {});
          promises.push(this$._prepareCtrl(v, val, obj, ctrl));
          continue;
        }
        results$.push(traverse(v, val[id] || (val[id] = {}), obj[id] || (obj[id] = {}), ctrl[id] || (ctrl[id] = {}), id, tabo));
      }
      return results$;
    };
    if (clear && this._ctrllist) {
      this._ctrllist.map(function(arg$){
        var block, root;
        block = arg$.block, root = arg$.root;
        if (block.destroy) {
          block.destroy();
        }
        if (root.parentNode) {
          return root.parentNode.removeChild(root);
        }
      });
    }
    return Promise.all((this._ctrllist || []).map(function(it){
      return it.block.detach();
    })).then(function(){
      if (clear || !this$._val) {
        this$._val = {};
        this$._obj = {};
      }
      if (clear || !this$._ctrlobj) {
        this$._ctrlobj = {};
      }
      if (clear || !this$._ctrllist) {
        this$._ctrllist = [];
      }
      traverse(this$._meta, this$._val, this$._obj, this$._ctrlobj, null);
      return Promise.all(promises);
    });
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
        if (root.parentNode) {
          return root.parentNode.removeChild(root);
        }
      });
    }
    if (clear || !this._tablist) {
      this._tablist = [];
    }
    if (!this._tab) {
      this._tab = {};
    }
    if (clear) {
      this._tabobj = {};
    }
    traverse = function(tab, depth, parent){
      var list, id, v, i$, to$, order, item, tabo, results$ = [];
      depth == null && (depth = 0);
      parent == null && (parent = {
        tab: {}
      });
      if (!(tab && (Array.isArray(tab) || typeof tab === 'object'))) {
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
          return v.id = id, v;
        });
      for (i$ = 0, to$ = list.length; i$ < to$; ++i$) {
        order = i$;
        item = list[order];
        import$((item.depth = depth, item.parent = parent, item), !item.name
          ? {
            name: item.id
          }
          : {});
        import$(item, !(item.order != null)
          ? {
            order: order
          }
          : {});
        tabo = this$._prepareTab(item);
        results$.push(traverse(item.child, (item.depth || 0) + 1, tabo));
      }
      return results$;
    };
    return traverse(JSON.parse(JSON.stringify(this._tab)));
  }
});
konfig.merge = function(des){
  var objs, res$, i$, to$, _, i;
  des == null && (des = {});
  res$ = [];
  for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {
    res$.push(arguments[i$]);
  }
  objs = res$;
  _ = function(des, src){
    var ref$, dc, sc, k, v;
    des == null && (des = {});
    src == null && (src = {});
    ref$ = [des.child ? des.child : des, src.child ? src.child : src], dc = ref$[0], sc = ref$[1];
    for (k in sc) {
      v = sc[k];
      if (v.type || (dc[k] && dc[k].type)) {
        if (!dc[k]) {
          dc[k] = src[k];
        } else if (dc[k]) {
          import$(dc[k], src[k]);
        }
      } else if (typeof sc[k] === 'object') {
        dc[k] = _(dc[k], sc[k]);
      }
    }
    return des;
  };
  for (i$ = 0, to$ = objs.length; i$ < to$; ++i$) {
    i = i$;
    des = _(des, JSON.parse(JSON.stringify(objs[i])));
  }
  return des;
};
konfig.append = function(){
  var cs, res$, i$, to$, ret, _, i, ref$, c1, c2;
  res$ = [];
  for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
    res$.push(arguments[i$]);
  }
  cs = res$;
  ret = {};
  _ = function(a, b){
    var k, v, results$ = [];
    for (k in b) {
      v = b[k];
      if (typeof v === 'object') {
        if (!typeof a[k] === 'object') {
          a[k] = {};
        }
        _(a[k], v);
      }
      results$.push(a[k] = v);
    }
    return results$;
  };
  for (i$ = cs.length - 2; i$ >= 0; --i$) {
    i = i$;
    ref$ = [JSON.parse(JSON.stringify(cs[i])), cs[i + 1]], c1 = ref$[0], c2 = ref$[1];
    _(c1, c2);
  }
  return c1;
};
konfig.prototype.utils = {
  merge: konfig.merge,
  append: konfig.append,
  views: konfig.views
};
konfig.version = 'main';
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
function in$(x, xs){
  var i = -1, l = xs.length >>> 0;
  while (++i < l) if (x === xs[i]) return true;
  return false;
}
konfig.bundle = (konfig.bundle || []).concat([{"name":"@plotdb/konfig","version":"main","path":"base","code":"<div><style type=\"text/css\">[ld=hint]{margin-left:.5em;width:1.2em;height:1.2em;border-radius:50%;background:rgba(0,0,0,0.1);font-size:10px;line-height:1.1em;text-align:center;cursor:pointer}</style><script type=\"@plotdb/block\">module.exports={pkg:{dependencies:[{name:\"@loadingio/vscroll\",version:\"main\",path:\"index.min.js\"},{name:\"@loadingio/debounce.js\",version:\"main\",path:\"index.min.js\"},{name:\"ldview\",version:\"main\",path:\"index.min.js\"},{name:\"ldcover\",version:\"main\",path:\"index.min.js\"},{name:\"ldcover\",version:\"main\",path:\"index.min.css\"},{name:\"ldloader\",version:\"main\",path:\"index.min.js\"},{name:\"ldloader\",version:\"main\",path:\"index.min.css\",global:true},{name:\"zmgr\",version:\"main\",path:\"index.min.js\"}]},init:function(n){var e,t,i,r,a,o,u,m,d,l,s=this;e=n.root,t=n.context,i=n.data,r=n.pubsub,a=n.t;this._meta=i;o=t.ldcover,u=t.ldloader,m=t.zmgr;d=new m;o.zmgr(d);u.zmgr(d);r.on(\"init\",function(n){var e;n==null&&(n={});s.itf=e={evtHandler:{},get:n.get||function(){},set:n.set||function(){},meta:n.meta||function(n){return s._meta=n},limited:n.limited||null,default:n[\"default\"]||function(){return(s._meta||{})[\"default\"]},object:n.object||function(n){return Promise.resolve(n)},render:function(){l.render();if(n.render){return n.render()}},on:function(n,t){var i=this;return(Array.isArray(n)?n:[n]).map(function(n){var e;return((e=i.evtHandler)[n]||(e[n]=[])).push(t)})},fire:function(n){var e,t,i,r,a,o,u,m=[];t=[];for(i=1,r=arguments.length;i<r;++i){t.push(arguments[i])}e=t;for(i=0,o=(a=this.evtHandler[n]||[]).length;i<o;++i){u=a[i];m.push(u.apply(this,e))}return m},action:n.action||{}};if(l){return l.render(\"hint\")}});r.on(\"event\",function(n){var e,t,i,r;t=[];for(i=1,r=arguments.length;i<r;++i){t.push(arguments[i])}e=t;return s.itf.fire.apply(s.itf,[n].concat(e))});if(!e){return}return l=new ldview({root:e,text:{name:function(){return a(s._meta.name||s._meta.id||\"\")}},handler:{hint:function(n){var e;e=n.node;return e.classList.toggle(\"d-none\",!s._meta.hint)}},action:{click:{hint:function(){return alert(a(s._meta.hint||\"no hint\"))}}}})},interface:function(){return this.itf}};</script><plug name=\"base\"><div class=\"d-flex align-items-center\"><div class=\"flex-grow-1 d-flex align-items-center\"><div ld=\"name\"></div><div ld=\"hint\">?</div></div><plug name=\"ctrl\"></plug></div><plug name=\"config\"></plug></plug></div>"},{"name":"@plotdb/konfig","version":"main","path":"boolean","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig\",version:\"main\",path:\"base\"},dependencies:[{name:\"ldview\",version:\"main\",path:\"index.min.js\"}]},init:function(t){var e,n,a,i,r,s,u,f,o=this;e=t.root,n=t.context,a=t.pubsub,i=t.data;r=n.ldview;s={default:false,state:undefined};u=function(t){t==null&&(t={});o._meta=JSON.parse(JSON.stringify(t));return s[\"default\"]=o._meta[\"default\"],s.state=s.state!=null?s.state:o._meta[\"default\"]||false,s};u(i);a.fire(\"init\",{get:function(){return s.state},set:function(t,e){var n;e==null&&(e={});n=s.state!==t&&!e.passive;s.state=!!t;if(n){a.fire(\"event\",\"change\",s.state)}return f.render(\"switch\")},default:function(){return s[\"default\"]},meta:function(t){return u(t)}});return f=new r({root:e,action:{click:{switch:function(){s.state=!s.state;f.render(\"switch\");return a.fire(\"event\",\"change\",s.state)}}},handler:{switch:function(t){var e;e=t.node;return e.classList.toggle(\"on\",s.state)}}})}};</script></div>"},{"name":"@plotdb/konfig","version":"main","path":"button","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig\",version:\"main\",path:\"base\"},dependencies:[],i18n:{\"zh-TW\":{config:\"設定\"}}},init:function(t){var n,e,a,u,r,i,o,d,f,c;n=t.root,e=t.context,a=t.data,u=t.pubsub,r=t.t;i=e.ldview,o=e.ldcolor;d={data:a[\"default\"],default:a[\"default\"]};f=function(){return u.fire(\"event\",\"change\",d.data)};u.fire(\"init\",{get:function(){return d.data},set:function(t,n){var e;n==null&&(n={});e=d.data!==t&&!n.passive;d.data=t;if(e){return f()}},default:function(){return d[\"default\"]},meta:function(t){return d.data=d[\"default\"]=t[\"default\"]}});return c=new i({root:n,action:{click:{button:function(){return Promise.resolve(a.cb(d.data)).then(function(t){if(d.data===t){return}d.data=t;return f()})}}},text:{button:function(){return a.text||\"...\"}}})}};</script></div>"},{"name":"@plotdb/konfig","version":"main","path":"choice","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig\",version:\"main\",path:\"base\"},dependencies:[]},init:function(e){var t,n,i,r,u,a,l,o,f,c,s=this;t=e.root,n=e.context,i=e.data,r=e.pubsub,u=e.t;this._meta={};a=n.ldview;l=function(){var e;e=o();return t.classList.toggle(\"limited\",e)};o=function(){if(s._meta.disableLimit){return false}if(s._meta.limit==null||s._meta.limit===false){return false}return typeof c!=\"undefined\"&&c!==null?!in$(c.get(\"select\").value,s._meta.limit):false};f=function(e){s._meta=JSON.parse(JSON.stringify(e));return l()};f(i);r.fire(\"init\",{get:function(){return c.get(\"select\").value},set:function(e,t){var n;t==null&&(t={});n=c.get(\"select\").value!==e&&!t.passive;c.get(\"select\").value=e;if(n){r.fire(\"event\",\"change\",e)}return l()},default:function(){return s._meta[\"default\"]},meta:function(e){return f(e)},limited:function(){return o()}});c=new a({root:t,action:{change:{select:function(e){var t;t=e.node;l();return r.fire(\"event\",\"change\",t.value)}}},handler:{select:function(e){var t;t=e.node;return t.setAttribute(\"aria-label\",s._meta.name||\"generic\")},option:{list:function(){return s._meta.values},key:function(e){return e.value||e},init:function(e){var t,n,i;t=e.node,n=e.data;i=typeof n===\"object\"?n.value:n;if(s._meta[\"default\"]===i){return t.setAttribute(\"selected\",\"selected\")}},handler:function(e){var t,n,i,r,a;t=e.node,n=e.data;i=typeof n===\"object\"?n:{value:n,name:n},r=i.value,a=i.name;t.setAttribute(\"value\",r);return t.textContent=u(a)}}}});return c.init().then(function(){return l()})}};function in$(e,t){var n=-1,i=t.length>>>0;while(++n<i)if(e===t[n])return true;return false}</script></div>"},{"name":"@plotdb/konfig","version":"main","path":"color","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig\",version:\"main\",path:\"base\"},dependencies:[{name:\"ldcolor\",version:\"main\",path:\"index.min.js\",async:false},{name:\"@loadingio/ldcolorpicker\",version:\"main\",path:\"index.min.js\"},{name:\"@loadingio/ldcolorpicker\",version:\"main\",path:\"index.min.css\",global:true}]},init:function(e){var t,r,n,o,i,c,l,a,u,s,d,f=this;t=e.root,r=e.context,n=e.pubsub,o=e.data;i=r.ldview,c=r.ldcolor,l=r.ldcolorpicker;this._meta=o;this.render=function(){n.fire(\"render\");if(typeof d!=\"undefined\"&&d!==null){return d.render()}};a=function(){return n.fire(\"event\",\"change\",f.c)};this.set=function(e){this.c=e;if(!(e===\"currentColor\"||e===\"transparent\"||isNaN(c.hsl(e).h))){this.ldcp.setColor(e)}return this.render()};this.prepareDefault=function(e){var t;e==null&&(e={});this[\"default\"]=(t=e[\"default\"])===\"currentColor\"||t===\"transparent\"?e[\"default\"]:c.web(e[\"default\"]||this.ldcp.getColor());if(e.overwrite){return this.set(this[\"default\"])}};u=function(e){var t,r,n;e==null&&(e={});t=e.palette||[\"#cc0505\",\"#f5b70f\",\"#9bcc31\",\"#089ccc\"];if(Array.isArray(t)){t={colors:t}}t.colors=t.colors.map(function(e){return c.web(e)});if(e[\"default\"]){r=c.web(e[\"default\"]);if(!in$(r,t.colors.concat([\"transparent\",\"currentColor\"]))){t.colors=[r].concat(t.colors)}}else{r=t.colors[e.idx||0]||e.colors[0]}if(!~(n=t.colors.indexOf(r))){n=0}return{palette:t,default:r,idx:n}};n.fire(\"init\",{get:function(){return f.c},set:function(e,t){var r;t==null&&(t={});r=!c.same(e,f.c)&&!t.passive;f.set(e);if(r){return a()}},default:function(){return f[\"default\"]},meta:function(e){var t;f._meta=e;t=u(e);f.ldcp.setPalette(t.palette);if(t.idx!=null){f.ldcp.setIdx(t.idx)}return f.prepareDefault({overwrite:true,default:t[\"default\"]})}});s=u(o);this.ldcp=new l(t.querySelector(\"[ld~=input]\"),{className:\"round shadow-sm round flat compact-palette no-empty-color vertical\",palette:s.palette,idx:s.idx,context:o.context||\"random\",exclusive:o.exclusive!=null?o.exclusive:true});this.prepareDefault({overwrite:true,default:s[\"default\"]});d=new i({root:t,action:{keyup:{input:function(e){var t,r,n;t=e.node,r=e.ctx,n=e.evt;if(n.keyCode===13){f.ldcp.setColor(t.value);return f.c=t.value}}},click:{default:function(e){var t,r;t=e.node,r=e.ctx;f.c=\"currentColor\";n.fire(\"event\",\"change\",f.c);return f.render()}}},handler:{preset:{list:function(){return f._meta.presets||[]},key:function(e){return e},view:{text:{\"@\":function(e){var t;t=e.ctx;return t}},action:{click:{\"@\":function(e){var t;t=e.ctx;f.c=t;n.fire(\"event\",\"change\",f.c);return f.render()}}}}},color:function(e){var t,r,n;t=e.node,r=e.ctx;n=c.web(f.c);if(t.nodeName.toLowerCase()===\"input\"){return t.value=isNaN(c.hsl(f.c).h)?f.c:n}else{return t.style.backgroundColor=n}}}});return this.ldcp.on(\"change\",function(e){f.c=c.web(e);a();return f.render()})}};function in$(e,t){var r=-1,n=t.length>>>0;while(++r<n)if(e===t[r])return true;return false}</script></div>"},{"name":"@plotdb/konfig","version":"main","path":"font","code":"<div><script type=\"@plotdb/block\">var singleton;singleton={digest:{}};module.exports={pkg:{syncInit:true,extend:{name:\"@plotdb/konfig\",version:\"main\",path:\"base\"},dependencies:[{name:\"@xlfont/load\",version:\"main\",path:\"index.min.js\"},{name:\"@xlfont/choose\",version:\"main\",path:\"index.min.js\"},{name:\"@xlfont/choose\",version:\"main\",path:\"index.min.css\",global:true}],i18n:{en:{default:\"Default\"},\"zh-TW\":{\"system default\":\"預設字型\"}}},destroy:function(){return this._obj.ldcv.destroy({removeNode:true})},init:function(n){var e,t,i,o,r,f,l,u,a,d,s,c,m,g,h,v,b,y,p;e=n.root,t=n.context,i=n.data,o=n.pubsub,r=n.t;f=t.ldview,l=t.ldcover,u=t.xfc;a=i.dataSource||{};this._obj=d={font:null,fobj:null,digest:singleton.digest};s=function(){return typeof d._m[\"default\"]===\"string\"?{name:d._m[\"default\"]}:d._m[\"default\"]||{}};c=function(n){var t,e,i;n==null&&(n={});t=n.font;e=n.cancelable;if(!t){t=d.font||(d.font=s())}i=(t.mod||(t.mod={})).file||{};return Promise.resolve().then(function(){return i.blob instanceof Blob?i.blob:d.digest[i.digest]?d.digest[i.digest].blob:null}).then(function(n){if(n||!i.digest){return n}else if(a.getBlob){return a.getBlob(i)}else{return n}}).then(function(n){i.blob=n;if(!(n&&a.digest)){return}return a.digest(i).then(function(n){var e;if(i.digest!==n){d.changed=true}i.digest=n;return import$((e=t.mod||(t.mod={})).file||(e.file={}),i)})}).then(function(){return b.load(t)[\"catch\"](function(){return b.load(s())})[\"catch\"](function(){return null})}).then(function(n){if(d.font!==t&&e){return lderror.reject(999)}if(d.font===t){d.fobj=n;m()}return n||{}})};m=function(){return e.classList.toggle(\"limited\",g())};g=function(){var n;return!!(d.fobj&&((n=d.fobj).mod||(n.mod={})).limited)};h=function(n){var e,t,i;n==null&&(n={});e=n.mod||{};t={name:n.name,style:n.style,weight:n.weight};if(e.limited){(t.mod||(t.mod={})).limited=e.limited}if(e.file&&(e.file.blob||e.file.key||e.file.digest)){(t.mod||(t.mod={})).file={key:(i=e.file).key,digest:i.digest,name:i.name,lastModified:i.lastModified,size:i.size,type:i.type}}return t};o.fire(\"init\",{get:function(){return!d.font?this[\"default\"]()||\"\":h(d.font)},set:function(n,e){var t,i;e==null&&(e={});t=!n?n:typeof n===\"string\"?{name:n}:h(n);i=JSON.stringify(d.font||{})!==JSON.stringify(t||{})&&!e.passive;d.font=t;d.fobj=null;if(i){o.fire(\"event\",\"change\",d.font)}return d.view.render(\"font-name\")},default:function(){return s()},meta:function(n){return d._meta=n},object:function(n){n==null&&(n={});return c({font:n})},limited:function(){return g()}});d._m=i||{};d.font=s();v=u.url?u.url():{};b=new u({root:!e?null:e.querySelector(\".ldcv\"),initRender:false,meta:v.meta||\"https://xlfont.maketext.io/meta\",links:v.links||\"https://xlfont.maketext.io/links\"});o.on(\"config\",function(n){n==null&&(n={});b.config(n);d.fobj=null;return c()});if(!e){return}b.on(\"choose\",function(n){return d.ldcv.set(n)});y=e.querySelector(\"[ld=ldcv]\");d.view=p=new f({root:e,init:{ldcv:function(n){var e;e=n.node;d.ldcv=new l({root:e,inPlace:false});return d.ldcv.on(\"toggle.on\",function(){return debounce(50).then(function(){return b.render()})})}},action:{click:{system:function(n){var e,t;e=n.node;d.font=t=null;d.fobj=null;p.render(\"font-name\");return o.fire(\"event\",\"change\",t)},button:function(n){var e;e=n.node;return d.ldcv.get().then(function(e){var t;if(!e){return{font:e}}t=(e.mod||{}).file;if(!(t&&t.blob&&a.digest)){return{font:e}}return a.digest(t).then(function(n){t.digest=n;d.digest[n]=t;if(a.getKey==null){return{font:e,file:t}}return a.getKey(t).then(function(n){t.key=n;return{font:e,file:t}})})}).then(function(n){var e,t,i;e=n.font,t=n.file;if(!e){return}d.font={name:e.name,style:e.style,weight:e.weight};((i=d.font).mod||(i.mod={})).file=t;d.fobj=null;p.render(\"font-name\");return o.fire(\"event\",\"change\",d.font)})}}},handler:{\"font-name\":function(n){var t,e;t=n.node;e=!d.font?r(\"default\"):d.font.name||r(\"default\");if(e.length>10){e=e.substring(0,10)+\"...\"}t.innerText=e;return c({cancelable:true}).then(function(n){var e;t.setAttribute(\"class\",(e=n&&n.className)?e:\"\");return t.setAttribute(\"title\",n?n.name||\"unnamed\":\"unnamed\")})[\"catch\"](function(n){if(lderror.id(n)===999){}})}}});return this.chooser=function(){return b},this.cover=function(){return d.ldcv},this.dom={cover:y},this.metadata=function(n){return b.metadata(n)},this}};function import$(n,e){var t={}.hasOwnProperty;for(var i in e)if(t.call(e,i))n[i]=e[i];return n}</script></div>"},{"name":"@plotdb/konfig","version":"main","path":"multiline","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig\",version:\"main\",path:\"base\"},dependencies:[]},init:function(t){var e,n,i,c,v,r,a,u,p;e=t.root,n=t.context,i=t.data,c=t.pubsub;v={default:i[\"default\"]||\"\",data:i[\"default\"]||\"\"};r=n.ldview,a=n.ldcover;c.fire(\"init\",{get:function(){return v.data||\"\"},set:function(t,e){var n;e==null&&(e={});n=v.data!==(t||\"\")&&!e.passive;v.data=t||\"\";if(n){c.fire(\"event\",\"change\",v.data)}return p.render()},default:function(){return v[\"default\"]},meta:function(t){return v[\"default\"]=t[\"default\"]}});u=function(t){var e,n;e=t.node;n=e.value;if(v.data!==n){c.fire(\"event\",\"change\",n)}v.data=n;return p.render()};return p=new r({root:e,init:{ldcv:function(t){var e;e=t.node;v.ldcv=new a({root:e,resident:false,inPlace:false});return v.ldcv.on(\"toggled.on\",function(){return p.get(\"textarea\").focus()})}},handler:{panel:function(t){var e;e=t.node},input:function(t){var e,n,i;e=t.node;e.value=v.data||\"\";e.textContent=(v.data||\"\").substring(0,10)+\" ...\";n=e.getAttribute(\"data-mode\");return e.classList.toggle(\"d-none\",!(i=n===\"multiline\")!==!v.multiline&&(i||v.multiline))},textarea:function(t){var e;e=t.node;return e.value=v.data||\"\"},multiline:function(t){var e;e=t.node;return e.classList.toggle(\"active\",!!v.multiline)}},action:{input:{input:u},change:{input:u},click:{multiline:function(t){var e;e=t.node;v.multiline=!v.multiline;return p.render(\"multiline\",\"input\")},input:function(t){var e,n,i,r,a,u,l,o,d,f;e=t.node;if(!v.multiline){return}n=p.getAll(\"input\").map(function(t){return t.getBoundingClientRect()}).filter(function(t){return t.width})[0];i=p.get(\"panel\").getBoundingClientRect();r=(a=window.innerWidth-(n.left+n.width))<(u=n.width/2)?a:u;l=(a=n.left)<(u=n.width/2)?a:u;o=n.left-l;d=n.width+r+l;f=n.top+(window.scrollTop||0);import$(p.get(\"ldcv\").style,{left:o+\"px\",top:f+\"px\"});import$(p.get(\"panel\").style,{width:d+\"px\"});return v.ldcv.get().then(function(t){var e;if(t!==\"ok\"){return}e=p.get(\"textarea\").value;if(v.data!==e){c.fire(\"event\",\"change\",e)}v.data=e;return p.render()})}}}})}};function import$(t,e){var n={}.hasOwnProperty;for(var i in e)if(n.call(e,i))t[i]=e[i];return t}</script></div>"},{"name":"@plotdb/konfig","version":"main","path":"note","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig\",version:\"main\",path:\"base\"},dependencies:[{name:\"marked\",version:\"main\",path:\"marked.min.js\"},{name:\"dompurify\",version:\"main\",path:\"dist/purify.min.js\"}]},init:function(e){var n,t,r,i,a,o,u,d,s,m,f,l=this;n=e.root,t=e.context,r=e.data,i=e.pubsub;a=t.ldview,o=t.marked,u=t.DOMPurify;d=new o.Renderer;d.link=function(e,n,t){var r;r=o.Renderer.prototype.link.call(this,e,n,t);return r.replace(\"<a\",'<a target=\"_blank\" rel=\"noopener noreferrer\" ')};o.setOptions({renderer:d});s={};this._meta={};m=function(e){return l._meta=JSON.parse(JSON.stringify(e))};i.fire(\"init\",{get:function(){return\"\"},set:function(e,n){n==null&&(n={});return\"\"},default:function(){return\"\"},meta:function(e){return m(e)},limited:function(){return false},render:function(){}});m(r);return f=new a({root:n,handler:{text:function(e){var n;n=e.node;if(l._meta.markdown!=null&&!l._meta.markdown){return n.textContent=l._meta.desc||\"\"}else{return n.innerHTML=u.sanitize(o.parse(l._meta.desc||\"\"))}}}})}};</script></div>"},{"name":"@plotdb/konfig","version":"main","path":"number","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig\",version:\"main\",path:\"base\"},dependencies:[{name:\"ldslider\",version:\"main\",path:\"index.min.css\"},{name:\"ldslider\",version:\"main\",path:\"index.min.js\"}]},init:function(t){var e,n,i,r,l,a,u,o,f,d,s,m,c,p=this;e=t.root,n=t.context,i=t.data,r=t.pubsub;l=n.ldview,a=n.ldslider;u={};this._meta={};o=function(){var t;if(!u.ldrs){return}t=Object.fromEntries([\"min\",\"max\",\"step\",\"from\",\"to\",\"exp\",\"limitMin\",\"limitMax\",\"range\",\"label\"].map(function(t){return[t,p._meta[t]]}).filter(function(t){return t[1]!=null}));if(!s()){delete t.limitMin;delete t.limitMax}return u.ldrs.setConfig(t)};f=function(t){if(t.from!=null){console.warn(\"[@plotdb/konfig] ctrl should use `default` for default value.\\nplease update your config to comply with it.\")}if(t[\"default\"]!=null){if(typeof t[\"default\"]===\"object\"){import$(t,t[\"default\"])}else if(typeof t[\"default\"]===\"number\"){t.from=t[\"default\"]}}p._meta=JSON.parse(JSON.stringify(t));return o()};d=function(){return e.classList.toggle(\"limited\",m())};s=function(){return!p._meta.disableLimit&&!!(p._meta.limitMax!=null||p._meta.limitMin!=null)};m=function(){var t;if(!s()){return false}t=u.ldrs.get();return p._meta.limitMax!=null&&t>p._meta.limitMax||p._meta.limitMin!=null&&t<=p._meta.limitMin};r.fire(\"init\",{get:function(){return u.ldrs.get()},set:function(t,e){var n;e==null&&(e={});n=u.ldrs.get()!==t&&!e.passive;u.ldrs.set(t);if(n){r.fire(\"event\",\"change\",t)}return d()},default:function(){return p._meta[\"default\"]},meta:function(t){return f(t)},limited:function(){return m()},render:function(){return u.ldrs.update()}});f(i);return c=new l({root:e,action:{click:{switch:function(){return u.ldrs.edit()}}},init:{ldrs:function(t){var e;e=t.node;u.root=e;u.ldrs=new a({root:e});o();u.ldrs.on(\"change\",function(t){d();return r.fire(\"event\",\"change\",t)});return d()}}})}};function import$(t,e){var n={}.hasOwnProperty;for(var i in e)if(n.call(e,i))t[i]=e[i];return t}</script></div>"},{"name":"@plotdb/konfig","version":"main","path":"palette","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig\",version:\"main\",path:\"base\"},dependencies:[{name:\"ldbutton\",version:\"main\",path:\"index.min.css\",global:true},{name:\"ldcolor\",version:\"main\",path:\"index.min.js\",async:false},{name:\"ldslider\",version:\"main\",path:\"index.min.js\",async:false},{name:\"ldslider\",version:\"main\",path:\"index.min.css\",global:true},{name:\"@loadingio/ldcolorpicker\",version:\"main\",path:\"index.min.js\",async:false},{name:\"@loadingio/ldcolorpicker\",version:\"main\",path:\"index.min.css\"},{name:\"@loadingio/vscroll\",version:\"main\",path:\"index.min.js\"},{name:\"ldpalettepicker\",version:\"main\",path:\"index.min.css\",global:true},{name:\"ldpalettepicker\",version:\"main\",path:\"index.min.js\"}]},init:function(e){var n,t,i,r,a,l,o,s,p,d,u,c,f,m=this;n=e.root,t=e.context,i=e.pubsub,r=e.data,a=e.i18n,l=e.manager;o=t.ldview,s=t.ldcolor,p=t.ldpp,d=t.ldcover;u={};c=function(e){e==null&&(e={});m._meta=JSON.parse(JSON.stringify(e));return u[\"default\"]=m._meta[\"default\"]||p.defaultPalette,u.pal=u.pal||m._meta[\"default\"]||p.defaultPalette,u};c(r);i.fire(\"init\",{get:function(){return u.pal},set:function(e,n){var t;n==null&&(n={});t=JSON.stringify(u.pal||{})!==JSON.stringify(e||{})&&!n.passive;u.pal=e;if(t){i.fire(\"event\",\"change\",u.pal)}return f.render()},default:function(){return u[\"default\"]},meta:function(e){return c(e)}});n=ld$.find(n,\"[plug=config]\",0);f=new o({root:n,action:{click:{ldp:function(e){var n,t;n=e.node;t=n.getAttribute(\"data-action\")||\"edit\";return Promise.resolve().then(function(){var e,n;if(u.initing){return u.initing()}if(u.ldpp){return}u.initing=proxise(function(){});e=Array.isArray(r.palettes)?r.palettes:typeof r.palettes===\"string\"?p.get(r.palettes):null;n=e?Promise.resolve(e):l.rescope.load([{name:\"ldpalettepicker\",version:\"main\",path:\"index.min.js\",async:false},{name:\"ldpalettepicker\",version:\"main\",path:\"all.palettes.js\"}]).then(function(e){var n;n=e.ldpp;return n.get(\"all\")});return n.then(function(e){u.ldpp=new p({root:f.get(\"ldcv\"),ldcv:{inPlace:false},useClusterizejs:true,i18n:a,palette:r.palette,palettes:e,useVscroll:true});if(!u.initing){return}u.initing.resolve();return u.initing=false})}).then(function(){u.ldpp.edit(u.pal,false);if(t===\"edit\"){u.ldpp.tab(\"edit\")}else{u.ldpp.tab(\"view\")}return u.ldpp.get()}).then(function(e){if(!e){return}u.pal=e;f.render(\"color\");return i.fire(\"event\",\"change\",u.pal)})}}},handler:{color:{list:function(){var e;return((e=u.pal||(u.pal={})).colors||(e.colors=[])).map(function(e,n){return import$({_idx:n},s.hsl(e))})},key:function(e){return e._idx},handler:function(e){var n,t;n=e.node,t=e.data;return n.style.backgroundColor=s.web(t)}}}});return f.render()}};function import$(e,n){var t={}.hasOwnProperty;for(var i in n)if(t.call(n,i))e[i]=n[i];return e}</script></div>"},{"name":"@plotdb/konfig","version":"main","path":"popup","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig\",version:\"main\",path:\"base\"},dependencies:[],i18n:{\"zh-TW\":{config:\"設定\"}}},init:function(t){var n,e,r,i,o,u,a,f,p,c,d;n=t.root,e=t.context,r=t.data,i=t.pubsub,o=t.t;u={};a=function(t){var n;if(!t){return null}else if(n=t.data){return n}else{return t}};f=function(t){var n;u.text=(n=t&&t.text)?n:typeof t===\"string\"?t+\"\":o(\"config\");return d.render(\"button\")};p=e.ldview,c=e.ldcolor;i.fire(\"init\",{get:function(){return r.popup.data()},set:function(t,n){n==null&&(n={});r.popup.data(t);if(!n.passive){i.fire(\"event\",\"change\",t)}return f(r.popup.data())}});return d=new p({root:n,action:{click:{button:function(){return r.popup.get().then(function(t){i.fire(\"event\",\"change\",a(t));return f(t)})}}},text:{button:function(){var t;if(t=u.text){return t}else{return o(\"config\")}}}})}};</script></div>"},{"name":"@plotdb/konfig","version":"main","path":"quantity","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig\",version:\"main\",path:\"base\"},dependencies:[{name:\"ldslider\",version:\"main\",path:\"index.min.css\"},{name:\"ldslider\",version:\"main\",path:\"index.min.js\"}],i18n:{en:{unit:\"Unit\"},\"zh-TW\":{unit:\"單位\"}}},init:function(n){var t,e,i,u,r,a,o,l,f,d,s,c,m=this;t=n.root,e=n.context,i=n.data,u=n.pubsub;r=e.ldview,a=e.ldslider;o={};this._meta={};l=function(){return o.ldrs.get()+\"\"+o.unit};f=function(n){var t;n==null&&(n={});t=l();if(!n.init&&t!==o.v){u.fire(\"event\",\"change\",t)}return o.v=t};d=function(n){var t,e;n==null&&(n={});t=import$({},n.unit);o.unit=t.name;if(t.from!=null){console.warn(\"[@plotdb/konfig] ctrl should use `default` for default value.\\nplease update your config to comply with it.\")}if(t[\"default\"]!=null){t.from=t[\"default\"]}o.ldrs.setConfig((e=Object.fromEntries([\"min\",\"max\",\"step\",\"from\",\"to\",\"exp\",\"limitMax\",\"range\",\"label\"].map(function(n){return[n,t[n]]}).filter(function(n){return n[1]!=null})),e.unit=t.name||\"\",e));f({init:n.init});return c.render()};s=function(n){var t;n==null&&(n={});m._meta=t=JSON.parse(JSON.stringify(n.meta||{}));return d({unit:t.units[0],init:n.init})};u.fire(\"init\",{get:function(){return l()},set:function(n,t){var e,i,r;t==null&&(t={});e=/^(\\d+(?:\\.(?:\\d+))?)(\\D*)/.exec(n+\"\");if(!e){e=/^(\\d+(?:\\.(?:\\d+))?)(\\D*)/.exec(this[\"default\"]()+\"\")}if(!e){e=[0,0,this._meta.units[0]]}i=e[2]||o.unit||this._meta.units[0];r=+e[1]!==o.ldrs.get()&&i!==o.unit&&!t.passive;o.ldrs.set(+e[1]);o.unit=i;if(r){u.fire(\"event\",\"change\",l())}return c.render()},default:function(){return m._meta[\"default\"]},meta:function(n){return s({meta:n})},render:function(){return o.ldrs.update()}});c=new r({root:t,initRender:false,action:{click:{switch:function(){return o.ldrs.edit()}}},init:{ldrs:function(n){var t;t=n.node;o.root=t;o.ldrs=new a({root:t});return o.ldrs.on(\"change\",function(){return f()})}},text:{picked:function(){return o.unit}},handler:{unit:{list:function(){return m._meta.units},key:function(n){return n.name},action:{click:function(n){var t;t=n.data;return d({unit:t})}},text:function(n){var t;t=n.data;return t.name}}}});return c.init().then(function(){return s({meta:i,init:true})})}};function import$(n,t){var e={}.hasOwnProperty;for(var i in t)if(e.call(t,i))n[i]=t[i];return n}</script></div>"},{"name":"@plotdb/konfig","version":"main","path":"text","code":"<div><script type=\"@plotdb/block\">module.exports={pkg:{extend:{name:\"@plotdb/konfig\",version:\"main\",path:\"base\"},dependencies:[]},init:function(e){var n,t,u,a,r,i,o,v=this;n=e.root,t=e.context,u=e.data,a=e.pubsub;r=t.ldview;i=function(e){v._meta=JSON.parse(JSON.stringify(e));return v._values=v._meta.values||[]};i(u);a.fire(\"init\",{get:function(){return o.get(\"input\").value||\"\"},set:function(e,n){var t;n==null&&(n={});t=o.get(\"input\").value!==(e||\"\")&&!n.passive;e=o.get(\"input\").value=e||\"\";if(t){return a.fire(\"event\",\"change\",e)}},default:function(){return v._meta[\"default\"]||\"\"},meta:function(e){return i(e)}});return o=new r({root:n,init:{input:function(e){var n;n=e.node;return n.value=u[\"default\"]||\"\"}},handler:{preset:{list:function(){return v._values||[]},key:function(e){return e.value||e.name||e},handler:function(e){var n,t;n=e.node,t=e.data;return n.textContent=t.name||t.value||t},action:{click:function(e){var n,t,u;n=e.node,t=e.data;o.get(\"input\").value=u=t.value||t;return a.fire(\"event\",\"change\",u)}}}},action:{input:{input:function(e){var n;n=e.node;return a.fire(\"event\",\"change\",n.value)}},change:{input:function(e){var n;n=e.node;return a.fire(\"event\",\"change\",n.value)}}}})}};</script></div>"},{"name":"@plotdb/konfig","version":"main","path":"upload","code":"<div><script type=\"@plotdb/block\">var singleton;singleton={digest:{}};module.exports={pkg:{extend:{name:\"@plotdb/konfig\",version:\"main\",path:\"base\"},dependencies:[{name:\"ldfile\"}]},init:function(e){var t,n,i,u,r,l,s,o,a,f,d=this;t=e.root,n=e.context,i=e.data,u=e.pubsub;r=n.ldview,l=n.ldfile;s=i.dataSource||{};this._meta=i;o={files:[],digest:singleton.digest};a=function(e){return e.map(function(e){return{name:e.name,size:e.size,type:e.type,lastModified:e.lastModified,key:e.key,idx:e.idx,digest:e.digest}})};u.fire(\"init\",{get:function(){return a(o.files)},set:function(e,t){t==null&&(t={});o.files=(Array.isArray(e)?e:[e]).map(function(e,t){var n,i,r;return i=(r=import$({},e),r.idx=t,r),i.blob=(n=o.digest[e.digest]||{}).blob,i.dataurl=n.dataurl,i});f.get(\"input\").value=\"\";if(!t.passive){return u.fire(\"event\",\"change\",a(o.files))}},default:function(){return[]},meta:function(e){return d._meta=e},object:function(){var t,e;t={changed:false};e=o.files.map(function(n,i){var e;if(n.blob){return Promise.resolve(n)}if(o.digest[n.digest]){return Promise.resolve((n.blob=(e=o.digest[n.digest]).blob,n.dataurl=e.dataurl,n))}if(n.result){n.dataurl=n.result;fetch(n.result).then(function(e){return e.blob()}).then(function(e){var t;n.name=n.name||\"unnamed\";t=(n.blob=e,n);t.size=e.size;t.type=e.type;t.lastModified=Date.now();delete n.result;if(s.digest==null){return n}else{return s.digest(n,i).then(function(e){return n.digest=e,n})}}).then(function(t){if(s.getKey==null){return t}else{return s.getKey(t,i).then(function(e){return t.key=e,t})}}).then(function(e){if(!e.digest){return e}else{return o.digest[e.digest]=e}}).then(function(){return t.changed=true})}if(n.key==null||s.getBlob==null){return Promise.resolve(n)}return s.getBlob(n,i).then(function(e){n.blob=e;return l.fromFile(e,\"dataurl\").then(function(e){n.dataurl=e.result;if(s.digest==null){return}return s.digest(n,i).then(function(e){if(n.digest!==e){t.changed=true}return n.digest=e})})})});return Promise.all(e).then(function(){if(t.changed){debounce(0).then(function(){return u.fire(\"event\",\"change\",a(o.files))})}return o.files})}});return f=new r({root:t,init:{input:function(e){var t;t=e.node;if(d._meta.multiple){return t.setAttribute(\"multiple\",true)}}},action:{change:{input:function(e){var i,t,r;i=e.node;t=function(){var e,t,n=[];for(e=0,t=i.files.length;e<t;++e){r=e;n.push(i.files[r])}return n}().map(function(n,i){return l.fromFile(n,\"dataurl\").then(function(e){var t;return t={name:n.name,size:n.size,type:n.type,lastModified:n.lastModified},t.dataurl=e.result,t.blob=n,t.idx=i,t}).then(function(t){if(s.digest==null){return t}else{return s.digest(t,i).then(function(e){return t.digest=e,t})}}).then(function(t){if(s.getKey==null){return t}else{return s.getKey(t,i).then(function(e){return t.key=e,t})}}).then(function(e){if(!e.digest){return e}else{return o.digest[e.digest]=e}})});return Promise.all(t).then(function(e){o.files=e;i.value=\"\";return u.fire(\"event\",\"change\",a(e))})}}}})}};function import$(e,t){var n={}.hasOwnProperty;for(var i in t)if(n.call(t,i))e[i]=t[i];return e}</script></div>"}]);
})();
