(function(){
  var font, config;
  font = {
    family: {
      type: 'font'
    },
    size: {
      type: 'quantity',
      'default': '1em',
      units: [
        {
          name: 'em',
          max: 10,
          step: 0.01,
          'default': 1
        }, {
          name: 'px',
          max: 256,
          step: 1,
          'default': 16
        }
      ]
    }
  };
  config = {
    from: function(c){
      var ret, _, this$ = this;
      ret = {};
      _ = function(o, c){
        var k, v;
        if (c.preset) {
          import$(o, JSON.parse(JSON.stringify(this$.preset[c.preset])));
        }
        for (k in c) {
          v = c[k];
          if (k === 'preset') {
            continue;
          }
          if (typeof v === 'string') {
            o[k] = JSON.parse(JSON.stringify(this$.preset[v])) || {};
          } else {
            _(o[k] || (o[k] = {}), v);
          }
        }
        return o;
      };
      return _(ret, c);
    },
    preset: {
      'default': {
        margin: {
          type: 'number'
        },
        font: font,
        color: {
          type: 'color',
          'default': 'currentColor'
        },
        palette: {
          type: 'palette'
        },
        background: {
          type: 'color',
          'default': 'transparent'
        }
      },
      font: font,
      tip: {
        enabled: {
          type: 'boolean',
          'default': true
        }
      },
      label: {
        format: {
          type: 'text',
          'default': '.3s'
        }
      },
      legend: {
        selectable: {
          type: 'boolean',
          'default': true
        },
        enabled: {
          type: 'boolean',
          'default': true
        },
        position: {
          type: 'choice',
          values: ['bottom', 'right'],
          'default': 'right'
        }
      },
      axis: {
        enabled: {
          type: 'boolean',
          'default': true
        },
        tick: {
          inner: {
            type: 'number',
            name: "Inner Tick Size",
            'default': 8,
            min: 0,
            max: 40,
            step: 0.1
          },
          color: {
            type: 'color',
            'default': 'currentColor'
          },
          count: {
            type: 'number',
            'default': 4,
            min: 1,
            max: 40
          },
          boundaryOffset: {
            type: 'boolean',
            'default': true
          }
        },
        baseline: {
          show: {
            type: 'boolean',
            'default': true
          },
          color: {
            type: 'color',
            'default': 'currentColor'
          }
        },
        label: {
          color: {
            type: 'color',
            'default': 'currentColor'
          },
          format: {
            type: 'text',
            'default': '.3s'
          },
          direction: {
            type: 'choice',
            'default': 'horizontal',
            values: ['horizontal', 'vertical']
          },
          padding: {
            type: 'number',
            'default': 1,
            min: 0,
            max: 10,
            step: 0.1
          },
          font: font
        },
        caption: {
          color: {
            type: 'color',
            'default': 'currentColor'
          },
          text: {
            type: 'text',
            'default': ''
          },
          show: {
            type: 'boolean',
            'default': true
          },
          padding: {
            type: 'number',
            'default': 1,
            min: 0,
            max: 10,
            step: 0.1
          },
          font: font
        }
      }
    }
  };
  if (typeof chart != 'undefined' && chart !== null) {
    (chart.utils || (chart.utils = {})).config = config;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
