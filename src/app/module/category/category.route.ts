import express from 'express';
import { CategoryController } from './category.controller';
import requireAuth from '../../middleware/auth';

const router = express.Router();

router.post('/', requireAuth('ADMIN'), CategoryController.createCategory);
router.get('/', CategoryController.getAllCategories);

export const CategoryRoutes = router;
