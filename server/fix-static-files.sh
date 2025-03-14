#!/bin/bash
echo "Создание директории для статических файлов..."
mkdir -p /var/www/html/escort

echo "Копирование статических файлов из клиента..."
cp -r /root/escort/client/build/* /var/www/html/escort/

echo "Установка правильных прав доступа..."
chown -R www-data:www-data /var/www/html/escort
chmod -R 755 /var/www/html/escort

echo "Готово! Статические файлы установлены."
