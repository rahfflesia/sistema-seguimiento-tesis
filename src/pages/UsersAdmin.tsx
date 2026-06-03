import { useState, useEffect } from 'react';
import { Users, Trash2, ShieldAlert, Calendar, ShieldCheck, Mail } from 'lucide-react';
import './UsersAdmin.css';

const UsersAdmin = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error fetching users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      alert(data.message);
      fetchUsers(); // refresh
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente a este usuario? Se borrarán sus datos asociados.')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(data.message);
      fetchUsers(); // refresh
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="page-container"><p>Cargando catálogo de usuarios...</p></div>;

  return (
    <div className="page-container users-admin-page animate-fade-in">
      <div className="page-header">
        <h2>Administración de Usuarios</h2>
        <p>Gestiona los roles y permisos del personal docente y los alumnos.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="users-table-container glass-panel">
        <div className="table-header-bar">
          <h3>
            <Users size={20} />
            <span>Usuarios Registrados ({users.length})</span>
          </h3>
        </div>

        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Contacto</th>
                <th>Rol de Permisos</th>
                <th>Fecha de Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><strong>#{user.id}</strong></td>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar-small">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="user-fullname">{user.name}</div>
                        <span className="user-subtext">Registrado en BD</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <Mail size={14} />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="role-selector"
                    >
                      <option value="student">Estudiante</option>
                      <option value="advisor">Asesor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      <span>{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="action-btn delete"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersAdmin;
