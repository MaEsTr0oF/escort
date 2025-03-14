#!/bin/bash

echo "=== Статус PM2 процессов ==="
pm2 list

echo -e "\n=== Проверка прослушиваемых портов ==="
netstat -tulpn | grep 3001

echo -e "\n=== Логи Nginx ==="
tail -n 50 /var/log/nginx/error.log

echo -e "\n=== Логи сервера ==="
pm2 logs escort-server --lines 30 --nostream
