#!/bin/bash

# Создаем копию для безопасности
cp /root/escort/server/build/controllers/profileController.js /root/escort/server/build/controllers/profileController.js.backup

# Находим в скомпилированном файле место, где обрабатываются данные для создания профиля
grep -n "photos:" /root/escort/server/build/controllers/profileController.js

# Создаем patch-файл для прямого редактирования скомпилированного кода
cat > /tmp/profile-fix.patch << 'END'
// Найти строку, где определяется параметр photos в объекте data
// Заменить её на:
photos: typeof req.body.photos === 'string' ? req.body.photos : JSON.stringify(req.body.photos),

// И аналогично для services:
services: typeof req.body.services === 'string' ? req.body.services : JSON.stringify(req.body.services || []),
END

echo "Создан файл с инструкциями для исправления /tmp/profile-fix.patch"
echo "Теперь нужно отредактировать файл /root/escort/server/build/controllers/profileController.js"
echo "Найдите место, где обрабатываются фотографии (photos:) и замените строку согласно инструкциям в patch-файле"
