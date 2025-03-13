import express from 'express';
import * as profileController from '../controllers/profileController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', profileController.getProfiles);
router.get('/:id', profileController.getProfileById);

// Admin routes
router.post('/', authMiddleware, profileController.createProfile);
router.put('/:id', authMiddleware, profileController.updateProfile);
router.delete('/:id', authMiddleware, profileController.deleteProfile);

export default router;
