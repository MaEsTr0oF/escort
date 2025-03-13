import express, { Request, Response } from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
  await authController.login(req, res);
});

export default router; 