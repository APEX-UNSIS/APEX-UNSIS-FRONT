import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import unsisImage from '../assets/images/UNSI.png';
import apexImage from '../assets/images/logo.png';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const handleGenerarCalendario = () => {
    navigate('/generar-calendario');
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={unsisImage} alt="UNSIS" className="sidebar-unsis-image" />
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            <li className="nav-item active">
              <a href="#inicio" className="nav-link">
                Inicio
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#generar-calendario" 
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleGenerarCalendario();
                }}
              >
                Generar Calendario
              </a>
            </li>
            <li className="nav-item">
              <a href="#ver-calendario" className="nav-link">
                Ver Calendario
              </a>
            </li>
            <li className="nav-item">
              <a href="#modificar-calendario" className="nav-link">
                Modificar Calendario
              </a>
            </li>
            <li className="nav-item">
              <a href="#configuracion" className="nav-link">
                Configuración
              </a>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="main-content">
        <header className="content-header">
          <h1 className="content-title">APEX-UNSIS</h1>
        </header>

        <div className="content-area">
          <div className="welcome-section">
            <div className="apex-image-container">
              <img src={apexImage} alt="APEX" className="main-apex-image" />
            </div>
            <h2 className="welcome-title">Generador de Calendario de Examenes</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;