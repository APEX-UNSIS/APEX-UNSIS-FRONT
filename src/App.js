import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './config/routes';
import AuthProvider from './core/auth/authContext';
import { useAuth } from './core/auth/hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Dashboard from './Dashboard/Dashboard';
import GenerarCalendario from './Pages/GenerarCalendario';
import VerCalendario from './Pages/VerCalendario';
import VerCalendarioServicios from './Pages/VerCalendarioServicios';
import ModificarCalendario from './Pages/ModificarCalendario';
import AdminUsuarios from './Pages/AdminUsuarios';
import ServiciosEscolares from './Pages/ServiciosEscolares';
import GestionSinodales from './Pages/GestionSinodales';
import NotFound from './components/NotFound';
import './App.css';

function AppRoutes() {
  const { isAuthenticated, user, logout } = useAuth();

function AppRoutes() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <Routes>
      {/* Ruta de login */}
      <Route 
        path={ROUTES.LOGIN} 
        element={
          isAuthenticated ? 
          <Navigate to={ROUTES.HOME} replace /> : 
          <Login />
        } 
      />
      
      {/* Ruta principal del dashboard */}
      <Route 
        path={ROUTES.HOME} 
        element={
          <ProtectedRoute allowedRoles={['admin', 'jefe', 'servicios']}>
            <Dashboard user={user} onLogout={logout} />
          </ProtectedRoute>
        } 
      />
      
      {/* Rutas de Jefe de Carrera */}
      <Route 
        path={ROUTES.GENERAR_CALENDARIO} 
        element={
          <ProtectedRoute allowedRoles={['jefe']}>
            <GenerarCalendario user={user} onLogout={logout} />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path={ROUTES.VER_CALENDARIO} 
        element={
          <ProtectedRoute allowedRoles={['jefe']}>
            <VerCalendarioServicios user={user} onLogout={logout} />
          </ProtectedRoute>
        } 
      />

      <Route 
        path={ROUTES.VER_CALENDARIO_SERVICIOS}
        element={
          <ProtectedRoute allowedRoles={['servicios']}>
            <VerCalendario user={user} onLogout={logout} />
          </ProtectedRoute>
        }
      />
      
      <Route 
        path={ROUTES.MODIFICAR_CALENDARIO} 
        element={
          <ProtectedRoute allowedRoles={['jefe']}>
            <ModificarCalendario user={user} onLogout={logout} />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path={ROUTES.GESTION_SINODALES} 
        element={
          <ProtectedRoute allowedRoles={['jefe']}>
            <GestionSinodales user={user} onLogout={logout} />
          </ProtectedRoute>
        } 
      />
      
      {/* Rutas de Administrador */}
      <Route 
        path={ROUTES.ADMIN_USUARIOS} 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsuarios user={user} onLogout={logout} />
          </ProtectedRoute>
        } 
      />
      
      {/* Rutas de Servicios Escolares */}
      <Route 
        path={ROUTES.SERVICIOS_ESCOLARES} 
        element={
          <ProtectedRoute allowedRoles={['servicios']}>
            <ServiciosEscolares user={user} onLogout={logout} />
          </ProtectedRoute>
        } 
      />
      
      {/* Ruta 404 - debe ir al final */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;