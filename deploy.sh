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

# Проверка наличия необходимых инструментов
command -v pm2 >/dev/null 2>&1 || { log "❌ PM2 не установлен. Установите: npm install -g pm2"; exit 1; }
command -v npx >/dev/null 2>&1 || { log "❌ NPX не установлен. Установите Node.js"; exit 1; }

# Начало деплоя
log "🚀 Начало процесса деплоя"

# Проверка наличия .env.production
if [ ! -f "server/.env.production" ]; then
    log "❌ Файл server/.env.production не найден"
    exit 1
fi

# Остановка текущего процесса
log "📥 Остановка текущего процесса"
pm2 stop escort-api || true

# Очистка папки public
log "🗑️ Очистка папки public"
rm -rf server/public/*
check_error "Не удалось очистить папку public"

# Очистка npm кэша
log "🧹 Очистка npm кэша"
npm cache clean --force
check_error "Ошибка при очистке npm кэша"

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

# Проверка наличия переменных окружения
if ! grep -q "DATABASE_URL" .env; then
    log "❌ DATABASE_URL не найден в .env"
    exit 1
fi

if ! grep -q "JWT_SECRET" .env; then
    log "⚠️ JWT_SECRET не найден в .env, будет использовано значение по умолчанию"
fi

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

# Сохранение конфигурации PM2
log "💾 Сохранение конфигурации PM2"
pm2 save
check_error "Ошибка при сохранении конфигурации PM2"

# Проверка работоспособности сервера
log "🔍 Проверка работоспособности сервера"
sleep 5
if ! curl -s "http://localhost:5001/api/health" > /dev/null; then
    log "⚠️ Сервер не отвечает на проверку работоспособности"
    pm2 logs escort-api --lines 50
    exit 1
fi

log "✅ Деплой успешно завершен" 
