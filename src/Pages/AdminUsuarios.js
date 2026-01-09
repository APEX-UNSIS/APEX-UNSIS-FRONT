import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import Layout from '../components/Layout';
import './AdminUsuarios.css';
import { CrownIcon, GraduateIcon, ClipboardIcon, EditIcon, TrashIcon } from '../icons';

const AdminUsuarios = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: 'Juan Pérez', email: 'juan@unsis.edu.mx', rol: 'jefe', carrera: 'Sistemas', activo: true },
    { id: 2, nombre: 'María García', email: 'maria@unsis.edu.mx', rol: 'servicios', area: 'Servicios Escolares', activo: true },
    { id: 3, nombre: 'Carlos López', email: 'carlos@unsis.edu.mx', rol: 'jefe', carrera: 'Administración', activo: false },
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'jefe',
    carrera: '',
    area: ''
  });


  const handleAgregarUsuario = () => {
    setEditando(null);
    setFormData({
      nombre: '',
      email: '',
      rol: 'jefe',
      carrera: '',
      area: ''
    });
    setShowModal(true);
  };

  const handleEditarUsuario = (usuario) => {
    setEditando(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      carrera: usuario.carrera || '',
      area: usuario.area || ''
    });
    setShowModal(true);
  };

  const handleEliminarUsuario = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsuarios(usuarios.filter(u => u.id !== id));
    }
  };

  const handleGuardarUsuario = () => {
    if (editando) {
      // Editar usuario existente
      setUsuarios(usuarios.map(u => 
        u.id === editando.id ? { ...u, ...formData } : u
      ));
    } else {
      // Agregar nuevo usuario
      const nuevoUsuario = {
        id: usuarios.length + 1,
        ...formData,
        activo: true
      };
      setUsuarios([...usuarios, nuevoUsuario]);
    }
    setShowModal(false);
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="admin-usuarios-container">
        <div className="content-area">
          <div className="usuarios-section">
            <div className="section-header">
              <h2 className="section-title">Usuarios del Sistema</h2>
              <button className="agregar-btn" onClick={handleAgregarUsuario}>
                + Agregar Usuario
              </button>
            </div>
            
            <div className="usuarios-table-container">
              <table className="usuarios-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Información</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>{usuario.id}</td>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.email}</td>
                      <td>
                          <span className={`rol-badge ${usuario.rol}`}>
                          {usuario.rol === 'admin' && (<><CrownIcon style={{marginRight:6}}/>Administrador</>)}
                          {usuario.rol === 'jefe' && (<><GraduateIcon style={{marginRight:6}}/>Jefe de Carrera</>)}
                          {usuario.rol === 'servicios' && (<><ClipboardIcon style={{marginRight:6}}/>Servicios Escolares</>)}
                        </span>
                      </td>
                      <td>
                        {usuario.rol === 'jefe' && `Carrera: ${usuario.carrera}`}
                        {usuario.rol === 'servicios' && `Área: ${usuario.area}`}
                        {usuario.rol === 'admin' && 'Administrador del sistema'}
                      </td>
                      <td>
                        <span className={`estado-badge ${usuario.activo ? 'activo' : 'inactivo'}`}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="acciones-buttons">
                          <button 
                            className="editar-btn"
                            onClick={() => handleEditarUsuario(usuario)}
                          >
                            <EditIcon style={{marginRight:8}}/>Editar
                          </button>
                          <button 
                            className="eliminar-btn"
                            onClick={() => handleEliminarUsuario(usuario.id)}
                          >
                            <TrashIcon style={{marginRight:8}}/>Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="stats-container">
              <div className="stat-card">
                <h3>Total Usuarios</h3>
                <p className="stat-number">{usuarios.length}</p>
              </div>
              <div className="stat-card">
                <h3>Jefes de Carrera</h3>
                <p className="stat-number">{usuarios.filter(u => u.rol === 'jefe').length}</p>
              </div>
              <div className="stat-card">
                <h3>Servicios Escolares</h3>
                <p className="stat-number">{usuarios.filter(u => u.rol === 'servicios').length}</p>
              </div>
              <div className="stat-card">
                <h3>Usuarios Activos</h3>
                <p className="stat-number">{usuarios.filter(u => u.activo).length}</p>
              </div>
            </div>
          </div>
        </div>

      {/* Modal para agregar/editar usuario */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
              {editando ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
            </h3>
            
            <div className="form-group">
              <label>Nombre completo *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej: Juan Pérez López"
              />
            </div>
            
            <div className="form-group">
              <label>Email institucional *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="ejemplo@unsis.edu.mx"
              />
            </div>
            
            <div className="form-group">
              <label>Rol *</label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({...formData, rol: e.target.value})}
              >
                <option value="jefe">Jefe de Carrera</option>
                <option value="servicios">Servicios Escolares</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            
            {formData.rol === 'jefe' && (
              <div className="form-group">
                <label>Carrera asignada *</label>
                <select
                  value={formData.carrera}
                  onChange={(e) => setFormData({...formData, carrera: e.target.value})}
                >
                  <option value="">Selecciona una carrera</option>
                  <option value="Sistemas">Ingeniería en Sistemas</option>
                  <option value="Administración">Administración</option>
                  <option value="Contabilidad">Contabilidad</option>
                  <option value="Informática">Informática</option>
                </select>
              </div>
            )}
            
            {formData.rol === 'servicios' && (
              <div className="form-group">
                <label>Área de servicios *</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  placeholder="Ej: Servicios Escolares"
                />
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="modal-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="modal-confirm"
                onClick={handleGuardarUsuario}
                disabled={!formData.nombre || !formData.email}
              >
                {editando ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default AdminUsuarios;