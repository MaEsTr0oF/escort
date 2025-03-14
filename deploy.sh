#!/bin/bash

# Функция для логирования
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Функция для проверки ошибок
check_error() {
    if [ $? -ne 0 ]; then
        log "❌ $1"
        exit 1
    fi
}

# Начало деплоя
log "🚀 Начало процесса деплоя"

# Проверка наличия необходимых директорий
if [ ! -d "~/escort" ]; then
    log "❌ Директория ~/escort не найдена"
    exit 1
fi

# Остановка текущего процесса
log "📥 Остановка текущего процесса"
pm2 stop escort-api || true
check_error "Ошибка при остановке текущего процесса"

# Сборка клиентской части
log "🏗️ Сборка клиентской части"
cd ~/escort/client
check_error "Ошибка при переходе в директорию client"

# Очистка node_modules и package-lock.json
log "🧹 Очистка зависимостей"
rm -rf node_modules package-lock.json
check_error "Ошибка при очистке зависимостей"

# Установка зависимостей
log "📦 Установка зависимостей"
npm install
check_error "Ошибка при установке зависимостей"

# Сборка
npm run build
check_error "Ошибка при сборке клиента"

# Копирование собранной клиентской части
log "📋 Копирование собранных файлов"
mkdir -p ~/escort/server/public
check_error "Ошибка при создании директории public"
cp -r build/* ~/escort/server/public/
check_error "Ошибка при копировании файлов"

# Сборка серверной части
log "🏗️ Настройка сервера"
cd ~/escort/server
check_error "Ошибка при переходе в директорию server"

# Очистка node_modules и package-lock.json
log "🧹 Очистка зависимостей"
rm -rf node_modules package-lock.json
check_error "Ошибка при очистке зависимостей"

# Установка зависимостей
log "📦 Установка зависимостей"
npm install
check_error "Ошибка при установке зависимостей"

# Сборка
npm run build
check_error "Ошибка при сборке сервера"

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
for i in {1..3}; do
    if curl -s "http://localhost:5001/api/health" > /dev/null; then
        log "✅ Деплой успешно завершен"
        exit 0
    fi
    log "⚠️ Попытка $i: Сервер не отвечает, ожидание..."
    sleep 2
done

log "❌ Сервер не отвечает после всех попыток"
pm2 logs escort-api --lines 20
exit 1
