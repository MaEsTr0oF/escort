import express from 'express';
import * as settingsController from '../controllers/settingsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', settingsController.getSettings);

// Admin routes
router.put('/', authMiddleware, settingsController.updateSettings);

export default router; 