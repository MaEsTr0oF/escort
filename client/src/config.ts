// Конфигурация API URL в зависимости от окружения
export const API_URL = process.env.NODE_ENV === 'production'
  ? '/api'  // В production используем относительный путь для прокси
  : 'http://localhost:5003/api'; // Используем порт 5003, как настроено на сервере

export const IMAGE_UPLOAD_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
