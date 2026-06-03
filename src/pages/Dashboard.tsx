import { useState, useEffect } from 'react';
import { Download, Calendar, ArrowRight, CheckCircle2, Clock, AlertCircle, Users, BookOpen, MessageSquare, UserCheck, FileText } from 'lucide-react';
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
    setTimeout(() => {
      setIsGenerating(false);
      window.print();
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={20} className="text-success" />;
      case 'in-progress': return <Clock size={20} className="text-warning" />;
      default: return <Clock size={20} className="text-tertiary" style={{ opacity: 0.5 }} />;
    }
  };

  if (loading) {
    return <div className="page-container flex-center" style={{ minHeight: '60vh' }}><h3>Cargando información...</h3></div>;
  }

  if (error || !data) {
    return <div className="page-container"><p style={{color: 'red'}}>{error}</p></div>;
  }

  const { user, dashboard } = data;

  // 1. STUDENT DASHBOARD VIEW
  if (user.role === 'student') {
    return (
      <div className="page-container animate-fade-in dashboard-layout">
        <div className="dashboard-greeting-academic">
          <h1 className="greeting-title-academic">Expediente del Alumno: {user.name}</h1>
          <p className="greeting-subtitle-academic">Monitoreo académico de protocolo de tesis, vinculación de asesoría y avances de investigación.</p>
        </div>

        {/* Academic borderless metrics banner */}
        <div className="metrics-row-academic">
          <div className="metric-item-academic">
            <span className="metric-label-academic">Progreso General</span>
            <div className="progress-container-academic">
              <div className="progress-bar-wrapper-academic">
                <div className="progress-bar-fill-academic" style={{ width: `${dashboard.progressPercentage}%` }}></div>
              </div>
              <span className="progress-text-academic">{dashboard.progressPercentage}%</span>
            </div>
            <span className="metric-desc-academic">Capítulos de Tesis</span>
          </div>

          <div className="metric-item-academic">
            <span className="metric-label-academic">Próxima Entrega</span>
            <span className="metric-value-academic" style={{ fontSize: '1.25rem' }}>{dashboard.nextDelivery.date}</span>
            <span className="metric-desc-academic">{dashboard.nextDelivery.chapter} (Faltan {dashboard.nextDelivery.daysLeft} días)</span>
          </div>

          <div className="metric-item-academic">
            <span className="metric-label-academic">Reporte de Avances</span>
            <button 
              className="btn-action-academic" 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              style={{ marginTop: '0.25rem' }}
            >
              {isGenerating ? <Clock size={16} className="animate-spin" /> : <Download size={16} />}
              <span>{isGenerating ? 'Generando...' : 'Descargar PDF'}</span>
            </button>
          </div>
        </div>

        {/* Single Unified Academic sheet */}
        <div className="workspace-sheet-academic">
          <div className="sheet-section-academic">
            <h3 className="sheet-section-title-academic">Cronograma del Proyecto</h3>
            <p className="sheet-section-desc-academic">Fechas y estados clave del proceso de titulación actual.</p>
            
            <div className="timeline">
              {dashboard.timeline.map((item: any) => (
                <div key={item.id} className={`timeline-item ${item.status}`}>
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

          {/* Plagiarism analysis & Advisor message section stacked vertically */}
          <div className="sheet-section-academic">
            <h3 className="sheet-section-title-academic">Análisis de Similitud e Indicaciones</h3>
            <p className="sheet-section-desc-academic">Revisiones automáticas de Turnitin y observaciones emitidas por el director de tesis.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div className="similarity-indicator-academic">
                <span className="metric-label-academic">Originalidad (Turnitin)</span>
                {dashboard.plagiarismScore > 0 ? (
                  <>
                    <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-secondary)' }}>
                      El último análisis arroja un <strong>{dashboard.plagiarismScore}% de similitud</strong> (dentro del límite permitido del 20%).
                    </p>
                    <div className="similarity-bar-wrapper-academic">
                      <div className="similarity-bar-fill-academic" style={{ width: `${dashboard.plagiarismScore}%`, backgroundColor: dashboard.plagiarismScore > 20 ? 'var(--danger)' : 'var(--success)' }}></div>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-tertiary)' }}>No se registran análisis de Turnitin en la plataforma.</p>
                )}
              </div>

              {dashboard.advisorMessage ? (
                <div className="callout-academic">
                  <div className="callout-header-academic">
                    <MessageSquare size={16} />
                    <span>Observación del Asesor ({dashboard.advisorMessage.author})</span>
                  </div>
                  <p className="callout-body-academic">"{dashboard.advisorMessage.text}"</p>
                </div>
              ) : (
                <div className="callout-academic" style={{ borderLeftColor: 'var(--border-color)' }}>
                  <p className="callout-body-academic">No se registran observaciones pendientes en el expediente.</p>
                </div>
              )}

              <button className="btn-explore-academic" onClick={() => navigate('/progress')}>
                <span>Gestionar Carga de Avances</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. ADVISOR DASHBOARD VIEW
  if (user.role === 'advisor') {
    return (
      <div className="page-container animate-fade-in dashboard-layout">
        <div className="dashboard-greeting-academic">
          <h1 className="greeting-title-academic">Panel de Dirección Académica</h1>
          <p className="greeting-subtitle-academic">Docente Asesor: {user.name}</p>
        </div>

        {/* Academic borderless metrics banner */}
        <div className="metrics-row-academic">
          <div className="metric-item-academic">
            <span className="metric-label-academic">Alumnos Activos</span>
            <span className="metric-value-academic">{dashboard.stats.activeAdvisees}</span>
            <span className="metric-desc-academic">Bajo dirección de tesis</span>
          </div>

          <div className="metric-item-academic">
            <span className="metric-label-academic">Solicitudes Pendientes</span>
            <span className="metric-value-academic" style={{ color: dashboard.stats.pendingRequests > 0 ? 'var(--warning)' : 'var(--primary-color)' }}>
              {dashboard.stats.pendingRequests}
            </span>
            <span className="metric-desc-academic">Esperando vinculación</span>
          </div>

          <div className="metric-item-academic">
            <span className="metric-label-academic">Revisiones Emitidas</span>
            <span className="metric-value-academic">{dashboard.stats.totalComments}</span>
            <span className="metric-desc-academic">Comentarios guardados</span>
          </div>
        </div>

        {/* Single Workspace sheet */}
        <div className="workspace-sheet-academic">
          <div className="sheet-section-academic">
            <h3 className="sheet-section-title-academic">Solicitudes y Actividades Recientes</h3>
            <p className="sheet-section-desc-academic">Historial de vinculaciones de alumnos y propuestas registradas.</p>
            
            <div className="timeline">
              {dashboard.timeline.map((item: any) => (
                <div key={item.id} className={`timeline-item ${item.status}`}>
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
              {dashboard.timeline.length === 0 && (
                <p className="text-muted text-center py-4" style={{ fontSize: '0.85rem' }}>No se registran actividades recientes en la plataforma.</p>
              )}
            </div>
            
            <button className="btn-explore-academic" onClick={() => navigate('/advisees')} style={{ marginTop: '0.5rem' }}>
              <span>Administrar Vinculaciones y Alumnos</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="sheet-section-academic">
            <h3 className="sheet-section-title-academic">Últimas Entregas Recibidas</h3>
            <p className="sheet-section-desc-academic font-normal">Capítulos y documentos cargados recientemente por tus alumnos asesorados.</p>
            
            <div className="list-academic" style={{ marginTop: '0.5rem' }}>
              {dashboard.recentSubmissions.map((sub: any) => (
                <div key={sub.id} className="list-item-academic">
                  <div>
                    <div className="list-item-title-academic">{sub.studentName}</div>
                    <div className="list-item-desc-academic">
                      <FileText size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      <span>{sub.fileName}</span>
                    </div>
                  </div>
                  <span className="metric-desc-academic">{new Date(sub.date).toLocaleDateString()}</span>
                </div>
              ))}
              {dashboard.recentSubmissions.length === 0 && (
                <p className="text-muted py-4" style={{ fontSize: '0.85rem' }}>No se registran archivos entregados para revisar.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. ADMIN DASHBOARD VIEW
  if (user.role === 'admin') {
    return (
      <div className="page-container animate-fade-in dashboard-layout">
        <div className="dashboard-greeting-academic">
          <h1 className="greeting-title-academic">Consola de Control de Posgrado</h1>
          <p className="greeting-subtitle-academic">Coordinador Académico: {user.name}</p>
        </div>

        {/* Academic borderless metrics banner */}
        <div className="metrics-row-academic">
          <div className="metric-item-academic">
            <span className="metric-label-academic">Matrícula Estudiantes</span>
            <span className="metric-value-academic">{dashboard.stats.totalStudents}</span>
            <span className="metric-desc-academic">Registrados en el sistema</span>
          </div>

          <div className="metric-item-academic">
            <span className="metric-label-academic">Asesores Acreditados</span>
            <span className="metric-value-academic">{dashboard.stats.totalAdvisors}</span>
            <span className="metric-desc-academic">Docentes en directorio</span>
          </div>

          <div className="metric-item-academic">
            <span className="metric-label-academic">Líneas de Investigación</span>
            <span className="metric-value-academic">{dashboard.stats.totalLines}</span>
            <span className="metric-desc-academic">Temas autorizados</span>
          </div>
        </div>

        {/* Single Workspace sheet */}
        <div className="workspace-sheet-academic">
          <div className="sheet-section-academic">
            <h3 className="sheet-section-title-academic">Propuestas de Protocolo Recientes</h3>
            <p className="sheet-section-desc-academic">Últimos temas y objetivos registrados por los alumnos para dictaminación.</p>
            
            <div className="timeline">
              {dashboard.timeline.map((item: any) => (
                <div key={item.id} className="timeline-item completed">
                  <div className="timeline-icon">
                    <CheckCircle2 size={20} className="text-success" />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-date">{item.date}</div>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
              {dashboard.timeline.length === 0 && (
                <p className="text-muted text-center py-4" style={{ fontSize: '0.85rem' }}>No se registran propuestas de protocolos de tesis.</p>
              )}
            </div>
            
            <button className="btn-explore-academic" onClick={() => navigate('/protocols-admin')} style={{ marginTop: '0.5rem' }}>
              <span>Evaluar Propuestas de Protocolo</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="sheet-section-academic">
            <h3 className="sheet-section-title-academic">Últimos Usuarios Registrados</h3>
            <p className="sheet-section-desc-academic">Cuentas creadas recientemente en la plataforma de posgrados.</p>
            
            <div className="list-academic" style={{ marginTop: '0.5rem' }}>
              {dashboard.recentUsers.map((u: any) => (
                <div key={u.id} className="list-item-academic">
                  <div>
                    <div className="list-item-title-academic">{u.name}</div>
                    <div className="list-item-desc-academic">{u.email}</div>
                  </div>
                  <span className="badge info" style={{ fontSize: '0.65rem' }}>{u.role}</span>
                </div>
              ))}
            </div>
            
            <button className="btn-explore-academic" onClick={() => navigate('/users-admin')} style={{ marginTop: '0.5rem' }}>
              <span>Ver Catálogo de Usuarios</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
