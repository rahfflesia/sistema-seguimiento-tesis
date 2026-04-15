import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // Si no hay token, redirigir al login y guardar la ruta que intentó acceder
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay token, renderizar los componentes hijos (MainLayout y las páginas)
  return <Outlet />;
};

export default ProtectedRoute;
