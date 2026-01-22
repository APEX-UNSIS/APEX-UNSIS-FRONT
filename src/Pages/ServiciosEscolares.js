import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import Layout from '../components/Layout';
import calendarioService from '../core/services/calendarioService';
import './ServiciosEscolares.css';
import { EditIcon, CheckIcon, TrashIcon } from '../icons';

const ServiciosEscolares = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [calendarios, setCalendarios] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCalendario, setSelectedCalendario] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterCarrera, setFilterCarrera] = useState('todos');

  useEffect(() => {
    cargarCalendarios();
  }, []);

  useEffect(() => {
    // Recargar cuando cambie el filtro de estado
    cargarCalendarios();
  }, [filterEstado]);

  const cargarCalendarios = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando calendarios para Servicios Escolares...', filterEstado);
      const estadoFiltro = filterEstado === 'todos' ? null : filterEstado;
      const data = await calendarioService.obtenerParaServicios(estadoFiltro);
      console.log('Calendarios recibidos:', data);
      setCalendarios(data || []);
    } catch (err) {
      console.error('Error cargando calendarios:', err);
      setError(`Error al cargar los calendarios: ${err.response?.data?.detail || err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };


  const handleRevisar = (calendario) => {
    setSelectedCalendario(calendario);
    setObservaciones(calendario.observaciones || '');
    setShowModal(true);
  };

  const handleAprobar = async (calendario) => {
    if (!window.confirm(
      `¿Aprobar el calendario de ${calendario.nombre_carrera}?\n\n` +
      `Periodo: ${calendario.nombre_periodo || calendario.id_periodo}\n` +
      `Evaluación: ${calendario.nombre_evaluacion || calendario.id_evaluacion}\n` +
      `Total de exámenes: ${calendario.total_examenes}`
    )) {
      return;
    }

    try {
      setLoading(true);
      const resultado = await calendarioService.aprobar(
        calendario.id_carrera,
        calendario.id_periodo,
        calendario.id_evaluacion
      );
      
      alert(`✅ ${resultado.mensaje}\n${resultado.solicitudes_aprobadas} exámenes aprobados.`);
      await cargarCalendarios();
      setShowModal(false);
    } catch (err) {
      console.error('Error aprobando calendario:', err);
      alert(`Error al aprobar el calendario: ${err.response?.data?.detail || err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Regresar calendario con observaciones al Jefe de Carrera
  const handleRegresarConComentarios = async (calendario, motivo) => {
    if (!motivo || motivo.trim() === '') {
      alert('Por favor, ingresa un motivo o comentario para regresar el calendario.');
      return;
    }

    if (!window.confirm(
      `¿Regresar el calendario de ${calendario.nombre_carrera} con comentarios?\n\n` +
      `El jefe de carrera recibirá tus comentarios y podrá hacer correcciones.`
    )) {
      return;
    }

    try {
      setLoading(true);
      const resultado = await calendarioService.rechazar(
        calendario.id_carrera,
        calendario.id_periodo,
        calendario.id_evaluacion,
        motivo
      );
      
      alert(`✅ ${resultado.mensaje}\n${resultado.solicitudes_rechazadas} exámenes regresados.`);
      await cargarCalendarios();
      setShowModal(false);
    } catch (err) {
      console.error('Error rechazando calendario:', err);
      alert(`Error al regresar el calendario: ${err.response?.data?.detail || err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarObservaciones = () => {
    // Solo guarda observaciones localmente, no cambia el estado
    if (selectedCalendario) {
      setCalendarios(calendarios.map(c => 
        c.id_carrera === selectedCalendario.id_carrera && 
        c.id_periodo === selectedCalendario.id_periodo &&
        c.id_evaluacion === selectedCalendario.id_evaluacion
          ? { ...c, observaciones } : c
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
      case 'con_correcciones': return '#F97316';
      default: return '#6B7280';
    }
  };

  const getEstadoTexto = (estado) => {
    switch(estado) {
      case 'pendiente': return 'Pendiente de revisión';
      case 'revisado': return 'Revisado';
      case 'aprobado': return 'Aprobado con V°B°';
      case 'rechazado': return 'Rechazado / Regresado';
      case 'con_correcciones': return 'Regresado con comentarios';
      default: return estado || 'Desconocido';
    }
  };

  // Agrupar exámenes por grupo para mostrar tablas por grupo en el modal
  const groupedHorarios = selectedCalendario && selectedCalendario.examenes ?
    selectedCalendario.examenes.reduce((acc, examen) => {
      const gruposArray = Array.isArray(examen.grupos) ? examen.grupos : [];
      gruposArray.forEach(grupo => {
        if (!acc[grupo]) {
          acc[grupo] = [];
        }
        acc[grupo].push({
          grupo: grupo,
          materia: examen.materia,
          profesor: examen.profesor,
          fecha: examen.fecha,
          hora: examen.hora,
          aula: examen.aula,
          tipo: selectedCalendario.nombre_evaluacion || '',
          duracion: examen.hora ? '2h' : '' // Inferir duración de la hora
        });
      });
      return acc;
    }, {}) : {};

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="servicios-escolares-container">
          <div className="content-area">
            <div className="validacion-section">
              <h2 className="section-title">Calendarios Recibidos</h2>
              <p>Cargando calendarios...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="servicios-escolares-container">
          <div className="content-area">
            <div className="validacion-section">
              <h2 className="section-title">Calendarios Recibidos</h2>
              <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>
              <button onClick={cargarCalendarios} style={{ marginTop: '10px' }}>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="servicios-escolares-container">
        <div className="content-area">
          <div className="validacion-section">
            <h2 className="section-title">Calendarios Recibidos</h2>
            
            <div className="filtros-container">
              <div className="filtro">
                <label>Filtrar por estado:</label>
                <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="aprobado">Aprobados</option>
                  <option value="rechazado">Rechazados</option>
                </select>
              </div>
              
              <div className="filtro">
                <label>Filtrar por carrera:</label>
                <select value={filterCarrera} onChange={(e) => setFilterCarrera(e.target.value)}>
                  <option value="todos">Todas las carreras</option>
                  {Array.from(new Set(calendarios.map(c => c.nombre_carrera))).map((carrera) => (
                    <option key={carrera} value={carrera}>{carrera}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {calendarios.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                <p>No hay calendarios recibidos para revisar.</p>
                <p style={{ fontSize: '14px', marginTop: '10px' }}>
                  Los jefes de carrera deben enviar sus calendarios desde la página de "Modificar Calendario".
                </p>
              </div>
            ) : (
              <div className="calendarios-grid">
                {calendarios
                  .filter(c => (filterEstado === 'todos' || c.estado === filterEstado) && (filterCarrera === 'todos' || c.nombre_carrera === filterCarrera))
                  .map((calendario, index) => {
                    const calendarioId = `${calendario.id_carrera}-${calendario.id_periodo}-${calendario.id_evaluacion}`;
                    return (
                      <div key={calendarioId} className="calendario-card">
                        <div className="card-header">
                          <h3>{calendario.nombre_carrera}</h3>
                          <span 
                            className="estado-badge"
                            style={{ backgroundColor: getEstadoColor(calendario.estado) }}
                          >
                            {getEstadoTexto(calendario.estado)}
                          </span>
                        </div>
                        
                        <div className="card-body">
                          <p><strong>Jefe de Carrera:</strong> {calendario.jefe_carrera || 'N/A'}</p>
                          <p><strong>Periodo:</strong> {calendario.nombre_periodo || calendario.id_periodo}</p>
                          <p><strong>Evaluación:</strong> {calendario.nombre_evaluacion || calendario.id_evaluacion}</p>
                          <p><strong>Total de exámenes:</strong> {calendario.total_examenes}</p>
                          {calendario.fecha_envio && (
                            <p><strong>Fecha de envío:</strong> {new Date(calendario.fecha_envio).toLocaleDateString('es-MX')}</p>
                          )}
                          
                          {calendario.observaciones && (
                            <div className="observaciones" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#FEF3C7', borderRadius: '4px' }}>
                              <strong>Comentarios:</strong>
                              <p style={{ marginTop: '5px' }}>{calendario.observaciones}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="card-actions">
                          <button 
                            className="revisar-btn"
                            onClick={() => handleRevisar(calendario)}
                          >
                            <EditIcon style={{marginRight:8}}/>Revisar
                          </button>
                          
                          <button 
                            className="aprobar-btn"
                            onClick={() => handleAprobar(calendario)}
                            disabled={calendario.estado === 'aprobado'}
                            style={{ 
                              backgroundColor: calendario.estado === 'aprobado' ? '#9CA3AF' : '#10B981', 
                              borderColor: calendario.estado === 'aprobado' ? '#9CA3AF' : '#10B981', 
                              color: '#fff',
                              cursor: calendario.estado === 'aprobado' ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <CheckIcon style={{marginRight:8}}/>Dar V°B°
                          </button>
                          
                          <button 
                            className="rechazar-btn"
                            onClick={() => {
                              setSelectedCalendario(calendario);
                              setObservaciones(calendario.observaciones || '');
                              setShowModal(true);
                            }}
                            disabled={calendario.estado === 'rechazado'}
                            style={{ 
                              backgroundColor: calendario.estado === 'rechazado' ? '#9CA3AF' : '#EF4444', 
                              borderColor: calendario.estado === 'rechazado' ? '#9CA3AF' : '#EF4444', 
                              color: '#fff',
                              cursor: calendario.estado === 'rechazado' ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <TrashIcon style={{marginRight:8}}/>Regresar con comentarios
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
            
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
                <h3>Con correcciones</h3>
                <p className="numero">{calendarios.filter(c => c.estado === 'con_correcciones').length}</p>
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

      {/* Modal de revisión */}
      {showModal && selectedCalendario && (
      <div className="modal-overlay">
        <div className="modal-content" style={{ width: '90%', maxWidth: '1100px' }}>
            <h3 className="modal-title">Revisar Calendario - {selectedCalendario.nombre_carrera}</h3>
            
            <div className="info-calendario">
              <p><strong>Jefe de Carrera:</strong> {selectedCalendario.jefe_carrera || 'N/A'}</p>
              <p><strong>Periodo:</strong> {selectedCalendario.nombre_periodo || selectedCalendario.id_periodo}</p>
              <p><strong>Evaluación:</strong> {selectedCalendario.nombre_evaluacion || selectedCalendario.id_evaluacion}</p>
              <p><strong>Total de exámenes:</strong> {selectedCalendario.total_examenes}</p>
              {selectedCalendario.fecha_envio && (
                <p><strong>Fecha de envío:</strong> {new Date(selectedCalendario.fecha_envio).toLocaleDateString('es-MX')}</p>
              )}
              <p><strong>Estado actual:</strong> {getEstadoTexto(selectedCalendario.estado)}</p>
            </div>
            
            <div className="form-group">
              <label>Comentarios / Motivo de rechazo:</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows="4"
                placeholder="Ingresa tus comentarios u observaciones sobre este calendario. Si regresas el calendario, estos comentarios serán visibles para el jefe de carrera."
              />
            </div>

            {/* Mostrar calendario (exámenes) del calendario seleccionado agrupado por grupo */}
            {selectedCalendario.examenes && selectedCalendario.examenes.length > 0 && (
              <div className="detalle-calendario">
                <h4>Calendario - Grupos</h4>
                {Object.keys(groupedHorarios).sort().map((grupo) => (
                  <div key={grupo} className="grupo-section" style={{ marginBottom: 18 }}>
                    <h5 style={{ marginBottom: 8 }}>Grupo {grupo}</h5>
                    <div className="tabla-calendario">
                      <table>
                        <thead>
                          <tr>
                            <th>MATERIA</th>
                            <th>DOCENTE</th>
                            <th>FECHA</th>
                            <th>HORA</th>
                            <th>AULA</th>
                            <th>TIPO</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedHorarios[grupo].map((h, i) => (
                            <tr key={i}>
                              <td>{h.materia || 'N/A'}</td>
                              <td>{h.profesor || 'N/A'}</td>
                              <td>{h.fecha || 'N/A'}</td>
                              <td>{h.hora || 'N/A'}</td>
                              <td>{h.aula || 'N/A'}</td>
                              <td>{h.tipo || selectedCalendario.nombre_evaluacion || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="acciones-rapidas">
              <p><strong>Acciones rápidas:</strong></p>
              <div className="botones-rapidos">
                <button 
                  className="btn-aprobar"
                  onClick={() => {
                    handleAprobar(selectedCalendario);
                  }}
                  disabled={selectedCalendario.estado === 'aprobado'}
                  style={{ 
                    backgroundColor: selectedCalendario.estado === 'aprobado' ? '#9CA3AF' : '#10B981', 
                    borderColor: selectedCalendario.estado === 'aprobado' ? '#9CA3AF' : '#10B981', 
                    color: '#fff',
                    cursor: selectedCalendario.estado === 'aprobado' ? 'not-allowed' : 'pointer'
                  }}
                >
                  <CheckIcon style={{marginRight:8}}/>Aprobar con V°B°
                </button>
                <button 
                  className="btn-rechazar"
                  onClick={() => {
                    if (!observaciones || observaciones.trim() === '') {
                      alert('Por favor, ingresa un comentario o motivo antes de regresar el calendario.');
                      return;
                    }
                    handleRegresarConComentarios(selectedCalendario, observaciones);
                  }}
                  disabled={selectedCalendario.estado === 'rechazado'}
                  style={{ 
                    backgroundColor: selectedCalendario.estado === 'rechazado' ? '#9CA3AF' : '#EF4444', 
                    borderColor: selectedCalendario.estado === 'rechazado' ? '#9CA3AF' : '#EF4444', 
                    color: '#fff',
                    cursor: selectedCalendario.estado === 'rechazado' ? 'not-allowed' : 'pointer'
                  }}
                >
                  <TrashIcon style={{marginRight:8}}/>Regresar con comentarios
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="modal-cancel"
                onClick={() => {
                  setShowModal(false);
                  setObservaciones('');
                }}
              >
                Cerrar
              </button>
              <button 
                className="modal-guardar"
                onClick={handleGuardarObservaciones}
              >
                Guardar comentarios
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default ServiciosEscolares;