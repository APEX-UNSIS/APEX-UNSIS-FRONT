import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import unsisImage from '../assets/images/UNSI.png';
import apexImage from '../assets/images/logo.png';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (username && password) {
      if (onLogin(username, password)) {
        navigate('/dashboard');
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } else {
      setError('Por favor ingresa usuario y contraseña');
    }
  };

 

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-content">
          <div className="left-column">
            <div className="login-header">
              <img src={unsisImage} alt="UNSIS" className="unsis-image" />
              <h2 className="institution-name">APEX-UNSIS</h2>
              <p className="login-subtitle">Sistema de Gestión de Calendarios</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  id="username"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: admin, jefe, servicios"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña: 123456"
                  required
                />
              </div>

              <div className="form-links">
                <a href="#forgot" className="forgot-password">
                  ¿Olvidaste la contraseña?
                </a>
              </div>

              <button type="submit" className="login-button">
                Iniciar Sesión
              </button>
              
             
            </form>
          </div>

          <div className="right-column">
            <div className="apex-container">
              <img src={apexImage} alt="APEX" className="apex-image" />
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;