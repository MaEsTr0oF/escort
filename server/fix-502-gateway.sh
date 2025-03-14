#!/bin/bash

echo "=== Проверка статуса сервера и Nginx ==="

echo -e "\n=== Статус Nginx ==="
systemctl status nginx

echo -e "\n=== Проверка конфигурации Nginx ==="
nginx -t

echo -e "\n=== Проверка запущенных процессов PM2 ==="
pm2 list

echo -e "\n=== Проверка занятости порта 3001 ==="
netstat -tulpn | grep 3001

echo -e "\n=== Проверка логов сервера ==="
tail -n 50 ~/.pm2/logs/escort-server-error.log
