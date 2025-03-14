#!/bin/bash

echo "=== Поиск маршрутов API в клиентском коде ==="
echo "Ищем URL для запросов API..."

cd /root/escort/client/src
grep -r "api.get\|api.post\|api.patch\|api.put\|api.delete" --include="*.tsx" --include="*.ts" .

echo -e "\n=== Проверка файла конфигурации API ==="
cat config.ts
