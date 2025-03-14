#!/bin/bash

# Функция для логирования
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Начало деплоя
log "🚀 Начало процесса деплоя"

# Остановка текущего процесса
log "📥 Остановка текущего процесса"
pm2 stop escort-api || true

# Сборка клиентской части
log "🏗️ Сборка клиентской части"
cd ~/escort/client
npm run build
check_error="$?"
if [ $check_error -ne 0 ]; then
    log "❌ Ошибка при сборке клиента"
    exit 1
fi

# Копирование собранной клиентской части
log "📋 Копирование собранных файлов"
mkdir -p ~/escort/server/public
cp -r build/* ~/escort/server/public/

# Сборка серверной части
log "🏗️ Настройка сервера"
cd ~/escort/server
npm run build
check_error="$?"
if [ $check_error -ne 0 ]; then
    log "❌ Ошибка при сборке сервера"
    exit 1
fi

# Запуск сервера через PM2
log "🚀 Запуск сервера"
pm2 start build/index.js --name "escort-api" --env production
check_error="$?"
if [ $check_error -ne 0 ]; then
    log "❌ Ошибка при запуске сервера"
    exit 1
fi

# Сохранение конфигурации PM2
log "💾 Сохранение конфигурации PM2"
pm2 save

# Проверка работоспособности сервера
log "🔍 Проверка работоспособности сервера"
sleep 3
if ! curl -s "http://localhost:5001/api/health" > /dev/null; then
    log "⚠️ Сервер не отвечает на проверку работоспособности"
    pm2 logs escort-api --lines 20
else
    log "✅ Деплой успешно завершен"
fi
