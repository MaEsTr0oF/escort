#!/bin/bash

echo "=== ИСПРАВЛЕНИЕ CORS И ПРОВЕРКА ДОСТУПА ИЗ БРАУЗЕРА ==="

# 1. Создаем тестовую HTML страницу для проверки API
cat > /var/www/html/escort/test-api.html << 'END'
<!DOCTYPE html>
<html>
<head>
    <title>API Test</title>
</head>
<body>
    <h1>API Test</h1>
    <button id="testButton">Тест API</button>
    <pre id="result"></pre>

    <script>
        document.getElementById('testButton').addEventListener('click', async () => {
            try {
                const response = await fetch('/api/cities');
                const data = await response.json();
                document.getElementById('result').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('result').textContent = 'Ошибка: ' + error.message;
            }
        });
    </script>
</body>
</html>
END

echo "Тестовая страница создана: http://eskortvsegorodarfreal.site/test-api.html"

# 2. Проверяем работоспособность сервера
echo "Проверяем работоспособность сервера..."
cd /root/escort/server
pm2 status escort-server
netstat -tulpn | grep 3001

echo -e "\n=== ГОТОВО! ==="
echo "Если проблема сохраняется:"
echo "1. Откройте в браузере http://eskortvsegorodarfreal.site/test-api.html"
echo "2. Нажмите 'Тест API' и проверьте работу API"
echo "3. Попробуйте очистить кэш браузера (Ctrl+F5 или Ctrl+Shift+R)"
