import express from 'express';
import * as settingsController from '../controllers/settingsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/public', (req, res) => settingsController.getPublicSettings(req, res));

// Admin routes
router.get('/', authMiddleware, (req, res) => settingsController.getSettings(req, res));
router.put('/', authMiddleware, (req, res) => settingsController.updateSettings(req, res));

export default router; 