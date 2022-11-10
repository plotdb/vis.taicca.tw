(function(){
  var tick;
  tick = function(o){
    var ext, len, delta, ticks, steps, pow, i$, i, g, s, j$, ref$, len$, j, step, ref1$, v, extent, base, lg, fmt, unit, labels, to$, t1, t2;
    o == null && (o = {});
    ext = o.extent || [0, 1];
    len = o.len || 3;
    ext = ext.map(function(it){
      if (!isNaN(it)) {
        return it;
      } else {
        return 0;
      }
    });
    if (ext[0] > ext[1]) {
      ext = [ext[1], ext[0]];
    }
    if (o.exp != null) {
      delta = ext[1] - ext[0];
      ticks = [];
      steps = [];
      pow = Math.pow(10, o.exp);
      if (o.pretty != null && !o.pretty) {
        ticks = (function(){
          var i$, to$, results$ = [];
          for (i$ = 0, to$ = len; i$ <= to$; ++i$) {
            results$.push(i$);
          }
          return results$;
        }()).map(function(i){
          return delta * Math.pow(i / len, pow) + ext[0];
        });
      } else {
        for (i$ = 1; i$ <= len; ++i$) {
          i = i$;
          g = delta * (Math.pow(i / len, pow) - Math.pow((i - 1) / len, pow));
          s = Math.floor(Math.log(g) / Math.LN10);
          for (j$ = 0, len$ = (ref$ = [10, 20, 25, 50, 100]).length; j$ < len$; ++j$) {
            j = ref$[j$];
            if ((step = j * Math.pow(10, s - 1)) > g) {
              break;
            }
          }
          steps.push(step);
        }
        delta = steps.reduce(function(a, b){
          return a + b;
        }, 0);
        ext = [ext[0], (ref$ = ext[0] + delta) > (ref1$ = ext[1]) ? ref$ : ref1$];
        ext = [[ext[0], 'floor'], [ext[1], 'ceil']].map(function(arg$){
          var t, n, ret;
          t = arg$[0], n = arg$[1];
          ret = [10, 20, 25, 50, 100].map(function(d){
            return [d, Math.abs(t - Math[n](t / d) * d)];
          });
          ret.sort(function(a, b){
            return a[1] - b[1];
          });
          return ret[0][0] * Math[n](t / ret[0][0]);
        });
        v = ext[0];
        for (i$ = 0; i$ < len; ++i$) {
          i = i$;
          ticks.push(v);
          v = v + steps[i];
        }
        ticks.push(v);
      }
      ticks.sort(function(a, b){
        return a - b;
      });
      extent = [ticks[0], ticks[len - 1]];
    } else if (o.pretty != null && !o.pretty) {
      ticks = (function(){
        var i$, to$, results$ = [];
        for (i$ = 0, to$ = len; i$ < to$; ++i$) {
          results$.push(i$);
        }
        return results$;
      }()).map(function(i){
        var ref$;
        return ext[0] + (ext[1] - ext[0]) * i / ((ref$ = len - 1) > 1 ? ref$ : 1);
      });
      extent = [ticks[0], ticks[len - 1]];
    } else {
      g = (ext[1] - ext[0]) / (len + 1);
      s = Math.floor(Math.log((ext[1] - ext[0] || 1) / (len + 1)) / Math.LN10);
      for (i$ = 0, len$ = (ref$ = [10, 20, 25, 50, 100]).length; i$ < len$; ++i$) {
        i = ref$[i$];
        if ((step = i * Math.pow(10, s - 1)) > g) {
          break;
        }
      }
      base = step * Math.floor(ext[0] / step);
      ticks = (function(){
        var i$, to$, results$ = [];
        for (i$ = 0, to$ = len; i$ <= to$; ++i$) {
          results$.push(i$);
        }
        return results$;
      }()).map(function(i){
        return base + step * i;
      });
      extent = [ticks[0], ticks[len]];
    }
    if (lg = o.legend) {
      fmt = lg.format || function(it){
        return it;
      };
      unit = lg.unit || '';
      if (lg.range) {
        labels = [];
        for (i$ = 0, to$ = ticks.length - 1; i$ < to$; ++i$) {
          i = i$;
          ref$ = [ticks[i], ticks[i + 1]], t1 = ref$[0], t2 = ref$[1];
          labels.push({
            ext: [t1, t2],
            key: (t1 + t2) / 2,
            text: lg.text
              ? lg.text(t1, t2)
              : fmt(t1) + " - " + fmt(t2) + unit
          });
        }
      } else {
        labels = ticks.map(function(it){
          return {
            key: it,
            text: lg.text
              ? lg.text(it)
              : fmt(it) + "" + unit
          };
        });
      }
      labels.sort(function(a, b){
        if (a.key < b.key) {
          return 1;
        } else if (a.key > b.key) {
          return -1;
        } else {
          return 0;
        }
      });
    }
    return {
      ticks: ticks,
      extent: extent,
      labels: labels
    };
  };
  if (typeof chart != 'undefined' && chart !== null) {
    (chart.utils || (chart.utils = {})).tick = tick;
  }
}).call(this);
