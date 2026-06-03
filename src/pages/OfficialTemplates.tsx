import { useState, useEffect } from 'react';
import { FileText, Download, FileSpreadsheet, Presentation } from 'lucide-react';
import './OfficialTemplates.css';

const OfficialTemplates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/templates', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al cargar plantillas');
        const data = await res.json();
        setTemplates(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [token]);

  const getIcon = (category: string) => {
    switch (category) {
      case 'Excel': return <FileSpreadsheet size={32} className="text-success" />;
      case 'PowerPoint': return <Presentation size={32} className="text-warning" />;
      default: return <FileText size={32} className="text-info" />;
    }
  };

  const handleDownload = (url: string, title: string, format: string) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5000${url}`;
    link.download = `${title.replace(/\s+/g, '_')}${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="page-container"><p>Cargando plantillas...</p></div>;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h2>Plantillas Oficiales UAS</h2>
        <p>Descarga los archivos base para estructurar tus documentos según la normativa institucional.</p>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="templates-grid">
        {templates.map(template => (
          <div key={template.id} className="template-card glass-panel">
            <div className="template-icon-wrapper">
              {getIcon(template.category)}
            </div>
            
            <div className="template-content">
              <h3>{template.title}</h3>
              <p>{template.description}</p>
              
              <div className="template-meta">
                <span className="badge category">{template.category}</span>
                <span className="file-info">{template.size} &bull; {template.format}</span>
              </div>
            </div>

            <button 
              className="download-btn flex-center gap-2"
              onClick={() => handleDownload(template.url, template.title, template.format)}
            >
              <Download size={18} />
              <span>Descargar</span>
            </button>
          </div>
        ))}
        {templates.length === 0 && !error && (
            <p>No hay plantillas disponibles en este momento.</p>
        )}
      </div>
    </div>
  );
};

export default OfficialTemplates;
