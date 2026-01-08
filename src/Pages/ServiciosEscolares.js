import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ServiciosEscolares.css';
import unsisImage from '../assets/images/UNSI.png';

const ServiciosEscolares = ({ user }) => {
  const navigate = useNavigate();
  const [calendarios, setCalendarios] = useState([
    { 
      id: 1, 
      carrera: 'Ingeniería en Sistemas', 
      jefe: 'Mtro. Juan Pérez', 
      fechaEnvio: '2025-01-15', 
      estado: 'pendiente',
      observaciones: ''
    },
    { 
      id: 2, 
      carrera: 'Administración', 
      jefe: 'Mtro. María García', 
      fechaEnvio: '2025-01-10', 
      estado: 'revisado',
      observaciones: 'Falta firmar los documentos'
    },
    { 
      id: 3, 
      carrera: 'Contabilidad', 
      jefe: 'Dr. Carlos López', 
      fechaEnvio: '2025-01-05', 
      estado: 'aprobado',
      observaciones: 'Todo en orden'
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedCalendario, setSelectedCalendario] = useState(null);
  const [observaciones, setObservaciones] = useState('');

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleRevisar = (calendario) => {
    setSelectedCalendario(calendario);
    setObservaciones(calendario.observaciones || '');
    setShowModal(true);
  };

  const handleAprobar = (id) => {
    setCalendarios(calendarios.map(c => 
      c.id === id ? { ...c, estado: 'aprobado' } : c
    ));
  };

  const handleRechazar = (id) => {
    setCalendarios(calendarios.map(c => 
      c.id === id ? { ...c, estado: 'rechazado' } : c
    ));
  };

  const handleGuardarObservaciones = () => {
    if (selectedCalendario) {
      setCalendarios(calendarios.map(c => 
        c.id === selectedCalendario.id ? { ...c, observaciones } : c
      ));
    }
    setShowModal(false);
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pendiente': return '#F59E0B';
      case 'revisado': return '#3B82F6';
      case 'aprobado': return '#10B981';
      case 'rechazado': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getEstadoTexto = (estado) => {
    switch(estado) {
      case 'pendiente': return 'Pendiente de revisión';
      case 'revisado': return 'Revisado con observaciones';
      case 'aprobado': return 'Aprobado con V°B°';
      case 'rechazado': return 'Rechazado';
      default: return estado;
    }
  };

  return (
    <div className="servicios-escolares-container">
      {/* Sidebar similar a otros componentes */}
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={unsisImage} alt="UNSIS" className="sidebar-unsis-image" />
          <h2 className="sidebar-title">APEX-UNSIS</h2>
          <div className="user-role-badge">📋 Servicios Escolares</div>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            <li className="nav-item">
              <a href="#inicio" className="nav-link" onClick={handleBackToDashboard}>
                <span className="nav-icon">🏠</span>
                Inicio
              </a>
            </li>
            <li className="nav-item active">
              <a href="#servicios" className="nav-link">
                <span className="nav-icon">✅</span>
                Validar Calendarios
              </a>
            </li>
            <li className="nav-item">
              <a href="#ver" className="nav-link" onClick={() => navigate('/ver-calendario')}>
                <span className="nav-icon">👁️</span>
                Ver Calendarios
              </a>
            </li>
            <li className="nav-item">
              <a href="#configuracion" className="nav-link">
                <span className="nav-icon">⚙️</span>
                Configuración
              </a>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">📋</div>
            <div className="user-details">
              <span className="user-name">{user.nombre}</span>
              <span className="user-email">Servicios Escolares</span>
            </div>
          </div>
          <button className="logout-btn" onClick={() => navigate('/')}>
            <span className="logout-icon">🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="main-content">
        <header className="content-header">
          <h1 className="content-title">APEX-UNSIS</h1>
          <div className="header-actions">
            <span className="welcome-text">Validación de Calendarios</span>
          </div>
        </header>

        <div className="content-area">
          <div className="validacion-section">
            <h2 className="section-title">Calendarios Recibidos</h2>
            
            <div className="filtros-container">
              <div className="filtro">
                <label>Filtrar por estado:</label>
                <select>
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="revisado">Revisados</option>
                  <option value="aprobado">Aprobados</option>
                </select>
              </div>
              
              <div className="filtro">
                <label>Filtrar por carrera:</label>
                <select>
                  <option value="todos">Todas las carreras</option>
                  <option value="sistemas">Ingeniería en Sistemas</option>
                  <option value="administracion">Administración</option>
                  <option value="contabilidad">Contabilidad</option>
                </select>
              </div>
            </div>
            
            <div className="calendarios-grid">
              {calendarios.map((calendario) => (
                <div key={calendario.id} className="calendario-card">
                  <div className="card-header">
                    <h3>{calendario.carrera}</h3>
                    <span 
                      className="estado-badge"
                      style={{ backgroundColor: getEstadoColor(calendario.estado) }}
                    >
                      {getEstadoTexto(calendario.estado)}
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <p><strong>Jefe de Carrera:</strong> {calendario.jefe}</p>
                    <p><strong>Fecha de envío:</strong> {calendario.fechaEnvio}</p>
                    
                    {calendario.observaciones && (
                      <div className="observaciones">
                        <strong>Observaciones:</strong>
                        <p>{calendario.observaciones}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="revisar-btn"
                      onClick={() => handleRevisar(calendario)}
                    >
                      📝 Revisar
                    </button>
                    
                    <button 
                      className="aprobar-btn"
                      onClick={() => handleAprobar(calendario.id)}
                      disabled={calendario.estado === 'aprobado'}
                    >
                      ✅ Dar V°B°
                    </button>
                    
                    <button 
                      className="rechazar-btn"
                      onClick={() => handleRechazar(calendario.id)}
                      disabled={calendario.estado === 'rechazado'}
                    >
                      ❌ Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="estadisticas">
              <div className="estadistica">
                <h3>Pendientes</h3>
                <p className="numero">{calendarios.filter(c => c.estado === 'pendiente').length}</p>
              </div>
              <div className="estadistica">
                <h3>Revisados</h3>
                <p className="numero">{calendarios.filter(c => c.estado === 'revisado').length}</p>
              </div>
              <div className="estadistica">
                <h3>Aprobados</h3>
                <p className="numero">{calendarios.filter(c => c.estado === 'aprobado').length}</p>
              </div>
              <div className="estadistica">
                <h3>Total</h3>
                <p className="numero">{calendarios.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de revisión */}
      {showModal && selectedCalendario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Revisar Calendario - {selectedCalendario.carrera}</h3>
            
            <div className="info-calendario">
              <p><strong>Jefe de Carrera:</strong> {selectedCalendario.jefe}</p>
              <p><strong>Fecha de envío:</strong> {selectedCalendario.fechaEnvio}</p>
              <p><strong>Estado actual:</strong> {getEstadoTexto(selectedCalendario.estado)}</p>
            </div>
            
            <div className="form-group">
              <label>Observaciones:</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows="4"
                placeholder="Ingresa tus observaciones sobre este calendario..."
              />
            </div>
            
            <div className="acciones-rapidas">
              <p><strong>Acciones rápidas:</strong></p>
              <div className="botones-rapidos">
                <button 
                  className="btn-aprobar"
                  onClick={() => {
                    handleAprobar(selectedCalendario.id);
                    setShowModal(false);
                  }}
                >
                  ✅ Aprobar con V°B°
                </button>
                <button 
                  className="btn-rechazar"
                  onClick={() => {
                    handleRechazar(selectedCalendario.id);
                    setShowModal(false);
                  }}
                >
                  ❌ Rechazar calendario
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="modal-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="modal-guardar"
                onClick={handleGuardarObservaciones}
              >
                Guardar observaciones
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiciosEscolares;