import React, { useState } from 'react';
import { EyeIcon, EditIcon, SaveIcon, TrashIcon, LogoutIcon } from '../icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import Layout from '../components/Layout';
import './ModificarCalendario.css';

const ModificarCalendario = ({ user, onLogout }) => {
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

  // editando: null | { group: string, id: number }
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [accionConfirmar, setAccionConfirmar] = useState('');

  // Estado local para filas de cada grupo (demo). Cada grupo tiene su propio arreglo de horarios.
  const grupos = ['106','306','506','706','906'];
  const sampleRows = [
    { id: 1, materia: 'Tecnologias Web II', profesor: 'Mtro. Irving Ulises Hernandez Miguel', fecha: '02/12/2025', hora: '8:00-9:00', aula: 'Lab. Tecnologias web' },
    { id: 2, materia: 'Bases de Datos avanzadas', profesor: 'Mtro. Eliezer alcazar Silva', fecha: '03/12/2025', hora: '17:00-18:00', aula: 'Lab. Ingenieria de software' },
    { id: 3, materia: 'Ingenieria de software II', profesor: 'DR. Eric Melesio Castro Leal', fecha: '04/12/2025', hora: '11:00-12:00', aula: 'Lab. Ingenieria de software' }
  ];

  const [groupRows, setGroupRows] = useState(() => {
    const obj = {};
    grupos.forEach((g) => {
      // clone sampleRows with ids offset per group to avoid collisions
      obj[g] = sampleRows.map((r, i) => ({ ...r, id: i + 1 }));
    });
    return obj;
  });


  const handleEditarHorario = (horario, group) => {
    setEditando({ group, id: horario.id });
    setFormData({ ...horario });
  };

  const handleCancelarEdicion = () => {
    setEditando(null);
    setFormData({});
  };

  const handleGuardarCambios = () => {
    if (!editando) return;
    const { group, id } = editando;
    if (group === calendario.grupo) {
      setCalendario({
        ...calendario,
        horarios: calendario.horarios.map(h => 
          h.id === id ? { ...h, ...formData } : h
        )
      });
    } else {
      setGroupRows(prev => ({
        ...prev,
        [group]: prev[group].map(r => r.id === id ? { ...r, ...formData } : r)
      }));
    }
    setEditando(null);
    setFormData({});
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
      alert('Calendario guardado como borrador');
    } else if (accionConfirmar === 'cambios') {
      setCalendario({ ...calendario, estado: 'pendiente' });
      alert('Cambios guardados exitosamente');
    }
    setShowConfirm(false);
    setAccionConfirmar('');
  };

  const handleSalir = () => {
    navigate(ROUTES.VER_CALENDARIO);
  };

  const handleEliminarHorario = (id, group) => {
    if (!window.confirm('¿Estás seguro de eliminar este horario?')) return;
    if (group === calendario.grupo) {
      setCalendario({
        ...calendario,
        horarios: calendario.horarios.filter(h => h.id !== id)
      });
    } else {
      setGroupRows(prev => ({
        ...prev,
        [group]: prev[group].filter(r => r.id !== id)
      }));
    }
    // if we were editing that row, cancel edit
    if (editando && editando.group === group && editando.id === id) {
      setEditando(null);
      setFormData({});
    }
  };

  const handleAgregarHorario = (group = calendario.grupo) => {
    if (group === calendario.grupo) {
      const nuevoId = calendario.horarios.length ? Math.max(...calendario.horarios.map(h => h.id)) + 1 : 1;
      const nuevoHorario = { id: nuevoId, materia: '', profesor: '', fecha: '', hora: '', aula: '', sinodal: '' };
      setCalendario(prev => ({ ...prev, horarios: [...prev.horarios, nuevoHorario] }));
      handleEditarHorario(nuevoHorario, group);
    } else {
      setGroupRows(prev => {
        const nextId = prev[group].length ? Math.max(...prev[group].map(r => r.id)) + 1 : 1;
        const nuevo = { id: nextId, materia: '', profesor: '', fecha: '', hora: '', aula: '' };
        return { ...prev, [group]: [...prev[group], nuevo] };
      });
      // open edit on the newly added row -- best-effort after state update
      setTimeout(() => {
        const current = groupRows[group] || [];
        const id = current.length ? Math.max(...current.map(r => r.id)) + 1 : 1;
        setEditando({ group, id });
        setFormData({ materia: '', profesor: '', fecha: '', hora: '', aula: '' });
      }, 0);
    }
  };

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

            {/* Mostrar cuadrícula de grupos similar a VerCalendarioServicios.
                El grupo del calendario (calendario.grupo) es editable (usa el mismo flujo de edición existente).
            */}
            <div className="groups-grid">
              {['106','306','506','706','906'].map((g) => (
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
                        {(() => {
                          const rows = g === calendario.grupo ? calendario.horarios : (groupRows[g] || []);
                          return rows.map((horario) => (
                            <tr key={horario.id}>
                              {editando && editando.group === g && editando.id === horario.id ? (
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
                                  <td className="materia-cell">{horario.materia}</td>
                                  <td className="profesor-cell">{horario.profesor}</td>
                                  <td className="fecha-cell">{horario.fecha}</td>
                                  <td className="hora-cell">{horario.hora}</td>
                                  <td className="aula-cell">{horario.aula}</td>
                                  <td>
                                    <div className="acciones-buttons">
                                      <button 
                                        className="editar-horario-btn"
                                        onClick={() => handleEditarHorario(horario, g)}
                                      >
                                        <EditIcon style={{marginRight:8}}/>Editar
                                      </button>
                                      <button 
                                        className="eliminar-horario-btn"
                                        onClick={() => handleEliminarHorario(horario.id, g)}
                                      >
                                        <TrashIcon style={{marginRight:8}}/>Eliminar
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          ));
                        })()}
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