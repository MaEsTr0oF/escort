import express, { Request, Response } from 'express';
import * as settingsController from '../controllers/settingsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/public', async (req: Request, res: Response) => {
  await settingsController.getPublicSettings(req, res);
});

// Admin routes
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  await settingsController.getSettings(req, res);
});

router.put('/', authMiddleware, async (req: Request, res: Response) => {
  await settingsController.updateSettings(req, res);
});

export default router; 