import express, { Request, Response } from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

// Маршрут для авторизации, который должен обрабатывать /auth/login
router.post('/login', async (req: Request, res: Response) => {
  console.log('Auth route called with body:', req.body);
  await authController.login(req, res);
});

export default router; 
