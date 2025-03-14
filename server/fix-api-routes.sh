#!/bin/bash

echo "=== Проверка и исправление маршрутов API ==="

cd /root/escort/server

echo -e "\n=== Создаем резервную копию текущего index.js ==="
cp build/index.js build/index.js.bak.$(date +%Y%m%d%H%M%S)

echo -e "\n=== Проверяем маршруты в index.js ==="
grep -r "app.use" build/index.js

# Создаем патч для исправления маршрутов
cat > fix-routes.js << 'END'
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'build/index.js');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Проверяем и исправляем маршруты
console.log('Исправляем маршруты в index.js...');

// Ищем блок с маршрутами и заменяем его
const routesRegex = /\/\/ Маршруты API[\s\S]*?\/\/ The 'catchall' handler/;
const routesBlock = indexContent.match(routesRegex);

if (routesBlock) {
    const newRoutesBlock = `// Маршруты API
// Важно: порядок маршрутов имеет значение

// Маршрут для проверки статуса сервера
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

// Маршрут авторизации - без префикса /api
app.use('/auth', authRoutes);

// Маршруты для городов - без префикса /api
app.use('/cities', cityRoutes);

// Маршруты для профилей - требуют авторизации
app.use('/profiles', profileRoutes);

// Маршруты для администраторов
app.use('/admin', adminRoutes);

// Отладочный маршрут для проверки работы сервера
app.get('/hello', (req, res) => {
  res.send('Hello from backend server!');
});

// Маршрут для верификации профиля
app.patch('/admin/profiles/:id/verify', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(\`[DEBUG] Запрос на верификацию профиля \${id}\`);
    
    // Получаем текущий профиль
    const profile = await prisma.profile.findUnique({
      where: { id: Number(id) },
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }
    
    // Инвертируем статус верификации
    const updatedProfile = await prisma.profile.update({
      where: { id: Number(id) },
      data: {
        isVerified: !profile.isVerified,
      },
    });
    
    console.log(\`[DEBUG] Статус верификации профиля \${id} изменен на: \${updatedProfile.isVerified}\`);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Ошибка при верификации профиля:', error);
    res.status(500).json({ error: 'Не удалось изменить статус верификации' });
  }
});

// Маршрут для изменения активности профиля
app.patch('/admin/profiles/:id/toggle-active', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(\`[DEBUG] Запрос на изменение активности профиля \${id}\`);
    
    // Получаем текущий профиль
    const profile = await prisma.profile.findUnique({
      where: { id: Number(id) },
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }
    
    // Инвертируем статус активности
    const updatedProfile = await prisma.profile.update({
      where: { id: Number(id) },
      data: {
        isActive: !profile.isActive,
      },
    });
    
    console.log(\`[DEBUG] Статус активности профиля \${id} изменен на: \${updatedProfile.isActive}\`);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Ошибка при изменении активности профиля:', error);
    res.status(500).json({ error: 'Не удалось изменить статус активности' });
  }
});

// The 'catchall' handler`;

    // Заменяем блок с маршрутами
    indexContent = indexContent.replace(routesRegex, newRoutesBlock);
    fs.writeFileSync(indexPath, indexContent);
    console.log('Маршруты успешно обновлены в index.js');
} else {
    console.log('Не удалось найти блок с маршрутами в index.js');
}
END

# Запускаем скрипт для исправления маршрутов
node fix-routes.js

# Перезапускаем сервер
echo -e "\n=== Перезапускаем сервер ==="
pm2 restart escort-server

# Ждем немного для запуска сервера
sleep 2

# Проверяем доступность API
echo -e "\n=== Проверяем доступность API ==="
echo "Проверка статуса сервера:"
curl -s http://localhost:3001/status
echo -e "\n\nПроверка списка городов:"
curl -s http://localhost:3001/cities

echo -e "\n=== Настройка CORS для API ==="
cat > cors-fix.js << 'END'
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'build/index.js');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Проверяем наличие настроек CORS
if (!indexContent.includes('app.use(cors())')) {
    console.log('Добавляем настройки CORS...');
    
    // Ищем блок импортов
    const importsBlock = indexContent.match(/const express = require\('express'\);[\s\S]*?const app = express\(\);/);
    
    if (importsBlock) {
        const newImportsBlock = `const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/authRoutes');
const cityRoutes = require('./routes/cityRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const prisma = new PrismaClient();
const app = express();

// Включаем CORS
app.use(cors());`;

        // Заменяем блок импортов
        indexContent = indexContent.replace(importsBlock[0], newImportsBlock);
        fs.writeFileSync(indexPath, indexContent);
        console.log('Настройки CORS успешно добавлены в index.js');
    } else {
        console.log('Не удалось найти блок импортов в index.js');
    }
} else {
    console.log('Настройки CORS уже присутствуют в index.js');
}
END

# Запускаем скрипт для добавления CORS
node cors-fix.js

# Перезапускаем сервер
echo -e "\n=== Перезапускаем сервер ==="
pm2 restart escort-server

