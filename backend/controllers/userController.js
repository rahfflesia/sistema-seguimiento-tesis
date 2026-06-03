export const getAdvisors = (req, res) => {
    try {
        const db = req.db;
        const advisors = db.prepare('SELECT id, name, email FROM users WHERE role = ?').all('advisor');
        
        const enhancedAdvisors = advisors.map(adv => ({
            id: adv.id,
            name: adv.name,
            email: adv.email,
            department: 'Sistemas',
            expertise: ['Web', 'Machine Learning', 'Seguridad'],
            availability: adv.id % 2 === 0 ? 'Media' : 'Alta',
            rating: 4.5 + (0.1 * (adv.id % 5)),
            avatar: adv.name.substring(0, 2).toUpperCase()
        }));

        res.json(enhancedAdvisors);
    } catch (error) {
        console.error('getAdvisors error:', error);
        res.status(500).json({ message: 'Error interno obteniendo asesores' });
    }
};

export const getAllUsers = (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Prohibido. Solo administradores.' });
        }
        const db = req.db;
        const users = db.prepare('SELECT id, name, email, role, created_at FROM users').all();
        res.json(users);
    } catch (error) {
        console.error('getAllUsers error:', error);
        res.status(500).json({ message: 'Error interno obteniendo usuarios' });
    }
};

export const updateUserRole = (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Prohibido.' });
        }
        const { id } = req.params;
        const { role } = req.body;
        const db = req.db;

        if (!role) {
            return res.status(400).json({ message: 'El rol es requerido' });
        }

        const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
        const info = stmt.run(role, id);

        if (info.changes === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Rol de usuario actualizado con éxito' });
    } catch (error) {
        console.error('updateUserRole error:', error);
        res.status(500).json({ message: 'Error interno actualizando rol' });
    }
};

export const deleteUser = (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Prohibido.' });
        }
        const { id } = req.params;
        const db = req.db;

        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta administrador' });
        }

        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        const info = stmt.run(id);

        if (info.changes === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado con éxito' });
    } catch (error) {
        console.error('deleteUser error:', error);
        res.status(500).json({ message: 'Error interno eliminando usuario' });
    }
};

export const getAdvisees = (req, res) => {
    try {
        const advisorId = req.user.id;
        const db = req.db;
        const advisees = db.prepare(`
            SELECT u.id as student_id, u.name as student_name, u.email as student_email, 
                   p.id as protocol_id, p.title as protocol_title, p.status as protocol_status, 
                   p.advisor_status, p.created_at as protocol_date
            FROM protocols p
            JOIN users u ON p.student_id = u.id
            WHERE p.advisor_id = ?
        `).all(advisorId);

        res.json(advisees);
    } catch (error) {
        console.error('getAdvisees error:', error);
        res.status(500).json({ message: 'Error interno obteniendo alumnos' });
    }
};

export const updateAdviseeStatus = (req, res) => {
    try {
        const advisorId = req.user.id;
        const { protocol_id, status } = req.body;
        const db = req.db;

        if (!protocol_id || !status) {
            return res.status(400).json({ message: 'protocol_id y status son requeridos' });
        }

        const stmt = db.prepare('UPDATE protocols SET advisor_status = ? WHERE id = ? AND advisor_id = ?');
        const info = stmt.run(status, protocol_id, advisorId);

        if (info.changes === 0) {
            return res.status(404).json({ message: 'Registro no encontrado o no autorizado' });
        }

        res.json({ message: `Solicitud ${status === 'accepted' ? 'aceptada' : 'rechazada'} con éxito` });
    } catch (error) {
        console.error('updateAdviseeStatus error:', error);
        res.status(500).json({ message: 'Error interno actualizando estado' });
    }
};
