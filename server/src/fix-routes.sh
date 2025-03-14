#!/bin/bash

# Создаём временный файл
cat > /tmp/fix-routes.txt << 'END'
// Исправленные маршруты
app.get('/admin/profiles', authMiddleware, async (req, res) => {
  await profileController.getAdminProfiles(req, res);
});

// Маршрут для переключения статуса профиля
app.patch('/admin/profiles/:id/toggle-active', authMiddleware, async (req, res) => {
  await profileController.toggleProfileActive(req, res);
});

// Маршрут для верификации профиля
app.patch('/admin/profiles/:id/verify', authMiddleware, async (req, res) => {
  await profileController.verifyProfile(req, res);
});
END

echo "Исправляем маршруты в файле index.ts"
nano /root/escort/server/src/index.ts

echo "Исправление завершено"
