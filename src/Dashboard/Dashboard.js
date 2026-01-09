import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES, getRoutesByRole } from '../routes';
import './Dashboard.css';
import unsisImage from '../assets/images/UNSI.png';
import { CrownIcon, GraduateIcon, ClipboardIcon, LogoutIcon } from '../icons';
import apexImage from '../assets/images/logo.png';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Cerrar sidebar al cambiar de ruta
  useEffect(() => {
    const handleRouteChange = () => {
      setSidebarOpen(false);
    };
    return () => {
      handleRouteChange();
    };
  }, []);

  // Obtener menú según rol usando las constantes de rutas
  const menuItems = getRoutesByRole(user.rol);

  return (
    <div className="dashboard-container">
      <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
        {sidebarOpen ? '✕' : '☰'}
      </button>
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={unsisImage} alt="UNSIS" className="sidebar-unsis-image" />
          <h2 className="sidebar-title">APEX-UNSIS</h2>
          <div className="user-role-badge">
            {user.rol === 'admin' && <><CrownIcon /> Administrador</>}
            {user.rol === 'jefe' && <><GraduateIcon /> Jefe de Carrera</>}
            {user.rol === 'servicios' && <><ClipboardIcon /> Servicios Escolares</>}
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {menuItems.map((item, index) => (
              <li key={`${item.path}-${index}`} className="nav-item">
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
          <div className="user-info">
            <div className="user-avatar">
              {user.rol === 'admin' && <CrownIcon />}
              {user.rol === 'jefe' && <GraduateIcon />}
              {user.rol === 'servicios' && <ClipboardIcon />}
            </div>
            <div className="user-details">
              <span className="user-name">{user.nombre}</span>
              <span className="user-email">{user.usuario || user.email}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogoutIcon className="logout-icon" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="main-content">
        <header className="content-header">
          <h1 className="content-title">APEX-UNSIS</h1>
          <div className="header-actions">
            <span className="welcome-text">Bienvenido, {user.nombre}</span>
            <span className="role-indicator">
              {user.rol === 'admin' && 'Modo Administrador'}
              {user.rol === 'jefe' && 'Modo Jefe de Carrera'}
              {user.rol === 'servicios' && 'Modo Servicios Escolares'}
            </span>
          </div>
        </header>

        <div className="content-area">
          <div className="welcome-section">
            <div className="apex-image-container">
              <img src={apexImage} alt="APEX" className="main-apex-image" />
            </div>
            <h2 className="welcome-title">
              {user.rol === 'admin' && 'Panel de Administración'}
              {user.rol === 'jefe' && 'Generador de Horarios'}
              {user.rol === 'servicios' && 'Validación de Calendarios'}
            </h2>
            
            <div className="dashboard-stats">
              {user.rol === 'admin' && (
                <div className="stat-card">
                  <h3>Gestión de Usuarios</h3>
                  <p>Administra los usuarios del sistema</p>
                  <button className="stat-button" onClick={() => navigate(ROUTES.ADMIN_USUARIOS)}>
                    Ir a Gestión
                  </button>
                </div>
              )}
              
              {user.rol === 'jefe' && (
                <>
                  <div className="stat-card">
                    <h3>Generar Calendario</h3>
                    <p>Crea un nuevo calendario de exámenes</p>
                    <button className="stat-button" onClick={() => navigate(ROUTES.GENERAR_CALENDARIO)}>
                      Crear Nuevo
                    </button>
                  </div>
                  <div className="stat-card">
                    <h3>Gestión de Sinodales</h3>
                    <p>Asigna sinodales a las materias</p>
                    <button className="stat-button" onClick={() => navigate(ROUTES.GESTION_SINODALES)}>
                      Gestionar
                    </button>
                  </div>
                </>
              )}
              
              {user.rol === 'servicios' && (
                <div className="stat-card">
                  <h3>Validar Calendarios</h3>
                  <p>Revisa y valida calendarios enviados</p>
                  <button className="stat-button" onClick={() => navigate(ROUTES.SERVICIOS_ESCOLARES)}>
                    Ver Pendientes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;