import { Outlet } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-left-pane">
        <div className="brand-badge">
          <BookOpen size={16} />
          <span>Universidad Autónoma de Sinaloa</span>
        </div>
        <div className="auth-brand-content">
          <h1>Sistema de Control y Monitoreo de Tesis</h1>
          <p>Plataforma oficial de posgrados para el registro de protocolos, vinculación de asesores y seguimiento institucional de avances.</p>
        </div>
        <div className="auth-footer-info">
          <span>Dirección General de Posgrado</span>
        </div>
      </div>
      
      <div className="auth-right-pane">
        <div className="auth-container">
          <div className="auth-header-mobile">
            <h2>Tesis Tracker</h2>
            <p>Universidad Autónoma de Sinaloa</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
