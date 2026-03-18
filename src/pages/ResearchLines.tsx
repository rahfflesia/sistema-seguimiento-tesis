import { useState } from 'react';
import { Search, ChevronRight, BookOpen, Layers, Cpu, Globe } from 'lucide-react';
import './ResearchLines.css';

const CATEGORIES = [
  { id: 'all', name: 'Todas las Facultades' },
  { id: 'informática', name: 'Facultad de Informática' },
  { id: 'ingeniería', name: 'Facultad de Ingeniería' },
  { id: 'negocios', name: 'Facultad de Negocios' }
];

const RESEARCH_LINES = [
  {
    id: 1,
    title: 'Inteligencia Artificial y Ciencia de Datos',
    faculty: 'informática',
    icon: <Cpu size={24} />,
    description: 'Investigación orientada a algoritmos de aprendizaje automático, procesamiento de lenguaje natural, visión por computadora y análisis de grandes volúmenes de datos.',
    keywords: ['Machine Learning', 'Big Data', 'Deep Learning', 'NLP'],
    advisorsCount: 12
  },
  {
    id: 2,
    title: 'Desarrollo de Software Educativo',
    faculty: 'informática',
    icon: <BookOpen size={24} />,
    description: 'Diseño e implementación de herramientas tecnológicas aplicadas a la educación, plataformas de e-learning y gamificación.',
    keywords: ['E-learning', 'Gamificación', 'HCI', 'LMS'],
    advisorsCount: 8
  },
  {
    id: 3,
    title: 'Redes y Seguridad Informática',
    faculty: 'informática',
    icon: <Globe size={24} />,
    description: 'Análisis de vulnerabilidades, criptografía, seguridad en aplicaciones web y estructuras de redes modernas.',
    keywords: ['Criptografía', 'Forense Digital', 'Ciberseguridad'],
    advisorsCount: 5
  },
  {
    id: 4,
    title: 'Ingeniería Web y Tecnologías Móviles',
    faculty: 'ingeniería',
    icon: <Layers size={24} />,
    description: 'Arquitecturas orientadas a servicios, desarrollo de aplicaciones progresivas (PWA) y frameworks modernos para dispositivos móviles.',
    keywords: ['PWA', 'Microservicios', 'Arquitecturas Cloud'],
    advisorsCount: 15
  }
];

const ResearchLines = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLines = RESEARCH_LINES.filter(line => {
    const matchesCategory = activeCategory === 'all' || line.faculty === activeCategory;
    const matchesSearch = line.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          line.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h2>Líneas de Investigación Permitidas</h2>
        <p>Explora el catálogo oficial de temas autorizados por la facultad para el desarrollo de tesis de licenciatura.</p>
      </div>

      <div className="lines-controls glass-panel">
        <div className="category-tabs">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              className={`tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
        
        <div className="search-wrapper">
          <Search size={18} className="search-icon-small" />
          <input 
            type="text" 
            placeholder="Buscar tema o palabra clave..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-small"
          />
        </div>
      </div>

      <div className="lines-list">
        {filteredLines.map(line => (
          <div key={line.id} className="line-card glass-panel">
            <div className="line-icon-container">
              {line.icon}
            </div>
            
            <div className="line-content">
              <h3>{line.title}</h3>
              <p className="line-desc">{line.description}</p>
              
              <div className="keywords">
                {line.keywords.map((kw, idx) => (
                  <span key={idx} className="keyword-tag">{kw}</span>
                ))}
              </div>
            </div>
            
            <div className="line-meta">
              <div className="advisors-count">
                <span className="number">{line.advisorsCount}</span>
                <span className="label">Asesores Disponibles</span>
              </div>
              <button className="btn-explore">
                Ver Asesores <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}

        {filteredLines.length === 0 && (
          <div className="empty-state glass-panel">
            <p>No se encontraron líneas de investigación con esos criterios.</p>
            <button className="btn-text" onClick={() => {setSearchTerm(''); setActiveCategory('all');}}>Limpiar filtros</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchLines;
