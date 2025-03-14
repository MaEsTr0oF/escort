#!/bin/bash
echo "Тестирование прямого доступа к API..."

echo -e "\nТест эндпоинта /cities:"
curl -v http://localhost:3001/cities

echo -e "\nТест эндпоинта /health (если существует):"
curl -v http://localhost:3001/health

echo -e "\nПроверка API через Nginx:"
curl -v http://localhost/api/cities
