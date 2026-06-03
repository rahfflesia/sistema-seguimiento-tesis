import { useState, useEffect } from 'react';
import { Users, FileText, Check, X, MessageSquare, Send, Calendar, AlertCircle, Download, Eye } from 'lucide-react';
import './Advisees.css';

const Advisees = () => {
  const [advisees, setAdvisees] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [advances, setAdvances] = useState<any[]>([]);
  const [selectedAdvance, setSelectedAdvance] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [loadingAdvances, setLoadingAdvances] = useState(false);
  const [error, setError] = useState('');
  
  const token = localStorage.getItem('token');

  const fetchAdvisees = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/advisees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar alumnos');
      const data = await res.json();
      setAdvisees(data);
      
      // Keep selected student synced if exists
      if (selectedStudent) {
        const updated = data.find((s: any) => s.student_id === selectedStudent.student_id);
        if (updated) setSelectedStudent(updated);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisees();
  }, [token]);

  // Fetch advances when selected student changes and is accepted
  useEffect(() => {
    if (!selectedStudent || selectedStudent.advisor_status !== 'accepted') {
      setAdvances([]);
      setSelectedAdvance(null);
      return;
    }

    const fetchAdvances = async () => {
      setLoadingAdvances(true);
      try {
        const res = await fetch(`http://localhost:5000/api/advances/student/${selectedStudent.student_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAdvances(data);
          if (data.length > 0) {
            setSelectedAdvance(data[0]);
          } else {
            setSelectedAdvance(null);
          }
        }
      } catch (e) {
        console.error('Error fetching student advances', e);
      } finally {
        setLoadingAdvances(false);
      }
    };

    fetchAdvances();
  }, [selectedStudent, token]);

  // Fetch comments when selected advance changes
  useEffect(() => {
    if (!selectedAdvance) {
      setComments([]);
      return;
    }

    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/advances/${selectedAdvance.id}/comments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (e) {
        console.error('Error fetching comments', e);
      }
    };

    fetchComments();
  }, [selectedAdvance, token]);

  const handleStatusChange = async (protocolId: number, status: 'accepted' | 'rejected') => {
    const confirmMsg = status === 'accepted' 
      ? '¿Estás seguro de que deseas aceptar la asesoría de este alumno?' 
      : '¿Estás seguro de que deseas rechazar la asesoría de este alumno?';
      
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch('http://localhost:5000/api/users/advisees/status', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ protocol_id: protocolId, status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      alert(data.message);
      fetchAdvisees();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedAdvance) return;

    try {
      const res = await fetch(`http://localhost:5000/api/advances/${selectedAdvance.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: newComment })
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, data]);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (advanceId: string | number) => {
    const url = 'http://localhost:5000/api/advances/' + advanceId + '/download';
    window.open(url, '_blank');
  };

  const handleView = (advanceId: string | number) => {
    const url = 'http://localhost:5000/api/advances/' + advanceId + '/view';
    window.open(url, '_blank');
  };

  if (loading) return <div className="page-container"><p>Cargando alumnos asesorados...</p></div>;

  return (
    <div className="page-container advisees-page animate-fade-in">
      <div className="page-header">
        <h2>Panel de Asesoría: Mis Alumnos</h2>
        <p>Gestiona solicitudes de vinculación, revisa protocolos y comenta los avances entregados.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="advisees-layout">
        {/* Left Column: Advisees List */}
        <div className="advisees-sidebar glass-panel">
          <h3 className="section-title">
            <Users size={20} />
            <span>Alumnos ({advisees.length})</span>
          </h3>

          <div className="student-list">
            {advisees.map(student => (
              <div 
                key={student.student_id} 
                className={`student-item ${selectedStudent?.student_id === student.student_id ? 'active' : ''}`}
                onClick={() => setSelectedStudent(student)}
              >
                <div className="student-badge">
                  {student.student_name.substring(0, 2).toUpperCase()}
                </div>
                <div className="student-summary">
                  <h4>{student.student_name}</h4>
                  <span className="student-email">{student.student_email}</span>
                  
                  <div className="status-container mt-2">
                    {student.advisor_status === 'requested' && (
                      <span className="badge warning">Solicitud Pendiente</span>
                    )}
                    {student.advisor_status === 'accepted' && (
                      <span className="badge success">Asesorando</span>
                    )}
                    {student.advisor_status === 'rejected' && (
                      <span className="badge danger">Rechazada</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {advisees.length === 0 && (
              <div className="empty-state py-8">
                <Users size={40} className="text-muted mb-2 mx-auto" />
                <p className="text-muted">No tienes solicitudes ni alumnos vinculados actualmente.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed View */}
        <div className="advisees-main">
          {selectedStudent ? (
            <div className="student-detail-container">
              {/* Protocol Details Header */}
              <div className="glass-panel student-header-panel mb-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-muted text-sm">Protocolo de Tesis</span>
                    <h3 className="protocol-title mt-1">{selectedStudent.protocol_title}</h3>
                    <p className="text-muted mt-2">
                      <strong>Alumno:</strong> {selectedStudent.student_name} ({selectedStudent.student_email})
                    </p>
                    <p className="text-muted text-sm mt-1">
                      <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      Registrado el {new Date(selectedStudent.protocol_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {selectedStudent.advisor_status === 'requested' && (
                    <div className="action-buttons flex gap-2">
                      <button 
                        className="btn-success flex items-center gap-1"
                        onClick={() => handleStatusChange(selectedStudent.protocol_id, 'accepted')}
                      >
                        <Check size={18} /> Aceptar
                      </button>
                      <button 
                        className="btn-danger flex items-center gap-1"
                        onClick={() => handleStatusChange(selectedStudent.protocol_id, 'rejected')}
                      >
                        <X size={18} /> Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {selectedStudent.advisor_status === 'accepted' ? (
                <div className="advances-section-container">
                  {/* List of advances */}
                  <div className="glass-panel advances-list-panel">
                    <h4 className="section-title mb-4">
                      <FileText size={18} />
                      <span>Avances Entregados ({advances.length})</span>
                    </h4>

                    {loadingAdvances ? (
                      <p>Cargando avances...</p>
                    ) : (
                      <div className="advances-grid">
                        {advances.map(adv => (
                          <div 
                            key={adv.id} 
                            className={`advance-card ${selectedAdvance?.id === adv.id ? 'active' : ''}`}
                            onClick={() => setSelectedAdvance(adv)}
                          >
                            <FileText size={24} className="text-info" />
                            <div className="advance-details">
                              <h5 className="advance-name" title={adv.file_name}>{adv.file_name}</h5>
                              <span className="advance-meta">
                                {formatBytes(adv.file_size)} &bull; {new Date(adv.created_at).toLocaleDateString()}
                                {adv.plagiarism_score !== undefined && (
                                  <span className={`plagiarism-score-badge ${adv.plagiarism_score > 20 ? 'high' : 'low'}`}>
                                    Similitud: {adv.plagiarism_score}%
                                  </span>
                                )}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button 
                                className="download-btn-small" 
                                onClick={(e) => { e.stopPropagation(); handleView(adv.id); }}
                                title="Ver vista previa"
                              >
                                <Eye size={18} />
                              </button>
                              <button 
                                className="download-btn-small" 
                                onClick={(e) => { e.stopPropagation(); handleDownload(adv.id); }}
                                title="Descargar archivo"
                              >
                                <Download size={18} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {advances.length === 0 && (
                          <div className="empty-state py-8">
                            <AlertCircle size={32} className="text-muted mb-2 mx-auto" />
                            <p className="text-muted">El alumno no ha subido avances todavía.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Comments feed */}
                  {selectedAdvance && (
                    <div className="glass-panel comments-panel mt-6">
                      <div className="comments-header">
                        <h4>Revisión: {selectedAdvance.file_name}</h4>
                        <span className="badge info">Comentarios y Retroalimentación</span>
                      </div>

                      <div className="comments-thread mt-4">
                        {comments.length === 0 ? (
                          <p className="text-muted py-4 text-center">No hay comentarios en este avance aún. Escribe el primero.</p>
                        ) : (
                          comments.map(c => (
                            <div key={c.id} className={`comment ${c.user_role === 'student' ? 'alumno' : 'asesor'}`}>
                              <div className={`comment-avatar ${c.user_role === 'student' ? 'alumno-avatar' : 'advisor-avatar'}`}>
                                {c.user_name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="comment-body">
                                <strong>{c.user_name}</strong> 
                                <span className="time">{new Date(c.created_at).toLocaleString()}</span>
                                <p>{c.comment}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <form className="comment-form mt-4" onSubmit={handleAddComment}>
                        <input 
                          type="text" 
                          placeholder="Ingresa tus observaciones, correcciones o visto bueno..."
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          className="premium-input"
                          style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn-primary" disabled={!newComment.trim()}>
                          <Send size={18} /> Enviar
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ) : selectedStudent.advisor_status === 'requested' ? (
                <div className="glass-panel text-center py-12">
                  <AlertCircle size={48} className="text-warning mx-auto mb-4" />
                  <h3>Solicitud de Dirección de Tesis Pendiente</h3>
                  <p className="text-muted mt-2 max-w-md mx-auto">
                    Acepta la solicitud del alumno arriba para poder ver sus entregas y realizar anotaciones o comentarios sobre su tesis.
                  </p>
                </div>
              ) : (
                <div className="glass-panel text-center py-12">
                  <X size={48} className="text-danger mx-auto mb-4" />
                  <h3>Solicitud Rechazada</h3>
                  <p className="text-muted mt-2 max-w-md mx-auto">
                    Esta solicitud de asesoría fue rechazada. El alumno deberá seleccionar otro asesor.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel flex-center flex-column text-center py-16" style={{ height: '100%', minHeight: '300px' }}>
              <Users size={64} className="text-muted mb-4" style={{ opacity: 0.3 }} />
              <h3>Selecciona un alumno</h3>
              <p className="text-muted mt-2">Haz clic en un alumno de la lista para ver su información y avances.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Advisees;
