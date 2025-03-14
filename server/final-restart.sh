#!/bin/bash

echo "=== Финальный перезапуск сервера ==="
cd /root/escort/server

# Остановка всех процессов
pm2 stop all

# Проверка и перезапуск сервера
echo "Перезапуск сервера..."
pm2 start build/index.js --name escort-server -- --port 3001
pm2 save

# Перезапуск Nginx
echo "Перезапуск Nginx..."
systemctl restart nginx

echo "=== Готово! ==="
echo "1. Теперь создание анкет должно работать"
echo "2. Для проверки функционала верификации откройте: http://eskortvsegorodarfreal.site/admin-test/"
echo "3. Войдите в админку и затем используйте тестовую страницу"
