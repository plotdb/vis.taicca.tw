ld$.fetch("/assets/data/annual-report/industry.json", {
  method: 'GET'
}, {
  type: 'json'
}).then(function(data){
  var box, margin, label, pts, k1, ref$, v1, k2, v2, i$, to$, i, gby, gbypts, cats, k, xaxisIdx, xaxisYear, xaxis, min, max, yaxis, yaxisSum, line, x$;
  box = svg.getBoundingClientRect();
  margin = 10;
  label = data.label.map(function(it){
    return +it;
  });
  pts = [];
  for (k1 in ref$ = data.attr) {
    v1 = ref$[k1];
    for (k2 in v1) {
      v2 = v1[k2];
      for (i$ = 0, to$ = label.length; i$ < to$; ++i$) {
        i = i$;
        pts.push({
          type: k1,
          cat: k2,
          year: label[i],
          value: +v2[i]
        });
      }
    }
  }
  gby = label.map(function(y){
    return pts.filter(function(it){
      return it.year === y && it.type === "外銷收入占比";
    });
  });
  gbypts = [];
  gby.map(function(list){
    var sum, i$, to$, i;
    sum = 0;
    for (i$ = 0, to$ = list.length; i$ < to$; ++i$) {
      i = i$;
      if (!isNaN(list[i].value)) {
        sum += list[i].value;
      }
      list[i].sum = sum;
    }
    for (i$ = 0, to$ = list.length; i$ < to$; ++i$) {
      i = i$;
      list[i].percent = list[i].value / sum;
      list[i].sum = list[i].sum / sum;
    }
    return gbypts = gbypts.concat(list);
  });
  cats = (function(){
    var results$ = [];
    for (k in data.attr["外銷收入占比"]) {
      results$.push(k);
    }
    return results$;
  }()).map(function(k){
    var ret, sum, i$, to$, i;
    ret = label.map(function(v, i){
      return [v, +data.attr["外銷收入占比"][k][i], 0, 0];
    });
    sum = 0;
    for (i$ = 0, to$ = ret.length; i$ < to$; ++i$) {
      i = i$;
      sum += ret[i][1];
      ret[i][3] = sum;
    }
    for (i$ = 0, to$ = ret.length; i$ < to$; ++i$) {
      i = i$;
      ret[i][2] = ret[i][1] / sum;
      ret[i][3] = ret[i][3] / sum;
    }
    return ret;
  });
  xaxisIdx = d3.scaleLinear().domain([0, cats.length - 1]).range([margin, box.width - margin]);
  xaxisYear = d3.scaleBand().domain(label).range([margin, box.width - margin]);
  xaxis = d3.scaleLinear().domain([Math.min.apply(Math, label), Math.max.apply(Math, label)]).range([margin, box.width - margin]);
  min = Math.min.apply(Math, cats.map(function(it){
    return Math.min.apply(Math, it.map(function(it){
      return it[1];
    }).filter(function(it){
      return !isNaN(it);
    }));
  }));
  max = Math.max.apply(Math, cats.map(function(it){
    return Math.max.apply(Math, it.map(function(it){
      return it[1];
    }).filter(function(it){
      return !isNaN(it);
    }));
  }));
  yaxis = d3.scaleLinear().domain([min, max]).range([box.height - margin, margin]);
  yaxisSum = d3.scaleLinear().domain([0, 1]).range([margin, box.height - margin]);
  line = d3.line().curve(d3.curveCardinal).defined(function(d){
    return !isNaN(d[1]);
  }).x(function(d){
    return xaxisYear(d[0]) + xaxisYear.bandwidth() / 2;
  }).y(function(d){
    return yaxis(d[1]);
  });
  x$ = d3.select('svg').selectAll('path').data(cats);
  x$.enter().append('path').attr('d', line).attr('stroke', '#000').attr('stroke-width', '1').attr('fill', 'none');
  x$.exit().remove();
  d3.select('svg').selectAll('g').data(cats).enter().append('g');
  d3.select('svg').selectAll('g').each(function(d, i){
    d3.select(this).selectAll('circle').data(d.filter(function(it){
      return !isNaN(it[1]);
    })).enter().append('circle');
    return d3.select(this).selectAll('circle').attr('cx', function(d){
      return xaxisYear(d[0]) + xaxisYear.bandwidth() / 2;
    }).attr('cy', function(d){
      return yaxis(d[1]);
    }).attr('r', 3).attr('fill', '#fff').attr('stroke', 'black').attr('stroke-width', 1);
  });
  d3.select('svg').selectAll('rect').data(gbypts.filter(function(it){
    return !isNaN(it.value);
  })).enter().append('rect');
  return d3.select('svg').selectAll('rect').attr('x', function(d){
    return xaxisYear(d.year);
  }).attr('y', function(d){
    return yaxisSum(d.sum - d.percent);
  }).attr('width', function(d){
    return xaxisYear.bandwidth();
  }).attr('height', function(d){
    return yaxisSum(d.sum) - yaxisSum(d.sum - d.percent);
  }).attr('fill', function(d, i){
    return d3.interpolateSpectral((d.year - 2008) / 10);
  }).attr('fill-opacity', 0.5).attr('stroke', '#000').attr('stroke-width', 1);
});