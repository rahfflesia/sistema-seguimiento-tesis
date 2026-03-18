import { FileText, Download, FileSpreadsheet, Presentation } from 'lucide-react';
import './OfficialTemplates.css';

const TEMPLATES = [
  {
    id: 1,
    title: 'Plantilla de Protocolo Institucional',
    category: 'Word',
    icon: <FileText size={32} className="text-info" />,
    size: '1.2 MB',
    format: '.docx',
    description: 'Documento base con los márgenes, fuentes y portadas oficiales para el registro.'
  },
  {
    id: 2,
    title: 'Formato de Cronograma Gantt',
    category: 'Excel',
    icon: <FileSpreadsheet size={32} className="text-success" />,
    size: '450 KB',
    format: '.xlsx',
    description: 'Plantilla de Excel automatizada para planificar los tiempos de tu investigación.'
  },
  {
    id: 3,
    title: 'Plantilla Presentación de Defensa',
    category: 'PowerPoint',
    icon: <Presentation size={32} className="text-warning" />,
    size: '3.4 MB',
    format: '.pptx',
    description: 'Diapositivas configuradas con el diseño institucional para el examen profesional.'
  },
  {
    id: 4,
    title: 'Solicitud de Director de Tesis',
    category: 'PDF / Word',
    icon: <FileText size={32} className="text-primary" />,
    size: '120 KB',
    format: '.doc',
    description: 'Formulario oficial para solicitar formalmente a un profesor.'
  }
];

const OfficialTemplates = () => {
  const handleDownload = (title: string, format: string) => {
    // Simulated download
    const blob = new Blob(["Simulated content for " + title], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h2>Plantillas Oficiales UAS</h2>
        <p>Descarga los archivos base para estructurar tus documentos según la normativa institucional.</p>
      </div>

      <div className="templates-grid">
        {TEMPLATES.map(template => (
          <div key={template.id} className="template-card glass-panel">
            <div className="template-icon-wrapper">
              {template.icon}
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
              onClick={() => handleDownload(template.title, template.format)}
            >
              <Download size={18} />
              <span>Descargar</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfficialTemplates;
