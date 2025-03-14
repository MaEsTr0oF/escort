#!/bin/bash

echo "=== Остановка PM2 и других процессов ==="
pm2 stop all
pkill -f "node build/index.js" || true

echo "=== Запуск простого тестового сервера ==="
node simple-server.js > simple-server.log 2>&1 &
echo $! > simple-server.pid

echo "Простой сервер запущен с PID: $(cat simple-server.pid)"

echo "=== Подождем 2 секунды ==="
sleep 2

echo "=== Прямая проверка простого сервера ==="
curl -v http://localhost:3001/cities

echo "=== Проверка через Nginx ==="
curl -v http://localhost/cities

echo "=== Проверка логов ==="
tail -n 10 simple-server.log
