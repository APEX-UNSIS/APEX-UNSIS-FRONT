import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import Layout from '../components/Layout';
import './ServiciosEscolares.css';
import { EditIcon, CheckIcon, TrashIcon } from '../icons';

const ServiciosEscolares = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [calendarios, setCalendarios] = useState([
    { 
      id: 1, 
      carrera: 'Ingeniería en Sistemas', 
      jefe: 'Mtro. Juan Pérez', 
      fechaEnvio: '2025-01-15', 
      estado: 'pendiente',
      observaciones: '',
      horarios: [
        { grupo: '706', materia: 'Tecnologias Web II', profesor: 'Mtro. Irving Ulises Hernandez Miguel', fecha: '02/12/2025', hora: '8:00-9:00', aula: 'Lab. Tecnologias web', tipo: 'Ordinario', duracion: '1h' },
        { grupo: '706', materia: 'Bases de Datos avanzadas', profesor: 'Mtro. Eliezer alcazar Silva', fecha: '03/12/2025', hora: '17:00-18:00', aula: 'Lab. Ingenieria de software', tipo: 'Ordinario', duracion: '1h' },
        { grupo: '706', materia: 'Sistemas Operativos', profesor: 'Mtro. Raúl Gómez', fecha: '06/12/2025', hora: '09:00-10:00', aula: 'Aula 2', tipo: 'Ordinario', duracion: '1h' },
        { grupo: '706', materia: 'Redes Avanzadas', profesor: 'Mtro. Pedro Martínez', fecha: '07/12/2025', hora: '13:00-15:00', aula: 'Lab. Redes', tipo: 'Parcial', duracion: '2h' },
        { grupo: '707', materia: 'Ingenieria de software II', profesor: 'DR. Eric Melesio Castro Leal', fecha: '04/12/2025', hora: '11:00-12:00', aula: 'Lab. Ingenieria de software', tipo: 'Parcial', duracion: '2h' },
        { grupo: '708', materia: 'Probabilidad y estadistica', profesor: 'Dr. Alejandro jarillo Silva', fecha: '05/12/2025', hora: '8:00-9:00', aula: 'Redes', tipo: 'Ordinario', duracion: '1h' },
        { grupo: '709', materia: 'Derecho y Legislacion', profesor: 'Dr. Gerardo Aragon Gonzales', fecha: '05/12/2025', hora: '10:00-11:00', aula: 'Redes', tipo: 'Extraordinario', duracion: '1.5h' },
        { grupo: '707', materia: 'Ingeniería de Requisitos', profesor: 'Mtra. Laura Núñez', fecha: '08/12/2025', hora: '10:00-11:00', aula: 'Aula 6', tipo: 'Ordinario', duracion: '1h' },
        { grupo: '708', materia: 'Algoritmos y Estructuras', profesor: 'Mtro. Oscar Medina', fecha: '09/12/2025', hora: '14:00-15:30', aula: 'Lab. Algoritmos', tipo: 'Extraordinario', duracion: '1.5h' },
      ]
    },
    { 
      id: 2, 
      carrera: 'Administración', 
      jefe: 'Mtro. María García', 
      fechaEnvio: '2025-01-10', 
      estado: 'revisado',
      observaciones: 'Falta firmar los documentos',
      horarios: [
        { grupo: '502', materia: 'Contabilidad intermedia', profesor: 'Mtra. Ana Ruiz', fecha: '03/12/2025', hora: '10:00-11:00', aula: 'Aula 12', tipo: 'Ordinario', duracion: '1h' },
        { grupo: '502', materia: 'Gestión financiera', profesor: 'Mtro. Luis Herrera', fecha: '04/12/2025', hora: '12:00-13:00', aula: 'Aula 14', tipo: 'Ordinario', duracion: '1h' },
        { grupo: '503', materia: 'Economía Empresarial', profesor: 'Mtra. Sofia Paredes', fecha: '05/12/2025', hora: '09:00-10:30', aula: 'Aula 10', tipo: 'Parcial', duracion: '1.5h' },
        { grupo: '502', materia: 'Marketing Estratégico', profesor: 'Mtro. Jorge Salas', fecha: '06/12/2025', hora: '11:00-12:00', aula: 'Aula 14', tipo: 'Ordinario', duracion: '1h' },
      ]
    },
    { 
      id: 3, 
      carrera: 'Contabilidad', 
      jefe: 'Dr. Carlos López', 
      fechaEnvio: '2025-01-05', 
      estado: 'aprobado',
      observaciones: 'Todo en orden',
      horarios: [
        { grupo: '301', materia: 'Contabilidad Financiera', profesor: 'Dr. Carlos López', fecha: '05/12/2025', hora: '9:00-10:00', aula: 'Aula 3', tipo: 'Ordinario', duracion: '1h' },
        { grupo: '302', materia: 'Auditoria I', profesor: 'Mtra. Carla Mendoza', fecha: '06/12/2025', hora: '14:00-16:00', aula: 'Aula 5', tipo: 'Parcial', duracion: '2h' },
        { grupo: '301', materia: 'Impuestos I', profesor: 'Mtro. Eduardo Silva', fecha: '07/12/2025', hora: '08:00-09:30', aula: 'Aula 3', tipo: 'Ordinario', duracion: '1.5h' },
        { grupo: '303', materia: 'Contabilidad de Costos', profesor: 'Mtra. Patricia León', fecha: '08/12/2025', hora: '13:00-14:00', aula: 'Aula 6', tipo: 'Ordinario', duracion: '1h' },
      ]
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedCalendario, setSelectedCalendario] = useState(null);
  const [observaciones, setObservaciones] = useState('');

  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterCarrera, setFilterCarrera] = useState('todos');


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

  // Regresar calendario con observaciones al Jefe de Carrera
  const handleRegresarConComentarios = (id, obs) => {
    setCalendarios(calendarios.map(c => 
      c.id === id ? { ...c, estado: 'con_correcciones', observaciones: obs || c.observaciones } : c
    ));
  };

  const handleGuardarObservaciones = () => {
    if (selectedCalendario) {
      // Si hay observaciones se marca como "con_correcciones", si está vacío solo guarda nota de revisión
      setCalendarios(calendarios.map(c => 
        c.id === selectedCalendario.id ? { ...c, observaciones, estado: observaciones ? 'con_correcciones' : 'revisado' } : c
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
      case 'revisado': return 'Revisado con observaciones';
      case 'aprobado': return 'Aprobado con V°B°';
      case 'rechazado': return 'Rechazado';
      case 'con_correcciones': return 'Regresado con comentarios';
      default: return estado;
    }
  };

  // Agrupar horarios por grupo para mostrar tablas por grupo en el modal
  const groupedHorarios = selectedCalendario && selectedCalendario.horarios ?
    selectedCalendario.horarios.reduce((acc, h) => {
      acc[h.grupo] = acc[h.grupo] || [];
      acc[h.grupo].push(h);
      return acc;
    }, {}) : {};

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
                  <option value="revisado">Revisados</option>
                  <option value="con_correcciones">Con correcciones</option>
                  <option value="aprobado">Aprobados</option>
                </select>
              </div>
              
              <div className="filtro">
                <label>Filtrar por carrera:</label>
                <select value={filterCarrera} onChange={(e) => setFilterCarrera(e.target.value)}>
                  <option value="todos">Todas las carreras</option>
                  {Array.from(new Set(calendarios.map(c => c.carrera))).map((carrera) => (
                    <option key={carrera} value={carrera}>{carrera}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="calendarios-grid">
              {calendarios
                .filter(c => (filterEstado === 'todos' || c.estado === filterEstado) && (filterCarrera === 'todos' || c.carrera === filterCarrera))
                .map((calendario) => (
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
                      <EditIcon style={{marginRight:8}}/>Revisar
                    </button>
                    
                    <button 
                      className="aprobar-btn"
                      onClick={() => handleAprobar(calendario.id)}
                      disabled={calendario.estado === 'aprobado'}
                      style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#fff' }}
                    >
                      <CheckIcon style={{marginRight:8}}/>Dar V°B°
                    </button>
                    
                    <button 
                      className="rechazar-btn"
                      onClick={() => handleRegresarConComentarios(calendario.id)}
                      disabled={calendario.estado === 'con_correcciones'}
                      style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#fff' }}
                    >
                      <TrashIcon style={{marginRight:8}}/>Regresar con comentarios
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

            {/* Mostrar calendario (horarios) del calendario seleccionado agrupado por grupo */}
            {selectedCalendario.horarios && selectedCalendario.horarios.length > 0 && (
              <div className="detalle-calendario">
                <h4>Calendario - Grupos</h4>
                {Object.keys(groupedHorarios).map((grupo) => (
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
                            <th>DURACIÓN</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedHorarios[grupo].map((h, i) => (
                            <tr key={i}>
                              <td>{h.materia}</td>
                              <td>{h.profesor}</td>
                              <td>{h.fecha}</td>
                              <td>{h.hora}</td>
                              <td>{h.aula}</td>
                              <td>{h.tipo || ''}</td>
                              <td>{h.duracion || ''}</td>
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
                    handleAprobar(selectedCalendario.id);
                    setShowModal(false);
                  }}
                  style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#fff' }}
                >
                  <CheckIcon style={{marginRight:8}}/>Aprobar con V°B°
                </button>
                <button 
                  className="btn-rechazar"
                  onClick={() => {
                    handleRegresarConComentarios(selectedCalendario.id, observaciones);
                    setShowModal(false);
                  }}
                  style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#fff' }}
                >
                  <TrashIcon style={{marginRight:8}}/>Regresar con comentarios
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
    </Layout>
  );
};

export default ServiciosEscolares;