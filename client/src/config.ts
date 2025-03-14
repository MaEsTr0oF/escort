export const API_URL = process.env.NODE_ENV === 'production'
  ? '/api'  // В production используем относительный путь
  : 'http://localhost:3001/api';  // Изменено с 5001 на 3001, как указано в .env

export const IMAGE_UPLOAD_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
