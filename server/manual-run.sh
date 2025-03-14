#!/bin/bash

echo "=== Переход в директорию сервера ==="
cd /root/escort/server

echo "=== Проверка node_modules ==="
if [ ! -d "node_modules" ]; then
  echo "Установка зависимостей..."
  npm install
fi

echo "=== Компиляция сервера ==="
npm run build

echo "=== Запуск сервера в фоновом режиме ==="
node build/index.js > server.log 2>&1 &
echo $! > server.pid

echo "Сервер запущен с PID: $(cat server.pid)"

echo "=== Подождем 5 секунд для запуска сервера ==="
sleep 5

echo "=== Проверка доступности сервера напрямую ==="
curl -v http://localhost:3001/cities

echo "=== Проверка логов сервера ==="
tail -n 20 server.log
