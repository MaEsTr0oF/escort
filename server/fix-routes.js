const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'build/index.js');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Проверяем и исправляем маршруты
console.log('Исправляем маршруты в index.js...');

// Ищем блок с маршрутами и заменяем его
const routesRegex = /\/\/ Маршруты API[\s\S]*?\/\/ The 'catchall' handler/;
const routesBlock = indexContent.match(routesRegex);

if (routesBlock) {
    const newRoutesBlock = `// Маршруты API
// Важно: порядок маршрутов имеет значение

// Маршрут для проверки статуса сервера
app.get('/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    endpoints: [
      '/cities',
      '/profiles',
      '/admin/profiles',
      '/auth/login'
    ]
  });
});

// Маршрут авторизации - без префикса /api
app.use('/auth', authRoutes);

// Маршруты для городов - без префикса /api
app.use('/cities', cityRoutes);

// Маршруты для профилей - требуют авторизации
app.use('/profiles', profileRoutes);

// Маршруты для администраторов
app.use('/admin', adminRoutes);

// Отладочный маршрут для проверки работы сервера
app.get('/hello', (req, res) => {
  res.send('Hello from backend server!');
});

// Маршрут для верификации профиля
app.patch('/admin/profiles/:id/verify', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(\`[DEBUG] Запрос на верификацию профиля \${id}\`);
    
    // Получаем текущий профиль
    const profile = await prisma.profile.findUnique({
      where: { id: Number(id) },
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }
    
    // Инвертируем статус верификации
    const updatedProfile = await prisma.profile.update({
      where: { id: Number(id) },
      data: {
        isVerified: !profile.isVerified,
      },
    });
    
    console.log(\`[DEBUG] Статус верификации профиля \${id} изменен на: \${updatedProfile.isVerified}\`);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Ошибка при верификации профиля:', error);
    res.status(500).json({ error: 'Не удалось изменить статус верификации' });
  }
});

// Маршрут для изменения активности профиля
app.patch('/admin/profiles/:id/toggle-active', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(\`[DEBUG] Запрос на изменение активности профиля \${id}\`);
    
    // Получаем текущий профиль
    const profile = await prisma.profile.findUnique({
      where: { id: Number(id) },
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }
    
    // Инвертируем статус активности
    const updatedProfile = await prisma.profile.update({
      where: { id: Number(id) },
      data: {
        isActive: !profile.isActive,
      },
    });
    
    console.log(\`[DEBUG] Статус активности профиля \${id} изменен на: \${updatedProfile.isActive}\`);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Ошибка при изменении активности профиля:', error);
    res.status(500).json({ error: 'Не удалось изменить статус активности' });
  }
});

// The 'catchall' handler`;

    // Заменяем блок с маршрутами
    indexContent = indexContent.replace(routesRegex, newRoutesBlock);
    fs.writeFileSync(indexPath, indexContent);
    console.log('Маршруты успешно обновлены в index.js');
} else {
    console.log('Не удалось найти блок с маршрутами в index.js');
}
