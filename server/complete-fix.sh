#!/bin/bash

echo "=== Комплексная диагностика и исправление сервера ==="

# Проверка занятости портов
echo -e "\n=== Проверка занятости порта 3001 ==="
netstat -tulpn | grep 3001

# Остановка всех процессов
echo -e "\n=== Остановка всех процессов PM2 ==="
pm2 stop all

# Остановка и проверка всех процессов node
echo -e "\n=== Проверка и остановка всех процессов node ==="
pkill -f node || true
sleep 2
ps aux | grep node

# Создаем тестовый скрипт для проверки работы сервера
echo -e "\n=== Создание тестового сервера ==="
cat > /root/escort/server/test-server.js << 'END'
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Test server is running' });
});

app.get('/cities', (req, res) => {
  res.json([{ id: 1, name: 'Москва' }, { id: 2, name: 'Санкт-Петербург' }]);
});

app.listen(3001, '0.0.0.0', () => {
  console.log('Test server running on port 3001');
});
END

# Запуск тестового сервера
echo -e "\n=== Запуск тестового сервера ==="
cd /root/escort/server
node test-server.js &
TEST_SERVER_PID=$!
sleep 3

# Проверка доступности сервера
echo -e "\n=== Проверка доступности тестового сервера ==="
curl -s http://localhost:3001/
curl -s http://localhost:3001/cities

# Проверка доступности через curl с заголовком хоста
echo -e "\n=== Проверка доступности с заголовком хоста ==="
curl -s -H "Host: eskortvsegorodarfreal.site" http://localhost:3001/

# Создаем новую конфигурацию Nginx
echo -e "\n=== Создаем новую конфигурацию Nginx ==="
cat > /etc/nginx/sites-available/escort << 'END'
server {
    listen 80;
    server_name eskortvsegorodarfreal.site www.eskortvsegorodarfreal.site;

    root /var/www/html/escort;
    index index.html;

    # Логи с более подробной информацией
    access_log /var/log/nginx/escort.access.log;
    error_log /var/log/nginx/escort.error.log debug;

    # Тестовый маршрут для проверки сервера
    location = /test-server {
        proxy_pass http://127.0.0.1:3001/;
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

    # API маршруты (важно: убираем слеш в конце proxy_pass)
    location /api/ {
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

    # Статические файлы
    location / {
        try_files $uri $uri/ /index.html;
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

# Проверяем доступность через Nginx
echo -e "\n=== Проверяем доступность через Nginx ==="
curl -s http://localhost/test-server

# Останавливаем тестовый сервер
echo -e "\n=== Останавливаем тестовый сервер ==="
kill $TEST_SERVER_PID
sleep 2

# Создаем тестовую HTML страницу для проверки API
echo -e "\n=== Создаем тестовую HTML страницу ==="
mkdir -p /var/www/html/escort
cat > /var/www/html/escort/api-test.html << 'END'
<!DOCTYPE html>
<html>
<head>
    <title>Тест API</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        button { padding: 10px; margin: 5px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        pre { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; white-space: pre-wrap; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>Тест API</h1>
    <div>
        <button id="testServer">Прямой запрос к серверу</button>
        <button id="testApi">Запрос через /api</button>
        <button id="testCities">Получить города</button>
    </div>
    
    <h2>Результат:</h2>
    <pre id="result">Нажмите на кнопку для проверки...</pre>
    
    <h2>Информация о системе:</h2>
    <pre id="info"></pre>

    <script>
        // Вывод информации о текущей странице
        document.getElementById('info').textContent = `URL: ${window.location.href}
Хост: ${window.location.host}
User Agent: ${navigator.userAgent}
Время: ${new Date().toISOString()}`;
        
        // Функция для отправки запроса
        async function sendRequest(url) {
            const resultElement = document.getElementById('result');
            resultElement.textContent = `Отправка запроса на ${url}...`;
            resultElement.className = '';
            
            try {
                const startTime = new Date();
                const response = await fetch(url);
                const endTime = new Date();
                const responseTime = endTime - startTime;
                
                try {
                    const data = await response.json();
                    resultElement.textContent = `Статус: ${response.status} ${response.statusText}
Время ответа: ${responseTime}ms
Данные: ${JSON.stringify(data, null, 2)}`;
                } catch (e) {
                    const text = await response.text();
                    resultElement.textContent = `Статус: ${response.status} ${response.statusText}
Время ответа: ${responseTime}ms
Ответ не является JSON:
${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`;
                }
            } catch (error) {
                resultElement.className = 'error';
                resultElement.textContent = `Ошибка: ${error.message}`;
                console.error(error);
            }
        }
        
        // Привязываем обработчики событий
        document.getElementById('testServer').addEventListener('click', () => {
            sendRequest('/test-server');
        });
        
        document.getElementById('testApi').addEventListener('click', () => {
            sendRequest('/api');
        });
        
        document.getElementById('testCities').addEventListener('click', () => {
            sendRequest('/api/cities');
        });
    </script>
</body>
</html>
END

# Устанавливаем права
chmod 644 /var/www/html/escort/api-test.html
chown www-data:www-data /var/www/html/escort/api-test.html

# Подготовка и запуск основного сервера
echo -e "\n=== Запуск основного сервера ==="

# Сначала проверяем исходный код сервера
echo -e "\n=== Проверка наличия важных компонентов сервера ==="
cd /root/escort/server
find build -type f -name "*.js" | grep -E 'index|route|city|profile|auth'

# Проверяем package.json
grep -E "start|build" package.json

# Запускаем сервер через PM2
echo -e "\n=== Запуск сервера через PM2 ==="
cd /root/escort/server
pm2 start build/index.js --name escort-server -- --port 3001
pm2 save

# Ожидаем запуска сервера
sleep 5

# Проверяем, запущен ли сервер
echo -e "\n=== Проверка статуса сервера ==="
pm2 list

# Проверяем доступность сервера локально
echo -e "\n=== Проверка доступности сервера локально ==="
curl -s http://localhost:3001/cities || echo "Локальный сервер недоступен"

# Создаем простой скрипт для мониторинга логов
echo -e "\n=== Создание скрипта для мониторинга логов ==="
cat > /root/escort/server/check-logs.sh << 'END'
#!/bin/bash
echo "=== Логи сервера ==="
pm2 logs escort-server --lines 50

echo -e "\n=== Логи Nginx (error) ==="
tail -n 50 /var/log/nginx/escort.error.log

echo -e "\n=== Логи Nginx (access) ==="
tail -n 20 /var/log/nginx/escort.access.log
END
chmod +x /root/escort/server/check-logs.sh

echo -e "\n=== Готово! ==="
echo "1. Проверьте работу API через тестовую страницу: http://eskortvsegorodarfreal.site/api-test.html"
echo "2. Если возникнут проблемы, проверьте логи с помощью команды: /root/escort/server/check-logs.sh"
echo "3. Попробуйте прямой запрос к API: curl -v http://localhost:3001/cities"
echo ""
echo "Если сервер продолжает возвращать 502 ошибку, возможно потребуется:"
echo "- Проверить файрвол: ufw status"
echo "- Проверить, запущен ли сервер на всех интерфейсах (а не только localhost)"
echo "- Проверить порты: netstat -tulpn | grep 3001"
