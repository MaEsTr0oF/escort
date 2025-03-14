import express, { Request, Response } from 'express';
import * as cityController from '../controllers/cityController';

const router = express.Router();

// Public routes
router.get('/', async (req: Request, res: Response) => {
  await cityController.getCities(req, res);
});

router.get('/districts/:cityId', async (req: Request, res: Response) => {
  await cityController.getDistrictsByCityId(req, res);
});

export default router; 