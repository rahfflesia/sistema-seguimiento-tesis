import express from 'express';
import { getLines, createLine, updateLine, deleteLine } from '../controllers/researchLinesController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Required auth for all routes
router.use(verifyToken);

// Endpoints
router.get('/', getLines);
router.post('/', createLine);
router.put('/:id', updateLine);
router.delete('/:id', deleteLine);

export default router;
