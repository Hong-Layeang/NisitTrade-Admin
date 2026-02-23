import express from 'express';

import { setPasswordController } from '../controllers/auth/set_password.controller.js';
import { userLoginController } from '../controllers/auth/user_login.controller.js';
import { adminLoginController } from '../controllers/auth/admin_login.controller.js';
import microsoftValidateController from '../controllers/auth/microsoft_validate.controller.js';
import registerController from '../controllers/auth/register.controller.js';
import currentUserController from '../controllers/auth/current_user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Microsoft OAuth2 login flow
router.post('/microsoft', microsoftValidateController);

// Set password after Microsoft login (requires Bearer token)
router.post('/set-password', authMiddleware, setPasswordController);

// Standard login endpoints
router.post('/login', userLoginController);
router.post('/admin/login', adminLoginController);

router.post('/register', registerController);
router.post('/logout', authMiddleware, (req, res) => {
	return res.json({ success: true, msg: 'Logged out' });
});
router.get('/me', authMiddleware, currentUserController);

export default router;