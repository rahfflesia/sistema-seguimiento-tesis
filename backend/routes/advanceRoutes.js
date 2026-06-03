import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadAdvance, getAdvances, getComments, addComment, getStudentAdvances, downloadAdvance, viewAdvance } from '../controllers/advanceController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF, DOC o DOCX'), false);
        }
    }
});

const router = express.Router();

// These routes are accessed via window.open() from the browser,
// so they can't send Authorization headers. Place before verifyToken.
router.get('/:id/download', downloadAdvance);
router.get('/:id/view', viewAdvance);

// All other routes require authentication
router.use(verifyToken);

router.post('/', upload.single('file'), uploadAdvance);
router.get('/', getAdvances);
router.get('/student/:studentId', getStudentAdvances);
router.get('/:id/comments', getComments);
router.post('/:id/comments', addComment);

export default router;
