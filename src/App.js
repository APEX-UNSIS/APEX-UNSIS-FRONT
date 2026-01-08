import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './Dashboard/Dashboard';
import GenerarCalendario from './Pages/GenerarCalendario';
import VerCalendario from './Pages/VerCalendario';
import ModificarCalendario from './Pages/ModificarCalendario';
import AdminUsuarios from './Pages/AdminUsuarios';
import ServiciosEscolares from './Pages/ServiciosEscolares';
import GestionSinodales from './Pages/GestionSinodales';
import './App.css';

// Simulación de autenticación (reemplazar con backend real)
const mockAuth = {
  isAuthenticated: false,
  user: null,
  login: (username, password) => {
    // Simulación de login con diferentes roles
    const users = {
      'admin': { id: 1, nombre: 'Administrador', rol: 'admin' },
      'jefe': { id: 2, nombre: 'Jefe de Carrera', rol: 'jefe' },
      'servicios': { id: 3, nombre: 'Servicios Escolares', rol: 'servicios' }
    };
    
    if (users[username] && password === '123456') {
      mockAuth.isAuthenticated = true;
      mockAuth.user = users[username];
      localStorage.setItem('auth', JSON.stringify(mockAuth));
      return true;
    }
    return false;
  },
  logout: () => {
    mockAuth.isAuthenticated = false;
    mockAuth.user = null;
    localStorage.removeItem('auth');
  }
};

// Cargar autenticación desde localStorage
const savedAuth = localStorage.getItem('auth');
if (savedAuth) {
  const parsed = JSON.parse(savedAuth);
  mockAuth.isAuthenticated = parsed.isAuthenticated;
  mockAuth.user = parsed.user;
}

// Componente para proteger rutas por rol
const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!mockAuth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(mockAuth.user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const [auth, setAuth] = useState(mockAuth);

  const handleLogin = (username, password) => {
    if (mockAuth.login(username, password)) {
      setAuth({ ...mockAuth });
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    mockAuth.logout();
    setAuth({ ...mockAuth });
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            auth.isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login onLogin={handleLogin} />
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'jefe', 'servicios']}>
              <Dashboard user={auth.user} onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          
          {/* Rutas de Jefe de Carrera */}
          <Route path="/generar-calendario" element={
            <ProtectedRoute allowedRoles={['jefe']}>
              <GenerarCalendario user={auth.user} />
            </ProtectedRoute>
          } />
          
          <Route path="/ver-calendario" element={
            <ProtectedRoute allowedRoles={['jefe', 'servicios']}>
              <VerCalendario user={auth.user} />
            </ProtectedRoute>
          } />
          
          <Route path="/modificar-calendario" element={
            <ProtectedRoute allowedRoles={['jefe']}>
              <ModificarCalendario user={auth.user} />
            </ProtectedRoute>
          } />
          
          <Route path="/gestion-sinodales" element={
            <ProtectedRoute allowedRoles={['jefe']}>
              <GestionSinodales user={auth.user} />
            </ProtectedRoute>
          } />
          
          {/* Rutas de Administrador */}
          <Route path="/admin-usuarios" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsuarios user={auth.user} />
            </ProtectedRoute>
          } />
          
          {/* Rutas de Servicios Escolares */}
          <Route path="/servicios-escolares" element={
            <ProtectedRoute allowedRoles={['servicios']}>
              <ServiciosEscolares user={auth.user} />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;