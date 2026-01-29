import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import materiaService from '../core/services/materiaService';
import horarioService from '../core/services/horarioService';
import periodoService from '../core/services/periodoService';
import grupoService from '../core/services/grupoService';
import { EditIcon, TrashIcon } from '../icons';
import './GestionMaterias.css';

const GestionMaterias = ({ user, onLogout }) => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [materiaEditando, setMateriaEditando] = useState(null);
  const [formData, setFormData] = useState({
    es_academia: false,
    tipo_examen: 'plataforma'
  });

  useEffect(() => {
    if (!user || !user.id_carrera) {
      setError('No tienes una carrera asignada. Solo los jefes de carrera pueden gestionar materias.');
      setLoading(false);
      return;
    }
    
    loadPeriodos();
    loadGrupos();
    loadMaterias();
  }, [user, filtroPeriodo, filtroGrupo]);

  const loadPeriodos = async () => {
    try {
      const data = await periodoService.getAll();
      setPeriodos(data || []);
    } catch (err) {
      console.error('Error cargando periodos:', err);
    }
  };

  const loadGrupos = async () => {
    try {
      if (!user?.id_carrera) return;
      const data = await grupoService.getByCarrera(user.id_carrera);
      setGrupos(data || []);
    } catch (err) {
      console.error('Error cargando grupos:', err);
    }
  };

  const loadMaterias = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id_carrera) return;

      const filters = {};
      if (filtroPeriodo) filters.id_periodo = filtroPeriodo;
      if (filtroGrupo) filters.id_grupo = filtroGrupo;

      const data = await materiaService.getByCarrera(user.id_carrera, filters);
      setMaterias(data || []);
    } catch (err) {
      console.error('Error cargando materias:', err);
      setError(`Error al cargar materias: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (materia) => {
    setMateriaEditando(materia);
    setFormData({
      es_academia: materia.es_academia || false,
      tipo_examen: materia.tipo_examen || 'plataforma'
    });
    setShowModal(true);
  };

  const handleGuardar = async () => {
    try {
      if (!materiaEditando) return;

      await materiaService.update(materiaEditando.id_materia, formData);
      await loadMaterias();
      setShowModal(false);
      setMateriaEditando(null);
      setFormData({ es_academia: false, tipo_examen: 'plataforma' });
    } catch (err) {
      console.error('Error guardando materia:', err);
      setError(`Error al guardar: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleCancelar = () => {
    setShowModal(false);
    setMateriaEditando(null);
      setFormData({ es_academia: false, tipo_examen: 'plataforma' });
  };

  const contenido = (
    <div className="gestion-materias-container">
        <div className="content-area">
          <h2 className="page-title">Gestión de Materias</h2>

          {/* Filtros */}
          <div className="filtros-container">
            <div className="filtro-item">
              <label>Filtrar por Semestre:</label>
              <select 
                value={filtroPeriodo} 
                onChange={(e) => setFiltroPeriodo(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #D1D5DB' }}
              >
                <option value="">Todos los semestres</option>
                {periodos.map(periodo => (
                  <option key={periodo.id_periodo} value={periodo.id_periodo}>
                    {periodo.nombre_periodo || periodo.id_periodo}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-item">
              <label>Filtrar por Grupo:</label>
              <select 
                value={filtroGrupo} 
                onChange={(e) => setFiltroGrupo(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #D1D5DB' }}
              >
                <option value="">Todos los grupos</option>
                {grupos.map(grupo => (
                  <option key={grupo.id_grupo} value={grupo.id_grupo}>
                    {grupo.nombre_grupo || grupo.id_grupo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabla de materias */}
          <div className="table-container">
            <table className="materias-table">
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>Es Academia</th>
                  <th>Tipo de Examen</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materias.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                      No hay materias disponibles
                    </td>
                  </tr>
                ) : (
                  materias.map((materia) => (
                    <tr key={materia.id_materia}>
                      <td className="materia-cell">{materia.nombre_materia || materia.id_materia}</td>
                      <td className="academia-cell">
                        {materia.es_academia ? 'Sí' : 'No'}
                      </td>
                      <td className="tipo-examen-cell">
                        {materia.tipo_examen === 'plataforma' ? 'Plataforma' : 'Escrito'}
                      </td>
                      <td className="acciones-cell">
                        <button
                          className="editar-btn"
                          onClick={() => handleEditar(materia)}
                          title="Editar materia"
                        >
                          <EditIcon style={{ fontSize: '16px' }} />
                          <span>Editar</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Modal de edición */}
          {showModal && materiaEditando && (
            <div className="modal-overlay" onClick={handleCancelar}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Editar Materia</h3>
                  <button className="close-btn" onClick={handleCancelar}>×</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Materia:</label>
                    <input
                      type="text"
                      value={materiaEditando.nombre_materia || materiaEditando.id_materia}
                      disabled
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: '#F3F4F6' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.es_academia}
                        onChange={(e) => setFormData({ ...formData, es_academia: e.target.checked })}
                        style={{ marginRight: '8px' }}
                      />
                      Es Academia
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Tipo de Examen:</label>
                    <select
                      value={formData.tipo_examen}
                      onChange={(e) => setFormData({ ...formData, tipo_examen: e.target.value })}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #D1D5DB', width: '100%' }}
                    >
                      <option value="escrito">Examen Escrito</option>
                      <option value="plataforma">Examen en Plataforma</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="cancel-btn" onClick={handleCancelar}>
                    Cancelar
                  </button>
                  <button className="save-btn" onClick={handleGuardar}>
                    Guardar
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
    if (loading && materias.length === 0) {
      return <div className="gestion-materias-container"><p>Cargando materias...</p></div>;
    }
    if (error && materias.length === 0) {
      return (
        <div className="gestion-materias-container">
          <div style={{ color: '#6B7280', marginTop: '20px' }}>{error}</div>
          <button onClick={loadMaterias} style={{ marginTop: '10px', padding: '10px 20px' }}>
            Reintentar
          </button>
        </div>
      );
    }
    return contenido;
  }

  // Renderizar con Layout si no está dentro de Gestion
  if (loading && materias.length === 0) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="gestion-materias-container">
          <div className="content-area">
            <p>Cargando materias...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && materias.length === 0) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="gestion-materias-container">
          <div className="content-area">
            <div style={{ color: '#6B7280', marginTop: '20px' }}>{error}</div>
            <button onClick={loadMaterias} style={{ marginTop: '10px', padding: '10px 20px' }}>
              Reintentar
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      {contenido}
    </Layout>
  );
};

export default GestionMaterias;
