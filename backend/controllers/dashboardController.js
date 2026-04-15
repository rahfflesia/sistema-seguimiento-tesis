export const getDashboardData = (req, res) => {
    try {
        const userId = req.user.id;
        const db = req.db;

        // Fetch User Info
        const user = db.prepare('SELECT name, email, role FROM users WHERE id = ?').get(userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Generate dynamic timeline data specific to this user profile (mock logic for structure)
        const timelineData = [
            { id: 1, title: 'Registro de Protocolo', date: 'Hace 2 meses', status: 'completed', description: 'Aprobado oficialmente.' },
            { id: 2, title: 'Asignación de Asesor', date: 'Hace 1 mes', status: 'completed', description: 'Asesor principal asignado exitosamente.' },
            { id: 3, title: 'Entrega Capítulo 1', date: 'Semana Actual', status: 'in-progress', description: 'En revisión por el comité.' },
            { id: 4, title: 'Entrega Capítulo 2', date: 'Próximo mes', status: 'pending', description: 'Desarrollo de resultados.' }
        ];

        // Overall progress calculation logic based on timeline
        const completedTasks = timelineData.filter(t => t.status === 'completed').length;
        const progressPercentage = Math.round((completedTasks / timelineData.length) * 100);

        res.json({
            user: {
                name: user.name,
                role: user.role,
                welcomeMessage: `Hola, ${user.name}`
            },
            dashboard: {
                progressPercentage,
                nextDelivery: {
                    date: 'Próxima semana',
                    chapter: 'Capítulo 1',
                    daysLeft: 5
                },
                timeline: timelineData,
                plagiarismScore: 9 // Mock dynamic value
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
