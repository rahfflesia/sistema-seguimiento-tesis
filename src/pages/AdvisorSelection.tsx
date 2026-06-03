import { useState, useEffect } from 'react';
import { Search, Star, UserPlus, Check, Filter, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdvisorSelection.css';

const AdvisorSelection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [protocol, setProtocol] = useState<any>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      // Get active protocol to see if student can request, and if they already requested
      const protoRes = await fetch('http://localhost:5000/api/protocols/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (protoRes.ok) {
        const pData = await protoRes.json();
        setProtocol(pData);
      }

      // Get real advisors
      const advRes = await fetch('http://localhost:5000/api/users/advisors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (advRes.ok) {
        const advData = await advRes.json();
        setAdvisors(advData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleRequest = async (id: number) => {
    if (!protocol) {
      alert('Debes registrar un protocolo primero.');
      return;
    }
    
    if (!window.confirm('¿Deseas enviar una solicitud de vinculación a este asesor? Solo puedes enviar a uno.')) return;
    
    setIsSubmitting(true);
    try {
        const res = await fetch('http://localhost:5000/api/protocols/me/advisor', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ advisor_id: id })
        });
        
        const data = await res.json();
        if(!res.ok) throw new Error(data.message);
        
        alert(data.message);
        fetchData(); // reload
        setSelectedAdvisor(null);
    } catch(err: any) {
        alert(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const filteredAdvisors = advisors.filter(adv => 
    adv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adv.expertise.some((exp: string) => exp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="page-container"><p>Cargando asesores...</p></div>;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h2>Vinculación con Asesor</h2>
        <p>Explora el directorio de profesores investigadores y solicita la dirección de tu tesis.</p>
      </div>

      {!protocol && (
        <div className="insight-panel glass-panel mb-6 border-warning">
          <div className="insight-header">
            <AlertCircle className="text-warning" size={24} />
            <h3>Aún no tienes un protocolo activo</h3>
          </div>
          <p>Para poder solicitar la dirección de un asesor, primero debes proponer tu tema de tesis.</p>
          <button className="btn-primary mt-4" onClick={() => navigate('/protocol')}>Ir a Registro de Protocolo</button>
        </div>
      )}

      {protocol && protocol.status !== 'approved' && (
        <div className="insight-panel glass-panel mb-6 border-warning">
          <div className="insight-header">
            <AlertCircle className="text-warning" size={24} />
            <h3>Protocolo en revisión de coordinación</h3>
          </div>
          <p>
            {protocol.status === 'pending' 
              ? 'Su propuesta de protocolo de tesis está en proceso de revisión por la coordinación académica. Podrá seleccionar un asesor una vez sea aprobada.' 
              : 'Su propuesta de protocolo de tesis fue rechazada. Debe corregir su propuesta en la sección de Registro antes de solicitar asesoría.'}
          </p>
          <button className="btn-primary mt-4" onClick={() => navigate('/protocol')}>Ver Registro de Protocolo</button>
        </div>
      )}

      {protocol && protocol.status === 'approved' && protocol.advisor_id && (
        <div className="insight-panel glass-panel mb-6 border-success">
          <div className="insight-header">
            <Check className="text-success" size={24} />
            <h3>Solicitud en Proceso</h3>
          </div>
          <p>Has enviado una solicitud a un asesor. Estado de la solicitud: <strong>{protocol.advisor_status.toUpperCase()}</strong></p>
        </div>
      )}

      <div className="search-bar-container glass-panel">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, línea de investigación o tecnología..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="filter-btn">
          <Filter size={20} />
          <span>Filtros</span>
        </button>
      </div>

      <div className="advisors-grid">
        {filteredAdvisors.map(advisor => (
          <div key={advisor.id} className="advisor-card glass-panel">
            <div className="advisor-header">
              <div className="advisor-avatar">{advisor.avatar}</div>
              <div className="advisor-info">
                <h3>{advisor.name}</h3>
                <span className="department">{advisor.department}</span>
              </div>
            </div>
            
            <div className="advisor-stats">
              <div className="stat">
                <Star size={16} className="text-warning" />
                <span>{advisor.rating} Valoración</span>
              </div>
              <div className="stat">
                <span className={`availability-dot ${advisor.availability.toLowerCase()}`}></span>
                <span>Disponibilidad {advisor.availability}</span>
              </div>
            </div>

            <div className="expertise-tags">
              {advisor.expertise.map((exp: string, idx: number) => (
                <span key={idx} className="tag">{exp}</span>
              ))}
            </div>

            <div className="card-actions">
              <button className="btn-secondary" onClick={() => setSelectedAdvisor(advisor)}>Ver Perfil</button>
              {protocol?.advisor_id === advisor.id ? (
                <button className="btn-primary success" disabled>
                  <Check size={18} /> Solicitud {protocol.advisor_status === 'requested' ? 'Enviada' : 'Aceptada'}
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  onClick={() => handleRequest(advisor.id)}
                  disabled={!protocol || protocol.status !== 'approved' || protocol.advisor_id || isSubmitting}
                >
                  <UserPlus size={18} /> Solicitar Asesoría
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filteredAdvisors.length === 0 && (
        <div className="no-results glass-panel">
          <p>No se encontraron profesores que coincidan con tu búsqueda.</p>
        </div>
      )}

      {/* Modal Perfil de Asesor */}
      {selectedAdvisor && (
        <div className="modal-overlay" style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100}}>
            <div className="modal-content glass-panel" style={{width:'100%', maxWidth:'600px', padding:'2rem', position:'relative', background:'white'}}>
                <button onClick={() => setSelectedAdvisor(null)} style={{position:'absolute', top:'1rem', right:'1rem', background:'none', border:'none', cursor:'pointer'}}><X size={24}/></button>
                <div style={{display:'flex', gap:'1rem', alignItems:'center', marginBottom:'1.5rem'}}>
                    <div className="advisor-avatar" style={{width:'80px', height:'80px', fontSize:'2rem'}}>{selectedAdvisor.avatar}</div>
                    <div>
                        <h2 style={{margin:0}}>{selectedAdvisor.name}</h2>
                        <p style={{margin:0, color:'var(--text-secondary)'}}>{selectedAdvisor.department}</p>
                        <div style={{display:'flex', gap:'0.5rem', marginTop:'0.5rem', alignItems:'center'}}>
                             <Star size={18} className="text-warning" />
                             <strong>{selectedAdvisor.rating}</strong> (Evaluaciones de alumnos)
                        </div>
                    </div>
                </div>
                
                <h4 style={{marginBottom:'0.5rem'}}>Líneas de Investigación y Experiencia</h4>
                <div className="expertise-tags" style={{marginBottom:'1.5rem'}}>
                  {selectedAdvisor.expertise.map((exp: string, idx: number) => (
                    <span key={idx} className="tag">{exp}</span>
                  ))}
                </div>

                <h4 style={{marginBottom:'0.5rem'}}>Disponibilidad</h4>
                <p style={{marginBottom:'1.5rem'}}>
                    <span className={`availability-dot ${selectedAdvisor.availability.toLowerCase()}`}></span>
                    {selectedAdvisor.availability === 'Alta' ? 'Actualmente aceptando nuevos tesistas. Buen tiempo de respuesta.' : 
                     selectedAdvisor.availability === 'Media' ? 'Cupo limitado. Puede tardar un poco en responder solicitudes.' : 'Poco cupo disponible.'}
                </p>

                <div style={{display:'flex', justifyContent:'flex-end', gap:'1rem', marginTop:'2rem'}}>
                    <button className="btn-outline-primary" onClick={() => setSelectedAdvisor(null)}>Cerrar</button>
                    {!protocol?.advisor_id && (
                        <button 
                            className="btn-primary" 
                            onClick={() => handleRequest(selectedAdvisor.id)}
                            disabled={!protocol || protocol.status !== 'approved' || isSubmitting}
                        >
                            <UserPlus size={18} style={{marginRight:'0.5rem'}}/> Solicitar Asesoría
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdvisorSelection;
