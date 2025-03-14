const express = require('express');
const cors = require('cors');
const app = express();

// Разрешаем CORS для всех запросов
app.use(cors());
app.use(express.json());

// Логгирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({ message: 'API server is running', time: new Date().toISOString() });
});

// Маршрут для городов
app.get('/cities', (req, res) => {
  res.json([
    { id: 1, name: 'Москва' },
    { id: 2, name: 'Санкт-Петербург' }
  ]);
});

// Маршрут для профилей
app.get('/admin/profiles', (req, res) => {
  res.json([
    { id: 1, name: 'Анна', age: 25, cityId: 1, isActive: true, isVerified: true, phone: '+7 (999) 123-45-67' },
    { id: 2, name: 'Мария', age: 28, cityId: 2, isActive: true, isVerified: false, phone: '+7 (999) 765-43-21' }
  ]);
});

// Маршрут для проверки токена
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({ token: 'test-token-123456789' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Маршрут для создания профиля
app.post('/profiles', (req, res) => {
  console.log('Received profile data:', req.body);
  res.status(201).json({ id: 3, ...req.body });
});

// Маршрут для активации/деактивации профиля
app.patch('/admin/profiles/:id/toggle-active', (req, res) => {
  const id = parseInt(req.params.id);
  res.json({ id, isActive: true, message: 'Profile status toggled' });
});

// Маршрут для верификации профиля
app.patch('/admin/profiles/:id/verify', (req, res) => {
  const id = parseInt(req.params.id);
  res.json({ id, isVerified: true, message: 'Profile verified' });
});

// Обработка всех остальных маршрутов
app.use('*', (req, res) => {
  res.json({ message: `Endpoint ${req.originalUrl} received` });
});

// Запуск сервера на всех интерфейсах
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
