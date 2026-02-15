import express from 'express';

import {
  setPasswordController,
  userLoginController,
  adminLoginController,
} from '../controllers/auth/auth.controller.js';
import microsoftValidateController from '../controllers/auth/microsoft_validate.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Microsoft OAuth2 login flow
router.post('/microsoft', microsoftValidateController);

// Set password after Microsoft login (requires Bearer token)
router.post('/set-password', authMiddleware, setPasswordController);

// Standard login endpoints
router.post('/login', userLoginController);
router.post('/admin/login', adminLoginController);

// Placeholder routes (implement as needed)
// router.post('/register', registerController);
// router.post('/logout', logoutController);
// router.get('/me', authMiddleware, currentUserController);

export default router;