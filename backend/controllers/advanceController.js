import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const uploadAdvance = (req, res) => {
    try {
        const student_id = req.user.id;
        const db = req.db;

        const protocol = db.prepare('SELECT id FROM protocols WHERE student_id = ?').get(student_id);
        if (!protocol) {
            return res.status(404).json({ message: 'No tienes un protocolo activo' });
        }

        let file_name, file_size, stored_filename;

        if (req.file) {
            // Real file upload via multer
            file_name = req.file.originalname;
            file_size = req.file.size;
            stored_filename = req.file.filename;
        } else if (req.body.file_name) {
            // Fallback: metadata-only upload (legacy)
            file_name = req.body.file_name;
            file_size = req.body.file_size || 0;
            stored_filename = null;
        } else {
            return res.status(400).json({ message: 'No se recibió ningún archivo' });
        }

        const plagiarism_score = Math.floor(Math.random() * 21) + 5;

        const stmt = db.prepare(
            'INSERT INTO advances (protocol_id, file_name, file_size, plagiarism_score, stored_filename) VALUES (?, ?, ?, ?, ?)'
        );
        const info = stmt.run(protocol.id, file_name, file_size, plagiarism_score, stored_filename);

        res.status(201).json({
            id: info.lastInsertRowid,
            protocol_id: protocol.id,
            file_name,
            file_size,
            plagiarism_score,
            stored_filename,
            status: 'completed'
        });
    } catch (error) {
        console.error('uploadAdvance error:', error);
        res.status(500).json({ message: 'Error interno guardando avance' });
    }
};

export const getAdvances = (req, res) => {
    try {
        const student_id = req.user.id;
        const db = req.db;

        const protocol = db.prepare('SELECT id FROM protocols WHERE student_id = ?').get(student_id);
        if (!protocol) {
            return res.json([]);
        }

        const advances = db.prepare('SELECT * FROM advances WHERE protocol_id = ? ORDER BY created_at DESC').all(protocol.id);
        res.json(advances);
    } catch (error) {
        console.error('getAdvances error:', error);
        res.status(500).json({ message: 'Error interno obteniendo avances' });
    }
};

export const downloadAdvance = (req, res) => {
    try {
        const advanceId = req.params.id;
        const db = req.db;

        const advance = db.prepare('SELECT * FROM advances WHERE id = ?').get(advanceId);
        if (!advance) {
            return res.status(404).json({ message: 'Avance no encontrado' });
        }

        if (!advance.stored_filename) {
            return res.status(404).json({ message: 'El archivo binario no está disponible para este avance (subida de solo metadatos).' });
        }

        const filePath = path.join(UPLOADS_DIR, advance.stored_filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
        }

        res.download(filePath, advance.file_name);
    } catch (error) {
        console.error('downloadAdvance error:', error);
        res.status(500).json({ message: 'Error interno descargando archivo' });
    }
};

export const viewAdvance = (req, res) => {
    try {
        const advanceId = req.params.id;
        const db = req.db;

        const advance = db.prepare('SELECT * FROM advances WHERE id = ?').get(advanceId);
        if (!advance) {
            return res.status(404).json({ message: 'Avance no encontrado' });
        }

        if (!advance.stored_filename) {
            return res.status(404).json({ message: 'Archivo no disponible' });
        }

        const filePath = path.join(UPLOADS_DIR, advance.stored_filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
        }

        // Determine content type
        const ext = path.extname(advance.file_name).toLowerCase();
        const mimeTypes = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${advance.file_name}"`);
        fs.createReadStream(filePath).pipe(res);
    } catch (error) {
        console.error('viewAdvance error:', error);
        res.status(500).json({ message: 'Error interno al visualizar archivo' });
    }
};

export const getComments = (req, res) => {
    try {
        const advance_id = req.params.id;
        const db = req.db;

        const comments = db.prepare(`
            SELECT c.*, u.name as user_name, u.role as user_role 
            FROM advance_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.advance_id = ? 
            ORDER BY c.created_at ASC
        `).all(advance_id);
        
        res.json(comments);
    } catch (error) {
        console.error('getComments error:', error);
        res.status(500).json({ message: 'Error interno obteniendo comentarios' });
    }
};

export const addComment = (req, res) => {
    try {
        const advance_id = req.params.id;
        const user_id = req.user.id;
        const { comment } = req.body;
        const db = req.db;

        if (!comment) return res.status(400).json({ message: 'El comentario no puede estar vacío' });

        const user = db.prepare('SELECT name, role FROM users WHERE id = ?').get(user_id);
        const user_name = user ? user.name : 'Usuario';
        const user_role = user ? user.role : 'student';

        const stmt = db.prepare('INSERT INTO advance_comments (advance_id, user_id, comment) VALUES (?, ?, ?)');
        const info = stmt.run(advance_id, user_id, comment);

        res.status(201).json({ 
            id: info.lastInsertRowid, 
            advance_id,
            user_id,
            comment,
            user_name,
            user_role,
            created_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('addComment error:', error);
        res.status(500).json({ message: 'Error interno guardando comentario' });
    }
};

export const getStudentAdvances = (req, res) => {
    try {
        const { studentId } = req.params;
        const db = req.db;

        const protocol = db.prepare('SELECT id FROM protocols WHERE student_id = ?').get(studentId);
        if (!protocol) {
            return res.json([]);
        }

        const advances = db.prepare('SELECT * FROM advances WHERE protocol_id = ? ORDER BY created_at DESC').all(protocol.id);
        res.json(advances);
    } catch (error) {
        console.error('getStudentAdvances error:', error);
        res.status(500).json({ message: 'Error interno obteniendo avances del estudiante' });
    }
};