# Создаем таблицу маршрутов для отладки
echo -e "\n=== Создаем таблицу маршрутов для отладки ==="
cat > /var/www/html/escort/routes.html << 'END'
<!DOCTYPE html>
<html>
<head>
    <title>Маршруты API</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .test-button { padding: 5px; background: #4CAF50; color: white; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <h1>Маршруты API</h1>
    <table>
        <tr>
            <th>Маршрут</th>
            <th>Метод</th>
            <th>Описание</th>
            <th>Требует авторизации</th>
            <th>Проверить</th>
        </tr>
        <tr>
            <td>/api-status</td>
            <td>GET</td>
            <td>Проверка статуса сервера</td>
            <td>Нет</td>
            <td><button class="test-button" onclick="testRoute('/api-status')">Проверить</button></td>
        </tr>
        <tr>
            <td>/api/cities</td>
            <td>GET</td>
            <td>Получение списка городов</td>
            <td>Нет</td>
            <td><button class="test-button" onclick="testRoute('/api/cities')">Проверить</button></td>
        </tr>
        <tr>
            <td>/api/auth/login</td>
            <td>POST</td>
            <td>Авторизация</td>
            <td>Нет</td>
            <td><button class="test-button" onclick="testPost('/api/auth/login', { username: 'admin', password: 'admin123' })">Проверить</button></td>
        </tr>
        <tr>
            <td>/api/admin/profiles</td>
            <td>GET</td>
            <td>Получение списка профилей</td>
            <td>Да</td>
            <td><button class="test-button" onclick="testRoute('/api/admin/profiles', true)">Проверить</button></td>
        </tr>
        <tr>
            <td>/api/admin/profiles/:id/verify</td>
            <td>PATCH</td>
            <td>Изменение статуса верификации</td>
            <td>Да</td>
            <td><button class="test-button" onclick="testPatch('/api/admin/profiles/1/verify', {}, true)">Проверить</button></td>
        </tr>
        <tr>
            <td>/api/admin/profiles/:id/toggle-active</td>
            <td>PATCH</td>
            <td>Изменение статуса активности</td>
            <td>Да</td>
            <td><button class="test-button" onclick="testPatch('/api/admin/profiles/1/toggle-active', {}, true)">Проверить</button></td>
        </tr>
    </table>
    
    <h2>Результат:</h2>
    <pre id="result">Нажмите на кнопку для проверки...</pre>

    <script>
        // Функция для выполнения GET-запроса
        async function testRoute(url, auth = false) {
            const resultElement = document.getElementById('result');
            resultElement.innerText = 'Загрузка...';
            
            try {
                const options = {};
                
                if (auth) {
                    const token = localStorage.getItem('adminToken');
                    if (!token) {
                        resultElement.innerText = 'Требуется авторизация. Пожалуйста, авторизуйтесь через раздел /admin/login или используйте кнопку "Проверить" в строке /api/auth/login';
                        return;
                    }
                    options.headers = {
                        'Authorization': `Bearer ${token}`
                    };
                }
                
                const response = await fetch(url, options);
                const data = await response.json();
                
                resultElement.innerText = JSON.stringify(data, null, 2);
            } catch (error) {
                resultElement.innerText = `Ошибка: ${error.message}`;
                console.error(error);
            }
        }
        
        // Функция для выполнения POST-запроса
        async function testPost(url, body) {
            const resultElement = document.getElementById('result');
            resultElement.innerText = 'Загрузка...';
            
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });
                
                const data = await response.json();
                resultElement.innerText = JSON.stringify(data, null, 2);
                
                if (url === '/api/auth/login' && data.token) {
                    localStorage.setItem('adminToken', data.token);
                    resultElement.innerText += '\n\nТокен успешно сохранен. Теперь вы можете тестировать защищенные маршруты.';
                }
            } catch (error) {
                resultElement.innerText = `Ошибка: ${error.message}`;
                console.error(error);
            }
        }
        
        // Функция для выполнения PATCH-запроса
        async function testPatch(url, body, auth = false) {
            const resultElement = document.getElementById('result');
            resultElement.innerText = 'Загрузка...';
            
            try {
                const options = {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                };
                
                if (auth) {
                    const token = localStorage.getItem('adminToken');
                    if (!token) {
                        resultElement.innerText = 'Требуется авторизация. Пожалуйста, авторизуйтесь через раздел /admin/login или используйте кнопку "Проверить" в строке /api/auth/login';
                        return;
                    }
                    options.headers['Authorization'] = `Bearer ${token}`;
                }
                
                const response = await fetch(url, options);
                const data = await response.json();
                
                resultElement.innerText = JSON.stringify(data, null, 2);
            } catch (error) {
                resultElement.innerText = `Ошибка: ${error.message}`;
                console.error(error);
            }
        }
    </script>
</body>
</html>
END

# Устанавливаем права доступа
chmod 644 /var/www/html/escort/routes.html
chown www-data:www-data /var/www/html/escort/routes.html

echo -e "\n=== Готово! ==="
echo "Проверьте маршруты API с помощью таблицы: http://eskortvsegorodarfreal.site/routes.html"
