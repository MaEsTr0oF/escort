#!/bin/bash

echo "=== Проверка логов сервера на наличие ошибок ==="
cd /root/escort/server
tail -n 50 ~/.pm2/logs/escort-server-error.log

echo -e "\n=== Проверка структуры контроллера профилей ==="
cat build/controllers/profileController.js | grep -A 20 "createProfile"
