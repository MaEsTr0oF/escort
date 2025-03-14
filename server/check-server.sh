#!/bin/bash
echo "Проверка статуса сервера..."
pm2 status

echo -e "\nПроверка прослушиваемых портов..."
netstat -tulpn | grep 3001

echo -e "\nПроверка логов сервера..."
pm2 logs escort-server --lines 20

echo -e "\nПроверка настройки Nginx..."
cat /etc/nginx/sites-enabled/escort
