import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GenerarCalendario.css';
import unsisImage from '../assets/images/UNSI.png';

const GenerarCalendario = () => {
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
  navigate('/ver-calendario');
};

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="generar-calendario-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={unsisImage} alt="UNSIS" className="sidebar-unsis-image" />
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            <li className="nav-item">
              <a href="#inicio" className="nav-link" onClick={handleBackToDashboard}>
                Inicio
              </a>
            </li>
            <li className="nav-item active">
              <a href="#generar-calendario" className="nav-link">
                Generar Calendario
              </a>
            </li>
            <li className="nav-item">
              <a href="#ver-calendario" className="nav-link">
                Ver Calendario
              </a>
            </li>
            <li className="nav-item">
              <a href="#modificar-calendario" className="nav-link">
                Modificar Calendario
              </a>
            </li>
            <li className="nav-item">
              <a href="#configuracion" className="nav-link">
                Configuración
              </a>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => navigate('/')}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="main-content">
        <header className="content-header">
          <h1 className="content-title">APEX-UNSIS</h1>
        </header>

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
    </div>
  );
};

export default GenerarCalendario;