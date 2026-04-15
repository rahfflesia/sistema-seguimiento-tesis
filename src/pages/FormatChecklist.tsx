import { useState, useEffect } from 'react';
import { CheckCircle, Circle, AlertTriangle, Info, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './FormatChecklist.css';

interface ChecklistItem {
  id: string;
  category: string;
  text: string;
  description: string;
  checked: boolean;
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: '1', category: 'Estructura General', text: 'Portada Oficial', description: 'Uso de la plantilla oficial con logos actualizados de la UAS.', checked: false },
  { id: '2', category: 'Estructura General', text: 'Índice Automático', description: 'Índice de contenido, tablas y figuras generados automáticamente.', checked: false },
  { id: '3', category: 'Márgenes y Paginación', text: 'Márgenes correctos', description: 'Izquierdo 3.5cm, Derecho 2.5cm, Superior e Inferior 2.5cm.', checked: false },
  { id: '4', category: 'Márgenes y Paginación', text: 'Numeración de páginas', description: 'Números romanos en minúscula para preliminares, arábigos desde la introducción.', checked: false },
  { id: '5', category: 'Tipografía', text: 'Fuente y Tamaño', description: 'Arial 12 o Times New Roman 12 en todo el texto principal.', checked: false },
  { id: '6', category: 'Tipografía', text: 'Interlineado', description: 'Interlineado de 1.5 líneas, sin espacio extra entre párrafos.', checked: false },
  { id: '7', category: 'Referencias', text: 'Citas Formato APA', description: 'Todas las citas en el texto siguen el formato APA última edición.', checked: false },
  { id: '8', category: 'Referencias', text: 'Bibliografía ordenada', description: 'Lista de referencias en orden alfabético al final del documento con sangría francesa.', checked: false }
];

const FormatChecklist = () => {
  const [items, setItems] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [protocol, setProtocol] = useState<any>(null);
  
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProtocolData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/protocols/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok && data) {
            setProtocol(data);
            if (data.checklist_state && data.checklist_state !== '{}') {
                try {
                    const savedState = JSON.parse(data.checklist_state);
                    setItems(INITIAL_CHECKLIST.map(i => ({ ...i, checked: !!savedState[i.id] })));
                } catch(e) {}
            }
        }
      } catch (err) {
        console.error('Error fetching protocol checklist', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProtocolData();
  }, [token]);

  useEffect(() => {
    const checkedCount = items.filter(i => i.checked).length;
    setProgress(Math.round((checkedCount / items.length) * 100));
  }, [items]);

  const toggleItem = async (id: string) => {
    if (!protocol) return;

    const newItems = items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(newItems);

    // Save to DB
    const newStateObj: any = {};
    newItems.forEach(i => { newStateObj[i.id] = i.checked; });
    
    try {
        await fetch('http://localhost:5000/api/protocols/me/checklist', {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ checklist_state: newStateObj })
        });
    } catch(err) {
        console.error("Error saving checklist", err);
    }
  };

  const categories = Array.from(new Set(items.map(i => i.category)));

  if (loading) return <div className="page-container"><p>Cargando información...</p></div>;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h2>Checklist de Formato Institucional</h2>
        <p>Asegúrate de cumplir con los lineamientos de formato de la Universidad Autónoma de Sinaloa antes de entregar.</p>
      </div>

      {!protocol && (
        <div className="insight-panel glass-panel mb-6 border-warning">
          <div className="insight-header">
            <Lock className="text-warning" size={24} />
            <h3>Aviso Importante</h3>
          </div>
          <p>Para poder guardar el progreso de tu checklist, es necesario registrar tu protocolo de tesis.</p>
          <button className="btn-primary mt-4" onClick={() => navigate('/protocol')}>Ir a Registro de Protocolo</button>
        </div>
      )}

      <div className={`progress-container glass-panel ${!protocol ? 'opacity-50' : ''}`}>
        <div className="progress-header">
          <h3>Progreso de Verificación</h3>
          <span className="progress-percentage">{progress}%</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className={`progress-bar-fill ${progress === 100 ? 'complete' : ''}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {progress === 100 ? (
          <p className="progress-msg success">
            <CheckCircle size={18} /> ¡Excelente! Has cumplido todos los requisitos de formato.
          </p>
        ) : (
          <p className="progress-msg warning">
            <AlertTriangle size={18} /> Aún tienes requisitos pendientes por verificar.
          </p>
        )}
      </div>

      <div className={`checklist-container ${!protocol ? 'opacity-50 pointer-events-none' : ''}`}>
        {categories.map(category => (
          <div key={category} className="category-section glass-panel">
            <h3 className="category-title">{category}</h3>
            <div className="items-list">
              {items.filter(i => i.category === category).map(item => (
                <div 
                  key={item.id} 
                  className={`checklist-item ${item.checked ? 'checked' : ''} ${!protocol ? 'disabled' : ''}`}
                  onClick={() => toggleItem(item.id)}
                  style={!protocol ? { cursor: 'not-allowed' } : {}}
                >
                  <div className="item-checkbox">
                    {item.checked ? (
                      <CheckCircle className="checkbox-icon checked" />
                    ) : (
                      <Circle className="checkbox-icon" />
                    )}
                  </div>
                  <div className="item-content">
                    <span className="item-text">{item.text}</span>
                    <p className="item-desc">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rules-info glass-panel mt-4">
        <div className="info-flex">
          <Info size={24} className="text-info" />
          <div>
            <h4>¿Por qué es importante?</h4>
            <p>El incumplimiento de los lineamientos de formato es una de las principales causas de retraso en la aprobación de la tesis. Revisa cuidadosamente tu documento contra esta lista.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormatChecklist;
