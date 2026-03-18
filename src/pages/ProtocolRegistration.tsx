import { useState } from 'react';
import { Send, CheckCircle2, Info } from 'lucide-react';
import './ProtocolRegistration.css';

const ProtocolRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h2>Registro de Protocolo</h2>
        <p>Ingresa la información inicial de tu propuesta de tesis para obtener el visto bueno de la coordinación.</p>
      </div>

      <div className="registration-content">
        <form className="protocol-form glass-panel" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título Propuesto de la Tesis</label>
            <input 
              type="text" 
              id="title" 
              placeholder="Ej. Análisis comparativo de algoritmos de Machine Learning..."
              required
              className="premium-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="general-objective">Objetivo General</label>
            <textarea 
              id="general-objective" 
              rows={3}
              placeholder="Describe el propósito principal de tu investigación..."
              required
              className="premium-input"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="specific-objectives">Objetivos Específicos</label>
            <textarea 
              id="specific-objectives" 
              rows={4}
              placeholder="1. Primer objetivo...&#10;2. Segundo objetivo...&#10;3. Tercer objetivo..."
              required
              className="premium-input"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="research-line">Línea de Investigación Sugerida</label>
            <select id="research-line" className="premium-input" required>
              <option value="" disabled selected>Selecciona una línea acorde a tu carrera</option>
              <option value="1">Inteligencia Artificial y Ciencia de Datos</option>
              <option value="2">Desarrollo de Software Educativo</option>
              <option value="3">Redes y Seguridad Informática</option>
              <option value="4">Ingeniería Web y Tecnologías Móviles</option>
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
      </div>
    </div>
  );
};

export default ProtocolRegistration;
