fs = require "fs-extra"

files = fs.readdir-sync "json" .map (d) -> ["json/#d", "json-test/#d"]

files.map (file) ->

  d1 = JSON.parse(fs.read-file-sync file.0)
  try
    d2 = JSON.parse(fs.read-file-sync file.1)
  catch e
    return

  h1 = {}
  h2 = {}
  d1.map (d) -> h1[d["中文片名"]] = d
  d2.map (d) -> h2[d["中文片名"]] = d
  d2.map (d) ->
    k1 = [k for k of d1.0]
    k2 = [k for k of d2.0]
    k1.sort!
    k2.sort!
    o1 = d1[d["中文片名"]]
    o2 = d
    if o1 =>
      s1 = k1.map((k) -> "#k:#{o1[k]}").join('/')
      s2 = k2.map((k) -> "#k:#{o2[k]}").join('/')
      if s1 != s2 =>
        console.log s1
        console.log s2
        console.log
  k1 = [k for k of h1]
  k2 = [k for k of h2]
  #for k in k1 => if !(k in k2) => console.log "舊有新無: [#k]"
  #for k in k2 => if !(k in k1) => console.log "新有舊無: [#k]"
