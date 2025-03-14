#!/bin/bash

echo "=== Текущая конфигурация Nginx ==="
cat /etc/nginx/sites-enabled/escort

echo -e "\n=== Создание тестовой конфигурации Nginx ==="
cat > /etc/nginx/sites-available/escort-test << 'END'
server {
    listen 80;
    server_name eskortvsegorodarfreal.site www.eskortvsegorodarfreal.site;

    # Корневая директория для статических файлов
    root /var/www/html/escort;
    index index.html index.htm;

    # Подробное логирование
    access_log /var/log/nginx/escort-access.log;
    error_log /var/log/nginx/escort-error.log debug;

    # Тестовый маршрут для проверки
    location = /test {
        add_header Content-Type text/plain;
        return 200 "Nginx config works!";
    }

    # Проксирование всех запросов к API
    location / {
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
}
END

echo -e "\n=== Проверка синтаксиса Nginx ==="
nginx -t

echo -e "\n=== Активация тестовой конфигурации ==="
ln -sf /etc/nginx/sites-available/escort-test /etc/nginx/sites-enabled/escort
systemctl restart nginx

echo -e "\n=== Проверка Nginx ==="
curl -v http://localhost/test

echo -e "\n=== Проверка прямого доступа к API через Nginx ==="
curl -v http://localhost/cities
