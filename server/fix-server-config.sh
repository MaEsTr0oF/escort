#!/bin/bash

echo "=== Исправление конфигурации сервера для работы со всеми интерфейсами ==="

# Создание простого сервера для тестирования
cat > /root/escort/server/simple-server.js << 'END'
const express = require('express');
const cors = require('cors');
const app = express();

// Разрешаем CORS для всех запросов
app.use(cors());
app.use(express.json());

// Логгирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({ message: 'API server is running', time: new Date().toISOString() });
});

// Маршрут для городов
app.get('/cities', (req, res) => {
  res.json([
    { id: 1, name: 'Москва' },
    { id: 2, name: 'Санкт-Петербург' }
  ]);
});

// Маршрут для профилей
app.get('/admin/profiles', (req, res) => {
  res.json([
    { id: 1, name: 'Анна', age: 25, cityId: 1, isActive: true, isVerified: true, phone: '+7 (999) 123-45-67' },
    { id: 2, name: 'Мария', age: 28, cityId: 2, isActive: true, isVerified: false, phone: '+7 (999) 765-43-21' }
  ]);
});

// Маршрут для проверки токена
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({ token: 'test-token-123456789' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Маршрут для создания профиля
app.post('/profiles', (req, res) => {
  console.log('Received profile data:', req.body);
  res.status(201).json({ id: 3, ...req.body });
});

// Маршрут для активации/деактивации профиля
app.patch('/admin/profiles/:id/toggle-active', (req, res) => {
  const id = parseInt(req.params.id);
  res.json({ id, isActive: true, message: 'Profile status toggled' });
});

// Маршрут для верификации профиля
app.patch('/admin/profiles/:id/verify', (req, res) => {
  const id = parseInt(req.params.id);
  res.json({ id, isVerified: true, message: 'Profile verified' });
});

// Обработка всех остальных маршрутов
app.use('*', (req, res) => {
  res.json({ message: `Endpoint ${req.originalUrl} received` });
});

// Запуск сервера на всех интерфейсах
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
END

# Остановка всех процессов PM2
echo -e "\n=== Остановка всех процессов PM2 ==="
pm2 stop all

# Запуск простого сервера через PM2
echo -e "\n=== Запуск простого сервера через PM2 ==="
cd /root/escort/server
pm2 start simple-server.js --name simple-server

# Ожидаем запуска сервера
sleep 3

# Проверяем статус
echo -e "\n=== Проверка статуса сервера ==="
pm2 list

# Проверяем доступность локально
echo -e "\n=== Проверка доступности локально ==="
curl -s http://localhost:3001/
curl -s http://localhost:3001/cities

# Создаем тестовую страницу для проверки API через браузер
echo -e "\n=== Создание тестовой страницы для браузера ==="
mkdir -p /var/www/html/escort
cat > /var/www/html/escort/test-api.html << 'END'
<!DOCTYPE html>
<html>
<head>
    <title>Проверка API</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        button { padding: 10px; margin: 5px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        pre { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; white-space: pre-wrap; }
        .error { color: red; }
        .clear-button { background: #f44336; }
    </style>
</head>
<body>
    <h1>Проверка API</h1>
    <div>
        <button id="testRoot">Корневой маршрут</button>
        <button id="testCities">Список городов</button>
        <button id="testProfiles">Список профилей</button>
        <button id="testLogin">Тестовый логин</button>
        <button class="clear-button" id="clearCache">Очистить кэш</button>
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
        
        // Функция для отправки GET-запроса
        async function sendGetRequest(url) {
            const resultElement = document.getElementById('result');
            resultElement.textContent = `Отправка GET запроса на ${url}...`;
            resultElement.className = '';
            
            try {
                const startTime = new Date();
                const response = await fetch(url, {
                    cache: 'no-cache',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
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
        
        // Функция для отправки POST-запроса
        async function sendPostRequest(url, data) {
            const resultElement = document.getElementById('result');
            resultElement.textContent = `Отправка POST запроса на ${url}...`;
            resultElement.className = '';
            
            try {
                const startTime = new Date();
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    },
                    body: JSON.stringify(data)
                });
                const endTime = new Date();
                const responseTime = endTime - startTime;
                
                try {
                    const responseData = await response.json();
                    resultElement.textContent = `Статус: ${response.status} ${response.statusText}
Время ответа: ${responseTime}ms
Данные: ${JSON.stringify(responseData, null, 2)}`;
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
        
        // Функция очистки кэша
        function clearCache() {
            const resultElement = document.getElementById('result');
            resultElement.textContent = 'Очистка кэша...';
            
            // Очистка кэша и жесткое обновление
            try {
                if ('caches' in window) {
                    caches.keys().then(function(names) {
                        for (let name of names) caches.delete(name);
                    });
                    resultElement.textContent = 'Кэш очищен. Сейчас страница будет перезагружена.';
                    
                    setTimeout(() => {
                        window.location.reload(true);
                    }, 1500);
                } else {
                    resultElement.textContent = 'API кэширования не поддерживается в вашем браузере. Попробуйте обновить страницу с зажатой клавишей Shift.';
                }
            } catch (e) {
                resultElement.textContent = `Ошибка при очистке кэша: ${e.message}`;
            }
        }
        
        // Привязываем обработчики событий
        document.getElementById('testRoot').addEventListener('click', () => {
            sendGetRequest('/api');
        });
        
        document.getElementById('testCities').addEventListener('click', () => {
            sendGetRequest('/api/cities');
        });
        
        document.getElementById('testProfiles').addEventListener('click', () => {
            sendGetRequest('/api/admin/profiles');
        });
        
        document.getElementById('testLogin').addEventListener('click', () => {
            sendPostRequest('/api/auth/login', { username: 'admin', password: 'admin123' });
        });
        
        document.getElementById('clearCache').addEventListener('click', clearCache);
    </script>
</body>
</html>
END

# Устанавливаем права
chmod 644 /var/www/html/escort/test-api.html
chown www-data:www-data /var/www/html/escort/test-api.html

echo -e "\n=== Готово! ==="
echo "1. Тестовый сервер запущен и доступен на порту 3001"
echo "2. Проверьте работу API через браузер: http://eskortvsegorodarfreal.site/test-api.html"
echo "3. Если браузер показывает кэшированные ответы, используйте кнопку 'Очистить кэш'"
echo ""
echo "Если проблемы сохраняются:"
echo "1. Проверьте логи сервера: pm2 logs simple-server"
echo "2. Проверьте логи Nginx: tail -f /var/log/nginx/escort.error.log"
