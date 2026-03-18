import { useState } from 'react';
import { Search, Star, UserPlus, Check, Filter } from 'lucide-react';
import './AdvisorSelection.css';

// Simulated data
const ADVISORS_DATA = [
  {
    id: 1,
    name: 'Dr. Roberto Mendoza',
    department: 'Inteligencia Artificial',
    expertise: ['Machine Learning', 'Visión Computacional', 'Redes Neuronales'],
    availability: 'Alta',
    rating: 4.8,
    avatar: 'RM'
  },
  {
    id: 2,
    name: 'Dra. Elena Vázquez',
    department: 'Software Educativo',
    expertise: ['Gamificación', 'E-learning', 'HCI'],
    availability: 'Media',
    rating: 4.9,
    avatar: 'EV'
  },
  {
    id: 3,
    name: 'Dr. Carlos Jiménez',
    department: 'Seguridad Informática',
    expertise: ['Criptografía', 'Seguridad en Redes', 'Forense Digital'],
    availability: 'Baja',
    rating: 4.6,
    avatar: 'CJ'
  },
  {
    id: 4,
    name: 'M.C. Laura Torres',
    department: 'Ingeniería Web',
    expertise: ['Arquitecturas Cloud', 'Microservicios', 'PWA'],
    availability: 'Alta',
    rating: 4.7,
    avatar: 'LT'
  }
];

const AdvisorSelection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [requestedAdvisorId, setRequestedAdvisorId] = useState<number | null>(null);

  const handleRequest = (id: number) => {
    setRequestedAdvisorId(id);
    // Real implementation would make an API call here
  };

  const filteredAdvisors = ADVISORS_DATA.filter(adv => 
    adv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adv.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h2>Vinculación con Asesor</h2>
        <p>Explora el directorio de profesores investigadores y solicita la dirección de tu tesis.</p>
      </div>

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
              {advisor.expertise.map((exp, idx) => (
                <span key={idx} className="tag">{exp}</span>
              ))}
            </div>

            <div className="card-actions">
              <button className="btn-secondary">Ver Perfil</button>
              {requestedAdvisorId === advisor.id ? (
                <button className="btn-primary success" disabled>
                  <Check size={18} /> Solicitud Enviada
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  onClick={() => handleRequest(advisor.id)}
                  disabled={requestedAdvisorId !== null}
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
