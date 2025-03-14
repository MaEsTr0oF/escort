#!/bin/bash
# Скрипт для поиска и отображения клиентских компонентов, отвечающих за профили

echo "Поиск компонентов профиля..."
find /root/escort/client/src -type f -name "*.tsx" | grep -i profile
find /root/escort/client/src -type f -name "*.tsx" | grep -i card

echo -e "\nПоиск главной страницы..."
find /root/escort/client/src -type f -name "HomePage*.tsx"

echo -e "\nНайденные файлы можно просмотреть с помощью команды:"
echo "cat ПУТЬ_К_ФАЙЛУ"
