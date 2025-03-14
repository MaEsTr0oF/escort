#!/bin/bash
# Создаем резервную копию контроллера
cp /root/escort/server/src/controllers/profileController.ts /root/escort/server/src/controllers/profileController.ts.backup

# Находим и заменяем строку с photos
sed -i 's/photos: req.body.photos,/photos: Array.isArray(req.body.photos) ? JSON.stringify(req.body.photos) : req.body.photos,/g' /root/escort/server/src/controllers/profileController.ts

# Находим и заменяем строку с services
sed -i 's/services: req.body.services || \[\],/services: Array.isArray(req.body.services) ? JSON.stringify(req.body.services) : (req.body.services || "[]"),/g' /root/escort/server/src/controllers/profileController.ts

echo "Контроллер обновлен. Скомпилируйте и перезапустите сервер."
