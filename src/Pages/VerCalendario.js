import React, { useState } from 'react';
import { DownloadIcon } from '../icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import Layout from '../components/Layout';
import './VerCalendario.css';

const VerCalendario = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [calendarios, setCalendarios] = useState([
    {
      id: 1,
      carrera: 'Ingeniería en Sistemas',
      jefe: 'Mtro. Juan Pérez',
      fechaEnvio: '2025-01-15',
      estado: 'pendiente',
      horarios: [
        { grupo: '706', materia: 'Tecnologias Web II', profesor: 'Mtro. Irving Ulises Hernandez Miguel', fecha: '02/12/2025', hora: '8:00-9:00', aula: 'Lab. Tecnologias web' },
        { grupo: '706', materia: 'Bases de Datos avanzadas', profesor: 'Mtro. Eliezer alcazar Silva', fecha: '03/12/2025', hora: '17:00-18:00', aula: 'Lab. Ingenieria de software' },
      ]
    },
    {
      id: 2,
      carrera: 'Administración',
      jefe: 'Mtro. María García',
      fechaEnvio: '2025-01-10',
      estado: 'revisado',
      horarios: [
        { grupo: '502', materia: 'Contabilidad intermedia', profesor: 'Mtra. Ana Ruiz', fecha: '03/12/2025', hora: '10:00-11:00', aula: 'Aula 12' }
      ]
    },
  ]);
  const [selectedCalendar, setSelectedCalendar] = useState(calendarios[0]);


  const handleDownload = (cal) => {
    alert(`Calendario "${cal.carrera}" descargado exitosamente`);
  };


  const openCalendar = (cal) => {
    setSelectedCalendar(cal);
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
            
            <div className="calendarios-list">
              {calendarios.map((c) => (
                <div key={c.id} className={`calendario-card ${selectedCalendar && selectedCalendar.id === c.id ? 'selected' : ''}`} onClick={() => openCalendar(c)}>
                  <h3>{c.carrera}</h3>
                  <p><strong>Jefe:</strong> {c.jefe}</p>
                  <p><strong>Enviado:</strong> {c.fechaEnvio}</p>
                  <p><strong>Estado:</strong> {c.estado}</p>
                  <div style={{marginTop:8}}>
                    <button className="download-btn" onClick={(e) => { e.stopPropagation(); handleDownload(c); }}>
                      <DownloadIcon style={{marginRight:8}}/>Descargar
                    </button>
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