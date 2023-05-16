require! <[fs yargs]>

/*
  此程式分析指定出版商近年在
  文創相關分類 (947.x / 889 / 8xx.57)
  與全部分類的出版品數量比較.
*/

argv = yargs
  .option \publisher, do
    alias: \p
    description: "出版商名稱"
    type: \string
  .help \help
  .alias \help, \h
  .check (argv, options) ->
    if !argv.p => throw new Error("需要出版商名稱")
    return true
  .argv

publisher = argv.p
reg-pub = new RegExp(publisher)

data = JSON.parse(fs.read-file-sync "all.json" .toString!)
[h1,h2] = [{},{}]

data.map ->
  if reg-pub.exec(it.pub) =>
    idx = it.idx
    n = "#{it.year}/#{it.pub}"
    h1{}[it.year][it.pub] = (h1{}[it.year][it.pub] or 0) + 1
    if /947\.[45]/.exec(idx) or /889/.exec(idx) or /8..\.57/.exec(idx) =>
      h2{}[it.year][it.pub] = (h2{}[it.year][it.pub] or 0) + 1
[2017 2018 2019 2020 2021 2022 2023].map (y) -> console.log "#y", h1[y], h2[y]
