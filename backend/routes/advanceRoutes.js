import express from 'express';
import { uploadAdvance, getAdvances } from '../controllers/advanceController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', uploadAdvance);
router.get('/', getAdvances);

export default router;
