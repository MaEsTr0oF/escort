#!/bin/bash

# Функция для логирования
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Функция для проверки ошибок
check_error() {
    if [ $? -ne 0 ]; then
        log "❌ Ошибка: $1"
        exit 1
    fi
}

# Начало деплоя
log "🚀 Начало процесса деплоя"

# Остановка текущего процесса
log "📥 Остановка текущего процесса"
pm2 stop escort-api || true

# Очистка папки public
log "🗑️ Очистка папки public"
rm -rf server/public/*
check_error "Не удалось очистить папку public"

# Сборка клиентской части
log "🏗️ Сборка клиентской части"
cd client
npm ci --production
check_error "Ошибка при установке зависимостей клиента"

npm run build
check_error "Ошибка при сборке клиента"

# Копирование собранной клиентской части
log "📋 Копирование собранных файлов"
mkdir -p ../server/public
cp -r build/* ../server/public/
check_error "Ошибка при копировании файлов клиента"

# Установка зависимостей сервера и сборка
log "🏗️ Настройка сервера"
cd ../server
npm ci --production
check_error "Ошибка при установке зависимостей сервера"

npm run build
check_error "Ошибка при сборке сервера"

# Копирование production-конфигурации
log "⚙️ Настройка конфигурации"
cp .env.production .env
check_error "Ошибка при копировании конфигурации"

# Применение миграций к базе данных
log "🔄 Применение миграций"
npx prisma migrate deploy
check_error "Ошибка при применении миграций"

npx prisma generate
check_error "Ошибка при генерации Prisma Client"

# Запуск сервера через PM2
log "🚀 Запуск сервера"
pm2 start build/index.js --name "escort-api" --env production
check_error "Ошибка при запуске сервера"

pm2 save
check_error "Ошибка при сохранении конфигурации PM2"

log "✅ Деплой успешно завершен" 