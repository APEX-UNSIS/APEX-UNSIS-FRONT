import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ModificarCalendario.css';
import unsisImage from '../assets/images/UNSI.png';

const ModificarCalendario = ({ user }) => {
  const navigate = useNavigate();
  
  const [calendario, setCalendario] = useState({
    id: 1,
    carrera: "Ingeniería en Sistemas",
    grupo: "706",
    periodo: "Enero-Junio 2025",
    fechaGeneracion: "2025-01-10",
    estado: "borrador",
    horarios: [
      {
        id: 1,
        materia: "Tecnologias Web II",
        profesor: "Mtro. Irving Ulises Hernandez Miguel",
        fecha: "02/12/2025",
        hora: "8:00-9:00",
        aula: "Lab. Tecnologias web",
        sinodal: "Mtro. Irving Ulises Hernandez Miguel"
      },
      {
        id: 2,
        materia: "Bases de Datos avanzadas",
        profesor: "Mtro. Eliezer Alcazar Silva",
        fecha: "03/12/2025",
        hora: "17:00-18:00",
        aula: "Lab. Ingenieria de software",
        sinodal: "Dr. Juan Pérez"
      },
      {
        id: 3,
        materia: "Ingenieria de software II",
        profesor: "DR. Eric Melesio Castro Leal",
        fecha: "04/12/2025",
        hora: "11:00-12:00",
        aula: "Lab. Ingenieria de software",
        sinodal: null
      },
      {
        id: 4,
        materia: "Probabilidad y estadistica",
        profesor: "Dr. Alejandro Jarillo Silva",
        fecha: "05/12/2025",
        hora: "8:00-9:00",
        aula: "Redes",
        sinodal: "Dr. Alejandro Jarillo Silva"
      },
      {
        id: 5,
        materia: "Derecho y Legislacion",
        profesor: "Dr. Gerardo Aragon Gonzales",
        fecha: "01/21/2025",
        hora: "8:00-9:00",
        aula: "Redes",
        sinodal: "Dr. Gerardo Aragon Gonzales"
      }
    ]
  });

  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [accionConfirmar, setAccionConfirmar] = useState('');

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleEditarHorario = (horario) => {
    setEditandoId(horario.id);
    setFormData({ ...horario });
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setFormData({});
  };

  const handleGuardarCambios = () => {
    if (editandoId) {
      setCalendario({
        ...calendario,
        horarios: calendario.horarios.map(h => 
          h.id === editandoId ? { ...h, ...formData } : h
        )
      });
      setEditandoId(null);
      setFormData({});
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleGuardarBorrador = () => {
    setAccionConfirmar('borrador');
    setShowConfirm(true);
  };

  const handleGuardarCambiosFinal = () => {
    setAccionConfirmar('cambios');
    setShowConfirm(true);
  };

  const confirmarAccion = () => {
    if (accionConfirmar === 'borrador') {
      setCalendario({ ...calendario, estado: 'borrador' });
      alert('✅ Calendario guardado como borrador');
    } else if (accionConfirmar === 'cambios') {
      setCalendario({ ...calendario, estado: 'pendiente' });
      alert('✅ Cambios guardados exitosamente');
    }
    setShowConfirm(false);
    setAccionConfirmar('');
  };

  const handleSalir = () => {
    navigate('/ver-calendario');
  };

  const handleEliminarHorario = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este horario?')) {
      setCalendario({
        ...calendario,
        horarios: calendario.horarios.filter(h => h.id !== id)
      });
    }
  };

  const handleAgregarHorario = () => {
    const nuevoId = Math.max(...calendario.horarios.map(h => h.id)) + 1;
    const nuevoHorario = {
      id: nuevoId,
      materia: '',
      profesor: '',
      fecha: '',
      hora: '',
      aula: '',
      sinodal: ''
    };
    setCalendario({
      ...calendario,
      horarios: [...calendario.horarios, nuevoHorario]
    });
    handleEditarHorario(nuevoHorario);
  };

  return (
    <div className="modificar-calendario-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={unsisImage} alt="UNSIS" className="sidebar-unsis-image" />
          <h2 className="sidebar-title">APEX-UNSIS</h2>
          <div className="user-role-badge">🎓 Jefe de Carrera</div>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            <li className="nav-item">
              <a href="#inicio" className="nav-link" onClick={handleBackToDashboard}>
                <span className="nav-icon">🏠</span>
                Inicio
              </a>
            </li>
            <li className="nav-item">
              <a href="#generar" className="nav-link" onClick={() => navigate('/generar-calendario')}>
                <span className="nav-icon">📅</span>
                Generar Calendario
              </a>
            </li>
            <li className="nav-item">
              <a href="#ver" className="nav-link" onClick={() => navigate('/ver-calendario')}>
                <span className="nav-icon">👁️</span>
                Ver Calendario
              </a>
            </li>
            <li className="nav-item active">
              <a href="#modificar" className="nav-link">
                <span className="nav-icon">✏️</span>
                Modificar Calendario
              </a>
            </li>
            <li className="nav-item">
              <a href="#sinodales" className="nav-link" onClick={() => navigate('/gestion-sinodales')}>
                <span className="nav-icon">🎓</span>
                Gestión de Sinodales
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
            <div className="user-avatar">🎓</div>
            <div className="user-details">
              <span className="user-name">{user.nombre}</span>
              <span className="user-email">Jefe de Carrera</span>
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
            <span className="welcome-text">Modificar Calendario - {calendario.carrera}</span>
            <span className="calendario-info">
              Grupo: {calendario.grupo} | Período: {calendario.periodo} | Estado: 
              <span className={`estado-badge ${calendario.estado}`}>
                {calendario.estado === 'borrador' && '📝 Borrador'}
                {calendario.estado === 'pendiente' && '⏳ Pendiente'}
                {calendario.estado === 'aprobado' && '✅ Aprobado'}
              </span>
            </span>
          </div>
        </header>

        <div className="content-area">
          <div className="modificar-section">
            <div className="section-header">
              <h2 className="section-title">Modificar Horarios de Examen</h2>
              <div className="acciones-header">
                <button 
                  className="agregar-horario-btn"
                  onClick={handleAgregarHorario}
                >
                  + Agregar Horario
                </button>
                <button 
                  className="previsualizar-btn"
                  onClick={() => navigate('/ver-calendario')}
                >
                  👁️ Previsualizar
                </button>
              </div>
            </div>

            {/* Información del calendario */}
            <div className="info-calendario">
              <div className="info-item">
                <strong>Carrera:</strong> {calendario.carrera}
              </div>
              <div className="info-item">
                <strong>Grupo:</strong> {calendario.grupo}
              </div>
              <div className="info-item">
                <strong>Período:</strong> {calendario.periodo}
              </div>
              <div className="info-item">
                <strong>Fecha de generación:</strong> {calendario.fechaGeneracion}
              </div>
              <div className="info-item">
                <strong>Total de horarios:</strong> {calendario.horarios.length}
              </div>
            </div>

            {/* Tabla de horarios editable */}
            <div className="horarios-container">
              <table className="horarios-table">
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Profesor</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Aula</th>
                    <th>Sinodal</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {calendario.horarios.map((horario) => (
                    <tr key={horario.id}>
                      {editandoId === horario.id ? (
                        <>
                          <td>
                            <input
                              type="text"
                              name="materia"
                              value={formData.materia || ''}
                              onChange={handleInputChange}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="profesor"
                              value={formData.profesor || ''}
                              onChange={handleInputChange}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              name="fecha"
                              value={formData.fecha || ''}
                              onChange={handleInputChange}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <select
                              name="hora"
                              value={formData.hora || ''}
                              onChange={handleInputChange}
                              className="edit-select"
                            >
                              <option value="">Seleccionar hora</option>
                              <option value="8:00-9:00">8:00-9:00</option>
                              <option value="9:00-10:00">9:00-10:00</option>
                              <option value="10:00-11:00">10:00-11:00</option>
                              <option value="11:00-12:00">11:00-12:00</option>
                              <option value="12:00-13:00">12:00-13:00</option>
                              <option value="13:00-14:00">13:00-14:00</option>
                              <option value="14:00-15:00">14:00-15:00</option>
                              <option value="15:00-16:00">15:00-16:00</option>
                              <option value="16:00-17:00">16:00-17:00</option>
                              <option value="17:00-18:00">17:00-18:00</option>
                              <option value="18:00-19:00">18:00-19:00</option>
                              <option value="19:00-20:00">19:00-20:00</option>
                              <option value="20:00-21:00">20:00-21:00</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              name="aula"
                              value={formData.aula || ''}
                              onChange={handleInputChange}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="sinodal"
                              value={formData.sinodal || ''}
                              onChange={handleInputChange}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <div className="acciones-edit">
                              <button 
                                className="guardar-edit-btn"
                                onClick={handleGuardarCambios}
                              >
                                💾 Guardar
                              </button>
                              <button 
                                className="cancelar-edit-btn"
                                onClick={handleCancelarEdicion}
                              >
                                ❌ Cancelar
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{horario.materia}</td>
                          <td>{horario.profesor}</td>
                          <td>{horario.fecha}</td>
                          <td>{horario.hora}</td>
                          <td>{horario.aula}</td>
                          <td>{horario.sinodal || 'Sin asignar'}</td>
                          <td>
                            <div className="acciones-buttons">
                              <button 
                                className="editar-horario-btn"
                                onClick={() => handleEditarHorario(horario)}
                              >
                                ✏️ Editar
                              </button>
                              <button 
                                className="eliminar-horario-btn"
                                onClick={() => handleEliminarHorario(horario.id)}
                              >
                                🗑️ Eliminar
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Botones de acción */}
            <div className="acciones-footer">
              <button 
                className="guardar-borrador-btn"
                onClick={handleGuardarBorrador}
              >
                💾 Guardar Borrador
              </button>
              
              <button 
                className="guardar-cambios-btn"
                onClick={handleGuardarCambiosFinal}
              >
                ✅ Guardar Cambios
              </button>
              
              <button 
                className="salir-btn"
                onClick={handleSalir}
              >
                🚪 Salir sin Guardar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Confirmar Acción</h3>
            <p className="modal-text">
              {accionConfirmar === 'borrador' 
                ? '¿Estás seguro de guardar como borrador? Podrás seguir editando después.'
                : '¿Estás seguro de guardar los cambios? El calendario quedará en estado pendiente para revisión.'}
            </p>
            <div className="modal-actions">
              <button 
                className="modal-cancel"
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </button>
              <button 
                className="modal-confirm"
                onClick={confirmarAccion}
              >
                {accionConfirmar === 'borrador' ? 'Guardar Borrador' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModificarCalendario;