require! <[path]>
fs = require "fs-extra"
all = JSON.parse(fs.read-file-sync "all.json" .toString!)
console.log all.body.length
count = fs.readdir-sync "json"
  .map -> path.join \json, it
  .filter -> /\.json/.exec(it)
  .map -> JSON.parse(fs.read-file-sync it .toString!).length
  .reduce(((a,b) -> a + b), 0)
console.log count
