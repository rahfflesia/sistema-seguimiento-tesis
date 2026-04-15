import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import './UploadProgress.css';

interface FileUpload {
  id: string | number;
  name: string;
  size: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  created_at?: string;
}

const UploadProgress = () => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [protocolError, setProtocolError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Load history
    const loadHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/advances', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
            const historyFiles = data.map((d: any) => ({
                id: d.id,
                name: d.file_name,
                size: d.file_size,
                status: d.status,
                progress: 100,
                created_at: d.created_at
            }));
            setFiles(historyFiles);
        } else if (res.status === 404) {
            setProtocolError('Debes registrar tu protocolo primero antes de subir avances.');
        } else if (data.message && typeof data.message === 'string' && data.message.includes('protocolo activo')) {
            setProtocolError('Debes tener un protocolo activo para empezar a enviar avances.');
        }
      } catch (e) {
          console.error("Error cargando avances", e);
      }
    };
    loadHistory();
  }, [token]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const saveToBackend = async (fileInfo: FileUpload) => {
    try {
        const res = await fetch('http://localhost:5000/api/advances', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file_name: fileInfo.name,
                file_size: fileInfo.size
            })
        });
        
        if (!res.ok) throw new Error('Error al guardar avance');
    } catch (e) {
        console.error(e);
        // Marcamos error visual en caso de fallar red
        setFiles(prev => prev.map(f => f.id === fileInfo.id ? { ...f, status: 'error' } : f));
    }
  }

  const simulateUpload = (newFile: FileUpload) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setFiles(prev => prev.map(f => 
          f.id === newFile.id ? { ...f, progress: 100, status: 'completed' } : f
        ));
        
        saveToBackend(newFile); // Save it once the bar hits 100%
      } else {
        setFiles(prev => prev.map(f => 
          f.id === newFile.id ? { ...f, progress } : f
        ));
      }
    }, 500);
  };

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    if (protocolError) {
        alert(protocolError);
        return;
    }

    const newFiles: FileUpload[] = Array.from(selectedFiles).map((file) => ({
      id: Math.random().toString(36).substr(2, 9), // temp id
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...newFiles, ...prev]);
    newFiles.forEach(simulateUpload);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string | number) => {
    // Para simplificar, local remove. Un app real haría API request DELETE
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h2>Carga de Avances</h2>
        <p>Sube tus capítulos o avances en formato Word (.doc, .docx) o PDF para revisión de tu asesor.</p>
      </div>

      <div className="upload-section">
        <div 
          className={`drop-zone glass-panel ${isDragging ? 'dragging' : ''} ${protocolError ? 'disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => { if(!protocolError) fileInputRef.current?.click(); }}
          style={protocolError ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleFiles(e.target.files)} 
            multiple 
            accept=".doc,.docx,.pdf"
            className="hidden-input" 
          />
          <div className="drop-zone-content">
            {protocolError ? (
                <>
                <AlertCircle size={48} className="text-danger mb-4" />
                <h3>{protocolError}</h3>
                </>
            ) : (
                <>
                <UploadCloud size={48} className="upload-icon" />
                <h3>Arrastra y suelta tus archivos aquí</h3>
                <p>o haz clic para explorar en tu computadora</p>
                <span className="file-hints">Soportado: PDF, DOC, DOCX (Max 20MB)</span>
                </>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <div className="files-list">
            <h3 className="section-title">Archivos de Avances ({files.length})</h3>
            <div className="files-grid">
              {files.map(file => (
                <div key={file.id} className="file-card glass-panel">
                  <div className="file-icon">
                    <FileText size={24} className={file.name.endsWith('.pdf') ? 'text-danger' : 'text-info'} />
                  </div>
                  
                  <div className="file-details">
                    <span className="file-name" title={file.name}>{file.name}</span>
                    <span className="file-size">{formatSize(file.size)} {file.created_at ? `- ${new Date(file.created_at).toLocaleDateString()}` : ''}</span>
                    
                    {file.status === 'uploading' && (
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${file.progress}%` }}></div>
                      </div>
                    )}
                  </div>

                  <div className="file-status">
                    {file.status === 'uploading' && <span className="text-secondary">{Math.round(file.progress)}%</span>}
                    {file.status === 'completed' && <CheckCircle size={20} className="text-success" />}
                    {file.status === 'error' && <AlertCircle size={20} className="text-danger" />}
                  </div>

                  <button className="remove-btn" onClick={() => removeFile(file.id)}>
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Simulation for retroalimentación visual de la plataforma (mismo archivo pero calificado) */}
      <div className="feedback-preview glass-panel">
        <div className="header-flex">
          <h3>Ejemplo: Historial de Revisiones</h3>
          <span className="status-badge review">En Revisión por Asesor</span>
        </div>
        <p className="text-muted">Una vez que tu asesor revise uno de los documentos de avance, sus comentarios aparecerán aquí.</p>
        
        <div className="comment-thread mt-4">
          <div className="comment asesor">
            <div className="comment-avatar">RM</div>
            <div className="comment-body">
              <strong>Dr. Roberto Mendoza</strong> <span className="time">Hace 2 días</span>
              <p>El marco teórico está bien estructurado, pero necesitas citar fuentes más recientes del 2024 en la sección de Machine Learning.</p>
            </div>
          </div>
          <div className="comment alumno">
            <div className="comment-avatar alumno-avatar">A</div>
            <div className="comment-body">
              <strong>Tú</strong> <span className="time">Ayer</span>
              <p>Entendido doctor, acabo de subir la versión corregida con referencias del IEEE de este año.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;
