import express from 'express';
import { createProtocol, getMyProtocol, requestAdvisor, updateChecklist } from '../controllers/protocolController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createProtocol);
router.get('/me', getMyProtocol);
router.put('/me/advisor', requestAdvisor);
router.put('/me/checklist', updateChecklist);

export default router;
