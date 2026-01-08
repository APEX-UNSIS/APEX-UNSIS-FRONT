import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import unsisImage from '../assets/images/UNSI.png';
import apexImage from '../assets/images/logo.png';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  // Menú según rol
  const getMenuItems = () => {
    const baseItems = [
      { id: 'inicio', label: 'Inicio', icon: '🏠', path: '/dashboard' }
    ];

    if (user.rol === 'admin') {
      return [
        ...baseItems,
        { id: 'usuarios', label: 'Gestión de Usuarios', icon: '👥', path: '/admin-usuarios' },
        { id: 'configuracion', label: 'Configuración', icon: '⚙️', path: '#configuracion' }
      ];
    }

    if (user.rol === 'jefe') {
      return [
        ...baseItems,
        { id: 'generar', label: 'Generar Calendario', icon: '📅', path: '/generar-calendario' },
        { id: 'ver', label: 'Ver Calendario', icon: '👁️', path: '/ver-calendario' },
        { id: 'modificar', label: 'Modificar Calendario', icon: '✏️', path: '/modificar-calendario' },
        { id: 'sinodales', label: 'Gestión de Sinodales', icon: '🎓', path: '/gestion-sinodales' },
        { id: 'configuracion', label: 'Configuración', icon: '⚙️', path: '#configuracion' }
      ];
    }

    if (user.rol === 'servicios') {
      return [
        ...baseItems,
        { id: 'validar', label: 'Validar Calendarios', icon: '✅', path: '/servicios-escolares' },
        { id: 'ver', label: 'Ver Calendarios', icon: '👁️', path: '/ver-calendario' },
        { id: 'configuracion', label: 'Configuración', icon: '⚙️', path: '#configuracion' }
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={unsisImage} alt="UNSIS" className="sidebar-unsis-image" />
          <h2 className="sidebar-title">APEX-UNSIS</h2>
          <div className="user-role-badge">
            {user.rol === 'admin' && '👑 Administrador'}
            {user.rol === 'jefe' && '🎓 Jefe de Carrera'}
            {user.rol === 'servicios' && '📋 Servicios Escolares'}
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {menuItems.map((item) => (
              <li key={item.id} className="nav-item">
                <a 
                  href={item.path} 
                  className="nav-link"
                  onClick={(e) => {
                    if (item.path.startsWith('/')) {
                      e.preventDefault();
                      navigate(item.path);
                    }
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user.rol === 'admin' && '👑'}
              {user.rol === 'jefe' && '🎓'}
              {user.rol === 'servicios' && '📋'}
            </div>
            <div className="user-details">
              <span className="user-name">{user.nombre}</span>
              <span className="user-email">{user.usuario || user.email}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
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
                  <button className="stat-button" onClick={() => navigate('/admin-usuarios')}>
                    Ir a Gestión
                  </button>
                </div>
              )}
              
              {user.rol === 'jefe' && (
                <>
                  <div className="stat-card">
                    <h3>Generar Calendario</h3>
                    <p>Crea un nuevo calendario de exámenes</p>
                    <button className="stat-button" onClick={() => navigate('/generar-calendario')}>
                      Crear Nuevo
                    </button>
                  </div>
                  <div className="stat-card">
                    <h3>Gestión de Sinodales</h3>
                    <p>Asigna sinodales a las materias</p>
                    <button className="stat-button" onClick={() => navigate('/gestion-sinodales')}>
                      Gestionar
                    </button>
                  </div>
                </>
              )}
              
              {user.rol === 'servicios' && (
                <div className="stat-card">
                  <h3>Validar Calendarios</h3>
                  <p>Revisa y valida calendarios enviados</p>
                  <button className="stat-button" onClick={() => navigate('/servicios-escolares')}>
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