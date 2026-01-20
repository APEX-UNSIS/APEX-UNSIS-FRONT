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

      // Cargar horarios de la carrera (que incluyen materias y grupos)
      const horarios = await horarioService.getByCarrera(user.id_carrera);
      
      // Cargar profesores/sinodales de la carrera
      const profesoresSinodales = await profesorService.getSinodalesByCarrera(user.id_carrera);
      
      // Cargar todas las asignaciones sinodales existentes
      const asignaciones = await asignacionSinodalService.getAll();
      
      // Cargar solicitudes de examen para mapear asignaciones con materias
      // Por ahora, usamos las asignaciones directamente
      
      // Procesar los datos para crear la estructura de materias
      const materiasMap = new Map();
      
      horarios.forEach((horario) => {
        const materiaId = horario.id_materia || horario.materia?.id_materia;
        if (!materiaId) return;
        
        const materiaNombre = horario.materia?.nombre_materia || 'Materia sin nombre';
        const grupoNombre = horario.grupo?.nombre_grupo || horario.id_grupo || 'Sin grupo';
        const idGrupo = horario.id_grupo || horario.grupo?.id_grupo;
        
        if (!materiasMap.has(materiaId)) {
          materiasMap.set(materiaId, {
            id_materia: materiaId,
            nombre: materiaNombre,
            grupos: new Set([grupoNombre]),
            id_grupos: new Set([idGrupo]),
            horarios: [horario]
          });
        } else {
          const materia = materiasMap.get(materiaId);
          materia.grupos.add(grupoNombre);
          if (idGrupo) materia.id_grupos.add(idGrupo);
          materia.horarios.push(horario);
        }
      });
      
      // Convertir el Map a array y agregar información de sinodales
      const materiasData = Array.from(materiasMap.values()).map(materia => {
        // Buscar si hay una asignación sinodal para algún horario de esta materia
        // Por ahora, asumimos que necesitamos un horario_id de solicitud
        let sinodalAsignado = null;
        
        // Obtener sinodales con permisos para esta materia específica
        // Todos los profesores con permisos sinodales de la carrera están disponibles
        const sinodalesDisponibles = profesoresSinodales.map(p => {
          const asignacionesCount = asignaciones.filter(a => 
            a.id_profesor === p.id_profesor
          ).length;
          
          return {
            id_profesor: p.id_profesor,
            nombre: p.nombre_profesor,
            disponible: asignacionesCount < 3 // Límite de 3 materias
          };
        });
        
        return {
          id_materia: materia.id_materia,
          nombre: materia.nombre,
          grupo: Array.from(materia.grupos).join(', '), // Mostrar todos los grupos
          grupos: Array.from(materia.grupos),
          id_grupos: Array.from(materia.id_grupos),
          horarios: materia.horarios,
          sinodalAsignado: sinodalAsignado,
          sinodalesDisponibles: sinodalesDisponibles
        };
      });
      
      setMaterias(materiasData);
      
      // Configurar sinodales disponibles (conteo general)
      const sinodalesData = profesoresSinodales.map(profesor => {
        // Contar cuántas asignaciones tiene este profesor
        const asignacionesCount = asignaciones.filter(a => 
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

    const sinodal = sinodalesDisponibles.find(s => s.id_profesor === sinodalId);
    if (!sinodal) return;

    // Buscar un horario/solicitud para esta materia
    // Por ahora, solo actualizamos el estado local
    // TODO: Implementar creación de asignación sinodal en el backend
    
    setMaterias(materias.map(materia => {
      if (materia.id_materia === materiaId) {
        // Quitar disponibilidad del sinodal anterior si existía
        if (materia.sinodalAsignado) {
          setSinodalesDisponibles(sinodalesDisponibles.map(s => 
            s.id_profesor === materia.sinodalAsignado.id_profesor 
              ? { ...s, materiasAsignadas: s.materiasAsignadas - 1, disponible: s.materiasAsignadas - 1 < 3 }
              : s
          ));
        }

        // Actualizar disponibilidad del nuevo sinodal
        setSinodalesDisponibles(sinodalesDisponibles.map(s => 
          s.id_profesor === sinodalId 
            ? { ...s, materiasAsignadas: s.materiasAsignadas + 1, disponible: s.materiasAsignadas + 1 < 3 }
            : s
        ));

        return {
          ...materia,
          sinodalAsignado: sinodal
        };
      }
      return materia;
    }));
  };

  const handleRemoverSinodal = async (materiaId) => {
    const materia = materias.find(m => m.id_materia === materiaId);
    if (!materia || !materia.sinodalAsignado) {
      return;
    }

    // TODO: Implementar eliminación de asignación sinodal en el backend
    
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

  return (
    <Layout user={user} onLogout={onLogout}>
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
                background: '#FEE2E2', 
                color: '#991B1B', 
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
    </Layout>
  );
};

export default GestionSinodales;