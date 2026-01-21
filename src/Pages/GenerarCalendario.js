import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import Layout from '../components/Layout';
import './GenerarCalendario.css';
import calendarioService from '../core/services/calendarioService';
import evaluacionService from '../core/services/evaluacionService';
import { useAuth } from '../core/auth/hooks/useAuth';

const GenerarCalendario = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [calendarioExiste, setCalendarioExiste] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [diasInhabiles, setDiasInhabiles] = useState([]);
  const [nuevoDiaInhabil, setNuevoDiaInhabil] = useState('');
  const [semestreInfo, setSemestreInfo] = useState(null);
  
  const [formData, setFormData] = useState({
    fechaInicio: '',
    idEvaluacion: ''
  });

  // Cargar tipos de evaluación y verificar calendario existente
  useEffect(() => {
    loadEvaluaciones();
    verificarCalendarioExistente();
  }, []);

  const loadEvaluaciones = async () => {
    try {
      const data = await evaluacionService.getAll();
      setEvaluaciones(data);
    } catch (err) {
      console.error('Error cargando evaluaciones:', err);
      setError('Error al cargar los tipos de evaluación');
    }
  };

  const verificarCalendarioExistente = async () => {
    try {
      setVerificando(true);
      const resultado = await calendarioService.verificar();
      setCalendarioExiste(resultado.existe);
    } catch (err) {
      console.error('Error verificando calendario:', err);
      setCalendarioExiste(false);
    } finally {
      setVerificando(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Calcular semestre cuando cambie la fecha
    if (name === 'fechaInicio' && value) {
      calcularSemestre(value);
    }
  };

  const calcularSemestre = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const año = fecha.getFullYear();
    const mes = fecha.getMonth() + 1; // getMonth() es 0-11

    let semestre = '';
    let periodoTexto = '';

    if (mes >= 10 || mes <= 2) {
      // Octubre a Febrero: Semestre A
      if (mes <= 2) {
        semestre = `${año - 1}-${año}A`;
        periodoTexto = `Octubre ${año - 1} - Febrero ${año}`;
      } else {
        semestre = `${año}-${año + 1}A`;
        periodoTexto = `Octubre ${año} - Febrero ${año + 1}`;
      }
    } else if (mes >= 3 && mes <= 7) {
      // Marzo a Julio: Semestre B
      semestre = `${año}B`;
      periodoTexto = `Marzo ${año} - Julio ${año}`;
    } else {
      // Agosto-Septiembre (opcional)
      semestre = `${año}C`;
      periodoTexto = `Agosto ${año} - Septiembre ${año}`;
    }

    setSemestreInfo({
      semestre: semestre,
      periodo: periodoTexto
    });
  };

  const handleAgregarDiaInhabil = () => {
    if (nuevoDiaInhabil && !diasInhabiles.includes(nuevoDiaInhabil)) {
      setDiasInhabiles([...diasInhabiles, nuevoDiaInhabil]);
      setNuevoDiaInhabil('');
    }
  };

  const handleEliminarDiaInhabil = (dia) => {
    setDiasInhabiles(diasInhabiles.filter(d => d !== dia));
  };

  const handleGenerar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.fechaInicio) {
        setError('La fecha de inicio es obligatoria');
        setLoading(false);
        return;
      }

      if (!formData.idEvaluacion) {
        setError('El tipo de evaluación es obligatorio');
        setLoading(false);
        return;
      }

      // Convertir días inhábiles al formato correcto
      const diasInhabilesFormato = diasInhabiles.map(dia => dia); // Ya están en formato YYYY-MM-DD

      const resultado = await calendarioService.generar(
        formData.fechaInicio,
        formData.idEvaluacion,
        diasInhabilesFormato
      );

      if (resultado.solicitudes_creadas > 0) {
        // Mostrar advertencias si las hay
        if (resultado.advertencias && resultado.advertencias.length > 0) {
          setError(`Advertencias: ${resultado.advertencias.join(', ')}`);
        }
        
        // Mostrar conflictos si los hay (pero aún así se crearon solicitudes)
        if (resultado.conflictos && resultado.conflictos.length > 0) {
          const mensaje = `Calendario generado con algunos conflictos: ${resultado.conflictos.join(', ')}. ${resultado.solicitudes_creadas} exámenes programados.`;
          setError(mensaje);
        } else {
          setSuccess(`Calendario generado exitosamente. ${resultado.solicitudes_creadas} exámenes programados.`);
        }
        
        // Limpiar formulario
        setFormData({
          fechaInicio: '',
          idEvaluacion: ''
        });
        setDiasInhabiles([]);
        setSemestreInfo(null);
        
        // Actualizar verificación
        await verificarCalendarioExistente();
        
        // Redirigir después de un momento (siempre que se hayan creado solicitudes)
        setTimeout(() => {
          navigate(ROUTES.VER_CALENDARIO);
        }, 2000);
      } else {
        // No se crearon solicitudes - mostrar conflictos y advertencias
        let mensajeError = 'No se pudieron generar exámenes.';
        
        if (resultado.advertencias && resultado.advertencias.length > 0) {
          mensajeError += ` ${resultado.advertencias.join('. ')}.`;
        }
        
        if (resultado.conflictos && resultado.conflictos.length > 0) {
          mensajeError += ` Conflictos: ${resultado.conflictos.join(', ')}.`;
        } else if (!resultado.advertencias || resultado.advertencias.length === 0) {
          // Solo mostrar este mensaje si no hay advertencias ni conflictos
          mensajeError += ' No se encontraron horarios o recursos disponibles para generar los exámenes.';
        }
        
        setError(mensajeError);
      }
    } catch (err) {
      console.error('Error generando calendario:', err);
      const errorMessage = err.response?.data?.detail || 'Error al generar el calendario. Por favor, intenta de nuevo.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar mensaje si no hay carrera asignada
  if (currentUser && currentUser.rol === 'jefe' && !currentUser.id_carrera) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="generar-calendario-container">
          <div className="content-area">
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              background: '#FEE2E2',
              color: '#991B1B',
              borderRadius: '8px'
            }}>
              <h3>No tienes una carrera asignada</h3>
              <p>Contacta al administrador para asignarte una carrera.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Verificar si existe calendario
  if (verificando) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="generar-calendario-container">
          <div className="content-area">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Verificando calendario existente...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="generar-calendario-container">
        <div className="content-area">
          <div className="form-section">
            <h2 className="form-title">Generar Nuevo Calendario de Exámenes</h2>
            
            {calendarioExiste && (
              <div style={{ 
                background: '#FEF3C7', 
                color: '#92400E', 
                padding: '15px', 
                borderRadius: '6px', 
                marginBottom: '20px' 
              }}>
                ⚠️ Ya existe un calendario generado para tu carrera. Si generas uno nuevo, 
                puedes elegir si deseas eliminar el existente.
              </div>
            )}

            {error && (
              <div style={{ 
                background: '#FEE2E2', 
                color: '#991B1B', 
                padding: '15px', 
                borderRadius: '6px', 
                marginBottom: '20px' 
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ 
                background: '#D1FAE5', 
                color: '#065F46', 
                padding: '15px', 
                borderRadius: '6px', 
                marginBottom: '20px' 
              }}>
                {success}
              </div>
            )}

            <form className="calendario-form" onSubmit={handleGenerar}>
              <div className="form-group">
                <label htmlFor="fechaInicio" className="form-label">
                  Fecha de inicio *
                </label>
                <input
                  type="date"
                  id="fechaInicio"
                  name="fechaInicio"
                  className="form-input"
                  value={formData.fechaInicio}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {semestreInfo && (
                <div style={{ 
                  background: '#EFF6FF', 
                  padding: '15px', 
                  borderRadius: '6px', 
                  marginBottom: '20px',
                  border: '1px solid #BFDBFE'
                }}>
                  <strong>Semestre determinado automáticamente:</strong>
                  <p style={{ margin: '5px 0 0 0' }}>
                    <strong>{semestreInfo.semestre}</strong> - {semestreInfo.periodo}
                  </p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="idEvaluacion" className="form-label">
                  Tipo de Evaluación *
                </label>
                <select
                  id="idEvaluacion"
                  name="idEvaluacion"
                  className="form-input"
                  value={formData.idEvaluacion}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona el tipo de evaluación</option>
                  {evaluaciones.map((evaluacion) => (
                    <option key={evaluacion.id_evaluacion} value={evaluacion.id_evaluacion}>
                      {evaluacion.nombre_evaluacion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Días inhábiles (opcional)
                </label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="date"
                    className="form-input"
                    value={nuevoDiaInhabil}
                    onChange={(e) => setNuevoDiaInhabil(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAgregarDiaInhabil}
                    style={{
                      padding: '8px 16px',
                      background: '#3B82F6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Agregar
                  </button>
                </div>
                {diasInhabiles.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '5px' }}>
                      Días inhábiles seleccionados:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {diasInhabiles.map((dia, index) => (
                        <span
                          key={index}
                          style={{
                            background: '#F3F4F6',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          {new Date(dia + 'T00:00:00').toLocaleDateString('es-ES', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                          <button
                            type="button"
                            onClick={() => handleEliminarDiaInhabil(dia)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              fontSize: '16px',
                              padding: '0',
                              lineHeight: '1'
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <small style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '5px', display: 'block' }}>
                  Los exámenes no se aplicarán en estos días y se recorrerán al siguiente día hábil (solo se consideran días hábiles de lunes a viernes).
                </small>
              </div>

              <div style={{ 
                background: '#F9FAFB', 
                padding: '15px', 
                borderRadius: '6px', 
                marginBottom: '20px',
                border: '1px solid #E5E7EB'
              }}>
                <strong>Información importante:</strong>
                <ul style={{ margin: '10px 0 0 20px', fontSize: '0.875rem', color: '#6B7280' }}>
                  <li>Se generará un calendario con 5 días hábiles de exámenes (un examen por día, solo lunes a viernes)</li>
                  <li>Los sábados y domingos no se cuentan, solo días hábiles</li>
                  <li>Los exámenes se distribuirán automáticamente en la ventana de aplicación del periodo</li>
                  <li>El sistema evitará conflictos de aulas y sinodales</li>
                  <li>Solo se generarán exámenes para materias de tu carrera</li>
                </ul>
              </div>

              <button 
                type="submit" 
                className="generar-btn"
                disabled={loading}
                style={{ 
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Generando...' : 'Generar Calendario'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GenerarCalendario;