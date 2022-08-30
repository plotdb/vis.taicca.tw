# Change Logs

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
