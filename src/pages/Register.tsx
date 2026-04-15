import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar el usuario');
      }

      // Guardar token y rol del usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.name);
      
      // Redirigir al dashboard tras un registro exitoso
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div style={{ color: '#d32f2f', backgroundColor: '#fdecea', padding: '10px', borderRadius: '4px', fontSize: '0.9rem' }}>{error}</div>}

        <div className="form-group">
          <label htmlFor="role">Rol</label>
          <select 
            id="role" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="student">Estudiante</option>
            <option value="advisor">Asesor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="name">Nombre Completo</label>
          <input 
            type="text" 
            id="name" 
            placeholder="Introduce tu nombre" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input 
            type="email" 
            id="email" 
            placeholder="Introduce tu correo" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input 
            type="password" 
            id="password" 
            placeholder="Crea una contraseña" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Procesando...' : 'Crear Cuenta'}
        </button>
      </form>

      <div className="auth-links">
        ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
      </div>
    </>
  );
};

export default Register;
