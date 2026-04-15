import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/dashboard - Protected route
router.get('/', verifyToken, getDashboardData);

export default router;
