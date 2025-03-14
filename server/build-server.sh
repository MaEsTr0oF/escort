#!/bin/bash

echo "Комплексное решение проблемы сервера..."

# Переходим в директорию сервера
cd /root/escort/server

# Проверяем структуру директорий
echo "Проверка структуры директорий..."
ls -la

# Проверяем файлы исходного кода
echo "Проверка src директории..."
ls -la src

# Устанавливаем зависимости, если нужно
echo "Проверка node_modules..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
  echo "Устанавливаем зависимости..."
  npm install
fi

# Собираем проект заново
echo "Компиляция проекта..."
npm run build

# Проверяем результат сборки
echo "Проверка собранных файлов..."
ls -la build

# Запускаем сервер в ручном режиме для тестирования
echo "Запускаем сервер напрямую для проверки..."
NODE_ENV=production PORT=3001 node build/index.js &
SERVER_PID=$!

# Ждем пару секунд для запуска сервера
sleep 5

# Проверяем, работает ли сервер
echo "Проверка доступности сервера..."
curl -v http://localhost:3001/cities

# Останавливаем ручной запуск сервера
kill $SERVER_PID

# Запускаем через PM2
echo "Запускаем сервер через PM2..."
pm2 delete escort-server 2>/dev/null || true
pm2 start build/index.js --name escort-server -- --port 3001
pm2 save

echo "Сервер запущен!"
