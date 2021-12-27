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
  this._meta = opt.meta || {};
  this._tab = opt.tab || {};
  this._val = {};
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
  this._updateDebounced = debounce(150, function(){
    return this$._update();
  });
  this.doDebounce = !(opt.debounce != null) || opt.debounce;
  this.update = function(){
    if (this$.doDebounce) {
      return this$._updateDebounced();
    } else {
      return this$._update();
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
    template = ld$.find(this.root, '[ld=template]', 0);
    template.parentNode.removeChild(template);
    template.removeAttribute('ld-scope');
    return new ldview(import$(opt = {}, {
      ctx: {
        tab: {
          id: null
        }
      },
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
              return !(it.tab.parent.id || ctx.tab.id) || (it.tab.parent && ctx.tab && it.tab.parent.id === ctx.tab.id);
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
            node.style.flex = "1 1 " + 16 * (data.meta.weight || 1) + "%";
            return data.itf.render();
          }
        }
      }
    }));
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
  render: function(){
    if (!this.view) {
      return;
    }
    if (!this._view) {
      if (typeof this.view === 'string') {
        this._view = konfig.views[this.view].apply(this);
      } else {
        this._view = this.view;
      }
    }
    return this._view.render();
  },
  meta: function(arg$){
    var meta, tab;
    meta = arg$.meta, tab = arg$.tab;
    if (meta != null) {
      this._meta = meta;
    }
    if (tab != null) {
      this._tab = tab;
    }
    return this.build(true);
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
    }).then(function(){
      return this$._val;
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
    } else if (this.typemap && (ret = this.typemap(meta.type))) {
      name = ret.name, version = ret.version, path = ret.path;
    } else {
      ref$ = [meta.type, "master", ''], name = ref$[0], version = ref$[1], path = ref$[2];
    }
    return this.mgr.get({
      name: name,
      version: version,
      path: path
    }).then(function(it){
      return it.create({
        data: meta
      });
    }).then(function(b){
      var root;
      root = document.createElement('div');
      if (!(meta.tab != null)) {
        meta.tab = 'default';
      }
      if (!this$._tabobj[meta.tab]) {
        this$._prepareTab({
          id: meta.tab,
          name: meta.tab,
          depth: 0,
          parent: {}
        });
      }
      this$._ctrllist.push(ctrl[id] = {
        block: b,
        meta: meta,
        root: root,
        key: Math.random().toString(36).substring(2)
      });
      return b.attach({
        root: root
      }).then(function(){
        return b['interface']();
      }).then(function(it){
        return ctrl[id].itf = it;
      });
    }).then(function(item){
      var v;
      val[id] = v = item.get();
      return item.on('change', function(it){
        val[id] = it;
        return this$.update();
      });
    }).then(function(){
      return ctrl[id];
    });
  },
  build: function(clear){
    var this$ = this;
    clear == null && (clear = false);
    this._buildTab(clear);
    return this._buildCtrl(clear).then(function(){
      return this$.render();
    }).then(function(){
      return this$.update();
    });
  },
  _buildCtrl: function(clear){
    var promises, traverse, this$ = this;
    clear == null && (clear = false);
    promises = [];
    traverse = function(meta, val, ctrl, pid){
      var ctrls, tab, id, v, results$ = [];
      val == null && (val = {});
      ctrl == null && (ctrl = {});
      if (!(meta && typeof meta === 'object')) {
        return;
      }
      ctrls = meta.child ? meta.child : meta;
      tab = meta.child ? meta.tab : null;
      if (!tab && this$.autotab && pid) {
        tab = pid;
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
          promises.push(this$._prepareCtrl(v, val, ctrl));
          continue;
        }
        results$.push(traverse(v, val[id] || (val[id] = {}), ctrl[id] || (ctrl[id] = {}), id));
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
    if (clear || !this._val) {
      this._val = {};
    }
    if (clear || !this._ctrlobj) {
      this._ctrlobj = {};
    }
    if (clear || !this._ctrllist) {
      this._ctrllist = [];
    }
    traverse(this._meta, this._val, this._ctrlobj, null);
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
        if (root.parentNode) {
          return root.parentNode.removeChild(root);
        }
      });
    }
    if (clear || !this._tablist) {
      this._tablist = [];
    }
    if (clear || !this._tab) {
      this._tab = {};
    }
    if (clear) {
      this._tabobj = {};
    }
    traverse = function(tab, depth, parent){
      var list, id, v, i$, to$, order, item, results$ = [];
      depth == null && (depth = 0);
      parent == null && (parent = {});
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
        import$((item.depth = depth, item.parent = parent, item), !v.name
          ? {
            name: item.id
          }
          : {});
        import$(item, !(v.order != null)
          ? {
            order: order
          }
          : {});
        this$._prepareTab(item);
        results$.push(traverse(item.child, (item.depth || 0) + 1, item));
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
konfig.bundle = (konfig.bundle || []).concat([{"name":"@plotdb/konfig.widget.default","version":"master","path":"base","code":"<div><div class=\"d-flex\"><div class=\"flex-grow-1 d-flex align-items-center\"><div ld=\"name\"></div><div ld=\"hint\">?</div></div><plug name=\"ctrl\"></plug></div><plug name=\"config\"></plug><style type=\"text/css\">[ld=hint]{margin-left:.5em;width:1.2em;height:1.2em;border-radius:50%;background:rgba(0,0,0,0.1);font-size:10px;line-height:1.1em;text-align:center;cursor:pointer}</style><script type=\"@plotdb/block\">(function(n){return n()})(function(){var n;n={pkg:{dependencies:[{name:\"ldview\",version:\"main\",path:\"index.min.js\"},{name:\"@loadingio/debounce.js\",version:\"main\",path:\"debounce.min.js\"},{name:\"ldcover\",version:\"main\",path:\"index.min.js\"},{name:\"ldcover\",version:\"main\",path:\"index.min.css\"}]},init:function(n){var t,e,r,i,o,a,u=this;t=n.root,e=n.context,r=n.data,i=n.pubsub,o=n.t;this.data={};i.on(\"init\",function(n){var t;n==null&&(n={});u.itf=t={evtHandler:{},get:n.get||function(){},set:n.set||function(){},render:function(){a.render();if(n.render){return n.render()}},on:function(n,e){var r=this;return(Array.isArray(n)?n:[n]).map(function(n){var t;return((t=r.evtHandler)[n]||(t[n]=[])).push(e)})},fire:function(n){var t,e,r,i,o,a,u,c=[];e=[];for(r=1,i=arguments.length;r<i;++r){e.push(arguments[r])}t=e;for(r=0,a=(o=this.evtHandler[n]||[]).length;r<a;++r){u=o[r];c.push(u.apply(this,t))}return c}};return a.render(\"hint\")});i.on(\"event\",function(n){var t,e,r,i;e=[];for(r=1,i=arguments.length;r<i;++r){e.push(arguments[r])}t=e;return u.itf.fire.apply(u.itf,[n].concat(t))});return a=new ldview({root:t,text:{name:function(){return o(r.name||r.id||\"\")}},handler:{hint:function(n){var t;t=n.node;return t.classList.toggle(\"d-none\",!r.hint)}},action:{click:{hint:function(){return alert(o(r.hint||\"no hint\"))}}}})},interface:function(){return this.itf}};return n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"boolean","code":"<div><script type=\"@plotdb/block\">(function(t){return t()})(function(){var t;t={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[]},init:function(t){var e,n,r,i,a,s,o;e=t.root,n=t.context,r=t.pubsub,i=t.data;a=n.ldview;s={state:i[\"default\"]||false};r.fire(\"init\",{get:function(){return s.state},set:function(t){return s.state=!!t}});return o=new a({root:e,action:{click:{switch:function(){s.state=!s.state;o.render(\"switch\");return r.fire(\"event\",\"change\",s.state)}}},handler:{switch:function(t){var e;e=t.node;return e.classList.toggle(\"on\",s.state)}}})}};return t});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"button","code":"<div><script type=\"@plotdb/block\">(function(t){return t()})(function(){var t;t={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[],i18n:{\"zh-TW\":{config:\"設定\"}}},init:function(t){var n,e,r,i,a,o,u,c,d;n=t.root,e=t.context,r=t.data,i=t.pubsub,a=t.t;o=e.ldview,u=e.ldcolor;c={data:r[\"default\"]};i.fire(\"init\",{get:function(){return c.data},set:function(t){return c.data=t}});return d=new o({root:n,action:{click:{button:function(){return Promise.resolve(r.cb(c.data)).then(function(t){if(c.data===t){return}return i.fire(\"event\",\"change\",c.data=t)})}}},text:{button:function(){return r.text||\"...\"}}})}};return t});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"choice","code":"<div><script type=\"@plotdb/block\">(function(e){return e()})(function(){var e;e={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[]},init:function(e){var t,n,r,u,i,a,o;t=e.root,n=e.context,r=e.data,u=e.pubsub;i=r;a=n.ldview;u.fire(\"init\",{get:function(){return o.get(\"select\").value},set:function(e){return o.get(\"select\").value=e}});return o=new a({root:t,action:{change:{select:function(e){var t;t=e.node;return u.fire(\"event\",\"change\",t.value)}}},handler:{option:{list:function(){return i.values},key:function(e){return e},init:function(e){var t,n;t=e.node,n=e.data;if(i[\"default\"]===n){return t.setAttribute(\"selected\",\"selected\")}},handler:function(e){var t,n;t=e.node,n=e.data;t.setAttribute(\"value\",n);return t.textContent=n}}}})}};return e});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"color","code":"<div><script type=\"@plotdb/block\">(function(e){return e()})(function(){var e;e={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[{name:\"ldcolor\",version:\"main\",path:\"ldcolor.min.js\",async:false},{name:\"@loadingio/ldcolorpicker\",version:\"main\",path:\"ldcp.min.js\"},{name:\"@loadingio/ldcolorpicker\",version:\"main\",path:\"ldcp.min.css\",global:true}]},init:function(e){var o,t,n,r,c,l,a,i,d=this;o=e.root,t=e.context,n=e.pubsub,r=e.data;c=t.ldview,l=t.ldcolor,a=t.ldcolorpicker;n.fire(\"init\",{get:function(){if(d.ldcp){return l.web(d.ldcp.getColor())}},set:function(e){return d.ldcp.set(e)}});this.ldcp=new a(o,{className:\"round shadow-sm round flat compact-palette no-button no-empty-color vertical\",palette:(r[\"default\"]?[r[\"default\"]]:[]).concat(r.palette||[\"#cc0505\",\"#f5b70f\",\"#9bcc31\",\"#089ccc\"]),context:r.context||\"random\",exclusive:r.exclusive!=null?r.exclusive:true});i=new c({ctx:{color:l.web(this.ldcp.getColor())},root:o,handler:{color:function(e){var o,t;o=e.node,t=e.ctx;if(o.nodeName.toLowerCase()===\"input\"){return o.value=t.color}else{return o.style.backgroundColor=t.color}}}});return this.ldcp.on(\"change\",function(e){var o;o=l.web(e);n.fire(\"event\",\"change\",o);i.setCtx({color:o});return i.render()})}};return e});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"font","code":"<div><script type=\"@plotdb/block\">(function(n){return n()})(function(){var n;n={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[{name:\"@plotdb/load\",version:\"main\",path:\"index.min.js\"},{name:\"@plotdb/choose\",version:\"main\",path:\"index.min.js\"},{name:\"@plotdb/choose\",version:\"main\",path:\"index.min.css\",global:true}]},init:function(n){var t,e,o,i,r,a,u,c,f;t=n.root,e=n.context,o=n.data,i=n.pubsub;r=e.ldview,a=e.ldcover,u=e.ChooseFont;c={font:{}};i.fire(\"init\",{get:function(){return c.font},set:function(n){return c.fontview.get(\"input\").value=n||\"\"}});return f=new r({root:t,init:{ldcv:function(n){var t;t=n.node;return c.ldcv=new a({root:t})},inner:function(n){var t;t=n.node;c.cf=new u({root:t,metaUrl:\"/assets/lib/choosefont.js/main/fontinfo/meta.json\",base:\"https://plotdb.github.io/xl-fontset/alpha\"});return c.cf.init().then(function(){return c.cf.on(\"choose\",function(n){return c.ldcv.set(n)})})}},action:{click:{button:function(){return c.ldcv.get().then(function(n){if(!n){return}return c.font=n})}}},text:{\"font-name\":function(){return c.font.name||\"Font\"}}})}};return n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"number","code":"<div><script type=\"@plotdb/block\">(function(e){return e()})(function(){var e;e={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[{name:\"ldslider\",version:\"main\",path:\"ldrs.min.css\"},{name:\"ldslider\",version:\"main\",path:\"ldrs.min.js\"}]},init:function(e){var n,t,r,i,o,l,u,a;n=e.root,t=e.context,r=e.data,i=e.pubsub;o=t.ldview,l=t.ldslider;u={};i.fire(\"init\",{get:function(){return u.ldrs.get()},set:function(e){return u.ldrs.set(e)},render:function(){return u.ldrs.update()}});if(r.from!=null){console.warn(\"[@plotdb/konfig] ctrl should use `default` for default value.\\nplease update your config to comply with it.\")}if(r[\"default\"]!=null){if(typeof r[\"default\"]===\"object\"){import$(r,r[\"default\"])}else if(typeof r[\"default\"]===\"number\"){r.from=r[\"default\"]}}return a=new o({root:n,action:{click:{switch:function(){return u.ldrs.edit()}}},init:{ldrs:function(e){var n;n=e.node;u.ldrs=new l(import$({root:n},Object.fromEntries([\"min\",\"max\",\"step\",\"from\",\"to\",\"exp\",\"limitMax\",\"range\",\"label\"].map(function(e){return[e,r[e]]}).filter(function(e){return e[1]!=null}))));return u.ldrs.on(\"change\",function(e){return i.fire(\"event\",\"change\",e)})}}})}};return e});function import$(e,n){var t={}.hasOwnProperty;for(var r in n)if(t.call(n,r))e[r]=n[r];return e}</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"palette","code":"<div><script type=\"@plotdb/block\">(function(e){return e()})(function(){var e;e={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[{name:\"ldcolor\",version:\"main\",path:\"ldcolor.min.js\",async:false},{name:\"ldslider\",version:\"main\",path:\"ldrs.min.js\",async:false},{name:\"ldslider\",version:\"main\",path:\"ldrs.min.css\"},{name:\"@loadingio/ldcolorpicker\",version:\"main\",path:\"ldcp.min.js\",async:false},{name:\"@loadingio/ldcolorpicker\",version:\"main\",path:\"ldcp.min.css\"},{name:\"@loadingio/vscroll\",version:\"main\",path:\"index.min.js\"},{name:\"ldpalettepicker\",version:\"main\",path:\"index.min.css\"},{name:\"ldpalettepicker\",version:\"main\",path:\"index.min.js\",async:false},{name:\"ldpalettepicker\",version:\"main\",path:\"all.palettes.js\"}]},init:function(e){var n,t,r,a,l,i,o,s,p,d,c;n=e.root,t=e.context,r=e.pubsub,a=e.data,l=e.i18n;i=t.ldview,o=t.ldcolor,s=t.ldpp,p=t.ldcover;d={pal:a.palette||s.defaultPalette};r.fire(\"init\",{get:function(){return d.pal},set:function(e){d.pal=e;return c.render()}});n=ld$.find(n,\"[plug=config]\",0);c=new i({root:n,action:{click:{ldp:function(){var e;if(!d.ldpp){e=Array.isArray(a.palettes)?a.palettes:typeof a.palettes===\"string\"?s.get(a.palettes):s.get(\"all\");d.ldpp=new s({root:c.get(\"ldcv\"),ldcv:true,useClusterizejs:true,i18n:l,palette:a.palette,palettes:e,useVscroll:true})}return d.ldpp.get().then(function(e){if(!e){return}d.pal=e;c.render(\"color\");return r.fire(\"event\",\"change\",d.pal)})}}},handler:{color:{list:function(){var e;return(e=d.pal||(d.pal={})).colors||(e.colors=[])},key:function(e){return o.web(e)},handler:function(e){var n,t;n=e.node,t=e.data;return n.style.backgroundColor=o.web(t)}}}});return c.render()}};return e});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"paragraph","code":"<div><script type=\"@plotdb/block\">(function(t){return t()})(function(){var t;t={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[]},init:function(t){var n,e,r,a,i,o,u,d;n=t.root,e=t.context,r=t.data,a=t.pubsub;i={data:r[\"default\"]||\"\"};o=e.ldview,u=e.ldcover;a.fire(\"init\",{get:function(){return i.data||\"\"},set:function(t){i.data=t||\"\";return d.render()}});return d=new o({root:n,init:{ldcv:function(t){var n;n=t.node;return i.ldcv=new u({root:n})}},handler:{panel:function(t){var n;n=t.node},input:function(t){var n;n=t.node;return n.value=i.data||\"\"},textarea:function(t){var n;n=t.node;return n.value=i.data||\"\"}},action:{click:{input:function(t){var n,e,r;n=t.node;e=d.get(\"input\").getBoundingClientRect();r=d.get(\"panel\").getBoundingClientRect();import$(d.get(\"panel\").style,{width:e.width+\"px\",left:e.left+\"px\",top:e.top+\"px\"});return i.ldcv.get().then(function(t){var n;if(t!==\"ok\"){return}n=d.get(\"textarea\").value;if(i.data!==n){a.fire(\"event\",\"change\",n)}i.data=n;return d.render()})}}}})}};return t});function import$(t,n){var e={}.hasOwnProperty;for(var r in n)if(e.call(n,r))t[r]=n[r];return t}</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"popup","code":"<div><script type=\"@plotdb/block\">(function(t){return t()})(function(){var t;t={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[],i18n:{\"zh-TW\":{config:\"設定\"}}},init:function(t){var n,e,r,u,o,i,a,f,c,p,d;n=t.root,e=t.context,r=t.data,u=t.pubsub,o=t.t;i={};a=function(t){var n;if(!t){return null}else if(n=t.data){return n}else{return t}};f=function(t){var n;i.text=(n=t&&t.text)?n:typeof t===\"string\"?t+\"\":o(\"config\");return d.render(\"button\")};c=e.ldview,p=e.ldcolor;u.fire(\"init\",{get:function(){return r.popup.data()},set:function(t){r.popup.data(t);return f(r.popup.data())}});return d=new c({root:n,action:{click:{button:function(){return r.popup.get().then(function(t){u.fire(\"event\",\"change\",a(t));return f(t)})}}},text:{button:function(){var t;if(t=i.text){return t}else{return o(\"config\")}}}})}};return t});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"text","code":"<div><script type=\"@plotdb/block\">(function(n){return n()})(function(){var n;n={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[]},init:function(n){var e,t,u,i,r,a;e=n.root,t=n.context,u=n.data,i=n.pubsub;r=t.ldview;i.fire(\"init\",{get:function(){return a.get(\"input\").value||\"\"},set:function(n){return a.get(\"input\").value=n||\"\"}});return a=new r({root:e,init:{input:function(n){var e;e=n.node;return e.value=u[\"default\"]||\"\"}},action:{input:{input:function(n){var e;e=n.node;return i.fire(\"event\",\"change\",e.value)}},change:{input:function(n){var e;e=n.node;return i.fire(\"event\",\"change\",e.value)}}}})}};return n});</script></div>"},{"name":"@plotdb/konfig.widget.default","version":"master","path":"upload","code":"<div><script type=\"@plotdb/block\">(function(t){return t()})(function(){var t;t={pkg:{extend:{name:\"@plotdb/konfig.widget.default\",version:\"master\",path:\"base\"},dependencies:[]},init:function(t){var e,n,i,u,r,o;e=t.root,n=t.context,i=t.data,u=t.pubsub;r=n.ldview;u.fire(\"init\",{get:function(){return o.get(\"input\").value||\"\"},set:function(t){return o.get(\"input\").value=t||\"\"}});return o=new r({root:e,init:{input:function(t){var e;e=t.node;if(i.multiple){return e.setAttribute(\"multiple\",true)}}},action:{change:{input:function(t){var e;e=t.node;return u.fire(\"event\",\"change\",e.files)}}}})}};return t});</script></div>"}]);
})();
