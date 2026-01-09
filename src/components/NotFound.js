import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Página no encontrada</h2>
        <p className="not-found-message">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <button 
          className="not-found-button" 
          onClick={() => navigate(ROUTES.HOME)}
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default NotFound;
