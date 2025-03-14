#!/bin/bash

echo "=== Исправление маршрутизации API ==="

# Остановка всех процессов
echo -e "\n=== Остановка всех процессов ==="
pm2 stop all

# Проверка и остановка всех процессов на порту 3001
echo -e "\n=== Проверка и освобождение порта 3001 ==="
fuser -k 3001/tcp || true
sleep 2

# Создание новой конфигурации Nginx с правильным проксированием
echo -e "\n=== Создание новой конфигурации Nginx ==="
cat > /etc/nginx/sites-available/escort << 'END'
server {
    listen 80;
    server_name eskortvsegorodarfreal.site www.eskortvsegorodarfreal.site;

    root /var/www/html/escort;
    index index.html;

    # Детализированные логи
    access_log /var/log/nginx/escort.access.log;
    error_log /var/log/nginx/escort.error.log debug;

    # Важно: маршрутизация API
    location /api/ {
        # Удаляем префикс /api перед проксированием
        rewrite ^/api/(.*)$ /$1 break;
        
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Увеличенные таймауты
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

# Активируем конфигурацию Nginx
echo -e "\n=== Активируем конфигурацию Nginx ==="
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/escort
ln -s /etc/nginx/sites-available/escort /etc/nginx/sites-enabled/

# Проверяем и перезапускаем Nginx
echo -e "\n=== Проверяем и перезапускаем Nginx ==="
nginx -t
systemctl restart nginx

# Обновляем тестовый сервер для корректной обработки маршрутов
echo -e "\n=== Обновляем тестовый сервер ==="
cat > /root/escort/server/fixed-server.js << 'END'
const express = require('express');
const cors = require('cors');
const app = express();

// Включаем CORS и обработку JSON
app.use(cors());
app.use(express.json());

// Логирование каждого запроса
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Специальный контроллер для администраторских маршрутов
const adminController = {
  getProfiles: (req, res) => {
    console.log('Запрошен список профилей');
    res.json([
      { 
        id: 1, 
        name: 'Анна', 
        age: 25, 
        cityId: 1, 
        isActive: true, 
        isVerified: true, 
        phone: '+7 (999) 123-45-67',
        city: { id: 1, name: 'Москва' }
      },
      { 
        id: 2, 
        name: 'Мария', 
        age: 28, 
        cityId: 2, 
        isActive: true, 
        isVerified: false, 
        phone: '+7 (999) 765-43-21',
        city: { id: 2, name: 'Санкт-Петербург' }
      }
    ]);
  },
  
  toggleProfileActive: (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`Изменение статуса активности профиля с ID ${id}`);
    res.json({ 
      id, 
      isActive: true, 
      message: 'Статус профиля изменен'
    });
  },
  
  verifyProfile: (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`Верификация профиля с ID ${id}`);
    res.json({ 
      id, 
      isVerified: true, 
      message: 'Профиль верифицирован'
    });
  }
};

// Специальный контроллер для профилей
const profileController = {
  createProfile: (req, res) => {
    console.log('Создание нового профиля:', req.body);
    
    // Преобразуем массивы в JSON-строки, если необходимо
    let photos = req.body.photos;
    if (Array.isArray(photos)) {
      photos = JSON.stringify(photos);
    }
    
    let services = req.body.services;
    if (Array.isArray(services)) {
      services = JSON.stringify(services);
    }
    
    // Создаем профиль
    const newProfile = {
      id: 3,
      ...req.body,
      photos,
      services,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json(newProfile);
  }
};

// Маршруты
app.get('/', (req, res) => {
  res.json({ message: 'API сервер работает', time: new Date().toISOString() });
});

// Маршрут для городов
app.get('/cities', (req, res) => {
  console.log('Запрошен список городов');
  res.json([
    { id: 1, name: 'Москва' },
    { id: 2, name: 'Санкт-Петербург' }
  ]);
});

// Администраторские маршруты
app.get('/admin/profiles', adminController.getProfiles);
app.patch('/admin/profiles/:id/toggle-active', adminController.toggleProfileActive);
app.patch('/admin/profiles/:id/verify', adminController.verifyProfile);

// Маршруты профилей
app.post('/profiles', profileController.createProfile);

// Маршрут для авторизации
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`Попытка входа: ${username} / ${password}`);
  
  if (username === 'admin' && password === 'admin123') {
    res.json({ 
      token: 'test-token-123456789',
      message: 'Вход выполнен успешно' 
    });
  } else {
    res.status(401).json({ error: 'Неверные учетные данные' });
  }
});

// Обработка всех остальных маршрутов для отладки
app.use('*', (req, res) => {
  console.warn(`Незарегистрированный маршрут: ${req.originalUrl}`);
  res.json({ 
    message: `Маршрут ${req.originalUrl} не найден`, 
    hint: 'Проверьте URL и метод запроса',
    availableRoutes: [
      'GET /cities',
      'GET /admin/profiles',
      'PATCH /admin/profiles/:id/toggle-active',
      'PATCH /admin/profiles/:id/verify',
      'POST /profiles',
      'POST /auth/login'
    ]
  });
});

