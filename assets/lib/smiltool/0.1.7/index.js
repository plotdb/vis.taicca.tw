(function(){
var smil;
smil = {};
if (typeof module != 'undefined' && module !== null) {
  module.exports = smil;
} else if (typeof window != 'undefined' && window !== null) {
  window.smil = smil;
}smil.statify = function(m){
  var _;
  m = m.cloneNode(true);
  _ = function(n){
    var nodeName, ani, i$, ref$, len$, c, results$ = [];
    if (!(n && n.nodeType === Element.ELEMENT_NODE)) {
      return;
    }
    nodeName = n.nodeName.toLowerCase();
    if (n.nodeName.startsWith('animate') && n.parentNode) {
      n.parentNode.removeChild(n);
    }
    if ((ani = n.style["animation-name"]) && ani !== 'none') {
      n.style["animation"] = 'none';
    }
    for (i$ = 0, len$ = (ref$ = n.childNodes).length; i$ < len$; ++i$) {
      c = ref$[i$];
      results$.push(_(c));
    }
    return results$;
  };
  _(m);
  return m;
};var wm, play, pause;
wm = {
  currentTime: new WeakMap(),
  delay: new WeakMap()
};
play = function(node, o){
  var css, t, _;
  o == null && (o = {});
  css = o.css;
  if ((t = wm.currentTime.get(node)) != null) {
    node.setCurrentTime(t);
  }
  _ = function(n){
    var i$, to$, i, results$ = [];
    if (n.nodeType !== Element.ELEMENT_NODE) {
      return;
    }
    if (n.style["animation-name"] && n.style["animation-name"] !== 'none') {
      n.style["animation-play-state"] = "running";
      n.style["animation-delay"] = (wm.delay.get(n) || 0) + "s";
    }
    for (i$ = 0, to$ = n.childNodes.length; i$ < to$; ++i$) {
      i = i$;
      results$.push(_(n.childNodes[i]));
    }
    return results$;
  };
  if (!(css != null) || css) {
    _(node);
  }
  return node.unpauseAnimations();
};
pause = function(node, o){
  var time, css, ref$, p, n, _;
  o == null && (o = {});
  time = o.time, css = o.css;
  ref$ = [node.parentNode, node.nextSibling], p = ref$[0], n = ref$[1];
  if (time != null) {
    wm.currentTime.set(node, node.getCurrentTime());
    node.setCurrentTime(time);
  }
  node.pauseAnimations();
  _ = function(n){
    var s, _delay, i$, to$, i, results$ = [];
    if (n.nodeType !== Element.ELEMENT_NODE) {
      return;
    }
    s = window.getComputedStyle(n);
    if (n.style["animation-name"] && n.style["animation-name"] !== 'none') {
      n.style["animation-play-state"] = 'paused';
      if (time != null) {
        if (!(_delay = wm.delay.get(n))) {
          wm.delay.set(n, _delay = parseFloat(s["animation-delay"] || 0));
        }
        n.style["animation-delay"] = (_delay - time) + "s";
      }
    }
    for (i$ = 0, to$ = n.childNodes.length; i$ < to$; ++i$) {
      i = i$;
      results$.push(_(n.childNodes[i]));
    }
    return results$;
  };
  if (!(css != null) || css) {
    return _(node);
  }
};
smil.play = play;
smil.pause = pause;var imageCache, fetchImage, _fetchImages, fetchImages;
imageCache = {};
fetchImage = function(url, width, height){
  return new Promise(function(res, rej){
    var img, ref$;
    if (/^data:/.exec(url)) {
      return res(url);
    }
    if (imageCache[url]) {
      return res(imageCache[url]);
    }
    img = new Image();
    ref$ = img.style;
    ref$.width = width ? width + "px" : void 8;
    ref$.height = height ? height + "px" : void 8;
    img.onload = function(){
      var ref$, width, height, canvas, ctx, ret;
      ref$ = [img.width, img.height], width = ref$[0], height = ref$[1];
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255,255,255,0)';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      ret = canvas.toDataURL();
      imageCache[url] = ret;
      return res(ret);
    };
    return img.src = url;
  });
};
_fetchImages = function(node, hash){
  var promises, href, width, height, i$, to$, i, child;
  hash == null && (hash = {});
  promises = [];
  if (node.nodeType !== Element.ELEMENT_NODE) {
    return [];
  }
  href = node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || node.getAttribute('href');
  if (href && !/^#/.exec(href)) {
    width = node.getAttribute('width');
    height = node.getAttribute('height');
    promises.push(fetchImage(href, width, height, hash).then(function(it){
      return hash[href] = it;
    }));
  }
  for (i$ = 0, to$ = node.childNodes.length; i$ < to$; ++i$) {
    i = i$;
    child = node.childNodes[i];
    promises = promises.concat(_fetchImages(child, hash));
  }
  return promises;
};
fetchImages = function(node, hash){
  hash == null && (hash = {});
  return Promise.all(_fetchImages(node, hash)).then(function(){
    return hash;
  });
};
smil.fetchImages = fetchImages;var pathFromList, transformFromList, numbersFromList, animToString, defaults, _snapshot, snapshot;
pathFromList = function(list){
  var ret, i$, to$, i, item;
  ret = [];
  for (i$ = 0, to$ = list.numberOfItems; i$ < to$; ++i$) {
    i = i$;
    item = list.getItem(i);
    ret.push(item.pathSegTypeAsLetter + ['r1', 'r2', 'angle', 'largeArcFlag', 'sweepFlag', 'x1', 'y1', 'x2', 'y2', 'x', 'y'].filter(fn$).map(fn1$).join(" "));
  }
  return ret.join("");
  function fn$(it){
    return item[it] != null;
  }
  function fn1$(it){
    if (it === 'largeArcFlag' || it === 'sweepFlag') {
      if (item[it]) {
        return 1;
      } else {
        return 0;
      }
    } else {
      return item[it];
    }
  }
};
transformFromList = function(list){
  var ret, i$, to$, i, item, mat;
  ret = [];
  for (i$ = 0, to$ = list.numberOfItems; i$ < to$; ++i$) {
    i = i$;
    item = list.getItem(i);
    mat = item.matrix;
    ret.push("matrix(" + mat.a + "," + mat.b + "," + mat.c + "," + mat.d + "," + mat.e + "," + mat.f + ")");
  }
  return ret.join(" ");
};
numbersFromList = function(list){
  var ret, i$, to$, i;
  ret = [];
  for (i$ = 0, to$ = list.numberOfItems; i$ < to$; ++i$) {
    i = i$;
    ret.push(list.getItem(i).value);
  }
  return ret.join(" ");
};
animToString = function(input){
  var ref$;
  if ((ref$ = typeof input) === 'string' || ref$ === 'number') {
    return input;
  }
  if (input.animVal) {
    if ((ref$ = typeof input.animVal) === 'string' || ref$ === 'number') {
      return input.animVal;
    }
    if ((ref$ = typeof input.animVal.value) === 'string' || ref$ === 'number') {
      return input.animVal.value;
    }
    if (!input.animVal.numberOfItems) {
      return "";
    }
    if (input.animVal instanceof SVGNumberList) {
      return numbersFromList(input.animVal);
    }
    return transformFromList(input.animVal);
  } else if (input.numberOfItems && ((input.getItem && input.getItem(0)) || input[0]).pathSegType != null) {
    return pathFromList(input);
  }
  return "";
};
defaults = {
  init: function(){
    var circle;
    circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    document.body.appendChild(circle);
    defaults.style = window.getComputedStyle(circle);
    circle.parentNode.removeChild(circle);
    return defaults.init = function(){};
  }
};
_snapshot = function(arg$){
  var width, height, node, time, hrefs, animatedStyles, styleMap, ref$, attrs, styles, subtags, animatedAttrs, isSvg, style, list, res$, i$, to$, i, bks, bkv, len$, k, v, bk, child, dur, begin, path, length, ptr, name, value, ret, ref1$, m, strAttr, strStyle, o;
  width = arg$.width, height = arg$.height, node = arg$.node, time = arg$.time, hrefs = arg$.hrefs, animatedStyles = arg$.animatedStyles, styleMap = arg$.styleMap;
  if (node.nodeName[0] === '#') {
    return node.nodeName === '#text' ? node.textContent : '';
  }
  ref$ = [{}, {}, [], {}, {}], attrs = ref$[0], styles = ref$[1], subtags = ref$[2], animatedAttrs = ref$[3];
  isSvg = node.nodeName.toLowerCase() === 'svg';
  style = getComputedStyle(node);
  res$ = [];
  for (i$ = 0, to$ = node.style.length; i$ < to$; ++i$) {
    i = i$;
    res$.push(node.style[i]);
  }
  list = res$;
  list = list.concat((animatedStyles || ['transform', 'opacity']).filter(function(it){
    return in$(it, list);
  }));
  bks = ['background-attachment', 'background-color', 'background-image', 'background-position', 'background-repeat'];
  bkv = {};
  for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
    k = list[i$];
    v = style[k] || node.style[k];
    if ((isSvg && (k === 'left' || k === 'right' || k === 'top' || k === 'bottom' || k === 'position')) || !(v != null) || v === '') {
      continue;
    }
    if (styles[k] || k.indexOf('webkit') === 0 || k === 'cssText' || defaults.style[k] === v) {
      continue;
    }
    if (in$(k, bks)) {
      bkv[k] = v;
    } else {
      styles[k] = v;
    }
  }
  bk = bks.map(function(k){
    return bkv[k];
  }).join(' ').trim();
  if (bk) {
    styles["background"] = bk;
  }
  for (i$ = 0, to$ = node.childNodes.length; i$ < to$; ++i$) {
    i = i$;
    child = node.childNodes[i];
    if (child.nodeName === 'animateMotion') {
      dur = child.getSimpleDuration();
      begin = +child.getAttribute("begin").replace("s", "");
      path = document.querySelector(child.querySelector("mpath").getAttributeNS("http://www.w3.org/1999/xlink", "href"));
      length = path.getTotalLength();
      ptr = path.getPointAtLength(length * ((child.getCurrentTime() - begin) % dur) / dur);
      animatedAttrs["transform"] = "translate(" + ptr.x + " " + ptr.y + ")";
    } else if (child.nodeName.startsWith('animate')) {
      name = child.getAttribute('attributeName');
      value = node[name] || style.getPropertyValue(name);
      if (name === 'd') {
        value = node.animatedPathSegList;
        if (!value) {
          ret = /path\("([^"]+)"\)/.exec(style.d);
          if (ret) {
            value = ret[1];
          }
        }
        if (!value) {
          value = node.getAttribute('d');
        }
      }
      animatedAttrs[name] = animToString(value);
    } else {
      subtags.push(_snapshot({
        node: child,
        time: time,
        hrefs: hrefs,
        animatedStyles: animatedStyles,
        styleMap: styleMap
      }));
    }
  }
  for (i$ = 0, len$ = (ref$ = node.attributes).length; i$ < len$; ++i$) {
    v = ref$[i$];
    if (v.name === 'style') {
      continue;
    }
    attrs[v.name] = ((ref1$ = v.name) === 'xlink:href' || ref1$ === 'href') && hrefs && hrefs[v.value]
      ? hrefs[v.value]
      : v.name === 'transform'
        ? (list = node.transform.baseVal, m = list[0].matrix, (fn$()), "matrix(" + m.a + "," + m.b + "," + m.c + "," + m.d + "," + m.e + "," + m.f + ")")
        : v.value;
  }
  import$(attrs, animatedAttrs);
  if (isSvg) {
    attrs["xmlns"] = "http://www.w3.org/2000/svg";
    attrs["xmlns:xlink"] = "http://www.w3.org/1999/xlink";
    if (width != null) {
      attrs.width = width;
      styles.width = width + "px";
    }
    if (height != null) {
      attrs.height = height;
      styles.height = height + "px";
    }
  }
  ref$ = ["", ""], strAttr = ref$[0], strStyle = ref$[1];
  if (styleMap) {
    if (!(o = styleMap.get(node))) {
      styleMap.set(node, o = {});
    }
    o[time] = {
      attr: attrs,
      style: styles
    };
  }
  for (k in attrs) {
    v = attrs[k];
    if (typeof v === 'string') {
      v = v.replace(/"/g, "'");
    }
    strAttr += " " + k + "=\"" + v + "\"";
  }
  for (k in styles) {
    v = styles[k];
    if (typeof v === 'string') {
      v = v.replace(/"/g, "'");
    }
    if (~k.indexOf('-')) {
      k = k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
    strStyle += k + ":" + v + ";";
  }
  if (strStyle) {
    strStyle = " style=\"" + strStyle + "\"";
  }
  ret = "<" + node.nodeName + strAttr + strStyle + ">" + subtags.join('\n').trim() + "</" + node.nodeName + ">";
  return ret;
  function fn$(){
    var i$, to$, results$ = [];
    for (i$ = 1, to$ = list.length; i$ < to$; ++i$) {
      i = i$;
      results$.push(m = m.multiply(list[i].matrix));
    }
    return results$;
  }
};
snapshot = function(node, arg$){
  var width, height, styleMap, time, hrefs, css, animatedStyles, xml, resume, isPaused;
  width = arg$.width, height = arg$.height, styleMap = arg$.styleMap, time = arg$.time, hrefs = arg$.hrefs, css = arg$.css, animatedStyles = arg$.animatedStyles, xml = arg$.xml, resume = arg$.resume;
  defaults.init();
  isPaused = node.animationsPaused();
  return Promise.resolve().then(function(){
    smil.pause(node, {
      time: time,
      css: css
    });
    return smil.fetchImages(node, hrefs || {});
  }).then(function(hrefs){
    var ret;
    ret = _snapshot({
      node: node,
      width: width,
      height: height,
      time: time,
      hrefs: hrefs,
      animatedStyles: animatedStyles,
      styleMap: styleMap
    });
    if (!isPaused && (!(resume != null) || resume)) {
      smil.play(node, {
        css: css
      });
    }
    return xml ? "<?xml version=\"1.0\" encoding=\"utf-8\"?>" + ret : ret;
  });
};
smil.snapshot = snapshot;
function in$(x, xs){
  var i = -1, l = xs.length >>> 0;
  while (++i < l) if (x === xs[i]) return true;
  return false;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}var convert, detectDuration, normalizeFps;
convert = function(src, des){
  var file, srctype, desfmt, destype, img, p;
  src == null && (src = {});
  des == null && (des = {});
  file = src.file || src;
  srctype = src.type || null;
  desfmt = des.format || 'blob';
  destype = des.type || 'image/png';
  if (typeof file === 'string') {
    img = new Image();
    img.src = file;
    file = img;
    /* example using `fetch` */
  } else if (file instanceof ArrayBuffer || file instanceof Uint8Array) {
    img = new Image();
    img.src = URL.createObjectURL(srctype
      ? new Blob([file], {
        type: srctype
      })
      : new Blob([file]));
    file = img;
  }
  if (file instanceof Image) {
    p = file.complete
      ? Promise.resolve()
      : new Promise(function(res, rej){
        return file.onload = function(){
          return res();
        };
      });
    return p.then(function(){
      var canvas, width, height, ctx, ref$, r, g, b, data, d;
      if (desfmt === 'image') {
        return file;
      }
      canvas = document.createElement('canvas');
      width = file.width, height = file.height;
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255,255,255,0)';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(file, 0, 0, width, height);
      if (des.transparent) {
        ref$ = ldcolor.rgb(des.transparent), r = ref$.r, g = ref$.g, b = ref$.b;
        data = ctx.getImageData(0, 0, width, height);
        d = data.data;
      }
      return new Promise(function(res, rej){
        if (desfmt === 'dataurl') {
          return res(canvas.toDataURL(destype));
        }
        return canvas.toBlob(function(blob){
          var fr;
          if (desfmt === 'blob') {
            return res(blob);
          } else if (desfmt === 'bloburl') {
            return res(URL.createObjectURL(blob));
          }
          fr = new FileReader();
          fr.onload = function(){
            if (desfmt === 'arraybuffer') {
              return res(fr.result);
            } else {
              return res(new Uint8Array(fr.result));
            }
          };
          return fr.readAsArrayBuffer(blob);
        }, destype);
      });
    });
  } else {
    return Promise.reject(new Error("unsupported type for conversion"));
  }
};
detectDuration = function(node){
  var hash, _, durs, k;
  hash = {};
  _ = function(n){
    var i$, to$, i, results$ = [];
    if (n.nodeType !== Element.ELEMENT_NODE) {
      return;
    }
    if (n.style["animation-name"] && n.style["animation-name"] !== 'none') {
      hash[(n.style["animation-duration"] || '').replace('s', '')] = true;
    }
    if (n.hasAttribute("dur")) {
      hash[(n.getAttribute("dur") || '').replace('s', '')] = true;
    }
    for (i$ = 0, to$ = n.childNodes.length; i$ < to$; ++i$) {
      i = i$;
      results$.push(_(n.childNodes[i]));
    }
    return results$;
  };
  _(node);
  durs = (function(){
    var results$ = [];
    for (k in hash) {
      results$.push(+k);
    }
    return results$;
  }()).filter(function(it){
    return it && !isNaN(it);
  });
  durs.sort(function(a, b){
    return b - a;
  });
  return durs[0] || 1;
};
normalizeFps = function(node, cfg){
  var val;
  val = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 17, 20, 25, 33, 50, 100];
  if (!cfg.duration) {
    cfg.duration = detectDuration(node) || 1;
  }
  if (cfg.frames) {
    cfg.fps = cfg.frames / cfg.duration;
  }
  if (!cfg.fps) {
    cfg.fps = 33;
  }
  val = val.map(function(it){
    return [it, Math.abs(it - cfg.fps)];
  });
  val.sort(function(a, b){
    return a[1] - b[1];
  });
  cfg.fps = val[0][0];
  return cfg.frames = Math.round(cfg.fps * cfg.duration);
};
smil.imgsToGif = function(imgs, opt){
  imgs == null && (imgs = {
    list: []
  });
  opt == null && (opt = {});
  return new Promise(function(res, rej){
    var cfg, gif, ref$, i$, to$, i, item, delay;
    if (typeof GIF == 'undefined' || GIF === null) {
      return rej(new Error("GIF.js not found, which is required for GIF generation"));
    }
    cfg = import$({
      width: imgs.width || 100,
      height: imgs.height || 100,
      progress: function(){}
    }, opt);
    cfg.gif = import$({}, opt.gif || {});
    cfg.gif.repeat = cfg.repeatCount === 1
      ? -1
      : !cfg.repeatCount
        ? 0
        : cfg.repeatCount - 1;
    gif = new GIF((ref$ = import$({
      workers: 4,
      quality: 1
    }, cfg.gif || {}), ref$.width = cfg.width, ref$.height = cfg.height, ref$));
    gif.on('progress', function(v){
      if (cfg.progress) {
        return cfg.progress(v);
      }
    });
    gif.on('finished', function(blob){
      var img;
      img = new Image();
      img.src = URL.createObjectURL(blob);
      return res({
        img: img,
        imgs: imgs,
        blob: blob
      });
    });
    for (i$ = 0, to$ = imgs.list.length; i$ < to$; ++i$) {
      i = i$;
      item = imgs.list[i];
      delay = (Math.round(100 * item.nt) - Math.round(100 * item.ct)) * 10;
      if (delay < 20 && i === imgs.list.length - 1) {
        continue;
      }
      gif.addFrame(item.img, {
        delay: delay
      });
    }
    return gif.render();
  });
};
smil.toImgs = function(node, opt){
  var box, cfg, ref$, nt, ct, ot, idx, delay, imgs, ref1$, _;
  opt == null && (opt = {});
  box = node.getBoundingClientRect();
  cfg = import$({
    slow: 0,
    width: box.width || 100,
    height: box.height || 100,
    progress: function(){}
  }, opt);
  ref$ = [0, 0, 0, 0], nt = ref$[0], ct = ref$[1], ot = ref$[2], idx = ref$[3];
  if (cfg.normalizeFps != null && cfg.normalizeFps) {
    normalizeFps(node, cfg);
  } else {
    if (!cfg.duration) {
      cfg.duration = detectDuration(node) || 1;
    }
    if (!cfg.frames) {
      cfg.frames = Math.round((cfg.fps || 33) * cfg.duration);
    }
  }
  if (cfg.blendFrameCount) {
    cfg.duration = (cfg.duration || 1) * (cfg.frames + cfg.blendFrameCount) / cfg.frames;
    cfg.frames += cfg.blendFrameCount;
  }
  delay = (cfg.duration || 1) / cfg.frames;
  imgs = (ref$ = {
    list: [],
    duration: cfg.duration
  }, ref$.width = cfg.width, ref$.height = cfg.height, ref$);
  while (ct < (cfg.duration || 1)) {
    nt = (ref$ = (idx + 1) * delay) < (ref1$ = cfg.duration) ? ref$ : ref1$;
    imgs.list.push({
      nt: nt,
      ct: ct,
      ot: ot,
      idx: idx
    });
    ref$ = [nt, ct, idx + 1], ct = ref$[0], ot = ref$[1], idx = ref$[2];
  }
  _ = function(i){
    var item, ref$, ref1$;
    cfg.progress(i / (imgs.list.length || 1));
    if (i >= imgs.list.length) {
      return Promise.resolve();
    }
    item = imgs.list[i];
    return smil.snapshot(node, (ref$ = (ref1$ = {
      time: item.ct,
      resume: false
    }, ref1$.styleMap = opt.styleMap, ref1$.css = opt.css, ref1$.animatedStyles = opt.animatedStyles, ref1$), ref$.width = cfg.width, ref$.height = cfg.height, ref$)).then(function(svg){
      var img, ref$;
      item.img = img = new Image();
      ref$ = img.style;
      ref$.width = (cfg.width || 100) + "px";
      ref$.height = (cfg.height || 100) + "px";
      item.src = img.src = "data:image/svg+xml;," + encodeURIComponent(svg);
      item.svg = svg;
      return new Promise(function(res, rej){
        return setTimeout(function(){
          return res(_(i + 1));
        }, cfg.slow || 1);
      });
    });
  };
  return _(0).then(function(){
    smil.play(node, {
      css: opt.css
    });
    if (!cfg.blendFrameCount) {
      return imgs;
    }
    return smil.blendFrames(imgs.list, {
      count: cfg.blendFrameCount
    }).then(function(list){
      return imgs.list = list, imgs;
    });
  });
};
smil.imgsToPngs = function(imgs, opt){
  var cfg, zip, _;
  imgs == null && (imgs = {
    list: []
  });
  opt == null && (opt = {});
  if (typeof JSZip == 'undefined' || JSZip === null) {
    return Promise.reject(new Error("JSZip not found, which is required for png sequence"));
  }
  cfg = import$({
    width: imgs.width || 100,
    height: imgs.height || 100,
    progress: function(){},
    pngs: {}
  }, opt);
  zip = new JSZip();
  _ = function(idx){
    var item;
    if (opt.progress) {
      opt.progress(idx / imgs.list.length);
    }
    if (!(item = imgs.list[idx])) {
      return Promise.resolve();
    }
    return convert({
      file: item.img
    }, {
      format: 'blob'
    }).then(function(blob){
      zip.file((idx + 1) + ".png", blob);
      return _(idx + 1);
    });
  };
  return _(0).then(function(){
    return zip.generateAsync({
      type: 'blob'
    });
  }).then(function(it){
    return {
      blob: it,
      imgs: imgs
    };
  });
};
smil.toGif = function(node, opt){
  var p, ref$;
  opt == null && (opt = {});
  p = function(v, t){
    if (opt.progress) {
      return opt.progress((v + t) * 0.5);
    }
  };
  return smil.toImgs(node, (ref$ = import$({
    normalizeFps: true
  }, opt), ref$.progress = function(it){
    return p(it, 0);
  }, ref$)).then(function(imgs){
    var ref$;
    return smil.imgsToGif(imgs, (ref$ = import$({}, opt), ref$.progress = function(it){
      return p(it, 1);
    }, ref$));
  });
};
smil.toPngs = function(node, opt){
  var p, ref$;
  opt == null && (opt = {});
  p = function(v, t){
    if (opt.progress) {
      return opt.progress((v + t) * 0.5);
    }
  };
  return smil.toImgs(node, (ref$ = import$({}, opt), ref$.progress = function(it){
    return p(it, 0);
  }, ref$)).then(function(imgs){
    var ref$;
    return smil.imgsToPngs(imgs, (ref$ = import$({}, opt), ref$.progress = function(it){
      return p(it, 1);
    }, ref$));
  });
};
smil.convert = convert;
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}var iBuffer, apngtool;
iBuffer = function(input){
  if (typeof input === 'number') {
    this.ua = new Uint8Array(input);
    this.length = input;
  } else {
    this.ua = input;
    this.length = input.length;
  }
  return this;
};
iBuffer.concat = function(){
  var bufs, res$, i$, to$, length, buf, offset, i;
  res$ = [];
  for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
    res$.push(arguments[i$]);
  }
  bufs = res$;
  length = bufs.reduce(function(a, b){
    return a + b.length;
  }, 0);
  buf = new iBuffer(length);
  offset = 0;
  for (i$ = 0, to$ = bufs.length; i$ < to$; ++i$) {
    i = i$;
    buf.ua.set(bufs[i].ua, offset);
    offset += bufs[i].length;
  }
  return buf;
};
import$(iBuffer.prototype, {
  readUInt32BE: function(position){
    var ret, i$, i;
    ret = 0;
    for (i$ = 0; i$ <= 3; ++i$) {
      i = i$;
      ret *= 0x100;
      ret += +this.ua[position + i];
    }
    return ret;
  },
  readUInt8: function(position){
    return this.ua[position];
  },
  writeUIntBE: function(value, position, bytes){
    var i$, i, results$ = [];
    bytes == null && (bytes = 4);
    for (i$ = bytes - 1; i$ >= 0; --i$) {
      i = i$;
      results$.push(this.ua[position + (bytes - 1) - i] = value >> 8 * i & 0xff);
    }
    return results$;
  },
  writeUInt32BE: function(value, position){
    return this.writeUIntBE(value, position, 4);
  },
  writeUInt16BE: function(value, position){
    return this.writeUIntBE(value, position, 2);
  },
  writeUInt8: function(value, position){
    return this.writeUIntBE(value, position, 1);
  },
  write: function(value, position){
    var i$, to$, i, results$ = [];
    value == null && (value = "");
    for (i$ = 0, to$ = value.length; i$ < to$; ++i$) {
      i = i$;
      results$.push(this.ua[position + i] = value.charCodeAt(i) & 0xff);
    }
    return results$;
  },
  slice: function(a, b){
    return new iBuffer(this.ua.slice(a, b));
  },
  copy: function(des, ts, ss, se){
    var i$, to$, i, results$ = [];
    ts == null && (ts = 0);
    ss == null && (ss = 0);
    if (!se) {
      se = this.ua.length;
    }
    for (i$ = 0, to$ = se - ss; i$ < to$; ++i$) {
      i = i$;
      results$.push(des.writeUInt8(this.readUInt8(ss + i), ts + i));
    }
    return results$;
  },
  toString: function(encoding){
    var ret, i$, to$, i;
    ret = "";
    for (i$ = 0, to$ = this.length; i$ < to$; ++i$) {
      i = i$;
      ret += String.fromCharCode(this.ua[i]);
    }
    return ret;
  }
});
apngtool = {
  findChunk: function(buf, type){
    var offset, ret, chunkLength, chunkType;
    offset = 8;
    ret = [];
    while (offset < buf.length) {
      chunkLength = buf.readUInt32BE(offset);
      chunkType = buf.slice(offset + 4, offset + 8).toString('ascii');
      if (chunkType === type) {
        ret.push(buf.slice(offset, offset + chunkLength + 12));
      }
      offset += 4 + 4 + chunkLength + 4;
    }
    if (ret.length) {
      return ret;
    }
    throw new Error("chunk " + type + " not found");
  },
  animateFrame: function(buf, idx, delay){
    var ihdr, idats, delayNumerator, delayDenominator, fctl, data, length, fdat;
    ihdr = apngtool.findChunk(buf, 'IHDR')[0];
    idats = apngtool.findChunk(buf, 'IDAT');
    delayNumerator = Math.round(delay * 1000);
    delayDenominator = 1000;
    fctl = new iBuffer(38);
    fctl.writeUInt32BE(26, 0);
    fctl.write('fcTL', 4);
    fctl.writeUInt32BE(idx ? idx * 2 - 1 : 0, 8);
    fctl.writeUInt32BE(ihdr.readUInt32BE(8), 12);
    fctl.writeUInt32BE(ihdr.readUInt32BE(12), 16);
    fctl.writeUInt32BE(0, 20);
    fctl.writeUInt32BE(0, 24);
    fctl.writeUInt16BE(delayNumerator, 28);
    fctl.writeUInt16BE(delayDenominator, 30);
    fctl.writeUInt8(0, 32);
    fctl.writeUInt8(0, 33);
    fctl.writeUInt32BE(CRC32.buf(fctl.slice(4, fctl.length - 4).ua), 34);
    if (!idx) {
      return [idx, ihdr, iBuffer.concat.apply(iBuffer, [fctl].concat(idats))];
    }
    data = iBuffer.concat.apply(iBuffer, idats.map(function(idat){
      return new iBuffer(idat.ua.slice(8, idat.ua.length - 4));
    }));
    length = data.length + 4 + 12;
    fdat = new iBuffer(length);
    fdat.writeUInt32BE(length - 12, 0);
    fdat.write('fdAT', 4);
    fdat.writeUInt32BE(idx * 2, 8);
    data.copy(fdat, 12, 0);
    fdat.writeUInt32BE(CRC32.buf(fdat.slice(4, fdat.length - 4).ua), length - 4);
    return [idx, ihdr, iBuffer.concat(fctl, fdat)];
  }
};
smil.imgsToApng = function(imgs, opt){
  var cfg, images, _;
  imgs == null && (imgs = {
    list: []
  });
  opt == null && (opt = {});
  cfg = import$({
    width: imgs.width || 100,
    height: imgs.height || 100,
    progress: function(){}
  }, opt);
  cfg.apng = import$({}, opt.apng || {});
  images = [];
  _ = function(idx){
    var item;
    cfg.progress(idx / (imgs.list.length || 1));
    if (!(item = imgs.list[idx])) {
      return Promise.resolve(images);
    }
    return Promise.resolve().then(function(){
      return smil.convert({
        file: item.img
      }, {
        format: 'i8a'
      });
    }).then(function(i8a){
      var delay;
      if (!i8a.length) {
        return;
      }
      delay = (Math.round(1000 * item.nt) - Math.round(1000 * item.ct)) / 1000;
      return images.push(apngtool.animateFrame(new iBuffer(i8a), idx, delay));
    }).then(function(){
      return _(idx + 1);
    });
  };
  return _(0).then(function(){
    var signature, ihdr, iend, actl, buf, blob, img;
    signature = new iBuffer([137, 80, 78, 71, 13, 10, 26, 10]);
    ihdr = images[0][1];
    iend = new iBuffer([0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
    actl = new iBuffer(20);
    actl.writeUInt32BE(8, 0);
    actl.write('acTL', 4);
    actl.writeUInt32BE(images.length, 8);
    actl.writeUInt32BE(cfg.repeatCount || 0, 12);
    actl.writeUInt32BE(CRC32.buf(actl.slice(4, actl.length - 4).ua), 16);
    buf = iBuffer.concat.apply(null, [signature, ihdr, actl].concat(images.map(function(it){
      return it[2];
    }), [iend]));
    blob = new Blob([buf.ua], {
      type: "image/apng"
    });
    img = new Image();
    img.src = URL.createObjectURL(blob);
    return {
      img: img,
      imgs: imgs,
      blob: blob
    };
  });
};
smil.toApng = function(node, opt){
  var p, ref$;
  opt == null && (opt = {});
  p = function(v, t){
    return opt.progress((v + t) * 0.5) || function(){}((v + t) * 0.5);
  };
  return smil.toImgs(node, (ref$ = import$({}, opt), ref$.progress = function(it){
    return p(it, 0);
  }, ref$)).then(function(imgs){
    var ref$;
    return smil.imgsToApng(imgs, (ref$ = import$({}, opt), ref$.progress = function(it){
      return p(it, 1);
    }, ref$));
  });
};
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}(function(it){
  return it();
})(function(){
  var cvtr, aniwrap, shapeObj, wrapper, decompose, deu, parse, prepend, svgToLottie, toLottie;
  cvtr = {
    fill: function(o){
      return {
        o: [100],
        c: ldcolor.rgbfv(o.fill)
      };
    },
    stroke: function(o){
      return {
        o: [o.stroke === 'none' ? 0 : 100],
        w: [+o['stroke-width']],
        c: ldcolor.rgbfv(o.stroke)
      };
    },
    transform: function(o){
      var ret, m, ref$, cx, cy, sx, sy, tx, ty, r;
      if (!(ret = /matrix\(([^)]+)\)/.exec(o.transform))) {
        m = {
          tx: 0,
          ty: 0,
          r: 0,
          sx: 100,
          sy: 100,
          skx: 0,
          sky: 0
        };
      } else {
        m = decompose(ret[1].replace(/ /g, '').split(',').map(function(it){
          return +it;
        }));
        m.sx = m.sx * 100;
        m.sy = m.sy * 100;
        m.opacity = o.opacity;
        ref$ = (o["transform-origin"] || '0 0').replace(/ /g, ' ').split(' ').map(function(it){
          return +it.replace(/px/, '');
        }), cx = ref$[0], cy = ref$[1];
        m.cx = cx;
        m.cy = cy;
        m.tx = m.cx + m.tx;
        m.ty = m.cy + m.ty;
      }
      cx = m.cx, cy = m.cy, sx = m.sx, sy = m.sy, tx = m.tx, ty = m.ty, r = m.r;
      return {
        a: [+cx || 0, +cy || 0],
        p: [+tx || 0, +ty || 0],
        s: [+sx || 100, +sy || 100],
        r: [+r || 0],
        o: [+(o.opacity != null ? o.opacity : 1) * 100]
      };
    },
    ellipse: function(o){
      return {
        p: [+o.cx, +o.cy],
        s: [+o.rx * 2, +o.ry * 2]
      };
    },
    circle: function(o){
      return {
        p: [+o.cx, +o.cy],
        s: [+(o.r || o.rx) * 2, +(o.r || o.ry) * 2]
      };
    },
    rect: function(o){
      return {
        p: [+o.x + +o.width / 2, +o.y + +o.height / 2],
        s: [+o.width, +o.height],
        r: [0]
      };
    },
    line: function(o){
      return {
        ks: [{
          c: false,
          v: [[+o.x1, +o.y1], [+o.x2, +o.y2]],
          i: [[0, 0], [0, 0]],
          o: [[0, 0], [0, 0]]
        }]
      };
    },
    polygon: function(o){
      var pts;
      pts = o.points.split(/\s+/).map(function(it){
        return it.split(',').map(function(it){
          return +it;
        });
      });
      return {
        ks: [{
          c: true,
          v: pts.map(function(it){
            return [it[0], it[1]];
          }),
          i: pts.map(function(){
            return [0, 0];
          }),
          o: pts.map(function(){
            return [0, 0];
          })
        }]
      };
    },
    polyline: function(o){
      var pts;
      pts = o.points.split(/\s+/).map(function(it){
        return it.split(',').map(function(it){
          return +it;
        });
      });
      return {
        ks: [{
          c: false,
          v: pts.map(function(it){
            return [it[0], it[1]];
          }),
          i: pts.map(function(){
            return [0, 0];
          }),
          o: pts.map(function(){
            return [0, 0];
          })
        }]
      };
    },
    path: function(o){
      var ds, paths;
      ds = o.d.split(/M/).filter(function(it){
        return it.trim();
      }).map(function(it){
        return ("M" + it).trim();
      });
      paths = ds.map(function(d){
        var closed, pts;
        closed = false;
        pts = cubify(d);
        return {
          ks: [{
            c: closed,
            v: pts.map(function(it){
              return [it[1], -it[2]];
            }),
            i: pts.map(function(it){
              return [it[3] - it[1], -(it[4] - it[2])];
            }),
            o: pts.map(function(it){
              return [it[5] - it[1], -(it[6] - it[2])];
            })
          }]
        };
      });
      return paths;
    }
  };
  aniwrap = function(t, v, last){
    var ret;
    last == null && (last = false);
    ret = {
      t: t,
      h: 0,
      s: v
    };
    if (!last) {
      return ret.o = {
        x: [0],
        y: [0]
      }, ret.i = {
        x: [1],
        y: [1]
      }, ret;
    }
  };
  shapeObj = {
    fill: {
      ty: 'fl',
      r: 1
    },
    stroke: {
      ty: 'st'
    },
    transform: {
      ty: 'tr'
    },
    g: {
      ty: 'gr',
      it: []
    },
    ellipse: {
      ty: 'el'
    },
    circle: {
      ty: 'el'
    },
    rect: {
      ty: 'rc'
    },
    line: {
      ty: 'sh'
    },
    polygon: {
      ty: 'sh'
    },
    polyline: {
      ty: 'sh'
    },
    path: {
      ty: 'sh'
    }
  };
  wrapper = function(name, o){
    var a, r, objs, obj;
    o == null && (o = []);
    if (name === 'g') {
      return JSON.parse(JSON.stringify(shapeObj['g']));
    }
    a = o.length > 1;
    if (Array.isArray(r = cvtr[name](o[0][1]))) {
      objs = r.map(function(){
        return JSON.parse(JSON.stringify(shapeObj[name]));
      });
      o.map(function(arg$, i){
        var t, o, infos;
        t = arg$[0], o = arg$[1];
        infos = cvtr[name](o);
        return infos.map(function(d, j){
          var k, v, ref$, ref1$, results$ = [];
          for (k in d) {
            v = d[k];
            ((ref$ = objs[j])[k] || (ref$[k] = {})).a = 1;
            results$.push(((ref$ = (ref1$ = objs[j])[k] || (ref1$[k] = {})).k || (ref$.k = [])).push(aniwrap(i, v, i + 1 === o.length)));
          }
          return results$;
        });
      });
      return objs;
    } else {
      obj = JSON.parse(JSON.stringify(shapeObj[name]));
      o.map(function(arg$, i){
        var t, o, k, ref$, v, ref1$, results$ = [];
        t = arg$[0], o = arg$[1];
        for (k in ref$ = cvtr[name](o)) {
          v = ref$[k];
          (obj[k] || (obj[k] = {})).a = 1;
          results$.push(((ref1$ = obj[k] || (obj[k] = {})).k || (ref1$.k = [])).push(aniwrap(i, v, i + 1 === o.length)));
        }
        return results$;
      });
      return obj;
    }
  };
  decompose = function(mat, opt){
    var a, b, c, d, e, f, D, t, ref$, kx, ky, r, s;
    opt == null && (opt = {});
    a = mat[0], b = mat[1], c = mat[2], d = mat[3], e = mat[4], f = mat[5];
    D = a * d - b * c;
    t = [e, f];
    ref$ = [0, 0, 0, [0, 0]], kx = ref$[0], ky = ref$[1], r = ref$[2], s = ref$[3];
    r = Math.atan2(b, a);
    if (r < 0) {
      r += 2 * Math.PI;
    }
    ky = Math.atan2(d, c) - Math.PI / 2 - r;
    s[0] = Math.sqrt(a * a + b * b);
    s[1] = Math.sqrt(c * c + d * d) * Math.cos(ky);
    /*
    if a or b =>
      R = Math.sqrt(a * a + b * b)
      r = (if b > 0 => 1 else -1 ) * Math.acos( a / R )
      # rotate: 3.14 -> -3.14 causes trembling effect which we'd like to avoid.
      # so we force it to positive value
      if r < 0 => r += 2 * Math.PI
      s = [R, D / R]
      kx = Math.atan((a * c + b * d) / (R * R))
    else if c or d =>
      S = Math.sqrt(c * c + d * d)
      r = Math.PI/2 - (if d > 0 => 1 else -1) * Math.acos(-c / S)
      if r < 0 => r += 2 * Math.PI
      s = [D/S, S]
      ky = Math.atan(a * c + b * d) / (S * S)
    else s = [0,0]
    */
    return {
      tx: t[0],
      ty: t[1],
      r: r * 180 / Math.PI,
      sx: s[0],
      sy: s[1],
      skx: kx * 180 / Math.PI,
      sky: ky * 180 / Math.PI
    };
  };
  deu = function(it){
    return +it.replace(/^\s*\D*([0-9.]+)\D+/, '$1');
  };
  /*
  gradient = (node, hint, opt) ->
    hint.get
    for idx from 0 til node.childNodes.length =>
      child = node.childNodes[idx]
      c = ldcolor.rgbfv(child.getAttributes \stop-color)
      o = if (o = child.getAttributes(\stop-opacity))? => +o else 1
      offset = +(child.getAttributes(\offset) or "0").replace(/%/,'') / 100
  */
  parse = function(node, hint, opt){
    var name, dur, obj, k, v, attrs, g, ref$, u, list, res$, frameCount, x, y, width, height, style, fill, stroke, strokeWidth, opacity, gr, tr, shape, fl, st;
    if (node.nodeType !== Element.ELEMENT_NODE) {
      return;
    }
    name = node.nodeName.toLowerCase();
    dur = opt.duration || 1;
    if (hint && (obj = hint.get(node))) {
      for (k in obj) {
        v = obj[k];
        attrs = {};
        for (g in ref$ = v.style) {
          u = ref$[g];
          attrs[g] = u;
        }
        for (g in ref$ = v.attr) {
          u = ref$[g];
          attrs[g] = u;
        }
        obj[k] = attrs;
      }
      res$ = [];
      for (k in obj) {
        v = obj[k];
        res$.push([+(+(k + "")).toFixed(2), v]);
      }
      list = res$;
      list.sort(function(a, b){
        return a[0] - b[0];
      });
      frameCount = list.length;
    }
    if (name === 'svg') {
      ref$ = ['x', 'y', 'width', 'height'].map(function(it){
        return +node.getAttribute(it);
      }), x = ref$[0], y = ref$[1], width = ref$[2], height = ref$[3];
      ref$ = [x || 0, y || 0, width || 100, height || 100], x = ref$[0], y = ref$[1], width = ref$[2], height = ref$[3];
      return {
        nm: "Bouncy Ball",
        v: "5.5.2",
        ip: 0,
        op: frameCount,
        fr: Math.round(frameCount / dur),
        w: width,
        h: height,
        layers: [{
          ddd: 0,
          ty: 4,
          st: 0,
          ip: 0,
          op: frameCount,
          ks: {
            o: {
              a: 0,
              k: 100
            }
          },
          shapes: []
        }]
      };
    } else if (!shapeObj[name]) {
      return;
    }
    style = window.getComputedStyle(node);
    fill = ldcolor.rgbfv(style.fill);
    stroke = ldcolor.rgbfv(style.stroke === 'none'
      ? 'transparent'
      : style.stroke);
    strokeWidth = deu(style.strokeWidth);
    opacity = Math.round(style.opacity * 100);
    gr = wrapper('g', list);
    tr = wrapper('transform', list);
    if (name === 'g') {
      return gr.it = [tr], gr;
    }
    shape = wrapper(name, list);
    fl = (ref$ = style.fill) === 'transparent' || ref$ === 'none'
      ? null
      : wrapper('fill', list);
    st = (ref$ = style.stroke) === 'transparent' || ref$ === 'none'
      ? null
      : wrapper('stroke', list);
    gr.it = gr.it.concat(((Array.isArray(shape)
      ? shape
      : [shape]).concat([st, fl, tr])).filter(function(it){
      return it;
    }));
    return gr;
  };
  prepend = function(list, v){
    var i$, to$, i, results$ = [];
    v = Array.isArray(v)
      ? v
      : [v];
    for (i$ = 0, to$ = v.length; i$ < to$; ++i$) {
      i = i$;
      results$.push(list.splice(i, 0, v[i]));
    }
    return results$;
  };
  svgToLottie = function(node, root, arg$){
    var hint, opt, stat, obj, ref$, i$, to$, i, ret;
    hint = arg$.hint, opt = arg$.opt, stat = arg$.stat;
    obj = parse(node, hint, opt);
    if (opt.progress) {
      opt.progress((ref$ = stat.count / stat.len) < 1 ? ref$ : 1);
    }
    stat.count++;
    if (!root) {
      root = obj;
    }
    for (i$ = 0, to$ = node.childNodes.length; i$ < to$; ++i$) {
      i = i$;
      if (!(ret = svgToLottie(node.childNodes[i], root, {
        hint: hint,
        opt: opt,
        stat: stat
      }))) {
        continue;
      }
      if (ret.ty === 4) {
        prepend(root.layers, ret);
      } else if (obj.v) {
        prepend(obj.layers[0].shapes, ret);
      } else if (obj.ty === 4) {
        prepend(obj.shapes, ret);
      } else if (Array.isArray(obj.it)) {
        prepend(obj.it, ret);
      }
    }
    return obj;
  };
  toLottie = function(svg, opt){
    var div, ref$, styleMap;
    opt == null && (opt = {});
    if (typeof svg === 'string') {
      div = document.createElement('div');
      if (!(typeof DOMPurify != 'undefined' && DOMPurify !== null)) {
        throw new Error("[smil.to-lottie] parse SVG: dompurify is required to prevent potential XSS attacks");
      }
      div.innerHTML = DOMPurify.sanitize(svg);
      ref$ = div.style;
      ref$.position = 'absolute';
      ref$.opacity = 0;
      ref$.pointerEvents = 'none';
      ref$.zIndex = 0;
      ref$.width = 0;
      ref$.height = 0;
      ref$.overflow = 'hidden';
      ref$.top = 0;
      ref$.left = 0;
      document.body.appendChild(div);
      svg = Array.from(div.childNodes).filter(function(it){
        return it.nodeName === 'svg';
      })[0];
    }
    styleMap = new WeakMap();
    return smil.toImgs(svg, (ref$ = import$({
      styleMap: styleMap
    }, opt), ref$.progress = function(it){
      if (opt.progress) {
        return opt.progress(it * 0.5);
      }
    }, ref$)).then(function(imgs){
      var len, ret, ref$;
      len = svg.querySelectorAll('*').length;
      return ret = svgToLottie(svg, null, {
        hint: styleMap,
        opt: (ref$ = import$({}, opt), ref$.duration = imgs.duration, ref$.progress = function(it){
          if (opt.progress) {
            return opt.progress(it * 0.5 + 0.5);
          }
        }, ref$),
        stat: {
          len: len,
          count: 0
        }
      });
    });
  };
  return smil.toLottie = toLottie;
});
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}smil.blendFrames = function(list, opt){
  opt == null && (opt = {});
  return Promise.resolve().then(function(){
    var canvas, x$, ref$, ctx, blended, count, i$, i, o, img1, img2, img, ref1$, ref2$, ret;
    canvas = document.createElement('canvas');
    x$ = canvas.style;
    x$.position = 'absolute';
    x$.pointerEvents = 'none';
    x$.opacity = 0;
    canvas.width = (ref$ = list[0].img).width;
    canvas.height = ref$.height;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    blended = [];
    count = opt.count || 30;
    for (i$ = 0; i$ < count; ++i$) {
      i = i$;
      o = i / count;
      img1 = list[i];
      img2 = list[list.length - count + i];
      ctx.globalAlpha = o;
      ctx.drawImage(img1.img, 0, 0);
      ctx.globalAlpha = 1 - o;
      ctx.drawImage(img2.img, 0, 0);
      img = new Image();
      img.src = canvas.toDataURL();
      blended.push((ref1$ = (ref2$ = {}, ref2$.idx = img1.idx, ref2$.ct = img1.ct, ref2$.nt = img1.nt, ref2$.ot = img1.ot, ref2$), ref1$.img = img, ref1$.src = img.src, ref1$));
    }
    ret = blended.concat((function(){
      var i$, to$, results$ = [];
      for (i$ = count, to$ = list.length - count; i$ < to$; ++i$) {
        i = i$;
        results$.push(list[i]);
      }
      return results$;
    }()));
    document.body.removeChild(canvas);
    return ret;
  });
};})();
