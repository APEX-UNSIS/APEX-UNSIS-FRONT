import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './Dashboard/Dashboard';
import GenerarCalendario from './Pages/GenerarCalendario';
import VerCalendario from './Pages/VerCalendario';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generar-calendario" element={<GenerarCalendario />} />
          <Route path="/ver-calendario" element={<VerCalendario />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;