// Запуск сервера на всех интерфейсах
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Локальный URL: http://localhost:${PORT}/`);
  console.log('Доступные маршруты:');
  console.log('- GET /cities');
  console.log('- GET /admin/profiles');
  console.log('- PATCH /admin/profiles/:id/toggle-active');
  console.log('- PATCH /admin/profiles/:id/verify');
  console.log('- POST /profiles');
  console.log('- POST /auth/login');
});
END

# Запускаем обновленный сервер через PM2
echo -e "\n=== Запускаем обновленный сервер ==="
cd /root/escort/server
pm2 start fixed-server.js --name escort-server
pm2 save

# Ожидаем запуск сервера
sleep 3

# Проверяем работу сервера
echo -e "\n=== Проверяем работу сервера ==="
echo "Прямой запрос к API (города):"
curl -s http://localhost:3001/cities
echo -e "\nПрямой запрос к API (профили админа):"
curl -s http://localhost:3001/admin/profiles

# Проверяем проксирование через Nginx
echo -e "\n=== Проверяем проксирование через Nginx ==="
echo "Запрос к API через Nginx (города):"
curl -s http://localhost/api/cities
echo -e "\nЗапрос к API через Nginx (профили админа):"
curl -s http://localhost/api/admin/profiles

# Создание новой тестовой страницы
echo -e "\n=== Создание обновленной тестовой страницы ==="
cat > /var/www/html/escort/api-debug.html << 'END'
<!DOCTYPE html>
<html>
<head>
    <title>Отладка API</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        button { padding: 10px; margin: 5px; background: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 4px; }
        pre { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; white-space: pre-wrap; border-radius: 4px; overflow: auto; max-height: 400px; }
        .error { color: red; }
        .success { color: green; }
        h1, h2 { color: #333; }
        .info { background: #e3f2fd; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .section { margin: 20px 0; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .clear-button { background: #f44336; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Отладка API</h1>
    <div class="info">
        <strong>Важно:</strong> Если не получены данные, попробуйте очистить кэш браузера!
    </div>
    
    <div class="section">
        <h2>Основные запросы</h2>
        <button id="testCities">Список городов</button>
        <button id="testProfiles">Список профилей</button>
        <button id="testLogin">Авторизация</button>
        <button id="testNewProfile">Создать профиль</button>
        <button class="clear-button" id="clearCache">Очистить кэш</button>
    </div>
    
    <div class="section">
        <h2>Действия с профилями</h2>
        <table>
            <tr>
                <th>ID профиля</th>
                <th>Действия</th>
            </tr>
            <tr>
                <td>1</td>
                <td>
                    <button onclick="toggleActive(1)">Изменить активность</button>
                    <button onclick="verifyProfile(1)">Верифицировать</button>
                </td>
            </tr>
            <tr>
                <td>2</td>
                <td>
                    <button onclick="toggleActive(2)">Изменить активность</button>
                    <button onclick="verifyProfile(2)">Верифицировать</button>
                </td>
            </tr>
        </table>
    </div>
    
    <div class="section">
        <h2>Результат:</h2>
        <pre id="result">Нажмите на кнопку для проверки...</pre>
    </div>
    
    <div class="section">
        <h2>Информация о системе:</h2>
        <pre id="info"></pre>
    </div>

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
                    resultElement.className = 'success';
                    resultElement.textContent = `✅ Успешно! Статус: ${response.status} ${response.statusText}
Время ответа: ${responseTime}ms
URL: ${url}
Данные: ${JSON.stringify(data, null, 2)}`;
                } catch (e) {
                    const text = await response.text();
                    resultElement.className = 'error';
                    resultElement.textContent = `⚠️ Ответ не является JSON! Статус: ${response.status} ${response.statusText}
Время ответа: ${responseTime}ms
URL: ${url}
Ответ: ${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`;
                }
            } catch (error) {
                resultElement.className = 'error';
                resultElement.textContent = `❌ Ошибка запроса! ${error.message}
URL: ${url}`;
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
                    resultElement.className = 'success';
                    resultElement.textContent = `✅ Успешно! Статус: ${response.status} ${response.statusText}
Время ответа: ${responseTime}ms
URL: ${url}
Отправленные данные: ${JSON.stringify(data, null, 2)}
Полученные данные: ${JSON.stringify(responseData, null, 2)}`;
                } catch (e) {
                    const text = await response.text();
                    resultElement.className = 'error';
                    resultElement.textContent = `⚠️ Ответ не является JSON! Статус: ${response.status} ${response.statusText}
Время ответа: ${responseTime}ms
URL: ${url}
Ответ: ${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`;
                }
            } catch (error) {
                resultElement.className = 'error';
                resultElement.textContent = `❌ Ошибка запроса! ${error.message}
URL: ${url}`;
                console.error(error);
            }
        }
        
        // Функция для отправки PATCH-запроса
        async function sendPatchRequest(url, data = {}) {
            const resultElement = document.getElementById('result');
            resultElement.textContent = `Отправка PATCH запроса на ${url}...`;
            resultElement.className = '';
            
            try {
                const startTime = new Date();
                const response = await fetch(url, {
                    method: 'PATCH',
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
                    resultElement.className = 'success';
                    resultElement.textContent = `✅ Успешно! Статус: ${response.status} ${response.statusText}
Время ответа: ${responseTime}ms
URL: ${url}
Данные: ${JSON.stringify(responseData, null, 2)}`;
                } catch (e) {
                    const text = await response.text();
                    resultElement.className = 'error';
                    resultElement.textContent = `⚠️ Ответ не является JSON! Статус: ${response.status} ${response.statusText}
Время ответа: ${responseTime}ms
URL: ${url}
Ответ: ${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`;
                }
            } catch (error) {
                resultElement.className = 'error';
                resultElement.textContent = `❌ Ошибка запроса! ${error.message}
URL: ${url}`;
                console.error(error);
            }
        }
        
        // Функция для изменения активности
        function toggleActive(id) {
            sendPatchRequest(`/api/admin/profiles/${id}/toggle-active`);
        }
        
        // Функция для верификации профиля
        function verifyProfile(id) {
            sendPatchRequest(`/api/admin/profiles/${id}/verify`);
        }
        
        // Функция очистки кэша
        function clearCache() {
            const resultElement = document.getElementById('result');
            resultElement.textContent = 'Очистка кэша...';
            resultElement.className = '';
            
            // Очистка кэша и жесткое обновление
            try {
                if ('caches' in window) {
                    caches.keys().then(function(names) {
                        for (let name of names) caches.delete(name);
                    });
                    resultElement.className = 'success';
                    resultElement.textContent = '✅ Кэш очищен. Сейчас страница будет перезагружена.';
                    
                    setTimeout(() => {
                        window.location.reload(true);
                    }, 1500);
                } else {
                    resultElement.className = 'error';
                    resultElement.textContent = '⚠️ API кэширования не поддерживается в вашем браузере. Попробуйте обновить страницу с зажатой клавишей Shift.';
                }
            } catch (e) {
                resultElement.className = 'error';
                resultElement.textContent = `❌ Ошибка при очистке кэша: ${e.message}`;
            }
        }
        
        // Привязываем обработчики событий
        document.getElementById('testCities').addEventListener('click', () => {
            sendGetRequest('/api/cities');
        });
        
        document.getElementById('testProfiles').addEventListener('click', () => {
            sendGetRequest('/api/admin/profiles');
        });
        
        document.getElementById('testLogin').addEventListener('click', () => {
            sendPostRequest('/api/auth/login', { username: 'admin', password: 'admin123' });
        });
        
        document.getElementById('testNewProfile').addEventListener('click', () => {
            const newProfile = {
                name: 'Ольга',
                age: 24,
                height: 168,
                weight: 55,
                breastSize: 3,
                phone: '+7 (999) 888-77-66',
                description: 'Тестовый профиль',
                photos: ['photo1.jpg', 'photo2.jpg'],
                price1Hour: 6000,
                price2Hours: 12000,
                priceNight: 30000,
                cityId: 1,
                services: ['service1', 'service2'],
                district: 'Центр'
            };
            sendPostRequest('/api/profiles', newProfile);
        });
        
        document.getElementById('clearCache').addEventListener('click', clearCache);
    </script>
</body>
</html>
END

# Устанавливаем права
chmod 644 /var/www/html/escort/api-debug.html
chown www-data:www-data /var/www/html/escort/api-debug.html

echo -e "\n=== Проверка маршрутов в клиентском коде ==="
cat > /root/escort/check-client-routes.sh << 'END'
#!/bin/bash

echo "=== Поиск маршрутов API в клиентском коде ==="
echo "Ищем URL для запросов API..."

cd /root/escort/client/src
grep -r "api.get\|api.post\|api.patch\|api.put\|api.delete" --include="*.tsx" --include="*.ts" .

echo -e "\n=== Проверка файла конфигурации API ==="
cat config.ts
END

chmod +x /root/escort/check-client-routes.sh

echo -e "\n=== Готово! ==="
echo "Теперь API должно работать корректно через префикс /api"
echo ""
echo "Для проверки API откройте в браузере: http://eskortvsegorodarfreal.site/api-debug.html"
echo ""
echo "Если в админке по-прежнему возникают проблемы, проверьте клиентский код с помощью команды:"
echo "/root/escort/check-client-routes.sh"
