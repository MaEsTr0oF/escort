#!/bin/bash

echo "=== ОКОНЧАТЕЛЬНОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМЫ ==="

# 1. Останавливаем все процессы
echo "Останавливаем все процессы..."
pm2 stop all
pkill -f "node simple-server.js" || true
pkill -f "node build/index.js" || true

# 2. Создаем единую конфигурацию Nginx для домена
echo "Создаем правильную конфигурацию Nginx..."
cat > /etc/nginx/sites-available/escort << 'END'
server {
    listen 80;
    server_name eskortvsegorodarfreal.site www.eskortvsegorodarfreal.site;

    # Корневая директория для статических файлов
    root /var/www/html/escort;
    index index.html;

    # Подробное логирование
    access_log /var/log/nginx/escort-access.log;
    error_log /var/log/nginx/escort-error.log;

    # Проксирование API запросов
    location /api/ {
        # Удаляем префикс /api/
        rewrite ^/api/(.*) /$1 break;
        
        # Проксируем запросы на бэкенд
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Увеличиваем таймауты
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;
    }

    # Обработка остальных запросов (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
END

# 3. Удаляем старые и активируем новую конфигурацию
echo "Активируем конфигурацию..."
rm -f /etc/nginx/sites-enabled/*
ln -sf /etc/nginx/sites-available/escort /etc/nginx/sites-enabled/

# 4. Проверяем и перезапускаем Nginx
echo "Перезапускаем Nginx..."
nginx -t
systemctl restart nginx

# 5. Запускаем сервер через PM2
echo "Запускаем сервер через PM2..."
cd /root/escort/server
pm2 start build/index.js --name escort-server -- --port 3001
pm2 save

# 6. Проверяем результат
echo "Проверка доступности API..."
curl -s http://localhost:3001/cities
echo -e "\nПроверка через Nginx:"
curl -s http://localhost/api/cities

echo -e "\n=== ГОТОВО! Теперь браузер должен корректно работать с API ==="
echo "Проверьте в браузере: http://eskortvsegorodarfreal.site/api/cities"
