import React from 'react';
import Layout from '../components/Layout';
import './VerCalendarioServicios.css';

const VerCalendarioServicios = ({ user, onLogout }) => {
  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="ver-calendario-servicios-placeholder">
        <p>Ver Calendario (Servicios)</p>
        <p className="sub">Próximamente.</p>
      </div>
    </Layout>
  );
};

export default VerCalendarioServicios;
