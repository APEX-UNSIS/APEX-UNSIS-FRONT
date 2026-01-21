import React, { useState, useEffect } from 'react';
import { EyeIcon, EditIcon, SaveIcon, TrashIcon, LogoutIcon } from '../icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import Layout from '../components/Layout';
import calendarioService from '../core/services/calendarioService';
import './ModificarCalendario.css';

const ModificarCalendario = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [examenes, setExamenes] = useState([]);
  const [error, setError] = useState(null);
  
  // editando: null | { grupo: string, id_horario: string }
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [accionConfirmar, setAccionConfirmar] = useState('');

  useEffect(() => {
    cargarCalendario();
  }, []);

  const cargarCalendario = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando calendario para modificar...');
      const data = await calendarioService.obtener();
      console.log('Datos recibidos:', data);
      setExamenes(data || []);
    } catch (err) {
      console.error('Error cargando calendario:', err);
      console.error('Detalles del error:', err.response?.data || err.message);
      setError(`Error al cargar el calendario: ${err.response?.data?.detail || err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar exámenes por grupo
  const agruparPorGrupo = () => {
    const gruposMap = {};
    examenes.forEach(examen => {
      const gruposArray = Array.isArray(examen.grupos) ? examen.grupos : [];
      gruposArray.forEach(grupo => {
        if (!gruposMap[grupo]) {
          gruposMap[grupo] = [];
        }
        gruposMap[grupo].push({
          ...examen,
          grupo: grupo
        });
      });
    });
    return gruposMap;
  };

  const gruposExamenes = agruparPorGrupo();
  const grupos = Object.keys(gruposExamenes).sort();


  const handleEditarHorario = (examen, grupo) => {
    setEditando({ grupo, id_horario: examen.id_horario });
    // Convertir fecha de DD/MM/YYYY a YYYY-MM-DD para el input date
    let fechaFormato = '';
    if (examen.fecha) {
      const [dia, mes, anio] = examen.fecha.split('/');
      fechaFormato = `${anio}-${mes}-${dia}`;
    }
    // Convertir hora de "HH:MM-HH:MM" a formato separado
    let horaInicio = '';
    let horaFin = '';
    if (examen.hora) {
      const [inicio, fin] = examen.hora.split('-');
      horaInicio = inicio || '';
      horaFin = fin || '';
    }
    setFormData({
      materia: examen.materia || '',
      profesor: examen.profesor || '',
      fecha: fechaFormato,
      horaInicio: horaInicio,
      horaFin: horaFin,
      aula: examen.aula || ''
    });
  };

  const handleCancelarEdicion = () => {
    setEditando(null);
    setFormData({});
  };

  const handleGuardarCambios = async () => {
    if (!editando) return;
    const { grupo, id_horario } = editando;
    
    try {
      // TODO: Implementar actualización en el backend
      // Por ahora, actualizamos el estado local
      const horaCompleta = formData.horaInicio && formData.horaFin 
        ? `${formData.horaInicio}-${formData.horaFin}` 
        : formData.horaInicio || '';
      
      // Convertir fecha de YYYY-MM-DD a DD/MM/YYYY
      let fechaFormato = '';
      if (formData.fecha) {
        const [anio, mes, dia] = formData.fecha.split('-');
        fechaFormato = `${dia}/${mes}/${anio}`;
      }
      
      setExamenes(prevExamenes => 
        prevExamenes.map(examen => {
          if (examen.id_horario === id_horario) {
            return {
              ...examen,
              materia: formData.materia || examen.materia,
              profesor: formData.profesor || examen.profesor,
              fecha: fechaFormato || examen.fecha,
              hora: horaCompleta || examen.hora,
              aula: formData.aula || examen.aula
            };
          }
          return examen;
        })
      );
      
      alert('Cambios guardados localmente. La funcionalidad de guardado en el servidor está en desarrollo.');
      setEditando(null);
      setFormData({});
    } catch (err) {
      console.error('Error guardando cambios:', err);
      alert('Error al guardar los cambios. Por favor, intenta de nuevo.');
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

  const confirmarAccion = async () => {
    try {
      if (accionConfirmar === 'borrador') {
        // TODO: Implementar guardado como borrador en el backend
        alert('Calendario guardado como borrador (localmente). La funcionalidad de guardado en el servidor está en desarrollo.');
      } else if (accionConfirmar === 'cambios') {
        // TODO: Implementar guardado de cambios en el backend
        alert('Cambios guardados exitosamente (localmente). La funcionalidad de guardado en el servidor está en desarrollo.');
      }
      setShowConfirm(false);
      setAccionConfirmar('');
    } catch (err) {
      console.error('Error guardando:', err);
      alert('Error al guardar. Por favor, intenta de nuevo.');
    }
  };

  const handleSalir = () => {
    navigate(ROUTES.VER_CALENDARIO);
  };

  const handleEliminarHorario = async (id_horario, grupo) => {
    if (!window.confirm('¿Estás seguro de eliminar este horario?')) return;
    
    try {
      // TODO: Implementar eliminación en el backend
      // Por ahora, eliminamos del estado local
      setExamenes(prevExamenes => 
        prevExamenes.filter(examen => examen.id_horario !== id_horario)
      );
      
      // Si estábamos editando esa fila, cancelar edición
      if (editando && editando.grupo === grupo && editando.id_horario === id_horario) {
        setEditando(null);
        setFormData({});
      }
      
      alert('Horario eliminado localmente. La funcionalidad de eliminación en el servidor está en desarrollo.');
    } catch (err) {
      console.error('Error eliminando horario:', err);
      alert('Error al eliminar el horario. Por favor, intenta de nuevo.');
    }
  };

  const handleAgregarHorario = (grupo) => {
    // TODO: Implementar creación de nuevo horario en el backend
    alert('La funcionalidad de agregar nuevos horarios está en desarrollo. Por favor, genera un nuevo calendario desde la página de Generar Calendario.');
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="modificar-calendario-container">
          <div className="content-area">
            <div className="modificar-section">
              <h2 className="section-title">Modificar Horarios de Examen</h2>
              <p>Cargando calendario...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="modificar-calendario-container">
          <div className="content-area">
            <div className="modificar-section">
              <h2 className="section-title">Modificar Horarios de Examen</h2>
              <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>
              <button onClick={cargarCalendario} style={{ marginTop: '10px' }}>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (examenes.length === 0) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="modificar-calendario-container">
          <div className="content-area">
            <div className="modificar-section">
              <h2 className="section-title">Modificar Horarios de Examen</h2>
              <p style={{ marginTop: '20px' }}>No hay exámenes programados para tu carrera.</p>
              <button 
                onClick={() => navigate(ROUTES.GENERAR_CALENDARIO)} 
                style={{ marginTop: '10px', padding: '10px 20px' }}
              >
                Generar Calendario
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="modificar-calendario-container">
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
                  onClick={() => navigate(ROUTES.VER_CALENDARIO)}
                >
                  <EyeIcon style={{marginRight:8}}/>Previsualizar
                </button>
              </div>
            </div>

            {/* Información del calendario */}
            <div className="info-calendario">
              <div className="info-item">
                <strong>Total de grupos:</strong> {grupos.length}
              </div>
              <div className="info-item">
                <strong>Total de exámenes:</strong> {examenes.length}
              </div>
            </div>

            {/* Mostrar cuadrícula de grupos */}
            <div className="groups-grid">
              {grupos.map((g) => (
                <div key={g} className="group-card">
                  <h3>Grupo {g}</h3>
                  <div className="table-container">
                    <table className="calendario-table">
                      <thead>
                        <tr>
                          <th>MATERIA</th>
                          <th>MAESTRO TITULAR</th>
                          <th>FECHA</th>
                          <th>HORA</th>
                          <th>AULA</th>
                          <th>ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(gruposExamenes[g] || []).map((examen) => (
                          <tr key={examen.id_horario}>
                            {editando && editando.grupo === g && editando.id_horario === examen.id_horario ? (
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
                                  <div style={{ display: 'flex', gap: '5px' }}>
                                    <input
                                      type="time"
                                      name="horaInicio"
                                      value={formData.horaInicio || ''}
                                      onChange={handleInputChange}
                                      className="edit-input"
                                      style={{ width: '80px' }}
                                    />
                                    <span>-</span>
                                    <input
                                      type="time"
                                      name="horaFin"
                                      value={formData.horaFin || ''}
                                      onChange={handleInputChange}
                                      className="edit-input"
                                      style={{ width: '80px' }}
                                    />
                                  </div>
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
                                  <div className="acciones-edit">
                                    <button 
                                      className="guardar-edit-btn"
                                      onClick={handleGuardarCambios}
                                    >
                                      <SaveIcon style={{marginRight:8}}/>Guardar
                                    </button>
                                    <button 
                                      className="cancelar-edit-btn"
                                      onClick={handleCancelarEdicion}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="materia-cell">{examen.materia || 'N/A'}</td>
                                <td className="profesor-cell">{examen.profesor || 'N/A'}</td>
                                <td className="fecha-cell">{examen.fecha || 'N/A'}</td>
                                <td className="hora-cell">{examen.hora || 'N/A'}</td>
                                <td className="aula-cell">{examen.aula || 'N/A'}</td>
                                <td>
                                  <div className="acciones-buttons">
                                    <button 
                                      className="editar-horario-btn"
                                      onClick={() => handleEditarHorario(examen, g)}
                                    >
                                      <EditIcon style={{marginRight:8}}/>Editar
                                    </button>
                                    <button 
                                      className="eliminar-horario-btn"
                                      onClick={() => handleEliminarHorario(examen.id_horario, g)}
                                    >
                                      <TrashIcon style={{marginRight:8}}/>Eliminar
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
                </div>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="acciones-footer">
              <button 
                className="guardar-borrador-btn"
                onClick={handleGuardarBorrador}
              >
                <SaveIcon style={{marginRight:8}}/>Guardar Borrador
              </button>
              
              <button 
                className="guardar-cambios-btn"
                onClick={handleGuardarCambiosFinal}
              >
                <SaveIcon style={{marginRight:8}}/>Guardar Cambios
              </button>
              
              <button 
                className="salir-btn"
                onClick={handleSalir}
              >
                <LogoutIcon style={{marginRight:8}}/>Salir sin Guardar
              </button>
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
    </Layout>
  );
};

export default ModificarCalendario;