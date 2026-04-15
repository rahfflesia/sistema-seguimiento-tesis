export const uploadAdvance = (req, res) => {
    try {
        const student_id = req.user.id;
        const { file_name, file_size } = req.body;
        const db = req.db;

        if (!file_name || file_size === undefined) {
            return res.status(400).json({ message: 'Información del archivo incompleta' });
        }

        const protocol = db.prepare('SELECT id FROM protocols WHERE student_id = ?').get(student_id);
        if (!protocol) {
            return res.status(404).json({ message: 'No tienes un protocolo activo' });
        }

        const stmt = db.prepare('INSERT INTO advances (protocol_id, file_name, file_size) VALUES (?, ?, ?)');
        const info = stmt.run(protocol.id, file_name, file_size);

        res.status(201).json({ 
            id: info.lastInsertRowid, 
            protocol_id: protocol.id, 
            file_name, 
            file_size,
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
            return res.json([]); // No protocol, no advances
        }

        const advances = db.prepare('SELECT * FROM advances WHERE protocol_id = ? ORDER BY created_at DESC').all(protocol.id);
        
        res.json(advances);
    } catch (error) {
        console.error('getAdvances error:', error);
        res.status(500).json({ message: 'Error interno obteniendo avances' });
    }
};
