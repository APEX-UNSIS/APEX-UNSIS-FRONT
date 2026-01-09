import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import Layout from '../components/Layout';
import './GestionSinodales.css';
import { GraduateIcon, TrashIcon } from '../icons';

const GestionSinodales = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [materias, setMaterias] = useState([
    {
      id: 1,
      nombre: "Tecnologias Web II",
      grupo: "706",
      sinodalAsignado: { id: 1, nombre: "Mtro. Irving Ulises Hernandez Miguel" },
      sinodalesDisponibles: [
        { id: 1, nombre: "Mtro. Irving Ulises Hernandez Miguel", disponible: true },
        { id: 2, nombre: "Dr. Juan Pérez", disponible: true },
        { id: 3, nombre: "Mtra. Ana García", disponible: true }
      ]
    },
    {
      id: 2,
      nombre: "Bases de Datos avanzadas",
      grupo: "706",
      sinodalAsignado: { id: 2, nombre: "Dr. Juan Pérez" },
      sinodalesDisponibles: [
        { id: 1, nombre: "Mtro. Irving Ulises Hernandez Miguel", disponible: false },
        { id: 2, nombre: "Dr. Juan Pérez", disponible: true },
        { id: 3, nombre: "Mtra. Ana García", disponible: true },
        { id: 4, nombre: "Dr. Carlos Rodríguez", disponible: true }
      ]
    },
    {
      id: 3,
      nombre: "Ingenieria de software II",
      grupo: "706",
      sinodalAsignado: null,
      sinodalesDisponibles: [
        { id: 1, nombre: "Mtro. Irving Ulises Hernandez Miguel", disponible: false },
        { id: 2, nombre: "Dr. Juan Pérez", disponible: false },
        { id: 3, nombre: "Mtra. Ana García", disponible: true },
        { id: 5, nombre: "Dr. Eric Melesio Castro Leal", disponible: true }
      ]
    },
    {
      id: 4,
      nombre: "Probabilidad y estadistica",
      grupo: "706",
      sinodalAsignado: { id: 6, nombre: "Dr. Alejandro Jarillo Silva" },
      sinodalesDisponibles: [
        { id: 6, nombre: "Dr. Alejandro Jarillo Silva", disponible: true },
        { id: 7, nombre: "Mtra. Laura Martínez", disponible: true }
      ]
    },
    {
      id: 5,
      nombre: "Derecho y Legislacion",
      grupo: "706",
      sinodalAsignado: { id: 8, nombre: "Dr. Gerardo Aragon Gonzales" },
      sinodalesDisponibles: [
        { id: 8, nombre: "Dr. Gerardo Aragon Gonzales", disponible: true },
        { id: 9, nombre: "Mtro. Luis Sánchez", disponible: true }
      ]
    }
  ]);

  const [sinodalesDisponibles, setSinodalesDisponibles] = useState([
    { id: 1, nombre: "Mtro. Irving Ulises Hernandez Miguel", materiasAsignadas: 1, disponible: false },
    { id: 2, nombre: "Dr. Juan Pérez", materiasAsignadas: 1, disponible: false },
    { id: 3, nombre: "Mtra. Ana García", materiasAsignadas: 0, disponible: true },
    { id: 4, nombre: "Dr. Carlos Rodríguez", materiasAsignadas: 0, disponible: true },
    { id: 5, nombre: "Dr. Eric Melesio Castro Leal", materiasAsignadas: 0, disponible: true },
    { id: 6, nombre: "Dr. Alejandro Jarillo Silva", materiasAsignadas: 1, disponible: false },
    { id: 7, nombre: "Mtra. Laura Martínez", materiasAsignadas: 0, disponible: true },
    { id: 8, nombre: "Dr. Gerardo Aragon Gonzales", materiasAsignadas: 1, disponible: false },
    { id: 9, nombre: "Mtro. Luis Sánchez", materiasAsignadas: 0, disponible: true }
  ]);

  const [showAgregarSinodal, setShowAgregarSinodal] = useState(false);
  const [nuevoSinodal, setNuevoSinodal] = useState({ nombre: '', email: '', telefono: '' });


  const handleAsignarSinodal = (materiaId, sinodalId) => {
    const sinodal = sinodalesDisponibles.find(s => s.id === sinodalId);
    if (!sinodal) return;

    setMaterias(materias.map(materia => {
      if (materia.id === materiaId) {
        // Quitar disponibilidad del sinodal anterior si existía
        if (materia.sinodalAsignado) {
          setSinodalesDisponibles(sinodalesDisponibles.map(s => 
            s.id === materia.sinodalAsignado.id 
              ? { ...s, materiasAsignadas: s.materiasAsignadas - 1, disponible: s.materiasAsignadas - 1 < 3 }
              : s
          ));
        }

        // Actualizar disponibilidad del nuevo sinodal
        setSinodalesDisponibles(sinodalesDisponibles.map(s => 
          s.id === sinodalId 
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

  const handleRemoverSinodal = (materiaId) => {
    setMaterias(materias.map(materia => {
      if (materia.id === materiaId && materia.sinodalAsignado) {
        // Restaurar disponibilidad del sinodal
        setSinodalesDisponibles(sinodalesDisponibles.map(s => 
          s.id === materia.sinodalAsignado.id 
            ? { ...s, materiasAsignadas: s.materiasAsignadas - 1, disponible: s.materiasAsignadas - 1 < 3 }
            : s
        ));

        return {
          ...materia,
          sinodalAsignado: null
        };
      }
      return materia;
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
      const materiasConSinodal = materias.filter(m => m.sinodalAsignado?.id === sinodalId);
      if (materiasConSinodal.length > 0) {
        alert('No se puede eliminar el sinodal porque está asignado a materias');
        return;
      }

      setSinodalesDisponibles(sinodalesDisponibles.filter(s => s.id !== sinodalId));
      
      // Actualizar las listas de sinodales disponibles en las materias
      setMaterias(materias.map(materia => ({
        ...materia,
        sinodalesDisponibles: materia.sinodalesDisponibles.filter(s => s.id !== sinodalId)
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
              <button 
                className="agregar-sinodal-btn"
                onClick={() => setShowAgregarSinodal(true)}
              >
                + Agregar Sinodal
              </button>
            </div>

            {/* Estadísticas */}
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
                  {materias.map((materia) => (
                    <tr key={materia.id}>
                      <td className="materia-cell">{materia.nombre}</td>
                      <td className="grupo-cell">{materia.grupo}</td>
                      <td className="sinodal-asignado-cell">
                        {materia.sinodalAsignado ? (
                          <div className="sinodal-info">
                            <span className="sinodal-nombre">{materia.sinodalAsignado.nombre}</span>
                            <button 
                              className="remover-btn"
                              onClick={() => handleRemoverSinodal(materia.id)}
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
                          value={materia.sinodalAsignado?.id || ''}
                          onChange={(e) => handleAsignarSinodal(materia.id, parseInt(e.target.value))}
                        >
                          <option value="">Seleccionar sinodal...</option>
                          {sinodalesDisponibles
                            .filter(s => s.disponible || s.id === materia.sinodalAsignado?.id)
                            .map((sinodal) => (
                              <option 
                                key={sinodal.id} 
                                value={sinodal.id}
                                disabled={!sinodal.disponible && sinodal.id !== materia.sinodalAsignado?.id}
                              >
                                {sinodal.nombre} 
                                {!sinodal.disponible && sinodal.id !== materia.sinodalAsignado?.id && ' (No disponible)'}
                                {sinodal.materiasAsignadas > 0 && ` (${sinodal.materiasAsignadas} materias)`}
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
                              handleAsignarSinodal(materia.id, sinodalDisponible.id);
                            }
                          }}
                          disabled={!sinodalesDisponibles.some(s => s.disponible)}
                        >
                          <GraduateIcon style={{marginRight:8}}/>Asignar Automático
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Lista de sinodales */}
            <div className="lista-sinodales">
              <h3 className="lista-title">Sinodales Disponibles</h3>
              <div className="sinodales-grid">
                {sinodalesDisponibles.map((sinodal) => (
                  <div key={sinodal.id} className="sinodal-card">
                    <div className="sinodal-header">
                      <h4>{sinodal.nombre}</h4>
                      <span className={`disponibilidad-badge ${sinodal.disponible ? 'disponible' : 'no-disponible'}`}>
                        {sinodal.disponible ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                    <div className="sinodal-info">
                      {sinodal.email && <p><strong>Email:</strong> {sinodal.email}</p>}
                      {sinodal.telefono && <p><strong>Teléfono:</strong> {sinodal.telefono}</p>}
                      <p><strong>Materias asignadas:</strong> {sinodal.materiasAsignadas}</p>
                      <p><strong>Límite:</strong> {sinodal.materiasAsignadas}/3 materias</p>
                    </div>
                    <div className="sinodal-actions">
                      <button 
                        className="eliminar-sinodal-btn"
                        onClick={() => handleEliminarSinodal(sinodal.id)}
                        disabled={sinodal.materiasAsignadas > 0}
                      >
                        <TrashIcon style={{marginRight:8}}/>Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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