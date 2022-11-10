# @plotdb/konfig

Config editor.


## Usage

Following modules are needed:

    npm install --save @plotdb/konfig @plotdb/semver @plotdb/block @plotdb/rescope @plotdb/csscope @loadingio/debounce.js proxise @loadingio/ldquery ldview

include them:

    /* here we use `@zbryikt/template` syntax */
    +script({
      {name: "proxise"},
      {name: "@loadingio/debounce.js"},
      {name: "@loadingio/ldquery"},
      {name: "ldview"},
      {name: "@plotdb/semver"},
      {name: "@plotdb/rescope"},
      {name: "@plotdb/csscope"},
      {name: "@plotdb/block"},
      {name: "@plotdb/konfig"},
      {name: "@plotdb/konfig", path: "konfig.widget.bootstrap.min.js"}
    });

Then the initialization script:

    kfg = new konfig({...});
    kfg.on("change", function(cfg) { ... });
    kfg.init().then(function() { ... });


Constructor options:

 - `root`: root node or CSS selector for root node.
   - root node is used to place root tab for this config.
 - `useBundle`: true if use bundle blocks, if availale. default true.
 - `debounce`: true to debounce updating. default true.
 - `autotab`: true to use meta object field key as tab name by default. default false
 - `meta`: meta object. see spec for more information.
 - `tab`: tab object. see spec for more information.
 - `manager`: block manager for retrieving blocks
   - use default manager if omitted, which always throw an Error except for blocks available in bundle.
 - `typemap(name)`: converter from widget name to `@plotdb/block` definition. For widget customization.
   - `name`: a widget name, such as `number`, `color`, etc.
   - return value: should be an object for block definition such as `{name: 'number', version: '0.0.1'}`
 - `view`: view for rendering. optional, default null. For more information, see `Views` section below.


A common sample usage:

    kfg = new konfig({
      root: document.querySelector('.kfg'),
      useBundle: true /* bundle from konfig.widget.bootstrap.min.js */
      view: 'simple'
      meta: { sample: { type: 'number' } }
      view: 'simple'
    });
    kfg.on("change", function() { ... });
    kfg.init().then(function() {
    });

with this DOM:

    .kfg(ld-scope): div(ld-each="ctrl")


### API

 - `init()`: initialization.
    - return Promise, resolved initial config on initialized.
 - `render()`: re-render controls
 - `get()`: get value object.
 - `set(v, opt)`: set value object to `v`.
   - options: an option object with possibly following field:
     - `append`: default false. if true, only fields with value other than undefined will be update.
 - `obj()`: instead of a plain, serializable JSON, `obj()` return a Promise resolved with objects corresponding to operatable objects provided by widgets.
 - `default()`: get a config object with all values from default value.
 - `meta(opt)`: update `meta` object. return Promise
   - parameters: either
     - the meta object
     - `{meta, tab}` object.
 - `tab()`: update `tab` object.
 - `interface(meta)`: return a Promise resolved with an interface for the widget defined by `meta`.
 - `on(event, cb(args...))`
 - `fire(event, args...)`


## Class API

 - `merge(des, obj1, obj2, ...)`: recursively merge meta objs by order into `des`, and return `des`.
   - this is for merging meta objects.
 - `append(o1, o2, o3, ...)`: recursively append config object backward to o1. return merged object.
   - this is for merging config objects.


### Events

 - `change`: fired when value is changed. Params:
   - `value`: value object return by `get`.

### Sample Usage

    kfg = new konfig({
      root: document.body,
      meta: {
        showText: { type: 'boolean' },
        textSize: { type: 'number', range: false, min: 10, max: 64, step: 1 },
        textAlign: { type: 'choice', values: ["left", "right", "center"], default: 'left' },
        textColor: { type: 'color', tab: 'color' }
      }
    });


## Meta Specification

Check `doc/spec.md` for more information.


## Views

To correctly render your configuration editor, you have to specify how it should be rendered. This can be done by setting the `view` option in constructor.

`view` can be either a string, an object or a function. Following explains the details about the usage of corresponding types. 


### Builtin Views

`@plotdb/konfig` uses `ldview` for widget rendering, and provide some builtin views which can be specified by their name, by setting `view` option to following strings along with the corresponding sample DOM for ldview, for example:

    new konfig({
      view: "simple"
    });

While `@plotdb/konfig` provides a set of default view dynamics, you still have to define the looks and feels of your views. Following are possible values of `view`, including `simple`, `default` and `recurse`, along with the corresponding sample DOMs.

Additionally, you may want to scope your DOM if you are also using ldview for UI rendering:

    div(ld-scope): div(ld-each="ctrl")


#### simple

A simple list of controls. sample DOM:

    div(ld-each="ctrl")


#### default

Controls with tabs. sample DOM:

    div(ld-each="tab")
      div(ld="name")
      div(ld-each="ctrl")


#### recurse

Controls in recursive tabs. sample DOM:

    div(ld="template")
      div(ld="name")
      div(ld-each="ctrl")
      div(ld-each="tab")

DOM will be reused for recursive tabs so you have to specify a template roo node with `ld="template"`.

Note `ctrl` should be outside of `tab`.



### view as object

When `view` option is an object, it can be anything with following methods:

 - `render()`: called when `@plotdb/konfig` renders tabs and ctrls.
 - `ctx(opt)`: called when `meta` changes, with a parameter object `opt`, with following fields:
   - `root`: root element
   - `ctrls`: ctrl list
   - `tabs`: tab list


### view as function

When `view` option is a function, it should accept an parameter object with following fields:

 - `root`: konfig root element
 - `ctrls`: list of controls
 - `tabs`: list of tabs

Additionally, it should return an object with at least following method:

 - `render()`: this is called everytime when `konfig` needs to br re-rendered.

This function is called everytime a konfig rebuild is necessary ( e.g., when `meta` is updated ). You should implement singleton by yourself if needed.


## License

MIT
