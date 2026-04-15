import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key_for_dev';

export const verifyToken = (req, res, next) => {
    // Extraer el token del header (Ej: "Bearer eyJhbGci...")
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado: Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified; // Agregamos la información del token al request
        next(); // Continuar a la siguiente función
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};
