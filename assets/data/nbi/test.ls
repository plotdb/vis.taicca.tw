require! <[fs]>
data = JSON.parse(fs.read-file-sync "all.json" .toString!)
h1 = {}
h2 = {}
data.map ->
  if /東立/.exec(it.pub) =>
    idx = it.idx
    n = "#{it.year}/#{it.pub}"
    h1{}[it.year][it.pub] = (h1{}[it.year][it.pub] or 0) + 1
    if /947\.[45]/.exec(idx) or /889/.exec(idx) or /8..\.57/.exec(idx) =>
      h2{}[it.year][it.pub] = (h2{}[it.year][it.pub] or 0) + 1
[2017 2018 2019 2020 2021 2022].map (y) -> console.log "#y", h1[y], h2[y]
