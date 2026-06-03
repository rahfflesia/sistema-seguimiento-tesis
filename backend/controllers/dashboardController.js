export const getDashboardData = (req, res) => {
    try {
        const userId = req.user.id;
        const db = req.db;

        // Fetch User Info
        const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.role === 'student') {
            // Student flow
            let timelineData = [];
            let progressPercentage = 0;
            let nextDelivery = { date: 'Por definir', chapter: 'Esperando registro de protocolo', daysLeft: 0 };
            let plagiarismScore = 0;
            let advisorMessage = null;

            const protocol = db.prepare('SELECT p.*, r.name as line_name FROM protocols p LEFT JOIN research_lines r ON p.research_line_id = r.id WHERE p.student_id = ?').get(userId);

            if (protocol) {
                timelineData.push({ id: 1, title: 'Registro de Protocolo', date: new Date(protocol.created_at).toLocaleDateString(), status: 'completed', description: protocol.title });
                
                if (protocol.advisor_id) {
                    timelineData.push({ id: 2, title: 'Asignación de Asesor', date: 'Asignado', status: protocol.advisor_status === 'accepted' ? 'completed' : 'in-progress', description: 'Trámite con el asesor' });
                } else {
                    timelineData.push({ id: 2, title: 'Asignación de Asesor', date: 'Pendiente', status: 'pending', description: 'Selecciona un asesor en el directorio.' });
                }

                // Check advances
                const advances = db.prepare('SELECT * FROM advances WHERE protocol_id = ? ORDER BY created_at ASC').all(protocol.id);
                if (advances.length > 0) {
                    timelineData.push({ id: 3, title: 'Entrega de Avances', date: new Date(advances[0].created_at).toLocaleDateString(), status: 'completed', description: `${advances.length} archivo(s) subido(s).` });
                    timelineData.push({ id: 4, title: 'Revisión Final', date: 'Próximamente', status: 'pending', description: 'Aprobación del comité.' });
                    progressPercentage = Math.min(30 + (advances.length * 20), 90);
                    nextDelivery = { date: 'Siguiente fase', chapter: `Avance ${advances.length + 1}`, daysLeft: 14 };
                    
                    // Fetch advisor's latest comment on their latest advance
                    const latestAdvance = advances[advances.length - 1];
                    plagiarismScore = latestAdvance.plagiarism_score || 0;
                    const latestComment = db.prepare(`
                        SELECT c.comment, u.name as advisor_name
                        FROM advance_comments c
                        JOIN users u ON c.user_id = u.id
                        WHERE c.advance_id = ? AND u.role = 'advisor'
                        ORDER BY c.created_at DESC LIMIT 1
                    `).get(latestAdvance.id);
                    if (latestComment) {
                        advisorMessage = {
                            author: latestComment.advisor_name,
                            text: latestComment.comment
                        };
                    }
                } else {
                    timelineData.push({ id: 3, title: 'Entrega Capítulo 1', date: 'Pendiente', status: 'in-progress', description: 'Sube tu primer avance.' });
                    progressPercentage = protocol.advisor_status === 'accepted' ? 25 : 10;
                    nextDelivery = { date: 'Próxima semana', chapter: 'Capítulo 1', daysLeft: 7 };
                }
            } else {
                 timelineData.push({ id: 1, title: 'Registro de Protocolo', date: 'Pendiente', status: 'in-progress', description: 'No has registrado tu protocolo.' });
                 progressPercentage = 0;
            }

            return res.json({
                user: { name: user.name, role: user.role, welcomeMessage: `Hola, ${user.name}` },
                dashboard: {
                    role: 'student',
                    progressPercentage,
                    nextDelivery,
                    timeline: timelineData,
                    plagiarismScore,
                    advisorMessage
                }
            });
        } 
        
        if (user.role === 'advisor') {
            // Advisor flow
            const activeAdvisees = db.prepare('SELECT COUNT(*) as count FROM protocols WHERE advisor_id = ? AND advisor_status = \'accepted\'').get(userId).count;
            const pendingRequests = db.prepare('SELECT COUNT(*) as count FROM protocols WHERE advisor_id = ? AND advisor_status = \'requested\'').get(userId).count;
            const totalComments = db.prepare('SELECT COUNT(*) as count FROM advance_comments WHERE user_id = ?').get(userId).count;

            const recentSubmissions = db.prepare(`
                SELECT a.id, a.file_name as fileName, a.created_at as date, u.name as studentName
                FROM advances a
                JOIN protocols p ON a.protocol_id = p.id
                JOIN users u ON p.student_id = u.id
                WHERE p.advisor_id = ? AND p.advisor_status = 'accepted'
                ORDER BY a.created_at DESC LIMIT 5
            `).all(userId);

            const timeline = db.prepare(`
                SELECT p.id, u.name as title, p.title as description, p.created_at as date, p.advisor_status as status
                FROM protocols p
                JOIN users u ON p.student_id = u.id
                WHERE p.advisor_id = ?
                ORDER BY p.created_at DESC LIMIT 5
            `).all(userId);

            const formattedTimeline = timeline.map(item => ({
                id: item.id,
                title: `Solicitud de ${item.title}`,
                date: new Date(item.date).toLocaleDateString(),
                status: item.status === 'accepted' ? 'completed' : item.status === 'requested' ? 'in-progress' : 'pending',
                description: `Propuesta: "${item.description.substring(0, 50)}..."`
            }));

            return res.json({
                user: { name: user.name, role: user.role, welcomeMessage: `Hola Profesor, ${user.name}` },
                dashboard: {
                    role: 'advisor',
                    stats: { activeAdvisees, pendingRequests, totalComments },
                    recentSubmissions,
                    timeline: formattedTimeline
                }
            });
        }

        if (user.role === 'admin') {
            // Admin flow
            const totalStudents = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = \'student\'').get().count;
            const totalAdvisors = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = \'advisor\'').get().count;
            const totalLines = db.prepare('SELECT COUNT(*) as count FROM research_lines').get().count;
            const totalProtocols = db.prepare('SELECT COUNT(*) as count FROM protocols').get().count;

            const recentUsers = db.prepare(`
                SELECT id, name, email, role, created_at as date
                FROM users
                ORDER BY created_at DESC LIMIT 5
            `).all();

            const timeline = db.prepare(`
                SELECT id, title as description, 'Registro de Protocolo' as title, created_at as date
                FROM protocols
                ORDER BY created_at DESC LIMIT 5
            `).all();

            const formattedTimeline = timeline.map(item => ({
                id: item.id,
                title: item.title,
                date: new Date(item.date).toLocaleDateString(),
                status: 'completed',
                description: `Propuesta registrada: "${item.description.substring(0, 50)}..."`
            }));

            return res.json({
                user: { name: user.name, role: user.role, welcomeMessage: `Administración: ${user.name}` },
                dashboard: {
                    role: 'admin',
                    stats: { totalStudents, totalAdvisors, totalLines, totalProtocols },
                    recentUsers,
                    timeline: formattedTimeline
                }
            });
        }

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
