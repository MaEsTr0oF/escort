const express = require('express');
const cors = require('cors');
const app = express();

// Включаем CORS и обработку JSON
app.use(cors());
app.use(express.json());

// Логирование каждого запроса
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Специальный контроллер для администраторских маршрутов
const adminController = {
  getProfiles: (req, res) => {
    console.log('Запрошен список профилей');
    res.json([
      { 
        id: 1, 
        name: 'Анна', 
        age: 25, 
        cityId: 1, 
        isActive: true, 
        isVerified: true, 
        phone: '+7 (999) 123-45-67',
        city: { id: 1, name: 'Москва' }
      },
      { 
        id: 2, 
        name: 'Мария', 
        age: 28, 
        cityId: 2, 
        isActive: true, 
        isVerified: false, 
        phone: '+7 (999) 765-43-21',
        city: { id: 2, name: 'Санкт-Петербург' }
      }
    ]);
  },
  
  toggleProfileActive: (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`Изменение статуса активности профиля с ID ${id}`);
    res.json({ 
      id, 
      isActive: true, 
      message: 'Статус профиля изменен'
    });
  },
  
  verifyProfile: (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`Верификация профиля с ID ${id}`);
    res.json({ 
      id, 
      isVerified: true, 
      message: 'Профиль верифицирован'
    });
  }
};

// Специальный контроллер для профилей
const profileController = {
  createProfile: (req, res) => {
    console.log('Создание нового профиля:', req.body);
    
    // Преобразуем массивы в JSON-строки, если необходимо
    let photos = req.body.photos;
    if (Array.isArray(photos)) {
      photos = JSON.stringify(photos);
    }
    
    let services = req.body.services;
    if (Array.isArray(services)) {
      services = JSON.stringify(services);
    }
    
    // Создаем профиль
    const newProfile = {
      id: 3,
      ...req.body,
      photos,
      services,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json(newProfile);
  }
};

// Маршруты
app.get('/', (req, res) => {
  res.json({ message: 'API сервер работает', time: new Date().toISOString() });
});

// Маршрут для городов
app.get('/cities', (req, res) => {
  console.log('Запрошен список городов');
  res.json([
    { id: 1, name: 'Москва' },
    { id: 2, name: 'Санкт-Петербург' }
  ]);
});

// Администраторские маршруты
app.get('/admin/profiles', adminController.getProfiles);
app.patch('/admin/profiles/:id/toggle-active', adminController.toggleProfileActive);
app.patch('/admin/profiles/:id/verify', adminController.verifyProfile);

// Маршруты профилей
app.post('/profiles', profileController.createProfile);

// Маршрут для авторизации
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`Попытка входа: ${username} / ${password}`);
  
  if (username === 'admin' && password === 'admin123') {
    res.json({ 
      token: 'test-token-123456789',
      message: 'Вход выполнен успешно' 
    });
  } else {
    res.status(401).json({ error: 'Неверные учетные данные' });
  }
});

// Обработка всех остальных маршрутов для отладки
app.use('*', (req, res) => {
  console.warn(`Незарегистрированный маршрут: ${req.originalUrl}`);
  res.json({ 
    message: `Маршрут ${req.originalUrl} не найден`, 
    hint: 'Проверьте URL и метод запроса',
    availableRoutes: [
      'GET /cities',
      'GET /admin/profiles',
      'PATCH /admin/profiles/:id/toggle-active',
      'PATCH /admin/profiles/:id/verify',
      'POST /profiles',
      'POST /auth/login'
    ]
  });
});

// Запуск сервера на всех интерфейсах
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Локальный URL: http://localhost:${PORT}/`);
  console.log('Доступные маршруты:');
  console.log('- GET /cities');
  console.log('- GET /admin/profiles');
  console.log('- PATCH /admin/profiles/:id/toggle-active');
  console.log('- PATCH /admin/profiles/:id/verify');
  console.log('- POST /profiles');
  console.log('- POST /auth/login');
});
