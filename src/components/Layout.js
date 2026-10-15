import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ROUTES, getRoutesByRole } from '../config/routes';
import unsisImage from '../assets/images/UNSI.png';
import './Layout.css';
import { CrownIcon, GraduateIcon, ClipboardIcon, LogoutIcon } from '../icons';
import carreraService from '../core/services/carreraService';

const Layout = ({ user, onLogout, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nombreCarrera, setNombreCarrera] = useState(null);

  const handleLogout = () => {
    onLogout();
    navigate(ROUTES.LOGIN);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Obtener menú según rol
  const menuItems = getRoutesByRole(user?.rol);

  // Determinar qué item está activo basado en la ruta actual
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Función para limpiar el nombre de la carrera (quitar años y letras A/B)
  const limpiarNombreCarrera = (nombre) => {
    if (!nombre) return '';
    let nombreLimpio = nombre;
    
    // Remover años al final (ej: "LICENCIATURA EN INFORMÁTICA 2015" -> "LICENCIATURA EN INFORMÁTICA")
    nombreLimpio = nombreLimpio.replace(/\s+\d{4}$/, '');
    
    // Remover formato de periodo al final (ej: "LICENCIATURA EN INFORMÁTICA 2025-2026A" -> "LICENCIATURA EN INFORMÁTICA")
    nombreLimpio = nombreLimpio.replace(/\s+\d{4}-\d{4}[AB]$/, '');
    nombreLimpio = nombreLimpio.replace(/\s+\d{2}\d{2}[AB]$/, ''); // Formato 2526A
    
    // Remover solo letras A o B al final si están solas
    nombreLimpio = nombreLimpio.replace(/\s+[AB]$/, '');
    
    // Remover espacios extra al final
    nombreLimpio = nombreLimpio.trim();
    
    return nombreLimpio;
  };

  // Cargar información de la carrera si el usuario tiene una asignada
  useEffect(() => {
    const cargarCarrera = async () => {
      if (user && user.id_carrera) {
        try {
          const carrera = await carreraService.getById(user.id_carrera);
          if (carrera && carrera.nombre_carrera) {
            setNombreCarrera(limpiarNombreCarrera(carrera.nombre_carrera));
          }
        } catch (err) {
          console.error('Error cargando carrera:', err);
          // Si falla, intentar usar el id_carrera como nombre
          setNombreCarrera(user.id_carrera);
        }
      }
    };

    cargarCarrera();
  }, [user]);

  return (
    <div className="layout-container">
      <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
        {sidebarOpen ? '✕' : '☰'}
      </button>
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={unsisImage} alt="UNSIS" className="sidebar-unsis-image" />
          <h2 className="sidebar-title">APEX-UNSIS</h2>
          {user && (
            <div className="user-role-badge">
              {user.rol === 'admin' && <><CrownIcon /> Administrador</>}
              {user.rol === 'jefe' && <><GraduateIcon /> Jefe de Carrera</>}
              {user.rol === 'servicios' && <><ClipboardIcon /> Servicios Escolares</>}
            </div>
          )}
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {menuItems.map((item, index) => (
              <li 
                key={`${item.path}-${index}`} 
                className={`nav-item ${isActiveRoute(item.path) ? 'active' : ''}`}
              >
                <Link 
                  to={item.path} 
                  className="nav-link"
                  onClick={closeSidebar}
                >
                  <span className="nav-icon">{(() => { const Icon = item.icon; return Icon ? <Icon /> : null; })()}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.rol === 'admin' && <CrownIcon />}
                {user.rol === 'jefe' && <GraduateIcon />}
                {user.rol === 'servicios' && <ClipboardIcon />}
              </div>
              <div className="user-details">
                <span className="user-name">{user.nombre_usuario || user.nombre || 'Usuario'}</span>
                <span className="user-email">{user.id_usuario || user.usuario || user.email || 'Sin ID'}</span>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <LogoutIcon className="logout-icon" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      <header className="content-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <h1 className="content-title">APEX-UNSIS</h1>
          {nombreCarrera && (
            <div className="carrera-nombre">
              {nombreCarrera}
            </div>
          )}
        </div>
        <div className="header-actions">
          {user && (
            <>
              <span className="welcome-text">Bienvenido, {user.nombre_usuario || user.nombre || 'Usuario'}</span>
              <span className="role-indicator">
                {user.rol === 'admin' && 'Modo Administrador'}
                {user.rol === 'jefe' && 'Modo Jefe de Carrera'}
                {user.rol === 'servicios' && 'Modo Servicios Escolares'}
              </span>
            </>
          )}
        </div>
      </header>

      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;
