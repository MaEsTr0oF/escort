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

# Проверка наличия необходимых инструментов
check_requirements() {
    log "🔍 Проверка необходимых инструментов"
    
    # Проверка Node.js
    if ! command -v node &> /dev/null; then
        log "❌ Node.js не установлен"
        exit 1
    fi
    
    # Проверка npm
    if ! command -v npm &> /dev/null; then
        log "❌ npm не установлен"
        exit 1
    fi
    
    # Проверка PM2
    if ! command -v pm2 &> /dev/null; then
        log "❌ PM2 не установлен"
        exit 1
    fi
    
    # Проверка curl
    if ! command -v curl &> /dev/null; then
        log "❌ curl не установлен"
        exit 1
    fi
    
    log "✅ Все необходимые инструменты установлены"
}

# Начало деплоя
log "🚀 Начало процесса деплоя"

# Проверка инструментов
check_requirements

# Проверка наличия необходимых директорий
if [ ! -d ~/escort ]; then
    log "❌ Директория ~/escort не найдена"
    exit 1
fi

# Остановка всех запущенных процессов для этого приложения
log "📥 Остановка всех текущих процессов"
pm2 stop escort-api || true
pm2 stop escort-server || true
pm2 delete escort-api || true
pm2 delete escort-server || true
log "✅ Все процессы остановлены"

# Добавляем временную метку для предотвращения кеширования
TIMESTAMP=$(date +%s)
log "🔄 Временная метка для сборки: $TIMESTAMP"

# Обновление файла reset.css с новой версией
log "🔄 Обновление метаданных для сброса кеша"
echo "/* Версия автоматически обновлена: $(date) */" > ~/escort/client/public/reset.css
echo "/* TIMESTAMP: $TIMESTAMP */" >> ~/escort/client/public/reset.css

# Создание новой версии index.html с временной меткой
log "🔄 Обновление версии в index.html"
# Вместо использования sed, создаем временный файл и заменяем оригинал
cp ~/escort/client/public/index.html ~/escort/client/public/index.html.bak

# Безопасное обновление версий в HTML-файле с помощью awk
# Это гарантирует, что мы не повредим структуру HTML
awk -v timestamp="$TIMESTAMP" '{
    # Замена content="число" на content="таймстамп" в мета-тегах
    gsub(/content="[0-9]+"/, "content=\"" timestamp "\"");
    
    # Замена v=число на v=таймстамп в URL
    gsub(/v=[0-9]+/, "v=" timestamp);
    
    print;
}' ~/escort/client/public/index.html.bak > ~/escort/client/public/index.html

# Проверка успешности операции
if [ $? -ne 0 ]; then
    log "❌ Ошибка при обновлении файла index.html"
    mv ~/escort/client/public/index.html.bak ~/escort/client/public/index.html
    exit 1
fi

rm ~/escort/client/public/index.html.bak

# Сборка клиентской части
log "🏗️ Сборка клиентской части"
cd ~/escort/client
check_error "Ошибка при переходе в директорию client"

# Полная очистка директории
log "🧹 Полная очистка предыдущей сборки"
rm -rf build
rm -rf node_modules
rm -f package-lock.json
check_error "Ошибка при очистке директорий клиента"

# Установка зависимостей
log "📦 Установка зависимостей"
npm install
check_error "Ошибка при установке зависимостей"

# Сборка с новой временной меткой
log "🏗️ Сборка клиента с временной меткой: $TIMESTAMP"
REACT_APP_VERSION=$TIMESTAMP npm run build
check_error "Ошибка при сборке клиента"

# Проверка сборки
if [ ! -d "build" ] || [ ! -f "build/index.html" ]; then
    log "❌ Ошибка: директория build или build/index.html не существует"
    exit 1
fi

# Копирование собранной клиентской части
log "📋 Копирование собранных файлов"
rm -rf ~/escort/server/public/*
check_error "Ошибка при очистке директории public"

mkdir -p ~/escort/server/public
check_error "Ошибка при создании директории public"

cp -r build/* ~/escort/server/public/
check_error "Ошибка при копировании файлов"

# Проверка копирования
if [ ! -f ~/escort/server/public/index.html ]; then
    log "❌ Ошибка: файл index.html не скопирован"
    exit 1
fi

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
log "🏗️ Сборка сервера"
npm run build
check_error "Ошибка при сборке сервера"

# Проверка и настройка порта
PORT=3001
log "🔍 Проверка доступности порта $PORT"
if lsof -i:$PORT -t &> /dev/null; then
    log "⚠️ Порт $PORT занят, удаляем процесс"
    kill -9 $(lsof -i:$PORT -t) || true
    sleep 2
fi

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
    if curl -s "http://localhost:3001/api/health" > /dev/null; then
        log "✅ Деплой успешно завершен"
        exit 0
    fi
    log "⚠️ Попытка $i: Сервер не отвечает, ожидание..."
    sleep 2
done

# Если мы дошли до этой точки, сервер не отвечает
log "❌ Сервер не отвечает после всех попыток"
pm2 logs escort-api --lines 20
exit 1
