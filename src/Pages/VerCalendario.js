import React from 'react';
import { useNavigate } from 'react-router-dom';
import './VerCalendario.css';
import unsisImage from '../assets/images/UNSI.png';

const VerCalendario = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  
  const horarios = [
    {
      grupo: "706",
      materia: "Tecnologias Web II",
      profesor: "Mtro. Irving Ulises Hernandez Miguel",
      fecha: "02/12/2025",
      hora: "8:00-9:00",
      aula: "Lab. Tecnologias web"
    },
    {
      grupo: "706",
      materia: "Bases de Datos avanzadas",
      profesor: "Mtro. Eliezer alcazar Silva",
      fecha: "03/12/2025",
      hora: "17:00-18:00",
      aula: "Lab. Ingenieria de software"
    },
    {
      grupo: "706",
      materia: "Ingenieria de software II",
      profesor: "DR. Eric Melesio Castro Leal",
      fecha: "04/12/2025",
      hora: "11:00-12:00",
      aula: "Lab. Ingenieria de software"
    },
    {
      grupo: "706",
      materia: "Probabilidad y estadistica",
      profesor: "Dr. Alejandro jarillo Silva",
      fecha: "05/12/2025",
      hora: "8:00-9:00",
      aula: "Redes"
    },
    {
      grupo: "706",
      materia: "Derecho y Legislacion",
      profesor: "Dr. Gerardo Aragon Gonzales",
      fecha: "01/21/2025",
      hora: "8:00-9:00",
      aula: "Redes"
    },
  
  ];

  return (
    <div className="ver-calendario-container">
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
            <li className="nav-item">
              <a href="#generar-calendario" className="nav-link" onClick={() => navigate('/generar-calendario')}>
                Generar Calendario
              </a>
            </li>
            <li className="nav-item active">
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
          <div className="calendario-section">
            <h2 className="calendario-title">Exámenes 2025</h2>
            
            <div className="table-container">
              <table className="calendario-table">
                <thead>
                  <tr>
                    <th>GRUPO</th>
                    <th>MATERIA</th>
                    <th>MAESTRO TITULAR</th>
                    <th>FECHA</th>
                    <th>HORA</th>
                    <th>AULA</th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.map((horario, index) => (
                    <tr key={index}>
                      <td className="grupo-cell">{horario.grupo}</td>
                      <td className="materia-cell">{horario.materia}</td>
                      <td className="profesor-cell">{horario.profesor}</td>
                      <td className="fecha-cell">{horario.fecha}</td>
                      <td className="hora-cell">{horario.hora}</td>
                      <td className="aula-cell">{horario.aula}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerCalendario;