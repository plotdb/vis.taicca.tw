# @plotdb/chart

charting framework. In `@plotdb/chart`, charts are separated into 2 parts:

 - chart framework - define how a chart works, and provide an interface for controlling charts.
 - chart definition - specific chart definition and implementation.

Chart framework provides:

 - chart lifecycle control - initing, resizing, rendering, destroying, etc
 - animation loop control.
 - rendering management for container resizing / visibility changing.
 - utility modules for common charting components.

Chart Definition includes:

 - the actual code for chart rendering
 - definition of user configurable options
 - accepted data formats
 - other metadata and dependencies

While not in spec and not necessary, chart definitions can be encapsulated in `@plotdb/block` for modularization and abstraction.


## Usage

install via `@plotdb/chart`:

    npm install --save @plotdb/chart


include `@plotdb/chart` js and css files under `dist`, mainly `index.js` and `index.css`:

    <link rel="stylesheet" type="text/css" href="path-to-dist/index.min.css"/>
    <script src="path-to-dist/index.min.js"></script>


then, create and initialize a chart object:

    c = new chart({ ... })
    c.init().then(function() { ... });


For more detail about chart module object, chart object constructor option and api interface, check `doc/spec.md`.

 

## License 

MIT
