#!/bin/bash
echo "=== Логи сервера ==="
pm2 logs escort-server --lines 50

echo -e "\n=== Логи Nginx (error) ==="
tail -n 50 /var/log/nginx/escort.error.log

echo -e "\n=== Логи Nginx (access) ==="
tail -n 20 /var/log/nginx/escort.access.log
