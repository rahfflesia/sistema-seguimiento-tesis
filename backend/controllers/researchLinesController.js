export const getLines = (req, res) => {
    try {
        const db = req.db;
        const lines = db.prepare('SELECT * FROM research_lines ORDER BY created_at DESC').all();
        res.json(lines);
    } catch (error) {
        console.error('getLines error:', error);
        res.status(500).json({ message: 'Error fetching research lines' });
    }
};

export const createLine = (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Prohibido. Solo administradores.' });
        
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: 'El nombre es requerido' });

        const db = req.db;
        const stmt = db.prepare('INSERT INTO research_lines (name, description) VALUES (?, ?)');
        const info = stmt.run(name, description || '');
        
        res.status(201).json({ id: info.lastInsertRowid, name, description });
    } catch (error) {
        console.error('createLine error:', error);
        res.status(500).json({ message: 'Error creando la línea de investigación' });
    }
};

export const updateLine = (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Prohibido.' });
        
        const { id } = req.params;
        const { name, description } = req.body;
        
        if (!name) return res.status(400).json({ message: 'El nombre es requerido' });

        const db = req.db;
        const stmt = db.prepare('UPDATE research_lines SET name = ?, description = ? WHERE id = ?');
        const info = stmt.run(name, description || '', id);

        if (info.changes === 0) return res.status(404).json({ message: 'No encontrado' });
        
        res.json({ id, name, description });
    } catch (error) {
        console.error('updateLine error:', error);
        res.status(500).json({ message: 'Error actualizando' });
    }
};

export const deleteLine = (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Prohibido.' });
        
        const { id } = req.params;
        const db = req.db;
        
        const stmt = db.prepare('DELETE FROM research_lines WHERE id = ?');
        const info = stmt.run(id);

        if (info.changes === 0) return res.status(404).json({ message: 'No encontrado' });
        
        res.json({ message: 'Eliminado con éxito' });
    } catch (error) {
        console.error('deleteLine error:', error);
        res.status(500).json({ message: 'Error eliminando' });
    }
};
