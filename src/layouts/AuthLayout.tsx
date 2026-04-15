import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-logo">
          <h2>Tesis UAS</h2>
          <p>Sistema de Seguimiento de Tesis</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
