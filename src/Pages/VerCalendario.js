import React, { useState } from 'react';
import { DownloadIcon, EditIcon, SendIcon } from '../icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';
import Layout from '../components/Layout';
import './VerCalendario.css';

const VerCalendario = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);


  const handleDownload = () => {
    alert('Calendario descargado exitosamente');
  };

  const handleEnviarServiciosEscolares = () => {
    setShowConfirmModal(true);
  };

  const confirmEnvio = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowConfirmModal(false);
      alert('Calendario enviado exitosamente a Servicios Escolares');
    }, 1500);
  };

  const handleModificar = () => {
    navigate(ROUTES.MODIFICAR_CALENDARIO);
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
    <Layout user={user} onLogout={onLogout}>
      <div className="ver-calendario-container">
        <div className="content-area">
          <div className="calendario-section">
            <h2 className="calendario-title">Exámenes 2025</h2>
            
            <div className="table-info">
              <span>Total de materias: {horarios.length}</span>
              <div className="table-actions">
                  <button className="download-btn" onClick={handleDownload}>
                    <DownloadIcon style={{marginRight:8}}/>Descargar
                  </button>
              </div>
            </div>
            
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

            {/* Botones de acción debajo de la tabla */}
            <div className="table-actions-bottom">
              <button 
                className="enviar-btn"
                onClick={handleEnviarServiciosEscolares}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <SendIcon style={{marginRight:8}}/>Enviar a Servicios Escolares
                  </>
                )}
              </button>
                <button 
                  className="modificar-btn"
                  onClick={handleModificar}
                >
                  <EditIcon style={{marginRight:8}}/>Editar Calendario
                </button>
            </div>
          </div>
        </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Confirmar Envío</h3>
            <p className="modal-text">
              ¿Estás seguro de que deseas enviar este calendario a Servicios Escolares?
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button 
                className="modal-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="modal-confirm"
                onClick={confirmEnvio}
              >
                Confirmar Envío
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default VerCalendario;