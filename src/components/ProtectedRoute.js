import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/auth/hooks/useAuth';
import { ROUTES } from '../config/routes';
import './ProtectedRoute.css';

/**
 * Componente para proteger rutas basado en autenticación y roles
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido a renderizar si el usuario tiene acceso
 * @param {Array<string>} props.allowedRoles - Array de roles permitidos para acceder a la ruta
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Mostrar un loader mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Si hay roles especificados y el usuario no tiene el rol necesario
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // Usuario autenticado y con el rol correcto
  return children;
};

export default ProtectedRoute;
