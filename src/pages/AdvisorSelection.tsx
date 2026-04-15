import { useState, useEffect } from 'react';
import { Search, Star, UserPlus, Check, Filter, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdvisorSelection.css';

const AdvisorSelection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [protocol, setProtocol] = useState<any>(null);
  
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
          <p>Para poder solicitar la revisión de un asesor, primero debes proponer tu tema.</p>
          <button className="btn-primary mt-4" onClick={() => navigate('/protocol')}>Ir a Registro de Protocolo</button>
        </div>
      )}

      {protocol && protocol.advisor_id && (
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
              <button className="btn-secondary">Ver Perfil</button>
              {protocol?.advisor_id === advisor.id ? (
                <button className="btn-primary success" disabled>
                  <Check size={18} /> Solicitud {protocol.advisor_status === 'requested' ? 'Enviada' : 'Aceptada'}
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  onClick={() => handleRequest(advisor.id)}
                  disabled={!protocol || protocol.advisor_id || isSubmitting}
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
    </div>
  );
};

export default AdvisorSelection;
