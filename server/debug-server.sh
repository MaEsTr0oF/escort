#!/bin/bash

echo "Останавливаем текущий процесс сервера..."
pm2 stop escort-server

echo "Проверяем .env файл сервера..."
cat /root/escort/server/.env.local
echo -e "\n"

echo "Запускаем сервер в режиме отладки..."
cd /root/escort/server
NODE_ENV=development PORT=3001 node dist/index.js
