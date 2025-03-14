#!/bin/bash

echo "Создание актуального .env файла..."
cat > /root/escort/server/.env << 'END'
# Environment variables
NODE_ENV=production
PORT=3001
DATABASE_URL=file:./dev.db
CLIENT_URL=http://eskortvsegorodarfreal.site
JWT_SECRET=ваш_секретный_ключ_для_jwt_токенов
END

echo "Копирование .env в корневую директорию..."
cp /root/escort/server/.env /root/escort/server/.env.local

echo "Готово! Переменные окружения обновлены."
