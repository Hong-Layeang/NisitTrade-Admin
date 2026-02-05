import express from 'express';

import listUniversitiesController from '../controllers/university/list_universities_controller.js';
import getUniversityController from '../controllers/university/get_university_controller.js';

const router = express.Router();

router.get('/', listUniversitiesController); // get
router.get('/:id', getUniversityController); // get

export default router;
