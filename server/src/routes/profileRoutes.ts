import express, { Request, Response } from 'express';
import * as profileController from '../controllers/profileController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', async (req: Request, res: Response) => {
  await profileController.getProfiles(req, res);
});

router.get('/:id', async (req: Request, res: Response) => {
  await profileController.getProfileById(req, res);
});

// Admin routes
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  await profileController.createProfile(req, res);
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  await profileController.updateProfile(req, res);
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await profileController.deleteProfile(req, res);
});

export default router;
