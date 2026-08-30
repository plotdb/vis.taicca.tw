# Change Logs

## v2.1.40

 backport of the init fixes in v3.0.2, for projects still on the 2.x line.

 - fix bug: chart never inits in a background tab, and a chart created while its container
   is `display:none` stays broken after the container is revealed. init waited for the first
   resizeObserver callback, but chrome skips the whole "update the rendering" step for a
   non-rendered document, so ResizeObserver ( and rAF ) never fire there. init now measures
   the root first ( offsetWidth / offsetHeight - the layout box, so an in-flight ancestor
   transform does not skew it ) and only waits when the measurement tells it nothing.
 - fix bug: force-init charts ( and charts on invisible nodes ) were never observed for
   resize at all - `resizeObserver.add` lives inside the lock, and those paths returned
   before running it, so the node was never registered for the rest of its life.


## v2.1.39

 - fix bug: no default value in axis sideNoteStart / sideNoteEnd, causing NaN in generated SVG


## v2.1.38

 - axis, config utilities: support side note
 - fix bug: chart doesn't render correctly when passing raw / binding via constructor option
 - upgrade dependencies


## v2.1.37
 
 - support configurable axis caption position
 - support centered axis configuration
 - legend: reset container's height before accessing parent's height to prevent incorrect size calculation


## v2.1.36

 - bar chart: fix bug: incorrect palette binding 
 - curved bar: tweak layout, config and dynamic
 - base chart: check resize function existence before calling it


## v2.1.35

 - `pie` chart: fix bug: consider invalid data as `0`
 - `bar` chart:
   - hide brush layer if brush is not enabled to make tips work again
   - separate style into standalone file
 - `voronoi-treemap` chart: fix legend layout issue


## v2.1.34

 - reset legend container height explicitly in horizontal direction to prevent side effect
   after config updated from vertical direction


## v2.1.33

 - `line` chart: use default 0 with `cutoff` to prevent NaN when rendering
 - chart.utils.legend
   - add sort.direction and sort.mode option for legend sorting feature,
     which providing more consistent result and simpler chart implementation
   - programmatically update legend container height in vertical layout direction
     for resolving potential layout issue in grid container


## v2.1.32

 - gracefully fails when @plotdb/konfit font widget is not found with warning message, in base block
 - add bundler tool and required libraries.


## v2.1.31

 - upgrade dependencies
 - `utils.axis`
   - use correct config for label / caption font size and family
   - remove unit in label font size
 - `pictogram` widget:
   - use alternative implementation (by potracing)
   - fix bug: `_idx` is missing
   - pending for previous Promise
   - correctly support legend position
   - support tip
   - support file object from konfig upload widget
 - `pie` widget:
   - tweak layout algorithm to preserve layout correctness
     when resizing canvas and relayouting legend
   - tweak code layout
   - bug fix: NaN in path d attribute if no value is bound, causing refresh failure.
 - `voronoi-treemap` widget:
   - tweak layout algorithm to preserve layout correctness
     when resizing canvas and relayouting legend
   - add an flag as explicit ticking indicator for determine should init code to be rendered.
 - `bar` widget:
   - add `sort.dimension` for choosing the dimension to sort
 - `taiwan-map` widget:
   - update data by replacing `臺` with `台`.
   - rename `legend.exp` to `legend.ticking.exp`
   - check `name` emptiness before working on it
 - `line` widget:
   - beautify sample data
   - bug fix: exception when mouse hovers on nonexisted line hidden by legend toggling in streamgraph mode

## v2.1.30

 - fix bug: `gauge` widget: prevent issue when no binding available
 - `taiwan-map` widget: support abbreviation feature name is we are working in a submap.
 - rename `scatter` to `delaunay` widget
 - add a new `scatter` widget
 - config: add `format` in tip config.
 - support `tip.format` config in `bubble`, `line`, `taiwan-map` and `pie` widgets
 - `pictogram` widget:
   - support input data without `cat` or `value`.
   - correctly support uploaded files.


## v2.1.29

 - fix bug: `taiwan-map` chart: `bottom` position of legend is incorrectly layouted


## v2.1.28

 - use `format` widget instead of `text` for formatting configs


## v2.1.27

 - taiwan-map chart:
   - remove redundant palette configuration
   - support generic configurations (background, color, margin, etc)
 - base chart: support chart margin (by setting padding of root)


## v2.1.26

 - chart.utils.tick:
   - refine tick gapping for better ticking resolution
   - calculate `delta` based on prettified extent to prevent orphan data
   - proper rounding to prevent floating point issue
   - keep original extent to remove empty ticks


## v2.1.25

 - chart.utils.tick: better tick gapping to prevent unused ticks.


## v2.1.24

 - line chart
   - support customized color for dot filling
   - correctly support linecap
   - support linejoin
   - tweak view size based on line stroke width
 - gauge chart
   - support better animation
   - support correct label rendering
   - auto resizing label
   - support unit customization
 - base chart
   - correctly support font position by also setting font family in root element
   - correctly config font size by setting font size separatedly


## v2.1.23

 - tweak axis padding range from 0 to 10 to 0 to 100


## v2.1.22

 - reset option of `tint.set` now depends on the given palette's signature if omitted.


## v2.1.21

 - fix bug: number parsing fails with non-string input


## v2.1.20

 - correctly parse numbers based on locale (default `en-US` and currently not customizable)
 - fix bug: bubble chart: color extent should be converted to number before calculation
 - fix bug: bubble chart: color of legend should be based on binding key so user can customize the mapping.
 - fix bug: bubble chart: reference of undefined variable when looking for area key


## v2.1.19

 - enable font rendering based on `cfg.font` field in base chart.


## v2.1.18

 - fix bug: `config` extend all objects instead of considering meta settings, leading incorrect palette length


## v2.1.17

 - bar chart: fix bug: prevent exception even if no name is bound
 - always normalize binding for multiple dimensions
 - also consider current config before applying default configuration for partially config


## v2.1.16

 - line chart:
   - support y axis cutoff
   - tweak sample data for testing y axis cutoff
 - utils.tint: add support of tag in color of palette.


## v2.1.15

 - pie chart: correctly support different legend position
 - percent-list: make label also selectable ( with event )
 - init `data` field with an empty array so we will have a dummy data even if parse failed to run.
 - audit fix to fix dependencies vulnerabilities


## v2.1.14

 - utils.tip: add `group` handler
 - bubble chart: show `group` in tip


## v2.1.13

 - bubble chart:
   - support label wrapping
   - explicitly add an id for each data for old / new bubble pairing
   - cache getBoundingClientRect! result
   - use correct key function in `g.label` binding
   - remove useless code
   - add sample code for hiding overwrapped text


## v2.1.12

 - add config preset `font`
 - bubble chart:
   - support label overflow tolerance
   - support adaptive label size
   - add `font` and `overflow` config for label
   - use variant length string in sample data for adapative label testing


## v2.1.11

 - support binding normalization based on `multiple` value of dimension definition.
 - pie chart: use chart.utils.config.from for configuration
 - rewrite parser which generates data based on dimension instead of binding
   to prevent unwanted data injected, and ensure array from dimensions with multiple flag


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
