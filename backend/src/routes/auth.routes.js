import express from 'express';

import registerController from '../controllers/auth/register.controller.js';
import loginController from '../controllers/auth/login.controller.js';
import logoutController from '../controllers/auth/logout.controller.js';
import currentUserController from '../controllers/auth/current_user.controller.js';

const router = express.Router();

router.post('/register', registerController); // post
router.post('/login', loginController); // post
router.post('/logout', logoutController); // post
router.get('/me', currentUserController); // get

export default router;