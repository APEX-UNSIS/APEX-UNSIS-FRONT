import React, { useState, useEffect } from 'react';
import { DownloadIcon } from '../icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import Layout from '../components/Layout';
import calendarioService from '../core/services/calendarioService';
import './VerCalendario.css';

const VerCalendario = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [examenes, setExamenes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarCalendario();
  }, []);

  const cargarCalendario = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando calendario...');
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

  const handleDownload = () => {
    alert('Funcionalidad de descarga próximamente disponible');
  };

  // Agrupar exámenes por grupo
  const agruparPorGrupo = () => {
    const gruposMap = {};
    examenes.forEach(examen => {
      // Asegurar que grupos sea un array
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
  
  // Debug: mostrar datos en consola
  useEffect(() => {
    if (examenes.length > 0) {
      console.log('Exámenes cargados:', examenes);
      console.log('Grupos encontrados:', grupos);
    }
  }, [examenes, grupos]);

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="ver-calendario-container">
          <div className="content-area">
            <div className="calendario-section">
              <h2 className="calendario-title">Calendario de Exámenes</h2>
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
        <div className="ver-calendario-container">
          <div className="content-area">
            <div className="calendario-section">
              <h2 className="calendario-title">Calendario de Exámenes</h2>
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
        <div className="ver-calendario-container">
          <div className="content-area">
            <div className="calendario-section">
              <h2 className="calendario-title">Calendario de Exámenes</h2>
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
      <div className="ver-calendario-container">
        <div className="content-area">
          <div className="calendario-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="calendario-title">Calendario de Exámenes</h2>
              <button className="download-btn" onClick={handleDownload}>
                <DownloadIcon style={{marginRight:8}}/>Descargar
              </button>
            </div>
            
            <div className="groups-grid">
              {grupos.map((grupo) => (
                <div key={grupo} className="group-card">
                  <h3>Grupo {grupo}</h3>
                  <div className="table-container">
                    <table className="calendario-table">
                      <thead>
                        <tr>
                          <th>MATERIA</th>
                          <th>MAESTRO TITULAR</th>
                          <th>FECHA</th>
                          <th>HORA</th>
                          <th>AULA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gruposExamenes[grupo].map((examen, i) => (
                          <tr key={i}>
                            <td className="materia-cell">{examen.materia || 'N/A'}</td>
                            <td className="profesor-cell">{examen.profesor || 'N/A'}</td>
                            <td className="fecha-cell">{examen.fecha || 'N/A'}</td>
                            <td className="hora-cell">{examen.hora || 'N/A'}</td>
                            <td className="aula-cell">{examen.aula || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerCalendario;