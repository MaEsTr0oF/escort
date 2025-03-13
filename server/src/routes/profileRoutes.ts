import express from 'express';
import * as profileController from '../controllers/profileController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', (req, res) => profileController.getProfiles(req, res));
router.get('/:id', (req, res) => profileController.getProfileById(req, res));

// Admin routes
router.post('/', authMiddleware, (req, res) => profileController.createProfile(req, res));
router.put('/:id', authMiddleware, (req, res) => profileController.updateProfile(req, res));
router.delete('/:id', authMiddleware, (req, res) => profileController.deleteProfile(req, res));

export default router;
