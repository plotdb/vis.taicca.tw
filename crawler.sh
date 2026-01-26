#!/usr/bin/env bash
echo "[tfi-data] fetch and rebuild ..."
cd /home/crawler/workspace/tfi-data
npm run all 2>&1 > /var/log/crawler/$(date -I).log
echo "[tfi-data] pull remote commits ..."
git pull --rebase 2>&1 >> /var/log/crawler/$(date -I).log
echo "[tfi-data] commit and push ..."
git add . 2>&1 >> /var/log/crawler/$(date -I).log
git commit -m "update data" 2>&1 >> /var/log/crawler/$(date -I).log
git push 2>&1 >> /var/log/crawler/$(date -I).log
cd /home/crawler/workspace/taicca-vis2
echo "[vis.taicca.tw] pull remote commits ..."
git pull --rebase 2>&1 >> /var/log/crawler/$(date -I).log
echo "[vis.taicca.tw] update submodule ..."
git submodule update --remote >> /var/log/crawler/$(date -I).log
git add . 2>&1 >> /var/log/crawler/$(date -I).log
git commit -m "update submodule" 2>&1 >> /var/log/crawler/$(date -I).log
git push 2>&1 >> /var/log/crawler/$(date -I).log
echo "[vis.taicca.tw] deploy ..."
./deploy >> /var/log/crawler/$(date -I).log
