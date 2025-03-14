#!/bin/bash

echo "Полное исправление Nginx конфигурации..."

# Создаем новый конфигурационный файл
cat > /etc/nginx/sites-available/escort << 'END'
server {
    listen 80;
    server_name eskortvsegorodarfreal.site www.eskortvsegorodarfreal.site;

    # Корневая директория для статических файлов
    root /var/www/html/escort;
    index index.html index.htm;

    # Подробное логирование
    access_log /var/log/nginx/escort-access.log;
    error_log /var/log/nginx/escort-error.log debug;

    # Настройка для API запросов
    location /api/ {
        # Удаляем префикс /api/ из URL
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

# Удаляем старые конфиги и активируем новый
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/escort /etc/nginx/sites-enabled/

# Проверяем конфигурацию
echo "Проверка конфигурации Nginx..."
nginx -t

# Перезапускаем Nginx
echo "Перезапуск Nginx..."
systemctl restart nginx

echo "Проверяем доступность фронтенда..."
curl -I http://localhost

echo "Проверяем доступность API через Nginx..."
curl -I http://localhost/api/cities

echo "Готово! Nginx конфигурация обновлена."
