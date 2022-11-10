(function(){
  var tint;
  tint = function(opt){
    opt == null && (opt = {});
    this.isUnique = opt.unique != null ? opt.unique : true;
    this.map = {};
    this.nmap = [];
    this.wm = new WeakMap();
    this.count = 0;
    this._ext = opt.extent || [0, 1];
    this.set(opt.palette) || opt.colors;
    this.mode(opt.mode) || 0;
    return this;
  };
  tint['default'] = ['#e15c64', '#f7b26a', '#f3ed9d', '#a4bd81', '#a0d7d2', '#8db1da', '#daaedb'];
  tint.prototype = import$(Object.create(Object.prototype), {
    set: function(pal, reset){
      var ref$, this$ = this;
      pal == null && (pal = []);
      reset == null && (reset = false);
      this.colors = Array.isArray(pal) && pal.length
        ? pal
        : pal.colors && Array.isArray(pal.colors)
          ? pal.colors
          : tint['default'];
      this.nmap = pal.maps || [];
      this.colors = this.colors.map(function(it){
        return it.value || it;
      });
      if (this.colors.length === 1) {
        this.colors.push(ldcolor.complement(this.colors[0]));
      }
      this.colors = this.colors.map(function(it){
        return ldcolor.hsl(it);
      });
      this.len = (ref$ = this.colors.length) > 2 ? ref$ : 2;
      if (reset) {
        return this.reset();
      } else {
        return this.nmap.map(function(d, i){
          return (Array.isArray(d)
            ? d
            : [d]).map(function(it){
            return this$.get(it, 0, i);
          });
        });
      }
    },
    unique: function(it){
      return it != null
        ? this.isUnique = !!it
        : this.isUnique;
    },
    reset: function(){
      var this$ = this;
      this.map = {};
      this.wm = new WeakMap();
      this.count = 0;
      return (this.nmap || []).map(function(d, i){
        return (Array.isArray(d)
          ? d
          : [d]).map(function(it){
          return this$.get(it, 0, i);
        });
      });
    },
    mode: function(m){
      if (arguments.length === 0) {
        return this._m;
      }
      return this._m = m;
    },
    extent: function(v){
      if (arguments.length === 0) {
        return this._ext;
      }
      this._ext = v.map(function(it){
        if (it != null) {
          return it;
        } else {
          return 0;
        }
      });
      return this._ext.sort(function(a, b){
        return a - b;
      });
    },
    get: function(d, v, i){
      v == null && (v = 0);
      switch (this._m) {
      case 1:
        return this._vd(d, v);
      case 2:
        return this._vc(d, v);
      case 3:
        return this._vs(d, v);
      default:
        return this._d(d, v, i);
      }
    },
    _v: function(c, v){
      if (v > 0) {
        c = ldcolor.lighter(c, v);
      } else if (v < 0) {
        c = ldcolor.darker(c, -v);
      }
      return ldcolor.web(c);
    },
    _d: function(data, variant, idx){
      var val, seg, pos, ref$, fz, fm, c1, c2, h, s, l, ret;
      variant == null && (variant = 0);
      if (idx != null) {
        if (this.count < idx) {
          this.count = idx + 1;
        }
        val = idx % this.len;
        if (typeof data === 'object') {
          this.wm.set(data, val);
        } else {
          this.map[data] = val;
        }
      } else {
        if (typeof data === 'object') {
          if ((val = this.wm.get(data)) == null) {
            this.wm.set(data, val = this.count++);
          }
        } else if ((val = this.map[data]) == null) {
          this.map[data] = val = this.count++;
        }
        if (!this.isUnique) {
          val = val % this.len;
        }
      }
      if (val >= this.len) {
        seg = val % (this.len - 1);
        pos = Math.floor(val / (this.len - 1));
        ref$ = [0, 1], fz = ref$[0], fm = ref$[1];
        while (pos > 0) {
          ref$ = [fz * 2, fm * 2], fz = ref$[0], fm = ref$[1];
          if (pos % 2) {
            fz += 1;
          }
          pos = pos >> 1;
        }
        pos = fz / fm;
        ref$ = [this.colors[seg], this.colors[seg + 1]], c1 = ref$[0], c2 = ref$[1];
        ref$ = ['h', 's', 'l'].map(function(k){
          return pos * (c2[k] - c1[k]) + c1[k];
        }), h = ref$[0], s = ref$[1], l = ref$[2];
        ret = {
          h: h,
          s: s,
          l: l
        };
      } else {
        ret = this.colors[val];
      }
      return this._v(ret, variant);
    },
    _vs: function(data, variant){
      var ext, idx, i$, to$, i, ref$, ref1$;
      ext = this._ext || [0, 1];
      idx = -1;
      for (i$ = 0, to$ = ext.length - 1; i$ < to$; ++i$) {
        i = i$;
        if (data >= ext[i + 1]) {
          continue;
        }
        idx = i;
        break;
      }
      if (idx === -1) {
        idx = ext.length;
      }
      return this._v(this.colors[(ref$ = idx > 0 ? idx : 0) < (ref1$ = this.colors.length - 1) ? ref$ : ref1$], variant);
    },
    _vd: function(data, variant){
      var ext, v, ref$, ref1$;
      ext = this._ext || [0, 1];
      v = (ref$ = (ref1$ = (data - ext[0]) / (ext[1] - ext[0] || 1)) > 0 ? ref1$ : 0) < 1 ? ref$ : 1;
      return this._v(this.colors[Math.floor((ref$ = v * (this.len || 1)) < (ref1$ = this.len - 1) ? ref$ : ref1$)], variant);
    },
    _vc: function(data, variant){
      var ext, v, ref$, ref1$, i, i1, i2, c1, c2, pos, h, s, l;
      ext = this._ext || [0, 1];
      v = (ref$ = (ref1$ = (data - ext[0]) / (ext[1] - ext[0] || 1)) > 0 ? ref1$ : 0) < 1 ? ref$ : 1;
      i = v * ((ref$ = this.len - 1) > 0 ? ref$ : 0);
      ref$ = i === this.len - 1
        ? [(ref$ = this.len - 2) > 0 ? ref$ : 0, (ref$ = this.len - 1) > 0 ? ref$ : 0]
        : [Math.floor(i), Math.floor(i) + 1], i1 = ref$[0], i2 = ref$[1];
      ref$ = [this.colors[i1], this.colors[i2]], c1 = ref$[0], c2 = ref$[1];
      pos = i - i1;
      ref$ = ['h', 's', 'l'].map(function(k){
        return pos * (c2[k] - c1[k]) + c1[k];
      }), h = ref$[0], s = ref$[1], l = ref$[2];
      return this._v({
        h: h,
        s: s,
        l: l
      }, variant);
    },
    text: function(v, opt){
      var hcl;
      opt == null && (opt = {});
      hcl = ldcolor.hcl(this.get(v));
      return ldcolor.web(hcl.l > 50
        ? opt.textDark || '#000'
        : opt.textLight || '#fff');
    }
  });
  tint.mode = {
    ordinal: 0,
    discrete: 1,
    continuous: 2,
    ranges: 3
  };
  if (typeof chart != 'undefined' && chart !== null) {
    (chart.utils || (chart.utils = {})).tint = tint;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
