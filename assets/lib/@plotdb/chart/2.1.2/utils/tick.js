(function(){
  var tick;
  tick = function(o){
    var ext, len, ticks, extent, g, s, i$, ref$, len$, i, step, base, lg, fmt, unit, labels, to$, t1, t2;
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
    if (o.pretty != null && !o.pretty) {
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
