#!/bin/bash
echo "Остановка сервера..."
pm2 stop escort-server

echo "Запуск сервера вручную для проверки ошибок..."
cd /root/escort/server
node dist/index.js
