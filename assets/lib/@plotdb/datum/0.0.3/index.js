(function(){
  var datum;
  datum = {
    _sep: '-',
    format: function(it){
      if (!it || !Array.isArray(it) || (it[0] && !Array.isArray(it[0]))) {
        return 'db';
      }
      return 'sheet';
    },
    asSheet: function(obj){
      var k, sheet;
      if (this.format(obj) === 'sheet') {
        return obj;
      }
      if (Array.isArray(obj)) {
        obj = {
          head: (function(){
            var results$ = [];
            for (k in obj[0]) {
              results$.push(k);
            }
            return results$;
          }()),
          body: obj
        };
      }
      sheet = [obj.head].concat(obj.body.map(function(b){
        return obj.head.map(function(h){
          return b[h];
        });
      }));
      return sheet;
    },
    asDb: function(obj, name){
      var json, k;
      name == null && (name = 'unnamed');
      if (this.format(obj) === 'sheet') {
        json = {
          name: name,
          head: obj[0],
          body: obj.slice(1).map(function(b){
            return Object.fromEntries(obj[0].map(function(h, i){
              return [h, b[i]];
            }));
          })
        };
        return json;
      }
      if (Array.isArray(obj)) {
        return {
          name: name,
          head: (function(){
            var results$ = [];
            for (k in obj[0]) {
              results$.push(k);
            }
            return results$;
          }()),
          body: obj
        };
      }
      if (!obj.name) {
        obj.name = 'unnamed';
      }
      return obj;
    },
    concat: function(ds){
      var head, body, i$, to$, i;
      ds = ds.map(function(d){
        return data.asDb(d);
      });
      head = ds[0].head;
      body = [];
      for (i$ = 0, to$ = ds.length; i$ < to$; ++i$) {
        i = i$;
        body = body.concat(ds[i].body.map(fn$));
      }
      return {
        name: ds[0].name,
        head: head,
        body: body
      };
      function fn$(d){
        return Object.fromEntries(head.map(function(h){
          return [h, d[h]];
        }));
      }
    },
    join: function(arg$){
      var d1, d2, joinCols, jc, sep, ref$, h1, h2, b1, b2, n1, n2, s1, s2, i$, to$, i, head, ret, body;
      d1 = arg$.d1, d2 = arg$.d2, joinCols = arg$.joinCols;
      jc = joinCols;
      sep = this._sep;
      ref$ = [d1, d2].map(function(d){
        return datum.asDb(d);
      }), d1 = ref$[0], d2 = ref$[1];
      ref$ = [d1.head, d2.head], h1 = ref$[0], h2 = ref$[1];
      ref$ = [d1.body, d2.body], b1 = ref$[0], b2 = ref$[1];
      ref$ = [d1.name || '1', d2.name || '2'], n1 = ref$[0], n2 = ref$[1];
      s1 = n1.split(sep);
      s2 = n2.split(sep);
      for (i$ = 0, to$ = s1.length; i$ < to$; ++i$) {
        i = i$;
        if (s1[i] !== s2[i]) {
          break;
        }
      }
      ref$ = [s1.slice(i).join(sep), s2.slice(i).join(sep)], n1 = ref$[0], n2 = ref$[1];
      if (!jc) {
        jc = h1.filter(function(h){
          return ~h2.indexOf(h);
        });
      }
      head = jc.concat(h1.filter(function(h){
        return !in$(h, jc);
      }).map(function(h){
        if (in$(h, h2)) {
          return n1 + "" + sep + h;
        } else {
          return h;
        }
      }), h2.filter(function(h){
        return !in$(h, jc);
      }).map(function(h){
        if (in$(h, h1)) {
          return n2 + "" + sep + h;
        } else {
          return h;
        }
      }));
      ret = b1.map(function(r1){
        var matched, ret;
        matched = b2.filter(function(r2){
          return !jc.filter(function(it){
            return r2[it] !== r1[it];
          }).length;
        });
        if (!matched.length) {
          matched = [{}];
        }
        ret = matched.map(function(r2){
          return Object.fromEntries(jc.map(function(h){
            return [h, r1[h]];
          }).concat(h1.filter(function(h){
            return !in$(h, jc);
          }).map(function(h){
            return [in$(h, h2) ? n1 + "" + sep + h : h, r1[h]];
          }), h2.filter(function(h){
            return !in$(h, jc);
          }).map(function(h){
            return [in$(h, h1) ? n2 + "" + sep + h : h, r2[h]];
          })));
        });
        return ret;
      });
      body = ret.reduce(function(a, b){
        return a.concat(b);
      }, []);
      return {
        name: d1.name || 'unnamed',
        head: head,
        body: body
      };
    },
    split: function(arg$){
      var data, col, head, idx, hash, ret, k, v;
      data = arg$.data, col = arg$.col;
      data = this.asDb(data);
      head = [].concat(data.head);
      if (!~(idx = head.indexOf(col))) {
        return data;
      }
      head.splice(idx, 1);
      hash = {};
      data.body.filter(function(d){
        var key$;
        return (hash[key$ = d[col]] || (hash[key$] = [])).push(d);
      });
      ret = [];
      for (k in hash) {
        v = hash[k];
        ret.push({
          name: (data.name || 'unnamed') + "" + this._sep + k,
          head: head,
          body: v
        });
      }
      return ret;
    },
    pivot: function(opt){
      var data, col, joinCols, ds, base, i$, to$, i;
      opt == null && (opt = {});
      data = opt.data, col = opt.col, joinCols = opt.joinCols;
      ds = this.split({
        data: data,
        col: col
      });
      base = ds.splice(0, 1)[0];
      for (i$ = 0, to$ = ds.length; i$ < to$; ++i$) {
        i = i$;
        base = this.join({
          d1: base,
          d2: ds[i],
          joinCols: joinCols
        });
      }
      return base;
    },
    unpivot: function(opt){
      var data, cols, name, order, sep, hs, vals, tables, ret;
      opt == null && (opt = {});
      data = opt.data, cols = opt.cols, name = opt.name, order = opt.order;
      if (!name) {
        name = 'item';
      }
      if (!(order != null)) {
        order = 0;
      }
      sep = this._sep;
      data = this.asDb(data);
      hs = data.head.filter(function(it){
        return !in$(it, cols);
      }).map(function(it){
        return it.split(sep);
      });
      vals = Array.from(new Set(hs.map(function(it){
        return it[order];
      })));
      tables = vals.map(function(v){
        var _cols, _hs;
        _cols = cols.map(function(it){
          return [it, it];
        });
        _hs = hs.filter(function(it){
          return it[order] === v;
        }).map(function(it){
          return [
            it.join(sep), it.filter(function(d, i){
              return i !== order;
            }).join(sep)
          ];
        });
        return {
          name: data.name,
          head: cols.concat([name], _hs.map(function(it){
            return it[1];
          })),
          body: data.body.map(function(b){
            return Object.fromEntries([[name, v]].concat((_cols.concat(_hs)).map(function(h){
              return [h[1], b[h[0]]];
            })));
          })
        };
      });
      ret = this.concat(tables);
      return ret;
    },
    group: function(opt){
      var data, cols, aggregator, groupFunc, hs, keys, hash, newkeys, res$, k, ret;
      opt == null && (opt = {});
      data = opt.data, cols = opt.cols, aggregator = opt.aggregator, groupFunc = opt.groupFunc;
      if (!groupFunc) {
        groupFunc = function(it){
          return it;
        };
      }
      if (!aggregator) {
        aggregator = {};
      }
      cols = Array.isArray(cols)
        ? cols
        : [cols];
      data = this.asDb(data);
      hs = data.head.filter(function(it){
        return !in$(it, cols) && aggregator[it] !== null;
      });
      keys = Array.from(new Set(data.body.map(function(b){
        return JSON.stringify(Object.fromEntries(cols.map(function(it){
          return [it, b[it]];
        })));
      })));
      hash = {};
      keys.map(function(raw){
        var rkey, gkey, k, v;
        rkey = JSON.parse(raw);
        gkey = {};
        for (k in rkey) {
          v = rkey[k];
          gkey[k] = typeof groupFunc === 'function'
            ? groupFunc(v)
            : groupFunc[k](v);
        }
        gkey = JSON.stringify(gkey);
        if (!hash[gkey]) {
          hash[gkey] = new Set();
        }
        return hash[gkey].add(raw);
      });
      res$ = [];
      for (k in hash) {
        res$.push(k);
      }
      newkeys = res$;
      ret = newkeys.map(function(nk){
        var list, ret;
        list = Array.from(hash[nk]);
        nk = JSON.parse(nk);
        list = list.map(function(k){
          k = JSON.parse(k);
          return data.body.filter(function(b){
            return cols.filter(function(c){
              return b[c] !== k[c];
            }).length === 0;
          });
        }).reduce(function(a, b){
          return a.concat(b);
        }, []);
        ret = Object.fromEntries(hs.map(function(h){
          var ls, ret;
          ls = list.map(function(l){
            return l[h];
          });
          ret = aggregator[h]
            ? aggregator[h](ls)
            : ls.length;
          return [h, ret];
        }));
        cols.map(function(c){
          return ret[c] = nk[c];
        });
        return ret;
      });
      return {
        head: cols.concat(hs),
        body: ret,
        name: data.name
      };
    },
    agg: {
      average: function(it){
        return it.reduce(function(a, b){
          return a + (isNaN(+b)
            ? 0
            : +b);
        }, 0) / (it.length || 1);
      },
      sum: function(it){
        return it.reduce(function(a, b){
          return a + (isNaN(+b)
            ? 0
            : +b);
        }, 0);
      },
      count: function(it){
        return it.length;
      },
      first: function(it){
        return it[0] || '';
      }
    },
    shrink: function(arg$){
      var data, cols;
      data = arg$.data, cols = arg$.cols;
      data = this.asDb(data);
      data.head = data.head.filter(function(it){
        return in$(it, cols);
      });
      data.body = data.body.map(function(b){
        return Object.fromEntries(data.head.map(function(h){
          return [h, b[h]];
        }));
      });
      ['meta', 'unit', 'mag'].filter(function(it){
        return data[it];
      }).map(function(n){
        return data[n] = Object.fromEntries(data.head.map(function(h){
          return [h, data[n][h]];
        }));
      });
      return data;
    },
    rename: function(arg$){
      var data, map;
      data = arg$.data, map = arg$.map;
      data = this.asDb(data);
      data.body = data.body.map(function(b){
        return Object.fromEntries(data.head.map(function(h){
          var that;
          return [(that = map[h]) ? that : h, b[h]];
        }));
      });
      data.head = data.head.map(function(h){
        var that;
        if (that = map[h]) {
          return that;
        } else {
          return h;
        }
      });
      return data;
    }
  };
  if (typeof module != 'undefined' && module !== null) {
    module.exports = datum;
  } else if (typeof window != 'undefined' && window !== null) {
    window.datum = datum;
  }
  datum.type = {
    R: function(opt){
      var data, len, r, o;
      opt == null && (opt = {});
      data = opt.data.filter(function(it){
        return !(!it || (it + "").trim() === '');
      });
      len = data.filter(function(it){
        return !isNaN(parseFloat(it));
      }).length;
      r = len / data.length;
      o = datum.type.O(opt);
      if (o === r || o > 0.9) {
        r = o * 0.99;
      }
      return r;
    },
    O: function(opt){
      var data, hash, i$, to$, i, delta, o, k;
      opt == null && (opt = {});
      data = [].concat(opt.data);
      data.sort(function(a, b){
        return b - a;
      });
      hash = {};
      for (i$ = 1, to$ = data.length; i$ < to$; ++i$) {
        i = i$;
        if (isNaN(data[i]) || isNaN(data[i - 1])) {
          hash[data[i] > data[i - 1]
            ? data[i] + ":" + data[i - 1]
            : data[i - 1] + ":" + data[i]] = true;
        } else {
          delta = data[i] - data[i - 1];
        }
        hash[delta] = true;
      }
      return o = 1 / ((function(){
        var results$ = [];
        for (k in hash) {
          results$.push(k);
        }
        return results$;
      }()).filter(function(it){
        return it !== '0';
      }).length || 2);
    },
    N: function(opt){
      var n, c;
      opt == null && (opt = {});
      n = 1 - datum.type.R(opt);
      c = datum.type.C(opt);
      if (c > 0.85) {
        n = c * 0.99;
      }
      return n;
    },
    C: function(opt){
      var len, maxlen, ret, ref$, ref1$, ref2$;
      opt == null && (opt = {});
      len = Array.from(new Set(opt.data)).length;
      maxlen = opt.data.length;
      ret = (ref$ = (ref1$ = 1 - ((ref2$ = len - 2) > 0 ? ref2$ : 0) / maxlen - 1 / maxlen) > 0 ? ref1$ : 0) < 1 ? ref$ : 1;
      if (datum.type.R(opt)) {
        ret = ret * 0.9;
      }
      return ret;
    },
    get: function(dataset){
      var ref$, head, body, type, i$, len$, key, d, list;
      ref$ = datum.asDb(dataset), head = ref$.head, body = ref$.body;
      type = [];
      for (i$ = 0, len$ = head.length; i$ < len$; ++i$) {
        key = head[i$];
        d = body.map(fn$);
        list = ['R', 'O', 'N', 'C'].map(fn1$);
        list.sort(fn2$);
        type.push({
          key: key,
          types: Object.fromEntries(list),
          type: list[0][0]
        });
      }
      return type;
      function fn$(it){
        return it[key];
      }
      function fn1$(t){
        return [
          t, datum.type[t]({
            data: d
          })
        ];
      }
      function fn2$(a, b){
        return b[1] - a[1];
      }
    },
    bind: function(dataset, dimension){
      var datatypes, dims, k, v, i$, len$, dim, ts, j$, to$, i, t, k$, to1$, dt, ret;
      dataset == null && (dataset = []);
      dimension == null && (dimension = {});
      datatypes = datum.type.get(dataset);
      dims = (function(){
        var ref$, results$ = [];
        for (k in ref$ = dimension) {
          v = ref$[k];
          results$.push({
            k: k,
            v: v
          });
        }
        return results$;
      }()).filter(function(it){
        return !it.v.passive;
      });
      dims.sort(function(a, b){
        var ret, ref$, ma, mb;
        ret = (a.v.priority || 100) - (b.v.priority || 100);
        if (ret !== 0) {
          return ret;
        }
        ref$ = [a.v.type || 'R', b.v.type || 'R'].map(function(t){
          return Math.min.apply(Math, (function(){
            var i$, to$, results$ = [];
            for (i$ = 0, to$ = t.length; i$ < to$; ++i$) {
              results$.push(i$);
            }
            return results$;
          }()).map(function(i){
            return "CONR".indexOf(t[i]);
          }));
        }), ma = ref$[0], mb = ref$[1];
        return ma - mb;
      });
      for (i$ = 0, len$ = dims.length; i$ < len$; ++i$) {
        dim = dims[i$];
        dim.bind = null;
        ts = dim.v.type || 'RNOC';
        for (j$ = 0, to$ = ts.length; j$ < to$; ++j$) {
          i = j$;
          t = ts[i];
          datatypes.sort(fn$);
          for (k$ = 0, to1$ = datatypes.length; k$ < to1$; ++k$) {
            i = k$;
            dt = datatypes[i];
            if (dt.types[t] < 0.5 || dt.used || (t === 'C' && dt.types.R > 0.5)) {
              continue;
            }
            dim.bind = dim.v.multiple ? [dt] : dt;
            dt.used = true;
            break;
          }
        }
      }
      for (i$ = 0, len$ = dims.length; i$ < len$; ++i$) {
        dim = dims[i$];
        if (!dim.v.multiple) {
          continue;
        }
        ts = dim.v.type || 'RNOC';
        for (j$ = 0, to$ = ts.length; j$ < to$; ++j$) {
          i = j$;
          t = ts[i];
          datatypes.sort(fn1$);
          for (k$ = 0, to1$ = datatypes.length; k$ < to1$; ++k$) {
            i = k$;
            dt = datatypes[i];
            if (dt.types[t] < 0.5 || dt.used || (t === 'C' && dt.types.R > 0.5)) {
              continue;
            }
            dim.bind.push(dt);
            dt.used = true;
          }
        }
      }
      ret = {};
      for (i$ = 0, len$ = dims.length; i$ < len$; ++i$) {
        dim = dims[i$];
        if (dim.bind) {
          ret[dim.k] = dim.bind;
          (Array.isArray(dim.bind)
            ? dim.bind
            : [dim.bind]).map(fn2$);
        }
      }
      return ret;
      function fn$(a, b){
        var ret;
        ret = (b.types[t] || 0) - (a.types[t] || 0);
        if (b.types[t] === a.types[t] && t === 'R') {
          return (a.types.O || 0) - (b.types.O || 0);
        }
        return ret;
      }
      function fn1$(a, b){
        var ret;
        ret = (b[t] || 0) - (a[t] || 0);
        if (b[t] === a[t] && t === 'R') {
          return (a.O || 0) - (b.O || 0);
        }
        return ret;
      }
      function fn2$(it){
        var ref$;
        return ref$ = it.used, delete it.used, ref$;
      }
    }
  };
  datum.sample = {
    context: {},
    C: ['books', 'business', 'education', 'entertainment', 'finance', 'food', 'games', 'health', 'lifestyle', 'medical', 'music', 'navigation', 'news', 'photography', 'productivity', 'social', 'network', 'sports', 'travel', 'utilities', 'weather'],
    N: ["The Perfect Storm", "Philadelphia Story", "Planet of the Apes", "Patton", "Pocahontas", "Pinoccio", "Quills", "Raiders of the Lost Ark", "Romeo and Juliet", "Snow White", "Shine", "Some Like It Hot", "Stardust", "Startrek", "The Seven Year Itch", "The Sound of Music", "Sabrina", "Sixth Sense", "The Silence of the Lambs", "Stargate", "Sunset Boulevard", "Superman"],
    generate: function(arg$){
      var count, binding, ref$, gen, idx, fields, k, v, u, keys, offset, i$, i, ret, hint, value, range, val, mod;
      count = arg$.count, binding = arg$.binding;
      ref$ = [
        {
          raw: [],
          binding: {}
        }, 0, count || 10
      ], gen = ref$[0], idx = ref$[1], count = ref$[2];
      if (!fields) {
        fields = {};
      }
      for (k in binding) {
        v = binding[k];
        u = Array.isArray(v)
          ? v
          : [v];
        keys = u.map(fn$);
        if (Array.isArray(v)) {
          gen.binding[k] = keys.map(fn1$);
        } else {
          gen.binding[k] = {
            key: (ref$ = fields[keys[0]]).key,
            name: ref$.name
          };
        }
      }
      offset = Math.round(100 * Math.random());
      for (i$ = 0; i$ < count; ++i$) {
        i = i$;
        ret = {};
        for (k in fields) {
          v = fields[k];
          hint = v.hint;
          value = (fn2$());
          ret[v.key] = value;
        }
        gen.raw.push(ret);
      }
      return gen;
      function fn$(d, i){
        var key, name;
        key = d.key || "field-" + idx;
        name = d.name || key;
        fields[idx] = {
          key: key,
          name: name,
          hint: d
        };
        idx = idx + 1;
        return idx - 1;
      }
      function fn1$(it){
        var ref$;
        return {
          key: (ref$ = fields[it]).key,
          name: ref$.name
        };
      }
      function fn2$(){
        var ref$, ref1$;
        switch (hint.type) {
        case 'R':
          range = hint.range || [0, 100];
          val = Math.random() * (range[1] - range[0]) + range[0];
          if (range[1] - range[0] < 1) {
            return val;
          } else {
            return Math.round(val);
          }
        case 'N':
          return datum.sample.N[i % datum.sample.N.length];
        case 'C':
          mod = (ref$ = hint.count != null
            ? hint.count
            : (ref$ = Math.round(count / 10)) > 4 ? ref$ : 4) < (ref1$ = datum.sample.C.length) ? ref$ : ref1$;
          return datum.sample.C[(hint.random ? Math.floor(Math.random() * count) : i) % mod];
        case 'O':
          return Math.floor(i / (hint.repeat != null ? hint.repeat : 1)) + (hint.offset != null ? hint.offset : offset);
        default:
          return "...";
        }
      }
    }
  };
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
}).call(this);
