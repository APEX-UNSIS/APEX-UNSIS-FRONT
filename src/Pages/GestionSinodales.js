import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import Layout from '../components/Layout';
import './GestionSinodales.css';
import { GraduateIcon, TrashIcon } from '../icons';
import horarioService from '../core/services/horarioService';
import materiaService from '../core/services/materiaService';
import profesorService from '../core/services/profesorService';
import permisoService from '../core/services/permisoService';
import asignacionSinodalService from '../core/services/asignacionSinodalService';
import calendarioService from '../core/services/calendarioService';

const GestionSinodales = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [materias, setMaterias] = useState([]);
  const [sinodalesDisponibles, setSinodalesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAgregarSinodal, setShowAgregarSinodal] = useState(false);
  const [nuevoSinodal, setNuevoSinodal] = useState({ nombre: '', email: '', telefono: '' });

  // Validar que el usuario tenga carrera asignada
  useEffect(() => {
    if (!user || !user.id_carrera) {
      setError('No tienes una carrera asignada. Solo los jefes de carrera pueden gestionar sinodales.');
      setLoading(false);
      return;
    }
    
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.id_carrera) {
        return;
      }

      // Cargar solicitudes de examen de la carrera (estas son las materias con exámenes programados)
      const solicitudes = await calendarioService.obtener();
      
      // Cargar profesores/sinodales de la carrera (filtrados por carrera)
      let profesoresSinodales = [];
      try {
        profesoresSinodales = await profesorService.getSinodalesByCarrera(user.id_carrera);
      } catch (err) {
        console.error('Error obteniendo sinodales:', err);
        console.error('Error completo:', err.response?.data || err.message);
        setError(`Error al cargar sinodales: ${err.response?.data?.detail || err.message}`);
        profesoresSinodales = [];
      }
      
      // Cargar todas las asignaciones sinodales existentes (una sola petición; agrupamos por id_horario en memoria)
      const todasAsignaciones = await asignacionSinodalService.getAll();
      const asignacionesByHorario = {};
      (todasAsignaciones || []).forEach((a) => {
        const idH = a.id_horario;
        if (!asignacionesByHorario[idH]) asignacionesByHorario[idH] = [];
        asignacionesByHorario[idH].push(a);
      });
      
      // Cargar horarios de clase para obtener profesores titulares de cada materia
      const horarios = await horarioService.getByCarrera(user.id_carrera);
      
      // Crear un mapa de materias -> profesores titulares
      const profesoresTitularesPorMateria = new Map();
      horarios.forEach(horario => {
        const materiaId = horario.id_materia || horario.materia?.id_materia;
        const profesorId = horario.id_profesor || horario.profesor?.id_profesor;
        if (materiaId && profesorId) {
          if (!profesoresTitularesPorMateria.has(materiaId)) {
            profesoresTitularesPorMateria.set(materiaId, new Set());
          }
          profesoresTitularesPorMateria.get(materiaId).add(profesorId);
        }
      });
      
      // Procesar las solicitudes para crear la estructura de materias (sin más llamadas a la API)
      const materiasMap = new Map();
      
      for (const solicitud of solicitudes) {
        const materiaId = solicitud.id_materia;
        const materiaNombre = solicitud.materia || 'Materia sin nombre';
        const grupos = solicitud.grupos || [];
        const idHorario = solicitud.id_horario;
        
        if (!materiaId) {
          console.warn('Solicitud sin id_materia:', solicitud);
          continue;
        }
        
        const asignacionesSolicitud = asignacionesByHorario[idHorario] || [];
        
        // Agrupar por id_materia
        if (!materiasMap.has(materiaId)) {
          materiasMap.set(materiaId, {
            id_materia: materiaId,
            nombre: materiaNombre,
            grupos: new Set(grupos),
            solicitudes: [{
              id_horario: idHorario,
              grupos: grupos,
              fecha: solicitud.fecha,
              hora: solicitud.hora,
              asignaciones_sinodales: asignacionesSolicitud
            }]
          });
        } else {
          const materia = materiasMap.get(materiaId);
          grupos.forEach(g => materia.grupos.add(g));
          materia.solicitudes.push({
            id_horario: idHorario,
            grupos: grupos,
            fecha: solicitud.fecha,
            hora: solicitud.hora,
            asignaciones_sinodales: asignacionesSolicitud
          });
        }
      }
      
      // Convertir el Map a array y agregar información de sinodales
      const materiasData = Array.from(materiasMap.values()).map(materia => {
        // Obtener el sinodal asignado (si hay alguna asignación para alguna solicitud de esta materia)
        let sinodalAsignado = null;
        let idHorarioPrincipal = null;
        
        // Buscar la primera solicitud que tenga un sinodal asignado
        for (const solicitud of materia.solicitudes) {
          if (solicitud.asignaciones_sinodales && solicitud.asignaciones_sinodales.length > 0) {
            const asignacion = solicitud.asignaciones_sinodales[0];
            const profesor = profesoresSinodales.find(p => p.id_profesor === asignacion.id_profesor);
            if (profesor) {
              sinodalAsignado = {
                id_profesor: profesor.id_profesor,
                nombre: profesor.nombre_profesor
              };
              idHorarioPrincipal = solicitud.id_horario;
              break;
            }
          }
        }
        
        // Si no hay sinodal asignado, usar la primera solicitud como referencia
        if (!idHorarioPrincipal && materia.solicitudes.length > 0) {
          idHorarioPrincipal = materia.solicitudes[0].id_horario;
        }
        
        // Obtener profesores titulares de esta materia (excluirlos de sinodales)
        const profesoresTitulares = profesoresTitularesPorMateria.get(materia.id_materia) || new Set();
        
        // Obtener sinodales disponibles (profesores con permisos sinodales de la carrera)
        // Excluir profesores titulares (no pueden ser sinodales de su propia materia)
        const sinodalesDisponibles = profesoresSinodales && profesoresSinodales.length > 0 
          ? profesoresSinodales
              .filter(p => !profesoresTitulares.has(p.id_profesor)) // Excluir profesores titulares
              .map(p => {
                // Contar asignaciones de este profesor en todas las solicitudes de esta carrera
                const asignacionesCount = todasAsignaciones.filter(a => 
                  a.id_profesor === p.id_profesor
                ).length;
                
                return {
                  id_profesor: p.id_profesor,
                  nombre: p.nombre_profesor,
                  disponible: asignacionesCount < 3 // Límite de 3 materias
                };
              })
          : [];
        
        return {
          id_materia: materia.id_materia,
          nombre: materia.nombre,
          grupo: Array.from(materia.grupos).join(', '), // Mostrar todos los grupos
          grupos: Array.from(materia.grupos),
          solicitudes: materia.solicitudes,
          id_horario: idHorarioPrincipal, // ID de la solicitud principal para asignar sinodales
          sinodalAsignado: sinodalAsignado,
          sinodalesDisponibles: sinodalesDisponibles
        };
      });
      
      setMaterias(materiasData);
      
      // Configurar sinodales disponibles (conteo general)
      const sinodalesData = profesoresSinodales.map(profesor => {
        // Contar cuántas asignaciones tiene este profesor
        const asignacionesCount = todasAsignaciones.filter(a => 
          a.id_profesor === profesor.id_profesor
        ).length;
        
        return {
          id_profesor: profesor.id_profesor,
          nombre: profesor.nombre_profesor,
          materiasAsignadas: asignacionesCount,
          disponible: asignacionesCount < 3 // Límite de 3 materias
        };
      });
      
      setSinodalesDisponibles(sinodalesData);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };


  const handleAsignarSinodal = async (materiaId, sinodalId) => {
    if (!sinodalId || sinodalId === '') {
      return;
    }

    const materia = materias.find(m => m.id_materia === materiaId);
    if (!materia || !materia.id_horario) {
      alert('No se encontró la solicitud de examen para esta materia.');
      return;
    }

    const sinodal = sinodalesDisponibles.find(s => s.id_profesor === sinodalId);
    if (!sinodal) {
      alert('Sinodal no encontrado.');
      return;
    }

    try {
      // Generar ID único para la asignación sinodal (similar al backend)
      // Usar una función simple de hash basada en el algoritmo del backend
      const hashInput = `${materia.id_horario}-${sinodalId}`;
      
      // Función simple para generar hash MD5-like (usando una implementación básica)
      const generateHash = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convertir a entero de 32 bits
        }
        // Convertir a hexadecimal y tomar primeros 18 caracteres
        const hex = Math.abs(hash).toString(16).toUpperCase().padStart(18, '0').substring(0, 18);
        return `ES${hex}`;
      };
      
      const idExamenSinodal = generateHash(hashInput);
      
      // Crear asignación sinodal en el backend
      await asignacionSinodalService.create({
        id_examen_sinodal: idExamenSinodal,
        id_horario: materia.id_horario,
        id_profesor: sinodalId
      });

      // Actualizar estado local
      setMaterias(materias.map(m => {
        if (m.id_materia === materiaId) {
          // Quitar disponibilidad del sinodal anterior si existía
          if (m.sinodalAsignado) {
            setSinodalesDisponibles(sinodalesDisponibles.map(s => 
              s.id_profesor === m.sinodalAsignado.id_profesor 
                ? { ...s, materiasAsignadas: s.materiasAsignadas - 1, disponible: s.materiasAsignadas - 1 < 3 }
                : s
            ));
          }

          return {
            ...m,
            sinodalAsignado: {
              id_profesor: sinodal.id_profesor,
              nombre: sinodal.nombre
            }
          };
        }
        return m;
      }));

      // Actualizar disponibilidad del nuevo sinodal
      setSinodalesDisponibles(sinodalesDisponibles.map(s => 
        s.id_profesor === sinodalId 
          ? { ...s, materiasAsignadas: s.materiasAsignadas + 1, disponible: s.materiasAsignadas + 1 < 3 }
          : s
      ));
    } catch (err) {
      console.error('Error asignando sinodal:', err);
      alert('Error al asignar sinodal. Por favor, intenta de nuevo.');
    }
  };

  const handleRemoverSinodal = async (materiaId) => {
    const materia = materias.find(m => m.id_materia === materiaId);
    if (!materia || !materia.sinodalAsignado || !materia.id_horario) {
      return;
    }

    try {
      // Obtener las asignaciones de sinodales para esta solicitud
      const asignaciones = await asignacionSinodalService.getBySolicitud(materia.id_horario);
      
      // Eliminar todas las asignaciones de sinodales para esta solicitud
      for (const asignacion of asignaciones) {
        if (asignacion.id_profesor === materia.sinodalAsignado.id_profesor) {
          await asignacionSinodalService.delete(asignacion.id_examen_sinodal);
        }
      }

      // Actualizar estado local
      setMaterias(materias.map(m => {
        if (m.id_materia === materiaId) {
          // Restaurar disponibilidad del sinodal
          setSinodalesDisponibles(sinodalesDisponibles.map(s => 
            s.id_profesor === m.sinodalAsignado.id_profesor 
              ? { ...s, materiasAsignadas: s.materiasAsignadas - 1, disponible: s.materiasAsignadas - 1 < 3 }
              : s
          ));

          return {
            ...m,
            sinodalAsignado: null
          };
        }
        return m;
      }));
    } catch (err) {
      console.error('Error removiendo sinodal:', err);
      alert('Error al remover sinodal. Por favor, intenta de nuevo.');
    }
  };

  const handleAgregarSinodal = () => {
    if (!nuevoSinodal.nombre.trim()) {
      alert('El nombre del sinodal es requerido');
      return;
    }

    const nuevoId = Math.max(...sinodalesDisponibles.map(s => s.id)) + 1;
    const nuevoSinodalObj = {
      id: nuevoId,
      nombre: nuevoSinodal.nombre,
      email: nuevoSinodal.email,
      telefono: nuevoSinodal.telefono,
      materiasAsignadas: 0,
      disponible: true
    };

    setSinodalesDisponibles([...sinodalesDisponibles, nuevoSinodalObj]);
    setNuevoSinodal({ nombre: '', email: '', telefono: '' });
    setShowAgregarSinodal(false);
    alert('Sinodal agregado exitosamente');
  };

  const handleEliminarSinodal = (sinodalId) => {
    if (window.confirm('¿Estás seguro de eliminar este sinodal?')) {
      // Verificar si el sinodal está asignado a alguna materia
      const materiasConSinodal = materias.filter(m => m.sinodalAsignado?.id_profesor === sinodalId);
      if (materiasConSinodal.length > 0) {
        alert('No se puede eliminar el sinodal porque está asignado a materias');
        return;
      }

      setSinodalesDisponibles(sinodalesDisponibles.filter(s => s.id_profesor !== sinodalId));
      
      // Actualizar las listas de sinodales disponibles en las materias
      setMaterias(materias.map(materia => ({
        ...materia,
        sinodalesDisponibles: materia.sinodalesDisponibles.filter(s => s.id_profesor !== sinodalId)
      })));
    }
  };

  const contenido = (
    <div className="gestion-sinodales-container">
      <div className="content-area">
        <div className="sinodales-section">
          <div className="section-header">
            <h2 className="section-title">Asignación de Sinodales</h2>
              {user?.rol !== 'jefe' && (
                <button 
                  className="agregar-sinodal-btn"
                  onClick={() => setShowAgregarSinodal(true)}
                >
                  + Agregar Sinodal
                </button>
              )}
            </div>

            {error && (
              <div style={{ 
                background: '#F3F4F6', 
                color: '#6B7280', 
                padding: '12px', 
                borderRadius: '6px', 
                marginBottom: '20px' 
              }}>
                {error}
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Cargando materias y sinodales...</p>
              </div>
            )}

            {!loading && (
              <>
            {/* Estadísticas */}
            {user?.rol !== 'jefe' && (
            <div className="estadisticas-sinodales">
              <div className="estadistica-card">
                <h3>Sinodales Disponibles</h3>
                <p className="numero">{sinodalesDisponibles.filter(s => s.disponible).length}</p>
              </div>
              <div className="estadistica-card">
                <h3>Materias Asignadas</h3>
                <p className="numero">{materias.filter(m => m.sinodalAsignado).length}</p>
              </div>
              <div className="estadistica-card">
                <h3>Materias sin Asignar</h3>
                <p className="numero">{materias.filter(m => !m.sinodalAsignado).length}</p>
              </div>
              <div className="estadistica-card">
                <h3>Total Sinodales</h3>
                <p className="numero">{sinodalesDisponibles.length}</p>
              </div>
            </div>
            )}

            {/* Tabla de asignación */}
            <div className="asignacion-container">
              <table className="asignacion-table">
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Grupo</th>
                    <th>Sinodal Asignado</th>
                    <th>Sinodales Disponibles</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {materias.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                        {loading ? 'Cargando materias...' : 'No hay materias para tu carrera'}
                      </td>
                    </tr>
                  ) : (
                    materias.map((materia) => (
                      <tr key={materia.id_materia}>
                        <td className="materia-cell">{materia.nombre}</td>
                        <td className="grupo-cell">{materia.grupo}</td>
                        <td className="sinodal-asignado-cell">
                          {materia.sinodalAsignado ? (
                            <div className="sinodal-info">
                              <span className="sinodal-nombre">{materia.sinodalAsignado.nombre}</span>
                              <button 
                                className="remover-btn"
                                onClick={() => handleRemoverSinodal(materia.id_materia)}
                              >
                                <TrashIcon style={{marginRight:8}}/>Remover
                              </button>
                            </div>
                          ) : (
                            <span className="sin-asignado">Sin sinodal asignado</span>
                          )}
                        </td>
                        <td className="sinodales-disponibles-cell">
                          {materia.sinodalesDisponibles && materia.sinodalesDisponibles.length > 0 ? (
                            <select
                              className="sinodal-select"
                              value={materia.sinodalAsignado?.id_profesor || ''}
                              onChange={(e) => handleAsignarSinodal(materia.id_materia, e.target.value)}
                            >
                              <option value="">Seleccionar sinodal...</option>
                              {materia.sinodalesDisponibles
                                .filter(s => s.disponible || s.id_profesor === materia.sinodalAsignado?.id_profesor)
                                .map((sinodal) => (
                                  <option 
                                    key={sinodal.id_profesor} 
                                    value={sinodal.id_profesor}
                                    disabled={!sinodal.disponible && sinodal.id_profesor !== materia.sinodalAsignado?.id_profesor}
                                  >
                                    {sinodal.nombre} 
                                    {!sinodal.disponible && sinodal.id_profesor !== materia.sinodalAsignado?.id_profesor && ' (No disponible)'}
                                  </option>
                                ))
                              }
                            </select>
                          ) : (
                            <span style={{ color: '#6B7280', fontStyle: 'italic' }}>
                              No hay sinodales disponibles para esta carrera
                            </span>
                          )}
                        </td>
                        <td className="acciones-cell">
                          <button 
                            className="asignar-btn"
                            onClick={() => {
                              const sinodalDisponible = sinodalesDisponibles.find(s => s.disponible);
                              if (sinodalDisponible) {
                                handleAsignarSinodal(materia.id_materia, sinodalDisponible.id_profesor);
                              }
                            }}
                            disabled={!sinodalesDisponibles.some(s => s.disponible)}
                          >
                            <GraduateIcon style={{marginRight:8}}/>Asignar Automático
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Lista de sinodales */}
            {user?.rol !== 'jefe' && (
              <div className="lista-sinodales">
                <h3 className="lista-title">Sinodales Disponibles</h3>
                <div className="sinodales-grid">
                  {sinodalesDisponibles.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                      No hay sinodales disponibles para tu carrera
                    </p>
                  ) : (
                    sinodalesDisponibles.map((sinodal) => (
                      <div key={sinodal.id_profesor} className="sinodal-card">
                        <div className="sinodal-header">
                          <h4>{sinodal.nombre}</h4>
                          <span className={`disponibilidad-badge ${sinodal.disponible ? 'disponible' : 'no-disponible'}`}>
                            {sinodal.disponible ? 'Disponible' : 'No disponible'}
                          </span>
                        </div>
                        <div className="sinodal-info">
                          <p><strong>Matrícula:</strong> {sinodal.id_profesor}</p>
                          <p><strong>Materias asignadas:</strong> {sinodal.materiasAsignadas}</p>
                          <p><strong>Límite:</strong> {sinodal.materiasAsignadas}/3 materias</p>
                        </div>
                        <div className="sinodal-actions">
                          <button 
                            className="eliminar-sinodal-btn"
                            onClick={() => handleEliminarSinodal(sinodal.id_profesor)}
                            disabled={sinodal.materiasAsignadas > 0}
                          >
                            <TrashIcon style={{marginRight:8}}/>Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
              </>
            )}
          </div>

          {/* Modal para agregar sinodal */}
          {showAgregarSinodal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3 className="modal-title">Agregar Nuevo Sinodal</h3>
                
                <div className="form-group">
                  <label>Nombre completo *</label>
                  <input
                    type="text"
                    value={nuevoSinodal.nombre}
                    onChange={(e) => setNuevoSinodal({...nuevoSinodal, nombre: e.target.value})}
                    placeholder="Ej: Mtro. Nombre Apellido"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email institucional</label>
                  <input
                    type="email"
                    value={nuevoSinodal.email}
                    onChange={(e) => setNuevoSinodal({...nuevoSinodal, email: e.target.value})}
                    placeholder="ejemplo@unsis.edu.mx"
                  />
                </div>
                
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={nuevoSinodal.telefono}
                    onChange={(e) => setNuevoSinodal({...nuevoSinodal, telefono: e.target.value})}
                    placeholder="555-123-4567"
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    className="modal-cancel"
                    onClick={() => setShowAgregarSinodal(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="modal-confirm"
                    onClick={handleAgregarSinodal}
                    disabled={!nuevoSinodal.nombre.trim()}
                  >
                    Agregar Sinodal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );

  // Si se pasa sinLayout, retornar solo el contenido sin Layout
  if (user?.sinLayout) {
    return contenido;
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      {contenido}
    </Layout>
  );
};

export default GestionSinodales;