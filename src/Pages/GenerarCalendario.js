import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import Layout from '../components/Layout';
import './GenerarCalendario.css';

const GenerarCalendario = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fechaInicio: '',
    carrera: '',
    tipo: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

 const handleGenerar = (e) => {
  e.preventDefault();
  console.log('Datos del formulario:', formData);
  alert('Calendario generado exitosamente');
  // Redirigir a Ver Calendario después de generar
  navigate(ROUTES.VER_CALENDARIO);
};

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="generar-calendario-container">
        <div className="content-area">
          <div className="form-section">
            <h2 className="form-title">Generar Nuevo Calendario</h2>
            
            <form className="calendario-form" onSubmit={handleGenerar}>
              <div className="form-group">
                <label htmlFor="fechaInicio" className="form-label">
                  Fecha inicio
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


              {user?.rol !== 'jefe' && (
                <div className="form-group">
                  <label htmlFor="carrera" className="form-label">
                    Carrera
                  </label>
                  <select
                    id="carrera"
                    name="carrera"
                    className="form-input"
                    value={formData.carrera}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona una carrera</option>
                    <option value="informatica">Informática</option>
                    <option value="administracion">Administración Publica</option>
                    <option value="ciencias empresariales">Ciencias Empresariales</option>
                    <option value="medicina">Medicina</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="tipo" className="form-label">
                  Tipo
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  className="form-input"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona el tipo</option>
                  <option value="parcial">Parcial</option>
                  <option value="ordinario">Ordinario</option>
                  <option value="extraordinario">Extraordinario</option>
                </select>
              </div>

              <button type="submit" className="generar-btn">
                Generar
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GenerarCalendario;