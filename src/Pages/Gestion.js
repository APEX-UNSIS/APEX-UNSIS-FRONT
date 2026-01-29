import React, { useState } from 'react';
import Layout from '../components/Layout';
import GestionSinodales from './GestionSinodales';
import GestionMaterias from './GestionMaterias';
import './Gestion.css';

const Gestion = ({ user, onLogout }) => {
  const [tabActiva, setTabActiva] = useState('sinodales'); // 'sinodales' o 'materias'

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="gestion-container">
        <div className="content-area">
          <h2 className="page-title">Gestión</h2>
          
          {/* Pestañas */}
          <div className="tabs-container">
            <button
              className={`tab-button ${tabActiva === 'sinodales' ? 'active' : ''}`}
              onClick={() => setTabActiva('sinodales')}
            >
              Gestión de Sinodales
            </button>
            <button
              className={`tab-button ${tabActiva === 'materias' ? 'active' : ''}`}
              onClick={() => setTabActiva('materias')}
            >
              Gestión de Materias
            </button>
          </div>

          {/* Contenido de las pestañas */}
          <div className="tab-content">
            {tabActiva === 'sinodales' && (
              <GestionSinodales user={{...user, sinLayout: true}} onLogout={onLogout} />
            )}
            {tabActiva === 'materias' && (
              <GestionMaterias user={{...user, sinLayout: true}} onLogout={onLogout} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Gestion;
