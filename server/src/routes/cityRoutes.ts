import express from 'express';
import * as cityController from '../controllers/cityController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', cityController.getCities);
router.get('/districts/:cityId', cityController.getDistrictsByCityId);

// Admin routes
router.post('/', authMiddleware, cityController.createCity);
router.put('/:id', authMiddleware, cityController.updateCity);
router.delete('/:id', authMiddleware, cityController.deleteCity);

export default router; 