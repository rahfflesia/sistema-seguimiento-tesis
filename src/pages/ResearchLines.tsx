import { useState, useEffect } from 'react';
import { BookOpen, Search, Trash2, Plus } from 'lucide-react';
import './ResearchLines.css';

const ResearchLines = () => {
  const [lines, setLines] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Admin form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const userRole = localStorage.getItem('userRole');
  const token = localStorage.getItem('token');

  const fetchLines = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/research-lines', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Error al cargar datos');
      const data = await res.json();
      setLines(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLines();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    try {
      const res = await fetch('http://localhost:5000/api/research-lines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName, description: newDesc })
      });
      if (!res.ok) throw new Error('No se pudo crear la línea');
      
      setNewName('');
      setNewDesc('');
      setIsCreating(false);
      fetchLines(); // refetch
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta línea de investigación?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/research-lines/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('No se pudo eliminar');
      fetchLines();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredLines = lines.filter(line => 
    line.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (line.description && line.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h2>Directorio de Líneas de Investigación</h2>
        <p>Explora el catálogo oficial de temas autorizados por la facultad.</p>
      </div>

      {userRole === 'admin' && (
        <div className="admin-actions mb-4">
          {!isCreating ? (
            <button className="btn-primary" onClick={() => setIsCreating(true)}>
              <Plus size={18} /> Agregar Línea de Investigación
            </button>
          ) : (
            <form className="glass-panel" onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
              <h3>Nueva Línea de Investigación</h3>
              <input 
                type="text" 
                placeholder="Nombre de la línea" 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                className="search-input-small" 
                required 
              />
              <textarea 
                placeholder="Descripción general" 
                value={newDesc} 
                onChange={e => setNewDesc(e.target.value)} 
                className="search-input-small" 
                rows={3} 
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary">Guardar</button>
                <button type="button" className="btn-outline-primary" onClick={() => setIsCreating(false)}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="lines-controls glass-panel" style={{ marginBottom: '2rem' }}>
        <div className="search-wrapper" style={{ width: '100%', maxWidth: '100%' }}>
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

      {loading && <p>Cargando líneas de investigación...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}

      <div className="lines-list">
        {!loading && filteredLines.map(line => (
          <div key={line.id} className="line-card glass-panel" style={{ position: 'relative' }}>
            <div className="line-icon-container">
              <BookOpen size={24} />
            </div>
            
            <div className="line-content">
              <h3>{line.name}</h3>
              <p className="line-desc">{line.description}</p>
              <div className="keywords">
                <span className="keyword-tag">Registrada el: {new Date(line.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            {userRole === 'admin' && (
              <button 
                onClick={() => handleDelete(line.id)} 
                className="btn-text" 
                style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#ef4444' }}
                title="Eliminar línea"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}

        {!loading && filteredLines.length === 0 && (
          <div className="empty-state glass-panel">
            <p>No se encontraron líneas de investigación.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchLines;
