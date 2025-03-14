#!/bin/bash

echo "=== Обновление конфигурации Nginx и перезапуск сервера ==="

# Останавливаем все процессы PM2
echo -e "\n=== Останавливаем PM2 ==="
pm2 stop all

# Создаем новую конфигурацию Nginx
echo -e "\n=== Создаем новую конфигурацию Nginx ==="
cat > /etc/nginx/sites-available/escort << 'END'
server {
    listen 80;
    server_name eskortvsegorodarfreal.site www.eskortvsegorodarfreal.site;

    root /var/www/html/escort;
    index index.html;

    # Логи
    access_log /var/log/nginx/escort.access.log;
    error_log /var/log/nginx/escort.error.log debug;  # Включаем детальное логирование

    # Проверка работы backend
    location = /api-status {
        proxy_pass http://127.0.0.1:3001/status;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API маршруты
    location /api/ {
        proxy_pass http://127.0.0.1:3001/;  # Обратите внимание на слеш в конце
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Увеличиваем таймауты
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;
    }

    # Статические файлы
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Тестовая страница админки
    location /admin-test/ {
        alias /var/www/html/escort/admin-test/;
        try_files $uri $uri/ /admin-test/index.html;
    }

    # Явно запрещаем доступ к .git и другим системным директориям
    location ~ /\.(?!well-known).* {
        deny all;
        access_log off;
        log_not_found off;
    }
}
END

# Активируем конфигурацию и перезапускаем Nginx
echo -e "\n=== Активируем конфигурацию Nginx ==="
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/escort
ln -s /etc/nginx/sites-available/escort /etc/nginx/sites-enabled/

# Проверяем конфигурацию
echo -e "\n=== Проверяем конфигурацию Nginx ==="
nginx -t

# Перезапускаем Nginx
echo -e "\n=== Перезапускаем Nginx ==="
systemctl restart nginx

# Добавляем эндпоинт статуса в сервер
echo -e "\n=== Добавляем эндпоинт статуса в сервер ==="
cat > /root/escort/server/src/status-endpoint.js << 'END'
// Эндпоинт для проверки статуса сервера
app.get('/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    endpoints: [
      '/cities',
      '/profiles',
      '/admin/profiles',
      '/auth/login'
    ]
  });
});
END

# Добавляем эндпоинт статуса в index.js
echo -e "\n=== Добавляем эндпоинт статуса в index.js ==="
grep -q "/status" /root/escort/server/build/index.js
if [ $? -ne 0 ]; then
    # Маршрут не найден, добавляем его
    cat > /root/escort/server/src/add-status-patch.js << 'END'
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../build/index.js');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Добавляем эндпоинт статуса перед комментарием "// The 'catchall' handler"
const statusEndpoint = `
// Эндпоинт для проверки статуса сервера
app.get('/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    endpoints: [
      '/cities',
      '/profiles',
      '/admin/profiles',
      '/auth/login'
    ]
  });
});

`;

// Добавляем маршрут в файл
indexContent = indexContent.replace('// The \'catchall\' handler', statusEndpoint + '// The \'catchall\' handler');

fs.writeFileSync(indexPath, indexContent);
console.log('Эндпоинт статуса добавлен в index.js');
END

    cd /root/escort/server
    node src/add-status-patch.js
    echo "Эндпоинт статуса добавлен в index.js"
else
    echo "Эндпоинт статуса уже существует в index.js"
fi

# Перезапускаем сервер
echo -e "\n=== Перезапускаем сервер ==="
cd /root/escort/server
pm2 start build/index.js --name escort-server -- --port 3001
pm2 save

# Проверяем доступность эндпоинта статуса
echo -e "\n=== Проверяем доступность эндпоинта статуса ==="
sleep 2
curl -s http://localhost:3001/status

echo -e "\n=== Проверяем доступность эндпоинта статуса через Nginx ==="
curl -s http://localhost/api-status

echo -e "\n=== Создаем тестовый маршрут для проверки API ==="
mkdir -p /var/www/html/escort/test
cat > /var/www/html/escort/test/index.html << 'END'
<!DOCTYPE html>
<html>
<head>
    <title>Тест API</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        button { padding: 10px; background: #4CAF50; color: white; border: none; cursor: pointer; margin: 5px; }
        pre { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>Тест API</h1>
    <div>
        <button id="testStatus">Проверить статус</button>
        <button id="testCities">Получить города</button>
        <button id="testProfiles">Получить профили (требуется авторизация)</button>
    </div>
    <h2>Результат:</h2>
    <pre id="result">Нажмите на кнопку для проверки...</pre>

    <script>
        // Функция для выполнения запроса
        async function makeRequest(url, options = {}) {
            const resultElement = document.getElementById('result');
            resultElement.innerText = 'Загрузка...';
            
            try {
                // Добавляем токен авторизации, если он есть
                if (localStorage.getItem('adminToken') && options.auth !== false) {
                    options.headers = options.headers || {};
                    options.headers['Authorization'] = `Bearer ${localStorage.getItem('adminToken')}`;
                }
                
                const response = await fetch(url, options);
                const data = await response.json();
                
                resultElement.innerText = JSON.stringify(data, null, 2);
                return data;
            } catch (error) {
                resultElement.innerText = `Ошибка: ${error.message}`;
                console.error(error);
            }
        }
        
        // Привязываем обработчики событий
        document.getElementById('testStatus').addEventListener('click', () => {
            makeRequest('/api-status', { auth: false });
        });
        
        document.getElementById('testCities').addEventListener('click', () => {
            makeRequest('/api/cities', { auth: false });
        });
        
        document.getElementById('testProfiles').addEventListener('click', () => {
            makeRequest('/api/admin/profiles');
        });
    </script>
</body>
</html>
END

# Устанавливаем права доступа
chmod -R 755 /var/www/html/escort/test
chown -R www-data:www-data /var/www/html/escort/test

echo -e "\n=== Готово! ==="
echo "Проверьте доступность API по следующим URL:"
echo "- Статус сервера: http://eskortvsegorodarfreal.site/api-status"
echo "- Тестовая страница: http://eskortvsegorodarfreal.site/test/"
echo ""
echo "Если проблемы сохраняются, проверьте логи Nginx и сервера:"
echo "- Логи Nginx: tail -f /var/log/nginx/escort.error.log"
echo "- Логи сервера: pm2 logs escort-server"
