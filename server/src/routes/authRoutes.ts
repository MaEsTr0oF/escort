import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

router.post('/login', (req, res) => authController.login(req, res));

export default router; 