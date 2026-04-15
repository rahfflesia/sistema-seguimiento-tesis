export const getAdvisors = (req, res) => {
    try {
        const db = req.db;
        // Fetch users with role 'advisor'
        // Simulating availability, rating and expertise using id based mock values for prototype purposes
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
