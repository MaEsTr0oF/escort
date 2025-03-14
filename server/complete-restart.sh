#!/bin/bash

echo "=== КОМПЛЕКСНЫЙ ПЕРЕЗАПУСК ВСЕЙ СИСТЕМЫ ==="

echo "1. Остановка всех процессов..."
pm2 stop all
pkill -f "node simple-server.js" || true
pkill -f "node build/index.js" || true
pkill -f "node /root/escort/server" || true

echo "2. Проверка, что порт 3001 свободен..."
netstat -tulpn | grep 3001 || echo "Порт 3001 свободен"

echo "3. Правильная конфигурация Nginx..."
cat > /etc/nginx/sites-available/escort << 'END'
server {
    listen 80;
    server_name eskortvsegorodarfreal.site www.eskortvsegorodarfreal.site localhost;

    # Корневая директория для статических файлов
    root /var/www/html/escort;
    index index.html;

    # Настройка логов
    access_log /var/log/nginx/escort-access.log;
    error_log /var/log/nginx/escort-error.log debug;

    # Проксирование только API запросов
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
    }

    # Все остальные запросы - статические файлы
    location / {
        try_files $uri $uri/ /index.html;
    }
}
END

echo "4. Активация новой конфигурации Nginx..."
rm -f /etc/nginx/sites-enabled/*
ln -sf /etc/nginx/sites-available/escort /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

echo "5. Создание тестовой HTML-страницы..."
mkdir -p /var/www/html/escort
cat > /var/www/html/escort/test-api.html << 'END'
<!DOCTYPE html>
<html>
<head>
    <title>API Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        button { padding: 10px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        #result { background: #f1f1f1; padding: 10px; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>Тест API</h1>
    <button id="testButton">Проверить API /cities</button>
    <div id="result">Результат будет здесь...</div>

    <script>
        document.getElementById('testButton').addEventListener('click', async () => {
            const resultDiv = document.getElementById('result');
            resultDiv.textContent = 'Загрузка...';
            
            try {
                const response = await fetch('/api/cities');
                if (!response.ok) {
                    throw new Error(`HTTP ошибка: ${response.status}`);
                }
                const data = await response.json();
                resultDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                resultDiv.textContent = 'Ошибка: ' + error.message;
                console.error(error);
            }
        });
    </script>
</body>
</html>
END

echo "6. Настройка прав доступа..."
chmod -R 755 /var/www/html/escort
chown -R www-data:www-data /var/www/html/escort

echo "7. Запуск основного сервера из билда..."
cd /root/escort/server
pm2 start build/index.js --name escort-server -- --port 3001
pm2 save

echo "8. Проверка статуса..."
pm2 list
sleep 2  # Даем серверу время на запуск

echo "9. Проверка доступности API напрямую..."
curl -s http://localhost:3001/cities | head -20

echo -e "\n=== ПЕРЕЗАПУСК ЗАВЕРШЕН ===="
echo "Теперь откройте в браузере: http://eskortvsegorodarfreal.site/test-api.html"
echo "И нажмите на кнопку для тестирования API"
