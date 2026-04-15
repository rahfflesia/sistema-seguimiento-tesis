import { useState, useEffect } from 'react';
import { Download, Calendar, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        if (!res.ok) throw new Error('Error al cargar los datos');

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

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

  if (loading) {
    return <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><h3>Cargando información...</h3></div>;
  }

  if (error || !data) {
    return <div className="page-container"><p style={{color: 'red'}}>{error}</p></div>;
  }

  const { user, dashboard } = data;

  return (
    <div className="page-container animate-fade-in dashboard-layout">
      
      {/* Mockup-style Premium Greeting */}
      <div className="dashboard-greeting">
        <h1 className="greeting-title">{user.welcomeMessage}</h1>
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
                strokeDasharray={`${dashboard.progressPercentage}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">{dashboard.progressPercentage}%</text>
            </svg>
          </div>
          <p>Tesis en Desarrollo</p>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-header">
            <h3>Próxima Entrega</h3>
            <Calendar className="text-primary" />
          </div>
          <p className="stat-value">{dashboard.nextDelivery.date}</p>
          <p className="stat-desc">{dashboard.nextDelivery.chapter} (Faltan {dashboard.nextDelivery.daysLeft} días)</p>
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
            {dashboard.timeline.map((item: any) => (
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
            <p>El último escaneo del Capítulo 1 arroja un <strong>{dashboard.plagiarismScore}% de similitud</strong>.</p>
            <div className="similarity-bar-container">
              <div className="similarity-bar" style={{width: `${dashboard.plagiarismScore}%`}}></div>
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
