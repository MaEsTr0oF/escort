import express, { Request, Response } from 'express';
import * as cityController from '../controllers/cityController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', async (req: Request, res: Response) => {
  await cityController.getCities(req, res);
});

router.get('/districts/:cityId', async (req: Request, res: Response) => {
  await cityController.getDistrictsByCityId(req, res);
});

// Admin routes
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  await cityController.createCity(req, res);
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  await cityController.updateCity(req, res);
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await cityController.deleteCity(req, res);
});

export default router; 