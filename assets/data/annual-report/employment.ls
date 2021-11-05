require! <[fs papaparse]>
ret = papaparse.parse(fs.read-file-sync \employment.csv .toString!)

cats = [
 '出版',
 '影片服務、聲音錄製及音樂出版',
 '傳播及節目播送',
 '廣告業及市場研究',
 '專門設計服務',
 '創作及ˊ藝術表演',
 '運動、娛樂及休閒服務',
 '文創產業總就業人數',
 '我國服務業就業人數',
 '我國總就業人數',
]

list = ret.data.splice 3
list.splice list.length - 1, 1
label = list.map -> +it.0
label.sort (a,b) -> a - b


hash = {}
for j from cats.length - 1 to 0 by -1 =>
  c = cats[j]
  hash[c] = []
  for i from label.length - 1 to 0 by -1 =>
    v = list[i][j + 1]
    v = if !v => '-' else +v
    if isNaN(v) => v = '-'
    hash[c].push v
hash2 = {}


h2labels = <[文創產業總就業人數 我國服務業就業人數 我國總就業人數]>
for i from 0 til h2labels.length =>
  k = h2labels[i]
  hash2[k] = hash[k]
  if i > 0 => hash2[k] = hash2[k].map -> it * 1000
  delete hash[k]

output1 = do
  label: label
  attr:
    "文創產業別": hash
output2 = do
  label: label
  attr:
    "總就業人數比": hash2

fs.write-file-sync "employment1.json", JSON.stringify(output1)
fs.write-file-sync "employment2.json", JSON.stringify(output2)
