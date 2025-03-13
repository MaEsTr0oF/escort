export const API_URL = process.env.NODE_ENV === 'production'
  ? '/api'  // Используем относительный путь вместо полного URL
  : 'http://localhost:5001';
