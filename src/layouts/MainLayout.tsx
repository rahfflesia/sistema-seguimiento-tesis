import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  UploadCloud, 
  CheckSquare, 
  Download, 
  BookOpen,
  Sparkles,
  Bell,
  LogOut
} from 'lucide-react';
import './MainLayout.css';

const MainLayout = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <Sparkles size={20} />
          </div>
          <h2>Tesis Tracker</h2>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          {localStorage.getItem('userRole') === 'student' && (
            <>
              <div className="nav-section">Trámites Iniciales</div>
              
              <NavLink to="/protocol" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                <FileText size={20} />
                <span>Registro de Protocolo</span>
              </NavLink>
              
              <NavLink to="/advisor" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                <Users size={20} />
                <span>Vinculación con Asesor</span>
              </NavLink>
              
              <div className="nav-section">Desarrollo y Revisión</div>
              
              <NavLink to="/progress" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                <UploadCloud size={20} />
                <span>Carga de Avances</span>
              </NavLink>
              
              <NavLink to="/checklist" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                <CheckSquare size={20} />
                <span>Checklist Formato UAS</span>
              </NavLink>
            </>
          )}

          {localStorage.getItem('userRole') === 'advisor' && (
            <>
              <div className="nav-section">Asesoría</div>
              <NavLink to="/advisees" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                <Users size={20} />
                <span>Mis Alumnos</span>
              </NavLink>
            </>
          )}

          {localStorage.getItem('userRole') === 'admin' && (
            <>
              <div className="nav-section">Administración</div>
              <NavLink to="/research-lines" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                <BookOpen size={20} />
                <span>Líneas de Inv.</span>
              </NavLink>
              <NavLink to="/users-admin" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
                <Users size={20} />
                <span>Usuarios</span>
              </NavLink>
            </>
          )}
          
          <div className="nav-section">Recursos</div>
          
          {localStorage.getItem('userRole') !== 'admin' && (
            <NavLink to="/research-lines" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <BookOpen size={20} />
              <span>Directorio de Líneas</span>
            </NavLink>
          )}

          <NavLink to="/templates" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <Download size={20} />
            <span>Plantillas Oficiales</span>
          </NavLink>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">{localStorage.getItem('userName') ? localStorage.getItem('userName')![0].toUpperCase() : 'A'}</div>
            <div className="user-info">
              <span className="user-name">{localStorage.getItem('userName') || 'Alumno'}</span>
              <span className="user-role">{localStorage.getItem('userRole') === 'advisor' ? 'Asesor' : localStorage.getItem('userRole') === 'admin' ? 'Administrador' : 'Estudiante'}</span>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="top-actions">
            <div className="notifications">
              <Bell size={20} />
              <span className="badge">3</span>
            </div>
          </div>
        </header>
        <div className="content-area animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
