import React, { useState } from 'react';
import Layout from '../components/Layout';
import './VerCalendario.css';

// Nota: Para que los PDFs estén disponibles en la app, copia los archivos PDF
// en la carpeta `public/pdfs/` y usa rutas como `/pdfs/tu-archivo.pdf`.

const VerCalendarioServicios = ({ user, onLogout }) => {
  // Groups to display (sample groups as requested)
  const grupos = ['106', '306', '506', '706', '906'];

  // Sample rows to display inside each group's table (same data for demo)
  const sampleRows = [
    { grupo: '', materia: 'Tecnologias Web II', profesor: 'Mtro. Irving Ulises Hernandez Miguel', fecha: '02/12/2025', hora: '8:00-9:00', aula: 'Lab. Tecnologias web' },
    { grupo: '', materia: 'Bases de Datos avanzadas', profesor: 'Mtro. Eliezer alcazar Silva', fecha: '03/12/2025', hora: '17:00-18:00', aula: 'Lab. Ingenieria de software' },
    { grupo: '', materia: 'Ingenieria de software II', profesor: 'DR. Eric Melesio Castro Leal', fecha: '04/12/2025', hora: '11:00-12:00', aula: 'Lab. Ingenieria de software' }
  ];

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="ver-calendario-container">
        <div className="content-area">
          <div className="calendario-section">
            <h2 className="calendario-title">Calendario Examenes</h2>


            <div className="groups-grid">
              {grupos.map((g) => (
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
                        </tr>
                      </thead>
                      <tbody>
                        {sampleRows.map((r, i) => (
                          <tr key={i}>
                            <td className="materia-cell">{r.materia}</td>
                            <td className="profesor-cell">{r.profesor}</td>
                            <td className="fecha-cell">{r.fecha}</td>
                            <td className="hora-cell">{r.hora}</td>
                            <td className="aula-cell">{r.aula}</td>
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

export default VerCalendarioServicios;
