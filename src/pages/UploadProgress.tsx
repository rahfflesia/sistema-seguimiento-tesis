import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, X, CheckCircle, AlertCircle, MessageSquare, Send, Download, Eye } from 'lucide-react';
import './UploadProgress.css';

interface FileUpload {
  id: string | number;
  name: string;
  size: number;
  status: 'uploading' | 'scanning' | 'completed' | 'error';
  progress: number;
  plagiarism_score?: number;
  created_at?: string;
}

const UploadProgress = () => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [protocolError, setProtocolError] = useState('');
  
  // Comments state
  const [selectedFile, setSelectedFile] = useState<FileUpload | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  
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
                 status: d.status as any,
                 progress: 100,
                 plagiarism_score: d.plagiarism_score,
                 created_at: d.created_at
             }));
            setFiles(historyFiles);
            if (historyFiles.length > 0 && !selectedFile) {
                setSelectedFile(historyFiles[0]);
            }
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

  // Fetch comments when selected file changes
  useEffect(() => {
    if (!selectedFile || selectedFile.status !== 'completed' || typeof selectedFile.id !== 'number') return;
    
    const fetchComments = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/advances/${selectedFile.id}/comments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (e) {
            console.error("Error fetching comments", e);
        }
    };
    fetchComments();
  }, [selectedFile, token]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Store raw File objects by temp ID so we can send them after the progress animation
  const pendingFilesRef = useRef<Map<string, File>>(new Map());

  const saveToBackend = async (fileInfo: FileUpload) => {
    try {
        const rawFile = pendingFilesRef.current.get(fileInfo.id as string);
        
        const formData = new FormData();
        if (rawFile) {
            formData.append('file', rawFile);
            pendingFilesRef.current.delete(fileInfo.id as string);
        } else {
            formData.append('file_name', fileInfo.name);
            formData.append('file_size', String(fileInfo.size));
        }

        const res = await fetch('http://localhost:5000/api/advances', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!res.ok) throw new Error('Error al guardar avance');
        const data = await res.json();
        
        const completedFile = { 
          ...fileInfo, 
          id: data.id, 
          status: 'completed' as const, 
          plagiarism_score: data.plagiarism_score 
        };

        setFiles(prev => prev.map(f => f.id === fileInfo.id ? completedFile : f));
        
        if (!selectedFile || selectedFile.id === fileInfo.id) {
            setSelectedFile(completedFile);
        }
    } catch (e) {
        console.error(e);
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
          f.id === newFile.id ? { ...f, progress: 100, status: 'scanning' } : f
        ));
        
        setTimeout(() => {
          saveToBackend({ ...newFile, progress: 100, status: 'scanning' });
        }, 2000);
      } else {
        setFiles(prev => prev.map(f => 
          f.id === newFile.id ? { ...f, progress } : f
        ));
      }
    }, 400);
  };

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    if (protocolError) {
        alert(protocolError);
        return;
    }

    const newFiles: FileUpload[] = Array.from(selectedFiles).map((file) => {
      const tempId = Math.random().toString(36).substr(2, 9);
      pendingFilesRef.current.set(tempId, file);
      return {
        id: tempId,
        name: file.name,
        size: file.size,
        status: 'uploading' as const,
        progress: 0
      };
    });

    setFiles(prev => [...newFiles, ...prev]);
    newFiles.forEach(simulateUpload);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string | number) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFile?.id === id) {
        setSelectedFile(null);
        setComments([]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const submitComment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || !selectedFile || typeof selectedFile.id !== 'number') return;
      
      try {
          const res = await fetch(`http://localhost:5000/api/advances/${selectedFile.id}/comments`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ comment: newComment })
          });
          
          if (res.ok) {
              const savedComment = await res.json();
              setComments(prev => [...prev, savedComment]);
              setNewComment('');
          }
      } catch (err) {
          console.error(err);
      }
  };

  const handleDownload = (advanceId: string | number) => {
    const url = 'http://localhost:5000/api/advances/' + advanceId + '/download';
    const link = document.createElement('a');
    link.href = url;
    // Add auth token as query param for download (or use a hidden form)
    // For simplicity, open in new tab which triggers browser download
    window.open(url, '_blank');
  };

  const handleView = (advanceId: string | number) => {
    const url = 'http://localhost:5000/api/advances/' + advanceId + '/view';
    window.open(url, '_blank');
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
                <div 
                  key={file.id} 
                  className={`file-card glass-panel ${selectedFile?.id === file.id ? 'selected' : ''}`}
                  onClick={() => { if (file.status === 'completed') setSelectedFile(file); }}
                  style={{ cursor: file.status === 'completed' ? 'pointer' : 'default', border: selectedFile?.id === file.id ? '2px solid var(--primary-color)' : '' }}
                >
                  <div className="file-icon">
                    <FileText size={24} className={file.name.endsWith('.pdf') ? 'text-danger' : 'text-info'} />
                  </div>
                  
                  <div className="file-details">
                    <span className="file-name" title={file.name}>{file.name}</span>
                    <span className="file-size">
                      {formatSize(file.size)} {file.created_at ? `- ${new Date(file.created_at).toLocaleDateString()}` : ''}
                      {file.plagiarism_score !== undefined && (
                        <span className={`plagiarism-score-badge ${file.plagiarism_score > 20 ? 'high' : 'low'}`}>
                          Similitud: {file.plagiarism_score}%
                        </span>
                      )}
                    </span>
                    
                    {file.status === 'uploading' && (
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${file.progress}%` }}></div>
                      </div>
                    )}
                    {file.status === 'scanning' && (
                      <div className="scanning-text-academic">
                        <span className="loading-spinner-tiny"></span>
                        <span>Analizando similitud en Turnitin...</span>
                      </div>
                    )}
                  </div>

                  <div className="file-status">
                    {file.status === 'uploading' && <span className="text-secondary">{Math.round(file.progress)}%</span>}
                    {file.status === 'scanning' && <span className="text-warning" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Turnitin</span>}
                    {file.status === 'completed' && <CheckCircle size={20} className="text-success" />}
                    {file.status === 'error' && <AlertCircle size={20} className="text-danger" />}
                  </div>

                  {file.status === 'completed' && (
                    <>
                      <button 
                        className="download-btn-small" 
                        onClick={(e) => { e.stopPropagation(); handleView(file.id); }}
                        title="Ver vista previa"
                        style={{ marginRight: '0.25rem' }}
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="download-btn-small" 
                        onClick={(e) => { e.stopPropagation(); handleDownload(file.id); }}
                        title="Descargar archivo"
                        style={{ marginRight: '0.25rem' }}
                      >
                        <Download size={18} />
                      </button>
                    </>
                  )}

                  <button className="remove-btn" onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}>
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {selectedFile && typeof selectedFile.id === 'number' && (
        <div className="feedback-preview glass-panel mt-6">
          <div className="header-flex">
            <h3>Historial de Revisiones: {selectedFile.name}</h3>
            <span className="status-badge review"><MessageSquare size={14} style={{display:'inline', marginRight: '4px'}}/> Comentarios</span>
          </div>
          
          <div className="comment-thread mt-4">
            {comments.length === 0 ? (
                <p className="text-muted" style={{textAlign: 'center', padding: '2rem'}}>Aún no hay comentarios en este documento.</p>
            ) : (
                comments.map(c => (
                    <div key={c.id} className={`comment ${c.user_role === 'student' ? 'alumno' : 'asesor'}`}>
                        <div className={`comment-avatar ${c.user_role === 'student' ? 'alumno-avatar' : ''}`}>
                            {c.user_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="comment-body">
                            <strong>{c.user_name}</strong> <span className="time">{new Date(c.created_at).toLocaleString()}</span>
                            <p>{c.comment}</p>
                        </div>
                    </div>
                ))
            )}
          </div>

          <form className="comment-form mt-4" onSubmit={submitComment} style={{display: 'flex', gap: '1rem'}}>
            <input 
                type="text" 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Escribe un comentario o respuesta..." 
                className="premium-input" 
                style={{flex: 1}}
            />
            <button type="submit" className="btn-primary" disabled={!newComment.trim()}>
                <Send size={18} /> Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UploadProgress;
