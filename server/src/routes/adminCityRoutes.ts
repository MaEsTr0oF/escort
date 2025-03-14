import express, { Request, Response } from 'express';
import * as cityController from '../controllers/cityController';

const router = express.Router();

// Маршрут для получения списка городов
router.get('/', async (req: Request, res: Response) => {
  await cityController.getCities(req, res);
});

// Админские маршруты для городов
router.post('/', async (req: Request, res: Response) => {
  await cityController.createCity(req, res);
});

router.put('/:id', async (req: Request, res: Response) => {
  await cityController.updateCity(req, res);
});

router.delete('/:id', async (req: Request, res: Response) => {
  await cityController.deleteCity(req, res);
});

export default router; 