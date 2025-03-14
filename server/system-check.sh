#!/bin/bash

echo "===== ПРОВЕРКА ВСЕЙ СИСТЕМЫ ====="

echo -e "\n==== 1. Проверка статуса PM2 процессов ===="
pm2 list

echo -e "\n==== 2. Проверка прослушиваемых портов ===="
netstat -tulpn | grep 3001

echo -e "\n==== 3. Проверка статуса Nginx ===="
systemctl status nginx

echo -e "\n==== 4. Проверка доступности API напрямую ===="
curl -s http://localhost:3001/cities | head -20

echo -e "\n==== 5. Проверка доступности API через Nginx ===="
curl -s http://localhost/api/cities | head -20

echo -e "\n==== 6. Проверка Nginx логов ===="
echo "Последние ошибки:"
tail -n 10 /var/log/nginx/escort-error.log

echo -e "\n===== ПРОВЕРКА ЗАВЕРШЕНА ====="
echo "Если все тесты прошли успешно, система должна работать корректно!"
