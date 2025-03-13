#!/bin/bash

# Остановка текущего процесса, если он запущен
pm2 stop escort-api || true

# Сборка клиентской части
cd client
npm install
npm run build

# Копирование собранной клиентской части в папку public на сервере
mkdir -p ../server/public
cp -r build/* ../server/public/

# Установка зависимостей сервера и сборка
cd ../server
npm install
npm run build

# Копирование production-конфигурации
cp .env.production .env

# Применение миграций к базе данных
npx prisma migrate deploy
npx prisma generate

# Запуск сервера через PM2
pm2 start build/index.js --name "escort-api" 