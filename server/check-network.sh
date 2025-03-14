#!/bin/bash

echo "=== Проверка брандмауэра ==="
ufw status

echo -e "\n=== Проверка соединения с localhost ==="
nc -v -z localhost 3001

echo -e "\n=== Проверка локального соединения ==="
curl -v http://127.0.0.1:3001/cities

echo -e "\n=== Проверка DNS ==="
host eskortvsegorodarfreal.site

echo -e "\n=== Разрешение имен через Nginx ==="
grep -r "127.0.0.1" /etc/nginx/

echo -e "\n=== Временное отключение брандмауэра для тестирования ==="
ufw status | grep active && echo "Рекомендуется: ufw disable"
