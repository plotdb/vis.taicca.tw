require! <[fs papaparse csv4xls]>

result = []
[2019 2020 2021].map (year) ->
  ret = papaparse.parse fs.read-file-sync("#year.csv").toString!
  data = ret.data.filter -> it.filter(->it).length
  head = data.splice 0, 1 .0
  body = data.map (b) -> Object.fromEntries b.map (d,i) -> [head[i], d]
  cats = head.filter -> !(it in <[產業 性別]>)
  inds = Array.from(new Set(body.map (b) -> b["產業"])).filter -> it != '各類型人力占比'
  hash = {}
  body.map (b) -> cats.map (c) -> hash{}[b["產業"]]{}[c][b["性別"]] = b[c]
  inds.map (ind) ->
    cats.map (cat) ->
      obj = "年度": year, "產業": ind, "分類": cat
      obj["男性"] = +hash[ind][cat]["男性"]
      obj["女性"] = +hash[ind][cat]["女性"]
      obj["男女比"] = (obj["男性"]/(obj["女性"] or 1)).toFixed(2)
      obj["女男比"] = (obj["女性"]/(obj["男性"] or 1)).toFixed(2)
      obj["總計"] = obj["男性"] + obj["女性"]
      result.push obj
fs.write-file-sync "all.json", JSON.stringify(result)
array = [[k for k of result.0]] ++ result.map((b) -> [k for k of result.0].map (k) -> b[k])
ret = csv4xls.toArray array 
fs.write-file-sync "all.csv", ret
