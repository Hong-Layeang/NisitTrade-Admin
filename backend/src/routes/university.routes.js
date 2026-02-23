import express from 'express';

import listUniversitiesController from '../controllers/university/list_universities.controller.js';
import getUniversityController from '../controllers/university/get_university.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, listUniversitiesController); // get
router.get('/:id', authMiddleware, getUniversityController); // get

export default router;
