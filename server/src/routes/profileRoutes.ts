import express, { Request, Response } from 'express';
import * as profileController from '../controllers/profileController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Публичные маршруты
router.get('/', async (req: Request, res: Response) => {
  await profileController.getProfiles(req, res);
});

router.get('/:id', async (req: Request, res: Response) => {
 if (req.body && req.body.photos && Array.isArray(req.body.photos)) {
    req.body.photos = JSON.stringify(req.body.photos);
    console.log('Photos converted to JSON string:', req.body.photos);
  }

  // Также преобразуем services в JSON строку, если они приходят как массив
  if (req.body && req.body.services && Array.isArray(req.body.services)) {
    req.body.services = JSON.stringify(req.body.services);
    console.log('Services converted to JSON string:', req.body.services);
  }
 await profileController.getProfileById(req, res);
});

// Маршруты администратора (требуют аутентификации)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  await profileController.createProfile(req, res);
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  await profileController.updateProfile(req, res);
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  await profileController.deleteProfile(req, res);
});

router.patch('/:id/toggle-active', authMiddleware, async (req: Request, res: Response) => {
  await profileController.toggleProfileActive(req, res);
});

router.patch('/:id/verify', authMiddleware, async (req: Request, res: Response) => {
  await profileController.verifyProfile(req, res);
});

export default router;
