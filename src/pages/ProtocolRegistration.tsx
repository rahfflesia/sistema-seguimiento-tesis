import { useState, useEffect } from 'react';
import { Send, CheckCircle2, Info, Lock } from 'lucide-react';
import './ProtocolRegistration.css';

const ProtocolRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Data States
  const [researchLines, setResearchLines] = useState<any[]>([]);
  const [existingProtocol, setExistingProtocol] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form States
  const [title, setTitle] = useState('');
  const [generalObjective, setGeneralObjective] = useState('');
  const [specificObjectives, setSpecificObjectives] = useState('');
  const [researchLineId, setResearchLineId] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch existing protocol
        const protoRes = await fetch('http://localhost:5000/api/protocols/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (protoRes.ok) {
          const protoData = await protoRes.json();
          if (protoData) setExistingProtocol(protoData);
        }

        // Fetch Research Lines
        const linesRes = await fetch('http://localhost:5000/api/research-lines', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (linesRes.ok) {
          const linesData = await linesRes.json();
          setResearchLines(linesData);
        }
      } catch (err: any) {
        console.error('Error fetching initial data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [token]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !generalObjective || !specificObjectives || !researchLineId) {
      setError('Por favor llena todos los campos');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:5000/api/protocols', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          general_objective: generalObjective,
          specific_objectives: specificObjectives,
          research_line_id: parseInt(researchLineId)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar el protocolo');

      setIsSuccess(true);
      setTimeout(() => window.location.reload(), 2000); // Reload to show active protocol
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="page-container"><p>Cargando información...</p></div>;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h2>Registro de Protocolo</h2>
        {existingProtocol ? (
          <p>Ya tienes un protocolo en revisión o registrado en el sistema.</p>
        ) : (
          <p>Ingresa la información inicial de tu propuesta de tesis para obtener el visto bueno de la coordinación.</p>
        )}
      </div>

      <div className="registration-content">
        {existingProtocol ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <Lock size={48} className="text-primary" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ marginBottom: '1rem' }}>Protocolo Registrado</h3>
            <div style={{ textAlign: 'left', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
              <p><strong>Título:</strong> {existingProtocol.title}</p>
              <p><strong>Estado:</strong> {existingProtocol.status.toUpperCase()}</p>
              <p><strong>Línea de Inv:</strong> {existingProtocol.research_line_name}</p>
              <p><strong>Registrado el:</strong> {new Date(existingProtocol.created_at).toLocaleDateString()}</p>
            </div>
            <p className="hint mt-6">Para modificar tu protocolo debes comunicarte con la coordinación.</p>
          </div>
        ) : (
          <form className="protocol-form glass-panel" onSubmit={handleSubmit}>
            {error && <div style={{ color: '#d32f2f', background: '#fdecea', padding: '10px', borderRadius: '4px' }}>{error}</div>}
            
            <div className="form-group">
              <label htmlFor="title">Título Propuesto de la Tesis</label>
              <input 
                type="text" 
                id="title" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej. Análisis comparativo de algoritmos..."
                required
                className="premium-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="general-objective">Objetivo General</label>
              <textarea 
                id="general-objective" 
                rows={3}
                value={generalObjective}
                onChange={e => setGeneralObjective(e.target.value)}
                placeholder="Describe el propósito principal..."
                required
                className="premium-input"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="specific-objectives">Objetivos Específicos</label>
              <textarea 
                id="specific-objectives" 
                rows={4}
                value={specificObjectives}
                onChange={e => setSpecificObjectives(e.target.value)}
                placeholder="1. Primer objetivo...&#10;2. Segundo objetivo..."
                required
                className="premium-input"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="research-line">Línea de Investigación Sugerida</label>
              <select 
                id="research-line" 
                className="premium-input" 
                required
                value={researchLineId}
                onChange={e => setResearchLineId(e.target.value)}
              >
                <option value="" disabled>Selecciona una línea acorde a tu carrera</option>
                {researchLines.map((line: any) => (
                  <option key={line.id} value={line.id}>{line.name}</option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className={`submit-btn ${isSuccess ? 'success' : ''}`}
                disabled={isSubmitting || isSuccess}
              >
                {isSubmitting ? (
                  <span className="loading-spinner"></span>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 size={20} />
                    <span>Enviado con Éxito</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Enviar Propuesta</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {!existingProtocol && (
          <div className="info-panel glass-panel">
            <div className="info-icon"><Info size={24} className="text-info" /></div>
            <h3>Información Importante</h3>
            <ul>
              <li>El título debe ser claro y no exceder de 25 palabras.</li>
              <li>Los objetivos deben iniciar con un verbo en infinitivo.</li>
              <li>El tiempo de respuesta promedio de la coordinación es de 3 a 5 días hábiles.</li>
              <li>Recibirás una notificación cuando tu propuesta sea aprobada o tenga observaciones.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtocolRegistration;
