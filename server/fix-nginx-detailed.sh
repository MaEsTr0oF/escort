#!/bin/bash

echo "Создание новой конфигурации Nginx с подробным логированием..."

cat > /etc/nginx/sites-available/escort << 'END'
server {
    listen 80;
    server_name eskortvsegorodarfreal.site www.eskortvsegorodarfreal.site;

    # Корневая директория для статических файлов
    root /var/www/html/escort;
    index index.html index.htm;

    # Настройка для API запросов - исправленная конфигурация
    location /api/ {
        # Активируем подробное логирование
        error_log /var/log/nginx/api-error.log debug;
        access_log /var/log/nginx/api-access.log;
        
        # Удаляем префикс /api/ из URL
        rewrite ^/api/(.*) /$1 break;
        
        # Проксируем запросы на бэкенд
        proxy_pass http://localhost:3001;
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

    # Основные логи
    access_log /var/log/nginx/escort-access.log;
    error_log /var/log/nginx/escort-error.log;
}
END

# Создаем символическую ссылку и удаляем другие конфиги, если они есть
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/escort /etc/nginx/sites-enabled/

# Проверяем конфигурацию
echo "Проверка конфигурации Nginx..."
nginx -t

echo "Перезапуск Nginx..."
systemctl restart nginx

echo "Готово! Конфигурация Nginx обновлена."
