import express from 'express';
import { getTemplates } from '../controllers/templateController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getTemplates);

export default router;
