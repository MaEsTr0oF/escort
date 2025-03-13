import express from 'express';
import * as cityController from '../controllers/cityController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', (req, res) => cityController.getCities(req, res));
router.get('/districts/:cityId', (req, res) => cityController.getDistrictsByCityId(req, res));

// Admin routes
router.post('/', authMiddleware, (req, res) => cityController.createCity(req, res));
router.put('/:id', authMiddleware, (req, res) => cityController.updateCity(req, res));
router.delete('/:id', authMiddleware, (req, res) => cityController.deleteCity(req, res));

export default router; 