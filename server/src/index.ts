import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import * as profileController from './controllers/profileController';
import * as cityController from './controllers/cityController';
import * as authController from './controllers/authController';
import * as settingsController from './controllers/settingsController';
import { authMiddleware } from './middleware/auth';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import cityRoutes from './routes/cityRoutes';
import adminCityRoutes from './routes/adminCityRoutes';
import settingsRoutes from './routes/settingsRoutes';
import * as dashboardController from './controllers/dashboardController';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5001;

// Проверка подключения к базе данных
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Успешное подключение к базе данных');
    
    // Проверяем наличие админа
    const adminCount = await prisma.admin.count();
    if (adminCount === 0) {
      // Создаем дефолтного админа если нет ни одного
      const defaultAdmin = await prisma.admin.create({
        data: {
          username: 'admin',
          password: '$2a$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WXgRWQP4hRj0IXIWEkyG', // пароль: admin123
        },
      });
      console.log('✅ Создан дефолтный администратор (логин: admin, пароль: admin123)');
    }

    // Проверяем наличие настроек
    const settingsCount = await prisma.settings.count();
    if (settingsCount === 0) {
      await prisma.settings.create({ data: {} }); // Создаем настройки по умолчанию
      console.log('✅ Созданы настройки по умолчанию');
    }
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
    process.exit(1);
  }
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:3000', 'http://eskortvsegorodarfreal.site'],
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Логирование запросов для отладки
app.use((req, res, next) => {
  console.log(`[DEBUG] Получен запрос: ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Тестовый маршрут
app.get('/api/test', (_req, res) => {
  res.status(200).json({ message: 'API работает!' });
});

// Публичные маршруты
app.use('/api/profiles', profileRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);

// Защищенные административные маршруты
app.use('/api/admin', authMiddleware);

// Админские маршруты для городов
app.use('/api/admin/cities', adminCityRoutes);

// Маршрут для получения статистики дашборда
app.get('/api/admin/dashboard/stats', async (req, res) => {
  await dashboardController.getStats(req, res);
});

// Получение списка профилей для админки
app.get('/api/admin/profiles', async (req, res) => {
  await profileController.getAdminProfiles(req, res);
});

// Маршрут для получения отдельного профиля для админки
app.get('/api/admin/profiles/:id', async (req, res) => {
  await profileController.getProfileById(req, res);
});

// Маршрут для активации/деактивации профиля
app.patch('/api/admin/profiles/:id/toggle-active', async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log(`[DEBUG] Переключение статуса профиля с ID: ${id}`);
    
    // Получаем текущий профиль
    const profile = await prisma.profile.findUnique({
      where: { id: Number(id) },
    });
    
    if (!profile) {
      console.log(`[DEBUG] Профиль с ID ${id} не найден`);
      return res.status(404).json({ error: 'Профиль не найден' });
    }
    
    // Инвертируем статус isActive
    const updatedProfile = await prisma.profile.update({
      where: { id: Number(id) },
      data: { isActive: !profile.isActive },
    });
    
    console.log(`[DEBUG] Профиль ${id} обновлен, isActive: ${updatedProfile.isActive}`);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Ошибка при изменении статуса профиля:', error);
    res.status(500).json({ error: 'Не удалось изменить статус профиля' });
  }
});

// Маршрут для верификации профиля
app.patch('/api/admin/profiles/:id/verify', async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log(`[DEBUG] Верификация профиля с ID: ${id}`);
    
    // Получаем текущий профиль
    const profile = await prisma.profile.findUnique({
      where: { id: Number(id) },
    });
    
    if (!profile) {
      console.log(`[DEBUG] Профиль с ID ${id} не найден`);
      return res.status(404).json({ error: 'Профиль не найден' });
    }
    
    // Инвертируем статус isVerified
    const updatedProfile = await prisma.profile.update({
      where: { id: Number(id) },
      data: { isVerified: !profile.isVerified },
    });
    
    console.log(`[DEBUG] Профиль ${id} обновлен, isVerified: ${updatedProfile.isVerified}`);
    res.json(updatedProfile);
  } catch (error) {
    console.error('Ошибка при верификации профиля:', error);
    res.status(500).json({ error: 'Не удалось верифицировать профиль' });
  }
});

// Маршрут проверки валидности токена
app.get('/api/admin/verify-token', async (req, res) => {
  res.status(200).json({ valid: true });
});

// Прямой маршрут для авторизации (для отладки)
app.post('/api/auth/login', async (req, res) => {
  console.log('Получен запрос на авторизацию:', req.body);
  await authController.login(req, res);
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../public')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Запускаем сервер только после проверки подключения к БД
checkDatabaseConnection().then(() => {
  app.listen(port, () => {
    console.log(`✅ Сервер запущен на порту ${port}`);
    console.log(`📝 Админ-панель доступна по адресу: http://localhost:${port}/admin`);
    console.log(`🔑 API доступно по адресу: http://localhost:${port}/api`);
  });
}).catch((error) => {
  console.error('❌ Ошибка запуска сервера:', error);
  process.exit(1);
});
