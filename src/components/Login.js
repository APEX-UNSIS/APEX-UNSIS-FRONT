import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import unsisImage from '../assets/images/UNSI.png';
import apexImage from '../assets/images/logo.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (username && password) {
      navigate('/dashboard');
    } else {
      alert('Por favor ingresa usuario y contraseña');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-content">
          {/* Columna izquierda - Formulario */}
          <div className="left-column">
            <div className="login-header">
              <img src={unsisImage} alt="UNSIS" className="unsis-image" />
              <h2 className="institution-name">APEX-UNSIS</h2>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
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
                  placeholder="Ingresa tu nombre de usuario"
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
                  placeholder="Ingresa tu contraseña"
                  required
                />
              </div>

              <div className="form-links">
                <a href="#forgot" className="forgot-password">
                  ¿Olvidaste la contraseña?
                </a>
                <a href="#register" className="register-link">
                  Registrarse
                </a>
              </div>

              <button type="submit" className="login-button">
                Iniciar Sesión
              </button>
            </form>
          </div>

          {/* Columna derecha - Imagen APEX */}
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