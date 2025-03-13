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
import settingsRoutes from './routes/settingsRoutes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5002;

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
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Публичные маршруты
app.use('/api/profiles', profileRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);

// Маршруты администратора
app.use('/api/admin', authMiddleware);

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
