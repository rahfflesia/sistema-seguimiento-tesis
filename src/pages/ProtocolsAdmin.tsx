import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Calendar, Mail, User, BookOpen, Search, AlertCircle } from 'lucide-react';
import './ProtocolsAdmin.css';

const ProtocolsAdmin = () => {
  const [protocols, setProtocols] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const token = localStorage.getItem('token');

  const fetchProtocols = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/protocols', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al obtener los protocolos de tesis.');
      const data = await res.json();
      setProtocols(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProtocols();
  }, [token]);

  const handleStatusChange = async (id: number, studentName: string, newStatus: 'approved' | 'rejected') => {
    const actionText = newStatus === 'approved' ? 'aprobar' : 'rechazar';
    const confirmMsg = `¿Está seguro de que desea ${actionText} el protocolo de tesis presentado por el alumno ${studentName}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/protocols/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(data.message);
      fetchProtocols(); // Reload list
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="badge-academic success">
            <CheckCircle size={14} />
            <span>Aprobado</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="badge-academic danger">
            <XCircle size={14} />
            <span>Rechazado</span>
          </span>
        );
      default:
        return (
          <span className="badge-academic warning">
            <Clock size={14} />
            <span>Pendiente</span>
          </span>
        );
    }
  };

  const filteredProtocols = protocols.filter(proto => {
    const matchesSearch = 
      proto.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proto.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proto.student_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proto.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="page-container flex-center"><h3>Cargando propuestas de protocolos...</h3></div>;

  return (
    <div className="page-container protocols-admin-page animate-fade-in">
      <div className="page-header-academic">
        <h2>Aprobación de Temas de Tesis</h2>
        <p className="subtitle">Gestión y dictaminación de protocolos de investigación registrados por los alumnos de la facultad.</p>
      </div>

      {error && (
        <div className="alert-academic danger">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-controls-panel glass-panel">
        <div className="search-wrapper-academic">
          <Search size={18} className="search-icon-academic" />
          <input 
            type="text" 
            placeholder="Buscar por título, alumno o correo electrónico..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-academic"
          />
        </div>
        
        <div className="filter-wrapper-academic">
          <label htmlFor="status-filter">Filtrar por estado:</label>
          <select 
            id="status-filter" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-academic"
          >
            <option value="all">Todos los registros</option>
            <option value="pending">Pendientes de revisión</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
          </select>
        </div>
      </div>

      <div className="protocols-table-container glass-panel">
        <div className="table-responsive">
          <table className="academic-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th style={{ width: '220px' }}>Estudiante</th>
                <th style={{ width: '400px' }}>Detalles del Tema</th>
                <th style={{ width: '150px' }}>Fecha Registro</th>
                <th style={{ width: '130px' }}>Estado</th>
                <th style={{ width: '180px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProtocols.map(proto => (
                <tr key={proto.id}>
                  <td className="id-cell"><strong>#{proto.id}</strong></td>
                  <td>
                    <div className="student-profile-cell">
                      <div className="avatar-academic">
                        <User size={16} />
                      </div>
                      <div className="student-text">
                        <div className="student-fullname">{proto.student_name}</div>
                        <div className="student-email">
                          <Mail size={12} />
                          <span>{proto.student_email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="protocol-details-cell">
                      <h4 className="protocol-title">{proto.title}</h4>
                      
                      <div className="research-line-meta">
                        <BookOpen size={14} />
                        <span>Línea: {proto.research_line_name || 'Sin asignar'}</span>
                      </div>

                      <div className="objectives-accordion">
                        <div className="objective-block">
                          <strong>Objetivo General:</strong>
                          <p>{proto.general_objective}</p>
                        </div>
                        <div className="objective-block">
                          <strong>Objetivos Específicos:</strong>
                          <p className="whitespace-pre-line">{proto.specific_objectives}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell-academic">
                      <Calendar size={14} />
                      <span>{new Date(proto.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(proto.status)}</td>
                  <td>
                    <div className="actions-cell">
                      {proto.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleStatusChange(proto.id, proto.student_name, 'approved')}
                            className="btn-academic approve"
                            title="Aprobar protocolo de tesis"
                          >
                            <CheckCircle size={16} />
                            <span>Aprobar</span>
                          </button>
                          <button 
                            onClick={() => handleStatusChange(proto.id, proto.student_name, 'rejected')}
                            className="btn-academic reject"
                            title="Rechazar propuesta"
                          >
                            <XCircle size={16} />
                            <span>Rechazar</span>
                          </button>
                        </>
                      ) : (
                        <span className="action-resolved">Dictaminado</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredProtocols.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-table-cell">
                    <FileText size={48} className="empty-icon" />
                    <p>No se encontraron registros de protocolos de tesis.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProtocolsAdmin;
