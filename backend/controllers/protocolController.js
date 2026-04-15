export const createProtocol = (req, res) => {
    try {
        const { title, general_objective, specific_objectives, research_line_id } = req.body;
        const student_id = req.user.id;
        const db = req.db;

        if (!title || !general_objective || !specific_objectives || !research_line_id) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        // Check if student already has a protocol
        const existing = db.prepare('SELECT id FROM protocols WHERE student_id = ?').get(student_id);
        if (existing) {
            return res.status(400).json({ message: 'Ya tienes un protocolo registrado.' });
        }

        const stmt = db.prepare('INSERT INTO protocols (student_id, title, general_objective, specific_objectives, research_line_id) VALUES (?, ?, ?, ?, ?)');
        const info = stmt.run(student_id, title, general_objective, specific_objectives, research_line_id);

        res.status(201).json({ id: info.lastInsertRowid, message: 'Protocolo registrado exitosamente' });
    } catch (error) {
        console.error('createProtocol error:', error);
        res.status(500).json({ message: 'Error interno guardando tu protocolo' });
    }
};

export const getMyProtocol = (req, res) => {
    try {
        const student_id = req.user.id;
        const db = req.db;

        const protocol = db.prepare(`
            SELECT p.*, r.name as research_line_name
            FROM protocols p
            LEFT JOIN research_lines r ON p.research_line_id = r.id
            WHERE p.student_id = ?
        `).get(student_id);

        if (!protocol) {
            return res.json(null); // return null smoothly if non-existent
        }

        res.json(protocol);
    } catch (error) {
        console.error('getMyProtocol error:', error);
        res.status(500).json({ message: 'Error interno obteniendo protocolo' });
    }
};

export const requestAdvisor = (req, res) => {
    try {
        const student_id = req.user.id;
        const { advisor_id } = req.body;
        const db = req.db;

        if (!advisor_id) return res.status(400).json({ message: 'advisor_id es requerido' });

        const protocol = db.prepare('SELECT id, advisor_status FROM protocols WHERE student_id = ?').get(student_id);
        if (!protocol) return res.status(404).json({ message: 'Debes registrar un protocolo primero' });
        
        const stmt = db.prepare('UPDATE protocols SET advisor_id = ?, advisor_status = ? WHERE student_id = ?');
        stmt.run(advisor_id, 'requested', student_id);

        res.json({ message: 'Solicitud enviada al asesor exitosamente' });
    } catch (error) {
        console.error('requestAdvisor error:', error);
        res.status(500).json({ message: 'Error conectando con el asesor' });
    }
};

export const updateChecklist = (req, res) => {
    try {
        const student_id = req.user.id;
        const { checklist_state } = req.body;
        const db = req.db;

        if (!checklist_state) return res.status(400).json({ message: 'estado es requerido' });

        const protocol = db.prepare('SELECT id FROM protocols WHERE student_id = ?').get(student_id);
        if (!protocol) return res.status(404).json({ message: 'No hay protocolo asociado' });

        const stmt = db.prepare('UPDATE protocols SET checklist_state = ? WHERE student_id = ?');
        stmt.run(JSON.stringify(checklist_state), student_id);
        
        res.json({ message: 'Checklist guardado' });
    } catch(err) {
        console.error('updateChecklist error:', err);
        res.status(500).json({ message: 'Error interno' });
    }
};
