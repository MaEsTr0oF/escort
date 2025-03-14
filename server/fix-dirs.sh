#!/bin/bash

echo "Создание и настройка правильных директорий..."

# Создаем директорию для статических файлов
mkdir -p /var/www/html/escort
chmod 755 /var/www/html/escort

# Копируем собранный фронтенд
echo "Копирование файлов из /root/escort/client/build в /var/www/html/escort"
cp -r /root/escort/client/build/* /var/www/html/escort/

# Устанавливаем правильные права
echo "Настройка прав доступа..."
chown -R www-data:www-data /var/www/html/escort
chmod -R 755 /var/www/html/escort

echo "Готово! Статические файлы установлены в правильной директории."
