#!/bin/bash
# Этот скрипт создаст конвертер для поля photos в маршруте создания профиля

# Создаем временный файл с обновленным кодом
cat > /tmp/profile-routes-fix.js << 'END'
// В POST маршруте profileRoutes.ts сразу после получения запроса,
// перед вызовом profileController.createProfile, добавь следующий код:

// Преобразуем фотографии в JSON строку, если они приходят как массив
if (req.body && req.body.photos && Array.isArray(req.body.photos)) {
  req.body.photos = JSON.stringify(req.body.photos);
  console.log('Photos converted to JSON string:', req.body.photos);
}

// Также преобразуем services в JSON строку, если они приходят как массив
if (req.body && req.body.services && Array.isArray(req.body.services)) {
  req.body.services = JSON.stringify(req.body.services);
  console.log('Services converted to JSON string:', req.body.services);
}
END

echo "Готово! Временный файл создан в /tmp/profile-routes-fix.js"
echo "Теперь нужно добавить этот код в файл /root/escort/server/src/routes/profileRoutes.ts"
echo "Откройте файл с помощью редактора (nano) и добавьте код перед вызовом profileController.createProfile"
