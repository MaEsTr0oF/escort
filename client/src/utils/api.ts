import axios from 'axios';
import { API_URL } from '../config';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Для маршрутов, которые должны возвращать массивы
    const arrayEndpoints = ['/cities', '/admin/cities', '/profiles', '/admin/profiles'];
    
    // Проверяем, соответствует ли текущий запрос одному из маршрутов, возвращающих массивы
    if (response.config.method === 'get' && arrayEndpoints.some(endpoint => 
        response.config.url?.endsWith(endpoint))) {
      
      // Если ответ не массив, логируем ошибку и возвращаем пустой массив
      if (!Array.isArray(response.data)) {
        console.error('API вернул неожидаемый формат. Ожидался массив:', 
                      response.config.url, response.data);
        
        // Изменяем response.data на пустой массив
        response.data = [];
      }
    }
    
    return response;
  },
  (error) => {
    console.error('API Error:', error.response || error);
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);