import express from 'express';
import { getAdvisors, getAllUsers, updateUserRole, deleteUser, getAdvisees, updateAdviseeStatus } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/advisors', getAdvisors);
router.get('/', getAllUsers);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

router.get('/advisees', getAdvisees);
router.put('/advisees/status', updateAdviseeStatus);

export default router;
