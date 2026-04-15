import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key_for_dev';

export const register = (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const db = req.db;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        // Check if user already exists
        const userExists = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (userExists) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Hash password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Insert new user
        const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
        const result = stmt.run(name, email, hashedPassword, role || 'student');

        // Generate token
        const token = jwt.sign({ id: result.lastInsertRowid, role: role || 'student' }, JWT_SECRET, {
            expiresIn: '7d'
        });

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: {
                id: result.lastInsertRowid,
                name,
                email,
                role: role || 'student'
            },
            token
        });

    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const login = (req, res) => {
    try {
        const { email, password, role } = req.body;
        const db = req.db;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son requeridos' });
        }

        // Find user
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Optional UX check: if role was sent, verify it matches
        // (If the frontend sends the selected role from the dropdown)
        if (role && user.role !== role) {
            return res.status(401).json({ message: 'El rol seleccionado no coincide con su cuenta' });
        }

        // Verify password
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: '7d'
        });

        res.json({
            message: 'Inicio de sesión exitoso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
