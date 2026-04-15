import express from 'express';
import { getAdvisors } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/advisors', getAdvisors);

export default router;
