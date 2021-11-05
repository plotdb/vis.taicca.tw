require! <[fs]>

units = do
  "家數": "家"
  "營業額": "千元新臺幣"
  "外銷收入": "千元新臺幣"
  "內銷收入": "千元新臺幣"
  "外銷額": "千元新臺幣"
  "內銷額": "千元新臺幣"
  "營業額占GDP比重": "%"
  "外銷收入占比": "%"
  "平均每家營業額": "千元新臺幣"
  "人數": "人"


out = {}
namemap = <[成立年數 資本額 縣市 產業別 產業別(僅就業人數) 總體(僅就業人數)]>
<[age capital county industry employment1 employment2]>.map (d,i) ->

  out[namemap[i]] = json = JSON.parse(fs.read-file-sync "#d.json" .toString!)
  
  ret = {attr: {}}
  ret.label = json.label
  for k,v of json.attr =>
    nk = k.replace('(仟元)','').replace("GDP","ＧＤＰ")
    ret.attr[nk] = {data: json.attr[k], unit: units[nk]}
  out[namemap[i]] = ret
fs.write-file-sync 'cat6.json', JSON.stringify(out)
