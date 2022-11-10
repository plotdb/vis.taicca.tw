# @plotdb/chart

charting framework. In `@plotdb/chart`, charts are separated into 3 parts:

 - chart class - define how a chart works, and provide an interface for controlling charts.
 - chart mod - specific chart definition and implementation.
 - chart data - data, config, binding and other metadata.

Chart class provides:

 - chart lifecycle control - initing, resizing, rendering, destroying, etc
 - animation loop control.
 - rendering management for container resizing / visibility changing.
 - utility modules for common charting components.

Chart mod includes:

 - the actual code for chart rendering
 - definition of user configurable options
 - accepted data formats
 - other metadata and dependencies

While not in spec and not necessary, chart mod can be encapsulated in `@plotdb/block`.


## Usage

install via `@plotdb/chart`:

    npm install --save @plotdb/chart


include `@plotdb/chart` js and css files under `dist`, mainly `index.js` and `index.css`:

    <link rel="stylesheet" type="text/css" href="path-to-dist/index.min.css"/>
    <script src="path-to-dist/index.min.js"></script>


then, create and initialize a chart object:

    c = new chart({ ... })
    c.init().then(function() { ... });


For more detail about chart module object, chart object constructor option and api interface, check `doc/index.md`.

 

## License 

MIT
