# Change Logs

## v2.1.10

 - base chart: support font lib loading from konfig font widget
 - bubble chart: support removing animation
 - utils.axis: prepare caption.padding default value to prevent from SVG value NaN error
 - utils.legend: ensure flex box wrap
 - line chart:
   - ensure rank for even undefined data
   - correct y domain for bump chart with missing data


## v2.1.9

 - bubble chart:
   - tweak pie legend order in bottom position
   - add `contrast` option for pie wedges coloring
 - utils.axis / utils.config
   - add `padding` in caption config


## v2.1.8

 - utils.tint:
   - fix bug: incorrect variable name used in color idx in continuous mode 
   - fix bug: incorrect continuous mapping function in boundary
   - remove useless code
 - utils.legend:
   - fix bug: layout.getNode called with incorrect name
   - support get data by calling data without parameter
 - utils.config:
   - add `tip` preset
 - utils.axis:
   - fix bug: caption still shows even if axis.enabled is false.
 - line chart:
   - fix bug: legend position doesn't work correctly
   - use chart.utils.config.from for configuration
   - proper popup formatting
   - tweak boundary by dot sizing
   - tweak layout in different legend position
 - fix bug: bar chart legend position doesn't work correctly
 - treemap chart
   - fix bug: treemap chart `unit-position` config typo
   - tweak unit label style when legend is in bottom position
   - proper support label formatting
   - tweak css for chart layout
 - bubble chart
   - use chart.utils.config.from for configuration
   - remove useless code
   - add unit in sample binding
   - support unit position option
   - unify unit value
   - tweak label position based on presence of name bind
   - extend pie colorscheme to `lightness`, `dark to light` and `light to dark`
   - add `pie-legend` for legend of wedges.
   - replace `d3.format` with `chart.utils.format`
   - correctly color bubbles based on color binding
   - show dimension name in tip if multiple wedges are shown
 - percent-list: use `chart.utils.config.from`


## v2.1.7

 - chart.utils.config: add label config
 - voronoi-treemap
   - try to hide outlier shape
   - add label config for label number format


## v2.1.6

 - line chart: add xaxis and yaxis configs
 - bar chart: fix bug: legend data should be update before `is-selected` is called.


## v2.1.5

 - support `position` and `enabled` option in `chart.utils.config.preset.legend`
 - voronoi treemap:
   - support default and legend options
   - add additional options in voronoi treemap to prevent lagging
 - bubble chart:
   - use default font config
   - tweak wedges colors
 - line chart:
   - tweak config
   - reset revision
 - rename various config in charts and utils
   - `tick-count` to `tick.count`
   - `tick-boundary-offset` to `tick.boundary-offset`
   - `dot-size` to `dot.size`
 - apply default config automatically when `config` is called.
 - support multiple config object in `config` api calls


## v2.1.4

 - bug fix: line chart
 - bug fix: in utils.legend: `_range` should be checked only if available
 - bug fix: in utils.axis: offset vertical legend by -1
 - upgrade modules for vulnerability fixing
 - support `ranges` mode in tint util
 - support exponential ticking
 - support ranges ticking in taiwan map
 - support additional configs in axis
 - enable additional configs in bar chart
 - bar chart:
   - check element before dancing
   - support legend toggling
   - support exit animation
 - set default options if they are available in base block
 - sync chart text for font
 - add default options in pie chart and percent list chart
 - use `willReadFrequently` to speedup wordcloud canvas rendering
 - bug fix: `force-init` boolean test should be `or` instead of `and` to make it work without other condition


## v2.1.3

 - wordcloud: support text-based color


## v2.1.2

 - bar chart:
   - correctly swap brush based on chart type
   - ignore `s` class rect from brush in tip handler. still disable tip since we can't make it work for now 


## v2.1.1

 - bar chart:
   - support bi-direction brush
   - re-enable tip but ignore tip accessor from selection or brush overlay
   - separate g.bar and brush / selection into their own group to prevent potential issue
   - consider chart brush config as default enabled


## v2.1.0

 - bar & pie chart: also support `C` as name field type
 - make wordcloud work. also support font picker
 - voronoi-treemap: fix rendering issue when there is no data
 - support sunburst
 - `chart.utils.tint`: support discrete and continuous value mode
 - `chart.utils.legend`: prevent label wrapping
 - add `chart.utils.tick`, helper for generating ticks.
 - rewrite `taiwancounty` for better color mapping and labeling
 - fix bug: line chart: prevent exception when order is not bound
 - line chart: support additional mode:
   - layered area chart
   - full stacked area chart
   - multiple area chart
 - bubble chart:
   - support pie bubble
   - support legend toggling
   - tweak label
   - tweak coloring
 - curve bar: support additional configuration


## v2.0.1

 - update documentation
 - upgrade dependencies
 - use `ctx()` to replace `setCtx()` in `utils/tip.ls`


## v2.0.0

 - further minimize generated js file with mangling and compression
 - add `browser` field in `package.json`.
 - add `style` in `package.json`
 - upgrade modules
 - patch test code to make it work with upgraded modules
 - release with compact directory structure


## v1.0.3

 - fix bug: axis ticks still show even if axis is disabled
 - enhancement: allow non-array binding even if corresponding dimension is defined with multiple as true.
 - fix bug: tips in line streamgraph mode work incorrectly


## v1.0.2

 - release necessary files only
 - add `main` field in `package.json`.


## v1.0.1

 - dont `postinstall npx fedep` since it may lead to installation failure.


## v1.0.0

 - adopt `@plotdb/block` v4 syntax


## v0.0.3

 - upgrade @plotdb/block and related modules. add @loadingio/vscroll
 - support Promise-based sample function
 - change context of `sample` so we can access `cfg` directly in `sample`
 - add taiwancounty chart


## v0.0.2

 - use `palette` instead of `pal` in all charts, configurations and utils
 - rename `Chart` to `chart`.
 - rename `Aniloop` to `aniloop`
 - export to `window` only if `module` is not defined.
 - add config preset.
 - update pie bubble chart
 - tweak init and config flow. default config is now available.
