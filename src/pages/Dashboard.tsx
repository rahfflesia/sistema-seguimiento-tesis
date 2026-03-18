import { useState } from 'react';
import { Download, Calendar, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import './Dashboard.css';

const TimelineData = [
  { id: 1, title: 'Registro de Protocolo', date: '15 Septiembre 2024', status: 'completed', description: 'Aprobado por el comité de titulación.' },
  { id: 2, title: 'Asignación de Asesor', date: '30 Septiembre 2024', status: 'completed', description: 'Dr. Roberto Mendoza asignado como director.' },
  { id: 3, title: 'Entrega Capítulo 1', date: '15 Noviembre 2024', status: 'completed', description: 'Marco teórico y planteamiento del problema.' },
  { id: 4, title: 'Entrega Capítulo 2 y 3', date: '20 Febrero 2025', status: 'in-progress', description: 'Desarrollo metodológico y resultados preliminares.' },
  { id: 5, title: 'Revisión Final de Borrador', date: '15 Abril 2025', status: 'pending', description: 'Revisión de formato y documento completo.' },
  { id: 6, title: 'Examen Profesional', date: 'Por definir', status: 'pending', description: 'Defensa de tesis ante sínodo.' }
];

const Dashboard = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      window.print(); // Easy simulated PDF generation
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={24} className="text-success" />;
      case 'in-progress': return <Clock size={24} className="text-warning" />;
      default: return <CircleEmpty />;
    }
  };

  return (
    <div className="page-container animate-fade-in dashboard-layout">
      
      {/* Mockup-style Premium Greeting */}
      <div className="dashboard-greeting">
        <h1 className="greeting-title">Hola, Alumno UAS</h1>
        <h2 className="greeting-subtitle text-gradient">¿En qué te puedo ayudar hoy?</h2>
      </div>

      {/* Overview Cards */}
      <div className="overview-grid">
        <div className="stat-card glass-panel gradient-blue">
          <h3>Progreso General</h3>
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="circular-chart blue">
              <path className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path className="circle"
                strokeDasharray="65, 100"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">65%</text>
            </svg>
          </div>
          <p>Tesis en Desarrollo</p>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-header">
            <h3>Próxima Entrega</h3>
            <Calendar className="text-primary" />
          </div>
          <p className="stat-value">20 Feb</p>
          <p className="stat-desc">Capítulo 2 y 3 (Faltan 8 días)</p>
          <button className="btn-outline-primary mt-auto">Ver Detalles <ArrowRight size={16}/></button>
        </div>

        <div className="stat-card glass-panel action-card">
          <h3>Reporte de Avance</h3>
          <p>Genera un documento PDF oficial con tu progreso validado por el asesor para trámites de servicio social o becas.</p>
          <button 
            className="btn-primary mt-auto" 
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? <span className="loading-spinner"></span> : <Download size={18} />}
            {isGenerating ? ' Generando...' : ' Descargar PDF'}
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Timeline Section */}
        <div className="timeline-container glass-panel">
          <div className="section-header">
            <h2>Cronograma de Actividades</h2>
            <p>Fechas clave y progreso de tu proyecto de titulación.</p>
          </div>
          
          <div className="timeline">
            {TimelineData.map((item, index) => (
              <div key={item.id} className={`timeline-item ${item.status}`}>
                <div className="timeline-line"></div>
                <div className="timeline-icon">
                  {getStatusIcon(item.status)}
                </div>
                <div className="timeline-content">
                  <div className="timeline-date">{item.date}</div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plagiarism Check Alert (Simulated Feature) */}
        <div className="side-panels">
          <div className="insight-panel glass-panel">
            <div className="insight-header">
              <AlertCircle className="text-danger" size={24} />
              <h3>Revisión de Originalidad</h3>
            </div>
            <p>El último escaneo del Capítulo 1 arroja un <strong>9% de similitud</strong>.</p>
            <div className="similarity-bar-container">
              <div className="similarity-bar" style={{width: '9%'}}></div>
            </div>
            <p className="hint">Métrica dentro del límite permitido (20%). ¡Buen trabajo!</p>
          </div>

          <div className="insight-panel glass-panel">
            <div className="insight-header">
              <div className="avatar-small">RM</div>
              <h3>Mensaje del Asesor</h3>
            </div>
            <p className="message-preview">"Por favor, revisa las correcciones que dejé en la justificación antes de continuar con la metodología."</p>
            <button className="btn-text">Ir a Carga de Avances →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component helper
const CircleEmpty = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);

export default Dashboard;
