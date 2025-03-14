import { Request, Response, NextFunction } from 'express';

export const debugMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  
  // Сохраняем оригинальный метод send
  const originalSend = res.send;
  
  // Переопределяем метод send для логирования ответов
  // @ts-ignore
  res.send = function(body) {
    console.log(`[DEBUG] Response for ${req.method} ${req.url}: Status ${res.statusCode}`);
    return originalSend.call(this, body);
  };
  
  next();
};
